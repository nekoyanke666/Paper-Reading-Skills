---
name: paper-narrative
description: Internal interface. Build an overview, full-paper explanation, post-figure integration, or scoped review by linking research questions and evidence while tracking coverage against actual source sections.
---

# Paper Narrative

Input: verified whole-paper model or explicitly limited local scope, original text, and progress. Output: the requested narrative in the saved language, source crosswalk, open issues, and resume point. Follow paper-teach and paper-evidence without independently switching stages.

## 1. Choose the narrative mode

- **Overview:** existing knowledge, gap, question, research object, principal findings, and significance; do not front-load all methods.
- **Full explanation:** the complete research logic and substantive content for paper-detail-explain, not merely details omitted during figure reading.
- **Post-figure integration:** return to relevant prose, methods, and discussion to add material the figures do not convey sufficiently and check their joint conclusions.
- **Scoped review:** only already-covered or requested material, retaining terminology, evidence, and limitations while distinguishing unread content. Understanding checks and requested quizzes use paper-answer.

## 2. Plan a source-to-topic crosswalk

Establish what the field knew, what remained unknown, what this paper addresses, and its main findings and significance.

For full explanation, inventory the actual abstract/central claims, introduction/gap, each result or argument section, relevant methods/proofs/materials, discussion and boundaries, and all other substantive content. Adapt theory, computational, qualitative, humanities, review, and mixed studies to real structure rather than forcing IMRaD or inventing sections.

Save each topic's source, section/paragraph, and conceptual dependencies. Establish the whole outline and integrated model before delivering segments or a single complete explanation.

## 3. Develop the research logic

Proceed through the relationship between questions and evidence. Source order may change to aid understanding, but explain why the next topic is needed and retain source locations.

Explain one complete small topic at a time without omitting crucial premises or limits. State the continuing question, necessary concepts, prior connections, author claim, design/argument, actual result, interpretation, evidence location, reasonable alternatives, and reason for the next step. Previously explained figures still need relevant recall; exposure is not understanding.

Full explanation of methods must cover what affects design, measurement, analysis, reproducibility, and interpretation. Explain the purpose and location of remaining concrete procedures rather than skipping the section. The caller obtains relevant figure, methods, or code checks through their interfaces.

## 4. Integrate and audit scope

After main figures, return to prose for background, methods, discussion, and limitations not fully shown, and check whether the corresponding evidence supports author claims.

Apply this to the selected mode: post-figure integration supplies the research thread and needed prose without claiming full-text teaching; full explanation audits every substantive section/topic. Explain the authors' synthesis, significance, applicability, and unknowns, and check for abstract/discussion overreach.

Return explained, unexplained, and gap-affected ranges, source crosswalk, necessary recall, questions, and next step. Completion means the current question–evidence–conclusion chain is understandable and completion labels match actual teaching.
