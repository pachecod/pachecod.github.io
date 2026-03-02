// VR Hotspot Project - Standalone Version
// Generated from VR Hotspot Editor

// Face camera component
AFRAME.registerComponent("face-camera", {
  init: function () {
    this.cameraObj = document.querySelector("[camera]").object3D;
  },
  tick: function () {
    if (this.cameraObj) {
      this.el.object3D.lookAt(this.cameraObj.position);
    }
  },
});

// Hotspot component for standalone projects
AFRAME.registerComponent("hotspot", {
  schema: {
    label: { type: "string", default: "" },
    audio: { type: "string", default: "" },
    popup: { type: "string", default: "" },
    popupWidth: { type: "number", default: 3 },
    popupHeight: { type: "number", default: 2 },
    popupColor: { type: "color", default: "#333333" },
  },

  init: function () {
    const data = this.data;
    const el = this.el;

    // Add hover animations
    el.setAttribute("animation__hover_in", {
      property: "scale",
      to: "1.2 1.2 1.2",
      dur: 200,
      easing: "easeOutQuad",
      startEvents: "mouseenter",
    });

    el.setAttribute("animation__hover_out", {
      property: "scale",
      to: "1 1 1",
      dur: 200,
      easing: "easeOutQuad",
      startEvents: "mouseleave",
    });

    // Add popup functionality
    if (data.popup) {
      this.createPopup(data);
    }

    // Add label
    if (data.label) {
      this.createLabel(data);
    }

    // Add audio functionality
    if (data.audio) {
      this.createAudio(data);
    }
  },

  createPopup: function(data) {
    const el = this.el;

    const infoIcon = document.createElement("a-entity");
    infoIcon.setAttribute("geometry", "primitive: plane; width: 4; height: 0.5");
    infoIcon.setAttribute("material", "color: #00FF00");
    infoIcon.setAttribute("text", "value: click for info; align: center; color: black; width: 8");
    infoIcon.setAttribute("position", "0 1 0");
    infoIcon.classList.add("clickable");
    el.appendChild(infoIcon);

    const popup = document.createElement("a-entity");
    popup.setAttribute("visible", "false");
    popup.setAttribute("position", "0 1.5 0");
    popup.setAttribute("look-at", "#cam");

    const background = document.createElement("a-plane");
    background.setAttribute("color", data.popupColor);
    background.setAttribute("width", data.popupWidth);
    background.setAttribute("height", data.popupHeight);
    background.setAttribute("opacity", 0.95);
    popup.appendChild(background);

    const text = document.createElement("a-text");
    text.setAttribute("value", data.popup);
    text.setAttribute("wrap-count", 35);
    text.setAttribute("color", "white");
    text.setAttribute("position", "0 0 0.01");
    text.setAttribute("align", "center");
    popup.appendChild(text);

    const closeButton = document.createElement("a-image");
    closeButton.setAttribute("position", data.popupWidth/2-0.3 + " " + (data.popupHeight/2-0.3) + " 0.02");
    closeButton.setAttribute("src", "#close");
    closeButton.setAttribute("width", "0.4");
    closeButton.setAttribute("height", "0.4");
    closeButton.classList.add("clickable");
    popup.appendChild(closeButton);

    infoIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      popup.setAttribute("visible", true);
      infoIcon.setAttribute("visible", false); // Hide info icon when popup is open
    });

    closeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      popup.setAttribute("visible", false);
      setTimeout(() => {
        infoIcon.setAttribute("visible", true); // Show info icon when popup is closed
      }, 250);
    });

    el.appendChild(popup);
  },

  createLabel: function(data) {
    const el = this.el;
    const labelContainer = document.createElement("a-entity");
    labelContainer.setAttribute("position", "0 -0.6 0");

    const bg = document.createElement("a-plane");
    bg.setAttribute("color", "#333333");
    bg.setAttribute("opacity", 0.8);
    bg.setAttribute("width", data.label.length * 0.15 + 0.4);
    bg.setAttribute("height", 0.3);

    const textEl = document.createElement("a-text");
    textEl.setAttribute("value", data.label);
    textEl.setAttribute("align", "center");
    textEl.setAttribute("color", "#FFFFFF");

    labelContainer.appendChild(bg);
    labelContainer.appendChild(textEl);
    el.appendChild(labelContainer);
  },

  createAudio: function(data) {
    const el = this.el;
    const audioEl = document.createElement("a-sound");
    audioEl.setAttribute("src", data.audio);
    audioEl.setAttribute("autoplay", "false");
    audioEl.setAttribute("loop", "true");
    el.appendChild(audioEl);

    const btn = document.createElement("a-image");
    btn.setAttribute("class", "clickable");
    btn.setAttribute("src", "#play");
    btn.setAttribute("width", "0.5");
    btn.setAttribute("height", "0.5");
    btn.setAttribute("position", "0 -1 0.02");
    el.appendChild(btn);

    let isPlaying = false;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (audioEl.components.sound) {
        if (isPlaying) {
          audioEl.components.sound.stopSound();
          btn.setAttribute("src", "#play");
        } else {
          audioEl.components.sound.playSound();
          btn.setAttribute("src", "#pause");
        }
        isPlaying = !isPlaying;
      }
    });
  }
});

