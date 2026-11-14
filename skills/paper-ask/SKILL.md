---
name: paper-ask
description: Answer paper questions directly, then explain with necessary recall, concepts, and evidence. Handle figures, methods, translation, code, comparison, hypotheses, understanding checks, corrections, and unlisted cases while preserving the saved language and interrupted reading position.
---

# Paper Ask

Answer the current question while preserving the whole-paper context and ongoing reading task. A question does not automatically restart preparation, all figures, or full explanation.

## Process

### 1. Restore the question's context

Read [paper-memory](../../interfaces/paper-memory/SKILL.md) to restore paper identity/version, settings, integrated model, relevant terms, claims, and sources. If a question interrupts figure or detailed explanation, save the original entry, topic/figure/paragraph, and next step in returnTo, separately from the question record.

Read [paper-expert](../../interfaces/paper-expert/SKILL.md), [paper-teach](../../interfaces/paper-teach/SKILL.md), and [paper-evidence](../../interfaces/paper-evidence/SKILL.md). If no profile exists, choose one from available material and announce it briefly. If this is the first entry, complete the shared startup settings before language-dependent output; independent source inspection may proceed while answers are pending. Partial sources may support a local answer, but not a claim of full-paper understanding.

### 2. Apply the answer contract before routing

Read [paper-answer](../../interfaces/paper-answer/SKILL.md). Its direct-answer, necessary-recall, incorrect-premise, and ambiguity rules apply to every case and cannot be replaced by case classification. Answer in the saved interaction language, regardless of whether full translation was enabled.

Use its routing to select the smallest sufficient set of interfaces. After specialist checks, return to the original question and organize the answer. Handle mixed questions in dependency order without cycling through entries. For an unlisted case, use the general fallback to answer supported parts and identify specific unknowns and gaps.

### 3. Save new understanding and corrections

Save the question, answer basis, necessary terms, important claims, open issues, and corrections through paper-memory. When a previous answer is challenged, apply paper-evidence to verify it and address dependent conclusions, not just the last sentence.

Call [paper-map](../../interfaces/paper-map/SKILL.md) only when the expert judges that an important concept, relationship, evidence change, or correction warrants it. Repeated questions can trigger recall or improved definitions without forcing new nodes or trees.

### 4. Finish the answer and retain the return point

Confirm the direct question, required prerequisites, and traceable evidence have been addressed, or explain remaining obstacles, their effects, and needed material. Save the result while keeping translation, figure, and detailed-explanation completion truthful.

Resume from returnTo when the user asks to continue. If the user explicitly switches stages, call [paper-prepare](../paper-prepare/SKILL.md), [paper-figure-explain](../paper-figure-explain/SKILL.md), or [paper-detail-explain](../paper-detail-explain/SKILL.md). If memory cannot be read, state that limitation rather than pretending to remember the interruption.
