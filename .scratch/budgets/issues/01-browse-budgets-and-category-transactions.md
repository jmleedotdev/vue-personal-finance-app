# 01: Browse budgets and drill into category transactions

**What to build:** A responsive Budgets page reachable from app navigation and Overview, showing the chart, Spending Summary, Budget cards, and working category-filtered See All links. Establish shared reactive budget ownership and calculations first within this slice, keeping Overview's existing financial behavior intact. Follow the parent Budgets Page and Budget Management spec and project domain/design-system conventions.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

**Implementation:** complete; see [validation and review](../validation-01.md).

- [x] Budgets is reachable directly and from app navigation and Overview's See Details action. Active navigation follows the route, the main-content skip link works, and still-unimplemented destinations remain unavailable.
- [x] Overview and Budgets consume the same reactive budget ownership and spending derivation, initialized from copies of bundled demo budgets without mutating demo records. A fresh app instance starts from demo budgets; no persistence or backend is introduced.
- [x] Preserve budget identity and initial order in preparation for later editing. Cards, summary rows, and chart inputs follow that order.
- [x] August 2024 remains the reporting month regardless of today's date. Spent counts negative transactions in the exact category for the full month, excluding income, zero amounts, other categories, and other months. Accumulation is cent-safe and does not adopt the recurring-bill Reporting Date cutoff.
- [x] The supplied demo shows Entertainment $15.00 of $50.00, Bills $150.00 of $750.00, Dining Out $133.00 of $75.00, and Personal Care $40.00 of $100.00: $338.00 total Spent against $975.00 of limits. These values are calculated, not hardcoded.
- [x] Reuse the existing limit-proportional donut chart and category hover behavior. Leaving a segment restores combined totals; accessible chart text and category summaries expose the information without hover.
- [x] A budget-specific card receives its data and displays themed category, Maximum Spend, progress, Spent, Remaining, and Latest Spending, without owning storage or page-level orchestration. Card management actions arrive in later tickets; do not show inactive placeholders.
- [x] Overspending retains actual Spent, caps the bar at full, and floors Remaining at zero. Use Remaining consistently and two-decimal USD details, retaining whole-dollar chart-center formatting.
- [x] Latest Spending shows up to three newest outgoing category transactions across all months, sorted by UTC calendar date with supplied-order ties. Rows show payee, date, signed amount, and local avatars on desktop/tablet; hide avatars on mobile.
- [x] See All opens Transactions with only the exact category filter and existing default browsing behavior, including income and all months; do not carry search, sort, page, or introduce budget-period restrictions.
- [x] A Budget without outgoing history shows zero Spent, full Remaining, an empty progress bar, No spending yet, and a working See All link, including for incoming-only categories.
- [x] Controlled zero-budget data produces a neutral chart with $0 spent against $0 limit, a useful invitation to add, and coherent Overview zero totals without invalid chart segments. The actual Add action is delivered in ticket 02.
- [x] Desktop places summary beside cards; tablet places chart and summary side by side above cards; mobile stacks content. Follow the supplied designs while keeping financial data, ordering, labels, and formatting consistent.
- [x] Reuse shared controls where applicable, theme-backed utilities, and production-safe local assets. Check narrow/intermediate widths, long content, no horizontal overflow, and fixed bottom-navigation clearance.
- [x] Add rendered-app tests with the real router for navigation, independent financial expectations, reporting boundaries, overspending, preview ordering/truncation/emptiness, category drill-down, and zero budgets. Replace obsolete disabled-Budgets assertions without weakening other navigation or Transactions coverage.
- [x] Perform focused browser checks for chart hover, responsive geometry, local asset loading, and bottom-navigation clearance. Compare relevant private references without making them test dependencies or publishing private links/images. Run fast checks, type checking/build, lint, and relevant browser checks; report any blocked visual validation.

## Scope boundary

Add, edit, delete, the shared modal, and theme-select extensions belong to subsequent tickets. This slice must remain demoable and green without those controls.
