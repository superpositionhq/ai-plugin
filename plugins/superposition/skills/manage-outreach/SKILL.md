---
name: manage-outreach
description: >-
  Control candidate outreach and follow-up emails in Superposition — draft/send a follow-up, chase a
  non-responder, send a polite decline, hold or cancel a queued send, or stop the agent because a
  human is taking over the thread. Use for "draft a follow-up about availability", "reach out and ask
  if he wants to reschedule", "send an apologetic decline", "don't send a follow-up", "I'll handle my
  own email", or "if they've had three emails with no reply, archive them".
---

# Manage outreach & follow-ups

Operators constantly steer candidate email — send, hold, stop, or hand off. Email **sends** happen
through the Master Agent (`invoke_agent`), which owns the delivery guardrails; your job is to read the
thread, get the intent exactly right, and avoid sending the wrong thing.

## Steps

1. **Read the thread first.** `get_candidate_email_thread` (full history, not just the latest) +
   `get_candidates` (current stage, `source.category`). Scan for whether the thing being asked was
   already answered — never re-ask an answered question.
2. **Check the queue if relevant.** `list_delayed_emails` to see pending sends before you add or
   cancel one.
3. **Confirm the intent** — send / hold / cancel / hand-off — and the substance. If the user says
   they'll handle it themselves or a teammate is taking over, **do not send**; just stop.
4. **Execute via `invoke_agent`**, threading `sessionId`:
   > "For candidate `<id>` on job `<id>`: <draft and send a follow-up asking X / send a polite
   > closure / cancel the queued send / do not email — human is taking over>. Keep it warm and concise."

## Guardrails (server-enforced — surface, don't bypass)

- **Inbound candidates** (`source.category: "INBOUND"`) can't be cold-emailed — the agent can only
  reply to an existing thread; first-stage outreach is system-driven. If there's no thread, say so.
- **No scheduling link before client approval** — outreach ≠ a scheduling greenlight.
- **Human hand-off**: if a teammate has taken over the thread, stay silent to the candidate.
- **Duplicate-send lock**: a recent identical send is blocked; don't hammer it — delay or skip.
- Queued sends (default ~1 min) are cancelable with the cancel path before they fire.

## Output

```
Queued a follow-up to [Mei Tan](https://app.superposition.ai/c/def-456) asking about availability (sends in ~1 min — say "cancel" to stop it).
```
