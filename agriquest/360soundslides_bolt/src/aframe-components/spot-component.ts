import { useStore } from '../store';

// Hotspot component for navigation between panoramas
AFRAME.registerComponent('spot', {
  schema: {
    linkto: { type: 'string', default: '' },
    spotgroup: { type: 'string', default: '' },
    audio: { type: 'string', default: '' },
    popup: { type: 'string', default: '' },
    popupColor: { type: 'string', default: '#FFFFFF' }
  },

  init: function() {
    const data = this.data;
    const el = this.el;
    
    // Add class for animations
    el.classList.add('hotspot-animation');
    
    // Make element clickable
    el.classList.add('clickable');
    
    // Handle click event
    el.addEventListener('click', function() {
      // Get the target panorama ID from the linkto attribute
      const targetPanorama = data.linkto.replace('#', '');
      const store = useStore.getState();
      
      // Change the panorama
      store.setCurrentPanorama(targetPanorama);
    });
  }
});