---
name: paper-answer
description: Internal interface. Apply the common answer contract before paper-ask routes any case, covering direct response, necessary recall, premise correction, and ambiguity handling, followed by specialist checks or the mixed/unlisted-case fallback.
---

# Paper Answer

**The user's time is valuable.** Minimize unnecessary waiting: reuse valid work, load only relevant material, and avoid redundant steps while preserving the requested completeness, evidence checks and saved-state safety.

Input: question, restored paper context, sources, and accessible common rules. Output: a direct, justified answer in the saved interaction language, unresolved parts, and memory updates.

## 1. Apply the common answer contract

Follow [paper-teach](../paper-teach/SKILL.md) and [paper-evidence](../paper-evidence/SKILL.md). Reuse them if the caller already read them and they remain accessible. Every case below is governed by these rules:

- Answer briefly and directly first, then provide the prior context, explanation, and evidence needed to understand it. If a crucial concept must be clarified before the answer, explain why.
- If the question contains an incorrect premise, identify it clearly and respectfully, give a more accurate formulation, and do not continue reasoning from the error.
- If context supports a likely interpretation, answer it and state that interpretation. Ask only when different interpretations would materially change the answer.

Complete necessary source checks before presenting the answer. “Direct answer first” governs presentation, not guessing a conclusion before finding evidence.

Use already verified, still-current material when it answers the question; retrieve additional passages only for material uncertainty, missing support or an explicit audit. A short question does not need all specialist interfaces, a full source inventory or a map rebuild. If some parts are established while others need checking, distinguish the verified finding from the unresolved scope in a concise progress update, then complete the necessary checks. Keep the final answer direct and self-contained, without delaying it for unrelated maintenance or repeated validation.

## 2. Obtain the smallest sufficient specialist checks

Select from the question and source, combining interfaces only as needed. Return to the original question after specialist work rather than cycling through entries.

- **Open or reopen an existing map:** use [paper-map](../paper-map/SKILL.md) and its [opening contract](../paper-map/references/open-entry.md) to recover the local service and show its web entry. Opening alone does not start a teaching session; preserve the reading cursor and map data.
- **Concepts, terminology, mechanisms, or confusion:** locate relevant source and prior explanation; supply prerequisites, study-specific use, and necessary recall. If confusion persists, take smaller steps and use a paper-specific or bounded teaching example.
- **Figure, panel, legend, experimental group, or control:** call [paper-figures](../paper-figures/SKILL.md) locally and display the original figure; do not start all-figure guidance.
- **Methods, statistics, equations, proofs, or design:** call [paper-methods](../paper-methods/SKILL.md) to explain how evidence is produced and under which conditions.
- **Translation, sentence meaning, reference, or translation correction:** call [paper-translate](../paper-translate/SKILL.md) for the relevant passage. A local translation request is valid even if full-paper translation is disabled.
- **Sufficient evidence, causality, alternatives, or generalizability:** use paper-evidence's deeper claim and discriminating-evidence checks.
- **New material, version, or correction notice:** call [paper-sources](../paper-sources/SKILL.md) in update mode, preserving the primary paper and explaining effects on the question and previous conclusions.
- **Code, data flow, or reproduction:** call [paper-code](../paper-code/SKILL.md), distinguishing reading, execution, and result verification.
- **Cross-paper comparison, conflict, or novelty:** call [paper-compare](../paper-compare/SKILL.md), checking comparability first.
- **New hypothesis or follow-up research:** use paper-methods' follow-up mode and distinguish proposals from completed work.
- **Review or understanding check:** use [paper-narrative](../paper-narrative/SKILL.md) review mode if organization is needed. Identify correct, incomplete, and mistaken understanding. Give quizzes only when requested, emphasizing explanation, comparison, and evidence judgment; explain answer rationales. A quiz is not a prerequisite for continuing.
- **A previous answer may be wrong:** verify original sources with paper-evidence, correct the statement and its consequences, then answer.

## 3. Handle mixed, unlisted, and unsupported cases

If no label fits, identify the underlying question and desired output rather than stopping for lack of a case. Apply the same contract and locate directly relevant text, captions, methods, or supplements. Verify and separately identify external background when needed.

Break mixed questions into their conceptual dependencies, answer supported parts, and separate known facts, inference, and unknowns. Ask for a critical missing referent only if ambiguity materially changes the answer, while completing independent parts.

If data or capability is insufficient, specify the missing evidence, affected judgment, feasible scope, and next step. Do not invent content or claim unperformed work. A useful new case can be logged as a suggestion without silently rewriting reusable interfaces.

## 4. Return to the question entry

Check the direct question, prerequisites, prior connections, and evidence are addressed, or identify the specific remaining obstacle. Return terms, claims, sources, comprehension questions, and corrections to paper-ask for saving. Map updates remain subject to its importance judgment.
