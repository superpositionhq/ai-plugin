---
name: find-candidates
description: >-
  Find, look up, research, and summarize candidates in Superposition. Use for "find Python engineers
  from Google", "who are the top people we haven't contacted yet", "give me a quick summary of this
  person before I decide", "research this candidate and check their GitHub", "what's his comp
  expectation / notice period / timezone", "what's her LinkedIn", or "who failed the technical
  screen". Also use to assess a candidate against the bar — "why does he clear the bar?", "is she
  really top-tier? what are the proof points?", "show me the best matches and filter out weak
  schools/companies". This is the read/research/assess entry point — for taking an action on a
  candidate use pipeline-actions; for recording a new fact use record-candidate-insights; for telling
  the client use pitch-to-client.
---

# Find & research candidates

The #1 thing operators do is look people up — to search, to get a quick read before deciding, or to
answer a factual question. This skill is **read-first**; only reach for `invoke_agent` when the user
wants active research/enrichment beyond what's already on file.

## Steps

1. **Search or resolve.**
   - Open-ended ("Python engineers from Google", "ML folks") → `search_candidates` with filters
     (`skills`, `company`, `jobTitle`, `school`, `summary`, `stages`). Defaults to the active pipeline;
     pass `includeEligible`/`includeArchived` when the ask implies it.
   - A named person or LinkedIn URL → `search_candidates` (pass the URL as `searchTerm`) then
     `get_candidates` for full detail. Batch multiple IDs in one `get_candidates` call.
2. **Answer factual questions from what's on file first.** `get_candidates` (FitCheck, traits,
   location, links), `search_insights` (person facts: visa, comp, availability), and
   `get_candidate_email_thread` (what they last said) usually have the answer — don't guess, don't
   escalate.
3. **For "research / summarize / dig deeper before I decide":** if the on-file data isn't enough,
   `invoke_agent` to actively research and summarize:
   > "Research candidate `<id>` (check their public profiles / GitHub as relevant) and give a concise
   > fit summary for job `<id>`."
4. **Present concisely** with the clickable link `https://app.superposition.ai/c/{candidateId}`:
   highlights, fit signal, watch-outs. For lists, a compact ranked table.

## Guardrails

- Respect candidate privacy — share what the task needs, not everything.
- Distinguish "find/research" (this skill) from "act on" (pipeline-actions) and "record a fact"
  (record-candidate-insights); if the user shifts intent, hand off to the right skill.
- Don't invent facts; if something isn't known, say so (and offer to research).

## Output

```
Top uncontacted for Senior Backend (5):
| Candidate | Why | Signal |
|---|---|---|
| [A. Rivera](https://app.superposition.ai/c/abc) | ex-Stripe, distributed systems | strong |
| [J. Okoro](https://app.superposition.ai/c/def) | 6y Go, fintech | strong |
```
