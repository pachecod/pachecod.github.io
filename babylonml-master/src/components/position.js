// src/components/position.js
import { Vector3 } from '@babylonjs/core';
import * as Parsers from '../core/parsers.js'; // Need the parser

export default function registerPositionComponent(ComponentManager) {
    ComponentManager.registerComponent('position', {
        // Schema defines the structure and default value of the component's data.
        // It also informs the parser how to convert the attribute string.
        schema: {
            type: 'vec3', // Custom type handled by our parser module
            default: { x: 0, y: 0, z: 0 } // Default JS object
        },

        // Optional: init() - Called once when the component is first attached.
        // Often not needed for simple property components if 'update' handles initial state.
        // init(data) {
        //    console.log('Position component initialized with data:', data, 'on element:', this);
        //    // 'this' inside lifecycle methods refers to the BmlEntity HTML element
        //    // 'this.babylonNode' gives access to the Babylon.js node
        // },

        // update() - Called on initialization *after* init(), and whenever the attribute changes.
        update(data, oldData) {
            // 'data' is the newly parsed data object (e.g., {x: 1, y: 2, z: 3})
            // 'oldData' is the previously parsed data object (or undefined on first update)
            // console.log('Updating position to:', data, 'from:', oldData);

            if (this.babylonNode) { // Ensure the Babylon.js node exists
                // Update the position of the underlying Babylon.js TransformNode/Mesh
                // Always create a new Vector3 or use .copyFrom() to avoid reference issues
                // if the parser reuses objects.
                // Ensure Parsers.vec3ToObject exists and correctly converts the object format
                if (Parsers.vec3ToObject) {
                    this.babylonNode.position.copyFrom(Parsers.vec3ToObject(data));
                } else {
                     // Fallback or direct assignment if vec3ToObject is not defined yet
                     // This assumes 'data' is already in {x, y, z} format from the parser
                     this.babylonNode.position.x = data.x;
                     this.babylonNode.position.y = data.y;
                     this.babylonNode.position.z = data.z;
                     console.warn("Parsers.vec3ToObject not found, assigning position components directly.");
                }
            } else {
                console.warn("Position component update called before babylonNode was ready on", this);
            }
        },

        // Optional: remove() - Called once when the component is detached (attribute removed or element removed).
        // Usually not needed for simple properties unless init created something that needs disposal.
        // remove(data) {
        //    console.log('Position component removed. Last data was:', data);
        //    // Reset position? Usually not necessary as the node itself will be disposed.
        //    // if (this.babylonNode) {
        //    //    this.babylonNode.position.copyFrom(this.schema.default); // Reset to default?
        //    // }
        // }
    });
}
