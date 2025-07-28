 // Add this at the top before any component registrations
let sceneInitialized = false;
let debugMode = true; // Enable verbose debugging
let clickDelayActive = true; // Add this new variable to block clicks initially

// Add global enableAudio function
function enableAudio() {
  return new Promise((resolve) => {
    const audioElements = document.querySelectorAll('audio');
    let loadedCount = 0;

    function checkAllLoaded() {
      loadedCount++;
      if (loadedCount === audioElements.length) {
        console.log('All audio files ready');
        resolve();
      }
    }

    audioElements.forEach(audio => {
      // Ensure audio is loaded
      if (audio.readyState >= 2) {
        checkAllLoaded();
      } else {
        audio.addEventListener('canplay', checkAllLoaded, { once: true });
        audio.load(); // Force load
      }
    });

    // Fallback in case some audio doesn't load
    setTimeout(() => {
      console.log('Audio loading timeout - proceeding anyway');
      resolve();
    }, 3000);
  });
}

// Add global playAudioForPanorama function
let currentAudio = null;
function playAudioForPanorama(panoramaId) {
  if (typeof audioEnabled !== 'undefined' && !audioEnabled) {
    console.log('Audio not enabled yet');
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    // Get the new audio element
    const audioElement = document.getElementById(panoramaId);
    if (audioElement) {
      // Wait a moment for any previous audio to fully stop
      setTimeout(() => {
        audioElement.play()
          .then(() => {
            currentAudio = audioElement;
            console.log('Successfully playing:', panoramaId);
            resolve(true);
          })
          .catch(e => {
            console.log('Audio play failed for', panoramaId, ':', e);
            resolve(false);
          });
      }, 100);
    } else {
      console.log('Audio element not found:', panoramaId);
      resolve(false);
    }
  });
}

// Modified scene initialization component with more debugging
AFRAME.registerComponent('scene-controller', {
  init: function() {
    if (debugMode) console.log('[DEBUG] Scene controller initializing');
    
    // Create a flag to track if a panorama transition has occurred
    window.panoramaChanged = false;
    
    // Make sure the first panorama is displayed
    const sky = document.querySelector('#skybox');
    const firstPanorama = document.querySelector('#point1');
    
    if (sky && firstPanorama) {
      if (debugMode) console.log('[DEBUG] Setting initial panorama to:', firstPanorama.id);
      sky.setAttribute('src', firstPanorama.getAttribute('src'));
    } else {
      console.error('[ERROR] Could not find skybox or point1 panorama');
    }
    
    // Make sure first group is visible and others are hidden
    document.querySelectorAll('[id^="group-point"]').forEach(g => {
      if (g.id === 'group-point1') {
        if (debugMode) console.log('[DEBUG] Making group-point1 visible');
        g.setAttribute('visible', 'true');
      } else {
        if (debugMode) console.log('[DEBUG] Hiding', g.id);
        g.setAttribute('visible', 'false');
      }
    });
    
    // Monitor for any panorama changes during initialization
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          if (!sceneInitialized) {
            window.panoramaChanged = true;
            console.warn('[WARNING] Panorama changed before initialization was complete!', 
                         'Old:', mutation.oldValue, 
                         'New:', sky.getAttribute('src'));
          }
        }
      });
    });
    
    // Start observing skybox src attribute
    observer.observe(sky, { 
      attributes: true, 
      attributeFilter: ['src'],
      attributeOldValue: true 
    });
    
    // Allow interaction after a delay
    setTimeout(() => {
      if (debugMode) console.log('[DEBUG] Scene fully initialized');
      
      // Check if panorama changed during initialization
      if (window.panoramaChanged) {
        console.error('[ERROR] Panorama was changed during initialization phase!');
      }
      
      // Stop observing
      observer.disconnect();
      
      sceneInitialized = true;
      
      // Add an extra delay before allowing clicks
      setTimeout(() => {
        if (debugMode) console.log('[DEBUG] Click protection period ended, user interactions now accepted');
        clickDelayActive = false;
      }, 2000); // Extra 2 seconds of protection after initialization
    }, 1000);
  }
});

