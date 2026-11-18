# Responsive Transactions Page

Status: resolved

## Problem Statement

Users can see a recent-transactions preview on Overview but cannot open the full history, find a sender or recipient, narrow records by category, change their order, or browse additional pages. The Transactions navigation destination and Overview's View All action are currently unavailable.

The owner wants a complete, responsive browsing experience that faithfully follows the supplied private designs without treating their illustrative records as financial truth. The supplied demo transactions must remain authoritative across desktop, tablet, and mobile.

## Solution

Add a lazy-loaded, read-only Transactions page containing the full supplied history, with submit-only name search, single-category filtering, six sorting options, and ten-record pagination. Enable navigation from Overview and the app's navigation, with route-derived active state.

Use one consistent dataset and browsing state across responsive layouts. Keep applied search, category, sort, and page in the URL so refresh and browser Back/Forward restore the view. Retain accessible controls, deliberate pagination focus/scroll behavior, and the existing visual foundations. No transaction-management, backend, or persistence infrastructure is required.

## User Stories

1. As a user, I want to open Transactions from app navigation, so that I can browse beyond the Overview preview.
2. As a user, I want Overview's Transactions View All link to open the full page, so that I can continue from the preview.
3. As a user, I want navigation to identify the current destination, so that I know which section I am viewing.
4. As a user, I want unfinished destinations to remain clearly unavailable, so that navigation does not promise features that do not exist.
5. As a user, I want the complete supplied transaction history, including July records, so that browsing is not restricted to Overview's reporting month.
6. As a user, I want the same transaction records at every screen size, so that changing devices does not change my financial information.
7. As a user, I want each record to show its sender or recipient, avatar, category, date, and signed USD amount, so that I can recognize and understand it.
8. As a user, I want received amounts distinguished in green and dates displayed consistently, so that amounts and calendar days remain understandable.
9. As a user, I want ten transactions per page, so that each view remains manageable.
10. As a user, I want the default view to show the latest transactions on page 1, so that recent activity is immediately visible.
11. As a user, I want to type a search without immediately changing results, so that I can finish composing it before applying it.
12. As a pointer user, I want to submit search through the magnifying-glass button, so that the visible search control performs the search.
13. As a keyboard user, I want Enter to submit search, so that I do not need to move focus to a button.
14. As a user, I want case-insensitive partial-name matching that ignores surrounding whitespace, so that I can find a sender or recipient without entering an exact name.
15. As a user, I want search to match names rather than unrelated category or amount fields, so that its behavior is predictable.
16. As a user, I want to submit an empty search to remove the search constraint, so that I can return to a broader result set.
17. As a user, I want an unsubmitted search draft excluded from category and sort operations, so that those controls operate on the search I actually applied.
18. As a user, I want to choose one category from every category represented in the history, so that filtering is not limited to categories with budgets.
19. As a user, I want an All Transactions category option, so that I can remove the category constraint.
20. As a user, I want category filtering and submitted search to combine, so that I can find a sender or recipient within a category.
21. As a user, I want Latest and Oldest sorts, so that I can browse calendar dates in either direction.
22. As a user, I want A to Z and Z to A sorts, so that I can browse sender or recipient names alphabetically.
23. As a user, I want Highest and Lowest sorts based on signed amounts, so that I can order received and spent amounts predictably.
24. As a user, I want tied records to keep their supplied order, so that sorting is stable and same-day records remain consistent with Overview.
25. As a user, I want changes to applied search, category, or sort to return to page 1, so that I do not remain on an irrelevant later page.
26. As a user, I want numbered pages and Previous/Next controls, so that I can reach all matching transactions.
27. As a user, I want the current page identified and unavailable boundary actions disabled, so that pagination communicates my position and available actions.
28. As a mobile user, I want compact pagination with accessible arrow controls and non-interactive ellipses, so that I can navigate without horizontal overflow.
29. As a user, I want pagination hidden when there is at most one page of results, so that unnecessary controls do not clutter the view.
30. As a user, I want a clear No transactions found message while search, category, and sort controls remain usable, so that I can adjust a query that has no matches.
31. As a user, I want the applied browsing state reflected in the URL, so that I can reopen or share the same view.
32. As a user, I want refresh to restore the applied view, so that refreshing does not discard my browsing state.
33. As a user, I want browser Back/Forward to restore controls and results, so that I can revisit earlier views.
34. As a user, I want typing alone to leave browser history untouched, so that unsubmitted drafts do not create navigation noise.
35. As a user, I want refresh and Back/Forward to replace an unsubmitted draft with the restored applied search, so that the field agrees with the restored view.
36. As a user opening an invalid or outdated URL, I want sensible defaults and a valid page, so that I can browse without an error screen.
37. As a desktop or tablet user, I want readable transaction columns and labeled browsing controls, so that I can scan the full history efficiently.
38. As a mobile user, I want compact transaction rows with category under the name and date under the amount, so that essential information fits a narrow screen.
39. As a mobile user, I want sort and category icons to open accessible dropdowns, so that the controls remain usable without a separate filter screen.
40. As a keyboard user, I want named controls, visible focus, keyboard selection, and predictable dropdown dismissal, so that I can operate the page without a pointer.
41. As a mobile user, I want a subtle indication when a category filter is active, so that a hidden field label does not conceal the filtered state.
42. As a user changing pages, I want the start of the new list brought into view and its heading focused, so that I can begin reading the new records immediately.
43. As a user submitting search or changing category or sort, I want focus to remain with my control without forced scrolling, so that updating results does not interrupt the interaction.
44. As a user, I want bottom navigation to avoid obscuring rows, pagination, or focus, so that the complete page remains reachable on mobile devices.
45. As a user visiting Overview, I want Transactions page code loaded only when needed, so that the new destination is not eagerly loaded with the initial screen.
46. As the owner, I want existing visual tokens, controls, local icons, fonts, and avatars reused, so that the new page remains consistent and does not depend on temporary design URLs.
47. As the owner, I want Overview's preview order and financial calculations preserved, so that adding a destination does not change already approved behavior.
48. As the owner, I want private design references kept in ignored local files, so that implementation and review do not publish private design information.

