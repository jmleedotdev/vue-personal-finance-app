# 01: Open a responsive Transactions page

**What to build:** Users can open a lazy-loaded, read-only Transactions page from app navigation or Overview's View All and see the first ten records in the default Latest order, presented faithfully across desktop, tablet, and mobile.

**Blocked by:** None (can start immediately).

**Status:** resolved

Specification: [Responsive Transactions Page](../spec.md). Read its approved testing decisions and private-reference instructions before implementation.

- [x] Add the `/transactions` route with a route-level dynamic import. Both the Transactions navigation item and Overview's Transactions View All link open the default route.
- [x] Separate navigation availability from route-derived active state as part of this slice. Overview and Transactions identify the current route correctly; all other unfinished destinations remain unavailable.
- [x] Render the first ten transactions from the supplied demo history in Latest order: descending UTC calendar dates, preserving supplied order within the same day. Do not reorder same-day records by timestamp.
- [x] The demo transactions, not illustrative design records, determine names, categories, dates, avatars, and amounts at every viewport size. Do not modify the source dataset.
- [x] Show recipient/sender, category, date, and amount as desktop/tablet columns. On mobile, show category under the name and date under the amount, following the private visual references.
- [x] Retain USD formatting, positive/negative signs, green positive amounts, and UTC calendar dates even in a non-UTC viewer timezone.
- [x] Resolve local avatars through production-safe imports covering the full history, not only the Overview preview. Repeated names are not treated as unique transaction identities.
- [x] Reuse existing visual tokens, shared controls, local icons, and fonts. Create reusable Vue SVG icon components if needed without rewriting supplied artwork or adding remote assets.
- [x] Preserve sidebar minimization, skip-link access, visible focus, safe-area spacing, and fixed-bottom-navigation clearance. Rows are non-clickable; no transaction-management features are introduced.
- [x] Do not expose unimplemented search, category, sort, or pagination controls as enabled. Later tickets add their complete behavior.
- [x] Retain Overview's first-ten-record preview order, scroll behavior, independent balances, reporting period, and financial summaries. Update obsolete tests requiring Transactions and View All to be disabled.
- [x] Add Vitest/Vue Test Utils coverage at the rendered-app boundary with real routing for both entry links, active navigation, expected initial records, amounts/dates, and Overview regressions. Do not test private component structure or Tailwind strings.
- [x] Use focused Chromium checks for desktop/tablet/mobile presentation, representative narrow/intermediate widths, local avatar loading, non-UTC date presentation, overflow, and navigation clearance. Compare with local references without committing design images.
- [x] Verify route splitting in production build output and a focused production-browser check that Transactions page code loads on first entry rather than initial Overview rendering.
- [x] Run relevant fast tests, type-checking, linting, and the production build. Report actual validation results.
- [x] Keep private design links, file keys, screenshots, and reference-derived snapshots in ignored local reference locations only. Never copy them into tracked source, tests, documentation, tickets, or public reports.

## Scope boundary

This is a demoable first-page slice, not the completed full-history browser. Pagination belongs to 02, submitted search to 03, and category/sort controls to 04. No standalone navigation-prefactoring ticket or speculative data-service layer is required.

## Comments

- Resolved after owner review and approval. Implemented in commit `ef99388` (`feat: add responsive read-only Transactions page`). Includes the reviewed navigation hover styles, responsive table spacing, and shared locale/date formatting. Deferred browsing controls remain omitted.
- Final validation passed: 43 Vitest tests, 52 production Chromium checks, type-checking, linting, production build, and diff whitespace checks. Production route splitting and first-entry lazy loading verified.
