---
name: paper-skill-help
description: Explain the seven public paper skills, their order, purposes and example requests. Include creating terminology or explanation trees in the same map, with explicit integration, no integration, or a proposed integration awaiting the user's choice. Works without a paper and does not execute the examples.
---

# Paper Skill Help

**The user's time is valuable.** Minimize unnecessary waiting: reuse valid work, load only relevant material, and avoid redundant steps while preserving the requested completeness, evidence checks and saved-state safety.

Explain how to use this package. This is a read-only help request, not preparation, paper teaching or map editing. Do not ask for a paper, translation settings or startup configuration merely to show help. Do not execute example requests or start a map service.

Use the saved interaction language if the active session is already available; otherwise use the user's current conversation language. Reading package instructions to check capabilities does not require loading private paper files.

## Present the available skills

List these seven public skills with a short purpose and a usable example for each, translating the example prose into the reader's language while keeping skill names literal:

1. [paper-prepare](../paper-prepare/SKILL.md): begin with a primary paper, confirm language/full-translation preference, check sources, establish the expert perspective and memory, and prepare the stable map entry. Example: `$paper-prepare Prepare this paper and collect the sources needed to understand it.`
2. [paper-simple-explain](../paper-simple-explain/SKILL.md): give a short, standalone story of the main research problem, reason for the approach, key evidence and limits. Use motivated small-topic headings without the full-detail manuscript or exhaustive derivations. Example: `$paper-simple-explain Explain the paper's main story briefly, making clear why each step is needed and which evidence supports it.`
3. [paper-figure-explain](../paper-figure-explain/SKILL.md): introduce the paper and explain main figures/panels in order with necessary background, methods, evidence and limits. Example: `$paper-figure-explain Explain the main figures in order, introducing the terms I need before each figure.`
4. [paper-detail-explain](../paper-detail-explain/SKILL.md): teach the entire paper independently, including methods and calculations, with readable small-topic headings and a clear task/reason/source lead before technical content. Mark mainly supporting-source topics required/optional. New full requests start at the opening; saved progress resumes only for continuation. Example: `$paper-detail-explain Explain the whole paper in manageable chapters with small headings, strong reasons for each topic, and clear links to the paper's text and figures.`
5. [paper-ask](../paper-ask/SKILL.md): answer a specific question directly with necessary recall and evidence, retaining the interrupted reading position. Example: `$paper-ask Why does this control support the authors' conclusion, and what does it still fail to rule out?`
6. [paper-add-map](../paper-add-map/SKILL.md): add a topic tree to the same map, with independent or selectively integrated content. Example: `$paper-add-map Add a glossary tree for the library types used in this paper; keep it separate from the other trees.`
7. `paper-skill-help`: show these seven entries and relevant examples without modifying paper/map state. Example: `$paper-skill-help Show the available skills and examples of adding a tree with and without integration.`

Describe a useful order as prepare, an optional simple main-story explanation, then figures or full detail as needed; questions can interrupt any stage, and new topic trees can be requested whenever useful. Explain that simple and detail are alternative depths with independent progress; simple does not automatically run or complete detail. This is guidance, not a mandatory sequence. A narrow question does not require completing every preceding stage.

Mention that detail, simple, figure and ask explanations pair every occurrence of an important translated concept or technical term with its verified English name, including repeated and bold mentions. This supports direct lookup in the source and does not change the saved interaction language.

## Always explain the tree choices

Include both integrated and non-integrated examples whenever presenting the full skill list or explaining paper-add-map. For a narrowly scoped help question, answer that question first and offer only relevant examples.

- **No integration:** create a new selectable tree under the same map link, without adding its content to existing trees. Example: `$paper-add-map Create a terminology tree for the evaluation metrics. Just list and define them, with no connections unless necessary, and do not integrate them into other trees.`
- **Integration requested:** keep the new tree and add the relevant concepts and supported relations to selected related trees. Example: `$paper-add-map Build a tree explaining normalization, and integrate the relevant parts into the methods and evaluation trees.`
- **Preference unstated:** the expert inspects related trees. If worthwhile integration is found, the independent new tree is usable first, and a popup asks about a concrete proposal before existing trees are changed. Example: `$paper-add-map Add a tree about uncertainty and check whether parts would help the other trees; propose integrations for me to choose.`

Clarify that identical concepts can reuse the same global node in different trees, with visible cross-tree navigation, even when content integration is declined. That reuse does not itself add nodes or edges to an old tree. A lookup catalog may contain zero edges; a connected explanation uses only relationships whose meanings and evidence are justified. Do not promise arbitrary links simply because two terms occur together.

Explain that the map is organized from the appropriate domain expert's view of the knowledge and research logic, not the order of questions in the chat. Node names stay concise; clicking them opens a substantive, self-contained explanation of the object/concept, relevant workings and study role, rather than an earlier-example reference or a warning about a figure.

When explaining map text capabilities, mention that sidebars support Markdown and inline/display LaTeX math, including fractions and matrices. The source is preserved in Save history and rendered locally with bundled libraries/fonts. Short canvas names remain literal text. Give syntax examples only when relevant to the help question.

## Keep the boundary clear

Only these seven are public entry skills. The thirteen internal interfaces are supporting resources called as needed, not extra commands the reader must learn. To answer a deeper capability question, read the relevant linked entry and its focused references; do not claim unimplemented features. If the user now explicitly requests an action, route to that entry rather than silently executing a help example.
