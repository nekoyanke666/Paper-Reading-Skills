---
name: paper-narrative
description: Internal interface. Build an overview, full-paper explanation, post-figure integration, or scoped review by linking research questions and evidence while tracking coverage against actual source sections.
---

# Paper Narrative

Input: verified whole-paper model or explicitly limited local scope, original text, and progress. Output: the requested narrative in the saved language, source crosswalk, open issues, and resume point. Follow paper-teach and paper-evidence without independently switching stages.

## 1. Choose the narrative mode

- **Overview:** existing knowledge, gap, question, research object, principal findings, and significance; do not front-load all methods.
- **Full explanation:** a self-contained expert account of the entire paper for a reader with no earlier teaching context, backed by a complete manuscript. Read the [full-explanation contract](references/full-explanation.md) for a history-independent core, optional recorded connections, breadth, technical depth, runs, segmentation and completion. Its scope comes from the paper, not details left over from earlier figure reading or questions.
- **Post-figure integration:** return to relevant prose, methods, and discussion to add material the figures do not convey sufficiently and check their joint conclusions.
- **Scoped review:** only already-covered or requested material, retaining terminology, evidence, and limitations while distinguishing unread content. Understanding checks and requested quizzes use paper-answer.

## 2. Plan a source-to-topic crosswalk

Establish what the field knew, what remained unknown, what this paper addresses, and its main findings and significance.

For full explanation, inventory the actual abstract/central claims, introduction/gap, each result or argument section, relevant methods/proofs/materials, discussion and boundaries, and all other substantive content. Adapt theory, computational, qualitative, humanities, review, and mixed studies to real structure rather than forcing IMRaD or inventing sections.

Save each topic's source, section/paragraph, and conceptual dependencies. Establish the whole outline and integrated model before delivery. In full-explanation mode, turn that model into a complete saved manuscript before presenting its chapters; a plan for later topics is insufficient.

## 3. Develop the research logic

Proceed through the relationship between questions and evidence. Source order may change to aid understanding, but explain why the next topic is needed and retain source locations.

Develop ideas in dependency order without omitting crucial premises or limits. Connect the live problem, necessary concepts, design/argument, actual result, interpretation, sources, and alternatives in continuous explanatory prose. These are ingredients of the argument, not mandatory headings or a separate response per ingredient. In full explanation, choose substantial chapters of the whole manuscript and explicitly restate what a later inference needs. Previously explained figures or answers do not supply an explanation missing here. Earlier personal connections are optional supplements after the relevant core account; they do not decide its scope or replace its argument.

Full explanation of methods must cover what affects design, measurement, analysis, reproducibility, and interpretation. Explain the purpose and location of remaining concrete procedures rather than skipping the section. The caller obtains relevant figure, methods, or code checks through their interfaces.

## 4. Integrate and audit scope

After main figures, return to prose for background, methods, discussion, and limitations not fully shown, and check whether the corresponding evidence supports author claims.

Apply this to the selected mode: post-figure integration supplies the research thread and needed prose without claiming full-text teaching; full explanation audits every substantive section/topic. Explain the authors' synthesis, significance, applicability, and unknowns, and check for abstract/discussion overreach.

Return explained, unexplained, and gap-affected ranges, source crosswalk, necessary recall, questions, and next step. In full explanation, audit the entire paper and separately record manuscript coverage and chapters actually delivered; a resolved local chain does not complete the whole paper. In other modes completion applies to the requested question–evidence–conclusion chain. Labels must match actual teaching.
