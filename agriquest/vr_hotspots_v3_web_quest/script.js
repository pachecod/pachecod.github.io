// Basic spot component for navigation between panoramas
AFRAME.registerComponent('spot', {
  schema: {
    linkto: { type: 'selector' },
    spotgroup: { type: 'selector' },
    audio: { type: 'selector', default: null },
    popup: { type: 'string', default: '' },
    popupColor: { type: 'color', default: '#F0F0F0' }
  },

  init: function () {
    // Setup for navigation when clicking the hotspot
    this.el.addEventListener('click', () => {
      // Change the panorama
      const sky = document.querySelector('#skybox');
      sky.setAttribute('src', this.data.linkto.getAttribute('src'));
      
      // Toggle hotspot groups
      document.querySelectorAll('[id^="group-point"]').forEach(g => 
        g.setAttribute('visible', 'false')
      );
      this.data.spotgroup.setAttribute('visible', 'true');
      
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

// Separate component for the play button
AFRAME.registerComponent('play-audio', {
  schema: {
    panorama: { type: 'string', default: '' } // ID of the panorama this button affects
  },

  init: function () {
    this.el.addEventListener('click', (e) => {
      e.stopPropagation();
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

// Separate component for the pause button
AFRAME.registerComponent('pause-audio', {
  schema: {
    panorama: { type: 'string', default: '' } // ID of the panorama this button affects
  },

  init: function () {
    this.el.addEventListener('click', (e) => {
      e.stopPropagation();
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

// Separate component for the description button
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
      e.stopPropagation();
      console.log("Description button clicked for", component.data.panorama);
      
      // Remove any existing popup
      const old = document.querySelector('#popup');
      if (old) old.parentNode.removeChild(old);
      
      // Get the position from the hotspot (grandparent)
      const hotspot = component.el.closest('[spot]');
      if (!hotspot) {
        console.error("Could not find parent hotspot");
        return;
      }
      
      const hotspotPos = hotspot.getAttribute('position');
      console.log("Hotspot position:", hotspotPos);
      
      // Create new popup
      const popup = document.createElement('a-entity');
      popup.setAttribute('id', 'popup');
      popup.setAttribute('position', `${hotspotPos.x + 1} ${hotspotPos.y} ${hotspotPos.z}`);
      popup.setAttribute('look-at', '[camera]');
      
      // Create popup content
      popup.innerHTML = `
        <a-plane 
          width="2" 
          height="1" 
          color="#F0F0F0" 
          opacity="0.8">
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
            opacity="0.8"
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

// Simple component for the close button
AFRAME.registerComponent('close-popup', {
  init: function () {
    this.el.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log("Close button clicked");
      
      const popup = document.querySelector('#popup');
      if (popup) popup.parentNode.removeChild(popup);
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
  const scene = document.querySelector('a-scene');
  scene.setAttribute('vr-mode-watcher', '');
});