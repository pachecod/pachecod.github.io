import { create } from 'zustand';

// Define the store state
interface StoreState {
  // Current panorama
  currentPanorama: string;
  
  // Audio state
  audioPlaying: boolean;
  currentAudio: HTMLAudioElement | null;
  audioElements: Record<string, HTMLAudioElement>;
  
  // Caption overlay
  showCaption: boolean;
  captionText: string;
  
  // Actions
  setCurrentPanorama: (panorama: string) => void;
  playAudio: (audioId: string) => void;
  pauseAudio: () => void;
  showCaptionOverlay: (text: string) => void;
  hideCaption: () => void;
  initializeAudio: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  currentPanorama: 'point1',
  audioPlaying: false,
  currentAudio: null,
  audioElements: {},
  showCaption: false,
  captionText: '',
  
  // Initialize audio
  initializeAudio: () => {
    const audioElements: Record<string, HTMLAudioElement> = {
      'audio1': new Audio('/audio/newhouse3freedomofspeech.mp3'),
      'audio2': new Audio('/audio/newhouse1courtyard.mp3')
    };
    
    // Configure audio elements
    Object.values(audioElements).forEach(audio => {
      audio.preload = 'auto';
    });
    
    set({ audioElements });
    
    // Auto-play first audio after a delay
    setTimeout(() => {
      get().playAudio('audio1');
    }, 1500);
  },
  
  // Set current panorama and handle related actions
  setCurrentPanorama: (panorama) => {
    set({ currentPanorama: panorama });
    
    // Play the corresponding audio
    const audioMap: Record<string, string> = {
      'point1': 'audio1',
      'point2': 'audio2'
    };
    
    const audioId = audioMap[panorama];
    if (audioId) {
      get().playAudio(audioId);
    }
  },
  
  // Audio controls
  playAudio: (audioId) => {
    const { audioElements, currentAudio } = get();
    
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    
    const audio = audioElements[audioId];
    if (audio) {
      audio.play().catch(e => {
        console.log('Audio autoplay blocked:', e);
      });
      set({ currentAudio: audio, audioPlaying: true });
    }
  },
  
  pauseAudio: () => {
    const { currentAudio } = get();
    if (currentAudio) {
      currentAudio.pause();
      set({ audioPlaying: false });
    }
  },
  
  // Caption overlay controls
  showCaptionOverlay: (text) => {
    set({ showCaption: true, captionText: text });
  },
  
  hideCaption: () => {
    set({ showCaption: false });
  }
}));