# Planner → Quote Flow

## Goal
The user drafts environments within a 60fps unified 2D native CAD system (no wizards, no page turns). The user utilizes actual `flagship_image` objects directly bound to Supabase backend records in a "What You See Is What You Get" workspace. When finalized, the layout dynamically dumps mapped quantities seamlessly into the standard checkout system.

---

## User Journey

```
/planner
  ① Seamless Engineering Viewport
     User is presented with a fluid screen. Left drawer dynamically pulls Supabase `products`.
  ② Native Drop
     User clicks a catalog item. A mapped, scaled 2D representation automatically drops onto the viewport utilizing actual DB dimensions (h x w parsed from spec data).
  ③ Right Sidebar (`Items Selected`)
     Polling the `editor.store` metadata, unique product variants are displayed in the right sidebar natively showing totals, dimensions, and cumulative pricing.
  ④ The Bridge: "Generate Final Quote"
     When clicked, the current canvas entities loop through `quoteCart.addItem({...})` deduplicating sizes, tagging `source: "planner"`.
     → Auto-navigates to /quote-cart

/quote-cart (Existing Native Page)
  ⑤ Seamless Section Rendering
     Detects planner-origin objects via state tracking. Groups products visually for final Finish / Textile decisions. Requests Quote.
```

---

## Architecture Flow

### `SmartdrawPlanner.tsx` (Data Source)
Acts as the pure unopinionated engine. 
- Injects catalog metadata directly into `meta` prop of Tldraw instances (e.g., `meta: { isPlannerItem: true, text: "Academia", price: 25000, dimensions: "1200x600" }`).
- Groups identical items before cart push.

### `src/lib/store/quoteCart.ts` (State Manager)
- Retains `source?: "planner" | "catalog"` and `plannerFamily?: string` in state contract.

### `src/app/quote-cart/page.tsx` (Checkout UX)
- Visually sequesters `source === "planner"` items into a dedicated 'From your floor plan' group to prevent cart confusion and highlight actionability (Confirm Series & Finish).

---

## Data Contract Check (Execution Pipeline)
When sending items from the Unified System:

```ts
quoteCart.addItem({
  id: `planner-${g.name.replace(/\s+/g, '-')}`, // De-dupe Key
  name: g.name,
  qty: g.qty, // Aggregated by bounding shape instances
  source: "planner",
  plannerFamily: g.category // Allows seamless Quote Cart UX sorting
});
```
