---
name: connect-superposition
description: >-
  Connect to Superposition (SPA) and confirm you're set up before doing recruiting work. Use this
  whenever the user first mentions Superposition, asks to "connect", "set up", "log in", or
  "authenticate" with SPA, asks which organization they're in, says they can't see their
  candidates/jobs, or hits a 401/403/permission error from an SPA tool. Run this before the other
  Superposition skills so the active org and access are established.
---

# Connect to Superposition

Superposition is reached through a hosted MCP server. The plugin already wired the connection — the
first time you call an SPA tool, the platform opens a browser OAuth login. This skill confirms the
connection is live and the **active organization** is correct, which everything else depends on.

## When to run

First contact with SPA in a session, or any time access looks wrong (no data, wrong company, auth
error). Cheap to run; do it before assuming something is broken.

## Steps

1. **Confirm identity and scope.** Call `get_superposition_context`. It returns who you're connected
   as and which organization(s) the user can act in. If it errors with auth/401/403, the OAuth flow
   hasn't completed — tell the user to re-run the action so the browser login can finish, and to make
   sure they sign in to an account that has SPA access.
2. **Pick the active org.** If the user belongs to **more than one** organization, ask which one to
   work in and remember it for the session. SPA data and every action are org-scoped — acting in the
   wrong org is a real mistake, so don't guess.
3. **Sanity-check access.** Call `list_jobs`. If it returns roles, the connection is healthy and you
   can proceed. If it's empty but the user expects jobs, you're likely in the wrong org (go back to
   step 2) or the account lacks access.
4. **Report and hand off.** Briefly confirm: connected as `<name>`, active org `<org>`, N active
   jobs. Then point them at what's next — if the company profile looks sparse, suggest
   `bootstrap-company-soul`; if they want to work the queue, suggest the review skills.

## Permissions: universal vs scoped

By default the plugin uses the **universal** connection (`https://app.superposition.ai/mcp`), which
grants everything the signed-in user's role already allows. If the user wants to **narrow** access
(read-only, a single org, specific data), they can point the MCP URL at a **scoped preset**
`https://app.superposition.ai/mcp/p/<presetId>` from their SPA dashboard — no other change is needed.
Mention this only if they ask about limiting access.

## Output

```
Connected to Superposition ✅
- User: Jordan Lee
- Active org: Acme (you also have access to: Globex — say the word to switch)
- Active jobs: 4

Next: your company profile looks thin — want me to bootstrap the company soul? (improves FitCheck + outreach)
```
