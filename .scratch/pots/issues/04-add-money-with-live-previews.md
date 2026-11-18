# 04: Add Money with live previews

**What to build:** Reserve available Current Balance in a selected pot through an Add Money dialog with a live projected savings preview, committing funds only on confirmation.

**Blocked by:** 01 — Browse Pots and connect Overview.

**Status:** ready-for-agent

- [x] Enable each pot's Add Money action when Current Balance is positive. At zero balance disable it without explanatory text or disabled-reason descriptions.
- [x] Open a labeled dialog for the selected pot with a blank amount and saved-state preview. Reuse shared modal/controls and establish a narrow transfer-dialog foundation suitable for Withdraw.
- [x] For valid positive input within available Current Balance, preview the resulting saved amount, percentage, and segmented bar distinguishing existing savings from the addition.
- [x] Permit saving above the target and show the actual projected percentage while capping visual geometry. Include near-zero, exact-target, and already-over-target cases.
- [x] Blank or invalid input leaves the preview at persisted savings. Reject zero, negative, nonnumeric, nonfinite, unsafe, excess-precision, and over-balance input rather than rounding or clamping; explain errors inline on submission.
- [x] Opening, typing, and previewing do not change any financial state. Close, Escape, or backdrop discard the draft; reopening starts fresh.
- [x] Confirmation revalidates current shared state and transfers the amount exactly once from Current Balance into the pot, updating both together or neither. Exact-balance additions are allowed.
- [x] Use cent-safe arithmetic and reject unsafe resulting values. Preserve Current Balance plus Total Saved and leave Income, Expenses, transaction records, and budgets unchanged.
- [x] Confirmed transfers immediately update Pots and Overview, persist through navigation, and reset to demo finances on reload. A newly positive pot is compatible with the later Withdraw slice.
- [x] Exercise visible transfer journeys through the real-router app seam, including repeated cent additions, excessive additions, correction, exact-balance exhaustion, over-target funding, selected-pot isolation, canceled previews, and repeated-confirmation protection.
- [x] Assert explicit expected financial values and conserved totals rather than deriving expectations using production arithmetic or private store methods.
- [x] Use production-built Chromium for native dialog focus/background isolation/dismissal, segmented preview rendering, disabled states, short/mobile layouts, navigation and real reload reset. Compare relevant Add Money states with native-resolution private references.
- [x] Run normal fast checks and relevant browser checks; preserve existing features and record validation or blocked checks in comments.

## Comments

Published from the approved Pots spec and six-ticket breakdown. This slice depends only on browsing/shared financial ownership, not pot creation or metadata editing.

Implementation validation:
- Added the shared-shell transfer form with draft-only segmented previews, live-state confirmation validation, cent-safe transfers, duplicate-submit protection, and zero-balance disabled Add Money actions. Withdraw remains a later slice.
- Real-router app tests cover selected-pot isolation, explicit financial values/conserved totals, repeated cent additions, invalid and excessive inputs/correction, exact-balance exhaustion, fresh drafts/dismissal, over-target savings, unsafe results, Overview/navigation/fresh-instance reset, and unchanged transaction/budget browsing.
- `pnpm check` passed: lint (one pre-existing warning in `e2e/delete-budget.spec.ts`), type-check, 211 app tests, 8 hook tests, and production build.
- `pnpm test:browser e2e/add-money.spec.ts e2e/pots.spec.ts e2e/edit-pot.spec.ts` passed all 27 Chromium checks, including real reload, focus isolation/containment/restoration, scroll lock/dismissal, disabled actions, preview segments, desktop/tablet/mobile and short layouts down to 320×360.
- Compared rendered desktop/mobile Add Money previews against the cached native-resolution Add Money reference and responsive page references. Reused BaseModal/BaseInput/BaseButton, theme tokens and local close icon; no styling exceptions. Kept truthful demo savings/segments and visible target cents; replaced reference placeholder description with task-specific copy. Short dialogs scroll internally to keep confirmation reachable. Captures stay under ignored `test-results/`; private references remain ignored.
- Initial browser runs exposed an overly exact floating-point percentage assertion and legacy tests expecting Add Money disabled; updated those expectations. A timed-out legacy run left its preview process listening, which was stopped before the clean successful build-first run. No browser checks remain blocked.
- Full final regression validation after review fixes: `pnpm check` passed again (211 app tests, 8 hook tests, lint/type-check/build); `pnpm test:browser` passed all 154 production Chromium checks. Review follow-up also checked already-over-target additions and capped geometry at all five transfer viewports.
- Independent Standards and Spec reviews completed. Initial notes about positional test controls and missing already-over-target transfer coverage were addressed; both reviewers rechecked the test-only delta and reported no remaining findings. Implementation and validation are complete; the triage vocabulary has no completed-state label, so the readiness label is retained.
