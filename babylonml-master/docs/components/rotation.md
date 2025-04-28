# Component Reference: `rotation`

The `rotation` component controls the orientation of an entity in 3D space using Euler angles (degrees).

## Attribute Syntax

The `rotation` attribute accepts a string representing Euler angles (in degrees). It can be specified in two ways:

1.  **Component/Map String:** Using `x:`, `y:`, `z:` keys.
    ```html
    <bml-entity rotation="x: 0; y: 45; z: 15"></bml-entity>
    ```
2.  **Direct Vector String:** A space-separated string of three numbers (X Y Z degrees).
    ```html
    <bml-entity rotation="0 45 15"></bml-entity>
    ```

If any coordinate is omitted in the map string, it defaults to `0`. If the attribute is present but empty (`rotation=""`), it defaults to `0 0 0`.

## Properties

| Property | Type   | Default | Description                                  |
| :------- | :----- | :------ | :------------------------------------------- |
| `x`      | number | `0`     | Rotation around the X-axis (pitch), degrees. |
| `y`      | number | `0`     | Rotation around the Y-axis (yaw), degrees.   |
| `z`      | number | `0`     | Rotation around the Z-axis (roll), degrees.  |

## Underlying Babylon.js Property

This component modifies the `rotation` property (a `Vector3`) of the entity's underlying Babylon.js `TransformNode` (or `Mesh`). **Important:** Babylon.js internally uses radians for rotation, but the `rotation` component schema handles the conversion from the degrees you provide in the HTML attribute to radians.

## Example

```html
<bml-scene>
  <!-- Rotate a box 45 degrees around the Y axis -->
  <bml-entity
    geometry="type: box"
    position="0 1 -5"
    rotation="0 45 0"
    material="type: standard; diffuseColor: purple">
  </bml-entity>

  <!-- Rotate a cylinder using map syntax -->
  <bml-entity
    geometry="type: cylinder"
    position="-2 1 -5"
    rotation="x: 90; y: 0; z: 0" <!-- Lay the cylinder on its side -->
    material="type: standard; diffuseColor: grey">
  </bml-entity>
</bml-scene>
```

## Notes

*   Rotations are applied in a specific order (typically Y, then X, then Z in Babylon.js default Euler order).
*   The rotation is relative to the entity's parent's orientation.
*   Changing the `rotation` attribute dynamically via JavaScript (`element.setAttribute('rotation', '...')`) will update the entity's orientation in the scene.
*   For complex rotations or avoiding gimbal lock issues, Babylon.js also supports Quaternions (`rotationQuaternion`), but this component currently focuses on the more intuitive Euler angles.
