# Budgets Page and Budget Management

Status: ready-for-agent

## Problem Statement

Users can see a budget summary on Overview but cannot open a dedicated Budgets page, inspect the spending behind each category, or add, edit, and delete their budgets. Budgets navigation and Overview's budget See Details action are unavailable.

Users need a coherent view of monthly limits and actual spending, including overspending, with a straightforward way to manage those limits. The supplied desktop, tablet, and mobile designs differ in example records, totals, ordering, and some labels; users should see the same finances and terminology at every viewport rather than inconsistent screenshot examples.

## Solution

Build a responsive Budgets page with a limit-proportional donut chart, Spending Summary, and a card for each Budget. Each card shows Maximum Spend, Spent, Remaining, a progress bar, and Latest Spending with a category-filtered link to Transactions.

Support adding, editing, and deleting budgets through accessible dialogs. Share the dialog shell with future pot features without coupling those features to budget fields. Keep Budgets and Overview synchronized through shared reactive state during the running app session; reload restores the bundled demo budgets.

Retain August 2024 as the reporting month. Monthly Spent counts only outgoing category transactions, while Latest Spending shows the three newest outgoing category transactions across all months. See All opens Transactions filtered only by category, deliberately retaining its existing all-period, income-inclusive behavior.

## User Stories

1. As a user, I want to open Budgets from app navigation, so that I can inspect and manage my spending limits.
2. As a user, I want Overview's budget See Details link to open Budgets, so that I can move from a summary to supporting details.
3. As a user, I want the active navigation destination identified, so that I know which section I am viewing.
4. As a user, I want Budgets to use the same financial data as Overview, so that the pages agree.
5. As a user, I want the demo's reporting month to remain August 2024, so that historical finances do not change with today's date.
6. As a user, I want a Budget to apply to one transaction category, so that its purpose is clear.
7. As a user, I want at most one Budget per category, so that spending is not represented by duplicate limits.
8. As a user, I want a chart showing the relative sizes of my limits, so that I can understand my budget allocation.
9. As a user, I want the chart center to show total Spent against combined limits, so that I can assess the overall position.
10. As a pointer user, I want hovering a chart segment to show that category's Spent and limit, so that I can inspect its contribution.
11. As a user, I want leaving a chart segment to restore the combined totals, so that the overall context is easy to recover.
12. As a user who does not use chart hover, I want category amounts available in text, so that financial information is not pointer-dependent.
13. As a user, I want a Spending Summary listing each category's Spent and Maximum Spend, so that I can compare budgets directly.
14. As a user, I want cards and summary rows to retain a predictable order, so that managing a budget does not unexpectedly move it.
15. As a user, I want each card to identify its category and theme, so that I can recognize it quickly.
16. As a user, I want each card to show Maximum Spend, so that I know the monthly limit.
17. As a user, I want Spent to include only outgoing transactions in that category during the reporting month, so that the amount reflects monthly expenditure.
18. As a user, I want incoming transactions excluded from Spent, so that income is not mistaken for spending or used to offset it.
19. As a user, I want a progress bar showing spending against the limit, so that I can scan my position.
20. As a user, I want actual Spent retained when it exceeds the limit, so that overspending is not hidden.
21. As a user, I want overspent progress bars capped at full and Remaining floored at zero, so that the display stays understandable.
22. As a user, I want Remaining labeled consistently across screen sizes, so that responsive layouts do not change the meaning.
23. As a user, I want monetary details formatted consistently in USD with two decimal places, so that cents remain visible.
24. As a user, I want Latest Spending to show up to three recent outgoing category transactions, so that I can recognize recent activity.
25. As a user, I want Latest Spending ordered newest first across all months, so that recent history is available even outside the reporting month.
26. As a user, I want transaction names, dates, and signed amounts in previews, so that I can identify each payment.
27. As a user, I want See All to open Transactions filtered by the card's category, so that I can investigate the full category history.
28. As a user, I want that Transactions destination to include all periods and incoming transactions as usual, so that the link does not introduce hidden budget-specific constraints.
29. As a user, I want Add New Budget to open a form, so that I can create another category limit.
30. As a user, I want Add to offer existing unbudgeted transaction categories, so that I cannot create duplicate or unsupported categories.
31. As a user, I want Add to default to the first available category and theme with a blank Maximum Spend, so that valid choices are easy to discover without assuming an amount.
32. As a user, I want Maximum Spend to accept positive amounts with at most two decimal places, so that limits represent valid USD amounts.
33. As a user, I want invalid amounts explained beside the field without closing the form, so that I can correct them.
34. As a user, I want a fixed theme palette with color names and swatches, so that I can choose a recognizable budget color.
35. As a user, I want themes already used by other budgets visible but disabled and marked Already used, so that I understand why they cannot be selected.
36. As a user, I want pot themes not to reserve budget colors, so that those independent features do not restrict each other.
37. As a user, I want Add New Budget disabled when no category or no theme is available, so that I do not open a form that cannot succeed.
38. As a user, I want a successful addition to append the new Budget and update totals, so that its effect is immediately visible.
39. As a user, I want a card's kebab menu to offer Edit Budget and Delete Budget, so that management actions are easy to find.
40. As a user, I want Edit to preload the saved category, amount, and theme, so that I can make focused changes.
41. As a user, I want an edited Budget to retain its current category and theme or use available alternatives, so that uniqueness rules do not block unchanged values.
42. As a user, I want changing a Budget's category to recalculate spending without modifying transactions, so that budgeting does not rewrite history.
43. As a user, I want a saved edit to preserve the Budget's position, so that the page order remains predictable.
44. As a user, I want deletion to require explicit confirmation naming the Budget, so that accidental removal is less likely.
45. As a user, I want deletion copy to state that transactions are retained, so that I understand exactly what will be removed.
46. As a user, I want canceling deletion to leave the Budget unchanged, so that I can safely reconsider.
47. As a user, I want a deleted Budget's category and theme made available again, so that I can reuse them.
48. As a user, I want changes reflected immediately on Overview and Budgets, so that navigation does not reveal stale financial summaries.
49. As a user, I want changes retained while navigating within the app, so that leaving the page does not discard saved session changes.
50. As a user of this demo milestone, I want reload to restore the supplied budgets, so that its nonpersistent behavior is predictable.
51. As a user, I want close, Escape, and backdrop click to discard unsaved form changes, so that I can leave without modifying a Budget.
52. As a user, I want a reopened Add form to be fresh and a reopened Edit form to show saved values, so that canceled drafts do not leak into later work.
53. As a keyboard user, I want labeled dialogs, visible focus, contained dialog focus, and sensible focus restoration, so that I can manage budgets without a pointer.
54. As a keyboard user, I want usable kebab menus and category/theme dropdowns, so that all management choices are reachable.
55. As a user, I want a Budget without outgoing history to show zero Spent, full Remaining, and No spending yet, so that empty activity is not mistaken for missing data.
56. As a user, I want a useful empty page after deleting every Budget, so that I can understand the zero totals and add another Budget.
57. As a desktop user, I want the summary beside the budget-card column, so that I can scan overall and individual spending together.
58. As a tablet user, I want chart and summary side by side above the cards, so that the page fits the available width.
59. As a mobile user, I want stacked content and compact transaction previews, so that the page remains readable without horizontal scrolling.
60. As a user on a small or short viewport, I want dialogs and dropdowns to fit and scroll as necessary, so that every field and action remains reachable.
61. As a user, I want final content and focused controls clear of fixed navigation, so that the app shell never blocks my work.
62. As a developer, I want a reusable modal shell separate from budget fields, so that later pot dialogs can reuse accessibility and layout without a universal form framework.
63. As a developer, I want behavior protected primarily at the rendered-app boundary, so that component refactoring does not invalidate tests unnecessarily.

