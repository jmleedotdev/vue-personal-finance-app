# 05: Withdraw money with live previews

**What to build:** Withdraw savings from a selected pot into Current Balance through a live-preview dialog, including withdrawing its full saved amount while keeping the goal.

**Blocked by:** 04 — Add Money with live previews.

**Status:** ready-for-agent

- [x] Enable Withdraw for funded pots and disable it at zero savings, without explanatory text or disabled-reason descriptions.
- [x] Reuse the transfer-dialog foundation from Add Money, keeping operation-specific limits, labels, and preview semantics clear.
- [x] Open with a blank amount and persisted savings preview. Valid input previews the resulting saved amount, percentage, and segmented bar distinguishing retained savings and the proposed withdrawal.
- [x] Allow exact-total withdrawal to zero without deleting the pot. Reject amounts above its savings rather than clamping, and cover withdrawals from already-over-target pots.
- [x] Apply the same positive, finite, safe-cent, at-most-two-decimal input contract as Add Money. Blank/invalid input retains the saved-state preview; submission explains errors inline without mutation or dismissal.
- [x] Confirmation revalidates current savings and transfers money exactly once from that pot to Current Balance, updating both together or neither with cent-safe arithmetic and safe resulting values.
- [x] Preserve Current Balance plus Total Saved and leave Income, Expenses, transaction history, and budgets unchanged.
- [x] Synchronize Pots and Overview immediately. Full withdrawal disables Withdraw; returning funds reenables Add Money when balance had been zero.
- [x] Close, Escape, and backdrop discard unconfirmed drafts; reopening is fresh. Preserve shared modal focus, keyboard, background-isolation, and restoration behavior.
- [x] Test valid cents, repeated cent transfers, exact-total withdrawal, overdraw rejection/correction, selected-pot isolation, preview-only behavior, cancellation, and repeated confirmation through rendered-app journeys.
- [x] Exercise add/withdraw round trips and balance-exhaustion/recovery with explicit expected totals. Verify route retention and fresh-instance reset.
- [x] Use production-built Chromium for withdrawal preview geometry, empty/disabled states, keyboard/focus behavior, narrow/short dialogs, and a transfer round trip followed by navigation and real reload restoring both pots and balance.
- [x] Compare Withdraw states with private native-resolution references, run normal fast checks and relevant browser checks, and record results or blocked checks in comments.

## Comments

Published from the approved Pots spec and six-ticket breakdown. Add Money gates this slice because it establishes the shared transfer-dialog and financial transfer contract.

Implementation validation:
- Reused the transfer form, modal, buttons, input, theme tokens, and session store. Operation-specific limits, labels, descriptions and red withdrawal segments distinguish Withdraw from Add Money; no styling exceptions or new shared-control variants.
- Rendered-app coverage exercises selected-pot cents, single confirmation, invalid/overdraw correction, exact-total emptying, cancellations, repeated cent withdrawals, balance exhaustion/recovery, round trips, route retention, fresh instances, unchanged budgets/history/Income/Expenses, and unsafe resulting balance rejection.
- `pnpm check` passed: lint (one existing delete-budget browser-test warning), type-check, 217 app tests, 8 hook tests, and production build.
- Build-first Chromium checks for Withdraw, Add Money and Pots passed (26 tests), including focus containment/restoration, background isolation, scroll locking, Escape/Close/backdrop, disabled controls, real reload, and 1440/768/375/320/900px layouts with short viewports.
- Visually inspected production captures against cached native-resolution Withdraw (560×458) and responsive Pots references. Shared control states, black retained/red withdrawal segments, zero/over-target states and narrow scrolling were checked. Approved differences: meaningful copy instead of placeholder text, truthful 6.95% for $139/$2,000 (reference percentage is inconsistent), detailed target cents and original demo data. No reference-access checks blocked. Captures remain in ignored test-results; private references remain ignored.
- Initial browser run exposed an incorrect test expectation (209.99/150 is 139.99%, not 140%); corrected the expected literal and reran successfully.
- Full production-built Chromium suite passed all 160 tests.
- Standards review: no documented violations; optional suggestions to rename funding-specific dialog state and share test setup. Renamed state to transferPotId/transferPot; kept the small isolated test setup local to avoid unrelated test-harness refactoring.
- Spec review found a lossy dollars-conversion edge at very large safe-integer cent balances. Added a failing rendered-app regression, then rejected results unless both dollar amounts round-trip to the exact computed cents. Regression and focused Add/Withdraw tests pass. Both independent final delta reviews approved with no remaining issues. Final `pnpm check` passed (217 app tests, 8 hook tests, type-check, lint, build), and the full build-first Chromium suite passed again (160 tests).
