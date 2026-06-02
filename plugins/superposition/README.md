# Superposition AI Plugin

Connect your coding agent to **Superposition (SPA)** — the AI hiring platform — and drive it with
guided skills: bootstrap your company profile, triage the candidate review backlog, and check
pipeline health, without leaving your editor. Works with **Claude Code, Codex, Cursor, and Gemini
CLI**, all through Superposition's hosted MCP server.

> Source of truth lives in the Superposition monorepo (`packages/ai-plugin/`) and is published to
> this repo on each version bump. Edit skills in the monorepo, not here.

## Install

### Claude Code

```bash
claude plugin marketplace add superpositionhq/ai-plugin
claude plugin install superposition@superposition
claude plugin enable superposition
```

The plugin installs **disabled by default** (it connects to an external service), so the `enable`
step is required before its skills, commands, and MCP server load. You can also toggle it anytime via
`/plugin`.

### Codex

```bash
codex plugin marketplace add superpositionhq/ai-plugin
# then, inside Codex:
/plugins   # select Superposition → Install
```

### Cursor

Install from the Cursor Marketplace, or add manually in **Settings → Plugins**. For just the MCP
connection, use the "Add to Cursor" deeplink from the Superposition dashboard.

### Gemini CLI

```bash
gemini extensions install https://github.com/superpositionhq/ai-plugin
```

On first use, the agent calls a Superposition tool and a browser opens for **OAuth sign-in**. Approve
it once; tokens are stored by your tool's keychain. No API keys or secrets to configure.

## Connection: universal vs scoped

- **Universal (default):** `https://app.superposition.ai/mcp` — grants everything your Superposition
  role already allows.
- **Scoped (optional):** point the MCP URL at a preset from your dashboard —
  `https://app.superposition.ai/mcp/p/<presetId>` — for read-only, a single org, or specific data.
  Nothing else changes.

## How it works

Superposition exposes **read** tools (look up candidates, jobs, company, pipeline, insights) plus one
**action** tool, `invoke_agent`, which runs Superposition's Master Agent to make changes safely (with
its approval gates and human-in-the-loop checks). The skills below orchestrate both.

## Skills

Skills activate automatically when your request matches them — you don't have to name them.

| Skill                          | What it does                                                       |
| ------------------------------ | ----------------------------------------------------------------- |
| `connect-superposition`        | Confirm the connection and active org before working              |
| `find-candidates`              | Find, research, or assess candidates                              |
| `pipeline-actions`             | Move / pass / reject / withdraw / share / mark-hired a candidate  |
| `manage-outreach`              | Draft, send, hold, or cancel candidate follow-up emails           |
| `record-candidate-insights`    | Record a confirmed person-level fact (visa, comp, availability…)  |
| `schedule-interviews`          | Schedule, reschedule, or handle no-shows                          |
| `manage-roles`                 | View/edit roles, interview stages, the ideal-candidate profile    |
| `pitch-to-client`              | Pitch candidates / post client updates in Slack                   |
| `pipeline-health-briefing`     | Read-only pipeline health + daily priorities                      |
| `review-candidates-auto`       | Triage the awaiting-review backlog unattended (full auto)         |
| `review-candidates-human-loop` | Review candidates one by one, you decide each (default)           |
| `bootstrap-company-soul`       | Populate/enrich your company profile (prerequisite for review)    |

## Slash commands & tips

Commands are explicit entry points in the `/` menu (skills auto-trigger; commands fire on demand).
Each shows an `argument-hint` so the menu is self-documenting.

**Platform availability:** the `/superposition:*` slash commands below are loaded on **Claude Code**.
On **Codex & Cursor**, the skills themselves are directly slash-invocable as `/superposition:<skill-name>`.
On **Gemini CLI**, only `review-backlog` ships as a slash command today; for everything else just use
natural language (the matching skill auto-triggers). Regardless of platform, every workflow is always
reachable by natural language — the slash commands are a convenience, not the only entry point.

| Command                               | Tip / usage                             | Natural-language equivalent |
| ------------------------------------- | --------------------------------------- | --------------------------- |
| `/superposition:connect`              | —                                       | "connect to superposition"  |
| `/superposition:find [query]`         | search / research / assess candidates   | "find python engs from Google" |
| `/superposition:pipeline [directive]` | move / pass / reject a candidate        | "move Diego to interviewing" |
| `/superposition:outreach [request]`   | draft / send / hold a follow-up         | "follow up with Mei"        |
| `/superposition:note [fact]`          | record a person-level insight           | "note that Liz needs a visa" |
| `/superposition:schedule [request]`   | book / reschedule / no-shows            | "send Diego the interview link" |
| `/superposition:role [change]`        | view/edit roles + stages                | "update Head of Marketing comp" |
| `/superposition:pitch [who]`          | pitch candidates to the client          | "pitch the top 3 to the client" |
| `/superposition:briefing [scope]`     | read-only pipeline health               | "what's my pipeline this week" |
| `/superposition:bootstrap-soul [url]` | pass a website if not set               | "set up our company soul"   |
| `/superposition:review-backlog [job]` | unattended; defaults to all active jobs | "auto-review the backlog"   |
| `/superposition:review-with-me [job]` | one-by-one, you decide each             | "review candidates with me" |

## Troubleshooting

- **Auth error / 401 / 403:** re-run the action so the browser OAuth login can finish, and make sure
  you signed into an account with Superposition access.
- **No data / wrong company:** you may be in the wrong org — run `/superposition:connect` to confirm
  and switch the active org.
- **Self-hosting / scoped URL:** edit the MCP URL in the config (`.mcp.json` / `mcp.json` /
  `gemini-extension.json`) to your self-hosted host or a scoped preset URL.

## License

MIT
