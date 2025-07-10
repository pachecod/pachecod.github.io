# Immersive Story Template

A customizable A-Frame immersive story template that allows users to create interactive 3D experiences with minimal setup.

## Features

- **3 Interactive Exhibits**: Each with its own 3D model, audio narration, and information hotspot
- **Image Slideshow**: Navigable image gallery with left/right arrows
- **Audio Controls**: Play/pause controls for each exhibit's audio narration
- **Mobile Support**: Touch controls for mobile devices
- **Day/Night Cycle**: Dynamic lighting that changes over time
- **Responsive Design**: Works on desktop and mobile devices

## File Structure

```
immersivestory_nahj/
├── index.html          # Main HTML file
├── script.js           # JavaScript functionality
├── style.css           # CSS styles
├── audio/              # Audio files folder
│   ├── 1.mp3          # Audio for exhibit 1
│   ├── 2.mp3          # Audio for exhibit 2
│   ├── 3.mp3          # Audio for exhibit 3
│   ├── ambient_nature.mp3  # Background ambient sound
│   ├── click.mp3      # Click sound effect
│   └── teleport.mp3   # Teleport sound effect
├── images/             # Image files folder
│   ├── 1.png          # Image 1 for slideshow
│   ├── 2.png          # Image 2 for slideshow
│   ├── 3.png          # Image 3 for slideshow
│   ├── left-arrow.png # Left navigation arrow
│   ├── right-arrow.png # Right navigation arrow
│   ├── border.jpg     # Border texture
│   ├── day.jpg        # Day sky texture
│   ├── night.jpg      # Night sky texture
│   ├── grass.jpg      # Ground texture
│   └── hotspot.png    # Hotspot icon
└── models/             # 3D model files folder
    ├── 1.glb          # 3D model for exhibit 1
    ├── 2.glb          # 3D model for exhibit 2
    ├── 3.glb          # 3D model for exhibit 3
    └── bench.glb      # Optional bench model
```

## How to Customize

### 1. Add Your Content Files

Simply add your files to the appropriate folders with the numbered naming convention:

- **3D Models**: Add your `.glb` files as `1.glb`, `2.glb`, `3.glb` in the `models/` folder
- **Audio**: Add your `.mp3` files as `1.mp3`, `2.mp3`, `3.mp3` in the `audio/` folder
- **Images**: Add your image files as `1.png`, `2.png`, `3.png` in the `images/` folder

### 2. Update Captions and Information

Edit the `index.html` file to customize the captions and information for each exhibit. Look for these sections:

```html
<!-- Exhibit 1 -->
<a-entity id="exhibit1" position="-15 0 -17">
  <!-- ... model ... -->
  <a-entity
    id="hotspot1"
    spot="label: Caption 1; audio: #audio1; info: A short one to two sentence caption goes here.;"
  ></a-entity>
</a-entity>
```

Change the `label` and `info` attributes to match your content.

### 3. Customize Environment

- **Sky**: Replace `images/day.jpg` and `images/night.jpg` with your own sky textures
- **Ground**: Replace `images/grass.jpg` with your own ground texture
- **UI Elements**: Replace `images/left-arrow.png`, `images/right-arrow.png`, and `images/hotspot.png` with your own UI elements

### 4. Optional Customization

- **Exhibit Positions**: Change the `position` attributes of each exhibit to reposition them in 3D space
- **Model Scaling**: Adjust the `scale` attributes of each model to make them larger or smaller
- **Model Rotation**: Modify the `rotation` attributes to change how models are oriented
- **Colors**: Change the cylinder colors under each exhibit to match your theme

## Controls

- **Desktop**: Use WASD keys to move, mouse to look around, click on hotspots
- **Mobile**: Touch screen with one finger to move forward, two fingers to move backward
- **VR**: Compatible with VR headsets and controllers

## Technical Requirements

- Modern web browser with WebGL support
- No server required - can run locally
- Audio files should be in MP3 format
- 3D models should be in GLB format
- Images can be in PNG, JPG, or other web-compatible formats

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Tips for Best Results

1. **3D Models**: Keep file sizes reasonable (< 10MB per model) for faster loading
2. **Audio**: Use compressed MP3 files for better performance
3. **Images**: Optimize images for web (PNG for UI elements, JPG for textures)
4. **Testing**: Test on both desktop and mobile devices
5. **Content**: Keep captions concise and engaging

## Troubleshooting

- **Models not loading**: Check that your GLB files are valid and in the correct folder
- **Audio not playing**: Ensure MP3 files are properly encoded and in the audio folder
- **Images not showing**: Verify image files are in the images folder with correct names
- **Performance issues**: Reduce model complexity or image sizes

## License

This template is provided as-is for educational and personal use. Modify as needed for your projects.