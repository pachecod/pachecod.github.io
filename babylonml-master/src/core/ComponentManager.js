// src/core/ComponentManager.js

// Import parsers for attribute strings (needs detailed implementation)
import * as Parsers from './parsers.js'; // e.g., parseVec3, parseColor, parseObjectString

// Store registered component definitions { name: { schema, init, update, remove } }
const registeredComponents = {};

// Keep track of all attribute names that components use, for observedAttributes
const observedAttributesRegistry = new Set();

export const ComponentManager = {

    /**
     * =========================================================================
     * Register a Component Definition
     * =========================================================================
     * Stores the component's definition (schema, lifecycle methods) and adds its
     * attribute name(s) to the global list for observation by BmlEntity.
     * @param {string} name - The component name (used as HTML attribute).
     * @param {object} definition - Object containing { schema, init?, update?, remove? }.
     */
    registerComponent(name, definition) {
        if (registeredComponents[name]) {
            console.warn(`Component "${name}" is already registered. Overwriting.`);
        }
        if (!definition || !definition.schema) {
             console.error(`Component "${name}" registration failed: Schema is missing.`);
             return;
        }
        console.log(`ComponentManager: Registering component "${name}"`);
        registeredComponents[name] = definition;

        // Add the component name itself to observed attributes
        observedAttributesRegistry.add(name);

        // TODO: If schema defines multiple properties mapped from a single attribute,
        // this is fine. If a component system allows multiple attributes per component,
        // need to register all relevant attribute names here.

        // NOTE: Dynamically updating BmlEntity.observedAttributes after definition
        // is tricky if elements were already created. Best to register all components upfront.
    },

    /**
     * =========================================================================
     * Get List of Attributes to Observe
     * =========================================================================
     * Called by BmlEntity.observedAttributes static getter.
     * @returns {string[]} Array of registered component attribute names.
     */
    getObservedAttributes() {
        return Array.from(observedAttributesRegistry);
    },

    /**
     * =========================================================================
     * Parse Attribute String based on Schema
     * =========================================================================
     * Converts the raw HTML attribute string value into a structured JS object/value.
     * This is a critical and potentially complex part.
     * @param {string} attributeName - The name of the attribute (e.g., 'position').
     * @param {string} value - The raw attribute string value (e.g., "1 2 3").
     * @returns {*} The parsed value (e.g., {x: 1, y: 2, z: 3}) or null if invalid/not a component.
     */
    parseAttribute(attributeName, value) {
        const definition = registeredComponents[attributeName];
        if (!definition) return null; // Not a registered component attribute

        const schema = definition.schema;
        // Example schema handling (needs robust implementation in parsers.js):
        // Single property schema: e.g., { type: 'number', default: 0 }
        // Multi-property schema: e.g., { type: 'vec3', default: {x:0,y:0,z:0}, parse: Parsers.parseVec3 }
        // Object string schema: e.g., { type: 'map', default: {}, parse: Parsers.parseObjectString }

        try {
            // Define known single-value schema types
            const knownSingleTypes = ['vec3', 'color', 'number', 'string', 'boolean', 'map'];

            // Check if schema.type is a string and matches a known single type
            if (typeof schema.type === 'string' && knownSingleTypes.includes(schema.type)) {
                // Handle as single-property schema
                switch(schema.type) {
                    case 'vec3':    return Parsers.parseVec3(value, schema.default);
                    case 'color':   return Parsers.parseColor(value, schema.default);
                    case 'number':  return Parsers.parseNumber(value, schema.default);
                    case 'string':  return Parsers.parseString(value, schema.default);
                    case 'boolean': return Parsers.parseBoolean(value, schema.default);
                    case 'map':     return Parsers.parseObjectString(value, schema.default); // For "prop: val; prop2: val2"
                    // Add more types: 'asset', 'selector', 'array', etc.
                    default:
                         // This case should ideally not be hit if knownSingleTypes is comprehensive
                         console.warn(`ComponentManager: Unhandled known single schema type "${schema.type}" for attribute "${attributeName}".`);
                         return value; // Fallback
                }
            } else {
                // Assume multi-property schema (like camera) or an unknown/invalid schema structure.
                // Pass the whole schema object to a parser designed for multi-property strings.
                // console.log(`ComponentManager: Treating "${attributeName}" as multi-property schema.`);
                return Parsers.parseComponentString(value, schema);
            }
        } catch (e) {
            console.error(`ComponentManager: Error parsing attribute "${attributeName}" with value "${value}" using schema:`, schema, e);
            return schema.default !== undefined ? schema.default : null; // Return default on error?
        }
    },

    /**
     * =========================================================================
     * Handle Attribute Initialization (during connectedCallback)
     * =========================================================================
     * Called by BmlEntity when it connects and processes its initial attributes.
     * @param {BmlEntity} entityElement - The entity HTML element.
     * @param {string} attributeName - The attribute name.
     * @param {string} initialValue - The attribute's initial value string.
     */
    handleAttributeInitialization(entityElement, attributeName, initialValue) {
        const definition = registeredComponents[attributeName];
        if (!definition || !entityElement.babylonNode) return; // Not a component or node not ready

        const componentInstance = entityElement.getAttachedComponents()[attributeName];
         if (componentInstance) return; // Already initialized (shouldn't happen here normally)

        // console.log(`ComponentManager: Initializing component "${attributeName}" on`, entityElement);
        const parsedData = this.parseAttribute(attributeName, initialValue);

         // Create instance data structure (can be expanded)
         const instance = {
             name: attributeName,
             data: parsedData,
             schema: definition.schema,
             el: entityElement,      // Reference back to the element
             definition: definition, // Reference to the static definition
             _rawData: initialValue  // Store raw data if needed for diffing later
         };

        // Store instance reference on the entity
        entityElement._registerAttachedComponent(attributeName, instance);

        // Call component's init() method (if defined) - `this` inside init refers to entityElement
        try {
            definition.init?.call(entityElement, instance.data);
        } catch (e) {
             console.error(`Error in component "${attributeName}" init() method:`, e);
        }

        // Call component's update() method for the initial state (if defined)
        try {
            // Pass the PARSED DATA itself, and undefined for oldData on initial update
            definition.update?.call(entityElement, instance.data, undefined);
        } catch (e) {
             console.error(`Error in component "${attributeName}" initial update() method:`, e);
        }
    },


    /**
     * =========================================================================
     * Handle Attribute Updates (from attributeChangedCallback or MutationObserver)
     * =========================================================================
     * Called when an observed attribute changes value.
     * @param {BmlEntity} entityElement - The entity HTML element.
     * @param {string} attributeName - The attribute name that changed.
     * @param {string|null} newValue - The new attribute value string (or null if removed).
     * @param {string|null} oldValue - The previous attribute value string (or null if added).
     */
    handleAttributeUpdate(entityElement, attributeName, newValue, oldValue) {
        const definition = registeredComponents[attributeName];
         // Ignore if not a registered component or if node isn't ready
         // (attributeChangedCallback might fire before connectedCallback finishes sometimes)
        if (!definition || !entityElement.babylonNode || !entityElement._isReady) {
            // Special case: If 'id' attribute changes, update the Babylon node name
            if (attributeName === 'id' && entityElement.babylonNode) {
               entityElement.babylonNode.name = newValue || entityElement.tagName.toLowerCase(); // Use tag name as fallback if ID removed
            }
            return;
        }

        const componentInstance = entityElement.getAttachedComponents()[attributeName];

        if (newValue === null) {
            // Attribute was removed - detach the component
            if (componentInstance) {
                console.log(`ComponentManager: Attribute "${attributeName}" removed, detaching component.`);
                this.detachComponent(entityElement, attributeName, componentInstance);
            }
        } else {
            // Attribute was added or changed
            const parsedData = this.parseAttribute(attributeName, newValue);

            if (!componentInstance) {
                // Attribute added - attach and initialize the component
                console.log(`ComponentManager: Attribute "${attributeName}" added, initializing component.`);
                 // Create instance data structure
                const instance = {
                    name: attributeName, data: parsedData, schema: definition.schema,
                    el: entityElement, definition: definition, _rawData: newValue
                };
                 entityElement._registerAttachedComponent(attributeName, instance);
                 try {
                    definition.init?.call(entityElement, instance.data);
                 } catch (e) { console.error(`Error in component "${attributeName}" init():`, e); }
                 try {
                    // Pass the PARSED DATA, and undefined oldData for initial update after init
                    definition.update?.call(entityElement, instance.data, undefined);
                 } catch (e) { console.error(`Error in component "${attributeName}" update():`, e); }

            } else {
                // Attribute changed - update existing component
                const oldParsedData = componentInstance.data; // Get previously parsed data

                // Avoid update if parsed data hasn't actually changed (important for objects/vectors)
                // This requires a deep comparison function (Parsers.deepEqual)
                if (Parsers.deepEqual(parsedData, oldParsedData)) {
                   // console.log(`ComponentManager: Parsed data for "${attributeName}" unchanged, skipping update.`);
                   return;
                }

                // Update the stored data on the instance
                componentInstance.data = parsedData;
                componentInstance._rawData = newValue;

                // Call component's update() method (if defined)
                try {
                    // Pass the updated PARSED DATA and the old parsed data
                    definition.update?.call(entityElement, componentInstance.data, oldParsedData);
                } catch (e) {
                     console.error(`Error in component "${attributeName}" update() method:`, e);
                }
            }
        }
    },

    /**
     * =========================================================================
     * Detach a Component from an Entity
     * =========================================================================
     * Calls the component's remove() method and cleans up references.
     * @param {BmlEntity} entityElement - The entity element.
     * @param {string} componentName - The name of the component to detach.
     * @param {object} componentInstance - The instance object to remove.
     */
    detachComponent(entityElement, componentName, componentInstance) {
        if (!componentInstance) return; // Already detached or never attached

        const definition = componentInstance.definition;
        // Call component's remove() method (if defined)
        try {
            definition.remove?.call(entityElement, componentInstance.data);
        } catch (e) {
             console.error(`Error in component "${componentName}" remove() method:`, e);
        }

        // Remove the instance reference from the entity
        entityElement._unregisterAttachedComponent(componentName);
    },

    /**
     * =========================================================================
     * Remove All Components from an Entity (during disconnectedCallback)
     * =========================================================================
     * Iterates over all attached components and calls detachComponent.
     * @param {BmlEntity} entityElement - The entity element being removed.
     */
    removeAllComponents(entityElement) {
        const attachedComponents = entityElement.getAttachedComponents();
        // Iterate over a copy of keys, as detachComponent modifies the original object
        const componentNames = Object.keys(attachedComponents);
        console.log(`ComponentManager: Removing all components from ${entityElement.tagName.toLowerCase()}:`, componentNames);
        componentNames.forEach(name => {
            this.detachComponent(entityElement, name, attachedComponents[name]);
        });
    }
};

// Freeze the exported object to make it partially immutable (prevents accidental modification)
Object.freeze(ComponentManager);
