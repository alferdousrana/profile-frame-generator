const frameText = document.getElementById("frameText");
const frameColor = document.getElementById("frameColor");
const logoUpload = document.getElementById("logoUpload");
const logoShape = document.getElementById("logoShape");
const logoBorderToggle = document.getElementById("logoBorderToggle");
const logoRadius = document.getElementById("logoRadius");
const radiusValue = document.getElementById("radiusValue");
const textCounter = document.getElementById("textCounter");
const userImageUpload = document.getElementById("userImageUpload");

const saveFrameBtn = document.getElementById("saveFrameBtn");
const downloadPngBtn = document.getElementById("downloadPngBtn");
const downloadJpgBtn = document.getElementById("downloadJpgBtn");

const circleTextPathText = document.getElementById("circleTextPathText");
const logoBox = document.getElementById("logoBox");
const logoImage = document.getElementById("logoImage");
const logoPlaceholder = document.getElementById("logoPlaceholder");
const userImage = document.getElementById("userImage");
const placeholderText = document.getElementById("placeholderText");
const frameCanvas = document.getElementById("frameCanvas");

const STORAGE_KEY = "profile_frame_config";
const MAX_TEXT_LENGTH = 170;

const state = {
  text: "Place Here Your Round Text, Maximum 170 Characters.",
  color: "#a34797",
  logoShape: "circle",
  logoBorder: false,
  logoRadius: 20,
  logoData: null,
  userImageData: null
};

function updateTextCounter() {
  const currentLength = frameText.value.length;
  textCounter.textContent = `${currentLength}/${MAX_TEXT_LENGTH}`;
}

function createCircularText(text) {
  const cleanText = text && text.trim()
    ? text.trim()
    : "Sample Round Text Here";

  circleTextPathText.textContent = cleanText;
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

  updateLogoBorder();
}

function updateLogoBorder() {
  if (state.logoBorder) {
    logoBox.style.border = `2px solid ${state.color}`;
  } else {
    logoBox.style.border = "2px solid #ffffff";
  }
}

function updateLogoShape(shape) {
  logoBox.classList.remove("circle", "square", "rectangle");
  logoBox.classList.add(shape);

  if (shape === "circle") {
    logoBox.style.borderRadius = "50%";
  } else {
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

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      resolve(e.target.result);
    };

    reader.onerror = function () {
      reject(new Error("Failed to read image file."));
    };

    reader.readAsDataURL(file);
  });
}

function setLogoImage(dataUrl) {
  if (!dataUrl) return;

  logoImage.src = dataUrl;
  logoImage.hidden = false;

  if (logoPlaceholder) {
    logoPlaceholder.style.display = "none";
  }

  state.logoData = dataUrl;
}

function clearLogoImage() {
  logoImage.removeAttribute("src");
  logoImage.hidden = true;

  if (logoPlaceholder) {
    logoPlaceholder.style.display = "block";
  }

  state.logoData = null;
}

function setUserImage(dataUrl) {
  if (!dataUrl) return;

  userImage.src = dataUrl;
  userImage.hidden = false;
  placeholderText.style.display = "none";
  state.userImageData = dataUrl;
}

function clearUserImage() {
  userImage.removeAttribute("src");
  userImage.hidden = true;
  placeholderText.style.display = "block";
  state.userImageData = null;
}

function saveConfigToLocalStorage() {
  const config = {
    text: state.text,
    color: state.color,
    logoShape: state.logoShape,
    logoBorder: state.logoBorder,
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

    state.text = typeof parsed.text === "string" ? parsed.text : state.text;
    state.color = typeof parsed.color === "string" ? parsed.color : state.color;
    state.logoShape = typeof parsed.logoShape === "string" ? parsed.logoShape : state.logoShape;
    state.logoBorder = typeof parsed.logoBorder === "boolean" ? parsed.logoBorder : state.logoBorder;
    state.logoRadius = typeof parsed.logoRadius === "number" ? parsed.logoRadius : state.logoRadius;
    state.logoData = typeof parsed.logoData === "string" ? parsed.logoData : null;

    applyStateToUI();
  } catch (error) {
    console.error("Failed to load saved config:", error);
    applyStateToUI();
  }
}