// Project loader
// Project loader
class HotspotProject {
  constructor() {
    this.scenes = {};
    this.currentScene = 'room1';
    this.loadProject();
  }

  async loadProject() {
    try {
      const response = await fetch('./config.json');
      const config = await response.json();
      
      console.log('Loaded config:', config);
      
      if (config.scenes) {
        // New format with scenes
        this.scenes = config.scenes;
        this.currentScene = config.currentScene || 'room1';
        console.log('Using new format with scenes:', this.scenes);
        this.setupScenes();
      } else if (config.hotspots) {
        // Legacy format - single scene
        this.scenes = {
          'room1': {
            name: 'Room 1',
            image: './images/room1.jpg',
            hotspots: config.hotspots
          }
        };
        this.currentScene = 'room1';
        console.log('Using legacy format, created single scene');
        this.setupScenes();
      }
    } catch (error) {
      console.warn('No config.json found, using empty project');
      this.scenes = {
        'room1': {
          name: 'Room 1', 
          image: './images/room1.jpg',
          hotspots: []
        }
      };
      this.setupScenes();
    }
  }

  setupScenes() {
    // Load the current scene
    this.loadScene(this.currentScene);
  }

  loadScene(sceneId) {
    if (!this.scenes[sceneId]) {
      console.warn(`Scene ${sceneId} not found`);
      return;
    }
    
    const scene = this.scenes[sceneId];
    const skybox = document.getElementById('skybox');
    
    console.log(`Loading scene: ${sceneId}`, scene);
    
    // Show a loading indicator
    this.showLoadingIndicator();
    
    // Update scene image
    const imagePath = this.getSceneImagePath(scene.image, sceneId);
    console.log(`Setting panorama src to: ${imagePath}`);
    
    // Use a timestamp as a cache buster
    const cacheBuster = Date.now();
    const imagePathWithCache = imagePath + '?t=' + cacheBuster;
    
    // Create a new unique ID for this panorama
    const uniqueId = 'panorama-' + cacheBuster;
    
    // Create a completely new method that's more reliable across browsers
    // First, create a new image element that's not attached to the DOM yet
    const preloadImage = new Image();
    
    // Set up loading handlers before setting src
    preloadImage.onload = () => {
      console.log('New panorama loaded successfully');
      
      // Now we know the image is loaded, create the actual element for A-Frame
      const newPanorama = document.createElement('img');
      newPanorama.id = uniqueId;
      newPanorama.src = imagePathWithCache;
      newPanorama.crossOrigin = 'anonymous'; // Important for some browsers
      
      // Get the assets container
      const assets = document.querySelector('a-assets');
      
      // Add new panorama element to assets
      assets.appendChild(newPanorama);
      
      // Temporarily hide the skybox while changing its texture
      skybox.setAttribute('visible', 'false');
      
      // Force A-Frame to recognize the asset change
      setTimeout(() => {
        // Update to new texture
        skybox.setAttribute('src', '#' + uniqueId);
        skybox.setAttribute('visible', 'true');
        
        console.log('Skybox texture updated with ID:', uniqueId);
        
        // Create hotspots after skybox is updated
        const container = document.getElementById('hotspot-container');
        container.innerHTML = '';
        this.createHotspots(scene.hotspots);
        console.log('Hotspots created');
        
        // Apply starting point if available
        setTimeout(() => {
          this.applyStartingPoint(scene);
        }, 100);
        
        // Hide the loading indicator
        this.hideLoadingIndicator();
      }, 100);
    };
    
    // Handle load errors
    preloadImage.onerror = () => {
      console.error(`Failed to load panorama: ${imagePath}`);
      this.showErrorMessage(`Failed to load scene image for "${scene.name}". Please check if the image exists at ${imagePath}`);
      this.hideLoadingIndicator();
    };
    
    // Start loading the image
    preloadImage.src = imagePathWithCache;
    
    // We've replaced this with the preloadImage.onerror handler above
    
    this.currentScene = sceneId;
  }

