"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  ExternalLink,
  LayoutGrid,
  Layers,
  Keyboard,
  Download,
  Bot,
  ShoppingCart,
  BarChart3,
  Map,
  Package,
  Settings,
  ChevronDown,
  ChevronRight,
  FileText,
  Cpu,
  Archive,
  Zap,
  PanelLeft,
  Eye,
  Lock,
  Globe,
  Wrench,
  Database,
  Sparkles,
  Link2,
} from "lucide-react";

// Types
type ItemStatus  = "done" | "in-progress" | "todo" | "blocked";
type RouteType   = "public" | "tool" | "auth" | "ops" | "archive" | "redirect" | "api";
type RouteStatus = "planned" | "progress" | "live" | "archive";
type TabId = "overview" | "checklist" | "routes" | "stack" | "links" | "plan";

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: { text: string; status: ItemStatus; note?: string }[];
}

interface SiteRoute {
  route: string;
  desc: string;
  type: RouteType;
  status?: RouteStatus;
  note?: string;
}

interface DepRow {
  name: string;
  version: string;
  purpose: string;
}

interface DepGroup {
  group: string;
  icon: React.ReactNode;
  rows: DepRow[];
}

const CHECKLIST: ChecklistSection[] = [
  {
    id: "canvas",
    title: "Canvas & Interaction",
    icon: React.createElement(Layers, { className: "h-4 w-4" }),
    items: [
      { text: "Pan (middle-click drag) + zoom (wheel)", status: "done" },
      { text: "Snap to 10 mm grid", status: "done" },
      { text: "Alignment guides on drag", status: "done" },
      { text: "Rubber-band multi-select (marquee)", status: "done" },
      { text: "Multi-item drag", status: "done" },
      { text: "Minimap overlay (toggle)", status: "done" },
      { text: "Collision detection highlight", status: "done" },
      { text: "Room dimension labels toggle", status: "done" },
      { text: "Measurement tool (click-to-measure span)", status: "done" },
      { text: "Background image overlay (floor plan import)", status: "done" },
      { text: "Topbar overlay pills (view mode, grid, active tool)", status: "done" },
      { text: "Bottombar overlay pills (room dims, item count)", status: "done" },
      { text: "Selection label pill (topbar right)", status: "done" },
      { text: "3D view toggle (Three.js)", status: "todo", note: "Port PlannerCanvas3D from BlueprintPlanner" },
      { text: "Ctrl+C / Ctrl+V copy-paste item", status: "todo", note: "Clipboard exists in PlannerCanvasEnhanced — wire to shortcuts" },
      { text: "Arrow key nudge (1 mm per press)", status: "todo" },
    ],
  },
  {
    id: "keyboard",
    title: "Keyboard Shortcuts",
    icon: React.createElement(Keyboard, { className: "h-4 w-4" }),
    items: [
      { text: "Delete / Backspace -> remove selected item", status: "done" },
      { text: "R -> rotate selected 90 deg", status: "done" },
      { text: "Ctrl+Z -> undo", status: "done" },
      { text: "Ctrl+Y / Ctrl+Shift+Z -> redo", status: "done" },
      { text: "Escape -> deselect + revert to move tool", status: "done" },
      { text: "Ctrl+C / Ctrl+V -> copy / paste", status: "todo" },
      { text: "Arrow keys -> nudge selected 1 mm", status: "todo" },
    ],
  },
  {
    id: "catalog",
    title: "Product Catalog",
    icon: React.createElement(Package, { className: "h-4 w-4" }),
    items: [
      { text: "229 AFC India products from planner-catalog.v1.json", status: "done" },
      { text: "3-step flow: Category -> Family -> Size", status: "done" },
      { text: "Fuse.js fuzzy search across all items", status: "done" },
      { text: "Drag-to-canvas with correct mm dimensions (cm x 10)", status: "done" },
      { text: "Add button fallback (items without drag support)", status: "done" },
      { text: "Runtime items render on canvas (synthetic product/variant)", status: "done" },
      { text: "CATEGORY_META fallback for unknown categories", status: "done" },
      { text: "Item labels use _label from catalog", status: "done" },
      { text: "Product images in catalog panel", status: "todo", note: "Deferred by design — renderings shown on /quote-cart, not planner" },
    ],
  },
  {
    id: "quote",
    title: "Quote Flow",
    icon: React.createElement(ShoppingCart, { className: "h-4 w-4" }),
    items: [
      { text: "PlannerQuoteBar appears when 1+ item placed", status: "done" },
      { text: "Family chips aggregate duplicates", status: "done" },
      { text: "Get Quote navigates to /quote-cart", status: "done" },
      { text: "QuoteCartItem extended with source + plannerFamily", status: "done" },
      { text: "quote-cart page shows From your floor plan section", status: "done" },
      { text: "Series & finish picker on quote-cart page", status: "in-progress" },
      { text: "Product renderings on quote-cart", status: "in-progress" },
    ],
  },
  {
    id: "boq-pdf",
    title: "BOQ & PDF Export",
    icon: React.createElement(Download, { className: "h-4 w-4" }),
    items: [
      { text: "buildPlannerBoq() exists in lib/planner/boq.ts", status: "done" },
      { text: "Wire BOQ to planner2 items via plannerStore", status: "todo", note: "Old planner uses PlannerDocument; new store needs boq adapter" },
      { text: "BOQ display panel in planner2 sidebar", status: "todo" },
      { text: "jsPDF A4 customer proposal (port from BlueprintPlanner)", status: "todo", note: "jsPDF 4 + html2canvas both installed" },
      { text: "Canvas screenshot capture ref (workspaceCaptureRef)", status: "todo" },
      { text: "Client metadata fields (name, project, preparedBy)", status: "todo", note: "Port PlannerClientBar.tsx from legacy planner" },
      { text: "AFC India letterhead + branding in PDF", status: "todo" },
    ],
  },
  {
    id: "ai",
    title: "AI Features",
    icon: React.createElement(Bot, { className: "h-4 w-4" }),
    items: [
      { text: "AIQueryPanel wired into planner2 sidebar", status: "done" },
      { text: "GPT-4o natural language queries", status: "done" },
      { text: "AI auto-layout suggestions (auto-place items)", status: "todo" },
      { text: "Smart substitution (swap product for matching spec)", status: "todo", note: "lib/planner/engine/substitution.ts already exists" },
    ],
  },
  {
    id: "ux",
    title: "UX & Polish",
    icon: React.createElement(Zap, { className: "h-4 w-4" }),
    items: [
      { text: "Collapsible sidebar rail (48px collapsed, hover-to-peek)", status: "done" },
      { text: "Undo/redo history depth (50 steps)", status: "done" },
      { text: "framer-motion entrance animations on planner2", status: "todo", note: "Old planner has full motion — planner2 header is static" },
      { text: "Onboarding overlay (first-run)", status: "todo", note: "PlannerOnboarding.tsx exists in old planner — port" },
      { text: "Status bar with live tool hints", status: "todo", note: "PlannerStatusBar.tsx exists in old planner — port" },
      { text: "Planner2 header cleanup (remove dev labels)", status: "todo" },
      { text: "Session analytics tracking", status: "todo", note: "lib/analytics/plannerEvents.ts has all events defined" },
    ],
  },
  {
    id: "infra",
    title: "Infrastructure",
    icon: React.createElement(Cpu, { className: "h-4 w-4" }),
    items: [
      { text: "plannerStore.ts (Zustand v5) - items, room, tools, history", status: "done" },
      { text: "lib/planner/engine/ - snap, geometry, metrics, history, compliance, viewport", status: "done" },
      { text: "Runtime catalog JSON at /public/planner-app/data/planner-catalog.v1.json", status: "done" },
      { text: "PlannerItem types extended: _widthMm, _label, _category", status: "done" },
      { text: "60+ unit tests for canvas engine", status: "done" },
      { text: "Build passing (Exit Code 0)", status: "in-progress", note: "Supabase SSG timeouts are noise - actual compile is clean" },
    ],
  },
];

