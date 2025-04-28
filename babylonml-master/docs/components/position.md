# Component Reference: `position`

The `position` component controls the location of an entity within the 3D scene's coordinate system.

## Attribute Syntax

The `position` attribute accepts a string representing a 3D vector. It can be specified in two ways:

1.  **Component/Map String:** Using `x:`, `y:`, `z:` keys.
    ```html
    <bml-entity position="x: 1; y: 2.5; z: -3"></bml-entity>
    ```
2.  **Direct Vector String:** A space-separated string of three numbers (X Y Z).
    ```html
    <bml-entity position="1 2.5 -3"></bml-entity>
    ```

If any coordinate is omitted in the map string, it defaults to `0`. If the attribute is present but empty (`position=""`), it defaults to `0 0 0`.

## Properties

| Property | Type   | Default | Description                        |
| :------- | :----- | :------ | :--------------------------------- |
| `x`      | number | `0`     | Position along the horizontal axis |
| `y`      | number | `0`     | Position along the vertical axis   |
| `z`      | number | `0`     | Position along the depth axis      |

## Underlying Babylon.js Property

This component directly modifies the `position` property (a `Vector3`) of the entity's underlying Babylon.js `TransformNode` (or `Mesh`).

## Example

```html
<bml-scene>
  <!-- Place a box 1 unit right, 2 units up, and 4 units back -->
  <bml-entity
    geometry="type: box"
    position="x: 1; y: 2; z: -4"
    material="type: standard; diffuseColor: orange">
  </bml-entity>

  <!-- Place a sphere using direct vector syntax -->
  <bml-entity
    geometry="type: sphere"
    position="-2 0.5 -3"
    material="type: standard; diffuseColor: cyan">
  </bml-entity>
</bml-scene>
```

## Notes

*   The position is relative to the entity's parent in the scene graph. If the entity is a direct child of `<bml-scene>`, the position is relative to the world origin (0, 0, 0).
*   Changing the `position` attribute dynamically via JavaScript (`element.setAttribute('position', '...')`) will update the entity's position in the scene.
