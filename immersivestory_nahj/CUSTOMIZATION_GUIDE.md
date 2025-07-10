# Quick Customization Guide

## What You Need to Add

To use this template, you need to add the following files to the existing folders:

### Audio Files (add to `audio/` folder)
- `1.mp3` - Audio narration for exhibit 1
- `2.mp3` - Audio narration for exhibit 2  
- `3.mp3` - Audio narration for exhibit 3
- `ambient_nature.mp3` - Background ambient sound (optional)
- `click.mp3` - Click sound effect (optional)
- `teleport.mp3` - Teleport sound effect (optional)

### 3D Models (add to `models/` folder)
- `1.glb` - 3D model for exhibit 1
- `2.glb` - 3D model for exhibit 2
- `3.glb` - 3D model for exhibit 3
- `bench.glb` - Optional bench model

### Images (add to `images/` folder)
- `1.png` - Image 1 for slideshow
- `2.png` - Image 2 for slideshow
- `3.png` - Image 3 for slideshow
- `left-arrow.png` - Left navigation arrow
- `right-arrow.png` - Right navigation arrow
- `border.jpg` - Border texture
- `day.jpg` - Day sky texture
- `night.jpg` - Night sky texture
- `grass.jpg` - Ground texture
- `hotspot.png` - Hotspot icon

## What to Edit in the Code

### Update Captions (in `index.html`)

Find these sections and change the text:

```html
<!-- Exhibit 1 -->
spot="label: Caption 1; audio: #audio1; info: A short one to two sentence caption goes here."

<!-- Exhibit 2 -->  
spot="label: Caption 2; audio: #audio2; info: A short one to two sentence caption goes here."

<!-- Exhibit 3 -->
spot="label: Caption 3; audio: #audio3; info: A short one to two sentence caption goes here."
```

### Update Welcome Message (in `index.html`)

Find this line and change it:
```html
text="value: Welcome to the Immersive Story. Use WASD keys to move around. Click on the hotspots to learn more about each 3D model."
```

## File Format Requirements

- **3D Models**: Must be in GLB format
- **Audio**: Must be in MP3 format  
- **Images**: Can be PNG, JPG, or other web formats
- **File Sizes**: Keep models under 10MB for best performance

## Testing Your Changes

1. Add your files to the correct folders
2. Update the captions in `index.html`
3. Open `index.html` in a web browser
4. Test on both desktop and mobile devices

That's it! The template will automatically use your numbered files. 