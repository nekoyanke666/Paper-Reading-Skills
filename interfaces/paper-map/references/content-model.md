# Content and Semantic Node Roles

## Build an intelligible model

Start from the source-defined research problem, then identify the objects being studied, concepts needed to understand them, operations or arguments, observations, claims, and limits. A map is not a list of questions. Any existing node may connect to a necessary definition, named object, mechanism, method, counterexample, or unresolved issue. Add a node when it contributes a distinct, reusable unit of understanding or terminology lookup; a catalog term does not require its own relationships. Improve the sidebar for an incidental property that does not need a separate referent. Check whole-paper breadth through the coverage contract rather than stopping at a small abstract-like chain.

Before accepting a comparison or discrimination question, check that the reader can identify the actual alternatives. Name those alternatives in the question's detail and, when their definitions or separate relationships matter, give them substantive nodes. Do not leave a generic question such as "Which state?" without specifying the relevant states. Do not invent an exhaustive classification when the paper tests only selected categories.

For example, a study distinguishing nascent and mature RNA needs those two populations explained, with study-specific definitions and limitations. It must not imply that all intron-containing RNA is necessarily nascent. A study comparing two algorithms likewise needs identifiable algorithms, not an endless chain of "why" nodes. These examples guide modeling across disciplines rather than fixing a particular paper's structure.

## Four visual roles

Use the locked node-shapes.json profiles. The detailed node type remains scientific metadata; visualRole is a small, stable presentation vocabulary:

- concept: rectangle; a general idea, definition, model, assumption, metric, or limitation.
- method: ellipse; a procedure, intervention, experiment, algorithm, or proof technique.
- entity: circle; a named object, population, material, dataset, source, or term whose referent is a specific object.
- proposition: hexagon; a question, hypothesis, claim, theorem, finding, interpretation, observation, or counterexample.

Choose by what this node denotes in this study, not by isolated words in its label. An algorithm as an executed procedure is a method; a named algorithm being compared as an object can use entity. An expression's meaning is concept, while the specifically named object it denotes can be entity. If a node combines different referents, split it when their relationships differ. Do not multiply shapes for every detailed type. For an unknown detailed type, assign one of these four visual roles explicitly and supply its localized type label.

normalize derives the role from the registered detailed type unless an explicit valid visualRole exists. Reclassification of the same referent preserves ID and positions; record the reason. Changing its meaning creates a distinct node under lifecycle rules. Shape never conveys evidence strength, causality, or certainty; these remain explicit edge/status/detail fields.

## Readable names and truthful connections

Use the shortest recognizable name that distinguishes the object in context. Full definitions, original terminology, source locations, qualifications, and ambiguity belong in the sidebar. A node must be understandable from its name and neighbors without turning its label into a paragraph.

Choose the relation from its meaning before arranging positions. A research question can require a concept; a method can measure a property; a component can be part of a system. Do not add a generic "extends" edge merely because a concept appeared later in conversation. A prerequisite edge must say why the concept is needed; a compositional edge must express actual composition. If the existing registry cannot express the meaning, follow the extension/splitting policy rather than silently reusing a different predicate.

Default starting point is the paper's research problem. A secondary view may start at an existing entity, concept, method, or proposition when that makes its focus clear. Direction comes from the canonical relation, not left-to-right placement or the order of teaching. Shared objects reuse global IDs across views, with visible membership navigation.
