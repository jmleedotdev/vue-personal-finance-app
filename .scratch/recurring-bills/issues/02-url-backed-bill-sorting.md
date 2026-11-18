# 02: Sort recurring bills with URL-restored state

**What to build:** Users can sort Recurring Bills using the same six labels as Transactions through an accessible desktop/tablet dropdown or mobile icon trigger. Applied sorting restores from direct links, reload, and browser history, while the two features retain their distinct date and amount semantics. Follow the parent Recurring Bills spec and the domain glossary.

**Blocked by:** 01: Open a responsive Recurring Bills page with calculated summaries.

**Status:** resolved

- [x] Before adding bill sorting, extract the existing reusable sort-option definitions for use by Transactions and Recurring Bills. Offer exactly Latest, Oldest, A to Z, Z to A, Highest, Lowest in that order. Do not introduce a generic browsing framework.
- [x] Keep feature-specific defaults and comparators separate. Recurring Bills defaults to Oldest, sorting ascending by current-reporting-month due date; Latest reverses that due-date order, not latest-payment order.
- [x] A to Z and Z to A compare bill payee names alphabetically. Highest and Lowest compare positive bill amounts, so a $100 obligation sorts above $10 under Highest regardless of negative transaction storage.
- [x] Preserve deterministic, stable ordering for ties. Sorting affects bill rows only, never reporting summaries, counts, or status classification.
- [x] Reuse the shared select control and local sort icon with the design's labeled desktop/tablet presentation and accessible icon-only mobile trigger. Both presentations operate the same option set and selection behavior, not a separate modal.
- [x] Derive the selected sort from the sort query parameter. Omit default Oldest from the URL; normalize unknown, malformed, repeated, or redundant values using existing Transactions query conventions. Preserve unrelated query parameters and any applied search.
- [x] Explicit sort changes create history entries when the applied state changes. Direct entry, reload, Back, and Forward restore the selected control and row order. Search and sort state remain independent from the Transactions page.
- [x] Sorting uses any applied search rather than an unsubmitted draft when search is present. Sort changes remove any page constraint in preparation for pagination; do not add pagination in this ticket.
- [x] Retain focus with the sort control and do not force scrolling after selection. Preserve keyboard operation, selected state, Escape/outside-click dismissal, and focus return to the trigger.
- [x] Add rendered-app-with-router tests with independently stated expected orders for all six sorts, due-date versus payment-date differences, stable ties, positive-magnitude ordering, default omission, normalization, and history restoration. If search has already landed, cover its composition with sorting and draft/applied separation.
- [x] Verify Transactions retains Latest as its default, UTC calendar-date sorting, signed-amount ordering, menu labels/order, and its existing URL/history behavior after extraction.
- [x] Use focused Chromium checks for desktop/mobile trigger behavior, focus and dropdown interaction states, responsive fit, and no scrolling side effects. Compare the changed control to the private reference without putting private content in tests or public artifacts.
- [x] Run focused tests and relevant Transactions/Overview regressions, type-checking, linting, and production build. The ticket can land before or after submitted search; it must preserve other query state without requiring that ticket's implementation.

## Comments

Implemented with shared sort options and feature-specific defaults/comparators. Search has not landed, so query preservation is covered; conditional search composition and draft/applied tests are deferred to that implementation. No pagination was added.

Validation: all 112 Vitest tests passed, including Transactions/Overview regressions; type-checking, linting, and production build passed. Per owner approval, browser coverage is one targeted Chromium smoke test across desktop, tablet, and mobile (1.6 seconds), covering responsive triggers, dropdown fit, keyboard focus, dismissal, and no forced scrolling. The changed control was visually compared with the private references; reference artifacts remain ignored.

Independent Standards and Spec reviews against baseline `3d9d46e` both returned no findings. Implementation commit: `565d806` (before this completion record).

### Status reconciliation

- Verified shared sort options, bill-specific comparators/default, URL state, and rendered-app/browser coverage in the current implementation. Subsequent search and pagination work now covers the previously conditional draft/applied-search composition and combined URL/history behavior. Current `pnpm check` passes and all 87 production-preview Chromium checks pass. All acceptance criteria are checked complete; changed stale `ready-for-agent` status to `resolved`.
- This reconciliation uses implementation inspection, existing review/visual-validation records, and fresh automated checks; it does not claim a new private-reference visual review.
