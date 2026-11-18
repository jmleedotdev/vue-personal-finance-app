# 03: Edit budgets from their card menus

**What to build:** A working card kebab menu and Edit Budget journey that reuses the existing budget form and modal, preserves Budget identity and position, and synchronizes updated spending across Budgets and Overview. Follow the parent Budgets Page and Budget Management spec.

**Blocked by:** 02 — Add budgets through an accessible shared modal.

**Status:** ready-for-agent

- [ ] Each Budget card exposes an accessibly named kebab trigger identifying its Budget and a working Edit Budget action. The card owns local menu interaction and emits the edit request; the page coordinates its dialog and shared mutation.
- [ ] Support keyboard opening, action navigation/selection, Escape, outside dismissal, visible focus, and sensible focus restoration. Close the menu before opening a dialog so no interactive popup remains behind it.
- [ ] Edit Budget uses the same budget-specific form and modal shell as Add, with an Edit Budget heading and Save Changes action.
- [ ] Preload saved category, Maximum Spend, and theme. The current category/theme remain selectable while assignments belonging to other budgets are unavailable; categories retain alphabetical order and themes retain palette order.
- [ ] Preserve Add's amount validation and accessible errors for Edit. Failed submission retains the draft without changing saved data, and unchanged valid values can be saved.
- [ ] Saving category, amount, or theme updates the same logical Budget in its existing position. Do not implement category changes as deletion/readdition that moves the card.
- [ ] A category change recalculates monthly Spent, Remaining, progress, and all-month Latest Spending from matching transactions without modifying or reassigning any transactions.
- [ ] Updates immediately reach the card, summary, chart totals/colors, theme/category availability, and Overview. Released assignments become available for later additions.
- [ ] Chart updates cannot leave stale hovered-category spending or limits; leaving a segment still restores correct combined totals.
- [ ] Close, Escape, and backdrop cancellation retain saved values; reopening Edit reloads saved state rather than a canceled draft. Clicking inside the panel does not dismiss it.
- [ ] Preserve modal focus containment, background isolation, nested dropdown Escape ordering, and focus return to the appropriate surviving card trigger after save/cancel.
- [ ] Edited budgets survive route changes but reset on reload, retaining the existing demo-only persistence boundary.
- [ ] Cover the card menu and full Edit journey through the rendered app with real routing: prefill, current/other assignments, validation, category recalculation, position preservation, canceled drafts, availability updates, transaction preservation, and Overview synchronization. Keep Add and Transactions regressions green.
- [ ] Perform focused browser checks for menu positioning and keyboard use, menu-to-dialog focus, responsive Edit/selector states, cancel/save focus restoration, and chart behavior after edits. Compare relevant references and run fast checks, type checking/build, lint, and focused browser checks; disclose any blocked visual validation.

## Scope boundary

The menu offers Edit Budget in this slice. Delete Budget is added as a working action in ticket 04, not as an inactive placeholder. Do not introduce transaction editing or persistent storage.
