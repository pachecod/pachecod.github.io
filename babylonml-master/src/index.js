// src/index.js

/**
 * =========================================================================
 * Import Babylon.js Core Modules
 * =========================================================================
 * We need to explicitly import the Babylon.js classes and functions
 * we intend to use throughout the framework. Rollup (our bundler) will
 * ensure these are included in the final babylonml.js file.
 * We import only what's needed to keep the bundle size manageable.
 */
import {
    Engine,          // The main engine object, responsible for rendering.
    Scene,           // The container for all 3D objects, lights, cameras.
    Vector3,         // Represents 3D points and directions (x, y, z).
    Color3,          // Represents RGB colors.
    HemisphericLight,// A simple ambient light source.
    FreeCamera,      // A standard first-person perspective camera.
    MeshBuilder,     // Helper to create standard shapes (box, sphere, etc.).
    StandardMaterial,// A basic material type.
    TransformNode,   // A node in the scene graph for position/rotation/scale, without geometry.
    // ... import other Babylon modules as needed (e.g., ArcRotateCamera, PBRMaterial, AssetContainer, SceneLoader, etc.)
} from '@babylonjs/core';

// Optional: Log for debugging during development
console.log("BabylonML Framework Core Loading...");

/**
 * =========================================================================
 * Import Core Framework Modules
 * =========================================================================
 * These are the classes and functions *we* will write in other files.
 */
import { ComponentManager } from './core/ComponentManager.js'; // Manages component registration and lifecycle
import { BmlScene } from './core/BmlScene.js';               // Defines the <bml-scene> element behavior
import { BmlEntity } from './core/BmlEntity.js';             // Defines the <bml-entity> element behavior

/**
 * =========================================================================
 * Import and Register Built-in Components
 * =========================================================================
 * Components define specific behaviors or properties (like position or geometry).
 * We need to explicitly register them so the ComponentManager knows they exist.
 * This could be done in separate files within src/components/ and imported here.
 */
import registerCoreComponents from './components/registerCoreComponents.js';
registerCoreComponents(ComponentManager); // Pass the manager to the registration function

/**
 * =========================================================================
 * Define Custom HTML Elements
 * =========================================================================
 * This is the core of the HTML abstraction. We link our custom tag names
 * (like 'bml-scene') to the JavaScript classes that define their behavior.
 * The browser uses this registry when it encounters these tags in HTML.
 * It's crucial that components are registered *before* elements that might use them
 * are potentially defined in the HTML, although script execution order usually handles this.
 */
if (!customElements.get('bml-scene')) { // Check if not already defined (good practice)
    customElements.define('bml-scene', BmlScene);
    console.log("<bml-scene> defined.");
}
if (!customElements.get('bml-entity')) {
    customElements.define('bml-entity', BmlEntity);
    console.log("<bml-entity> defined.");
}
// Later, you would also define primitives here:
import { BmlBox } from './primitives/BmlBox.js';
if (!customElements.get('bml-box')) {
    customElements.define('bml-box', BmlBox);
    console.log("<bml-box> defined.");
}
// ... etc for other primitives like <bml-sphere>, <bml-plane>

/**
 * =========================================================================
 * Expose Global API (Optional but common)
 * =========================================================================
 * We create a global object (attached to `window`) to allow users to
 * interact with the framework, primarily for registering custom components.
 * The name 'BML' was chosen in the Rollup config (`output.name`).
 * Rollup's 'iife' format wraps our bundle, and this explicit attachment
 * ensures the API is accessible globally.
 */
window.BML = {
    // Expose the component registration function
    registerComponent: ComponentManager.registerComponent.bind(ComponentManager),

    // Maybe expose core Babylon objects if needed, though often discouraged
    // to maintain abstraction.
    // BABYLON: { Vector3, Color3, ... }, // Re-exporting specific classes

    // Versioning info
    version: '0.1.0', // Get this from package.json dynamically during build later

    // Potentially expose internal systems for advanced users/debugging
    // _ComponentManager: ComponentManager,
    // _BmlScene: BmlScene,
    // _BmlEntity: BmlEntity,
};

console.log("BabylonML Framework Initialized. Global API 'BML' available.", window.BML);
