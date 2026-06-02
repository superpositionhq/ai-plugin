---
name: record-candidate-insights
description: >-
  Record a confirmed fact (an "insight" or "learning") about a person in Superposition — visa/work
  authorization, compensation expectation, location/relocation, availability/notice, preferred name,
  remote/onsite preference, clearances, competing offers, etc. Use whenever the user says "add a note
  that…", "add a learning…", "note that…", "remember that…", "she confirmed she's a US citizen, add
  that", or "he prefers to be called [name]". These are person-level facts, not pipeline decisions.
---

# Record candidate insights / learnings

Operators frequently capture durable facts about a person mid-conversation. These "insights" are
person-scoped (they follow the person across roles) and they feed future assessment and outreach, so
recording them cleanly is high-value. Insights are written by the Master Agent via `invoke_agent`.

## Steps

1. **Resolve the person.** If named, `search_candidates` → `get_candidates`. Don't ask for an ID.
2. **Check for duplicates.** `search_insights` for the person so you don't record the same fact twice;
   if it's an update to an existing fact, note that.
3. **Make it atomic and confirmed.** One fact per insight, falsifiable, in the user's words. Record
   compensation **verbatim**. If the user's statement is vague, confirm the exact fact before saving.
4. **Record via `invoke_agent`**, threading `sessionId`:
   > "Record a person-level insight for candidate `<id>` (personId only — not job-specific): '<the
   > atomic fact, e.g. needs H-1B sponsorship / comp expectation $180k base / prefers to go by Liz /
   > open to relocating to NYC>'. Reason: <why it's being recorded>."
5. **Confirm** what was saved.

## What counts (record) vs. what doesn't

- **Record:** visa/work-auth, comp expectations (verbatim), location/relocation, availability/notice,
  start date, remote/onsite preference, preferred name, clearances, competing offers, contract-vs-FTE.
- **Do NOT record as a person insight:** client decisions ("client passed"), role-specific sentiment
  ("excited about _this_ job"), interview performance, or ephemeral scheduling details. Those belong
  to the pipeline (use pipeline-actions) — recording them as person facts pollutes future matching.

## Output

```
Recorded for [Liz Cho](https://app.superposition.ai/c/abc-123): "Prefers to be called Liz." (person-level — applies across roles)
```
