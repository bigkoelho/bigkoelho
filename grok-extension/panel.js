let globalData = [];
let globalUploadedImages = [];
let resultLog = [];
let totalTasks = 0;
let completedTasks = 0;
let isRunning = false;
let isPaused = false;

const configMedia = document.getElementById('config-media');
const configDuration = document.getElementById('config-duration');
const durationContainer = document.getElementById('duration-container');
const qualityContainer = document.getElementById('quality-container');
const txtFile = document.getElementById('txt-file');
const promptList = document.getElementById('prompt-list');
const refImagesInput = document.getElementById('ref-images');
const imageListDiv = document.getElementById('image-list');
const btnStart = document.getElementById('start');
const btnClearImages = document.getElementById('btn-clear-images');
const btnNovo = document.getElementById('btn-novo');
const btnSelectAll = document.getElementById('btn-select-all');
const btnDeselectAll = document.getElementById('btn-deselect-all');
const btnStop = document.getElementById('btn-stop');
const btnPause = document.getElementById('btn-pause');
const btnTheme = document.getElementById('btn-theme');
const btnExportLog = document.getElementById('btn-export-log');
const progressLabel = document.getElementById('progress-label');
const progressWrap = document.getElementById('progress-wrap');
const progressBar = document.getElementById('progress-bar');

const SETTINGS_KEYS = ['config-ratio', 'config-media', 'config-duration', 'config-quality', 'config-folder'];

// Load persisted settings and theme on init
chrome.storage.local.get(['kbSettings', 'kbTheme'], (result) => {
  if (result.kbSettings) {
    SETTINGS_KEYS.forEach(key => {
      const el = document.getElementById(key);
      if (el && result.kbSettings[key] !== undefined) el.value = result.kbSettings[key];
    });
    configMedia.dispatchEvent(new Event('change'));
  }
  if (result.kbTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    btnTheme.textContent = '☀️';
  }
});

function saveSettings() {
  const settings = {};
  SETTINGS_KEYS.forEach(key => {
    const el = document.getElementById(key);
    if (el) settings[key] = el.value;
  });
  chrome.storage.local.set({ kbSettings: settings });
}

SETTINGS_KEYS.forEach(key => {
  const el = document.getElementById(key);
  if (el) el.addEventListener('change', saveSettings);
});

btnTheme.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  btnTheme.textContent = isDark ? '🌙' : '☀️';
  chrome.storage.local.set({ kbTheme: isDark ? 'light' : 'dark' });
});

