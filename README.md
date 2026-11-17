# Personal Finance

A client-rendered Vue 3 / TypeScript demo with a responsive Overview, local Public Sans typography, Tailwind theme tokens, and accessible shared controls.

The Overview currently shows the supplied balance summaries with desktop sidebar navigation (including in-memory minimization), tablet labeled bottom navigation, and mobile icon navigation. Transactions, Budgets, Pots, and Recurring Bills destinations are unavailable for now. The remaining Overview cards are separate follow-up tickets; there is no backend, authentication, or persistence.

## Development

Use Node.js `^22.18.0 || >=24.12.0` and pnpm.

```sh
pnpm install
pnpm dev
```

## Validation

```sh
# Fast tests; no browser launch
pnpm test:unit --run
# Focused rendered Overview behavior
pnpm test:unit --run src/views/__tests__/Overview.spec.ts
pnpm type-check
# Type-check and compile production assets
pnpm build
# Lint (applies fixes)
pnpm lint
# Format source files
pnpm format
```

Browser-dependent layout checks are explicitly invoked and Chromium-only:

```sh
pnpm exec playwright install chromium
pnpm test:e2e
# Validate the production preview rather than the development server
pnpm build
CI=1 pnpm test:e2e
```

Playwright checks reference, intermediate, and narrow widths for responsive navigation, summary arrangement, overflow, keyboard interaction, and bottom-navigation clearance. Vitest tests rendered content and accessible behavior, not CSS class strings.

## Project layout

- `src/App.vue`: shared responsive shell and routed content.
- `src/components/AppNavigation.vue`: navigation modes and menu state.
- `src/views/HomeView.vue`: Overview entry and responsive content flow for subsequent cards.
- `src/components/BalanceSummary.vue`: independent supplied balance summaries from `src/data/demo.json`, not transaction-derived totals.
- `src/components/Base*.vue`: shared accessible controls.
- `src/assets/main.css`: theme tokens, typography, and local font setup.
- `src/assets/`: bundled local logos, icons, fonts (license retained), and avatars.

The only implemented route is `/`. Private design references remain in a Git-ignored local file, never in production code or tracked documentation.