// Modified spot component with both isTrusted and clickDelay checks
AFRAME.registerComponent('spot', {
  schema: {
    linkto: { type: 'selector' },
    spotgroup: { type: 'selector' },
    audio: { type: 'selector', default: null },
    popup: { type: 'string', default: '' },
    popupColor: { type: 'color', default: '#FFFFFF' }
  },

  init: function () {
    if (debugMode) console.log('[DEBUG] Spot component initializing with linkto:', this.data.linkto ? this.data.linkto.id : 'none');
    
    // Add an ID to the spot for easier debugging if it doesn't have one
    if (!this.el.id) {
      this.el.id = 'spot-' + Math.floor(Math.random() * 10000);
    }
    
    // IMPORTANT: Store a reference to "this" for use in the event listener
    const self = this;
    
    // Setup for navigation when clicking the hotspot
    this.el.addEventListener('click', function(event) {
      if (debugMode) console.log('[DEBUG] Click detected on hotspot:', self.el.id, 'with linkto:', self.data.linkto ? self.data.linkto.id : 'none', 'and spotgroup:', self.data.spotgroup ? self.data.spotgroup.id : 'none');
      
      // Prevent ANY clicks in the extended period after loading
      if (clickDelayActive) {
        if (debugMode) console.log('[DEBUG] Ignoring click during initial click protection period for', self.el.id);
        return;
      }
      
      // Check if this is an automatic event (programmatic)
      // if (!event.isTrusted) {
      //  if (debugMode) console.log('[DEBUG] Ignoring programmatic click event on', self.el.id);
      //  return;
      // }
      
      // Only allow interaction if scene is fully initialized
      if (!sceneInitialized) {
        if (debugMode) console.log('[DEBUG] Ignoring click during initialization on', self.el.id);
        return;
      }
      
      if (debugMode) console.log('[DEBUG] Processing valid user click for', self.el.id, '- changing panorama to:', self.data.linkto.id);
      if (debugMode) console.log('[DEBUG] Target spotgroup:', self.data.spotgroup.id);
      
      // Change the panorama
      const sky = document.querySelector('#skybox');
      sky.setAttribute('src', self.data.linkto.getAttribute('src'));
      
      // Toggle hotspot groups
      document.querySelectorAll('[id^="group-point"]').forEach(g => {
        if (debugMode) console.log('[DEBUG] Hiding group:', g.id);
        g.setAttribute('visible', 'false')
      });
      if (debugMode) console.log('[DEBUG] Making visible:', self.data.spotgroup.id);
      self.data.spotgroup.setAttribute('visible', 'true');
      
      // Remove any existing popup
      const old = document.querySelector('#popup');
      if (old) old.parentNode.removeChild(old);
    });

    // Add visual feedback for gaze hovering
    this.el.addEventListener('mouseenter', () => {
      this.el.classList.add('hotspot-animation');
    });

    this.el.addEventListener('mouseleave', () => {
      this.el.classList.remove('hotspot-animation');
    });
  }
});

// Similarly modify other interactive components to respect the clickDelayActive flag

// Modify play-audio component
AFRAME.registerComponent('play-audio', {
  schema: {
    panorama: { type: 'string', default: '' } // ID of the panorama this button affects
  },

  init: function () {
    this.el.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent click from bubbling to parent hotspot
      // Prevent clicks during click delay period
      if (clickDelayActive) {
        if (debugMode) console.log('[DEBUG] Ignoring audio play during click protection period');
        return;
      }
      
      // Only allow interaction if scene is fully initialized
      if (!sceneInitialized) {
        if (debugMode) console.log('[DEBUG] Ignoring audio play during initialization');
        return;
      }
      
      console.log("Play clicked for", this.data.panorama);
      
      // Find the correct audio based on panorama ID
      let audioId;
      switch(this.data.panorama) {
        case 'group-point1':
          audioId = 'audio1';
          break;
        case 'group-point2':
          audioId = 'audio2';
          break;
        case 'group-point3':
          audioId = 'audio3';
          break;
      }
      
      if (!audioId) return;
      
      // Get the audio element
      const audio = document.querySelector('#' + audioId);
      if (!audio) return;
      
      // Stop all other audio
      document.querySelectorAll('audio').forEach(a => {
        if (a.id !== audioId) {
          a.pause();
          a.currentTime = 0;
        }
      });
      
      // Play this audio
      audio.play().catch(err => console.error('Audio play failed:', err));
    });

    // Add visual feedback for gaze hovering
    this.el.addEventListener('mouseenter', () => {
      this.el.setAttribute('scale', '1.1 1.1 1.1');
    });

    this.el.addEventListener('mouseleave', () => {
      this.el.setAttribute('scale', '1 1 1');
    });
  }
});

