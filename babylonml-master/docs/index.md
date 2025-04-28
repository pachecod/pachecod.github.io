# Welcome to BabylonML

BabylonML makes creating 3D web experiences easier by providing HTML-like tags to control the powerful [Babylon.js](https://www.babylonjs.com/) engine.

Instead of writing complex JavaScript setup code, you can define your scene declaratively:

```html
<bml-scene>
  <bml-entity
    id="my-box"
    position="0 1 -3"
    rotation="0 45 0"
    geometry="type: box; width: 1; height: 1; depth: 1"
    material="type: standard; diffuseColor: #FF0000">
  </bml-entity>

  <bml-entity
    id="ground"
    position="0 0 -3"
    geometry="type: ground; width: 5; height: 5"
    material="type: standard; diffuseColor: #444444">
  </bml-entity>
</bml-scene>
```

**➡️ [View Live Examples](examples.md)**

## Key Concepts

*   **`<bml-scene>`:** The root element that initializes the Babylon.js engine and scene.
*   **`<bml-entity>`:** Represents an object or node within the 3D scene. Think of it like a `div` for 3D.
*   **Components:** Attributes like `position`, `rotation`, `geometry`, and `material` that define the properties and behavior of an entity.

## Getting Started

*(Documentation on installation and basic usage will go here)*

## Next Steps

This documentation is just getting started. Future sections will cover:

*   Detailed installation instructions.
*   In-depth explanations of core concepts (`<bml-scene>`, `<bml-entity>`, Component System).
*   Reference guides for all built-in components.
*   Examples of common use cases.
*   How to create custom components.
