// src/components/rotation.js
import { Vector3, Angle } from '@babylonjs/core';
import * as Parsers from '../core/parsers.js'; // Need the parser

export default function registerRotationComponent(ComponentManager) {
    ComponentManager.registerComponent('rotation', {
        // Schema for rotation, typically represented as Euler angles (degrees) in HTML
        schema: {
            type: 'vec3', // Use vec3 parser for {x, y, z}
            default: { x: 0, y: 0, z: 0 } // Default rotation in degrees
        },

        // update() - Called on initialization and attribute changes.
        update(data, oldData) {
            // 'data' is the parsed rotation in degrees {x, y, z}
            // console.log('Updating rotation to (degrees):', data);

            if (this.babylonNode) { // Ensure the Babylon.js node exists
                // Convert degrees to radians for Babylon.js
                // Option 1: If babylonNode has rotationQuaternion (preferred for avoiding gimbal lock)
                if (this.babylonNode.rotationQuaternion) {
                    // Note: Setting Euler angles directly can lead to gimbal lock.
                    // It's often better to work with Quaternions, but direct Euler angles are simpler for users.
                    // We convert the Euler angles (degrees) to a Quaternion.
                    const rotationRadians = {
                        x: Angle.FromDegrees(data.x).radians(),
                        y: Angle.FromDegrees(data.y).radians(),
                        z: Angle.FromDegrees(data.z).radians()
                    };
                    // This creates a new Quaternion from Euler angles (YXZ order is common)
                    this.babylonNode.rotationQuaternion = Quaternion.RotationYawPitchRoll(
                        rotationRadians.y,
                        rotationRadians.x,
                        rotationRadians.z
                    );
                     // console.log('Applied rotation as Quaternion:', this.babylonNode.rotationQuaternion);

                } else {
                     // Option 2: Fallback to .rotation if rotationQuaternion doesn't exist (less common for TransformNode/Mesh)
                     // Directly set Euler angles in radians.
                    this.babylonNode.rotation.x = Angle.FromDegrees(data.x).radians();
                    this.babylonNode.rotation.y = Angle.FromDegrees(data.y).radians();
                    this.babylonNode.rotation.z = Angle.FromDegrees(data.z).radians();
                    // console.log('Applied rotation as Euler radians:', this.babylonNode.rotation);
                }

            } else {
                console.warn("Rotation component update called before babylonNode was ready on", this);
            }
        },

        // remove() - Usually not needed for simple properties.
        // remove(data) {
        //    console.log('Rotation component removed.');
        // }
    });
}

// Need to import Quaternion if using Option 1
import { Quaternion } from '@babylonjs/core';
