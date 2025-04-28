// src/core/parsers.js
import { Vector3, Color3 } from '@babylonjs/core';

/**
 * Parses a string like "x y z" into a {x, y, z} object.
 * @param {string} str - The input string.
 * @param {object} [defaultValue={x:0, y:0, z:0}] - Default value if parsing fails.
 * @returns {object} Parsed vector object.
 */
export function parseVec3(str, defaultValue = { x: 0, y: 0, z: 0 }) {
    if (typeof str !== 'string') return defaultValue;
    const parts = str.trim().split(/\s+/).map(Number);
    if (parts.length === 3 && parts.every(n => !isNaN(n))) {
        return { x: parts[0], y: parts[1], z: parts[2] };
    }
    // Handle single number shorthand (e.g., "5" -> {x: 5, y: 5, z: 5})
    if (parts.length === 1 && !isNaN(parts[0])) {
        return { x: parts[0], y: parts[0], z: parts[0] };
    }
    return defaultValue;
}

/**
 * Converts a {x, y, z} object to a Babylon.js Vector3.
 * @param {object} obj - The input object {x, y, z}.
 * @returns {Vector3} Babylon.js Vector3 instance.
 */
export function vec3ToObject(obj) {
    if (obj && typeof obj.x === 'number' && typeof obj.y === 'number' && typeof obj.z === 'number') {
        return new Vector3(obj.x, obj.y, obj.z);
    }
    // Return a default Vector3 if input is invalid
    console.warn("Invalid input for vec3ToObject, returning default Vector3(0, 0, 0). Input:", obj);
    return new Vector3(0, 0, 0);
}


/**
 * Parses a color string (e.g., "#RRGGBB", "rgb(r,g,b)", "colorname") into a {r, g, b} object (0-1 range).
 * @param {string} str - The input color string.
 * @param {object} [defaultValue={r:1, g:1, b:1}] - Default value (white).
 * @returns {object} Parsed color object {r, g, b}.
 */
export function parseColor(str, defaultValue = { r: 1, g: 1, b: 1 }) {
     if (typeof str !== 'string') return defaultValue;
     try {
         // Use Babylon's Color3.FromString to handle various formats
         const color = Color3.FromString(str.trim());
         return { r: color.r, g: color.g, b: color.b };
     } catch (e) {
         console.warn(`Could not parse color string "${str}". Using default.`, e);
         // Convert default object back to Color3 if needed, or just return the default object
         if (defaultValue instanceof Color3) {
             return { r: defaultValue.r, g: defaultValue.g, b: defaultValue.b };
         }
         return defaultValue;
     }
}

/**
 * Parses a string into a number.
 * @param {string} str - The input string.
 * @param {number} [defaultValue=0] - Default value.
 * @returns {number} Parsed number.
 */
export function parseNumber(str, defaultValue = 0) {
    if (str === null || str === undefined) return defaultValue;
    const num = parseFloat(str);
    return isNaN(num) ? defaultValue : num;
}

/**
 * Parses a string value. Returns default if input is not a string or is empty.
 * @param {string} str - Input string.
 * @param {string} [defaultValue=''] - Default value.
 * @returns {string} Parsed string.
 */
export function parseString(str, defaultValue = '') {
    return (typeof str === 'string' && str.length > 0) ? str : defaultValue;
}

/**
 * Parses a string into a boolean. Handles "true", "false", empty string (true), presence of attribute (true).
 * @param {string|null} str - Input string.
 * @param {boolean} [defaultValue=false] - Default value.
 * @returns {boolean} Parsed boolean.
 */
export function parseBoolean(value, defaultValue = false) {
    // Handle cases where the value might already be a boolean
    if (typeof value === 'boolean') {
        return value;
    }
    // Handle string inputs
    if (value === null || value === undefined) return defaultValue; // Attribute not present or value is null/undefined
    if (typeof value === 'string') {
        const strLower = value.toLowerCase();
        if (value === '' || strLower === 'true') return true; // Empty string attribute usually means true
        if (strLower === 'false') return false;
    }
    // Fallback for other types or unparseable strings
    return defaultValue;
}

/**
 * Parses a CSS-like string "prop1: value1; prop2: value2;" into an object.
 * Handles potential URLs within values.
 * @param {string} str - The input string.
 * @param {object} [defaultValue={}] - Default value.
 * @returns {object} Parsed object.
 */
