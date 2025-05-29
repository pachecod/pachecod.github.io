# Agriquest Vegetable Museum

## About This Project
This is a demo virtual world for Syracuse University's Agriquest project in which children in an after-school program learn about food, storytelling and immersive storytelling. It is built using the A-Frame WebXR platform along with custom JavaScript components that enhance the user experience across desktop, mobile, and VR platforms.

## Features
- **Immersive 3D Environment**: Explore vegetable exhibits in an interactive virtual space
- **Cross-Platform Compatibility**: Works on desktop, mobile devices, and VR headsets
- **Intuitive Controls**: 
  - Desktop: WASD/Arrow keys to move, mouse to look around
  - Mobile: Touch screen with one finger to move forward, two fingers to move backward
  - VR: Controller-based movement and teleportation
- **Interactive Hotspots**: Learn about different vegetables through informational displays and audio narration
- **Slideshow System**: Billboard-style information panels that always face the viewer
- **Day/Night Cycle**: Dynamic lighting changes for a more immersive experience

## How to View and Edit
1. Sign into Glitch and click "Remix to Edit" at the top right. This will give you your own copy of the project to modify.
2. Click the `index.html` file at left to view and edit the code.
3. Preview the output of the world by clicking "Preview" at the lower right, and then "Preview in a New Window".

## Understanding the Code Structure

### Main Components
- **Scene Setup**: The `<a-scene>` element contains the entire VR environment
- **Camera Rig**: Uses `enhanced-mobile-controls` for mobile compatibility and enforces ground-level movement
- **Interactive Elements**: Hotspots with the `spot` component provide information and audio playback
- **Physics System**: Prevents users from going through the floor or flying

### Custom Components
The project includes several custom A-Frame components:

- **face-camera**: Makes elements always face the user (with options to preserve Y-axis orientation)
- **spot**: Creates interactive hotspots with information, audio, and animation capabilities
- **enhanced-mobile-controls**: Provides touch-based navigation optimized for mobile devices
- **sound-effects**: Manages audio effects throughout the experience
- **day-night-cycle**: Creates dynamic lighting changes over time

## Adding Your Own Assets

### 3D Models
1. Go to [Sketchfab.com](https://sketchfab.com) and sign in.
2. Click Search and choose "Downloadable," and be sure that the Licenses section has Creative Commons licenses selected. The safest to use is CC Attribution. Be sure to save the attribution info to add to this README file later.
3. Download the smallest .GLB model you can find.
4. Click Assets at left in Glitch, Upload a New Asset, and then copy the URL.
5. Add the asset to the `<a-assets>` section of the HTML, following this pattern:

```html
<a-asset-item id="your-model-id" src="your-model-url.glb"></a-asset-item>
```

6. To make the model appear in your scene, add an entity with the model reference:

```html
<a-entity
  gltf-model="#your-model-id"
  position="x y z"
  scale="x y z"
  rotation="x y z"
></a-entity>
```

### Images
1. Upload an image to the Assets section in Glitch.
2. Add it to the `<a-assets>` section:

```html
<img id="your-image-id" src="your-image-url.jpg" />
```

3. Use the image in a plane or another suitable entity:

```html
<a-plane material="src: #your-image-id" position="x y z"></a-plane>
```

### Audio
1. Upload an audio file to the Assets section in Glitch.
2. Add it to the `<a-assets>` section:

```html
<audio id="your-audio-id" src="your-audio-url.mp3" preload="auto"></audio>
```

3. Reference the audio in a spot component:

```html
<a-entity spot="audio: #your-audio-id; label: Audio Label; info: Audio description"></a-entity>
```

## Customizing the Environment

### Adding New Exhibits
To add a new vegetable exhibit, follow this pattern:

```html
<a-entity id="new-exhibit" position="x y z">
  <!-- Vegetable Model -->
  <a-entity
    id="vegetable-model"
    gltf-model="#your-model-id"
    position="0 2 0"
    scale="x y z"
    rotation="x y z"
    shadow="cast: true; receive: true"
  ></a-entity>
  
  <!-- Exhibit Environment (Base) -->
  <a-entity
    geometry="primitive: cylinder; radius: 5; height: 0.1"
    position="0 0 0"
    material="color: #yourColor; roughness: 0.9"
  ></a-entity>
  
  <!-- Information Hotspot -->
  <a-entity
    id="hotspot"
    face-camera="preserveY: true"
    class="clickable"
    spot="label: Learn About Vegetable; audio: #your-audio-id; labelBackground: #333333; info: Information about the vegetable.; vegetableModel: #vegetable-model; revealAnimation: true"
    position="3 1.5 0"
  ></a-entity>
</a-entity>
```

### Position and Scale Finding
An easy way to find the correct position, scale, and rotation values:
1. View the scene
2. Press `Ctrl+Alt+I` to open the A-Frame Inspector
3. Select and manipulate objects visually
4. Note the position, rotation, and scale values displayed in the inspector
5. Copy these values into your code

### Modifying Mobile Controls
If you need to adjust the mobile control behavior, modify the `enhanced-mobile-controls` component in the code. The current implementation:
- Prevents flying by locking vertical movement to the ground plane
- Allows one-finger touch for forward movement and two-finger touch for backward movement
- Uses the direction the device is facing for movement direction (horizontally only)

## Troubleshooting

### Common Issues and Solutions

#### Scene Not Loading
- Check that all asset URLs are correct
- Look for JavaScript errors in the browser console
- Ensure the A-Frame library is loading correctly

#### Models Appear Too Large/Small
- Adjust the scale property of the entity
- Use the Inspector (Ctrl+Alt+I) to find appropriate values

#### Objects Are Floating or Sinking
- Check Y-position values
- Ensure ground plane is positioned correctly at Y=0

#### Mobile Controls Not Working
- Verify that device has motion and orientation permissions enabled
- Test in different browsers (Chrome on Android, Safari on iOS)
- Check for console errors

## Creator and Owner of This Code
The main developer for this code is Dan Pacheco, a Professor of Practice at Syracuse University. Feel free to email me at drpachec@syr.edu.

## Credits for Assets Used
This demo project uses the following Creative Commons-licensed objects from Sketchfab.

**Mushrooms**, Creative Commons licensed by Sketchfab user QumoDone: [https://sketchfab.com/3d-models/stylized-mushrooms-9d22e02ce2a548959b1c4c4c1d546842](https://sketchfab.com/3d-models/stylized-mushrooms-9d22e02ce2a548959b1c4c4c1d546842)

**Carrots**, Creative Commons licensed by Sketchfab user Meerschaum Digital: [https://sketchfab.com/3d-models/carrot-4cfcef5d26834657a0e1204d2ff32523](https://sketchfab.com/3d-models/carrot-4cfcef5d26834657a0e1204d2ff32523)

**Onions**, Creative Commons licensed by Sketchfab user mjk: [https://sketchfab.com/3d-models/purple-onion-70fdef1abc1744e3a3e0a828d6821fbf](https://sketchfab.com/3d-models/purple-onion-70fdef1abc1744e3a3e0a828d6821fbf)

## Technologies Used
- [A-Frame](https://aframe.io/) - WebXR framework
- [A-Frame Extras](https://github.com/c-frame/aframe-extras) - Additional components for A-Frame
- [A-Frame Physics System](https://github.com/c-frame/aframe-physics-system) - Physics implementation
- [Howler.js](https://howlerjs.com/) - Audio library for spatial sound

## License
This project is available under the MIT License.