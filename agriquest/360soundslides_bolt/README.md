# 360° Photo Gallery with Audio and Captions

An immersive web application for viewing 360° panoramic photos with audio narration and interactive captions.

## Features

- Immersive 360° panoramic photo viewing experience
- Audio narration for each panoramic scene
- Interactive hotspots for navigation between scenes
- Caption overlay system that appears when clicking a button
- Audio playback controls (play/pause)
- Responsive design that works across devices
- Smooth transitions between panoramic scenes
- Visual feedback for interactive elements

## Tech Stack

- React with TypeScript
- A-Frame for WebVR/WebXR
- Zustand for state management
- Tailwind CSS for styling
- Vite for build system

## Project Structure

```
/
├── public/               # Static assets
│   ├── audio/            # Audio narration files
│   └── images/           # Panorama images and UI elements
├── src/
│   ├── aframe-components/ # Custom A-Frame components
│   ├── components/       # React components
│   ├── store/            # Zustand state management
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
└── index.html            # HTML entry point
```

## Setup Instructions

1. Add your 360° panorama images to the `public/images/` directory:
   - `1.jpg` - First panorama
   - `2.jpg` - Second panorama

2. Add your audio narration files to the `public/audio/` directory:
   - `newhouse3freedomofspeech.mp3` - Audio for first panorama
   - `newhouse1courtyard.mp3` - Audio for second panorama

3. Add UI element images to the `public/images/` directory:
   - `hotspot_yellow.png` - Hotspot marker
   - `play.png` - Play button icon
   - `pause.png` - Pause button icon
   - `ring.png` - Cursor ring

4. Run the development server:
   ```
   npm run dev
   ```

## Usage

- Click on hotspots to navigate between panoramas
- Use the play/pause buttons to control audio narration
- Click the "Caption" button to view detailed information about the current scene
- Use a VR headset for an immersive experience (if available)

## Extending the Gallery

To add more panoramas:

1. Add new panorama images to `public/images/`
2. Add new audio narration files to `public/audio/`
3. Update the VRScene.tsx component to include new panorama groups
4. Update the store with new audio mappings