btnExportLog.addEventListener('click', () => {
  if (resultLog.length === 0) {
    alert('Sem resultados para exportar. Executa uma geração primeiro.');
    return;
  }
  const lines = ['Título,Estado,Mensagem,Hora'];
  resultLog.forEach(r => {
    lines.push(`"${r.titulo}","${r.state}","${r.text.replace(/"/g, '""')}","${r.time}"`);
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KBrothers_Log_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// Show/hide video options when media type changes
configMedia.addEventListener('change', (e) => {
  const isVideo = e.target.value === 'video';
  durationContainer.style.display = isVideo ? 'flex' : 'none';
  qualityContainer.style.display = isVideo ? 'flex' : 'none';
  document.querySelectorAll('.prompt-duration').forEach(el => {
    el.style.display = isVideo ? 'inline-block' : 'none';
  });
});

// Sync global duration to individual prompt durations
configDuration.addEventListener('change', (e) => {
  document.querySelectorAll('.prompt-duration').forEach(el => {
    el.value = e.target.value;
  });
});

btnSelectAll.addEventListener('click', () => {
  document.querySelectorAll('.prompt-header input[type="checkbox"]').forEach(chk => chk.checked = true);
});
btnDeselectAll.addEventListener('click', () => {
  document.querySelectorAll('.prompt-header input[type="checkbox"]').forEach(chk => chk.checked = false);
});

btnStop.addEventListener('click', () => {
  if (!confirm('Tens a certeza que queres parar o processo em curso?')) return;
  chrome.runtime.sendMessage({ action: 'stop_batch' });
  isRunning = false;
  isPaused = false;
  setExecutionUI(false);
  btnStart.innerText = '▶ Iniciar Geração no Grok';
  btnStart.style.background = '';
  btnStart.disabled = false;
});

btnPause.addEventListener('click', () => {
  if (isPaused) {
    isPaused = false;
    btnPause.textContent = '⏸ Pausar';
    btnPause.style.background = '#f9ab00';
    chrome.runtime.sendMessage({ action: 'resume_batch' });
  } else {
    isPaused = true;
    btnPause.textContent = '▶ Retomar';
    btnPause.style.background = 'var(--primary)';
    chrome.runtime.sendMessage({ action: 'pause_batch' });
  }
});

function setExecutionUI(running) {
  btnStart.style.display = running ? 'none' : 'block';
  btnStop.style.display = running ? 'flex' : 'none';
  btnPause.style.display = running ? 'flex' : 'none';
  btnNovo.style.display = running ? 'none' : 'block';
  progressWrap.style.display = running ? 'block' : 'none';
  progressLabel.style.display = running ? 'block' : 'none';
}

function updateProgress() {
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  progressBar.style.width = pct + '%';
  progressLabel.textContent = `${completedTasks} / ${totalTasks} concluídos (${pct}%)`;
}

// File loading
txtFile.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const rawText = await file.text();
    globalData = [];
    promptList.innerHTML = '';

    if (file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm')) {
      let htmlPreparado = rawText
        .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n');
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlPreparado;
      const cleanText = tempDiv.textContent || '';
      const linhas = cleanText.split('\n').map(l => l.trim()).filter(l => l !== '');
      let tituloAtual = '', promptAtual = '', lendoPrompt = false;

      for (const linha of linhas) {
        if (/^\s*\d+\.\d+\s*[-–—]/.test(linha)) {
          if (tituloAtual && promptAtual) globalData.push({ titulo: tituloAtual, prompt: promptAtual.trim() });
          tituloAtual = linha; promptAtual = ''; lendoPrompt = false;
        } else if (/PROMPT\s+(IMAGEM|V[IÍ]DEO)/i.test(linha)) {
          lendoPrompt = true;
          const partes = linha.split(':');
          if (partes.length > 1 && partes.slice(1).join(':').trim() !== '') {
            promptAtual += partes.slice(1).join(':').trim() + ' ';
          }
        } else if (lendoPrompt) {
          promptAtual += linha + '\n';
        }
      }
      if (tituloAtual && promptAtual) globalData.push({ titulo: tituloAtual, prompt: promptAtual.trim() });
    } else {
      const rawPrompts = rawText.split(/\n\s*\n/);
      rawPrompts.forEach(bloco => {
        if (bloco.trim() === '') return;
        const linhas = bloco.trim().split('\n').map(l => l.trim()).filter(l => l !== '');
        if (linhas.length === 0) return;
        const titulo = linhas[0];
        let promptLimpo = '', encontrouMarcador = false, lendoPrompt = false;
        for (let i = 1; i < linhas.length; i++) {
          const linha = linhas[i];
          if (/PROMPT\s+(IMAGEM|V[IÍ]DEO)/i.test(linha)) {
            encontrouMarcador = true; lendoPrompt = true;
            const partes = linha.split(':');
            if (partes.length > 1 && partes.slice(1).join(':').trim() !== '') {
              promptLimpo += partes.slice(1).join(':').trim() + '\n';
            }
          } else if (lendoPrompt) {
            promptLimpo += linha + '\n';
          }
        }
        if (!encontrouMarcador) promptLimpo = linhas.slice(1).join('\n').trim();
        globalData.push({ titulo: titulo.substring(0, 60), prompt: promptLimpo.trim() });
      });
    }

    renderizarPrompts();
    btnStart.innerText = '▶ Iniciar Geração no Grok';
    btnStart.style.background = '';
    btnStart.disabled = false;
  } catch (error) {
    alert('Erro ao ler o ficheiro. Verifica se é um TXT ou HTML válido.');
  }
});

function renderizarPrompts() {
  promptList.innerHTML = '';
  if (globalData.length === 0) {
    alert('Não encontrei prompts válidos neste ficheiro.');
    return;
  }

  const isVideo = configMedia.value === 'video';
  const globalDur = configDuration.value;
  promptList.style.display = 'block';

  globalData.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'prompt-item';

    const header = document.createElement('div');
    header.className = 'prompt-header';
    header.innerHTML = `
      <div class="prompt-header-left">
        <input type="checkbox" id="item-${index}" value="${index}" checked>
        <label for="item-${index}">${item.titulo}</label>
      </div>
      <select class="prompt-duration" id="dur-${index}"
        style="display: ${isVideo ? 'inline-block' : 'none'}; padding: 2px; font-size: 11px; font-weight: bold; width: 52px; border: 1px solid var(--primary); border-radius: 4px; background: var(--primary-light); color: var(--primary);">
        <option value="6s" ${globalDur === '6s' ? 'selected' : ''}>6s</option>
        <option value="10s" ${globalDur === '10s' ? 'selected' : ''}>10s</option>
      </select>
    `;

    const statusDiv = document.createElement('div');
    statusDiv.className = 'prompt-status';
    statusDiv.id = `status-${index}`;
    statusDiv.innerText = 'Aguardando...';

    div.appendChild(header);
    div.appendChild(statusDiv);
    promptList.appendChild(div);
  });

  atualizarMatchesImagens();
}

