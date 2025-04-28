# Live Examples

This page provides links to live, hosted examples demonstrating various features of BabylonML. These examples are hosted separately and load the latest version of the BabylonML library.

*   **[Basic Scene](https://bayblonml-frontend.netlify.app/examples/basic_scene.html)**
    *   Demonstrates a simple scene with a box, ground, and default camera/light. Includes dynamic material update via JavaScript.

    ```html
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>BabylonML - Local Test</title>
      <style>
        /* Basic styling to make the scene visible */
        html, body {
          margin: 0;
          padding: 0;
          overflow: hidden; /* Prevent scrollbars */
          height: 100%;
          width: 100%;
        }
        bml-scene {
          width: 100vw; /* Viewport width */
          height: 100vh; /* Viewport height */
          display: block; /* Make it a block element */
        }
        canvas {
          display: block; /* Prevent potential small gap below canvas */
        }
      </style>
      <!-- Load the BabylonML library -->
      <script src="https://tinyurl.com/babylonml"></script> 
    </head>
    <body>
      <!-- The root element for the Babylon.js experience -->
      <bml-scene>
        <!--
            This scene relies on the default camera and light.
            - No <bml-entity camera="..."> is defined, so a default FreeCamera is created.
            - No <bml-entity light="..."> is defined, so a default HemisphericLight is created.
            You can navigate using mouse/touch controls provided by the default FreeCamera.
        -->
            <bml-entity
                id="my-box"
                geometry="type: box; size: 1"
                material="color: #4682B4"
                position="0 0.5 0"
                rotation="0 45 0">
            </bml-entity>
    
            <!-- A ground plane -->
            <bml-entity
                geometry="type: ground; width: 10; height: 10"
                material="color: #8FBC8F">
                <!-- Position defaults to 0 0 0 -->
            </bml-entity>
      </bml-scene>
    
      <script>
        // Optional: You can add JavaScript here to interact with the scene
        // after it's potentially ready.
        const sceneEl = document.querySelector('bml-scene');
    
           // Check if the scene is already ready when the script runs
            if (sceneEl && sceneEl.isReady) {
                console.log("DEBUG: Scene was already ready. Running setup directly.");
                babylonScene = sceneEl.babylonScene; // Get scene reference directly
                console.log("DEBUG: babylonScene reference obtained. ", babylonScene);
    
                // lets change the color of the box to blue
                const box = document.getElementById('my-box');
                if (box) {
                    console.log('Attempting to change box color via attribute...');
                    box.setAttribute('material', 'color: #0000FF'); // Change color to blue
                }
             
    
            } else if (sceneEl) {
                console.log("DEBUG: Scene not ready yet. Adding event listener.");
                sceneEl.addEventListener('bml-scene-ready', (event) => {
                     console.log("DEBUG: bml-scene-ready event fired!"); // <-- Log event firing
                     babylonScene = event.detail.scene;
                     consoler.log("DEBUG: babylonScene reference obtained. ", babylonScene);
                       // Example: Simple interaction after a delay
                    setTimeout(() => {
                        const box = document.getElementById('my-box');
                        if (box) {
                            console.log('Attempting to change box color via attribute...');
                            box.setAttribute('material', 'color: #0000FF'); // Change color to blue
                        }
                    }, 5000); // After 5 seconds
                });
            }
    
    
    
        // Example: Accessing BML global API (if implemented)
        if (window.BML) {
          console.log('BML Global API found:', BML);
          // Example: How a user might register their own component
          // BML.registerComponent('my-custom-spin', { ... });
        }
    
    
      </script>
    
    </body>
    </html>
    ```

*   **[Explicit Camera & Light Placeholder](https://bayblonml-frontend.netlify.app/examples/explicit_camera_light_placeholder.html)**
    *   Shows how defining an explicit camera overrides the default, and how the (currently non-functional) `light` attribute placeholder prevents the default light.

    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>BabylonML Example: Explicit Camera & Light Placeholder</title>
        <style>
            html, body {
                margin: 0;
                padding: 0;
                overflow: hidden; /* Prevent scrollbars */
                height: 100%;
                width: 100%;
            }
            bml-scene {
                width: 100vw; /* Viewport width */
                height: 100vh; /* Viewport height */
                display: block; /* Ensure it behaves like a block element */
            }
            canvas {
                display: block;
            }
        </style>
        <!-- Import the bundled BabylonML library -->
        <script src="https://tinyurl.com/babylonml"></script>
    </head>
    <body>
        <!--
            This scene demonstrates:
            1. Defining an explicit camera: The <bml-entity camera="..."> below creates an ArcRotateCamera.
               This PREVENTS the default FreeCamera from being created.
            2. Using a placeholder light attribute: The <bml-entity light="..."> below PREVENTS the
               default HemisphericLight from being created. However, since there is no 'light'
               component implemented yet, this attribute currently DOES NOT create a PointLight.
               The scene will appear dark unless a light is added via JavaScript.
        -->
        <bml-scene>
            <!-- Explicit ArcRotateCamera Definition -->
            <bml-entity
                id="myCamera"
                camera="type: arcRotate; alpha: -1.57; beta: 1.4; radius: 8; target: 0 1 0; attachControl: true">
                <!-- No geometry or material needed for a camera entity -->
            </bml-entity>
    
            <!-- Placeholder for a light source -->
            <!-- IMPORTANT: This disables the default light, but doesn't create a PointLight yet! -->
            <bml-entity
                id="myLightSource"
                light="type: point; intensity: 0.8; position: 0 5 0">
                <!-- This entity currently does nothing visually -->
            </bml-entity>
    
            <!-- A simple box entity -->
            <bml-entity
                geometry="type: box; size: 1"
                material="color: #FF6347" <!-- Tomato color -->
                position="0 1 0">
            </bml-entity>
    
            <!-- A ground plane -->
            <bml-entity
                geometry="type: ground; width: 10; height: 10"
                material="color: #B0C4DE"> <!-- LightSteelBlue color -->
            </bml-entity>
        </bml-scene>
    
        <script>
            // Optional: Add a light programmatically since the component doesn't exist yet
            document.querySelector('bml-scene').addEventListener('bml-scene-ready', (event) => {
                const babylonScene = event.detail.scene;
                // Uncomment the lines below to add a light via JavaScript
                // console.log("Adding programmatic light...");
                // const pointLight = new BABYLON.PointLight("programmaticLight", new BABYLON.Vector3(0, 5, 0), babylonScene);
                // pointLight.intensity = 0.8;
                // console.log("Programmatic light added.");
            });
        </script>
    </body>
    </html>
    ```

*   **[Multiple Cameras](https://bayblonml-frontend.netlify.app/examples/multi_camera_scene.html)**
    *   Illustrates defining multiple cameras and switching between them using JavaScript.

    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>BabylonML Example: Multiple Cameras</title>
        <style>
            html, body {
                margin: 0;
                padding: 0;
                overflow: hidden; /* Prevent scrollbars */
                height: 100%;
                width: 100%;
            }
            bml-scene {
                width: 100vw; /* Viewport width */
                height: 100vh; /* Viewport height */
                display: block; /* Ensure it behaves like a block element */
            }
            canvas {
                display: block;
            }
            /* Style for the button */
            #switchCameraButton {
                position: absolute;
                top: 10px;
                left: 10px;
                padding: 10px 15px;
                font-size: 16px;
                cursor: pointer;
                z-index: 10; /* Ensure it's above the canvas */
            }
        </style>
        <!-- Import the bundled BabylonML library -->
        <script src="https://tinyurl.com/babylonml"></script>
    </head>
    <body>
        <!-- Button to switch cameras -->
        <button id="switchCameraButton">Switch to Camera 2</button>
    
        <!--
            This scene demonstrates defining multiple cameras.
            - The first camera entity encountered ("camera1", ArcRotate) will become the active camera by default.
            - The second camera ("camera2", Universal) will be created but inactive initially.
            - Click the button in the top-left corner to switch between them.
            - Since at least one camera is defined, the default FreeCamera is NOT created.
            - Since no light attribute is defined, the default HemisphericLight IS created.
        -->
        <bml-scene>
            <!-- First Camera (ArcRotate, active initially) -->
            <bml-entity
                id="camera1"
                camera="type: arcRotate; alpha: -1.57; beta: 1.4; radius: 8; target: 0 1 0; attachControl: true">
                <!-- attachControl: true -->
            </bml-entity>
    
            <!-- Second Camera (Universal, inactive initially) -->
            <bml-entity
                id="camera2"
                camera="type: universal; position: 5 2 5; target: 0 1 0; attachControl: false">
                <!-- attachControl: false -->
            </bml-entity>
    
            <!-- A simple box entity -->
            <bml-entity
                geometry="type: box; size: 1"
                material="color: #6A5ACD" <!-- SlateBlue color -->
                position="0 1 0">
            </bml-entity>
    
            <!-- A ground plane -->
            <bml-entity
                geometry="type: ground; width: 10; height: 10"
                material="color: #98FB98"> <!-- PaleGreen color -->
            </bml-entity>
        </bml-scene>
    
        <script>
            const sceneEl = document.querySelector('bml-scene');
            const switchButton = document.getElementById('switchCameraButton');
    
            let babylonScene = null;
            let canvas = null;
            let cam1 = null; // ArcRotate
            let cam2 = null; // Universal
            let cam1Attach = true; // Default based on attribute
            let cam2Attach = false; // Default based on attribute
    
            // Function to set up cameras and button once scene is ready
            function setupCameraSwitcher() {
                console.log("DEBUG: setupCameraSwitcher called.");
                if (!sceneEl.isReady || !babylonScene) {
                     console.log("DEBUG: Scene not ready yet in setupCameraSwitcher.");
                     return; // Should not happen if called correctly, but good check
                }
                canvas = sceneEl.babylonCanvas; // Get canvas reference from scene element
    
                // Add a small delay to ensure camera components have initialized AFTER scene is ready
                 setTimeout(() => {
                    console.log("DEBUG: setTimeout callback running..."); // <-- Log timeout callback
                    console.log("DEBUG: Available cameras:", babylonScene.cameras.map(c => c.name)); // <-- Log available camera names
    
                     // Get camera instances using their auto-generated names (check inspector if needed)
                     cam1 = babylonScene.getCameraByName('camera1_arcRotateCamera');
                     cam2 = babylonScene.getCameraByName('camera2_universalCamera');
    
                     // Get camera entities to check original attachControl attribute
                     const camEntity1 = document.getElementById('camera1');
                     const camEntity2 = document.getElementById('camera2');
    
                     // Store original attachControl settings (simple check)
                     cam1Attach = (camEntity1?.getAttribute('camera') || '').includes('attachControl: true');
                     cam2Attach = (camEntity2?.getAttribute('camera') || '').includes('attachControl: true'); // Note: cam2 is false in HTML
    
                     if (cam1 && cam2) {
                         console.log("DEBUG: Cameras found by name:", cam1.name, cam2.name); // <-- Log success
                         console.log("Initial active camera:", babylonScene.activeCamera.name);
                         console.log("Camera 1 attachControl setting:", cam1Attach);
                         console.log("Camera 2 attachControl setting:", cam2Attach);
                         switchButton.disabled = false; // Enable the button
                         // Set initial button text based on which camera is NOT active
                         switchButton.textContent = (babylonScene.activeCamera === cam1) ? "Switch to Camera 2 (Universal)" : "Switch to Camera 1 (ArcRotate)";
                     } else {
                         console.error("DEBUG: Could not find one or both cameras by name after delay. Check IDs and camera types in HTML and Inspector."); // <-- Log failure
                         switchButton.textContent = "Error finding cameras";
                         switchButton.disabled = true;
                     }
                 }, 100); // 100ms delay - adjust if needed
            }
    
            // Check if the scene is already ready when the script runs
            if (sceneEl && sceneEl.isReady) {
                console.log("DEBUG: Scene was already ready. Running setup directly.");
                babylonScene = sceneEl.babylonScene; // Get scene reference directly
                setupCameraSwitcher();
            } else if (sceneEl) {
                console.log("DEBUG: Scene not ready yet. Adding event listener.");
                sceneEl.addEventListener('bml-scene-ready', (event) => {
                     console.log("DEBUG: bml-scene-ready event fired!"); // <-- Log event firing
                     babylonScene = event.detail.scene;
                     setupCameraSwitcher();
                });
            } else {
                console.error("DEBUG: Could not find bml-scene element!");
                switchButton.textContent = "Scene Error";
                switchButton.disabled = true;
            }
    
            switchButton.addEventListener('click', () => {
                if (!babylonScene || !cam1 || !cam2 || !canvas) {
                    console.error("Scene or cameras not ready for switching.");
                    return;
                }
    
                const currentCam = babylonScene.activeCamera;
                const targetCam = (currentCam === cam1) ? cam2 : cam1;
                const targetAttach = (targetCam === cam1) ? cam1Attach : cam2Attach;
    
                console.log(`Switching from ${currentCam.name} to ${targetCam.name}`);
    
                // Detach controls from the current camera *if* it has the method
                if (currentCam && typeof currentCam.detachControl === 'function') {
                    console.log(`Detaching controls from ${currentCam.name}`);
                    currentCam.detachControl(canvas);
                }
    
                // Set the new active camera
                babylonScene.activeCamera = targetCam;
    
                // Attach controls to the new camera *if* it has the method
                if (targetCam && typeof targetCam.attachControl === 'function') {
                    console.log(`Attaching controls to ${targetCam.name}`);
                    targetCam.attachControl(canvas, true); // Always attach to the new active camera
                } else {
                     console.log(`Controls not attached to ${targetCam.name} (method missing)`);
                }
    
                // Update button text
                switchButton.textContent = (targetCam === cam1) ? "Switch to Camera 2 (Universal)" : "Switch to Camera 1 (ArcRotate)";
            });
    
            // Disable button initially until cameras are confirmed
            switchButton.disabled = true;
    
        </script>
    </body>
    </html>
    ```

*   **[Mesh Loading (GLB)](https://bayblonml-frontend.netlify.app/examples/mesh_example.html)**
    *   Shows how to load an external `.glb` model using the `geometry` component.

    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>BabylonML - Mesh Example</title>
        <style>
            html, body { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }
            bml-scene { width: 100%; height: 100%; display: block; }
        </style>
        <!-- Load BabylonML library -->
        <script src="https://tinyurl.com/babylonml"></script> 
    </head>
    <body>
        <bml-scene>
            <!-- Basic lighting and camera -->
            <bml-entity light="type: hemispheric; intensity: 0.7"></bml-entity>
            <bml-entity light="type: directional; direction: 1 -1 1; intensity: 0.7"></bml-entity>
            <bml-entity camera="type: arcRotate; target: 0 1 0; alpha: -1.57; beta: 1.2; radius: 5"></bml-entity>
    
            <!-- Load the GLB mesh -->
            <!-- Using a model from Firebase Storage -->
            <bml-entity
                geometry="type: mesh; src: https://firebasestorage.googleapis.com/v0/b/story-splat.firebasestorage.app/o/users%2FmFNJrfet99Qv9mMX2OC6hewy1xC2%2Fsplats%2FGreek_Statue_London_textured_mesh_lowpoly_glb.glb?alt=media&token=d79e2c56-420b-4e1f-81d8-0a7f3cdcf43c"
                position="0 0 0"
                rotation="0 0 0"
                scale="1 1 1">
            </bml-entity>
    
        </bml-scene>
    </body>
    </html>
    ```

*   **[Photo Dome](https://bayblonml-frontend.netlify.app/examples/photodome_example.html)**
    *   Demonstrates creating a 360-degree photo environment using the `geometry` component.

    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>BabylonML - Photo Dome Example</title>
        <style>
            html, body { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }
            bml-scene { width: 100%; height: 100%; display: block; }
        </style>
    
        <!-- Load BabylonML library -->
        <script src="https://tinyurl.com/babylonml"></script> 
    </head>
    <body>
        <bml-scene>
            <!-- Camera - ArcRotate might feel constrained inside a dome, but allows looking around -->
            <!-- Setting radius small to be 'inside' the dome -->
            <bml-entity camera="type: arcRotate; target: 0 0 0; alpha: 1.57; beta: 1.57; radius: 0.1"></bml-entity>
    
            <!-- Photo Dome -->
            <!-- Using a publicly available 360 image from BabylonJS examples -->
            <bml-entity
                geometry="type: photodome; src: https://playground.babylonjs.com/textures/360photo.jpg; size: 1000">
                <!-- The size should be large enough to encompass the camera -->
            </bml-entity>
    
            <!-- Optional: Add a small object inside the dome to verify perspective -->
            <bml-entity geometry="type: box; size: 0.5" position="0 -1 2" material="color: red"></bml-entity>
    
        </bml-scene>
    </body>
    </html>
    ```

*   **[Video Dome](https://bayblonml-frontend.netlify.app/examples/videodome_example.html)**
    *   Demonstrates creating a 360-degree video environment using the `geometry` component, including custom zoom interaction.

    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>BabylonML - Video Dome Example</title>
        <style>
            html, body { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }
            bml-scene { width: 100%; height: 100%; display: block; }
        </style>
    
        <!-- Load BabylonML library -->
        <script src="https://tinyurl.com/babylonml"></script> 
    </head>
    <body>
        <bml-scene>
            <!-- Camera -->
            <bml-entity camera="type: arcRotate; target: 0 0 0; alpha: 1.57; beta: 1.57; radius: 0.1"></bml-entity>
    
            <!-- Video Dome -->
            <!-- Using a publicly available 360 video -->
            <!-- Note: Autoplay might be blocked by browser policy if not muted or interacted with -->
            <bml-entity
                id="video-dome-entity"
                geometry="type: videodome; src: https://assets.babylonjs.com/photoDomes/solarProbeMission.mp4; size: 1000; autoPlay: true; loop: true; muted: true; clickToPlay: true">
                <!-- clickToPlay: true allows user interaction to start/pause -->
            </bml-entity>
    
            <!-- Optional: Add a small object inside the dome -->
            <bml-entity geometry="type: sphere; diameter: 0.5" position="0 0 0" material="color: blue"></bml-entity>
    
        </bml-scene>
    
        <script>
            const sceneEl = document.querySelector('bml-scene');
            let babylonScene = null;
            let canvas = null;
            let camera = null;
            // We only need the VideoDome instance, not necessarily its mesh for fovMultiplier
            let videoDomeInstance = null;
    
            // Function to initialize the custom zoom logic
            function initializeVideoDomeZoom() {
                console.log("DEBUG: initializeVideoDomeZoom called.");
                if (!sceneEl.isReady || !babylonScene) {
                    console.log("DEBUG: Scene not ready yet in initializeVideoDomeZoom.");
                    return;
                }
                canvas = sceneEl.babylonCanvas;
                camera = babylonScene.activeCamera; // Get active camera
                const videoDomeEntity = document.getElementById('video-dome-entity');
    
                if (!videoDomeEntity) {
                    console.error("DEBUG: Could not find video dome entity element by ID 'video-dome-entity'.");
                    return;
                }
                    // --- Custom Zoom Logic Variables ---
                var zoomLevel = 1;
                // Function to set up the zoom logic *after* the VideoDome instance is confirmed
                const setupZoomLogic = (domeInstance) => {
                    console.log("DEBUG: setupZoomLogic called with dome instance:", domeInstance);
                    if (!camera || !canvas || !domeInstance) {
                        console.error(`DEBUG: Cannot setup zoom logic. Missing camera, canvas, or domeInstance.`);
                        return;
                    }
    
                    // --- Detach Camera Controls ---
                    if (camera.inputs && camera.inputs.attached.mousewheel) {
                        console.log("DEBUG: Detaching default mousewheel control.");
                        camera.inputs.attached.mousewheel.detachControl(canvas);
                    } else {
                        console.warn("Could not detach mousewheel control.");
                    }
    
                    // --- Register Render Loop Logic ---
                    // This function will run every frame AFTER setupZoomLogic is called
                    babylonScene.registerAfterRender(function() {
                        // Ensure domeInstance is still valid and has the property
                        if (!domeInstance || domeInstance.fovMultiplier === undefined) {
                            // It might take a frame or two for fovMultiplier to be ready after instance creation
                            // console.warn("Waiting for domeInstance or fovMultiplier...");
                            return;
                        }
                        domeInstance.fovMultiplier = zoomLevel;
                        domeInstance.material.alpha = 1 - (zoomLevel - 1) * 0.9; // Adjust alpha based on zoom level
                        
                    });
    
                    // --- Register Pointer Observable Logic ---
                    // This function will run on mouse wheel events AFTER setupZoomLogic is called
                    babylonScene.onPointerObservable.add(function(e) {
                        if (!domeInstance) { return; } // Ensure instance exists
    
                        const wheelDelta = e.event.wheelDelta || -e.event.deltaY;
                        if (wheelDelta === 0) return;
    
                        zoomLevel += wheelDelta * -0.0005;
                        if (zoomLevel < 0.1) { zoomLevel = 0.1; }
                        if (zoomLevel > 2) { zoomLevel = 2; }
                    }, 8);
    
                    console.log("Custom video dome zoom script event listeners registered successfully.");
                }; // End of setupZoomLogic function
    
                // --- Wait for Geometry Readiness ---
                // Check if the geometry object is already available when initializeVideoDomeZoom runs
                if (videoDomeEntity.BabylonGeometryObject) {
                    console.log("DEBUG: Video dome geometry object was already available.");
                    // Assign the instance and call setup immediately
                    videoDomeInstance = videoDomeEntity.BabylonGeometryObject;
                    setupZoomLogic(videoDomeInstance);
                } else {
                    // If not ready, wait for the component to dispatch the event
                    console.log("DEBUG: Waiting for 'bml-geometry-ready' event on video dome entity...");
                    videoDomeEntity.addEventListener('bml-geometry-ready', (event) => {
                        console.log("DEBUG: 'bml-geometry-ready' event received for video dome.");
                        // Assign the instance from the event and call setup
                        videoDomeInstance = event.detail.geometryObject;
                        setupZoomLogic(videoDomeInstance);
                    }, { once: true }); // Listen only once
                }
            } // End of initializeVideoDomeZoom function
    
             // Check if the scene is already ready when the script runs
            if (sceneEl && sceneEl.isReady) {
                console.log("DEBUG: Scene was already ready. Running setup directly.");
                babylonScene = sceneEl.babylonScene; // Get scene reference directly
                initializeVideoDomeZoom();
            } else if (sceneEl) {
                console.log("DEBUG: Scene not ready yet. Adding event listener for bml-scene-ready.");
                sceneEl.addEventListener('bml-scene-ready', (event) => {
                     console.log("DEBUG: bml-scene-ready event fired!");
                     babylonScene = event.detail.scene; // Get scene from event detail
                     initializeVideoDomeZoom();
                });
            } else {
                console.error("DEBUG: Could not find bml-scene element!");
            }
        </script>
    </body>
    </html>
    ```

*   **[VR Scene](https://bayblonml-frontend.netlify.app/examples/vr_scene.html)**
    *   Shows how to enable a basic VR experience using the `xr="vr"` attribute on `<bml-scene>`.

    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BabylonML - VR Example</title>
        <style>
            html, body {
                margin: 0;
                padding: 0;
                overflow: hidden; /* Prevent scrollbars */
                height: 100%;
                width: 100%;
            }
    
            bml-scene {
                width: 100vw; /* Viewport width */
                height: 100vh; /* Viewport height */
                display: block; /* Ensure it behaves like a block element */
            }
    
            canvas {
                display: block;
            }
        </style>
        <!-- Import the bundled BabylonML library -->
        <script src="https://tinyurl.com/babylonml"></script>
    </head>
    <body>
        <!-- Enable VR mode using the xr attribute -->
        <bml-scene xr="vr">
    
            <!-- Define a camera (optional, WebXR helper might provide one, but good practice) -->
            <!-- Using ArcRotateCamera for easy navigation outside VR -->
            <bml-entity camera="type: arcRotate; target: 0 1 0; radius: 5; alpha: -1.57; beta: 1.2"></bml-entity>
    
            <!-- Add a ground plane -->
            <bml-entity geometry="type: ground; width: 10; height: 10"
                          material="color: #444444; roughness: 0.8"></bml-entity>
    
            <!-- Add a simple box -->
            <bml-entity geometry="type: box; size: 1"
                          position="0 1 0"
                          rotation="0 45 0"
                          material="color: tomato"></bml-entity>
    
            <!-- Add a sphere -->
            <bml-entity geometry="type: sphere; diameter: 0.8"
                          position="-2 1 1"
                          material="color: cornflowerblue"></bml-entity>
    
        </bml-scene>
    
        <script>
            // Optional: Listen for scene ready event
            const sceneEl = document.querySelector('bml-scene');
            sceneEl.addEventListener('bml-scene-ready', (event) => {
                console.log('VR Scene is ready!', event.detail);
                // You could potentially access the XR helper here if needed,
                // though it's managed internally by BmlScene for now.
                // const xrHelper = sceneEl.#xrHelper; // Note: #xrHelper is private
            });
        </script>
    </body>
    </html>
    ```

*   **[AR Scene](https://bayblonml-frontend.netlify.app/examples/ar_scene.html)**
    *   Shows how to enable a basic AR experience using the `xr="ar"` attribute on `<bml-scene>` (requires compatible device/browser).

    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <title>BabylonML - AR Example</title>
        <style>
            html, body {
                margin: 0;
                padding: 0;
                overflow: hidden; /* Prevent scrollbars */
                height: 100%;
                width: 100%;
            }
    
            bml-scene {
                width: 100vw; /* Viewport width */
                height: 100vh; /* Viewport height */
                display: block; /* Ensure it behaves like a block element */
            }
    
            canvas {
                display: block;
            }
        </style>
        <!-- Import the bundled BabylonML library -->
        <script src="https://tinyurl.com/babylonml"></script>
    </head>
    <body>
        <!-- Enable AR mode using the xr attribute -->
        <!-- Note: AR requires compatible device/browser and often HTTPS -->
        <bml-scene xr="ar">
    
            <!-- No explicit camera needed for basic AR, WebXR helper manages it -->
            <!-- No explicit light needed for basic AR, WebXR helper often adds estimation -->
    
            <!-- Add a simple box placed slightly in front -->
            <bml-entity geometry="type: box; size: 0.2"
                          position="0 0 0.5" <!-- Adjust position based on AR reference space -->
                          material="color: mediumseagreen"></bml-entity>
    
            <!-- Add a sphere slightly to the side -->
            <bml-entity geometry="type: sphere; diameter: 0.15"
                          position="-0.3 0 0.4"
                          material="color: gold"></bml-entity>
    
            <!-- AR scenes often don't have a ground plane, as the real world provides the ground -->
    
        </bml-scene>
    
        <script>
            // Optional: Listen for scene ready event
            const sceneEl = document.querySelector('bml-scene');
            sceneEl.addEventListener('bml-scene-ready', (event) => {
                console.log('AR Scene is ready!', event.detail);
                // You might want to interact with AR features like hit-testing here
                // if the WebXR helper exposes them or if you add specific AR components later.
            });
        </script>
    </body>
    </html>
    ```
