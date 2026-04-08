const frameText = document.getElementById("frameText");
const frameColor = document.getElementById("frameColor");
const logoUpload = document.getElementById("logoUpload");
const logoShape = document.getElementById("logoShape");
const logoRadius = document.getElementById("logoRadius");
const radiusValue = document.getElementById("radiusValue");
const userImageUpload = document.getElementById("userImageUpload");

const saveFrameBtn = document.getElementById("saveFrameBtn");
const downloadPngBtn = document.getElementById("downloadPngBtn");
const downloadJpgBtn = document.getElementById("downloadJpgBtn");

const circleText = document.getElementById("circleText");
const circleTextPathText = document.getElementById("circleTextPathText");
const outerRing = document.querySelector(".outer-ring");
const logoBox = document.getElementById("logoBox");
const logoImage = document.getElementById("logoImage");
const logoPlaceholder = document.getElementById("logoPlaceholder");
const userImage = document.getElementById("userImage");
const placeholderText = document.getElementById("placeholderText");
const frameCanvas = document.getElementById("frameCanvas");

const STORAGE_KEY = "profile_frame_config";

const state = {
  text: '" The World Health Day 2026  “Together for health. Stand with science.” The World Health Day 2026 "',
  color: "#a34797",
  logoShape: "circle",
  logoRadius: 20,
  logoData: null,
  userImageData: null
};

function createCircularText(text) {
  const cleanText = text && text.trim()
    ? text.trim()
    : '" Sample Frame Text Around Circle "';

  let finalText = cleanText;

  while (finalText.length < 120) {
    finalText += "   " + cleanText;
  }

  circleTextPathText.textContent = finalText;
}

function updateFrameColor(color) {
  document.documentElement.style.setProperty("--frame-color", color);

  const dynamicStyle =
    document.getElementById("dynamicFrameStyle") || document.createElement("style");

  dynamicStyle.id = "dynamicFrameStyle";
  dynamicStyle.innerHTML = `
    #logoPlaceholder {
      color: ${color} !important;
    }
  `;
  document.head.appendChild(dynamicStyle);
}

function updateLogoShape(shape) {
  logoBox.classList.remove("circle", "square", "rectangle");
  logoBox.classList.add(shape);

  if (shape === "circle") {
    logoBox.style.width = "110px";
    logoBox.style.height = "110px";
    logoBox.style.borderRadius = "50%";
  } else if (shape === "square") {
    logoBox.style.width = "110px";
    logoBox.style.height = "110px";
    logoBox.style.borderRadius = `${state.logoRadius}px`;
  } else if (shape === "rectangle") {
    logoBox.style.width = "140px";
    logoBox.style.height = "90px";
    logoBox.style.borderRadius = `${state.logoRadius}px`;
  }
}

function updateLogoRadius(radius) {
  radiusValue.textContent = `${radius}px`;

  if (state.logoShape === "circle") {
    logoBox.style.borderRadius = "50%";
  } else {
    logoBox.style.borderRadius = `${radius}px`;
  }
}

function readImageFile(file, callback) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    callback(e.target.result);
  };
  reader.readAsDataURL(file);
}

function setLogoImage(dataUrl) {
  if (!dataUrl) return;

  logoImage.src = dataUrl;
  logoImage.hidden = false;
  logoPlaceholder.style.display = "none";
  state.logoData = dataUrl;
}

function setUserImage(dataUrl) {
  if (!dataUrl) return;

  userImage.src = dataUrl;
  userImage.hidden = false;
  placeholderText.style.display = "none";
  state.userImageData = dataUrl;
}

function saveConfigToLocalStorage() {
  const config = {
    text: state.text,
    color: state.color,
    logoShape: state.logoShape,
    logoRadius: state.logoRadius,
    logoData: state.logoData
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function loadConfigFromLocalStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    applyStateToUI();
    return;
  }

  try {
    const parsed = JSON.parse(saved);

    state.text = parsed.text || state.text;
    state.color = parsed.color || state.color;
    state.logoShape = parsed.logoShape || state.logoShape;
    state.logoRadius =
      typeof parsed.logoRadius === "number" ? parsed.logoRadius : state.logoRadius;
    state.logoData = parsed.logoData || null;

    applyStateToUI();

    if (state.logoData) {
      setLogoImage(state.logoData);
    }
  } catch (error) {
    console.error("Failed to load saved config:", error);
    applyStateToUI();
  }
}