function applyStateToUI() {
  frameText.value = state.text;
  frameColor.value = state.color;
  logoShape.value = state.logoShape;
  logoBorderToggle.checked = state.logoBorder;
  logoRadius.value = state.logoRadius;

  updateTextCounter();
  createCircularText(state.text);
  updateFrameColor(state.color);
  updateLogoShape(state.logoShape);
  updateLogoRadius(state.logoRadius);
  updateLogoBorder();

  if (state.logoData) {
    setLogoImage(state.logoData);
  } else {
    clearLogoImage();
  }

  clearUserImage();
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
  let oldPlaceholderDisplay = "";
  let oldLogoPlaceholderDisplay = "";
  let exportNode = null;

  try {
    oldPlaceholderDisplay = placeholderText ? placeholderText.style.display : "";
    oldLogoPlaceholderDisplay = logoPlaceholder ? logoPlaceholder.style.display : "";

    if (userImage && !userImage.hidden && placeholderText) {
      placeholderText.style.display = "none";
    }

    if (logoImage && !logoImage.hidden && logoPlaceholder) {
      logoPlaceholder.style.display = "none";
    }

    await waitForImageLoad(userImage);
    await waitForImageLoad(logoImage);

    exportNode = frameCanvas.cloneNode(true);
    exportNode.style.margin = "0";
    exportNode.style.transform = "none";
    exportNode.style.position = "fixed";
    exportNode.style.left = "-99999px";
    exportNode.style.top = "0";
    exportNode.style.zIndex = "-1";
    exportNode.style.background = "transparent";

    document.body.appendChild(exportNode);

    const clonedLogoBox = exportNode.querySelector("#logoBox");
    const clonedLogoImage = exportNode.querySelector("#logoImage");
    const clonedSvg = exportNode.querySelector("#textRingSvg");
    const clonedPlaceholder = exportNode.querySelector("#placeholderText");
    const clonedLogoPlaceholder = exportNode.querySelector("#logoPlaceholder");

    if (clonedPlaceholder && userImage && !userImage.hidden) {
      clonedPlaceholder.style.display = "none";
    }

    if (clonedLogoPlaceholder && logoImage && !logoImage.hidden) {
      clonedLogoPlaceholder.style.display = "none";
    }

    if (clonedSvg) {
      clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }

    if (clonedLogoBox) {
      clonedLogoBox.style.boxSizing = "border-box";
      clonedLogoBox.style.display = "flex";
      clonedLogoBox.style.alignItems = "center";
      clonedLogoBox.style.justifyContent = "center";
      clonedLogoBox.style.overflow = "hidden";
      clonedLogoBox.style.padding = "8px";
      clonedLogoBox.style.border = state.logoBorder
        ? `2px solid ${state.color}`
        : "2px solid #ffffff";
    }

    if (clonedLogoImage) {
      clonedLogoImage.style.maxWidth = "100%";
      clonedLogoImage.style.maxHeight = "100%";
      clonedLogoImage.style.width = "auto";
      clonedLogoImage.style.height = "auto";
      clonedLogoImage.style.objectFit = "contain";
      clonedLogoImage.style.display = clonedLogoImage.hidden ? "none" : "block";
      clonedLogoImage.style.padding = "0";
    }

    const canvas = await html2canvas(exportNode, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    if (format === "png") {
      const pngUrl = canvas.toDataURL("image/png");
      downloadDataUrl(pngUrl, "profile-frame.png");
    } else {
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
  } catch (error) {
    console.error("Export failed:", error);
    alert("Export failed: " + (error?.message || error));
  } finally {
    if (exportNode && exportNode.parentNode) {
      exportNode.parentNode.removeChild(exportNode);
    }

    if (placeholderText) {
      placeholderText.style.display = oldPlaceholderDisplay;
    }

    if (logoPlaceholder) {
      logoPlaceholder.style.display = oldLogoPlaceholderDisplay;
    }
  }
}

frameText.addEventListener("input", function () {
  if (this.value.length > MAX_TEXT_LENGTH) {
    this.value = this.value.slice(0, MAX_TEXT_LENGTH);
  }

  state.text = this.value;
  updateTextCounter();
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

logoBorderToggle.addEventListener("change", function () {
  state.logoBorder = this.checked;
  updateLogoBorder();
});

logoRadius.addEventListener("input", function () {
  state.logoRadius = Number(this.value);
  updateLogoRadius(state.logoRadius);
});

logoUpload.addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) {
    clearLogoImage();
    saveConfigToLocalStorage();
    return;
  }

  try {
    const dataUrl = await readImageFile(file);
    setLogoImage(dataUrl);
    saveConfigToLocalStorage();
  } catch (error) {
    console.error("Logo upload failed:", error);
    alert("Logo upload failed.");
  }
});

userImageUpload.addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) {
    clearUserImage();
    return;
  }

  try {
    const dataUrl = await readImageFile(file);
    setUserImage(dataUrl);
  } catch (error) {
    console.error("User image upload failed:", error);
    alert("User image upload failed.");
  }
});

saveFrameBtn.addEventListener("click", function () {
  saveConfigToLocalStorage();
  alert("Frame saved successfully.");
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