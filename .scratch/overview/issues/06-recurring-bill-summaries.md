# 06: Display recurring-bill summaries

**What to build:** The Overview Recurring Bills card, showing the three agreed summary rows as explicitly identified demo fixtures without pretending the app already calculates billing schedules or payment state.

**Blocked by:** 02 — Build the responsive app shell and balance summaries.

**Status:** ready-for-agent

- [ ] Integrate the card into the responsive Overview using established styling and shared controls; consult the parent spec and private visual references.
- [ ] Display Paid Bills $190.00, Total Upcoming $194.98, and Due Soon $59.98 with consistent two-decimal currency formatting.
- [ ] Keep these figures in explicitly named demo fixtures separate from the original demo JSON; do not modify that JSON to add invented billing records or summary fields.
- [ ] Do not derive these summaries from assumptions about recurring transactions, due dates, payment reconciliation, or a due-soon window.
- [ ] Match the referenced row order, surfaces, accent colors, typography, spacing, and responsive card layout.
- [ ] Represent the unimplemented Recurring Bills detail destination as unavailable, with accessible explanation and no broken or misleading enabled link.
- [ ] Keep the card readable at narrow widths and ensure fixed bottom navigation does not obscure its final row.
- [ ] Add fast rendered-Overview tests for the three labels and fixture amounts, without asserting class strings or internal component structure.
- [ ] Verify the card visually at desktop, tablet, and mobile sizes. Focused tests, type-checking, and the production build pass.
- [ ] Keep private design URLs out of tracked content.

**Scope boundary:** This is independent of the budget-summary ticket. Do not build the Recurring Bills destination page, billing calculations, persistent state, or backend integration.
