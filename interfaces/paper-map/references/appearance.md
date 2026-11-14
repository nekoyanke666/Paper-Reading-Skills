# Appearance Contract

## Authority

Use assets/graph-viewer.html.in as the only template and assets/template-lock.json for versions, hashes, and dimensions. A new paper replaces data and localized text, not HTML/CSS, framework, typography rules, or palette. Explicitly requested interface changes require comparison, version increase, and updated lock; merely changing a hash is not a review.

## Permanent surface

Show only graph, title, node search, all-relations, and a selector when several trees exist. Clicking a node or relationship label opens details. Do not add branding, instructional small print, reading steps, statistics, dashboards, legend walls, demo sections, update buttons, or large toolbars. The expert determines meaningful updates rather than requesting per-node approval.

The main title is the paper title; secondary titles are focused questions, not the paper title or numbered “subtree” labels. Preserve the original title as a locator when a translated title is used.

## Nodes

Retain 170×62 node boxes and the locked font sizing, radius, and spacing. Show only a concise, identifiable name, without numbering, type labels, summaries, source microtext, or subtitles. Prefer at most twelve width units; the lock defines the hard limit. Do not shrink text, truncate meaning, or use vague labels such as “result.” Put full definitions, source/English terms, conditions, evidence, and limitations in details.

Shared nodes have the same ID/name/content in every view, with view-specific positions allowed. Keep the visible shared-count marker and sidebar navigation. Use existing root, selection, and addition styles rather than a new color per node type.

## Edges and interaction

Registered semantics determine line family, color, arrow/T marker. Always show the standardized localized relationship name; show full meaning, conditions, direction, and basis in details. Color is not a substitute for text. Dashes indicate hypothesis/uncertainty, never inhibition; inhibition uses a T marker. Undirected relations do not receive causal arrows.

Search actual nodes globally by name, aliases, and content; show memberships and navigate to the node. All relations expands cross-links of this tree rather than dumping all trees into one network. Essential information must be available through clicks, not hover alone. Escape, blank-space click, or close hides details; narrow screens use the same bottom-detail arrangement.

## Localization and visual checks

Use the confirmed interaction language for content and provide complete UI, status, node-type, and predicate-display dictionaries. Keep canonical IDs and registry definitions separate from presentation. One saved localized display label per predicate prevents synonym drift. Source/English names remain accessible; original figure text is not overwritten by a fabricated translation.

Retain arbitrary depth and cycles. Preserve positions during incremental updates. Check node/label overlap and unrelated-node crossings mechanically, then test actual fonts, wrapping, search, location, and sidebar at 1440×900, 1024×768, and 390×844. Label browser checks unperformed when they were not actually run.
