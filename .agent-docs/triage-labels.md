# Triage Labels

Map canonical triage roles to the status strings used in this repo's local issue files.

| Canonical role | Tracker status | Meaning |
| --- | --- | --- |
| `needs-triage` | `needs-triage` | Maintainer needs to evaluate this issue |
| `needs-info` | `needs-info` | Waiting on reporter for more information |
| `ready-for-agent` | `ready-for-agent` | Fully specified, ready for an AFK agent |
| `ready-for-human` | `ready-for-human` | Requires human implementation |
| `wontfix` | `wontfix` | Will not be actioned |

When a skill mentions applying a triage label, set the issue file's `Status:` line to the corresponding tracker status.

Edit the Tracker status column to change the vocabulary.
