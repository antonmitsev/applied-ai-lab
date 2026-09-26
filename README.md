# Applied AI Lab

Public portfolio monorepo for production-oriented AI applications built by
Anton Mitsev.

The goal of this repository is to demonstrate that an AI product is more than
a prompt: it needs clear requirements, reliable sources, safety boundaries,
cost controls, evaluation, observability, and a usable interface.

## Projects

| Project | Status | Description |
| --- | --- | --- |
| [Plumbing Assistant](apps/plumbing-assistant/) | Implementation ready | A bilingual AI assistant for non-professionals dealing with plumbing and hydronic-heating issues in Bulgaria. |

## Repository structure

```text
apps/           Deployable applications
docs/           Cross-project requirements, architecture, and decisions
evals/          Versioned evaluation contracts, fixtures, and public cases
packages/       Reusable packages introduced only when genuinely shared
scripts/        Repository-owned deterministic validation and maintenance tools
sources/        Reviewed source registries; document bytes only when redistributable
```

For a concise human explanation of how these areas fit together, see the
[Human Project Map](docs/PROJECT-MAP.md).

## Engineering principles

- Ground answers in traceable sources.
- Treat safety and uncertainty as product requirements.
- Keep API credentials and user data out of the repository.
- Measure quality, latency, and cost before choosing production limits.
- Prefer the smallest architecture that satisfies the requirements.
- Document important trade-offs and deferred work.

Run `npm run validate` before committing. Repository layout, traceability, and
CI expansion rules are defined in
[PA-REPO-001](docs/engineering/repository-conventions.md). Script behavior and
function references are documented in [scripts/README.md](scripts/README.md).

For an executive count of functional requirements, acceptance criteria,
security/privacy/legal artifacts, and a reusable pricing method, see the
[Scope Inventory and Estimation Ledger](docs/planning/plumbing-assistant-scope-inventory.md).
The required bilingual Terms, Privacy, Cookies, Safety, and Sources routes,
landing-page links, AI notice, and copyright footer are defined by
[PA-SERVICE-001](docs/service/README.md).

Start or transfer implementation from the
[v0.2 baseline](docs/requirements/plumbing-assistant-v0.2.md),
[implementation/commercial handoff](docs/handoffs/plumbing-assistant-implementation-handoff.md),
and [model-neutral execution plan](docs/planning/plumbing-assistant-implementation-plan.md).
Repository-level instructions for any human or AI coding agent are in
[AGENTS.md](AGENTS.md).

## Security

Never commit API keys, signing keys, user uploads, usage data, or runtime logs.
See [SECURITY.md](SECURITY.md) for the repository policy.

## License

Licensed under the [BSD Zero Clause License](LICENSE) (`0BSD`). The software may
be used, copied, modified, and distributed for any purpose, with or without fee,
and is provided without warranty or liability.
