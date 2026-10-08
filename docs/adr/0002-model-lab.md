# Model Lab uses a source-linked static catalogue

Status: accepted, 2026-10-08.

Amendment, 2026-10-08: the catalogue scope and external-only benchmark decision are superseded by ADR 0003 and [ADR 0004](0004-independent-benchmarks.md). Pricing and comparison principles below still apply.

The user requested model comparison similar in function to Artificial Analysis. Extend Latest Cookie's existing computing-journal interface with independent price exploration, filtering, three-model comparisons and a text workload calculator.

Use a small manually checked first-party catalogue. Artificial Analysis is linked as an external evaluation resource; its site content and benchmark dataset are not replicated. There is no API key, remote runtime request or claim to independently measure performance. API access/licensing would be a separate integration.

Rate records are standard uncached text prices per million tokens, with explicit source and checked date. The calculator estimates aggregate token volume and cannot predict tokenizer or reasoning usage. Avoid prompt-length-tiered models until the schema and calculator can represent those tiers. Shared context and separate input limits carry different labels. Changes are validated before deploy.

Comparison state is serialized to a URL on explicit sharing. This makes it portable without accounts or tracking. Browser clipboard failure leaves a selectable URL.
