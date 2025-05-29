// script.js

// This script controls the immersive museum functionality

// Loading manager component
AFRAME.registerSystem('loading-manager', {
    init: function () {
      this.loadingOverlay = document.createElement('div');
      this.loadingOverlay.className = 'loading-overlay';
      
      this.loadingText = document.createElement('div');
      this.loadingText.className = 'loading-text';
      this.loadingText.textContent = 'Loading Immersive Museum...';
      
      this.progressContainer = document.createElement('div');
      this.progressContainer.className = 'loading-progress';
      
      this.progressBar = document.createElement('div');
      this.progressBar.className = 'loading-bar';
      
      this.progressContainer.appendChild(this.progressBar);
      this.loadingOverlay.appendChild(this.loadingText);
      this.loadingOverlay.appendChild(this.progressContainer);
      
      document.body.appendChild(this.loadingOverlay);
      
      this.totalAssets = 0;
      this.loadedAssets = 0;
      
      // Count all assets to load
      const assets = document.querySelector('a-assets');
      if (assets) {
        this.totalAssets = assets.querySelectorAll('*').length;
      }
      
      this.setupEventListeners();
    },
    
    setupEventListeners: function() {
      const assets = document.querySelector('a-assets');
      if (assets) {
        assets.addEventListener('loaded', this.onAssetsLoaded.bind(this));
        
        const assetItems = assets.querySelectorAll('*');
        assetItems.forEach(item => {
          item.addEventListener('loaded', this.onAssetLoaded.bind(this));
        });
      }
      
      this.sceneEl.addEventListener('loaded', this.checkAllLoaded.bind(this));
    },
    
    onAssetLoaded: function() {
      this.loadedAssets++;
      const progress = (this.loadedAssets / this.totalAssets) * 100;
      this.progressBar.style.width = progress + '%';
    },
    
    onAssetsLoaded: function() {
      this.progressBar.style.width = '100%';
      this.checkAllLoaded();
    },
    
    checkAllLoaded: function() {
      if (this.sceneEl.hasLoaded && this.progressBar.style.width === '100%') {
        setTimeout(() => {
          this.loadingOverlay.style.opacity = '0';
          this.loadingOverlay.style.transition = 'opacity 1s ease';
          setTimeout(() => {
            this.loadingOverlay.style.display = 'none';
          }, 1000);
        }, 500);
      }
    }
  });

  // Face-camera component to keep elements facing the camera.
  AFRAME.registerComponent("face-camera", {
    schema: {
      preserveY: { type: "boolean", default: false } // Option to maintain Y-axis orientation
    },
    tick: function () {
      var camera = document.querySelector("[camera]");
      if (!camera) return;
      
      if (this.data.preserveY) {
        // Billboard behavior that only rotates around Y axis (for hotspots)
        var cameraPosition = camera.object3D.position.clone();
        var objPosition = this.el.object3D.position.clone();
        
        // Create a direction vector in the horizontal plane only
        cameraPosition.y = objPosition.y;
        this.el.object3D.lookAt(cameraPosition);
      } else {
        // Full billboard behavior (for image panels)
        this.el.object3D.lookAt(camera.object3D.position);
      }
    }
  });

  // Spot component for hotspot behavior with enhanced functionality
  AFRAME.registerComponent("spot", {
    schema: {
      linkto: { type: "string", default: "" },
      spotgroup: { type: "string", default: "" },
      label: { type: "string", default: "" },
      audio: { type: "selector", default: null },
      labelBackground: { type: "string", default: "#000000" },
      info: { type: "string", default: "" },
      vegetableModel: { type: "string", default: "" },
      revealAnimation: { type: "boolean", default: false }
    },
    init: function () {
      var data = this.data;
      var el = this.el;
      
      // Create hotspot visual
      el.setAttribute("geometry", { primitive: "circle", radius: 0.5 });
      el.setAttribute("material", {
        color: "#FFFFFF",
        opacity: 0.6,
        transparent: true,
        src: "https://cdn.glitch.global/a39b243d-0aab-4e21-bb36-77d8260788f9/hotspot.png?v=1746470775132",
      });
      
      // Add pulse animation
      el.setAttribute("animation__pulse", {
        property: "scale",
        dir: "alternate",
        dur: 1000,
        easing: "easeInOutSine",
        loop: true,
        to: "1.1 1.1 1.1"
      });
      
      // Set up audio controls
      this.isPlaying = false;
      this.gazeTimeout = null;
      this.gazeThreshold = 1500; // 1.5 seconds gaze to activate
      
      // Create audio control buttons
      if (data.audio) {
        // Container for audio controls
        this.audioControls = document.createElement("a-entity");
        this.audioControls.setAttribute("position", "0 -0.8 0");
        
        // Play button
        this.playButton = document.createElement("a-entity");
        this.playButton.setAttribute("geometry", "primitive: circle; radius: 0.25");
        this.playButton.setAttribute("material", "color: #4CAF50; opacity: 0.9");
        this.playButton.setAttribute("position", "-0.3 0 0");
        this.playButton.setAttribute("class", "clickable");
        
        // Play icon (triangle)
        const playIcon = document.createElement("a-entity");
        playIcon.setAttribute("geometry", "primitive: triangle; vertexA: 0.15 0 0; vertexB: -0.05 0.1 0; vertexC: -0.05 -0.1 0");
        playIcon.setAttribute("material", "color: white; shader: flat");
        playIcon.setAttribute("position", "-0.05 0 0.01");
        this.playButton.appendChild(playIcon);
        
        // Pause button
        this.pauseButton = document.createElement("a-entity");
        this.pauseButton.setAttribute("geometry", "primitive: circle; radius: 0.25");
        this.pauseButton.setAttribute("material", "color: #F44336; opacity: 0.9");
        this.pauseButton.setAttribute("position", "0.3 0 0");
        this.pauseButton.setAttribute("class", "clickable");
        
        // Pause icon (two rectangles)
        const pauseBarLeft = document.createElement("a-entity");
        pauseBarLeft.setAttribute("geometry", "primitive: box; width: 0.06; height: 0.15; depth: 0.01");
        pauseBarLeft.setAttribute("material", "color: white; shader: flat");
        pauseBarLeft.setAttribute("position", "-0.04 0 0.01");
        this.pauseButton.appendChild(pauseBarLeft);
        
        const pauseBarRight = document.createElement("a-entity");
        pauseBarRight.setAttribute("geometry", "primitive: box; width: 0.06; height: 0.15; depth: 0.01");
        pauseBarRight.setAttribute("material", "color: white; shader: flat");
        pauseBarRight.setAttribute("position", "0.04 0 0.01");
        this.pauseButton.appendChild(pauseBarRight);
        
        // Add audio progress indicator
        this.progressBar = document.createElement("a-entity");
        this.progressBar.setAttribute("geometry", "primitive: plane; width: 0.8; height: 0.1");
        this.progressBar.setAttribute("material", "color: #333333; opacity: 0.8");
        this.progressBar.setAttribute("position", "0 -0.4 0");
        
        this.progressIndicator = document.createElement("a-entity");
        this.progressIndicator.setAttribute("geometry", "primitive: plane; width: 0.01; height: 0.1");
        this.progressIndicator.setAttribute("material", "color: #FFFFFF; opacity: 1");
        this.progressIndicator.setAttribute("position", "-0.4 0 0.01"); // Start at the left
        this.progressBar.appendChild(this.progressIndicator);
        
        // Add all controls to container
        this.audioControls.appendChild(this.playButton);
        this.audioControls.appendChild(this.pauseButton);
        this.audioControls.appendChild(this.progressBar);
        el.appendChild(this.audioControls);
        
        // Initially hide controls
        this.audioControls.setAttribute("visible", false);
        
        // Set up event listeners for audio buttons
        this.playButton.addEventListener("click", () => {
          this.playAudio();
        });
        
        this.pauseButton.addEventListener("click", () => {
          this.pauseAudio();
        });
        
        // Set up audio time update handler
        if (data.audio) {
          data.audio.addEventListener("timeupdate", () => {
            if (this.isPlaying && data.audio.duration) {
              const progress = data.audio.currentTime / data.audio.duration;
              const position = -0.4 + (progress * 0.8); // Map 0-1 to -0.4 to 0.4
              this.progressIndicator.setAttribute("position", `${position} 0 0.01`);
            }
          });
          
          data.audio.addEventListener("ended", () => {
            this.isPlaying = false;
            // Reset progress
            this.progressIndicator.setAttribute("position", "-0.4 0 0.01");
          });
        }
        
        // Setup gaze tracking for controls
        el.addEventListener("mouseenter", () => {
          // Show controls on mouse enter
          if (data.audio) {
            this.audioControls.setAttribute("visible", true);
            
            // Set gaze timeout
            this.gazeTimeout = setTimeout(() => {
              // Toggle audio play/pause after threshold
              if (this.isPlaying) {
                this.pauseAudio();
              } else {
                this.playAudio();
              }
            }, this.gazeThreshold);
          }
        });
        
        el.addEventListener("mouseleave", () => {
          // Hide controls on mouse leave after delay
          setTimeout(() => {
            if (data.audio && !this.isPlaying) {
              this.audioControls.setAttribute("visible", false);
            }
          }, 1000);
          
          // Clear gaze timeout
          if (this.gazeTimeout) {
            clearTimeout(this.gazeTimeout);
            this.gazeTimeout = null;
          }
        });
      }
      
      // Create label if provided
      if (data.label) {
        var textEntity = document.createElement("a-text");
        textEntity.setAttribute("value", data.label);
        textEntity.setAttribute("align", "center");
        textEntity.setAttribute("position", "0 0.6 0");
        textEntity.setAttribute("scale", "0.5 0.5 0.5");
        textEntity.setAttribute("color", "#FFFFFF");
        
        var bgEntity = document.createElement("a-plane");
        bgEntity.setAttribute("color", data.labelBackground);
        bgEntity.setAttribute("position", "0 0.6 -0.01");
        bgEntity.setAttribute("width", data.label.length * 0.15 + 0.2);
        bgEntity.setAttribute("height", "0.3");
        bgEntity.setAttribute("opacity", "0.8");
        
        el.appendChild(bgEntity);
        el.appendChild(textEntity);
      }
      
      // Set up click event
      el.addEventListener("click", () => {
        // Handle group visibility if specified
        if (data.spotgroup) {
          var allGroups = document.querySelectorAll('[id^="group-"]');
          allGroups.forEach(function (group) {
            group.setAttribute("visible", false);
          });
          var targetGroup = document.querySelector("#" + data.spotgroup);
          if (targetGroup) {
            targetGroup.setAttribute("visible", true);
          }
        }
        
        // Show info panel if specified
        if (data.info) {
          const infoPanel = document.querySelector('.museum-info');
          if (infoPanel) {
            infoPanel.textContent = data.info;
            infoPanel.style.display = 'block';
            
            // Hide after 10 seconds
            setTimeout(() => {
              infoPanel.style.display = 'none';
            }, 10000);
          }
        }
        
        // Handle 3D model animation if specified
        if (data.vegetableModel) {
          const model = document.querySelector(data.vegetableModel);
          if (model && data.revealAnimation) {
            model.setAttribute("animation__reveal", {
              property: "position",
              to: model.getAttribute("position").x + " " + (model.getAttribute("position").y + 1) + " " + model.getAttribute("position").z,
              dur: 1000,
              easing: "easeOutElastic"
            });
            
            model.setAttribute("animation__spin", {
              property: "rotation",
              to: "0 360 0",
              loop: 1,
              dur: 2000,
              easing: "easeOutQuad"
            });
          }
        }

        // Teleport if linkto is specified
        if (data.linkto && data.linkto !== "") {
          var targetPoint = document.querySelector(data.linkto);
          if (targetPoint) {
            // Add a flash effect before teleport
            document.querySelector('a-scene').setAttribute('animation__flash', {
              property: 'background.color',
              from: '#000',
              to: '#fff',
              dur: 100,
              dir: 'alternate',
              loop: 2
            });
            
            setTimeout(() => {
              var cameraRig = document.querySelector("#cameraRig");
              cameraRig.setAttribute("position", targetPoint.getAttribute("position"));
            }, 200);
          }
        }
      });
    },
    
    playAudio: function() {
      if (this.data.audio) {
        // Stop any other playing audio
        document.querySelectorAll('audio').forEach(audio => {
          if (audio !== this.data.audio) {
            audio.pause();
            audio.currentTime = 0;
            
            // Reset other hotspots' play state
            document.querySelectorAll('[spot]').forEach(spot => {
              if (spot !== this.el && spot.components.spot) {
                spot.components.spot.isPlaying = false;
              }
            });
          }
        });
        
        // Play this audio
        this.data.audio.play();
        this.isPlaying = true;
        
        // Visual feedback for playing state
        this.playButton.setAttribute("material", "opacity", 0.4);
        this.pauseButton.setAttribute("material", "opacity", 0.9);
        
        // Add a visual indicator that audio is playing
        this.el.setAttribute("animation__playing", {
          property: "material.emissive",
          to: "#4CAF50",
          dur: 500
        });
        
        // Show a notification
        const notification = document.createElement('div');
        notification.textContent = 'Playing Audio';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(76, 175, 80, 0.8)';
        notification.style.color = 'white';
        notification.style.padding = '10px 15px';
        notification.style.borderRadius = '5px';
        notification.style.fontFamily = 'Arial, sans-serif';
        notification.style.zIndex = '100';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.opacity = '0';
          notification.style.transition = 'opacity 0.5s ease';
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 500);
        }, 2000);
      }
    },
    
    pauseAudio: function() {
      if (this.data.audio) {
        this.data.audio.pause();
        this.isPlaying = false;
        
        // Visual feedback for paused state
        this.playButton.setAttribute("material", "opacity", 0.9);
        this.pauseButton.setAttribute("material", "opacity", 0.4);
        
        // Reset visual indicator
        this.el.setAttribute("animation__playing", {
          property: "material.emissive",
          to: "#000000",
          dur: 500
        });
        
        // Show a notification
        const notification = document.createElement('div');
        notification.textContent = 'Audio Paused';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(244, 67, 54, 0.8)';
        notification.style.color = 'white';
        notification.style.padding = '10px 15px';
        notification.style.borderRadius = '5px';
        notification.style.fontFamily = 'Arial, sans-serif';
        notification.style.zIndex = '100';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.opacity = '0';
          notification.style.transition = 'opacity 0.5s ease';
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 500);
        }, 2000);
      }
    }
  });

  // Enhanced mobile movement with better controls
  AFRAME.registerComponent("enhanced-mobile-controls", {
    schema: {
      speed: { type: "number", default: 2 }
    },
    init: function () {
      var self = this;
      this.numFingers = 0;
      this.verticalMovementLocked = true; // Lock vertical movement
      
      // Control mappings
      this.updateTouches = function (event) {
        event.preventDefault();
        self.numFingers = event.touches.length;
      };
      
      this.clearTouches = function (event) {
        event.preventDefault();
        self.numFingers = (event.touches && event.touches.length) || 0;
      };
      
      // Wait for canvas to be available
      this.el.sceneEl.addEventListener("renderstart", function () {
        var canvas = self.el.sceneEl.canvas;
        canvas.addEventListener("touchstart", self.updateTouches, { passive: false });
        canvas.addEventListener("touchmove", self.updateTouches, { passive: false });
        canvas.addEventListener("touchend", self.clearTouches, { passive: false });
        canvas.addEventListener("touchcancel", self.clearTouches, { passive: false });
      });
      
      // Disable other controls on mobile
      if (AFRAME.utils.device.isMobile()) {
        var leftCtrl = document.querySelector("#left-controller");
        var rightCtrl = document.querySelector("#right-controller");
        if (leftCtrl) {
          leftCtrl.removeAttribute("blink-controls");
        }
        if (rightCtrl) {
          rightCtrl.removeAttribute("blink-controls");
        }
      }
      
      // Add mobile control UI overlay
      const controlsGuide = document.createElement('div');
      controlsGuide.className = 'controls-guide';
      controlsGuide.innerHTML = 'Touch screen to move:<br>• One finger - Move forward<br>• Two fingers - Move backward<br>• Look around to change direction';
      document.body.appendChild(controlsGuide);
      
      // Hide controls after 5 seconds
      setTimeout(() => {
        controlsGuide.style.opacity = '0';
        controlsGuide.style.transition = 'opacity 1s ease';
        setTimeout(() => {
          controlsGuide.style.display = 'none';
        }, 1000);
      }, 5000);
    },
    tick: function (time, deltaTime) {
      if (this.numFingers === 0) {
        return;
      }
      
      // Calculate move distance for this tick
      var distance = this.data.speed * (deltaTime / 1000);
      
      // Adjust direction based on number of fingers:
      // One finger: move forward. Two fingers: move backward
      var moveMultiplier = this.numFingers === 1 ? -1 : 1;
      
      var cameraEl = this.el.querySelector("[camera]");
      if (cameraEl) {
        // Get the direction vector but ignore vertical component
        var direction = new THREE.Vector3();
        cameraEl.object3D.getWorldDirection(direction);
        
        // Lock vertical movement by zeroing out the y component
        // and normalizing the vector again
        if (this.verticalMovementLocked) {
          direction.y = 0;
          direction.normalize();
        }
        
        direction.multiplyScalar(distance * moveMultiplier);
        this.el.object3D.position.add(direction);
        
        // Always maintain a fixed height above ground
        this.el.object3D.position.y = 0;
      }
    },
    remove: function () {
      var canvas = this.el.sceneEl.canvas;
      canvas.removeEventListener("touchstart", this.updateTouches);
      canvas.removeEventListener("touchmove", this.updateTouches);
      canvas.removeEventListener("touchend", this.clearTouches);
      canvas.removeEventListener("touchcancel", this.clearTouches);
    }
  });
  
  // Sound effect component
  AFRAME.registerComponent('sound-effects', {
    init: function() {
      this.sounds = {
        ambient: new Howl({
          src: ['https://cdn.glitch.global/a39b243d-0aab-4e21-bb36-77d8260788f9/ambient_nature.mp3?v=1746470754684'],
          loop: true,
          volume: 0.3,
          autoplay: false
        }),
        click: new Howl({
          src: ['https://cdn.glitch.global/a39b243d-0aab-4e21-bb36-77d8260788f9/click.mp3?v=1746470754684'],
          volume: 0.5
        }),
        teleport: new Howl({
          src: ['https://cdn.glitch.global/a39b243d-0aab-4e21-bb36-77d8260788f9/teleport.mp3?v=1746470754684'],
          volume: 0.7
        })
      };
      
      // Play ambient sound after a delay
      setTimeout(() => {
        this.sounds.ambient.play();
      }, 2000);
      
      // Add click sound to all clickable elements
      document.querySelectorAll('.clickable').forEach(el => {
        el.addEventListener('click', () => {
          this.sounds.click.play();
        });
      });
    }
  });
  
  // Day-night cycle component
  AFRAME.registerComponent('day-night-cycle', {
    schema: {
      cycleLength: { type: 'number', default: 120 } // seconds for a full cycle
    },
    init: function() {
      this.sky = document.querySelector('a-sky');
      this.skyDay = 'https://cdn.glitch.global/a39b243d-0aab-4e21-bb36-77d8260788f9/day.jpg?v=1746470542948';
      this.skyNight = 'https://cdn.glitch.global/a39b243d-0aab-4e21-bb36-77d8260788f9/night.jpg?v=1746470754684';
      this.cycleTime = 0;
      
      // Create a directional light for the sun
      this.sunLight = document.createElement('a-entity');
      this.sunLight.setAttribute('light', {
        type: 'directional',
        color: '#FFF',
        intensity: 0.8
      });
      this.sunLight.setAttribute('position', '0 10 0');
      this.el.sceneEl.appendChild(this.sunLight);
    },
    tick: function(time, deltaTime) {
      this.cycleTime = (this.cycleTime + deltaTime / 1000) % this.data.cycleLength;
      const dayProgress = this.cycleTime / this.data.cycleLength;
      
      // Change sky color and lighting based on time of day
      if (dayProgress < 0.5) {
        // Day to night transition
        const t = dayProgress * 2; // 0 to 1 during first half of cycle
        this.sky.setAttribute('material', {
          src: this.skyDay,
          opacity: 1 - t * 0.6 // Sky gets darker
        });
        
        // Sun position and intensity
        const sunAngle = Math.PI * t;
        this.sunLight.setAttribute('position', {
          x: Math.cos(sunAngle) * 10,
          y: Math.sin(sunAngle) * 10 + 1,
          z: 0
        });
        this.sunLight.setAttribute('light', {
          intensity: 0.8 - t * 0.6
        });
      } else {
        // Night to day transition
        const t = (dayProgress - 0.5) * 2; // 0 to 1 during second half
        this.sky.setAttribute('material', {
          src: this.skyNight,
          opacity: 0.4 + t * 0.6 // Sky gets brighter
        });
        
        // Sun position and intensity
        const sunAngle = Math.PI * (1 + t);
        this.sunLight.setAttribute('position', {
          x: Math.cos(sunAngle) * 10,
          y: Math.sin(sunAngle) * 10 + 1,
          z: 0
        });
        this.sunLight.setAttribute('light', {
          intensity: 0.2 + t * 0.6
        });
      }
    }
  });
  