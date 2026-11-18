# Recurring Bills Page

Status: resolved

## Problem Statement

Users can see recurring-bill totals on Overview but cannot open a dedicated page to understand which monthly bills are paid, need attention, or remain upcoming. Recurring Bills navigation and Overview's See Details action are currently unavailable.

The supplied responsive designs describe the desired page, but their sample records and totals differ between screen sizes and are not consistently reconciled. Users need one coherent view of the supplied demo finances rather than viewport-dependent sample content. They also need familiar search, sort, pagination, and browser-history behavior consistent with Transactions.

## Solution

Build a read-only Recurring Bills page using the unmodified demo transaction dataset and the existing monthly recurring-bill rules. Use the same Reporting Date as Overview: 19 August 2024.

Display Total Bills, a summary of Paid Bills, Total Upcoming, and Due Soon with counts and amounts, and a searchable, sortable list of distinct Recurring Bills. Present payee avatars and names, monthly due dates, positive bill amounts, and accessible payment-status indications. Match the supplied desktop, tablet, and mobile presentation while keeping the financial content identical across viewports.

Paginate matching bills in groups of ten, hiding pagination whenever the results fit on one page. Preserve applied browsing state in the URL, and enable the page's navigation destination and Overview entry link. Reuse the existing design system and extract genuinely reusable sort-option and pagination foundations without changing Transactions behavior.

## User Stories

