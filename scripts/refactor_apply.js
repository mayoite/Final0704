import fs from 'fs/promises';
import path from 'path';

const REPLACEMENTS = {
  // Arbitrary Typography
  'text-\\[10px\\]': 'typ-caption',
  'text-\\[11px\\]': 'typ-caption-lg',
  'text-\\[12px\\]': 'text-xs',
  'text-\\[13px\\]': 'typ-body-sm',
  'text-\\[0\\.8rem\\]': 'text-xs',
  'text-\\[var\\(--type-body-size\\)\\]': 'typ-body-sm',
  'tracking-\\[0\\.08em\\]': 'tracking-wide',
  'tracking-\\[0\\.12em\\]': 'tracking-wider',
  'tracking-\\[0\\.14em\\]': 'tracking-widest',
  'tracking-\\[0\\.18em\\]': 'tracking-ultra',
  'tracking-\\[0\\.2em\\]': 'tracking-max',

  // Arbitrary Radii
  'rounded-\\[1\\.25rem\\]': 'rounded-lg',
  'rounded-\\[1\\.5rem\\]': 'rounded-xl',
  'rounded-\\[1\\.6rem\\]': 'rounded-giant',
  'rounded-\\[1\\.75rem\\]': 'rounded-huge',
  'rounded-\\[2rem\\]': 'rounded-blob',

  // Surfaces & Layout
  'bg-\\[var\\(--surface-canvas-soft\\)\\]': 'surface-canvas-soft',
  'bg-\\[var\\(--overlay-panel-08\\)\\]': 'surface-overlay-08',
  'bg-\\[color:var\\(--overlay-panel-12\\)\\]': 'surface-overlay-12',
  'bg-\\[color:var\\(--overlay-panel-92\\)\\]': 'surface-overlay-92',
  'bg-\\[color:var\\(--overlay-panel-95\\)\\]': 'surface-overlay-95',
  'bg-\\[color:var\\(--overlay-inverse-24\\)\\]': 'surface-overlay-24',
  'bg-\\[color:var\\(--overlay-inverse-12\\)\\]': 'surface-overlay-inverse-12',
  'hover:bg-\\[var\\(--overlay-panel-08\\)\\]': 'hover-surface-08',
  'lg:grid-cols-\\[1\\.1fr_auto\\]': 'grid-cols-1_1-auto',
  'lg:grid-cols-\\[1\\.05fr_0\\.95fr\\]': 'grid-cols-1_05-0_95',
  'border-\\[var\\(--border-inverse\\)\\]': 'border-theme-inverse',
  'border-\\[var\\(--border-soft\\)\\]': 'border-theme-soft',
  'duration-\\[var\\(--motion-fast\\)\\]': 'duration-fast',

  // Raw Colors Mapping
  'text-slate-700': 'text-strong',
  'text-slate-600': 'text-strong',
  'text-slate-500': 'text-muted',
  'text-slate-400': 'text-subtle',
  'text-slate-300': 'text-inverse-muted',
  'text-slate-200': 'text-inverse',
  'text-blue-400': 'text-brand',
  'text-blue-300': 'text-brand',
  'text-violet-400': 'text-brand',
  'text-emerald-400': 'text-success',
  'text-emerald-300': 'text-success',
  'text-amber-400': 'text-warning',
  'text-amber-300': 'text-warning',
  'text-red-500': 'text-danger',
  'text-red-400': 'text-danger',

  // Background Colors
  'bg-slate-200': 'scheme-section-muted',
  'bg-slate-100': 'scheme-section-soft',
  'bg-slate-50': 'scheme-section-soft',
  'bg-slate-900/50': 'surface-overlay-95',
  'bg-emerald-500': 'bg-success-soft',
  'bg-red-500/10': 'bg-danger-soft',

  // Border Colors
  'border-slate-300': 'border-muted',
  'border-slate-200': 'border-theme-soft',
  'border-slate-100': 'border-theme-soft',
  'border-red-500/20': 'border-danger-soft',
  'hover:border-blue-400': 'hover-border-primary',
  'hover:border-slate-400': 'hover-border-subtle',
  'hover:text-slate-500': 'hover-text-muted',
};

async function walk(dir, fileList = []) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const stat = await fs.stat(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        fileList = await walk(path.join(dir, file), fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

async function run() {
  const files = await walk('./src');
  let changedFiles = 0;

  for (const file of files) {
    let content = await fs.readFile(file, 'utf8');
    let hasChanges = false;

    for (const [pattern, replacement] of Object.entries(REPLACEMENTS)) {
      const regex = new RegExp(`(?<=\\s|["'\`|{])(${pattern})(?=\\s|["'\`|}])`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, replacement);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await fs.writeFile(file, content, 'utf8');
      changedFiles++;
    }
  }
  console.log(`Updated ${changedFiles} files with valid semantic replacements.`);
}

run().catch(console.error);