// Image management
refImagesInput.addEventListener('change', (event) => {
  globalUploadedImages = globalUploadedImages.concat(Array.from(event.target.files));
  refImagesInput.value = '';
  renderizarImagens();
  atualizarMatchesImagens();
});

btnClearImages.addEventListener('click', () => {
  globalUploadedImages = [];
  renderizarImagens();
  atualizarMatchesImagens();
});

function renderizarImagens() {
  imageListDiv.innerHTML = '';
  globalUploadedImages.forEach((file, index) => {
    const badge = document.createElement('div');
    badge.className = 'img-badge';
    const span = document.createElement('span');
    span.innerText = file.name;
    const btnRemove = document.createElement('button');
    btnRemove.innerHTML = '&times;';
    btnRemove.title = 'Remover';
    btnRemove.addEventListener('click', () => {
      globalUploadedImages.splice(index, 1);
      renderizarImagens();
      atualizarMatchesImagens();
    });
    badge.appendChild(span);
    badge.appendChild(btnRemove);
    imageListDiv.appendChild(badge);
  });
}

function atualizarMatchesImagens() {
  document.querySelectorAll('.prompt-header input[type="checkbox"]').forEach(chk => {
    const index = chk.value;
    if (!globalData[index]) return;
    const promptText = globalData[index].prompt.toLowerCase();
    const encontradas = globalUploadedImages.filter(f => {
      const baseName = f.name.replace(/\.[^/.]+$/, '').toLowerCase().trim();
      return promptText.includes(baseName);
    });
    const statusDiv = document.getElementById(`status-${index}`);
    if (statusDiv && !statusDiv.classList.contains('status-running') && !statusDiv.classList.contains('status-done')) {
      statusDiv.className = 'prompt-status';
      if (encontradas.length > 0) {
        statusDiv.innerText = `Pronto · Imgs: ${encontradas.map(f => f.name).join(', ')}`;
        statusDiv.style.color = 'var(--primary)';
      } else {
        statusDiv.innerText = 'Pronto · Sem imagens';
        statusDiv.style.color = '';
      }
    }
  });
}

function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, data: reader.result, type: file.type });
    reader.readAsDataURL(file);
  });
}

