# Component Reference: `geometry`

The `geometry` component defines the shape or mesh of an entity. It can create various primitive shapes using Babylon.js's `MeshBuilder`, load external 3D models using `SceneLoader`, or create immersive `PhotoDome` and `VideoDome` objects.

## Attribute Syntax

The `geometry` attribute uses the component/map string format. The `type` property is required to specify the shape. Other properties depend on the chosen type.

```html
<!-- A box with specific dimensions -->
<bml-entity geometry="type: box; width: 2; height: 1; depth: 0.5"></bml-entity>

<!-- A sphere with a specific diameter -->
<bml-entity geometry="type: sphere; diameter: 1.5"></bml-entity>

<!-- A ground plane -->
<bml-entity geometry="type: ground; width: 10; height: 10"></bml-entity>

<!-- Load an external mesh -->
<bml-entity geometry="type: mesh; src: /path/to/model.glb"></bml-entity>

<!-- Display a 360 photo -->
<bml-entity geometry="type: photodome; src: /path/to/photo.jpg; size: 1000"></bml-entity>

<!-- Display a 360 video -->
<bml-entity geometry="type: videodome; src: /path/to/video.mp4; size: 1000"></bml-entity>
```

## Common Properties

| Property | Type   | Default | Description                                      |
| :------- | :----- | :------ | :----------------------------------------------- |
| `type`   | string | `'box'` | The type of primitive shape to create. Required. |

## Geometry Types and Specific Properties

The `geometry` component creates or loads a Babylon.js `Mesh` (or a helper object like `PhotoDome` which contains a mesh) and parents it to the entity's `TransformNode`.

### `type: box`

Creates a rectangular prism.

| Property | Type   | Default | Description                                     |
| :------- | :----- | :------ | :---------------------------------------------- |
| `width`  | number | `1`     | Size along the X-axis.                          |
| `height` | number | `1`     | Size along the Y-axis.                          |
| `depth`  | number | `1`     | Size along the Z-axis.                          |
| `size`   | number | `n/a`   | If set, overrides `width`, `height`, and `depth`. |

Example: `<bml-entity geometry="type: box; size: 2"></bml-entity>`

### `type: sphere`

Creates a sphere.

| Property    | Type   | Default | Description                                       |
| :---------- | :----- | :------ | :------------------------------------------------ |
| `diameter`  | number | `1`     | Default diameter for all axes.                    |
| `diameterX` | number | `n/a`   | Diameter along the X-axis (overrides `diameter`). |
| `diameterY` | number | `n/a`   | Diameter along the Y-axis (overrides `diameter`). |
| `diameterZ` | number | `n/a`   | Diameter along the Z-axis (overrides `diameter`). |
| `segments`  | number | `32`    | Number of vertical segments (level of detail).    |

Example: `<bml-entity geometry="type: sphere; diameter: 3; segments: 16"></bml-entity>`

### `type: plane`

Creates a flat plane (oriented horizontally by default).

| Property | Type   | Default | Description                               |
| :------- | :----- | :------ | :---------------------------------------- |
| `width`  | number | `1`     | Size along the X-axis.                    |
| `height` | number | `1`     | Size along the Z-axis (depth).            |
| `size`   | number | `n/a`   | If set, overrides `width` and `height`. |

Example: `<bml-entity geometry="type: plane; width: 5; height: 2"></bml-entity>`

### `type: ground`

Creates a flat, tessellated plane optimized for use as ground.

| Property     | Type   | Default | Description                    |
| :----------- | :----- | :------ | :----------------------------- |
| `width`      | number | `10`    | Size along the X-axis.         |
| `height`     | number | `10`    | Size along the Z-axis (depth). |
| `subdivisions` | number | `1`     | Number of subdivisions per side. |

Example: `<bml-entity geometry="type: ground; width: 20; height: 20; subdivisions: 4"></bml-entity>`

### `type: cylinder` / `type: cone`

Creates a cylinder or cone (a cone is a cylinder with `diameterTop: 0`).

| Property         | Type   | Default (Cyl/Cone) | Description                                      |
| :--------------- | :----- | :----------------- | :----------------------------------------------- |
| `height`         | number | `1`                | Height along the Y-axis.                         |
| `diameterTop`    | number | `1` / `0`          | Diameter at the top Y end.                       |
| `diameterBottom` | number | `1`                | Diameter at the bottom Y end.                    |
| `diameter`       | number | `n/a`              | If set, overrides `diameterTop`/`Bottom` (Cone top remains 0). |
| `tessellation`   | number | `24`               | Number of radial sides (level of detail).        |

