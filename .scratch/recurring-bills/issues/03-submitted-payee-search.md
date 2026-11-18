# 03: Search recurring bills by submitted payee name

**What to build:** Users can find Recurring Bills by submitting a payee-name search while retaining full-month reporting summaries. Typing remains a draft; submitted searches and restored browser history determine the visible bill list. Follow the parent Recurring Bills spec and the domain glossary.

**Blocked by:** 01: Open a responsive Recurring Bills page with calculated summaries.

**Status:** resolved

- [x] Add a responsive search form using the shared input and button controls, matching the supplied Search bills field and magnifying-glass submit action. Give the input and submit button accessible names.
- [x] Search only the payee name using case-insensitive substring matching. Trim surrounding whitespace on submission; category, amount, date, and other fields are not alternate search targets.
- [x] Keep draft and applied search values separate. Typing must not change rows, summary amounts/counts, pagination state, URL state, or browser history. Do not add immediate or debounced search.
- [x] Enter and the search button both apply the trimmed search. Submitting an empty value restores the unfiltered bill list while retaining any selected sort.
- [x] Apply search to the distinct derived bill set, not individual payment-history records. Reporting cards continue to describe the entire reporting month's bills regardless of matches.
- [x] With no matching bills, replace bill rows with the exact message “No bills found,” retain usable search and any available sort controls, and keep full-month summaries visible. Do not add a Clear filters action.
- [x] Store applied search in the search query parameter and omit an empty search. Normalize malformed, repeated, empty, and whitespace values consistently with Transactions while preserving unrelated query parameters and any selected sort.
- [x] Explicit submission creates a history entry when applied state changes. Direct entry and reload restore applied search and results. Back/Forward restore the input from applied URL state and discard stale drafts.
- [x] Search submission removes any page constraint in preparation for pagination. If sorting has already landed, sort changes retain the applied search rather than applying the current draft; history restoration keeps both controls and results consistent.
- [x] Retain focus with the control used to submit and do not force scrolling. Preserve visible focus and narrow-width fit with the mobile sort trigger when present.
- [x] Add rendered-app-with-router tests for draft-only typing, both submit mechanisms, case/whitespace/partial matches, payee-only matching, empty submission, no matches, unchanged summaries, URL normalization, direct restoration, and Back/Forward draft replacement. If sorting has landed, verify combined state without depending on its private implementation.
- [x] Use focused real-browser checks for search submission focus, responsive form fit, and no forced scrolling. Preserve local-reference privacy and do not use private design material as test input.
- [x] Run focused tests, relevant regressions, type-checking, linting, and production build. This ticket can land before or after sorting; it must preserve other query state without requiring that ticket's implementation. Full combined browsing and page-reset validation is completed with pagination.

## Comments

Implemented on the current branch. Search uses a draft until form submission, normalizes applied URL state consistently with Transactions, preserves sort/unrelated query parameters, drops page constraints on submission, and retains full-month summaries. Added rendered-app/router coverage and focused Chromium checks for focus, scrolling, history restoration, and responsive fit at 1440, 768, 375, and 320px. Compared rendered layouts against cached responsive references without adding private material to tracked files.

Validation: 126 unit/rendered-app tests and 81 browser tests passed; lint, type-check, and production build passed. The four new browser checks also passed against the production preview. Existing bill-image loading assertion now polls for completed local images instead of racing network completion. Full combined pagination validation remains with the pagination ticket.

### Status reconciliation

- Verified draft-versus-applied payee search, URL normalization, preserved summaries/sort, and rendered-app/browser coverage. The resolved pagination ticket supplies combined search/sort/page and history restoration coverage, completing the follow-on validation noted above. Current `pnpm check` passes and all 87 production-preview Chromium checks pass. All acceptance criteria are checked complete; changed stale `ready-for-agent` status to `resolved`.
- This reconciliation uses implementation inspection, existing review/visual-validation records, and fresh automated checks; it does not claim a new private-reference visual review.
