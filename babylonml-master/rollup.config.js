import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser'; // Import terser for minification

// Define the base configuration to reuse
const baseConfig = {
  input: 'src/index.js', // Your main entry point
  preserveEntrySignatures: false, // Try preventing facade chunks
  output: { // Base output configuration (will be spread and overridden)
    format: 'iife', // Immediately Invoked Function Expression (good for <script> tags)
    name: 'BML', // The global variable name to attach to window
    sourcemap: true, // Generate source maps for easier debugging
    inlineDynamicImports: true, // Bundle dynamic imports
    globals: {
      '@babylonjs/core': 'BABYLON' // Assumes Babylon.js is available globally as BABYLON if not bundled
    }
  },
  plugins: [ // Base plugins (will be spread)
    resolve(), // Helps Rollup find external modules
    commonjs() // Converts CommonJS modules to ES6
  ],
  external: [ // Base external dependencies
    // List external dependencies if you don't want to bundle them
    // For now, we'll try bundling Babylon.js. If the bundle gets too large,
    // we might list '@babylonjs/core' here and load it separately via CDN.
    // '@babylonjs/core'
  ]
};

// Export an array of configurations
export default [
  // Configuration for the unminified bundle
  {
    ...baseConfig,
    output: {
      ...baseConfig.output,
      file: 'dist/babylonml.js', // Unminified output file
    },
    plugins: [
      ...baseConfig.plugins
    ]
  },
  // Configuration for the minified bundle
  {
    ...baseConfig,
    output: {
      ...baseConfig.output,
      file: 'dist/babylonml.min.js', // Minified output file
      sourcemap: true // Keep sourcemap for minified version too (optional)
    },
    plugins: [
      ...baseConfig.plugins,
      terser() // Add terser plugin to minify the output
    ]
  }
];