## Implementation Decisions

### Data, architecture, and responsibility

- Treat the supplied demo dataset's `transactions` array as the transaction source of truth. It currently contains 49 records across ten categories. Preserve its records and financial values; do not change them to match illustrative design content.
- Include the full history, independent of Overview's reporting month or Reporting Date. Do not introduce a broader account, ledger, or transaction-management model.
- Retain the client-rendered Vue, TypeScript, Vite, Router, and Tailwind architecture. No backend, persistent browser store, or hypothetical data-service framework is needed.
- Keep meaningful responsibilities separate: route/page orchestration, browsing-state preparation, rendered transaction information, and reusable controls. Prefer existing interfaces; do not create a component for every trivial wrapper.
- Apply search and category constraints and the selected ordering before taking a page of results. Derive category choices and page counts from the data rather than hardcoding today's totals.
- Preserve Overview's first-ten-record preview in supplied dataset order, independent balance figures, reporting period, and financial calculations. Do not replace its preview with full-page pagination or timestamp sorting.

### Route and app navigation

- Add the `/transactions` route with a route-level dynamic import of its page component.
- Enable the Transactions navigation destination and Overview's Transactions View All link. Both point to the default `/transactions` view rather than restoring a hidden previous view.
- Derive active navigation from the current route and separate destination availability from active state. Unimplemented destinations remain unavailable.
- Preserve sidebar minimization, responsive bottom navigation, the skip-link target, safe-area spacing, and clearance for final content and keyboard focus.

### Submitted search

- Search the sender/recipient `name` field only, using case-insensitive substring matching. Trim leading and trailing whitespace when applying a search.
- Maintain separate draft and applied search values. Typing must not change rendered results, pagination, URL state, or browser history.
- Submit through the magnifying-glass button or Enter in the search field. The icon is an accessible submit button, not decoration. Search is neither immediate nor debounced.
- Submitting applies the trimmed value and returns to page 1. Submitting an empty value removes the search constraint without clearing category or sort.
- Category and sort operations use the last applied search, not an unsubmitted draft.
- Refresh and browser Back/Forward restore the applied search from the URL and replace any unsubmitted draft.

### Category and sorting

- Category selection is single-select. Offer All Transactions first, then every distinct transaction category alphabetically. Do not use configured budgets as the category catalog.
- Default to All Transactions and combine category filtering with the applied search.
- Offer exactly Latest, Oldest, A to Z, Z to A, Highest, and Lowest; default to Latest.
- Latest and Oldest compare UTC calendar dates, descending and ascending respectively. Ignore time of day and preserve supplied order within a day.
- A to Z and Z to A compare sender/recipient names in ascending and descending alphabetical order respectively.
- Highest and Lowest compare signed amounts, not spending magnitude: `+75.50` sorts above `-5.00`, which sorts above `-100.00`.
- Preserve original dataset order for all sort ties.
- Changes to category or sort return to page 1 while retaining the other applied constraints.

### Pagination and no matches

