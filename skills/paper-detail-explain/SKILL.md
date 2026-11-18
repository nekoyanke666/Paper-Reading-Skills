---
name: paper-detail-explain
description: Teach the entire paper as a self-contained expert narrative for a reader outside its field, with background, research logic, methods, calculations, results and limits. Prior chats are optional supplements, never prerequisites. Produce a complete reading guide; resume saved delivery only when continuation is requested.
---

# Paper Detail Explain

The primary deliverable is a complete, self-contained explanation of the paper that lets a reader outside its field return to the original text, figures, equations, and methods with understanding, even without any earlier conversation. Reconstruct why the problem matters, what was missing, how the approach addresses it, how the evidence was produced, and what the results establish. Use a paper-appropriate expert perspective without impersonating authors or inventing a history of their decisions. Earlier explanations do not supply missing premises for this deliverable.

## 1. Restore understanding and interpret the request

Read [paper-memory](../../interfaces/paper-memory/SKILL.md), [paper-expert](../../interfaces/paper-expert/SKILL.md), [paper-teach](../../interfaces/paper-teach/SKILL.md), and [paper-evidence](../../interfaces/paper-evidence/SKILL.md). Restore available language/presentation settings, paper version, expertise, source-grounded model, terminology and evidence. Reuse a valid profile for this paper or select and briefly announce the appropriate expertise through paper-expert. Run the shared startup protocol only for missing settings. Previous teaching records are optional context, not required input; their absence must not reduce the explanation's coverage.

Restoring a cursor does not select the starting point. A new request to explain the entire paper, including this entry alone, starts a new complete narrative from its opening. A request to redo an inadequate explanation also starts a new narrative while retaining prior history. Resume the saved narrative only when the user requests continuation or the ongoing context unambiguously does so. A specifically requested passage/topic stays local and does not start or complete a full-paper run. Reuse an explicit starting chapter when given; ask only if competing interpretations materially change the requested work.

Before integrated guidance, read the full text, main figures/captions, actual methods/proofs/materials, and essential supporting evidence to meet paper-memory's verified standard. Obtain missing sources through [paper-sources](../../interfaces/paper-sources/SKILL.md). Unresolved gaps require a bounded, explicitly partial deliverable; do not label a local account complete.

This entry is independent of prior figure teaching, translation, answers and older detail runs. Assume no previous exposure to this paper's concepts. For the same paper/version, expert perspective, requested scope and presentation settings, the core coverage, prerequisite chain and technical depth should remain substantially consistent with or without teaching history; wording need not be identical. Only an explicit request to narrow the scope or skip material changes that scope. Use the saved interaction language and retain the user's segmented/single preference.

## 2. Build the complete narrative before delivering chapters

Call [paper-narrative](../../interfaces/paper-narrative/SKILL.md) in full-explanation mode and read its [full-explanation contract](../../interfaces/paper-narrative/references/full-explanation.md). Build the source-to-topic crosswalk and a complete reader-facing manuscript covering the paper's substantive content. Save it under this paper's output/explanations/detail/<run-id>/manuscript.md and provide its link when ready. It must contain the explanation itself, not just an outline, summary, translation, or plan for future chapters.

Organize the manuscript by the research logic and prerequisite dependencies. Incorporate the abstract's claims, introduction, every result/argument, methods/proofs, discussion, limitations, and essential supporting evidence. Adapt to the paper's actual discipline and structure. Put a method next to the result it enables even when the source places Methods later; explain the transition and retain source locators.

State the discipline-specific expert lens briefly in the manuscript's opening, even if another entry already announced it. Let that expertise guide which background, technical steps and limitations matter; the reader should not need an earlier role announcement to understand the perspective.

Build this core from current sources and the verified research model, not by stitching together old answers, examples or chapter wording. Consult history afterward for useful optional connections, resolve any conflict against the actual sources, and apply the full-explanation contract's separation between the core and supplements. Removing every history-based supplement must leave a complete explanation.

