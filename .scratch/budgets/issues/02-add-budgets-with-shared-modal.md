# 02: Add budgets through an accessible shared modal

**What to build:** A working Add New Budget journey that appends a valid Budget and immediately updates Budgets and Overview. Introduce the reusable accessible modal shell and budget-specific form through this complete interaction, following the parent Budgets Page and Budget Management spec.

**Blocked by:** 01 — Browse budgets and drill into category transactions.

**Status:** ready-for-agent

- [ ] Add New Budget opens a fresh form with Budget Category, Maximum Spend, Theme, and Add Budget. Default to the first available category alphabetically and first unused theme in palette order; leave Maximum Spend blank.
- [ ] Offer existing transaction categories only, excluding budgeted categories. Do not allow category creation or duplicate budgets.
- [ ] Maximum Spend accepts finite positive USD amounts safely representable in cents with at most two decimal places. Reject blank, zero, negative, nonnumeric, nonfinite, excess-precision, and unsafe amounts without silently rounding invalid form input.
- [ ] Invalid submission retains the draft and dialog, shows accessible field errors, and leaves saved budget state unchanged. Correcting input permits successful submission.
- [ ] Use a fixed named design-evidenced theme palette in design order. Show swatches, keep themes used by other budgets visible but disabled with Already used text, and respect disabled choices in pointer and keyboard interactions. Pot themes do not reserve budget colors.
- [ ] Extend the existing shared select narrowly for required swatches and disabled-option behavior, preserving current Transactions and Recurring Bills consumers. Reuse shared buttons, inputs, theme tokens, and local icons; inspect relevant shared design definitions before introducing variants.
- [ ] Disable Add New Budget when either no unused category or no unused theme remains, with an associated explanation. Independently cover both exhaustion conditions using controlled data.
- [ ] Successful submission commits once, appends the Budget, closes the dialog, and updates cards, summary, chart, and Overview. Preserve existing order and bundled demo records.
- [ ] Added budgets survive navigation between Budgets and Overview but reset to demo budgets on reload or a fresh app instance; do not add storage or an API.
- [ ] Build a shared BaseModal for overlay, responsive panel, accessible heading/description, close, background isolation, focus containment, and restoration. Keep budget fields and validation in a separate form reusable for Edit; do not build a universal form framework or pot functionality.
- [ ] Close, Escape, and backdrop click discard unsaved changes without an extra confirmation. Inside-panel clicks do not dismiss. Reopening Add restores fresh defaults rather than a canceled draft.
- [ ] A nested selector consumes Escape to close its own popup before a further Escape dismisses the modal.
- [ ] Dialog opening sets intentional focus; Tab/Shift+Tab remain contained; background controls and scrolling are blocked while open and restored on dismissal. Return focus to the opener when usable, or a sensible surviving control if submission disables Add.
- [ ] Dialogs and expanded selectors fit narrow/short viewports with reachable fields, options, close, and submit actions, using internal scrolling as necessary without horizontal page overflow.
- [ ] Adding from the zero-budget state replaces the neutral chart/empty content with the new Budget and correct financial totals.
- [ ] Exercise the complete Add journey through the rendered app and real router, including defaults, invalid/corrected input, uniqueness, used themes, exhaustion, cancellation/reopening, zero-state recovery, navigation synchronization, and fresh-instance isolation. Preserve useful existing shared-control coverage without duplicating internal implementation tests.
- [ ] Verify actual browser focus containment/restoration, nested Escape handling, backdrop behavior, background scroll lock, short/mobile geometry, expanded selectors, and a navigation-then-real-reload reset journey. Compare modal/select reference states and run fast checks, type checking/build, lint, and relevant browser regressions; report blocked validation explicitly.

## Scope boundary

Do not expose inactive edit/delete actions. The modal shell is reusable, but pot dialogs and persistence remain out of scope.
