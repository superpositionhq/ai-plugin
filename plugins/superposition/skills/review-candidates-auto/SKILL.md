---
name: review-candidates-auto
description: >-
  Triage the Superposition candidate review backlog unattended ("full auto"). Use when the user asks
  to auto-review, clear, or work through the awaiting-review queue/backlog, review all candidates for a
  job without stopping, or batch-process candidates. For decisions the user wants to make themselves
  one-by-one, use review-candidates-human-loop instead. Requires the company soul to be set up first
  (bootstrap-company-soul) — assessments are weak without it.
---

# Review candidates — full auto

Work through the **awaiting-review backlog** without pausing between candidates. For each one you
gather the FitCheck context with read tools, then let the Master Agent record the decision through
`invoke_agent`. "Full auto" means you don't stop to ask the human between candidates — it does **not**
mean skipping Superposition's own approval gates. The Master Agent still enforces them (e.g. it won't
schedule before client approval); when it escalates or needs approval, surface that in your summary.

## Prerequisites

- Connected with the right active org (`connect-superposition`).
- **Company soul is populated** (`bootstrap-company-soul`). If `get_company` looks thin, stop and
  recommend bootstrapping first — auto-reviewing against a weak profile produces low-quality calls.

## Steps

1. **Scope the org.** `get_superposition_context` to confirm the active org.
2. **List active roles.** `list_jobs` and keep the **ACTIVE** ones.
3. **Size the backlog.** `get_pipeline_metrics` to see how many candidates are awaiting review per
   job. Report the total up front and, if it's large, confirm a batch cap (default: 25 per run) before
   proceeding so you don't run unbounded.
4. **Pull the queue per job.** `search_candidates({ jobId, stages: ["AWAITING_CLIENT_REVIEW"] })` to
   list the awaiting-review candidates.
5. **Load assessment context.** `get_candidates({ candidateIds: [...] })` (batched, up to 20 per call)
   for the FitCheck rationale, calibrated traits, and `source.category` (INBOUND vs OUTBOUND).
6. **Record each decision via the Master Agent.** For each candidate call `invoke_agent`, threading
   the returned `sessionId`:
   > "Review candidate `<candidateId>` for job `<jobId>`. Assess fit against the role using their
   > FitCheck assessment and record the decision with brief reasoning. Follow the standard pipeline
   > rules; if anything needs client approval or human input, say so instead of forcing it."
7. **Summarize.** Produce one table: candidate (linked), the decision the agent recorded, a one-line
   reason, and a flag for anything escalated or left pending. Note how many were processed vs. skipped.

## Output

```
Auto-review — Acme · Senior Backend Engineer (awaiting review: 18, processed: 18)

| Candidate                                              | Decision        | Why                                  |
|--------------------------------------------------------|-----------------|--------------------------------------|
| [Diego Prats](https://app.superposition.ai/c/abc-123)  | Advanced        | Strong distributed-systems match     |
| [Mei Tan](https://app.superposition.ai/c/def-456)      | Passed          | Below the experience floor for L5    |
| [Sam Okoro](https://app.superposition.ai/c/ghi-789)    | Escalated       | Comp expectation > range — needs client |

Processed 18/18. 1 escalated to a human. None skipped.
```

## Guardrails

- **Never fabricate decisions.** Report exactly what the Master Agent recorded. If a call fails or is
  ambiguous, mark it pending rather than inventing an outcome.
- **Respect server gates.** If the agent says it needs client approval, can't email an inbound
  candidate, or escalates — relay it; don't try to route around it.
- **Stay bounded.** Honor the batch cap; if more remain, report the remaining count and offer to run
  the next batch.
- Use `review-candidates-human-loop` when the user wants to make the calls themselves.