// Modify pause-audio component
AFRAME.registerComponent('pause-audio', {
  schema: {
    panorama: { type: 'string', default: '' } // ID of the panorama this button affects
  },

  init: function () {
    this.el.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent click from bubbling to parent hotspot
      // Prevent clicks during click delay period
      if (clickDelayActive) {
        if (debugMode) console.log('[DEBUG] Ignoring audio pause during click protection period');
        return;
      }
      
      // Only allow interaction if scene is fully initialized
      if (!sceneInitialized) {
        if (debugMode) console.log('[DEBUG] Ignoring audio pause during initialization');
        return;
      }
      
      console.log("Pause clicked for", this.data.panorama);
      
      // Find the correct audio based on panorama ID
      let audioId;
      switch(this.data.panorama) {
        case 'group-point1':
          audioId = 'audio1';
          break;
        case 'group-point2':
          audioId = 'audio2';
          break;
        case 'group-point3':
          audioId = 'audio3';
          break;
      }
      
      if (!audioId) return;
      
      // Get the audio element
      const audio = document.querySelector('#' + audioId);
      if (!audio) return;
      
      // Pause this audio
      audio.pause();
    });

    // Add visual feedback for gaze hovering
    this.el.addEventListener('mouseenter', () => {
      this.el.setAttribute('scale', '1.1 1.1 1.1');
    });

    this.el.addEventListener('mouseleave', () => {
      this.el.setAttribute('scale', '1 1 1');
    });
  }
});

// Modify show-description component
AFRAME.registerComponent('show-description', {
  schema: {
    panorama: { type: 'string', default: '' }, // ID of the panorama this button affects
    text: { type: 'string', default: 'No description available' }
  },

  init: function () {
    console.log('show-description component initialized on', this.el.tagName, 'for', this.data.panorama);
    
    // Make sure this component logs when clicked
    const component = this;
    
    this.clickHandler = function(e) {
      e.stopPropagation(); // Prevent click from bubbling to parent hotspot
      // Prevent clicks during click delay period
      if (clickDelayActive) {
        if (debugMode) console.log('[DEBUG] Ignoring description during click protection period');
        return;
      }
      
      // Only allow interaction if scene is fully initialized
      if (!sceneInitialized) {
        console.log('Ignoring description click during initialization');
        return;
      }
      
      console.log("Description button clicked for", component.data.panorama);
      
      // Rest of your existing code...
      // Remove any existing popup
      const old = document.querySelector('#popup');
      if (old) old.parentNode.removeChild(old);
      
      // Get the hotspot (grandparent)
      const hotspot = component.el.closest('[spot]');
      if (!hotspot) {
        console.error("Could not find parent hotspot");
        return;
      }
      
      // Make sure the hotspot has an ID
      if (!hotspot.id) {
        // Generate an ID if it doesn't have one
        hotspot.id = 'hotspot-' + Date.now();
      }
      
      // Store the hotspot ID for later restoration
      const hotspotId = hotspot.id;
      console.log("Storing hotspot ID:", hotspotId);
      
      // Hide the hotspot and all its controls
      hotspot.setAttribute('visible', 'false');
      
      const hotspotPos = hotspot.getAttribute('position');
      console.log("Hotspot position:", hotspotPos);
      
      // Create new popup
      const popup = document.createElement('a-entity');
      popup.setAttribute('id', 'popup');
      // Position popup at the same position as the hotspot, no need for z-offset
      popup.setAttribute('position', `${hotspotPos.x} ${hotspotPos.y} ${hotspotPos.z}`);
      popup.setAttribute('look-at', '[camera]');
      popup.setAttribute('data-hotspot-id', hotspotId); // Store hotspot ID as a data attribute
      
      // Create popup content
      popup.innerHTML = `
        <a-plane 
          width="2.4" 
          height="1.2" 
          color="#FFFFFF" 
          opacity="1.0">
        </a-plane>
        <a-text 
          value="${component.data.text}" 
          wrap-count="25" 
          width="1.8"
          color="#000" 
          align="center"
          position="0 0.15 0.01">
        </a-text>
        <a-entity 
          class="close-btn clickable" 
          position="0 -0.35 0.01"
          close-popup>
          <a-plane 
            color="#FF4444" 
            width="0.8" 
            height="0.2" 
            opacity="1.0"
            class="clickable">
          </a-plane>
          <a-text 
            value="Close" 
            color="white" 
            align="center" 
            width="2">
          </a-text>
        </a-entity>
      `;
      
      // Add popup to scene
      document.querySelector('a-scene').appendChild(popup);
    };
    
    // Attach the click handler to this element
    this.el.addEventListener('click', this.clickHandler);

    // Add visual feedback for gaze hovering
    this.el.addEventListener('mouseenter', () => {
      this.el.setAttribute('material', 'color', '#00AAFF');  // Brighten color on hover
    });

    this.el.addEventListener('mouseleave', () => {
      this.el.setAttribute('material', 'color', '#0088FF');  // Reset to original color
    });
  },
  
  // Clean up event listeners when component is removed
  remove: function() {
    this.el.removeEventListener('click', this.clickHandler);
  }
});

