# Core Concepts: `<bml-entity>`

The `<bml-entity>` element is the fundamental building block for objects within your BabylonML scene. It represents a node in the 3D scene graph and serves as a container for components that define its appearance, position, and behavior.

## Purpose

*   **Scene Graph Node:** Each `<bml-entity>` corresponds to a `BABYLON.TransformNode` in the underlying Babylon.js scene graph by default. A `TransformNode` is a lightweight node primarily used for positioning, rotating, and scaling.
*   **Component Host:** Entities don't do much on their own. Their functionality comes from attaching *components* via HTML attributes (e.g., `position`, `geometry`, `material`).
*   **Hierarchy:** Entities can be nested inside other entities to create parent-child relationships, mirroring the scene graph structure. Transformations (position, rotation, scale) applied to a parent entity affect its children.
*   **Lifecycle Management:** The `<bml-entity>` custom element manages the creation, update, and disposal of its corresponding Babylon.js node and attached components when the element is added to, modified within, or removed from the DOM.

## Basic Usage

```html
<bml-scene>
  <!-- An entity with position, geometry, and material components -->
  <bml-entity
    id="my-sphere"
    position="1 0.5 -2"
    geometry="type: sphere; diameter: 1"
    material="type: standard; diffuseColor: blue">
  </bml-entity>

  <!-- An empty entity acting as a parent/group -->
  <bml-entity id="pivot-point" position="0 2 0" rotation="0 30 0">
    <!-- A child entity, its position is relative to the parent -->
    <bml-entity
      id="child-box"
      position="1 0 0"
      geometry="type: box; size: 0.5"
      material="type: standard; diffuseColor: green">
    </bml-entity>
  </bml-entity>
</bml-scene>
```

## Components

Components are defined using attributes on the `<bml-entity>` tag. The framework parses these attributes and manages the underlying Babylon.js logic.

*   **Attribute Syntax:** Components typically use a key-value string format, separated by semicolons (`;`) and colons (`:`). Example: `position="x: 1; y: 2; z: 3"` or `material="type: standard; diffuseColor: #FF0000"`. The specific properties depend on the component. See the Component Reference section for details on each component.
*   **Dynamic Updates:** Changing an observed attribute on the `<bml-entity>` element in the DOM (e.g., via JavaScript `setAttribute`) will trigger the corresponding component's `update` logic.

## Lifecycle Callbacks (Internal)

The `BmlEntity` custom element uses standard lifecycle callbacks:

*   **`connectedCallback()`:** Called when the entity is added to the DOM. This is where the Babylon.js `TransformNode` is created, parented correctly in the scene graph, and initial components are initialized based on existing attributes.
*   **`disconnectedCallback()`:** Called when the entity is removed from the DOM. This triggers the removal of all attached components and the disposal of the corresponding Babylon.js node, cleaning up resources.
*   **`attributeChangedCallback(name, oldValue, newValue)`:** Called when an attribute listed in `observedAttributes` changes. This delegates the update logic to the `ComponentManager`, which finds the relevant component and calls its `update` method.

## `observedAttributes`

For `attributeChangedCallback` to function, the custom element must define which attributes it cares about. `BmlEntity` dynamically gets this list from the `ComponentManager`, ensuring that any registered component attribute will trigger updates when changed. The `id` attribute is also always observed.

## Accessing the Babylon.js Node

While the goal of BabylonML is to abstract away direct Babylon.js interaction, you can access the underlying node if needed:

```javascript
const entityElement = document.getElementById('my-sphere');
if (entityElement && entityElement.babylonNode) {
  const transformNode = entityElement.babylonNode;
  // Interact with the Babylon.js TransformNode directly
  // transformNode.scaling.y = 2;
}
```

**Note:** Some components, like `geometry`, might create a `Mesh` instead of just using the default `TransformNode`. The `babylonNode` property might reference this `Mesh`, or the `Mesh` might be a child of the entity's main `TransformNode`. Check the specific component documentation for details. Currently, the geometry mesh is created as a child of the entity's `TransformNode`.
