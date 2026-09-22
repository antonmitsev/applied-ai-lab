# Applied AI Lab

Public portfolio monorepo for production-oriented AI applications built by
Anton Mitsev.

The goal of this repository is to demonstrate that an AI product is more than
a prompt: it needs clear requirements, reliable sources, safety boundaries,
cost controls, evaluation, observability, and a usable interface.

## Projects

| Project | Status | Description |
| --- | --- | --- |
| [Plumbing Assistant](apps/plumbing-assistant/) | Requirements | A bilingual AI assistant for non-professionals dealing with plumbing and hydronic-heating issues in Bulgaria. |

## Repository structure

```text
apps/           Deployable applications
docs/           Cross-project requirements, architecture, and decisions
evals/          Versioned evaluation contracts, fixtures, and public cases
packages/       Reusable packages introduced only when genuinely shared
scripts/        Repository-owned deterministic validation and maintenance tools
sources/        Reviewed source registries; document bytes only when redistributable
```

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

## Security

Never commit API keys, signing keys, user uploads, usage data, or runtime logs.
See [SECURITY.md](SECURITY.md) for the repository policy.

## License

Licensed under the [BSD Zero Clause License](LICENSE) (`0BSD`). The software may
be used, copied, modified, and distributed for any purpose, with or without fee,
and is provided without warranty or liability.
