# 03: Edit pot goals from management menus

**What to build:** Open a pot's management menu and edit its name, target, or theme while retaining its savings, identity, and position. See changes immediately on Overview.

**Blocked by:** 02 — Create savings pots.

**Status:** ready-for-agent

- [ ] Provide an accessible per-pot management menu and working Edit Pot action for the intended pot. Do not expose an enabled deletion action until deletion is implemented.
- [ ] Reuse the metadata form established for creation, prefilled with saved name, target, and theme.
- [ ] Apply trimmed 1–30-character names, case-insensitive uniqueness, positive safe-cent targets, and fixed pot-only theme uniqueness. Exclude the edited pot from name/theme conflicts so unchanged values remain valid.
- [ ] Permit changing all metadata fields and lowering the target below current savings. Preserve saved money, Current Balance, Income, Expenses, transactions, logical identity, and list position.
- [ ] Show actual savings and percentages above the revised target while capping visual progress at full.
- [ ] Save changes to shared state and refresh Pots and Overview immediately; navigation retains edits while reload restores demo records.
- [ ] Invalid edits remain open with inline explanations and no mutation or silent rounding; corrected input can be saved.
- [ ] Close, Escape, and backdrop discard edits without a second warning. Reopening loads saved values rather than canceled drafts.
- [ ] Keep menu and nested selector keyboard behavior consistent with Budgets, including Escape ordering, menu closure before dialog interaction, focus containment, and restoration.
- [ ] Use rendered-app journeys to cover every editable field, unchanged name/theme, conflicts with other pots, invalid targets, reduced targets, retained money/order, cancellation, and Overview synchronization.
- [ ] Verify production-browser menu/dialog focus, scrolling and narrow layouts, actual reload reset, and visual comparison of menu/Edit states against relevant private references.
- [ ] Run normal fast checks and relevant browser checks; record results and limitations in comments.

## Comments

Published from the approved Pots spec and six-ticket breakdown. Creation genuinely gates this slice because Edit reuses its metadata-form contract.
