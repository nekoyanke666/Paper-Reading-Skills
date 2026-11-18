# Map Interaction and Saved Workspaces

## Click, drag, and keyboard

A press/release opens node details. Start dragging beyond four CSS pixels and acquire pointer capture only then. Live movement highlights the node and reroutes its attached edges. A completed drag does not open details. Escape/pointer cancellation restores its previous position. Reject overlapping drops within the current tree/view and give localized feedback. Alt + arrow keys move a focused node; Shift uses a smaller step. Keep touch/pointer handling consistent and make essential information available by click, not hover alone.

Selection follows [direction focus](direction-focus.md): classify actual incident edges relative to the selected node, distinguish incoming/outgoing/self/undirected connections, dim unrelated content, and show explicit endpoints in connection groups near the top of the sidebar. Search location and new/revised content may pulse briefly; reduced-motion preference suppresses motion while retaining state changes. Avoid perpetual decorative animation or added dashboards.

## Camera and viewport

The canvas background occupies all remaining space beneath the title/control row, with the locked outer margins; it is not sized to the initial nodes or a fixed minimum graph height. Clip world content to this viewport. Use a translation-and-scale camera, not scrollbars constrained to a finite initial board. Background drag pans in any direction; node drag changes only that node. Capture the active pointer, ignore other pointer IDs, and restore camera offsets on pointer cancellation/Escape. A click below the drag threshold remains a click.

Use compact minus, percentage, plus and Center controls at the lower-left inside the canvas. Wheel/pinch, +/- button or keyboard zoom actions change scale; ending a temporary inspection restores its captured original scale. Wheel zoom is anchored to the world point beneath the pointer; buttons zoom around viewport center. Initial zoom is 100%. Entering node/edge selection, search/shared navigation, tree/detail switches, viewport/sidebar resize, source updates, history navigation and imports preserve the current scale. The implementation uses 8% to 300% zoom, finite signed node coordinates within +/-10,000,000, and no camera-edge clamp. These are practical numeric limits, not a claim of mathematically infinite storage. Home or Center translates the selected tree's center into view at the current scale; it changes neither scale, node placements, detail membership nor saved versions. A large tree may extend beyond the viewport until the reader explicitly zooms out. Search/shared navigation centers the target without changing scale. Keyboard focus on the canvas supports arrows to pan and +/- to zoom. Alt+arrows on a node still move that node.

Camera offsets/scale are view-only and do not mark the diagram dirty or create a Save checkpoint. Node coordinates and mode-specific placements do. During an active node inspection, viewport/sidebar resize may translate that node back to the available viewport center without changing scale. With no selected node, resize renders the existing camera without recentering the entire tree, so closing the sidebar cannot overwrite the restored browsing position. Defer resize work until an active drag ends. On narrow screens reserve the bottom panel's 44% viewport height in the main layout so the graph and navigation controls remain visible above it. Keep all node coordinates, background alignment and reduced-motion preferences intact.

## Temporary inspection and return to browsing

Before the first selection/search/shared-node inspection, capture the current paper, tree, detail mode, camera x/y, zoom and navigation flag in a temporary return point. Center the selected node at the current scale. Following other nodes, relationships or shared memberships within that inspection keeps the first return point; do not replace it with a previously centered node's viewport.

Close, Escape and a blank-canvas click end inspection and restore that exact browsing position and scale, including the original tree/detail context after search or shared-node inspection crossed views. User pan/zoom while inspecting is temporary; closing still returns to the captured browsing view. Never substitute whole-tree Center for this return. Ignore obsolete queued centering callbacks after closing or a newer navigation action. Sidebar transition/ResizeObserver callbacks must retain the restored view.

An explicit tree/detail-selector navigation establishes a new browsing context rather than carrying a stale return point across the user's chosen navigation. History navigation and imported document replacement clear the old inspection state. Keep return points runtime-only, outside canonical research memory, browser recovery files and portable Save history. No new UI control or archive schema is required.

Render at the requested size: use real HTML card dimensions and font sizes derived from world coordinates and zoom, SVG viewBoxes for node glyphs, and a native SVG transform for edge geometry/text. The board's CSS transform performs translation only; remove permanent will-change/bitmap-layer scaling hints. Snap display translation and card offsets to device pixels without changing saved world coordinates. Enlarging rerenders text and vectors rather than magnifying a cached board image. Check actual high-zoom rendering and shape/edge alignment; normal browser font antialiasing does not justify a claim of pixel-identical rendering on every device.

## Fixed controls and three detail views

Keep the tree selector, node search, Low/Medium/High selector, compact Save & history menu, and compact zoom/Center controls. A one-tree document still has the same configured selector and full import/history capabilities. No template branch may omit a feature because the initial graph is small.

Read [detail views](detail-views.md) when creating or revising the three trees. They reference shared global node definitions but have independent memberships, source-grounded connections, roots, and coordinates. Switching does not rewrite data. Searching a hidden concept selects a containing view; shared-node links can navigate between topics and detail modes. There is no automatic path-collapse or relation-renaming mechanism.

## File saving and version navigation

Read [permanent history](history-format.md) for the frozen archive, compatibility rules, and file I/O. The compact menu places **Prev, Next** in that order on the first action row and **Save** on the following row. Curves/Straight, Import history and Back up elsewhere stay in this popover, with a concise version and persistence status.

Save captures all nodes, links, trees, detail views, positions and relevant definitions/sources, not just dragged coordinates or visible nodes. Use [local storage](local-storage.md): ordinary Save writes into this entry's reserved history folder with no picker/download. Only Back up elsewhere chooses an external destination and reports native close/download status accurately. Cache recovery never substitutes for the actual managed file. Cancellation, conflicts, storage failure or invalid imports must not erase working content or prior saved versions.

Prev/Next traverse Save checkpoints, not individual pointer events. Require current content edits to be saved first. Retain all former versions when editing and saving from an older checkpoint. Remove the old restore-default-layout behavior. Browser-created notes keep their provenance until reviewed against sources.

## Routes and feedback

Use one smooth cubic path (M C) by default or one straight segment (M L). Do not use orthogonal bends, rounded-elbow substitutes or multi-segment polylines. A self-relation remains a visible cubic loop in either mode. Preserve canonical labels, direction, uncertainty styles and markers; endpoints meet actual glyph boundaries. Feedback directions remain distinguishable.

Coordinates are specific to a tree and, for reviewed detailViews, a detail mode. Sharing a scientific node does not force its placements to match. The archive omits derived route caches and reconstructs them in the fixed viewer, while preserving exact node coordinates and semantic records.

## Source updates and quality checks

Load authoritative source content before accepting a matching explicit workspace recovery. Never let an unrelated or stale cache replace another paper. Saved/imported workspaces and unsaved user changes are held when a new source snapshot appears; tell the reader an update is available rather than silently replacing their nodes/trees. Reconciliation with canonical paper memory is an explicit reviewed operation.

Test normal clicks, drag/cancellation/collision behavior, full Save and reload, Prev/Next across saved checkpoints, old-future retention, file conflict/cancel handling, same-node navigation, three-view layouts, single-tree imports, and invalid-input isolation. Distinguish mock file tests, browser downloads, and actual native writable-file testing. Do not claim a blocked browser upload succeeded.