## 3. Deliver a connected account with technical depth

Explain necessary technical vocabulary at the point of use and apply paper-teach's mandatory inline-English terminology rule on every named occurrence of an important translated concept or technical term, including repeats and bold terms. Never drop the English name because this paragraph, chapter or an earlier conversation already supplied it. Follow the shared terminology contract to retain canonical mappings, definitions, study roles and verified properties in reusable topical catalogs through paper-map. Prior figure teaching or an existing sidebar does not replace the explanation or inline English here.

Use connected explanatory prose. Establish the overall problem and contribution at the opening, then develop the narrative through the obstacles, design choices, evidence, and conclusions. Teach the necessary background before relying on it; laying groundwork prepares a later full explanation, rather than standing in for it. At a later dependency, name the concept, restate its relevant meaning or result, and explain its role now. A bare "as mentioned earlier" is insufficient. Do not turn each paragraph into a numbered question/answer checklist or a separate miniature lesson.

Call [paper-methods](../../interfaces/paper-methods/SKILL.md) for methods, statistics, equations, proofs, or design. Explain how the actual procedure transforms inputs into outputs, why the steps are justified, and how computations relate to the biological/physical/social or formal objects. Define notation and assumptions, work through important calculations/derivations with source-backed or explicitly invented teaching examples, and return to the paper's actual result and limits. Naming a method or paraphrasing a formula is insufficient.

For relevant figures call [paper-figures](../../interfaces/paper-figures/SKILL.md), display the actual figure, and integrate its evidence into the narrative rather than repeating an independent figure tour. Use [paper-code](../../interfaces/paper-code/SKILL.md) or [paper-compare](../../interfaces/paper-compare/SKILL.md) when implementation or cross-paper reasoning is needed. Figures, summaries, and analogy cannot replace explanation of the substantive text or mathematics.

## 4. Segment delivery without fragmenting the explanation

Single delivery presents the connected whole within available limits. Segmented delivery presents successive substantial chapters of the same saved manuscript. Boundaries follow meaningful stages in the research argument, not a fixed number of headings or one small concept per response. Complete the current stage's necessary background, reasoning, method, evidence, and interpretation before stopping; do not defer an immediately necessary explanation merely to create another installment.

Begin a continuation by stating the live problem and explaining the prerequisite idea needed now in actual words, with enough detail to follow this chapter even if the earlier chat is unavailable. Re-teach a missing premise when a short recap cannot carry the reasoning. Avoid a progress-report opening that assumes the reader understands the saved cursor. A checkpoint records delivery, not the extent of prior understanding or the structure of the research. If output limits interrupt a chapter, identify the precise remaining scope and preserve the connecting argument. Do not declare the entire explanation delivered just because the manuscript was written.

Route inserted questions through [paper-ask](../paper-ask/SKILL.md) with returnTo preserved. Answering a question does not complete or advance the interrupted chapter unless its substantive content was actually delivered. Resume when requested.

## 5. Save, integrate, and audit completion

Save the manuscript, chapter/source crosswalk, core coverage, optional supplements and their recorded basis, terms/claims, explanations, technical examples, limitations, open issues, and exact delivery position under progress.detail. Distinguish manuscript coverage, chapters delivered, and reader-reported understanding. Review the Completion review in the [full-explanation contract](../../interfaces/paper-narrative/references/full-explanation.md) against actual source content, including its history-removal check; an outline or a long first chapter cannot satisfy them.

On every invocation and after a complete chapter, evaluate meaningful concepts, evidence, relationships, scope, or corrections through [paper-map](../../interfaces/paper-map/SKILL.md). Mutate only when justified, preserving identities/positions, and save a no-change decision otherwise. Restore/create the stable entry and follow its first-link/update delivery contract; the map supports the narrative rather than determining its chapter order or replacing it.

Mark the requested explanation complete only when substantive coverage, source traceability, technical intelligibility, final synthesis, and actual delivery match the request. Preserve partial status and precise gaps when they do not.
