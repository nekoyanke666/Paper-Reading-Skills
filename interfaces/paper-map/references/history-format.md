# Permanent Files and Saved-Version History

Read when generating/upgrading the viewer, saving or importing a map, recovering user-created trees, or reconciling an archive with paper memory. The fixed implementation is assets/history-core.js, assets/history-viewer.js, and assets/history-format-v1.schema.json. This is part of paper-map, not another public entry.

## What Save preserves

Save captures the complete global node/link records, all trees and all three detail views, mode-specific positions, definitions/properties/sources, identities/aliases, evidence states, and view preferences. It never exports only the visible low-detail nodes. Browser-created content retains user-note provenance and does not become verified paper evidence merely because it was saved.

Text fields keep their original Markdown/TeX strings under the [rich-text contract](rich-text.md). Display formatting never writes generated HTML or math markup into the model or old commits. The same fixed v1 archive accepts plain text and formatted source without a schema migration.

Read [per-paper local storage](local-storage.md) before creating or starting the entry. Allocate history/ relative to this paper's generated HTML in its current workspace, not a fixed global or user-specific path. Ordinary Save writes its managed archive there through the supplied loopback service without asking for a destination. The service completes and checks the disk write before the viewer reports success. A static HTML preview cannot substitute a picker/download for this operation.

Back up elsewhere alone selects an external destination (or explicitly requests a browser download when a picker is unavailable). Backup does not change the managed record, cursor or unsaved status. The source paper session/state and installed skill files remain separate. Browser recovery is supplementary; a fresh local page loads the actual saved disk archive. The compact menu orders Prev, Next on the first row, Save on the next, and Import history plus Back up elsewhere below.

## Saved-version semantics

Version 1 is the initial map. Each material Save appends one version; intermediate mouse movements do not create versions. Prev/Next move chronologically between saved versions, including nodes, trees, links, coordinates, and view settings. Require saving outstanding content edits before moving between versions or importing another document; do not silently discard an unsaved draft.

Restoring an older version then saving appends a new version at the end. Keep the former future versions, recording origin when the new version was based on an older one. A no-op Save at the latest identical state writes the file without adding an empty version. Do not prune, squash, or delete history automatically. Failed/cancelled writes retain the draft and prior archive. File I/O conflicts leave existing data intact.

## Frozen portable format

The extension is `.paper-map-history.json`; encoding is UTF-8, minified JSON. The required envelope is:

```json
{
  "format": "paper-map-history",
  "formatVersion": 1,
  "modelVersion": 1,
  "base": {},
  "baseHash": "sha256-of-canonical-base",
  "commits": [],
  "cursor": 0,
  "checksum": "sha256-of-envelope-without-checksum"
}
```

This illustrates keys, not a valid empty map. Follow the executable schema and core validator for a valid model. base is one complete diagram model. Node/link/tree/source/glossary collections are dictionaries keyed by stable ID, with graph.treeOrder preserving the tree menu. A one-tree document still has that same collection and treeOrder; it never uses a single-tree alternative schema. Each commit contains id, at, hash, and patch, with optional origin/kind. id starts at 1; cursor 0 selects the initial base, and cursor n selects the state after n commits.

patch contains deterministic `set`/`remove` operations with path arrays of string object keys. Arrays are replaced as values; object records are changed by stable ID. Operations are this contract's format, not an undocumented variant of JSON Patch. Per-version hash verifies the reconstructed model; baseHash and checksum verify base/envelope integrity. Canonicalization recursively sorts object keys and uses ECMAScript JSON number/string encoding. Use history-core.js for writing/verifying; do not introduce a competing serializer with different hash semantics.

Derived SVG routes, per-detail route caches, HTML/CSS/JavaScript, and repeated whole snapshots are omitted. A coordinate-only Save normally stores only the changed coordinate fields plus version metadata. The archive stores no executable code or file handles. World positions may be signed, with absolute x/y at most 10,000,000; camera translation and zoom are temporary navigation and are not position edits. Current readers enforce a 64 MiB UTF-8 limit and bounded version/operation counts; writing must refuse the same unsupported sizes instead of producing a file that cannot be imported. Never remove old versions silently to fit a limit.

## Import and compatibility

Validate the envelope/checksums, all reconstructed versions, record identities, relationships, shapes, coordinates, and detail views before replacing the current workspace. Corrupt or unsupported input leaves the current diagram/history untouched. Import may restore another paper's complete diagram in the same viewer; preserve its data/language/provenance and source references. Interface controls remain in the receiving webpage's language; imported content is not automatically translated.

Accept legacy schemaVersion=2 diagram snapshots or paper-session files through the explicit legacy adapter. Restore their global graph without assuming old browser layout preferences are full history. A legacy source file is imported read-only; the first new Save allocates a new managed record beside this entry rather than overwriting either the imported input or a paper session. Older browser notes may be recovered as unsaved user work only for the same paper/source revision; incompatible caches are retained rather than silently merged. Import does not establish verified whole-paper understanding.

Keep formatVersion/modelVersion=1 readers and the frozen tests/fixtures/history-v1-golden.json. UI/template release numbers do not change archive schema. Additive renderer features must not reinterpret existing v1 fields. A necessary future incompatible format needs a new version, explicit lossless migration, retained old readers, and regression tests before release. Never regenerate the frozen fixture to hide a compatibility failure.

Use `node scripts/history_ctl.cjs check FILE` or `materialize FILE OUTPUT [ZERO_BASED_VERSION]` from paper-map to inspect an archive or create a reviewable display snapshot. An agent merging approved edits into a paper session must preserve reading progress, reconcile IDs, recheck scientific sources/relations, and checkpoint through paper-memory; importing user data is not permission to promote unverified notes or overwrite unrelated paper memory.
