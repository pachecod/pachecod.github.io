// VR Hotspot Project - Standalone Version
// Generated from VR Hotspot Editor

// Custom Styles Configuration
const CUSTOM_STYLES = {
  "hotspot": {
    "infoButton": {
      "backgroundColor": "#4a90e2",
      "textColor": "#ffffff",
      "fontSize": 12,
      "opacity": 0.9,
      "size": 0.4
    },
    "popup": {
      "backgroundColor": "#333333",
      "textColor": "#ffffff",
      "borderColor": "#555555",
      "borderWidth": 0,
      "borderRadius": 0,
      "opacity": 1,
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
  },
  "navigation": {
    "ringColor": "#ffffff",
    "ringOuterRadius": 0.56,
    "ringThickness": 0.056,
    "weblinkRingColor": "#ffffff",
    "labelColor": "#ffffff",
    "labelBackgroundColor": "#000000",
    "labelOpacity": 0.8
  },
  "image": {
    "borderColor": "#ffffff",
    "borderWidth": 0.02,
    "borderRadius": 0.05,
    "opacity": 1
  }
};

// Helper (export build): reuse caching via local map to prevent reprocessing
const EXPORTED_IMAGE_MASK_CACHE = new Map();
const EXPORTED_VIDEO_THUMB_CACHE = new Map();
function applyRoundedMaskToAImage(aImgEl, styleCfg) {
  return new Promise(resolve => {
    try {
      const src = aImgEl.getAttribute('src');
      if (!src) return resolve();
      const key = src + '|' + (styleCfg.borderRadius||0) + '|' + (styleCfg.borderWidth||0) + '|' + (styleCfg.borderColor||'');
      if (aImgEl.dataset.roundedApplied === key) return resolve();
      if (EXPORTED_IMAGE_MASK_CACHE.has(key)) {
        aImgEl.setAttribute('src', EXPORTED_IMAGE_MASK_CACHE.get(key));
        aImgEl.dataset.roundedApplied = key;
        aImgEl.setAttribute('material', (aImgEl.getAttribute('material')||'') + '; transparent:true; shader:flat; alphaTest:0.01; side:double');
        return resolve();
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const w = img.naturalWidth, h = img.naturalHeight;
          if (!w || !h) return resolve();
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          const r = Math.max(0, Math.min(w/2, (styleCfg.borderRadius||0) * w));
          const bw = Math.max(0, (styleCfg.borderWidth||0) * w);
          ctx.beginPath();
          ctx.moveTo(r,0); ctx.lineTo(w-r,0); ctx.quadraticCurveTo(w,0,w,r);
          ctx.lineTo(w,h-r); ctx.quadraticCurveTo(w,h,w-r,h);
          ctx.lineTo(r,h); ctx.quadraticCurveTo(0,h,0,h-r);
          ctx.lineTo(0,r); ctx.quadraticCurveTo(0,0,r,0); ctx.closePath();
          ctx.clip();
          ctx.drawImage(img,0,0,w,h);
          if (bw>0){ ctx.lineWidth = bw*2; ctx.strokeStyle = styleCfg.borderColor||'#FFFFFF'; ctx.stroke(); }
          const newURL = canvas.toDataURL('image/png');
          EXPORTED_IMAGE_MASK_CACHE.set(key, newURL);
          aImgEl.setAttribute('src', newURL);
          aImgEl.dataset.roundedApplied = key;
          aImgEl.setAttribute('material', (aImgEl.getAttribute('material')||'') + '; transparent:true; shader:flat; alphaTest:0.01; side:double');
        } catch(_) { /* ignore */ }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = src;
    } catch(_) { resolve(); }
  });
}

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
    imageSrc: { type: "string", default: "" },
    imageScale: { type: "number", default: 1 },
    imageAspectRatio: { type: "number", default: 0 },
  },

  init: function () {
    const data = this.data;
    const el = this.el;

    // REMOVED: Main element hover animations to prevent conflicts with popup elements

    // Add popup functionality
    if (data.popup) {
      this.createPopup(data);
    }

    // Add audio functionality
    if (data.audio) {
      this.createAudio(data);
    }

    // Static image (non-interactive except face-camera)
    if (data.imageSrc) {
      const img = document.createElement('a-image');
      let _src = data.imageSrc;
      if (_src && _src.includes('%')) { try { _src = decodeURIComponent(_src); } catch(e){} }
      img.setAttribute('src', _src);
  const scl = data.imageScale || 1;
  // Base unit geometry then scale for consistent aspect handling
  const knownAR = (typeof data.imageAspectRatio === 'number' && isFinite(data.imageAspectRatio) && data.imageAspectRatio>0) ? data.imageAspectRatio : 1;
  img.setAttribute('width', 1);
  img.setAttribute('height', knownAR);
  img.setAttribute('scale', scl + ' ' + scl + ' 1');
  img.setAttribute('position', '0 ' + ((knownAR/2) * scl) + ' 0.05');
  if (knownAR !== 1) img.dataset.aspectRatio = String(knownAR);
      img.classList.add('static-image-hotspot');
      if (CUSTOM_STYLES && CUSTOM_STYLES.image) {
        const istyle = CUSTOM_STYLES.image;
        const opacity = (typeof istyle.opacity === 'number') ? istyle.opacity : 1.0;
        img.setAttribute('material', 'opacity:' + opacity + '; transparent:' + (opacity<1?'true':'false') + '; side:double');
        const radius = parseFloat(istyle.borderRadius) || 0;
        if (radius === 0 && istyle.borderWidth > 0) {
          const frame = document.createElement('a-plane');
          frame.classList.add('static-image-border');
          frame.setAttribute('width', (1 * scl) + (istyle.borderWidth*2));
          frame.setAttribute('height', (1 * scl) + (istyle.borderWidth*2));
          frame.setAttribute('position', '0 ' + (0.5*scl) + ' 0.0');
          frame.setAttribute('material', 'shader:flat; color:' + (istyle.borderColor||'#FFFFFF') + '; opacity:' + opacity + '; transparent:' + (opacity<1?'true':'false') + '; side:double');
          this.el.appendChild(frame);
        }
        // If rounding requested, schedule an initial mask attempt even before natural dimension adjustment
        if (radius > 0) {
          // store original src
          if (!img.dataset.originalSrc) img.dataset.originalSrc = img.getAttribute('src');
          setTimeout(()=>{ applyRoundedMaskToAImage(img, istyle).catch(()=>{}); }, 30);
        }
      }
      img.addEventListener('load', () => {
        try {
          const ratio = (img.naturalHeight && img.naturalWidth) ? (img.naturalHeight / img.naturalWidth) : (parseFloat(img.dataset.aspectRatio||'')||1);
          if (ratio && isFinite(ratio) && ratio>0) img.dataset.aspectRatio = String(ratio);
          img.setAttribute('width', 1);
          img.setAttribute('height', ratio);
          img.setAttribute('scale', scl + ' ' + scl + ' 1');
          img.setAttribute('position', '0 ' + ((ratio/2)*scl) + ' 0.05');
          if (CUSTOM_STYLES && CUSTOM_STYLES.image) {
            const istyle = CUSTOM_STYLES.image;
            const opacity = (typeof istyle.opacity === 'number') ? istyle.opacity : 1.0;
            const radius = parseFloat(istyle.borderRadius) || 0;
            if (radius === 0 && istyle.borderWidth > 0) {
              let frame = this.el.querySelector('.static-image-border');
              if (!frame) {
                frame = document.createElement('a-plane');
                frame.classList.add('static-image-border');
                this.el.appendChild(frame);
              }
              const bw = istyle.borderWidth;
              frame.setAttribute('width', (1 * scl) + (bw*2));
              frame.setAttribute('height', (ratio * scl) + (bw*2));
              frame.setAttribute('position', '0 ' + ((ratio/2)*scl) + ' 0.0');
              frame.setAttribute('material', 'shader:flat; color:' + (istyle.borderColor||'#FFFFFF') + '; opacity:' + opacity + '; transparent:' + (opacity<1?'true':'false') + '; side:double');
            } else {
              // Rounded: ensure any square frame removed & apply in-canvas mask + stroke
              this.el.querySelectorAll('.static-image-border').forEach(b=>b.remove());
              if (radius > 0) {
                // Re-apply original src before masking if previously processed
                if (img.dataset.originalSrc) img.setAttribute('src', img.dataset.originalSrc);
                else img.dataset.originalSrc = img.getAttribute('src');
                applyRoundedMaskToAImage(img, istyle).catch(()=>{});
              }
            }
          }
        } catch(e) { /* ignore */ }
      });
      this.el.appendChild(img);
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
    
    // Add hover animations to info icon for better UX
    infoIcon.setAttribute("animation__hover_in", {
      property: "scale",
      to: "1.1 1.1 1",
      dur: 200,
      easing: "easeOutQuad",
      startEvents: "mouseenter",
    });

    infoIcon.setAttribute("animation__hover_out", {
      property: "scale",
      to: "1 1 1",
      dur: 200,
      easing: "easeOutQuad",
      startEvents: "mouseleave",
    });
    
    el.appendChild(infoIcon);

    const popup = document.createElement("a-entity");
    popup.setAttribute("visible", "false");
    popup.setAttribute("position", "0 1.5 0.2"); // Move forward to avoid z-fighting with info icon
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
    text.setAttribute("position", "0 0 0.05"); // Increased z-spacing to prevent z-fighting
    text.setAttribute("align", "center");
    text.setAttribute("width", (data.popupWidth - 0.4).toString()); // Constrain to popup width with padding
    text.setAttribute("font", "roboto");
    popup.appendChild(text);

    const closeButton = document.createElement("a-image");
    closeButton.setAttribute("position", data.popupWidth/2-0.3 + " " + (data.popupHeight/2-0.3) + " 0.1"); // Increased z-spacing
    closeButton.setAttribute("src", "#close");
    closeButton.setAttribute("width", CUSTOM_STYLES.hotspot.closeButton.size.toString());
    closeButton.setAttribute("height", CUSTOM_STYLES.hotspot.closeButton.size.toString());
    closeButton.setAttribute("opacity", CUSTOM_STYLES.hotspot.closeButton.opacity.toString());
    closeButton.classList.add("clickable");
    
    // Add hover animations to close button for better UX
    closeButton.setAttribute("animation__hover_in", {
      property: "scale",
      to: "1.2 1.2 1",
      dur: 200,
      easing: "easeOutQuad",
      startEvents: "mouseenter",
    });

    closeButton.setAttribute("animation__hover_out", {
      property: "scale",
      to: "1 1 1",
      dur: 200,
      easing: "easeOutQuad",
      startEvents: "mouseleave",
    });
    
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
    // Stabilize blob/data audio by routing through <a-assets>
    let aSrc = data.audio;
    if (typeof aSrc === 'string' && (aSrc.startsWith('blob:') || aSrc.startsWith('data:'))) {
      try {
        const assets = document.querySelector('a-assets') || (function(){
          const scn = document.querySelector('a-scene') || document.querySelector('scene, a-scene');
          const a = document.createElement('a-assets');
          if (scn) scn.insertBefore(a, scn.firstChild);
          return a;
        })();
  const assetId = "audio_rt_" + (el.id || ("el_" + Math.random().toString(36).slice(2)));
  let assetEl = assets.querySelector("#" + assetId);
        if (!assetEl) {
          assetEl = document.createElement('audio');
          assetEl.setAttribute('id', assetId);
          assetEl.setAttribute('crossorigin', 'anonymous');
          assets.appendChild(assetEl);
        }
        assetEl.setAttribute('src', aSrc);
  aSrc = "#" + assetId;
      } catch(_) { /* ignore, fallback to direct src */ }
    }
    audioEl.setAttribute("src", aSrc);
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
    btn.setAttribute("position", "0 0 0.02");
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
    this.currentScene = 'scene1';
    this.globalSoundEnabled = true;
    this.currentGlobalAudio = null;
    this.isDragging = false;
    this.progressUpdateInterval = null;
  this.crossfadeEl = null; // overlay for crossfade
  this.weblinkOverlay = null;
  this.weblinkFrame = null;
  this.wasInVRBeforeWeblink = false;
    this.loadProject();
  }

  async _ensureVideoPreviewExport(sceneId){
    try {
      if (EXPORTED_VIDEO_THUMB_CACHE.has(sceneId)) return EXPORTED_VIDEO_THUMB_CACHE.get(sceneId);
      const sc = this.scenes[sceneId];
      if (!sc || sc.type !== 'video' || !sc.videoSrc) return null;
      const vid = document.createElement('video');
      vid.preload = 'metadata';
      vid.muted = true;
      vid.playsInline = true;
      vid.crossOrigin = '';
      const run = new Promise((resolve) => {
        let settled = false;
        const cleanup = () => { try { vid.src = ''; vid.load && vid.load(); } catch(_) {} };
        vid.addEventListener('loadedmetadata', () => {
          try {
            const target = Math.min(1, (vid.duration || 1) * 0.1);
            const onSeeked = () => {
              try {
                const w = 512;
                const ratio = (vid.videoHeight || 1) / (vid.videoWidth || 1);
                const h = Math.max(1, Math.round(w * ratio));
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(vid, 0, 0, w, h);
                const url = canvas.toDataURL('image/png');
                EXPORTED_VIDEO_THUMB_CACHE.set(sceneId, url);
                settled = true;
                resolve(url);
              } catch(_) { resolve(null); }
              cleanup();
            };
            try { vid.currentTime = isFinite(target) ? target : 0.1; } catch(_) { vid.currentTime = 0.1; }
            vid.addEventListener('seeked', onSeeked, { once: true });
          } catch(_) { resolve(null); cleanup(); }
        }, { once: true });
        vid.addEventListener('error', () => { if (!settled) resolve(null); cleanup(); }, { once: true });
      });
      vid.src = sc.videoSrc;
      return await run;
    } catch(_) { return null; }
  }

  async loadProject() {
    try {
      const response = await fetch('./config.json');
      const config = await response.json();
      
      console.log('Loaded config:', config);
      
      if (config.scenes) {
        // New format with scenes
        this.scenes = config.scenes;
        this.currentScene = config.currentScene || 'scene1';
        console.log('Using new format with scenes:', this.scenes);
        this.setupScenes();
      } else if (config.hotspots) {
        // Legacy format - single scene
        this.scenes = {
          'scene1': {
            name: 'Scene 1',
            image: './images/scene1.jpg',
            hotspots: config.hotspots
          }
        };
        this.currentScene = 'scene1';
        console.log('Using legacy format, created single scene');
        this.setupScenes();
      }
    } catch (error) {
      console.warn('No config.json found, using empty project');
      this.scenes = {
        'scene1': {
          name: 'Scene 1', 
          image: './images/scene1.jpg',
          hotspots: []
        }
      };
      this.setupScenes();
    }
  }

  setupScenes() {
    // Setup global sound control first
    this.setupGlobalSoundControl();

    // Show loading UI and preload all scene images so nav previews/skyboxes are instant
    this.showLoadingIndicator();
    this.preloadAllSceneImages({ updateUI: true, timeoutMs: 20000 })
      .catch(() => {})
      .finally(() => {
        this.loadScene(this.currentScene);
      });
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

    // Check if this is a video scene
    if (scene.type === 'video' && scene.videoSrc) {
      // Handle video scene
      this.loadVideoScene(sceneId, scene, skybox);
      return;
    }

    // Ensure any existing videosphere is removed when switching to an image scene
    const existingVideosphere = document.getElementById('current-videosphere');
    if (existingVideosphere && existingVideosphere.parentNode) {
      existingVideosphere.parentNode.removeChild(existingVideosphere);
    }
    // Hide and reset video controls/state for image scenes
    this.hideVideoControls();

    // (runtime) no editor hotspot list or id counter to manage
    
    // Prefer preloaded asset if available for instant swap
    const preloadedId = 'asset-panorama-' + sceneId;
    const preImg = document.getElementById(preloadedId);
    
    // Update scene image (fallback path)
    const imagePath = this.getSceneImagePath(scene.image, sceneId);
  console.log('Setting panorama src to: ' + (preImg ? ('#' + preloadedId) : imagePath));
    
    if (preImg) {
      // Use the preloaded asset without network load
      skybox.setAttribute('visible', 'false');
      setTimeout(() => {
        skybox.setAttribute('src', '#' + preloadedId);
        const loadingEnvironment = document.getElementById('loading-environment');
        if (loadingEnvironment) {
          loadingEnvironment.setAttribute('visible', 'false');
        }
        skybox.setAttribute('visible', 'true');
        
  // (runtime) do not persist scenes to localStorage

        console.log('Skybox texture updated from preloaded asset:', preloadedId);
        
        // Create hotspots after skybox is updated
        const container = document.getElementById('hotspot-container');
        container.innerHTML = '';
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
        
        // Hide video controls for image scenes
        this.hideVideoControls();
      }, 100);
      
      this.currentScene = sceneId;
      return;
    }
    
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
        
        // Hide loading environment and show the actual scene
        const loadingEnvironment = document.getElementById('loading-environment');
        if (loadingEnvironment) {
          loadingEnvironment.setAttribute('visible', 'false');
        }
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
          
          // Play global sound for this scene
          setTimeout(() => {
            this.playCurrentGlobalSound();
          }, 500);
        }, 100);
        
        // Notify listeners that the scene finished loading (for transitions)
        try { const ev = new CustomEvent('vrhotspots:scene-loaded'); window.dispatchEvent(ev); } catch(e) {}

        // Hide the loading indicator
        this.hideLoadingIndicator();
        
        // Hide video controls for image scenes
        this.hideVideoControls();
      }, 100);
    };
    
    // Handle load errors
    preloadImage.onerror = () => {
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
      this.hideLoadingIndicator();
    };
    
    // Start loading the image
    preloadImage.src = imagePathWithCache;
    
    // We've replaced this with the preloadImage.onerror handler above
    
    this.currentScene = sceneId;
  }

  loadVideoScene(sceneId, scene, skybox) {
    console.log('Loading video scene:', sceneId, scene.videoSrc);
    
    // Hide skybox, we'll use videosphere instead
    skybox.setAttribute('visible', 'false');
    
    // Remove any existing videosphere
    const existingVideosphere = document.getElementById('current-videosphere');
    if (existingVideosphere) {
      existingVideosphere.parentNode.removeChild(existingVideosphere);
    }
    
    // Get or create video element
    let videoEl = document.getElementById('scene-video-dynamic');
    if (!videoEl) {
      console.warn('Video element not found in assets');
      this.hideLoadingIndicator();
      return;
    }
    
    // Set video source
    videoEl.src = scene.videoSrc;
    videoEl.volume = scene.videoVolume !== undefined ? scene.videoVolume : 0.5;
    videoEl.loop = true;
    videoEl.muted = true; // Start muted for autoplay
    
    // Create videosphere element
  const videosphere = document.createElement('a-videosphere');
    videosphere.id = 'current-videosphere';
    videosphere.setAttribute('src', '#scene-video-dynamic');
  // Align videosphere yaw with expected orientation (match editor behavior)
  videosphere.setAttribute('rotation', '0 -90 0');
    
    // Add to scene
    const aScene = document.querySelector('a-scene');
    aScene.appendChild(videosphere);
    
    // Wait for video to be ready
    const onVideoReady = () => {
      console.log('Video ready to play');
      
      videoEl.play().then(() => {
        console.log('Video playing');
        
        // Hide loading environment
        const loadingEnvironment = document.getElementById('loading-environment');
        if (loadingEnvironment) {
          loadingEnvironment.setAttribute('visible', 'false');
        }
        
        // Create hotspots
        const container = document.getElementById('hotspot-container');
        container.innerHTML = '';
        this.createHotspots(scene.hotspots);
        
        // Apply starting point
        setTimeout(() => {
          this.applyStartingPoint(scene);
          
          // Play global sound for this scene
          setTimeout(() => {
            this.playCurrentGlobalSound();
          }, 500);
        }, 100);
        
        // Notify scene loaded
        try { 
          const ev = new CustomEvent('vrhotspots:scene-loaded'); 
          window.dispatchEvent(ev); 
        } catch(e) {}
        
        // Setup video controls
        this.updateVideoControls();
        
        // Hide loading indicator
        this.hideLoadingIndicator();
      }).catch(err => {
        console.error('Error playing video:', err);
        this.hideLoadingIndicator();
      });
    };
    
    if (videoEl.readyState >= 2) {
      onVideoReady();
    } else {
      videoEl.addEventListener('loadeddata', onVideoReady, { once: true });
    }
    
    this.currentScene = sceneId;
  }

  updateVideoControls() {
    const videoEl = document.getElementById('scene-video-dynamic');
    const videoControls = document.getElementById('video-controls');
    const playPauseBtn = document.getElementById('video-play-pause');
    const muteBtn = document.getElementById('video-mute');
    const progressBar = document.getElementById('video-progress');
    const volumeSlider = document.getElementById('video-volume');
    // HTML uses video-time-current and video-time-total; support both IDs for robustness
    const currentTimeSpan = document.getElementById('video-time-current') || document.getElementById('video-current-time');
    const durationSpan = document.getElementById('video-time-total') || document.getElementById('video-duration');
    
    if (!videoEl || !videoControls) return;
    
    // Show video controls
    videoControls.style.display = 'block';
    
    // Play/Pause button
    if (playPauseBtn) {
      playPauseBtn.onclick = () => {
        if (videoEl.paused) {
          videoEl.play();
          playPauseBtn.textContent = '⏸';
        } else {
          videoEl.pause();
          playPauseBtn.textContent = '▶';
        }
      };
    }
    
    // Mute button
    if (muteBtn) {
      muteBtn.onclick = () => {
        videoEl.muted = !videoEl.muted;
        muteBtn.textContent = videoEl.muted ? '🔇' : '🔊';
      };
      muteBtn.textContent = videoEl.muted ? '🔇' : '🔊';
    }
    
    // Progress bar
    if (progressBar) {
      videoEl.addEventListener('timeupdate', () => {
        if (videoEl.duration) {
          const progress = (videoEl.currentTime / videoEl.duration) * 100;
          progressBar.value = progress;
          
          if (currentTimeSpan) {
            currentTimeSpan.textContent = this.formatTime(videoEl.currentTime);
          }
        }
      });
      
      progressBar.addEventListener('input', (e) => {
        const time = (e.target.value / 100) * videoEl.duration;
        videoEl.currentTime = time;
      });
    }
    
    // Volume slider
    if (volumeSlider) {
      volumeSlider.value = videoEl.volume * 100;
      volumeSlider.addEventListener('input', (e) => {
        videoEl.volume = e.target.value / 100;
        if (videoEl.volume > 0) {
          videoEl.muted = false;
          if (muteBtn) muteBtn.textContent = '🔊';
        }
      });
    }
    
    // Duration display
    if (durationSpan) {
      const updateDuration = () => {
        if (videoEl.duration) {
          durationSpan.textContent = this.formatTime(videoEl.duration);
        }
      };
      if (videoEl.duration) {
        updateDuration();
      } else {
        videoEl.addEventListener('loadedmetadata', updateDuration, { once: true });
      }
    }
  }
  hideVideoControls() {
    const videoControls = document.getElementById('video-controls');
    if (videoControls) {
      videoControls.style.display = 'none';
    }
    
    // Pause and reset video
    const videoEl = document.getElementById('scene-video-dynamic');
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0;
    }
  }

  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
  let collider = null;
  let ring = null;
      if (hotspot.type === 'navigation' || hotspot.type === 'weblink') {
        hotspotEl = document.createElement('a-entity');
        hotspotEl.setAttribute('face-camera', '');

        // Transparent circle collider for interactions
  collider = document.createElement('a-entity');
        const navStyles = (typeof CUSTOM_STYLES !== 'undefined' && CUSTOM_STYLES.navigation) ? CUSTOM_STYLES.navigation : {};
        const ringOuter = (typeof navStyles.ringOuterRadius === 'number') ? navStyles.ringOuterRadius : 0.6;
  const ringThickness = (typeof navStyles.ringThickness === 'number') ? navStyles.ringThickness : 0.02;
        const ringInner = Math.max(0.001, ringOuter - ringThickness);
        const ringColor = (hotspot.type === 'weblink') ? (navStyles.weblinkRingColor || '#001f5b') : (navStyles.ringColor || 'rgb(0, 85, 0)');
  collider.setAttribute('geometry', 'primitive: circle; radius: ' + ringOuter);
  // Prevent invisible collider from occluding preview due to depth writes
  collider.setAttribute('material', 'opacity: 0; transparent: true; depthWrite: false; side: double');
        collider.classList.add('clickable');
        hotspotEl.appendChild(collider);

  // Thin green border ring (~3px) with transparent center
  ring = document.createElement('a-entity');
  ring.setAttribute('geometry', 'primitive: ring; radiusInner: ' + ringInner + '; radiusOuter: ' + ringOuter);
  ring.setAttribute('material', 'color: ' + ringColor + '; opacity: 1; transparent: true; shader: flat');
  // Bring the ring much closer to the camera so it renders in front of audio/text hotspots
  ring.setAttribute('position', '0 0 0.15');
  ring.classList.add('nav-ring');
  hotspotEl.appendChild(ring);

  // Inline preview circle (hidden by default), shows destination scene image inside the ring
  const preview = document.createElement('a-entity');
  preview.setAttribute('geometry', 'primitive: circle; radius: ' + ringInner);
  preview.setAttribute('material', 'transparent: true; opacity: 1; shader: flat; side: double; alphaTest: 0.01');
  preview.setAttribute('visible', 'false');
  // Keep preview just behind the ring but still well in front of other UI
  preview.setAttribute('position', '0 0 0.14');
  preview.setAttribute('scale', '0.01 0.01 0.01');
  preview.classList.add('nav-preview-circle');
  hotspotEl.appendChild(preview);

  // If this is a weblink with a configured preview, set the texture immediately so the image object exists from the start
  if (hotspot.type === 'weblink') {
    try {
      let src = null;
      if (typeof hotspot.weblinkPreview === 'string' && hotspot.weblinkPreview) src = hotspot.weblinkPreview;
      if (src) {
        console.log('[Weblink][Create][Export]', { id: hotspot.id, srcType: src.startsWith('data:') ? 'dataURL' : 'url', len: src.length });
        preview.setAttribute('material', 'src', src);
        preview.setAttribute('material', 'transparent', true);
        preview.setAttribute('material', 'opacity', 1);
        preview.setAttribute('material', 'shader', 'flat');
        preview.setAttribute('material', 'side', 'double');
        preview.setAttribute('material', 'alphaTest', 0.01);
      }
    } catch(err) { console.warn('[Weblink][Create][Export] failed to set preview', err); }
  }

    // Hover title label above the ring
    const labelGroup = document.createElement('a-entity');
    labelGroup.setAttribute('visible', 'false');
    labelGroup.classList.add('nav-label');
  const labelY = ringOuter + 0.35;
  // Push the label well forward so it clearly appears in front of audio/text hotspots
  labelGroup.setAttribute('position', '0 ' + labelY + ' 0.3');
    const labelBg = document.createElement('a-plane');
    labelBg.setAttribute('width', '1.8');
    labelBg.setAttribute('height', '0.35');
  const lblBG = (navStyles && navStyles.labelBackgroundColor) || '#000';
  const lblOP = (typeof navStyles.labelOpacity === 'number') ? navStyles.labelOpacity : 0.8;
  labelBg.setAttribute('material', 'shader:flat; color: ' + lblBG + '; opacity: ' + lblOP + '; transparent: true');
    labelBg.setAttribute('position', '0 0 0');
    const labelText = document.createElement('a-text');
    labelText.setAttribute('value', '');
    labelText.setAttribute('align', 'center');
  const lblColor = (navStyles && navStyles.labelColor) || '#fff';
  labelText.setAttribute('color', lblColor);
  labelText.setAttribute('width', '5');
    labelText.setAttribute('position', '0 0 0.01');
    labelGroup.appendChild(labelBg);
    labelGroup.appendChild(labelText);
    hotspotEl.appendChild(labelGroup);
      } else {
        // Non-navigation hotspot container without an invisible plane.
        // This prevents an invisible quad from blocking interaction or depth in front of portals.
        hotspotEl = document.createElement('a-entity');
        hotspotEl.setAttribute('face-camera', '');
      }
      hotspotEl.setAttribute('position', hotspot.position);
      // Only navigation/weblink parents may be clickable; non-navigation hotspots rely on child elements
      // (info icon, close button, audio button) which are explicitly marked as .clickable.
      if (hotspot.type === 'navigation' || hotspot.type === 'weblink') {
        hotspotEl.setAttribute('class', 'clickable');
      }
      
      let config = "type:" + hotspot.type;
      
        if (hotspot.type === 'text' || hotspot.type === 'text-audio') {
        const pw = (typeof hotspot.popupWidth === 'number') ? hotspot.popupWidth : 4;
        const ph = (typeof hotspot.popupHeight === 'number') ? hotspot.popupHeight : 2.5;
        config += ";popup:" + hotspot.text + ";popupWidth:" + pw + ";popupHeight:" + ph + ";popupColor:#333333";
      }
      
      if (hotspot.type === 'audio' || hotspot.type === 'text-audio') {
        // Use custom audio URL if available, otherwise use default
        const audioSrc = hotspot.audio || "#default-audio";
        config += ";audio:" + audioSrc;
      }
      
      if (hotspot.type === 'navigation' || hotspot.type === 'weblink') {
        if (hotspot.type === 'navigation') {
          config += ";navigation:" + hotspot.navigationTarget;
        }
        // Add click handler on the collider area
        const previewEl = hotspotEl.querySelector('.nav-preview-circle');
        const labelEl = hotspotEl.querySelector('.nav-label');
  let lastActivation = 0;
  const activationEvents = ['click', 'triggerdown', 'triggerup', 'mouseup', 'touchend', 'mousedown', 'pointerdown', 'pointerup'];

        const handleActivation = (e) => {
          if (e) {
            const type = e.type || '';
            if (!activationEvents.includes(type)) {
              return;
            }
            e.stopPropagation();
            if (e.preventDefault) e.preventDefault();
          }
          const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
          if (now - lastActivation < 250) return;
          lastActivation = now;

          if (hotspot.type === 'navigation') {
            this.navigateToScene(hotspot.navigationTarget);
          } else if (hotspot.type === 'weblink') {
            const url = hotspot.weblinkUrl || '';
            if (url) {
              try {
                this.showWeblinkOverlay(url, hotspot.weblinkTitle || 'External Resource');
              } catch (_) {
                const win = window.open(url, '_blank', 'noopener,noreferrer');
                if (!win) window.location.href = url;
              }
            }
          }
        };

        const handleEnter = () => {
          if (previewEl) {
            let src = null;
            if (hotspot.type === 'navigation') {
              src = this._getExportPreviewSrc(hotspot.navigationTarget);
            } else if (hotspot.type === 'weblink') {
              if (typeof hotspot.weblinkPreview === 'string' && hotspot.weblinkPreview) src = hotspot.weblinkPreview;
            }
            if (src === 'VIDEO_ICON' && hotspot.type === 'navigation') {
              try {
                this._ensureVideoPreviewExport(hotspot.navigationTarget).then((thumb) => {
                  if (thumb && previewEl) {
                    previewEl.setAttribute('material', 'src', thumb);
                    previewEl.setAttribute('material', 'transparent', true);
                    previewEl.setAttribute('material', 'opacity', 1);
                    previewEl.setAttribute('material', 'shader', 'flat');
                    previewEl.setAttribute('material', 'side', 'double');
                    previewEl.setAttribute('material', 'alphaTest', 0.01);
                  } else {
                    previewEl.setAttribute('material', 'color', '#000');
                    previewEl.setAttribute('material', 'transparent', true);
                    previewEl.setAttribute('material', 'opacity', 0.15);
                    previewEl.setAttribute('material', 'shader', 'flat');
                    previewEl.setAttribute('material', 'side', 'double');
                  }
                });
              } catch(_) {}
            } else if (src) {
              console.log('[Preview][Hover][Export]', { id: hotspot.id, type: hotspot.type, srcType: src.startsWith('data:') ? 'dataURL' : 'url', len: src.length });
              previewEl.setAttribute('material', 'src', src);
              previewEl.setAttribute('material', 'transparent', true);
              previewEl.setAttribute('material', 'opacity', 1);
              previewEl.setAttribute('material', 'shader', 'flat');
              previewEl.setAttribute('material', 'side', 'double');
              previewEl.setAttribute('material', 'alphaTest', 0.01);
            } else if (hotspot.type === 'weblink') {
              previewEl.setAttribute('material', 'color', '#000');
              previewEl.setAttribute('material', 'transparent', true);
              previewEl.setAttribute('material', 'opacity', 0.15);
              previewEl.setAttribute('material', 'shader', 'flat');
              previewEl.setAttribute('material', 'side', 'double');
            }
            previewEl.setAttribute('visible', 'true');
            previewEl.removeAttribute('animation__shrink');
            previewEl.setAttribute('scale', '0.01 0.01 0.01');
            previewEl.setAttribute('animation__grow', { property: 'scale', to: '1 1 1', dur: 180, easing: 'easeOutCubic' });
            try { console.log('[Preview][MaterialAfterSet][Export]', previewEl.getAttribute('material')); } catch (_) {}
          }
          try {
            const label = labelEl;
            const txt = label && label.querySelector('a-text');
            if (label && txt) {
              if (hotspot.type === 'navigation') {
                const sc = this.scenes[hotspot.navigationTarget];
                txt.setAttribute('value', 'Portal to ' + (sc?.name || hotspot.navigationTarget));
              } else if (hotspot.type === 'weblink') {
                const title = (hotspot.weblinkTitle && hotspot.weblinkTitle.trim()) ? hotspot.weblinkTitle.trim() : 'Open Link';
                txt.setAttribute('value', title);
              }
              try {
                const bg = label.querySelector('a-plane');
                const minW = 1.7;
                const maxW = 10;
                const tW = parseFloat(txt.getAttribute('width') || '0') || minW;
                const val = (txt.getAttribute('value') || '').toString();
                const spaces = (val.match(/s/g) || []).length;
                const letters = Math.max(0, val.length - spaces);
                const effChars = letters + 0.4 * spaces;
                const est = 0.095 * effChars + 0.25;
                const nextW = Math.min(maxW, Math.max(minW, Math.min(tW, est)));
                if (bg) bg.setAttribute('width', String(nextW));
              } catch (_) {}
              label.setAttribute('visible', 'true');
            }
          } catch (_) {}
        };

        const handleLeave = () => {
          if (previewEl) {
            previewEl.removeAttribute('animation__grow');
            previewEl.setAttribute('animation__shrink', { property: 'scale', to: '0.01 0.01 0.01', dur: 120, easing: 'easeInCubic' });
            setTimeout(() => { previewEl.setAttribute('visible', 'false'); }, 130);
          }
          try {
            const label = labelEl;
            if (label) {
              label.setAttribute('visible', 'false');
              const bg = label.querySelector('a-plane');
              if (bg) bg.setAttribute('width', '1.8');
            }
          } catch (_) {}
        };

        const registerTarget = (element) => {
          if (!element) return;
          element.classList.add('clickable');
          activationEvents.forEach((evt) => {
            element.addEventListener(evt, handleActivation);
          });
          element.addEventListener('mouseenter', handleEnter);
          element.addEventListener('mouseleave', handleLeave);
        };

  registerTarget(hotspotEl);
  if (collider) registerTarget(collider);
  if (ring) registerTarget(ring);
        
        // Optional: subtle pulsing ring effect (guard if ring exists)
        const ringEl = hotspotEl.querySelector('.nav-ring');
        if (ringEl) ringEl.setAttribute('animation__pulse', {
          property: 'scale',
          from: '1 1 1',
          to: '1.03 1.03 1',
          dur: 1200,
          dir: 'alternate',
          loop: true,
          easing: 'easeInOutSine'
        });
      }
      if (hotspot.type === 'image') {
        const scale = (typeof hotspot.imageScale === 'number') ? hotspot.imageScale : (typeof hotspot.imageWidth === 'number' ? hotspot.imageWidth : 1);
        let src = (typeof hotspot.image === 'string' && !hotspot.image.startsWith('FILE:')) ? hotspot.image : '';
        if (src && src.includes(';')) src = encodeURIComponent(src);
        config += ';imageSrc:' + src + ';imageScale:' + scale;
        const ar = (typeof hotspot.imageAspectRatio === 'number' && isFinite(hotspot.imageAspectRatio) && hotspot.imageAspectRatio>0) ? hotspot.imageAspectRatio : ((typeof hotspot._aspectRatio === 'number' && isFinite(hotspot._aspectRatio) && hotspot._aspectRatio>0) ? hotspot._aspectRatio : 0);
        if (ar && ar > 0) config += ';imageAspectRatio:' + ar;
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
    
  // Stop current global sound before switching
    this.stopCurrentGlobalSound();
    
    // Show navigation feedback
    this.showNavigationFeedback(this.scenes[sceneId].name);

    const runSceneSwitch = () => {
      if (runSceneSwitch.__executed) {
        return;
      }
      runSceneSwitch.__executed = true;

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
    };

    // Crossfade transition into next scene
    this._startCrossfadeOverlay(runSceneSwitch);

    // Fallback: ensure we still switch scenes if the overlay callback never fires (Quest safety)
    setTimeout(() => {
      if (!runSceneSwitch.__executed) {
        runSceneSwitch();
      }
    }, 700);
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
  subtitle.id = 'scene-loading-subtitle';
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

  // Preload all scenes' images into <a-assets> so skybox changes and portal previews are instant
  preloadAllSceneImages(options = {}) {
    const { updateUI = false, timeoutMs = 15000 } = options;
    const assets = document.querySelector('a-assets');
    if (!assets) return Promise.resolve();

    const ids = Object.keys(this.scenes || {});
    const total = ids.length;
    if (total === 0) return Promise.resolve();

    const updateSubtitle = (done) => {
      if (!updateUI) return;
      const subEl = document.getElementById('scene-loading-subtitle');
      if (subEl) subEl.textContent = 'Preparing scenes (' + done + '/' + total + ')';
    };

    let done = 0;
    updateSubtitle(0);

    const loaders = ids.map((id) => {
      const sc = this.scenes[id];
      // Skip video scenes — they don't need preloaded image assets and would mislead preview logic
      if (sc && sc.type === 'video') {
        done++;
        updateSubtitle(done);
        return Promise.resolve();
      }
      const src = this.getSceneImagePath(sc.image, id);
      const assetId = 'asset-panorama-' + id;
      if (document.getElementById(assetId)) { done++; updateSubtitle(done); return Promise.resolve(); }
      return new Promise((resolve) => {
        const img = document.createElement('img');
        img.id = assetId;
        img.crossOrigin = 'anonymous';
        img.addEventListener('load', () => { done++; updateSubtitle(done); resolve(); });
        img.addEventListener('error', () => { done++; updateSubtitle(done); resolve(); });
        img.src = src; // allow browser cache
        assets.appendChild(img);
      });
    });

    const timeout = new Promise((resolve) => setTimeout(resolve, timeoutMs));
    return Promise.race([Promise.allSettled(loaders), timeout]);
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
    // Check scene type first: video scenes should use VIDEO_ICON path (triggers thumbnail generation)
    const sc = this.scenes[sceneId]; if (!sc) return null;
    if (sc.type === 'video') return 'VIDEO_ICON';
    // For image scenes, prefer preloaded <a-assets> image if available
    const preId = 'asset-panorama-' + sceneId;
    const preEl = document.getElementById(preId);
    if (preEl) return '#' + preId;
    const img = sc.image||'';
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
  const src = this._getExportPreviewSrc(sceneId);
  if (src === 'VIDEO_ICON') {
    try {
      this._ensureVideoPreviewExport(sceneId).then((thumb) => {
        if (thumb) {
          img.src = thumb;
        } else {
          const svg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="128" height="128"><rect rx="4" ry="4" x="2" y="6" width="14" height="12" fill="#111" stroke="#2ae" stroke-width="2"/><polygon points="16,10 22,7 22,17 16,14" fill="#2ae"/></svg>');
          img.src = 'data:image/svg+xml;charset=UTF-8,' + svg;
        }
      });
    } catch(_) {}
  } else if (src) {
    img.src = src;
  }
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

  _ensureWeblinkOverlay() {
    if (this.weblinkOverlay && this.weblinkOverlay.isConnected) {
      return this.weblinkOverlay;
    }

    const overlay = document.createElement('div');
    overlay.id = 'weblink-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,25,0.92);display:none;z-index:100010;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(6px);';

    const dialog = document.createElement('div');
    dialog.style.cssText = 'background:#101627;border-radius:12px;box-shadow:0 18px 40px rgba(0,0,0,0.45);max-width:1100px;width:100%;max-height:80vh;height:100%;display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(64,179,255,0.25);';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:rgba(9,22,40,0.85);color:#e8f6ff;font-family:Arial, sans-serif;font-size:16px;font-weight:bold;border-bottom:1px solid rgba(64,179,255,0.25);';
    const titleEl = document.createElement('span');
    titleEl.dataset.role = 'weblink-title';
    titleEl.textContent = 'External Resource';
    header.appendChild(titleEl);

    const headerButtons = document.createElement('div');
    headerButtons.style.cssText = 'display:flex;gap:10px;';

    const openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.textContent = 'Open in New Window';
    openBtn.style.cssText = 'background:#2a7fff;color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:13px;cursor:pointer;font-family:Arial, sans-serif;';
    headerButtons.appendChild(openBtn);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = 'background:#233047;color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:13px;cursor:pointer;font-family:Arial, sans-serif;';
    headerButtons.appendChild(closeBtn);

    header.appendChild(headerButtons);
    dialog.appendChild(header);

    const frameWrapper = document.createElement('div');
    frameWrapper.style.cssText = 'flex:1;position:relative;background:#000;';
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;height:100%;border:0;';
    iframe.allow = 'accelerometer; gyroscope; autoplay; clipboard-write; encrypted-media; picture-in-picture;';
    iframe.setAttribute('referrerpolicy', 'no-referrer');
    frameWrapper.appendChild(iframe);
    dialog.appendChild(frameWrapper);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        this.hideWeblinkOverlay();
      }
    });
    closeBtn.addEventListener('click', () => this.hideWeblinkOverlay());
    openBtn.addEventListener('click', () => {
      if (this.weblinkFrame && this.weblinkFrame.dataset.src) {
        const targetUrl = this.weblinkFrame.dataset.src;
        let popup = null;
        try {
          popup = window.open(targetUrl, '_blank', 'noopener,noreferrer');
        } catch (_) {}
        if (popup) {
          try {
            popup.opener = null;
          } catch (_) {}
          this.hideWeblinkOverlay();
        }
      }
    });

    this.weblinkOverlay = overlay;
    this.weblinkFrame = iframe;
    overlay._titleEl = titleEl;
    return overlay;
  }

  showWeblinkOverlay(url, title) {
    if (!url) return;

    const overlay = this._ensureWeblinkOverlay();
    if (!overlay || !this.weblinkFrame) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (overlay._titleEl) {
      overlay._titleEl.textContent = title && title.trim() ? title.trim() : url;
    }

    this.wasInVRBeforeWeblink = false;
    const scene = document.querySelector('a-scene');
    if (scene && scene.is && scene.is('vr-mode') && typeof scene.exitVR === 'function') {
      try {
        scene.exitVR();
        this.wasInVRBeforeWeblink = true;
      } catch (_) {}
    }

    this.weblinkFrame.dataset.src = url;
    this.weblinkFrame.src = url;
    overlay.style.display = 'flex';
  }

  hideWeblinkOverlay() {
    if (!this.weblinkOverlay || !this.weblinkFrame) return;
    this.weblinkOverlay.style.display = 'none';
    delete this.weblinkFrame.dataset.src;
    this.weblinkFrame.src = 'about:blank';

    if (this.wasInVRBeforeWeblink) {
      const scene = document.querySelector('a-scene');
      if (scene && typeof scene.enterVR === 'function') {
        try {
          setTimeout(() => {
            try { scene.enterVR(); } catch (_) {}
          }, 300);
        } catch (_) {}
      }
      this.wasInVRBeforeWeblink = false;
    }
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
      setTimeout(() => {
        try { run && run(); } catch(e) {}
      }, 320);
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
    // Clamp pitch (X) to avoid exact -90/90 which often locks device-orientation
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    // allow a safety margin from full vertical
    const safeX = clamp(Number(rotation.x) || 0, -85, 85);
    const safeY = Number(rotation.y) || 0;
    const safeZ = Number(rotation.z) || 0;

    // Temporarily disable look-controls to allow rotation setting
    const lookControls = camera && camera.components ? camera.components['look-controls'] : null;
    try {
      if (lookControls && typeof lookControls.pause === 'function') lookControls.pause();

      // Apply the stored (clamped) rotation to the camera entity
  camera.setAttribute('rotation', String(safeX) + ' ' + String(safeY) + ' ' + String(safeZ));

      // Try to sync internal look-controls state where possible (robust to missing internals)
      if (lookControls) {
        try {
          if (lookControls.pitchObject && lookControls.pitchObject.rotation)
            lookControls.pitchObject.rotation.x = THREE.MathUtils.degToRad(safeX);
          if (lookControls.yawObject && lookControls.yawObject.rotation)
            lookControls.yawObject.rotation.y = THREE.MathUtils.degToRad(safeY);
        } catch (innerErr) {
          // Non-fatal: some look-controls implementations on certain devices may not expose these
          console.warn('[applyStartingPoint] could not set look-controls internal rotation', innerErr);
        }
      }
    } finally {
      // Ensure look-controls is re-enabled even if something above failed
      if (lookControls && typeof lookControls.play === 'function') {
        setTimeout(() => {
          try { lookControls.play(); } catch (_) {}
        }, 100);
      }
    }

  console.log('Applied starting point rotation: X:' + safeX + '° Y:' + safeY + '° Z:' + safeZ + '°');
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
        play: "images/play.png",
        pause: "images/pause.png",
      },
    };
  }
}

