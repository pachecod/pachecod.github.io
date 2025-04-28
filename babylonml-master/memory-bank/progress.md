# Progress: BabylonML - Documentation Improvements

## What Works (Assumed based on file structure)

-   Basic scene setup (`<bml-scene>`).
-   Entity creation (`<bml-entity>`).
-   Core components:
    -   `position`
    -   `rotation`
    -   `scale`
    -   `material` (basic color/texture support)
    -   `geometry` (supports primitives: `box`, `sphere`, `plane`, `cylinder`, `cone`, `ground`; `mesh`, `photodome`, `videodome`).
    -   `camera` (supports `universal`, `arcRotate` types, sets first camera as active).
-   **NEW:** Basic XR support via `xr` attribute on `<bml-scene>` (handles `vr`, `ar`, `true`). Integrates `WebXRDefaultExperience`.
-   Primitive element (`<bml-box>`).
-   Component registration and management system.
-   Attribute parsing for component data (`parsers.js`).
-   Build process via Rollup (`rollup.config.js`).
-   Documentation structure via MkDocs (`mkdocs.yml`, `docs/`).
-   Asynchronous mesh loading via `SceneLoader`.
-   `PhotoDome` and `VideoDome` integration.
-   Updated `geometry` component documentation (`docs/components/geometry.md`).
-   Created `camera` component documentation (`docs/components/camera.md`), updated for multi-camera handling.
-   Updated scene documentation (`docs/concepts/scene.md`) for `xr` attribute and default camera/light behavior.
-   Added documentation clarification about the non-functional `light` attribute placeholder.
-   **NEW:** Integrated Babylon.js Inspector toggle (`Ctrl+I`) into the core scene (`BmlScene.js`).
-   **NEW:** Fixed documentation navigation (added `camera.md` to `mkdocs.yml`).
-   **NEW:** Fixed documentation page scrolling issue (added custom CSS via `extra_css` in `mkdocs.yml`).

## What's Left to Build

1.  **Build:** Run `npm run build` to bundle the library including recent changes (especially the Inspector integration).
2.  **Test Docs:** Run `npm run docs:serve` and verify navigation and scrolling on the "Live Examples" page.
3.  **Test Examples:** Test examples (local or live) to confirm `Ctrl+I` inspector toggle works.
4.  **README:** Update `README.md` to mention recent features (XR, camera, inspector, etc.).
5.  **Versioning:** Update `package.json` version (e.g., to 1.2.1 or 1.3.0).
6.  **Light Component:** Consider implementing a basic `light` component.
6.  **(DONE)** Custom Mesh Loading: Implemented in `geometry` component.
7.  **(DONE)** PhotoDome: Implemented in `geometry` component.
8.  **(DONE)** VideoDome: Implemented in `geometry` component.
9.  **(DONE)** Geometry Documentation: Updated `docs/components/geometry.md`.
10. **(DONE)** Camera Component: Implemented `camera.js`, registered it, created `docs/components/camera.md`.
11. **(DONE)** Examples: Created examples for `mesh`, `photodome`, `videodome`.
12. **(DONE)** Basic XR Support: Implemented `xr` attribute on `<bml-scene>`, integrated `WebXRDefaultExperience`, updated docs, created examples.
13. **(DONE)** Documentation & Examples (Defaults/Multi-Camera): Updated docs for scene/camera, created new examples.
14. **(DONE)** Fix Multi-Camera Example: Corrected JS logic in `examples/multi_camera_scene.html` to properly attach controls on switch.
15. **(DONE)** Fix Camera Component Update Logic: Corrected `update` method in `src/components/camera.js` to use pre-parsed data.
16. **(DONE)** Fix Documentation Formatting: Added `camera.md` to `mkdocs.yml` navigation.
17. **(DONE)** Fix Documentation Scrolling: Added custom CSS to allow scrolling on main content area.
18. **(DONE)** Integrate Inspector: Added `@babylonjs/inspector` dependency and toggle logic (`Ctrl+I`) to `BmlScene.js`.

