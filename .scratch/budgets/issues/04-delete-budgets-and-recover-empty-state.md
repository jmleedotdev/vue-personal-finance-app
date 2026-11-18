# 04: Delete budgets safely and recover from an empty list

**What to build:** A working Delete Budget action in the card menu, explicit confirmation that retains transactions, and complete recovery after deleting every Budget. Reuse the existing modal shell and shared budget ownership, following the parent Budgets Page and Budget Management spec.

**Blocked by:** 03 — Edit budgets from their card menus.

**Status:** ready-for-agent

- [ ] Each card menu offers Edit Budget and Delete Budget, with destructive treatment for deletion and the existing accessible menu interaction contract.
- [ ] Delete Budget closes the menu and opens a named confirmation for the intended category using the shared modal shell.
- [ ] Confirmation clearly states that only the Budget will be removed and transactions will not be deleted. Do not copy the reference's ambiguous all-data-removed wording.
- [ ] Provide an explicit destructive confirmation and No, Go Back cancellation, alongside accessible close, Escape, and backdrop cancellation.
- [ ] Canceling through any supported path leaves budgets and transactions unchanged, returns usable focus, and restores background interaction/scrolling.
- [ ] Confirmation removes only the selected Budget, preserves other budgets' relative order and all transaction records, and updates cards, Spending Summary, combined budgeted-category Spent, combined limits, and Overview immediately.
- [ ] Release the removed Budget's category and theme. Reenable Add New Budget when both a category and theme are available, including recovery from either exhaustion condition. Verify a newly added Budget can reuse the released assignments.
- [ ] Deletion cannot leave stale chart-hover details or references to a removed category.
- [ ] Restore focus to a sensible surviving control after the originating card disappears, such as Add New Budget when available; never leave focus on a removed menu item/card.
- [ ] Deleting the final Budget produces neutral charts with $0 spent against $0 limit, coherent zero totals on Overview, no invalid segments or browser errors, and a useful invitation and working Add action on Budgets.
- [ ] A user can add a Budget after deleting all budgets and see normal cards, calculated spending, summary, and chart return. Remaining demo transaction history stays available through Transactions.
- [ ] Deletions survive route navigation but not browser reload; a real reload restores bundled demo budgets without persistent storage.
- [ ] Cover confirmation identity/copy, all cancellation paths, removal of only the intended Budget, transaction retention, availability recovery, cross-page synchronization, focus outcomes, final deletion, and add-after-delete through rendered-app journeys with the real router.
- [ ] Perform focused browser checks for the confirmation's responsive layout, destructive/default/hover/focus states, actual focus after card removal, zero-chart stability, and reload reset. Preserve Add/Edit, chart-hover, Overview, and Transactions regressions.
- [ ] Validate the completed management journey across desktop/tablet/mobile, narrow/intermediate widths, and short viewports, including modal/dropdown reachability and bottom-navigation clearance. Run fast checks, type checking/build, lint, and relevant focused browser checks; report any blocked validation without claiming visual parity.
- [ ] Keep tests independent of private design references and store rendered artifacts only in configured test-output locations. No private URLs, screenshots, or reference-derived snapshots enter tracked/public material.

## Scope boundary

No undo, additional unsaved-change prompts, transaction deletion, backend, persistence, or pot management. This slice completes the four-ticket feature; it does not replace the per-slice validation required by earlier tickets.
