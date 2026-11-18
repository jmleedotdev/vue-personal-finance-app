# 01: Browse Pots and connect Overview

**What to build:** Open a responsive Pots page from navigation or Overview and inspect the same savings goals and totals on both screens. Establish shared session ownership of pots and Current Balance while preserving the bundled initial finances.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Enable Pots navigation and Overview's See Details action, with route-based active navigation and no unrelated navigation changes.
- [ ] Show bundled demo pots in their original order, with names, themes, saved amounts, targets, actual percentages, and progress bars. Detailed money retains cents; bars cap at full without hiding over-target values.
- [ ] Follow supplied desktop, tablet, and mobile layouts, including narrow/intermediate widths, short viewports, and clearance from fixed navigation.
- [ ] Establish stable pot identity and shared reactive pots and Current Balance consumed by Pots and Overview. Initialize from demo copies without mutating bundled records.
- [ ] Preserve initial Current Balance: existing savings are already excluded and must not be deducted again. Income, Expenses, transaction records, and budget calculations remain unchanged.
- [ ] Derive Total Saved from every pot, including those outside the visible Overview list; avoid summary help text that assumes a fixed pot count.
- [ ] State ownership supports subsequent session mutations without page-local copies. No browser storage, backend, or API is introduced; a fresh instance/reload starts from demo finances.
- [ ] Reuse shared controls, local assets, theme tokens, and typography. Do not expose nonfunctional enabled management or transfer actions before their implementing slices land.
- [ ] Protect browsing and navigation through rendered-app tests with the real router and isolated state, following existing Budgets/Overview precedents. Include controlled zero-savings, exact-target, and over-target records.
- [ ] Perform production-built Chromium responsive checks and native-resolution reference comparisons for the page. Verify production assets resolve; keep private references separate from tests and report blocked visual checks explicitly.
- [ ] Run normal fast checks and relevant browser validation; record results and limitations in ticket comments.

## Comments

Published from the approved Pots spec and six-ticket breakdown. This ticket includes the small shared-state prefactor within a demoable browsing slice rather than creating a separate infrastructure ticket.
