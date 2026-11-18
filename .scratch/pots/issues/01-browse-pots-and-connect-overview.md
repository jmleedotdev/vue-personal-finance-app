# 01: Browse Pots and connect Overview

**What to build:** Open a responsive Pots page from navigation or Overview and inspect the same savings goals and totals on both screens. Establish shared session ownership of pots and Current Balance while preserving the bundled initial finances.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Enable Pots navigation and Overview's See Details action, with route-based active navigation and no unrelated navigation changes.
- [x] Show bundled demo pots in their original order, with names, themes, saved amounts, targets, actual percentages, and progress bars. Detailed money retains cents; bars cap at full without hiding over-target values.
- [x] Follow supplied desktop, tablet, and mobile layouts, including narrow/intermediate widths, short viewports, and clearance from fixed navigation.
- [x] Establish stable pot identity and shared reactive pots and Current Balance consumed by Pots and Overview. Initialize from demo copies without mutating bundled records.
- [x] Preserve initial Current Balance: existing savings are already excluded and must not be deducted again. Income, Expenses, transaction records, and budget calculations remain unchanged.
- [x] Derive Total Saved from every pot, including those outside the visible Overview list; avoid summary help text that assumes a fixed pot count.
- [x] State ownership supports subsequent session mutations without page-local copies. No browser storage, backend, or API is introduced; a fresh instance/reload starts from demo finances.
- [x] Reuse shared controls, local assets, theme tokens, and typography. Do not expose nonfunctional enabled management or transfer actions before their implementing slices land.
- [x] Protect browsing and navigation through rendered-app tests with the real router and isolated state, following existing Budgets/Overview precedents. Include controlled zero-savings, exact-target, and over-target records.
- [x] Perform production-built Chromium responsive checks and native-resolution reference comparisons for the page. Verify production assets resolve; keep private references separate from tests and report blocked visual checks explicitly.
- [x] Run normal fast checks and relevant browser validation; record results and limitations in ticket comments.

## Comments

Published from the approved Pots spec and six-ticket breakdown. This ticket includes the small shared-state prefactor within a demoable browsing slice rather than creating a separate infrastructure ticket.

Implemented the browsing slice: `/pots`, route-active navigation, and Overview See Details now work. Cards preserve bundled order and finances, show cent-precise details and actual percentages, and cap bars at full. Explicit bundled pot IDs provide stable identity independent of editable names. A shared session-only Pinia store owns copied pots and Current Balance and derives Total Saved from all pots; initial Current Balance remains $4,836.00 and Total Saved $920. Income, Expenses, transaction records, and budget calculations are unchanged. Future creation, management, and transfer controls remain natively disabled; no mutation workflows or persistence were introduced.

Validation: `pnpm check` passed (198 app tests, 8 Git-hook integration tests, non-fixing lint, type checking, and production build). Lint has no errors and one pre-existing conditional-test warning in `e2e/delete-budget.spec.ts`. The initial rendered-app navigation test was observed failing before implementation, then passed; focused Pots/Overview tests and type checking were rerun during implementation. App tests use the real router and fresh Pinia instances, controlled zero/exact/over-target cent fixtures, source-copy independence, all-pot totals, route retention, and unchanged demo finances. Later financial mutation journeys remain the responsibility of tickets 02–06.

Production-built Chromium: the focused Pots/preview/Overview run passed 35 checks; the final full `pnpm test:browser` run passed all 134 checks. Coverage includes desktop/tablet/mobile and 320/600/900/1280px intermediate/narrow widths, 480px short viewports, original card order and detailed values, route-active state, keyboard entry/focus, hover/current appearance, disabled controls, menu minimization, Back/reload, independent preview scrolling/touch, no horizontal overflow, bottom-navigation clearance, fonts/images, and no failed asset responses.

Visually compared production captures against the original native-resolution cached desktop (1440×1125), tablet (768×1907), and mobile (375×1869) screenshots. Corrected tablet/mobile internal spacing after the first comparison and rechecked the resulting captures. Shared BaseButton variants, existing inline icons, theme tokens, and typography are reused; no style-block exceptions. Intentional differences: bundled Gift values/target, cent-precise targets, consistently rounded actual percentages, correct Add New Pot wording on mobile, and disabled future actions. Existing shell typography/navigation details are unchanged. No visual checks for this browsing slice are blocked; exact pixel parity is not claimed. Menu/dialog/transfer visual checks are deferred with their implementing tickets. Private references remain ignored and separate from automated tests; app captures stay in ignored `test-results/`.

Independent review against the pre-implementation baseline: Standards — no code findings; Spec — one documentation gap (missing ticket validation record), addressed by this completion note. Follow-up review verified this documentation delta and compared all three final native-size production captures with their references. Both axes finished with no outstanding findings; reviewers did not independently rerun tests. Exact pixel parity is not claimed.
