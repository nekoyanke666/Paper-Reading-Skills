# Optional Operational Helpers

The expert decides content, identity, relationships, and view scope first; helpers normalize and check those decisions. Run these commands from paper-map. Sessions/output belong in the user's workspace, not the installed skill.

## Registry and candidates

`python scripts/map_ctl.py relation --token "provides support"`

Returns canonical ID/label/definition and endpoint reversal; similar words do not establish causality.

`python scripts/map_ctl.py normalize --session candidate.json --output normalized.json`

Creates a candidate with canonical relations and checked geometry without overwriting the canonical session. Explicitly migrate old broad relationship categories rather than guessing their meanings. Configure confirmed language settings first. Supply a complete graph.locale dictionary for non-English output.

## Patches

Common fields: expectedRevision, roleVersion, settingsVersion, reason, importance, semanticReview, operations. Importance includes core_concept, evidence_change, relation_change, correction, or unresolved_question. semanticReview provides concise identity/relation/scope notes.

- upsert_term: supply a glossary term with id, recognizable name, definition, and an explicit reason; reuse the ID only for the same referent. Save studyRole and verified facets where useful.
- add_node: reuse identity or create, place in treeId near anchorId, optionally name a ref for `$name` references.
- update_node: change same-referent name/detail/sources/limits/status; retain old name as alias.
- reclassify_node: provide newType, reason, and evidence that referent is unchanged; derive its registered visual role.
- set_visual_role: supply id, one of concept/method/entity/proposition, and reason; keep the referent and ID, then regenerate affected shape signatures/routes.
- add_link/update_link: normalize/deduplicate or update source/support state; changed meaning/endpoints/conditions require retire-and-add.
- add_tree/update_tree: narrative views use focused-question titles/shared anchors, or explicit standalone=true with standaloneReason when no genuine anchor exists; catalog views use kind=catalog, rootId=null, topicDescription, and actual glossary-bound members. Zero edges and disconnected catalog members are legal. Conversions or title/scope/root changes need an explicit reason.
- set_detail_views: supply treeId, complete low/medium/high view records in levels, and a reason. Reuse global IDs; validate each view independently, including its root, endpoints, positions and source-backed relations.
- attach_node/attach_link: reuse existing objects without copying IDs.
- remove_from_tree/detach_link: view-only change; root removal needs replacementRootId.
- merge_nodes: supply same-referent basis, keep target ID, reconnect and redirect.
- retire_link/retire_node: preserve reason/revision; explicitly handle incident edges/root first; refutation is not retirement.
- restore_link/restore_node: justify from retired history; merged IDs do not become independent again.
- archive_tree: not main; rehome unique important content first.
- move_node: requires allowLayoutRepair=true and a reason.

Locale/preference changes update the session settings and locale through a reviewed candidate, preserving prior versions. Normalize/check again because display widths may change. An ordinary semantic patch must match the current settingsVersion.

## Upgrade an existing map

Restore the latest canonical session and save its expected revision. Preserve paper ID, node identities, aliases, source references, tree memberships, and translation/figure/detail reading progress. Derive the four visual roles from existing referents; supply explicit roles for domain-specific detailed types. Add every new UI key in the confirmed language before normalization; non-English sessions do not fall back silently to English. Replace old route geometry with current shape-aware curves while retaining existing node positions.

The taller placement slots may reveal old collisions. If checks fail, prepare the smallest explicit layout-repair operation in affected views, record its reason, and check again. Do not overwrite a working entry with a failed candidate or reinitialize the paper. Commit the migration through paper-memory's revision check/history, render the same stable entry, and record the resulting version/hash. Protect existing exported/imported diagram workspaces and user edits during source migration; reconcile their stable IDs only through a reviewed merge. Camera centering does not reset placements; installing updated skills alone does not regenerate an existing paper artifact. On the next invocation, each public entry evaluates whether its existing entry needs this migration.

## Plan and commit

`python scripts/map_ctl.py plan --session paper-session.json --patch patch.json --output candidate.json`

Reports impact, refs, quality, and changed state without writing the canonical session on failure.

`python scripts/map_ctl.py apply --session paper-session.json --patch patch.json --output map-site`

After checks, paper-memory commits a revision and renders the matching site. No change means no revision/rewrite. This is an internal process, not a per-node approval flow.

## Start the local entry

After render, reserve/reuse this paper's actual output folder and follow [local storage](local-storage.md). Run `node <map folder>/.paper-map/map-server.cjs --root <map folder> --start` and verify its returned local URL. Save the workspace-relative root/history/launcher paths and replaceable service URL in progress.map. Paths and ports must be resolved per paper and active workspace, never copied from an example user or previous chat. A static-file link alone does not enable neighboring-file saves.

## Portable diagram archives

`node scripts/history_ctl.cjs check saved.paper-map-history.json`

`node scripts/history_ctl.cjs materialize saved.paper-map-history.json restored-state.json`

The helper verifies checksums and all saved versions, then optionally restores a selected zero-based version as a schemaVersion=2 display snapshot. It never overwrites the input archive. See [permanent history](history-format.md) for the frozen format and legacy import contract.

## Rebuild and recover

`python scripts/map_ctl.py check --session paper-session.json`

`python scripts/map_ctl.py render --session paper-session.json --output map-site`

For maintainers changing viewer behavior, edit assets/viewer-shell.html.in and the relevant maintained history/detail/camera/runtime modules, then run `python scripts/build_map_template.py` from the repository root. This rebuilds the packaged template and asset hashes; it does not authorize redesign or skip browser validation. Regenerate examples from their canonical sessions after template/locale changes.

Render accepts only canonical data and the locked template and produces HTML, matching JSON, manifest, quality report, and immutable snapshots. If a commit succeeded but render failed, use render-pending.json to rerender the saved revision rather than applying the patch twice. If helpers are unavailable, preserve canonical data and follow the same rules while explicitly reporting unperformed checks.
