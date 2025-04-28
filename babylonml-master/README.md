# BabylonML

BabylonML is a declarative, HTML-like framework for creating 3D scenes using the powerful [Babylon.js](https://www.babylonjs.com/) engine. It aims to simplify 3D web development by providing a component-based architecture inspired by frameworks like A-Frame.

## Key Features

*   **Declarative Syntax:** Define your 3D scene using familiar HTML-like tags (`<bml-scene>`, `<bml-entity>`, etc.).
*   **Component-Based:** Attach behaviors and properties (like `position`, `rotation`, `material`) to entities using attributes.
*   **Primitives:** Easily create basic shapes (`box`, `sphere`, `plane`, `cylinder`, `cone`, `ground`).
*   **Custom Mesh Loading:** Load external 3D models (`.glb`, `.gltf`, etc.) using `<bml-entity geometry="type: mesh; src: ...">`.
*   **360° Experiences:** Display immersive 360° photos and videos using `<bml-entity geometry="type: photodome; src: ...">` and `<bml-entity geometry="type: videodome; src: ...">`.
*   **NEW:** **WebXR Support:** Enable basic VR and AR experiences using the `xr` attribute on `<bml-scene>` (e.g., `xr="vr"` or `xr="ar"`).
*   **Extensible:** Designed to allow for custom components and primitives.

## Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>BabylonML Basic Scene</title>
    <style>html, body { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }</style>
    <!-- Load BabylonML -->
    <script src="dist/babylonml.min.js"></script> <!-- Adjust path -->
</head>
<body>
    <bml-scene>
        <!-- Lighting -->
        <bml-entity light="type: hemispheric; intensity: 0.8"></bml-entity>
        <bml-entity light="type: directional; direction: 1 -1 1"></bml-entity>

        <!-- Camera -->
        <bml-entity camera="type: arcRotate; target: 0 1 0; radius: 8; beta: 1.2"></bml-entity>

        <!-- Red Box -->
        <bml-entity
            geometry="type: box; size: 1"
            position="0 1 0"
            rotation="0 0.785 0"
            material="color: red; roughness: 0.6">
        </bml-entity>

        <!-- Green Sphere -->
        <bml-entity
            geometry="type: sphere; diameter: 1.5"
            position="-2 1.5 1"
            material="color: green; metallic: 0.2; roughness: 0.5">
        </bml-entity>

        <!-- Ground -->
        <bml-entity geometry="type: ground; width: 10; height: 10" material="color: #555"></bml-entity>

        <!-- Loaded Model -->
        <bml-entity geometry="type: mesh; src: https://playground.babylonjs.com/scenes/BoomBox.glb" scale="50 50 50" position="3 0.5 0"></bml-entity>

    </bml-scene>
</body>
</html>
```

## Documentation

Detailed documentation (including components, concepts, and getting started guides) can be found in the `/docs` directory and served using MkDocs.

```bash
# Install MkDocs (if needed)
pip install mkdocs

# Serve the documentation locally
npm run docs:serve
```

## Building

To build the library from source:

```bash
# Install dependencies
npm install

# Build the IIFE bundle (output to dist/babylonml.js)
npm run build