const SITE_ROUTES: SiteRoute[] = [
  { route: "/",                          desc: "Homepage - hero, stats, products overview",                   type: "public" },
  { route: "/about",                     desc: "Company profile",                                              type: "public" },
  { route: "/career",                    desc: "Job listings",                                                 type: "public" },
  { route: "/contact",                   desc: "Contact form (supports ?intent=quote)",                        type: "public" },
  { route: "/faq",                       desc: "Frequently asked questions",                                   type: "public" },
  { route: "/gallery",                   desc: "Project photo gallery",                                        type: "public" },
  { route: "/imprint",                   desc: "Legal imprint",                                                type: "public" },
  { route: "/news",                      desc: "Latest news",                                                  type: "public" },
  { route: "/privacy",                   desc: "Privacy policy",                                               type: "public" },
  { route: "/terms",                     desc: "Terms & conditions",                                           type: "public" },
  { route: "/sustainability",            desc: "Sustainability story",                                         type: "public" },
  { route: "/products",                  desc: "Full product catalogue listing",                               type: "public" },
  { route: "/products/[slug]",           desc: "Product detail page",                                         type: "public" },
  { route: "/catalog",                   desc: "Catalogue browser",                                           type: "public" },
  { route: "/compare",                   desc: "Product comparison tool",                                      type: "tool" },
  { route: "/portfolio",                 desc: "Portfolio of installs",                                        type: "public" },
  { route: "/projects",                  desc: "Projects listing",                                             type: "public" },
  { route: "/planner",                   desc: "Canonical planner route",                                      type: "public" },
  { route: "/showrooms",                 desc: "Showroom locations",                                           type: "public" },
  { route: "/solutions",                 desc: "Solutions hub",                                                type: "public" },
  { route: "/solutions/[category]",      desc: "Solution category detail",                                     type: "public" },
  { route: "/service",                   desc: "Service & maintenance",                                        type: "public" },
  { route: "/support-ivr",               desc: "IVR / support routing page",                                   type: "public" },
  { route: "/downloads",                 desc: "Downloadable resources",                                       type: "public" },
  { route: "/download-brochure",         desc: "Brochure request form",                                        type: "public" },
  { route: "/brochure",                  desc: "Brochure direct page",                                         type: "public" },
  { route: "/tracking",                  desc: "Order tracking tool",                                          type: "tool" },
  { route: "/quote-cart",                desc: "Quote cart - floor plan items to quote request",               type: "tool" },
  { route: "/smartdraw",                 desc: "SmartDraw integration page",                                   type: "tool" },
  { route: "/workstations",              desc: "Workstations category landing",                                 type: "public" },
  { route: "/planner2",                  desc: "Planner v2 - Active dev, our build target",                    type: "tool",   note: "Active dev" },
  { route: "/planner",                   desc: "BlueprintPlanner.tsx - 1120 lines - legacy feature-rich",      type: "archive", note: "Legacy" },
  { route: "/configurator",             desc: "Office Planning Studio - separate Konva codebase",              type: "tool" },
  { route: "/workstations/configurator", desc: "Redirect to /configurator?type=workstations",                 type: "redirect" },
  { route: "/planner1",                  desc: "Archive reference lab - mj-react-planner links, noindex",      type: "archive" },
  { route: "/planner-lab",               desc: "Archive reference lab - same as /planner1, noindex",           type: "archive" },
  { route: "/ops/planner-lab",           desc: "Re-exports /planner-lab, noindex",                             type: "archive" },
  { route: "/login",                     desc: "Partner Portal - Supabase auth (email + password)",            type: "auth" },
  { route: "/auth/callback",             desc: "OAuth / magic-link callback",                                  type: "auth" },
  { route: "/ops/planner-overhaul",      desc: "This page - Master control center for the overhaul project",   type: "ops",    note: "This page" },
  { route: "/ops/planner-lab/flowchart", desc: "System flowchart - Discover/Plan/Quote/Deliver swimlanes",     type: "ops" },
  { route: "/ops/customer-queries",      desc: "Customer queries ops dashboard",                               type: "ops" },
  { route: "/lab",                       desc: "Internal lab / experiments",                                   type: "ops" },
  { route: "/social",                    desc: "Social media links hub",                                        type: "public" },
  { route: "/trusted-by",               desc: "Clients & trust signals",                                       type: "public" },
  { route: "/sitemap.xml",               desc: "XML sitemap (auto-generated)",                                  type: "public" },
  { route: "/robots.txt",               desc: "Robots directive",                                               type: "public" },
];

