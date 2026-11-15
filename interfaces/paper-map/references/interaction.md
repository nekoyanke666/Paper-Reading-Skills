# Direct Manipulation and View Preferences

## Click, drag, and keyboard

A press and release opens the node sidebar. Start dragging only beyond four CSS pixels; acquire pointer capture at that point, never on the initial press. During dragging show an active outline/shadow and reroute attached edges continuously. Do not open details on the release that completed a drag. Escape or pointer cancellation restores the position before that drag. Reject a drop that overlaps another node and explain the rollback with localized feedback. Use Alt + arrow keys for keyboard movement, with Shift for a smaller step. Touch/pointer input follows the same threshold and cancellation rules; essential information never requires hovering.

Selection highlights the node and its immediate relationships; locating a search result briefly highlights its position. New or revised content may pulse briefly. Reduced-motion preference suppresses motion while retaining state changes. Do not add perpetual animation, particles, dashboards, or a separate interaction tutorial to the canvas.

## Compact layout menu

The only additional persistent control is the small Layout button. Its popover contains Curves, Straight, Save positions, Default view, and a concise saved/unsaved state. Curves are the default. Each edge is either one smooth cubic Bezier path (M C) or one straight segment (M L); no orthogonal routing, angular bends, multi-segment polylines, or rounded-elbow substitutes. A self-relation remains a visible cubic loop in either mode because a segment between identical endpoints would disappear. Preserve canonical labels, direction, uncertainty styling, and markers in both modes. Endpoints meet actual shape boundaries, not the common placement slot. Keep feedback directions visually distinct.

Dragging produces a temporary overlay. Save positions stores the overlay and edge mode in this browser's localStorage, keyed by paper identity, with positions indexed by tree ID and node ID. It does not write the paper session, alter scientific relationships, or become a shared cross-chat layout. Report storage failure honestly and retain the unsaved state. Warn before leaving with unsaved changes.

Default view removes saved and temporary position overrides for the current tree only, returning to canonical positions. It preserves other trees and the selected line mode. Shared nodes have one scientific identity but may have different saved positions in different trees. Saving in one tab can refresh another clean tab; do not overwrite its unsaved work.

## Source updates and safety

Load canonical content from the newly rendered snapshot first. Browser note caches never replace it. Load only known active tree/node IDs and finite nonnegative coordinates from the layout preference; discard invalid or removed objects. Preserve valid saved positions through additions and source corrections. A new node starts at its canonical position. If user placement makes updated content hard to follow, offer the existing Default view action; do not change academic content to accommodate a preference.

Canonical layout repairs are separate reviewed memory operations. A user may explicitly request promoting a placement into the shared default; then review all affected views, geometry, expected revision, and source-independent layout intent before committing. Ordinary browser dragging never performs that operation.

Curved/straight user overlays provide live geometric feedback but do not claim to optimize every possible edge crossing. Canonical generated routes must pass geometry gates. Test normal clicks as well as dragging, saved-position reload, reset scope, shared-node navigation, source-update reconciliation, storage failures, and narrow-screen sidebar access before releasing a changed runtime.
