---
name: pipeline-health-briefing
description: >-
  Give a read-only status briefing and prioritization for Superposition — pipeline health, what to
  focus on today, counts and bottlenecks. Use for "what's my pipeline this week", "who should I
  prioritize today", "how many candidates are awaiting my review", "what's the status of the marketing
  role", "who failed the technical screen", "time to hire", or "what should I focus on". This skill
  only reads and recommends; to act on what it surfaces, hand off to the review or pipeline-actions
  skills.
---

# Pipeline health & daily priorities

Operators regularly ask "where do things stand" and "what should I do next". This skill assembles a
read-only briefing from metrics + the live pipeline and ends with a prioritized, actionable list. It
never mutates — it points the user at the next skill.

## Steps

1. **Scope.** `get_superposition_context` (active org) → `list_jobs` (active roles).
2. **Pull the signals (reads only):**
   - `get_pipeline_metrics` — counts by stage, the awaiting-review backlog, stalls.
   - `get_client_health` — at-risk clients/roles.
   - `get_interview_summary` — upcoming interviews, no-shows, results (e.g. "who failed the technical
     screen").
   - `search_candidates({stages:[...]})` per role when you need specifics (e.g. who's stuck in
     AWAITING_INFO).
3. **Synthesize a briefing**, not a data dump: backlog awaiting review, candidates stalled/at-risk,
   upcoming interviews + no-shows to chase, and any client-health flags.
4. **End with prioritized next actions**, each linked and routed to the skill that does it:
   "12 awaiting review → run `review-candidates-*`"; "3 no-shows → `schedule-interviews`"; "2 stalled
   on comp → `manage-outreach`".

## Guardrails

- **Read-only.** Do not move, email, or change anything here — recommend, then hand off.
- Prefer a tight prioritized summary over exhaustive lists; link entities so the user can drill in.

## Output

```
Pipeline — Acme, this week
- Awaiting your review: 12  → /superposition:review-with-me
- Stalled (AWAITING_INFO 5+ days): 4  → manage-outreach
- Interviews this week: 6 (1 no-show: [J. Lee]) → schedule-interviews
- Client health: "Globex" cooling — 0 candidates shared in 9 days
Top priority today: clear the 12 awaiting review.
```