## Implementation Decisions

### Scope, ownership, and integration

- Keep the existing Vue, TypeScript, Router, Pinia, and Tailwind foundations. Add a dedicated Budgets destination at `/budgets` following existing route conventions.
- Enable the Budgets navigation destination and Overview's budget See Details link; derive active navigation from the route. Keep other unfinished destinations unavailable.
- Introduce one shared reactive source of truth for editable budgets, initialized from copies of bundled demo budgets. Both Overview and Budgets consume it and the same monthly spending derivation.
- Budget mutations survive route changes but not browser reload or a new app instance. Do not add local storage, session storage, an API, or a backend. Do not mutate the bundled demo dataset to represent user edits.
- Use the installed state-management foundation where appropriate; avoid separate page-owned budget copies and setup-time calculations that become stale after mutations.
- Preserve logical Budget identity through edits, including a category change, rather than treating an editable category as immutable identity. Internal identity representation is an implementation choice; no external identifier contract or persistent schema migration is required.
- A new Budget appends to the list. An edited Budget retains its position. Summary rows and chart inputs follow budget order; preserve the initial demo order rather than adopting inconsistent reference ordering.

### Components and shared controls

- Build a small `BaseModal` responsible for the overlay, responsive panel, heading/description association, close button, dismissal, background interaction isolation, focus containment, and focus restoration.
- Keep budget-specific fields, validation, and add/edit submission in a budget form shared by those two operations. Do not make the modal shell a configurable universal form framework.
- Reuse the same shell for delete confirmation. Future pot forms are an architectural reuse goal, not part of this delivery.
- Build a budget-specific `BudgetCard` that receives its budget, derived spending, and recent transactions. It owns card presentation and local kebab interaction and emits edit/delete requests. Page-level orchestration owns dialogs and invokes shared budget mutations; cards do not own storage or cross-page state.
- Reuse `BaseButton`, `BaseInput`, and `BaseSelect` where semantics fit. Extend the select narrowly for design-evidenced theme swatches, per-option disabled state, and Already used text while retaining existing select consumers' behavior.
- Reuse the existing `BudgetChart` and its charting dependency; do not add a second chart interpretation or library.

