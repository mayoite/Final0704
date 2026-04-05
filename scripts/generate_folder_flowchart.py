from __future__ import annotations

import html
import json
import os
import subprocess
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path.cwd()
OUTPUT_PATH = REPO_ROOT / "docs" / "folder-flowchart.html"

TOP_LEVEL_USE = {
    ".agent": "Local agent state and tooling artifacts.",
    ".claude": "Local Claude/Codex assistant state.",
    ".git": "Git metadata, refs, and repository history.",
    ".next": "Next.js build output and runtime cache.",
    ".swc": "SWC transpiler cache files.",
    ".vercel": "Vercel project linkage and local deployment metadata.",
    ".vscode": "VS Code workspace settings and tasks.",
    "app": "Application routes, layouts, and pages (Next.js App Router).",
    "components": "Reusable UI components.",
    "data": "Project data files and seeded content.",
    "docs": "Project documentation and operational notes.",
    "hooks": "Custom React hooks.",
    "lib": "Shared libraries, helpers, and services.",
    "node_modules": "Installed npm dependencies (third-party code).",
    "public": "Static assets served directly by the web app.",
    "react-planner": "Planner module and related integration files.",
    "supabase": "Supabase configuration, SQL, and local stack files.",
    "tests": "Automated test suites and fixtures.",
    "tmp": "Temporary/generated working files.",
    "zip_backup": "Local backup archives and snapshots.",
    "__mocks__": "Testing mocks and stubs.",
}


@dataclass
class Node:
    name: str
    path: str
    ignored: bool
    use: str
    direct_files: int = 0
    direct_size: int = 0
    children: dict[str, "Node"] = field(default_factory=dict)
    stats_total: int = 1
    stats_ignored: int = 0
    stats_tracked: int = 1


def normalize_rel(path: str) -> str:
    return path.replace("\\", "/").lstrip("./").rstrip("/")


def scan_directories_and_file_counts() -> tuple[list[str], dict[str, int], dict[str, int]]:
    out: list[str] = []
    file_counts: dict[str, int] = {".": 0}
    file_sizes: dict[str, int] = {".": 0}
    for root, dirs, files in os.walk(REPO_ROOT, topdown=True, followlinks=False):
        root_path = Path(root)
        rel_root = normalize_rel(str(root_path.relative_to(REPO_ROOT)))
        rel_key = rel_root if rel_root else "."
        file_counts[rel_key] = len(files)
        size_sum = 0
        for file_name in files:
            fp = root_path / file_name
            try:
                if fp.is_file():
                    size_sum += fp.stat().st_size
            except OSError:
                continue
        file_sizes[rel_key] = size_sum
        for directory in dirs:
            abs_dir = root_path / directory
            rel = normalize_rel(str(abs_dir.relative_to(REPO_ROOT)))
            out.append(rel)
    out.sort()
    return out, file_counts, file_sizes


