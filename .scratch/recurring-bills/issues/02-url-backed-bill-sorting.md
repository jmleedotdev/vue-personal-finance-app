# 02: Sort recurring bills with URL-restored state

**What to build:** Users can sort Recurring Bills using the same six labels as Transactions through an accessible desktop/tablet dropdown or mobile icon trigger. Applied sorting restores from direct links, reload, and browser history, while the two features retain their distinct date and amount semantics. Follow the parent Recurring Bills spec and the domain glossary.

**Blocked by:** 01: Open a responsive Recurring Bills page with calculated summaries.

**Status:** ready-for-agent

- [ ] Before adding bill sorting, extract the existing reusable sort-option definitions for use by Transactions and Recurring Bills. Offer exactly Latest, Oldest, A to Z, Z to A, Highest, Lowest in that order. Do not introduce a generic browsing framework.
- [ ] Keep feature-specific defaults and comparators separate. Recurring Bills defaults to Oldest, sorting ascending by current-reporting-month due date; Latest reverses that due-date order, not latest-payment order.
- [ ] A to Z and Z to A compare bill payee names alphabetically. Highest and Lowest compare positive bill amounts, so a $100 obligation sorts above $10 under Highest regardless of negative transaction storage.
- [ ] Preserve deterministic, stable ordering for ties. Sorting affects bill rows only, never reporting summaries, counts, or status classification.
- [ ] Reuse the shared select control and local sort icon with the design's labeled desktop/tablet presentation and accessible icon-only mobile trigger. Both presentations operate the same option set and selection behavior, not a separate modal.
- [ ] Derive the selected sort from the sort query parameter. Omit default Oldest from the URL; normalize unknown, malformed, repeated, or redundant values using existing Transactions query conventions. Preserve unrelated query parameters and any applied search.
- [ ] Explicit sort changes create history entries when the applied state changes. Direct entry, reload, Back, and Forward restore the selected control and row order. Search and sort state remain independent from the Transactions page.
- [ ] Sorting uses any applied search rather than an unsubmitted draft when search is present. Sort changes remove any page constraint in preparation for pagination; do not add pagination in this ticket.
- [ ] Retain focus with the sort control and do not force scrolling after selection. Preserve keyboard operation, selected state, Escape/outside-click dismissal, and focus return to the trigger.
- [ ] Add rendered-app-with-router tests with independently stated expected orders for all six sorts, due-date versus payment-date differences, stable ties, positive-magnitude ordering, default omission, normalization, and history restoration. If search has already landed, cover its composition with sorting and draft/applied separation.
- [ ] Verify Transactions retains Latest as its default, UTC calendar-date sorting, signed-amount ordering, menu labels/order, and its existing URL/history behavior after extraction.
- [ ] Use focused Chromium checks for desktop/mobile trigger behavior, focus and dropdown interaction states, responsive fit, and no scrolling side effects. Compare the changed control to the private reference without putting private content in tests or public artifacts.
- [ ] Run focused tests and relevant Transactions/Overview regressions, type-checking, linting, and production build. The ticket can land before or after submitted search; it must preserve other query state without requiring that ticket's implementation.