### Budget meaning and monetary calculations

- A Budget is a monthly spending limit for one existing transaction category. At most one Budget may use any category. Category creation and transaction reassignment are not supported.
- Derive available categories from existing transaction categories, in the same alphabetical order as Transactions. Add offers unused categories; Edit offers its current category and unused alternatives.
- August 2024 remains the fixed reporting month, independent of the current system date. Do not introduce a month selector or impose the recurring-bill Reporting Date cutoff on monthly budget spending.
- Spent is the positive magnitude of all negative transactions matching the exact category and reporting month. Exclude incoming and zero-amount transactions, other categories, and other months. Preserve cent-safe accumulation.
- The unmodified demo yields Entertainment $15.00 of $50.00, Bills $150.00 of $750.00, Dining Out $133.00 of $75.00, and Personal Care $40.00 of $100.00. Combined Spent is $338.00 against $975.00 of limits. These are derived expectations, not hardcoded financial values.
- Maximum Spend must be a finite positive USD amount representable safely in cents with at most two decimal places. Reject blank, zero, negative, nonnumeric, nonfinite, and excess-precision input rather than silently rounding an invalid form value.
- Remaining is Maximum Spend minus Spent, floored at zero. The progress bar represents Spent divided by Maximum Spend, capped at 100%; actual Spent and aggregate totals are not capped.
- Format card, summary, and form-result amounts as USD with two decimal places. Keep the existing chart center and its corresponding overall/category limit presentation in whole dollars. Preserve signed outgoing amounts in transaction previews.
- Change of category updates the budget's derived Spent and Latest Spending without moving, deleting, or modifying any transaction.

### Chart, summary, and cards

- Donut segments are proportional to Maximum Spend, not Spent. The default center shows total Spent against the sum of all budget limits.
- Preserve existing hover behavior: a category segment shows that category's Spent and limit; leaving the segment restores combined totals. Ensure edits and deletions cannot leave stale hovered-category information.
- Present all financial information through accessible chart text and textual category summaries, without requiring hover or reliance on color alone. Preserve the existing pointer-based chart contract; keyboard users obtain category information from text rather than a new chart interaction model.
- The page includes a Spending Summary showing each category, actual Spent, and Maximum Spend, and a card for each Budget.
- Cards show the themed category heading, kebab trigger, Maximum Spend, progress bar, Spent, Remaining, and Latest Spending. Use Remaining consistently, including where a mobile reference says Free.
- Latest Spending consists of up to three newest negative transactions in the exact category across all months. Sort newest first using the existing UTC calendar-date convention and supplied-order tie stability. Do not hardcode reference names or record order.
- Preview rows show payee name, formatted date, signed outgoing amount, and local avatars on desktop/tablet. Hide preview avatars on mobile as evidenced by the compact design.
- See All navigates to Transactions with only the category filter. Do not add a month, reporting period, outgoing-only restriction, or unrelated search/sort/page state. Transactions continues to show incoming records and all dates in that category according to its existing default browsing behavior.