- Display ten records per page and start on page 1. The supplied 49 records produce five pages, with nine records on the last page.
- For the supplied dataset, desktop/tablet show all five page numbers. Mobile retains first, last, and current pages, with nearby pages where space permits and non-interactive ellipses for gaps.
- Identify the current page accessibly; disable Previous on the first page and Next on the last page. Give arrow-only controls accessible names.
- Hide pagination for zero results or a result set that fits on one page.
- For no matches, replace rows with “No transactions found” while retaining usable search, category, and sort controls. Do not add a Clear filters action.
- An explicit page change brings the start of the transaction list into view and focuses its heading. Search submission, category changes, and sort changes retain focus with the control being used and do not force scrolling.

### Applied state and browser history

- Encode applied search, category, sort, and page in URL query parameters; omit defaults.
- Search submission and explicit category, sort, and page changes create browser-history entries when the applied state changes. Typing makes no URL or history updates.
- Refresh and Back/Forward restore the applied controls and matching results from the URL.
- Unknown category or sort values fall back to defaults. Invalid page numbers become page 1; valid but excessive page numbers clamp to the last available page. Empty results use page 1 with no pagination.
- Normalize invalid URL state without an error screen.
- The final submit-only behavior supersedes the early immediate-search and replace-history-while-typing proposal.

### Visual presentation, assets, and accessibility

- Follow the private desktop, tablet, and mobile designs for spacing, typography, colors, layout, and responsive transitions, while keeping dataset-driven content identical across viewports.
- Desktop/tablet display recipient/sender, category, transaction date, and amount as columns. Mobile uses compact rows with category beneath the name and date beneath the amount.
- Retain the existing USD formatting, explicit positive/negative signs, green positive amounts, and UTC-calendar-date conventions.
- Resolve all history avatars through production-safe local asset imports. Sender/recipient names repeat and must not be used as unique transaction identities.
- Reuse existing design tokens, shared controls, supplied local assets, and fonts. Create reusable Vue SVG icon components if needed; do not duplicate artwork or add remote icon dependencies.
- Mobile sort and category icons open the same single-select dropdown behavior as the larger controls, not a modal or separate filter screen. Only one menu is open at a time.
- Name mobile triggers “Sort transactions” and “Filter by category”. Preserve keyboard selection, Escape/outside-click dismissal, and focus return to the trigger. A non-default category receives a subtle active indication.
- Preserve accessible names, selected/current/disabled states, visible focus, access to full transaction information, and narrow-width usability without horizontal page scrolling.

## Testing Decisions

### Approved testing boundary and prior art

- The owner approved one primary testing boundary: the rendered app with its router. Extend the existing Overview screen-level pattern rather than defaulting to tests for individual internal helpers or presentational components.
- Use Vitest and Vue Test Utils with a real Vue Router instance and memory history for fast behavioral tests. Assert visible content, accessible controls/states, and URL/navigation outcomes rather than private state, component structure, Tailwind strings, or implementation snapshots.
- Use small controlled transaction datasets where needed to make edge cases explicit. Expected row orders must be independently stated, not calculated by copying production algorithms into tests.
- Prior art is the existing assembled Overview test suite, which mounts the app with memory-history routing and supplied or controlled demo records. Existing Chromium recent-transaction and layout checks provide prior art for real avatar loading, non-UTC date presentation, responsive geometry, and scrolling.
- Do not add separate tests for every SVG or wrapper. Exercise any new icon/control behavior through the rendered page; preserve useful existing shared-control tests.

### Fast rendered-app coverage

- Initial state: default controls, the expected first ten records, all-history reachability including July, and nine records on the fifth page for the supplied data.
- Search: typing changes only the draft; icon click and Enter each submit; surrounding whitespace and case are handled; category/amount values do not become alternate search fields; submitting empty text removes the search constraint.
- Draft/applied separation: after one search is applied and a different draft is typed, category and sort operations use the applied search. Refresh/history restoration replace the draft with the restored applied value.
- Categories: All Transactions plus all ten categories alphabetically, inclusion of non-budget categories, one active category, and combined name/category constraints for both matching and empty combinations.
- All six sorts: explicit expected orders, UTC calendar-day rather than timestamp ordering, same-day/repeated-name/equal-amount ties, and signed amount ordering.
- Pagination: expected records for numbered/Previous/Next navigation, reset after search/category/sort changes, correct current and disabled states, and hidden pagination for zero or one page.
- No matches: the exact empty-state message, usable browsing controls, no rows or pagination, and no Clear filters action.
- URL behavior: initialization from applied query state, omission of defaults, invalid category/sort/page normalization, excessive-page clamping, and consistency between URL, controls, and results.
- History: typing adds no entry; submitted search and explicit browsing changes can be revisited with Back/Forward; restored state discards an unsubmitted draft.
- Navigation and regressions: both entry links open the default Transactions view, active navigation follows the route, other unavailable destinations remain disabled, and Overview's preview order, dates, signed values, and financial summaries remain intact. Intentionally revise obsolete assertions requiring Transactions and View All to remain disabled.

