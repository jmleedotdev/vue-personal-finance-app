# 05: Withdraw money with live previews

**What to build:** Withdraw savings from a selected pot into Current Balance through a live-preview dialog, including withdrawing its full saved amount while keeping the goal.

**Blocked by:** 04 — Add Money with live previews.

**Status:** ready-for-agent

- [ ] Enable Withdraw for funded pots and disable it at zero savings, without explanatory text or disabled-reason descriptions.
- [ ] Reuse the transfer-dialog foundation from Add Money, keeping operation-specific limits, labels, and preview semantics clear.
- [ ] Open with a blank amount and persisted savings preview. Valid input previews the resulting saved amount, percentage, and segmented bar distinguishing retained savings and the proposed withdrawal.
- [ ] Allow exact-total withdrawal to zero without deleting the pot. Reject amounts above its savings rather than clamping, and cover withdrawals from already-over-target pots.
- [ ] Apply the same positive, finite, safe-cent, at-most-two-decimal input contract as Add Money. Blank/invalid input retains the saved-state preview; submission explains errors inline without mutation or dismissal.
- [ ] Confirmation revalidates current savings and transfers money exactly once from that pot to Current Balance, updating both together or neither with cent-safe arithmetic and safe resulting values.
- [ ] Preserve Current Balance plus Total Saved and leave Income, Expenses, transaction history, and budgets unchanged.
- [ ] Synchronize Pots and Overview immediately. Full withdrawal disables Withdraw; returning funds reenables Add Money when balance had been zero.
- [ ] Close, Escape, and backdrop discard unconfirmed drafts; reopening is fresh. Preserve shared modal focus, keyboard, background-isolation, and restoration behavior.
- [ ] Test valid cents, repeated cent transfers, exact-total withdrawal, overdraw rejection/correction, selected-pot isolation, preview-only behavior, cancellation, and repeated confirmation through rendered-app journeys.
- [ ] Exercise add/withdraw round trips and balance-exhaustion/recovery with explicit expected totals. Verify route retention and fresh-instance reset.
- [ ] Use production-built Chromium for withdrawal preview geometry, empty/disabled states, keyboard/focus behavior, narrow/short dialogs, and a transfer round trip followed by navigation and real reload restoring both pots and balance.
- [ ] Compare Withdraw states with private native-resolution references, run normal fast checks and relevant browser checks, and record results or blocked checks in comments.

## Comments

Published from the approved Pots spec and six-ticket breakdown. Add Money gates this slice because it establishes the shared transfer-dialog and financial transfer contract.