### Add, edit, themes, and deletion

- Add New Budget opens a fresh Add New Budget form with Budget Category, Maximum Spend, Theme, and Add Budget action. Select the first available category alphabetically and the first unused theme in palette order; start Maximum Spend blank.
- Use a fixed, named, design-evidenced theme palette in design order. Reuse existing theme tokens, extending them only where the palette requires missing colors. Arbitrary custom colors are not supported.
- Each theme may be used by at most one Budget. Other budgets' themes remain visible but disabled and marked Already used; keyboard navigation and selection must respect disabled options. An edited Budget's own theme remains selectable.
- Budget and pot theme availability are independent. Existing pots do not reserve colors for budgets.
- Disable Add New Budget if either no unbudgeted categories or no unused themes remain. Supply an understandable explanation associated with the disabled state; do not open an impossible form.
- Edit Budget opens the same budget form with saved category, Maximum Spend, and theme. Present an Edit Budget heading and Save Changes action.
- Successful add/edit commits once, closes the dialog, and updates cards, chart, summary, and Overview. Validation failure retains the dialog and draft, shows accessible field errors, and does not alter saved data.
- The card kebab dropdown offers Edit Budget and Delete Budget, with destructive visual treatment for deletion. Provide accessible trigger names identifying the card and standard keyboard opening, action selection, Escape/outside dismissal, and focus behavior. Avoid retaining an open menu behind a modal.
- Delete Budget opens confirmation naming the category, with an explicit destructive confirmation and No, Go Back cancellation action.
- Confirmation copy must explicitly state that only the Budget is removed and transactions will not be deleted. Do not reproduce the reference's ambiguous claim that all data inside the Budget is removed forever.
- Confirmed deletion removes the Budget and its contribution to combined limits and budgeted-category spending summaries, frees its category/theme, and leaves all transactions untouched. Cancel, close, Escape, or backdrop click does not delete anything.

### Modal lifecycle and accessibility

- Close, Escape, or clicking the backdrop dismisses a dialog and discards unsaved changes without an additional confirmation. Clicking inside the panel does not dismiss it.
- Nothing modifies saved budget state before successful Add, Save Changes, or Confirm Deletion. A reopened Add is fresh; a reopened Edit reads saved data, not a discarded draft.
- Dialogs have accessible names and descriptions, an accessible close button, visible focus, intentional initial focus, contained keyboard focus, and an inert or equivalently noninteractive background. Prevent background scrolling while open and restore normal behavior on close.
- Restore focus to the opener when it still exists; after deleting its card, use a sensible surviving control such as Add New Budget. Avoid lost focus when menu items unmount or a trigger becomes disabled.
- Respect nested dropdown interactions: Escape should dismiss an open select/menu before dismissing its containing modal, preventing one keypress from accidentally discarding a form.
- Fit panels to narrow and short viewports, allow internal scrolling, and keep fields, dropdown options, close, and submission actions reachable. Maintain the supplied rounded panel and dimmed overlay treatment.

### Empty states and responsive design

- A Budget without outgoing history shows $0.00 Spent, its entire Maximum Spend as Remaining, an empty progress bar, and the exact Latest Spending message No spending yet. Keep its See All link available, including when its category contains incoming transactions only.
- If there are no budgets, show a neutral empty chart with $0 spent against $0 limit and an invitation to add a Budget. Do not render invalid zero-total segments or stale category details. Apply coherent zero-budget behavior to Overview as well.
- Desktop places the chart/summary panel beside the budget-card column. Tablet places that panel above the cards with chart and Spending Summary side by side. Mobile stacks chart, summary, and cards vertically.
- Use the same data, budget order, terminology, and money formatting at all widths. Supplied reference disagreements are visual sample differences, not alternative financial rules.
- Follow the existing responsive app shell, navigation transitions, main-content skip link, and safe-area-aware bottom clearance. Avoid horizontal overflow; keep final content and focused controls clear of fixed navigation.
- Reuse theme-backed colors, typography presets, shared controls, local fonts, icons, and avatars. Use utility-first markup; justify any named style class or component style block by concrete readability/manageability needs.
- Runtime assets must be bundled local assets, never temporary design export URLs or reference screenshots.

