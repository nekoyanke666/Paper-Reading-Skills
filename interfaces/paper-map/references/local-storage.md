# Per-Paper Local Storage

Read when creating, upgrading, starting, relocating or delivering a map, or changing Save/Backup behavior. The implementation is assets/map-server.cjs and the generated relative map-storage.json contract. This is part of paper-map, not a separate public skill.

## Allocate the space during creation

Resolve the current workspace and this paper's existing entryPath before creating directories. Reuse that paper's established map folder. For a new paper, allocate a distinct folder under the current workspace's paper output area. Names may follow its existing project convention; never hardcode a username, drive, chat ID, global Codex folder, or one shared map directory for all papers/users. A different conversation using the same saved paper/workspace reuses the same entry and record; it does not create a second isolated store just because the chat changed.

The renderer reserves history/ beside index.html, writes relative map-storage.json, copies the local service/runtime into .paper-map/, and supplies open-map.cmd/open-map.sh. Record workspace-relative map.rootPath, map.entryPath, map.storage.historyPath, map.storage.launcherPath and storage contract version in progress. Resolve them against the active workspace whenever used. Keep runtime URL/PID separately as replaceable process metadata; never save a bearer token in paper memory or a delivered URL. A moved folder retains its HTML, configuration, runtime and records; an old process URL is not a portable storage location.

The data directory is relative to the generated entry, not relative to the installed skill or the process's launch directory. Its fixed structure is:

```text
<this paper's map folder>/
  index.html
  paper-state.json
  map-storage.json
  open-map.cmd
  open-map.sh
  .paper-map/                  # supplied runtime and local process metadata
  history/                    # reserved at generation; created again on startup if needed
    current.json              # fixed v1 pointer, not a second full graph snapshot
    <record>.paper-map-history.json
```

## Start and deliver the working entry

The agent performs startup and recovery. Follow [open the entry](open-entry.md) to open the verified web URL in the available host browser panel and provide a clickable link. In Codex provide a directly clickable Open paper map link; neither .cmd execution nor a spoken/typed request is required. Check/recover the service before delivering that link.

Use the generated local helper, with Node.js available:

`node <map folder>/.paper-map/map-server.cjs --root <map folder> --start`

It starts a hidden background helper bound to 127.0.0.1, chooses an available port and returns JSON containing url, pid and historyDir. It reuses a matching running service for the same folder, including concurrent launches. Do not assign a fixed user-specific absolute path or port. Deliver this checked local URL as the usable Save-enabled entry. On an open/reopen request the agent restores the service and opens the web entry. open-map.cmd or open-map.sh are optional outside-app fallbacks; the helper resolves its own folder and loads existing records. This is local execution, not external hosting or publication. For maintenance, the same helper accepts --stop.

Some agent command hosts terminate detached descendants when a short command ends. In that environment run the helper with --serve in a retained long-running process/tool session instead, record its session identifier, and wait for its ready JSON. Verify /api/ping with a separate request after startup before delivering the URL. Keep that session alive while the delivered map is in use. Do not present an exited launcher's URL as a working entry; the portable user launcher still supports reopening it outside that agent session.

Static file:// or ordinary static-host previews remain readable but cannot directly write neighboring files. Save must explain that the local entry is required; it must not silently request a destination or download as a substitute. If Node or process/network access is unavailable, retain the artifact and history, report that specific local-service blocker, and continue unaffected paper teaching. Do not claim fixed-folder saving works in a read-only preview.

## Save and backup

Ordinary Save writes the current record into this folder's history/ with no destination picker and no download. Reuse its record path for later saves; the v1 archive already stores a base plus compact version deltas. Persist via a temporary file, flush and atomic replacement. Only acknowledge success after the local write has completed. Do not alter authoritative paper-session.json, paper-state.json or installed skill resources.

Importing another saved archive does not overwrite the record it replaced. Its first managed Save allocates a new record in this same entry's history/ and updates current.json; the former record stays available for later import. The pointer's format is paper-map-local-v1, version=1, active=<relative archive filename>. Record filenames are generated by the service, never supplied arbitrary write paths. All archives retain the existing paper-map-history formatVersion/modelVersion=1.

Only Back up elsewhere opens a save-location picker. It exports the complete current workspace/history, including a recoverable current draft, without changing the managed record, saved-version cursor, dirty indicator or local destination. If the browser cannot provide a picker, its explicit backup action may request a download and must label that result accurately. An import picker chooses an input file, not an ordinary Save destination.

## Restore and shared access

Opening the local URL reads the disk record even in another browser/chat without its former browser cache. Same-timeline unsaved browser work can supplement it. A stale/incompatible recovery copy is retained and copied to a distinct history/recovery-*.paper-map-history.json when the local service permits it; it must not replace the active saved record silently. Source updates keep their existing review/merge rules.

Each Save includes the last observed managed version. If another tab/chat saved meanwhile, reject the stale write and retain the reader's current work; back up and reload the current record before reconciling. Do not overwrite a newer file, trim old versions, or resolve a conflict by choosing another user's folder. The service accepts only its own origin/token and relative managed records, exposes no arbitrary filesystem route, and never uploads the paper externally.

## Verify

Test actual writes to a temporary map folder, reload without browser cache, two independently allocated roots, copying the whole folder to a new path, stale saves, imported-record retention, checksum failures, and concurrent startup. Browser QA must click Save and confirm a real neighboring history file exists without a picker/download. Keep native backup-picker verification separate from mock handles and managed-server integration tests. Generated process tokens and user history are not skill source or release-package files.