const STACK: DepGroup[] = [
  {
    group: "Core Framework",
    icon: React.createElement(Globe, { className: "h-4 w-4" }),
    rows: [
      { name: "next",          version: "^16.2.1", purpose: "App Router, RSC, SSG, API routes" },
      { name: "react",         version: "^19.2.4", purpose: "React 19 - server components, concurrent features" },
      { name: "react-dom",     version: "^19.2.4", purpose: "React DOM renderer" },
      { name: "typescript",    version: "devDep",  purpose: "Strict-ish TypeScript across the project" },
      { name: "tailwindcss",   version: "v4",      purpose: "CSS utility framework - @import tailwindcss syntax" },
      { name: "tailwind-merge",version: "^3.5.0",  purpose: "Safe class merging (cn() util)" },
    ],
  },
  {
    group: "Canvas & 3D",
    icon: React.createElement(Layers, { className: "h-4 w-4" }),
    rows: [
      { name: "konva",               version: "^10.2.3",  purpose: "2D canvas engine - stage, layers, shapes" },
      { name: "react-konva",         version: "^19.2.3",  purpose: "React bindings for Konva" },
      { name: "three",               version: "^0.182.0", purpose: "3D WebGL renderer (3D view toggle)" },
      { name: "@react-three/fiber",  version: "^9.5.0",   purpose: "React reconciler for Three.js" },
      { name: "@react-three/drei",   version: "^10.7.7",  purpose: "Three.js helpers, controls, loaders" },
      { name: "bezier-js",           version: "^6.1.4",   purpose: "Bezier curves for wall drawing" },
      { name: "@thi.ng/geom-hull",   version: "^2.1.209", purpose: "Convex hull for room outlines" },
    ],
  },
  {
    group: "UI & Animation",
    icon: React.createElement(Sparkles, { className: "h-4 w-4" }),
    rows: [
      { name: "framer-motion",               version: "^12.38.0", purpose: "Animations, page transitions, AnimatePresence" },
      { name: "gsap",                        version: "^3.14.2",  purpose: "Advanced animations (timeline, ScrollTrigger)" },
      { name: "lucide-react",                version: "^1.7.0",   purpose: "Icon library" },
      { name: "@radix-ui/react-accordion",   version: "latest",   purpose: "Headless accordion primitive" },
      { name: "@radix-ui/react-dialog",      version: "latest",   purpose: "Headless dialog / modal" },
      { name: "@radix-ui/react-dropdown-menu",version:"latest",   purpose: "Headless dropdown primitive" },
      { name: "@radix-ui/react-tabs",        version: "latest",   purpose: "Headless tabs primitive" },
      { name: "@radix-ui/react-slot",        version: "latest",   purpose: "Slot / asChild composition" },
      { name: "embla-carousel-react",        version: "^8.6.0",   purpose: "Lightweight carousel component" },
      { name: "swiper",                      version: "^12.1.3",  purpose: "Feature-rich swiper" },
      { name: "react-hotkeys-hook",          version: "^5.2.4",   purpose: "Declarative keyboard shortcut hooks" },
    ],
  },
  {
    group: "Data & State",
    icon: React.createElement(Database, { className: "h-4 w-4" }),
    rows: [
      { name: "zustand",                 version: "^5.0.12",  purpose: "Client state - plannerStore, quoteCart, UI slices" },
      { name: "immer",                   version: "^11.1.4",  purpose: "Immutable state updates in Zustand slices" },
      { name: "@supabase/supabase-js",   version: "^2.100.1", purpose: "Database client, auth, realtime" },
      { name: "@supabase/ssr",           version: "^0.9.0",   purpose: "Supabase auth helpers for Next.js App Router" },
      { name: "@tanstack/react-query",   version: "^5.95.2",  purpose: "Server state, caching, background refetch" },
      { name: "fuse.js",                 version: "^7.1.0",   purpose: "Fuzzy search in product catalog" },
      { name: "sharp",                   version: "^0.34.5",  purpose: "Server-side image optimisation" },
      { name: "jszip",                   version: "^3.10.1",  purpose: "ZIP file creation (export bundles)" },
    ],
  },
  {
    group: "AI & APIs",
    icon: React.createElement(Bot, { className: "h-4 w-4" }),
    rows: [
      { name: "openai", version: "^6.33.0", purpose: "GPT-4o - AI layout queries in AIQueryPanel" },
    ],
  },
  {
    group: "Utilities & Export",
    icon: React.createElement(Wrench, { className: "h-4 w-4" }),
    rows: [
      { name: "jspdf",       version: "^4.2.1", purpose: "Client-side A4 PDF generation for proposals" },
      { name: "html2canvas", version: "^1.4.1", purpose: "Canvas screenshot for PDF embed" },
    ],
  },
];

