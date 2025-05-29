import { useStore } from '../store';

// Component to play audio for the current panorama
AFRAME.registerComponent('play-audio', {
  schema: {
    panorama: { type: 'string', default: '' }
  },

  init: function() {
    const data = this.data;
    const el = this.el;
    
    // Make element clickable
    el.classList.add('clickable');
    
    // Handle click event
    el.addEventListener('click', function() {
      const store = useStore.getState();
      
      // Determine which audio to play based on panorama
      let audioId = '';
      if (data.panorama === 'group-point1') {
        audioId = 'audio1';
      } else if (data.panorama === 'group-point2') {
        audioId = 'audio2';
      }
      
      if (audioId) {
        store.playAudio(audioId);
      }
    });
  }
});