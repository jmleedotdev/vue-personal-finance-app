# Personal Finance

A client-rendered Vue 3 / TypeScript demo with a responsive Overview, local Public Sans typography, Tailwind theme tokens, and accessible shared controls.

The Overview shows balance summaries, scrollable pots and recent transactions, an interactive budget chart, and calculated recurring-bill summaries. Navigation uses a desktop sidebar (including in-memory minimization), tablet labeled bottom navigation, and mobile icon navigation. The lazy-loaded Transactions page shows the full demo history in responsive, read-only rows, ten records per page. Pagination is URL-backed (`/transactions?page=2`), restores on refresh and browser Back/Forward, and uses compact mobile controls. Explicit page changes scroll to and focus the Transactions heading. Search and category/sort controls are not implemented yet. Budgets, Pots, and Recurring Bills destination pages remain unavailable; there is no backend, authentication, or persistence.

## Development

Use Node.js `^22.18.0 || >=24.12.0` and pnpm.

```sh
pnpm install
pnpm dev
```

## Validation

```sh
# All required local checks: non-fixing lint, normal type-check, fast tests, production build
pnpm check
# Install the versioned pre-commit hook for this checkout (safe to repeat)
pnpm hooks:install
# All fast tests, including isolated Git hook integration tests; no browser launch
pnpm test:fast
# App unit tests only
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

`pnpm check` stops at the first failing check, names it, and retains tool diagnostics. It does not fix source or stage files; build and type-check caches use the existing ignored-output conventions. `pnpm lint:check` is the non-fixing lint command; `pnpm lint` and `pnpm format` remain explicit auto-fix commands.

Hook setup requires an existing Git checkout, the supported Node.js version, and pnpm on `PATH`. After dependencies are installed, setup and commits need neither a remote nor network access. The hook finds the repository root and runs the same `pnpm check`, including unstaged working-tree changes (not just the staged snapshot). Ensure Node.js and pnpm are also on the Git client's `PATH` when committing from an editor or GUI.

Setup writes only local `core.hooksPath=.githooks`. It refuses a conflicting hooks-path configuration at any scope or custom files in the default hooks directory; it does not overwrite them. To keep your existing hook manager, integrate `pnpm check` into its pre-commit hook and propagate its exit status. Alternatively, explicitly relocate existing hooks or remove the conflicting configuration at its reported scope before retrying setup. Git hooks are local and bypassable (for example, `git commit --no-verify`), not a substitute for future server-side enforcement. Run setup again for each fresh checkout.

Browser-dependent layout checks are explicitly invoked and Chromium-only. Run the production-preview check before release or handoff; it is **not** part of `pnpm check` or the commit hook:

```sh
# One-time browser setup (requires a download); on Linux use --with-deps if needed
pnpm exec playwright install chromium
# Non-interactive: build, start a fresh production preview, run headless Chromium, exit
pnpm test:browser
# Optional development-server browser checks
pnpm test:e2e
```

`pnpm test:browser` uses Playwright's CI configuration and a line reporter (no interactive report server). Port 4173 must be free. Browser setup may need network access; subsequent runs use the installed browser.

Playwright checks reference, intermediate, and narrow widths for responsive navigation, summary arrangement, overflow, keyboard interaction, and bottom-navigation clearance. Vitest tests rendered content and accessible behavior, not CSS class strings.

## Project layout

- `src/App.vue`: shared responsive shell and routed content.
- `src/components/AppNavigation.vue`: navigation modes and menu state.
- `src/views/HomeView.vue`: Overview entry and responsive layout for balances, pots, recent transactions, budgets, and recurring bills.
- `src/components/BalanceSummary.vue`: independent supplied balance summaries from `src/data/demo.json`, not transaction-derived totals.
- `src/components/Base*.vue`: shared accessible controls.
- `src/assets/main.css`: theme tokens, typography, and local font setup.
- `src/assets/`: bundled local logos, icons, fonts (license retained), and avatars.

Implemented routes are `/` (Overview) and `/transactions` (paginated full transaction history). Private design references remain in a Git-ignored local file, never in production code or tracked documentation.