// Initialize project
const MOTION_PERMISSION_STATE = {
  requested: false,
  granted: false
};

function setMotionBannerVisibility(visible) {
  const banner = document.getElementById('motion-permission-banner');
  if (!banner) return;
  if (visible) {
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }
}

function enableMagicWindowTracking() {
  const cameraEl = document.getElementById('cam');
  if (!cameraEl) return;

  const currentAttr = cameraEl.getAttribute('look-controls') || '';
  if (!/magicWindowTrackingEnabled:\s*true/i.test(currentAttr)) {
    cameraEl.setAttribute('look-controls', 'magicWindowTrackingEnabled: true; touchEnabled: true');
  }

  const lookControls = cameraEl.components && cameraEl.components['look-controls'];
  if (lookControls) {
    try {
      if (lookControls.data) {
        lookControls.data.magicWindowTrackingEnabled = true;
      }
      lookControls.magicWindowEnabled = true;
      lookControls.enabled = true;
      if (typeof lookControls.play === 'function') {
        lookControls.play();
      }
    } catch (err) {
      console.warn('[motion-permission] Failed to fully enable look-controls', err);
    }
  }
}

function setupDeviceOrientationPermissionWorkflow() {
  const requiresExplicitPermission =
    typeof window.DeviceOrientationEvent !== 'undefined' &&
    typeof window.DeviceOrientationEvent.requestPermission === 'function';

  const motionButton = document.getElementById('motion-permission-button');
  const sceneEl = document.getElementById('main-scene');

  const markGranted = () => {
    MOTION_PERMISSION_STATE.granted = true;
    setMotionBannerVisibility(false);
    enableMagicWindowTracking();
  };

  const gestureEvents = ['touchend', 'click'];
  const gestureHandler = () => requestPermission();

  const cleanupGestureListeners = () => {
    gestureEvents.forEach(evt => {
      window.removeEventListener(evt, gestureHandler);
    });
  };

  const requestPermission = () => {
    if (MOTION_PERMISSION_STATE.granted) {
      cleanupGestureListeners();
      return;
    }
    if (MOTION_PERMISSION_STATE.requested) return;
    MOTION_PERMISSION_STATE.requested = true;

    if (!requiresExplicitPermission) {
      markGranted();
      cleanupGestureListeners();
      return;
    }

    window.DeviceOrientationEvent.requestPermission()
      .then(state => {
        if (state === 'granted') {
          markGranted();
        } else {
          MOTION_PERMISSION_STATE.requested = false;
          setMotionBannerVisibility(true);
        }
      })
      .catch(err => {
        console.warn('[motion-permission] Permission request failed', err);
        MOTION_PERMISSION_STATE.requested = false;
        setMotionBannerVisibility(true);
      })
      .finally(() => {
        cleanupGestureListeners();
      });
  };

  if (sceneEl) {
    sceneEl.addEventListener('loaded', () => {
      if (!requiresExplicitPermission) {
        markGranted();
      }
    });
    sceneEl.addEventListener('deviceorientationpermissiongranted', markGranted);
    sceneEl.addEventListener('deviceorientationpermissionrejected', () => {
      MOTION_PERMISSION_STATE.requested = false;
      setMotionBannerVisibility(true);
    });
  }

  if (motionButton) {
    motionButton.addEventListener('click', event => {
      event.preventDefault();
      requestPermission();
    });
  }

  if (requiresExplicitPermission) {
    setMotionBannerVisibility(true);
    gestureEvents.forEach(evt => {
      window.addEventListener(evt, gestureHandler, { once: true });
    });
  } else {
    setMotionBannerVisibility(false);
    enableMagicWindowTracking();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupDeviceOrientationPermissionWorkflow();
  setTimeout(() => {
    new HotspotProject();
  }, 1000);
});