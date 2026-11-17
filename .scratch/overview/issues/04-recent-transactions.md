# 04: Display recent transactions with local avatars

**What to build:** The Overview's recent-transactions card, presenting the five supplied preview entries with recognizable local imagery, readable dates, and clearly signed currency amounts across desktop, tablet, and mobile.

**Blocked by:** 02 — Build the responsive app shell and balance summaries.

**Status:** resolved

- [x] Integrate the card into the responsive Overview using the established styling and shared controls; consult the parent spec and private visual references.
- [x] Preserve the supplied preview sequence: Emma Richardson, Savory Bites Bistro, Daniel Carter, Sun Park, and Urban Services Hub. Do not reorder same-day entries by timestamp and unintentionally change the demonstrated preview.
- [x] Display the respective signed amounts +$75.50, -$55.50, -$42.30, +$120.00, and -$65.00 with consistent two-decimal formatting.
- [x] Show the demonstrated dates: 19 Aug 2024 for Emma and Savory Bites, 18 Aug 2024 for Daniel, and 17 Aug 2024 for Sun and Urban Services.
- [x] Format demo calendar dates consistently without timezone-dependent day shifts.
- [x] Resolve each supplied avatar to a non-empty local production asset. Do not rely on JSON-relative paths working unchanged in the browser or use temporary image URLs.
- [x] Match responsive row spacing, separators, imagery, typography, and positive-amount styling while retaining readable amounts and names at narrow widths.
- [x] Represent the unimplemented full Transactions destination as unavailable, with accessible explanation and no broken or misleading enabled link.
- [x] Add fast rendered-Overview tests for the preview sequence, names, amounts/signs, and dates; test observable output rather than child-component internals.
- [x] Verify avatar loading and row layout in the production build and visual review. Focused tests and type-checking pass.
- [x] Keep private design URLs out of tracked content.

**Scope boundary:** Do not build the Transactions destination page, filtering, searching, pagination, editing, or persistence.

## Comments

### Owner revision: scrollable ten-entry preview

The owner requested that the Transactions list be scrollable and contain ten transactions. This supersedes the five-entry limit above and in the parent spec. Preserve the first ten records in supplied dataset order, keeping the original five first. Keep the card header outside a keyboard-focusable, named vertical scroll region with approximately five rows visible at a time. Resolve local avatars and format signed amounts and calendar dates for all ten entries; verify scrolling to the tenth entry in a real browser.

### Final completion review

- The owner-approved ten-entry revision is complete: the first ten supplied records retain dataset order, with the original five first. The named, keyboard-focusable preview scrolls independently beneath its header; local avatars, signed amounts, UTC calendar dates, responsive rows, and scrolling to the tenth entry are covered by rendered-screen and Chromium tests.
- Reviewed against the parent spec and all ticket comments, including owner-approved scope revisions. The owner confirmed the implementations are good and approved completion during this session.
- Final integration validation: all 39 unit tests and all 42 Chromium browser tests pass; production build and type-check pass. Both whole-feature review findings (responsive-test selector and stale README descriptions) are fixed and validated.
- Status changed to `resolved`.
