# 02: Browse the full history with URL-backed pagination

**What to build:** Users can reach every transaction through ten-record pages, reopen a page URL, and revisit pages through browser history, with compact mobile navigation and deliberate focus/scroll behavior.

**Blocked by:** 01 — Open a responsive Transactions page.

**Status:** ready-for-agent

Specification: [Responsive Transactions Page](../spec.md). Extend the approved rendered-app testing boundary and retain the private-reference restrictions.

- [ ] Paginate the complete supplied history, including July records, in the existing default Latest order. Do not restrict it to Overview's reporting month or Reporting Date.
- [ ] Show ten records per page, starting on page 1. The supplied 49 records yield five pages and nine records on page 5; derive these results from the data rather than hardcoding them.
- [ ] Provide numbered pages, Previous, and Next. Identify the current page accessibly, disable boundary actions, and give arrow-only controls accessible names.
- [ ] Desktop/tablet show all five page numbers for the supplied history. Mobile retains first, last, and current pages with nearby pages where space permits and non-interactive ellipses for gaps.
- [ ] Store the applied page in query state, omit the page-1 default, and create browser-history entries for explicit page changes that change state.
- [ ] Initialize from the URL and restore page/results on refresh and Back/Forward. Invalid page numbers become page 1; valid excessive pages clamp to the last available page. Normalize without an error screen.
- [ ] Explicit page changes bring the transaction list's start into view and focus its heading. Preserve this distinction from future search/category/sort changes, which must not force scrolling or steal control focus.
- [ ] Hide pagination for zero results or one page, using small controlled datasets for coverage. Empty data uses page 1.
- [ ] Extend current page orchestration only as needed for this behavior; leave search/category/sort query handling to their owning tickets rather than building a speculative generic URL-state framework.
- [ ] Add rendered-app tests with real memory-history routing for expected page contents, numbered/Previous/Next actions, current/disabled states, default omission, valid and invalid URL initialization, excessive-page clamping, small/empty datasets, and Back/Forward restoration.
- [ ] Use focused Chromium checks for actual page-change scroll/focus, compact mobile pagination geometry, reachable first/last/current pages, and bottom-navigation clearance. jsdom is not evidence for real layout or scrolling.
- [ ] Verify real browser refresh and page-history navigation in a focused browser journey; extend that same journey as later search/filter/sort slices land rather than introducing redundant broad suites.
- [ ] Check production-safe avatar loading across the full history, including later pages and repeated sender/recipient names, without changing Overview's preview.
- [ ] Run relevant fast tests, type-checking, linting, and the production build; retain prior route, navigation, and Overview coverage.
- [ ] Keep all private design URLs, keys, screenshots, and reference-derived snapshots out of tracked content and public reports.

## Follow-on contract

Tickets 03 and 04 both extend this URL-backed rendered page. They are logically independent once this ticket is complete, but may edit shared code and require coordinated integration. Their constraints and sort must be applied before pagination, and changes to those applied controls reset to page 1. This ticket must not accidentally erase those behaviors when integrating subsequent changes.
