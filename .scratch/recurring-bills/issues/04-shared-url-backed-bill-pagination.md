# 04: Paginate matching bills using shared pagination

**What to build:** Users can browse searched and sorted Recurring Bills in pages of ten using familiar Transactions-style pagination. Paging, URL restoration, accessible focus/scroll behavior, and all browsing controls work together without changing full-month summaries or regressing Transactions. Follow the parent Recurring Bills spec and the domain glossary.

**Blocked by:** 02: Sort recurring bills with URL-restored state; 03: Search recurring bills by submitted payee name.

**Status:** ready-for-agent

- [ ] Before adding bill pagination, generalize the existing Transactions pagination component for reuse with feature-appropriate accessible navigation names. Preserve Transactions' visual design, interactions, and accessible naming; do not duplicate pagination markup or introduce a broader browsing framework.
- [ ] Derive distinct Recurring Bills, apply the submitted payee search, apply selected sorting, and only then take the requested page. Show at most ten matching distinct bills per page, never ten payment-history records.
- [ ] Start on page 1. Hide pagination for zero through ten matches, including exactly ten; display it from eleven matches onward. The unchanged supplied eight-bill dataset therefore has no visible pagination.
- [ ] Provide numbered pages, Previous, and Next with existing Transactions compact mobile behavior. Identify the current page accessibly, disable Previous on page 1 and Next on the final page, give arrow-only controls accessible names, and keep ellipses non-interactive.
- [ ] Derive result counts and page counts from matching bills. All matching bills remain reachable, and the final page contains only remaining records without duplication or omission.
- [ ] Keep full-month summary cards unchanged during searching, sorting, and paging. Page changes use the applied search rather than an unsubmitted draft and retain selected sort.
- [ ] Search submission and sort changes reset to page 1. Verify these resets through the real combined controls rather than only checking query parameters.
- [ ] Store the page in the page query parameter and omit page 1. Direct links, reload, Back, and Forward restore search, sort, page, input, selected control, and visible rows consistently.
- [ ] Normalize invalid or malformed pages to page 1; clamp valid excessive pages to the final available page. Normalize repeated query values consistently with Transactions. Empty results use page 1 with no pagination; preserve unrelated query parameters and omit default search/sort/page values.
- [ ] Explicit paging creates history entries when the applied state changes. Typing remains history-free. Browser restoration discards stale drafts in favor of the restored applied search.
- [ ] On a successful explicit page change, focus the page heading and bring it into view from the bottom of the previous page. Search and sort changes retain focus with their controls and do not force scrolling.
- [ ] Add rendered-app-with-router tests using controlled histories with more than ten distinct recurring payees. Cover all navigation controls, final partial pages, applied search plus sort before slicing, reset behavior, query normalization, direct restoration, history, and no-results recovery. Independently state expected row order; do not alter production demo data or reuse the production calculation to generate expectations.
- [ ] Explicitly test zero, fewer than ten, exactly ten, and eleven matching bills to protect the pagination visibility threshold, with accurate current and disabled states when pagination is visible.
- [ ] Verify Transactions retains its existing pagination, searching, sorting, signed amounts, history restoration, and page-change behavior after component generalization. Preserve Overview financial and navigation regressions.
- [ ] Use focused Chromium checks with controlled larger datasets for compact pagination, reachable first/last/current pages, heading focus and actual scrolling, and clearance of final rows, pagination, and focused controls from fixed navigation. Do not use jsdom as proof of geometry or scrolling.
- [ ] Complete a focused real reload and Back/Forward journey combining submitted search, sorting, page changes, and draft restoration. Verify search/sort actions do not force scrolling or steal focus unexpectedly.
- [ ] Complete visual comparison at desktop, tablet, mobile, and representative narrow/intermediate widths, including the larger-data pagination state absent from the supplied designs. Verify production-safe local assets and non-UTC date presentation. Keep fixtures and browser artifacts separate from private reference locations and keep tests independent of private screenshots/links.
- [ ] Run the relevant full fast regression suite, type-checking, linting, production build, and focused browser checks for the completed feature. Do not introduce a comprehensive screenshot-regression system or multi-browser matrix.
