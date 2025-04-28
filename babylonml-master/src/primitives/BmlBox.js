// src/primitives/BmlBox.js
import { BmlEntity } from '../core/BmlEntity.js'; // Base entity class
import { ComponentManager } from '../core/ComponentManager.js'; // To access registered attributes
import * as Parsers from '../core/parsers.js'; // Need parsers for default values

// Define attributes specific to the box primitive
const BOX_ATTRIBUTES = ['width', 'height', 'depth', 'size']; // size is shorthand for width=height=depth

export class BmlBox extends BmlEntity {

    // Observe box-specific attributes *in addition* to the standard entity attributes
    static get observedAttributes() {
        // Get standard entity attributes (position, rotation, material, etc.)
        // Use BmlEntity's static getter directly if possible, otherwise ComponentManager
        // It's better practice to inherit if the base class provides it. Let's assume BmlEntity.observedAttributes works.
        // const baseAttributes = super.observedAttributes; // This doesn't work for static getters directly
        const baseAttributes = ComponentManager.getObservedAttributes(); // Get all registered component attributes
         // We also always want to observe 'id' in BmlEntity
        if (!baseAttributes.includes('id')) {
            baseAttributes.push('id');
        }
        // Combine with box-specific attributes, ensuring no duplicates
        const combined = new Set([...baseAttributes, ...BOX_ATTRIBUTES]);
        // console.log('BmlBox observedAttributes:', Array.from(combined));
        return Array.from(combined);
    }

    constructor() {
        super();
        // console.log('<bml-box>: Constructor');
    }

    connectedCallback() {
        // console.log('<bml-box>: Connected');
        // Run the standard BmlEntity connection logic FIRST.
        // This creates the TransformNode before we try to set geometry on it.
        super.connectedCallback();

        // IMPORTANT: Only set geometry AFTER super.connectedCallback ensures _isReady
        // and component handling is active via BmlEntity.
        // Accessing #isReady directly isn't possible, use the getter added to BmlEntity
        if (this._isReady) {
             this.updateGeometryAttribute();
        } else {
            // If not ready yet (shouldn't happen often if super.connectedCallback works),
            // maybe defer with a microtask? This indicates a potential timing issue.
            console.warn("<bml-box>: Entity not ready immediately after super.connectedCallback(). Deferring geometry update.");
            queueMicrotask(() => {
                 if (this._isReady) { // Double check readiness
                    this.updateGeometryAttribute();
                 } else {
                      console.error("<bml-box>: Entity was still not ready after microtask in connectedCallback.");
                 }
            });
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // Let the base BmlEntity handle standard attributes first
        super.attributeChangedCallback(name, oldValue, newValue);

        // If a box-specific attribute changed, update the underlying 'geometry' attribute
        // Ensure _isReady check is included as attributeChangedCallback can fire early.
        if (BOX_ATTRIBUTES.includes(name) && this._isReady && newValue !== oldValue) {
            // console.log(`<bml-box>: Box attribute changed: ${name}=${newValue}. Updating geometry.`);
            this.updateGeometryAttribute();
        }
    }

    /**
     * Helper function to construct and set the 'geometry' attribute string
     * based on the box-specific attributes present on this element.
     */
    updateGeometryAttribute() {
        // Read box attributes, providing defaults using the parser
        const sizeAttr = this.getAttribute('size');
        let width, height, depth;

        if (sizeAttr !== null) {
             // Use parseNumber for potentially stringy attributes
             const size = Parsers.parseNumber(sizeAttr, 1);
             width = size; height = size; depth = size;
        } else {
            width = Parsers.parseNumber(this.getAttribute('width'), 1);
            height = Parsers.parseNumber(this.getAttribute('height'), 1);
            depth = Parsers.parseNumber(this.getAttribute('depth'), 1);
        }

        // Construct the geometry component string value
        const geometryValue = `type: box; width: ${width}; height: ${height}; depth: ${depth}`;

        // Set the 'geometry' attribute on this element. This will trigger the
        // standard attributeChangedCallback -> ComponentManager -> geometry.update() flow.
        // Check if the value actually needs changing to prevent potential loops if geometry.update also sets attributes.
        if (this.getAttribute('geometry') !== geometryValue) {
            this.setAttribute('geometry', geometryValue);
            // console.log(`<bml-box>: Set geometry attribute to: "${geometryValue}"`);
        }
    }
}
