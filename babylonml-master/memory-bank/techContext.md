# Technical Context: BabylonML

## Core Technologies

-   **JavaScript (ES6+):** The primary language for the framework's core logic and components.
-   **Babylon.js:** The underlying 3D rendering engine. BabylonML acts as a declarative layer on top of it.
-   **HTML5:** Used for the declarative scene definition via custom elements.
-   **CSS:** Can be used for styling related UI elements or potentially influencing certain visual aspects if integrated.

## Development Setup

-   **Package Manager:** npm (indicated by `package.json` and `package-lock.json`).
-   **Module Bundler:** Rollup (indicated by `rollup.config.js`). Used to bundle the source files (`src/`) into a distributable format (likely UMD or ES module).
-   **Dependencies:**
    -   `babylonjs`: The core dependency. Version should be checked in `package.json`.
    -   Development dependencies likely include Rollup plugins (`@rollup/plugin-node-resolve`, `@rollup/plugin-commonjs`, etc.) and potentially a local development server.
-   **Source Code Structure:**
    -   `src/core`: Core framework classes (Scene, Entity, ComponentManager).
    -   `src/components`: Individual component implementations.
    -   `src/primitives`: Definitions for primitive elements (e.g., `<bml-box>`).
    -   `src/index.js`: Entry point, likely handling DOM observation and initialization.
    -   `src/core/parsers.js`: Attribute parsing utilities.
-   **Documentation:** MkDocs (indicated by `mkdocs.yml` and `docs/` directory).

## Technical Constraints & Considerations

-   **Browser Compatibility:** Dependent on Babylon.js compatibility and the use of modern JavaScript features (ES6+). Polyfills might be needed for older browsers.
-   **Performance:** Parsing HTML and managing components adds overhead compared to direct Babylon.js usage. Performance optimization might be necessary for complex scenes. The efficiency of DOM observation and component updates is crucial.
-   **Asynchronous Operations:** Loading external assets (textures, models) is asynchronous and needs careful handling within the component lifecycle.
-   **Build Process:** The Rollup configuration defines how the library is built and what formats are outputted.

## Tool Usage Patterns

-   `npm install`: To install dependencies.
-   `npm run build`: (Likely defined in `package.json` scripts) To bundle the library using Rollup.
-   `npm run dev` or `npm start`: (Likely defined) To run a local development server for testing examples.
-   `mkdocs serve`: (Likely defined) To serve the documentation locally.
