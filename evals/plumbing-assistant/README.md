# Plumbing Assistant evaluations

The evaluation suite is currently in specification phase.

## Planned layout

```text
plumbing-assistant/
├── case.schema.json       Versioned case contract
├── examples.jsonl         Unreviewed format examples; never a release set
├── public/                Reviewed public regression cases
├── fixtures/              Redistributable retrieval and image fixtures
└── reports/               Content-free evaluation summaries
```

The release process and thresholds are defined in
[PA-EVAL-001](../../docs/evaluation/plumbing-assistant-evaluation-plan.md).

`examples.jsonl` demonstrates the data structure only. Its cases have
`review_status: "unreviewed"` and are excluded from all release metrics.

`poc-pilot.jsonl` is a separate 30-pair bilingual development replay fixture.
Its records are intentionally marked `review_status: "development"`; they are
not a reviewed release set and are not evidence that the project beats a direct
ChatGPT baseline.