// Message listener from background/content
chrome.runtime.onMessage.addListener((m) => {
  if (m.action === 'update_ui_progress') {
    const el = document.getElementById(`status-${m.index}`);
    if (el) {
      const hora = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      el.innerText = `[${hora}] ${m.text}`;
      el.className = `prompt-status status-${m.state}`;
      el.style.color = '';
      if (m.state === 'done' || m.state === 'error') {
        completedTasks++;
        updateProgress();
        const titulo = globalData[m.index]?.titulo || `Tarefa ${m.index}`;
        resultLog.push({ titulo, state: m.state, text: m.text, time: hora });
      }
    }
  } else if (m.action === 'finish_all') {
    isRunning = false;
    setExecutionUI(false);
    btnStart.style.display = 'block';
    btnStart.innerText = '✓ Concluído!';
    btnStart.style.background = 'var(--success)';
    btnStart.disabled = false;
    progressLabel.style.display = 'block';
    progressLabel.textContent = `Tudo concluído! ${completedTasks} / ${totalTasks} tarefas processadas.`;
  } else if (m.action === 'batch_stopped') {
    isRunning = false;
    setExecutionUI(false);
    btnStart.style.display = 'block';
    btnStart.innerText = '▶ Iniciar Geração no Grok';
    btnStart.style.background = '';
    btnStart.disabled = false;
  }
});

// New project reset
btnNovo.addEventListener('click', () => {
  globalData = [];
  globalUploadedImages = [];
  resultLog = [];
  totalTasks = 0;
  completedTasks = 0;
  txtFile.value = '';
  refImagesInput.value = '';
  promptList.innerHTML = '';
  promptList.style.display = 'none';
  imageListDiv.innerHTML = '';
  btnStart.innerText = '▶ Iniciar Geração no Grok';
  btnStart.style.background = '';
  btnStart.disabled = true;
  setExecutionUI(false);
  btnStart.style.display = 'block';
});

// Start automation
btnStart.addEventListener('click', async () => {
  const selecionados = document.querySelectorAll('.prompt-header input[type="checkbox"]:checked');
  if (selecionados.length === 0) return;

  isRunning = true;
  isPaused = false;
  totalTasks = selecionados.length;
  completedTasks = 0;
  resultLog = [];

  setExecutionUI(true);
  updateProgress();

  const queue = [];

  for (const chk of selecionados) {
    const idx = chk.value;
    const promptText = globalData[idx].prompt;

    const localDurEl = document.getElementById(`dur-${idx}`);
    const tempoDestePrompt = localDurEl ? localDurEl.value : (configDuration.value || '6s');

    const configLocal = {
      ratio: document.getElementById('config-ratio').value,
      media: configMedia.value,
      duration: tempoDestePrompt,
      quality: document.getElementById('config-quality')?.value || '720',
      folder: document.getElementById('config-folder').value.trim()
    };

    const imgsParaEstePrompt = globalUploadedImages.filter(f => {
      const baseName = f.name.replace(/\.[^/.]+$/, '').toLowerCase().trim();
      return promptText.toLowerCase().includes(baseName);
    });

    const imgsBase64 = await Promise.all(imgsParaEstePrompt.map(f => fileToBase64(f)));

    queue.push({
      originalIndex: parseInt(idx),
      titulo: globalData[idx].titulo,
      prompt: promptText,
      config: configLocal,
      images: imgsBase64
    });
  }

  chrome.tabs.query({}, (tabs) => {
    const grokTab = tabs.find(t => t.url && (t.url.includes('grok.com') || t.url.includes('x.com/i/grok')));

    if (grokTab) {
      chrome.runtime.sendMessage({ action: 'start_batch', queue, tabId: grokTab.id });
    } else {
      alert('Não encontrei o Grok aberto!\nAbre grok.com num separador e tenta novamente.');
      isRunning = false;
      setExecutionUI(false);
      btnStart.style.display = 'block';
      btnStart.innerText = '▶ Iniciar Geração no Grok';
      btnStart.disabled = false;
    }
  });
});