1. As a user, I want to open Recurring Bills from app navigation, so that I can inspect my monthly obligations beyond Overview's totals.
2. As a user, I want Overview's recurring-bill See Details link to open the page, so that I can move from the summary to its supporting bills.
3. As a user, I want the current navigation destination to be identified, so that I know which section I am viewing.
4. As a user, I want Recurring Bills calculated from the supplied demo transactions, so that the page reflects the same financial data as the rest of the app.
5. As a user, I want the historical demo evaluated as of 19 August 2024, so that its meaning does not change with today's date.
6. As a user, I want one row per distinct recurring payee, so that payment history does not duplicate monthly obligations.
7. As a user, I want each bill's latest eligible payment to establish its amount and Billing Day, so that the bill reflects the available payment history.
8. As a user, I want future payments excluded from current reporting, so that later activity does not make a bill appear paid prematurely.
9. As a user, I want Total Bills to include both paid and unpaid monthly obligations, so that I understand the full recurring monthly amount.
10. As a user, I want Paid Bills to show a count and amount, so that I understand how many obligations have been paid and their combined value.
11. As a user, I want Total Upcoming to show the count and amount of unpaid bills for the reporting month, so that I understand what remains outstanding.
12. As a user, I want Due Soon to show the count and amount needing attention through the next seven calendar days, so that I can prioritize unpaid obligations.
13. As a user, I want overdue bills included in Due Soon, so that unpaid obligations do not disappear when their due dates pass.
14. As a user, I want bills due today and on the seventh day included in Due Soon, so that the attention window has clear inclusive boundaries.
15. As a user, I want already-paid bills excluded from upcoming totals, so that next month's recurrence is not confused with this month's outstanding obligations.
16. As a user, I want summary cards to remain unchanged while searching or paging, so that I retain the full reporting-month context.
17. As a user, I want bill names and familiar avatars, so that I can recognize each payee.
18. As a user, I want a monthly due-date label for each bill, so that I can understand its billing schedule.
19. As a user, I want outgoing bill amounts displayed as positive currency magnitudes, so that the list is easy to scan.
20. As a user, I want paid bills distinguished by a green check and date treatment, so that I can recognize completed obligations.
21. As a user, I want Due Soon bills distinguished by a warning and red amount, so that obligations needing attention stand out.
22. As a user who cannot rely on color, I want accessible payment-status text, so that I can distinguish paid, Due Soon, and other upcoming bills.
23. As a user, I want to search by part of a payee name without worrying about case or surrounding spaces, so that I can find bills quickly.
24. As a user, I want typing to remain a draft until I submit, so that partial input does not unexpectedly change the list.
25. As a user, I want to submit search with Enter or the search button, so that I can use either keyboard or pointer interaction.
26. As a user, I want submitting an empty search to restore all bills, so that I can return to the full list without losing my selected sort.
27. As a user, I want sorting and pagination to use the applied search rather than an unsubmitted draft, so that browsing changes are predictable.
28. As a user, I want bills initially ordered by oldest due date first, so that the list follows the ascending monthly schedule shown in the designs.
29. As a user, I want Latest and Oldest sort choices, so that I can reverse the due-date order using familiar labels.
30. As a user, I want A to Z and Z to A choices, so that I can browse bills by payee name.
31. As a user, I want Highest and Lowest choices to compare positive bill amounts, so that larger obligations are ordered intuitively.
32. As a user, I want ten matching bills per page, so that larger bill lists remain manageable.
33. As a user, I want pagination hidden when there are ten or fewer matches, so that unnecessary controls do not clutter a single-page list.
34. As a user, I want Previous, Next, and numbered page controls, so that I can reach every matching bill.
35. As a user, I want the current page identified and unavailable page actions disabled, so that pagination communicates its state clearly.
36. As a mobile user, I want compact pagination consistent with Transactions, so that controls fit narrow screens.
37. As a user, I want search and sort changes to return to the first page, so that I do not accidentally miss the beginning of a new result set.
38. As a user, I want a clear No bills found message while retaining search and sort controls, so that I can recover from an unsuccessful search.
39. As a user, I want search, sort, and page encoded in the URL, so that refresh and direct links restore the view.
40. As a user, I want Back and Forward to restore applied controls and results, so that browser navigation behaves naturally.
41. As a user, I want invalid URL values normalized without an error screen, so that malformed or stale links still produce a usable list.
42. As a keyboard user, I want a page change to focus and reveal the page heading, so that I can resume reading from the beginning.
43. As a keyboard user, I want search and sort actions to retain focus with the control I am using, so that these actions do not disrupt interaction.
44. As a desktop user, I want summary cards beside the bill list, so that I can scan totals and bill details together.
45. As a tablet user, I want the summary cards above the list, so that the page uses the available width effectively.
46. As a mobile user, I want stacked cards and compact bill rows, so that the page remains readable without horizontal scrolling.
47. As a mobile user, I want an accessible icon-only sort trigger, so that I can sort without sacrificing list width.
48. As a keyboard user, I want labeled controls, visible focus, and operable dropdowns, so that every browsing action is available without a mouse.
49. As a mobile user, I want the final bill, pagination, and focused controls clear of fixed bottom navigation, so that no content is obscured.
50. As a user, I want the same records and financial totals on every screen size and on Overview, so that responsive presentation does not change the underlying finances.
51. As a user, I want Transactions to retain its existing browsing behavior, so that sharing controls does not regress an already-working page.
52. As a developer, I want shared controls, sort labels, pagination, theme tokens, and local assets reused appropriately, so that the new page does not create a parallel design system.
53. As a developer, I want fast tests at the rendered-app boundary and focused real-browser checks, so that coverage protects user behavior without unnecessary testing layers.

## Implementation Decisions

### Scope and architecture

- Retain the current client-rendered Vue, TypeScript, Router, and Tailwind stack. This is a frontend-only, read-only feature.
- Add a dedicated Recurring Bills route at `/recurring-bills`, following existing route-level lazy-loading conventions.
- Separate page orchestration and browsing state from meaningful shared responsibilities; do not create a wrapper component for every fragment or a broad component framework.
- Extend the existing recurring-bill domain calculation to supply consistent distinct-bill information, status, counts, and amounts. Preserve its existing summary behavior for Overview; do not implement a second independent interpretation of payment history inside the page.
- Share the fixed Reporting Date between the relevant recurring-bill consumers rather than allowing local copies to drift. Do not switch to the system date or introduce a reporting-date picker.
- Preserve the demo dataset without modifying records or financial values to match screenshot examples.
- No backend, persistent store, bank integration, or schema migration is required.

