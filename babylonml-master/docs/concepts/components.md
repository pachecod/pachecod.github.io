# Core Concepts: Components

Components are the primary way to attach data and behavior to `<bml-entity>` elements in BabylonML. They are defined using HTML attributes and manage specific aspects of the entity's corresponding Babylon.js node(s).

## Purpose

*   **Encapsulation:** Each component focuses on a single aspect (e.g., position, geometry, material, light, custom behavior).
*   **Reusability:** Components can be applied to any entity.
*   **Declarative Approach:** Define an entity's properties directly in HTML using component attributes.
*   **Extensibility:** You can register custom components to add new functionality.

## Defining Components

Components are attached to `<bml-entity>` elements via attributes. The name of the attribute corresponds to the registered component name.

```html
<bml-entity
  position="x: 0; y: 1; z: -5"  <!-- Position component -->
  geometry="type: box; size: 2" <!-- Geometry component -->
  material="type: standard; diffuseColor: yellow" <!-- Material component -->
>
</bml-entity>
```

## Component Schema and Parsing

*   **Schema:** Each component defines a `schema` that specifies the expected data structure and default values for its properties. This helps with parsing and validation. BabylonML currently supports simple types (`string`, `number`, `boolean`) and a `map` type for key-value string parsing (like `position` or `geometry`).
*   **Parsing:** The framework uses parsers (like `parseVector3`, `parseColor3`, `parseObjectString` found in `src/core/parsers.js`) to convert the attribute string value into a JavaScript object or value based on the component's schema.
*   **Data Object:** The parsed attribute value is passed as the `data` object to the component's lifecycle methods (`init`, `update`, `remove`).

## Component Lifecycle Methods

When a component is registered, it provides an object containing lifecycle methods:

*   **`schema` (Required):** Defines the expected data structure and defaults.
    ```javascript
    schema: {
        type: 'map', // or 'string', 'number', 'vec3', etc.
        default: { x: 0, y: 0, z: 0 } // Default value if attribute is empty or missing properties
    }
    ```
*   **`init(data)` (Optional):** Called *once* when the component is first attached to the entity and the entity is connected to the DOM. Use this for one-time setup related to the component. `data` contains the initial parsed attribute value.
*   **`update(data, oldData)` (Optional):** Called initially after `init` and subsequently whenever the component's corresponding attribute value changes on the HTML element. `data` is the new parsed value, `oldData` is the previous value. Use this to apply changes to the Babylon.js scene based on the new data.
*   **`remove(data)` (Optional):** Called when the component is detached from the entity (e.g., the attribute is removed) or when the entity itself is removed from the DOM. Use this for cleanup, like disposing of Babylon.js objects created by the component. `data` contains the last known parsed value.

**`this` Context:** Inside these lifecycle methods, `this` refers to the `<bml-entity>` HTML element instance the component is attached to. This allows access to `this.babylonNode` (the entity's TransformNode/Mesh) and `this.sceneElement` (the parent `<bml-scene>`).

## Component Manager

The `ComponentManager` (in `src/core/ComponentManager.js`) is a central registry and handler for components:

*   **Registration:** `ComponentManager.registerComponent(name, definition)` is used to register a new component type.
*   **Lifecycle Invocation:** It hooks into the entity's lifecycle (`connectedCallback`, `attributeChangedCallback`, `disconnectedCallback`) to call the appropriate `init`, `update`, or `remove` methods on the relevant components.
*   **Attribute Observation:** It provides the list of all registered component attribute names to `BmlEntity.observedAttributes` so the browser knows which attribute changes to monitor.
*   **Parsing:** It uses the component's schema and the core parsers to handle attribute string conversion.

## Example: Position Component (Simplified)

```javascript
// Simplified structure - see src/components/position.js for full example
ComponentManager.registerComponent('position', {
  schema: { type: 'vec3', default: { x: 0, y: 0, z: 0 } }, // Expects parseVector3

  update(data) {
    // 'this' is the <bml-entity> element
    if (this.babylonNode) {
      this.babylonNode.position.set(data.x, data.y, data.z);
    }
  }
  // No init or remove needed for simple position updates
});
```

This component system provides a structured way to extend BabylonML's capabilities declaratively through HTML attributes.
