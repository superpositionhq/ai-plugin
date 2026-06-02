---
name: pipeline-actions
description: >-
  Take a pipeline action on a specific named candidate in Superposition — move/advance to a stage,
  pass/reject, withdraw, mark do-not-contact, share with the client, or mark hired. Use whenever the
  user gives a directive about one (or a few) named candidates: "move [name] forward", "pass on him",
  "reject — no-show", "take her out of the pipeline", "share with the client", "mark hired", "mark do
  not contact", or "undo that not-a-fit decision". For triaging the whole awaiting-review queue, use
  the review-candidates skills instead.
---

# Pipeline actions (single candidate)

This is the most common thing operators do: a quick, targeted directive about one candidate. You
resolve who they mean and the current stage, confirm the action, and let the Master Agent execute it
through `invoke_agent` (where all the pipeline guardrails live).

## When to use vs. the review skills

- **This skill:** a directive about a **specific named candidate** ("move Diego forward", "reject him").
- **`review-candidates-*`:** working through the **awaiting-review backlog** as a batch.

## Steps

1. **Resolve the candidate.** If named, `search_candidates` then `get_candidates` for full detail
   (current stage, `source.category`, prior decisions). Never ask for an ID — look it up. Use
   `includeArchived: true` if the user implies the person was already declined/removed.
2. **Get the action right.** Map the directive to the intended outcome and confirm anything ambiguous
   (which stage? pass vs. withdraw? — "not a fit" from the _client_ is a pass; from the _candidate_ is
   a withdrawal). Check `get_job` if a stage/role detail matters.
3. **Execute via `invoke_agent`**, threading `sessionId`:
   > "For candidate `<id>` on job `<id>`: <action — e.g. record the client's fit decision and move to
   > the first interview stage / mark not-a-fit / withdraw / mark do-not-contact / share with the
   > client / mark hired>. <reason if the user gave one>. Follow the standard pipeline rules."
4. **Relay the result**, including anything the Master Agent escalates or any approval it requires.

## Guardrails (server-enforced — surface, don't bypass)

- **Mark hired** requires explicit client confirmation; intent to hire is not enough.
- **Archived/rejected** candidates can't be silently resurfaced; reversing a rejection escalates to a
  human.
- **Do-not-contact** uses the right reason (`WRONG_CONTACT` vs. a removal request) and then archives.
- **"Undo / I manually moved them"**: read the current state first (`get_candidates`) before acting —
  the user may have already changed it in the UI.
- Don't fabricate a decision or a reason; pass through exactly what the user said.

## Output

```
Done — [Diego Prats](https://app.superposition.ai/c/abc-123): recorded client "fit", moved to CTO Interview.
(The agent flagged it will send the scheduling link once the interviewer's calendar is connected.)
```
