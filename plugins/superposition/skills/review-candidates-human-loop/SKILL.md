---
name: review-candidates-human-loop
description: >-
  Review the Superposition candidate backlog one candidate at a time with the user making each call
  (human-in-the-loop). Use when the user wants to go through awaiting-review candidates "with me", one
  by one, review and decide together, or keep control of advance/pass decisions. This is the safe
  default for candidate review; use review-candidates-auto only for unattended bulk triage. Requires
  the company soul to be set up first (bootstrap-company-soul).
---

# Review candidates — human in the loop

Walk the **awaiting-review backlog** with the user, pausing on each candidate to present the FitCheck
assessment and let _them_ decide. You gather context with read tools and record the user's decision
through `invoke_agent`. The difference from full-auto is simple: **stop and wait for the human on every
candidate** before recording anything.

## Prerequisites

- Connected with the right active org (`connect-superposition`).
- **Company soul is populated** (`bootstrap-company-soul`) so the FitCheck assessments you're showing
  are trustworthy.

## Steps

1. **Scope & size.** `get_superposition_context` (active org) → `list_jobs` (ACTIVE) →
   `get_pipeline_metrics` for the awaiting-review counts. Tell the user how many they're about to
   review and, if they have multiple roles, which job to start with.
2. **Pull the queue.** `search_candidates({ jobId, stages: ["AWAITING_CLIENT_REVIEW"] })`.
3. **Load context in batches.** `get_candidates({ candidateIds: [...] })` for FitCheck rationale,
   calibrated traits, and `source.category`. (You can prefetch the batch, but present one at a time.)
4. **Present one candidate and ask.** For each, show a tight summary and the candidate link, then ask
   for the call. Don't proceed until they answer. Offer clear options:
   - **Advance / approve** (good fit — move forward)
   - **Pass** (not a fit — with an optional reason)
   - **Hold / need info** (ask a question or revisit later)
   - **Skip** (decide later)
5. **Record exactly what they said.** Translate the user's choice into one `invoke_agent` call,
   threading `sessionId`:

   > "For candidate `<candidateId>` on job `<jobId>`, the client decision is **<advance|pass|hold>**.
   > <reason, if any>. Record this decision and follow the standard pipeline rules."

   Don't add a decision they didn't make. If they gave a reason, include it verbatim; if not, don't
   invent one.

6. **Confirm and continue.** Echo what was recorded (and anything the agent escalated), then move to
   the next candidate. At the end, give a short tally.

## Presenting a candidate

```
[Diego Prats](https://app.superposition.ai/c/abc-123) · OUTBOUND · Senior Backend Engineer
FitCheck: strong (distributed systems, 8y, ex-Stripe). Trait highlights: scalability ✅, ownership ✅.
Watch-outs: no direct team-lead experience; comp ask not yet captured.

Your call — advance, pass, hold (ask something), or skip?
```

## Guardrails

- **The human decides.** Never record advance/pass on your own. If they're unsure, default to **hold**
  or **skip** — don't force a decision.
- **Record faithfully.** Pass through the user's decision and reason exactly; report what the Master
  Agent did, including any escalation or approval it requires.
- **Respect server gates.** Recording a decision may trigger downstream steps (stage moves, outreach)
  that the Master Agent runs under its own approval rules — relay anything it flags rather than working
  around it.
- For unattended bulk triage of a large backlog, switch to `review-candidates-auto`.
