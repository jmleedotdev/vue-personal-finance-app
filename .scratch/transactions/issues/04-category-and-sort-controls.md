# 04: Narrow and reorder transactions with category and sort controls

**What to build:** Users can choose a single category and any of six stable sorts, paginate the resulting history, and restore those choices through URLs, using labeled desktop/tablet controls or accessible mobile dropdown triggers.

**Blocked by:** 02 — Browse the full history with URL-backed pagination.

**Status:** ready-for-agent

Specification: [Responsive Transactions Page](../spec.md). Follow the approved testing boundary and private-reference restrictions.

- [x] Offer All Transactions first, followed by every distinct transaction category alphabetically, including categories without configured budgets. Derive the catalog from transactions; the supplied history currently has ten categories.
- [x] Permit one selected category, defaulting to All Transactions. Filter before pagination and retain the other applied constraints when category changes.
- [x] Offer exactly Latest, Oldest, A to Z, Z to A, Highest, and Lowest, defaulting to Latest.
- [x] Latest/Oldest compare UTC calendar dates descending/ascending, ignoring time of day. A to Z/Z to A order sender/recipient names alphabetically. Highest/Lowest order signed amounts, not spending magnitudes.
- [x] Preserve original dataset order for every sort tie, including same-day records, repeated names, and equal amounts. In amount ordering, `+75.50` is higher than `-5.00`, which is higher than `-100.00`.
- [x] Sort the constrained records before pagination. Changing category or sort returns to page 1, retains other applied constraints, and creates a history entry when the applied state changes.
- [x] Encode category and sort in query parameters, omit defaults, and restore controls/results on initialization, refresh, and Back/Forward. Unknown category/sort values fall back to defaults without an error screen.
- [x] Keep result-dependent page counts and clamping correct. Hide pagination for at most one page; when no matches exist, show “No transactions found” with usable controls and no Clear filters action.
- [x] Reuse the existing single-select interaction model for labeled desktop/tablet controls and mobile icon-triggered dropdowns. Do not introduce multi-select, a modal, or a separate filter screen.
- [x] Name mobile triggers “Sort transactions” and “Filter by category”. Support keyboard selection, visible focus, selected values, Escape/outside-click dismissal, and focus return. Only one menu opens at a time; a non-default category has a subtle active indication.
- [x] Category/sort operations do not force scrolling or steal focus from the control interaction. Preserve explicit pagination's separate heading-focus and scroll behavior.
- [x] Reuse local icons and visual tokens; create reusable Vue SVG icon components only where needed, without duplicating artwork or adding remote dependencies.
- [x] Add rendered-app tests for category options/order, one selected category, all six explicit sort orders, stable ties, signed amounts, resets, pagination composition, empty/small results, query defaults/normalization, and memory-history restoration.
- [x] Use controlled records and independently stated expected orders for edge cases; do not test private sorting helpers or mirror their algorithms in assertions.
- [x] Use focused Chromium checks for responsive menus, accessible names/selected values, keyboard operation, dismissal, one-open-menu behavior, focus return, active-category indication, no forced scrolling, and narrow-width usability. Extend the focused refresh/history journey with these applied controls.
- [x] Integrate with submitted search when ticket 03 is present: search/category constraints combine, category/sort changes use the last submitted search instead of a draft, and empty search submission preserves category/sort. Whichever of 03 and 04 lands second adds combined matching/empty-result, draft/applied, reset, and URL/history regression coverage. Do not add skipped tests or impose an artificial blocker on 03.
- [x] Run relevant fast tests, type-checking, linting, and the production build; preserve earlier route-loading, navigation, pagination, and Overview behavior.
- [x] Keep all private design URLs, file keys, screenshots, and reference-derived snapshots out of tracked content and public reports.

## Scope boundary

Ticket 03 owns submitted name search and can land before or after this ticket. Implement this complete category/sort slice against available pagination without taking over unfinished search work. The final feature must satisfy their combined contract. No additional date, income/expense, or recurring-only filters are included.

## Comments

- Implemented on `dev` in `bec2771`: dataset-derived single-category filtering, stable UTC-calendar-day/name/signed-amount sorting, URL normalization/history restoration, responsive shared-select controls, and combined submitted-search coverage.
- Validation: 87 unit/rendered-app tests and 67 production Chromium tests passed; type-check, lint, and production build passed. Compared desktop/tablet/mobile controls with cached private references; private inputs and browser captures remain ignored.
- Independent review against the starting commit: Standards — no documented breaches or actionable smells; Spec — no missing, out-of-scope, or incorrect behavior identified.
