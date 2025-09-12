// VR Hotspot Project - Standalone Version
// Generated from VR Hotspot Editor

// Custom Styles Configuration
const CUSTOM_STYLES = {
  "hotspot": {
    "infoButton": {
      "backgroundColor": "#4A90E2",
      "textColor": "#FFFFFF",
      "fontSize": 12,
      "opacity": 0.9,
      "size": 0.4
    },
    "popup": {
      "backgroundColor": "#333333",
      "textColor": "#FFFFFF",
      "borderColor": "#555555",
      "borderWidth": 0,
      "borderRadius": 0,
      "opacity": 0.95,
      "fontSize": 1,
      "padding": 0.2
    },
    "closeButton": {
      "size": 0.4,
      "opacity": 1
    }
  },
  "audio": {
    "buttonColor": "#FFFFFF",
    "buttonOpacity": 1
  },
  "buttonImages": {
    "portal": "images/up-arrow.png",
    "play": "images/play.png",
    "pause": "images/pause.png"
  }
};

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

    // Add audio functionality
    if (data.audio) {
      this.createAudio(data);
    }
  },

  createPopup: function(data) {
    const el = this.el;

    const infoIcon = document.createElement("a-entity");
    // Create circular info icon instead of banner
    const iconSize = CUSTOM_STYLES.hotspot.infoButton.size || 0.4;
    infoIcon.setAttribute("geometry", "primitive: circle; radius: " + iconSize);
    
    // Use custom styles
    const infoBgColor = CUSTOM_STYLES.hotspot.infoButton.backgroundColor;
    const infoTextColor = CUSTOM_STYLES.hotspot.infoButton.textColor;
    const infoFontSize = CUSTOM_STYLES.hotspot.infoButton.fontSize;
    
    infoIcon.setAttribute("material", "color: " + infoBgColor + "; opacity: " + CUSTOM_STYLES.hotspot.infoButton.opacity);
    infoIcon.setAttribute("text", "value: i; align: center; color: " + infoTextColor + "; width: " + infoFontSize + "; font: roboto");
    infoIcon.setAttribute("position", "0 0.8 0");
    infoIcon.classList.add("clickable");
    el.appendChild(infoIcon);

    const popup = document.createElement("a-entity");
    popup.setAttribute("visible", "false");
    popup.setAttribute("position", "0 1.5 0");
    popup.setAttribute("look-at", "#cam");

    const background = document.createElement("a-plane");
    background.setAttribute("color", CUSTOM_STYLES.hotspot.popup.backgroundColor);
    background.setAttribute("width", data.popupWidth);
    background.setAttribute("height", data.popupHeight);
    background.setAttribute("opacity", CUSTOM_STYLES.hotspot.popup.opacity);
    popup.appendChild(background);

    const text = document.createElement("a-text");
    text.setAttribute("value", data.popup);
    text.setAttribute("wrap-count", Math.floor(data.popupWidth * 8)); // Dynamic wrap based on popup width
    text.setAttribute("color", CUSTOM_STYLES.hotspot.popup.textColor);
    text.setAttribute("position", "0 0 0.01");
    text.setAttribute("align", "center");
    text.setAttribute("width", (data.popupWidth - 0.4).toString()); // Constrain to popup width with padding
    text.setAttribute("font", "roboto");
    popup.appendChild(text);

    const closeButton = document.createElement("a-image");
    closeButton.setAttribute("position", data.popupWidth/2-0.3 + " " + (data.popupHeight/2-0.3) + " 0.02");
    closeButton.setAttribute("src", "#close");
    closeButton.setAttribute("width", CUSTOM_STYLES.hotspot.closeButton.size.toString());
    closeButton.setAttribute("height", CUSTOM_STYLES.hotspot.closeButton.size.toString());
    closeButton.setAttribute("opacity", CUSTOM_STYLES.hotspot.closeButton.opacity.toString());
    closeButton.classList.add("clickable");
    popup.appendChild(closeButton);

    infoIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      popup.setAttribute("visible", true);
      infoIcon.setAttribute("visible", false); // Hide info icon when popup is open
    });

    closeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      popup.setAttribute("visible", false);
      setTimeout(() => {
        infoIcon.setAttribute("visible", true); // Show info icon when popup is closed
      }, 250);
    });

    el.appendChild(popup);
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
    
    // Use custom play button image if available
    const playImage = CUSTOM_STYLES?.buttonImages?.play || "#play";
    btn.setAttribute("src", playImage);
    
    // Use custom audio button styles
    btn.setAttribute("width", "0.5");
    btn.setAttribute("height", "0.5");
    btn.setAttribute("material", "color: " + CUSTOM_STYLES.audio.buttonColor);
    btn.setAttribute("opacity", CUSTOM_STYLES.audio.buttonOpacity.toString());
    btn.setAttribute("position", "0 -1 0.02");
    el.appendChild(btn);

    let isPlaying = false;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (audioEl.components.sound) {
        if (isPlaying) {
          audioEl.components.sound.stopSound();
          const playImage = CUSTOM_STYLES?.buttonImages?.play || "#play";
          btn.setAttribute("src", playImage);
        } else {
          audioEl.components.sound.playSound();
          const pauseImage = CUSTOM_STYLES?.buttonImages?.pause || "#pause";
          btn.setAttribute("src", pauseImage);
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
    this.globalSoundEnabled = true;
    this.currentGlobalAudio = null;
    this.isDragging = false;
    this.progressUpdateInterval = null;
    this.crossfadeEl = null; // overlay for crossfade
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
    // Setup global sound control first
    this.setupGlobalSoundControl();
    
    // Show the loading environment for at least 1.5 seconds to display the animation
    // Load the current scene with a delay to ensure DOM is ready and show loading animation
    setTimeout(() => {
      this.loadScene(this.currentScene);
    }, 1500);
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
      console.log('=== IMAGE LOAD SUCCESS ===');
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
        
        // Hide loading environment and show the actual scene
        const loadingEnvironment = document.getElementById('loading-environment');
        if (loadingEnvironment) {
          loadingEnvironment.setAttribute('visible', 'false');
          console.log('Loading environment hidden');
        } else {
          console.log('Loading environment not found!');
        }
        skybox.setAttribute('visible', 'true');
        console.log('Skybox made visible');
        
        console.log('Skybox texture updated with ID:', uniqueId);
        
        // Create hotspots after skybox is updated
        const container = document.getElementById('hotspot-container');
        container.innerHTML = '';
        console.log('About to create hotspots for scene:', sceneId);
        console.log('Scene hotspots:', scene.hotspots);
        this.createHotspots(scene.hotspots);
        console.log('Hotspots created');
        
        // Apply starting point if available
        setTimeout(() => {
          this.applyStartingPoint(scene);
          
          // Play global sound for this scene
          setTimeout(() => {
            this.playCurrentGlobalSound();
          }, 500);
        }, 100);
        
        // Notify listeners that the scene finished loading (for transitions)
        try { const ev = new CustomEvent('vrhotspots:scene-loaded'); window.dispatchEvent(ev); } catch(e) {}

        // Hide the loading indicator
        this.hideLoadingIndicator();
      }, 100);
    };
    
    // Handle load errors
    preloadImage.onerror = () => {
      console.log('=== IMAGE LOAD ERROR ===');
      console.error(`Failed to load panorama: ${imagePath}`);
      this.showErrorMessage(`Failed to load scene image for "${scene.name}". Please check if the image exists at ${imagePath}`);
      
      // Hide loading environment and show fallback
      const loadingEnvironment = document.getElementById('loading-environment');
      if (loadingEnvironment) {
        loadingEnvironment.setAttribute('visible', 'false');
      }
      
      // Fallback to default image
      skybox.setAttribute('src', '#main-panorama');
      skybox.setAttribute('visible', 'true');
      
      // Create hotspots even with fallback image
      const container = document.getElementById('hotspot-container');
      container.innerHTML = '';
      console.log('Creating hotspots in error path for scene:', sceneId);
      console.log('Scene hotspots:', scene.hotspots);
      this.createHotspots(scene.hotspots);
      
      // Apply starting point if available
      setTimeout(() => {
        this.applyStartingPoint(scene);
        
        // Play global sound for this scene
        setTimeout(() => {
          this.playCurrentGlobalSound();
        }, 500);
      }, 100);
      
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
    console.log('=== CREATING HOTSPOTS ===');
    console.log('Container found:', !!container);
    console.log('Hotspots to create:', hotspots.length);
    console.log('Hotspots data:', hotspots);

    hotspots.forEach((hotspot, index) => {
      console.log(`Creating hotspot ${index + 1}:`, hotspot);
      let hotspotEl;
      if (hotspot.type === 'navigation') {
        hotspotEl = document.createElement('a-entity');
        hotspotEl.setAttribute('face-camera', '');

        // Transparent circle collider for interactions
        const collider = document.createElement('a-entity');
        collider.setAttribute('geometry', 'primitive: circle; radius: 0.6');
        collider.setAttribute('material', 'opacity: 0; transparent: true');
        collider.classList.add('clickable');
        hotspotEl.appendChild(collider);

  // Thin green border ring (~3px) with transparent center
  const ring = document.createElement('a-entity');
  ring.setAttribute('geometry', 'primitive: ring; radiusInner: 0.595; radiusOuter: 0.6');
  ring.setAttribute('material', 'color: rgb(0, 85, 0); opacity: 1; transparent: true; shader: flat');
  ring.setAttribute('position', '0 0 0.002');
  hotspotEl.appendChild(ring);

  // Inline preview circle (hidden by default), shows destination scene image inside the ring
  const preview = document.createElement('a-entity');
  preview.setAttribute('geometry', 'primitive: circle; radius: 0.595');
  preview.setAttribute('material', 'transparent: true; opacity: 1');
  preview.setAttribute('visible', 'false');
  preview.setAttribute('position', '0 0 0.001');
  preview.setAttribute('scale', '0.01 0.01 0.01');
  preview.classList.add('nav-preview-circle');
  hotspotEl.appendChild(preview);
        
        // Optional: subtle pulsing ring effect
        ring.setAttribute('animation__pulse', {
          property: 'scale',
          from: '1 1 1',
          to: '1.03 1.03 1',
          dur: 1200,
          dir: 'alternate',
          loop: true,
          easing: 'easeInOutSine'
        });
      } else {
        hotspotEl = document.createElement('a-entity');
        hotspotEl.setAttribute('geometry', 'primitive: plane; width: 0.7; height: 0.7');
        hotspotEl.setAttribute('material', 'opacity: 0; transparent: true');
        hotspotEl.setAttribute('face-camera', '');
      }
      hotspotEl.setAttribute('position', hotspot.position);
      hotspotEl.setAttribute('class', 'clickable');
      
      let config = "type:" + hotspot.type;
      
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
        
        // Add navigation click handler on the collider area
        const targetEl = hotspotEl.querySelector('.clickable') || hotspotEl;
        targetEl.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.navigateToScene(hotspot.navigationTarget);
        });

        // Hover preview inside the circle
        const previewEl = hotspotEl.querySelector('.nav-preview-circle');
        targetEl.addEventListener('mouseenter', () => {
          if (previewEl) {
            const src = this._getExportPreviewSrc(hotspot.navigationTarget);
            if (src) {
              previewEl.setAttribute('material', 'src: ' + src + '; transparent: true; opacity: 1');
            }
            previewEl.setAttribute('visible', 'true');
            previewEl.removeAttribute('animation__shrink');
            previewEl.setAttribute('scale', '0.01 0.01 0.01');
            previewEl.setAttribute('animation__grow', { property: 'scale', to: '1 1 1', dur: 180, easing: 'easeOutCubic' });
          }
        });
        targetEl.addEventListener('mouseleave', () => {
          if (previewEl) {
            previewEl.removeAttribute('animation__grow');
            previewEl.setAttribute('animation__shrink', { property: 'scale', to: '0.01 0.01 0.01', dur: 120, easing: 'easeInCubic' });
            setTimeout(() => { previewEl.setAttribute('visible', 'false'); }, 130);
          }
        });
      }
      
      hotspotEl.setAttribute('hotspot', config);
      container.appendChild(hotspotEl);
      console.log(`Hotspot ${index + 1} added to container. Position: ${hotspot.position}, Type: ${hotspot.type}`);
    });
    console.log('=== HOTSPOTS CREATION COMPLETE ===');
    console.log('Container children count:', container.children.length);
    console.log('Container HTML:', container.innerHTML);
  }
  
  navigateToScene(sceneId) {
    if (!this.scenes[sceneId]) {
      console.warn(`Scene ${sceneId} not found`);
      return;
    }
    
    // Stop current global sound before switching
    this.stopCurrentGlobalSound();
    
    // Show navigation feedback
    this.showNavigationFeedback(this.scenes[sceneId].name);

    // Crossfade transition into next scene
    this._startCrossfadeOverlay(() => {
      // End overlay when scene reports loaded
      const onLoaded = () => {
        window.removeEventListener('vrhotspots:scene-loaded', onLoaded);
        this._endCrossfadeOverlay();
      };
      window.addEventListener('vrhotspots:scene-loaded', onLoaded, { once: true });
      // Safety timeout
      setTimeout(() => {
        window.removeEventListener('vrhotspots:scene-loaded', onLoaded);
        this._endCrossfadeOverlay();
      }, 1500);

      this.loadScene(sceneId);
    });
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
    
    // Create a more immersive loading indicator that matches the 3D environment
    const loadingEl = document.createElement('div');
    loadingEl.id = 'scene-loading-indicator';
    loadingEl.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(15, 15, 35, 0.95));
      color: white;
      padding: 30px 50px;
      border-radius: 15px;
      font-family: 'Arial', sans-serif;
      font-size: 16px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(76, 175, 80, 0.3);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;
    
    // Add spinning orb animation (matching the 3D scene)
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 50px;
      height: 50px;
      margin-bottom: 20px;
      position: relative;
    `;
    
    // Create multiple spinning rings
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div');
      ring.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 3px solid transparent;
        border-top: 3px solid ${i === 0 ? '#4CAF50' : i === 1 ? '#2196F3' : '#FF9800'};
        border-radius: 50%;
        animation: spin-${i} ${1 + i * 0.3}s linear infinite;
        transform: rotate(${i * 45}deg);
      `;
      spinner.appendChild(ring);
    }
    
    // Add enhanced keyframes for spinner animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin-0 {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes spin-1 {
        0% { transform: rotate(45deg); }
        100% { transform: rotate(405deg); }
      }
      @keyframes spin-2 {
        0% { transform: rotate(90deg); }
        100% { transform: rotate(450deg); }
      }
      @keyframes pulse-text {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.05); }
      }
    `;
    document.head.appendChild(style);
    
    // Main loading text
    const text = document.createElement('div');
    text.textContent = 'Entering Virtual Reality...';
    text.style.cssText = `
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #4CAF50;
      animation: pulse-text 2s ease-in-out infinite;
    `;
    
    // Subtitle text
    const subtitle = document.createElement('div');
    subtitle.textContent = 'Loading immersive experience';
    subtitle.style.cssText = `
      font-size: 14px;
      color: #cccccc;
      opacity: 0.8;
    `;
    
    loadingEl.appendChild(spinner);
    loadingEl.appendChild(text);
    loadingEl.appendChild(subtitle);
    document.body.appendChild(loadingEl);
  }
  
  hideLoadingIndicator() {
    const loadingEl = document.getElementById('scene-loading-indicator');
    if (loadingEl && loadingEl.parentNode) {
      loadingEl.parentNode.removeChild(loadingEl);
    }
  }

  // ===== Navigation Preview (Export viewer) =====
  _ensureNavPreview() {
    if (!this._navBox) {
      const box = document.createElement('div');
      box.id = 'nav-preview';
      box.style.cssText = 'position:fixed;top:0;left:0;transform:translate(12px,12px);display:none;pointer-events:none;z-index:100001;background:rgba(0,0,0,0.9);color:#fff;border:1px solid #4CAF50;border-radius:8px;overflow:hidden;width:220px;box-shadow:0 8px 24px rgba(0,0,0,0.4);font-family:Arial,sans-serif;backdrop-filter:blur(2px);';
      const img = document.createElement('img');
      img.id = 'nav-preview-img';
      img.style.cssText = 'display:block;width:100%;height:120px;object-fit:cover;background:#111;';
      const cap = document.createElement('div');
      cap.id = 'nav-preview-caption';
      cap.style.cssText = 'padding:8px 10px;font-size:12px;color:#ddd;border-top:1px solid rgba(255,255,255,0.08);';
      box.appendChild(img); box.appendChild(cap);
      document.body.appendChild(box);
      this._navBox = box;
    }
    return this._navBox;
  }

  _positionNavPreview(x,y){
    const box = this._ensureNavPreview();
    const rectW = box.offsetWidth || 220; const rectH = box.offsetHeight || 160; const pad = 12;
    const maxX = window.innerWidth - rectW - pad; const maxY = window.innerHeight - rectH - pad;
    const nx = Math.min(Math.max(x+12, pad), maxX); const ny = Math.min(Math.max(y+12, pad), maxY);
    box.style.left = nx+'px'; box.style.top = ny+'px';
  }

  _getExportPreviewSrc(sceneId){
    const sc = this.scenes[sceneId]; if (!sc) return null; const img = sc.image||'';
    if (img.startsWith('http://')||img.startsWith('https://')) return img;
    if (img.startsWith('./images/')) return img;
    if (img.startsWith('data:')) return './images/' + sceneId + '.jpg';
    return './images/' + img;
  }

  _showNavPreview(sceneId){
    const box = this._ensureNavPreview();
    const img = document.getElementById('nav-preview-img');
    const cap = document.getElementById('nav-preview-caption');
    const sc = this.scenes[sceneId]; if (!sc) return;
  const src = this._getExportPreviewSrc(sceneId); if (src) img.src = src;
  cap.textContent = 'Go to: ' + (sc.name || sceneId);
    box.style.display = 'block';
    if (!this._navMove){ this._navMove = (e)=> this._positionNavPreview((e.clientX||0),(e.clientY||0)); }
    window.addEventListener('mousemove', this._navMove);
  }

  _hideNavPreview(){
    const box = this._ensureNavPreview();
    box.style.display = 'none';
    if (this._navMove){ window.removeEventListener('mousemove', this._navMove); }
  }

  // ===== Crossfade helpers (Export viewer) =====
  _ensureCrossfadeOverlay() {
    if (!this.crossfadeEl) {
      const overlay = document.createElement('div');
      overlay.id = 'scene-crossfade';
      overlay.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity 300ms ease;z-index:100000;';
      document.body.appendChild(overlay);
      this.crossfadeEl = overlay;
    }
    return this.crossfadeEl;
  }

  _startCrossfadeOverlay(run) {
    const overlay = this._ensureCrossfadeOverlay();
    requestAnimationFrame(() => {
      overlay.style.pointerEvents = 'auto';
      overlay.style.opacity = '1';
      setTimeout(() => { try { run && run(); } catch(e) {} }, 320);
    });
  }

  _endCrossfadeOverlay() {
    const overlay = this._ensureCrossfadeOverlay();
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.pointerEvents = 'none'; }, 320);
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
  
  setupGlobalSoundControl() {
    const soundBtn = document.getElementById('global-sound-toggle');
    if (!soundBtn) return;
    
    soundBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleGlobalSound();
    });
    
    this.setupProgressBar();
    this.updateGlobalSoundButton();
  }
  
  setupProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const progressHandle = document.getElementById('progress-handle');
    
    if (!progressBar || !progressHandle) return;
    
    // Click on progress bar to seek
    progressBar.addEventListener('click', (e) => {
      if (this.isDragging) return;
      this.seekToPosition(e);
    });
    
    // Drag functionality
    progressHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.isDragging = true;
      document.addEventListener('mousemove', this.handleProgressDrag.bind(this));
      document.addEventListener('mouseup', this.handleProgressDragEnd.bind(this));
    });
    
    // Touch support for mobile
    progressHandle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isDragging = true;
      document.addEventListener('touchmove', this.handleProgressTouchDrag.bind(this));
      document.addEventListener('touchend', this.handleProgressDragEnd.bind(this));
    });
  }
  
  handleProgressDrag(e) {
    if (!this.isDragging || !this.currentGlobalAudio) return;
    e.preventDefault();
    this.seekToPosition(e);
  }
  
  handleProgressTouchDrag(e) {
    if (!this.isDragging || !this.currentGlobalAudio) return;
    e.preventDefault();
    const touch = e.touches[0];
    this.seekToPosition(touch);
  }
  
  handleProgressDragEnd() {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.handleProgressDrag);
    document.removeEventListener('mouseup', this.handleProgressDragEnd);
    document.removeEventListener('touchmove', this.handleProgressTouchDrag);
    document.removeEventListener('touchend', this.handleProgressDragEnd);
  }
  
  seekToPosition(e) {
    if (!this.currentGlobalAudio) return;
    
    const progressBar = document.getElementById('progress-bar');
    const rect = progressBar.getBoundingClientRect();
    const clickX = (e.clientX || e.pageX) - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    
    const newTime = percentage * this.currentGlobalAudio.duration;
    this.currentGlobalAudio.currentTime = newTime;
    
    this.updateProgressDisplay();
  }
  
  updateProgressDisplay() {
    if (!this.currentGlobalAudio) return;
    
    const progressFill = document.getElementById('progress-fill');
    const progressHandle = document.getElementById('progress-handle');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    
    if (!progressFill || !progressHandle || !currentTimeEl || !totalTimeEl) return;
    
    const currentTime = this.currentGlobalAudio.currentTime;
    const duration = this.currentGlobalAudio.duration;
    
    if (isNaN(duration)) return;
    
    const percentage = (currentTime / duration) * 100;
    
    progressFill.style.width = percentage + '%';
    progressHandle.style.left = percentage + '%';
    
    currentTimeEl.textContent = this.formatTime(currentTime);
    totalTimeEl.textContent = this.formatTime(duration);
  }
  
  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  showProgressBar() {
    const container = document.getElementById('audio-progress-container');
    if (container) {
      container.style.display = 'block';
    }
  }
  
  hideProgressBar() {
    const container = document.getElementById('audio-progress-container');
    if (container) {
      container.style.display = 'none';
    }
  }
  
  toggleGlobalSound() {
    this.globalSoundEnabled = !this.globalSoundEnabled;
    
    if (this.globalSoundEnabled) {
      this.playCurrentGlobalSound();
    } else {
      this.stopCurrentGlobalSound();
    }
    
    this.updateGlobalSoundButton();
  }
  
  updateGlobalSoundButton() {
    const soundBtn = document.getElementById('global-sound-toggle');
    if (!soundBtn) return;
    
    if (this.globalSoundEnabled) {
      soundBtn.textContent = '🔊 Sound: ON';
      soundBtn.classList.remove('muted');
    } else {
      soundBtn.textContent = '🔇 Sound: OFF';
      soundBtn.classList.add('muted');
    }
  }
  
  playCurrentGlobalSound() {
    if (!this.globalSoundEnabled) return;
    
    const scene = this.scenes[this.currentScene];
    if (!scene || !scene.globalSound || !scene.globalSound.enabled) {
      this.hideProgressBar();
      return;
    }
    
    this.stopCurrentGlobalSound();
    
    const globalSound = scene.globalSound;
    this.currentGlobalAudio = new Audio();
    this.currentGlobalAudio.src = globalSound.audio;
    this.currentGlobalAudio.loop = true;
    this.currentGlobalAudio.volume = globalSound.volume || 0.5;
    
    // Set up progress tracking
    this.currentGlobalAudio.addEventListener('loadedmetadata', () => {
      this.showProgressBar();
      this.updateProgressDisplay();
      this.startProgressTracking();
    });
    
    this.currentGlobalAudio.addEventListener('timeupdate', () => {
      if (!this.isDragging) {
        this.updateProgressDisplay();
      }
    });
    
    this.currentGlobalAudio.addEventListener('ended', () => {
      // This shouldn't happen with loop=true, but just in case
      this.updateProgressDisplay();
    });
    
    // Try to play audio, handle autoplay restrictions gracefully
    this.currentGlobalAudio.play().catch(e => {
      console.log('Audio autoplay blocked - will start on first user interaction');
      this.hideProgressBar();
      
      // Set up one-time event listener for first user interaction
      const enableAudioOnInteraction = () => {
        this.currentGlobalAudio.play().then(() => {
          console.log('Audio enabled after user interaction');
          this.showProgressBar();
          this.updateProgressDisplay();
          this.startProgressTracking();
        }).catch(e => {
          console.warn('Audio still cannot play:', e);
        });
        
        // Remove the event listener after first use
        document.removeEventListener('click', enableAudioOnInteraction);
        document.removeEventListener('touchstart', enableAudioOnInteraction);
        document.removeEventListener('keydown', enableAudioOnInteraction);
      };
      
      // Listen for any user interaction
      document.addEventListener('click', enableAudioOnInteraction, { once: true });
      document.addEventListener('touchstart', enableAudioOnInteraction, { once: true });
      document.addEventListener('keydown', enableAudioOnInteraction, { once: true });
    });
  }
  
  startProgressTracking() {
    // Clear any existing interval
    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval);
    }
    
    // Update progress display every 100ms for smooth animation
    this.progressUpdateInterval = setInterval(() => {
      if (this.currentGlobalAudio && !this.isDragging) {
        this.updateProgressDisplay();
      }
    }, 100);
  }
  
  stopProgressTracking() {
    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval);
      this.progressUpdateInterval = null;
    }
  }
  
  stopCurrentGlobalSound() {
    this.stopProgressTracking();
    
    if (this.currentGlobalAudio) {
      this.currentGlobalAudio.pause();
      this.currentGlobalAudio.currentTime = 0;
      this.currentGlobalAudio = null;
    }
    
    this.hideProgressBar();
  }

  getCustomStyles() {
    // For exported projects, return the embedded custom styles
    // This method is needed for compatibility with createHotspots method
    return CUSTOM_STYLES || {
      hotspot: {
        infoButton: {
          backgroundColor: "#4A90E2", // Blue background for i icon
          textColor: "#FFFFFF",
          fontSize: 12, // Larger font for i icon
          opacity: 0.9,
          size: 0.4, // Size of the i icon circle
        },
        popup: {
          backgroundColor: "#333333",
          textColor: "#FFFFFF",
          borderColor: "#555555",
          borderWidth: 0,
          borderRadius: 0,
          opacity: 0.95,
          fontSize: 1,
          padding: 0.2,
        },
        closeButton: {
          size: 0.4,
          opacity: 1.0,
        },
      },
      audio: {
        buttonColor: "#FFFFFF",
        buttonOpacity: 1.0,
      },
      buttonImages: {
        portal: "images/up-arrow.png",
        play: "images/play.png",
        pause: "images/pause.png",
      },
    };
  }
}

// Initialize project
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    new HotspotProject();
  }, 1000);
});