## Testing Decisions

### Primary seam and prior art

- Prefer one primary logical seam: the assembled rendered app with its real router, driven through visible content, accessible controls, and navigation. Use Vitest, Vue Test Utils, and Vue Router memory history, following the existing Overview and Transactions screen-level suites.
- Exercise budget management, Overview synchronization, category drill-down, and navigation through that boundary rather than separately testing private helpers, store internals, and each presentational component.
- Good tests describe external behavior: readable amounts and transaction identities, available/disabled choices, dialog state, submitted versus discarded changes, route outcomes, and focus. Avoid component-instance inspection, utility-class assertions, implementation snapshots, or deriving expected answers with production arithmetic.
- Initialize isolated app/store state for each test and restore controlled demo fixtures. Navigation within a test retains budget state; a fresh app instance starts from demo budgets. Do not introduce test-only production mutation APIs.
- Preserve existing shared-control coverage. Add focused public-contract coverage for reusable modal/select behavior only where it provides nonduplicative protection not adequately exercised through app journeys.
- Use focused Playwright/Chromium checks for browser-dependent behavior, following existing budget-chart hover, responsive Overview, Transactions controls, and recurring-bill browser tests.
- The rendered-app seam follows repository precedent and is proposed for owner confirmation at handoff. Spec publication is not authorization to implement or a claim that this seam has already been explicitly approved.

### Fast rendered-app coverage

- Assert initial demo budgets, original order, per-category monthly amounts, $338.00 Spent, and $975.00 combined limits. Preserve Overview's existing approved financial results.
- Use controlled transactions to cover month boundaries, different categories, incoming/zero records, cent accumulation, full August scope independent of today's date, exact limits, and overspending. Assert actual Spent is not capped, Remaining is never negative, and no recurring-bill cutoff is introduced.
- Cover Latest Spending across months, exclusion of incoming/zero transactions, newest-first order, stable equal-date ties, three-record truncation, fewer than three records, and no outgoing history.
- Follow See All into the real Transactions page and assert its category-only query, matching incoming/outgoing records across months, and unchanged default browsing behavior.
- Add a Budget through the visible form; assert initial choices, blank amount, unused categories, appended order, calculated spending, and synchronized Overview after navigation.
- Exercise invalid blank, zero, negative, nonnumeric, nonfinite, excess-precision, and unsafe monetary input without mutation or dialog dismissal. Exercise a valid cents amount and successful resubmission after correction.
- Verify used themes are visible, disabled, and identified as Already used; existing pot colors do not reserve them. Verify unavailable categories cannot produce duplicate budgets.
- Edit category, amount, and theme; verify prefilled saved values, ability to retain current category/theme, exclusion of other budgets' assignments, preserved position, recalculated spending/previews, and immediately updated totals on both pages.
- Cancel and reopen add/edit dialogs through close, Escape, and backdrop paths; verify no saved changes, fresh Add defaults, and saved Edit values. Clicking inside the panel does not dismiss it.
- Verify kebab actions open the intended Budget's dialog, distinguish destructive actions accessibly, and close the menu before dialog interaction.
- Verify delete confirmation names the Budget, explicitly retains transactions, and supports cancellation. Confirm deletion updates both pages and releases the category/theme without changing transaction history.
- Exhaust categories and themes independently using controlled initial data; assert Add is disabled in either case and reenabled when an appropriate deletion restores availability.
- Delete all budgets and verify neutral zero totals, no invalid chart state, useful invitation, and ability to add again. Also cover incoming-only category history with No spending yet and a working See All link.
- Verify the enabled navigation and Overview entry link, route-based active destination, and continued unavailability of still-unimplemented destinations. Replace obsolete tests that require Budgets to remain disabled, without weakening other navigation checks.
- Preserve Transactions search/category/sort/pagination behavior, Overview layout/summary behavior, and existing shared-control interactions after select extensions.

