import { useStore } from '../store';

// Component to show the description/caption overlay
AFRAME.registerComponent('show-description', {
  schema: {
    panorama: { type: 'string', default: '' },
    text: { type: 'string', default: '' }
  },

  init: function() {
    const data = this.data;
    const el = this.el;
    
    // Make element clickable
    el.classList.add('clickable');
    
    // Handle click event
    el.addEventListener('click', function() {
      const store = useStore.getState();
      store.showCaptionOverlay(data.text);
    });
  }
});