### Recurring Bill derivation and reporting

- Only transactions marked recurring establish Recurring Bills. Group by exact payee name and select the latest recorded payment on or before the Reporting Date, independent of input order.
- Use UTC calendar dates for reporting eligibility and reporting-month boundaries. Payments later on the Reporting Date are eligible; later calendar dates are not.
- Future payments cannot establish a current bill or change its current amount, Billing Day, or paid status. A payee with only future payments has no current bill.
- Preserve the existing positive-recurring-payment invariant: positive amounts are invalid rather than silently omitted, including future-dated positive recurring records.
- The selected payment establishes the bill's amount and Billing Day. A shorter month clamps its actual due date to that month's final day without changing the established Billing Day. A later eligible payment may establish a different Billing Day.
- A recorded payment in the reporting month on or before the Reporting Date makes that bill paid, counted once. A past due date by itself does not establish payment.
- Total Upcoming includes every distinct bill still unpaid in the reporting month, including overdue bills. Do not include a paid bill's next-month recurrence.
- Due Soon is the subset of Total Upcoming due on or before seven calendar days after the Reporting Date. Include overdue bills, bills due today, and bills due on day seven. Do not add next-month obligations when the seven-day window crosses month-end.
- Total Bills is the combined monthly amount of all distinct bills, both paid and unpaid. It equals Paid Bills plus Total Upcoming; Due Soon must not be added a second time.
- Display outgoing payment magnitudes as positive USD amounts with two decimal places. Preserve cent-safe monetary accumulation.
- The supplied dataset and Reporting Date produce eight distinct bills: Total Bills $384.98; Paid Bills 4 ($190.00); Total Upcoming 4 ($194.98); Due Soon 2 ($59.98). These are calculated expectations, not hardcoded summary fixtures.
- Summary amounts and counts describe the complete reporting-month bill set. Search, sort, and pagination affect only the list.

### Bill information and status presentation

- Each row shows the payee's local avatar, payee name, monthly due-date label with an ordinal day, and positive bill amount.
- Use the selected payment's payee information and supplied local avatar consistently with the underlying demo data.
- Paid bills receive the green check and green date treatment evidenced by the design.
- Unpaid Due Soon bills receive a warning icon and red amount. Overdue bills use this same attention treatment rather than becoming a separate status category.
- Other upcoming bills receive no status icon and retain the ordinary amount treatment.
- Include accessible status text; do not communicate status solely through color or an unexplained decorative icon.
- Treat the supplied designs as visual authority, not as a competing financial dataset. Follow the approved desktop status treatment where responsive examples conflict.

### Submitted payee search

- Search the payee name only with case-insensitive substring matching. Trim leading and trailing whitespace when applying a search.
- Keep draft and applied search separate. Typing does not change list results, pagination, URL state, summary cards, or browser history.
- Submit with Enter or the accessible magnifying-glass button. Do not add immediate or debounced filtering.
- Submission applies the trimmed search and returns to page 1. An empty submission removes the search constraint while retaining sort.
- Sort and page changes use the last applied search, not an unsubmitted draft.
- Refresh and Back/Forward restore applied search from the URL and replace an unsubmitted draft, following Transactions conventions.

### Sorting and shared foundations

- Offer the same six labels as Transactions, in the existing menu order: Latest, Oldest, A to Z, Z to A, Highest, Lowest.
- Default Recurring Bills to Oldest, meaning ascending due date in the reporting month. Latest means descending due date. Neither sorts bill rows by the date of their latest payment.
- A to Z and Z to A compare payee names alphabetically. Highest and Lowest compare positive bill magnitudes, not negative underlying transaction amounts.
- Preserve deterministic, stable bill order for ties, following the existing supplied-order browsing convention.
- Extract shared sort-option definitions where appropriate. Keep financial comparators and default sorts feature-specific: Transactions retains Latest by default, calendar-date sorting, and signed-amount comparisons.
- Generalize the existing pagination component so both pages can reuse the same visual and interaction behavior with appropriate accessible navigation names. Do not add duplicate page-specific pagination markup or force bill terminology onto Transactions.
- Avoid extracting a generic browsing framework solely because two pages share labels and controls.

