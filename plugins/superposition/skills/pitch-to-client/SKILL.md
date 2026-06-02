---
name: pitch-to-client
description: >-
  Pitch candidates to the client and post client updates in Superposition. Use for "pitch the best
  candidates in the await-review pool to the client", "summarize these and update the client in
  Slack", "draft a message pitching them", "share with the client", "post an update to the client
  channel", or "let the client know X". This is the client-facing summary/messaging workflow — for an
  internal lookup use find-candidates; for a stage move use pipeline-actions.
---

# Pitch to client & client updates

The core recruiter loop ends in a pitch: surface the strong candidates and tell the client, usually in
their Slack channel. This skill assembles the pitch from real candidate data and posts it (or hands
you the draft) through the Master Agent.

## Steps

1. **Decide what to pitch.** If "the await-review pool", `search_candidates({stages:["AWAITING_CLIENT_REVIEW"]})`;
   if named, resolve with `search_candidates` → `get_candidates`. Pull the pitch material
   (FitCheck highlights, why-fit, standout traits) with `get_candidates`.
2. **Draft a tight pitch** — per candidate: name (linked), the one-line why-fit, and the key proof
   points. Keep it client-appropriate: no internal scores, no permission/system details.
3. **Confirm the destination.** Ask (or infer from the request) whether to **post to the client's
   Slack channel** or **return the draft** for the user to post themselves — both are common.
4. **Execute via `invoke_agent`**, threading `sessionId`:
   > "Pitch these candidates to the client for job `<id>`: `<ids>`. <Post the update to the client
   > Slack channel> / <or just draft it for me>. Summarize why each is a fit; keep it concise."
   > For a single candidate, "share with the client" moves them to AWAITING_CLIENT_REVIEW, which
   > auto-creates the client Slack thread with the pitch.

## Guardrails (server-enforced — surface, don't bypass)

- **Visibility & approval:** sharing a candidate makes them visible to the client; don't expose
  candidates the user didn't ask to share.
- **No internal data** (raw FitCheck scores, permissions, other clients) in client-facing messages.
- If the user says they'll post it themselves, return the draft and **don't** post.
- A general client-channel update (no specific candidate) is fine — say so if the agent needs a
  candidate id it doesn't have.

## Output

```
Pitched 3 to Acme's channel: [A. Rivera](https://app.superposition.ai/c/abc) (ex-Stripe, distributed systems), [J. Okoro](https://app.superposition.ai/c/def) (6y Go, fintech), [M. Tan](https://app.superposition.ai/c/ghi) (infra @ scale). All moved to awaiting client review.
```
