// src/components/material.js
import { StandardMaterial, Color3, Texture } from '@babylonjs/core';
import * as Parsers from '../core/parsers.js'; // Need the parser

// Key to access the mesh created by the geometry component
const GEOMETRY_MESH_KEY = '_geometryMesh';
// Key to store the material created by this component
const MATERIAL_KEY = '_material';

export default function registerMaterialComponent(ComponentManager) {
    ComponentManager.registerComponent('material', {
        // Schema for material properties, expecting a string like "color: #FF0000; emissive: blue; diffuseTexture: url(/path/to/tex.jpg)"
        schema: {
            type: 'map', // Key-value pair string
            default: {} // Default to an empty object, maybe apply a default grey material?
        },

        // init() - Called once when the component is first attached.
        init(data) {
            // console.log('Material component initializing with data:', data, 'on element:', this);
            this[MATERIAL_KEY] = null; // Initialize material tracking
            // Initial application happens in the first update call.
        },

        // update() - Called on initialization and attribute changes.
        update(data, oldData) {
            // console.log('Updating material with data:', data, 'from:', oldData);
            if (!this.babylonNode || !this.sceneElement?.babylonScene) {
                console.warn("Material component update called before babylonNode or scene was ready on", this);
                return;
            }

            const scene = this.sceneElement.babylonScene;
            // Get the mesh created by the geometry component (if it exists)
            const mesh = this[GEOMETRY_MESH_KEY];

            if (!mesh) {
                // console.log("Material component update: No geometry mesh found yet on", this);
                // If the mesh doesn't exist yet, we can't apply the material.
                // The geometry component's update should handle applying existing material
                // when it creates the mesh, OR we could re-trigger material update after geom update.
                // For simplicity, let's assume geometry is created first or material is reapplied.
                // We could potentially store the desired material state and apply it when geom is ready.
                return;
            }

            let material = this[MATERIAL_KEY];

            // --- Create Material if it doesn't exist ---
            // TODO: Handle different material types (e.g., PBRMaterial) based on data.type?
            if (!material) {
                const materialName = `${this.id || 'bml_entity'}_mat`;
                material = new StandardMaterial(materialName, scene);
                this[MATERIAL_KEY] = material;
                console.log(`Material: Created new StandardMaterial (${material.name})`);
                // Apply the material to the mesh immediately after creation
                mesh.material = material;
            }

            // --- Update Material Properties ---
            // Apply properties from the parsed 'data' object.
            // Use parsers for specific types like colors.

            // Example properties for StandardMaterial:
            if (data.color !== undefined || data.diffuse !== undefined) {
                const colorValue = data.color !== undefined ? data.color : data.diffuse; // Allow 'color' or 'diffuse'
                const parsedColor = Parsers.parseColor(colorValue, { r: 1, g: 1, b: 1 }); // Default white {r,g,b}
                material.diffuseColor = new Color3(parsedColor.r, parsedColor.g, parsedColor.b);
            }
            if (data.ambient !== undefined) {
                const parsedColor = Parsers.parseColor(data.ambient, { r: 0, g: 0, b: 0 }); // Default black {r,g,b}
                material.ambientColor = new Color3(parsedColor.r, parsedColor.g, parsedColor.b);
            }
            if (data.emissive !== undefined) {
                const parsedColor = Parsers.parseColor(data.emissive, { r: 0, g: 0, b: 0 }); // Default black {r,g,b}
                material.emissiveColor = new Color3(parsedColor.r, parsedColor.g, parsedColor.b);
            }
            if (data.specular !== undefined) {
                const parsedColor = Parsers.parseColor(data.specular, { r: 1, g: 1, b: 1 }); // Default white {r,g,b}
                material.specularColor = new Color3(parsedColor.r, parsedColor.g, parsedColor.b);
            }
            if (data.specularPower !== undefined) {
                material.specularPower = Parsers.parseNumber(data.specularPower, 64);
            }
            if (data.alpha !== undefined) {
                material.alpha = Parsers.parseNumber(data.alpha, 1.0);
            }
            if (data.wireframe !== undefined) {
                material.wireframe = Parsers.parseBoolean(data.wireframe, false);
            }

            // Texture handling (basic example for diffuse)
            if (data.diffuseTexture !== undefined || data.map !== undefined) {
                 const textureUrl = data.diffuseTexture !== undefined ? data.diffuseTexture : data.map;
                 if (Parsers.parseString(textureUrl)) { // Check if it's a non-empty string
                     // TODO: Handle texture caching/reuse
                     material.diffuseTexture = new Texture(Parsers.parseString(textureUrl), scene);
                 } else {
                     material.diffuseTexture = null; // Remove texture if value is empty/invalid
                 }
            }
            // Add more texture types: ambientTexture, emissiveTexture, bumpTexture, etc.

            // If the mesh's material isn't set yet (e.g., geom created after mat update), set it now.
            if (mesh.material !== material) {
                 mesh.material = material;
            }
        },

        // remove() - Called when the component is detached.
        remove(data) {
            const material = this[MATERIAL_KEY];
            if (material) {
                console.log(`Material: Removing component, disposing material (${material.name})`);
                // We don't necessarily remove the material from the mesh here,
                // as another component might apply a different material later.
                // Disposing the material itself is the main cleanup.
                material.dispose();
            }
            this[MATERIAL_KEY] = null; // Clear the reference
        }
    });
}
