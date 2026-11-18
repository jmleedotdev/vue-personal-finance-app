# 01: Open a responsive Recurring Bills page with calculated summaries

**What to build:** Users can open Recurring Bills from app navigation or Overview's See Details and see their distinct monthly bills, calculated reporting summaries, due dates, amounts, and accessible payment statuses in a responsive page. This slice delivers a useful read-only page in default Oldest order without presenting non-working search or sort controls; those interactions are delivered by subsequent tickets. Follow the parent Recurring Bills spec and the domain glossary.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Add a lazy-loaded Recurring Bills route and enable its navigation destination and Overview's See Details link. Both entry points open the default view. Active navigation follows the route; other unfinished destinations remain unavailable.
- [x] Use the unmodified demo transaction dataset and the explicit Reporting Date of 19 August 2024. Share the reporting date and recurring-bill derivation with Overview rather than maintaining divergent calculations.
- [x] Extend the existing recurring-bill calculation to support distinct bill rows, counts, statuses, and amounts while preserving Overview's existing summary contract and financial behavior.
- [x] Only recurring transactions establish bills. Group by exact payee name; select the latest eligible recorded payment independently of input order. Its amount, Billing Day, and supplied avatar establish the displayed bill information.
- [x] Evaluate payment eligibility and reporting-month boundaries using UTC calendar dates, including the entire Reporting Date. Future payments cannot establish current bills or change their current amount, Billing Day, or paid status. Preserve rejection of positive recurring amounts, including future-dated positive records.
- [x] Count a bill as paid once when it has an eligible payment in the reporting month. Otherwise include it in Total Upcoming, including overdue bills. Due Soon includes overdue bills, today, and day seven, but excludes day eight and next-month recurrences. Preserve short-month clamping without changing the established Billing Day.
- [x] Calculate Total Bills as Paid Bills plus Total Upcoming, without adding Due Soon again. Accumulate monetary values safely in cents and display positive USD magnitudes with two decimal places.
- [x] With the supplied data, show eight distinct bills, Total Bills $384.98, Paid Bills 4 ($190.00), Total Upcoming 4 ($194.98), and Due Soon 2 ($59.98). These are calculated expectations, not hardcoded summary data.
- [x] Display bills in ascending current-month due-date order, the eventual Oldest default, with deterministic stable ties. Each row shows payee/avatar, a monthly ordinal due-date label, and positive amount.
- [x] Paid bills have the green date/check treatment. Unpaid Due Soon bills, including overdue bills, have the warning icon and red amount. Other upcoming bills have no status icon. Provide accessible status text rather than relying on color alone.
- [x] Match desktop cards beside the list, tablet cards side by side above the list, and mobile stacked cards above compact rows. Desktop/tablet show Bill Title, Due Date, and Amount columns; mobile follows the compact payee/date/status/amount arrangement.
- [x] Reuse shared controls where applicable, theme tokens, supplied local icons and fonts, and production-safe local avatar imports. Preserve artwork; keep utility-first styling and justify any styling exception.
- [x] Preserve the main-content skip-link contract, sidebar minimization, accessible headings and focus, safe-area spacing, no horizontal page overflow, and final-content clearance from fixed navigation at reference and narrow/intermediate widths.
- [x] When no recurring bills exist, show zero totals and counts and the exact message “No bills found,” with no bill rows. Do not add editing, payment actions, or detail screens.
- [x] Add fast tests at the rendered-app-with-router boundary for navigation, calculated content, distinct-payee selection, changed amount/Billing Day, future-payment exclusion, status boundaries, fixed reporting, invalid positive payments, and empty data. Independently state expected results rather than reusing production calculations in tests.
- [x] Update obsolete unavailable-destination and disabled See Details assertions while preserving Overview's financial regressions and availability checks for unfinished features. Keep the existing summary-fit and navigation-clearance checks useful.
- [x] Perform focused Chromium and visual checks against the private desktop, tablet, and mobile references, including narrow/intermediate widths, non-UTC date presentation, navigation clearance, and actual production asset loading. Tests must not read private design references; keep artifacts separate from the reference cache.
- [x] Run focused tests, relevant regressions, type-checking, linting, and production build. This ticket remains independently demoable with the supplied eight bills before search, sort selection, and pagination are added.

## Comments

Implemented the read-only responsive Recurring Bills page, lazy-loaded routing and both entry points, shared fixed Reporting Date and bill derivation, calculated summaries, accessible statuses, and empty state. Search, sort controls, and pagination remain deferred to subsequent tickets.

Validation completed:
- 97 fast tests passed, including rendered-app-with-router bill coverage and Overview/Transactions regressions.
- 76 production Chromium tests passed, including responsive geometry, navigation clearance, local asset loading, keyboard navigation, and non-UTC date presentation.
- Project type-checking, linting, and production build passed.
- Manually compared desktop, tablet, and mobile renders with private references; also checked narrow/intermediate widths. Browser artifacts remain separate from the private reference cache.
- Independent Standards and Spec reviews found no actionable issues.

An additional standalone E2E TypeScript check exposed existing configuration/type errors outside this ticket; the normal project type-check passes.
