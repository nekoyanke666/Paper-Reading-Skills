---
name: paper-ask
description: Answer paper questions directly, then explain with necessary recall, concepts, and evidence. Handle figures, methods, translation, code, comparison, hypotheses, understanding checks, corrections, unlisted cases, and reopening saved maps while preserving the saved language and interrupted reading position.
---

# Paper Ask

Answer the current question while preserving the whole-paper context and ongoing reading task. A question does not automatically restart preparation, all figures, or full explanation.

For a request only to open or reopen an existing map, restore the active paper/location through [paper-memory](../../interfaces/paper-memory/SKILL.md), then use [paper-map](../../interfaces/paper-map/SKILL.md) and its [opening contract](../../interfaces/paper-map/references/open-entry.md). Check/recover the local service and open its web URL in the host browser panel when available. Preserve the reading position, save a no-change map review, and finish without restarting setup or research teaching. For a mixed opening/content request, open the map and continue with the process below.

For an explicit request to add a new topic tree, route to [paper-add-map](../paper-add-map/SKILL.md); preserve any accompanying question and return point. For package usage or a list of skills, use [paper-skill-help](../paper-skill-help/SKILL.md). A local concept question alone does not imply a request for a new tree.

## Process

### 1. Restore the question's context

Read [paper-memory](../../interfaces/paper-memory/SKILL.md) to restore paper identity/version, settings, integrated model, relevant terms, claims, and sources. If a question interrupts figure or detailed explanation, save the original entry, topic/figure/paragraph, and next step in returnTo, separately from the question record.

Read [paper-expert](../../interfaces/paper-expert/SKILL.md), [paper-teach](../../interfaces/paper-teach/SKILL.md), and [paper-evidence](../../interfaces/paper-evidence/SKILL.md). If no profile exists, choose one from available material and announce it briefly. If this is the first entry, complete the shared startup settings before language-dependent output; independent source inspection may proceed while answers are pending. Partial sources may support a local answer, but not a claim of full-paper understanding.

### 2. Apply the answer contract before routing

Read [paper-answer](../../interfaces/paper-answer/SKILL.md). Its direct-answer, necessary-recall, incorrect-premise, and ambiguity rules apply to every case and cannot be replaced by case classification. Answer in the saved interaction language, regardless of whether full translation was enabled.

Explain technical vocabulary needed for the answer in place, with names and study-specific meanings. Apply paper-teach's mandatory inline-English terminology rule on every named occurrence of an important translated concept or technical term, including repeated mentions in the same answer, recaps and bold terms. Prior answers or earlier English labels never license omission. Follow the shared terminology contract to save canonical mappings and useful definitions/properties, and evaluate topical catalogs through paper-map even if the answer does not change the main research chain.

Use its routing to select the smallest sufficient set of interfaces. After specialist checks, return to the original question and organize the answer. Handle mixed questions in dependency order without cycling through entries. For an unlisted case, use the general fallback to answer supported parts and identify specific unknowns and gaps.

### 3. Save new understanding and corrections

Save the question, answer basis, necessary terms, important claims, open issues, and corrections through paper-memory. When a previous answer is challenged, apply paper-evidence to verify it and address dependent conclusions, not just the last sentence.

Every invocation evaluates whether the answer changes important concepts, relationships, evidence, scope, or corrections. Apply meaningful updates through [paper-map](../../interfaces/paper-map/SKILL.md); otherwise save a no-change decision and retain the tree. Repeated questions may improve definitions without forcing new nodes or trees.

Restore the paper's stable entry. If none exists because this is a direct first entry, create a minimal one after settings are confirmed without restarting full preparation. Follow paper-map's link-delivery contract: give the first usable link in this conversation, then reuse it and briefly report meaningful changes.

### 4. Finish the answer and retain the return point

Confirm the direct question, required prerequisites, and traceable evidence have been addressed, or explain remaining obstacles, their effects, and needed material. Save the result while keeping translation, figure, and detailed-explanation completion truthful.

Resume from returnTo when the user asks to continue. If the user explicitly switches stages, call [paper-prepare](../paper-prepare/SKILL.md), [paper-figure-explain](../paper-figure-explain/SKILL.md), or [paper-detail-explain](../paper-detail-explain/SKILL.md). If memory cannot be read, state that limitation rather than pretending to remember the interruption.
