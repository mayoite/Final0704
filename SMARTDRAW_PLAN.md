# SmartDraw Planner - Core Architecture Playbook

## Executive Summary
The legacy multi-step configurator loop has been retired. The One&Only planner has shifted to an enterprise-grade, pure client 2D engine layered over `tldraw` to unlock deep interactivity, removing typical React-reconciliation DOM bottlenecks.

## Infrastructure Highlights

1. **Fluid Tldraw V2 Integration**
   - The entire canvas acts natively. No forced DOM-to-Canvas rerendering.
   - `persistenceKey="one-and-only-planner-v1"` powers automatic localStorage tracking. If the browser dies, the workspace recovers seamlessly.
   - Restored Native Context Menu: The canvas unlocks the entire CAD tool-belt via right-click (Arrange, Select, Send to Back).

2. **Real-time Database Connection**
   - Catalog relies entirely on the live Supabase CMS mapping instead of placeholders.
   - Automatically renders DB entries in the left sidebar `width: w-64 md:w-80 lg:w-96` container logic responsive scaling.

3. **Intelligent Spawning & Metamapping**
   - When dropped onto the canvas, bounding boxes inherently calculate mathematical scale extraction (fetching W/H from `product.specs.dimensions`).
   - The engine automatically resolves standard shapes to `image` geometry referencing the product's `flagship_image`.
   - Invisible `meta` tagging tracks category, dimension strings, and base retail values without blocking the visual layer.

4. **Items Selected Engine (BOQ)**
   - The right side panel constantly cross-checks bounding boxes tagged with `isPlannerItem`.
   - Aggregates the quantity arrays into real-time totals bridging directly into the core `quoteCart.ts` Zustand file when authorized by the user.