  getSceneImagePath(imagePath, sceneId) {
    // If it's a URL (http:// or https://), use it directly
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // If it's already a proper path starting with ./images/, use it directly
    else if (imagePath.startsWith('./images/')) {
      return imagePath;
    } 
    // For uploaded scenes (data URLs in config), look for the saved file
    else if (imagePath.startsWith('data:')) {
      return `./images/${sceneId}.jpg`;
    }
    // Fallback - assume it's a filename and prepend the images path
    else {
      return `./images/${imagePath}`;
    }
  }

  createHotspots(hotspots) {
    const container = document.getElementById('hotspot-container');
    

    hotspots.forEach(hotspot => {
      let hotspotEl;
      if (hotspot.type === 'navigation') {
        hotspotEl = document.createElement('a-image');
        hotspotEl.setAttribute('src', '#hotspot');
        hotspotEl.setAttribute('face-camera', '');
      } else {
        hotspotEl = document.createElement('a-entity');
        hotspotEl.setAttribute('geometry', 'primitive: plane; width: 0.7; height: 0.7');
        hotspotEl.setAttribute('material', 'opacity: 0; transparent: true');
        hotspotEl.setAttribute('face-camera', '');
      }
      hotspotEl.setAttribute('position', hotspot.position);
      hotspotEl.setAttribute('class', 'clickable');
      
      let config = "label:" + hotspot.label;
      
      if (hotspot.type === 'text' || hotspot.type === 'text-audio') {
        config += ";popup:" + hotspot.text + ";popupWidth:4;popupHeight:2.5;popupColor:#333333";
      }
      
      if (hotspot.type === 'audio' || hotspot.type === 'text-audio') {
        // Use custom audio URL if available, otherwise use default
        const audioSrc = hotspot.audio || "#default-audio";
        config += ";audio:" + audioSrc;
      }
      
      if (hotspot.type === 'navigation') {
        config += ";navigation:" + hotspot.navigationTarget;
        
        // Add navigation click handler
        hotspotEl.addEventListener('click', (e) => {
          e.stopPropagation();
          this.navigateToScene(hotspot.navigationTarget);
        });
        
        // Add visual effects for navigation hotspots
        hotspotEl.setAttribute('material', 'color: #2196F3');
        hotspotEl.setAttribute('animation__rotate', {
          property: 'rotation',
          to: '0 360 0',
          dur: 4000,
          easing: 'linear',
          loop: true
        });
      }
      
      hotspotEl.setAttribute('hotspot', config);
      container.appendChild(hotspotEl);
    });
  }
  
