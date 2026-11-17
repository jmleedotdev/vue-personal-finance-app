# Domain Docs

How engineering skills consume this repo's domain documentation.

## Before exploring, read these

- `GLOSSARY.md` at the repo root.
- Relevant ADRs in `docs/adr/`.

If these files don't exist, proceed silently. Create them lazily through `/domain-modeling` when terms or decisions actually get resolved.

## File structure

This repo uses a single-context layout:

```text
/
├── GLOSSARY.md
├── docs/adr/
│   └── 0001-<decision-slug>.md
└── src/
```

## Use the glossary's vocabulary

When output names a domain concept—in an issue title, refactor proposal, hypothesis, or test name—use the term defined in `GLOSSARY.md`.

If a needed concept is missing, reconsider whether it belongs to the project's vocabulary or note the gap for `/domain-modeling`.

## Flag ADR conflicts

If output contradicts an existing ADR, surface the conflict explicitly rather than silently overriding the decision:

> Contradicts ADR-0007 (<decision>), but worth reopening because…
