# 06: Display recurring-bill summaries

**What to build:** The Overview Recurring Bills card, calculating Paid Bills, Total Upcoming, and Due Soon from the supplied recurring payment history under the owner-confirmed rules in the parent spec.

**Blocked by:** 02 — Build the responsive app shell and balance summaries.

**Status:** ready-for-agent

- [x] Integrate the card into the responsive Overview using established styling and shared controls; consult the parent spec and private visual references.
- [x] Display Paid Bills $190.00, Total Upcoming $194.98, and Due Soon $59.98 with consistent two-decimal currency formatting.
- [x] Replace summary fixtures with calculations from the unmodified demo JSON; do not add invented records or summary fields.
- [x] Use 19 August 2024 as the explicit Reporting Date, comparing UTC calendar dates without time of day.
- [x] Group `recurring: true` transactions by exact payee name; use the latest payment on or before the Reporting Date for amount and Billing Day. Do not double-count historical records or use future payments. Positive recurring amounts violate the domain invariant rather than being silently excluded.
- [x] Count each bill once in Paid Bills when paid in the reporting month; otherwise count it in that month's Total Upcoming, including overdue bills. Exclude future months.
- [x] Include unpaid current-month bills due on or before Reporting Date + 7 days in Due Soon, including overdue bills, today, and the seventh day. Clamp due dates in shorter months without changing the established Billing Day.
- [x] Match the referenced row order, surfaces, accent colors, typography, spacing, and responsive card layout.
- [x] Represent the unimplemented Recurring Bills detail destination as unavailable, with accessible explanation and no broken or misleading enabled link.
- [x] Keep the card readable at narrow widths and ensure fixed bottom navigation does not obscure its final row.
- [x] Add fast rendered-Overview tests for calculated labels/amounts, deduplication, latest-payment selection, future-date exclusion, fixed Reporting Date, and overdue/seven-day boundaries, without class-string or internal-component assertions.
- [x] Verify the card visually at desktop, tablet, and mobile sizes. Focused tests, type-checking, and the production build pass.
- [x] Keep private design URLs out of tracked content.

## Comments

Initial fixture-based implementation passed validation. Owner subsequently confirmed replacing fixtures with calculations, superseding the original no-calculation scope. Monthly rules are recorded in the parent spec and glossary. Calculation update implemented, reviewed by the owner, and approved for commit. Validation: 39 tests in the full fast suite pass; the focused Overview suite also passes under America/Los_Angeles, with alternate system dates covered. Type-check, production build, targeted ESLint, formatting, and all four Chromium layout checks pass. The original demo JSON is unchanged. Standards review found no issues. The Spec review caught validation being skipped for future positive recurring payments; validation now runs before date exclusion, with passing rendered-Overview regression tests for both past and future invalid payments. Spec re-review confirmed no remaining findings. `design.local/` is reserved for fetched Figma screenshots, not app screenshots.

**Scope boundary:** This is independent of the budget-summary ticket. Do not build the Recurring Bills destination page, persistent state, or backend integration. Only the agreed monthly summary calculations are included.