  navigateToScene(sceneId) {
    if (!this.scenes[sceneId]) {
      console.warn(`Scene ${sceneId} not found`);
      return;
    }
    
    // Show navigation feedback before loading the scene
    this.showNavigationFeedback(this.scenes[sceneId].name);
    
    // Short delay to allow the feedback to be visible before potential loading screen
    setTimeout(() => {
      this.loadScene(sceneId);
    }, 300);
  }
  
  showNavigationFeedback(sceneName) {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(76, 175, 80, 0.9); color: white; padding: 15px 25px;
      border-radius: 8px; font-weight: bold; z-index: 10001;
      font-family: Arial; animation: fadeInOut 2s ease-in-out;
    `;
    feedback.innerHTML = `Navigated to: ${sceneName}`;
    
    document.body.appendChild(feedback);
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 2000);
  }
  
  showErrorMessage(message) {
    const errorBox = document.createElement("div");
    errorBox.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(244, 67, 54, 0.9); color: white; padding: 20px 30px;
      border-radius: 8px; font-weight: bold; z-index: 10001;
      font-family: Arial; max-width: 80%;
    `;
    errorBox.innerHTML = `<div style="text-align:center">⚠️ Error</div><div style="margin-top:10px">${message}</div>`;
    
    // Add a close button
    const closeBtn = document.createElement("button");
    closeBtn.innerText = "Close";
    closeBtn.style.cssText = `
      background: white; color: #f44336; border: none; padding: 8px 15px;
      border-radius: 4px; margin-top: 15px; cursor: pointer; font-weight: bold;
      display: block; margin-left: auto; margin-right: auto;
    `;
    
    closeBtn.onclick = () => {
      if (errorBox.parentNode) {
        errorBox.parentNode.removeChild(errorBox);
      }
    };
    
    errorBox.appendChild(closeBtn);
    document.body.appendChild(errorBox);
  }
  
  showLoadingIndicator() {
    // Remove any existing loading indicator
    this.hideLoadingIndicator();
    
    // Create loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.id = 'scene-loading-indicator';
    loadingEl.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 20px 40px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 18px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;
    
    // Add spinning animation
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      border: 5px solid rgba(255, 255, 255, 0.3);
      border-top: 5px solid #fff;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      margin-bottom: 15px;
      animation: spin 1s linear infinite;
    `;
    
    // Add keyframes for spinner animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    // Text
    const text = document.createElement('div');
    text.textContent = 'Loading scene...';
    
    loadingEl.appendChild(spinner);
    loadingEl.appendChild(text);
    document.body.appendChild(loadingEl);
  }
  
  hideLoadingIndicator() {
    const loadingEl = document.getElementById('scene-loading-indicator');
    if (loadingEl && loadingEl.parentNode) {
      loadingEl.parentNode.removeChild(loadingEl);
    }
  }
  
  applyStartingPoint(scene) {
    if (!scene.startingPoint || !scene.startingPoint.rotation) return;
    
    const camera = document.getElementById('cam');
    const rotation = scene.startingPoint.rotation;
    
    // Temporarily disable look-controls to allow rotation setting
    const lookControls = camera.components['look-controls'];
    if (lookControls) {
      lookControls.pause();
    }
    
    // Apply the stored rotation to the camera
    camera.setAttribute('rotation', `${rotation.x} ${rotation.y} ${rotation.z}`);
    
    // Force the look-controls to sync with the new rotation
    if (lookControls) {
      // Update the look-controls internal state to match our rotation
      lookControls.pitchObject.rotation.x = THREE.MathUtils.degToRad(rotation.x);
      lookControls.yawObject.rotation.y = THREE.MathUtils.degToRad(rotation.y);
      
      // Re-enable look-controls after a short delay
      setTimeout(() => {
        lookControls.play();
      }, 100);
    }
    
    console.log(`Applied starting point rotation: X:${rotation.x}° Y:${rotation.y}° Z:${rotation.z}°`);
  }
}

// Initialize project
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    new HotspotProject();
  }, 1000);
});