### Targeted real-browser coverage

- Use focused Playwright/Chromium checks at desktop, tablet, and mobile reference widths plus representative narrow/intermediate widths. Do not turn every behavior into a broad viewport/browser matrix.
- Verify column versus compact-row layouts, readable content, no horizontal overflow, compact pagination, reachable first/last/current pages, and non-interactive ellipses.
- Verify mobile trigger accessible names and selected values, keyboard selection, Escape/outside-click dismissal, one-open-menu behavior, focus return, and the active-category indication.
- From the bottom of a page, verify Next brings the list heading into view and focuses it. Verify search/category/sort operations do not force scrolling or unexpectedly steal focus.
- Exercise one focused real refresh and browser Back/Forward journey to confirm controls, results, URL, and draft restoration beyond memory-history tests.
- Verify production-safe local avatar loading across the history and stable calendar-date presentation in a non-UTC browser timezone.
- Verify fixed navigation does not obscure the final rows, pagination, or focused controls. Do not use jsdom assertions as evidence that layout or scrolling actually works.

### Build and completion validation

- Run type-checking, linting, the relevant fast suite, and the production build before implementation completion.
- Verify route-level code splitting in production build output and use a focused production-browser check to confirm Transactions page code loads on first entry rather than the initial Overview visit.
- Compare presentation with the ignored private references. Keep private links, file keys, design screenshots, and reference-derived snapshots out of tracked tests, build artifacts intended for publication, and public reports. Runtime assets must be bundled local assets, not temporary design export URLs.
- Keep browser validation focused on browser-dependent risks; do not introduce comprehensive screenshot-regression infrastructure or an unnecessary multi-browser matrix.

## Out of Scope

- Creating, editing, or deleting transactions; clickable transaction rows or transaction detail views.
- Additional date, income/expense, or recurring-only filters; category multi-select.
- Immediate/debounced search, a Clear filters action, or a mobile filter modal/separate screen.
- Authentication, bank integrations, backend/API work, persistent browser storage, offline support, or a new financial/account model. URL restoration is required but does not imply these features.
- Implementing other destination pages or changing settled Overview financial behavior.
- A new UI framework, speculative data-service architecture, broad component catalog, full screenshot-regression system, or routine multi-browser test expansion.

## Further Notes

### Authoritative data and preserved decisions

- Data authority is the `transactions` array in `src/data/demo.json`. The current counts are 49 records and ten categories; these describe the supplied data, not permission to hardcode filtering or pagination outputs.
- The existing Overview specification remains authoritative for its ten-record preview order, independent balances, August 2024 budget calculations, and Recurring Bill summaries. This feature enables its Transactions link but does not reopen those decisions.
- The owner explicitly replaced initial immediate search with submit-only search and declined a Clear filters action. Those final decisions are authoritative.
- The owner approved the detailed rendered-app, targeted-browser, and build-validation testing plan before this specification was finalized. No application implementation is part of this specification-writing task.

### Private design references

- Private links and provenance are stored only in `.scratch/references.local.md`.
- Cached design screenshots are stored only in `.scratch/design.local/`. The earlier Overview-local references and screenshots have been consolidated into these shared locations and removed from their old locations.
- Transactions references are `transactions-desktop.png` (1440 × 1135), `transactions-tablet.png` (768 × 1227), and `transactions-mobile.png` (375 × 1120), all native-resolution exports verified from their PNG headers. They replace earlier downscaled previews.
- Consult cached references before fetching again. For a refresh, request a maximum dimension at least as large as the frame's longest edge to avoid default downscaling.
- The shared local references also cover Overview, Recurring Bills, and dropdown controls. They are Git-ignored and must be transferred separately when continuing in another checkout.
- Never commit or copy private design URLs, file keys, or screenshots into tracked documentation, source comments, issues, tests, or public PR descriptions. Local paths and frame dimensions may be documented without exposing the private sources.

## Comments

### Status reconciliation

- All four implementation issues are resolved with completed acceptance criteria. The current implementation includes both entry points, route-derived navigation, submitted name search, category filtering, all six stable sorts, URL-backed pagination, and combined refresh/history restoration.
- Fresh validation: `pnpm check` passes (lint, type-checking, 145 Vitest tests, 8 commit-hook tests, and production build). All 87 Chromium checks pass against the production preview, including Overview and Transactions regressions, responsive controls, focus/scroll behavior, and combined URL/history journeys.
- Changed the stale parent-spec status to `resolved`. This reconciliation uses implementation inspection, completed issue records, prior review/visual-validation evidence, and fresh automated checks; it does not claim a new private-reference visual review.
