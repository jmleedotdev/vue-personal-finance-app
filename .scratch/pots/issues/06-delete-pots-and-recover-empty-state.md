# 06: Delete pots, return savings, and recover from empty state

**What to build:** Delete a pot through its management menu with explicit confirmation, return all its savings to Current Balance, and recover gracefully after deleting every pot.

**Blocked by:** 03 — Edit pot goals from management menus.

**Status:** resolved

- [x] Add Delete Pot to the existing management menu with accessible destructive treatment, opening confirmation for the intended pot after closing the menu.
- [x] Name the pot and explicitly state the saved amount that will return to Current Balance, including zero for an empty pot.
- [x] Confirmation returns all saved funds and removes the pot as one operation, exactly once. Use cent-safe arithmetic and reject unsafe resulting financial state rather than partially deleting or transferring.
- [x] Preserve Current Balance plus Total Saved, Income, Expenses, transaction history, budgets, and surviving pot order.
- [x] Release the deleted name and theme for reuse. Restore Add New Pot when deletion frees a previously exhausted palette.
- [x] Update Overview's Total Saved, entries, and Current Balance immediately with no stale summary help or removed records.
- [x] Cancel, Close, Escape, and backdrop leave both the pot and financial values unchanged. Maintain dialog containment/background isolation and restore focus to a sensible surviving control when deletion removes its trigger.
- [x] After all pots are deleted, display a useful creation invitation with a working Add flow; Overview shows zero Total Saved and no stale entries. Creating again starts at zero savings and does not alter returned funds.
- [x] Returning money makes it available to any implemented Add Money action, without making this ticket depend on transfer-dialog implementation. Keep disabled controls free of explanatory text.
- [x] Cover funded and empty deletion, explicit return copy, cancellation, exactly-once confirmation, conserved cents, name/theme release, palette recovery, deletion of the final pot, and successful recreation through rendered-app journeys.
- [x] Verify navigation retains deletion and returned balance while a fresh app instance restores demo finances. Use funded demo pots to test returns independently of Add Money and Withdraw.
- [x] Use production-built Chromium for destructive-menu and confirmation states, native focus after removal, responsive/short dialogs, empty-state layout, navigation, and actual reload restoring original pots and balance.
- [x] Compare relevant deletion and page states with private references, run normal fast checks and relevant browser checks, and record results or blocked checks in comments.

## Comments

Published from the approved Pots spec and six-ticket breakdown. This slice depends on the metadata/menu branch, not Add Money or Withdraw: funded demo pots independently exercise savings returns. Creation is a transitive prerequisite for palette recovery and empty-state recreation.

Implementation validation:

- Confirmed with the owner before tests: rendered-app journeys as the primary seam, focused public finance-store actions for unsafe/atomic monetary cases, and production-built Chromium for native behavior and layout. The public-store seam is an explicitly approved supplement to the spec’s app-boundary preference.
- Test-first funded deletion failed before implementation; final-pot recovery coverage also caught stale Overview scroll help. Financial deletion validates both inputs and the resulting cent-safe balance before returning savings and removing the identity; repeated confirmation cannot return money twice.
- `pnpm check` passed: non-fixing lint, type-check, 233 app tests, 8 hook integration tests, and production build. One pre-existing lint warning remains in `e2e/delete-budget.spec.ts` (`playwright/no-conditional-in-test`); no new warnings or errors.
- `pnpm test:browser` passed all 168 production-built Chromium checks, including eight new deletion checks. Coverage includes cancellation, keyboard menus, modal isolation/containment, native focus after removal, navigation, actual reload reset, responsive/short dialogs and empty states at 1440×900, 768×700, 375×600, 320×360, 600×480, and 900×320. Browser validation caught the last-card menu extending below the desktop viewport; opening now scrolls the whole menu into view. The existing Edit journey was updated for its two-item menu.
- Compared production captures with cached native-resolution deletion/menu and responsive Pots references; checked deletion metadata/design context through Figma MCP. Reused BaseModal, BaseButton destructive/tertiary variants, local close/ellipsis artwork, theme tokens, and utility-first styling. Confirmation intentionally adds the required returned amount, and Cancel retains the existing larger hit area. Empty-state layout has no supplied design frame; reviewed its invitation and navigation clearance directly without claiming reference parity. Default, hover, keyboard-focus, and disabled behavior checked; screenshots stay in ignored `test-results/`.
- Independent Standards and Spec reviews completed. Spec found no issues. Standards raised two non-blocking notes: the explicitly owner-approved store seam (retained) and duplicated monetary validation (consolidated into a shared local predicate). After that refactor, type-check, 28 focused financial tests, and 20 build-first deletion/Add Money/Withdraw Chromium checks passed. No private links, keys, or screenshots are included in tracked changes.
- Final delta reviews found no remaining Standards or Spec issues; both verdicts were OK. `pnpm check` passed again after the predicate extraction (233 app tests, 8 hook tests, lint/type-check/build).
- Implementation and validation are complete; the triage vocabulary has no completed-state label, so the readiness label is retained.


### Status reconciliation

- Changed the stale readiness status to `resolved`: implementation, checked acceptance criteria, and the existing independent review and visual-validation records confirm this slice is complete.
- Fresh full-project validation: `pnpm check` passes (233 app tests, 8 hook integration tests, lint, type-checking, and production build); `pnpm test:browser` passes all 168 production-built Chromium checks, including the completed Pots journeys and cross-feature regressions. One pre-existing `playwright/no-conditional-in-test` warning remains in `e2e/delete-budget.spec.ts`; there are no lint errors.
- `resolved` records completion, distinct from the five readiness/triage labels. Any earlier comment retaining a readiness label solely because the triage vocabulary lacks a completion label is superseded by this reconciliation.
- This reconciliation uses implementation inspection, existing review/visual-validation evidence, and fresh automated checks; it does not claim a new private-reference visual review.
