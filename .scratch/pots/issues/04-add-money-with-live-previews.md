# 04: Add Money with live previews

**What to build:** Reserve available Current Balance in a selected pot through an Add Money dialog with a live projected savings preview, committing funds only on confirmation.

**Blocked by:** 01 — Browse Pots and connect Overview.

**Status:** ready-for-agent

- [ ] Enable each pot's Add Money action when Current Balance is positive. At zero balance disable it without explanatory text or disabled-reason descriptions.
- [ ] Open a labeled dialog for the selected pot with a blank amount and saved-state preview. Reuse shared modal/controls and establish a narrow transfer-dialog foundation suitable for Withdraw.
- [ ] For valid positive input within available Current Balance, preview the resulting saved amount, percentage, and segmented bar distinguishing existing savings from the addition.
- [ ] Permit saving above the target and show the actual projected percentage while capping visual geometry. Include near-zero, exact-target, and already-over-target cases.
- [ ] Blank or invalid input leaves the preview at persisted savings. Reject zero, negative, nonnumeric, nonfinite, unsafe, excess-precision, and over-balance input rather than rounding or clamping; explain errors inline on submission.
- [ ] Opening, typing, and previewing do not change any financial state. Close, Escape, or backdrop discard the draft; reopening starts fresh.
- [ ] Confirmation revalidates current shared state and transfers the amount exactly once from Current Balance into the pot, updating both together or neither. Exact-balance additions are allowed.
- [ ] Use cent-safe arithmetic and reject unsafe resulting values. Preserve Current Balance plus Total Saved and leave Income, Expenses, transaction records, and budgets unchanged.
- [ ] Confirmed transfers immediately update Pots and Overview, persist through navigation, and reset to demo finances on reload. A newly positive pot is compatible with the later Withdraw slice.
- [ ] Exercise visible transfer journeys through the real-router app seam, including repeated cent additions, excessive additions, correction, exact-balance exhaustion, over-target funding, selected-pot isolation, canceled previews, and repeated-confirmation protection.
- [ ] Assert explicit expected financial values and conserved totals rather than deriving expectations using production arithmetic or private store methods.
- [ ] Use production-built Chromium for native dialog focus/background isolation/dismissal, segmented preview rendering, disabled states, short/mobile layouts, navigation and real reload reset. Compare relevant Add Money states with native-resolution private references.
- [ ] Run normal fast checks and relevant browser checks; preserve existing features and record validation or blocked checks in comments.

## Comments

Published from the approved Pots spec and six-ticket breakdown. This slice depends only on browsing/shared financial ownership, not pot creation or metadata editing.
