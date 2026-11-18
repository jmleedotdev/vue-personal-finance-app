# 04: Delete budgets safely and recover from an empty list

**What to build:** A working Delete Budget action in the card menu, explicit confirmation that retains transactions, and complete recovery after deleting every Budget. Reuse the existing modal shell and shared budget ownership, following the parent Budgets Page and Budget Management spec.

**Blocked by:** 03 — Edit budgets from their card menus.

**Status:** resolved

- [x] Each card menu offers Edit Budget and Delete Budget, with destructive treatment for deletion and the existing accessible menu interaction contract.
- [x] Delete Budget closes the menu and opens a named confirmation for the intended category using the shared modal shell.
- [x] Confirmation clearly states that only the Budget will be removed and transactions will not be deleted. Do not copy the reference's ambiguous all-data-removed wording.
- [x] Provide an explicit destructive confirmation and No, Go Back cancellation, alongside accessible close, Escape, and backdrop cancellation.
- [x] Canceling through any supported path leaves budgets and transactions unchanged, returns usable focus, and restores background interaction/scrolling.
- [x] Confirmation removes only the selected Budget, preserves other budgets' relative order and all transaction records, and updates cards, Spending Summary, combined budgeted-category Spent, combined limits, and Overview immediately.
- [x] Release the removed Budget's category and theme. Reenable Add New Budget when both a category and theme are available, including recovery from either exhaustion condition. Verify a newly added Budget can reuse the released assignments.
- [x] Deletion cannot leave stale chart-hover details or references to a removed category.
- [x] Restore focus to a sensible surviving control after the originating card disappears, such as Add New Budget when available; never leave focus on a removed menu item/card.
- [x] Deleting the final Budget produces neutral charts with $0 spent against $0 limit, coherent zero totals on Overview, no invalid segments or browser errors, and a useful invitation and working Add action on Budgets.
- [x] A user can add a Budget after deleting all budgets and see normal cards, calculated spending, summary, and chart return. Remaining demo transaction history stays available through Transactions.
- [x] Deletions survive route navigation but not browser reload; a real reload restores bundled demo budgets without persistent storage.
- [x] Cover confirmation identity/copy, all cancellation paths, removal of only the intended Budget, transaction retention, availability recovery, cross-page synchronization, focus outcomes, final deletion, and add-after-delete through rendered-app journeys with the real router.
- [x] Perform focused browser checks for the confirmation's responsive layout, destructive/default/hover/focus states, actual focus after card removal, zero-chart stability, and reload reset. Preserve Add/Edit, chart-hover, Overview, and Transactions regressions.
- [x] Validate the completed management journey across desktop/tablet/mobile, narrow/intermediate widths, and short viewports, including modal/dropdown reachability and bottom-navigation clearance. Run fast checks, type checking/build, lint, and relevant focused browser checks; report any blocked validation without claiming visual parity.
- [x] Keep tests independent of private design references and store rendered artifacts only in configured test-output locations. No private URLs, screenshots, or reference-derived snapshots enter tracked/public material.

## Scope boundary

No undo, additional unsaved-change prompts, transaction deletion, backend, persistence, or pot management. This slice completes the four-ticket feature; it does not replace the per-slice validation required by earlier tickets.

## Comments

Implemented and resolved. Card menus now offer destructive Delete Budget alongside Edit, with two-action keyboard navigation. Named confirmation reuses the shared modal and explicitly retains transaction history. Confirming removes only the selected Budget, preserves order, updates Budgets/Overview, releases category/theme assignments, and returns focus to a visible surviving control. Cancel, close, Escape, and backdrop leave saved data unchanged. Deleting every Budget shows neutral zero charts and an invitation to add; re-adding restores calculated spending. Session deletions survive navigation and reset on real reload.

Validation: `pnpm check` passed (195 app tests, 8 hook integration tests, type checking, production build, and non-fixing lint). Lint has no errors and one warning for viewport-dependent browser-test geometry. `pnpm test:browser --retries=0` passed all 120 Chromium tests, including 8 new Delete checks and existing Add/Edit, chart-hover, Overview, and Transactions regressions. Rendered-router tests cover all cancellation paths, exact deletion/order/totals, retained transactions, category/theme exhaustion recovery and reuse, zero state, focus, and add-after-delete. Browser checks cover desktop/tablet/mobile, 320px/narrow/intermediate widths and short viewports, menu/dialog reachability, post-deletion focus visibility, bottom-navigation clearance, zero-chart stability, and real reload reset.

Compared rendered menu/confirmation default, hover, and keyboard-focus captures with cached references at desktop, tablet, mobile, narrow and short sizes. Copy intentionally differs to state transaction retention. Shared controls/tokens are reused without styling exceptions. Artifacts remain in ignored `test-results/`; tests do not depend on private references, and no private artifacts entered tracked material. Validation was not blocked; exact pixel parity is not claimed.

Independent code review: Standards — no findings; Spec — no findings. Both reviewed the exact implementation and new tests from the pre-implementation baseline. This completion note records the results after review.
