// src/core/BmlEntity.js

import { TransformNode } from '@babylonjs/core';
import { ComponentManager } from './ComponentManager.js';

export class BmlEntity extends HTMLElement {

    #babylonNode = null; // Reference to the corresponding Babylon.js TransformNode (or Mesh sometimes)
    #attachedComponents = {}; // Keep track of component instances attached to this entity
    #sceneElement = null; // Cache the scene element
    #sceneReadyListener = null; // Store the event listener function for removal

    // Flag to prevent processing attributes before the node AND scene are ready
    #isReady = false;

    constructor() {
        super();
        // console.log('<bml-entity>: Constructor');
    }

    /**
     * =========================================================================
     * Standard DOM Accessor: Get parent <bml-scene> element
     * =========================================================================
     */
    get sceneElement() {
        // Traverse up the DOM tree to find the closest ancestor <bml-scene>
        return this.closest('bml-scene');
    }

    /**
     * =========================================================================
     * Babylon.js Node Accessor
     * =========================================================================
     */
    get babylonNode() {
        return this.#babylonNode;
    }

    // Setter might be needed if components replace the node (e.g., geometry creating a Mesh)
    set babylonNode(node) {
        if (this.#babylonNode && this.#babylonNode !== node) {
            // Handle disposal or reparenting if replacing an existing node
            console.warn(`<${this.tagName.toLowerCase()}>: Babylon node reference changed.`);
            // Potentially dispose old node here IF it's safe to do so
        }
        this.#babylonNode = node;
    }


    /**
     * =========================================================================
     * Lifecycle Callback: connectedCallback
     * =========================================================================
     * Called when the <bml-entity> is added to the DOM.
     */
    connectedCallback() {
        // console.log(`<${this.tagName.toLowerCase()}>: Connected to DOM`, this);

        // --- 1. Find Parent Scene/Entity and Babylon Scene ---
        this.#sceneElement = this.sceneElement; // Cache scene element
        if (!this.#sceneElement) {
            console.error(`<${this.tagName.toLowerCase()}> must be a descendant of a <bml-scene>.`, this);
            return;
        }

        // Check if scene is ready *before* accessing babylonScene property
        if (!this.#sceneElement.isReady) {
             // Scene not ready yet, wait for the event
             console.log(`<${this.tagName.toLowerCase()}>: Scene not ready, waiting for bml-scene-ready event.`);
             this.#sceneReadyListener = this._onSceneReady.bind(this); // Bind 'this'
             this.#sceneElement.addEventListener('bml-scene-ready', this.#sceneReadyListener);
             // Don't proceed with Babylon node creation until scene is ready
             return;
        }

        // Scene is already ready, proceed with initialization immediately
        this._initializeBabylonNode();
    }

    /**
     * =========================================================================
     * Scene Ready Event Handler
     * =========================================================================
     * Called when the parent <bml-scene> dispatches 'bml-scene-ready'.
     */
    _onSceneReady() {
        console.log(`<${this.tagName.toLowerCase()}>: Received bml-scene-ready event.`);
        // Clean up the listener immediately
        if (this.#sceneElement && this.#sceneReadyListener) {
            this.#sceneElement.removeEventListener('bml-scene-ready', this.#sceneReadyListener);
            this.#sceneReadyListener = null;
        }
        // Now that the scene is ready, create the Babylon node and components
        this._initializeBabylonNode();
    }


    /**
     * =========================================================================
     * Initialize Babylon Node and Components
     * =========================================================================
     * Creates the Babylon.js node, attaches it, and initializes components.
     * Called either directly from connectedCallback (if scene was already ready)
     * or from the bml-scene-ready event handler.
     */
    _initializeBabylonNode() {
        if (this.#babylonNode) {
             console.warn(`<${this.tagName.toLowerCase()}>: Attempted to initialize Babylon node more than once.`);
             return; // Already initialized
        }
        if (!this.#sceneElement || !this.#sceneElement.babylonScene) {
             console.error(`<${this.tagName.toLowerCase()}>: Cannot initialize Babylon node, scene element or Babylon scene not found/ready.`);
             return;
        }

        const babylonScene = this.#sceneElement.babylonScene;
        const parentElement = this.parentElement?.closest('bml-entity, bml-scene');

        // Determine the Babylon.js parent node
        let babylonParentNode = null; // Default to null (attach to scene root)
         if (parentElement && parentElement.tagName.toLowerCase() === 'bml-entity') {
             // Wait for parent entity's node to be ready? Might need async/event handling
            // For simplicity, assume parent's connectedCallback ran first or access its node directly
            if (parentElement.babylonNode) {
                babylonParentNode = parentElement.babylonNode;
            } else {
                console.warn(`<${this.tagName.toLowerCase()}>: Parent <bml-entity> Babylon node not ready yet. Attaching to scene root.`);
                 // Fallback or wait? Waiting adds complexity (e.g., promises, events).
                 // Attaching to scene ensures it exists, might reparent later if needed.
                  // babylonParentNode = babylonScene; // WRONG: Don't assign the scene object directly
                  babylonParentNode = null; // Assign null to attach to scene root if parent isn't ready
             }
         }
         // No 'else' needed, the default is already null (scene root)

        // --- 2. Create Babylon.js Node ---
        // Use TransformNode by default. Components might replace this later.
        // Use the element's HTML id if provided, otherwise generate a fallback name.
        const nodeName = this.id || `${this.tagName.toLowerCase()}_${Math.random().toString(36).substring(2, 7)}`;
        this.#babylonNode = new TransformNode(nodeName, babylonScene);

        // --- 3. Attach to Scene Graph ---
        this.#babylonNode.parent = babylonParentNode;
        // console.log(`<${this.tagName.toLowerCase()}>: Created Babylon node "${this.#babylonNode.name}" and attached to parent`, babylonParentNode);

        // Store a reference back to the HTML element on the Babylon node (useful for debugging/picking)
        this.#babylonNode.bmlElement = this;

        // --- 4. Initialize Components based on Attributes ---
        this._initializeComponents();
    }


