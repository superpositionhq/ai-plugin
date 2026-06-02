---
description: Review awaiting-review candidates one by one — you make each call (human-in-the-loop).
argument-hint: "[job name or id — optional; defaults to all active jobs]"
---

Use the `review-candidates-human-loop` skill: present each awaiting-review candidate's FitCheck
summary with their link, and wait for my decision (advance / pass / hold) before recording it via
`invoke_agent`. Do not decide on my behalf. Scope: $ARGUMENTS
