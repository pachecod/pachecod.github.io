# Active Context: BabylonML - Documentation Fixes & Inspector Integration

## Current Focus

Addressed documentation formatting issues (missing navigation link), fixed a scrolling problem on the "Live Examples" page within the generated MkDocs site, and integrated the Babylon.js Inspector toggle (`Ctrl+I`).

## Task Breakdown (XR Support Added)

1.  **Camera Component Implementation:** **DONE**
    *   Created `src/components/camera.js` with logic for `arcRotate` and `universal` types.
    *   Implemented logic to set the first camera component as `scene.activeCamera`.
    *   Added `registerCameraComponent` function.
    *   Registered component in `src/components/registerCoreComponents.js`.
    *   Created documentation `docs/components/camera.md`.
2.  **Custom Mesh Loading:** **DONE**
    *   Modified `geometry` component (`src/components/geometry.js`) to handle `type: 'mesh'`.
    *   Added `src` attribute parsing.
    *   Integrated `SceneLoader.ImportMeshAsync`.
    *   Updated documentation (`docs/components/geometry.md`).
3.  **PhotoDome Implementation:** **DONE**
    *   Modified `geometry` component to handle `type: 'photodome'`.
    *   Integrated `BABYLON.PhotoDome`.
    *   Added `src`, `resolution`, `size`, `useDirectMapping` attributes.
    *   Updated documentation.
4.  **VideoDome Implementation:** **DONE**
    *   Modified `geometry` component to handle `type: 'videodome'`.
    *   Integrated `BABYLON.VideoDome`.
    *   Added `src`, `resolution`, `size`, `autoPlay`, `loop`, `muted`, `clickToPlay`, `poster` attributes.
    *   Updated documentation.
5.  **Basic XR Support:** **DONE**
    *   Added `xr` attribute handling (`vr`, `ar`, `true`) to `<bml-scene>` (`src/core/BmlScene.js`).
    *   Integrated `WebXRDefaultExperience` for basic session management.
    *   Added XR helper initialization and disposal logic.
    *   Updated scene documentation (`docs/concepts/scene.md`).
    *   Created VR example (`examples/vr_scene.html`).
    *   Created AR example (`examples/ar_scene.html`).
6.  **Documentation & Examples (Defaults/Multi-Camera):** **DONE**
    *   Updated `docs/concepts/scene.md` to explain default camera/light behavior and the non-functional `light` attribute placeholder.
    *   Updated `docs/components/camera.md` to explain multiple camera handling ("first-one-wins").
    *   Created `examples/default_scene.html` demonstrating default setup.
    *   Created `examples/explicit_camera_light_placeholder.html` demonstrating explicit camera and light placeholder attribute.
    *   Created `examples/multi_camera_scene.html` demonstrating multiple camera definitions.
7.  **Fix Multi-Camera Example:** **DONE**
    *   Corrected the JavaScript logic in `examples/multi_camera_scene.html` to properly attach controls when switching to a camera that initially had `attachControl: false`.
8.  **Fix Camera Component Update Logic:** **DONE**
    *   Corrected the `update` method in `src/components/camera.js` to properly use pre-parsed `position` and `target` data, ensuring UniversalCamera works correctly.
9.  **Fix Material Component Update Logic:** **DONE**
    *   Corrected the `update` method in `src/components/material.js` to convert parsed color objects (e.g., `{r,g,b}`) into `BABYLON.Color3` instances before applying them to material properties (e.g., `diffuseColor`), enabling dynamic updates via `setAttribute`.
10. **Fix Documentation Formatting & Scrolling:** **DONE**
    *   Added `components/camera.md` to the navigation in `mkdocs.yml`.
    *   Created `docs/css/custom.css` to enable vertical scrolling on the main content area (`[role="main"]`).
    *   Updated `mkdocs.yml` to include `extra_css: - css/custom.css`.
    *   Rebuilt documentation using `npm run docs:build`.
11. **Integrate Babylon.js Inspector:** **DONE**
    *   Installed `@babylonjs/inspector` dependency.
    *   Imported `@babylonjs/inspector` in `src/core/BmlScene.js`.
    *   Added event listener in `connectedCallback` to toggle `scene.debugLayer` on `Ctrl+I`.
    *   Added listener removal in `disconnectedCallback`.

## Next Steps

1.  Update `memory-bank/progress.md` to reflect the documentation fixes and inspector integration.
2.  Run the library build process (`npm run build`) to bundle the inspector changes into the distributable file.
3.  Test the documentation site locally (`npm run docs:serve`) to verify the navigation fix and scrolling behavior on the "Live Examples" page.
4.  Test the live examples (or local examples using the built library) to confirm the `Ctrl+I` inspector toggle works.
5.  Consider implementing a basic `light` component.
6.  Update `README.md` to mention recent features (XR, camera, inspector, etc.).
7.  Update `package.json` version if appropriate (e.g., to 1.2.1 or 1.3.0).

-   **Camera Activation:** The first camera component initialized is set as active. Need to consider behavior if multiple cameras are defined or if the active one is removed dynamically. **Status: Basic 'first-one-wins' logic implemented and documented.**
-   **Camera Updates:** The `update` logic disposes and recreates the camera. It now correctly uses pre-parsed data for properties like `position` and `target`. A more refined approach (updating existing properties) could be implemented later. **Status: Basic recreate logic implemented, data parsing fixed.**
-   **Default Camera/Light:** Scene provides defaults if no `[camera]` or `[light]` attribute is present. **Status: Implemented and documented.**
-   **Light Component:** Adding a `light` attribute prevents the default light, but no component exists to parse it. **Status: Documented as a limitation; component implementation pending.**
-   **Geometry Component Decision:** Extended the existing `geometry` component for `mesh`, `photodome`, `videodome`. **Decision Implemented.**
-   **Asset Loading Errors:** Need robust error handling for external assets. **Status: Basic console logging implemented.**
-   **Async Loading:** Ensure correct handling within lifecycle. **Status: Implemented for mesh loading.**
-   **XR Initialization Timing:** Used `setTimeout` in `BmlScene` to delay XR initialization slightly, aiming to avoid race conditions with camera components. Needs testing. **Status: Implemented.**
-   **XR Error Handling:** Basic `try...catch` and support checks added in `BmlScene.#initializeXR`. More user-facing feedback could be added. **Status: Basic implementation.**
-   **XR Feature Scope:** Initial implementation uses `WebXRDefaultExperience` for basic session entry. Controllers, teleportation, hit-testing etc., are not yet declaratively supported. **Status: Basic implementation.**
