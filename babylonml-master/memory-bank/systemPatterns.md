# System Patterns: BabylonML

## Core Architecture

BabylonML follows an Entity-Component-System (ECS) pattern adapted for a declarative HTML-like interface.

1.  **Declarative Scene Graph (HTML):**
    *   Users define the scene structure using custom HTML elements (e.g., `<bml-scene>`, `<bml-entity>`, `<bml-box>`).
    *   The hierarchy of these elements maps directly to the Babylon.js scene graph.

2.  **Core Engine (`src/core`):**
    *   `BmlScene`: Represents the main `<bml-scene>` element. Manages the Babylon.js `Scene` and `Engine` instances, the render loop, and root-level entities.
    *   `BmlEntity`: Represents `<bml-entity>` or primitive elements (like `<bml-box>`). Manages a corresponding Babylon.js `TransformNode` or `Mesh` and holds associated components.
    *   `ComponentManager`: Responsible for registering available components and attaching/detaching/updating component instances on `BmlEntity` objects based on HTML attributes.

3.  **Components (`src/components`):**
    *   Reusable modules that encapsulate specific data and logic (e.g., `position`, `rotation`, `scale`, `geometry`, `material`).
    *   Components read data from HTML attributes (via parsers).
    *   They interact with the underlying Babylon.js objects associated with their `BmlEntity`.
    *   Components have lifecycle methods (e.g., `init`, `update`, `remove`) managed by the `ComponentManager`.

4.  **Attribute Parsing (`src/core/parsers.js`):**
    *   Provides utility functions to parse string values from HTML attributes into usable data types (e.g., "1 2 3" into a Vector3, "color: red; roughness: 0.5" into a material properties object).

5.  **Primitives (`src/primitives`):**
    *   Convenience custom elements (e.g., `<bml-box>`) that are essentially pre-configured `BmlEntity` instances with specific default components (like `geometry={type: 'box'}`).

6.  **Initialization (`src/index.js`):**
    *   Likely uses `MutationObserver` or a similar mechanism to detect custom elements in the DOM.
    *   Initializes `BmlScene` and `BmlEntity` instances based on the observed DOM structure.
    *   Connects the declarative layer (HTML) with the imperative Babylon.js layer.

## Data Flow

1.  User writes BabylonML markup in an HTML file.
2.  `index.js` detects `<bml-scene>` and initializes the core engine.
3.  `index.js` (or `BmlScene`) detects `<bml-entity>` or primitive elements.
4.  For each entity element, a `BmlEntity` instance is created.
5.  `BmlEntity` reads its attributes.
6.  For each relevant attribute (e.g., `position`, `geometry`), the `ComponentManager` instantiates and attaches the corresponding component.
7.  Components parse their attribute data using `parsers.js`.
8.  Components execute their logic, creating or modifying Babylon.js objects (`Mesh`, `Material`, setting `position`, etc.) associated with the entity's `TransformNode` or `Mesh`.
9.  Attribute changes on the HTML elements trigger component updates.
10. Element removal triggers component removal and cleanup of Babylon.js objects.