export function parseObjectString(str, defaultValue = {}) {
    if (typeof str !== 'string' || !str.trim()) {
        return defaultValue;
    }
    const result = {};
    // Regex to split by semicolon, but not those inside parentheses (like in url())
    const declarations = str.split(/;\s*(?![^()]*\))/g);

    declarations.forEach(decl => {
        if (!decl.trim()) return;
        const colonIndex = decl.indexOf(':');
        if (colonIndex > 0) {
            const key = decl.substring(0, colonIndex).trim();
            const value = decl.substring(colonIndex + 1).trim();
            if (key) {
                // Basic type inference (optional, could make parsing more complex)
                // if (!isNaN(value)) {
                //     result[key] = parseFloat(value);
                // } else if (value.toLowerCase() === 'true') {
                //     result[key] = true;
                // } else if (value.toLowerCase() === 'false') {
                //     result[key] = false;
                // } else {
                //     result[key] = value;
                // }
                 result[key] = value; // Keep as string by default, let component schema handle specific parsing
            }
        }
    });
    // If the original string didn't parse into any key-value pairs but wasn't empty,
    // maybe treat it as a single default property? Depends on convention.
    // Example: material="color: red" vs material="red"
    // if (Object.keys(result).length === 0 && str.trim()) {
    //    // Handle single value case if needed, e.g., assign to a default key like 'value' or 'type'
    // }
    return Object.keys(result).length > 0 ? result : defaultValue;
}


/**
 * Parses a component string based on a schema object (like A-Frame).
 * Handles "prop: val; prop2: val2" syntax, using schema types for parsing.
 * @param {string} value - The raw attribute string.
 * @param {object} schema - The component's schema definition.
 * @returns {object} Parsed data object.
 */
export function parseComponentString(value, schema) {
    const parsedData = {};
    const props = parseObjectString(value, {}); // First parse into key-value strings

    // Apply defaults first
    for (const key in schema) {
        if (schema[key].default !== undefined) {
            parsedData[key] = schema[key].default;
        }
    }

    // Override with parsed values
    for (const key in props) {
        if (schema[key]) {
            const propSchema = schema[key];
            const rawValue = props[key];
            // Use specific parsers based on schema type
            switch (propSchema.type) {
                case 'vec3':
                    parsedData[key] = parseVec3(rawValue, propSchema.default);
                    break;
                case 'color':
                    parsedData[key] = parseColor(rawValue, propSchema.default);
                    break;
                case 'number':
                    parsedData[key] = parseNumber(rawValue, propSchema.default);
                    break;
                case 'string':
                    parsedData[key] = parseString(rawValue, propSchema.default);
                    break;
                case 'boolean':
                    parsedData[key] = parseBoolean(rawValue, propSchema.default);
                    break;
                // Add other types: 'asset', 'selector', 'array', 'map' (nested?)
                default:
                    // If no specific type, treat as string or use a generic parser
                    parsedData[key] = rawValue;
                    console.warn(`parseComponentString: Unknown schema type "${propSchema.type}" for key "${key}". Treating as string.`);
            }
        } else {
            // Property exists in string but not in schema - store it anyway? Or ignore?
            // parsedData[key] = props[key]; // Option: Store unknown properties
             console.warn(`parseComponentString: Property "${key}" found in attribute string but not defined in schema.`);
        }
    }
    return parsedData;
}


/**
 * Performs a deep comparison between two values.
 * Handles objects, arrays, primitives.
 * @param {*} a - First value.
 * @param {*} b - Second value.
 * @returns {boolean} True if values are deeply equal.
 */
export function deepEqual(a, b) {
    if (a === b) return true;

    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }

    if (a instanceof RegExp && b instanceof RegExp) {
        return a.toString() === b.toString();
    }

    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
        return false;
    }

    // Special handling for Babylon objects if needed (e.g., Vector3, Color3)
    // This assumes they have an .equals() method
    if (typeof a.equals === 'function' && typeof b.equals === 'function' && a.constructor === b.constructor) {
         return a.equals(b);
    }
     // Simple object comparison for parsed data like {x,y,z} or {r,g,b}
     if (a.constructor === Object && b.constructor === Object) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        for (const key of keysA) {
            if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
                return false;
            }
        }
        return true;
     }


    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
    }

    // Add more complex object/array comparison if necessary

    return false;
}
