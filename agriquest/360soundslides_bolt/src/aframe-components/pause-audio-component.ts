import { useStore } from '../store';

// Component to pause the currently playing audio
AFRAME.registerComponent('pause-audio', {
  schema: {
    panorama: { type: 'string', default: '' }
  },

  init: function() {
    const el = this.el;
    
    // Make element clickable
    el.classList.add('clickable');
    
    // Handle click event
    el.addEventListener('click', function() {
      const store = useStore.getState();
      store.pauseAudio();
    });
  }
});