# Personal Finance

A client-rendered Vue 3 / TypeScript demo with a responsive Overview, local Public Sans typography, Tailwind theme tokens, and accessible shared controls.

The Overview shows balance summaries, scrollable pots and recent transactions, an interactive budget chart, and calculated recurring-bill summaries. Navigation uses a desktop sidebar (including in-memory minimization), tablet labeled bottom navigation, and mobile icon navigation. The lazy-loaded Transactions page shows the full demo history in responsive, read-only rows, ten records per page. Pagination is URL-backed (`/transactions?page=2`), restores on refresh and browser Back/Forward, and uses compact mobile controls. Explicit page changes scroll to and focus the Transactions heading. Search and category/sort controls are not implemented yet. Pots browsing is available from navigation and Overview, with responsive savings-goal cards and shared session-only Pots/Current Balance state. Add New Pot creates uniquely named, zero-savings goals with validated USD targets and independent pot theme availability. Creation and Edit Pot update Overview without moving money. Per-pot management menus open the shared metadata form; edits preserve savings and list order, and targets may be lowered below savings. Add Money previews and confirms cent-safe transfers from Current Balance into a selected pot, including funding above its target. Drafts do not move money; confirmed additions update Pots and Overview together. Withdraw previews and confirms the reverse transfer, including emptying a pot without removing its goal. Delete Pot requires named confirmation, returns all savings to Current Balance exactly once, and releases the name and theme. Deleting every pot leaves a creation invitation; Overview clears its entries and shows zero Total Saved. There is no backend, authentication, or persistence.

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
# Type-check app, configuration, fast tests, and E2E tests; no browser/server required
pnpm type-check
# Standalone E2E type-check
pnpm exec tsc --project e2e/tsconfig.json
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

Browser-dependent layout checks are explicitly invoked and Chromium-only. Use the build-first `pnpm test:browser` command for browser validation, including focused runs, so the production preview serves the source being validated. It is **not** part of `pnpm check` or the commit hook:

```sh
# One-time browser setup (requires a download); on Linux use --with-deps if needed
pnpm exec playwright install chromium
# Non-interactive: build, start a fresh production preview, run headless Chromium, exit
pnpm test:browser
# Focused file: rebuild first, then run only this browser suite
pnpm test:browser e2e/budgets.spec.ts
# Focused test: Playwright arguments are forwarded after the build
pnpm test:browser e2e/budgets.spec.ts -g 'zero-budget'
# Optional development-server exploration (not production-build validation)
pnpm test:e2e
```

`pnpm test:browser` uses Playwright's CI configuration and a line reporter (no interactive report server). Each invocation type-checks and rebuilds before starting a fresh production preview; a failed build prevents the browser run. Port 4173 must be free. Browser setup may need network access; subsequent runs use the installed browser.

Direct `CI=1 playwright test` invocations start the preview against whatever is already in `dist`; Playwright does not rebuild it. Use `pnpm test:browser` instead of manually chaining build and browser commands. `pnpm test:e2e` remains available for development-server exploration.

Playwright checks reference, intermediate, and narrow widths for responsive navigation, summary arrangement, overflow, keyboard interaction, and bottom-navigation clearance. Vitest tests rendered content and accessible behavior, not CSS class strings.

## Project layout

- `src/App.vue`: shared responsive shell and routed content.
- `src/components/AppNavigation.vue`: navigation modes and menu state.
- `src/views/HomeView.vue`: Overview entry and responsive layout for balances, pots, recent transactions, budgets, and recurring bills.
- `src/components/BalanceSummary.vue`: Current Balance from the shared Pots store, plus supplied Income/Expenses from `src/data/demo.json`; none are transaction-derived totals.
- `src/stores/pots.ts`: session-only copies of demo Pots and Current Balance, plus reactive Total Saved, zero-savings pot creation, metadata-only editing, validated Add Money/Withdraw previews and transfers, and atomic deletion with a savings return. Existing savings are already excluded from the initial Current Balance.
- `src/views/PotsView.vue`: responsive savings-goal browsing and the Add New Pot/Edit Pot/Add Money/Withdraw/Delete Pot dialogs and empty-state creation invitation.
- `src/components/Base*.vue`: shared accessible controls.
- `src/assets/main.css`: theme tokens, typography, and local font setup.
- `src/assets/`: bundled local logos, icons, fonts (license retained), and avatars.

Implemented routes are `/` (Overview), `/transactions` (paginated full transaction history), `/budgets`, `/recurring-bills`, and `/pots` (savings-goal browsing). Private design references remain in a Git-ignored local file, never in production code or tracked documentation.
