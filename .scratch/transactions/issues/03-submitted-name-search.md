# 03: Find transactions with submitted name search

**What to build:** Users can compose a search draft, apply it through the magnifying-glass button or Enter, browse the matching transactions, and restore applied searches through URLs and browser history without typing changing results prematurely.

**Blocked by:** 02 — Browse the full history with URL-backed pagination.

**Status:** ready-for-agent

Specification: [Responsive Transactions Page](../spec.md). Use its approved rendered-app testing boundary and private-reference restrictions.

- [ ] Add a labeled search field and an accessible magnifying-glass submit button, styled consistently with the responsive references and existing foundations. Reuse supplied icons or create a reusable Vue SVG component if needed.
- [ ] Search only the sender/recipient `name` field with case-insensitive substring matching. Trim surrounding whitespace on submission; category and amount values are not alternate search fields.
- [ ] Maintain separate draft and applied search values. Typing alone changes neither rows, pagination, applied query state, nor browser history. Do not implement immediate or debounced search.
- [ ] Clicking the magnifying glass and pressing Enter each apply the trimmed search and return to page 1. A changed applied state creates a history entry; submitting an unchanged state need not add a duplicate entry.
- [ ] Submitting an empty search removes only the search constraint, preserving any available category and sort selections. Apply search before calculating pagination.
- [ ] Initialize applied search and the input from query state. Omit an empty applied search from the URL.
- [ ] Refresh and Back/Forward restore results and the applied field value from the URL, replacing an unsubmitted draft. Page links retain applied search, not a pending draft.
- [ ] Search submission retains focus with the control being used and does not force scrolling. Explicit paging retains ticket 02's heading-focus and scroll behavior.
- [ ] When no matches exist, replace rows with “No transactions found”, keep implemented browsing controls usable, and hide pagination. Do not add a Clear filters action.
- [ ] Matching result sets of at most ten records hide pagination; larger matching sets remain navigable through the existing page controls. Page counts/clamping reflect the matched set.
- [ ] Add rendered-app tests for both submission methods, typing without result/URL/history changes, case/whitespace/substring rules, name-only matching, clearing by empty submission, page resets, empty results, query initialization, and history restoring an applied value over a draft.
- [ ] Use controlled records where needed for multi-page matching results and explicit expectations; do not reproduce the search/pagination implementation in the tests.
- [ ] Extend focused real-browser coverage for search submission without unwanted scroll/focus movement, refresh, and Back/Forward restoration, keeping the suite narrow.
- [ ] Integrate with category/sort behavior when ticket 04 is present: those controls use the last applied search, never an unsubmitted draft; combined matching/empty results, resets, and URL restoration remain correct. Whichever of 03 and 04 lands second adds the combined rendered-app regression coverage and extends the focused history journey. Do not add skipped tests or invent a dependency on unfinished controls.
- [ ] Run relevant fast tests, type-checking, linting, and the production build; preserve prior navigation, pagination, route-loading, and Overview behavior.
- [ ] Keep private reference URLs, file keys, screenshots, and reference-derived snapshots out of tracked content and public reports.

## Scope boundary

Ticket 04 owns category and six-option sort controls. If it has not landed, complete and test this submitted-search slice against existing pagination without implementing those controls. No backend, persistence layer, additional search fields, or Clear filters action is included.
