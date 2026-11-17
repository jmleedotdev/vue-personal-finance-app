# 05: Display the budget summary

**What to build:** The Overview budget chart and category legend, with spending calculated for the fixed August 2024 demo reporting period and a responsive arrangement that moves the legend below the chart on mobile.

**Blocked by:** 02 — Build the responsive app shell and balance summaries.

**Status:** ready-for-agent

- [ ] Integrate the card into the responsive Overview using established styling and shared controls; consult the parent spec and private visual references.
- [ ] Calculate spending from outgoing August 2024 transactions belonging to the configured budget categories. Exclude income, July expenses, and categories without a configured budget.
- [ ] Keep the reporting period explicitly fixed to August 2024; today's date must not change the demo totals.
- [ ] Produce category spending of Entertainment $15, Bills $150, Dining Out $133, and Personal Care $40, totaling $338.
- [ ] Sum the configured limits to $975 and show $338 spent / $975 limit in the chart center, rather than hardcoding the calculated center totals.
- [ ] Display the supplied category names, theme colors, and limits: Entertainment $50.00, Bills $750.00, Dining Out $75.00, and Personal Care $100.00.
- [ ] Match the referenced chart presentation and responsive legend placement without introducing unrelated chart interactions or a charting dependency solely for this graphic.
- [ ] Keep the chart's information understandable through text, not color alone. Avoid clipping or horizontal page overflow at mobile and intermediate widths.
- [ ] Represent the unimplemented Budgets detail destination as unavailable, with accessible explanation and no broken or misleading enabled link.
- [ ] Add fast rendered-Overview tests proving fixed-period totals and limits, with controlled data/date cases sufficient to catch inclusion of income, another month, or an unbudgeted category.
- [ ] Compare the desktop/tablet chart-and-legend arrangement and mobile legend-below-chart arrangement in a real browser. Do not treat jsdom as proof of geometry.
- [ ] Focused tests, type-checking, and the production build pass; any imported visual assets are local and private design URLs remain out of tracked content.

**Scope boundary:** Do not implement the Budgets destination page, budget editing, additional reporting periods, persistent state, or recurring-bill cards.