## Current Status

-   Core framework structure is in place.
-   Basic primitives, transform, material, geometry (including mesh/domes), and camera components are functional.
-   Basic XR support (VR/AR session entry) via `xr` attribute on `<bml-scene>` is implemented.
-   Documentation updated for `geometry`, `camera` (including multi-camera), and `scene` (XR attribute, default camera/light).
-   Documentation navigation and scrolling issues fixed.
-   Babylon.js Inspector toggle (`Ctrl+I`) integrated.
-   Memory Bank files (`activeContext.md`, `progress.md`) updated to reflect recent fixes, documentation changes, and inspector integration.
-   Examples created for VR, AR, default scene setup, explicit camera/light placeholder, and multiple cameras (including fixes for switching logic and camera component).
-   Next steps involve building the library, testing the documentation site and examples (including inspector toggle), updating the README, and considering a `light` component.

## Known Issues

-   Error handling for asset loading (`mesh`, `photodome`, `videodome`) is basic (console warnings/errors). More robust user feedback or fallback mechanisms could be added.
-   Updating properties *other than* `type` or `src` for `mesh`, `photodome`, `videodome` after initial creation is not supported (requires recreation).
-   Performance implications of loading large assets haven't been tested.
-   Interaction between the `material` component and the internal materials of `PhotoDome`/`VideoDome` might need refinement/clarification.
-   `camera` component's `update` logic currently disposes and recreates the camera; a more efficient update modifying existing properties could be implemented later.
-   Active camera logic is basic ('first component wins') and documented. More complex scenarios (multiple cameras, dynamic removal) might require more sophisticated handling or clearer documentation on manual JS intervention.
-   **NEW:** Light Component: Adding a `light` attribute prevents the default light, but no component exists to parse it or create a light source. This is a known limitation requiring custom JS or a future component.
-   XR error handling is basic; relies on console messages and `WebXRDefaultExperience` UI.
-   XR feature set is minimal (session entry only). Controllers, advanced AR features (hit-testing, anchors), etc., are not yet declaratively supported.
-   Compatibility and performance of XR features across different devices/browsers need testing.
-   **FIXED:** `ReferenceError: BABYLON is not defined` in geometry component (used imported `AbstractMesh`).
-   **FIXED:** Mesh loading example (`mesh_example.html`) updated to use a CORS-enabled URL (`Avocado.glb`).
-   **FIXED:** Mesh loading logic in `geometry` component updated to correctly handle URLs with query parameters by passing the full URL as the filename to `SceneLoader.ImportMeshAsync`.
-   **FIXED:** Mesh loading error ("JSON parse") by installing `@babylonjs/loaders` and importing `@babylonjs/loaders/glTF` in `geometry.js` to ensure the loader is registered.
-   **FIXED:** Multi-camera example (`examples/multi_camera_scene.html`) switching logic now correctly attaches controls to the target camera regardless of its initial `attachControl` setting.
-   **FIXED:** Camera component (`src/components/camera.js`) `update` method now correctly uses pre-parsed `position` and `target` data from the ComponentManager, resolving issues with UniversalCamera setup.
   **FIXED:** Material component (`src/components/material.js`) `update` method now correctly converts parsed color objects (e.g., `{r,g,b}`) into `BABYLON.Color3` instances before applying them to material properties (e.g., `diffuseColor`), enabling dynamic updates via `setAttribute`.

## Project Evolution / Decisions

-   **Decision Implemented:** Extended the existing `geometry` component to handle `mesh`, `photodome`, and `videodome` types.
-   **Decision Implemented:** Created a new `camera` component to handle camera definitions declaratively.
-   **Decision Implemented:** Added basic XR support via an `xr` attribute on `<bml-scene>` leveraging `WebXRDefaultExperience`.
-   **Decision Implemented:** Clarified default camera/light behavior and multiple camera handling in documentation and examples.
-   **Decision Implemented:** Integrated Babylon.js Inspector toggle via `Ctrl+I` for easier debugging.
