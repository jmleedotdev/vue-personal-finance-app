# 04: Display recent transactions with local avatars

**What to build:** The Overview's recent-transactions card, presenting the five supplied preview entries with recognizable local imagery, readable dates, and clearly signed currency amounts across desktop, tablet, and mobile.

**Blocked by:** 02 — Build the responsive app shell and balance summaries.

**Status:** ready-for-agent

- [ ] Integrate the card into the responsive Overview using the established styling and shared controls; consult the parent spec and private visual references.
- [ ] Preserve the supplied preview sequence: Emma Richardson, Savory Bites Bistro, Daniel Carter, Sun Park, and Urban Services Hub. Do not reorder same-day entries by timestamp and unintentionally change the demonstrated preview.
- [ ] Display the respective signed amounts +$75.50, -$55.50, -$42.30, +$120.00, and -$65.00 with consistent two-decimal formatting.
- [ ] Show the demonstrated dates: 19 Aug 2024 for Emma and Savory Bites, 18 Aug 2024 for Daniel, and 17 Aug 2024 for Sun and Urban Services.
- [ ] Format demo calendar dates consistently without timezone-dependent day shifts.
- [ ] Resolve each supplied avatar to a non-empty local production asset. Do not rely on JSON-relative paths working unchanged in the browser or use temporary image URLs.
- [ ] Match responsive row spacing, separators, imagery, typography, and positive-amount styling while retaining readable amounts and names at narrow widths.
- [ ] Represent the unimplemented full Transactions destination as unavailable, with accessible explanation and no broken or misleading enabled link.
- [ ] Add fast rendered-Overview tests for the preview sequence, names, amounts/signs, and dates; test observable output rather than child-component internals.
- [ ] Verify avatar loading and row layout in the production build and visual review. Focused tests and type-checking pass.
- [ ] Keep private design URLs out of tracked content.

**Scope boundary:** Do not build the Transactions destination page, filtering, searching, pagination, editing, or persistence.
