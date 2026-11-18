# 01: Enforce existing checks before local commits

**What to build:** A developer working with local Git, without a remote or pull requests, can install a versioned pre-commit guardrail that rejects commits when the project's existing automated checks fail. The same non-mutating check command can be run manually. Keep real-browser validation available as an explicit command rather than making it a prerequisite for every commit.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Provide one non-interactive, non-mutating command that runs lint, the existing normal type-check command, the full fast test suite, and the production build. Reuse the project's existing tooling rather than creating a parallel set of checks.
- [ ] Retain convenient local auto-fix commands, but ensure the guardrail does not rewrite source files or stage changes. Generated build/cache artifacts may follow existing ignored-output conventions.
- [ ] Provide a versioned Git pre-commit hook that runs the shared check command and returns a nonzero exit status when any required check fails, preventing the commit.
- [ ] Provide an explicit, repeatable setup command to activate the hook for each checkout. Hook setup and execution must work without a Git remote, hosted service, pull request, or network access once project dependencies are installed.
- [ ] Detect an existing custom hook installation or hooks-path configuration and avoid silently overwriting it; explain any required integration action.
- [ ] Make failures identify the failing check and preserve useful diagnostics. Ensure the hook can locate the repository and use the project's supported package-manager/runtime setup.
- [ ] Keep Chromium checks outside the automatic commit path. Provide or retain an explicit non-interactive command for production-preview browser validation, with required browser setup documented for pre-release or pre-handoff use.
- [ ] Verify in an isolated temporary Git repository or checkout that hook installation is repeatable, a passing check permits a commit, and lint, type-check, fast-test, or build failure rejects a commit without changing source or staging content. Do not leave deliberate failures in the working tree.
- [ ] Verify the shared check command passes on the completed change, and run the explicit production-preview Chromium checks before completion.
- [ ] Document the manual check command, hook installation, and explicit browser-check workflow concisely. Explain that Git hooks are local and bypassable, not a substitute for future server-side enforcement.
- [ ] Do not add CI, remote hosting, pull-request requirements, comprehensive screenshot infrastructure, or E2E typing repairs as part of this ticket.

## Comments

Origin: retrospective after shared recurring-bill pagination. The owner develops with local Git and no remote, so a local pre-commit guardrail replaces the originally suggested CI job. The E2E type-checking ticket is independent: this hook should invoke the normal type-check command so it gains expanded coverage when that ticket lands, without duplicating its implementation.