Example (Cylinder): `<bml-entity geometry="type: cylinder; height: 3; diameter: 0.5; tessellation: 32"></bml-entity>`
Example (Cone): `<bml-entity geometry="type: cone; height: 2; diameterBottom: 1.5"></bml-entity>`

### `type: mesh`

Loads an external 3D model file (e.g., `.glb`, `.gltf`, `.obj`). Uses `SceneLoader.ImportMeshAsync`. The first mesh found in the loaded file (or the one named `__root__`) will be used and parented to the entity.

| Property | Type   | Default | Description                                      |
| :------- | :----- | :------ | :----------------------------------------------- |
| `src`    | string | `n/a`   | **Required.** URL or path to the 3D model file. |

Example:
```html
<!-- Load a GLB model -->
<bml-entity geometry="type: mesh; src: assets/models/my_robot.glb" position="0 1 0"></bml-entity>

<!-- Load from a URL -->
<bml-entity geometry="type: mesh; src: https://example.com/models/spaceship.gltf"></bml-entity>
```
*   **Live Example:** [View Mesh Loading Example](https://bayblonml-frontend.netlify.app/examples/mesh_example.html)

**Note:** Mesh loading is asynchronous. The mesh will appear once loading is complete. Check the browser console for loading progress and errors.

### `type: photodome`

Creates a large sphere with an equirectangular photographic texture mapped to the inside, used for displaying 360° photos. Uses `BABYLON.PhotoDome`.

| Property           | Type    | Default | Description                                                                 |
| :----------------- | :------ | :------ | :-------------------------------------------------------------------------- |
| `src`              | string  | `n/a`   | **Required.** URL or path to the 360° image file (e.g., `.jpg`, `.png`).     |
| `resolution`       | number  | `32`    | The segmentation of the sphere (higher means smoother).                     |
| `size`             | number  | `1000`  | The diameter of the sphere. Should be large enough to encompass the scene. |
| `useDirectMapping` | boolean | `false` | Specifies if the texture is mapped directly or needs correction (rarely needed). |

Example: `<bml-entity geometry="type: photodome; src: assets/textures/skybox_360.jpg; size: 1500"></bml-entity>`

*   **Live Example:** [View Photo Dome Example](https://bayblonml-frontend.netlify.app/examples/photodome_example.html)

### `type: videodome`

Creates a large sphere with an equirectangular video texture mapped to the inside, used for displaying 360° videos. Uses `BABYLON.VideoDome`.

| Property      | Type    | Default | Description                                                                    |
| :------------ | :------ | :------ | :----------------------------------------------------------------------------- |
| `src`         | string  | `n/a`   | **Required.** URL or path to the 360° video file (e.g., `.mp4`, `.webm`).      |
| `resolution`  | number  | `32`    | The segmentation of the sphere.                                                |
| `size`        | number  | `1000`  | The diameter of the sphere.                                                    |
| `autoPlay`    | boolean | `true`  | Whether the video should start playing automatically. Requires `muted: true`. |
| `loop`        | boolean | `true`  | Whether the video should loop.                                                 |
| `muted`       | boolean | `true`  | Whether the video sound is muted (often required for autoplay).                |
| `clickToPlay` | boolean | `false` | If `true`, the video only plays after the user clicks/taps on the dome.        |
| `poster`      | string  | `n/a`   | URL of an image to show before the video loads or plays.                       |

Example: `<bml-entity geometry="type: videodome; src: assets/videos/surfing_360.mp4; size: 1200; muted: false; clickToPlay: true"></bml-entity>`

*   **Live Example:** [View Video Dome Example](https://bayblonml-frontend.netlify.app/examples/videodome_example.html)

## Notes

*   If you change the `type` or the `src` (for relevant types), the old geometry object (mesh, dome) will be disposed and a new one created or loaded.
*   For primitive types (`box`, `sphere`, etc.), changing size properties (like `width`, `diameter`) after initial creation currently causes the mesh to be disposed and recreated.
*   For `mesh`, `photodome`, and `videodome`, changing properties other than `src` after creation is not currently supported (the object would need to be recreated by changing the `src` or `type`).
*   The created/loaded mesh (or the mesh inside a dome) is added as a child to the entity's main `TransformNode`.
*   Materials should be applied via the `material` component. Note that `PhotoDome` and `VideoDome` manage their own internal textures/materials, so applying an external material component might have no effect or unintended consequences on them. For loaded meshes (`type: mesh`), the `material` component should generally work as expected on the mesh surfaces.