### Pagination and empty results

- Apply distinct-bill derivation, submitted name search, and selected sort before taking a page of results. Each page contains at most ten bills.
- Start on page 1. Derive result counts and page counts from matching distinct bills rather than the number of payment records.
- Hide pagination for zero matches or any result set fitting on one page, including exactly ten matches. Show pagination from eleven matches onward.
- Reuse Transactions' Previous, Next, numbered-page, and narrow-screen compact-pagination behavior. Identify the current page accessibly; disable Previous on the first page and Next on the final page. Arrow-only controls need accessible names; ellipses are not interactive.
- Search submission and sort changes return to page 1. Explicit pagination retains applied search and sort.
- With no matches, replace bill rows with the exact message “No bills found”; keep search, sort, and reporting summaries usable and visible. No separate Clear filters action is required.
- An explicit page change focuses the page heading and brings it into view. Search and sort actions retain focus with the active control and do not force scrolling.

### URL state and navigation

- Encode applied search, sort, and page in query parameters named search, sort, and page. Omit empty search, default Oldest sort, and page 1.
- Direct entry and reload restore the same applied controls and results from the URL.
- Explicit search submission, sort changes, and page changes create history entries when applied state changes; typing creates none.
- Back/Forward restore controls, list results, and pagination from the URL and discard stale drafts. Each feature's browsing state remains independent.
- Unknown or malformed sort values fall back to Oldest. Invalid page numbers become page 1; valid excessive page numbers clamp to the final available page. Empty results normalize to page 1 without pagination.
- Normalize malformed or redundant query state without an error screen, following existing Transactions conventions and preserving unrelated query parameters.
- Enable the Recurring Bills navigation item and Overview's recurring-bill See Details link. Both enter the default page rather than restoring an invisible previous browsing state.
- Derive active navigation from the route. Preserve sidebar minimization, responsive bottom navigation, and the main-content skip-link contract. Other unfinished destinations remain unavailable.
- Replace obsolete tests asserting that this destination and detail action must remain disabled; do not weaken availability checks for still-unimplemented destinations.

### Responsive design, assets, and accessibility

- Desktop places the Total Bills and Summary cards in a column beside the bill list. Tablet places the cards side by side above the list. Mobile stacks them above compact bill rows.
- Desktop/tablet show Bill Title, Due Date, and Amount columns. Mobile arranges the payee above its due-date/status line, with the amount aligned to the right as in the supplied reference.
- Use a labeled sort dropdown on larger layouts and the existing shared control's accessible icon-only treatment on mobile. Both expose the same options and keyboard behavior, not a separate modal.
- Use one responsive page structure where practical. Choose responsive transitions consistent with the existing app shell and usable content widths, not three fixed canvases.
- Reuse the existing shared button, input, and select controls, theme-backed typography and colors, local Public Sans fonts, icons, and avatars. Preserve supplied artwork and resolve runtime assets through production-safe local imports.
- Keep utilities beside Vue markup by default. Any named styling class or component style block needs a concrete readability or manageability justification.
- Preserve accessible names, headings, table/list information, dropdown selection and dismissal, focus return, selected/current/disabled states, and visible keyboard focus. Do not depend on color alone.
- Prevent horizontal page overflow, support long names and narrow/intermediate widths, and keep final content, pagination, and keyboard focus clear of fixed bottom navigation and device safe areas.

## Testing Decisions

### Primary seam and prior art