    /**
     * =========================================================================
     * Initialize Components
     * =========================================================================
     * Iterates initial attributes and tells ComponentManager to initialize components.
     */
    _initializeComponents() {
        if (this.#isReady) return; // Prevent double initialization

        // Now that the node exists and scene is ready, process initial attributes.
        this.#isReady = true; // Mark as ready for attributeChangedCallback

        // Iterate over *all* attributes present on the element.
        for (let i = 0; i < this.attributes.length; i++) {
            const attr = this.attributes[i];
            // Use the ComponentManager to check if this attribute corresponds to a component
            // and trigger its initialization ('init' and initial 'update').
            ComponentManager.handleAttributeInitialization(this, attr.name, attr.value);
        }
        console.log(`<${this.tagName.toLowerCase()}>: Initialized components from attributes.`);
    }


    /**
     * =========================================================================
     * Lifecycle Callback: disconnectedCallback
     * =========================================================================
     * Called when the <bml-entity> is removed from the DOM.
     */
    disconnectedCallback() {
        console.log(`<${this.tagName.toLowerCase()}>: Disconnected from DOM. Cleaning up Babylon node: ${this.#babylonNode?.name}`);
        this.#isReady = false; // Mark as not ready

        // --- 0. Remove Scene Ready Listener (if attached) ---
        if (this.#sceneElement && this.#sceneReadyListener) {
            this.#sceneElement.removeEventListener('bml-scene-ready', this.#sceneReadyListener);
            console.log(`<${this.tagName.toLowerCase()}>: Removed scene ready listener.`);
            this.#sceneReadyListener = null;
        }
        this.#sceneElement = null; // Clear cached scene element

        // --- 1. Detach and Remove Components ---
        // Iterate through attached components and call their 'remove' lifecycle method.
        ComponentManager.removeAllComponents(this); // Tell manager to clean up this entity
        this.#attachedComponents = {}; // Clear local cache


        // --- 2. Dispose Babylon.js Node ---
        // This removes the node from the scene graph and frees associated resources.
        // It will also dispose children nodes/meshes in the Babylon hierarchy.
        if (this.#babylonNode) {
            this.#babylonNode.dispose();
             console.log(`<${this.tagName.toLowerCase()}>: Babylon node disposed.`);
        }
        this.#babylonNode = null; // Clear the reference
    }

    /**
     * =========================================================================
     * Lifecycle Callback: attributeChangedCallback
     * =========================================================================
     * Called automatically by the browser *only for attributes listed* in
     * the static `observedAttributes` getter below, when their value changes.
     * @param {string} name - The name of the attribute that changed.
     * @param {string|null} oldValue - The previous value, or null if added.
     * @param {string|null} newValue - The new value, or null if removed.
     */
    attributeChangedCallback(name, oldValue, newValue) {
         // Avoid processing changes during initial setup or teardown phases if logic isn't ready
        if (!this.#isReady || newValue === oldValue) {
            // console.log(`<${this.tagName.toLowerCase()}>: Attribute change skipped (not ready or value same): ${name}`);
            return;
        }

        // console.log(`<${this.tagName.toLowerCase()}>: Attribute changed: ${name}, Old: ${oldValue}, New: ${newValue}`);

        // Let the ComponentManager handle the update. It will figure out which
        // component (if any) corresponds to this attribute and call its 'update'.
        ComponentManager.handleAttributeUpdate(this, name, newValue, oldValue);
    }

    /**
     * =========================================================================
     * Static Property: observedAttributes
     * =========================================================================
     * REQUIRED for `attributeChangedCallback` to work. Returns an array of
     * attribute names that this custom element wants to be notified about.
     * How to manage this dynamically?
     *   - Option 1: Hardcode common ones (position, rotation, scale, material, geometry etc.). Simple but limited.
     *   - Option 2: Have ComponentManager maintain a global list of all registered component names. BEST approach.
     *   - Option 3: Use a wildcard (not standard) or observe *all* attributes via MutationObserver (less performant).
     *
     * Let's assume ComponentManager provides the list:
     */
    static get observedAttributes() {
        // Delegate to ComponentManager to get the list of all registered component attribute names.
        // This assumes ComponentManager exposes such a list.
        const attributes = ComponentManager.getObservedAttributes();
        // console.log('BmlEntity observedAttributes:', attributes);
         // We also always want to observe 'id'
        if (!attributes.includes('id')) {
            attributes.push('id');
        }
        return attributes;
    }

    // --- Component Management Methods (called by ComponentManager) ---

    /** Called by ComponentManager when a component is successfully initialized for this entity */
    _registerAttachedComponent(componentName, componentInstance) {
         // console.log(`<${this.tagName.toLowerCase()}>: Component attached - ${componentName}`);
        this.#attachedComponents[componentName] = componentInstance;
    }

    /** Called by ComponentManager before a component is removed */
    _unregisterAttachedComponent(componentName) {
        // console.log(`<${this.tagName.toLowerCase()}>: Component detached - ${componentName}`);
        delete this.#attachedComponents[componentName];
    }

    /** Get attached component instance data */
    getComponentData(componentName) {
        return this.#attachedComponents[componentName]?.data;
    }

    /** Get all attached components */
    getAttachedComponents() {
        return this.#attachedComponents;
    }

    // Add _isReady getter for BmlBox to access
    get _isReady() {
        return this.#isReady;
    }
}
