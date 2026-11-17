# 02: Build the responsive app shell and balance summaries

**What to build:** A working Overview entry page with Figma-aligned desktop, tablet, and mobile navigation plus the supplied Current Balance, Income, and Expenses. This replaces the starter experience and provides the shared layout for the remaining Overview cards.

**Blocked by:** 01 — Establish shared styling and accessible controls.

**Status:** ready-for-agent

- [x] Consult the parent spec and its private design references; use the established theme, local typography, and shared controls.
- [x] Render a desktop sidebar, tablet bottom navigation with labels, and mobile icon navigation with accessible names, matching the supplied layouts.
- [x] Implement desktop menu minimization and restoration in memory, with appropriate supplied logo/icon assets and accessible control state.
- [x] Mark Overview as the active destination. Present Transactions, Budgets, Pots, and Recurring Bills as unavailable with accessible explanation, not broken links, invented pages, or silently ineffective enabled controls.
- [x] Show the demo's Current Balance $4,836.00, Income $3,814.25, and Expenses $1,700.50. Preserve these supplied summary values rather than deriving them from the transaction subset.
- [x] Match the responsive summary arrangement: stacked on mobile and side-by-side where the design and available width support it.
- [x] Provide a responsive content layout that can receive the remaining Overview cards without duplicating entire pages for different devices.
- [x] Keep bottom navigation clear of content and keyboard focus, including safe areas. Prevent horizontal page overflow at reference, intermediate, and narrow widths.
- [x] Replace the starter shell and home content; remove the example About page/route, unused counter store, unused starter branding, and irrelevant assertions where no longer needed.
- [x] Update generic browser metadata and relevant project documentation to describe the app and its actual validation commands. Preserve useful routing, formatting, linting, type-checking, and test infrastructure.
- [x] Add fast rendered-screen tests for balance values, active/unavailable navigation, and menu collapse/restore behavior, without testing internal component structure or class strings.
- [x] Replace or remove the obsolete starter Playwright assertion. Keep browser validation explicitly invoked and Chromium-focused rather than routinely running a three-browser matrix.
- [x] Verify the three responsive navigation modes and bottom-navigation clearance in a real browser. Focused tests, type-checking, and the production build pass.
- [x] Resolve supplied logos/icons as local production assets and keep private design URLs out of tracked content.

**Scope boundary:** Do not implement destination pages, persistence, offline infrastructure, authentication, or a speculative API/storage framework.

## Comments

### Implementation — reviewed and approved

- Replaced the starter shell with one responsive navigation structure: a 300px desktop sidebar at 1280px and above, an 88px in-memory minimized mode, labeled tablet bottom navigation from 768px, and named mobile icons below that width. Uses the supplied local logos and SVG artwork. After owner review, the five view icons render as Vue components with `currentColor` and Tailwind text colors instead of CSS masks; original paths and intrinsic dimensions are preserved, with no new dependency or `v-html`.
- Overview is active; unfinished destinations are native disabled buttons with accessible explanation. Added a skip-to-content link, named menu control with expanded state, safe-area-aware bottom spacing, and matching document scroll padding for keyboard focus.
- Added the independent supplied JSON balance summaries with consistent currency formatting. The Overview uses one responsive main content flow, ready for the separately scoped card tickets; no placeholder cards or destination pages were invented.
- Removed About, the counter store, unused starter branding/favicon, and the obsolete Playwright assertion. Updated browser metadata and README; retained useful tooling and routing. Browser validation is explicitly invoked and Chromium-only.
- Added three fast assembled-screen tests for balances, navigation state/explanation, and minimize/restore. Added focused Chromium checks at 1440, 1280, 900, 768, 600, 375, and 320px, including synthetic long content to verify final-content and keyboard-focus clearance before subsequent cards exist.
- Validation: 21 fast tests and 13 production-preview Chromium checks pass; type-check, production build, focused ESLint/Oxlint, formatting, and diff whitespace checks pass. Reviewed browser captures against the supplied reference layouts and inspected local asset/font resolution. Chromium was installed locally to enable these checks.
- Browser verification caught and corrected a shared-button display utility conflict that exposed the desktop-only menu control on smaller screens. Visual verification caught and corrected quoting of the bundled SVG CSS mask URL.
- Two-axis independent review: Standards — no findings; Spec — no findings. The parent additionally performed real-browser visual verification; reviewers did not independently reproduce the Figma comparison.
- Owner reviewed and explicitly approved committing the completed work.

### Owner review follow-ups

- Renamed navigation `destinations` to `views`.
- Converted the five view icons and minimize/restore icon to `Icon*.vue` components with `currentColor`, preserving supplied path geometry and intrinsic dimensions. No dependency, CSS mask, or `v-html` is needed; original source assets remain available.
- Added the shared buttons' 150ms ease-in-out color transition to the minimize/restore label and icon, with reduced-motion support.
- Owner reviewed these follow-ups and authorized the commit.