- Prefer one primary logical seam: the rendered app with its router, exercised through visible content, accessible controls, and navigation outcomes. This follows the existing Transactions and Overview screen-level suites rather than adding tests for every helper, icon, and internal presentational component.
- Use Vitest and Vue Test Utils with real Vue Router memory history for the fast behavioral loop. Reuse the established pattern of rendering the assembled app with supplied or controlled demo records and restoring modified fixtures between tests.
- Test the Recurring Bills page, its Overview entry point, navigation availability, and observable Transactions regressions through this app boundary. Preserve useful existing shared-control tests without creating redundant layers solely for extracted labels or pagination wrappers.
- Good tests assert what users can read and do: row identities/order, formatted amounts, accessible status, counts, URL state, selection, navigation, and focus outcomes. Avoid assertions about private helpers, component decomposition, CSS utility strings, or implementation snapshots.
- Expected totals and row orders must be independently stated rather than generated with the production calculation under test.
- Use focused Playwright/Chromium checks only for browser-dependent risks. The existing Transactions browsing checks and Overview recurring-summary layout checks provide prior art.
- The rendered-app boundary has been selected from the established repository approach; confirm that this seam matches the owner's expectations when handing over the published spec. Do not treat publication as authorization to implement.

### Fast rendered-app coverage

- Verify the unchanged demo dataset yields the eight distinct bill rows, default Oldest order, $384.98 Total Bills, and all approved summary counts and amounts.
- Verify repeated payment history produces one bill per exact payee, the latest eligible amount/Billing Day is reflected, future payments do not affect current reporting, non-recurring records do not establish bills, and positive recurring payments remain invalid.
- Preserve Overview's fixed-date and financial regressions, including current-month paid scope, overdue/today/day-seven inclusion, day-eight exclusion, and exclusion of next-month recurrences. Exercise corresponding row statuses and counts through the new page with controlled histories.
- Verify no recurring history yields zero summary counts and amounts, no bill rows, a usable empty state, and no pagination.
- Verify paid, Due Soon/overdue, and other upcoming statuses are accessible and consistent with the summary categories. Verify date labels, positive currency amounts, and real supplied payee information.
- Verify typing is draft-only; Enter and the search button submit; whitespace/case and partial names work; unrelated fields do not become alternate search targets; empty submission restores all bills.
- Verify search results do not change summary totals or counts. Verify sort and pagination use applied search rather than a draft.
- Cover all six sorts with explicit expected orders, including positive-magnitude amount ordering and stable ties. Confirm Oldest is the bill default while Transactions retains Latest and its signed-amount behavior.
- Use controlled histories containing more than ten distinct recurring payees to exercise numbered/Previous/Next paging, combined search/sort before slicing, page resets, final partial pages, current/disabled states, and reachability of all matches. Do not alter production demo data to manufacture pagination.
- Explicitly cover zero, fewer than ten, exactly ten, and eleven matching bills to verify the pagination visibility boundary.
- Verify direct query initialization, omitted defaults, malformed and repeated query-value handling consistent with Transactions, excessive-page clamping, and normalized empty results.
- Verify Back/Forward restore applied controls/results and discard drafts, typing adds no history entry, and explicit browsing changes can be revisited.
- Verify the enabled navigation destination and Overview See Details link open the default page, active navigation follows the route, still-unimplemented destinations remain unavailable, and existing Overview financial content and Transactions browsing remain intact.

### Focused browser and visual validation

- Compare the rendered page against the desktop, tablet, and mobile private references, accounting for approved sample-data differences, the default Oldest label, and pagination appearing only with sufficiently large test datasets.
- Reference frames are desktop 1440 × 1024, tablet 768 × 1196, and mobile 375 × 1370. Also check representative intermediate widths and a narrow 320px viewport rather than relying only on exact frame sizes.
- Verify card arrangements, table-to-compact-row transitions, spacing, typography, colors, status treatment, and original local asset geometry. Check actual local avatar/icon loading in a production build.
- Verify mobile sort trigger naming, selected value, keyboard operation, Escape/outside-click dismissal, focus return, and default/hover/focus/selected/disabled states as applicable.
- With more than ten bills in controlled browser test data, verify compact pagination and reachable current/first/last pages, heading focus and actual scrolling from the bottom on a page change, and no forced scrolling or focus theft on search/sort changes.
- Verify no horizontal overflow and that final rows, pagination, and focused controls remain clear of fixed bottom navigation. jsdom assertions are not evidence for responsive geometry or actual scrolling.
- Include a focused real reload and Back/Forward journey to confirm URL restoration beyond memory-history tests, and preserve UTC calendar presentation in a non-UTC browser timezone.
- Keep browser coverage focused rather than introducing a large viewport-by-behavior matrix or a multi-browser suite.

