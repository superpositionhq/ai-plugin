---
description: Triage the awaiting-review candidate backlog, unattended (full auto).
argument-hint: "[job name or id — optional; defaults to all active jobs]"
---

Use the `review-candidates-auto` skill to triage the awaiting-review backlog without pausing between
candidates. Confirm the batch cap if the backlog is large, record each decision via `invoke_agent`,
and return a summary table with links and any escalations. Scope: $ARGUMENTS
