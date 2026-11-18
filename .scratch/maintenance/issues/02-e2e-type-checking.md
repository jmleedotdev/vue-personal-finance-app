# 02: Repair and integrate E2E TypeScript checking

**What to build:** Running the project's normal type-check command checks browser-test TypeScript as well as the application, configuration, and fast tests. Existing browser tests should type-check successfully without command-line overrides, while invalid test code should fail the same gate used for ordinary development.

**Blocked by:** None (can start immediately).

**Status:** resolved

**Implementation:** complete (validation recorded below).

- [x] Repair the browser-test TypeScript configuration so it supports the Node-based Playwright runner and browser DOM code inside browser-evaluation callbacks, without requiring ad hoc command-line library overrides.
- [x] Correct the existing browser-test element-type errors using appropriate types and narrowing. Preserve the tests' behavior and assertions; do not introduce explicit or implicit any, suppress diagnostics, weaken compiler settings, or exclude failing tests to make the check pass.
- [x] Include all existing E2E TypeScript in the normal project type-check command while preserving application, configuration, and fast-test coverage. Keep this check non-interactive and independent of a running browser or development server.
- [x] Verify the standalone browser-test type-check and the normal project type-check both pass without special command-line overrides.
- [x] Demonstrate that an intentional TypeScript error introduced temporarily into an E2E test causes the normal type-check command to fail. Remove the deliberate error afterward and confirm the command returns to green.
- [x] Run lint, the full fast test suite, the production build, and the existing Chromium suite against the production preview; preserve all existing behavioral assertions.
- [x] Keep any instructions about type-check coverage accurate and concise, using the project's existing scripts/configuration as the source of truth.
- [x] Do not add local hooks, CI, remote services, application behavior changes, new browser matrices, or unrelated test refactors as part of this ticket.

## Comments

Implementation validation:
- `pnpm exec tsc --project e2e/tsconfig.json` and `pnpm type-check` both pass without library overrides, browser launch, or a development server.
- E2E configuration retains the Node 24 base's strict settings and JavaScript libraries, adds DOM/DOM.Iterable for browser callbacks, disables emit, and puts build metadata under the existing ignored `node_modules/.tmp/` convention. The root project adds the E2E reference without removing existing references.
- Overview image validation now narrows with `instanceof HTMLImageElement`; Transactions table geometry narrows with `instanceof HTMLTableElement`. All existing assertions remain in place.
- Coverage probe: temporarily assigned a string to a number in `e2e/overview.spec.ts`. Before integration, normal `pnpm type-check` incorrectly passed; after adding the E2E project reference, it failed with TS2322 and exit 2. Removed the probe and confirmed both standalone and normal checks pass again.
- `pnpm check` passes lint, expanded type-checking, 145 app unit tests plus 8 isolated-Git integration tests, and the production build. `pnpm test:browser` passes all 87 Chromium checks against production preview.
- `README.md` documents normal type-check coverage and the standalone E2E command. No hook, CI, application, or browser-matrix changes.
- Independent Standards and Spec reviews found no issues; both approved the change.

Origin: retrospective after shared recurring-bill pagination. The normal type-check passed because it excluded E2E tests. A standalone E2E check failed on missing browser globals; temporarily supplying DOM libraries exposed existing image/table element-typing errors in the Overview and Transactions browser tests. All 87 Chromium runtime checks passed during that feature's validation, so this addresses static coverage and test maintainability rather than a demonstrated application regression.

This ticket can land before or after the local-commit-checks ticket. The latter invokes the normal type-check command and should automatically inherit E2E coverage once this work is complete; there is no blocking dependency between them.

### Status reconciliation

- Verified the committed E2E type-check integration (`fc9d2e9`), root project reference, and DOM-enabled strict E2E configuration. Current `pnpm check` passes expanded normal type-checking, lint, 145 app tests, 8 hook integration tests, and the production build; `pnpm test:browser` passes all 87 Chromium checks. The implementation record documents the intentional-error coverage probe. All acceptance criteria are checked complete; changed stale `ready-for-agent` status to `resolved`.
- This reconciliation uses implementation inspection, existing review/visual-validation records, and fresh automated checks; it does not claim a new private-reference visual review.
