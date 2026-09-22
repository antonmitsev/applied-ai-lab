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
