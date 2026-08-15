/* Voice Changer front end: pick a voice, pick an audio file, poll the job. */

const $ = (selector) => document.querySelector(selector);

const state = {
  sampleFile: null,      // uploaded or recorded reference
  sampleSource: null,    // 'upload' | 'record' | 'library'
  voiceId: null,
  voiceName: '',
  sourceFile: null,
  pollTimer: null,
};

/* ------------------------------------------------------------------ tabs */

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('is-active', t === tab));
    document.querySelectorAll('.panel').forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.panel === tab.dataset.tab);
    });
    // Saving to the library only makes sense for a brand new sample.
    $('#save-voice-row').classList.toggle('hidden', tab.dataset.tab === 'library');
  });
});

/* ------------------------------------------------------------- dropzones */

function wireDropzone(dropId, inputId, onFile) {
  const drop = $(dropId);
  const input = $(inputId);
  drop.addEventListener('click', () => input.click());
  input.addEventListener('change', () => input.files[0] && onFile(input.files[0]));
  ['dragenter', 'dragover'].forEach((event) =>
    drop.addEventListener(event, (e) => {
      e.preventDefault();
      drop.classList.add('is-over');
    })
  );
  ['dragleave', 'drop'].forEach((event) =>
    drop.addEventListener(event, (e) => {
      e.preventDefault();
      drop.classList.remove('is-over');
    })
  );
  drop.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  });
}

function showPreview(previewId, file, label) {
  const preview = $(previewId);
  const audio = preview.querySelector('audio');
  if (audio.src) URL.revokeObjectURL(audio.src);
  audio.src = URL.createObjectURL(file);
  preview.querySelector('.file-name').textContent = label || `${file.name} · ${(file.size / 1048576).toFixed(1)} MB`;
  preview.classList.remove('hidden');
}

wireDropzone('#sample-drop', '#sample-input', (file) => {
  state.sampleFile = file;
  state.sampleSource = 'upload';
  state.voiceId = null;
  if (!$('#voice-name').value) $('#voice-name').value = file.name.replace(/\.[^.]+$/, '');
  document.querySelectorAll('.voice-item').forEach((item) => item.classList.remove('is-selected'));
  showPreview('#sample-preview', file);
  refreshConvertButton();
});

wireDropzone('#source-drop', '#source-input', (file) => {
  state.sourceFile = file;
  showPreview('#source-preview', file);
  refreshConvertButton();
});

$('#sample-clear').addEventListener('click', (e) => {
  e.stopPropagation();
  state.sampleFile = null;
  state.sampleSource = null;
  $('#sample-input').value = '';
  $('#sample-preview').classList.add('hidden');
  refreshConvertButton();
});

$('#source-clear').addEventListener('click', (e) => {
  e.stopPropagation();
  state.sourceFile = null;
  $('#source-input').value = '';
  $('#source-preview').classList.add('hidden');
  refreshConvertButton();
});

/* --------------------------------------------------------------- recorder */

let recorder = null;
let recordedChunks = [];
let recordStartedAt = 0;
let recordTimer = null;

