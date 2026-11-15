---
name: paper-detail-explain
description: Teach the entire paper as a coherent, source-grounded narrative for a reader outside its field, from background and research problem through methods, calculations, results, and implications. Produce a complete reading guide; segmented delivery follows that narrative, and saved progress resumes only when continuation is requested.
---

# Paper Detail Explain

The primary deliverable is a complete, connected explanation of the paper that lets a reader outside its field return to the original text, figures, equations, and methods with understanding. Reconstruct why the problem matters, what was missing, how the approach addresses it, how the evidence was produced, and what the results establish. Use the saved expert perspective without impersonating authors or inventing a history of their decisions.

## 1. Restore understanding and interpret the request

Read [paper-memory](../../interfaces/paper-memory/SKILL.md), [paper-expert](../../interfaces/paper-expert/SKILL.md), [paper-teach](../../interfaces/paper-teach/SKILL.md), and [paper-evidence](../../interfaces/paper-evidence/SKILL.md). Restore confirmed language/presentation settings, paper version, expertise, integrated model, terminology, evidence, and previous explanations. Run the shared startup protocol only for missing settings.

Restoring a cursor does not select the starting point. A new request to explain the entire paper, including this entry alone, starts a new complete narrative from its opening. A request to redo an inadequate explanation also starts a new narrative while retaining prior history. Resume the saved narrative only when the user requests continuation or the ongoing context unambiguously does so. A specifically requested passage/topic stays local and does not start or complete a full-paper run. Reuse an explicit starting chapter when given; ask only if competing interpretations materially change the requested work.

Before integrated guidance, read the full text, main figures/captions, actual methods/proofs/materials, and essential supporting evidence to meet paper-memory's verified standard. Obtain missing sources through [paper-sources](../../interfaces/paper-sources/SKILL.md). Unresolved gaps require a bounded, explicitly partial deliverable; do not label a local account complete.

This entry is independent of prior figure teaching or full translation. Previously covered material remains part of the narrative when necessary; familiarity permits concise recall, not omission. Use the saved interaction language and retain the user's segmented/single preference.

## 2. Build the complete narrative before delivering chapters

Call [paper-narrative](../../interfaces/paper-narrative/SKILL.md) in full-explanation mode and read its [full-explanation contract](../../interfaces/paper-narrative/references/full-explanation.md). Build the source-to-topic crosswalk and a complete reader-facing manuscript covering the paper's substantive content. Save it under this paper's output/explanations/detail/<run-id>/manuscript.md and provide its link when ready. It must contain the explanation itself, not just an outline, summary, translation, or plan for future chapters.

Organize the manuscript by the research logic and prerequisite dependencies. Incorporate the abstract's claims, introduction, every result/argument, methods/proofs, discussion, limitations, and essential supporting evidence. Adapt to the paper's actual discipline and structure. Put a method next to the result it enables even when the source places Methods later; explain the transition and retain source locators.

## 3. Deliver a connected account with technical depth

Use connected explanatory prose. Establish the overall problem and contribution at the opening, then develop the narrative through the obstacles, design choices, evidence, and conclusions. Briefly reactivate earlier concepts where they become useful and explain why each next step follows. Do not turn each paragraph into a numbered question/answer checklist or a separate miniature lesson.

Call [paper-methods](../../interfaces/paper-methods/SKILL.md) for methods, statistics, equations, proofs, or design. Explain how the actual procedure transforms inputs into outputs, why the steps are justified, and how computations relate to the biological/physical/social or formal objects. Define notation and assumptions, work through important calculations/derivations with source-backed or explicitly invented teaching examples, and return to the paper's actual result and limits. Naming a method or paraphrasing a formula is insufficient.

For relevant figures call [paper-figures](../../interfaces/paper-figures/SKILL.md), display the actual figure, and integrate its evidence into the narrative rather than repeating an independent figure tour. Use [paper-code](../../interfaces/paper-code/SKILL.md) or [paper-compare](../../interfaces/paper-compare/SKILL.md) when implementation or cross-paper reasoning is needed. Figures, summaries, and analogy cannot replace explanation of the substantive text or mathematics.

## 4. Segment delivery without fragmenting the explanation

Single delivery presents the connected whole within available limits. Segmented delivery presents successive substantial chapters of the same saved manuscript. Boundaries follow meaningful stages in the research argument, not a fixed number of headings or one small concept per response. Complete the current stage's necessary background, reasoning, method, evidence, and interpretation before stopping; do not defer an immediately necessary explanation merely to create another installment.

Begin a continuation with a short recall of the unresolved problem and the earlier idea needed now, then continue the argument. Avoid a progress-report opening that assumes the reader understands the saved cursor. A checkpoint records delivery, not the extent of prior understanding or the structure of the research. If output limits interrupt a chapter, identify the precise remaining scope and preserve the connecting argument. Do not declare the entire explanation delivered just because the manuscript was written.

Route inserted questions through [paper-ask](../paper-ask/SKILL.md) with returnTo preserved. Answering a question does not complete or advance the interrupted chapter unless its substantive content was actually delivered. Resume when requested.

## 5. Save, integrate, and audit completion

Save the manuscript, chapter/source crosswalk, terms/claims, explanations, technical examples, limitations, open issues, and exact delivery position under progress.detail. Distinguish manuscript coverage, chapters delivered, and reader-reported understanding. Review the Completion review in the [full-explanation contract](../../interfaces/paper-narrative/references/full-explanation.md) against actual source content; an outline or a long first chapter cannot satisfy them.

On every invocation and after a complete chapter, evaluate meaningful concepts, evidence, relationships, scope, or corrections through [paper-map](../../interfaces/paper-map/SKILL.md). Mutate only when justified, preserving identities/positions, and save a no-change decision otherwise. Restore/create the stable entry and follow its first-link/update delivery contract; the map supports the narrative rather than determining its chapter order or replacing it.

Mark the requested explanation complete only when substantive coverage, source traceability, technical intelligibility, final synthesis, and actual delivery match the request. Preserve partial status and precise gaps when they do not.
