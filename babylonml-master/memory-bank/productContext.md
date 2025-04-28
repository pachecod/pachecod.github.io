# Product Context: BabylonML

## Problem Solved

Babylon.js is a powerful 3D engine, but setting up scenes, managing entities, and handling updates can involve significant boilerplate JavaScript code. This can be a barrier for web developers accustomed to declarative approaches like HTML or frameworks like React/Vue/Angular. BabylonML aims to bridge this gap.

## How It Should Work

BabylonML allows users to define 3D scenes using custom HTML tags (e.g., `<bml-scene>`, `<bml-entity>`, `<bml-box>`). Attributes on these tags map to underlying Babylon.js properties or custom component data.

-   **Scene Definition:** A `<bml-scene>` tag initializes the Babylon.js scene, engine, and render loop.
-   **Entity Creation:** `<bml-entity>` tags represent objects within the scene.
-   **Primitives:** Tags like `<bml-box>`, `<bml-sphere>` (and potentially custom ones like `<bml-mesh>`, `<bml-photodome>`) create specific geometries.
-   **Components:** Attributes on entities (e.g., `position="0 1 0"`, `material="color: red"`) are parsed and managed by corresponding components, which interact with the underlying Babylon.js objects.
-   **Lifecycle:** The framework handles the creation, update, and removal of Babylon.js objects based on the DOM structure.

## User Experience Goals

-   **Intuitive:** Feel familiar to web developers. Defining a 3D scene should be as straightforward as structuring an HTML document.
-   **Rapid Prototyping:** Enable quick iteration and experimentation with 3D scenes.
-   **Clear Structure:** Promote organized scene graphs through the DOM hierarchy.
-   **Debugging:** Provide clear error messages when markup is invalid or components fail.
