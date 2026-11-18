# 02: Repair and integrate E2E TypeScript checking

**What to build:** Running the project's normal type-check command checks browser-test TypeScript as well as the application, configuration, and fast tests. Existing browser tests should type-check successfully without command-line overrides, while invalid test code should fail the same gate used for ordinary development.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Repair the browser-test TypeScript configuration so it supports the Node-based Playwright runner and browser DOM code inside browser-evaluation callbacks, without requiring ad hoc command-line library overrides.
- [ ] Correct the existing browser-test element-type errors using appropriate types and narrowing. Preserve the tests' behavior and assertions; do not introduce explicit or implicit any, suppress diagnostics, weaken compiler settings, or exclude failing tests to make the check pass.
- [ ] Include all existing E2E TypeScript in the normal project type-check command while preserving application, configuration, and fast-test coverage. Keep this check non-interactive and independent of a running browser or development server.
- [ ] Verify the standalone browser-test type-check and the normal project type-check both pass without special command-line overrides.
- [ ] Demonstrate that an intentional TypeScript error introduced temporarily into an E2E test causes the normal type-check command to fail. Remove the deliberate error afterward and confirm the command returns to green.
- [ ] Run lint, the full fast test suite, the production build, and the existing Chromium suite against the production preview; preserve all existing behavioral assertions.
- [ ] Keep any instructions about type-check coverage accurate and concise, using the project's existing scripts/configuration as the source of truth.
- [ ] Do not add local hooks, CI, remote services, application behavior changes, new browser matrices, or unrelated test refactors as part of this ticket.

## Comments

Origin: retrospective after shared recurring-bill pagination. The normal type-check passed because it excluded E2E tests. A standalone E2E check failed on missing browser globals; temporarily supplying DOM libraries exposed existing image/table element-typing errors in the Overview and Transactions browser tests. All 87 Chromium runtime checks passed during that feature's validation, so this addresses static coverage and test maintainability rather than a demonstrated application regression.

This ticket can land before or after the local-commit-checks ticket. The latter invokes the normal type-check command and should automatically inherit E2E coverage once this work is complete; there is no blocking dependency between them.
