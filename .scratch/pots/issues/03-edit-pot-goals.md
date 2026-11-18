# 03: Edit pot goals from management menus

**What to build:** Open a pot's management menu and edit its name, target, or theme while retaining its savings, identity, and position. See changes immediately on Overview.

**Blocked by:** 02 — Create savings pots.

**Status:** ready-for-agent

- [x] Provide an accessible per-pot management menu and working Edit Pot action for the intended pot. Do not expose an enabled deletion action until deletion is implemented.
- [x] Reuse the metadata form established for creation, prefilled with saved name, target, and theme.
- [x] Apply trimmed 1–30-character names, case-insensitive uniqueness, positive safe-cent targets, and fixed pot-only theme uniqueness. Exclude the edited pot from name/theme conflicts so unchanged values remain valid.
- [x] Permit changing all metadata fields and lowering the target below current savings. Preserve saved money, Current Balance, Income, Expenses, transactions, logical identity, and list position.
- [x] Show actual savings and percentages above the revised target while capping visual progress at full.
- [x] Save changes to shared state and refresh Pots and Overview immediately; navigation retains edits while reload restores demo records.
- [x] Invalid edits remain open with inline explanations and no mutation or silent rounding; corrected input can be saved.
- [x] Close, Escape, and backdrop discard edits without a second warning. Reopening loads saved values rather than canceled drafts.
- [x] Keep menu and nested selector keyboard behavior consistent with Budgets, including Escape ordering, menu closure before dialog interaction, focus containment, and restoration.
- [x] Use rendered-app journeys to cover every editable field, unchanged name/theme, conflicts with other pots, invalid targets, reduced targets, retained money/order, cancellation, and Overview synchronization.
- [x] Verify production-browser menu/dialog focus, scrolling and narrow layouts, actual reload reset, and visual comparison of menu/Edit states against relevant private references.
- [x] Run normal fast checks and relevant browser checks; record results and limitations in comments.

## Comments

Published from the approved Pots spec and six-ticket breakdown. Creation genuinely gates this slice because Edit reuses its metadata-form contract.

Implemented menu-driven Edit Pot using the existing metadata form and modal/selector controls. The menu intentionally omits Delete Pot until ticket 06. Metadata updates preserve pot identity/order and all money/transaction state; names and themes exclude the current pot from conflicts. No new styling tokens or shared-control variants were needed. Menu follows established Budgets interaction behavior, using the shared tertiary BaseButton trigger and theme-backed shadow color rather than a new framework.

Validation: `pnpm check` passed (lint, type-check, full fast suite, production build). Focused rendered-app Pots tests: 10 passed. Build-first Chromium: `pnpm test:browser e2e/edit-pot.spec.ts e2e/create-pot.spec.ts e2e/pots.spec.ts` — 28 passed. Initial browser run exposed a stale browse assertion expecting management buttons to remain disabled; updated it to distinguish enabled management from disabled transfers, then reran successfully. Browser checks include focus containment/restoration, background isolation/scroll locking, nested Escape ordering, menu dismissal, all draft dismissal paths, unchanged metadata, every editable field, over-target capped fill, navigation synchronization and real reload reset.

Visual inspection compared production menu/Edit captures against cached native menu/Edit references and responsive foundations. The Edit panel follows the 560px desktop reference, shared typography/spacing, fields, swatches and Save action. Intentional differences: no deletion item yet; demo data/current pot colors retained; keyboard focus outlines visible. Checked desktop/tablet/mobile and narrow/short layouts (1440×900, 768×700, 375×600, 320×360, 900×320), scrollable selector, and reachable Save action. Captures remain in ignored `test-results/`; private references remain ignored. Chromium only; no cross-browser claim.

Independent review against starting HEAD `c56d895`: Spec — no issues found. Standards — two hard consistency findings fixed (shared BaseButton trigger and theme-backed shadow color), then independently confirmed with no new hard issues. One nonblocking duplication judgment remains: Pot/Budget menu dismissal/focus lifecycles are similar; shared-menu extraction is deferred to avoid broadening this slice. Final source passed `pnpm check` (205 app tests and 8 script/hook tests) and the full build-first `pnpm test:browser` suite (148 Chromium checks). Review follow-up covered the final control/style delta; this completion note adds no application changes.
