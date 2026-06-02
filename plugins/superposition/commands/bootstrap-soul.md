---
description: Populate or enrich your Superposition company profile (the "company soul").
argument-hint: "[company website URL — optional if already set]"
---

Use the `bootstrap-company-soul` skill: read the current profile with `get_company`, then enrich the
gaps via `invoke_agent` (research + guarded update), and show the before→after diff. If a website URL
is passed as an argument, use it as the research source instead of the profile's existing URL.

Argument (optional website URL): $ARGUMENTS
