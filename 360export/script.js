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
  }
});

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
      
      if (config.scenes) {
        this.scenes = config.scenes;
        this.currentScene = config.currentScene || 'room1';
        this.setupScenes();
      } else if (config.hotspots) {
        this.scenes = {
          'room1': {
            name: 'Room 1',
            image: './images/room1.jpg',
            hotspots: config.hotspots
          }
        };
        this.currentScene = 'room1';
        this.setupScenes();
      }
    } catch (error) {
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
    this.loadScene(this.currentScene);
  }

  loadScene(sceneId) {
    if (!this.scenes[sceneId]) {
      return;
    }
    
    const scene = this.scenes[sceneId];
    const skybox = document.getElementById('skybox');
    
    // Update scene image
    const imagePath = this.getSceneImagePath(scene.image, sceneId);
    const cacheBuster = Date.now();
    const imagePathWithCache = imagePath + '?t=' + cacheBuster;
    const uniqueId = 'panorama-' + cacheBuster;
    
    // Create a new image element that's not attached to the DOM yet
    const preloadImage = new Image();
    
    preloadImage.onload = () => {
      const newPanorama = document.createElement('img');
      newPanorama.id = uniqueId;
      newPanorama.src = imagePathWithCache;
      newPanorama.crossOrigin = 'anonymous';
      
      const assets = document.querySelector('a-assets');
      assets.appendChild(newPanorama);
      
      skybox.setAttribute('visible', 'false');
      
      setTimeout(() => {
        skybox.setAttribute('src', '#' + uniqueId);
        skybox.setAttribute('visible', 'true');
        
        const container = document.getElementById('hotspot-container');
        container.innerHTML = '';
        this.createHotspots(scene.hotspots);
        
        setTimeout(() => {
          this.applyStartingPoint(scene);
        }, 100);
      }, 100);
    };
    
    preloadImage.onerror = () => {
      console.error(`Failed to load panorama: ${imagePath}`);
    };
    
    preloadImage.src = imagePathWithCache;
    this.currentScene = sceneId;
  }

  getSceneImagePath(imagePath, sceneId) {
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    } else if (imagePath.startsWith('./images/')) {
      return imagePath;
    } else if (imagePath.startsWith('data:')) {
      return `./images/${sceneId}.jpg`;
    } else {
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
        const audioSrc = hotspot.audio || "#default-audio";
        config += ";audio:" + audioSrc;
      }
      
      if (hotspot.type === 'navigation') {
        config += ";navigation:" + hotspot.navigationTarget;
        
        hotspotEl.addEventListener('click', (e) => {
          e.stopPropagation();
          this.navigateToScene(hotspot.navigationTarget);
        });
        
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
      return;
    }
    
    setTimeout(() => {
      this.loadScene(sceneId);
    }, 300);
  }
  
  applyStartingPoint(scene) {
    if (!scene.startingPoint || !scene.startingPoint.rotation) return;
    
    const camera = document.getElementById('cam');
    const rotation = scene.startingPoint.rotation;
    
    const lookControls = camera.components['look-controls'];
    if (lookControls) {
      lookControls.pause();
    }
    
    camera.setAttribute('rotation', `${rotation.x} ${rotation.y} ${rotation.z}`);
    
    if (lookControls) {
      if (lookControls.pitchObject && lookControls.yawObject) {
        lookControls.pitchObject.rotation.x = THREE.MathUtils.degToRad(rotation.x);
        lookControls.yawObject.rotation.y = THREE.MathUtils.degToRad(rotation.y);
        
        setTimeout(() => {
          lookControls.play();
        }, 100);
      }
    }
  }
}

// Initialize project
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    new HotspotProject();
  }, 1000);
});