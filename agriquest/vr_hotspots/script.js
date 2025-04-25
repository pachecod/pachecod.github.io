// Face camera component with cached camera
AFRAME.registerComponent("face-camera", {
  init: function () {
    this.cameraObj = document.querySelector("[camera]").object3D;
  },
  tick: function () {
    if (this.cameraObj) {
      this.el.object3D.lookAt(this.cameraObj.position);
    }
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
    popup: { type: "string", default: "" },
    popupWidth: { type: "number", default: 1.5 },
    popupHeight: { type: "number", default: 1 },
    popupColor: { type: "color", default: "#333333" },
  },

  init: function () {
    const data = this.data;
    const el = this.el;

    el.setAttribute("src", "#hotspot");
    el.setAttribute("class", "clickable");

    /******************  POPUP  ******************/
    if (data.popup) {
      /* info icon */
      const infoIcon = document.createElement("a-entity");
      infoIcon.setAttribute(
        "geometry",
        "primitive: plane; width: 4; height: 0.5"
      );
      infoIcon.setAttribute("material", "color: #00FF00");
      infoIcon.setAttribute(
        "text",
        "value: click for more info; align: center; color: black; width: 8"
      );
      infoIcon.setAttribute("position", "0 1 0");
      infoIcon.classList.add("clickable");
      infoIcon.setAttribute("animation__hover_in", {
        property: "scale",
        to: "1.1 1.1 1",
        dur: 200,
        easing: "easeOutQuad",
        startEvents: "mouseenter",
      });

      infoIcon.setAttribute("animation__hover_out", {
        property: "scale",
        to: "1 1 1",
        dur: 200,
        easing: "easeOutQuad",
        startEvents: "mouseleave",
      });
      el.appendChild(infoIcon);

      /* popup container */
      const popup = document.createElement("a-entity");
      popup.setAttribute("visible", "false");
      popup.setAttribute("position", "0 1.5 0");
      popup.setAttribute("look-at", "#cam");
      popup.setAttribute("animation__scale_in", {
        property: "scale",
        from: "0 0 0",
        to: "1 1 1",
        dur: 300,
        easing: "easeOutBack",
        startEvents: "popup-open",
      });
      popup.setAttribute("animation__scale_out", {
        property: "scale",
        to: "0 0 0",
        dur: 200,
        easing: "easeInQuad",
        startEvents: "popup-close",
      });
      /* background */
      const background = document.createElement("a-plane");
      background.setAttribute("color", data.popupColor);
      background.setAttribute("opacity", 0);
      background.setAttribute("width", data.popupWidth);
      background.setAttribute("height", data.popupHeight);
      background.setAttribute("animation__fade_in", {
        property: "material.opacity",
        from: 0,
        to: 0.95,
        dur: 300,
        easing: "easeOutQuad",
        startEvents: "popup-open",
      });
      background.setAttribute("animation__fade_out", {
        property: "material.opacity",
        to: 0,
        dur: 200,
        easing: "easeInQuad",
        startEvents: "popup-close",
      });
      popup.appendChild(background);
      /* text */
      const text = document.createElement("a-text");
      text.setAttribute("value", data.popup);
      text.setAttribute("wrap-count", 20);
      text.setAttribute("color", "white");
      text.setAttribute("position", "0 0 0.01");
      text.setAttribute("align", "center");
      popup.appendChild(text);

      /* close button */
      const closeButton = document.createElement("a-image");
      const margin = 0.3;
      closeButton.setAttribute(
        "position",
        `${data.popupWidth / 2 - margin} ${data.popupHeight / 2 - margin} 0.02`
      );
      closeButton.setAttribute("src", "#close"); // use the close.png
      closeButton.setAttribute("width", "0.4");
      closeButton.setAttribute("height", "0.4");
      closeButton.classList.add("clickable");
      popup.appendChild(closeButton);
      /* event wiring */
      infoIcon.addEventListener("click", function (e) {
        e.stopPropagation();
        const nowOpen = !popup.getAttribute("visible");
        popup.setAttribute("visible", nowOpen);
        popup.emit(nowOpen ? "popup-open" : "popup-close");
      });
      // Hover animations
      closeButton.setAttribute("animation__hover_in", {
        property: "scale",
        to: "1.2 1.2 1",
        dur: 200,
        easing: "easeOutQuad",
        startEvents: "mouseenter",
      });

      closeButton.setAttribute("animation__hover_out", {
        property: "scale",
        to: "1 1 1",
        dur: 200,
        easing: "easeOutQuad",
        startEvents: "mouseleave",
      });
      closeButton.addEventListener("click", (e) => {
        e.stopPropagation();
        popup.emit("popup-close"); // 1. trigger close animation
        setTimeout(() => {
          popup.setAttribute("visible", false); // 2. AFTER animation, actually hide
        }, 250); // match your animation duration (200ms closing animation + small buffer)
        infoIcon.setAttribute("visible", true);
      });

      popup.addEventListener("popup-open", () => {
        infoIcon.setAttribute("visible", "false");
      });
      popup.addEventListener("popup-close", () => {
        infoIcon.setAttribute("visible", "true");
      });

      el.appendChild(popup);
    }

    /******************  LABEL  ******************/
    if (data.label) {
      const labelContainer = document.createElement("a-entity");
      labelContainer.setAttribute("position", "0 -0.6 0");

      const bg = document.createElement("a-plane");
      bg.setAttribute("color", data.labelBackground);
      bg.setAttribute("opacity", 0.8);
      bg.setAttribute("width", data.label.length * 0.15 + data.labelPadding);
      bg.setAttribute("height", 0.3);
      bg.setAttribute("position", "0 0 -0.01");

      const textEl = document.createElement("a-text");
      textEl.setAttribute("value", data.label);
      textEl.setAttribute("align", "center");
      textEl.setAttribute("color", "#FFFFFF");

      labelContainer.appendChild(bg);
      labelContainer.appendChild(textEl);
      el.appendChild(labelContainer);
    }

    /******************  AUDIO  ******************/
    if (data.audio) {
      const audioEl = document.createElement("a-sound");
      audioEl.setAttribute("src", data.audio);
      audioEl.setAttribute("autoplay", "false");
      audioEl.setAttribute("loop", "true");
      el.appendChild(audioEl);

      const btn = document.createElement("a-image");
      btn.setAttribute("class", "clickable audio-control");
      btn.setAttribute("src", "#play"); // default to play.png
      btn.setAttribute("width", "0.5");
      btn.setAttribute("height", "0.5");
      btn.setAttribute("position", "0 -1 0.02");
      el.appendChild(btn);

      let audioReady = false;
      let isPlaying = false;

      const toggleAudio = () => {
        if (!audioReady) return;

        if (isPlaying) {
          audioEl.components.sound.stopSound();
          btn.emit("fadeout"); // start fade out
          setTimeout(() => {
            btn.setAttribute("src", "#play"); // change image after fadeout
            btn.emit("fadein"); // fade back in
          }, 200); // match your fadeout duration
        } else {
          audioEl.components.sound.playSound();
          btn.emit("fadeout");
          setTimeout(() => {
            btn.setAttribute("src", "#pause");
            btn.emit("fadein");
          }, 200);
        }

        isPlaying = !isPlaying;
      };

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!audioEl.components.sound) return;
        toggleAudio();
      });
      btn.addEventListener("triggerdown", (e) => {
        e.stopPropagation();
        if (!audioEl.components.sound) return;
        toggleAudio();
      });
      btn.setAttribute("animation__hover_in", {
        property: "scale",
        to: "1.2 1.2 1",
        dur: 200,
        easing: "easeOutQuad",
        startEvents: "mouseenter",
      });
      btn.setAttribute("animation__hover_out", {
        property: "scale",
        to: "1 1 1",
        dur: 200,
        easing: "easeOutQuad",
        startEvents: "mouseleave",
      });
      btn.setAttribute("animation__fadeout", {
        property: "material.opacity",
        to: 0,
        dur: 200,
        easing: "easeInQuad",
        startEvents: "fadeout",
      });

      btn.setAttribute("animation__fadein", {
        property: "material.opacity",
        to: 1,
        dur: 200,
        easing: "easeOutQuad",
        startEvents: "fadein",
      });
      audioEl.addEventListener("sound-loaded", () => {
        audioReady = true;
        audioEl.components.sound.stopSound();
      });
    }

    /******************  NAVIGATION  ******************/
    const navigate = () => {
      document.getElementById("skybox").setAttribute("src", data.linkto);
      document.getElementById("spots").emit("reloadspots", {
        newspots: data.spotgroup,
        currspots: el.parentElement.getAttribute("id"),
      });
    };

    el.addEventListener("click", navigate);
    el.addEventListener("triggerdown", navigate);
  },
});
