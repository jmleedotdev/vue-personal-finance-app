# 05: Display the budget summary

**What to build:** The Overview budget chart and category legend, with spending calculated for the fixed August 2024 demo reporting period and a responsive arrangement that moves the legend below the chart on mobile.

**Blocked by:** 02 — Build the responsive app shell and balance summaries.

**Status:** resolved

- [x] Integrate the card into the responsive Overview using established styling and shared controls; consult the parent spec and private visual references.
- [x] Calculate spending from outgoing August 2024 transactions belonging to the configured budget categories. Exclude income, July expenses, and categories without a configured budget.
- [x] Keep the reporting period explicitly fixed to August 2024; today's date must not change the demo totals.
- [x] Produce category spending of Entertainment $15, Bills $150, Dining Out $133, and Personal Care $40, totaling $338.
- [x] Sum the configured limits to $975 and show $338 spent / $975 limit in the chart center, rather than hardcoding the calculated center totals.
- [x] Display the supplied category names, theme colors, and limits: Entertainment $50.00, Bills $750.00, Dining Out $75.00, and Personal Care $100.00.
- [x] Match the referenced chart presentation and responsive legend placement without introducing unrelated chart interactions. Use `@tanstack/charts` with its Vue adapter, as explicitly approved by the owner (overriding the original no-charting-dependency constraint for this ticket).
- [x] On segment hover, replace the large center spending amount and the smaller center limit with the hovered category's spending and limit (Entertainment: `$15` above `of $50 limit`). Restore both overall spending and limit when the pointer enters the hole, leaves the ring, or leaves the chart. Both the outer segment and lighter inner band respond. Do not add tooltips or selection; the owner reverted the percentage-tooltip request.
- [x] Keep the chart's information understandable through text, not color alone. Avoid clipping or horizontal page overflow at mobile and intermediate widths.
- [x] Cap the category legend at four initially visible entries (four rows on desktop/tablet, two rows of two on mobile), scrolling extra categories vertically without moving the chart or expanding the card. Make overflowing legends keyboard-focusable with accessible instructions; retain wheel and touch scrolling.
- [x] Represent the unimplemented Budgets detail destination as unavailable, with accessible explanation and no broken or misleading enabled link.
- [x] Add fast rendered-Overview tests proving fixed-period totals and limits, with controlled data/date cases sufficient to catch inclusion of income, another month, or an unbudgeted category.
- [x] Compare the desktop/tablet chart-and-legend arrangement and mobile legend-below-chart arrangement in a real browser. Do not treat jsdom as proof of geometry.
- [x] Focused tests, type-checking, and the production build pass; any imported visual assets are local and private design URLs remain out of tracked content.

**Scope boundary:** Do not implement the Budgets destination page, budget editing, additional reporting periods, persistent state, or recurring-bill cards.

## Comments

- Owner approved using `@tanstack/charts` after reviewing the package research. This is an explicit exception to the parent spec's dependency restriction. Owner subsequently confirmed that segment proportions must use configured budget limits (`maximum`), not category spending. Spending remains independently calculated for the center figures.
- Owner requested review before committing, then reviewed the completed implementation and explicitly approved committing it.
- Owner requested scrolling for more than four legend categories. A six-category rendered-Overview fixture verifies inclusion and accessible focus/instructions. Separate real-Chromium validation used an isolated temporary app copy with two extra categories (no change to the supplied source JSON), confirming four initial entries, keyboard/wheel/touch access, stable chart/card geometry, and no horizontal overflow at 1440, 768, 375, 320, and 1280px. The temporary copy was removed after validation.
- Owner requested chart extraction: `BudgetChart.vue` accepts prepared categories and a reporting-period label, and owns the TanStack geometry, decorative overlay, focus ring, reactive hover state, center values, and accessible chart label. `BudgetSummary.vue` retains fixed-period data preparation, card header, and legend. Existing screen/browser tests pass unchanged across the extraction.
- Owner subsequently requested category spending/limit text on segment hover. This explicitly extends the interaction scope: the large center amount shows category spending (e.g. `$15`) and the smaller line shows its limit (`of $50 limit`). Both overall values (`$338` and `of $975 limit`) return when no segment is hovered. This reflects the owner's clarification that both center values must change, not only the smaller line. Permanent category spending/limit text remains available to assistive technology. Owner subsequently requested, then reverted, percentage tooltips. The tooltip, percentage calculation, and percentage-only assistive text were removed; center-value hover behavior remains.
- Implementation complete and owner-reviewed. Validated after the scrollable-legend follow-up: 30 unit tests, 38 Chromium checks, type-check, production build, focused ESLint/Oxlint, and `git diff --check`. Hover tests cover all four categories at 1440, 1280, and 375px, both ring bands, and restoration over the hole and outside the chart. Browser chart/legend checks cover 1440, 768, 375, 320, 600, 900, and 1280px; desktop/tablet/mobile card screenshots were visually compared with the supplied references. Segment sizes reflect configured budget limits, as confirmed by the owner. Hover tests use limit-based mid-segment angles and expect Bills at the bottom of the ring.
- Production JavaScript grows from 125.22 kB / 47.07 kB gzip to 239.38 kB / 86.78 kB gzip after chart extraction and scrollable legend, including the decorative overlay and center-value hover, without tooltips (whole implementation delta, about 39.71 kB additional gzip).
- Two-axis review: Standards identified one implementation-coupled SVG-path-count assertion, which was removed; Spec found no issues. Final validation passed after the correction. The subsequent hover addition also passed both Standards and Spec reviews with no findings. The chart extraction and scrollable legend also passed both review axes without findings. Owner approved the final changes for commit.

### Final completion review

- Fixed-August budget calculations, limit-based chart segments, category spending/limit hover behavior, and the responsive scrollable legend are complete, including the documented owner-approved extensions.
- Reviewed against the parent spec and all ticket comments, including owner-approved scope revisions. The owner confirmed the implementations are good and approved completion during this session.
- Final integration validation: all 39 unit tests and all 42 Chromium browser tests pass; production build and type-check pass. Both whole-feature review findings (responsive-test selector and stale README descriptions) are fixed and validated.
- Status changed to `resolved`.