def git_ignored_base_set(paths: list[str]) -> set[str]:
    if not paths:
        return set()
    payload = ("\0".join(paths) + "\0").encode("utf-8")
    proc = subprocess.run(
        ["git", "check-ignore", "--stdin", "-z"],
        cwd=REPO_ROOT,
        input=payload,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if proc.returncode not in (0, 1):
        msg = proc.stderr.decode("utf-8", "replace") or proc.stdout.decode("utf-8", "replace")
        raise RuntimeError(f"git check-ignore failed: {msg}")
    raw = proc.stdout.decode("utf-8", "replace").split("\0")
    return {normalize_rel(x.strip()) for x in raw if x.strip()}


def is_ignored(rel: str, ignored_bases: set[str]) -> bool:
    probe = rel
    while probe:
        if probe in ignored_bases:
            return True
        idx = probe.rfind("/")
        if idx < 0:
            break
        probe = probe[:idx]
    return False


def infer_use(rel: str, ignored: bool) -> str:
    if not rel or rel == ".":
        return "Repository root."
    parts = rel.split("/")
    top = parts[0]
    name = parts[-1]
    depth = len(parts)

    if depth == 1 and top in TOP_LEVEL_USE:
        return TOP_LEVEL_USE[top]

    if top == "node_modules":
        return "Dependency package internals."
    if top == ".next":
        if "/cache" in rel:
            return "Cached Next.js build artifacts."
        if "/server" in rel:
            return "Server build output for Next.js."
        if "/static" in rel:
            return "Compiled static bundles."
        return "Generated Next.js build directory."
    if top == ".git":
        if "/objects" in rel:
            return "Git object storage."
        if "/refs" in rel:
            return "Git references for branches/tags."
        if "/hooks" in rel:
            return "Git hook scripts."
        return "Internal Git metadata."

    if top == "app":
        return "Route segment, layout, or feature-specific page module."
    if top == "components":
        return "Grouped UI components by feature/domain."
    if top == "docs":
        return "Documentation subsection or artifact folder."
    if top == "hooks":
        return "Domain-specific custom hook implementations."
    if top == "lib":
        return "Shared utility/service module grouping."
    if top == "public":
        return "Static asset subsection (images, icons, media, etc.)."
    if top == "tests":
        return "Test grouping by feature, type, or integration scope."
    if top == "supabase":
        return "Supabase environment, migration, or helper folder."
    if top == "react-planner":
        return "Planner-specific source or support folder."
    if top == "__mocks__":
        return "Mock data or test doubles for automated tests."

    if ignored:
        return "Ignored local/generated folder; not committed to git."
    if "backup" in name.lower():
        return "Backup/snapshot folder."
    if "cache" in name.lower():
        return "Cache folder for build/tooling performance."
    return "Project-specific folder (inspect contained files for exact role)."


def build_tree(paths: list[str], ignored_bases: set[str], file_counts: dict[str, int], file_sizes: dict[str, int]) -> Node:
    root = Node(
        name=".",
        path=".",
        ignored=False,
        use="Repository root.",
        direct_files=file_counts.get(".", 0),
        direct_size=file_sizes.get(".", 0),
        stats_ignored=0,
        stats_tracked=1,
    )

    def ensure_child(parent: Node, name: str, full_path: str, ignored_flag: bool) -> Node:
        if name not in parent.children:
            parent.children[name] = Node(
                name=name,
                path=full_path,
                ignored=ignored_flag,
                use=infer_use(full_path, ignored_flag),
                direct_files=file_counts.get(full_path, 0),
                direct_size=file_sizes.get(full_path, 0),
                stats_ignored=1 if ignored_flag else 0,
                stats_tracked=0 if ignored_flag else 1,
            )
        return parent.children[name]

    for rel in paths:
        parts = rel.split("/")
        current = root
        full = ""
        for part in parts:
            full = f"{full}/{part}" if full else part
            current = ensure_child(current, part, full, is_ignored(full, ignored_bases))

    def finalize(node: Node) -> dict:
        children = [finalize(v) for _k, v in sorted(node.children.items(), key=lambda item: item[0].lower())]
        total = 1
        ignored_count = 1 if node.ignored else 0
        tracked_count = 0 if node.ignored else 1
        files_total = node.direct_files
        size_total = node.direct_size
        for child in children:
            total += child["stats"]["total"]
            ignored_count += child["stats"]["ignored"]
            tracked_count += child["stats"]["tracked"]
            files_total += child["stats"]["files_total"]
            size_total += child["stats"]["size_total"]
        return {
            "name": node.name,
            "path": node.path,
            "ignored": node.ignored,
            "use": node.use,
            "direct_files": node.direct_files,
            "direct_size": node.direct_size,
            "children": children,
            "stats": {
                "total": total,
                "ignored": ignored_count,
                "tracked": tracked_count,
                "files_total": files_total,
                "size_total": size_total,
            },
        }

    return finalize(root)


def build_html(tree: dict) -> str:
    generated = datetime.now(timezone.utc).isoformat()
    data = json.dumps(tree, separators=(",", ":"))
    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"UTF-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
<title>Interactive Folder Flowchart</title>
<style>
:root {{
  --bg: #f4f7fb;
  --surface: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --line: #dbe5f1;
  --accent: #0b3b8c;
  --accent-soft: #e6eefb;
  --badge-ignored-bg: #fee2e2;
  --badge-ignored-text: #991b1b;
  --badge-tracked-bg: #dcfce7;
  --badge-tracked-text: #166534;
}}
* {{ box-sizing: border-box; }}
body {{ margin: 0; padding: 18px; background: linear-gradient(180deg, #edf3ff 0%, var(--bg) 42%, var(--bg) 100%); color: var(--text); font-family: "Segoe UI", "Aptos", "Trebuchet MS", sans-serif; }}
main {{ max-width: 1480px; margin: 0 auto; }}
.card {{ background: var(--surface); border: 1px solid #d7e0ed; border-radius: 16px; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.09); padding: 16px; }}
h1 {{ margin: 0; font-size: 1.35rem; }}
.meta {{ margin-top: 6px; color: var(--muted); font-size: 0.9rem; }}
.controls {{
  display: grid;
  grid-template-columns: minmax(260px, 1fr) repeat(5, auto);
  gap: 10px;
  margin-top: 14px;
  align-items: center;
}}
input, select, button {{
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #cad6e8;
  background: #fff;
  color: var(--text);
}}
input {{ width: 100%; }}
button {{
  cursor: pointer;
  background: linear-gradient(180deg, #ffffff 0%, #f2f6fd 100%);
}}
.stats-line {{
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #334155;
  font-size: 0.88rem;
}}
.index-wrap {{
  margin-top: 10px;
  padding: 10px;
  background: #f3f7ff;
  border: 1px solid #d7e3f5;
  border-radius: 10px;
}}
.index-tools {{
  display: grid;
  grid-template-columns: minmax(180px, 1fr) auto;
  gap: 8px;
  margin-bottom: 8px;
}}
.index-title {{
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #476186;
  font-weight: 700;
  margin-bottom: 6px;
}}
.index-grid {{
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 8px;
}}
.idx-btn {{
  width: 100%;
  text-align: left;
  border: 1px solid #c8d9f4;
  background: #ffffff;
  color: #11315f;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 0.85rem;
  cursor: pointer;
}}
.idx-btn:hover {{
  background: #e8f0ff;
}}
.idx-name {{
  display: block;
  font-weight: 700;
  color: #102d57;
}}
.idx-meta {{
  display: block;
  margin-top: 2px;
  color: #4b6283;
  font-size: 0.76rem;
}}
.index-empty {{
  color: #5b708f;
  font-size: 0.86rem;
  padding: 6px 4px;
}}
.layout {{
  margin-top: 14px;
  display: grid;
  grid-template-columns: minmax(540px, 2fr) minmax(300px, 1fr);
  gap: 14px;
}}
.tree-wrap {{
  background: #f7faff;
  border: 1px solid #dce6f3;
  border-radius: 12px;
  padding: 12px;
  height: 76vh;
  min-height: 520px;
  overflow: auto;
}}
.details-wrap {{
  background: #f9fbff;
  border: 1px solid #dce6f3;
  border-radius: 12px;
  padding: 12px;
  height: 76vh;
  min-height: 520px;
  overflow: auto;
}}
.tree-root, .tree-root ul {{ list-style: none; margin: 0; padding-left: 16px; }}
.tree-root {{ padding-left: 0; }}
.tree-row {{
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 8px;
  margin: 1px 0;
}}
.tree-row:hover {{ background: #ebf2ff; }}
.tree-row.selected {{ background: #dfeaff; outline: 1px solid #bad2ff; }}
.tree-row.context-only {{ opacity: 0.74; }}
.toggle {{
  width: 1.1rem;
  text-align: center;
  color: var(--accent);
  cursor: pointer;
  user-select: none;
  font-weight: 700;
}}
.toggle.spacer {{ visibility: hidden; cursor: default; }}
.folder-icon {{
  width: 0.85rem;
  height: 0.65rem;
  border: 1px solid #93a8c9;
  border-radius: 2px;
  background: linear-gradient(180deg, #fff 0%, #eaf1ff 100%);
}}
.folder {{ font-weight: 600; font-size: 0.92rem; }}
.badge {{ border-radius: 999px; padding: 1px 8px; font-size: 0.74rem; font-weight: 700; text-transform: uppercase; }}
.badge.ignored {{ background: var(--badge-ignored-bg); color: var(--badge-ignored-text); }}
.badge.tracked {{ background: var(--badge-tracked-bg); color: var(--badge-tracked-text); }}
.meta-mini {{ margin-left: auto; color: #52627a; font-size: 0.76rem; }}
.info-block {{ margin: 0 0 10px 0; }}
.k {{ color: #334155; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.03em; font-weight: 700; }}
.v {{ color: #0f172a; font-size: 0.93rem; margin-top: 2px; word-break: break-word; }}
.pill {{
  display: inline-block;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.74rem;
  font-weight: 700;
  margin-right: 6px;
}}
.pill.ignored {{ background: var(--badge-ignored-bg); color: var(--badge-ignored-text); }}
.pill.tracked {{ background: var(--badge-tracked-bg); color: var(--badge-tracked-text); }}
.hint {{ color: var(--muted); font-size: 0.86rem; }}
.action-row {{ margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; }}
.action-btn {{
  display: inline-block;
  border: 1px solid #bfd2ee;
  background: #ffffff;
  color: #12345f;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.82rem;
  cursor: pointer;
  text-decoration: none;
}}
.action-btn:hover {{ background: #ecf3ff; }}
.notes-area {{
  width: 100%;
  min-height: 110px;
  border: 1px solid #c8d8ef;
  border-radius: 8px;
  padding: 8px;
  font: inherit;
  color: #0f172a;
  background: #ffffff;
  resize: vertical;
}}
.notes-meta {{
  margin-top: 6px;
  color: #4d6282;
  font-size: 0.79rem;
}}
@media (max-width: 720px) {{
  body {{ padding: 10px; }}
  .controls {{ grid-template-columns: 1fr; }}
  .layout {{ grid-template-columns: 1fr; }}
  .tree-wrap, .details-wrap {{ height: auto; min-height: 380px; }}
}}
</style>
</head>
<body>
<main>
  <section class=\"card\">
    <h1>Interactive Folder Explorer</h1>
    <p class=\"meta\">Generated: {html.escape(generated)}</p>
    <div class=\"controls\">
      <input id=\"query\" type=\"search\" placeholder=\"Search path or use (e.g. supabase migration, cache, planner)\" />
      <select id=\"mode\">
        <option value=\"all\">All folders</option>
        <option value=\"tracked\" selected>Not ignored only</option>
        <option value=\"ignored\">Ignored only</option>
      </select>
      <select id=\"depth\">
        <option value=\"all\">All depths</option>
        <option value=\"2\">Depth 2</option>
        <option value=\"3\">Depth 3</option>
        <option value=\"4\" selected>Depth 4</option>
        <option value=\"6\">Depth 6</option>
      </select>
      <label><input id=\"hideNoisy\" type=\"checkbox\" checked /> Hide heavy generated roots</label>
      <button id=\"expandMatches\">Expand Matches</button>
      <button id=\"collapseAll\">Collapse All</button>
      <button id=\"exportNotes\">Export Notes File</button>
    </div>
    <div class=\"stats-line\">
      <span id=\"totals\"></span>
      <span id=\"shown\"></span>
      <span id=\"queryStat\"></span>
    </div>
    <div class=\"index-wrap\">
      <div class=\"index-title\">Index (Top-Level Folders)</div>
      <div class=\"index-tools\">
        <input id=\"indexQuery\" type=\"search\" placeholder=\"Filter index folders\" />
        <select id=\"indexSort\">
          <option value=\"alpha\" selected>Sort: A-Z</option>
          <option value=\"folders\">Sort: most folders</option>
          <option value=\"files\">Sort: most files</option>
        </select>
      </div>
      <div id=\"index\" class=\"index-grid\"></div>
    </div>
    <div class=\"layout\">
      <div class=\"tree-wrap\">
        <ul class=\"tree-root\" id=\"tree\"></ul>
      </div>
      <aside class=\"details-wrap\" id=\"details\"></aside>
    </div>
  </section>
</main>
<script>
const TREE = {data};
const REPO_ABS = {json.dumps(str(REPO_ROOT))};
const NOISY_TOP_LEVEL = new Set(['node_modules', '.git', '.next', '.swc', '.vercel']);
const pathIndex = new Map();
const NOTES_KEY = 'folder_explorer_notes_v1';

function indexTree(node) {{
  pathIndex.set(node.path, node);
  for (const child of node.children) indexTree(child);
}}
indexTree(TREE);

const treeEl = document.getElementById('tree');
const indexEl = document.getElementById('index');
const indexQueryEl = document.getElementById('indexQuery');
const indexSortEl = document.getElementById('indexSort');
const detailsEl = document.getElementById('details');
const queryEl = document.getElementById('query');
const modeEl = document.getElementById('mode');
const depthEl = document.getElementById('depth');
const hideNoisyEl = document.getElementById('hideNoisy');
const totalsEl = document.getElementById('totals');
const shownEl = document.getElementById('shown');
const queryStatEl = document.getElementById('queryStat');
const expandMatchesEl = document.getElementById('expandMatches');
const collapseAllEl = document.getElementById('collapseAll');
const exportNotesEl = document.getElementById('exportNotes');

function loadNotesStore() {{
  try {{
    const raw = localStorage.getItem(NOTES_KEY);
    const parsed = raw ? JSON.parse(raw) : {{}};
    return parsed && typeof parsed === 'object' ? parsed : {{}};
  }} catch (_err) {{
    return {{}};
  }}
}}

function saveNotesStore(store) {{
  try {{
    localStorage.setItem(NOTES_KEY, JSON.stringify(store));
  }} catch (_err) {{
    // Ignore quota/write issues for now.
  }}
}}

let notesStore = loadNotesStore();

function badge(node) {{
  return node.ignored
    ? '<span class="badge ignored">ignored</span>'
    : '<span class="badge tracked">not ignored</span>';
}}

function escapeHtml(value) {{
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}}

function formatBytes(bytes) {{
  const n = Number(bytes || 0);
  if (!Number.isFinite(n) || n <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let idx = 0;
  let value = n;
  while (value >= 1024 && idx < units.length - 1) {{
    value /= 1024;
    idx += 1;
  }}
  const fixed = value >= 100 ? 0 : (value >= 10 ? 1 : 2);
  return value.toFixed(fixed) + ' ' + units[idx];
}}

function setDetails(path) {{
  const node = pathIndex.get(path) || TREE;
  const absPath = node.path === '.' ? REPO_ABS : (REPO_ABS + '\\\\' + node.path.replaceAll('/', '\\\\'));
  const explorerHref = 'file:///' + absPath.replaceAll('\\\\', '/').split(' ').join('%20') + '/';
  const noteValue = notesStore[node.path] || '';
  detailsEl.innerHTML =
    '<div class="info-block"><div class="k">Folder</div><div class="v">' + escapeHtml(node.name) + '</div></div>' +
    '<div class="info-block"><div class="k">Path</div><div class="v"><code>' + escapeHtml(node.path) + '</code></div></div>' +
    '<div class="info-block"><div class="k">Absolute Path</div><div class="v"><code>' + escapeHtml(absPath) + '</code></div></div>' +
    '<div class="info-block"><div class="k">Status</div><div class="v">' +
      (node.ignored ? '<span class="pill ignored">ignored</span>' : '<span class="pill tracked">not ignored</span>') +
    '</div></div>' +
    '<div class="info-block"><div class="k">Use</div><div class="v">' + escapeHtml(node.use) + '</div></div>' +
    '<div class="info-block"><div class="k">Subfolders</div><div class="v">' + node.children.length.toLocaleString() + '</div></div>' +
    '<div class="info-block"><div class="k">Files (Direct)</div><div class="v">' + (node.direct_files || 0).toLocaleString() + '</div></div>' +
    '<div class="info-block"><div class="k">Files (Total In Subtree)</div><div class="v">' + (node.stats.files_total || 0).toLocaleString() + '</div></div>' +
    '<div class="info-block"><div class="k">Size (Direct)</div><div class="v">' + formatBytes(node.direct_size || 0) + '</div></div>' +
    '<div class="info-block"><div class="k">Size (Total In Subtree)</div><div class="v">' + formatBytes(node.stats.size_total || 0) + '</div></div>' +
    '<div class="info-block"><div class="k">Tree Stats</div><div class="v">Total: ' + node.stats.total.toLocaleString() +
    ' | Ignored: ' + node.stats.ignored.toLocaleString() + ' | Not ignored: ' + node.stats.tracked.toLocaleString() + '</div></div>' +
    '<div class="action-row">' +
      '<a class="action-btn" id="openExplorerBtn" href="' + explorerHref + '" target="_self" rel="noopener">Open In Windows Explorer</a>' +
      '<button class="action-btn" id="copyAbsBtn">Copy Absolute Path</button>' +
    '</div>' +
    '<div class="info-block" style="margin-top:12px;">' +
      '<div class="k">Action Notes</div>' +
      '<div class="v">Auto note key: <code>' + escapeHtml(node.path) + '</code></div>' +
      '<textarea id="folderNoteInput" class="notes-area" placeholder="What to do with this folder...">' + escapeHtml(noteValue) + '</textarea>' +
      '<div class="action-row">' +
        '<button class="action-btn" id="saveNoteBtn">Save Note</button>' +
        '<button class="action-btn" id="clearNoteBtn">Clear Note</button>' +
      '</div>' +
      '<div class="notes-meta" id="noteState">Saved locally in this browser. Use Export Notes File to download.</div>' +
    '</div>' +
    '<p class="hint">Tip: Use search plus depth filter to focus on one area without overwhelming output.</p>';

  const copyBtn = document.getElementById('copyAbsBtn');
  if (copyBtn) {{
    copyBtn.addEventListener('click', async () => {{
      try {{
        await navigator.clipboard.writeText(absPath);
        copyBtn.textContent = 'Copied';
        setTimeout(() => {{ copyBtn.textContent = 'Copy Absolute Path'; }}, 1000);
      }} catch (_err) {{
        copyBtn.textContent = 'Copy failed';
        setTimeout(() => {{ copyBtn.textContent = 'Copy Absolute Path'; }}, 1200);
      }}
    }});
  }}

  const noteInput = document.getElementById('folderNoteInput');
  const saveNoteBtn = document.getElementById('saveNoteBtn');
  const clearNoteBtn = document.getElementById('clearNoteBtn');
  const noteState = document.getElementById('noteState');

  function setState(msg) {{
    if (noteState) noteState.textContent = msg;
  }}

  if (saveNoteBtn && noteInput) {{
    saveNoteBtn.addEventListener('click', () => {{
      const value = noteInput.value.trim();
      if (value) {{
        notesStore[node.path] = value;
      }} else {{
        delete notesStore[node.path];
      }}
      saveNotesStore(notesStore);
      setState('Saved: ' + node.path);
      renderIndex();
    }});
  }}

  if (clearNoteBtn && noteInput) {{
    clearNoteBtn.addEventListener('click', () => {{
      noteInput.value = '';
      delete notesStore[node.path];
      saveNotesStore(notesStore);
      setState('Cleared: ' + node.path);
      renderIndex();
    }});
  }}
}}

function ensureAncestorsVisible(row) {{
  let li = row.closest('li');
  while (li) {{
    const parentUl = li.parentElement;
    if (parentUl && parentUl.tagName === 'UL') {{
      parentUl.style.display = 'block';
      const parentLi = parentUl.closest('li');
      if (parentLi) {{
        const parentToggle = parentLi.querySelector(':scope > .tree-row > .toggle');
        if (parentToggle && !parentToggle.classList.contains('spacer')) parentToggle.textContent = '▾';
      }}
      li = parentLi;
    }} else {{
      break;
    }}
  }}
}}

function selectRowByPath(path, openFolder = false) {{
  const current = treeEl.querySelector('.tree-row.selected');
  if (current) current.classList.remove('selected');
  const row = treeEl.querySelector('.tree-row[data-path=\"' + CSS.escape(path) + '\"]');
  if (!row) return false;
  ensureAncestorsVisible(row);
  if (openFolder) {{
    const li = row.closest('li');
    if (li) {{
      const childUl = li.querySelector(':scope > ul');
      const t = row.querySelector(':scope > .toggle');
      if (childUl) childUl.style.display = 'block';
      if (t && !t.classList.contains('spacer')) t.textContent = '▾';
    }}
  }}
  row.classList.add('selected');
  row.scrollIntoView({{ block: 'center', behavior: 'smooth' }});
  detailsEl.dataset.selectedPath = path;
  setDetails(path);
  return true;
}}

function renderIndex() {{
  indexEl.innerHTML = '';
  const q = (indexQueryEl.value || '').trim().toLowerCase();
  const sortBy = indexSortEl.value || 'alpha';
  let roots = [...TREE.children].filter((node) => !q || node.name.toLowerCase().includes(q) || node.path.toLowerCase().includes(q));
  if (sortBy === 'folders') {{
    roots.sort((a, b) => b.stats.total - a.stats.total || a.name.localeCompare(b.name));
  }} else if (sortBy === 'files') {{
    roots.sort((a, b) => (b.stats.files_total || 0) - (a.stats.files_total || 0) || a.name.localeCompare(b.name));
  }} else {{
    roots.sort((a, b) => a.name.localeCompare(b.name));
  }}

  if (roots.length === 0) {{
    const empty = document.createElement('div');
    empty.className = 'index-empty';
    empty.textContent = 'No folders match this index filter.';
    indexEl.appendChild(empty);
    return;
  }}

  for (const node of roots) {{
    const btn = document.createElement('button');
    btn.className = 'idx-btn';
    btn.innerHTML =
      '<span class=\"idx-name\">' + escapeHtml(node.name) + '</span>' +
      '<span class=\"idx-meta\">' + node.stats.total.toLocaleString() + ' folders · ' + (node.stats.files_total || 0).toLocaleString() + ' files · ' + formatBytes(node.stats.size_total || 0) + (notesStore[node.path] ? ' · note' : '') + '</span>';
    btn.title = node.path;
    btn.addEventListener('click', () => {{
      if (!selectRowByPath(node.path, true)) {{
        queryEl.value = node.name;
        render(true);
        selectRowByPath(node.path, true);
      }}
    }});
    indexEl.appendChild(btn);
  }}
}}

function evaluate(node, depth, state) {{
  const query = state.query;
  const mode = state.mode;
  const hideNoisy = state.hideNoisy;
  const maxDepth = state.maxDepth;

  if (hideNoisy && depth === 1 && NOISY_TOP_LEVEL.has(node.name)) {{
    return {{ show: false, modePass: false, queryMatch: false, selfVisible: false, children: [], node, depth }};
  }}
  if (maxDepth !== null && depth > maxDepth) {{
    return {{ show: false, modePass: false, queryMatch: false, selfVisible: false, children: [], node, depth }};
  }}

  const modePass = mode === 'all' ? true : (mode === 'ignored' ? node.ignored : !node.ignored);
  const q = query.trim().toLowerCase();
  const queryMatch = !q || node.name.toLowerCase().includes(q) || node.path.toLowerCase().includes(q) || node.use.toLowerCase().includes(q);
  const childEvals = node.children.map((c) => evaluate(c, depth + 1, state)).filter((x) => x.show);
  const selfVisible = modePass && queryMatch;
  const show = selfVisible || childEvals.length > 0;
  return {{ show, modePass, queryMatch, selfVisible, children: childEvals, node, depth }};
}}

function renderNode(evalNode, selectedPath, autoExpand) {{
  const li = document.createElement('li');
  const row = document.createElement('div');
  row.className = 'tree-row';
  if (!evalNode.selfVisible) row.classList.add('context-only');
  if (selectedPath === evalNode.node.path) row.classList.add('selected');
  row.dataset.path = evalNode.node.path;

  const hasChildren = evalNode.children.length > 0;
  const toggle = document.createElement('span');
  toggle.className = hasChildren ? 'toggle' : 'toggle spacer';
  toggle.textContent = hasChildren ? '▸' : '▸';
  row.appendChild(toggle);

  const icon = document.createElement('span');
  icon.className = 'folder-icon';
  row.appendChild(icon);

  const name = document.createElement('span');
  name.className = 'folder';
  name.textContent = evalNode.node.name;
  row.appendChild(name);

  const badgeWrap = document.createElement('span');
  badgeWrap.innerHTML = badge(evalNode.node);
  row.appendChild(badgeWrap.firstChild);

  const mini = document.createElement('span');
  mini.className = 'meta-mini';
  mini.textContent =
    evalNode.node.children.length.toLocaleString() + ' subfolders · ' +
    (evalNode.node.direct_files || 0).toLocaleString() + ' files · ' + formatBytes(evalNode.node.direct_size || 0);
  row.appendChild(mini);

  li.appendChild(row);

  let open = evalNode.depth <= 1 || autoExpand;
  const childList = document.createElement('ul');
  childList.style.display = open ? 'block' : 'none';
  for (const child of evalNode.children) {{
    childList.appendChild(renderNode(child, selectedPath, autoExpand));
  }}
  if (hasChildren) {{
    toggle.textContent = open ? '▾' : '▸';
    toggle.addEventListener('click', (e) => {{
      e.stopPropagation();
      open = !open;
      toggle.textContent = open ? '▾' : '▸';
      childList.style.display = open ? 'block' : 'none';
    }});
  }}

  row.addEventListener('click', () => {{
    const current = treeEl.querySelector('.tree-row.selected');
    if (current) current.classList.remove('selected');
    row.classList.add('selected');
    detailsEl.dataset.selectedPath = evalNode.node.path;
    setDetails(evalNode.node.path);
    if (hasChildren) {{
      open = !open;
      toggle.textContent = open ? '▾' : '▸';
      childList.style.display = open ? 'block' : 'none';
    }}
  }});

  li.appendChild(childList);
  return li;
}}

function collectShown(evalNode) {{
  let count = 0;
  let direct = 0;
  const stack = [evalNode];
  while (stack.length) {{
    const cur = stack.pop();
    count += 1;
    if (cur.selfVisible) direct += 1;
    for (const child of cur.children) stack.push(child);
  }}
  return {{ count: Math.max(0, count - 1), direct: Math.max(0, direct - 1) }};
}}

function render(autoExpand = false) {{
  const maxDepth = depthEl.value === 'all' ? null : Number(depthEl.value);
  const state = {{
    query: queryEl.value || '',
    mode: modeEl.value,
    hideNoisy: hideNoisyEl.checked,
    maxDepth,
  }};

  treeEl.innerHTML = '';
  const rootEval = evaluate(TREE, 0, state);
  const shownStats = collectShown(rootEval);
  for (const childEval of rootEval.children) {{
    treeEl.appendChild(renderNode(childEval, detailsEl.dataset.selectedPath || '', autoExpand));
  }}

  totalsEl.textContent = 'Repo total folders: ' + (TREE.stats.total - 1).toLocaleString() + ' | Ignored: ' + TREE.stats.ignored.toLocaleString() + ' | Not ignored: ' + (TREE.stats.tracked - 1).toLocaleString() + ' | Total files: ' + (TREE.stats.files_total || 0).toLocaleString() + ' | Total size: ' + formatBytes(TREE.stats.size_total || 0);
  shownEl.textContent = 'Visible now: ' + shownStats.count.toLocaleString() + ' | Direct filter matches: ' + shownStats.direct.toLocaleString();
  queryStatEl.textContent = state.query.trim() ? ('Search: \"' + state.query.trim() + '\"') : 'Search: none';

  const firstRow = treeEl.querySelector('.tree-row');
  if ((!detailsEl.dataset.selectedPath || !pathIndex.has(detailsEl.dataset.selectedPath)) && firstRow) {{
    const p = firstRow.dataset.path;
    detailsEl.dataset.selectedPath = p;
    firstRow.classList.add('selected');
    setDetails(p);
  }} else if (detailsEl.dataset.selectedPath && pathIndex.has(detailsEl.dataset.selectedPath)) {{
    setDetails(detailsEl.dataset.selectedPath);
    const selected = treeEl.querySelector('.tree-row[data-path=\"' + CSS.escape(detailsEl.dataset.selectedPath) + '\"]');
    if (selected) selected.classList.add('selected');
  }}
}}

function buildNotesMarkdown() {{
  const keys = Object.keys(notesStore).sort((a, b) => a.localeCompare(b));
  const lines = [];
  lines.push('# Folder Action Notes');
  lines.push('');
  lines.push('Generated: ' + new Date().toISOString());
  lines.push('Repository: ' + REPO_ABS);
  lines.push('');
  if (keys.length === 0) {{
    lines.push('_No notes yet._');
    return lines.join('\\n');
  }}
  for (const key of keys) {{
    const node = pathIndex.get(key);
    const title = node ? node.name : key.split('/').pop();
    lines.push('## ' + title);
    lines.push('');
    lines.push('- Path: `' + key + '`');
    lines.push('- Type: folder');
    lines.push('- Note:');
    const noteLines = String(notesStore[key] || '').split(/\\r?\\n/);
    for (const l of noteLines) {{
      lines.push('  ' + l);
    }}
    lines.push('');
  }}
  return lines.join('\\n');
}}

queryEl.addEventListener('input', () => render(false));
modeEl.addEventListener('change', () => render(false));
depthEl.addEventListener('change', () => render(false));
hideNoisyEl.addEventListener('change', () => render(false));
indexQueryEl.addEventListener('input', renderIndex);
indexSortEl.addEventListener('change', renderIndex);
expandMatchesEl.addEventListener('click', () => render(true));
collapseAllEl.addEventListener('click', () => {{
  treeEl.querySelectorAll('ul').forEach((ul) => {{
    if (ul !== treeEl) ul.style.display = 'none';
  }});
  treeEl.querySelectorAll('.toggle').forEach((t) => {{
    if (!t.classList.contains('spacer')) t.textContent = '▸';
  }});
}});
exportNotesEl.addEventListener('click', () => {{
  const content = buildNotesMarkdown();
  const blob = new Blob([content], {{ type: 'text/markdown;charset=utf-8' }});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'folder-action-notes.md';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}});

setDetails('.');
renderIndex();
render(false);
</script>
</body>
</html>
"""


def main() -> None:
    dirs, file_counts, file_sizes = scan_directories_and_file_counts()
    ignored_bases = git_ignored_base_set(dirs)
    tree = build_tree(dirs, ignored_bases, file_counts, file_sizes)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(build_html(tree), encoding="utf-8")

    print(json.dumps({
        "output": str(OUTPUT_PATH),
        "total_dirs": len(dirs),
        "total_files": tree["stats"]["files_total"],
        "total_size_bytes": tree["stats"]["size_total"],
        "ignored_dirs": tree["stats"]["ignored"],
        "tracked_dirs": tree["stats"]["tracked"] - 1,
    }, indent=2))


if __name__ == "__main__":
    main()