### Focused browser and visual validation

- Visually compare the rendered page to the cached native-resolution desktop, tablet, and mobile references, allowing only agreed data, ordering, terminology, consistent formatting, and clearer deletion-copy differences.
- Reference page dimensions are desktop 1440 × 2264, tablet 768 × 2706, and mobile 375 × 2811. Check representative short viewports, intermediate widths, and 320px width in addition to reference widths; full-frame height is not a required browser viewport height.
- Compare card/panel arrangements, chart geometry, spacing, typography, theme swatches, progress bars, preview avatar visibility, kebab dropdown, Add/Edit forms, expanded selectors, delete confirmation, and overlay treatment.
- Verify default, hover, selected/current, focus, disabled, and validation states as applicable. Verify theme-option keyboard navigation cannot select disabled colors and shared select changes do not regress Transactions or Recurring Bills.
- Verify actual dialog initial focus, Tab/Shift+Tab containment, background interaction isolation, scroll locking, Escape ordering for nested selectors, backdrop behavior, close/cancel restoration, and usable focus after card deletion. jsdom alone is not evidence for native modal behavior.
- Verify long dropdowns and short/mobile dialogs scroll without clipping actions or causing page overflow; check final content and focused controls against fixed bottom navigation and device safe areas.
- Retain chart-hover browser coverage and test updates/deletion while category details have been shown; no stale hover data should remain. Validate neutral empty chart behavior without browser errors.
- Perform a route-navigation journey proving edits persist to Overview and back, followed by a real browser reload proving bundled demo budgets return. No persistence should be inferred from a memory-router-only test.
- Check production-built local icons, fonts, and avatars resolve. Run existing fast checks, type checking/build, lint, and the relevant focused browser checks; report blocked validation explicitly rather than claiming parity from code inspection.
- Automated tests must run without private reference access. Test artifacts and rendered screenshots belong in configured test-output directories, not private reference locations.

## Out of Scope

- Backend APIs, authentication, bank integration, persistent storage, saved budget history, cross-tab synchronization, and schema migrations.
- Reporting-month selection, automatic current-month reporting, recurring-bill cutoff changes, budget rollover, or historical budget versions.
- Creating transaction categories, modifying/reassigning/deleting transactions, refund netting, multiple budgets per category, or custom theme colors.
- Period- or outgoing-only filtering added to Transactions for budget drill-down.
- Pot management, pot forms, or reservation of colors across pots and budgets. Only the modal shell is prepared for later reuse.
- A generic form generator, generic card framework, broad browsing architecture, new chart library, chart keyboard interaction redesign, new sorting controls, or budget pagination.
- Additional unsaved-change confirmation prompts, undo deletion, or persistence beyond the app session.
- Matching inconsistent screenshot sample records, totals, summary ordering, or Free terminology instead of the agreed rules.

## Further Notes

- The product decisions were agreed in the preceding discussion. This spec synthesizes that agreement; it does not start implementation or claim tests have passed.
- Budget, Maximum Spend, Spent, Remaining, and Latest Spending have been recorded in the root domain glossary. No new ADR is needed for the reversible component/state choices in this feature.
- Private design references remain outside public/tracked material. Native screenshots are cached under `.scratch/design.local/` with the `budgets-` prefix: desktop, tablet, mobile, add, delete, menu, and the two selector references. The supplied selector node labels and local screenshot names are not a reliable indicator of their contents; inspect each image before use.
- The reference index is `.scratch/references.local.md`. Follow the project's private-reference workflow; do not reproduce private URLs, file keys, screenshots, or reference-derived snapshots in tracked source, specs, tests, or public reports.
- Shared-control design details beyond the cached frames must be checked against their design definitions before introducing new variants. Missing visual references block only the corresponding parity claim, not permission to invent a second design system.
- The existing Overview setup computes budget categories once and imports demo data directly; it must adopt shared reactive ownership for edits to remain consistent. The existing chart already uses limit-based segments and supports pointer hover, so preserve rather than reinterpret that behavior.
- No new implementation tickets are created by this spec publication; subsequent decomposition can produce separate local tickets if requested.