// Updated close-popup component
AFRAME.registerComponent('close-popup', {
  init: function () {
    this.el.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent bubbling
      if (!sceneInitialized) {
        console.log('Ignoring close button click during initialization');
        return;
      }
      // Remove the popup
      const popup = document.querySelector('#popup');
      if (!popup) return;
      const hotspotId = popup.getAttribute('data-hotspot-id');
      popup.parentNode.removeChild(popup);
      // Only restore the specific hotspot that was hidden
      if (hotspotId) {
        const hotspot = document.getElementById(hotspotId);
        if (hotspot) {
          hotspot.setAttribute('visible', 'true');
        }
      }
    });

    // Add visual feedback for gaze hovering
    this.el.addEventListener('mouseenter', () => {
      const plane = this.el.querySelector('a-plane');
      if (plane) plane.setAttribute('material', 'color', '#FF6666');  // Brighten red on hover
    });

    this.el.addEventListener('mouseleave', () => {
      const plane = this.el.querySelector('a-plane');
      if (plane) plane.setAttribute('material', 'color', '#FF4444');  // Reset to original color
    });
  }
});

// VR mode detection to switch cursor types
AFRAME.registerComponent('vr-mode-watcher', {
  init: function () {
    const scene = this.el;
    const mouseCursor = document.querySelector('#mouse-cursor');
    const gazeCursor = document.querySelector('#gaze-cursor');
    
    // Handle enter VR
    scene.addEventListener('enter-vr', function () {
      console.log('Entered VR mode, enabling gaze cursor');
      if (scene.is('vr-mode')) {
        mouseCursor.setAttribute('visible', 'false');
        gazeCursor.setAttribute('visible', 'true');
      }
    });
    
    // Handle exit VR
    scene.addEventListener('exit-vr', function () {
      console.log('Exited VR mode, enabling mouse cursor');
      mouseCursor.setAttribute('visible', 'true');
      gazeCursor.setAttribute('visible', 'false');
    });
  }
});

// Add the VR mode watcher to the scene when loaded
document.addEventListener('DOMContentLoaded', function() {
  if (debugMode) console.log('[DEBUG] DOM content loaded at:', new Date().toISOString());

  const scene = document.querySelector('a-scene');
  let audioStarted = false;

  function startTourWithAudio(e) {
    if (audioStarted) return;
    audioStarted = true;
    if (debugMode) console.log('[DEBUG] First user gesture detected, enabling audio and starting tour');
    enableAudio().then(() => {
      audioEnabled = true;
      sceneInitialized = true;
      clickDelayActive = false;
      setTimeout(() => {
        playAudioForPanorama('audio1');
      }, 500);
    });
    // Remove this listener after first click
    scene.removeEventListener('click', startTourWithAudio);
    // Prevent this first click from triggering other actions
    if (e) e.stopPropagation();
  }

  // Only allow interactions after audio is started and scene is initialized
  scene.addEventListener('click', startTourWithAudio, true);

  // VR mode watcher and scene controller
  const assets = document.querySelector('a-assets');
  assets.addEventListener('loaded', function() {
    if (debugMode) console.log('[DEBUG] All assets loaded at:', new Date().toISOString());
  });
  scene.addEventListener('loaded', function() {
    if (debugMode) console.log('[DEBUG] Scene loaded at:', new Date().toISOString());
  });
  scene.setAttribute('vr-mode-watcher', '');
  scene.setAttribute('scene-controller', '');
});