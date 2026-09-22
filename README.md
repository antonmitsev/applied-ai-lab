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
packages/       Reusable packages introduced only when genuinely shared
```

## Engineering principles

- Ground answers in traceable sources.
- Treat safety and uncertainty as product requirements.
- Keep API credentials and user data out of the repository.
- Measure quality, latency, and cost before choosing production limits.
- Prefer the smallest architecture that satisfies the requirements.
- Document important trade-offs and deferred work.

## Security

Never commit API keys, signing keys, user uploads, usage data, or runtime logs.
See [SECURITY.md](SECURITY.md) for the repository policy.

## License

No open-source license has been selected yet. Unless a license is added, the
repository is publicly viewable but no permission to copy, modify, or
redistribute its contents is granted.
