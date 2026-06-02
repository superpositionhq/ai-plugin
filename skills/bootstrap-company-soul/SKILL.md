---
name: bootstrap-company-soul
description: >-
  Populate or enrich the Superposition company profile — the "company soul" that powers FitCheck
  assessment and candidate outreach. Use whenever the user wants to set up, fill in, enrich, or
  improve their company information on SPA, mentions "company soul / profile / identity", is
  onboarding, or asks why FitCheck or outreach quality is weak. This is a prerequisite for the
  candidate-review skills — a thin profile produces weak assessments.
---

# Bootstrap the company soul

The "company soul" is Superposition's structured company profile: what the company does, who's
behind it, who backs it, and the interesting problem new hires get to work on. FitCheck scoring and
the outreach the system writes both lean on it heavily — so getting it rich and accurate is the
highest-leverage setup step, and a prerequisite for meaningful candidate review.

## The fields that matter

Read with `get_company`. Aim to fill, at minimum:

- **Basics:** `companyName`, `companyUrl`, `industry`, `location`, `size`, `companyDescription`
- **Soul:** `problemFocus` (the core problem you solve), `solutionsProducts`, `notableInvestors`,
  `founderBackground`, `admiredCompanies`, `challengeToSolve` (the compelling challenge a new hire
  tackles)

## Steps

1. **Read the current profile.** Call `get_company` and assess which fields are empty or thin. Don't
   re-derive what's already good.
2. **Ensure a website is set.** Research needs `companyUrl`. If it's missing, ask the user for it
   (research is skipped for personal email domains like gmail.com). Don't invent a URL.
3. **Auto-research to fill the gaps.** Call `invoke_agent` with a clear instruction, e.g.:

   > "Research our company at `<companyUrl>` and populate the company profile: problem focus,
   > products/solutions, notable investors, founder background, companies we admire, and the
   > interesting challenge a new hire would work on. Merge with what's already there — do not
   > overwrite good existing values, and confirm before clearing any field."

   The Master Agent runs the `company-profile` workflow (web research + a guarded profile update) and
   returns a summary of what changed. Pass its `sessionId` back on follow-ups so the thread stays
   coherent.

4. **Verify and show the diff.** Call `get_company` again. Present a before→after of the fields that
   changed and flag anything still empty.
5. **Targeted edits (optional).** If the user wants to correct or add specific values, send another
   `invoke_agent` instruction naming the field(s) and new value(s). It will confirm before emptying
   anything.

## Output

```
Company soul updated ✅

Filled / improved:
- Problem focus: (empty) → "Cutting the manual work out of technical recruiting"
- Notable investors: (empty) → "Sequoia, Y Combinator"
- Challenge to solve: (empty) → "Designing the assessment loop that ranks 10k candidates/day"

Still empty (optional): admiredCompanies
View: https://app.superposition.ai/settings/company

Profile is solid — candidate review will now produce much stronger FitCheck assessments.
```

## Guardrails

- Only `get_company` + `invoke_agent` are needed. Don't attempt direct writes — there is no direct
  company-write tool on the MCP surface; updates flow through `invoke_agent`, which confirms before
  destructive changes.
- Never fabricate facts (investors, founders, funding). If research can't confirm something, leave it
  empty and say so.
