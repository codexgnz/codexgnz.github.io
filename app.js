const input = document.querySelector("#url-input");
const counter = document.querySelector("#counter");
const fieldNote = document.querySelector("#field-note");
const previewStatus = document.querySelector("#preview-status");
const qrPlaceholder = document.querySelector("#qr-placeholder");
const qrCode = document.querySelector("#qr-code");
const downloadButton = document.querySelector("#download-button");
const copyButton = document.querySelector("#copy-button");
let generatedUrl = "";
let destinationUrl = "";
let rotationTimer = 0;
let countdownTimer = 0;
let requestVersion = 0;
let currentExpiresAt = 0;
let copyFeedbackUntil = 0;
const QR_TTL_MS = 20_000;

function handleStaticQrLink() {
  const params = new URLSearchParams(window.location.search);
  const target = params.get("qr");
  const expiresAt = Number(params.get("expires"));
  if (!target || !Number.isFinite(expiresAt)) return;

  let destination;
  try {
    destination = new URL(target);
  } catch {
    window.location.replace(new URL("expired.html", window.location.href));
    return;
  }

  if (!["http:", "https:"].includes(destination.protocol)) {
    window.location.replace(new URL("expired.html", window.location.href));
    return;
  }

  if (Date.now() >= expiresAt) {
    window.location.replace(new URL("expired.html", window.location.href));
    return;
  }

  window.location.replace(destination.href);
}

handleStaticQrLink();

function stopTimers() {
  window.clearTimeout(rotationTimer);
  window.clearInterval(countdownTimer);
}

function setInvalid(message) {
  stopTimers();
  requestVersion += 1;
  input.setAttribute("aria-invalid", "true");
  fieldNote.textContent = message;
  fieldNote.classList.add("error");
  previewStatus.textContent = "Periksa tautan Anda";
  previewStatus.classList.add("error");
  qrCode.hidden = true;
  qrPlaceholder.hidden = false;
  downloadButton.disabled = true;
  copyButton.disabled = true;
  generatedUrl = "";
  destinationUrl = "";
}

function updateCountdown(expiresAt) {
  if (Date.now() < copyFeedbackUntil) {
    previewStatus.textContent = "Tautan tujuan tersalin";
    return;
  }
  const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
  previewStatus.textContent = `QR kedaluwarsa dalam 00:${String(remaining).padStart(2, "0")}`;
}

async function issueQr(value, version) {
  stopTimers();
  previewStatus.textContent = "Membuat QR baru...";
  try {
    const response = await fetch("/api/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationUrl: value })
    });
    let result;
    if (response.status === 404 || response.status === 405) {
      const expiresAt = Date.now() + QR_TTL_MS;
      const staticQrUrl = new URL("./", window.location.href);
      staticQrUrl.searchParams.set("qr", value);
      staticQrUrl.searchParams.set("expires", String(expiresAt));
      result = { path: staticQrUrl.href, expiresAt, isStatic: true };
    } else {
      result = await response.json();
      if (!response.ok) throw new Error(result.error || "QR tidak dapat dibuat.");
    }
    if (version !== requestVersion) return;

    const qrUrl = result.isStatic
      ? result.path
      : new URL(result.path, window.location.origin).href;
    qrCode.replaceChildren();
    new QRCode(qrCode, {
      text: qrUrl,
      width: 224,
      height: 224,
      colorDark: "#183b30",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });

    generatedUrl = qrUrl;
    destinationUrl = value;
    qrCode.hidden = false;
    qrPlaceholder.hidden = true;
    downloadButton.disabled = false;
    copyButton.disabled = false;

    const expiresAt = result.expiresAt;
    currentExpiresAt = expiresAt;
    copyFeedbackUntil = 0;
    updateCountdown(expiresAt);
    countdownTimer = window.setInterval(() => updateCountdown(expiresAt), 250);
    rotationTimer = window.setTimeout(() => {
      qrCode.hidden = true;
      qrPlaceholder.hidden = false;
      downloadButton.disabled = true;
      issueQr(value, version);
    }, Math.max(0, expiresAt - Date.now()));
  } catch (error) {
    if (version !== requestVersion) return;
    previewStatus.textContent = "QR gagal dibuat";
    previewStatus.classList.add("error");
    fieldNote.textContent = error.message || "Tidak dapat terhubung ke server.";
    fieldNote.classList.add("error");
    downloadButton.disabled = true;
    copyButton.disabled = true;
  }
}

function renderQr() {
  stopTimers();
  const version = ++requestVersion;
  const value = input.value.trim();
  counter.textContent = `${input.value.length} / 2048`;
  input.setAttribute("aria-invalid", "false");
  fieldNote.textContent = "QR berganti tiap 20 detik dan tautan QR akan kedaluwarsa.";
  fieldNote.classList.remove("error");
  previewStatus.classList.remove("error");

  if (!value) {
    qrCode.hidden = true;
    qrPlaceholder.hidden = false;
    previewStatus.textContent = "Menunggu tautan";
    downloadButton.disabled = true;
    copyButton.disabled = true;
    generatedUrl = "";
    destinationUrl = "";
    return;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(value);
  } catch {
    setInvalid("Masukkan tautan lengkap, termasuk https://");
    return;
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol) || !parsedUrl.hostname.includes(".")) {
    setInvalid("Tautan harus memakai alamat web http:// atau https://");
    return;
  }

  if (!window.QRCode) {
    setInvalid("Generator QR gagal dimuat. Periksa koneksi internet lalu muat ulang.");
    return;
  }

  qrCode.hidden = true;
  qrPlaceholder.hidden = false;
  downloadButton.disabled = true;
  copyButton.disabled = true;
  issueQr(value, version);
}

input.addEventListener("input", renderQr);

downloadButton.addEventListener("click", () => {
  const qrCanvas = qrCode.querySelector("canvas");
  if (!qrCanvas || !generatedUrl) return;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(qrCanvas, 16, 16, 224, 224);
  const link = document.createElement("a");
  link.download = "ruang-qr.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

copyButton.addEventListener("click", async () => {
  if (!destinationUrl) return;
  try {
    await navigator.clipboard.writeText(destinationUrl);
  } catch {
    input.focus();
    input.select();
    const copied = document.execCommand("copy");
    if (!copied) {
      previewStatus.textContent = "Tautan siap disalin";
      return;
    }
  }
  copyFeedbackUntil = Date.now() + 1500;
  previewStatus.textContent = "Tautan tujuan tersalin";
  window.setTimeout(() => {
    if (generatedUrl) updateCountdown(currentExpiresAt);
  }, 1800);
});
