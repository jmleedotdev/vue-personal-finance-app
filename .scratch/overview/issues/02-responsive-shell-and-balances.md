# 02: Build the responsive app shell and balance summaries

**What to build:** A working Overview entry page with Figma-aligned desktop, tablet, and mobile navigation plus the supplied Current Balance, Income, and Expenses. This replaces the starter experience and provides the shared layout for the remaining Overview cards.

**Blocked by:** 01 — Establish shared styling and accessible controls.

**Status:** ready-for-agent

- [ ] Consult the parent spec and its private design references; use the established theme, local typography, and shared controls.
- [ ] Render a desktop sidebar, tablet bottom navigation with labels, and mobile icon navigation with accessible names, matching the supplied layouts.
- [ ] Implement desktop menu minimization and restoration in memory, with appropriate supplied logo/icon assets and accessible control state.
- [ ] Mark Overview as the active destination. Present Transactions, Budgets, Pots, and Recurring Bills as unavailable with accessible explanation, not broken links, invented pages, or silently ineffective enabled controls.
- [ ] Show the demo's Current Balance $4,836.00, Income $3,814.25, and Expenses $1,700.50. Preserve these supplied summary values rather than deriving them from the transaction subset.
- [ ] Match the responsive summary arrangement: stacked on mobile and side-by-side where the design and available width support it.
- [ ] Provide a responsive content layout that can receive the remaining Overview cards without duplicating entire pages for different devices.
- [ ] Keep bottom navigation clear of content and keyboard focus, including safe areas. Prevent horizontal page overflow at reference, intermediate, and narrow widths.
- [ ] Replace the starter shell and home content; remove the example About page/route, unused counter store, unused starter branding, and irrelevant assertions where no longer needed.
- [ ] Update generic browser metadata and relevant project documentation to describe the app and its actual validation commands. Preserve useful routing, formatting, linting, type-checking, and test infrastructure.
- [ ] Add fast rendered-screen tests for balance values, active/unavailable navigation, and menu collapse/restore behavior, without testing internal component structure or class strings.
- [ ] Replace or remove the obsolete starter Playwright assertion. Keep browser validation explicitly invoked and Chromium-focused rather than routinely running a three-browser matrix.
- [ ] Verify the three responsive navigation modes and bottom-navigation clearance in a real browser. Focused tests, type-checking, and the production build pass.
- [ ] Resolve supplied logos/icons as local production assets and keep private design URLs out of tracked content.

**Scope boundary:** Do not implement destination pages, persistence, offline infrastructure, authentication, or a speculative API/storage framework.
