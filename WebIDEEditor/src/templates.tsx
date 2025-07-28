import { FileType, Framework, Project } from './types';

// Basic HTML template
const basicTemplate: Project = {
  name: 'Basic HTML Project',
  framework: Framework.HTML,
  files: [
    {
      id: 'index.html',
      name: 'index.html',
      type: FileType.HTML,
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>Welcome to WebXR IDE</h1>
    <p>Edit this HTML file to get started with your project.</p>
    <div class="card">
      <h2>Features</h2>
      <ul>
        <li>Live preview as you type</li>
        <li>Support for HTML, CSS, and JavaScript</li>
        <li>Built-in WebXR frameworks</li>
      </ul>
    </div>
    <button id="demo-button">Click me!</button>
  </div>
  <script src="script.js"></script>
</body>
</html>`
    },
    {
      id: 'style.css',
      name: 'style.css',
      type: FileType.CSS,
      content: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

h1 {
  color: #2563eb;
  margin-top: 0;
}

.card {
  background-color: #f9fafb;
  border-left: 4px solid #3b82f6;
  padding: 1rem;
  margin: 1.5rem 0;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-3px);
}

button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #2563eb;
}`
    },
    {
      id: 'script.js',
      name: 'script.js',
      type: FileType.JS,
      content: `// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Script loaded!');
  
  // Add event listener to the button
  const button = document.getElementById('demo-button');
  if (button) {
    button.addEventListener('click', () => {
      alert('Button clicked!');
      
      // Change the button text
      button.textContent = 'Clicked!';
      
      // Add a class for styling
      button.style.backgroundColor = '#10b981';
    });
  }
  
  // Add a simple animation to the card
  const card = document.querySelector('.card');
  if (card) {
    let animated = false;
    
    card.addEventListener('click', () => {
      if (!animated) {
        card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
        card.style.transform = 'scale(1.05)';
        card.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
        animated = true;
      } else {
        card.style.transform = 'scale(1)';
        card.style.boxShadow = 'none';
        animated = false;
      }
    });
  }
});`
    }
  ]
};

// A-Frame template
const aframeTemplate: Project = {
  name: 'A-Frame Project',
  framework: Framework.AFRAME,
  files: [
    {
      id: 'index.html',
      name: 'index.html',
      type: FileType.HTML,
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple A-Frame Scene</title>
  <script src="https://aframe.io/releases/1.4.2/aframe.min.js"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <a-scene>
    <!-- Environment -->
    <a-sky color="#ECECEC"></a-sky>
    <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>

    <!-- Add some basic shapes -->
    <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
    <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
    <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>

    <!-- Camera -->
    <a-entity position="0 1.6 0">
      <a-camera></a-camera>
    </a-entity>
  </a-scene>

  <script src="script.js"></script>
</body>
</html>`
    },
    {
      id: 'style.css',
      name: 'style.css',
      type: FileType.CSS,
      content: `body {
  margin: 0;
  padding: 0;
}

.a-enter-vr {
  position: fixed;
  bottom: 20px;
  right: 20px;
}`
    },
    {
      id: 'script.js',
      name: 'script.js',
      type: FileType.JS,
      content: `document.addEventListener('DOMContentLoaded', () => {
  // Add some simple animations
  const box = document.querySelector('a-box');
  const sphere = document.querySelector('a-sphere');
  const cylinder = document.querySelector('a-cylinder');

  // Rotate box
  box.setAttribute('animation', {
    property: 'rotation',
    dur: 4000,
    to: '0 405 0',
    loop: true
  });

  // Move sphere up and down
  sphere.setAttribute('animation', {
    property: 'position',
    dur: 2000,
    dir: 'alternate',
    easing: 'easeInOutSine',
    to: '0 1.75 -5',
    loop: true
  });

  // Change cylinder color
  cylinder.setAttribute('animation', {
    property: 'material.color',
    dur: 3000,
    to: '#FF6B6B',
    dir: 'alternate',
    loop: true
  });
});`
    }
  ]
};

// Babylon.js template
const babylonTemplate: Project = {
  name: 'Babylon.js Project',
  framework: Framework.BABYLON,
  files: [
    {
      id: 'index.html',
      name: 'index.html',
      type: FileType.HTML,
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Babylon.js Project</title>
  <script src="https://cdn.babylonjs.com/babylon.js"></script>
  <script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <canvas id="renderCanvas"></canvas>
  <script src="script.js"></script>
</body>
</html>`
    },
    {
      id: 'style.css',
      name: 'style.css',
      type: FileType.CSS,
      content: `html, body {
  overflow: hidden;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

#renderCanvas {
  width: 100%;
  height: 100%;
  touch-action: none;
}`
    },
    {
      id: 'script.js',
      name: 'script.js',
      type: FileType.JS,
      content: `document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('renderCanvas');
  const engine = new BABYLON.Engine(canvas, true);

  const createScene = () => {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.2);

    // Add camera
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      0,
      Math.PI / 3,
      10,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.attachControl(canvas, true);

    // Add lights
    const light = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(0, 1, 0),
      scene
    );

    // Add shapes
    const sphere = BABYLON.MeshBuilder.CreateSphere(
      'sphere',
      { diameter: 2 },
      scene
    );
    sphere.position.y = 1;

    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { width: 10, height: 10 },
      scene
    );

    // Add materials
    const sphereMaterial = new BABYLON.StandardMaterial('sphereMat', scene);
    sphereMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.8);
    sphere.material = sphereMaterial;

    const groundMaterial = new BABYLON.StandardMaterial('groundMat', scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.4);
    ground.material = groundMaterial;

    return scene;
  };

  const scene = createScene();

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });
});`
    }
  ]
};

export const defaultTemplates = {
  basic: basicTemplate,
  aframe: aframeTemplate,
  babylon: babylonTemplate,
};