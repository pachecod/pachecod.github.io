import React, { useEffect } from 'react';
import { VRScene } from './components/VRScene';
import { CaptionOverlay } from './components/CaptionOverlay';
import { useStore } from './store';
import './aframe-components';

function App() {
  const { showCaption, captionText, initializeAudio } = useStore();
  
  useEffect(() => {
    // Initialize audio system
    initializeAudio();
  }, [initializeAudio]);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* VR Scene */}
      <VRScene />
      
      {/* Caption Overlay */}
      {showCaption && <CaptionOverlay text={captionText} />}
    </div>
  );
}

export default App;