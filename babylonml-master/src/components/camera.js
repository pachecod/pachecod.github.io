import { ArcRotateCamera, UniversalCamera } from '@babylonjs/core/Cameras'; // Removed Vector3
import { Vector3 } from '@babylonjs/core/Maths/math.vector'; // Added specific Vector3 import
import { parseObjectString, parseVec3, vec3ToObject, parseNumber, parseBoolean } from '../core/parsers'; // Corrected import names

// Track if a camera component has already set the active camera
let activeCameraSet = false;

// No separate component object needed here

export function registerCameraComponent(ComponentManager) { // Keep the registration function export
    ComponentManager.registerComponent('camera', { // Define component object directly here
        schema: {
            type: { type: 'string', default: 'universal' }, // universal, arcRotate, free, etc.
        position: { type: 'vec3', default: '0 5 -10' }, // Used by universal/free
        target: { type: 'vec3', default: '0 0 0' },   // Used by arcRotate
        alpha: { type: 'number', default: -Math.PI / 2 }, // Used by arcRotate
        beta: { type: 'number', default: Math.PI / 2 },   // Used by arcRotate
        radius: { type: 'number', default: 10 },         // Used by arcRotate
        attachControl: { type: 'boolean', default: true }, // Attach controls to canvas
        // Add other common camera properties as needed (fov, minZ, maxZ, speed, etc.)
        },

        // init() is called once when the component is first attached.
        init(data) {
            // 'this' refers to the BmlEntity HTML element.
            // Access scene and canvas via the entity's sceneElement getter
            const sceneElement = this.sceneElement;
            if (!sceneElement || !sceneElement.isReady || !sceneElement.babylonScene || !sceneElement.babylonCanvas) {
                // This check should technically be redundant now due to BmlEntity waiting for scene ready,
                // but it's good defensive programming.
                console.error("Camera component init: Scene element or Babylon scene/canvas not ready on element:", this);
                return;
            }
            this.scene = sceneElement.babylonScene;
            this.canvas = sceneElement.babylonCanvas;
            this._cameraInstance = null; // Use a different name to avoid potential conflicts
            // console.log('Camera component initialized on element:', this);
        },

        // update() is called on initialization *after* init(), and whenever the attribute changes.
        update(data, oldData) { // Accept parsed data object and optional oldData
            // 'this' refers to the BmlEntity HTML element.
            // 'data' is the parsed attribute value (e.g., { type: 'arcRotate', ... })
            // 'oldData' is the previously parsed data (for comparison)

            // Re-verify scene/canvas access in case something went wrong after init
            const sceneElement = this.sceneElement;
            if (!this.scene || !this.canvas) { // Check if they were set during init
                 if (sceneElement && sceneElement.isReady && sceneElement.babylonScene && sceneElement.babylonCanvas) {
                     // Attempt to re-acquire references if init failed but scene is now ready
                     this.scene = sceneElement.babylonScene;
                     this.canvas = sceneElement.babylonCanvas;
                     console.warn("Camera component update: Re-acquired scene/canvas references.");
                 } else {
                     console.error("Camera update called before scene/canvas were ready or available on element:", this);
                     return; // Still not ready
                 }
            }

            // If camera exists, dispose the old one before creating a new one
            if (this._cameraInstance) {
                // Use the parsed 'attachControl' value from the *previous* state if possible,
                // otherwise default to true for detachment check.
                // TODO: Pass oldData to update to handle this properly for attachControl state.
                if (this._cameraInstance.detachControl) { // Check if method exists
                    try {
                         this._cameraInstance.detachControl(this.canvas); // Use the stored canvas reference
                    } catch (e) {
                         console.warn("Error detaching camera control:", e);
                    }
                }
                this._cameraInstance.dispose();
                this._cameraInstance = null;
                // If this was the active camera, we might need to reset the flag,
            // but typically update shouldn't change the *active* status easily.
                // For simplicity, we assume the first camera remains active unless removed.
            }

            // Get the raw attribute string directly from the element ('this')
            // const attributeValue = this.getAttribute('camera') || ''; // Raw value not needed directly if data is parsed correctly
            // const props = parseObjectString(attributeValue); // Parsed data is passed directly

            // Access schema via the component instance stored on the element
            const componentInstance = this.getAttachedComponents()['camera'];
            const schema = componentInstance?.schema; // Get schema from the stored instance

            // Ensure data is an object
            const currentData = data || {};

            // Get defaults from schema (parse them here if needed)
            const defaultPosition = parseVec3(schema?.position?.default || '0 5 -10');
            const defaultTarget = parseVec3(schema?.target?.default || '0 0 0');
            const defaultAlpha = schema?.alpha?.default ?? -Math.PI / 2;
            const defaultBeta = schema?.beta?.default ?? Math.PI / 2;
            const defaultRadius = schema?.radius?.default ?? 10;
            const defaultAttachControl = schema?.attachControl?.default ?? true;
            const defaultType = schema?.type?.default || 'universal';

            // Use parsed data properties if available, otherwise use parsed defaults
            // Assumes 'data' contains values already parsed by ComponentManager based on schema type
            const type = (currentData.type || defaultType).toLowerCase();
            const positionData = currentData.position ?? defaultPosition; // data.position should be parsed vec3 array/object
            const targetData = currentData.target ?? defaultTarget;     // data.target should be parsed vec3 array/object
            const alpha = currentData.alpha ?? defaultAlpha;
            const beta = currentData.beta ?? defaultBeta;
            const radius = currentData.radius ?? defaultRadius;
            const attachControl = currentData.attachControl ?? defaultAttachControl;

            // Convert parsed data (which should be arrays/objects from parseVec3) to Vector3 objects
            const positionVec = vec3ToObject(positionData);
            const targetVec = vec3ToObject(targetData);


            switch (type) {
                case 'arcRotate':
            case 'arcrotate':
                // Use element's ID if available, otherwise generate one?
                const camNameArc = `${this.id || 'bmlEntity'}_arcRotateCamera`;
                this._cameraInstance = new ArcRotateCamera(
                    camNameArc,
                    alpha,
                    beta,
                    radius,
                    targetVec,
                    this.scene
                );
                // ArcRotateCamera position is determined by alpha, beta, radius, target
                break;
            case 'universal':
            case 'free': // Treat free as universal for now
            default:
                 const camNameUni = `${this.id || 'bmlEntity'}_universalCamera`;
                this._cameraInstance = new UniversalCamera(
                    camNameUni,
                    positionVec,
                    this.scene
                );
                this._cameraInstance.setTarget(targetVec); // UniversalCamera needs target set explicitly
                break;
            // Add cases for other camera types (FollowCamera, AnaglyphFreeCamera, etc.)
        }

        if (this._cameraInstance) {
            // Set as active camera ONLY if no other camera component has done so yet
            if (!activeCameraSet) {
                this.scene.activeCamera = this._cameraInstance;
                activeCameraSet = true;
                console.log(`BML Camera Component: Set active camera to ${this._cameraInstance.name}`);
            }

            // Attach controls if specified
            if (attachControl && this._cameraInstance.attachControl) {
                 try {
                    this._cameraInstance.attachControl(this.canvas, true); // Use stored canvas reference
                 } catch (e) {
                     console.warn("Error attaching camera control:", e);
                 }
            }
        } else {
            console.error(`BML Camera Component: Failed to create camera of type "${type}" on element:`, this);
        }
    },

        // remove() is called once when the component is detached.
        remove() {
            // 'this' refers to the BmlEntity HTML element.
            if (this._cameraInstance) {
                 // Detach controls if attached
                 // Use the last known 'attachControl' state from the component's data if possible
                 // Access the component instance data via the entity's internal map
                 const componentInstance = this.getAttachedComponents()['camera']; // Get the instance
                 const lastData = componentInstance?.data; // Get last known data from the instance
                 const lastAttachControl = parseBoolean(lastData?.attachControl, componentInstance?.schema?.attachControl?.default ?? true); // Use schema default as fallback

                 if (lastAttachControl && this._cameraInstance.detachControl) {
                     try {
                        this._cameraInstance.detachControl(this.canvas); // Use stored canvas reference
                     } catch (e) {
                         console.warn("Error detaching camera control during remove:", e);
                     }
                 }

                 // If this camera was the active one, reset the flag and potentially set a default
                 if (this.scene && this.scene.activeCamera === this._cameraInstance) {
                     activeCameraSet = false;
                     // Consider creating/setting a default camera here if needed,
                     // otherwise the scene might become unusable. For now, just log.
                     console.log(`BML Camera Component: Removed active camera ${this._cameraInstance.name}. Scene may need a new active camera.`);
                     // Maybe: this.scene.createDefaultCameraOrLight(true, true, true); // Create default camera if none exists
                     this.scene.activeCamera = null; // Set to null, Babylon might create a default on next frame if needed
                 }

                 this._cameraInstance.dispose();
                 this._cameraInstance = null;
            }
            // Reset the flag when the component is removed, regardless of whether it was active?
            // This might be problematic if multiple cameras exist. Let's only reset if it WAS the active one.
            // if (this.scene.activeCamera === null && !activeCameraSet) {
                 // Check if other camera components exist and make one active? Complex.
                 // For now, rely on Babylon's default behavior or manual setup if the primary camera is removed.
            // }
            // console.log('Camera component removed from element:', this);
        }
    });
}

// Removed duplicated code from previous incorrect refactoring
