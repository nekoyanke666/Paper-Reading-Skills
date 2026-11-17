---
name: paper-skill-help
description: Explain the six public paper skills, their order, purposes and example requests. Include creating terminology or explanation trees in the same map, with explicit integration, no integration, or a proposed integration awaiting the user's choice. Works without a paper and does not execute the examples.
---

# Paper Skill Help

Explain how to use this package. This is a read-only help request, not preparation, paper teaching or map editing. Do not ask for a paper, translation settings or startup configuration merely to show help. Do not execute example requests or start a map service.

Use the saved interaction language if the active session is already available; otherwise use the user's current conversation language. Reading package instructions to check capabilities does not require loading private paper files.

## Present the available skills

List these six public skills with a short purpose and a usable example for each, translating the example prose into the reader's language while keeping skill names literal:

1. [paper-prepare](../paper-prepare/SKILL.md): begin with a primary paper; confirm the output/interaction language and whether a full translation is wanted, default Yes; collect and check sources, establish an expert perspective and whole-paper memory, and prepare the stable map entry. Example: `$paper-prepare Prepare this paper, collect its supplements, and ask me for the output language and full-translation preference.`
2. [paper-figure-explain](../paper-figure-explain/SKILL.md): introduce the paper briefly, then display and explain main figures and panels in order with necessary background, methods, evidence and limits. Example: `$paper-figure-explain Explain the main figures in order, introducing the terms I need before each figure.`
3. [paper-detail-explain](../paper-detail-explain/SKILL.md): teach the entire paper as a coherent narrative from background, discovery of the problem and motivation through methods, calculations, results and limitations. A new full explanation follows this whole-paper narrative; saved progress resumes only when continuation is requested. Example: `$paper-detail-explain Explain the entire study as a connected story for someone outside the field, including its methods and calculations.`
4. [paper-ask](../paper-ask/SKILL.md): answer a specific question directly, then recall necessary concepts and explain supporting evidence, correct mistaken premises, and retain the interrupted reading position. Example: `$paper-ask Why does this control support the authors' conclusion, and what does it still fail to rule out?`
5. [paper-add-map](../paper-add-map/SKILL.md): add a new topic tree to the same paper map, optionally integrating selected content into related existing trees. It can be an unconnected glossary or a connected explanation. Example: `$paper-add-map Add a glossary tree for the library types used in this paper; keep it separate from the other trees.`
6. `paper-skill-help`: show this list, explain workflow differences and give examples without modifying the paper or map. Example: `$paper-skill-help Show the available skills and examples of adding a tree with and without integration.`

Describe the usual order as prepare, figure overview, then complete explanation; questions can interrupt any stage, and new topic trees can be requested whenever useful. This is guidance, not a mandatory sequence. A narrow question does not require completing every preceding stage.

## Always explain the tree choices

Include both integrated and non-integrated examples whenever presenting the full skill list or explaining paper-add-map. For a narrowly scoped help question, answer that question first and offer only relevant examples.

- **No integration:** create a new selectable tree under the same map link, without adding its content to existing trees. Example: `$paper-add-map Create a terminology tree for the evaluation metrics. Just list and define them, with no connections unless necessary, and do not integrate them into other trees.`
- **Integration requested:** keep the new tree and add the relevant concepts and supported relations to selected related trees. Example: `$paper-add-map Build a tree explaining normalization, and integrate the relevant parts into the methods and evaluation trees.`
- **Preference unstated:** the expert inspects related trees. If worthwhile integration is found, the independent new tree is usable first, and a popup asks about a concrete proposal before existing trees are changed. Example: `$paper-add-map Add a tree about uncertainty and check whether parts would help the other trees; propose integrations for me to choose.`

Clarify that identical concepts can reuse the same global node in different trees, with visible cross-tree navigation, even when content integration is declined. That reuse does not itself add nodes or edges to an old tree. A lookup catalog may contain zero edges; a connected explanation uses only relationships whose meanings and evidence are justified. Do not promise arbitrary links simply because two terms occur together.

## Keep the boundary clear

Only these six are public entry skills. The thirteen internal interfaces are supporting resources called as needed, not extra commands the reader must learn. To answer a deeper capability question, read the relevant linked entry and its focused references; do not claim unimplemented features. If the user now explicitly requests an action, route to that entry rather than silently executing a help example.
