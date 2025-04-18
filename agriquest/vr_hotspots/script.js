// Face camera component
AFRAME.registerComponent("face-camera", {
  tick: function () {
    const camera = document.querySelector("[camera]").object3D;
    this.el.object3D.lookAt(camera.position);
  },
});

// Hotspots logic
AFRAME.registerComponent("hotspots", {
  init: function () {
    this.el.addEventListener("reloadspots", function (evt) {
      const currspotgroup = document.getElementById(evt.detail.currspots);
      const newspotgroup = document.getElementById(evt.detail.newspots);
      currspotgroup.setAttribute("visible", "false");
      newspotgroup.setAttribute("visible", "true");
    });
  },
});

// Spot component with VR support
AFRAME.registerComponent("spot", {
  schema: {
    linkto: { type: "string", default: "" },
    spotgroup: { type: "string", default: "" },
    label: { type: "string", default: "" },
    audio: { type: "string", default: "" },
    labelBackground: { type: "color", default: "#333333" },
    labelPadding: { type: "number", default: 0.2 },
    lineHeight: { type: "number", default: 0.4 },
  },

  init: function () {
    const data = this.data;
    const el = this.el;

    el.setAttribute("src", "#hotspot");
    el.setAttribute("class", "clickable");

    // Label creation
    if (data.label) {
      const labelContainer = document.createElement("a-entity");
      labelContainer.setAttribute("position", "0 -0.6 0");

      const background = document.createElement("a-plane");
      background.setAttribute("color", data.labelBackground);
      background.setAttribute("opacity", 0.8);
      background.setAttribute(
        "width",
        data.label.length * 0.15 + data.labelPadding
      );
      background.setAttribute("height", 0.3);
      background.setAttribute("position", "0 0 -0.01");

      const textEl = document.createElement("a-text");
      textEl.setAttribute("value", data.label);
      textEl.setAttribute("align", "center");
      textEl.setAttribute("color", "#FFFFFF");

      labelContainer.appendChild(background);
      labelContainer.appendChild(textEl);
      el.appendChild(labelContainer);
    }

    // Audio handling
    if (data.audio) {
      let audioEl = document.createElement("a-sound");
      audioEl.setAttribute("src", data.audio);
      audioEl.setAttribute("autoplay", "false");
      audioEl.setAttribute("loop", "true");
      el.appendChild(audioEl);

      const button = document.createElement("a-plane");
      button.setAttribute("class", "clickable audio-control");
      button.setAttribute("color", "#ff0000");
      button.setAttribute("width", "0.5");
      button.setAttribute("height", "0.3");
      button.setAttribute("position", "0 -1 0");
      button.setAttribute("text", "value: Play; align: center; color: #FFF");
      el.appendChild(button);

      let audioReady = false;
      let isPlaying = false;

      const toggleAudio = () => {
        if (!audioReady) return;

        if (isPlaying) {
          audioEl.components.sound.stopSound();
          button.setAttribute(
            "text",
            "value: Play; align: center; color: #FFF"
          );
        } else {
          audioEl.components.sound.playSound();
          button.setAttribute(
            "text",
            "value: Pause; align: center; color: #FFF"
          );
        }
        isPlaying = !isPlaying;
      };

      const handleAudioButton = (evt) => {
        evt.stopPropagation();
        if (!audioEl.components.sound) return;
        toggleAudio();
      };

      button.addEventListener("click", handleAudioButton);
      button.addEventListener("triggerdown", handleAudioButton);

      audioEl.addEventListener("sound-loaded", () => {
        audioReady = true;
        audioEl.components.sound.stopSound();
      });
    }

    // Navigation handling
    const handleHotspotClick = (evt) => {
      if (evt.target !== el && !el.contains(evt.target)) return;

      const sky = document.getElementById("skybox");
      sky.setAttribute("src", data.linkto);

      const spotcomp = document.getElementById("spots");
      const currspots = el.parentElement.getAttribute("id");
      spotcomp.emit("reloadspots", {
        newspots: data.spotgroup,
        currspots: currspots,
      });
    };

    el.addEventListener("click", handleHotspotClick);
    el.addEventListener("triggerdown", handleHotspotClick);
  },
});
