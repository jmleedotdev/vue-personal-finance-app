# TanStack Charts for the Overview budget donut

## Finding

TanStack Charts can render this donut in Vue, but is unlikely to simplify the overall implementation of ticket 05 compared with a small SVG. It removes angular allocation and arc geometry code, not the financial calculations, accessible text, custom legend, or responsive card layout. No dependency was installed and no application code was changed for this investigation.

## Verified capabilities

- The npm registry reports `@tanstack/charts` 1.5.0 as latest at investigation time. Its export map includes `/vue` and `/polar`; its Vue peer requirement is `>=3.5`, compatible with this app's declared Vue `^3.5.42`. [Registry](https://registry.npmjs.org/@tanstack/charts/latest)
- The published release's Vue adapter exports `Chart`, accepts a chart definition and an accessible label, starts with SVG, and integrates mount/update/unmount lifecycle handling. Reactive definitions can use Vue `computed`. [Versioned Vue adapter docs](https://github.com/TanStack/charts/blob/v1.5.0/docs/framework/vue/adapter.md)
- `pie(rows, { value: 'spent' })` can allocate category spending into angles; `polar` and `radialArc` render responsive donut geometry. Source order is the default, color domain/range can be explicit, and inner radius is configurable. The same primitives support center text and concentric rings. [Versioned polar examples](https://github.com/TanStack/charts/blob/v1.5.0/docs/examples/polar-and-radar.md)
- Installation docs explicitly warn that the live site follows unreleased main, so implementation should use matching release-source documentation. The package owns multiple D3 dependencies; the docs describe tree shaking and capability subpaths. Installed dependency size is not the shipped donut bundle size, which was not measured here. [Installation](https://tanstack.com/charts/latest/docs/installation), [registry](https://registry.npmjs.org/@tanstack/charts/latest)

## Proposed integration if selected

1. Install `@tanstack/charts`; import `Chart` from `@tanstack/charts/vue` and polar primitives from `@tanstack/charts/polar`.
2. Independently derive fixed August 2024 category spending and sum configured limits.
3. Use category spending for pie allocation and supplied category colors for the explicit color mapping.
4. Use concentric arc layers for the reference's lighter inner band, with ordinary HTML center text to reuse typography and currency formatting.
5. Keep the category legend in HTML, arranged beside the chart on desktop/tablet and in two columns below it on mobile. Provide accessible category spending/limit text.
6. Omit tooltips, selection, motion, and other unrequested interactions. Verify real-browser geometry and measure the incremental production bundle before accepting the dependency.

The exact layered appearance and bundle cost have not been prototyped or measured; these are documented capabilities and an integration proposal, not proof of visual parity.

## Recommendation and scope

For this one noninteractive, four-category donut, retain the small dependency-free SVG proposal: the library saves little geometry code while adding chart-definition and adapter configuration. Reconsider TanStack Charts if several richer chart types become approved requirements.

Ticket 05 and its parent spec explicitly say not to introduce a charting dependency solely for this graphic. Using TanStack Charts therefore needs an explicit scope change, not merely a choice of equivalent implementation detail. This investigation does not change that requirement.

## Implementation follow-up

The owner subsequently approved using TanStack Charts. Ticket 05 and the parent spec now record that exception. The implementation uses `@tanstack/charts@1.5.0`, two radial arc layers for the two-tone ring, and an HTML center and legend. A subsequent owner request enables segment hover to replace both center values with category spending and limit (e.g. `$15` above `of $50 limit` for Entertainment), restoring both overall values when no segment is hovered. The owner briefly requested percentage tooltips, then reverted them. Tooltip code, percentage calculations, and percentage-only assistive text have been removed; center-value hover remains. Other chart interactions remain disabled. Desktop/tablet/mobile Chromium screenshots confirm the visual treatment, with segment proportions now intentionally derived from configured budget limits (`maximum`), as subsequently confirmed by the owner. Center spending remains calculated independently. Seven-width geometry checks pass.

Measured whole-implementation production JavaScript delta: 125.22 kB / 47.07 kB gzip before, 239.38 kB / 86.78 kB gzip after extraction to `BudgetChart.vue` and the scrollable legend, including the decorative overlay and center-value hover without tooltips (approximately +114.16 kB raw / +39.71 kB gzip). This is a before/after application build comparison, not an isolated library-only benchmark. Tests and review results are recorded in the ticket. The owner reviewed the completed implementation and approved committing it.