### Completion validation and reference privacy

- Run the relevant focused tests during implementation, then the full relevant fast regression suite, type-checking, linting, and production build before completion.
- Revise browser assertions that currently require Recurring Bills See Details to be unavailable; preserve the summary-fit and navigation-clearance checks.
- Tests must not read or depend on private Figma links or cached design screenshots. Keep test fixtures and rendered-app artifacts separate from private reference locations.
- Do not publish private links, keys, screenshots, or reference-derived snapshots in source, tests, tracked specs, commits, or public reports. Temporary Figma asset URLs are not runtime assets.

## Out of Scope

- Creating, editing, deleting, or manually marking bills paid; clickable bill rows or bill-detail screens.
- Editing transactions or changing the supplied demo financial dataset to match designs or to make production pagination visible.
- A date/month picker, live system-date reporting, arbitrary billing frequencies, cancellation/subscription management, historical arrears across previous reporting months, or bank/payment reconciliation.
- Additional category, date, status, or amount filters; immediate/debounced search; a separate Clear filters action; or a mobile filter/sort modal.
- Authentication, backend/API work, bank integration, persistence, offline support, synchronization, or a new data-store framework.
- A broad design-system catalog, generic browsing framework, unrelated Overview/Transactions redesign, or work on other unfinished destination pages.
- Comprehensive screenshot-regression infrastructure, private-reference-dependent tests, and an unnecessary multi-browser validation matrix.

## Further Notes

- The user explicitly approved the read-only scope, unchanged demo data, existing domain rules, fixed Reporting Date, Total Bills meaning, full-month summary cards independent of search, submitted payee search, and the status treatment above.
- The user replaced the initial all-rows proposal with ten-bill pagination and then explicitly confirmed hiding pagination for exactly ten as well as smaller result sets.
- The user requested the Transactions sort vocabulary rather than “earliest.” Oldest is the confirmed default for bills even though Transactions defaults to Latest; shared labels must not erase these semantic differences.
- The supplied responsive examples disagree in sample payee names, financial totals, and some status presentation. Demo-derived content, the glossary, and the explicit decisions in this spec take precedence over those inconsistencies.
- Existing glossary terms govern this feature. Total Bills has already been added to the root glossary with the agreed paid-plus-unpaid monthly meaning. There are no existing ADRs in this area, and this feature does not require a new ADR.
- Private references are indexed locally in `.scratch/references.local.md`. Original desktop, tablet, and mobile screenshots are cached under `.scratch/design.local/` as `recurring-bills-desktop.png`, `recurring-bills-tablet.png`, and `recurring-bills-mobile.png`. Keep the index and screenshots ignored; transfer them separately when continuing in another checkout.
- The tablet and mobile references were fetched at native frame resolution and their PNG dimensions verified. Retrieve additional detailed design context only when needed, and inspect existing shared controls before adding any variant.
- This spec publishes the agreed feature for implementation; no implementation is included in this specification step.

## Comments

### Status reconciliation

- All four implementation issues are resolved with completed acceptance criteria. The current implementation includes both entry points, shared fixed-date bill derivation and summaries, accessible statuses, submitted payee search, all six sorts, and shared URL-backed pagination. Later tickets complete the conditional search/sort/page integration and larger-history validation recorded in earlier tickets.
- Fresh validation: `pnpm check` passes (lint, type-checking, 145 Vitest tests, 8 commit-hook tests, and production build). All 87 Chromium checks pass against the production preview, including Overview and Transactions regressions, responsive controls, focus/scroll behavior, and combined URL/history journeys.
- Changed the stale parent-spec status to `resolved`. This reconciliation uses implementation inspection, completed issue records, prior review/visual-validation evidence, and fresh automated checks; it does not claim a new private-reference visual review.