function applyStateToUI() {
  frameText.value = state.text;
  frameColor.value = state.color;
  logoShape.value = state.logoShape;
  logoRadius.value = state.logoRadius;

  createCircularText(state.text);
  updateFrameColor(state.color);
  updateLogoShape(state.logoShape);
  updateLogoRadius(state.logoRadius);
}

function downloadDataUrl(dataUrl, fileName) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
function waitForImageLoad(img) {
  return new Promise((resolve) => {
    if (!img || img.hidden || !img.src) {
      resolve();
      return;
    }

    if (img.complete) {
      resolve();
      return;
    }

    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
}

async function exportFrame(format) {
  try {
    const oldPlaceholderDisplay = placeholderText.style.display;
    const oldLogoPlaceholderDisplay = logoPlaceholder.style.display;

    if (userImage.hidden === false) {
      placeholderText.style.display = "none";
    }

    if (logoImage.hidden === false) {
      logoPlaceholder.style.display = "none";
    }

    await waitForImageLoad(userImage);
    await waitForImageLoad(logoImage);

    const canvas = await html2canvas(frameCanvas, {
      backgroundColor: null,
      scale: 3,
      useCORS: true,
      width: frameCanvas.offsetWidth,
      height: frameCanvas.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        const clonedLogoBox = clonedDoc.getElementById("logoBox");
        const clonedLogoImage = clonedDoc.getElementById("logoImage");

        if (clonedLogoBox) {
          clonedLogoBox.style.boxSizing = "border-box";
          clonedLogoBox.style.padding = "8px";
          clonedLogoBox.style.display = "flex";
          clonedLogoBox.style.alignItems = "center";
          clonedLogoBox.style.justifyContent = "center";
          clonedLogoBox.style.overflow = "hidden";
        }

        if (clonedLogoImage) {
          clonedLogoImage.style.maxWidth = "100%";
          clonedLogoImage.style.maxHeight = "100%";
          clonedLogoImage.style.width = "auto";
          clonedLogoImage.style.height = "auto";
          clonedLogoImage.style.objectFit = "contain";
          clonedLogoImage.style.display = "block";
          clonedLogoImage.style.padding = "0";
        }
      }
    });

    if (format === "png") {
      const pngUrl = canvas.toDataURL("image/png");
      downloadDataUrl(pngUrl, "profile-frame.png");
    } else if (format === "jpg") {
      const jpgCanvas = document.createElement("canvas");
      jpgCanvas.width = canvas.width;
      jpgCanvas.height = canvas.height;

      const ctx = jpgCanvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
      ctx.drawImage(canvas, 0, 0);

      const jpgUrl = jpgCanvas.toDataURL("image/jpeg", 0.95);
      downloadDataUrl(jpgUrl, "profile-frame.jpg");
    }

    placeholderText.style.display = oldPlaceholderDisplay;
    logoPlaceholder.style.display = oldLogoPlaceholderDisplay;
  } catch (error) {
    console.error("Export failed:", error);
    alert("Export failed. Please try again.");
  }
}

frameText.addEventListener("input", function () {
  state.text = this.value;
  createCircularText(state.text);
});

frameColor.addEventListener("input", function () {
  state.color = this.value;
  updateFrameColor(state.color);
});

logoShape.addEventListener("change", function () {
  state.logoShape = this.value;
  updateLogoShape(state.logoShape);
  updateLogoRadius(state.logoRadius);
});

logoRadius.addEventListener("input", function () {
  state.logoRadius = Number(this.value);
  updateLogoRadius(state.logoRadius);
});

logoUpload.addEventListener("change", function () {
  const file = this.files[0];
  readImageFile(file, setLogoImage);
});

userImageUpload.addEventListener("change", function () {
  const file = this.files[0];
  readImageFile(file, setUserImage);
});

saveFrameBtn.addEventListener("click", function () {
  saveConfigToLocalStorage();
  alert("Frame saved to localStorage.");
});

downloadPngBtn.addEventListener("click", async function () {
  await exportFrame("png");
});

downloadJpgBtn.addEventListener("click", async function () {
  await exportFrame("jpg");
});

window.addEventListener("resize", function () {
  createCircularText(state.text);
});

loadConfigFromLocalStorage();