function statusIcon(s: ItemStatus) {
  if (s === "done")        return React.createElement(CheckCircle2, { className: "h-4 w-4 flex-shrink-0 text-emerald-500" });
  if (s === "in-progress") return React.createElement(Clock,        { className: "h-4 w-4 flex-shrink-0 animate-pulse text-warning" });
  if (s === "blocked")     return React.createElement(AlertCircle,  { className: "h-4 w-4 flex-shrink-0 text-danger" });
  return React.createElement(Circle, { className: "h-4 w-4 flex-shrink-0 text-strong" });
}

function routeTypeBadge(t: RouteType) {
  const map: Record<RouteType, { label: string; cls: string }> = {
    public:   { label: "public",   cls: "bg-slate-800 text-inverse-muted ring-slate-700" },
    tool:     { label: "tool",     cls: "bg-blue-900/60 text-brand ring-blue-700/60" },
    auth:     { label: "auth",     cls: "bg-violet-900/60 text-violet-300 ring-violet-700/60" },
    ops:      { label: "ops",      cls: "bg-amber-900/50 text-warning ring-amber-700/50" },
    archive:  { label: "archive",  cls: "bg-slate-900 text-muted ring-slate-700" },
    redirect: { label: "redirect", cls: "bg-teal-900/50 text-teal-300 ring-teal-700/50" },
    api:      { label: "api",      cls: "bg-rose-900/50 text-rose-300 ring-rose-700/50" },
  };
  const m = map[t];
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 typ-caption font-semibold ring-1 ${m.cls}`}>
      {m.label}
    </span>
  );
}

function LinkCard({
  label,
  href,
  icon,
  color,
  desc,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      className="group flex flex-col gap-2.5 rounded-xl border border-white/10 bg-slate-900/60 p-4 transition-all hover:border-white/20 hover:bg-slate-800/60"
    >
      <div className={`w-fit rounded-lg bg-gradient-to-br p-2 ${color}`}>
        <span className="text-white">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors leading-tight">{label}</p>
        <p className="mt-0.5 typ-caption-lg text-muted leading-snug">{desc}</p>
        <code className="mt-1 block font-mono typ-caption text-strong">{href}</code>
      </div>
    </Link>
  );
}

export default function PlannerOverhaulPage() {
  const [activeTab, setActiveTab]       = useState<TabId>("overview");
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(CHECKLIST.map((s) => s.id)));

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allItems  = CHECKLIST.flatMap((s) => s.items);
  const doneCount = allItems.filter((i) => i.status === "done").length;
  const wipCount  = allItems.filter((i) => i.status === "in-progress").length;
  const todoCount = allItems.filter((i) => i.status === "todo").length;
  const total     = allItems.length;
  const pct       = Math.round((doneCount / total) * 100);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "overview",  label: "Overview",    icon: <Eye          className="h-3.5 w-3.5" /> },
    { id: "checklist", label: "Checklist",   icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    { id: "routes",    label: "All Routes",  icon: <Globe        className="h-3.5 w-3.5" /> },
    { id: "stack",     label: "Tech Stack",  icon: <Cpu          className="h-3.5 w-3.5" /> },
    { id: "links",     label: "Quick Links", icon: <Link2        className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6">

          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 p-2.5">
                <LayoutGrid className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="typ-caption font-semibold uppercase tracking-widest text-muted">AFC India — Internal</p>
                <h1 className="text-lg font-bold leading-tight text-white">Planner Overhaul Hub</h1>
                <p className="typ-caption-lg text-muted">Master control center · /ops/planner-overhaul</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3">
              <div>
                <p className="text-2xl font-bold leading-none text-success">{pct}%</p>
                <p className="typ-caption text-muted">complete</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="grid grid-cols-3 gap-3 text-center typ-caption-lg">
                <div><p className="font-bold text-success">{doneCount}</p><p className="text-muted">done</p></div>
                <div><p className="font-bold text-warning">{wipCount}</p><p className="text-muted">wip</p></div>
                <div><p className="font-bold text-subtle">{todoCount}</p><p className="text-muted">todo</p></div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
            />
          </div>

          {/* Tab bar */}
          <div className="flex items-center justify-between gap-2 py-2">
            <div className="flex gap-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    activeTab === t.id
                      ? "bg-blue-600 text-white"
                      : "text-subtle hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link href="/ops/planner-lab/flowchart" className="flex items-center gap-1 typ-caption-lg text-brand hover:text-violet-300">
                <Map className="h-3 w-3" /> Flowchart
              </Link>
              <Link href="/planner2" target="_blank" className="flex items-center gap-1 typ-caption-lg text-brand hover:text-blue-300">
                <ExternalLink className="h-3 w-3" /> Planner v2
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <AnimatePresence mode="wait">

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/60 to-slate-900 p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">Why are we doing this?</p>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Unify the fragmented planning tools into one world-class experience.
                </h2>
                <p className="text-sm leading-relaxed text-inverse-muted">
                  AFC India has two separate planning tools —{" "}
                  <code className="font-mono text-xs bg-white/10 px-1 py-0.5 rounded">/planner</code> and{" "}
                  <code className="font-mono text-xs bg-white/10 px-1 py-0.5 rounded">/configurator</code> — with duplicated
                  logic, no shared state, and no path to an integrated quote flow. The overhaul replaces both with{" "}
                  <code className="font-mono text-xs bg-white/10 px-1 py-0.5 rounded">/planner2</code>: a single SmartDraw-style
                  tool that takes a customer from blank canvas to quote submission in one session.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-danger-soft bg-red-950/20 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-danger" />
                    <h3 className="font-semibold text-red-300">The Problem</h3>
                  </div>
                  <ul className="space-y-2 typ-body-sm text-inverse-muted">
                    <li>•{" "}<code className="font-mono text-xs bg-white/10 px-1 rounded">/planner</code>{" "}(BlueprintPlanner.tsx, 1120 lines) is a standalone codebase — no connection to plannerStore, quote-cart, or engine modules.</li>
                    <li>•{" "}<code className="font-mono text-xs bg-white/10 px-1 rounded">/configurator</code>{" "}is a second separate codebase — own context, own canvas, own panels.</li>
                    <li>• Every feature built twice. Quote flow impossible without major surgery.</li>
                    <li>• No path from floor plan to /quote-cart without a full rewrite.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-success" />
                    <h3 className="font-semibold text-success">The Vision</h3>
                  </div>
                  <ul className="space-y-2 typ-body-sm text-inverse-muted">
                    <li>•{" "}<code className="font-mono text-xs bg-white/10 px-1 rounded">/planner2</code>{" "}— single, unified planning tool for all AFC product lines.</li>
                    <li>• SmartDraw-style catalog → place furniture on canvas → Get Quote →{" "}<code className="font-mono text-xs bg-white/10 px-1 rounded">/quote-cart</code>{" "}→ submit to sales.</li>
                    <li>• Customer journey: browse → plan → quote-cart → contact(intent=quote).</li>
                    <li>• Full customer accounts planned but not yet built (Partner Portal exists at /login).</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Archive className="h-4 w-4 text-warning" />
                    <h3 className="font-semibold text-warning">Why not reuse the old planner?</h3>
                  </div>
                  <ul className="space-y-2 typ-body-sm text-inverse-muted">
                    <li>• Too tightly coupled to its own{" "}<code className="font-mono text-xs bg-white/10 px-1 rounded">PlannerDocument</code>{" "}state — not Zustand.</li>
                    <li>• Uses old React patterns (class-style ref forwarding, manual re-renders).</li>
                    <li>• No quote cart integration — items live in a local ref array, not a store.</li>
                    <li>• Would cost more to retrofit than to build correctly in planner2.</li>
                    <li>• Kept as reference for features to port: 3D view, BOQ, PDF, OnBoarding, StatusBar.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-brand">Why /configurator canvas?</h3>
                  </div>
                  <ul className="space-y-2 typ-body-sm text-inverse-muted">
                    <li>• The configurator canvas (Konva-based{" "}<code className="font-mono text-xs bg-white/10 px-1 rounded">PlannerCanvas.tsx</code>) is cleaner and componentized.</li>
                    <li>• Better snap & alignment guide logic already implemented.</li>
                    <li>• Panels slot in via context, not prop drilling.</li>
                    <li>• Reused in planner2 as{" "}<code className="font-mono text-xs bg-white/10 px-1 rounded">PlannerCanvasEnhanced.tsx</code>{" "}with plannerStore wired in.</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 surface-overlay-95 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="h-4 w-4 text-subtle" />
                  <h3 className="font-semibold text-white">Stack Rationale</h3>
                  <span className="ml-auto typ-caption-lg text-strong">All packages are latest stable as of early 2026. No upgrades needed.</span>
                </div>
                <div className="grid grid-cols-1 gap-2 typ-body-sm sm:grid-cols-2">
                  {[
                    ["Next.js 16 + React 19", "App Router, RSC, SSG — production-ready"],
                    ["Zustand 5", "Minimal, fast client state. plannerStore holds all canvas state with immer slices"],
                    ["Konva / react-konva", "Best 2D canvas lib for React — Stage/Layer/Shape with full event model"],
                    ["framer-motion 12", "Production animation library — AnimatePresence, layout animations, spring physics"],
                    ["jsPDF 4", "Client-side A4 PDF — proposal generation without a server render step"],
                    ["GPT-4o (openai 6)", "AI layout suggestions and natural language room queries via AIQueryPanel"],
                    ["Supabase 2", "Auth (Partner Portal /login) + DB. Customer accounts planned for future phase"],
                    ["Fuse.js 7", "Fuzzy search across 229 catalog items — no server round-trip needed"],
                  ].map(([title, body]) => (
                    <div key={title} className="rounded-lg bg-white/5 p-3">
                      <p className="font-semibold text-inverse">{title}</p>
                      <p className="mt-0.5 text-xs text-muted">{body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-brand" />
                  <h3 className="font-semibold text-violet-300">Customer Login Status</h3>
                </div>
                <p className="typ-body-sm text-inverse-muted leading-relaxed">
                  <code className="font-mono text-xs bg-white/10 px-1 rounded">/login</code>{" "}exists as a &ldquo;Partner Portal&rdquo; powered by Supabase auth (email + password).
                  The customer-facing journey is: <strong>browse</strong> → <strong>plan</strong> → <strong>quote-cart</strong> →{" "}
                  <code className="font-mono text-xs bg-white/10 px-1 rounded">contact?intent=quote</code>.
                  Full customer accounts (saved floor plans, order history) are in scope for a future phase but are not yet built.
                  The auth infrastructure (Supabase SSR helpers, session management) is already in place.
                </p>
              </div>
            </motion.div>
          )}

          {/* TAB 2: CHECKLIST */}
          {activeTab === "checklist" && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="mb-4 flex flex-wrap gap-4 typ-caption-lg">
                <span className="flex items-center gap-1.5 text-success"><CheckCircle2 className="h-3 w-3" /> Done</span>
                <span className="flex items-center gap-1.5 text-warning"><Clock className="h-3 w-3" /> In Progress</span>
                <span className="flex items-center gap-1.5 text-muted"><Circle className="h-3 w-3" /> Todo</span>
                <span className="flex items-center gap-1.5 text-danger"><AlertCircle className="h-3 w-3" /> Blocked</span>
              </div>

              {CHECKLIST.map((section) => {
                const secDone  = section.items.filter((i) => i.status === "done").length;
                const secTotal = section.items.length;
                const isOpen   = openSections.has(section.id);
                return (
                  <div key={section.id} className="overflow-hidden rounded-xl border border-white/10 surface-overlay-95">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-subtle">{section.icon}</span>
                        <span className="font-semibold text-white">{section.title}</span>
                        <span className="text-xs text-muted">{secDone}/{secTotal}</span>
                        <div className="hidden w-20 sm:block">
                          <div className="h-1 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-success-soft transition-all"
                              style={{ width: `${(secDone / secTotal) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      {isOpen
                        ? <ChevronDown  className="h-4 w-4 flex-shrink-0 text-muted" />
                        : <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted" />}
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="divide-y divide-white/5 border-t border-white/10 overflow-hidden"
                        >
                          {section.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 px-5 py-3">
                              {statusIcon(item.status)}
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm ${
                                  item.status === "done"        ? "text-inverse-muted" :
                                  item.status === "in-progress" ? "text-amber-200" :
                                  item.status === "blocked"     ? "text-red-300"   : "text-subtle"
                                }`}>
                                  {item.text}
                                </span>
                                {item.note && (
                                  <p className="mt-0.5 typ-caption-lg italic text-strong">{item.note}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* TAB 3: ALL ROUTES */}
          {activeTab === "routes" && (
            <motion.div
              key="routes"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4 flex flex-wrap gap-3 typ-caption-lg">
                {(["public","tool","auth","ops","archive","redirect"] as RouteType[]).map((t) => (
                  <span key={t}>{routeTypeBadge(t)}</span>
                ))}
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 typ-caption-lg uppercase tracking-wider text-muted">
                      <th className="px-4 py-3 text-left font-semibold">Route</th>
                      <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">Type</th>
                      <th className="px-4 py-3 text-left font-semibold">Description</th>
                      <th className="px-2 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {SITE_ROUTES.map((r) => (
                      <tr key={r.route} className="hover:bg-white/5 transition-colors group">
                        <td className="px-4 py-2.5">
                          <code className="font-mono text-xs text-inverse-muted">{r.route}</code>
                          {r.note && (
                            <span className="ml-2 typ-caption text-brand font-medium">{r.note}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 hidden sm:table-cell">
                          {routeTypeBadge(r.type)}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted leading-snug">{r.desc}</td>
                        <td className="px-2 py-2.5">
                          <Link
                            href={r.route.replace(/\[.*?\]/g, "1")}
                            target="_blank"
                            className="text-strong opacity-0 group-hover:opacity-100 hover:text-blue-400 transition-all"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-right typ-caption-lg text-strong">{SITE_ROUTES.length} routes total</p>
            </motion.div>
          )}

          {/* TAB 4: TECH STACK */}
          {activeTab === "stack" && (
            <motion.div
              key="stack"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <p className="text-sm text-muted">
                All dependencies are the latest stable releases as of early 2026.
                framer-motion 12, React 19, Next.js 16, jsPDF 4, Zustand 5 —{" "}
                <strong className="text-inverse-muted">no upgrades needed.</strong>
              </p>

              {STACK.map((group) => (
                <div key={group.group} className="overflow-hidden rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-5 py-3">
                    <span className="text-subtle">{group.icon}</span>
                    <span className="font-semibold text-white">{group.group}</span>
                  </div>
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-white/5">
                      {group.rows.map((row) => (
                        <tr key={row.name} className="hover:bg-white/5 transition-colors">
                          <td className="w-56 px-5 py-2.5">
                            <code className="font-mono text-xs text-inverse">{row.name}</code>
                          </td>
                          <td className="w-32 px-3 py-2.5">
                            <code className="font-mono typ-caption-lg text-muted">{row.version}</code>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-subtle">{row.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </motion.div>
          )}

          {/* TAB 5: QUICK LINKS */}
          {activeTab === "links" && (
            <motion.div
              key="links"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-brand" />
                  <h3 className="font-semibold text-brand">Active Tools</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <LinkCard label="Planner v2"     href="/planner2"     icon={<LayoutGrid   className="h-5 w-5" />} color="from-blue-600 to-blue-700"       desc="Active dev — our build target" />
                  <LinkCard label="Configurator"   href="/configurator" icon={<Settings     className="h-5 w-5" />} color="from-slate-600 to-slate-700"     desc="Office Planning Studio" />
                  <LinkCard label="Quote Cart"     href="/quote-cart"   icon={<ShoppingCart className="h-5 w-5" />} color="from-emerald-600 to-emerald-700" desc="Floor plan to quote request" />
                  <LinkCard label="Partner Login"  href="/login"        icon={<Lock         className="h-5 w-5" />} color="from-violet-600 to-violet-700"   desc="Supabase auth portal" />
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-warning" />
                  <h3 className="font-semibold text-warning">Ops & Internal</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <LinkCard label="Overhaul Hub"   href="/ops/planner-overhaul"      icon={<LayoutGrid className="h-5 w-5" />} color="from-amber-700 to-amber-800"    desc="This page" />
                  <LinkCard label="Flowchart"      href="/ops/planner-lab/flowchart" icon={<Map        className="h-5 w-5" />} color="from-violet-600 to-violet-700"  desc="System swimlanes" />
                  <LinkCard label="Planner Lab"    href="/ops/planner-lab"           icon={<Eye        className="h-5 w-5" />} color="from-slate-600 to-slate-700"    desc="Ops lab mirror" />
                  <LinkCard label="Cust. Queries"  href="/ops/customer-queries"      icon={<Bot        className="h-5 w-5" />} color="from-teal-700 to-teal-800"      desc="Customer queries ops" />
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Archive className="h-4 w-4 text-subtle" />
                  <h3 className="font-semibold text-subtle">Legacy / Archive</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <LinkCard label="Old Planner"   href="/planner"     icon={<Archive className="h-5 w-5" />} color="from-amber-800 to-amber-900" desc="BlueprintPlanner.tsx — 1120 lines" />
                  <LinkCard label="Planner Lab 1" href="/planner1"    icon={<Archive className="h-5 w-5" />} color="from-slate-700 to-slate-800" desc="Reference lab — noindex" />
                  <LinkCard label="Planner Lab 2" href="/planner-lab" icon={<Archive className="h-5 w-5" />} color="from-slate-700 to-slate-800" desc="Reference lab — noindex" />
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-success" />
                  <h3 className="font-semibold text-success">Customer Journeys</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <LinkCard label="Homepage"       href="/"                    icon={<Globe        className="h-5 w-5" />} color="from-slate-600 to-slate-700"    desc="Entry" />
                  <LinkCard label="Products"       href="/products"            icon={<Package      className="h-5 w-5" />} color="from-teal-700 to-teal-800"      desc="229 items" />
                  <LinkCard label="Planner"        href="/planner"             icon={<PanelLeft    className="h-5 w-5" />} color="from-indigo-700 to-indigo-800"   desc="Canonical planner route" />
                  <LinkCard label="Catalog"        href="/catalog"             icon={<FileText     className="h-5 w-5" />} color="from-slate-600 to-slate-700"    desc="Catalogue" />
                  <LinkCard label="Contact (Quote)"href="/contact?intent=quote"icon={<ShoppingCart className="h-5 w-5" />} color="from-rose-700 to-rose-800"      desc="Submit quote" />
                  <LinkCard label="Showrooms"      href="/showrooms"           icon={<Map          className="h-5 w-5" />} color="from-slate-600 to-slate-700"    desc="Locations" />
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-subtle" />
                  <h3 className="font-semibold text-subtle">Site Pages</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["/about","/career","/faq","/gallery","/news","/sustainability","/portfolio","/projects","/solutions","/service","/tracking"].map((href) => (
                    <Link
                      key={href}
                      href={href}
                      target="_blank"
                      className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 typ-caption-lg font-mono text-subtle hover:border-white/20 hover:text-white transition-all"
                    >
                      {href}
                      <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                    </Link>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-6 py-4 text-center typ-caption-lg text-strong">
        AFC India — Planner Overhaul Hub · Internal ops page · noindex · /ops/planner-overhaul
      </div>
    </div>
  );
}
