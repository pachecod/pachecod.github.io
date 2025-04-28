// src/components/geometry.js
import { MeshBuilder, Vector3, SceneLoader, PhotoDome, VideoDome, Texture, AbstractMesh } from '@babylonjs/core'; // Added AbstractMesh
import '@babylonjs/loaders/glTF'; // Import the GLTF loader for SceneLoader
import * as Parsers from '../core/parsers.js'; // Need the parser

// Keep track of the mesh/dome/asset container created by this component for disposal
const GEOMETRY_OBJECT_KEY = '_geometryObject';
// Track loading state for async operations
const GEOMETRY_LOADING_KEY = '_geometryLoading';

export default function registerGeometryComponent(ComponentManager) {
    ComponentManager.registerComponent('geometry', {
        // Schema for geometry, expecting a string like "type: box; width: 1; height: 2; depth: 3"
        // Uses a 'map' type which our ComponentManager.parseAttribute should handle
        // via a parser like parseObjectString or parseComponentString.
        schema: {
            type: 'map', // Indicates key-value pair string (e.g., "prop: val; prop2: val2")
            default: { type: 'box' } // Default to a unit box if attribute is empty or just "geometry"
        },

        // init() - Called once when the component is first attached.
        init(data) {
            // console.log('Geometry component initializing with data:', data, 'on element:', this);
            this[GEOMETRY_OBJECT_KEY] = null; // Initialize tracking for the created object (mesh, dome, etc.)
            this[GEOMETRY_LOADING_KEY] = false; // Initialize loading state
        },

        // update() - Called on initialization and attribute changes.
        async update(data, oldData) { // Make update async to handle await for SceneLoader
            // console.log('Updating geometry with data:', data, 'from:', oldData);

            // If currently loading, maybe cancel or ignore? For now, let's prevent updates while loading.
            // A more robust solution would involve cancellation tokens or ignoring stale results.
            if (this[GEOMETRY_LOADING_KEY]) {
                console.warn("Geometry component is already loading, skipping update for:", data);
                return;
            }

            if (!this.babylonNode || !this.sceneElement?.babylonScene) {
                console.warn("Geometry component update called before babylonNode or scene was ready on", this);
                return;
            }

            const scene = this.sceneElement.babylonScene;
            const currentObject = this[GEOMETRY_OBJECT_KEY]; // Use the new key
            const geometryType = data.type?.toLowerCase();
            const currentObjectType = currentObject?.constructor?.name; // Get type of existing object if any

            // Determine if a new object needs to be created/loaded
            // Create/Load new object if:
            // 1. No object exists yet.
            // 2. The geometry 'type' has changed.
            // 3. The 'src' attribute has changed for types that use it (mesh, photodome, videodome).
            let needsNewObject = !currentObject ||
                                 (oldData && data.type !== oldData.type) ||
                                 (oldData && data.src && data.src !== oldData.src && ['mesh', 'photodome', 'videodome'].includes(geometryType));

            // TODO: Add more sophisticated checks for parameter updates (e.g., size changes). Recreating is simpler for now.

            if (needsNewObject) {
                // --- Dispose of the old object if it exists ---
                if (currentObject && typeof currentObject.dispose === 'function') {
                    console.log(`Geometry: Disposing old object (${currentObject.name || currentObjectType}) due to change or recreation.`);
                    currentObject.dispose();
                }
                this[GEOMETRY_OBJECT_KEY] = null; // Clear reference immediately

                // --- Create or Load the new object based on type ---
                let newObject = null; // This might be a Mesh, PhotoDome, VideoDome, or null
                const objectName = `${this.id || 'bml_entity'}_geom_${geometryType || 'unknown'}`;

                // Use MeshBuilder to create the primitive
                switch (geometryType) {
                    case 'box':
                        const boxOptions = {
                            width: Parsers.parseNumber(data.width, 1),
                            height: Parsers.parseNumber(data.height, 1),
                            depth: Parsers.parseNumber(data.depth, 1),
                            size: Parsers.parseNumber(data.size) // If size is provided, it overrides width/height/depth
                        };
                        if (boxOptions.size !== undefined) {
                            boxOptions.width = boxOptions.height = boxOptions.depth = boxOptions.size;
                        }
                        newObject = MeshBuilder.CreateBox(objectName, boxOptions, scene);
                        break;
                    case 'sphere':
                        const sphereOptions = {
                            diameter: Parsers.parseNumber(data.diameter, 1),
                            diameterX: Parsers.parseNumber(data.diameterX),
                            diameterY: Parsers.parseNumber(data.diameterY),
                            diameterZ: Parsers.parseNumber(data.diameterZ),
                            segments: Parsers.parseNumber(data.segments, 32)
                        };
                         // Allow diameterX/Y/Z to override diameter
                        if (sphereOptions.diameterX === undefined) sphereOptions.diameterX = sphereOptions.diameter;
                        if (sphereOptions.diameterY === undefined) sphereOptions.diameterY = sphereOptions.diameter;
                        if (sphereOptions.diameterZ === undefined) sphereOptions.diameterZ = sphereOptions.diameter;
                        newObject = MeshBuilder.CreateSphere(objectName, sphereOptions, scene);
                        break;
                    case 'plane':
                         const planeOptions = {
                            width: Parsers.parseNumber(data.width, 1),
                            height: Parsers.parseNumber(data.height, 1),
                            size: Parsers.parseNumber(data.size) // If size is provided, it overrides width/height
                         };
                         if (planeOptions.size !== undefined) {
                             planeOptions.width = planeOptions.height = planeOptions.size;
                         }
                        newObject = MeshBuilder.CreatePlane(objectName, planeOptions, scene);
                        break;
                    case 'cylinder':
                    case 'cone': // Often CreateCylinder is used for cones too
                         const cylOptions = {
                            height: Parsers.parseNumber(data.height, 1),
                            diameterTop: Parsers.parseNumber(data.diameterTop, geometryType === 'cone' ? 0 : 1), // Cone has 0 top diameter
                            diameterBottom: Parsers.parseNumber(data.diameterBottom, 1),
                            diameter: Parsers.parseNumber(data.diameter), // Overrides top/bottom if specified
                            tessellation: Parsers.parseNumber(data.tessellation, 24)
                         };
                         if (cylOptions.diameter !== undefined) {
                             cylOptions.diameterTop = cylOptions.diameter;
                             cylOptions.diameterBottom = cylOptions.diameter;
                              if (geometryType === 'cone') cylOptions.diameterTop = 0; // Ensure cone top is 0 even if diameter set
                         }
                         newObject = MeshBuilder.CreateCylinder(objectName, cylOptions, scene);
                         break;
                    case 'ground':
                        const groundOptions = {
                            width: Parsers.parseNumber(data.width, 10), // Default width 10
                            height: Parsers.parseNumber(data.height, 10), // Default height 10
                            subdivisions: Parsers.parseNumber(data.subdivisions, 1)
                        };
                        newObject = MeshBuilder.CreateGround(objectName, groundOptions, scene);
                        break;

                    // --- NEW TYPES ---
                    case 'mesh':
                        const meshSrc = data.src;
                        if (!meshSrc) {
                            console.warn(`Geometry type "mesh" requires a "src" attribute.`);
                            return;
                        }
                        console.log(`Geometry: Loading mesh from "${meshSrc}"...`);
                        this[GEOMETRY_LOADING_KEY] = true; // Set loading flag
                        try {
                            // Pass empty rootUrl and full src as filename for SceneLoader
                            const rootUrl = "";
                            const filename = meshSrc; // Use the full URL including query params

                            console.log(`Geometry: Attempting to load mesh with rootUrl: "${rootUrl}", filename: "${filename}"`);

                            // Use ImportMeshAsync - loads meshes, particle systems, skeletons into the scene
                            // Signature: ImportMeshAsync(meshNames, rootUrl, sceneFilename, scene, onProgress, pluginExtension)
                            // Explicitly provide the .glb extension
                            const result = await SceneLoader.ImportMeshAsync(null, rootUrl, filename, scene, undefined, ".glb");
                            console.log(`Geometry: Successfully loaded mesh from "${meshSrc}"`);

                            // Find the root node (often __root__ or the first mesh if only one)
                            const rootMesh = result.meshes.find(m => m.name === "__root__") || result.meshes[0];

                            if (rootMesh) {
                                rootMesh.name = objectName; // Rename the root for clarity
                                newObject = rootMesh; // Store the root mesh
                                // Note: ImportMeshAsync already adds meshes to the scene, but we need to parent the root.
                            } else {
                                console.warn(`Geometry: No meshes found after loading "${meshSrc}".`);
                            }
                        } catch (error) {
                            console.error(`Geometry: Error loading mesh from "${meshSrc}":`, error);
                        } finally {
                            this[GEOMETRY_LOADING_KEY] = false; // Clear loading flag
                        }
                        break; // Important: break after async operation handled

                    case 'photodome':
                        const photoSrc = data.src;
                        if (!photoSrc) {
                            console.warn(`Geometry type "photodome" requires a "src" attribute.`);
                            return;
                        }
                        const photoOptions = {
                            resolution: Parsers.parseNumber(data.resolution, 32),
                            size: Parsers.parseNumber(data.size, 1000),
                            useDirectMapping: Parsers.parseBoolean(data.useDirectMapping, false) // Add other PhotoDome options as needed
                        };
                        // PhotoDome constructor handles texture loading internally
                        newObject = new PhotoDome(objectName, photoSrc, photoOptions, scene);
                        // The PhotoDome object itself contains the mesh (newObject.mesh)
                        break;

                    case 'videodome':
                        const videoSrc = data.src;
                        if (!videoSrc) {
                            console.warn(`Geometry type "videodome" requires a "src" attribute.`);
                            return;
                        }
                        const videoOptions = {
                            resolution: Parsers.parseNumber(data.resolution, 32),
                            size: Parsers.parseNumber(data.size, 1000),
                            autoPlay: Parsers.parseBoolean(data.autoPlay, true),
                            loop: Parsers.parseBoolean(data.loop, true),
                            muted: Parsers.parseBoolean(data.muted, true), // Often required for autoplay
                            clickToPlay: Parsers.parseBoolean(data.clickToPlay, false)
                            // poster: data.poster // Optional poster image
                        };
                        // VideoDome constructor handles video texture creation
                        newObject = new VideoDome(objectName, videoSrc, videoOptions, scene);
                        // The VideoDome object itself contains the mesh (newObject.mesh)
                        break;

                    // Add more types: torus, etc.
                    default:
                        console.warn(`Geometry type "${geometryType}" not recognized.`);
                        // Don't return here if newObject is null, let the parenting logic handle it
                        break;
                }

                // --- Parenting and Storing Reference ---
                if (newObject) {
                    // Determine the actual mesh to parent (could be the object itself or a sub-property)
                    let meshToParent = null;
                    if (newObject instanceof PhotoDome || newObject instanceof VideoDome) {
                        meshToParent = newObject.mesh; // Domes have a .mesh property
                        console.log(`Geometry: Created/loaded ${currentObjectType || geometryType} "${objectName}"`);
                    } else if (newObject instanceof AbstractMesh) { // Use imported AbstractMesh
                        meshToParent = newObject;
                        console.log(`Geometry: Created/loaded mesh "${objectName}" of type "${geometryType}"`);
                    } else {
                         console.warn(`Geometry: Created/loaded object is not a recognized mesh or dome type.`, newObject);
                    }

                    if (meshToParent && this.babylonNode) {
                         // Make the new mesh/dome a child of the entity's main Babylon node (usually a TransformNode).
                         meshToParent.parent = this.babylonNode;
                    } else if (!this.babylonNode) {
                        console.warn("Geometry: Cannot parent mesh, entity's babylonNode is not available yet.");
                    }

                    // Store the reference to the main object (Mesh, PhotoDome, VideoDome) for future updates/removal
                    this[GEOMETRY_OBJECT_KEY] = newObject;
                    console.log(`Geometry: Stored internal reference for ${objectName}. newObject:`, newObject); // Log stored object

                    // Expose the created object on the DOM element for external access
                    // Use `this` because ComponentManager calls methods with the element as `this`
                    console.log(`Geometry: Checking 'this' (element) before dispatch for ${objectName}. Element:`, this); // Log element check
                    if (this) { // `this` should be the <bml-entity> element
                        console.log(`Geometry: Setting BabylonGeometryObject on element for ${objectName}.`);
                        this.BabylonGeometryObject = newObject; // Set property directly on the element
                        // Dispatch a ready event on the element once the object is set
                        console.log(`Geometry: Attempting to dispatch 'bml-geometry-ready' for ${objectName}...`);
                        this.dispatchEvent(new CustomEvent('bml-geometry-ready', {
                            detail: { geometryObject: newObject },
                            bubbles: false // Keep it contained to the element
                        }));
                        console.log(`Geometry: Successfully dispatched 'bml-geometry-ready' for ${objectName} on element`, this);
                    } else {
                        console.warn(`Geometry: Could not dispatch 'bml-geometry-ready' for ${objectName}, 'this' (the element) was not found.`);
                    }
                    console.log(`Geometry: Finished processing block for ${objectName}.`); // Log end of block

                    // Apply initial material? The material component should handle this via the ComponentManager.
                } else if (geometryType === 'mesh' && this[GEOMETRY_LOADING_KEY]) {
                    // Mesh is loading asynchronously, parenting will happen in the callback
                    console.log(`Geometry: Mesh "${objectName}" is loading asynchronously...`);
                } else if (needsNewObject) {
                     console.warn(`Geometry: Failed to create or load object of type "${geometryType}".`);
                }

            } else if (currentObject) {
                // --- Update existing object properties (if applicable and type hasn't changed) ---
                // This is complex. For primitives, recreating is often easier.
                // For domes/meshes, we might update properties if possible, but src change already triggers recreation.
                // console.log(`Geometry: Type "${geometryType}" unchanged, potentially update parameters (not implemented).`);
            }
        },

        // remove() - Called when the component is detached.
        remove(data) {
            // TODO: Handle cancellation if a mesh load is in progress?
            const currentObject = this[GEOMETRY_OBJECT_KEY];
            if (currentObject && typeof currentObject.dispose === 'function') {
                const objectType = currentObject.constructor?.name || 'object';
                console.log(`Geometry: Removing component, disposing ${objectType} (${currentObject.name || 'unnamed'})`);
                currentObject.dispose();
            }
            this[GEOMETRY_OBJECT_KEY] = null; // Clear the internal reference
            // Clear the exposed property on the DOM element
            // Use `this` again, as remove() is also called with the element as `this`
            if (this) {
                this.BabylonGeometryObject = null;
            }
            this[GEOMETRY_LOADING_KEY] = false; // Ensure loading flag is reset
        }
    });
}
