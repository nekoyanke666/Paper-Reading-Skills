# Direction Focus for Selected Nodes

Read when building, upgrading or checking node selection and relationship rendering. The fixed implementation is assets/focus-viewer.js with the maintained shell styles/markers. This is a presentation mode within paper-map, not another public entry, relationship type, or saved tree.

## Relative direction

Use only actual relationships in the current tree/detail view. Classify each incident edge relative to the selected node using its canonical from/to and the registry's directed flag:

- Incoming: blue #356ecc. A different source points to the selected target.
- Outgoing: green #147c62. The selected source points to another target.
- Self: purple #8657bf. A directed edge starts and ends at the selected node.
- Undirected: slate #64748b. The registry specifies no direction; neither endpoint is presented as a cause or given an arrow. This rule takes priority even for an undirected self-relation if the registry permits one.

These colors encode direction relative to the current selection only. They do not replace predicates, source evidence, conditions, uncertainty, or causal/proof qualifications. Selecting a different node can reverse incoming/outgoing colors without reversing the underlying edge. Closing selection restores the registered semantic palette.

Selection also follows [temporary inspection and return](interaction.md): capture the browsing camera before centering the first inspected node, retain it through related inspections, and restore its position and scale when selection closes. Do not recenter the whole tree on close or let sidebar resize override that restoration. Focus colors and the return point are transient presentation state, not saved graph edits.

## Canvas treatment

Dim unrelated edges and nodes while keeping them available for inspection. Draw incident edges after background edges; add a light under-stroke at crossings, a stronger selected stroke, readable canonical labels and enlarged endpoint markers. Preserve a T endpoint for inhibition and no arrow for an undirected relation. Keep dashed hypothesis/unresolved/user-note styling; dashes never encode incoming versus outgoing. A self-edge remains a separate visible cubic loop even in straight-line mode.

Distinguish reciprocal edges independently: A to B and B to A have separate paths, endpoint markers and colors relative to the selected node. A neighboring node linked in both directions uses a blue/green outline rather than the purple self-loop color. Unidirectional neighbors use their incident direction's color; mixed directed/undirected cases retain explicit edge-level labels and sidebar entries. Shared membership badges and node names remain concise.

Do not relocate nodes, create edges, reverse endpoints, invent hidden connections, alter the detail view or write a Save checkpoint to produce this effect. Geometry, graph records and saved history remain unchanged. No perpetual animation or additional permanent toolbar is needed.

## Text and accessibility

Place connection groups immediately after the selected node's description so that they are discoverable before long sources, definitions and limits. Include only nonempty Incoming, Outgoing, Self and Undirected groups, with matching colored accents and localized headings. Each clickable row shows the canonical relationship/status and explicit endpoint names: source -> target, source -| target for inhibition, or endpoint <-> endpoint when undirected. The visible viewer uses the corresponding arrow/T/undirected glyphs. Clicking opens that exact relationship's evidence and conditions.

The canvas relationship's accessible name and tooltip include endpoints, predicate/status, and direction relative to the selection. Text and actual arrow/T endpoints supplement color. All new UI keys must be translated into the saved interaction language before non-English rendering. Screen readers and color-blind readers must not need color alone to infer direction.

## Verification

Check ordinary directed edges, incoming and outgoing together, reciprocal feedback, self-loops, undirected links, inhibition, uncertainty styles, isolated/catalog nodes, shared-node navigation and selection clearing. Confirm that focus does not dirty the diagram or alter routes/history; existing file archives retain the same v1 schema. Test actual browser colors, arrows, labels and grouped sidebar at the locked desktop/mobile baselines; minimal-DOM class checks cannot prove visual contrast or font rendering.
