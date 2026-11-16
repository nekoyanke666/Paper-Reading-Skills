# Tree Scope, Cross-View Connections, and Stable Layout

## Explanation purpose

The main tree answers the paper's core question and uses its title. It navigates the entire research architecture; use the [coverage contract](concept-coverage.md) to avoid a tidy but incomplete abstract-only graph. Secondary narrative trees answer focused questions about mechanisms, proofs, evaluation, prerequisites, or alternatives, starting from substantive existing nodes. Secondary [topic catalogs](topic-catalogs.md) organize terms by lookup purpose and may be rootless with no edges or only sparse meaningful links.

Split when predicates proliferate, topics mix, cross-links become hard to follow, or details have an independent question. Review density/splitting above eighteen nodes. There is no fixed depth or overall knowledge cap: any node may extend into another tree.

## Sharing and scope

Define a global node once. Views hold nodeIds, linkIds, positions, and routes. A secondary narrative tree shares at least one substantive node with another narrative tree, not merely the same text, so its origin is visible. Catalog-only vocabulary may stand independently; wherever a term recurs, reuse the global node and visible membership links. Shared content updates together; positions and relationships may differ.

Keep shared-count markers and sidebar links that switch and locate the same ID. Displayed edges have both endpoints in the selected view. Read [detail views](detail-views.md): three independent memberships and relationships reuse globally identical nodes; the parent union is a data container, not a fourth display tree. primary marks narrative importance, not evidence strength or an instruction to hide critical limits. Each actual narrative view needs a connected reading path from its own visible root. Catalogs need no root or connected path; topic membership never implies a scientific relation.

Before archiving a secondary tree, rehome unique important active nodes/edges rather than leaving invisible active material.

## Cycles

One-to-many and many-to-one branches are legal and need no artificial binary branching nodes. Each connection is an independently meaningful edge; separate edges do not by themselves express a joint sufficient condition. Feedback cycles are legal; do not distort a mechanism to force acyclicity. In a logical graph, distinguish dependence, equivalence, and circular argument. Drawable cycles are not valid proofs by themselves.

## Layout order

1. Preserve IDs, positions, and reader context.
2. Search deterministically around a related anchor for new space, avoiding nodes, existing routes, and labels; expand the canvas when needed.
3. Initial arrangement follows the research context. The same canonical data and layout version yield the same positions without imposing fixed columns/levels.
4. Generate deterministic smooth cubic curves; search alternative cubic control points when obstacles intervene. A single straight segment is the only alternate geometry. Do not fall back to angular or rounded orthogonal polylines. Labels must not overlap or sit at ambiguous intersections; if no valid route exists, fail and repair the affected layout explicitly.
5. Reuse routes only if endpoint, visual-shape, layout-version, and display-label signatures still match.
6. Move existing nodes only with explicit layout-repair intent/reason, restricted to affected views rather than shuffling the whole map.

Browser drags are tree/mode-specific diagram edits saved in portable history, separate from canonical research-memory changes; see [interaction](interaction.md). Shared scientific identity does not force identical placements in different views. Camera translation/scale are temporary navigation, not node positions; Center translates the current tree into the middle without changing zoom or undoing edits. Signed world coordinates allow expansion in every direction.

Unavoidable crossings may remain if lines do not pass through unrelated nodes and direction remains clear. Machine geometry does not replace expert checking of the reading logic. Localized labels require fresh geometry checks; source identities and prior node positions remain stable where feasible.
