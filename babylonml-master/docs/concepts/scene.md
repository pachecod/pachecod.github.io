# Core Concepts: `<bml-scene>`

The `<bml-scene>` element is the heart of any BabylonML application. It acts as the root container for your 3D world and handles the initialization of the underlying Babylon.js engine and scene.

## Purpose

*   **Initializes Babylon.js:** Automatically creates the `Engine` and `Scene` objects required by Babylon.js.
*   **Creates a Canvas:** If no `<canvas>` element is found inside `<bml-scene>`, it will create one automatically to render the scene.
*   **Provides Defaults:** Sets up a default camera and a default light source if none are explicitly defined within the scene, making it easy to get something visible quickly.
*   **Manages Scene Lifecycle:** Starts the Babylon.js render loop to continuously draw the scene.
*   **Entity Management:** Uses a `MutationObserver` to detect when `<bml-entity>` elements are added or removed, managing their corresponding Babylon.js nodes.
*   **Provides Context:** Makes the Babylon.js `Scene` object available to descendant `<bml-entity>` elements and their components.

## Basic Usage

```html
<bml-scene>
  <!-- Entities go here -->
  <bml-entity geometry="type: box"></bml-entity>
</bml-scene>
```

This minimal example will:
1.  Create a Babylon.js Engine and Scene.
2.  Create a `<canvas>` element filling the `<bml-scene>` container.
3.  Add a default camera (a `FreeCamera`).
4.  Add a default light (a `HemisphericLight`).
5.  Start rendering the scene (which will initially contain the box entity).

## Default Camera and Light

To make it easy to get started, `<bml-scene>` automatically creates a default camera and light source under specific conditions:

*   **Default Camera:** If no element within the `<bml-scene>` has a `camera` attribute (e.g., `<bml-entity camera="...">`), a `BABYLON.FreeCamera` named `default_camera` is created. It's positioned at `(0, 1.6, -5)` and has mouse/touch controls attached to the canvas.
*   **Default Light:** If no element within the `<bml-scene>` has a `light` attribute (e.g., `<bml-entity light="...">`), a `BABYLON.HemisphericLight` named `default_light` is created, providing basic ambient illumination from above.

**Overriding Defaults:**

*   If you add *any* element with a `camera` attribute, the default camera will **not** be created. You are then responsible for defining your own camera(s) using the [camera component](./../components/camera.md).
*   If you add *any* element with a `light` attribute, the default light will **not** be created.
    *   **Important Note:** As of the current version, there is no built-in `light` component. Adding a `light` attribute *only* prevents the default light; it does not automatically create a new light source based on the attribute value. To add specific lights (PointLight, SpotLight, etc.), you currently need to use custom JavaScript that interacts with the Babylon.js scene (e.g., within the `bml-scene-ready` event). A dedicated `light` component is planned for future development.

## Styling

It's crucial to give `<bml-scene>` dimensions using CSS, otherwise the canvas might not be visible or have zero size. A common approach is to make it fill the viewport:

```css
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden; /* Prevent scrollbars */
  height: 100%;
  width: 100%;
}

bml-scene {
  width: 100vw; /* Viewport width */
  height: 100vh; /* Viewport height */
  display: block; /* Ensure it behaves like a block element */
}

/* Optional: Ensure canvas itself doesn't cause layout issues */
canvas {
  display: block;
}
```

## Attributes

*   **`xr`**: Enables WebXR support for the scene. This attribute initializes the Babylon.js `WebXRDefaultExperience` helper, providing a quick way to add VR or AR capabilities.
    *   `xr="vr"`: Initializes the scene for Virtual Reality (VR). Requires a VR-capable headset and browser.
    *   `xr="ar"`: Initializes the scene for Augmented Reality (AR). Requires an AR-capable device (usually mobile) and browser, and often requires the page to be served over HTTPS.
    *   `xr` or `xr="true"`: Initializes a default XR experience, typically VR.
    *   If the attribute is omitted, XR support is disabled.

    **Example:**
    ```html
    <!-- Enable VR mode -->
    <bml-scene xr="vr">
      <bml-entity geometry="type: box" position="0 1 -3"></bml-entity>
    </bml-scene>

    <!-- Enable AR mode -->
    <bml-scene xr="ar">
      <bml-entity geometry="type: sphere" position="0 1 -2"></bml-entity>
    </bml-scene>
    ```
    **Note:** WebXR support is dependent on the user's browser and hardware capabilities. The framework will attempt to initialize the requested mode, but it may fail if the requirements are not met. Check the browser console for messages regarding XR initialization status.

    *   **Live VR Example:** [View VR Scene](https://bayblonml-frontend.netlify.app/examples/vr_scene.html)
    *   **Live AR Example:** [View AR Scene](https://bayblonml-frontend.netlify.app/examples/ar_scene.html) (Requires compatible device/browser)

## Events

*   **`bml-scene-ready`:** Fired when the Babylon.js Engine and Scene have been initialized, the default camera/light (if needed) are set up, and the render loop has started. The event `detail` contains references to the Babylon.js `scene` and `engine`.

    ```javascript
    const sceneEl = document.querySelector('bml-scene');
    sceneEl.addEventListener('bml-scene-ready', (event) => {
      console.log('Scene is ready!', event.detail);
      const babylonScene = event.detail.scene;
      const babylonEngine = event.detail.engine;
      // You can now interact with the Babylon.js objects directly
    });
    ```

## Internal Details

*   The `<bml-scene>` element creates and manages instances of `BABYLON.Engine` and `BABYLON.Scene`.
*   It uses a `MutationObserver` to watch for changes to its direct children and descendants to manage `<bml-entity>` lifecycles.
