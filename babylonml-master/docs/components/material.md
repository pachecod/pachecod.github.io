# Component Reference: `material`

The `material` component defines the surface appearance of an entity's mesh (created by the `geometry` component). It primarily uses Babylon.js's `StandardMaterial`.

## Attribute Syntax

The `material` attribute uses the component/map string format. The `type` property determines the kind of material (currently only `standard` is fully supported). Other properties control visual aspects like color and texture.

```html
<!-- A simple red material -->
<bml-entity material="type: standard; diffuseColor: red"></bml-entity>

<!-- A material with diffuse and emissive colors -->
<bml-entity material="type: standard; diffuseColor: #00FF00; emissiveColor: #333333"></bml-entity>

<!-- A material using a texture (requires texture loading logic) -->
<!-- <bml-entity material="type: standard; diffuseTexture: path/to/texture.jpg"></bml-entity> -->
```

## Common Properties

| Property | Type   | Default     | Description                                      |
| :------- | :----- | :---------- | :----------------------------------------------- |
| `type`   | string | `'standard'` | The type of material to create. Currently `standard`. |

## `type: standard` Properties

These properties apply when `type` is `standard` (or omitted). They correspond to properties of Babylon.js's `StandardMaterial`.

| Property        | Type        | Default     | Description                                                                 |
| :-------------- | :---------- | :---------- | :-------------------------------------------------------------------------- |
| `diffuseColor`  | color       | `#FFFFFF` (White) | The base color of the material under light.                                 |
| `emissiveColor` | color       | `#000000` (Black) | Color emitted by the material, independent of light (makes it glow).        |
| `specularColor` | color       | `#FFFFFF` (White) | Color of highlights from light sources.                                     |
| `ambientColor`  | color       | `#000000` (Black) | Color of the material in ambient light (less commonly used).                |
| `alpha`         | number      | `1.0`       | Overall transparency (0 = fully transparent, 1 = fully opaque).             |
| `specularPower` | number      | `64`        | Controls the sharpness/size of specular highlights. Higher is sharper.        |
| `wireframe`     | boolean     | `false`     | If `true`, renders the mesh as a wireframe instead of solid surfaces.       |
| `backFaceCulling`| boolean    | `true`      | If `true` (default), hides the back faces of polygons for performance. Set to `false` for double-sided materials. |
| `diffuseTexture`| string (URL)| `null`      | URL of the texture image for the base color. *(Texture loading needs implementation)* |
| `emissiveTexture`| string (URL)| `null`      | URL of the texture for emissive color. *(Texture loading needs implementation)* |
| *... (other StandardMaterial properties like bumpTexture, ambientTexture etc. could be added)* |             |             |                                                                             |

**Color Parsing:** Color properties accept standard CSS color formats like `#RRGGBB`, `#RGB`, color names (`red`, `blue`), `rgb(r,g,b)`.

## Underlying Babylon.js Object

This component creates and manages a `BABYLON.StandardMaterial` instance and applies it to the mesh created by the `geometry` component on the same entity.

## Example

```html
<bml-scene>
  <!-- A shiny blue sphere -->
  <bml-entity
    geometry="type: sphere"
    position="0 1 -5"
    material="type: standard; diffuseColor: #0000FF; specularColor: #AAAAFF; specularPower: 128">
  </bml-entity>

  <!-- A semi-transparent green box -->
  <bml-entity
    geometry="type: box"
    position="2 1 -5"
    material="type: standard; diffuseColor: green; alpha: 0.6">
  </bml-entity>

   <!-- A wireframe ground -->
  <bml-entity
    geometry="type: ground; subdivisions: 5"
    position="0 0 -5"
    material="type: standard; diffuseColor: grey; wireframe: true">
  </bml-entity>
</bml-scene>
```

## Notes

*   The `material` component requires a `geometry` component on the same entity to have a mesh to apply the material to.
*   If the `geometry` component recreates its mesh (e.g., on type change), the `material` component will reapply the current material to the new mesh.
*   Texture properties (`diffuseTexture`, etc.) are defined in the schema but require specific loading logic within the component's `update` method, which is not yet implemented in the base version shown in previous steps.
*   Changing material properties dynamically via `setAttribute` will update the appearance.
