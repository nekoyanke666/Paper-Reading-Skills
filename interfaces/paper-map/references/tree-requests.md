# Requested Topic Trees and Integration

Read for an explicit request to create a new topic tree, especially through paper-add-map. The requested tree is an authorized deliverable; integration into older trees is a separate decision. Reuse the existing viewer, stable entry path, graph identities and archive format. Do not allocate a second website for a new topic.

## Restore before planning

Restore the correct paper, role, settings, source inventory, canonical revision and relative map path through paper-memory. Read the entry's latest managed local history as well: an older canonical snapshot is not a substitute for the user's saved diagram. Preserve reading cursors, returnTo, prior explanations, translation preference and completion states.

Compare the active managed document's paper identity/version with canonical memory before merging. Import may have switched the viewer to another paper. If they differ, preserve both records and resolve which paper/map the request targets; never add one paper's canonical content to another paper's imported diagram by accident.

Record a request under progress.map.treeRequests with a stable request ID, topic, tree IDs, source scope, integration preference, source/managed revisions, status and publication state. Treat a continuation or answer to its proposal as the same request, not another tree. A genuinely separate new request receives a new tree ID. Do not use topic text alone as an identity key.

## Build the independent deliverable

Choose a rootless catalog for a lookup list and a focused narrative for an explanatory chain. Use [topic catalogs](topic-catalogs.md), [tree policy](tree-policy.md) and [detail views](detail-views.md). A flat catalog may use the same reviewed membership in all three detail modes when no honest distinction is useful; record that reason instead of inventing edges or omitting definitions. A standalone narrative still needs its own visible root and internally connected reading path. If no genuine shared narrative anchor exists, explicitly record standalone=true and a nonempty standaloneReason; never fabricate an anchor.

Search global nodes, aliases, terms, claims and source locators before allocating identities. Keep shared definitions and recognized labels. Match referents, conditions and study roles, not merely spelling. For a glossary sidebar include the name, original/English term when useful, clear definition, study role and relevant verified properties. Distinguish external background from paper findings and user notes. Inspect or obtain only sources needed for the requested scope; do not restart a full translation or preparation run.

Maintain the new view in the existing selector, search and cross-tree navigation. Preserve positions in existing views; arrange the new view independently. Apply the fixed geometry, canonical predicate labels, per-view density and relationship checks. Lack of evidence is a reason to qualify or omit a relationship, not invent one.

Build its structure from the [expert content model](content-model.md), not the order of the request or previous answers. Apply [complete node explanations](node-explanations.md) to every new or substantively revised node, including rootless catalog terms. A requested lookup list can omit edges while retaining full explanations; lack of links does not justify fragmentary definitions.

## Inspect and decide integration

Inspect existing narrative views and catalogs, glossary aliases and all three detail memberships for useful overlap. Evaluate prerequisite concepts, directly relevant methods, interpretation of evidence, limitations and corrections. Sharing a word or appearing in the same paper does not justify a semantic edge.

Store preference as requested, declined or unspecified, with the user's instruction as its basis. Shared identity is not integration: an unchanged global node can appear in the new view and show a shared badge without changing any old view's membership or placements.

- **Requested:** explicit instructions to integrate, including a general request to integrate into related trees, authorize useful supported additions. Choose targets as the expert when not named. Do not ask for the same permission again. If a named target is unsuitable, explain the specific problem and complete supported parts rather than inventing a link.
- **Declined:** keep existing memberships, relationships, routes and positions unchanged. Do not prompt again for integration on the same request. Do not silently change an old global definition under the guise of an independent tree; a necessary factual correction is a separately explained correction workflow.
- **Unspecified with useful overlap:** first finish the independent new tree. Prepare a concrete proposed diff naming target trees/detail modes, node additions or reuse, relation directions/meanings, source basis and any unavoidable local layout repair. Validate that proposal without applying it to old views. Present a popup through request_user_input_async, or the host's equivalent structured user-input tool, with concise choices such as integrating the named proposal or keeping the new tree separate. Explain what would change. Save the pending proposal and its base revisions so the later reply can resume safely.
- **Unspecified without useful overlap:** finish the independent tree, record why integration was not useful, and do not ask a ceremonial question.

Deliver the usable independent tree while a proposal is pending. A timeout, silence or preselected answer never authorizes integration. A later approval authorizes only the described targets and scope; restore current revisions and revalidate before applying it. If material changes invalidate the proposal, revise the concrete proposal before asking about the changed scope.

Integration retains the new tree unless replacement/removal was explicitly requested. Add chosen nodes and source-supported edges only to approved views and detail modes; preserve unrelated view content and geometry. Do not merge global identities, propagate every new node to every mode, or infer causality from a path or co-occurrence. View removal and global retirement require their normal distinct intent and lifecycle checks.

## Persist without discarding saved work

Use [operations](operations.md) for canonical patches and [local storage](local-storage.md) plus [permanent history](history-format.md) for the managed record. Keep canonical source memory and the reader's diagram history separate, with explicit publication status if only one phase succeeds.

1. Read the latest canonical revision and managed archive/ETag. Inventory user-created nodes, notes, memberships, ordering, positions and selected Save checkpoint. Preserve their provenance; user notes are not verified paper claims.
2. Validate and checkpoint the requested canonical additions with expected revisions. Keep old tree data unchanged when integration is declined or pending. Record the concrete request/proposal and any source limitations.
3. Build a candidate managed model by applying only the authorized additions and explicit field changes to the latest managed model using stable IDs. Preserve unrelated records, all previous commits and retained futures. Merge memberships and tree ordering additively; replacing their arrays wholesale can erase user additions. Do not overwrite reader placements with older canonical positions.
4. If the same field was independently edited, compare its previous basis, latest managed value and proposed value. Preserve the user value where the addition does not need to change it. For a substantive unresolved conflict, present the concrete conflict for a choice; never silently discard an edit.
5. Validate the merged model and append a checkpoint with the existing PaperMapHistory.commit API. Keep formatVersion=1 and modelVersion=1. Publish through the existing same-origin local save protocol with its token and expected ETag; do not log the token. This is an update to the same diagram, not an import into a new record. On a stale-write response, reload and revalidate instead of forcing a write.
6. Verify the served managed archive contains the new tree and approved integrations. A source-only HTML render is insufficient because a protected saved workspace can still show the older model. Preserve unsaved open-tab drafts; do not force reload over them. Report the saved update and allow a safe reopen/refresh. If publication failed, report that phase as pending and retry the same request without duplicate nodes or trees.

Reuse the checked original web link and report the new title, independent/integrated/pending status and actual verification scope. Do not claim browser/source validation that was not performed. A requested new topic tree does not mark the whole paper or an interrupted lecture as complete.
