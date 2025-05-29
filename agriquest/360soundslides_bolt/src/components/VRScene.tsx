import React from 'react';
import { useStore } from '../store';

export const VRScene: React.FC = () => {
  const { currentPanorama } = useStore();
  
  return (
    <a-scene embedded background="color: #ECECEC" vr-mode-ui="enabled: true">
      {/* Assets */}
      <a-assets>
        {/* Panoramas */}
        <img id="point1" src="https://images.pexels.com/photos/3389817/pexels-photo-3389817.jpeg" />
        <img id="point2" src="https://images.pexels.com/photos/4388593/pexels-photo-4388593.jpeg" />

        {/* Hotspot icon */}
        <img id="hotspot" src="/images/hotspot_yellow.png" />
        
        {/* Play/Pause icons */}
        <img id="play" src="/images/play.png" />
        <img id="pause" src="/images/pause.png" />
        
        {/* Cursor ring for gaze */}
        <img id="ring" src="/images/ring.png" />
      </a-assets>

      {/* Hotspot groups */}
      <a-entity id="spots">
        {/* Group 1: Forest Scene */}
        <a-entity id="group-point1" visible={currentPanorama === 'point1'}>
          <a-image
            className="clickable hotspot-animation"
            src="#hotspot"
            position="0 1.6 -2"
            scale="0.6 0.6 0.6"
            spot="linkto:#point2; 
                  spotgroup:group-point2; 
                  audio:audio2;
                  popup:A serene forest path surrounded by tall trees; 
                  popupColor:#F0F0F0"
          >
            {/* Controls */}
            <a-entity position="0 -1 0">
              {/* Play/Pause buttons */}
              <a-image
                className="clickable"
                src="#play"
                position="-0.5 0 0"
                width="0.5"
                height="0.5"
                play-audio="panorama:group-point1"
              ></a-image>
              <a-image
                className="clickable"
                src="#pause"
                position="0.5 0 0"
                width="0.5"
                height="0.5"
                pause-audio="panorama:group-point1"
              ></a-image>
              
              {/* Caption button */}
              <a-entity position="0 -0.6 0">
                <a-plane
                  color="#0088FF"
                  width="1.5"
                  height="0.5"
                  opacity="0.8"
                  className="clickable"
                  show-description="panorama:group-point1;
                                   text:A peaceful forest trail winding through majestic trees. The sunlight filters through the canopy, creating a magical atmosphere."
                ></a-plane>
                <a-text
                  value="Caption"
                  align="center"
                  color="white"
                  width="4"
                  position="0 0 0.1"
                ></a-text>
              </a-entity>
            </a-entity>
          </a-image>
        </a-entity>
        
        {/* Group 2: Mountain Scene */}
        <a-entity id="group-point2" visible={currentPanorama === 'point2'}>
          <a-image
            className="clickable hotspot-animation"
            src="#hotspot"
            position="-1 1.6 -2"
            scale="0.6 0.6 0.6"
            spot="linkto:#point1; 
                  spotgroup:group-point1; 
                  audio:audio1;
                  popup:A breathtaking mountain vista with snow-capped peaks; 
                  popupColor:#F0F0F0"
          >
            {/* Controls */}
            <a-entity position="0 -1 0">
              {/* Play/Pause buttons */}
              <a-image
                className="clickable"
                src="#play"
                position="-0.5 0 0"
                width="0.5"
                height="0.5"
                play-audio="panorama:group-point2"
              ></a-image>
              <a-image
                className="clickable"
                src="#pause"
                position="0.5 0 0"
                width="0.5"
                height="0.5"
                pause-audio="panorama:group-point2"
              ></a-image>
              
              {/* Caption button */}
              <a-entity position="0 -0.6 0">
                <a-plane
                  color="#0088FF"
                  width="1.5"
                  height="0.5"
                  opacity="0.8"
                  className="clickable"
                  show-description="panorama:group-point2;
                                   text:A stunning mountain landscape stretches before you. Snow-capped peaks pierce the clouds while the valley below is bathed in golden sunlight."
                ></a-plane>
                <a-text
                  value="Caption"
                  align="center"
                  color="white"
                  width="4"
                  position="0 0 0.1"
                ></a-text>
              </a-entity>
            </a-entity>
          </a-image>
        </a-entity>
      </a-entity>

      {/* The sky (panorama) */}
      <a-sky id="skybox" src={`#${currentPanorama}`}></a-sky>

      {/* Camera with both mouse and gaze-based cursors and raycaster */}
      <a-entity id="cam" camera look-controls position="0 1.6 0">
        {/* Mouse-based cursor for non-VR mode */}
        <a-entity 
          cursor="rayOrigin: mouse; fuse: false"
          raycaster="objects: .clickable; far: 10"
          id="mouse-cursor"
          visible="true"
        ></a-entity>
        
        {/* Gaze-based cursor for VR mode */}
        <a-entity
          cursor="fuse: false"
          raycaster="objects: .clickable; far: 10"
          position="0 0 -1"
          geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
          material="color: white; shader: flat"
          id="gaze-cursor"
          visible="false"
        ></a-entity>
      </a-entity>
    </a-scene>
  );
};