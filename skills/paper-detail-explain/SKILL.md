---
name: paper-detail-explain
description: Explain the complete paper through an appropriate expert perspective, reconstructing its motivation, methods or arguments, evidence, results, discussion, and limitations. Support segmented or single-delivery explanation in the saved language; summaries, translations, and figure recaps do not replace the full explanation.
---

# Paper Detail Explain

Help a reader outside the field understand why the research was undertaken, how it answers its question, what the evidence establishes, and what remains unknown. Use the saved expert perspective without impersonating the author or inventing motives and evidence.

## Process

### 1. Restore whole-paper understanding and position

Read [paper-memory](../../interfaces/paper-memory/SKILL.md), [paper-expert](../../interfaces/paper-expert/SKILL.md), [paper-teach](../../interfaces/paper-teach/SKILL.md), and [paper-evidence](../../interfaces/paper-evidence/SKILL.md). Restore confirmed settings, paper version, expert profile, integrated model, terms, evidence index, and detailed-explanation position. Run the shared startup protocol if no settings exist.

Before full explanation, read the whole text, main figures/captions, actual methods/proofs/materials, and essential supporting evidence to meet paper-memory's verified standard. Obtain missing sources through [paper-sources](../../interfaces/paper-sources/SKILL.md). If gaps cannot be resolved, state their impact and limit explanation to supported local content.

The user may enter this stage directly without hearing all figures or receiving a full translation first. Full translation may be disabled; prior source reading and integration are still required. Use the saved interaction language.

### 2. Plan complete coverage

Call [paper-narrative](../../interfaces/paper-narrative/SKILL.md) in full-explanation mode. Build a complete topic list and source crosswalk from actual sections, research questions, and conceptual dependencies. Save the whole plan before presenting segments, not merely the next few topics.

Default to one complete small topic per segment. Honor a request for one complete delivery. If length limits prevent completion, identify the remaining scope; segmentation must not silently omit methods, prerequisites, or limitations. It changes presentation pace, not prior understanding.

### 3. Explain through the research logic

At each segment, restore the integrated model, current source, and necessary surrounding material. Follow paper-narrative's topic process: the question being continued, prerequisite concepts, design/argument, actual results, author interpretation, and limits. Explain changes in source order and retain section/paragraph locations.

For figures, call [paper-figures](../../interfaces/paper-figures/SKILL.md), display the actual relevant figure, and connect it to source/translation locations when available. Recall previously explained figures only as needed rather than restarting the whole figure stage. For methods, statistics, equations, proofs, or design, call [paper-methods](../../interfaces/paper-methods/SKILL.md). For implementation or cross-paper reasoning, call [paper-code](../../interfaces/paper-code/SKILL.md) or [paper-compare](../../interfaces/paper-compare/SKILL.md).

Adapt to the actual contribution: theoretical definitions, assumptions, propositions and proofs; computational algorithms, data and evaluation; or qualitative/humanities materials and interpretation. Do not force every paper into an experimental structure.

### 4. Save segments and handle questions

Save verifiable explanatory content, sources, shared terms, claims, limitations, open questions, and the next segment. On every invocation, and after each complete topic in a longer run, evaluate whether important concepts, evidence, relationships, scope, or corrections require a tree update. Apply meaningful changes through [paper-map](../../interfaces/paper-map/SKILL.md), retain identities/positions, and save a no-change decision when appropriate. Evaluation is required; adding nodes is conditional.

Restore the stable entry prepared for this paper, or create a minimal one if this stage was entered directly without an entry. Follow paper-map's link-delivery contract: give the first usable link in this conversation, then reuse that entry and briefly state meaningful updates rather than repeatedly presenting new links.

Route inserted questions through [paper-ask](../paper-ask/SKILL.md) with returnTo preserved. Resume at the interruption when requested. A question answer does not complete the original topic.

### 5. Integrate and verify the complete paper

Explain the authors' synthesis, significance, generalizability, limitations, and unknowns. Recheck whether the abstract and central claims have corresponding evidence. Audit the complete topic list for explained, unexplained, and gap-affected items; apply paper-narrative's methods-coverage requirement.

Mark completion only when the requested scope has been substantively explained, sources are traceable, gaps are explicit, and progress is recoverable. Completed translation, summary, or figure guidance cannot substitute for completed full-paper explanation.
