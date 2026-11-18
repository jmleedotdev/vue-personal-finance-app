# 06: Delete pots, return savings, and recover from empty state

**What to build:** Delete a pot through its management menu with explicit confirmation, return all its savings to Current Balance, and recover gracefully after deleting every pot.

**Blocked by:** 03 — Edit pot goals from management menus.

**Status:** ready-for-agent

- [ ] Add Delete Pot to the existing management menu with accessible destructive treatment, opening confirmation for the intended pot after closing the menu.
- [ ] Name the pot and explicitly state the saved amount that will return to Current Balance, including zero for an empty pot.
- [ ] Confirmation returns all saved funds and removes the pot as one operation, exactly once. Use cent-safe arithmetic and reject unsafe resulting financial state rather than partially deleting or transferring.
- [ ] Preserve Current Balance plus Total Saved, Income, Expenses, transaction history, budgets, and surviving pot order.
- [ ] Release the deleted name and theme for reuse. Restore Add New Pot when deletion frees a previously exhausted palette.
- [ ] Update Overview's Total Saved, entries, and Current Balance immediately with no stale summary help or removed records.
- [ ] Cancel, Close, Escape, and backdrop leave both the pot and financial values unchanged. Maintain dialog containment/background isolation and restore focus to a sensible surviving control when deletion removes its trigger.
- [ ] After all pots are deleted, display a useful creation invitation with a working Add flow; Overview shows zero Total Saved and no stale entries. Creating again starts at zero savings and does not alter returned funds.
- [ ] Returning money makes it available to any implemented Add Money action, without making this ticket depend on transfer-dialog implementation. Keep disabled controls free of explanatory text.
- [ ] Cover funded and empty deletion, explicit return copy, cancellation, exactly-once confirmation, conserved cents, name/theme release, palette recovery, deletion of the final pot, and successful recreation through rendered-app journeys.
- [ ] Verify navigation retains deletion and returned balance while a fresh app instance restores demo finances. Use funded demo pots to test returns independently of Add Money and Withdraw.
- [ ] Use production-built Chromium for destructive-menu and confirmation states, native focus after removal, responsive/short dialogs, empty-state layout, navigation, and actual reload restoring original pots and balance.
- [ ] Compare relevant deletion and page states with private references, run normal fast checks and relevant browser checks, and record results or blocked checks in comments.

## Comments

Published from the approved Pots spec and six-ticket breakdown. This slice depends on the metadata/menu branch, not Add Money or Withdraw: funded demo pots independently exercise savings returns. Creation is a transitive prerequisite for palette recovery and empty-state recreation.
