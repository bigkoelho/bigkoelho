const $ = (id) => document.getElementById(id);

const dropzone = $("dropzone");
const fileInput = $("fileInput");
const fileCard = $("fileCard");
const submitBtn = $("submitBtn");
const statusBox = $("status");
const errorBox = $("error");
const resultBox = $("result");
const recordBtn = $("recordBtn");
const recordTime = $("recordTime");

let selectedFile = null;
let recorder = null;
let recordChunks = [];
let recordTimer = null;
let lastResult = null;
let activeTab = "text";

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};

const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

function setFile(file) {
  selectedFile = file;
  $("fileName").textContent = file.name;
  $("fileSize").textContent = formatSize(file.size);
  fileCard.hidden = false;
  submitBtn.disabled = false;
  errorBox.hidden = true;
}

function clearFile() {
  selectedFile = null;
  fileInput.value = "";
  fileCard.hidden = true;
  submitBtn.disabled = true;
}

dropzone.addEventListener("click", () => fileInput.click());
$("browseBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  fileInput.click();
});
$("clearBtn").addEventListener("click", clearFile);

fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) setFile(fileInput.files[0]);
});

["dragenter", "dragover"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add("drag");
  })
);

["dragleave", "drop"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.remove("drag");
  })
);

dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file) setFile(file);
});

recordBtn.addEventListener("click", async () => {
  if (recorder && recorder.state === "recording") {
    recorder.stop();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordChunks = [];
    recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordChunks.push(e.data);
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      clearInterval(recordTimer);
      recordBtn.classList.remove("active");
      $("recordLabel").textContent = "Gravar do microfone";
      recordTime.hidden = true;

      const blob = new Blob(recordChunks, { type: "audio/webm" });
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      setFile(new File([blob], `gravacao-${stamp}.webm`, { type: "audio/webm" }));
    };

    recorder.start();
    recordBtn.classList.add("active");
    $("recordLabel").textContent = "Parar gravação";
    recordTime.hidden = false;

    const started = Date.now();
    recordTime.textContent = "00:00";
    recordTimer = setInterval(() => {
      recordTime.textContent = formatTime((Date.now() - started) / 1000);
    }, 500);
  } catch {
    showError("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
  }
});

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.hidden = false;
}

submitBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  const body = new FormData();
  body.append("file", selectedFile);
  body.append("language", $("language").value);
  body.append("task", $("task").value);

  submitBtn.disabled = true;
  statusBox.hidden = false;
  errorBox.hidden = true;
  resultBox.hidden = true;

  try {
    const res = await fetch("/api/transcribe", { method: "POST", body });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.detail || `Falha na transcrição (HTTP ${res.status})`);
    }

    lastResult = data;
    render(data);
  } catch (err) {
    showError(err.message || "Erro inesperado durante a transcrição.");
  } finally {
    statusBox.hidden = true;
    submitBtn.disabled = false;
  }
});

function render(data) {
  $("metaLang").textContent = `Idioma: ${data.language} (${Math.round(data.language_probability * 100)}%)`;
  $("metaDuration").textContent = `Duração: ${formatTime(data.duration)}`;
  $("metaSegments").textContent = `${data.segments.length} segmentos`;

  $("outText").textContent = data.text || "(nenhuma fala detectada)";
  $("outSrt").textContent = data.srt;
  $("outVtt").textContent = data.vtt;

  const list = $("outSegments");
  list.replaceChildren();
  for (const seg of data.segments) {
    const li = document.createElement("li");
    const ts = document.createElement("span");
    ts.className = "ts";
    ts.textContent = formatTime(seg.start);
    const txt = document.createElement("span");
    txt.textContent = seg.text;
    li.append(ts, txt);
    list.append(li);
  }

  resultBox.hidden = false;
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    activeTab = tab.dataset.tab;
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t === tab));
    document.querySelectorAll(".panel").forEach((p) => {
      p.hidden = p.id !== `panel-${activeTab}`;
    });
  });
});

const currentContent = () => {
  if (!lastResult) return "";
  if (activeTab === "srt") return lastResult.srt;
  if (activeTab === "vtt") return lastResult.vtt;
  if (activeTab === "segments") {
    return lastResult.segments.map((s) => `[${formatTime(s.start)}] ${s.text}`).join("\n");
  }
  return lastResult.text;
};

$("copyBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(currentContent());
  const btn = $("copyBtn");
  btn.textContent = "Copiado!";
  setTimeout(() => (btn.textContent = "Copiar"), 1600);
});

$("downloadBtn").addEventListener("click", () => {
  const ext = activeTab === "srt" ? "srt" : activeTab === "vtt" ? "vtt" : "txt";
  const base = (lastResult?.filename || "transcricao").replace(/\.[^.]+$/, "");
  const blob = new Blob([currentContent()], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${base}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
});
