---
name: schedule-interviews
description: >-
  Schedule, reschedule, and handle interviews in Superposition — send a scheduling link, book an
  onsite, handle a no-show, or reschedule. Use for "schedule the technical interview", "send her the
  scheduling link", "set up the onsite with the team", "he was a no-show, follow up", "reschedule the
  call", or "what interviews do we have this week". Also use when the user asks about an interviewer's
  scheduling setup.
---

# Schedule & reschedule interviews

Scheduling is high-frequency and full of preconditions. You gather the stage config and the
candidate's state, verify the gates, then let the Master Agent send links / coordinate /
reschedule through `invoke_agent`.

## Steps

1. **Load the stage config.** `list_interview_stages` for the job — each stage returns its scheduling
   readiness, method, scheduling URL, interviewer (`schedulerName`), duration, and CC emails. This
   answers most "what's the link / who's the interviewer" questions directly.
2. **Load the candidate.** `get_candidates` (current stage, client approval state) and
   `get_interview_summary` if you need what's already booked. For no-shows, also
   `get_candidate_email_thread`.
3. **Verify the gates** (see below) — especially that the client has approved and the candidate is in
   a schedulable stage.
4. **Execute via `invoke_agent`**, threading `sessionId`:
   > "For candidate `<id>` on job `<id>`, stage `<stage>`: <send the scheduling link / send a
   > coordination email / reschedule / follow up on the no-show>. Use the configured stage scheduling
   > data and follow the scheduling rules."

## Guardrails (server-enforced — surface, don't bypass)

- **Never schedule ELIGIBLE / unapproved candidates.** Scheduling requires explicit client approval;
  the presence of a scheduling URL does not authorize sending it.
- **Stage must be schedulable** (AWAITING_CLIENT_REVIEW with greenlight, AWAITING_INFO with greenlight,
  or INTERVIEWING/custom stages).
- **No calendar / no interviewer / no link** → the agent escalates or nudges the interviewer; relay
  that rather than forcing a send.
- **Human hand-off**: if a coordinator took over, don't send candidate scheduling email.

## Output

```
Sent the CTO-interview scheduling link to [Diego Prats](https://app.superposition.ai/c/abc-123) (host: Zach, 45 min). Booking will show on the candidate once they pick a slot.
```
