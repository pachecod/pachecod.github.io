# Component Reference: `scale`

The `scale` component controls the size of an entity along the X, Y, and Z axes.

## Attribute Syntax

The `scale` attribute accepts a string representing a 3D vector. It can be specified in two ways:

1.  **Component/Map String:** Using `x:`, `y:`, `z:` keys.
    ```html
    <bml-entity scale="x: 1; y: 2; z: 0.5"></bml-entity>
    ```
2.  **Direct Vector String:** A space-separated string of three numbers (X Y Z scale factors).
    ```html
    <bml-entity scale="1 2 0.5"></bml-entity>
    ```

If any coordinate is omitted in the map string, it defaults to `1`. If the attribute is present but empty (`scale=""`), it defaults to `1 1 1`.

## Properties

| Property | Type   | Default | Description                                |
| :------- | :----- | :------ | :----------------------------------------- |
| `x`      | number | `1`     | Scaling factor along the X-axis.           |
| `y`      | number | `1`     | Scaling factor along the Y-axis.           |
| `z`      | number | `1`     | Scaling factor along the Z-axis.           |

## Underlying Babylon.js Property

This component directly modifies the `scaling` property (a `Vector3`) of the entity's underlying Babylon.js `TransformNode` (or `Mesh`).

## Example

```html
<bml-scene>
  <!-- Make a box twice as tall -->
  <bml-entity
    geometry="type: box"
    position="0 1 -5"
    scale="x: 1; y: 2; z: 1"
    material="type: standard; diffuseColor: red">
  </bml-entity>

  <!-- Make a sphere uniformly smaller using direct vector syntax -->
  <bml-entity
    geometry="type: sphere"
    position="-2 0.5 -5"
    scale="0.5 0.5 0.5"
    material="type: standard; diffuseColor: blue">
  </bml-entity>

  <!-- Make a ground plane wider -->
   <bml-entity
    geometry="type: ground"
    position="0 0 -5"
    scale="2 1 1" <!-- Scale X by 2, Y and Z remain 1 -->
    material="type: standard; diffuseColor: green">
  </bml-entity>
</bml-scene>
```

## Notes

*   A scale factor of `1` means original size, `< 1` means smaller, `> 1` means larger.
*   Scaling is applied relative to the entity's local origin.
*   Scaling applied to a parent entity also affects its children.
*   Changing the `scale` attribute dynamically via JavaScript (`element.setAttribute('scale', '...')`) will update the entity's scale in the scene.
