# Review handoff

Before delegating a code review, prepare review artifacts that the reviewers can read with their available tools. A working-tree-only diff tool cannot inspect committed changes in a clean checkout.

## Committed changes

1. Resolve the review baseline and HEAD to commit SHAs.
2. Generate the exact diff for the agreed range, its changed-file list, and its commit log. For a merge-base review, use `git diff <baseline>...<head>`, `git diff --name-only <baseline>...<head>`, and `git log <baseline>..<head> --oneline`.
3. Save these outputs in temporary files outside the tracked source tree. Verify that the diff is nonempty and the artifact paths are readable by the reviewers.
4. Pass both SHAs, the artifact paths, and the originating ticket/spec path to every reviewer. Supply the diff itself, not only a command the reviewer may be unable to execute.
5. Keep artifacts available until all reviewers finish, then remove temporary handoff files.

## Working changes

Include staged, unstaged, and relevant untracked files in the handoff, explicitly identifying the reviewed scope. A committed-range diff alone does not include them.

## Completion

Every reviewer must be able to inspect the exact requested changes without relying on a clean working tree to contain a diff. Account for subsequent changes with a delta handoff before claiming that the final implementation has been reviewed.