$('#record-toggle').addEventListener('click', async () => {
  const button = $('#record-toggle');
  if (recorder && recorder.state === 'recording') {
    recorder.stop();
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    showError('O teu browser não permite gravar áudio nesta página (precisa de HTTPS ou localhost).');
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedChunks = [];
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => event.data.size && recordedChunks.push(event.data);
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      clearInterval(recordTimer);
      button.classList.remove('is-recording');
      button.textContent = 'Gravar';
      const type = recorder.mimeType || 'audio/webm';
      const extension = type.includes('ogg') ? 'ogg' : type.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(recordedChunks, { type });
      state.sampleFile = new File([blob], `gravacao.${extension}`, { type });
      state.sampleSource = 'record';
      state.voiceId = null;
      showPreview('#record-preview', state.sampleFile, `Gravação · ${(blob.size / 1048576).toFixed(1)} MB`);
      refreshConvertButton();
    };
    recorder.start();
    recordStartedAt = Date.now();
    button.classList.add('is-recording');
    button.textContent = 'Parar';
    recordTimer = setInterval(() => {
      const seconds = Math.floor((Date.now() - recordStartedAt) / 1000);
      $('#record-time').textContent =
        `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }, 250);
  } catch (error) {
    showError(`Não foi possível aceder ao microfone: ${error.message}`);
  }
});

$('#record-clear').addEventListener('click', () => {
  state.sampleFile = null;
  state.sampleSource = null;
  $('#record-preview').classList.add('hidden');
  $('#record-time').textContent = '00:00';
  refreshConvertButton();
});

/* ---------------------------------------------------------- voice library */

async function loadVoices() {
  const response = await fetch('/api/voices');
  const { voices } = await response.json();
  const list = $('#voice-list');
  list.innerHTML = '';
  $('#voice-empty').classList.toggle('hidden', voices.length > 0);

  voices.forEach((voice) => {
    const item = document.createElement('li');
    item.className = 'voice-item';
    item.dataset.id = voice.id;
    item.innerHTML = `
      <div class="meta">
        <span class="name"></span>
        <span class="sub">${voice.duration.toFixed(1)}s · ${new Date(voice.created_at * 1000).toLocaleDateString('pt-PT')}</span>
      </div>
      <audio controls preload="none" src="/api/voices/${voice.id}/sample"></audio>
      <button class="link danger" title="Apagar">✕</button>`;
    item.querySelector('.name').textContent = voice.name;

    item.addEventListener('click', (event) => {
      if (event.target.closest('audio') || event.target.closest('button')) return;
      state.voiceId = voice.id;
      state.voiceName = voice.name;
      state.sampleFile = null;
      state.sampleSource = 'library';
      document.querySelectorAll('.voice-item').forEach((other) => other.classList.toggle('is-selected', other === item));
      refreshConvertButton();
    });

    item.querySelector('button').addEventListener('click', async (event) => {
      event.stopPropagation();
      if (!confirm(`Apagar a voz "${voice.name}"?`)) return;
      await fetch(`/api/voices/${voice.id}`, { method: 'DELETE' });
      if (state.voiceId === voice.id) {
        state.voiceId = null;
        state.sampleSource = null;
      }
      await loadVoices();
      refreshConvertButton();
    });

    list.appendChild(item);
  });
}

/* ----------------------------------------------------------------- health */

async function loadHealth() {
  try {
    const [health, engines] = await Promise.all([
      fetch('/api/health').then((r) => r.json()),
      fetch('/api/engines').then((r) => r.json()),
    ]);

    const select = $('#engine');
    select.innerHTML = '';
    engines.engines.forEach((engine) => {
      const option = document.createElement('option');
      option.value = engine.key;
      option.textContent = engine.available ? engine.label : `${engine.label} — indisponível`;
      option.disabled = !engine.available;
      option.selected = engine.key === engines.selected;
      select.appendChild(option);
    });

    // The model picker only applies to engines that ship more than one model.
    const syncModels = () => {
      const engine = engines.engines.find((item) => item.key === select.value);
      const models = engine?.models ?? [];
      const row = $('#model-row');
      row.classList.toggle('hidden', models.length === 0);
      const modelSelect = $('#model');
      modelSelect.innerHTML = '';
      models.forEach((model) => {
        const option = document.createElement('option');
        option.value = model.key;
        option.textContent = model.label;
        option.selected = model.key === engines.selected_model;
        modelSelect.appendChild(option);
      });
    };
    select.addEventListener('change', syncModels);
    syncModels();

    const parts = [];
    parts.push(health.ffmpeg ? '<span class="good">ffmpeg ok</span>' : '<span class="bad">ffmpeg em falta</span>');
    const active = engines.engines.find((engine) => engine.key === engines.selected);
    if (active && !active.available) parts.push(`<span class="bad">${active.detail}</span>`);
    parts.push(`máx. ${health.limits.max_upload_mb} MB · ${Math.round(health.limits.max_source_seconds / 60)} min`);
    $('#health').innerHTML = parts.join(' · ');
  } catch {
    $('#health').innerHTML = '<span class="bad">servidor indisponível</span>';
  }
}

/* ------------------------------------------------------------- conversion */

function refreshConvertButton() {
  const hasVoice = Boolean(state.sampleFile || state.voiceId);
  $('#convert').disabled = !(hasVoice && state.sourceFile);
}

function showError(message) {
  const box = $('#form-error');
  box.textContent = message;
  box.classList.remove('hidden');
}

function clearError() {
  $('#form-error').classList.add('hidden');
}

$('#convert').addEventListener('click', async () => {
  clearError();
  const body = new FormData();
  body.append('source', state.sourceFile);
  if (state.voiceId) {
    body.append('voice_id', state.voiceId);
  } else {
    body.append('sample', state.sampleFile);
    body.append('save_voice', $('#save-voice').checked ? 'true' : 'false');
    body.append('voice_name', $('#voice-name').value || '');
  }
  body.append('output_format', $('#output-format').value);
  body.append('normalize', $('#normalize').checked ? 'true' : 'false');
  body.append('engine', $('#engine').value);
  if (!$('#model-row').classList.contains('hidden')) body.append('model', $('#model').value);

  $('#convert').disabled = true;
  $('#result-card').classList.add('hidden');
  $('#progress-card').classList.remove('hidden');
  setProgress(0, 'A enviar os ficheiros…');

  try {
    const response = await fetch('/api/convert', { method: 'POST', body });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.detail || 'Falha ao iniciar a conversão.');
    pollJob(payload.id);
  } catch (error) {
    $('#progress-card').classList.add('hidden');
    showError(error.message);
    refreshConvertButton();
  }
});

function setProgress(percent, message) {
  $('#progress-bar').style.width = `${percent}%`;
  $('#progress-message').textContent = message;
}

function pollJob(jobId) {
  clearInterval(state.pollTimer);
  state.pollTimer = setInterval(async () => {
    try {
      const job = await fetch(`/api/jobs/${jobId}`).then((r) => r.json());
      setProgress(job.progress, `${job.message} · ${job.elapsed}s`);

      if (job.status === 'done') {
        clearInterval(state.pollTimer);
        $('#progress-card').classList.add('hidden');
        showResult(jobId, job);
      } else if (job.status === 'error') {
        clearInterval(state.pollTimer);
        $('#progress-card').classList.add('hidden');
        showError(job.error || 'A conversão falhou.');
        refreshConvertButton();
      }
    } catch {
      /* transient network hiccup — the next tick retries */
    }
  }, 800);
}

function showResult(jobId, job) {
  const original = $('#result-original');
  if (original.src) URL.revokeObjectURL(original.src);
  original.src = URL.createObjectURL(state.sourceFile);
  $('#result-converted').src = `/api/jobs/${jobId}/download?inline=true`;
  $('#download').href = `/api/jobs/${jobId}/download`;
  $('#download').setAttribute('download', job.output_name);
  const engineLabel = job.model ? `${job.engine}/${job.model}` : job.engine;
  $('#result-meta').textContent =
    `${job.duration.toFixed(1)}s de áudio · ${job.chunks} bloco(s) · ${job.elapsed}s de processamento · ` +
    `voz: ${job.voice_name} · motor: ${engineLabel}`;
  $('#result-card').classList.remove('hidden');
  $('#result-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  refreshConvertButton();
  loadVoices();
}

$('#again').addEventListener('click', () => {
  $('#result-card').classList.add('hidden');
  state.sourceFile = null;
  $('#source-input').value = '';
  $('#source-preview').classList.add('hidden');
  refreshConvertButton();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

loadHealth();
loadVoices();
