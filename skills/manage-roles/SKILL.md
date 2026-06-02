---
name: manage-roles
description: >-
  View and edit jobs/roles in Superposition — list open roles, check a role's status, update comp,
  the job description, location, or work-auth fields, set pre-interview checks, or draft a new role.
  Use for "what roles are we hiring for", "update the salary range on the Head of Marketing role",
  "update the JD to say remote-first", "what's the status of the marketing role", "always ask for a
  portfolio before flagging", or "open a new role for a staff backend engineer". Also use to set up or
  copy interview stages between jobs, duplicate a role, or edit the ideal-candidate profile ("prefer
  IC, no managers", "copy the other job's scheduling config", "duplicate the founding-eng job").
---

# Manage roles

Reads are answerable directly from job data; edits and new roles flow through the Master Agent via
`invoke_agent` (which owns `update_job` / `create_draft_job`).

## Steps

1. **For "what are we hiring for" / status:** `list_jobs` (active roles) and `get_job` for detail —
   answer directly. `get_job` carries `compensationRange`, `equityRange`, `locationType`/`location`/
   `inOfficeDaysPerWeek`, `isVisaSponsorshipProvided`/`workAuthorizationRequirement`, `jobDescription`,
   and `infoToFlagToCandidates`.
2. **For an edit:** read the current value with `get_job` first (so you can show a diff and not clobber
   other fields), then `invoke_agent`, threading `sessionId`:
   > "Update job `<id>`: set <field> to <value> (e.g. compensationRange to '$120–160K+'; add 'remote
   > first' to the JD; set infoToFlagToCandidates to '<checks>'). Leave other fields unchanged."
3. **For a new role:** gather the essentials (title, comp, location, key requirements) — use
   `get_supported_roles` if the user wants a template — then `invoke_agent` to create a draft.
4. **For interview-stage setup or duplication** ("set up the stages like the other job", "copy the
   scheduling config", "duplicate this role"): read the source job's stages with
   `list_interview_stages`, then `invoke_agent` to create/copy the stages (or draft the duplicate
   role). Confirm interviewers/scheduling URLs carried over.
5. **Show the diff** of what changed and link the role: `https://app.superposition.ai/j/{jobId}`.

## Guardrails

- **Pre-interview checks** ("always ask X before flagging") are a **job update** (`infoToFlagToCandidates`),
  not an insight. But work-authorization and standard location/work-model belong in the dedicated job
  fields, not as free-text checks — the agent handles that routing.
- Confirm before clearing/emptying a populated field.
- Don't invent comp, equity, or requirements; ask if unknown.

## Output

```
Updated [Head of Marketing](https://app.superposition.ai/j/job-789): compensationRange "$110–140K" → "$120–160K+, depending on level".
```
