# Ticket 02 — Add budgets validation

## Scope

Add New Budget now opens a fresh budget form inside the reusable `BaseModal`. Budget fields and monetary validation stay in `BudgetForm`; the store owns available categories, budget-only theme reservations, exhaustion explanations, and guarded append operations. Added budgets update both routed destinations within one app session. Reload/new app instances restore the bundled demo budgets. Edit, delete, pots, and persistence remain out of scope.

The owner confirmed the testing seams: assembled rendered app with the real router and isolated state; production-built Chromium for browser-dependent behavior; focused shared-select public-contract coverage only for gaps.

## Checks

- `pnpm check`: passed non-fixing lint, normal type checking, all 177 Vitest tests, 8 Git-hook integration tests, and production build.
- `pnpm test:browser --retries=0`: all 105 Chromium tests passed, including existing Overview, Budgets/chart hover, Transactions, Recurring Bills, and shared-control browser regressions.
- After strengthening cancellation to change category and theme before dismissal, `pnpm test:browser e2e/add-budget.spec.ts --retries=0`: all 7 focused browser tests passed again.
- Targeted Budgets/shared-select runs and type checking were repeated throughout implementation. Red-to-green slices covered addition/synchronization, invalid/corrected amounts, category/theme availability, dynamic disabled options, and accepted decimal forms.
- `git diff --check` and staged whitespace checks passed. Private references remain ignored and are not test inputs or runtime assets.

## Behavioral evidence

Rendered-app tests cover default category/theme ordering, blank Maximum Spend, append order, independent financial expectations, updated summary/chart/Overview amounts, duplicate-submit protection, demo-record preservation, fresh-instance reset, invalid drafts and correction, visible disabled themes, independent category/theme exhaustion fixtures, and zero-budget recovery. A focused shared-select test covers an active option becoming disabled and all options becoming unavailable.

Production Chromium covers intentional initial focus, Tab/Shift+Tab containment, focus restoration on dismissal and when the final addition disables its opener, inert background controls, background scroll lock/restoration, selector-first Escape handling, close/Escape/backdrop draft discard, inside-panel clicks, fresh defaults after canceled category/theme/amount changes, associated validation errors, route synchronization, and a real browser reload reset. Dialog and expanded-selector checks run at 1440×900, 768×700, 375×600, 320×360, and 900×320.

## Visual and shared-control review

Inspected cached desktop/tablet/mobile page references and the Add/category/theme control references, plus the relevant shared Figma control definitions. Compared rendered Add and expanded selector captures at desktop, tablet, mobile, and short/narrow sizes. The modal retains the supplied responsive panel spacing, heading, local close/caret assets, currency prefix, shared inputs/buttons, named theme swatches, and Already used labels. Available category/theme defaults intentionally follow the spec rather than sample records. A popup opens upward when necessary to stay reachable, instead of being clipped by the scrolling modal panel.

All changed controls use existing shared foundations or narrow additions: `BaseInput` gets a leading slot; `BaseSelect` gains swatches, disabled options/text, nested Escape consumption, and viewport-aware modal popup positioning. Palette additions live in theme tokens. No component style-block exceptions were introduced. Existing browser regressions verify production local assets. No requested validation was blocked. Browser evidence is Chromium-only, not a cross-browser or assistive-technology certification.

## Review

Independent Standards and Spec reviews were run against exact diff artifacts from baseline `68dfa6996dbeb772d398e9c5d90730049b8474c4`, including new files. The first Standards pass found no documented-standard breaches and one Data Clumps judgement call: repeated budget submission types. This was addressed by one exported `BudgetInput` contract.

The first Spec pass found a precision-loss blocker near the safe-cent upper bound: a dollar-number conversion could multiply back to the original cents but display one cent lower. Added rendered-app rejection/correction coverage for precision-losing upper-bound values and acceptance coverage for a nearby representable value. Validation now requires the stored dollar amount and actual two-decimal USD presentation both to preserve the submitted cents; unsupported amounts remain invalid drafts rather than silently rounding.

Follow-up reviews covered the final implementation and the delta resolving these findings. Both reviewers returned **OK**, with no outstanding findings; they inspected code and diff artifacts without independently rerunning the checks.

### Standards

Original Data Clumps judgement call resolved by `BudgetInput`. No documented-standard breaches and no new smells found in the follow-up. **0 outstanding findings.**

### Spec

Original upper-bound precision blocker resolved by the displayed-cents guard and rejection/correction/nearby-acceptance regressions. No missing requirements or scope creep found in the follow-up. **0 outstanding findings.**
