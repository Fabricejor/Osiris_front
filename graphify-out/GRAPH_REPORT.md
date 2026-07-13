# Graph Report - .  (2026-07-13)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 296 nodes · 307 edges · 52 communities (14 shown, 38 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `61e7444a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- page.tsx
- devDependencies
- Sidebar.tsx
- components.json
- compilerOptions
- OperatorEfficiencyTable.tsx
- DetailsTable.tsx
- dependencies
- auth.service.tsx
- include
- OperatorActivityHeatmap.tsx
- ActivityHeatmap.tsx
- page.tsx
- page.tsx
- class-variance-authority
- @base-ui/react
- cmdk
- date-fns
- eslint.config.mjs
- framer-motion
- @hookform/resolvers
- lucide-react
- next
- next.config.ts
- next-themes
- @radix-ui/react-alert-dialog
- @radix-ui/react-avatar
- @radix-ui/react-checkbox
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-popover
- @radix-ui/react-scroll-area
- @radix-ui/react-select
- @radix-ui/react-slot
- @radix-ui/react-switch
- @radix-ui/react-tabs
- react-dom
- react-hook-form
- react-photo-view
- react-resizable-panels
- react-zoom-pan-pinch
- recharts
- shadcn
- sonner
- tailwind-merge
- @tanstack/react-query
- @tanstack/react-table
- tw-animate-css
- zustand
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `include` - 7 edges
3. `tailwind` - 6 edges
4. `aliases` - 6 edges
5. `cn()` - 6 edges
6. `scripts` - 5 edges
7. `react` - 5 edges
8. `DetailsTable()` - 4 edges
9. `FolderStatus` - 4 edges
10. `lib` - 4 edges

## Surprising Connections (you probably didn't know these)
- `BatchDetailsPage()` --references--> `react`  [EXTRACTED]
  src/app/dashboard/data-validation/[id]/page.tsx → package.json
- `OperatorEfficiencyTable()` --references--> `react`  [EXTRACTED]
  src/components/features/dashboard/OperatorEfficiencyTable.tsx → package.json
- `DetailsTable()` --references--> `react`  [EXTRACTED]
  src/components/features/data-validation/DetailsTable.tsx → package.json
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/utils.ts
- `NavLink()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/Sidebar.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (52 total, 38 thin omitted)

### Community 0 - "page.tsx"
Cohesion: 0.06
Nodes (16): FolderData, folders, STATUS_FILTERS, STATUS_TAG, BAR_COLORS, data, COLORS, data (+8 more)

### Community 1 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+17 more)

### Community 2 - "Sidebar.tsx"
Cohesion: 0.11
Nodes (16): geist, inter, metadata, playfair, RootLayout(), bottomNavItems, labelVariants, logoTextVariants (+8 more)

### Community 3 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 4 - "compilerOptions"
Cohesion: 0.10
Nodes (21): dom, dom.iterable, esnext, ./src/*, compilerOptions, allowJs, esModuleInterop, incremental (+13 more)

### Community 5 - "OperatorEfficiencyTable.tsx"
Cohesion: 0.11
Nodes (13): react, react, BatchDetailsPage(), scannedPages, timelineSteps, initialQueuePages, columnHelper, Operator (+5 more)

### Community 6 - "DetailsTable.tsx"
Cohesion: 0.21
Nodes (11): columnHelper, DetailsTable(), DetailsTableProps, IdCell(), PatientData, STATUS_TAG, StatusCell(), FolderStatus (+3 more)

### Community 7 - "dependencies"
Cohesion: 0.18
Nodes (11): axios, clsx, dependencies, axios, clsx, @radix-ui/react-tooltip, react-day-picker, zod (+3 more)

### Community 8 - "auth.service.tsx"
Cohesion: 0.27
Nodes (7): apiClient(), FetchOptions, AuthService, UsersService, ApiError, AuthResponse, User

### Community 9 - "include"
Cohesion: 0.20
Nodes (9): **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude (+1 more)

### Community 10 - "OperatorActivityHeatmap.tsx"
Cohesion: 0.20
Nodes (7): COLORS, columns, heatData, hours, HoverInfo, LEVEL_LABELS, rows

### Community 11 - "ActivityHeatmap.tsx"
Cohesion: 0.25
Nodes (7): ActivityHeatmap(), getIntensity(), heatmapData, HoverInfo, INTENSITY_COLORS, months, weeks

## Knowledge Gaps
- **158 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+153 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`, `OperatorEfficiencyTable.tsx`, `class-variance-authority`, `@base-ui/react`, `cmdk`, `date-fns`, `framer-motion`, `@hookform/resolvers`, `lucide-react`, `next`, `next-themes`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-popover`, `@radix-ui/react-scroll-area`, `@radix-ui/react-select`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `react-dom`, `react-hook-form`, `react-photo-view`, `react-resizable-panels`, `react-zoom-pan-pinch`, `recharts`, `shadcn`, `sonner`, `tailwind-merge`, `@tanstack/react-query`, `@tanstack/react-table`, `tw-animate-css`, `zustand`?**
  _High betweenness centrality (0.315) - this node is a cross-community bridge._
- **Why does `react` connect `OperatorEfficiencyTable.tsx` to `DetailsTable.tsx`, `dependencies`?**
  _High betweenness centrality (0.226) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _158 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05873015873015873 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `Sidebar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11067193675889328 - nodes in this community are weakly interconnected._
- **Should `components.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._