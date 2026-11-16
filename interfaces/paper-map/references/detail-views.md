# Low, Medium, and High as Three Trees

Read when creating or revising detail modes, responding to overly broad nodes, or upgrading an older map. Use assets/detail-core.js and scripts/detail_views.py for the same structural checks. Modes replace the former All relations control.

## Independent views with shared identity

Treat low, medium, and high as three independently curated trees about the same topic. They may have different node selections, roots, layouts, and source-grounded connections. They do not need identical paths, nested edge sets, or automatic A-B-C compression. If a concept is exactly the same in multiple views, reference the same global node ID: its name, definition, properties, sources, status, and corrections remain identical. Different levels of abstraction are different referents when their meanings differ; do not rename one node differently per mode.

Store them under tree.detailViews.low/medium/high, each with nodeIds, linkIds, rootId for narrative views, positions, and an optional focusQuestion. The parent tree retains the union of their global IDs as its data container. All active union records must appear in at least one of the three views. Each narrative view has a visible root and connected reading paths; catalogs may remain rootless and unconnected. The selected mode has its own coordinates; dragging a shared node in one mode does not move its occurrence in another mode.

## Choose substantive granularity

Low presents the research architecture and central contributions/conclusions with the conditions needed to avoid misunderstanding. Medium connects the principal objects, method/model stages, comparisons and results. High expands important mechanisms, algorithmic or mathematical steps, inputs/outputs, assumptions, controls, uncertainty and limitations. Curate this from actual sources and the full-paper model, not graph depth, arbitrary node quotas, or a rule that every noun deserves a node. Higher detail normally uses more concepts/connections, but the three views are not mechanically generated subsets.

When a label such as "model," "analysis," or "evaluation" hides several independently useful operations or concepts, keep a meaningful overview node and develop the relevant real objects/stages in the more detailed tree. Do not move all missing conceptual content into a long sidebar while leaving the graph generic. Conversely, leave incidental parameters and routine identifiers in details when a node would add little understanding.

Reuse an existing scientific edge only when endpoints, predicate and conditions are the same. A connection appropriate to a different view still needs its own source-grounded meaning, standardized predicate, qualifiers, evidence state and explanation. Do not infer a new A-C causal/support edge from an A-B-C path, or introduce a special automatic "folded path" relationship. One-to-many, many-to-one and cycles are legal. Apply the four-predicate and density checks to each actual view rather than forcing their union into a small diagram.

Critical scope, adverse findings or qualifications remain understandable at every mode where they affect interpretation. Missing evidence is not simplified into certainty. The concept-coverage crosswalk records where the substantive paper content appears across these views and topical catalogs.

## Interaction and persistence

Keep the three-button Low/Medium/High selector in the fixed toolbar, including one-tree documents. Switching does not change scientific data, names or definitions, and is not itself a content edit. Show shared memberships between modes in node sidebars and navigate to the exact same ID. Global node search finds concepts hidden in the current view and switches to a containing view.

Save always includes all three views and their complete underlying graph, regardless of the current mode. Archives preserve view settings and per-mode coordinates. New browser notes are attached to the current view and retain user-note status; independent new trees remain valid before expert curation. Older maps without reviewed detailViews retain their existing content in every mode and say that no separate views have been prepared; do not fabricate a convincing low/high distinction by randomly hiding nodes.

For reviewed canonical changes use set_detail_views with treeId, the complete low/medium/high records, and a reason explaining granularity and coverage. Validate membership, endpoints, reading paths, per-view layout and sources before committing. Preserve global IDs and reader context, and include the new configuration in the same stable website entry.
