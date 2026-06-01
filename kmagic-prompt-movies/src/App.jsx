import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, ChevronRight, ChevronUp, Loader2, Save, FolderOpen, Wand2, FileText, BookOpen, Edit3, History, Undo2, AlertCircle, Globe, Clock, Settings2, ShieldCheck, Users, Map, Camera, Video, AlignLeft, Copy, Check, Mic, LayoutTemplate, Music, RefreshCw, X, Trash2, Plus, Send, Image as ImageIcon, MessageSquare, Share2, Clapperboard, MonitorPlay, Laugh, Download, MessageCircle, Calendar, Scissors
} from 'lucide-react';

export default function App() {
  const defaultProjectData = {
    title: 'Novo Projeto',
    director: '',
    writer: '',
    concept: '',
    storyPrompt: '',
    storyFileContent: '',
    storyFileName: '',
    filmType: 'Animação 3D',
    filmGenre: 'Ação',
    artStyle: '3D Pixar-Style Animation',
    filmSoundType: 'Diálogos',
    lastGeneratedSoundType: 'Diálogos',
    sceneTakeRatio: 1,
    lastGeneratedSceneTakeRatio: 1,
    duration: 30, 
    aspectRatio: '16:9',
    language: 'Português (Portugal)',
    script: '',
    posterPrompt: '',
    customPosterPrompt: '',
    intro: null,
    preface: null,
    outro: null,
    characters: [],
    settings: [],
    scenes: [],
    finalMessages: [],
    socialMedia: null,
    socialMediaPlan: null,
    socialPlanPremiereDate: '',
    musicGenres: ['', '', '', ''],
    musicMood: '',
    musicDesc: '',
    musicPrompt: '',
    socialMediaHashtags: '#TheKBrothers',
    socialMediaHashtagsEnabled: true,
    socialYoutubeLink: '',
    socialYoutubeSinopse: '',
    socialMediaExtraBlocks: [],
    socialPremiereHeroImage: null,
    socialImageCount: 3,
    socialVideoCount: 3,
    socialPlanDays: 14,
    chatMessages: [
      { id: '1', sender: 'ai', text: 'Diz o que precisas' }
    ]
  };

  const [projectData, setProjectData] = useState(defaultProjectData);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [projectHistory, setProjectHistory] = useState([]);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isAnalyzingScript, setIsAnalyzingScript] = useState(false);
  const [scriptUploadedFromFile, setScriptUploadedFromFile] = useState(false);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [isGeneratingAutoSocial, setIsGeneratingAutoSocial] = useState(false);
  const [isGeneratingSocialPlan, setIsGeneratingSocialPlan] = useState(false);
  const [isGeneratingSinopse, setIsGeneratingSinopse] = useState(false);
  const [addingExtraBlock, setAddingExtraBlock] = useState(false);
  const [newExtraBlockPrompt, setNewExtraBlockPrompt] = useState('');
  const [isGeneratingExtraBlock, setIsGeneratingExtraBlock] = useState(false);
  const [isGeneratingPremiereHero, setIsGeneratingPremiereHero] = useState(false);
  const [attachModalIdx, setAttachModalIdx] = useState(null);
  const [attachFileInput, setAttachFileInput] = useState('');
  const [manualDialog, setManualDialog] = useState(null); // { query, resolve, reject }
  const [manualPasteText, setManualPasteText] = useState('');
  const [scriptError, setScriptError] = useState(null);
  const [scriptEditPrompt, setScriptEditPrompt] = useState(''); 
  const [copiedId, setCopiedId] = useState(null);

  const [editingAssetId, setEditingAssetId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingHeight, setEditingHeight] = useState('');
  const [editingBuild, setEditingBuild] = useState('');

  const [isGeneratingCustomPrompt, setIsGeneratingCustomPrompt] = useState({});
  const [promptActionState, setPromptActionState] = useState({ id: null, type: null, targetField: null, suggestion: '' });

  const [chatInput, setChatInput] = useState('');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const chatContainerRef = useRef(null);

  const [addAssetModal, setAddAssetModal] = useState({ isOpen: false, type: null, prompt: '' });
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);

  const [addingFinalMessage, setAddingFinalMessage] = useState(false);
  const [finalMessageInput, setFinalMessageInput] = useState('');
  const [isGeneratingFM, setIsGeneratingFM] = useState(false);
  const [isGeneratingAutoFM, setIsGeneratingAutoFM] = useState(false);
  const [isGeneratingSocialBlock, setIsGeneratingSocialBlock] = useState({});

  const [regeneratingSceneId, setRegeneratingSceneId] = useState(null);
  const [isGeneratingAllScenes, setIsGeneratingAllScenes] = useState(false);

  // Estados de Narração
  const [activeNarrationSceneId, setActiveNarrationSceneId] = useState(null);
  const [narrationInstruction, setNarrationInstruction] = useState('');
  const [isGeneratingNarrations, setIsGeneratingNarrations] = useState(false);
  const [isRegeneratingSingleNarration, setIsRegeneratingSingleNarration] = useState({});

  const [importAssetsModal, setImportAssetsModal] = useState({ isOpen: false, characters: [], settings: [], selectedCharIds: [], selectedSettingIds: [] });

  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [activeRoteiroView, setActiveRoteiroView] = useState('global');
  const [isUpgradingProject, setIsUpgradingProject] = useState(false);

  const [expandedScenes, setExpandedScenes] = useState({});

  const [groqApiKey, setGroqApiKey] = useState(() => localStorage.getItem('groq_api_key') || '');
  const [groqModel, setGroqModel] = useState(() => localStorage.getItem('groq_model') || 'llama-3.3-70b-versatile');
  const [groqStatus, setGroqStatus] = useState('unknown');

  const [googleApiKey, setGoogleApiKey] = useState(() => localStorage.getItem('google_api_key') || '');
  const [googleModel, setGoogleModel] = useState(() => localStorage.getItem('google_model') || 'gemini-1.5-flash-8b');
  const [googleStatus, setGoogleStatus] = useState('unknown');

  const [claudeApiKey, setClaudeApiKey] = useState(() => localStorage.getItem('claude_api_key') || '');
  const [claudeModel, setClaudeModel] = useState(() => localStorage.getItem('claude_model') || 'claude-haiku-4-5');
  const [claudeStatus, setClaudeStatus] = useState('unknown');

  const [ollamaModel, setOllamaModel] = useState(() => localStorage.getItem('ollama_model') || 'llama3.2');
  const [ollamaStatus, setOllamaStatus] = useState('unknown');
  const [ollamaModels, setOllamaModels] = useState([]);

  const [activeProvider, setActiveProvider] = useState(() => localStorage.getItem('active_provider') || 'ollama');

  const handleGroqKeyChange = (key) => {
    setGroqApiKey(key);
    localStorage.setItem('groq_api_key', key);
  };
  const handleGroqModelChange = (model) => {
    setGroqModel(model);
    localStorage.setItem('groq_model', model);
  };
  const handleGoogleKeyChange = (key) => {
    setGoogleApiKey(key);
    localStorage.setItem('google_api_key', key);
  };
  const handleGoogleModelChange = (model) => {
    setGoogleModel(model);
    localStorage.setItem('google_model', model);
  };
  const handleClaudeKeyChange = (key) => {
    setClaudeApiKey(key);
    localStorage.setItem('claude_api_key', key);
  };
  const handleClaudeModelChange = (model) => {
    setClaudeModel(model);
    localStorage.setItem('claude_model', model);
  };
  const handleOllamaModelChange = (model) => {
    setOllamaModel(model);
    localStorage.setItem('ollama_model', model);
  };
  const handleActiveProviderChange = (provider) => {
    setActiveProvider(provider);
    localStorage.setItem('active_provider', provider);
  };

  const toggleScene = (id) => {
    setExpandedScenes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCollapseFromBottom = (id) => {
    setExpandedScenes(prev => ({ ...prev, [id]: false }));
    setTimeout(() => {
      const el = document.getElementById(`scene-container-${id}`);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 150;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }, 50);
  };

  const activeChatMessages = projectData.chatMessages?.length 
    ? projectData.chatMessages 
    : [{ id: '1', sender: 'ai', text: 'Diz o que precisas' }];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeChatMessages, isHistoryExpanded]);

  // Efeito para fechar o assistente de narração automaticamente quando tudo for aprovado
  useEffect(() => {
    if (activeNarrationSceneId) {
        const scene = projectData.scenes?.find(s => s.id === activeNarrationSceneId);
        if (scene && scene.narrations && scene.narrations.length > 0) {
            const hasPending = scene.narrations.some(n => n.isPending);
            if (!hasPending) {
                setActiveNarrationSceneId(null);
            }
        }
    }
  }, [projectData.scenes, activeNarrationSceneId]);

  const genres = [
    "Ação", "Aventura", "Comédia", "Drama", "Fantasia", "Sci-Fi", "Terror", 
    "Thriller", "Mistério", "Crime", "Romance", "Western", "Musical", 
    "Guerra", "Histórico", "Biografia", "Noir", "Cyberpunk", "Steampunk", "Pós-Apocalíptico", "Cartoon", "Didático"
  ];

  const artStyles = [
    "2D Cinematic Animation", "3D Pixar-Style Animation", "Cinematic Animation", 
    "3D Chibi Cartoon Animation", "3D Felt Animation", "3D Clay Animation", 
    "3D Brick Animation", "3D Futuristic Robotic Animation", "3D Wood Animation", 
    "3D Knitted Animation", "3D Paper Craft Animation", "Human Style", 
    "Cartoon Style", "Cinematic Realistic Style", "Watercolor / Paint Style", "Animé"
  ];
  const filmTypes = ["Animação 3D", "Animação 2D", "Live-Action", "Stop-Motion", "Curta-metragem", "Anúncio Publicitário", "Cartoon", "Vídeo Didático"];
  const filmSoundTypes = ["Diálogos", "Narração e Diálogos", "Narração", "Mudo"];
  const physicalBuilds = ["Magro", "Normal", "Robusto", "Forte", "Atlético", "Body builder", "Gordo", "Obeso", "Super obeso"];
  const moods = ["Ação e Adrenalina", "Alegre e Divertido", "Calmo e Relaxante", "Crianças", "Dinâmico e Rápido", "Educacional", "Épico e Grandioso", "Infantil", "Inspirador e Emocionante", "Melancólico e Triste", "Misterioso e Tenso", "Romântico e Suave", "Sci-Fi e Futurista", "Sombrio e Assustador", "Tensão Psicológica"];

  const musicCategories = [
    { label: "Orquestral e Épico", options: ["Epic Cinematic Score: Orquestra completa, metais heroicos, percussão de batalha", "Orchestral Hybrid: Mistura de instrumentos clássicos com sintetizadores modernos", "Fantasy Adventure: Coros (choir), cordas rápidas, trompas, atmosfera mítica", "Emotional Piano Ballad: Piano solo suave, violinos em crescendo, melancólico", "Epic Battle Music: Tambores de guerra intensos, metais agressivos, coral"] },
    { label: "Suspense e Thriller", options: ["Dark Thriller Score: Baixos pulsantes, violinos estridentes, suspense", "Minimalist Suspense: Piano lento, sons de tensão, atmosferas de baixo volume", "Noir Jazz: Saxofone lento, contrabaixo, atmosfera noturna e sensual", "Psychological Thriller: Sons experimentais, drones de baixo, dissonância"] },
    { label: "Sci-Fi e Futurista", options: ["Futuristic Synthwave: Sintetizadores brilhantes, ritmos 80s, paisagem urbana neon", "Atmospheric Sci-Fi: Sons espaciais, pads suaves, sintetizadores analógicos, mistério", "Cyberpunk: Eletrônico pesado, batidas industriais, sons futuristas escuros", "Ambient Electronic: Texturas sonoras imersivas, sem batida definida"] },
    { label: "Ação e Agitação", options: ["Action Chase: Rápido, percussão intensa, metais ritmados", "Industrial Rock/Metal: Guitarras distorcidas, batida eletrônica forte, agressivo", "Spy Thriller: Riff de guitarra baixo, percussão rápida, estilo 007"] },
    { label: "Documentário e Folk", options: ["Ambient/Atmospheric: Sons calmos, pads, ideal para cenas de natureza ou reflexão", "Folk Celta/Acoustic: Violino, flauta, violão, sensação pastoral ou histórica", "Minimalist Piano & Strings: Simples, emocional, focado na narrativa"] },
    { label: "Estilos de Época", options: ["1920s Jazz/Ragtime: Piano acelerado, trompete, estilo charleston", "1950s Rockabilly: Guitarra elétrica com reverb, ritmo animado", "Medieval/Renaissance: Alaúde, flautas, harpa"] },
    { label: "Infantil", options: ["Estilos Tropicais e Folclóricos", "Música Infantil/Educativa", "Pop, Rock e Batidas Energéticas", "Pop Infantil e Animado", "Educativo e Lúdico", "Eletrônico e Dançante", "Calmo e Ninar (Lullaby)", "Pizzicato Strings", "Baroque Pastoral", "Symphonic Fairy Tale", "Classical Lullaby"] }
  ];

  const callGeminiAPI = async (textQuery, useJsonFormat = false) => {
    const ptPrefix = "REGRA ABSOLUTA DE IDIOMA — PROIBIDO IGNORAR: Escreve EXCLUSIVAMENTE em Português de Portugal (PT-PT). É terminantemente proibido usar vocabulário, expressões ou ortografia do Português do Brasil. Exemplos obrigatórios: 'ecrã' (nunca 'tela'), 'telemóvel' (nunca 'celular'), 'autocarro' (nunca 'ônibus'), 'fixe/giro' (nunca 'legal'), 'rapariga/jovem' (nunca 'garota'), 'tu/você' correto para PT-PT, conjugações verbais de Portugal. Toda a narrativa, legendas, diálogos, descrições e copywriting devem soar naturalmente a Portugal.\n\n";
    const query = ptPrefix + textQuery;
    let delay = 1000;
    let lastError = null;

    // Determina o provider efetivo (fallback para manual/ollama se sem key)
    let effectiveProvider = activeProvider;
    if (effectiveProvider !== 'manual' && effectiveProvider !== 'ollama') {
      if (effectiveProvider === 'groq' && !groqApiKey) effectiveProvider = 'manual';
      if (effectiveProvider === 'google' && !googleApiKey) effectiveProvider = 'manual';
      if (effectiveProvider === 'claude' && !claudeApiKey) effectiveProvider = 'manual';
    }

    if (effectiveProvider === 'manual') {
      // Modo manual: mostra o prompt ao utilizador, ele cola a resposta
      return new Promise((resolve, reject) => {
        setManualPasteText('');
        setManualDialog({ query, resolve, reject });
      });

    } else if (effectiveProvider === 'google') {
      if (!googleApiKey) throw new Error("Google API Key não configurada.");
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${googleModel}:generateContent?key=${googleApiKey}`;
      // JSON pedido via prompt (sem responseMimeType que causa erros em alguns modelos)
      const googleQuery = useJsonFormat
        ? query + '\n\nIMPORTANTE: A tua resposta deve ser EXCLUSIVAMENTE um objeto JSON válido. Sem texto introdutório, sem explicações, sem markdown, sem ```json. Apenas o JSON puro começando com { ou [.'
        : query;
      const payload = {
        contents: [{ role: 'user', parts: [{ text: googleQuery }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
      };
      for (let i = 0; i < 3; i++) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(120000)
          });
          if (response.ok) {
            const result = await response.json();
            return result.candidates?.[0]?.content?.parts?.[0]?.text;
          } else {
            const err = await response.json().catch(() => ({}));
            lastError = new Error(`Google: ${err.error?.message || response.status}`);
            if (response.status >= 400 && response.status < 500) break;
          }
        } catch (e) { lastError = e; }
        if (i < 2) { await new Promise(res => setTimeout(res, delay)); delay *= 2; }
      }
      throw lastError || new Error("Falha de comunicação com o Google Gemini.");

    } else if (effectiveProvider === 'claude') {
      if (!claudeApiKey) throw new Error("Claude API Key não configurada.");
      const url = 'https://api.anthropic.com/v1/messages';
      const payload = {
        model: claudeModel,
        max_tokens: 8192,
        messages: [{ role: 'user', content: query }]
      };
      for (let i = 0; i < 2; i++) { // apenas 2 tentativas para Claude (é lento)
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': claudeApiKey,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(180000) // 3 minutos
          });
          if (response.ok) {
            const result = await response.json();
            return result.content?.[0]?.text;
          } else {
            const errBody = await response.json().catch(() => ({}));
            const errMsg = errBody.error?.message || errBody.error?.type || `HTTP ${response.status}`;
            let hint = '';
            if (response.status === 404) hint = ' ⚠ Modelo não encontrado ou key sem acesso API. A key deve ser de console.anthropic.com (começa com sk-ant-api03-), não do Claude.ai.';
            if (response.status === 401) hint = ' ⚠ API Key inválida ou expirada.';
            if (response.status === 403) hint = ' ⚠ Sem permissão. Verifica os créditos em console.anthropic.com.';
            lastError = new Error(`Claude [${response.status}]: ${errMsg}${hint}`);
            if (response.status >= 400 && response.status < 500) break;
          }
        } catch (e) {
          lastError = new Error(`Claude: ${e.name === 'TimeoutError' ? 'Timeout (3min excedido)' : `Erro de ligação — ${e.message}`}`);
        }
        if (i < 1) { await new Promise(res => setTimeout(res, delay)); delay *= 2; }
      }
      throw lastError || new Error("Falha de comunicação com o Claude.");

    } else if (effectiveProvider === 'ollama') {
      const url = 'http://localhost:11434/v1/chat/completions';
      // Para Ollama reforçar JSON no próprio prompt (modelos locais ignoram response_format)
      const ollamaQuery = useJsonFormat
        ? query + '\n\nIMPORTANTE: Responde APENAS com JSON válido. Sem texto antes ou depois. Sem markdown. Sem ```json. Apenas o objeto JSON puro.'
        : query;
      const payload = {
        model: ollamaModel,
        messages: [{ role: 'user', content: ollamaQuery }],
        stream: false,
        ...(useJsonFormat && { response_format: { type: 'json_object' } })
      };
      for (let i = 0; i < 3; i++) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(300000)
          });
          if (response.ok) {
            const result = await response.json();
            return result.choices?.[0]?.message?.content;
          } else {
            const err = await response.json().catch(() => ({}));
            lastError = new Error(`Ollama: ${err.error || response.status}`);
          }
        } catch (e) {
          lastError = new Error(`Ollama: ${e.name === 'TimeoutError' ? 'Timeout — modelo lento' : `Não foi possível ligar ao Ollama em localhost:11434. Verifica se está a correr.`}`);
          break;
        }
        if (i < 2) { await new Promise(res => setTimeout(res, delay)); delay *= 2; }
      }
      throw lastError || new Error("Falha de comunicação com o Ollama.");

    } else {
      if (!groqApiKey) throw new Error("Groq API Key não configurada. Vai à secção Configuração para adicionar a key.");
      const url = 'https://api.groq.com/openai/v1/chat/completions';
      const payload = {
        model: groqModel,
        messages: [{ role: 'user', content: query }],
        ...(useJsonFormat && { response_format: { type: 'json_object' } })
      };
      for (let i = 0; i < 3; i++) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqApiKey}` },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(60000)
          });
          if (response.ok) {
            const result = await response.json();
            return result.choices?.[0]?.message?.content;
          } else {
            const err = await response.json().catch(() => ({}));
            lastError = new Error(`Groq: ${err.error?.message || response.status}`);
          }
        } catch (e) { lastError = e; }
        if (i < 2) { await new Promise(res => setTimeout(res, delay)); delay *= 2; }
      }
      throw lastError || new Error("Falha de comunicação com o Groq.");
    }
  };

  const checkGroqStatus = async () => {
    if (!groqApiKey) { setGroqStatus('no-key'); return; }
    setGroqStatus('checking');
    try {
      const r = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${groqApiKey}` },
        signal: AbortSignal.timeout(5000)
      });
      setGroqStatus(r.ok ? 'online' : 'offline');
    } catch {
      setGroqStatus('offline');
    }
  };

  const checkGoogleStatus = async () => {
    if (!googleApiKey) { setGoogleStatus('no-key'); return; }
    setGoogleStatus('checking');
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${googleApiKey}`, {
        signal: AbortSignal.timeout(8000)
      });
      setGoogleStatus(r.ok ? 'online' : 'offline');
    } catch {
      setGoogleStatus('offline');
    }
  };

  const checkOllamaStatus = async () => {
    setOllamaStatus('checking');
    try {
      const r = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(4000) });
      if (r.ok) {
        const data = await r.json();
        const models = (data.models || []).map(m => m.name);
        setOllamaModels(models);
        if (models.length > 0 && !models.includes(ollamaModel)) handleOllamaModelChange(models[0]);
        setOllamaStatus('online');
      } else { setOllamaStatus('offline'); }
    } catch { setOllamaStatus('offline'); }
  };

  const checkClaudeStatus = async () => {
    if (!claudeApiKey) { setClaudeStatus('no-key'); return; }
    setClaudeStatus('checking');
    try {
      const r = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        signal: AbortSignal.timeout(5000)
      });
      setClaudeStatus(r.ok ? 'online' : 'offline');
    } catch {
      setClaudeStatus('offline');
    }
  };

  const parseAIResponse = (text) => {
    if (!text || !text.trim()) throw new Error("A IA devolveu uma resposta vazia.");
    // Remove markdown code blocks e lixo comum de modelos locais
    let cleanText = text
      .replace(/```json\n?/gi, '').replace(/```\n?/g, '')
      .replace(/^[^{\[]*/, '') // remove tudo antes do primeiro { ou [
      .trim();
    try {
      return JSON.parse(cleanText);
    } catch (err) {
      // Tenta extrair objeto JSON { }
      const firstBrace = text.indexOf('{');
      let lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
         try { return JSON.parse(text.substring(firstBrace, lastBrace + 1)); }
         catch (e) {
           let tempLastBrace = lastBrace;
           while (tempLastBrace > firstBrace) {
               tempLastBrace = text.lastIndexOf('}', tempLastBrace - 1);
               if (tempLastBrace > firstBrace) {
                   try { return JSON.parse(text.substring(firstBrace, tempLastBrace + 1)); }
                   catch (e2) { continue; }
               }
           }
         }
      }
      // Tenta extrair array JSON [ ]
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        try { return JSON.parse(text.substring(firstBracket, lastBracket + 1)); } catch (e) {}
      }
      // Tenta reconstruir JSON a partir de pares chave-valor órfãos
      // (acontece quando o Gemini/ChatGPT devolve o conteúdo sem o wrapper { })
      try {
        const kvRegex = /"([^"]+)"\s*:\s*("(?:[^"\\]|\\.)*"|[\d.]+|true|false|null|\{[^}]*\}|\[[^\]]*\])/g;
        const obj = {};
        let match;
        while ((match = kvRegex.exec(text)) !== null) {
          try { obj[match[1]] = JSON.parse(match[2]); } catch { obj[match[1]] = match[2].replace(/^"|"$/g, ''); }
        }
        if (Object.keys(obj).length > 0) return obj;
      } catch (e) {}
      // Último recurso: se o texto parece uma resposta de texto simples (não-JSON esperado), devolve como string
      // (usado no modo manual quando o prompt não pede JSON)
      if (text.trim().length > 20 && !text.trim().startsWith('{') && !text.trim().startsWith('[')) {
        return text.trim();
      }
      throw new Error("A IA devolveu texto não-JSON. No Modo Manual, certifica-te que colas a resposta COMPLETA incluindo os { } do JSON.");
    }
  };

  const handleProjectDataChange = (field, value) => setProjectData(prev => ({ ...prev, [field]: value }));
  const saveToProjectHistory = (data) => setProjectHistory(prev => [data, ...prev].slice(0, 10));
  const revertToProjectVersion = (index) => {
    if (projectHistory[index]) {
      const currentData = { ...projectData };
      setProjectData(projectHistory[index]);
      setProjectHistory(prev => [currentData, ...prev.slice(index + 1)].slice(0, 10));
    }
  };

  const renderText = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const formatDuration = (seconds) => {
    const s = parseInt(seconds) || 0;
    const m = Math.floor(s / 60);
    const remS = s % 60;
    return m > 0 ? `${m}m ${remS}s` : `${remS}s`;
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `[${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}]`;
  };

  const stylizeTime = (timeStr) => {
    if (typeof timeStr !== 'string') return timeStr;
    const regex = /(\d+)([ms])/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(timeStr)) !== null) {
      parts.push(timeStr.substring(lastIndex, match.index));
      parts.push(<React.Fragment key={match.index}>{match[1]}<span className="text-[0.7em] normal-case lowercase opacity-75 font-bold mx-[1px]">{match[2]}</span></React.Fragment>);
      lastIndex = regex.lastIndex;
    }
    parts.push(timeStr.substring(lastIndex));
    return <span className="normal-case tracking-normal">{parts}</span>;
  };

  const stylizeTimeHTML = (timeStr) => {
    if (typeof timeStr !== 'string') return timeStr;
    let html = timeStr.replace(/(\d+)([ms])/g, '$1<span style="font-size: 0.7em; text-transform: lowercase; margin-left: 1px; margin-right: 1px; opacity: 0.75; font-weight: bold;">$2</span>');
    return `<span style="text-transform: none; letter-spacing: normal;">${html}</span>`;
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEditing = (type, item) => {
    setEditingAssetId(item.id);
    setEditingName(item.name);
    if (type === 'character') {
       const { height, build } = getCharTraits(item);
       setEditingHeight(height);
       setEditingBuild(build || 'Normal');
    }
  };

  const saveEditing = (type, id, oldName) => {
    setProjectData(prev => {
      const next = { ...prev };
      if (type === 'character') {
        const idx = next.characters.findIndex(c => c.id === id);
        if (idx > -1) {
            next.characters[idx].name = editingName;
            next.characters[idx].physical = { ...next.characters[idx].physical, height: editingHeight, build: editingBuild };
            next.characters[idx].customPrompt = null; 
        }
      } else if (type === 'setting') {
        const idx = next.settings.findIndex(s => s.id === id);
        if (idx > -1) next.settings[idx].name = editingName;
      }

      if (oldName !== editingName && editingName.trim()) {
        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapeRegExp(oldName)}\\b`, 'gi');
        if (next.scenes) {
          next.scenes.forEach(scene => {
            if (scene.takes) {
              scene.takes.forEach(take => {
                if (take.action) take.action = take.action.replace(regex, editingName);
                if (take.dialogues) take.dialogues.forEach(d => { if (d.characterName === oldName) d.characterName = editingName; if (d.text) d.text = d.text.replace(regex, editingName); });
              });
            }
          });
        }
      }
      return next;
    });
    setEditingAssetId(null);
  };

  const handleDeleteAsset = (type, id) => {
    saveToProjectHistory(projectData);
    setProjectData(prev => {
      const next = { ...prev };
      if (type === 'character') {
        next.characters = next.characters.filter(c => c.id !== id);
        if (next.scenes) {
          next.scenes.forEach(scene => scene.takes?.forEach(take => { if (take.characterIds) take.characterIds = take.characterIds.filter(cId => cId !== id); }));
        }
      } else if (type === 'setting') {
        next.settings = next.settings.filter(s => s.id !== id);
        if (next.scenes) {
          next.scenes.forEach(scene => scene.takes?.forEach(take => { if (take.settingId === id) take.settingId = null; }));
        }
      } else if (type === 'poster') {
        next.posterPrompt = '';
        next.customPosterPrompt = '';
      }
      return next;
    });
  };

  const handleDeleteSpecialTake = (field) => {
    saveToProjectHistory(projectData);
    setProjectData(prev => {
        const next = { ...prev };
        next[field] = null;
        return next;
    });
  };

  const handleGenerateNewAsset = async () => {
    if (!addAssetModal.prompt.trim()) return;
    setIsGeneratingAsset(true);
    let schemaDesc = ""; let userQuery = "";
    if (addAssetModal.type === 'character') {
       schemaDesc = `{ "id": "novo_id", "name": "Nome da Personagem", "description": "Descrição visual...", "physical": { "height": "175", "build": "Normal" }, "voicePrompt": "Prompt detalhado para voz..." }`;
       userQuery = `Atua como diretor de arte. Criar nova personagem. Contexto: ${projectData.title} - ${projectData.storyPrompt}. Pedido: "${addAssetModal.prompt}". RESPONDE APENAS COM UM JSON VÁLIDO: ${schemaDesc}`;
    } else if (addAssetModal.type === 'setting') {
       schemaDesc = `{ "id": "novo_id", "name": "Nome do Local", "description": "Descrição visual..." }`;
       userQuery = `Atua como diretor de arte. Criar novo cenário. Contexto: ${projectData.title} - ${projectData.storyPrompt}. Pedido: "${addAssetModal.prompt}". RESPONDE APENAS COM UM JSON VÁLIDO: ${schemaDesc}`;
    } else if (addAssetModal.type === 'poster') {
       const charsNames = projectData.characters && projectData.characters.length > 0 ? projectData.characters.map(c => c.name).join(", ") : "as personagens principais";
       schemaDesc = `{ "posterPrompt": "Prompt em inglês altamente detalhado para gerar poster. OBRIGATÓRIO: Incluir todas as personagens (${charsNames}) e adicionar 'The K-Brothers logo in the bottom right corner'." }`;
       userQuery = `Atua como diretor de arte. Criar prompt da Capa. Contexto: ${projectData.title} - ${projectData.storyPrompt}. OBRIGATÓRIO: Todas as personagens da história (${charsNames}) DEVEM aparecer visualmente no poster. OBRIGATÓRIO: Adicionar ao prompt o texto 'The K-Brothers logo in the bottom right corner'. Pedido opcional: "${addAssetModal.prompt}". RESPONDE APENAS COM UM JSON VÁLIDO: ${schemaDesc}`;
    }

    try {
      const text = await callGeminiAPI(userQuery, true);
      if (text) {
        const parsed = parseAIResponse(text);
        saveToProjectHistory(projectData);
        setProjectData(prev => {
          const next = { ...prev };
          if (addAssetModal.type === 'character') { parsed.id = `char_${Date.now()}`; next.characters = [...(next.characters || []), parsed]; } 
          else if (addAssetModal.type === 'setting') { parsed.id = `set_${Date.now()}`; next.settings = [...(next.settings || []), parsed]; } 
          else if (addAssetModal.type === 'poster') { next.posterPrompt = parsed.posterPrompt; next.customPosterPrompt = null; }
          return next;
        });
        setAddAssetModal({ isOpen: false, type: null, prompt: '' });
      }
    } catch(e) { alert("Erro ao criar asset."); } finally { setIsGeneratingAsset(false); }
  };

  // Funções de Narração (Voz OFF)
  const handleGenerateNarrations = async (sceneId) => {
      setIsGeneratingNarrations(true);
      const scene = projectData.scenes.find(s => s.id === sceneId);
      const query = `Atua como argumentista e realizador. Cria narrações (Voz OFF) para a cena "${scene.title}".
      TAKES DA CENA: ${JSON.stringify(scene.takes.map(t => ({id: t.id, action: t.action, dialogues: t.dialogues})))}
      PEDIDO DO UTILIZADOR: ${narrationInstruction || 'Preenche takes sem diálogo ou faz ligações fluídas entre takes com o narrador.'}
      REGRAS CRÍTICAS: 
      1. Cria narrações ONDE FIZEREM FALTA na cena (seja para substituir falta de diálogos ou ligar a ação).
      2. A posição ("position") OBRIGATORIAMENTE tem de ser: 'before' (antes da ação do take), 'during' (junto dos diálogos), ou 'after' (depois do take).
      3. A língua OBRIGATÓRIA é: ${projectData.language}.
      RESPONDE APENAS COM JSON VÁLIDO NO SEGUINTE FORMATO:
      { "narrations": [ { "takeId": "id do take a que se aplica", "position": "before|during|after", "text": "Texto em Português..." } ] }`;

      try {
          const text = await callGeminiAPI(query, true);
          if (text) {
              const parsed = parseAIResponse(text);
              if (parsed.narrations && Array.isArray(parsed.narrations)) {
                  saveToProjectHistory(projectData);
                  const newNarrations = parsed.narrations.map((n, i) => ({
                      ...n,
                      id: `narr_${Date.now()}_${i}`,
                      isPending: true
                  }));
                  setProjectData(prev => ({
                      ...prev,
                      scenes: prev.scenes.map(s => s.id === sceneId ? { ...s, narrations: [...(s.narrations || []), ...newNarrations] } : s)
                  }));
                  setNarrationInstruction('');
              }
          }
      } catch (e) {
          alert("Erro ao gerar narrações: " + e.message);
      } finally {
          setIsGeneratingNarrations(false);
      }
  };

  const confirmNarration = (sceneId, narrationId) => {
      saveToProjectHistory(projectData);
      setProjectData(prev => {
          const next = { ...prev };
          const sceneIdx = next.scenes.findIndex(s => s.id === sceneId);
          if (sceneIdx > -1 && next.scenes[sceneIdx].narrations) {
              const narrIdx = next.scenes[sceneIdx].narrations.findIndex(n => n.id === narrationId);
              if (narrIdx > -1) {
                  next.scenes[sceneIdx].narrations[narrIdx].isPending = false;
              }
          }
          return next;
      });
  };

  const moveNarration = (sceneId, narrationId, newValue) => {
      const [takeId, position] = newValue.split('|');
      setProjectData(prev => ({
          ...prev,
          scenes: prev.scenes.map(s => {
              if (s.id === sceneId && s.narrations) {
                  return {
                      ...s,
                      narrations: s.narrations.map(n => 
                          n.id === narrationId ? { ...n, takeId, position } : n
                      )
                  };
              }
              return s;
          })
      }));
  };

  const deleteNarration = (sceneId, narrationId) => {
      saveToProjectHistory(projectData);
      setProjectData(prev => {
          const next = { ...prev };
          const sceneIdx = next.scenes.findIndex(s => s.id === sceneId);
          if (sceneIdx > -1 && next.scenes[sceneIdx].narrations) {
              next.scenes[sceneIdx].narrations = next.scenes[sceneIdx].narrations.filter(n => n.id !== narrationId);
          }
          return next;
      });
  };

  const regenerateSingleNarration = async (sceneId, narrationId) => {
      setIsRegeneratingSingleNarration(prev => ({ ...prev, [narrationId]: true }));
      const scene = projectData.scenes.find(s => s.id === sceneId);
      const narration = (scene.narrations || []).find(n => n.id === narrationId);
      const take = scene.takes.find(t => t.id === narration.takeId);

      const query = `Atua como argumentista. REGERA apenas a seguinte narração (Voz OFF).
      CENA: "${scene.title}" | TAKE DA AÇÃO: "${take.action}"
      NARRAÇÃO ATUAL: "${narration.text}"
      POSIÇÃO: ${narration.position} (before/during/after)
      INSTRUÇÃO: Escreve uma nova versão melhorada desta narração. A língua OBRIGATÓRIA é: ${projectData.language}.
      RESPONDE APENAS COM JSON VÁLIDO: { "newText": "novo texto da narração" }`;

      try {
          const text = await callGeminiAPI(query, true);
          if (text) {
              const parsed = parseAIResponse(text);
              if (parsed.newText) {
                  saveToProjectHistory(projectData);
                  setProjectData(prev => {
                      const next = { ...prev };
                      const sceneIdx = next.scenes.findIndex(s => s.id === sceneId);
                      if (sceneIdx > -1 && next.scenes[sceneIdx].narrations) {
                          const narrIdx = next.scenes[sceneIdx].narrations.findIndex(n => n.id === narrationId);
                          if (narrIdx > -1) {
                              next.scenes[sceneIdx].narrations[narrIdx].text = parsed.newText;
                          }
                      }
                      return next;
                  });
              }
          }
      } catch (e) {
          alert("Erro ao regerar narração: " + e.message);
      } finally {
          setIsRegeneratingSingleNarration(prev => ({ ...prev, [narrationId]: false }));
      }
  };

  const handleDeleteTake = (sceneId, takeId) => {
    saveToProjectHistory(projectData);
    setProjectData(prev => {
      const next = { ...prev };
      const sceneIdx = next.scenes.findIndex(s => s.id === sceneId);
      if (sceneIdx > -1) {
         next.scenes[sceneIdx].takes = next.scenes[sceneIdx].takes.filter(t => t.id !== takeId);
         if (next.scenes[sceneIdx].takes.length === 0) next.scenes.splice(sceneIdx, 1);
      }
      return next;
    });
  };

  const handleDeleteVoicePrompt = (id) => {
    saveToProjectHistory(projectData);
    setProjectData(prev => {
      const next = { ...prev };
      const idx = next.characters.findIndex(c => c.id === id);
      if (idx > -1) next.characters[idx].voicePrompt = '';
      return next;
    });
  };

  const handleGenerateFinalMessage = async () => {
    if (!finalMessageInput.trim()) return;
    setIsGeneratingFM(true);
    const query = `Atua como realizador. Acrescentar Mensagem Final pós-créditos. Contexto: ${projectData.title}. Pedido: "${finalMessageInput}". INSTRUÇÕES: 1. 'action' (PT). 2. 'camera'. 3. 'duration' (segundos). 4. 'visualPromptEN' (EN - CRÍTICO: OBRIGATÓRIO incluir 'text overlay reading "${finalMessageInput}"' para garantir que o texto é renderizado no vídeo). Responde APENAS com JSON: { "action": "...", "camera": "...", "duration": 5, "visualPromptEN": "..." }`;
    try {
      const text = await callGeminiAPI(query, true);
      if (text) {
        const parsed = parseAIResponse(text); parsed.id = `fm_${Date.now()}`; parsed.userInput = finalMessageInput;
        saveToProjectHistory(projectData);
        setProjectData(prev => ({ ...prev, finalMessages: [...(prev.finalMessages || []), parsed] }));
        setFinalMessageInput(''); setAddingFinalMessage(false);
      }
    } catch(e) { alert("Erro ao gerar Mensagem Final."); } finally { setIsGeneratingFM(false); }
  };

  const handleGenerateAutomaticFinalMessages = async () => {
    setIsGeneratingAutoFM(true);
    
    const safeScript = projectData.script ? projectData.script.substring(0, 3000) : (projectData.storyPrompt || projectData.title);
    
    const query = `Atua como realizador e argumentista. Baseado no filme "${projectData.title}" com o seguinte contexto/guião: "${safeScript}...".
    Deves criar EXATAMENTE 3 Mensagens Finais (Pós-Créditos) em texto sobreposto a imagens cinemáticas de fundo, que reflitam o impacto da história.
    MOLDES OBRIGATÓRIOS (Todas estritamente adaptadas à realidade, dados e cultura de Portugal):
    1. Primeira mensagem: Baseada numa estatística real ou plausível sobre o tema principal do filme em Portugal.
    2. Segunda mensagem: A moral da história principal, refletindo sobre o impacto humano ou social em Portugal.
    3. Terceira mensagem: Moralização e apelo para o futuro, uma mensagem de esperança ou aviso voltada para a sociedade portuguesa de amanhã.
    INSTRUÇÕES PARA CADA MENSAGEM:
    1. 'action' (Descrição visual básica. Exemplo: "Um texto branco surge no ecrã").
    2. 'camera' (Ex: Static wide shot, slow zoom in).
    3. 'duration' (Em segundos, idealmente entre 5 e 8).
    4. 'userInput' (A FRASE EXATA e concisa gerada em PT-PT que vai aparecer no ecrã).
    5. 'visualPromptEN' (Prompt visual em INGLÊS. CRÍTICO: Tem de incluir OBRIGATORIAMENTE a instrução de texto com a frase gerada. Exemplo: '...with a bold cinematic text overlay reading "FRASE GERADA AQUI"'. O texto TEM de fazer parte do prompt de vídeo!).
    Responde APENAS com JSON no formato:
    { "messages": [
        { "action": "...", "camera": "...", "duration": 6, "userInput": "A frase exata gerada aqui", "visualPromptEN": "..." },
        { "action": "...", "camera": "...", "duration": 6, "userInput": "A frase exata gerada aqui", "visualPromptEN": "..." },
        { "action": "...", "camera": "...", "duration": 6, "userInput": "A frase exata gerada aqui", "visualPromptEN": "..." }
      ]
    }`;

    try {
      const text = await callGeminiAPI(query, true);
      if (text) {
        const parsed = parseAIResponse(text);
        if (parsed.messages && Array.isArray(parsed.messages)) {
            const newMessages = parsed.messages.map((m, i) => ({
               ...m,
               id: `fm_auto_${Date.now()}_${i}`
            }));
            saveToProjectHistory(projectData);
            setProjectData(prev => ({ ...prev, finalMessages: [...(prev.finalMessages || []), ...newMessages] }));
        }
      }
    } catch(e) { 
      alert("Erro ao gerar as mensagens automáticas."); 
    } finally { 
      setIsGeneratingAutoFM(false); 
    }
  };

  const handleDeleteFinalMessage = (id) => {
    saveToProjectHistory(projectData);
    setProjectData(prev => ({ ...prev, finalMessages: (prev.finalMessages || []).filter(fm => fm.id !== id) }));
  };

  const updatePlanDay = (dayIdx, changes) => {
    setProjectData(prev => {
      if (!prev.socialMediaPlan?.plan) return prev;
      return {
        ...prev,
        socialMediaPlan: {
          ...prev.socialMediaPlan,
          plan: prev.socialMediaPlan.plan.map((d, i) => i === dayIdx ? { ...d, ...changes } : d)
        }
      };
    });
  };

  const handleDeleteSocialAsset = (category, id) => {
    saveToProjectHistory(projectData);
    setProjectData(prev => {
        const next = { ...prev };
        if (next.socialMedia && next.socialMedia[category]) next.socialMedia[category] = next.socialMedia[category].filter(item => item.id !== id);
        return next;
    });
  };

  const splitDialogueText = (text) => {
      if (!text) return ["", ""];
      const sentences = text.match(/[^.!?]+[.!?]+/g);
      if (!sentences || sentences.length <= 1) {
          const words = text.split(' ');
          const mid = Math.ceil(words.length / 2);
          return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
      }
      const mid = Math.ceil(sentences.length / 2);
      return [sentences.slice(0, mid).join(' ').trim(), sentences.slice(mid).join(' ').trim()];
  };

  const handleSplitSocialVideo = (categoryKey, index) => {
      saveToProjectHistory(projectData);
      setProjectData(prev => {
          const newData = { ...prev };
          if (!newData.socialMedia) newData.socialMedia = {};
          
          const list = [...(newData.socialMedia[categoryKey] || [])];
          const itemToSplit = list[index];

          if (!itemToSplit || !itemToSplit.dialogue) return newData;

          const [part1Text, part2Text] = splitDialogueText(itemToSplit.dialogue);
          const baseName = (renderText(itemToSplit.characterName) || "").replace(/\s*\(Parte \d+\)\s*/gi, '').trim();

          const part1 = { 
              ...itemToSplit, 
              characterName: `${baseName} (Parte 1)`, 
              dialogue: part1Text || "...",
              finalVideoPrompt: "", 
              id: `${itemToSplit.id}_p1`
          };
          
          const part2 = { 
              ...itemToSplit, 
              characterName: `${baseName} (Parte 2)`, 
              dialogue: part2Text || "...",
              finalVideoPrompt: "",
              id: `${itemToSplit.id}_p2`
          };

          list.splice(index, 1, part1, part2);
          newData.socialMedia[categoryKey] = list;
          return newData;
      });
  };

  const handleToggleSubtitle = (category, index, checked) => {
      setProjectData(prev => {
          const next = { ...prev };
          if (next.socialMedia && next.socialMedia[category]) {
              next.socialMedia[category][index].hasSubtitle = checked;
          }
          return next;
      });
  };

  const handleImportAssetsUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          let resultText = event.target.result;
          if (resultText.charCodeAt(0) === 0xFEFF) resultText = resultText.slice(1);
          const json = JSON.parse(resultText);
          const parsedData = (json.version === '1.0' || json.version === '1.1') && json.projectData ? json.projectData : json;

          const chars = parsedData.characters || [];
          const sets = parsedData.settings || [];

          if (chars.length === 0 && sets.length === 0) {
              alert("Nenhum personagem ou cenário encontrado neste projeto.");
              return;
          }

          setImportAssetsModal({
            isOpen: true,
            characters: chars,
            settings: sets,
            selectedCharIds: chars.map(c => c.id),
            selectedSettingIds: sets.map(s => s.id)
          });
        } catch (err) {
          alert("Erro ao ler o ficheiro para importação.");
        }
      };
      reader.readAsText(file);
    }
    if (e.target) e.target.value = null;
  };

  const toggleImportSelection = (type, id) => {
     setImportAssetsModal(prev => {
        if (type === 'char') {
           const isSel = prev.selectedCharIds.includes(id);
           return { ...prev, selectedCharIds: isSel ? prev.selectedCharIds.filter(i => i !== id) : [...prev.selectedCharIds, id] };
        } else {
           const isSel = prev.selectedSettingIds.includes(id);
           return { ...prev, selectedSettingIds: isSel ? prev.selectedSettingIds.filter(i => i !== id) : [...prev.selectedSettingIds, id] };
        }
     });
  };

  const confirmImportAssets = () => {
     const charsToImport = importAssetsModal.characters.filter(c => importAssetsModal.selectedCharIds.includes(c.id)).map(c => ({...c, id: `char_imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`}));
     const setsToImport = importAssetsModal.settings.filter(s => importAssetsModal.selectedSettingIds.includes(s.id)).map(s => ({...s, id: `set_imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`}));

     saveToProjectHistory(projectData);
     setProjectData(prev => ({
        ...prev,
        characters: [...(prev.characters || []), ...charsToImport],
        settings: [...(prev.settings || []), ...setsToImport]
     }));

     setImportAssetsModal({ isOpen: false, characters: [], settings: [], selectedCharIds: [], selectedSettingIds: [] });
  };

  const getFormattedDialogues = (take) => {
    const langStr = renderText(projectData.language) || 'Português (Portugal)';
    const displayLang = langStr === 'Português (Portugal)' ? 'Português de Portugal (NÃO BRASILEIRO)' : langStr;

    if (take.dialogues && take.dialogues.length > 0) {
      return (
        <div className="space-y-3 mt-4 p-4 bg-slate-950/50 rounded-xl border border-indigo-500/20">
          <h4 className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1.5 border-b border-indigo-500/20 pb-2 mb-3"><Mic size={14}/> Diálogos da Cena</h4>
          {take.dialogues.map((d, i) => (
            <div key={i} className="text-sm">
              <strong className="text-indigo-300 uppercase text-xs block mb-0.5">{renderText(d.characterName)} {d.emotion ? <span className="lowercase font-normal opacity-80">({renderText(d.emotion)})</span> : ''} diz em {displayLang}:</strong>
              <span className="text-slate-300 italic">"{renderText(d.text)}"</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const checkAndUpgradeLegacyProject = async (data) => {
    const needsPoster = !data.posterPrompt;
    const needsIntro = !data.intro;
    const needsPreface = !data.preface;
    const needsOutro = !data.outro;
    const missingVoiceChars = (data.characters || []).filter(c => !c.voicePrompt);
    const needsVoices = missingVoiceChars.length > 0;

    if (!needsPoster && !needsIntro && !needsPreface && !needsOutro && !needsVoices) return;

    setIsUpgradingProject(true);
    const query = `Atua como argumentista/diretor de arte. Atualizar projeto antigo. Título: "${data.title}" | História: "${data.storyPrompt || data.idea || "N/A"}"
${needsVoices ? `Personagens sem voz: ${JSON.stringify(missingVoiceChars.map(c => ({ id: c.id, name: c.name, description: c.description })))}` : ''}
INSTRUÇÕES: Gera JSON APENAS com os campos:
${needsPoster ? '1. "posterPrompt": Prompt em inglês para poster.' : ''}
${needsIntro ? '2. "intro": { "action": "Ação visual do início...", "camera": "...", "duration": 4 }' : ''}
${needsPreface ? '3. "preface": { "action": "Ação visual inicial...", "camera": "...", "duration": 8, "narratorText": "Fala do narrador em Voz OFF." }' : ''}
${needsOutro ? '4. "outro": { "action": "Ação visual do fim...", "camera": "...", "duration": 4 }' : ''}
${needsVoices ? '5. "voicePrompts": [ { "id": "...", "voicePrompt": "..." } ]' : ''}
ESTRUTURA: { ${needsPoster ? '"posterPrompt": "...",' : ''} ${needsIntro ? '"intro": {...},' : ''} ${needsPreface ? '"preface": {...},' : ''} ${needsOutro ? '"outro": {...},' : ''} ${needsVoices ? '"voicePrompts": [...]' : ''} }`;

    try {
      const text = await callGeminiAPI(query, true);
      if (text) {
          const parsed = parseAIResponse(text);
          setProjectData(prev => {
              const next = { ...prev };
              if (needsPoster && parsed.posterPrompt) next.posterPrompt = parsed.posterPrompt;
              if (needsIntro && parsed.intro) next.intro = parsed.intro;
              if (needsPreface && parsed.preface) next.preface = parsed.preface;
              if (needsOutro && parsed.outro) next.outro = parsed.outro;
              if (needsVoices && parsed.voicePrompts && next.characters) {
                  parsed.voicePrompts.forEach(vp => {
                      const char = next.characters.find(c => c.id === vp.id);
                      if (char) char.voicePrompt = vp.voicePrompt;
                  });
              }
              saveToProjectHistory(next);
              return next;
          });
      }
    } catch (e) { console.error("Erro ao atualizar:", e); } finally { setIsUpgradingProject(false); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          let resultText = event.target.result;
          if (resultText.charCodeAt(0) === 0xFEFF) resultText = resultText.slice(1);
          const json = JSON.parse(resultText);
          let parsedData = (json.version === '1.0' || json.version === '1.1') && json.projectData ? json.projectData : json;
          setProjectHistory((json.version === '1.0' || json.version === '1.1') && json.projectHistory ? json.projectHistory : []);
          
          if (!parsedData.finalMessages) parsedData.finalMessages = [];
          if (!parsedData.socialMedia) parsedData.socialMedia = null;
          if (!parsedData.socialMediaPlan) parsedData.socialMediaPlan = null;
          if (!parsedData.socialPlanPremiereDate) parsedData.socialPlanPremiereDate = parsedData.socialPlanStartDate || '';
          if (!parsedData.filmSoundType) parsedData.filmSoundType = 'Diálogos';
          if (!parsedData.lastGeneratedSoundType) parsedData.lastGeneratedSoundType = parsedData.filmSoundType || 'Diálogos';
          if (parsedData.sceneTakeRatio === undefined) parsedData.sceneTakeRatio = 1;
          if (parsedData.lastGeneratedSceneTakeRatio === undefined) parsedData.lastGeneratedSceneTakeRatio = parsedData.sceneTakeRatio;
          if (!parsedData.preface) parsedData.preface = null;
          if (parsedData.socialMediaHashtags === undefined) parsedData.socialMediaHashtags = '#TheKBrothers';
          if (parsedData.socialMediaHashtagsEnabled === undefined) parsedData.socialMediaHashtagsEnabled = true;

          if (parsedData.socialMedia) {
             const categories = ['characterPosters', 'behindTheScenes', 'behindTheScenesVideo', 'makingOff', 'whoAmI', 'talkToMe'];
             categories.forEach(cat => {
                 if (Array.isArray(parsedData.socialMedia[cat])) {
                     parsedData.socialMedia[cat] = parsedData.socialMedia[cat].map((item, i) => {
                         if (!item.id) return { ...item, id: `soc_${cat}_${Date.now()}_${i}` };
                         return item;
                     });
                 } else {
                     parsedData.socialMedia[cat] = [];
                 }
             });
          }

          setProjectData(parsedData);
          setCurrentStep(0);
          checkAndUpgradeLegacyProject(parsedData);
        } catch (err) { alert("Erro ao ler o ficheiro."); }
      };
      reader.readAsText(file);
    }
    if (e.target) e.target.value = null;
  };

  const handleSaveProject = () => {
    if (!projectData) return;
    
    // 1. Criar uma cópia isolada do estado para injetar prompts sem estragar o editor
    const dataToExport = JSON.parse(JSON.stringify(projectData));
    
    // 2. Helper igual ao do TXT para limpar as "@" nos textos dinâmicos
    const cleanFinalPrompt = (str) => !str ? '' : str.replace(/anexa na @/g, "anexa na imagem com o mesmo nome").replace(/anexo na @/g, "anexo na imagem com o mesmo nome");

    // 3. Compilar e injetar TODOS os prompts literais dentro do JSON
    dataToExport.finalPosterPrompt = cleanFinalPrompt(resolvePosterPrompt());
    
    if (dataToExport.characters) {
        dataToExport.characters.forEach(c => {
            c.finalImagePrompt = cleanFinalPrompt(resolveCharPrompt(c));
            c.finalVoicePrompt = cleanFinalPrompt(resolveCharVoicePrompt(c));
        });
    }
    if (dataToExport.settings) {
        dataToExport.settings.forEach(s => {
            s.finalImagePrompt = cleanFinalPrompt(resolveSettingPrompt(s));
        });
    }
    if (dataToExport.intro) dataToExport.intro.finalVideoPrompt = cleanFinalPrompt(resolveIntroPrompt());
    if (dataToExport.preface) dataToExport.preface.finalVideoPrompt = cleanFinalPrompt(resolvePrefacePrompt());
    if (dataToExport.outro) dataToExport.outro.finalVideoPrompt = cleanFinalPrompt(resolveOutroPrompt());
    
    if (dataToExport.scenes) {
        dataToExport.scenes.forEach(scene => {
            if (scene.takes) {
                scene.takes.forEach(take => {
                    take.finalVideoPrompt = cleanFinalPrompt(resolveTakePrompt(take, true));
                });
            }
        });
    }
    if (dataToExport.finalMessages) {
        dataToExport.finalMessages.forEach(fm => {
            fm.finalVideoPrompt = cleanFinalPrompt(resolveFinalMessagePrompt(fm));
        });
    }
    if (dataToExport.socialMedia) {
        const soc = dataToExport.socialMedia;
        if (soc.characterPosters) soc.characterPosters.forEach(p => p.finalImagePrompt = cleanFinalPrompt(getSocialImagePrompt(p, 'characterPoster')));
        if (soc.behindTheScenes) soc.behindTheScenes.forEach(p => p.finalImagePrompt = cleanFinalPrompt(getSocialImagePrompt(p, 'bts')));
        if (soc.launchImage) soc.launchImage.forEach(p => p.finalImagePrompt = cleanFinalPrompt(getSocialImagePrompt(p, 'poster')));
        if (soc.behindTheScenesVideo) soc.behindTheScenesVideo.forEach(p => p.finalVideoPrompt = cleanFinalPrompt(getSocialVideoPrompt(p)));
        if (soc.makingOff) soc.makingOff.forEach(p => p.finalVideoPrompt = cleanFinalPrompt(getSocialVideoPrompt(p)));
        if (soc.whoAmI) soc.whoAmI.forEach(p => p.finalVideoPrompt = cleanFinalPrompt(getSocialVideoPrompt(p)));
        if (soc.talkToMe) soc.talkToMe.forEach(p => p.finalVideoPrompt = cleanFinalPrompt(getSocialVideoPrompt(p)));
        if (soc.launchVideo) soc.launchVideo.forEach(p => p.finalVideoPrompt = cleanFinalPrompt(getSocialVideoPrompt(p)));
    }

    // 4. Limpar o projectHistory do output. Agora o ficheiro terá 1/10 do tamanho original!
    const saveData = { version: '1.1', projectData: dataToExport, projectHistory: [] };
    
    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const h = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const safeFilename = (renderText(projectData.title) || 'projeto').replace(/[^a-z0-9]/gi, '_');
    
    a.download = `${safeFilename}_${y}-${mo}-${d}_${h}h${mi}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStylePrefix = () => `${projectData.filmType}, ${projectData.filmGenre} genre, ${projectData.artStyle} art style, cinematic, highly detailed, masterfully crafted, `;
  
  const getCharTraits = (char) => {
    const h = char.physical?.height || char.physical?.heightCm || '';
    const b = char.physical?.build || char.physical?.constitution || '';
    return { height: h, build: b };
  };

  const getCharPrompt = (char) => {
    if (renderText(char.name).toUpperCase().includes('NARRADOR') || renderText(char.name).toUpperCase().includes('VOZ OFF')) {
        return "Personagem não visual (Apenas Voz OFF).";
    }
    const { height, build } = getCharTraits(char);
    let traits = [];
    if (height) traits.push(`Height: ${height}${String(height).includes('cm') ? '' : 'cm'}`);
    if (build) traits.push(`Build: ${build}`);
    const traitsStr = traits.length > 0 ? `. Physical Traits: ${traits.join(', ')}` : '';
    return `${getStylePrefix()} character design, full body turnaround reference, front and back view. Character Name: ${renderText(char.name)}. Description: ${renderText(char.description)}${traitsStr}. Solid color background. Aspect ratio: 9:16.`;
  };

  const getCharVoicePrompt = (char) => {
    let base = char.voicePrompt ? char.voicePrompt : `Voice character: ${renderText(char.name)}. Matching visual description: ${renderText(char.description)}. Natural, expressive, cinematic audio.`;
    if (projectData.language === 'Português (Portugal)' && !base.includes('EUROPEAN PORTUGUESE')) {
      base += ` LINGUAGEM: EUROPEAN PORTUGUESE (STRICTLY NOT BRAZILIAN).`;
    }
    return base;
  };

  const getSettingPrompt = (setting) => `${getStylePrefix()} environment design, establishing shot. Location: ${setting.name}. Description: ${setting.description}. Epic cinematic lighting. Aspect ratio: ${projectData.aspectRatio}.`;
  const getIntroPrompt = () => projectData.intro ? `${getStylePrefix()} movie still, cinematic title sequence, bold typography text reading "${renderText(projectData.title)}". camera shot: ${renderText(projectData.intro.camera)}. Action occurring: ${renderText(projectData.intro.visualPromptEN || projectData.intro.action)}. Dynamic motion, professional framing. Aspect ratio: ${projectData.aspectRatio}.` : "";
  const getPrefacePrompt = () => projectData.preface ? `${getStylePrefix()} movie still, cinematic prologue sequence. camera shot: ${renderText(projectData.preface.camera)}. Action occurring: ${renderText(projectData.preface.visualPromptEN || projectData.preface.action)}. Dynamic motion, professional framing. Aspect ratio: ${projectData.aspectRatio}.` : "";
  const getOutroPrompt = () => projectData.outro ? `${getStylePrefix()} movie still, cinematic end sequence, bold typography text reading "Fim". camera shot: ${renderText(projectData.outro.camera)}. Action occurring: ${renderText(projectData.outro.visualPromptEN || projectData.outro.action)}. Dynamic motion, professional framing. Aspect ratio: ${projectData.aspectRatio}.` : "";
  
  const resolveFinalMessagePrompt = (fm) => {
    if (fm.customPrompt) return fm.customPrompt;
    let basePrompt = `${getStylePrefix()} movie still, post-credits cinematic sequence. camera shot: ${renderText(fm.camera)}. Action occurring: ${renderText(fm.visualPromptEN || fm.action)}. `;
    
    if (fm.userInput && !basePrompt.toLowerCase().includes("text overlay reading")) {
         basePrompt += `Bold typography text overlay reading: "${renderText(fm.userInput)}". `;
    }
    
    basePrompt += `Dynamic motion, professional framing. Aspect ratio: ${projectData.aspectRatio}.`;
    return basePrompt;
  };

  const getSocialImagePrompt = (item, type) => {
     let chars = [];
     let baseCharName = renderText(item.characterName).replace(/\s*\(Parte \d+\)\s*/i, '').trim();

     if (baseCharName === 'Teaser') {
     } else if (type !== 'poster' && baseCharName && baseCharName !== 'Geral') {
         if (baseCharName === 'Todas as Personagens') chars = projectData.characters || [];
         else {
           const found = projectData.characters?.find(c => renderText(c.name) === baseCharName);
           if (found) chars.push(found);
         }
     } else if (type === 'characterPoster') {
         if (baseCharName === 'Todas as Personagens') chars = projectData.characters || [];
         else if (baseCharName !== 'Teaser') {
             const found = projectData.characters?.find(c => renderText(c.name) === baseCharName);
             if (found) chars.push(found);
         }
     }
     
     chars = chars.filter(c => !renderText(c.name).toUpperCase().includes('NARRADOR') && !renderText(c.name).toUpperCase().includes('VOZ OFF'));
     
     let prompt = "Na cena está presente o logo de nome The K-Brothers logo anexo na @, posto no canto inferior direito. ";
     chars.forEach(c => { prompt += `Na cena está presente a personagem de nome ${renderText(c.name)} anexa na @. `; });
     if (chars.length > 0) prompt += `Manter as características físicas e roupas das personagens. `;
     
     prompt += `${getStylePrefix()} ${renderText(item.promptEN)}. `;
     
     if (item.teaserPT && type !== 'bts') prompt += `Bold typography text overlay reading: "${renderText(item.teaserPT)}". `;
     
     prompt += `The movie title "${renderText(projectData.title)}" is visibly integrated. Featuring 'The K-Brothers' logo in the bottom right corner. Aspect ratio: 9:16.`;
     return prompt;
  }

  const getSocialVideoPrompt = (item) => {
      const langStr = renderText(projectData.language) || 'Português (Portugal)';
      const displayLang = langStr === 'Português (Portugal)' ? 'Português de Portugal (NÃO BRASILEIRO)' : langStr;
      let chars = [];
      let baseCharName = renderText(item.characterName).replace(/\s*\(Parte \d+\)\s*/i, '').trim();

      if (baseCharName === 'Todas as Personagens') chars = projectData.characters || [];
      else {
        const found = projectData.characters?.find(c => renderText(c.name) === baseCharName);
        if (found) chars.push(found);
      }
      chars = chars.filter(c => !renderText(c.name).toUpperCase().includes('NARRADOR') && !renderText(c.name).toUpperCase().includes('VOZ OFF'));
      
      let prompt = "Na cena está presente o logo de nome The K-Brothers logo anexo na @, posto no canto inferior direito. ";
      chars.forEach(c => { prompt += `Na cena está presente a personagem de nome ${renderText(c.name)} anexa na @. `; });
      if (chars.length > 0) prompt += `Manter as características físicas e roupas das personagens. `;
      
      prompt += `${getStylePrefix()} movie still, camera shot: ${renderText(item.camera)}. Action occurring: ${renderText(item.visualPromptEN || item.action)}. `;
      prompt += `The movie title "${renderText(projectData.title)}" is visibly integrated into the scene or as a cinematic text overlay. `;
      
      if (item.dialogue) {
         const charNameStr = baseCharName === 'Todas as Personagens' ? (chars.map(c=>c.name).join(' e ') || 'As personagens') : renderText(item.characterName);
         const speaker = chars.length === 1 ? chars[0] : null; 
         const voiceSpecs = speaker ? ` [Voice specs: ${resolveCharVoicePrompt(speaker)}]` : '';
         const emotionSpec = item.emotion ? ` [Emotion: ${renderText(item.emotion)}]` : '';
         prompt += `Dialogues: ${charNameStr}${voiceSpecs}${emotionSpec} diz em ${displayLang}: "${renderText(item.dialogue)}" `;
         
         if (item.hasSubtitle !== false) {
             prompt += `Bold cinematic subtitle text overlay at the bottom reading exactly: "${renderText(item.dialogue)}". `;
         }
      }
      prompt += `Dynamic motion, professional framing. Aspect ratio: 9:16.`;
      return prompt;
  };

  const resolveCharPrompt = (char) => {
    if (renderText(char.name).toUpperCase().includes('NARRADOR') || renderText(char.name).toUpperCase().includes('VOZ OFF')) {
        return "Personagem não visual (Apenas Voz OFF).";
    }
    return char.customPrompt || getCharPrompt(char);
  };
  const resolveCharVoicePrompt = (char) => char.voicePrompt || getCharVoicePrompt(char);
  const resolveSettingPrompt = (setting) => setting.customPrompt || getSettingPrompt(setting);
  const resolvePosterPrompt = () => {
      let base = projectData.customPosterPrompt || projectData.posterPrompt;
      if (!base) return "";
      
      if (!base.toLowerCase().includes("k-brothers")) {
          base += " Featuring 'The K-Brothers' logo in the bottom right corner.";
      }
      
      const charsNames = projectData.characters && projectData.characters.length > 0 
          ? projectData.characters.filter(c => !renderText(c.name).toUpperCase().includes('NARRADOR') && !renderText(c.name).toUpperCase().includes('VOZ OFF')).map(c => c.name).join(", ") 
          : "";
          
      if (charsNames && !base.includes("All main characters")) {
          base += ` All main characters (${charsNames}) must be visually present in the poster.`;
      }
      
      return base.toLowerCase().includes("aspect ratio") ? base : `${base} Aspect ratio: ${projectData.aspectRatio}.`;
  };
  const resolveIntroPrompt = () => projectData.intro?.customPrompt || getIntroPrompt();
  const resolvePrefacePrompt = () => projectData.preface?.customPrompt || getPrefacePrompt();
  const resolveOutroPrompt = () => projectData.outro?.customPrompt || getOutroPrompt();

  const getTakePrompt = (take, clean = false) => {
    const langStr = renderText(projectData.language) || 'Português (Portugal)';
    const displayLang = langStr === 'Português (Portugal)' ? 'Português de Portugal (NÃO BRASILEIRO)' : langStr;

    const set = projectData.settings?.find(s => s.id === take.settingId);
    const chars = (take.characterIds || []).map(id => projectData.characters?.find(c => c.id === id)).filter(Boolean);
    const visualChars = chars.filter(c => !renderText(c.name).toUpperCase().includes('NARRADOR') && !renderText(c.name).toUpperCase().includes('VOZ OFF'));
    const charsNames = visualChars.map(c => renderText(c.name)).join(" e ");
    
    let prompt = "";
    
    if (!clean) {
        if (set) prompt += `A cena decorre no cenário de nome ${renderText(set.name)} anexa na @. `;
        visualChars.forEach(c => { prompt += `Na cena está presente a personagem de nome ${renderText(c.name)} anexa na @. `; });
        if (set || visualChars.length > 0) prompt += `Manter as características físicas e roupas das personagens. `;
    }

    prompt += `${getStylePrefix()} movie still, camera shot: ${renderText(take.camera)}. `;
    if (set) prompt += `Location: ${renderText(set.name)}. `;
    if (visualChars.length > 0) prompt += `Characters present: ${charsNames}. `;
    prompt += `Action occurring: ${renderText(take.visualPromptEN || take.action)}. `;

    if (take.dialogues && take.dialogues.length > 0) {
      const dialogs = take.dialogues.map(d => {
        const speaker = projectData.characters?.find(c => renderText(c.name) === renderText(d.characterName));
        const voiceSpecs = speaker ? ` [Voice specs: ${resolveCharVoicePrompt(speaker)}]` : '';
        const emotionSpec = d.emotion ? ` [Emotion: ${renderText(d.emotion)}]` : '';
        return `${renderText(d.characterName)}${voiceSpecs}${emotionSpec} diz em ${displayLang}: "${renderText(d.text)}"`;
      }).join(" ");
      prompt += `Dialogues: ${dialogs} `;
    } else if (take.dialogue && take.dialogue !== 'Nenhum') {
      const charNameStr = charsNames || 'Personagem';
      const speakersSpecs = chars.map(c => `[${renderText(c.name)} Voice specs: ${resolveCharVoicePrompt(c)}]`).join(" ");
      prompt += `Dialogue: ${charNameStr} ${speakersSpecs} diz em ${displayLang}: "${renderText(take.dialogue)}" `;
    }
    prompt += `Dynamic motion, professional framing. Aspect ratio: ${projectData.aspectRatio}.`;
    return prompt;
  };

  const resolveTakePrompt = (take, clean = false) => getTakePrompt(take, clean);

  const handleGenerateCustomPrompt = async (type, id, item, suggestion = '', targetField = 'image') => {
    setIsGeneratingCustomPrompt(prev => ({ ...prev, [`${id}_${targetField}`]: true }));

    let promptQuery = "";
    if (type === 'poster') {
        const basePrompt = resolvePosterPrompt();
        promptQuery = `Atua como um diretor de arte e designer de cartazes de cinema. Filme: "${projectData.title}" Logline: "${projectData.storyPrompt}" Prompt de Poster Atual: "${basePrompt}" Pedido: "${suggestion || 'Melhora os detalhes do poster'}" INSTRUÇÃO: Altera APENAS o que foi pedido, mas GARANTE que todas as personagens da história se mantêm visíveis e a referência ao logo "The K-Brothers in the bottom right corner" não é apagada. Responde APENAS com JSON: { "newPrompt": "prompt in english" }`;
    } else if (targetField === 'voice') {
        const basePrompt = resolveCharVoicePrompt(item);
        promptQuery = `Atua como um diretor de casting e áudio. Personagem: "${item.name}" Descrição: "${item.description}" Prompt de Voz Atual: "${basePrompt}" Pedido: "${suggestion || 'Melhora o prompt de voz'}" INSTRUÇÃO: Altera APENAS o que foi pedido. ${projectData.language === 'Português (Portugal)' ? 'GARANTE QUE A VOZ É ESPECIFICADA COMO EUROPEAN PORTUGUESE (STRICTLY NOT BRAZILIAN).' : ''} Responde APENAS com JSON: { "newPrompt": "prompt de voz atualizado em inglês" }`;
    } else if (type === 'music') {
        promptQuery = `Atua como um engenheiro de som. Prompt Atual de Música: "${item}" Pedido de alteração: "${suggestion}" INSTRUÇÕES: Modifica o prompt respeitando APENAS o pedido. Mantém timestamps [MM:SS]. Responde APENAS com JSON: { "newPrompt": "..." }`;
    } else if (type === 'intro' || type === 'outro' || type === 'finalMessage' || type === 'preface') {
        let typeLabel = type === 'intro' ? 'Intro (Abertura)' : type === 'outro' ? 'Outro (Final)' : type === 'preface' ? 'Prefácio (Introdução)' : 'Mensagem Final';
        promptQuery = `Atua como realizador e argumentista a modificar o quadro de ${typeLabel}.
Ação Atual (PT): "${item.action}" | Câmara Atual: "${item.camera}" | Prompt Vídeo IA Atual (EN): "${item.visualPromptEN || ''}" ${item.narratorText ? `| Texto Narrador Atual: "${item.narratorText}"` : ''}
Pedido de alteração: "${suggestion || 'Melhora a ação visual'}"
REGRA CRÍTICA ABSOLUTA: Altera APENAS o campo que o utilizador pediu para alterar. Se o utilizador pedir para mudar o "Prompt de Vídeo", alteras APENAS o 'visualPromptEN' e DEVOLVES a 'action', 'camera' e 'narratorText' EXATAMENTE IGUAIS ao original. Se pedir para mudar a 'Ação e Câmara', alteras apenas esses e deixas o prompt igual. Responde APENAS com JSON:
{ "action": "...", "camera": "...", "visualPromptEN": "..."${item.narratorText ? ",\n          \"narratorText\": \"...\"" : ""} }`;
    } else if (type === 'take') {
        promptQuery = `Atua como realizador e argumentista a modificar um take.
Ação Atual (PT): "${item.action}" | Câmara Atual: "${item.camera}" | Prompt Vídeo IA Atual (EN): "${item.visualPromptEN || ''}" | Diálogos Atuais: ${JSON.stringify(item.dialogues || [])}
Pedido de alteração: "${suggestion || 'Melhora a ação visual'}"
REGRA CRÍTICA ABSOLUTA: Altera APENAS o campo que o utilizador pediu para alterar. Se o utilizador disser "Altera o Prompt de Vídeo IA", alteras APENAS o 'visualPromptEN' e devolves a 'action', 'camera' e 'dialogues' EXATAMENTE como estão no original, sem inventar. Se pedir para alterar "Ação e Câmara", alteras só esses e manténs o resto original. Responde APENAS com JSON:
{ "action": "...", "camera": "...", "visualPromptEN": "...", "dialogues": [...] }`;
    } else if (type.startsWith('social_')) {
        const socCategory = type.split('_')[1]; 
        if (socCategory === 'makingOff' || socCategory === 'whoAmI' || socCategory === 'talkToMe' || socCategory === 'behindTheScenesVideo' || socCategory === 'launchVideo') {
            promptQuery = `Atua como diretor de marketing a modificar vídeo social.
Ação (PT): "${item.action}" | Câmara: "${item.camera}" | Diálogo: "${item.dialogue}" | Prompt Vídeo IA (EN): "${item.visualPromptEN || ''}"
Pedido de alteração: "${suggestion || 'Melhora o dinamismo'}"
REGRA CRÍTICA ABSOLUTA: Altera APENAS o que foi pedido estritamente. Se for só o Prompt Vídeo IA, mantém o resto igual ao original. NUNCA uses palavras como "cinema", "salas" ou "bilhetes" no diálogo; os apelos devem ser direcionados para as redes sociais (Youtube, Instagram) e para seguirem "The K-Brothers". Responde APENAS com JSON:
{ "action": "...", "camera": "...", "visualPromptEN": "...", "dialogue": "...", "emotion": "${item.emotion || ''}" }`;
        } else {
            promptQuery = `Atua como diretor de arte a modificar imagem promocional.
Prompt visual (EN): "${item.promptEN}" ${item.teaserPT ? `| Texto Teaser (PT): "${item.teaserPT}"` : ''}
Pedido: "${suggestion || 'Torna mais cinematográfico'}"
REGRA CRÍTICA: Altera APENAS o que foi pedido. Mantém inalterado o resto. NUNCA uses a palavra "cinema" no teaser. Responde APENAS com JSON:
{ "promptEN": "...", ${item.teaserPT !== undefined ? '"teaserPT": "..."' : ''} }`;
        }
    } else {
        let basePrompt = ""; let baseText = "";
        if (type === 'character') { basePrompt = resolveCharPrompt(item); baseText = item.description; } 
        else if (type === 'setting') { basePrompt = resolveSettingPrompt(item); baseText = item.description; }
        promptQuery = `Atua como assistente de guionismo. Texto Atual (PT): "${baseText}" | Prompt IA (EN): "${basePrompt}"
Pedido: "${suggestion || 'Melhora os detalhes'}"
REGRA CRÍTICA ABSOLUTA: Altera APENAS o que foi pedido. Se pediu para mudar o "Prompt de Imagem", muda apenas o 'newPrompt' e devolve o 'newText' IGUAL ao original sem alterar uma vírgula. Responde APENAS com JSON:
{ "newText": "...", "newPrompt": "..." }`;
    }

    try {
        const text = await callGeminiAPI(promptQuery, true);
        if (text) {
            const parsed = parseAIResponse(text);
            setProjectData(prev => {
                const next = { ...prev };
                if (type === 'poster') { next.customPosterPrompt = parsed.newPrompt || parsed.posterPrompt; } 
                else if (type === 'character') {
                    const idx = next.characters.findIndex(c => c.id === id);
                    if (idx > -1) {
                        if (targetField === 'voice') next.characters[idx].voicePrompt = parsed.newPrompt;
                        else { next.characters[idx].customPrompt = parsed.newPrompt; next.characters[idx].description = parsed.newText; }
                    }
                } else if (type === 'setting') {
                    const idx = next.settings.findIndex(s => s.id === id);
                    if (idx > -1) { next.settings[idx].customPrompt = parsed.newPrompt; next.settings[idx].description = parsed.newText; }
                } else if (type === 'music') {
                    next.musicPrompt = parsed.newPrompt || next.musicPrompt;
                } else if (type === 'intro') {
                    next.intro = { ...next.intro, action: parsed.action || next.intro.action, camera: parsed.camera || next.intro.camera, visualPromptEN: parsed.visualPromptEN || next.intro.visualPromptEN };
                    if (next.intro.customPrompt) delete next.intro.customPrompt;
                } else if (type === 'preface') {
                    next.preface = { ...next.preface, action: parsed.action || next.preface.action, camera: parsed.camera || next.preface.camera, visualPromptEN: parsed.visualPromptEN || next.preface.visualPromptEN, narratorText: parsed.narratorText || next.preface.narratorText };
                    if (next.preface.customPrompt) delete next.preface.customPrompt;
                } else if (type === 'outro') {
                    next.outro = { ...next.outro, action: parsed.action || next.outro.action, camera: parsed.camera || next.outro.camera, visualPromptEN: parsed.visualPromptEN || next.outro.visualPromptEN };
                    if (next.outro.customPrompt) delete next.outro.customPrompt;
                } else if (type === 'finalMessage') {
                    const idx = (next.finalMessages || []).findIndex(fm => fm.id === id);
                    if (idx > -1) {
                        next.finalMessages[idx] = { ...next.finalMessages[idx], action: parsed.action || next.finalMessages[idx].action, camera: parsed.camera || next.finalMessages[idx].camera, visualPromptEN: parsed.visualPromptEN || next.finalMessages[idx].visualPromptEN };
                        if (next.finalMessages[idx].customPrompt) delete next.finalMessages[idx].customPrompt;
                    }
                } else if (type === 'take') {
                    next.scenes.forEach(s => {
                        const tIdx = s.takes?.findIndex(t => t.id === id);
                        if (tIdx > -1) {
                            s.takes[tIdx].action = parsed.action || s.takes[tIdx].action;
                            if (parsed.camera) s.takes[tIdx].camera = parsed.camera;
                            if (parsed.dialogues) s.takes[tIdx].dialogues = parsed.dialogues;
                            if (parsed.visualPromptEN) s.takes[tIdx].visualPromptEN = parsed.visualPromptEN;
                            if (s.takes[tIdx].customPrompt) delete s.takes[tIdx].customPrompt;
                        }
                    });
                } else if (type.startsWith('social_')) {
                    const socCategory = type.split('_')[1];
                    if (next.socialMedia && next.socialMedia[socCategory]) {
                       const idx = next.socialMedia[socCategory].findIndex(i => i.id === id);
                       if (idx > -1) {
                           if (socCategory === 'makingOff' || socCategory === 'whoAmI' || socCategory === 'talkToMe' || socCategory === 'behindTheScenesVideo' || socCategory === 'launchVideo') {
                               next.socialMedia[socCategory][idx].action = parsed.action || next.socialMedia[socCategory][idx].action;
                               next.socialMedia[socCategory][idx].camera = parsed.camera || next.socialMedia[socCategory][idx].camera;
                               next.socialMedia[socCategory][idx].dialogue = parsed.dialogue || next.socialMedia[socCategory][idx].dialogue;
                               next.socialMedia[socCategory][idx].emotion = parsed.emotion || next.socialMedia[socCategory][idx].emotion;
                               next.socialMedia[socCategory][idx].visualPromptEN = parsed.visualPromptEN || next.socialMedia[socCategory][idx].visualPromptEN;
                           } else {
                               next.socialMedia[socCategory][idx].promptEN = parsed.promptEN || next.socialMedia[socCategory][idx].promptEN;
                               if (parsed.teaserPT !== undefined) next.socialMedia[socCategory][idx].teaserPT = parsed.teaserPT;
                           }
                       }
                    }
                }
                return next;
            });
            setPromptActionState({ id: null, type: null, targetField: null, suggestion: '' });
        }
    } catch (e) {
        console.error(e);
        alert(`Erro ao gerar: ${e.message}`);
    } finally {
        setIsGeneratingCustomPrompt(prev => ({ ...prev, [`${id}_${targetField}`]: false }));
    }
  };

  const handleAutoGenerateAllSocial = async () => {
    setIsGeneratingAutoSocial(true);
    const chars = projectData.characters || [];
    const charsStr = chars.map(c => `${renderText(c.name)}: ${renderText(c.description || '').substring(0, 180)}`).join(' | ') || 'Sem personagens definidas';
    const charNamesList = chars.map(c => renderText(c.name)).join(', ');
    const settingNamesList = (projectData.settings || []).map(s => renderText(s.name)).join(', ');
    const langStr = renderText(projectData.language) || 'Português (Portugal)';
    const scenesSummary = (projectData.scenes || []).map((sc, i) =>
      `Cena ${i+1}: ${renderText(sc.description || sc.title || '')} — ${(sc.takes || []).map(t => renderText(t.action || '')).join('. ')}`
    ).join('\n');

    const userQuery = `Atua como diretor de marketing digital e especialista em campanhas para redes sociais e YouTube.
Analisa o filme abaixo e cria a campanha promocional IDEAL para lançamento online (YouTube + Instagram).

CONTEXTO DO FILME:
Título: "${projectData.title}" | Tipo: ${renderText(projectData.filmType)}
Logline: "${projectData.storyPrompt || projectData.idea || ''}"
Personagens (${chars.length}): ${charsStr}
Resumo das Cenas:
${scenesSummary.substring(0, 2500)}

LIBERDADE CRIATIVA — NÚMERO DE BLOCOS:
Decide tu o número IDEAL de blocos para este filme específico. Não és obrigado a criar exatamente 8.
- Um filme simples com 2 personagens pode precisar de 4-5 blocos.
- Um filme épico com muitas personagens e cenas complexas pode justificar 10-12 blocos.
- Avalia a riqueza do guião, o número de personagens e o potencial de conteúdo promocional.
- Cada bloco deve ter um propósito claro e diferente dos outros — sem blocos redundantes.

REGRAS OBRIGATÓRIAS:
- PROIBIDO cinemas, bilhetes ou salas. Lançamento EXCLUSIVAMENTE online (YouTube/Instagram).
- Diálogos e legendas: em ${langStr}
- Prompts de imagem/vídeo: SEMPRE em inglês (EN)
- Cada item deve ser ÚNICO e específico — nunca genérico.
- Vídeos: MÁXIMO 10 SEGUNDOS (≈15-20 palavras). Se mais, divide em "Personagem (Parte 1)" e "Personagem (Parte 2)".
- REGRA CRÍTICA — NOMES EM VEZ DE DESCRIÇÕES (OBRIGATÓRIO em todos os campos promptEN e action): NUNCA descreves visualmente personagens ou cenários com adjetivos físicos. Usa SEMPRE o nome próprio da personagem e o nome exato do cenário. O software de renderização faz a correspondência automática. ✓ CORRETO: "shot of ${charNamesList ? '${charNamesList.split(\',\')[0].trim()}' : 'Personagem'} in ${settingNamesList ? '${settingNamesList.split(\',\')[0].trim()}' : 'Cenário'}" ✗ ERRADO: "shot of a man in his 30s in a living room". Personagens: ${charNamesList || 'ver contexto'}${settingNamesList ? `. Cenários: ${settingNamesList}` : ''}
- A campanha deve cobrir OBRIGATORIAMENTE as 3 fases:
  * "pre" — Pré-Estreia: criar antecipação, curiosidade, conhecer as personagens
  * "premiere" — Estreia: anunciar que o filme está disponível, apelar a ver HOJE
  * "post" — Pós-Estreia: manter o interesse, apelar a ver/subscrever o canal YouTube koelho2000

ESTRUTURA DE CADA BLOCO:
- name: nome descritivo e criativo do bloco (PT-PT)
- type: "image" (imagem estática) ou "video" (vídeo curto)
- phase: "pre", "premiere" ou "post"
- items: array de conteúdos. Cada item TEM de ter:
  * characterName: nome da personagem ou "Todas as Personagens"
  Para IMAGENS: teaserPT (texto sobreposto PT-PT, impactante), promptEN (prompt detalhado EN, vertical 9:16, incluir sempre "The K-Brothers logo in the bottom right corner")
  Para VÍDEOS: camera (plano EN), action (descrição PT-PT), emotion, dialogue (apelo PT-PT, MAX 10s/20 palavras)

RESPONDE APENAS COM JSON VÁLIDO, sem markdown:
{ "blocks": [ { "name": "...", "type": "image|video", "phase": "pre|premiere|post", "items": [...] } ] }`;

    try {
      const text = await callGeminiAPI(userQuery, true);
      if (text) {
        const parsed = parseAIResponse(text);
        if (parsed.blocks && Array.isArray(parsed.blocks)) {
          const ts = Date.now();
          const newBlocks = parsed.blocks.map((block, bIdx) => ({
            id: `auto_${ts}_${bIdx}`,
            name: block.name || `Bloco ${bIdx + 1}`,
            type: block.type || 'image',
            phase: block.phase || 'pre',
            isAuto: true,
            items: (block.items || []).map((item, iIdx) => ({ ...item, id: `auto_${ts}_${bIdx}_${iIdx}` }))
          }));
          saveToProjectHistory(projectData);
          setProjectData(prev => ({
            ...prev,
            // Inicializa socialMedia se vazio (necessário para ativar a UI dos blocos)
            socialMedia: prev.socialMedia || { characterPosters:[], behindTheScenes:[], behindTheScenesVideo:[], makingOff:[], whoAmI:[], talkToMe:[], launchImage:[], launchVideo:[] },
            socialMediaExtraBlocks: [
              ...newBlocks,
              ...(prev.socialMediaExtraBlocks || []).filter(b => !b.isAuto)
            ],
            socialMediaPlan: null
          }));
        }
      }
    } catch (e) {
      console.error(e);
      alert(`Erro ao gerar campanha: ${e.message}`);
    } finally {
      setIsGeneratingAutoSocial(false);
    }
  };

  const handleGeneratePremiereHeroImage = async () => {
    setIsGeneratingPremiereHero(true);
    const title = renderText(projectData.title) || 'Filme';
    const filmType = renderText(projectData.filmType) || '';
    const genre = renderText(projectData.filmGenre) || '';
    const posterPrompt = projectData.posterPrompt ? renderText(projectData.posterPrompt).substring(0, 300) : '';
    const chars = (projectData.characters || []).map(c => renderText(c.name)).join(', ');

    const query = `Cria um prompt detalhado em inglês para gerar uma imagem cinematográfica para o dia de estreia do filme "${title}" nas redes sociais.

A IMAGEM DEVE SER:
- A entrada/fachada de um cinema clássico ou moderno, vista de frente, à noite, com luzes neon e neblina dramática
- Acima da porta de entrada, um grande cartaz luminoso com o título "${title}" em letras grandes e impactantes
- O cartaz deve ter elementos visuais alusivos ao filme (género: ${genre || filmType}, personagens: ${chars || 'as personagens principais'})
- Atmosfera de estreia: tapete vermelho, luzes glamourosas, povo em redor, entusiasmo
- Estilo vertical 9:16, altamente detalhado, fotorrealista ou render 3D de alta qualidade
- No canto inferior direito, "The K-Brothers logo"
${posterPrompt ? `\nReferência visual do poster do filme: ${posterPrompt}` : ''}

RESPONDE APENAS COM JSON:
{ "promptEN": "...", "teaserPT": "..." }
(promptEN: prompt completo em inglês; teaserPT: texto sobreposto curto e impactante em PT-PT para o post de estreia, ex: "Hoje. 20h00. Online.")`;

    try {
      const text = await callGeminiAPI(query, true);
      if (text) {
        const parsed = parseAIResponse(text);
        if (parsed.promptEN) {
          const newImage = {
            id: `premiere_hero_${Date.now()}`,
            promptEN: parsed.promptEN,
            teaserPT: parsed.teaserPT || `${title} — Estreia Hoje Online!`
          };
          saveToProjectHistory(projectData);
          setProjectData(prev => {
            // Injeta no post 20h00 do dia de estreia se o plano já existir
            let updatedPlan = prev.socialMediaPlan;
            if (updatedPlan?.plan) {
              const pDay = Math.floor((prev.socialPlanDays || 14) / 2) + 1;
              updatedPlan = {
                ...updatedPlan,
                plan: updatedPlan.plan.map(day =>
                  day.dayNumber === pDay && day.time === '20:00'
                    ? { ...day, assetIds: [newImage.id] }
                    : day
                )
              };
            }
            return { ...prev, socialPremiereHeroImage: newImage, socialMediaPlan: updatedPlan };
          });
        }
      }
    } catch (e) {
      console.error(e);
      alert(`Erro ao gerar imagem de estreia: ${e.message}`);
    } finally {
      setIsGeneratingPremiereHero(false);
    }
  };

  const handleAddExtraBlock = async () => {
    if (!newExtraBlockPrompt.trim()) return;
    setIsGeneratingExtraBlock(true);
    const chars = projectData.characters || [];
    const charsStr = chars.map(c => renderText(c.name)).join(', ');
    const settingNamesList = (projectData.settings || []).map(s => renderText(s.name)).join(', ');
    const blockName = newExtraBlockPrompt.trim();

    const userQuery = `Atua como diretor de marketing para o lançamento do filme "${projectData.title}" nas redes sociais.
Cria um bloco de conteúdo promocional com o tema: "${blockName}".
Personagens disponíveis: ${charsStr || 'Sem personagens definidas'}${settingNamesList ? `\nCenários disponíveis: ${settingNamesList}` : ''}
Contexto: ${projectData.storyPrompt || ''}

REGRAS:
- PROIBIDO cinemas, bilhetes, salas. Filme exclusivamente online (YouTube/Instagram).
- Conteúdo: pode ser imagens OU vídeos — escolhe o mais adequado para o tema pedido.
- Para IMAGENS: campos "characterName", "promptEN" (EN, 9:16, The K-Brothers logo bottom right), "teaserPT" (texto PT-PT curto e impactante)
- Para VÍDEOS: campos "characterName", "camera", "action" (PT-PT), "emotion", "dialogue" (MAX 10s/20 palavras, PT-PT)
- Gera entre 3 a 6 entradas variadas e únicas. Inclui "Todas as Personagens" se fizer sentido.
- type: "image" para imagens, "video" para vídeos.
- REGRA CRÍTICA — NOMES EM VEZ DE DESCRIÇÕES: Nos campos promptEN e action, NUNCA descreves visualmente personagens ou cenários. Usa SEMPRE o nome próprio (ex: "${charsStr ? charsStr.split(',')[0].trim() : 'Personagem'}") em vez da descrição física. O software de renderização faz a correspondência automática.

RESPONDE APENAS COM JSON:
{ "name": "${blockName}", "type": "image|video", "phase": "pre|premiere|post", "items": [...] }`;

    try {
      const text = await callGeminiAPI(userQuery, true);
      if (text) {
        const parsed = parseAIResponse(text);
        if (parsed.items && Array.isArray(parsed.items)) {
          const newBlock = {
            id: `extra_${Date.now()}`,
            name: parsed.name || blockName,
            type: parsed.type || 'image',
            phase: parsed.phase || 'pre',
            items: parsed.items.map((item, i) => ({ ...item, id: `extra_${Date.now()}_${i}` }))
          };
          saveToProjectHistory(projectData);
          setProjectData(prev => ({ ...prev, socialMediaExtraBlocks: [...(prev.socialMediaExtraBlocks || []), newBlock] }));
          setNewExtraBlockPrompt('');
          setAddingExtraBlock(false);
        }
      }
    } catch (e) {
      console.error(e);
      alert(`Erro ao gerar bloco: ${e.message}`);
    } finally {
      setIsGeneratingExtraBlock(false);
    }
  };

  const handleGenerateSocialMedia = async () => {
    setIsGeneratingSocial(true);
    const charsStr = projectData.characters?.map(c => c.name).join(', ') || 'Nenhuma personagem';
    const charNamesList = (projectData.characters || []).map(c => renderText(c.name)).join(', ');
    const settingNamesList = (projectData.settings || []).map(s => renderText(s.name)).join(', ');
    const langStr = renderText(projectData.language) || 'Português (Portugal)';
    const imgN = projectData.socialImageCount || 3;
    const vidN = projectData.socialVideoCount || 3;
    const imgCycles = Array.from({length: imgN}, (_,i) => `${i+1}º ciclo`).join(', ');
    const vidCycles = Array.from({length: vidN}, (_,i) => `${i+1}º ciclo`).join(', ');

    const userQuery = `Atua como diretor de marketing e copywriter para o lançamento de um novo filme nas REDES SOCIAIS.
    CONTEXTO DO FILME: Título: "${projectData.title}" | Logline: "${projectData.storyPrompt || projectData.idea}" | Personagens: ${charsStr} | Língua para Diálogos: ${langStr}

    REGRA CRÍTICA ABSOLUTA E INQUEBRÁVEL:
    PROIBIÇÃO TOTAL de usar as palavras "cinema", "cinemas", "salas", "bilheteiras" ou "comprar bilhetes" em QUALQUER texto, teaser ou diálogo. O filme estreia EXCLUSIVAMENTE nas redes sociais. Os apelos têm de ser sempre para "ver no YouTube", "assistir no Instagram", "no nosso canal", ou nas "nossas redes sociais". Deves também apelar frequentemente para que os utilizadores sigam a página "The K-Brothers".
    GESTÃO DE TEMPO E DIVISÃO DE VÍDEOS (MUITO IMPORTANTE): Cada vídeo tem no MÁXIMO 10 SEGUNDOS (cerca de 15 a 20 palavras faladas). Se a tua ideia de diálogo for mais extensa, É OBRIGATÓRIO dividir essa fala em múltiplos vídeos/takes sequenciais! Cria objetos JSON separados para cada parte e adiciona a indicação no campo 'characterName' (Exemplo: "Joaquim (Parte 1)" e um novo objeto com "Joaquim (Parte 2)").
    REGRA CRÍTICA — NOMES EM VEZ DE DESCRIÇÕES (OBRIGATÓRIO em todos os campos promptEN e action):
    NUNCA descreves visualmente as personagens ou cenários com adjetivos físicos (cor de cabelo, idade, roupa, aparência, etc.).
    Usa SEMPRE o nome próprio da personagem e o nome exato do cenário — o software de renderização faz a correspondência automática com a imagem de referência.
    ✓ CORRETO: "Cinematic shot of ${charNamesList ? charNamesList.split(',')[0].trim() : 'Personagem'} standing in ${settingNamesList ? settingNamesList.split(',')[0].trim() : 'Cenário'}..."
    ✗ ERRADO: "Cinematic shot of a Portuguese man in his 30s in a cozy living room..."
    Personagens deste filme: ${charNamesList || 'ver lista acima'}${settingNamesList ? `\n    Cenários deste filme: ${settingNamesList}` : ''}

    GERA MATERIAL PROMOCIONAL PARA REDES SOCIAIS (JSON) SEGUINDO ESTRITAMENTE ESTA LÓGICA DE ORDENAÇÃO E QUANTIDADE:

    1. "characterPosters":
       - Lógica de Ordenação Obrigatória: [Personagem 1, Personagem 2..., Todas as Personagens], repetido em ${imgN} ciclos no total (${imgCycles}). Gera EXATAMENTE ${imgN} entradas por personagem e ${imgN} entradas para "Todas as Personagens".
       - Campos por objeto: "characterName" (Nome EXATO da personagem, ou "Todas as Personagens"), "teaserPT" (Frase marcante do guião adaptada à imagem em PT-PT), "promptEN" (descrição visual em inglês para formato vertical 9:16 baseada no guião).

    2. "behindTheScenes":
       - Lógica de Ordenação Obrigatória: [Personagem 1, Personagem 2..., Todas as Personagens], repetido em ${imgN} ciclos no total (${imgCycles}). (Imagens). Gera EXATAMENTE ${imgN} entradas por personagem e ${imgN} para "Todas as Personagens".
       - Campos: "characterName" (Nome EXATO ou "Todas as Personagens"), "promptEN" (descrição visual em estúdio, green screen, a filmar cenas do guião).

    3. "behindTheScenesVideo":
       - Lógica de Ordenação Obrigatória: [Personagem 1, Personagem 2..., Todas as Personagens], repetido em ${vidN} ciclos no total (${vidCycles}). Gera EXATAMENTE ${vidN} entradas por personagem e ${vidN} para "Todas as Personagens". (Se o diálogo for longo, desdobra em Parte 1 e Parte 2).
       - Contexto: Cenas como se estivessem no estúdio a atuar para a câmara, no camarim a preparar-se, sentados numa cadeira de realizador.
       - Campos: "characterName" (Ex: "Joaquim (Parte 1)"), "camera", "action" (Descrição da ação PT), "emotion", "dialogue" (Apelo a assistirem ao filme nas nossas redes, ou a pedir para seguirem The K-Brothers. MAX 10s/20 palavras por vídeo).

    4. "makingOff":
       - Lógica de Ordenação Obrigatória: [Personagem 1, Personagem 2...], repetido em ${vidN} ciclos no total (${vidCycles}). (Apenas personagens individuais, sem "Todas as Personagens"). Gera EXATAMENTE ${vidN} entradas por personagem. (Se longo, desdobra em Parte 1 e Parte 2).
       - Campos: "characterName" (Ex: "Joaquim (Parte 1)"), "camera", "action" (Descrição da ação PT), "emotion", "dialogue" (Convite em PT para irem ver no YouTube/Instagram e para seguirem The K-Brothers. MAX 10s/20 palavras por vídeo).

    5. "whoAmI":
       - Lógica de Ordenação Obrigatória: [Personagem 1, Personagem 2...], repetido em ${vidN} ciclos no total (${vidCycles}). (Apenas personagens individuais). Gera EXATAMENTE ${vidN} entradas por personagem. (Se longo, desdobra em Parte 1 e Parte 2).
       - Campos: "characterName", "camera", "action" (PT), "emotion", "dialogue" (Apresentação interativa na 1ª pessoa sobre si própria. MAX 10s/20 palavras por vídeo).

    6. "talkToMe":
       - Lógica de Ordenação Obrigatória: [Personagem 1, Personagem 2...], repetido em ${vidN} ciclos no total (${vidCycles}). (Apenas personagens individuais). Gera EXATAMENTE ${vidN} entradas por personagem. (Se longo, desdobra em Parte 1 e Parte 2).
       - Contexto: Vídeos publicados DEPOIS da estreia para gerar engagement (respostas).
       - Campos: "characterName", "camera", "action" (PT), "emotion", "dialogue" (Interage com seguidores fazendo perguntas: Gostaram? Qual a cena favorita? Subscrevam The K-Brothers. MAX 10s/20 palavras por vídeo).

    7. "launchImage":
       - Lógica de Ordenação Obrigatória: [Personagem 1, Personagem 2..., Todas as Personagens]. (Imagens). Uma entrada por personagem e uma para "Todas as Personagens".
       - Contexto: Imagens para anunciar a estreia oficial do filme nas redes.
       - Campos: "characterName", "teaserPT" (Texto sobreposto na imagem alertando para a estreia online, ex: "Estreia Hoje no Youtube!"), "promptEN" (descrição visual em inglês para formato 9:16).

    8. "launchVideo":
       - Lógica de Ordenação Obrigatória: [Personagem 1, Personagem 2..., Todas as Personagens]. (OBRIGATÓRIO desdobrar em Parte 1 e Parte 2 se o anúncio for extenso).
       - Contexto: Vídeos para anunciar a estreia oficial do filme.
       - Campos: "characterName" (Ex: "Joaquim (Parte 1)"), "camera", "action" (PT), "emotion", "dialogue" (Anuncia que o filme estreou hoje EXCLUSIVAMENTE nas redes sociais, apela a assistirem e a seguirem The K-Brothers. MAX 10s/20 palavras por vídeo).

    RESPONDE APENAS COM JSON VÁLIDO. NÃO USES MARKDOWN.
    { "characterPosters": [...], "behindTheScenes": [...], "behindTheScenesVideo": [...], "makingOff": [...], "whoAmI": [...], "talkToMe": [...], "launchImage": [...], "launchVideo": [...] }`;

    try {
      const text = await callGeminiAPI(userQuery, true);
      if (text) {
        const parsed = parseAIResponse(text);
        const categories = ['characterPosters', 'behindTheScenes', 'behindTheScenesVideo', 'makingOff', 'whoAmI', 'talkToMe', 'launchImage', 'launchVideo'];
        categories.forEach(cat => {
            if (Array.isArray(parsed[cat])) parsed[cat] = parsed[cat].map((item, i) => ({ ...item, id: `soc_${cat}_${Date.now()}_${i}` }));
            else parsed[cat] = [];
        });
        saveToProjectHistory(projectData);
        setProjectData(prev => ({ ...prev, socialMedia: parsed, socialMediaPlan: null })); 
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar material para redes sociais. Tenta novamente.");
    } finally {
      setIsGeneratingSocial(false);
    }
  };

  const handleGenerateSocialMediaBlock = async (blockKey) => {
    setIsGeneratingSocialBlock(prev => ({ ...prev, [blockKey]: true }));
    const charsStr = projectData.characters?.map(c => c.name).join(', ') || 'Nenhuma personagem';
    const charNamesList = (projectData.characters || []).map(c => renderText(c.name)).join(', ');
    const settingNamesList = (projectData.settings || []).map(s => renderText(s.name)).join(', ');
    const langStr = renderText(projectData.language) || 'Português (Portugal)';
    const imgN = projectData.socialImageCount || 3;
    const vidN = projectData.socialVideoCount || 3;
    const imgCycles = Array.from({length: imgN}, (_,i) => `${i+1}º ciclo`).join(', ');
    const vidCycles = Array.from({length: vidN}, (_,i) => `${i+1}º ciclo`).join(', ');

    let blockInstructions = "";
    if (blockKey === 'characterPosters') {
        blockInstructions = `1. "characterPosters":
       - Lógica de Ordenação Obrigatória: [Personagem 1, Personagem 2..., Todas as Personagens], repetido em ${imgN} ciclos no total (${imgCycles}). Gera EXATAMENTE ${imgN} entradas por personagem e ${imgN} para "Todas as Personagens".
       - Campos por objeto: "characterName" (Nome EXATO da personagem, ou "Todas as Personagens"), "teaserPT" (Frase marcante do guião adaptada à imagem em PT-PT), "promptEN" (descrição visual em inglês para formato vertical 9:16 baseada no guião).`;
    } else if (blockKey === 'behindTheScenes') {
        blockInstructions = `2. "behindTheScenes":
       - Lógica de Ordenação Obrigatória: [Personagem 1, Personagem 2..., Todas as Personagens], repetido em ${imgN} ciclos no total (${imgCycles}). (Imagens). Gera EXATAMENTE ${imgN} entradas por personagem e ${imgN} para "Todas as Personagens".
       - Campos: "characterName" (Nome EXATO ou "Todas as Personagens"), "promptEN" (descrição visual em estúdio, green screen, a filmar cenas do guião).`;
    } else if (blockKey === 'behindTheScenesVideo') {
        blockInstructions = `3. "behindTheScenesVideo":
       - Lógica de Ordenação Obrigatória: [Personagem 1, Personagem 2..., Todas as Personagens], repetido em ${vidN} ciclos no total (${vidCycles}). Gera EXATAMENTE ${vidN} entradas por personagem e ${vidN} para "Todas as Personagens". (Se o diálogo for longo, desdobra em Parte 1 e Parte 2).
       - Contexto: Cenas como se estivessem no estúdio a atuar para a câmara, no camarim a preparar-se, sentados numa cadeira de realizador.
       - Campos: "characterName" (Ex: "Joaquim (Parte 1)"), "camera", "action" (Descrição da ação PT), "emotion", "dialogue" (Apelo a assistirem ao filme nas redes, ou a pedir para seguirem The K-Brothers. MAX 10s/20 palavras por vídeo).`;
    } else if (blockKey === 'makingOff') {
        blockInstructions = `4. "makingOff":
       - Lógica de Ordenação Obrigatória: [Personagem 1, Personagem 2...], repetido em ${vidN} ciclos no total (${vidCycles}). (Apenas personagens individuais, sem "Todas as Personagens"). Gera EXATAMENTE ${vidN} entradas por personagem. (Se longo, desdobra em Parte 1 e Parte 2).
       - Campos: "characterName" (Ex: "Joaquim (Parte 1)"), "camera", "action" (Descrição da ação PT), "emotion", "dialogue" (Convite em PT para irem ver no YouTube/Instagram e seguirem The K-Brothers. MAX 10s/20 palavras por vídeo).`;
    } else if (blockKey === 'whoAmI') {
        blockInstructions = `5. "whoAmI":
       - Lógica de Ordenação Obrigatória: [Personagem 1, Personagem 2...], repetido em ${vidN} ciclos no total (${vidCycles}). (Apenas personagens individuais). Gera EXATAMENTE ${vidN} entradas por personagem. (Se longo, desdobra em Parte 1 e Parte 2).
       - Campos: "characterName", "camera", "action" (PT), "emotion", "dialogue" (Apresentação interativa na 1ª pessoa. MAX 10s/20 palavras por vídeo).`;
    } else if (blockKey === 'talkToMe') {
        blockInstructions = `6. "talkToMe":
       - Lógica de Ordenação Obrigatória: [Personagem 1, Personagem 2...], repetido em ${vidN} ciclos no total (${vidCycles}). (Apenas personagens individuais). Gera EXATAMENTE ${vidN} entradas por personagem. (Se longo, desdobra em Parte 1 e Parte 2).
       - Contexto: Vídeos publicados DEPOIS da estreia para gerar engagement (respostas).
       - Campos: "characterName", "camera", "action" (PT), "emotion", "dialogue" (Interage com seguidores fazendo perguntas: Gostaram? Qual a cena favorita? MAX 10s/20 palavras por vídeo).`;
    } else if (blockKey === 'launchImage') {
        blockInstructions = `7. "launchImage":
       - Lógica de Ordenação Obrigatória: [Personagem 1, Personagem 2..., Todas as Personagens]. (Imagens). Uma entrada por personagem e uma para "Todas as Personagens".
       - Contexto: Imagens para anunciar a estreia oficial do filme nas redes.
       - Campos: "characterName", "teaserPT" (Texto sobreposto na imagem alertando para a estreia online, ex: "Estreia Hoje no Youtube!"), "promptEN" (descrição visual em inglês para formato 9:16).`;
    } else if (blockKey === 'launchVideo') {
        blockInstructions = `8. "launchVideo":
       - Lógica de Ordenação Obrigatória: [Personagem 1, Personagem 2..., Todas as Personagens]. (OBRIGATÓRIO desdobrar em Parte 1 e Parte 2 se o anúncio for extenso).
       - Contexto: Vídeos para anunciar a estreia oficial do filme.
       - Campos: "characterName" (Ex: "Joaquim (Parte 1)"), "camera", "action" (PT), "emotion", "dialogue" (Anuncia que o filme estreou nas redes sociais e apela a seguirem The K-Brothers. MAX 10s/20 palavras por vídeo).`;
    }

    const userQuery = `Atua como diretor de marketing e copywriter para o lançamento de um novo filme nas REDES SOCIAIS.
    CONTEXTO DO FILME: Título: "${projectData.title}" | Logline: "${projectData.storyPrompt || projectData.idea}" | Personagens: ${charsStr} | Língua para Diálogos: ${langStr}

    REGRA CRÍTICA ABSOLUTA E INQUEBRÁVEL:
    PROIBIÇÃO TOTAL de usar as palavras "cinema", "cinemas", "salas", "bilheteiras" ou "comprar bilhetes" em QUALQUER texto, teaser ou diálogo. O filme estreia EXCLUSIVAMENTE nas redes sociais. Os apelos têm de ser sempre para "ver no YouTube", "assistir no Instagram", "no nosso canal", ou nas "nossas redes sociais". Deves também apelar frequentemente para que os utilizadores sigam a página "The K-Brothers".
    GESTÃO DE TEMPO E DIVISÃO DE VÍDEOS (MUITO IMPORTANTE): Cada vídeo tem no MÁXIMO 10 SEGUNDOS (cerca de 15 a 20 palavras faladas). Se a tua ideia de diálogo for mais extensa, É OBRIGATÓRIO dividir essa fala em múltiplos vídeos/takes sequenciais! Cria objetos JSON separados para cada parte e adiciona a indicação no campo 'characterName' (Exemplo: "Joaquim (Parte 1)" e um novo objeto com "Joaquim (Parte 2)").
    REGRA CRÍTICA — NOMES EM VEZ DE DESCRIÇÕES (OBRIGATÓRIO em todos os campos promptEN e action):
    NUNCA descreves visualmente as personagens ou cenários com adjetivos físicos (cor de cabelo, idade, roupa, aparência, etc.).
    Usa SEMPRE o nome próprio da personagem e o nome exato do cenário — o software de renderização faz a correspondência automática com a imagem de referência.
    ✓ CORRETO: "Cinematic shot of ${charNamesList ? charNamesList.split(',')[0].trim() : 'Personagem'} in ${settingNamesList ? settingNamesList.split(',')[0].trim() : 'Cenário'}..."
    ✗ ERRADO: "Cinematic shot of a Portuguese man in his 30s in a cozy living room..."
    Personagens deste filme: ${charNamesList || 'ver lista acima'}${settingNamesList ? `\n    Cenários deste filme: ${settingNamesList}` : ''}

    GERA MATERIAL PROMOCIONAL PARA REDES SOCIAIS (JSON) APENAS PARA O BLOCO PEDIDO, SEGUINDO ESTRITAMENTE ESTA LÓGICA DE ORDENAÇÃO E QUANTIDADE:
    
    ${blockInstructions}
       
    RESPONDE APENAS COM JSON VÁLIDO. NÃO USES MARKDOWN.
    { "${blockKey}": [...] }`;

    try {
        const text = await callGeminiAPI(userQuery, true);
        if (text) {
            const parsed = parseAIResponse(text);
            const newData = Array.isArray(parsed[blockKey]) ? parsed[blockKey].map((item, i) => ({ ...item, id: `soc_${blockKey}_${Date.now()}_${i}` })) : [];
            saveToProjectHistory(projectData);
            setProjectData(prev => ({
                ...prev,
                socialMedia: {
                    ...prev.socialMedia,
                    [blockKey]: newData
                }
            }));
        }
    } catch (e) {
        console.error(e);
        alert(`Erro ao regerar o bloco. Tenta novamente. (${e.message})`);
    } finally {
        setIsGeneratingSocialBlock(prev => ({ ...prev, [blockKey]: false }));
    }
  };

  const handleGenerateSinopse = async () => {
    setIsGeneratingSinopse(true);
    const charsStr = (projectData.characters || []).map(c =>
      `${renderText(c.name)}: ${renderText(c.description || '').substring(0, 200)}`
    ).join(' | ');
    const scenesSummary = (projectData.scenes || []).map((sc, i) =>
      `Cena ${i+1}: ${renderText(sc.description || sc.title || '')} — ${(sc.takes || []).map(t => renderText(t.action || '')).join('. ')}`
    ).join('\n');
    const filmTitle = renderText(projectData.title) || '';
    const filmType = renderText(projectData.filmType) || '';
    const hashtags = `#thekbrothers #${filmTitle.replace(/\s+/g,'').toLowerCase()} #${filmType.replace(/\s+/g,'').toLowerCase()}`;

    const query = `Atua como copywriter especialista em lançamentos de filmes online. Escreve uma SINOPSE TIPO TEASER para o filme "${filmTitle}" (${filmType}), para ser colocada na descrição do YouTube.

CONTEXTO DO FILME:
Logline: ${projectData.storyPrompt || projectData.idea || ''}
Personagens: ${charsStr}
${scenesSummary ? `Resumo das Cenas:\n${scenesSummary.substring(0, 2000)}` : ''}

INSTRUÇÕES OBRIGATÓRIAS:
1. Começa com uma frase de impacto que capture imediatamente a atenção (máx. 1 frase).
2. Descreve brevemente as partes mais importantes do filme (sem revelar o fim).
3. Para cada personagem principal: descreve quem é, qual o seu objetivo, como se relaciona com as outras personagens e qual o seu papel na história.
4. Termina com a finalidade/moral da história (o que quer alertar, ensinar ou provocar no espectador).
5. Tom: cinematográfico, envolvente, que deixe vontade de ver.
6. Comprimento: 150 a 250 palavras de corpo + hashtags no final.
7. Na linha final coloca APENAS hashtags, começando OBRIGATORIAMENTE por: ${hashtags}
   Adiciona mais 5 a 8 hashtags relevantes sobre os temas do filme, os personagens, a moral e a divulgação.
8. NÃO uses palavras como "cinemas", "bilhetes", "salas". O filme é online.

Responde APENAS com o texto da sinopse + hashtags. Sem títulos, sem explicações extra.`;

    try {
      const text = await callGeminiAPI(query, false);
      if (text) handleProjectDataChange('socialYoutubeSinopse', text.trim());
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar sinopse. Tenta novamente.');
    } finally {
      setIsGeneratingSinopse(false);
    }
  };

  const handleGenerateSocialPlan = async () => {
     const hasContent = projectData.socialMedia || (projectData.socialMediaExtraBlocks || []).length > 0;
     if (!hasContent) return;
     setIsGeneratingSocialPlan(true);

     const soc = projectData.socialMedia;

     // Contexto do guião: cenas e takes resumidos
     const sceneContext = (projectData.scenes || []).map((scene, sIdx) => {
        const takeSummaries = (scene.takes || []).map((take, tIdx) => {
           const setName = (projectData.settings || []).find(s => s.id === take.settingId)?.name || '';
           return `  T${tIdx+1}${setName ? ` [${renderText(setName)}]` : ''}: ${renderText(take.action || '')}${take.narration ? ` | "${renderText(take.narration)}"` : ''}`;
        }).join('\n');
        return `Cena ${sIdx+1}: ${renderText(scene.description || scene.title || '')}\n${takeSummaries}`;
     }).join('\n\n');
     const scriptSummary = sceneContext || (projectData.script ? projectData.script.substring(0, 2000) : '');

     const availableAssets = [
        ...(soc ? (soc.characterPosters || []).map(a => ({ id: a.id, type: 'IMAGEM: Póster/Teaser', character: a.characterName, content: a.teaserPT || '' })) : []),
        ...(soc ? (soc.behindTheScenes || []).map(a => ({ id: a.id, type: 'IMAGEM: Behind The Scenes', character: a.characterName, content: a.context || '' })) : []),
        ...(soc ? (soc.behindTheScenesVideo || []).map(a => ({ id: a.id, type: 'VÍDEO: Behind The Scenes', character: a.characterName, content: a.dialogue || a.action || '' })) : []),
        ...(soc ? (soc.makingOff || []).map(a => ({ id: a.id, type: 'VÍDEO: Making OFF', character: a.characterName, content: a.dialogue || a.action || '' })) : []),
        ...(soc ? (soc.whoAmI || []).map(a => ({ id: a.id, type: 'VÍDEO: Who Am I?', character: a.characterName, content: a.dialogue || a.action || '' })) : []),
        ...(soc ? (soc.talkToMe || []).map(a => ({ id: a.id, type: 'VÍDEO: Talk To Me! (Pós-Estreia)', character: a.characterName, content: a.dialogue || a.action || '' })) : []),
        ...(soc ? (soc.launchImage || []).map(a => ({ id: a.id, type: 'IMAGEM: Lançamento Oficial', character: a.characterName, content: a.teaserPT || '' })) : []),
        ...(soc ? (soc.launchVideo || []).map(a => ({ id: a.id, type: 'VÍDEO: Lançamento Oficial', character: a.characterName, content: a.dialogue || a.action || '' })) : []),
        // Blocos auto-gerados e extra manuais
        ...(projectData.socialMediaExtraBlocks || []).flatMap(block =>
          (block.items || []).map(a => ({
            id: a.id,
            type: `${block.type === 'video' ? 'VÍDEO' : 'IMAGEM'}: ${block.name}`,
            character: a.characterName,
            content: a.dialogue || a.action || a.teaserPT || a.context || ''
          }))
        ),
        // Imagem de estreia (20h00)
        ...(projectData.socialPremiereHeroImage ? [{
          id: projectData.socialPremiereHeroImage.id,
          type: 'IMAGEM: Dia de Estreia (Cinema Hero)',
          character: 'Todas as Personagens',
          content: projectData.socialPremiereHeroImage.teaserPT || ''
        }] : [])
     ];

     const totalDays = projectData.socialPlanDays || 14;
     const premiereDay = Math.floor(totalDays / 2) + 1;
     const preEstreiaEnd = premiereDay - 1;
     const posEstreiaStart = premiereDay + 1;

     const userQuery = `Atua como diretor de marketing digital e copywriter criativo. Cria um plano de redes sociais de ${totalDays} dias para o lançamento do filme "${projectData.title}".

    CONTEXTO DO FILME:
    Logline: "${projectData.storyPrompt || projectData.idea || ''}"
    Personagens: ${(projectData.characters || []).map(c => `${renderText(c.name)} — ${renderText(c.description || '').substring(0, 120)}`).join(' | ')}
    ${scriptSummary ? `\nRESUMO DAS CENAS / GUIÃO:\n${scriptSummary.substring(0, 3000)}` : ''}

    LISTA EXAUSTIVA DE FICHEIROS A DISTRIBUIR (usa o campo "content" para inspirar a legenda):
    ${JSON.stringify(availableAssets)}

    REGRAS CRÍTICAS ABSOLUTAS (PROIBIDO IGNORAR):
    1. PROIBIÇÃO TOTAL DE CINEMAS: NUNCA fales de "cinemas", "salas", "bilhetes", "comprar" ou "bilheteiras". O filme é lançado EXCLUSIVAMENTE ONLINE (YouTube, Instagram). Os apelos devem ser sempre para "assistir no link", "ver no nosso canal", etc.
    2. OBRIGATÓRIO: Tens de utilizar TODOS os "id"s da lista de ficheiros. Nenhum pode ficar de fora.
    3. DISTRIBUIÇÃO: 2 a 4 publicações por dia, a horas diferentes.
    4. FORMATOS PERMITIDOS: EXCLUSIVAMENTE: "REEL", "STORY", "POST".
    5. REGRA DE FORMATOS DE CONTEÚDO (MUITO IMPORTANTE):
       - "STORY": SEMPRE às 07:00. O campo "time" de um STORY TEM OBRIGATORIAMENTE de ser "07:00". Pode incluir 1 ou mais ficheiros do tipo "IMAGEM" ou "VÍDEO". O campo 'caption' deve ser OBRIGATORIAMENTE UMA STRING VAZIA ("").
       - "POST": Serve para publicações no feed. Pode incluir de 1 até 10 ficheiros, mas APENAS do tipo "IMAGEM". Nunca uses vídeos num "POST".
       - "REEL": Serve para vídeos curtos. REGRA CRÍTICA E INQUEBRÁVEL: UM "REEL" SÓ PODE TER EXATAMENTE 1 (UM) VÍDEO. O array "assetIds" num formato "REEL" TEM de ter tamanho 1. Se quiseres publicar vários vídeos curtos no mesmo dia, CRIA MÚLTIPLAS PUBLICAÇÕES "REEL" separadas, cada uma com o seu próprio e único vídeo.
    6. HASHTAGS: OBRIGATÓRIO gerar entre 3 a 5 hashtags relevantes no final de TODAS as legendas geradas (exceto se o formato for "STORY").

    REGRAS DE COPYWRITING PARA OS TÍTULOS E LEGENDAS (CRÍTICO — PROIBIDO IGNORAR):
    7. TÍTULOS CHAMATIVOS OBRIGATÓRIOS: O campo "content" de cada publicação É O TÍTULO DO POST. NÃO uses títulos genéricos como "Behind The Scenes 1", "Making Off 2", "Teaser". Cria títulos curtos (máx. 8 palavras), impactantes, que despertem curiosidade ou emoção — como se fossem títulos de um artigo viral. Exemplos: "Eles não sabiam que a câmara estava a gravar 👀", "O momento que mudou tudo na rodagem", "Ela tinha apenas 10 segundos para decidir…", "Os bastidores que nunca deverias ver 🎬".
    8. CADA TÍTULO TEM DE SER ÚNICO. É proibido repetir estruturas ou palavras entre títulos.
    9. CADA LEGENDA TEM DE SER ÚNICA E DIFERENTE DE TODAS AS OUTRAS. É proibido usar frases genéricas como "Não percas", "Em breve", "Fique atento" repetidas. Cada post deve ter a sua própria voz e ângulo.
    10. USA O GUIÃO E AS CENAS: Cada legenda deve referenciar um momento específico do filme — uma ação de uma cena, uma emoção de uma personagem, um conflito, uma linha de diálogo, um cenário marcante. A legenda deve fazer o seguidor sentir que está a espreitar algo real e único do filme.
    11. VARIA O ESTILO: Alterna entre legendas que fazem uma pergunta ao público, legendas que revelam um facto sobre a personagem, legendas que descrevem uma cena de forma cinematográfica, legendas em voz da personagem (primeira pessoa), e legendas que criam suspense/tensão.
    12. COMPRIMENTO: Legendas de Pré-Estreia: 2 a 4 frases + hashtags. Estreia e Pós-Estreia: 3 a 5 frases + hashtags.
    13. O campo "content" (lista de ficheiros) descreve o que está no ficheiro — usa esse conteúdo como base para escrever tanto o título como a legenda desse post específico.

    ESTRUTURA DOS ${totalDays} DIAS (OBRIGATÓRIO SEGUIR):
    - Dias 1 a ${preEstreiaEnd} (Pré-Estreia): Usa os ficheiros de Póster, Behind The Scenes, Making OFF e Who Am I.
    - Dia ${premiereDay} (DIA DA ESTREIA):
      * ANTES das 20:00: Cria 3 publicações para distribuir conteúdos de 'Lançamento Oficial'.
      * EXACTAMENTE ÀS 20:00: Cria o post principal da Estreia. O "time" TEM de ser "20:00", o "format" DEVE ser "POST" ou "REEL", a "caption" apela a ver o filme completo${projectData.socialYoutubeLink ? ` em ${projectData.socialYoutubeLink} — apelar também a subscrever o canal YouTube koelho2000 (onde estão todos os Filmes de The K-Brothers) e a seguir o Instagram @thekbrothers_pt` : ' que acabou de sair'}${projectData.socialPremiereHeroImage ? `, os "assetIds" TÊM DE SER EXATAMENTE ["${projectData.socialPremiereHeroImage.id}"] — usa OBRIGATORIAMENTE a imagem "IMAGEM: Dia de Estreia (Cinema Hero)" para este post.` : ', e os "assetIds" TÊM DE SER UM ARRAY VAZIO [].'}
    - Dias ${posEstreiaStart} a ${totalDays} (Pós-Estreia): Usa os vídeos 'Talk To Me! (Pós-Estreia)'. OBRIGATÓRIO: todas as legendas destes dias devem incluir um apelo direto a assistir ao filme completo${projectData.socialYoutubeLink ? ` em ${projectData.socialYoutubeLink}` : ' no YouTube'} e a subscrever o canal YouTube koelho2000 e a seguir o Instagram @thekbrothers_pt.

    Responde APENAS com um JSON válido:
    {
      "plan": [
        { "dayNumber": 1, "phase": "Pré-Estreia", "time": "07:00", "format": "STORY", "content": "O que vem aí vai surpreender-te 🔥", "caption": "", "strategy": "Hype", "assetIds": ["soc_characterPosters_123"] },
        { "dayNumber": 1, "phase": "Pré-Estreia", "time": "14:00", "format": "REEL", "content": "Eles não sabiam que a câmara estava a gravar 👀", "caption": "Ele não sabia que este momento ia mudar tudo... 🎬 Os bastidores que nunca deverias ver do nosso novo filme. #makingoff #bastidores #thekbrothers", "strategy": "Hype", "assetIds": ["soc_makingOff_001"] }
      ]
    }`;

     try {
        const text = await callGeminiAPI(userQuery, true);
        if (text) {
           const parsed = parseAIResponse(text);
           if (parsed.plan && Array.isArray(parsed.plan)) {
               // Garante que a imagem de estreia está no post das 20h00
               if (projectData.socialPremiereHeroImage) {
                 const heroId = projectData.socialPremiereHeroImage.id;
                 parsed.plan = parsed.plan.map(day =>
                   day.dayNumber === premiereDay && day.time === '20:00'
                     ? { ...day, assetIds: [heroId] }
                     : day
                 );
               }
               saveToProjectHistory(projectData);
               setProjectData(prev => ({ ...prev, socialMediaPlan: parsed }));
           }
        }
     } catch (e) {
        console.error(e);
        alert(`Erro ao gerar o plano: ${e.message}`);
     } finally {
        setIsGeneratingSocialPlan(false);
     }
  };

  const getDisplayDate = (dayNumber) => {
      const premiereDay = Math.floor((projectData.socialPlanDays || 14) / 2) + 1;
      if (!projectData.socialPlanPremiereDate) return `Dia ${String(dayNumber).padStart(2, '0')}`;
      const date = new Date(projectData.socialPlanPremiereDate);
      date.setDate(date.getDate() + (dayNumber - premiereDay));
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `Dia ${String(dayNumber).padStart(2, '0')} - ${d}/${m}/${y}`;
  };

  const getFinalCaption = (caption) => {
      if (!caption || typeof caption !== 'string' || caption.trim() === "") return caption;
      let cleanCaption = caption.trim();
      const tagsToToggle = (projectData.socialMediaHashtags || "").trim();
      
      if (tagsToToggle.length > 1) {
          const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const tagsArray = tagsToToggle.split(/\s+/);
          tagsArray.forEach(tag => {
             if(tag.startsWith('#')) {
                const regex = new RegExp(`\\s*${escapeRegExp(tag)}`, 'gi');
                cleanCaption = cleanCaption.replace(regex, '');
             }
          });
          const regexEntire = new RegExp(`\\s*${escapeRegExp(tagsToToggle)}`, 'gi');
          cleanCaption = cleanCaption.replace(regexEntire, '').trim();
      }
      
      // Adiciona dinamicamente as hashtags ativadas com um espaço simples
      if (projectData.socialMediaHashtagsEnabled && tagsToToggle !== "") {
          return `${cleanCaption} ${tagsToToggle}`;
      }
      
      return cleanCaption;
  };

  const handleChatSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatProcessing) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setIsChatExpanded(false); 
    setIsChatProcessing(true);
    
    const userMsgObj = { id: Date.now().toString(), sender: 'user', text: userMessage };
    const aiLoadingObj = { id: (Date.now() + 1).toString(), sender: 'ai', text: 'Deixa-me analisar e processar o pedido...', isLoading: true };

    setProjectData(prev => ({
       ...prev,
       chatMessages: [...(prev.chatMessages || [{ id: '1', sender: 'ai', text: 'Diz o que precisas' }]), userMsgObj, aiLoadingObj]
    }));
    
    const targetDuration = parseInt(projectData.duration) || 30;

    const userQuery = `Atua como um argumentista e realizador. O utilizador quer fazer uma alteração profunda na estrutura do guião através de um pedido num chat.
    DADOS ATUAIS DO PROJETO: Duração Alvo do Filme: ${targetDuration} Segundos.
    Personagens: ${JSON.stringify(projectData.characters)} | Cenários: ${JSON.stringify(projectData.settings)} | Intro Atual: ${JSON.stringify(projectData.intro)} | Prefácio Atual: ${JSON.stringify(projectData.preface)} | Outro Atual: ${JSON.stringify(projectData.outro)} | Cenas: ${JSON.stringify(projectData.scenes)} | Mensagens Finais: ${JSON.stringify(projectData.finalMessages || [])}
    PEDIDO DO UTILIZADOR: "${userMessage}"
    INSTRUÇÕES:
    1. Modifica o array de "scenes" conforme o pedido (adicionar/remover takes, alterar ações/diálogos). Podes modificar a "intro", "preface", "outro" ou "finalMessages".
    2. Se criares uma NOVA personagem, adiciona-a ao array "characters" com "id" único, "name", "description", "physical" e "voicePrompt".
    3. Se criares um NOVO cenário, adiciona-o ao array "settings" com "id" único, "name" e "description".
    4. Cada novo Take criado: "action", "camera" e "dialogues" super descritivos. OBRIGATÓRIO incluir "emotion" no diálogo.
    5. MATEMÁTICA RIGOROSA: A SOMA TOTAL do campo "duration" de TODOS os takes gerados nas cenas, MAIS a duração da "intro", "preface" e do "outro" TEM DE SER EXATAMENTE IGUAL a ${targetDuration} segundos. Adapta os tempos de cada take para garantir isto.
    6. OTIMIZAÇÃO DE VELOCIDADE (MUITO IMPORTANTE): Para que o processamento seja instantâneo, devolve no JSON **APENAS** as propriedades que precisaste de alterar. 
       - Se o pedido for APENAS para criar um novo cenário, devolve APENAS a chave "settings" com o array completo (os antigos + o novo). NÃO devolvas as scenes nem as characters.
       - Se não alteraste as "scenes", NÃO as incluas na resposta JSON.
    ESTRUTURA DE RESPOSTA OBRIGATÓRIA (Inclui apenas o que mudou):
    { "intro": {...}, "preface": {...}, "outro": {...}, "characters": [ ... ], "settings": [ ... ], "scenes": [ ... ], "finalMessages": [ ... ] }`;

    try {
      const text = await callGeminiAPI(userQuery, true);
      if (text) {
        const parsed = parseAIResponse(text);
        saveToProjectHistory(projectData);
        setProjectData(prev => {
          const next = { ...prev };
          next.intro = parsed.intro || next.intro;
          next.preface = parsed.preface || next.preface;
          next.outro = parsed.outro || next.outro;
          next.characters = parsed.characters || next.characters;
          next.settings = parsed.settings || next.settings;
          next.scenes = parsed.scenes || next.scenes;
          next.finalMessages = parsed.finalMessages || next.finalMessages;

          const newChat = [...(next.chatMessages || [])];
          const lastIdx = newChat.length - 1;
          if (newChat[lastIdx] && newChat[lastIdx].isLoading) newChat[lastIdx] = { id: Date.now().toString(), sender: 'ai', text: 'Pedido concluído, precisas de mais alguma coisa?' };
          next.chatMessages = newChat;
          return next;
        });
      }
    } catch (e) {
      console.error(e);
      setProjectData(prev => {
        const next = { ...prev };
        const newChat = [...(next.chatMessages || [])];
        const lastIdx = newChat.length - 1;
        if (newChat[lastIdx] && newChat[lastIdx].isLoading) newChat[lastIdx] = { id: Date.now().toString(), sender: 'ai', text: `Ocorreu um erro (${e.message}). Podes tentar reformular?` };
        next.chatMessages = newChat;
        return next;
      });
    } finally {
      setIsChatProcessing(false);
    }
  };

  const escapeHTML = (str) => {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  };

  // Componente de UI Compacto para os Botões "Regerar, Alterar, Eliminar"
  const renderPromptActions = ({ id, type, item, targetField = 'image', onDelete, onSplit, placeholder, btnClass = "bg-emerald-600 hover:bg-emerald-500", focusClass = "focus:border-emerald-500" }) => {
      const isEditing = promptActionState.id === id && promptActionState.type === type && promptActionState.targetField === targetField;
      const isRegen = isGeneratingCustomPrompt[`${id}_${targetField}`];
      return (
          <div className="w-full mt-1">
              <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleGenerateCustomPrompt(type, id, item, '', targetField)} disabled={isRegen} className="flex items-center gap-1.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors disabled:opacity-50">
                      {isRegen ? <Loader2 size={12} className="animate-spin"/> : <RefreshCw size={12}/>} Regerar
                  </button>
                  <button onClick={() => setPromptActionState({ id, type, targetField, suggestion: '' })} className="flex items-center gap-1.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors">
                      <Edit3 size={12}/> Alterar Prompt
                  </button>
                  {onSplit && (
                      <button onClick={onSplit} className="flex items-center gap-1.5 text-[10px] bg-indigo-900/40 hover:bg-indigo-900/80 border border-indigo-700/50 text-indigo-300 px-3 py-1.5 rounded transition-colors ml-auto mr-1" title="Dividir diálogo longo em Parte 1 e Parte 2">
                          <Scissors size={12}/> Dividir
                      </button>
                  )}
                  {onDelete && (
                     <button onClick={onDelete} className={`flex items-center gap-1.5 text-[10px] bg-red-900/20 hover:bg-red-900/60 border border-red-800/50 text-red-300 px-3 py-1.5 rounded transition-colors ${!onSplit ? 'ml-auto' : ''}`}>
                         <Trash2 size={12}/> Eliminar
                     </button>
                  )}
              </div>
              {isEditing && (
                  <div className="mt-2 bg-slate-950 p-3 rounded-lg border border-slate-700 animate-fade-in">
                      <textarea 
                          value={promptActionState.suggestion}
                          onChange={e => setPromptActionState({ ...promptActionState, suggestion: e.target.value })}
                          placeholder={placeholder}
                          className={`w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white outline-none ${focusClass} mb-2 resize-none h-16`}
                      />
                      <div className="flex justify-end gap-2">
                          <button onClick={() => setPromptActionState({ id: null, type: null, targetField: null, suggestion: '' })} className="text-[10px] text-slate-400 hover:text-white px-3 py-1 transition-colors">Cancelar</button>
                          <button onClick={() => handleGenerateCustomPrompt(type, id, item, promptActionState.suggestion, targetField)} disabled={isRegen || !promptActionState.suggestion.trim()} className={`text-[10px] text-white px-3 py-1.5 rounded flex items-center gap-1.5 disabled:opacity-50 transition-colors ${btnClass}`}>
                              {isRegen ? <Loader2 size={12} className="animate-spin"/> : <Wand2 size={12}/>} Aplicar Alterações
                          </button>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  const getStandardizedSocialTitle = (categoryKey, index, characterName) => {
      const safeName = (!characterName || renderText(characterName).toLowerCase() === 'teaser' || renderText(characterName).toLowerCase() === 'geral') ? 'GERAL' : renderText(characterName).toUpperCase();
      const num = String(index + 1).padStart(2, '0');
      switch (categoryKey) {
          case 'characterPosters': return `1_${num} ${safeName} - PÓSTERES DE PERSONAGEM E TEASERS`;
          case 'behindTheScenes': return `2_${num} ${safeName} - BEHIND THE SCENES (IMAGENS)`;
          case 'behindTheScenesVideo': return `3_${num} ${safeName} - BEHIND THE SCENES (VÍDEO)`;
          case 'makingOff': return `4_${num} ${safeName} - MAKING OFF (VÍDEO)`;
          case 'whoAmI': return `5_${num} ${safeName} - WHO AM I? (VÍDEO)`;
          case 'talkToMe': return `6_${num} ${safeName} - TALK TO ME! (VÍDEOS PÓS-ESTREIA)`;
          case 'launchImage': return `7_${num} ${safeName} - LANÇAMENTO OFICIAL (IMAGENS)`;
          case 'launchVideo': return `8_${num} ${safeName} - LANÇAMENTO OFICIAL (VÍDEOS)`;
          default: return `${safeName}`;
      }
  };

  const exportSocialPlanTXT_Redes = () => {
    if (!projectData?.socialMediaPlan?.plan) return;

    let txt = "";

    const getAssetNumber = (id) => {
       // Blocos standard (socialMedia)
       const categories = ['characterPosters', 'behindTheScenes', 'behindTheScenesVideo', 'makingOff', 'whoAmI', 'talkToMe', 'launchImage', 'launchVideo'];
       for (const cat of categories) {
           const arr = (projectData.socialMedia && projectData.socialMedia[cat]) || [];
           const index = arr.findIndex(item => item.id === id);
           if (index > -1) return getStandardizedSocialTitle(cat, index, arr[index].characterName);
       }
       // Blocos auto/extra
       for (const block of (projectData.socialMediaExtraBlocks || [])) {
           const index = (block.items || []).findIndex(item => item.id === id);
           if (index > -1) {
               const item = block.items[index];
               const safeName = (item.characterName || 'GERAL').toUpperCase();
               const num = String(index + 1).padStart(2, '0');
               return `${block.name.toUpperCase()} ${num} - ${safeName}`;
           }
       }
       // Imagem de estreia
       if (projectData.socialPremiereHeroImage && projectData.socialPremiereHeroImage.id === id) {
           return `ESTREIA 20H00 - CINEMA HERO - ${(renderText(projectData.title) || 'FILME').toUpperCase()}`;
       }
       return null;
    };

    const planPremiereDay = Math.floor((projectData.socialPlanDays || 14) / 2) + 1;
    projectData.socialMediaPlan.plan.forEach((day, idx) => {
       const isHistoria = day.format?.toLowerCase().includes('história') || day.format?.toLowerCase().includes('historias') || day.format?.toLowerCase().includes('stories') || day.format?.toLowerCase() === 'story';
       const finalCaption = getFinalCaption(day.caption);
       const isPremiereOrPost = day.dayNumber === planPremiereDay || day.phase?.toLowerCase().includes("pós");
       const ytLink = projectData.socialYoutubeLink || 'A DEFINIR';
       const ytSuffix = isPremiereOrPost && !isHistoria ? `\n🎬 ${ytLink} | 📺 koelho2000 (YouTube) | @thekbrothers_pt (Instagram)` : '';
       const displayCaption = isHistoria ? '' : ((finalCaption || '') + ytSuffix);

       let formatType = renderText(day.format).toUpperCase();
       if (formatType.includes('HISTÓRIA') || formatType.includes('HISTORIA')) formatType = 'STORY';
       else if (formatType.includes('CARROSSEL') || formatType.includes('FEED')) formatType = 'FEED';

       const ids = day.assetIds || (day.assetId ? [day.assetId] : []);
       const assetNumbers = ids.map(getAssetNumber).filter(Boolean).join(' | ');

       const dayNumFormatted = String(day.dayNumber).padStart(2, '0');

       txt += `DIA: ${dayNumFormatted}\n`;
       txt += `HORA: ${day.time || '-'}\n`;
       txt += `TIPO: ${formatType}\n`;
       txt += `TITULO: ${renderText(day.content) || ''}\n`;
       txt += `LEGENDA: ${displayCaption}\n`;
       txt += `FICHEIROS: ${assetNumbers}\n`;
       
       if (idx < projectData.socialMediaPlan.plan.length - 1) {
          txt += `\n---\n\n`;
       }
    });

    // Secção YouTube
    const ytTitulo = `${renderText(projectData.title) || ''}${projectData.filmType ? ` | ${renderText(projectData.filmType)}` : ''}${projectData.director ? ` | ${renderText(projectData.director)}` : ''}`;
    const ytLink = projectData.socialYoutubeLink || 'A DEFINIR';
    const ytSinopse = projectData.socialYoutubeSinopse || '';
    txt += `\n\n===\n\nYOUTUBE\n\n`;
    txt += `LINK: ${ytLink}\n\n`;
    txt += `TÍTULO: ${ytTitulo}\n\n`;
    if (ytSinopse) txt += `SINOPSE:\n${ytSinopse}\n`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeFilename = (projectData.title || 'Projeto').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `TXT_REDES_${safeFilename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSocialPlanHTML = () => {
    if (!projectData?.socialMediaPlan) return;
    const safeTitle = escapeHTML(renderText(projectData.title) || 'Filme');

    let html = `<!DOCTYPE html><html lang="pt-PT"><head><meta charset="UTF-8"><title>Plano de Redes Sociais - ${safeTitle}</title><style>body { font-family: 'Courier New', Courier, monospace; background: #ffffff; color: #1e293b; padding: 40px 20px; max-width: 1000px; margin: 0 auto; line-height: 1.6; } h1 { text-align: center; text-transform: uppercase; margin-bottom: 20px; border-bottom: 2px solid #0f172a; padding-bottom: 20px; font-size: 2em; letter-spacing: 2px; } .plan-table { width: 100%; border-collapse: collapse; margin-top: 20px; } .plan-table th, .plan-table td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; vertical-align: top; } .plan-table th { background-color: #4f46e5; color: white; text-transform: uppercase; font-size: 0.85em; } .tag { display: inline-block; background: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 0.85em; margin-bottom: 4px; } .legend { font-size: 0.9em; font-style: italic; color: #334155; margin-top: 8px; padding-left: 10px; border-left: 3px solid #818cf8; } .asset { font-size: 0.8em; color: #4338ca; font-weight: bold; } @media print { body { padding: 0; max-width: 100%; } }</style></head><body><h1>PLANO DE REDES SOCIAIS (14 DIAS)<br><small style="font-size: 0.5em; color: #64748b;">${safeTitle}</small></h1>`;

    html += `<table class="plan-table"><thead><tr><th>Data / Dia</th><th>Hora</th><th>Fase</th><th>Publicação (Formato)</th><th>Legenda (Copy) & Estratégia</th><th>Ficheiro(s) Associado(s)</th></tr></thead><tbody>`;
    
    (projectData.socialMediaPlan.plan || []).forEach((day, idx) => {
         const ids = day.assetIds || (day.assetId ? [day.assetId] : []);
         let assetInfoHtml = ids.map(id => {
             const categories = ['characterPosters', 'behindTheScenes', 'behindTheScenesVideo', 'makingOff', 'whoAmI', 'talkToMe', 'launchImage', 'launchVideo'];
             for (const cat of categories) {
                 const arr = projectData.socialMedia[cat] || [];
                 const index = arr.findIndex(item => item.id === id);
                 if (index > -1) {
                     return escapeHTML(getStandardizedSocialTitle(cat, index, arr[index].characterName));
                 }
             }
             return null;
         }).filter(Boolean).join('<br/>');
         
         const isHistoria = day.format?.toLowerCase().includes('história') || day.format?.toLowerCase().includes('historias') || day.format?.toLowerCase().includes('stories') || day.format?.toLowerCase() === 'story';
         const pubTitle = `${idx + 1} - ${escapeHTML(day.format)} - ${escapeHTML(day.content)}`;

         html += `<tr>
            <td style="white-space: nowrap;"><strong>${escapeHTML(getDisplayDate(day.dayNumber))}</strong></td>
            <td><strong>${escapeHTML(day.time || '-')}</strong></td>
            <td><span style="font-size: 0.85em; font-weight: bold; text-transform: uppercase;">${escapeHTML(day.phase)}</span></td>
            <td><strong>${pubTitle}</strong></td>
            <td>
               ${!isHistoria && day.caption ? `<div class="legend">"${escapeHTML(day.caption)}"</div>` : (isHistoria ? '<em style="color:#94a3b8; font-size:0.8em;">(Sem legenda associada)</em>' : '')}
               <div style="font-size: 0.85em; color: #475569; margin-top: 5px;"><em>Estratégia:</em> ${escapeHTML(day.strategy || day.description)}</div>
            </td>
            <td><span class="asset">${assetInfoHtml || '-'}</span></td>
         </tr>`;
    });
    
    html += `</tbody></table></body></html>`;
    
    const blob = new Blob(['\ufeff' + html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Plano_Redes_Sociais_${safeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSocialTitlesTXT = () => {
    let txt = "";
    const categories = ['characterPosters', 'behindTheScenes', 'behindTheScenesVideo', 'makingOff', 'whoAmI', 'talkToMe', 'launchImage', 'launchVideo'];
    if (projectData?.socialMedia) {
      categories.forEach(cat => {
        if (projectData.socialMedia[cat] && projectData.socialMedia[cat].length > 0) {
          projectData.socialMedia[cat].forEach((item, index) => {
            txt += `${getStandardizedSocialTitle(cat, index, item.characterName)}\n`;
          });
        }
      });
    }
    // Blocos extra / auto-gerados
    (projectData.socialMediaExtraBlocks || []).forEach(block => {
      (block.items || []).forEach((item, i) => {
        txt += `${block.name.toUpperCase()} ${String(i+1).padStart(2,'0')} - ${(item.characterName||'GERAL').toUpperCase()}\n`;
      });
    });
    // Imagem de Estreia
    if (projectData.socialPremiereHeroImage) {
      txt += `ESTREIA 20H00 - CINEMA HERO - ${(renderText(projectData.title)||'FILME').toUpperCase()}\n`;
    }
    if (!txt) {
        alert("Nenhum conteúdo de redes sociais gerado.");
        return;
    }
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeFilename = (projectData.title || 'Projeto').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `Titulos_Redes_Sociais_${safeFilename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportHTMLRoteiro = () => {
    if (!projectData?.scenes) return;
    const safeTitle = escapeHTML(renderText(projectData.title) || 'Filme');
    const langStr = renderText(projectData.language) || 'Português (Portugal)';
    const displayLang = langStr === 'Português (Portugal)' ? 'Português de Portugal (NÃO BRASILEIRO)' : langStr;

    let html = `<!DOCTYPE html><html lang="pt-PT"><head><meta charset="UTF-8"><title>Roteiro - ${safeTitle}</title><style>body { font-family: 'Courier New', Courier, monospace; background: #ffffff; color: #1e293b; padding: 40px 20px; max-width: 850px; margin: 0 auto; line-height: 1.6; } h1 { text-align: center; text-transform: uppercase; margin-bottom: 50px; border-bottom: 2px solid #0f172a; padding-bottom: 20px; font-size: 2.5em; letter-spacing: 2px; } h2 { text-transform: uppercase; border-bottom: 1px dashed #cbd5e1; margin-top: 50px; padding-bottom: 5px; color: #0f172a; } .asset-block { margin-bottom: 20px; padding: 15px; border-left: 4px solid #64748b; background: #f8fafc; } .asset-title { font-weight: bold; text-transform: uppercase; color: #334155; margin-top: 0; } .asset-traits { font-weight: normal; font-size: 0.85em; color: #64748b; margin-left: 10px; } .take-block { margin-bottom: 40px; } .take-header { font-weight: bold; text-transform: uppercase; margin-top: 20px; display: flex; justify-content: space-between; color: #334155; } .action { margin-top: 15px; margin-bottom: 15px; text-align: justify; font-size: 1.05em; } .prompt { background: #f1f5f9; padding: 15px; border: 1px solid #e2e8f0; font-size: 0.85em; margin-bottom: 10px; border-radius: 4px; color: #475569; font-family: monospace; } .prompt-voice { background: #eef2ff; color: #3730a3; border-color: #c7d2fe; } .prompt-poster { background: #fffbeb; color: #78350f; border-color: #fde68a; } .prompt-special { background: #f0fdf4; color: #065f46; border-color: #a7f3d0; } .dialogue-block { margin-top: 20px; margin-bottom: 20px; } .character-name { font-weight: bold; text-transform: uppercase; display: block; text-align: center; margin-bottom: 5px; } .dialogue-text { width: 60%; margin: 0 auto; text-align: left; font-style: italic; } .music-block { margin-top: 60px; padding: 20px; border: 2px solid #0f172a; background: #f8fafc; text-align: center; } .plan-table { width: 100%; border-collapse: collapse; margin-top: 20px; } .plan-table th, .plan-table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; } .plan-table th { background-color: #0f172a; color: white; } @media print { body { padding: 0; max-width: 100%; } .prompt { break-inside: avoid; } .take-block { break-inside: avoid; } }</style></head><body><h1>${safeTitle}</h1>`;

    if (projectData.posterPrompt) {
      html += `<h2>Capa do Filme</h2><div class="asset-block"><p class="prompt prompt-poster"><strong>PROMPT POSTER:</strong> ${escapeHTML(resolvePosterPrompt())}</p></div>`;
    }

    if (projectData.characters && projectData.characters.length > 0) {
      html += `<h2>Personagens</h2>`;
      projectData.characters.forEach(c => {
        const { height, build } = getCharTraits(c);
        let traitsInfo = "";
        if (height || build) traitsInfo = ` (${height ? height + (String(height).includes('cm') ? '' : 'cm') : ''}${height && build ? ' - ' : ''}${build || ''})`;
        html += `<div class="asset-block"><p class="asset-title">${escapeHTML(renderText(c.name))}<span class="asset-traits">${escapeHTML(traitsInfo)}</span></p><p>${escapeHTML(renderText(c.description))}</p><p class="prompt"><strong>PROMPT IMAGEM:</strong> ${escapeHTML(resolveCharPrompt(c))}</p><p class="prompt prompt-voice"><strong>PROMPT VOZ:</strong> ${escapeHTML(resolveCharVoicePrompt(c))}</p></div>`;
      });
    }

    if (projectData.settings && projectData.settings.length > 0) {
      html += `<h2>Cenários</h2>`;
      projectData.settings.forEach(s => {
        html += `<div class="asset-block"><p class="asset-title">${escapeHTML(renderText(s.name))}</p><p>${escapeHTML(renderText(s.description))}</p><p class="prompt"><strong>PROMPT IMAGEM:</strong> ${escapeHTML(resolveSettingPrompt(s))}</p></div>`;
      });
    }

    let globalTimeHtml = 0;

    if (projectData.intro) {
        const startT = globalTimeHtml; globalTimeHtml += (projectData.intro.duration || 0); const endT = globalTimeHtml;
        const timelineStr = `[${escapeHTML(formatDuration(startT))} a ${escapeHTML(formatDuration(endT))}]`;
        html += `<h2>INTRO (ABERTURA)</h2><div class="take-block"><div class="take-header" style="align-items: flex-end;"><span style="flex: 1; padding-right: 20px;">SEQUÊNCIA DE TÍTULO</span><div style="text-align: right; font-size: 0.85em; font-weight: normal; color: #475569; line-height: 1.4; text-transform: uppercase;"><div style="font-weight: bold;">DURAÇÃO: ${stylizeTimeHTML(formatDuration(projectData.intro.duration))}</div><div style="font-weight: bold;">TIMELINE: ${stylizeTimeHTML(timelineStr)}</div></div></div><p class="action">[${escapeHTML(renderText(projectData.intro.camera))}] - ${escapeHTML(renderText(projectData.intro.action))}</p><div class="prompt prompt-special"><strong>PROMPT DE VÍDEO IA:</strong><br/>${escapeHTML(resolveIntroPrompt())}</div></div>`;
    }

    if (projectData.preface) {
        const startT = globalTimeHtml; globalTimeHtml += (projectData.preface.duration || 0); const endT = globalTimeHtml;
        const timelineStr = `[${escapeHTML(formatDuration(startT))} a ${escapeHTML(formatDuration(endT))}]`;
        html += `<h2>PREFÁCIO (INTRODUÇÃO)</h2><div class="take-block"><div class="take-header" style="align-items: flex-end;"><span style="flex: 1; padding-right: 20px;">PRÓLOGO</span><div style="text-align: right; font-size: 0.85em; font-weight: normal; color: #475569; line-height: 1.4; text-transform: uppercase;"><div style="font-weight: bold;">DURAÇÃO: ${stylizeTimeHTML(formatDuration(projectData.preface.duration))}</div><div style="font-weight: bold;">TIMELINE: ${stylizeTimeHTML(timelineStr)}</div></div></div><p class="action">[${escapeHTML(renderText(projectData.preface.camera))}] - ${escapeHTML(renderText(projectData.preface.action))}</p>`;
        if (projectData.preface.narratorText) html += `<div class="dialogue-block"><span class="character-name" style="color:#2563eb;">NARRADOR (VOZ OFF) diz em ${displayLang}:</span><p class="dialogue-text">"${escapeHTML(renderText(projectData.preface.narratorText))}"</p></div>`;
        html += `<div class="prompt prompt-special" style="background: #eff6ff; color: #1e40af; border-color: #bfdbfe;"><strong>PROMPT DE VÍDEO IA:</strong><br/>${escapeHTML(resolvePrefacePrompt())}</div></div>`;
    }

    projectData.scenes.forEach((scene, sIdx) => {
      html += `<h2>CENA ${sIdx + 1} - ${escapeHTML(renderText(scene.title))}</h2>`;
      const narrations = scene.narrations || [];
      scene.takes?.forEach((take, tIdx) => {
        const beforeN = narrations.filter(n => n.takeId === take.id && n.position === 'before' && !n.isPending);
        const duringN = narrations.filter(n => n.takeId === take.id && n.position === 'during' && !n.isPending);
        const afterN = narrations.filter(n => n.takeId === take.id && n.position === 'after' && !n.isPending);

        const set = projectData.settings?.find(s => s.id === take.settingId);
        const startT = globalTimeHtml; globalTimeHtml += (take.duration || 0); const endT = globalTimeHtml;
        const timelineStr = `[${escapeHTML(formatDuration(startT))} a ${escapeHTML(formatDuration(endT))}]`;
        const takeHeader = `CENA ${sIdx + 1} - TAKE ${tIdx + 1} ${set ? `- EXT/INT. ${escapeHTML(renderText(set.name))}` : ''}`;
        const finalPrompt = resolveTakePrompt(take, true);
        
        const chars = (take.characterIds || []).map(id => projectData.characters?.find(c => c.id === id)?.name).filter(Boolean);
        let refs = [];
        if (set) refs.push(`Cenário: ${escapeHTML(renderText(set.name))}`);
        if (chars.length > 0) refs.push(`Personagens: ${chars.map(c => escapeHTML(renderText(c))).join(', ')}`);
        const refsHtml = refs.length > 0 ? `<div style="font-size: 0.85em; color: #64748b; font-weight: bold; text-transform: uppercase; margin-top: 10px; margin-bottom: -5px; margin-left: 30px;">REFS: <span style="color: #334155;">${refs.join(' | ')}</span></div>` : '';

        html += `<div class="take-block"><div class="take-header" style="align-items: flex-end;"><span style="flex: 1; padding-right: 20px;">${takeHeader}</span><div style="text-align: right; font-size: 0.85em; font-weight: normal; color: #475569; line-height: 1.4; text-transform: uppercase;"><div style="font-weight: bold;">DURAÇÃO: ${stylizeTimeHTML(formatDuration(take.duration))}</div><div style="font-weight: bold;">TIMELINE: ${stylizeTimeHTML(timelineStr)}</div></div></div>`;
        html += refsHtml;

        beforeN.forEach(n => { html += `<div class="dialogue-block"><span class="character-name" style="color:#2563eb;">NARRADOR (VOZ OFF) diz em ${displayLang}:</span><p class="dialogue-text">"${escapeHTML(renderText(n.text))}"</p></div>`; });

        html += `<p class="action">[${escapeHTML(renderText(take.camera))}] - ${escapeHTML(renderText(take.action))}</p><div class="prompt"><strong>PROMPT DE VÍDEO IA:</strong><br/>${escapeHTML(finalPrompt)}</div>`;

        if (take.dialogues && take.dialogues.length > 0) {
          take.dialogues.forEach(d => {
            const emotionStr = d.emotion ? ` <span style="text-transform: lowercase; font-weight: normal; color: #64748b;">(${escapeHTML(renderText(d.emotion))})</span>` : '';
            html += `<div class="dialogue-block"><span class="character-name">${escapeHTML(renderText(d.characterName))}${emotionStr} diz em ${displayLang}:</span><p class="dialogue-text">"${escapeHTML(renderText(d.text))}"</p></div>`;
          });
        } else if (take.dialogue && take.dialogue !== 'Nenhum') {
           const charNameStr = take.characterIds?.map(id => projectData.characters?.find(c => c.id === id)?.name).join(' E ') || 'PERSONAGEM';
           html += `<div class="dialogue-block"><span class="character-name">${escapeHTML(renderText(charNameStr))} diz em ${displayLang}:</span><p class="dialogue-text">"${escapeHTML(renderText(take.dialogue))}"</p></div>`;
        }

        duringN.forEach(n => { html += `<div class="dialogue-block"><span class="character-name" style="color:#2563eb;">NARRADOR (VOZ OFF) diz em ${displayLang}:</span><p class="dialogue-text">"${escapeHTML(renderText(n.text))}"</p></div>`; });
        afterN.forEach(n => { html += `<div class="dialogue-block" style="margin-top: 30px;"><span class="character-name" style="color:#2563eb;">NARRADOR (VOZ OFF) diz em ${displayLang}:</span><p class="dialogue-text">"${escapeHTML(renderText(n.text))}"</p></div>`; });

        html += `</div>`;
      });
    });

    if (projectData.outro) {
        const startT = globalTimeHtml; globalTimeHtml += (projectData.outro.duration || 0); const endT = globalTimeHtml;
        const timelineStr = `[${escapeHTML(formatDuration(startT))} a ${escapeHTML(formatDuration(endT))}]`;
        html += `<h2>OUTRO (FINAL)</h2><div class="take-block"><div class="take-header" style="align-items: flex-end;"><span style="flex: 1; padding-right: 20px;">CRÉDITOS FINAIS</span><div style="text-align: right; font-size: 0.85em; font-weight: normal; color: #475569; line-height: 1.4; text-transform: uppercase;"><div style="font-weight: bold;">DURAÇÃO: ${stylizeTimeHTML(formatDuration(projectData.outro.duration))}</div><div style="font-weight: bold;">TIMELINE: ${stylizeTimeHTML(timelineStr)}</div></div></div><p class="action">[${escapeHTML(renderText(projectData.outro.camera))}] - ${escapeHTML(renderText(projectData.outro.action))}</p><div class="prompt prompt-special"><strong>PROMPT DE VÍDEO IA:</strong><br/>${escapeHTML(resolveOutroPrompt())}</div></div>`;
    }

    if (projectData.finalMessages && projectData.finalMessages.length > 0) {
      html += `<h2>MENSAGENS FINAIS (PÓS-CRÉDITOS)</h2>`;
      projectData.finalMessages.forEach((fm, fmIdx) => {
        const startT = globalTimeHtml; globalTimeHtml += (fm.duration || 0); const endT = globalTimeHtml;
        const timelineStr = `[${escapeHTML(formatDuration(startT))} a ${escapeHTML(formatDuration(endT))}]`;
        const takeHeader = `QUADRO EXTRA ${fmIdx + 1}`;
        const finalPrompt = resolveFinalMessagePrompt(fm);
        html += `<div class="take-block"><div class="take-header" style="align-items: flex-end;"><span style="flex: 1; padding-right: 20px;">${takeHeader}</span><div style="text-align: right; font-size: 0.85em; font-weight: normal; color: #475569; line-height: 1.4; text-transform: uppercase;"><div style="font-weight: bold;">DURAÇÃO: ${stylizeTimeHTML(formatDuration(fm.duration))}</div><div style="font-weight: bold;">TIMELINE: ${stylizeTimeHTML(timelineStr)}</div></div></div><p class="action">[${escapeHTML(renderText(fm.camera))}] - ${escapeHTML(renderText(fm.action))}</p><div class="prompt prompt-special" style="background: #faf5ff; color: #166534; border-color: #bbf7d0;"><strong>PROMPT DE VÍDEO IA:</strong><br/>${escapeHTML(finalPrompt)}</div></div>`;
      });
    }

    if (projectData.socialMedia) {
        html += `<h2 style="margin-top: 60px; border-bottom: 2px solid #db2777; color: #db2777;">REDES SOCIAIS (PROMOÇÃO)</h2>`;
        const soc = projectData.socialMedia;

        if (soc.characterPosters && soc.characterPosters.length > 0) {
            html += `<h3 style="color: #2563eb;">1. Pósteres de Personagem & Teasers</h3>`;
            soc.characterPosters.forEach((p, i) => {
                html += `<div class="take-block" style="border-left: 4px solid #2563eb; padding-left: 15px;"><div class="take-header" style="color: #1e3a8a;">${escapeHTML(getStandardizedSocialTitle('characterPosters', i, p.characterName))}</div>${p.teaserPT ? `<p class="action"><i>"${escapeHTML(renderText(p.teaserPT))}"</i></p>` : ''}<div class="prompt" style="background: #eff6ff; border-color: #bfdbfe; color: #1e3a8a;"><strong>PROMPT DE IMAGEM IA (9:16):</strong><br/>${escapeHTML(getSocialImagePrompt(p, 'characterPoster'))}</div></div>`;
            });
        }
        if (soc.behindTheScenes && soc.behindTheScenes.length > 0) {
            html += `<h3 style="color: #d97706; margin-top: 40px;">2. Behind the Scenes (Imagens)</h3>`;
            soc.behindTheScenes.forEach((p, i) => {
                html += `<div class="take-block" style="border-left: 4px solid #d97706; padding-left: 15px;"><div class="take-header" style="color: #92400e;">${escapeHTML(getStandardizedSocialTitle('behindTheScenes', i, p.characterName))}</div><div class="prompt" style="background: #fffbeb; border-color: #fde68a; color: #92400e;"><strong>PROMPT DE IMAGEM IA:</strong><br/>${escapeHTML(getSocialImagePrompt(p, 'bts'))}</div></div>`;
            });
        }
        if (soc.behindTheScenesVideo && soc.behindTheScenesVideo.length > 0) {
            html += `<h3 style="color: #f59e0b; margin-top: 40px;">3. Behind the Scenes (Vídeo)</h3>`;
            soc.behindTheScenesVideo.forEach((p, i) => {
                html += `<div class="take-block" style="border-left: 4px solid #f59e0b; padding-left: 15px;"><div class="take-header" style="color: #b45309;">${escapeHTML(getStandardizedSocialTitle('behindTheScenesVideo', i, p.characterName))}</div><p class="action">[${escapeHTML(renderText(p.camera))}] - ${escapeHTML(renderText(p.action))}</p><div class="dialogue-block"><span class="character-name">${escapeHTML(renderText(p.characterName))} ${p.emotion ? `<span style="text-transform: lowercase; font-weight: normal; color: #64748b;">(${escapeHTML(renderText(p.emotion))})</span>` : ''} diz em ${displayLang}:</span><p class="dialogue-text">"${escapeHTML(renderText(p.dialogue))}"</p></div><div class="prompt" style="background: #fef3c7; border-color: #fcd34d; color: #b45309;"><strong>PROMPT DE VÍDEO IA (9:16):</strong><br/>${escapeHTML(getSocialVideoPrompt(p))}</div></div>`;
            });
        }
        if (soc.makingOff && soc.makingOff.length > 0) {
            html += `<h3 style="color: #16a34a; margin-top: 40px;">4. Making OFF (Vídeo)</h3>`;
            soc.makingOff.forEach((p, i) => {
                html += `<div class="take-block" style="border-left: 4px solid #16a34a; padding-left: 15px;"><div class="take-header" style="color: #14532d;">${escapeHTML(getStandardizedSocialTitle('makingOff', i, p.characterName))}</div><p class="action">[${escapeHTML(renderText(p.camera))}] - ${escapeHTML(renderText(p.action))}</p><div class="dialogue-block"><span class="character-name">${escapeHTML(renderText(p.characterName))} ${p.emotion ? `<span style="text-transform: lowercase; font-weight: normal; color: #64748b;">(${escapeHTML(renderText(p.emotion))})</span>` : ''} diz em ${displayLang}:</span><p class="dialogue-text">"${escapeHTML(renderText(p.dialogue))}"</p></div><div class="prompt" style="background: #f0fdf4; border-color: #bbf7d0; color: #14532d;"><strong>PROMPT DE VÍDEO IA (9:16):</strong><br/>${escapeHTML(getSocialVideoPrompt(p))}</div></div>`;
            });
        }
        if (soc.whoAmI && soc.whoAmI.length > 0) {
            html += `<h3 style="color: #9333ea; margin-top: 40px;">5. Who Am I? (Vídeo)</h3>`;
            soc.whoAmI.forEach((p, i) => {
                html += `<div class="take-block" style="border-left: 4px solid #9333ea; padding-left: 15px;"><div class="take-header" style="color: #581c87;">${escapeHTML(getStandardizedSocialTitle('whoAmI', i, p.characterName))}</div><p class="action">[${escapeHTML(renderText(p.camera))}] - ${escapeHTML(renderText(p.action))}</p><div class="dialogue-block"><span class="character-name">${escapeHTML(renderText(p.characterName))} ${p.emotion ? `<span style="text-transform: lowercase; font-weight: normal; color: #64748b;">(${escapeHTML(renderText(p.emotion))})</span>` : ''} diz em ${displayLang}:</span><p class="dialogue-text">"${escapeHTML(renderText(p.dialogue))}"</p></div><div class="prompt" style="background: #faf5ff; border-color: #e9d5ff; color: #581c87;"><strong>PROMPT DE VÍDEO IA (9:16):</strong><br/>${escapeHTML(getSocialVideoPrompt(p))}</div></div>`;
            });
        }
        if (soc.talkToMe && soc.talkToMe.length > 0) {
            html += `<h3 style="color: #0d9488; margin-top: 40px;">6. Talk to Me! (Vídeo Pós-Estreia)</h3>`;
            soc.talkToMe.forEach((p, i) => {
                html += `<div class="take-block" style="border-left: 4px solid #0d9488; padding-left: 15px;"><div class="take-header" style="color: #115e59;">${escapeHTML(getStandardizedSocialTitle('talkToMe', i, p.characterName))}</div><p class="action">[${escapeHTML(renderText(p.camera))}] - ${escapeHTML(renderText(p.action))}</p><div class="dialogue-block"><span class="character-name">${escapeHTML(renderText(p.characterName))} ${p.emotion ? `<span style="text-transform: lowercase; font-weight: normal; color: #64748b;">(${escapeHTML(renderText(p.emotion))})</span>` : ''} pergunta:</span><p class="dialogue-text">"${escapeHTML(renderText(p.dialogue))}"</p></div><div class="prompt" style="background: #f0fdfa; border-color: #ccfbf1; color: #115e59;"><strong>PROMPT DE VÍDEO IA (9:16):</strong><br/>${escapeHTML(getSocialVideoPrompt(p))}</div></div>`;
            });
        }
    }

    if (projectData.socialMediaPlan) {
        html += `<h2 style="margin-top: 60px; border-bottom: 2px solid #8b5cf6; color: #8b5cf6;">PLANEAMENTO REDES SOCIAIS (14 DIAS)</h2>`;
        html += `<table class="plan-table"><thead><tr><th>Data / Dia</th><th>Hora</th><th>Fase</th><th>Publicação (Formato)</th><th>Legenda (Copy) & Estratégia</th><th>Ficheiro(s) Associado(s)</th></tr></thead><tbody>`;
        (projectData.socialMediaPlan.plan || []).forEach((day, idx) => {
             const ids = day.assetIds || (day.assetId ? [day.assetId] : []);
             let assetInfoHtml = ids.map(id => {
                 const categories = ['characterPosters', 'behindTheScenes', 'behindTheScenesVideo', 'makingOff', 'whoAmI', 'talkToMe', 'launchImage', 'launchVideo'];
                 for (const cat of categories) {
                     const arr = projectData.socialMedia[cat] || [];
                     const index = arr.findIndex(item => item.id === id);
                     if (index > -1) {
                         return escapeHTML(getStandardizedSocialTitle(cat, index, arr[index].characterName));
                     }
                 }
                 return null;
             }).filter(Boolean).join('<br/>');
             
             const isHistoria = day.format?.toLowerCase().includes('história') || day.format?.toLowerCase().includes('historias') || day.format?.toLowerCase().includes('stories') || day.format?.toLowerCase() === 'story';
             const pubTitle = `${idx + 1} - ${escapeHTML(day.format)} - ${escapeHTML(day.content)}`;
             const finalCaption = getFinalCaption(day.caption);
             
             html += `<tr>
                <td style="white-space: nowrap;"><strong>${escapeHTML(getDisplayDate(day.dayNumber))}</strong></td>
                <td><strong>${escapeHTML(day.time || '-')}</strong></td>
                <td><span style="font-size: 0.85em; font-weight: bold; text-transform: uppercase;">${escapeHTML(day.phase)}</span></td>
                <td><strong>${pubTitle}</strong></td>
                <td>
                   ${!isHistoria && day.caption ? `<div style="font-size: 0.9em; font-style: italic; color: #334155; padding-left: 10px; border-left: 3px solid #818cf8; white-space: pre-wrap;">"${escapeHTML(finalCaption)}"</div>` : (isHistoria ? '<em style="color:#94a3b8; font-size:0.8em;">(Sem legenda associada)</em>' : '')}
                   <div style="font-size: 0.85em; color: #475569; margin-top: 5px;"><em>Estratégia:</em> ${escapeHTML(day.strategy || day.description)}</div>
                </td>
                <td><span style="font-size: 0.8em; color: #4338ca; font-weight: bold;">${assetInfoHtml || '-'}</span></td>
             </tr>`;
        });
        html += `</tbody></table>`;
    }

    if (projectData.musicPrompt) {
      html += `<div class="music-block"><h2>Banda Sonora</h2><p class="prompt">${escapeHTML(renderText(projectData.musicPrompt))}</p></div>`;
    }

    html += `</body></html>`;
    
    const blob = new Blob(['\ufeff' + html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeFilename = (projectData.title || 'Projeto').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `Roteiro_${safeFilename}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSpecializedTXT = (type) => {
    if (!projectData?.scenes) return;
    const safeTitle = renderText(projectData.title) || 'Filme';
    const replaceAt = (str) => !str ? '' : str.replace(/anexa na @/g, "anexa na imagem com o mesmo nome").replace(/anexo na @/g, "anexo na imagem com o mesmo nome");

    let txt = `FILME: ${safeTitle.toUpperCase()}\n`;
    let filenameSuffix = '';

    if (type === 'takes') {
        filenameSuffix = 'Cenas_Takes';
        txt += `=========================================\n`;
        txt += `PROMPTS DE VÍDEO - CENAS E TAKES\n`;
        txt += `=========================================\n\n`;
        
        if (projectData.intro) {
            const prompt = replaceAt(resolveIntroPrompt());
            txt += `--- INTRO - SEQUÊNCIA DE TÍTULO ---\n`;
            txt += `PROMPT DE VÍDEO IA:\n${prompt}\n\n`;
        }
        if (projectData.preface) {
            const prompt = replaceAt(resolvePrefacePrompt());
            txt += `--- PREFÁCIO - INTRODUÇÃO DO NARRADOR ---\n`;
            txt += `PROMPT DE VÍDEO IA:\n${prompt}\n\n`;
        }
        projectData.scenes?.forEach((scene, sIdx) => {
            txt += `--- CENA ${sIdx + 1} - ${renderText(scene.title).toUpperCase()} ---\n\n`;
            scene.takes?.forEach((take, tIdx) => {
                const prompt = replaceAt(resolveTakePrompt(take, true));
                const set = projectData.settings?.find(s => s.id === take.settingId);
                txt += `C${sIdx + 1}T${tIdx + 1}${set ? ` - ${renderText(set.name).toUpperCase()}` : ''}\n`;
                txt += `PROMPT DE VÍDEO IA:\n${prompt}\n\n`;
            });
        });
        if (projectData.outro) {
            const prompt = replaceAt(resolveOutroPrompt());
            txt += `--- OUTRO - FINAL ---\n`;
            txt += `PROMPT DE VÍDEO IA:\n${prompt}\n\n`;
        }
    } else if (type === 'finalMessages') {
        filenameSuffix = 'Mensagens_Finais';
        txt += `=========================================\n`;
        txt += `PROMPTS DE VÍDEO - MENSAGENS FINAIS\n`;
        txt += `=========================================\n\n`;
        
        if (projectData.finalMessages && projectData.finalMessages.length > 0) {
            projectData.finalMessages.forEach((fm, fmIdx) => {
                const prompt = replaceAt(resolveFinalMessagePrompt(fm));
                txt += `--- QUADRO EXTRA ${fmIdx + 1} ---\n`;
                txt += `PROMPT DE VÍDEO IA:\n${prompt}\n\n`;
            });
        } else {
            txt += `Nenhuma Mensagem Final gerada.\n`;
        }
    } else if (type === 'charactersSettings') {
        filenameSuffix = 'Personagens_Cenarios';
        txt += `=========================================\n`;
        txt += `PROMPTS - PERSONAGENS E CENÁRIOS\n`;
        txt += `=========================================\n\n`;
        
        if (projectData.posterPrompt) {
            const prompt = replaceAt(resolvePosterPrompt());
            txt += `--- CAPA DO FILME ---\n`;
            txt += `PROMPT POSTER:\n${prompt}\n\n`;
        }
        if (projectData.characters && projectData.characters.length > 0) {
            txt += `--- PERSONAGENS ---\n\n`;
            projectData.characters.forEach(c => {
                const promptImg = replaceAt(resolveCharPrompt(c));
                const promptVoice = replaceAt(resolveCharVoicePrompt(c));
                const { height, build } = getCharTraits(c);
                let traitsInfo = "";
                if (height || build) traitsInfo = ` (${height ? height + (String(height).includes('cm') ? '' : 'cm') : ''}${height && build ? ' - ' : ''}${build || ''})`;
                
                txt += `${renderText(c.name).toUpperCase()}${traitsInfo}\n`;
                txt += `${renderText(c.description)}\n`;
                txt += `PROMPT IMAGEM:\n${promptImg}\n`;
                txt += `PROMPT VOZ:\n${promptVoice}\n\n`;
            });
        }
        if (projectData.settings && projectData.settings.length > 0) {
            txt += `--- CENÁRIOS ---\n\n`;
            projectData.settings.forEach(s => {
                const promptImg = replaceAt(resolveSettingPrompt(s));
                txt += `${renderText(s.name).toUpperCase()}\n`;
                txt += `${renderText(s.description)}\n`;
                txt += `PROMPT IMAGEM:\n${promptImg}\n\n`;
            });
        }
    } else if (type === 'socialMedia') {
        const soc = projectData.socialMedia;
        if (soc) {
            const safeFilename = (projectData.title || 'Projeto').replace(/[^a-z0-9]/gi, '_').toLowerCase();

            // TXT PARA IMAGENS
            let txtImages = `FILME: ${safeTitle.toUpperCase()}\n`;
            txtImages += `=========================================\n`;
            txtImages += `PROMPTS DE IMAGEM - REDES SOCIAIS (PROMOÇÃO)\n`;
            txtImages += `=========================================\n\n`;
            
            const antiTextWarning = "[IMPORTANTE: Não incluir na imagem o texto com o titulo do prompt, nem PROMPT DE IMAGEM IA (9:16)] ";
            
            if (soc.characterPosters && soc.characterPosters.length > 0) {
                txtImages += `--- 1. PÓSTERES DE PERSONAGEM & TEASERS ---\n\n`;
                soc.characterPosters.forEach((p, i) => {
                    const prompt = antiTextWarning + replaceAt(getSocialImagePrompt(p, 'characterPoster'));
                    txtImages += `${getStandardizedSocialTitle('characterPosters', i, p.characterName)}\n${prompt}\n\n`;
                });
            }
            if (soc.behindTheScenes && soc.behindTheScenes.length > 0) {
                txtImages += `--- 2. BEHIND THE SCENES (IMAGENS) ---\n\n`;
                soc.behindTheScenes.forEach((p, i) => {
                    const prompt = antiTextWarning + replaceAt(getSocialImagePrompt(p, 'bts'));
                    txtImages += `${getStandardizedSocialTitle('behindTheScenes', i, p.characterName)}\n${prompt}\n\n`;
                });
            }
            if (soc.launchImage && soc.launchImage.length > 0) {
                txtImages += `--- 7. LANÇAMENTO OFICIAL (IMAGENS) ---\n\n`;
                soc.launchImage.forEach((p, i) => {
                    const prompt = antiTextWarning + replaceAt(getSocialImagePrompt(p, 'poster'));
                    txtImages += `${getStandardizedSocialTitle('launchImage', i, p.characterName)}\n${prompt}\n\n`;
                });
            }

            const blobImg = new Blob([txtImages], { type: 'text/plain;charset=utf-8' });
            const urlImg = URL.createObjectURL(blobImg);
            const aImg = document.createElement('a');
            aImg.href = urlImg;
            aImg.download = `Prompts_Redes_Sociais_Imagens_${safeFilename}.txt`;
            aImg.click();
            URL.revokeObjectURL(urlImg);

            // TXT PARA VÍDEOS
            let txtVideos = `FILME: ${safeTitle.toUpperCase()}\n`;
            txtVideos += `=========================================\n`;
            txtVideos += `PROMPTS DE VÍDEO - REDES SOCIAIS (PROMOÇÃO)\n`;
            txtVideos += `=========================================\n\n`;

            if (soc.behindTheScenesVideo && soc.behindTheScenesVideo.length > 0) {
                txtVideos += `--- 3. BEHIND THE SCENES (VÍDEO) ---\n\n`;
                soc.behindTheScenesVideo.forEach((p, i) => {
                    const prompt = replaceAt(getSocialVideoPrompt(p));
                    txtVideos += `${getStandardizedSocialTitle('behindTheScenesVideo', i, p.characterName)}\n${prompt}\n\n`;
                });
            }

            if (soc.makingOff && soc.makingOff.length > 0) {
                txtVideos += `--- 4. MAKING OFF (VÍDEO) ---\n\n`;
                soc.makingOff.forEach((p, i) => {
                    const prompt = replaceAt(getSocialVideoPrompt(p));
                    txtVideos += `${getStandardizedSocialTitle('makingOff', i, p.characterName)}\n${prompt}\n\n`;
                });
            }
            if (soc.whoAmI && soc.whoAmI.length > 0) {
                txtVideos += `--- 5. WHO AM I? (VÍDEO) ---\n\n`;
                soc.whoAmI.forEach((p, i) => {
                    const prompt = replaceAt(getSocialVideoPrompt(p));
                    txtVideos += `${getStandardizedSocialTitle('whoAmI', i, p.characterName)}\n${prompt}\n\n`;
                });
            }
            if (soc.talkToMe && soc.talkToMe.length > 0) {
                txtVideos += `--- 6. TALK TO ME! (VÍDEO PÓS-ESTREIA) ---\n\n`;
                soc.talkToMe.forEach((p, i) => {
                    const prompt = replaceAt(getSocialVideoPrompt(p));
                    txtVideos += `${getStandardizedSocialTitle('talkToMe', i, p.characterName)}\n${prompt}\n\n`;
                });
            }
            if (soc.launchVideo && soc.launchVideo.length > 0) {
                txtVideos += `--- 8. LANÇAMENTO OFICIAL (VÍDEOS) ---\n\n`;
                soc.launchVideo.forEach((p, i) => {
                    const prompt = replaceAt(getSocialVideoPrompt(p));
                    txtVideos += `${getStandardizedSocialTitle('launchVideo', i, p.characterName)}\n${prompt}\n\n`;
                });
            }

            // Um pequeno delay para garantir que o browser permite o download de um segundo ficheiro
            setTimeout(() => {
                const blobVid = new Blob([txtVideos], { type: 'text/plain;charset=utf-8' });
                const urlVid = URL.createObjectURL(blobVid);
                const aVid = document.createElement('a');
                aVid.href = urlVid;
                aVid.download = `Prompts_Redes_Sociais_Videos_${safeFilename}.txt`;
                aVid.click();
                URL.revokeObjectURL(urlVid);
            }, 300);

            return; // Termina aqui para não exportar o txt vazio padrão em baixo
        } else {
            filenameSuffix = 'Redes_Sociais';
            txt += `=========================================\n`;
            txt += `PROMPTS - REDES SOCIAIS (PROMOÇÃO)\n`;
            txt += `=========================================\n\n`;
            txt += `Nenhum conteúdo de redes sociais gerado.\n`;
        }
    } else if (type === 'socialPlan') {
        filenameSuffix = 'Plano_Redes_Sociais';
        txt += `=========================================\n`;
        txt += `PLANEAMENTO REDES SOCIAIS - 14 DIAS\n`;
        txt += `=========================================\n\n`;
        
        if (projectData.socialMediaPlan && projectData.socialMediaPlan.plan) {
            projectData.socialMediaPlan.plan.forEach((day, idx) => {
                const ids = day.assetIds || (day.assetId ? [day.assetId] : []);
                let assetInfo = ids.map(id => {
                     const categories = ['characterPosters', 'behindTheScenes', 'behindTheScenesVideo', 'makingOff', 'whoAmI', 'talkToMe', 'launchImage', 'launchVideo'];
                     for (const cat of categories) {
                         const arr = projectData.socialMedia[cat] || [];
                         const index = arr.findIndex(item => item.id === id);
                         if (index > -1) {
                             return getStandardizedSocialTitle(cat, index, arr[index].characterName);
                         }
                     }
                     return null;
                }).filter(Boolean).join(' | ');
                
                const isHistoria = day.format?.toLowerCase().includes('história') || day.format?.toLowerCase().includes('historias') || day.format?.toLowerCase().includes('stories') || day.format?.toLowerCase() === 'story';
                const finalCaption = getFinalCaption(day.caption);

                txt += `${getDisplayDate(day.dayNumber).toUpperCase()} - HORA: ${day.time || '-'} - ${renderText(day.phase).toUpperCase()}\n`;
                txt += `PUBLICAÇÃO: ${idx + 1} - ${renderText(day.format).toUpperCase()} - ${renderText(day.content).toUpperCase()}\n`;
                if (!isHistoria && day.caption) {
                    txt += `LEGENDA: "${renderText(finalCaption)}"\n`;
                }
                if (assetInfo) txt += `FICHEIROS ASSOCIADOS: ${assetInfo}\n`;
                txt += `ESTRATÉGIA: ${renderText(day.strategy || day.description)}\n\n`;
            });
        } else {
            txt += `Nenhum planeamento gerado.\n`;
        }
    }

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeFilename = (projectData.title || 'Projeto').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `Prompts_${filenameSuffix}_${safeFilename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportFullProjectTXT = () => {
    const replaceAt = (str) => !str ? '' : str.replace(/anexa na @/g, "anexa na imagem com o mesmo nome").replace(/anexo na @/g, "anexo na imagem com o mesmo nome");
    let txt = "";

    // 0-Ficheiro JSON Base
    txt += "0-Ficheiro JSON Base\n\n";
    
    txt += "Identificação Base\n";
    txt += `Título: ${renderText(projectData.title)}\n`;
    txt += `Realizador: ${renderText(projectData.director)}\n`;
    txt += `Argumentista: ${renderText(projectData.writer)}\n\n`;

    txt += "Especificações Técnicas\n";
    txt += `Tipo de Filme: ${renderText(projectData.filmType)}\n`;
    txt += `Estilo Visual: ${renderText(projectData.filmGenre)}\n`;
    txt += `Estilo Artístico: ${renderText(projectData.artStyle)}\n`;
    txt += `Tipo de Áudio: ${renderText(projectData.filmSoundType)}\n\n`;

    txt += "Língua / Nacionalidade\n";
    txt += `${renderText(projectData.language)}\n\n`;

    txt += "Duração Estimada do Filme\n";
    txt += `${formatDuration(projectData.duration)}\n\n`;

    txt += "Formato (Aspect Ratio)\n";
    txt += `${renderText(projectData.aspectRatio)}\n\n`;

    txt += "Rácio Cenas / Takes\n";
    const ratioText = projectData.sceneTakeRatio === 0 ? "Baixo" : projectData.sceneTakeRatio === 2 ? "Alto" : "Normal";
    txt += `${ratioText}\n\n`;

    txt += "Ideia Central (Logline) ou Rascunho\n";
    txt += `${renderText(projectData.storyPrompt)}\n\n`;

    txt += "Conceito (Pitch / Temas)\n";
    txt += `${renderText(projectData.concept)}\n\n`;

    txt += "História e Guião\n";
    txt += `${renderText(projectData.script)}\n\n\n`;

    // 1-Edicao-Personagens
    txt += "1-Edicao-Personagens\n\n";
    if (projectData.characters && projectData.characters.length > 0) {
        projectData.characters.forEach(c => {
            txt += `${renderText(c.name)}\n`;
            txt += `${replaceAt(resolveCharPrompt(c))}\n\n`;
        });
    } else {
        txt += "Nenhuma personagem.\n\n";
    }
    txt += "\n";

    // 2-Edicao-Cenarios
    txt += "2-Edicao-Cenarios\n\n";
    if (projectData.settings && projectData.settings.length > 0) {
        projectData.settings.forEach(s => {
            txt += `${renderText(s.name)}\n`;
            txt += `${replaceAt(resolveSettingPrompt(s))}\n\n`;
        });
    } else {
        txt += "Nenhum cenário.\n\n";
    }
    txt += "\n";

    // 3-Edicao-Takes
    txt += "3-Edicao-Takes\n\n";
    if (projectData.scenes && projectData.scenes.length > 0) {
        projectData.scenes.forEach((scene, sIdx) => {
            txt += `CENA ${sIdx + 1} - ${renderText(scene.title)}\n`;
            if (scene.takes && scene.takes.length > 0) {
                scene.takes.forEach((take, tIdx) => {
                    const set = projectData.settings?.find(s => s.id === take.settingId);
                    txt += `C${sIdx + 1}T${tIdx + 1}${set ? ` - ${renderText(set.name).toUpperCase()}` : ''}\n`;
                    
                    let refs = [];
                    if (set) refs.push(`Cenário: ${renderText(set.name)}`);
                    const chars = (take.characterIds || []).map(id => projectData.characters?.find(c => c.id === id)?.name).filter(Boolean);
                    if (chars.length > 0) refs.push(`Personagens: ${chars.join(', ')}`);
                    
                    txt += `Refs: ${refs.length > 0 ? refs.join(' | ') : 'Nenhuma'}\n`;
                    txt += `${replaceAt(resolveTakePrompt(take, true))}\n\n`;
                });
            }
        });
    } else {
        txt += "Nenhuma cena.\n\n";
    }
    txt += "\n";

    // 4-Edicao-Intro_Outro
    txt += "4-Edicao-Intro_Outro\n\n";
    if (projectData.intro) {
        txt += "INTRO - Sequência de Título\n";
        txt += "Refs: Nenhuma\n";
        txt += `${replaceAt(resolveIntroPrompt())}\n\n`;
    }
    if (projectData.preface) {
        txt += "PREFÁCIO - Introdução\n";
        txt += "Refs: Nenhuma\n";
        txt += `${replaceAt(resolvePrefacePrompt())}\n\n`;
    }
    if (projectData.outro) {
        txt += "OUTRO - Final\n";
        txt += "Refs: Nenhuma\n";
        txt += `${replaceAt(resolveOutroPrompt())}\n\n`;
    }
    
    txt += "Mensagens Finais (Pós-Créditos)\n";
    if (projectData.finalMessages && projectData.finalMessages.length > 0) {
        projectData.finalMessages.forEach((fm, fmIdx) => {
            txt += `Quadro Extra ${fmIdx + 1}\n`;
            txt += "Refs: Nenhuma\n";
            txt += `${replaceAt(resolveFinalMessagePrompt(fm))}\n\n`;
        });
    } else {
        txt += "Nenhuma mensagem final.\n\n";
    }

    if (projectData.posterPrompt) {
        txt += "Capa / Poster do Filme\n";
        const charsNames = projectData.characters?.map(c => c.name).join(", ");
        txt += `Refs: ${charsNames ? `Personagens: ${charsNames}` : 'Nenhuma'}\n`;
        txt += `${replaceAt(resolvePosterPrompt())}\n\n`;
    }
    txt += "\n";

    // 6-Redes-Sociais
    txt += "6-Redes-Sociais\n\n";
    if (projectData.socialMedia) {
        const soc = projectData.socialMedia;
        
        if (soc.characterPosters && soc.characterPosters.length > 0) {
            txt += "1-CharacterPosters\n";
            soc.characterPosters.forEach((p, i) => {
                txt += `${getStandardizedSocialTitle('characterPosters', i, p.characterName)}\n`;
                txt += `Refs: ${renderText(p.characterName)}\n`;
                txt += `${replaceAt(getSocialImagePrompt(p, 'characterPoster'))}\n\n`;
            });
        }
        if (soc.behindTheScenes && soc.behindTheScenes.length > 0) {
            txt += "2-BehindTheScenes\n";
            soc.behindTheScenes.forEach((p, i) => {
                txt += `${getStandardizedSocialTitle('behindTheScenes', i, p.characterName)}\n`;
                txt += `Refs: ${renderText(p.characterName)}\n`;
                txt += `${replaceAt(getSocialImagePrompt(p, 'bts'))}\n\n`;
            });
        }
        if (soc.behindTheScenesVideo && soc.behindTheScenesVideo.length > 0) {
            txt += "3-BehindTheScenesVideo\n";
            soc.behindTheScenesVideo.forEach((p, i) => {
                txt += `${getStandardizedSocialTitle('behindTheScenesVideo', i, p.characterName)}\n`;
                txt += `Refs: ${renderText(p.characterName)}\n`;
                txt += `${replaceAt(getSocialVideoPrompt(p))}\n\n`;
            });
        }
        if (soc.makingOff && soc.makingOff.length > 0) {
            txt += "4-MakingOff\n";
            soc.makingOff.forEach((p, i) => {
                txt += `${getStandardizedSocialTitle('makingOff', i, p.characterName)}\n`;
                txt += `Refs: ${renderText(p.characterName)}\n`;
                txt += `${replaceAt(getSocialVideoPrompt(p))}\n\n`;
            });
        }
        if (soc.whoAmI && soc.whoAmI.length > 0) {
            txt += "5-WhoAmI\n";
            soc.whoAmI.forEach((p, i) => {
                txt += `${getStandardizedSocialTitle('whoAmI', i, p.characterName)}\n`;
                txt += `Refs: ${renderText(p.characterName)}\n`;
                txt += `${replaceAt(getSocialVideoPrompt(p))}\n\n`;
            });
        }
        if (soc.talkToMe && soc.talkToMe.length > 0) {
            txt += "6-TalkToMe\n";
            soc.talkToMe.forEach((p, i) => {
                txt += `${getStandardizedSocialTitle('talkToMe', i, p.characterName)}\n`;
                txt += `Refs: ${renderText(p.characterName)}\n`;
                txt += `${replaceAt(getSocialVideoPrompt(p))}\n\n`;
            });
        }
        if (soc.launchImage && soc.launchImage.length > 0) {
            txt += "7-Lançamento Oficial (Imagens)\n";
            soc.launchImage.forEach((p, i) => {
                txt += `${getStandardizedSocialTitle('launchImage', i, p.characterName)}\n`;
                txt += `Refs: ${renderText(p.characterName)}\n`;
                txt += `${replaceAt(getSocialImagePrompt(p, 'poster'))}\n\n`;
            });
        }
        if (soc.launchVideo && soc.launchVideo.length > 0) {
            txt += "8-Lançamento Oficial (Vídeos)\n";
            soc.launchVideo.forEach((p, i) => {
                txt += `${getStandardizedSocialTitle('launchVideo', i, p.characterName)}\n`;
                txt += `Refs: ${renderText(p.characterName)}\n`;
                txt += `${replaceAt(getSocialVideoPrompt(p))}\n\n`;
            });
        }
    } else {
        txt += "Nenhum conteúdo de redes sociais gerado.\n\n";
    }

    // 7-Plano de Redes Sociais
    txt += "7-Plano de Redes Sociais\n\n";
    if (projectData.socialMediaPlan && projectData.socialMediaPlan.plan) {
        projectData.socialMediaPlan.plan.forEach((day, idx) => {
            const ids = day.assetIds || (day.assetId ? [day.assetId] : []);
            let assetInfo = ids.map(id => {
                 const categories = ['characterPosters', 'behindTheScenes', 'behindTheScenesVideo', 'makingOff', 'whoAmI', 'talkToMe', 'launchImage', 'launchVideo'];
                 for (const cat of categories) {
                     const arr = projectData.socialMedia[cat] || [];
                     const index = arr.findIndex(item => item.id === id);
                     if (index > -1) {
                         return getStandardizedSocialTitle(cat, index, arr[index].characterName);
                     }
                 }
                 return null;
            }).filter(Boolean).join(' | ');
            
            const isHistoria = day.format?.toLowerCase().includes('história') || day.format?.toLowerCase().includes('historias') || day.format?.toLowerCase().includes('stories') || day.format?.toLowerCase() === 'story';
            const finalCaption = getFinalCaption(day.caption);

            txt += `${getDisplayDate(day.dayNumber).toUpperCase()} - HORA: ${day.time || '-'} - ${renderText(day.phase).toUpperCase()}\n`;
            txt += `PUBLICAÇÃO: ${idx + 1} - ${renderText(day.format).toUpperCase()} - ${renderText(day.content).toUpperCase()}\n`;
            if (!isHistoria && day.caption) {
                txt += `LEGENDA: "${renderText(finalCaption)}"\n`;
            }
            if (assetInfo) txt += `FICHEIROS ASSOCIADOS: ${assetInfo}\n`;
            txt += `ESTRATÉGIA: ${renderText(day.strategy || day.description)}\n\n`;
        });
    } else {
        txt += `Nenhum planeamento gerado.\n\n`;
    }

    const txtSemAcentos = txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const blob = new Blob([txtSemAcentos], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeFilename = (projectData.title || 'Projeto').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `Estrutura_Completa_${safeFilename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateMusicPrompt = async () => {
    const activeGenres = (projectData.musicGenres || []).filter(Boolean);
    if (activeGenres.length === 0) { alert("Seleciona pelo menos um género musical nos menus."); return; }
    setIsGeneratingMusic(true);
    const genresStr = activeGenres.join("\n- ");
    let currentTime = 0; let timelineInfo = "";
    if (projectData.intro) { timelineInfo += `${formatTime(currentTime)} Início da Intro (Título do Filme): ${renderText(projectData.intro.action)}\n`; currentTime += (projectData.intro.duration || 0); }
    if (projectData.preface) { timelineInfo += `${formatTime(currentTime)} Prefácio do Narrador: ${renderText(projectData.preface.action)}\n`; currentTime += (projectData.preface.duration || 0); }
    projectData.scenes?.forEach((scene, sIdx) => {
      timelineInfo += `${formatTime(currentTime)} Início da Cena ${sIdx + 1}: ${renderText(scene.title)} - ${renderText(scene.description)}\n`;
      let sceneDuration = 0; scene.takes?.forEach(take => sceneDuration += take.duration || 0); currentTime += sceneDuration;
    });
    if (projectData.outro) { timelineInfo += `${formatTime(currentTime)} Início do Outro (Fim do Filme): ${renderText(projectData.outro.action)}\n`; currentTime += (projectData.outro.duration || 0); }
    if (projectData.finalMessages && projectData.finalMessages.length > 0) {
      projectData.finalMessages.forEach((fm, fmIdx) => { timelineInfo += `${formatTime(currentTime)} Mensagem Extra/Pós-Créditos ${fmIdx + 1}: ${renderText(fm.action)}\n`; currentTime += (fm.duration || 0); });
    }
    timelineInfo += `${formatTime(currentTime)} Fim total da visualização.\n`;

    const userQuery = `Atua como um engenheiro de prompts de IA especializado em modelos de geração de música (como Suno, Udio, etc). Deves criar o PROMPT PERFEITO para gerar a banda sonora deste curta/filme.
    Contexto do Filme: Título: ${projectData.title} | Logline: ${projectData.idea || projectData.storyPrompt} | Duração Total: ${formatTime(currentTime)} | Atmosfera / Mood Principal: ${projectData.musicMood || "Não especificado"}
    Géneros e Elementos Musicais Escolhidos: - ${genresStr} | Detalhes Adicionais: ${projectData.musicDesc || "Nenhum"}
    CRONOLOGIA EXATA DAS CENAS (TIMESTAMPS): ${timelineInfo}
    INSTRUÇÕES RIGOROSAS: 1. Escreve um ÚNICO prompt claro e detalhado em INGLÊS. 2. Foca-te na instrumentação, ritmo (BPM), transições e emoções. 3. OBRIGATÓRIO: Inclui a marcação de tempo listada acima no formato [MM:SS] para criar um mapa cronológico. 4. Não uses formato JSON nem markdown. Devolve APENAS o texto do prompt final.`;

    try {
      const text = await callGeminiAPI(userQuery, false);
      if (text) handleProjectDataChange('musicPrompt', text.trim());
    } catch (e) { alert(`Erro ao gerar prompt da banda sonora. Detalhe: ${e.message}`); } finally { setIsGeneratingMusic(false); }
  };

  const generateScriptWithAI = async (isEdit = false) => {
    const baseStory = projectData.storyPrompt || projectData.idea || projectData.title;
    if (!isEdit && !baseStory && !projectData.storyFileContent) {
      alert("Por favor, preenche a Ideia Central ou o Título na Configuração do Projeto.");
      return;
    }
    if (isEdit && !scriptEditPrompt) return;
    setIsGeneratingScript(true);
    setScriptError(null);
    const targetDuration = parseInt(projectData.duration) || 30;
    const approxTakes = Math.max(5, Math.floor(targetDuration / 6)); 
    let soundRule = "";
    if (projectData.filmSoundType === 'Diálogos') soundRule = "- TIPO DE ÁUDIO: 'Diálogos'. O filme baseia-se exclusivamente em diálogos entre as personagens no ecrã. Não uses narrador.";
    else if (projectData.filmSoundType === 'Narração e Diálogos') soundRule = "- TIPO DE ÁUDIO: 'Narração e Diálogos'. As personagens falam normalmente, mas também usas 'characterName': 'NARRADOR (Voz OFF)' nos momentos em que não há falas para contar a história.";
    else if (projectData.filmSoundType === 'Narração') soundRule = "- TIPO DE ÁUDIO: 'Narração'. As personagens NO ECRÃ NÃO FALAM! Toda a história é contada por um narrador, portanto todos os diálogos devem ter 'characterName': 'NARRADOR (Voz OFF)'.";
    else if (projectData.filmSoundType === 'Mudo') soundRule = "- TIPO DE ÁUDIO: 'Mudo'. O filme não tem vozes. Nem personagens nem narrador falam. É estritamente proibido adicionar elementos ao array 'dialogues'. Deve ficar vazio.";
    
    let ratioRule = "";
    if (projectData.sceneTakeRatio === 0) ratioRule = "- ESTRUTURA DE CENAS ('Baixo'): MUITA DIVERSIDADE DE CENAS. Desdobra a ação por muitas cenas diferentes (ex: 5 a 8), cada uma com poucos takes (ex: 1 ou 2). Foca-te em mudar frequentemente de localização.";
    else if (projectData.sceneTakeRatio === 2) ratioRule = "- ESTRUTURA DE CENAS ('Alto'): MUITA PROFUNDIDADE DE CENA. Agrupa a ação em poucas cenas (ex: 1 a 3), mas detalha-as com muitos takes (ex: 5 a 10) cada. Foca-te em explorar a fundo cada localização.";
    else ratioRule = "- ESTRUTURA DE CENAS ('Normal'): Distribuição normal e equilibrada entre o número de cenas e takes.";

    const safeContent = projectData.storyFileContent ? projectData.storyFileContent.substring(0, 25000) : '';
    let userQuery = "";

    const existingChars = projectData.characters || [];
    const existingSettings = projectData.settings || [];
    const existingContext = (existingChars.length > 0 || existingSettings.length > 0)
        ? `\nATENÇÃO - ELEMENTOS PRÉ-EXISTENTES A REAPROVEITAR:\nO projeto já contém os seguintes elementos:\nPersonagens: ${JSON.stringify(existingChars.map(c => ({id: c.id, name: c.name, description: c.description})))}\nCenários: ${JSON.stringify(existingSettings.map(s => ({id: s.id, name: s.name, description: s.description})))}\nINSTRUÇÃO CRÍTICA: Podes e deves integrar estas personagens e cenários na narrativa se fizerem sentido para a história. Se as utilizares, DEVES manter EXATAMENTE o mesmo "id" e "name" no JSON gerado. Podes também criar novas personagens/cenários se a história o exigir, gerando novos "id"s únicos.`
        : '';

    if (isEdit) {
      userQuery = `Age como um argumentista e realizador de cinema de topo. O utilizador já tem o seguinte guião estruturado: ${JSON.stringify({ title: projectData.title, script: projectData.script })}
      O UTILIZADOR PEDIU AS SEGUINTES ALTERAÇÕES: "${scriptEditPrompt}"
      Aplica as alterações rigorosamente. Mantém toda a estrutura JSON válida e atualiza as personagens/cenários se necessário.`;
    } else {
      userQuery = `Age como um argumentista e realizador de cinema de topo. Deves estruturar a narrativa completa do filme baseado nos seguintes dados. PREMISSA / LOGLINE: ${baseStory} | CONCEITO / TEMAS: ${projectData.concept}`;
      if (safeContent) userQuery += `\n\nCONTEÚDO DO FICHEIRO ANEXADO:\n"""\n${safeContent}\n"""\n AVALIAÇÃO: Se for um guião estruturado, transforma-o para JSON mantendo a estrutura. Se for rascunho, expande-o garantindo a "Duração Alvo".`;
    }

    userQuery += `
    MUITO IMPORTANTE:
    - O campo "script" NÃO pode ser apenas um resumo de takes. Tem de ser um guião literário/tratamento longo, descritivo e envolvente.
    - Aplica OBRIGATORIAMENTE a Estrutura Narrativa dos 3 Atos na redação do "script":
      * Ato I - Apresentação (aprox. 25%): Apresenta as personagens, o seu mundo normal e o incidente incitante (o evento que desencadeia a história).
      * Ato II - Confronto/Desenvolvimento (aprox. 50%): A personagem enfrenta obstáculos crescentes, resultando no ponto médio e intensificação do conflito.
      * Ato III - Resolução (aprox. 25%): Constrói para o clímax (momento de maior tensão) e finaliza com a resolução da história.
    - OBRIGATÓRIO NA FORMATAÇÃO DO "script": Separa os atos com títulos exatos "ATO I - APRESENTAÇÃO", "ATO II - CONFRONTO", "ATO III - RESOLUÇÃO" (cada um isolado numa linha) e usa quebras de linha (\\n\\n) para os parágrafos.
    - O filme tem a duração ESTRITA de ${targetDuration} segundos. Gera APROXIMADAMENTE ${approxTakes} TAKES no total, divididos por várias cenas.
    - Expande a narrativa ao máximo.
    - MATEMÁTICA RIGOROSA: A SOMA TOTAL do campo "duration" de TODOS os takes gerados nas "scenes", MAIS a duração da "intro", "preface" e "outro" TEM DE SER MATEMATICAMENTE EXATAMENTE IGUAL a ${targetDuration} segundos. Falhar este tempo é inaceitável.
    - OBRIGATÓRIO: Gera EXATAMENTE 3 "finalMessages" (Pós-créditos), adaptadas à realidade e cultura de Portugal:
      1. Estatística: Estatística real ou plausível sobre o tema em Portugal.
      2. Moral: O impacto humano/social em Portugal.
      3. Futuro: Mensagem de esperança/aviso para a sociedade portuguesa.
      O campo "userInput" das "finalMessages" DEVE conter APENAS a frase concisa gerada em PT-PT que vai aparecer no ecrã.
      CRÍTICO para "finalMessages": O campo "visualPromptEN" DEVE incluir explícita e obrigatoriamente o texto a ser renderizado no vídeo, usando a instrução 'text overlay reading "FRASE GERADA AQUI"'.
    RESPONDE APENAS COM UM JSON VÁLIDO. NÃO USES MARKDOWN. ESTRUTURA OBRIGATÓRIA:
    {
      "script": "Guião literário longo e detalhado (texto corrido estruturado em 3 Atos)...", "posterPrompt": "Prompt em inglês para poster. OBRIGATÓRIO: Incluir referência visual a TODAS as personagens na imagem e adicionar a frase 'The K-Brothers logo in the bottom right corner'...",
      "intro": { "action": "Ação de título (em Português)", "camera": "Ângulo", "duration": 4 },
      "preface": { "action": "Ação visual do prefácio", "camera": "Ângulo", "duration": 8, "narratorText": "Texto falado pelo narrador em Voz OFF para introduzir a história." },
      "outro": { "action": "Ação fim do filme", "camera": "Ângulo", "duration": 4 },
      "characters": [ { "id": "char1", "name": "Nome", "description": "Descrição", "physical": { "height": "altura cm", "build": "Estrutura Fisica" }, "voicePrompt": "Prompt de voz em inglês" } ],
      "settings": [ { "id": "set1", "name": "Nome do Local", "description": "Descrição" } ],
      "scenes": [ { "id": "scene1", "title": "Título da Cena", "description": "Resumo", "takes": [ { "id": "take1_s1", "settingId": "set1", "characterIds": ["char1"], "action": "Ação", "camera": "Ângulo", "sound": "Som", "dialogues": [ { "characterName": "Nome", "emotion": "Tom", "text": "fala" } ], "duration": 5 } ] } ],
      "finalMessages": [ { "id": "fm1", "action": "Texto surge no ecrã", "camera": "Static", "duration": 6, "visualPromptEN": "Prompt visual em inglês. MUST INCLUDE: text overlay reading \"A frase exata gerada aqui\"", "userInput": "A frase exata gerada aqui" } ]
    }
    ESPECIFICAÇÕES: Tipo: ${projectData.filmType} | Estilo Visual: ${projectData.filmGenre} | Estilo IA: ${projectData.artStyle} | Idioma: ${projectData.language} ${projectData.language === 'Português (Portugal)' ? '(OBRIGATÓRIO: PORTUGUÊS DE PORTUGAL, NÃO BRASILEIRO)' : ''} | ${soundRule} | ${ratioRule} | Duração Alvo Exata: ${targetDuration} Segundos.`;

    userQuery += existingContext;

    try {
      const text = await callGeminiAPI(userQuery, true);
      if (text) {
        let data; try { data = parseAIResponse(text); } catch(e) { throw new Error('Falha na IA.'); }
        saveToProjectHistory(projectData); 
        setProjectData(prev => {
           const finalChars = [...prev.characters];
           (data.characters || []).forEach(aiChar => {
               const idx = finalChars.findIndex(c => c.id === aiChar.id);
               if (idx > -1) finalChars[idx] = { ...finalChars[idx], ...aiChar };
               else finalChars.push(aiChar);
           });

           const finalSettings = [...prev.settings];
           (data.settings || []).forEach(aiSet => {
               const idx = finalSettings.findIndex(s => s.id === aiSet.id);
               if (idx > -1) finalSettings[idx] = { ...finalSettings[idx], ...aiSet };
               else finalSettings.push(aiSet);
           });
           
           const parsedFinalMsgs = (data.finalMessages || []).map((fm, i) => ({ ...fm, id: fm.id || `fm_gen_${Date.now()}_${i}` }));

           return {
              ...prev, script: data.script || prev.script, posterPrompt: data.posterPrompt || prev.posterPrompt,
              intro: data.intro || prev.intro, preface: data.preface || prev.preface, outro: data.outro || prev.outro, 
              characters: finalChars, settings: finalSettings, scenes: data.scenes || [],
              finalMessages: parsedFinalMsgs.length > 0 ? parsedFinalMsgs : prev.finalMessages, lastGeneratedSoundType: prev.filmSoundType, lastGeneratedSceneTakeRatio: prev.sceneTakeRatio
           };
        });
        setScriptEditPrompt('');
      }
    } catch (e) { setScriptError(`Ocorreu um erro ao processar o Guião. Motivo: ${e.message}`); } finally { setIsGeneratingScript(false); }
  };

  const adaptScriptToSoundType = async () => {
    setIsGeneratingScript(true);
    let soundRule = "";
    if (projectData.filmSoundType === 'Diálogos') soundRule = "O filme baseia-se APENAS em diálogos. Remove narrador.";
    else if (projectData.filmSoundType === 'Narração e Diálogos') soundRule = "O filme tem diálogos E um NARRADOR (Voz OFF).";
    else if (projectData.filmSoundType === 'Narração') soundRule = "O filme tem APENAS narração. Substitui diálogos por NARRADOR.";
    else if (projectData.filmSoundType === 'Mudo') soundRule = "O filme é MUDO. Remove TODOS os diálogos.";

    const query = `Atua como argumentista. Adapta o Tipo de Som para: ${projectData.filmSoundType}. GUIÃO ATUAL: ${JSON.stringify({ script: projectData.script, scenes: projectData.scenes })} NOVA REGRA: ${soundRule} INSTRUÇÕES: 1. Adapta o "script". 2. Adapta "dialogues" das "takes". 3. CRÍTICO: NÃO apagues cenas nem alteres "duration". RESPONDE APENAS COM JSON VÁLIDO: { "script": "...", "scenes": [ ... ] }`;

    try {
      const text = await callGeminiAPI(query, true);
      if (text) {
         const parsed = parseAIResponse(text);
         saveToProjectHistory(projectData);
         setProjectData(prev => ({ ...prev, script: parsed.script || prev.script, scenes: parsed.scenes || prev.scenes, lastGeneratedSoundType: prev.filmSoundType }));
         setCurrentStep(1); 
      }
    } catch (e) { alert("Erro ao adaptar: " + e.message); } finally { setIsGeneratingScript(false); }
  };

  const adaptSceneTakeRatio = async () => {
    setIsGeneratingScript(true);
    let ratioRule = "";
    if (projectData.sceneTakeRatio === 0) ratioRule = "MUITA DIVERSIDADE DE CENAS: Desdobra a ação por muitas cenas diferentes (ex: 5 a 8), cada uma com poucos takes (ex: 1 ou 2).";
    else if (projectData.sceneTakeRatio === 2) ratioRule = "MUITA PROFUNDIDADE DE CENA: Agrupa a ação em poucas cenas (ex: 1 a 3), mas detalha-as com muitos takes (ex: 5 a 10) cada.";
    else ratioRule = "EQUILÍBRIO: Distribuição normal e equilibrada entre número de cenas e takes.";

    const query = `Atua como realizador. O utilizador alterou o rácio de Cenas/Takes. Adapta a estrutura atual para a nova regra: "${ratioRule}".
    CENAS ATUAIS: ${JSON.stringify(projectData.scenes)}
    INSTRUÇÕES:
    1. Redistribui rigorosamente os takes e ações pelas cenas de acordo com a nova regra.
    2. MATEMÁTICA RIGOROSA: A soma do campo "duration" de todas as takes geradas nas cenas DEVE SER EXATAMENTE IGUAL à soma da duração das takes originais nas cenas. NÃO apagues tempo de filme.
    3. Responde APENAS COM JSON VÁLIDO: { "scenes": [ ... ] }`;

    try {
      const text = await callGeminiAPI(query, true);
      if (text) {
         const parsed = parseAIResponse(text);
         saveToProjectHistory(projectData);
         setProjectData(prev => ({ ...prev, scenes: parsed.scenes || prev.scenes, lastGeneratedSceneTakeRatio: prev.sceneTakeRatio }));
         setCurrentStep(3); 
      }
    } catch (e) { alert("Erro ao adaptar cenas: " + e.message); } finally { setIsGeneratingScript(false); }
  };

  const handleRegenerateAllScenes = async () => {
    setIsGeneratingAllScenes(true);
    const targetDuration = parseInt(projectData.duration) || 30;
    const extraDuration = (projectData.intro?.duration || 0) + (projectData.preface?.duration || 0) + (projectData.outro?.duration || 0);
    const scenesDuration = Math.max(10, targetDuration - extraDuration);
    
    let soundRule = "";
    if (projectData.filmSoundType === 'Diálogos') soundRule = "- TIPO DE ÁUDIO: 'Diálogos'. Sem narrador.";
    else if (projectData.filmSoundType === 'Narração e Diálogos') soundRule = "- TIPO DE ÁUDIO: 'Narração e Diálogos'.";
    else if (projectData.filmSoundType === 'Narração') soundRule = "- TIPO DE ÁUDIO: 'Narração'. Personagens NO ECRÃ NÃO FALAM.";
    else if (projectData.filmSoundType === 'Mudo') soundRule = "- TIPO DE ÁUDIO: 'Mudo'. SEM DIÁLOGOS.";
    
    let ratioRule = "";
    if (projectData.sceneTakeRatio === 0) ratioRule = "MUITA DIVERSIDADE DE CENAS (Muitas cenas, poucos takes).";
    else if (projectData.sceneTakeRatio === 2) ratioRule = "MUITA PROFUNDIDADE DE CENA (Poucas cenas, muitos takes).";
    else ratioRule = "EQUILÍBRIO Normal (cenas/takes).";

    const langStr = renderText(projectData.language) || 'Português (Portugal)';
    const safeScript = projectData.script ? projectData.script.substring(0, 4000) : (projectData.storyPrompt || projectData.title);

    const query = `Atua como realizador e argumentista. Quero REGENERAR TODAS as Cenas e Takes do meu filme com base no guião.
    GUIÃO ATUAL: """${safeScript}"""
    DURAÇÃO ALVO OBRIGATÓRIA PARA AS CENAS (Soma de todos os takes): EXATAMENTE ${scenesDuration} segundos.
    REGRAS:
    1. ${soundRule}
    2. Estrutura: ${ratioRule}
    3. A SOMA TOTAL do campo "duration" de TODOS os takes de TODAS as cenas geradas TEM DE SER MATEMATICAMENTE IGUAL a ${scenesDuration} segundos.
    4. Idioma dos diálogos: ${langStr}.
    Personagens: ${JSON.stringify(projectData.characters.map(c=>({id:c.id, name:c.name})))}
    Cenários: ${JSON.stringify(projectData.settings.map(s=>({id:s.id, name:s.name})))}
    RESPONDE APENAS COM JSON VÁLIDO NESTE FORMATO: 
    { "scenes": [ { "id": "scene_nova1", "title": "...", "description": "...", "takes": [ { "id": "t_novo1", "settingId": "...", "characterIds": [...], "action": "...", "camera": "...", "dialogues": [...], "duration": X, "visualPromptEN": "..." } ] } ] }`;

    try {
        const text = await callGeminiAPI(query, true);
        if (text) {
            const parsed = parseAIResponse(text);
            if (parsed.scenes && Array.isArray(parsed.scenes)) {
                saveToProjectHistory(projectData);
                const newScenes = parsed.scenes.map((s, i) => ({ 
                    ...s, 
                    id: s.id || `scene_regen_${Date.now()}_${i}`,
                    takes: s.takes?.map((t, j) => ({ ...t, id: t.id || `take_regen_${Date.now()}_${i}_${j}` })) || []
                }));
                setProjectData(prev => ({ ...prev, scenes: newScenes }));
            }
        }
    } catch (err) { alert("Erro ao regenerar todas as cenas: " + err.message); }
    finally { setIsGeneratingAllScenes(false); }
  };

  const handleRegenerateSceneTakes = async (e, sceneId) => {
    e.stopPropagation();
    setRegeneratingSceneId(sceneId);
    const scene = projectData.scenes.find(s => s.id === sceneId);
    const currentDuration = scene.takes?.reduce((acc, t) => acc + (t.duration || 0), 0) || 10;
    const langStr = renderText(projectData.language) || 'Português (Portugal)';
    const safeScript = projectData.script ? projectData.script.substring(0, 2000) : projectData.title;

    let soundRule = "";
    if (projectData.filmSoundType === 'Diálogos') soundRule = "- TIPO DE ÁUDIO: 'Diálogos'. Sem narrador.";
    else if (projectData.filmSoundType === 'Narração e Diálogos') soundRule = "- TIPO DE ÁUDIO: 'Narração e Diálogos'.";
    else if (projectData.filmSoundType === 'Narração') soundRule = "- TIPO DE ÁUDIO: 'Narração'. Personagens NO ECRÃ NÃO FALAM.";
    else if (projectData.filmSoundType === 'Mudo') soundRule = "- TIPO DE ÁUDIO: 'Mudo'. SEM DIÁLOGOS.";
    
    const query = `Atua como realizador. Quero REGENERAR completamente os takes de UMA cena específica do meu guião.
    GUIÃO: ${safeScript}
    CENA A REGENERAR: Título: "${scene.title}" | Descrição: "${scene.description}"
    DURAÇÃO ALVO OBRIGATÓRIA PARA ESTA CENA: EXATAMENTE ${currentDuration} segundos.
    REGRAS: 
    1. Cria novos takes ("action", "camera", "dialogues", "duration", "visualPromptEN") que se encaixem nesta cena.
    2. A soma da "duration" dos novos takes TEM DE SER MATEMATICAMENTE IGUAL a ${currentDuration} segundos.
    3. Idioma dos diálogos: ${langStr}.
    4. ${soundRule}
    Personagens: ${JSON.stringify(projectData.characters.map(c=>({id:c.id, name:c.name})))}
    Cenários: ${JSON.stringify(projectData.settings.map(s=>({id:s.id, name:s.name})))}
    RESPONDE APENAS COM JSON VÁLIDO: 
    { "takes": [ { "id": "t_novo1", "settingId": "...", "characterIds": [...], "action": "...", "camera": "...", "dialogues": [...], "duration": X, "visualPromptEN": "..." } ] }`;

    try {
        const text = await callGeminiAPI(query, true);
        if (text) {
            const parsed = parseAIResponse(text);
            if (parsed.takes && Array.isArray(parsed.takes)) {
                saveToProjectHistory(projectData);
                const newTakes = parsed.takes.map((t, i) => ({ ...t, id: t.id || `take_regen_single_${Date.now()}_${i}` }));
                setProjectData(prev => ({
                    ...prev,
                    scenes: prev.scenes.map(s => s.id === sceneId ? { ...s, takes: newTakes } : s)
                }));
            }
        }
    } catch (err) { alert("Erro ao regenerar takes da cena: " + err.message); }
    finally { setRegeneratingSceneId(null); }
  };

  const formatScriptText = (text) => {
    if (!text) return '';
    if (typeof text !== 'string') return JSON.stringify(text, null, 2);
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const trimmed = line.trim().toUpperCase();
      if (trimmed.startsWith('ATO I') || trimmed.startsWith('ATO II') || trimmed.startsWith('ATO III')) {
        return <div key={index} className="text-center font-bold text-lg mt-8 mb-4 border-b border-[#e5ddc5] pb-2 text-indigo-900 tracking-widest">{line}</div>;
      }
      if (trimmed === '') return <div key={index} className="h-4"></div>;
      return <p key={index} className="mb-3 text-justify leading-relaxed">{line}</p>;
    });
  };

  const renderDetails = () => (
    <div className="space-y-6 animate-fade-in flex flex-col h-full">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-3"><FileText className="text-blue-400" size={24} /> 1. Configuração do Projeto</h2>
        <button onClick={() => setProjectData(defaultProjectData)} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition-colors uppercase tracking-wider">
          Repor Configuração
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2 mb-4"><Film size={14} /> Identificação Base</h3>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Título do Filme</label>
            <input type="text" value={renderText(projectData.title)} onChange={(e) => handleProjectDataChange('title', e.target.value)} className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-sm text-white focus:border-blue-500 outline-none transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Realizador</label>
              <input type="text" value={renderText(projectData.director)} onChange={(e) => handleProjectDataChange('director', e.target.value)} className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-sm text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Argumentista</label>
              <input type="text" value={renderText(projectData.writer)} onChange={(e) => handleProjectDataChange('writer', e.target.value)} className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-sm text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-blue-400 flex items-center gap-1.5"><Globe size={14} /> Língua / Nacionalidade</label>
            <select value={renderText(projectData.language)} onChange={(e) => handleProjectDataChange('language', e.target.value)} className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-sm text-white focus:border-blue-500 outline-none transition-colors">
              <option value="Português (Portugal)">Português (Portugal)</option>
              <option value="Português (Brasil)">Português (Brasil)</option>
              <option value="Inglês (EUA)">Inglês (EUA)</option>
              <option value="Inglês (Reino Unido)">Inglês (Reino Unido)</option>
              <option value="Espanhol">Espanhol</option>
              <option value="Francês">Francês</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Ideia Central (Logline) ou Rascunho</label>
            <textarea value={renderText(projectData.storyPrompt)} onChange={(e) => handleProjectDataChange('storyPrompt', e.target.value)} className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-blue-500 outline-none min-h-[100px] resize-none transition-colors" placeholder="Ex: Um grupo de astronautas descobre uma anomalia em marte..." />
            
            <div className="relative mt-2 flex flex-col gap-2">
               <div className={`flex items-center gap-3 bg-slate-900 border ${projectData.storyFileName ? 'border-emerald-500/50' : 'border-slate-700 border-dashed'} rounded-lg p-3 hover:bg-slate-800 transition-colors relative`}>
                  {!projectData.storyFileName && (
                     <input type="file" accept=".txt,.json" onChange={(e) => {
                         const file = e.target.files[0];
                         if (!file) return;
                         if (file.type.includes("text") || file.name.endsWith('.txt') || file.name.endsWith('.json')) {
                             const reader = new FileReader();
                             reader.onload = (event) => {
                                 let text = event.target.result;
                                 if (text.length > 25000) { alert("Texto muito longo, será truncado."); text = text.substring(0, 25000); }
                                 handleProjectDataChange('storyFileContent', text);
                                 handleProjectDataChange('storyFileName', file.name);
                             }; reader.readAsText(file);
                         } else { alert("Apenas formato TXT suportado."); }
                         e.target.value = null;
                     }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Clica para enviar ficheiro" />
                  )}
                  <div className={`p-2 rounded-lg ${projectData.storyFileName ? 'bg-emerald-600/20 text-emerald-400' : 'bg-blue-600/20 text-blue-400'}`}>
                    {projectData.storyFileName ? <Check size={16} /> : <FolderOpen size={16} />}
                  </div>
                  <div className="flex-1">
                     <p className="text-sm font-bold text-slate-300">{projectData.storyFileName || "Anexar Documento (.txt)"}</p>
                  </div>
                  {projectData.storyFileName && (
                     <button type="button" onClick={() => { handleProjectDataChange('storyFileContent', ''); handleProjectDataChange('storyFileName', ''); }} className="p-2 text-slate-400 hover:text-red-400 z-30 relative transition-colors"><X size={16}/></button>
                  )}
               </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Conceito (Pitch / Temas)</label>
            <input type="text" value={renderText(projectData.concept)} onChange={(e) => handleProjectDataChange('concept', e.target.value)} className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-sm text-white focus:border-blue-500 outline-none transition-colors" />
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-4"><Settings2 size={14} /> Especificações Técnicas</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Tipo de Filme</label>
              <select value={renderText(projectData.filmType)} onChange={(e) => handleProjectDataChange('filmType', e.target.value)} className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-sm text-white focus:border-emerald-500 outline-none transition-colors">
                {filmTypes.map(ft => <option key={ft} value={ft}>{ft}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Estilo Visual (Género)</label>
              <select value={renderText(projectData.filmGenre)} onChange={(e) => handleProjectDataChange('filmGenre', e.target.value)} className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-sm text-white focus:border-emerald-500 outline-none custom-scrollbar transition-colors">
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Estilo Artístico (Filtro IA)</label>
              <select value={renderText(projectData.artStyle)} onChange={(e) => handleProjectDataChange('artStyle', e.target.value)} className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-sm text-white focus:border-emerald-500 outline-none transition-colors">
                {artStyles.map(as => <option key={as} value={as}>{as}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Tipo de Áudio (Som)</label>
              <select value={renderText(projectData.filmSoundType)} onChange={(e) => handleProjectDataChange('filmSoundType', e.target.value)} className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-sm text-white focus:border-emerald-500 outline-none transition-colors">
                {filmSoundTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800">
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-xs font-semibold text-blue-400 flex items-center gap-1.5"><Clock size={14}/> Duração Estimada do Filme</label>
              <div className="flex items-center gap-3 bg-slate-950 border border-slate-700 p-2.5 rounded-lg">
                <input type="range" min="10" max="1800" step="5" value={parseInt(projectData.duration) || 30} onChange={(e) => handleProjectDataChange('duration', parseInt(e.target.value))} className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                <div className="flex items-center gap-1">
                  <input type="number" min="0" max="60" value={Math.floor((parseInt(projectData.duration) || 30) / 60)} onChange={(e) => { const mins = parseInt(e.target.value) || 0; const secs = (parseInt(projectData.duration) || 30) % 60; handleProjectDataChange('duration', (mins * 60) + secs); }} className="w-12 bg-slate-900 border border-slate-600 text-white text-xs text-center rounded p-1 outline-none font-mono" />
                  <span className="text-xs text-slate-400 font-bold mr-1">m</span>
                  <input type="number" min="0" max="59" value={(parseInt(projectData.duration) || 30) % 60} onChange={(e) => { const mins = Math.floor((parseInt(projectData.duration) || 30) / 60); const secs = parseInt(e.target.value) || 0; handleProjectDataChange('duration', (mins * 60) + secs); }} className="w-12 bg-slate-900 border border-slate-600 text-white text-xs text-center rounded p-1 outline-none font-mono" />
                  <span className="text-xs text-slate-400 font-bold">s</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-xs font-semibold text-slate-400">Formato (Aspect Ratio)</label>
              <select value={renderText(projectData.aspectRatio)} onChange={(e) => handleProjectDataChange('aspectRatio', e.target.value)} className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-sm text-white font-mono focus:border-emerald-500 outline-none transition-colors">
                <option value="16:9">16:9 (Paisagem)</option>
                <option value="9:16">9:16 (Vertical)</option>
                <option value="1:1">1:1 (Quadrado)</option>
                <option value="21:9">21:9 (Cinemático)</option>
                <option value="4:3">4:3 (Clássico)</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5 col-span-2 mt-2">
              <label className="text-xs font-semibold text-purple-400 flex items-center gap-1.5"><Video size={14}/> Rácio Cenas / Takes</label>
              <div className="bg-slate-950 border border-slate-700 p-4 rounded-lg flex flex-col gap-3">
                <input type="range" min="0" max="2" step="1" value={projectData.sceneTakeRatio !== undefined ? projectData.sceneTakeRatio : 1} onChange={(e) => handleProjectDataChange('sceneTakeRatio', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase px-1">
                    <span className={`w-1/3 text-left ${projectData.sceneTakeRatio === 0 ? "text-purple-400" : ""}`}>Baixo<br/><span className="text-[8px] font-normal normal-case opacity-75">(Mais Cenas, Menos Takes)</span></span>
                    <span className={`w-1/3 text-center ${projectData.sceneTakeRatio === 1 ? "text-purple-400" : ""}`}>Normal<br/><span className="text-[8px] font-normal normal-case opacity-75">(Equilibrado)</span></span>
                    <span className={`w-1/3 text-right ${projectData.sceneTakeRatio === 2 ? "text-purple-400" : ""}`}>Alto<br/><span className="text-[8px] font-normal normal-case opacity-75">(Menos Cenas, Mais Takes)</span></span>
                </div>
              </div>
            </div>
          </div>

          {projectData.script && projectData.lastGeneratedSoundType && projectData.filmSoundType !== projectData.lastGeneratedSoundType && (
             <div className="mt-4 p-4 bg-amber-900/30 border border-amber-500/50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-lg">
                <div className="flex items-center gap-3 text-amber-300">
                   <AlertCircle size={24} className="flex-shrink-0" />
                   <p className="text-sm font-medium">Atenção: O Tipo de Som do projeto foi modificado. Pretende adaptar o guião e as cenas/takes à nova configuração ({projectData.filmSoundType})?</p>
                </div>
                <button onClick={adaptScriptToSoundType} disabled={isGeneratingScript} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-sm flex items-center gap-2 transition-colors">
                   {isGeneratingScript ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>} {isGeneratingScript ? 'A Adaptar...' : 'Adaptar Guião'}
                </button>
             </div>
          )}

          {projectData.scenes?.length > 0 && projectData.lastGeneratedSceneTakeRatio !== undefined && projectData.sceneTakeRatio !== projectData.lastGeneratedSceneTakeRatio && (
             <div className="mt-4 p-4 bg-purple-900/30 border border-purple-500/50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-lg">
                <div className="flex items-center gap-3 text-purple-300">
                   <AlertCircle size={24} className="flex-shrink-0" />
                   <p className="text-sm font-medium">Atenção: O rácio de Cenas/Takes foi modificado. Pretende reformular a estrutura das cenas do projeto de acordo com a nova configuração?</p>
                </div>
                <button onClick={adaptSceneTakeRatio} disabled={isGeneratingScript} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-sm flex items-center gap-2 transition-colors">
                   {isGeneratingScript ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>} {isGeneratingScript ? 'A Reformular...' : 'Reformular Cenas'}
                </button>
             </div>
          )}

        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-violet-800/40 space-y-5 lg:col-span-2">
          <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Settings2 size={14} /> Inteligência Artificial</h3>
          <p className="text-xs text-slate-500 mb-4">Seleciona o provider ativo com o check. As chaves ficam guardadas localmente no browser.</p>

          {/* ── Groq ── */}
          {(() => {
            const isActive = activeProvider === 'groq';
            const stColor = groqStatus === 'online' ? 'bg-emerald-400' : groqStatus === 'offline' ? 'bg-red-400' : groqStatus === 'checking' ? 'bg-amber-400 animate-pulse' : groqStatus === 'no-key' ? 'bg-orange-400' : 'bg-slate-500';
            const stText = groqStatus === 'online' ? 'Online' : groqStatus === 'offline' ? 'Offline' : groqStatus === 'checking' ? 'A verificar...' : groqStatus === 'no-key' ? 'Sem API Key' : 'Desconhecido';
            const stTextColor = groqStatus === 'online' ? 'text-emerald-400' : groqStatus === 'offline' ? 'text-red-400' : groqStatus === 'checking' ? 'text-amber-400' : groqStatus === 'no-key' ? 'text-orange-400' : 'text-slate-500';
            return (
              <div className={`rounded-xl border p-4 transition-colors ${isActive ? 'border-violet-500/60 bg-violet-950/20' : 'border-slate-700 bg-slate-950/30'}`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-3 cursor-pointer" onClick={() => handleActiveProviderChange('groq')}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'border-violet-400 bg-violet-400' : 'border-slate-500 bg-transparent'}`}>
                      {isActive && <div className="w-2 h-2 rounded-full bg-white"/>}
                    </div>
                    <span className={`text-sm font-bold ${isActive ? 'text-violet-300' : 'text-slate-400'}`}>Groq</span>
                    {isActive && <span className="text-[10px] bg-violet-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Ativo</span>}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${stColor}`} />
                    <span className={`text-xs font-bold ${stTextColor}`}>{stText}</span>
                    <button onClick={checkGroqStatus} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors flex items-center gap-1">
                      <RefreshCw size={11}/> Verificar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">API Key</label>
                    <input type="password" value={groqApiKey} onChange={e => handleGroqKeyChange(e.target.value)} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-white font-mono focus:border-violet-500 outline-none transition-colors" placeholder="gsk_••••••••••••••••••••" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Modelo</label>
                    <select value={groqModel} onChange={e => handleGroqModelChange(e.target.value)} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-white font-mono focus:border-violet-500 outline-none transition-colors">
                      <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recomendado)</option>
                      <option value="llama-3.1-70b-versatile">llama-3.1-70b-versatile</option>
                      <option value="llama3-70b-8192">llama3-70b-8192</option>
                      <option value="mixtral-8x7b-32768">mixtral-8x7b-32768 (Contexto longo)</option>
                      <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Mais rápido)</option>
                      <option value="gemma2-9b-it">gemma2-9b-it</option>
                    </select>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 mt-2">console.groq.com · Plano gratuito: 14.400 pedidos/dia</p>
              </div>
            );
          })()}

          {/* ── Google Gemini ── */}
          {(() => {
            const isActive = activeProvider === 'google';
            const stColor = googleStatus === 'online' ? 'bg-emerald-400' : googleStatus === 'offline' ? 'bg-red-400' : googleStatus === 'checking' ? 'bg-amber-400 animate-pulse' : googleStatus === 'no-key' ? 'bg-orange-400' : 'bg-slate-500';
            const stText = googleStatus === 'online' ? 'Online' : googleStatus === 'offline' ? 'Offline' : googleStatus === 'checking' ? 'A verificar...' : googleStatus === 'no-key' ? 'Sem API Key' : 'Desconhecido';
            const stTextColor = googleStatus === 'online' ? 'text-emerald-400' : googleStatus === 'offline' ? 'text-red-400' : googleStatus === 'checking' ? 'text-amber-400' : googleStatus === 'no-key' ? 'text-orange-400' : 'text-slate-500';
            return (
              <div className={`rounded-xl border p-4 transition-colors ${isActive ? 'border-blue-500/60 bg-blue-950/20' : 'border-slate-700 bg-slate-950/30'}`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-3 cursor-pointer" onClick={() => handleActiveProviderChange('google')}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'border-blue-400 bg-blue-400' : 'border-slate-500 bg-transparent'}`}>
                      {isActive && <div className="w-2 h-2 rounded-full bg-white"/>}
                    </div>
                    <span className={`text-sm font-bold ${isActive ? 'text-blue-300' : 'text-slate-400'}`}>Google Gemini (AI Studio)</span>
                    {isActive && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Ativo</span>}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${stColor}`} />
                    <span className={`text-xs font-bold ${stTextColor}`}>{stText}</span>
                    <button onClick={checkGoogleStatus} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors flex items-center gap-1">
                      <RefreshCw size={11}/> Verificar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">API Key</label>
                    <input type="password" value={googleApiKey} onChange={e => handleGoogleKeyChange(e.target.value)} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-white font-mono focus:border-blue-500 outline-none transition-colors" placeholder="AIza••••••••••••••••••••" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Modelo</label>
                    <input
                      type="text"
                      value={googleModel}
                      onChange={e => handleGoogleModelChange(e.target.value)}
                      list="google-models-list"
                      className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-white font-mono focus:border-blue-500 outline-none transition-colors"
                      placeholder="gemini-1.5-flash"
                    />
                    <datalist id="google-models-list">
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Recomendado — mais estável)</option>
                      <option value="gemini-1.5-flash-8b">gemini-1.5-flash-8b (Rápido e leve)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (Mais capaz)</option>
                      <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                      <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</option>
                      <option value="gemini-2.5-flash-preview-05-20">gemini-2.5-flash-preview-05-20</option>
                    </datalist>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 mt-2">aistudio.google.com · Plano gratuito disponível</p>
              </div>
            );
          })()}

          {/* ── Claude ── */}
          {(() => {
            const isActive = activeProvider === 'claude';
            const stColor = claudeStatus === 'online' ? 'bg-emerald-400' : claudeStatus === 'offline' ? 'bg-red-400' : claudeStatus === 'checking' ? 'bg-amber-400 animate-pulse' : claudeStatus === 'no-key' ? 'bg-orange-400' : 'bg-slate-500';
            const stText = claudeStatus === 'online' ? 'Online' : claudeStatus === 'offline' ? 'Offline' : claudeStatus === 'checking' ? 'A verificar...' : claudeStatus === 'no-key' ? 'Sem API Key' : 'Desconhecido';
            const stTextColor = claudeStatus === 'online' ? 'text-emerald-400' : claudeStatus === 'offline' ? 'text-red-400' : claudeStatus === 'checking' ? 'text-amber-400' : claudeStatus === 'no-key' ? 'text-orange-400' : 'text-slate-500';
            return (
              <div className={`rounded-xl border p-4 transition-colors ${isActive ? 'border-amber-500/60 bg-amber-950/20' : 'border-slate-700 bg-slate-950/30'}`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-3 cursor-pointer" onClick={() => handleActiveProviderChange('claude')}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'border-amber-400 bg-amber-400' : 'border-slate-500 bg-transparent'}`}>
                      {isActive && <div className="w-2 h-2 rounded-full bg-white"/>}
                    </div>
                    <span className={`text-sm font-bold ${isActive ? 'text-amber-300' : 'text-slate-400'}`}>Claude (Anthropic)</span>
                    {isActive && <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Ativo</span>}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${stColor}`} />
                    <span className={`text-xs font-bold ${stTextColor}`}>{stText}</span>
                    <button onClick={checkClaudeStatus} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors flex items-center gap-1">
                      <RefreshCw size={11}/> Verificar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">API Key</label>
                    <input type="password" value={claudeApiKey} onChange={e => handleClaudeKeyChange(e.target.value)} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-white font-mono focus:border-amber-500 outline-none transition-colors" placeholder="sk-ant-••••••••••••••••••" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Modelo <span className="text-slate-600">(ou escreve manualmente)</span></label>
                    <input
                      type="text"
                      value={claudeModel}
                      onChange={e => handleClaudeModelChange(e.target.value)}
                      list="claude-models-list"
                      className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-white font-mono focus:border-amber-500 outline-none transition-colors"
                      placeholder="claude-3-5-sonnet-20241022"
                    />
                    <datalist id="claude-models-list">
                      <option value="claude-haiku-4-5">claude-haiku-4-5 (Rápido — Geração atual)</option>
                      <option value="claude-sonnet-4-5">claude-sonnet-4-5 (Balanceado — Geração atual)</option>
                      <option value="claude-opus-4-5">claude-opus-4-5 (Poderoso — Geração atual)</option>
                      <option value="claude-opus-4-8">claude-opus-4-8 (Mais recente)</option>
                      <option value="claude-3-5-haiku-20241022">claude-3-5-haiku-20241022</option>
                      <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet-20241022</option>
                      <option value="claude-3-opus-20240229">claude-3-opus-20240229</option>
                    </datalist>
                  </div>
                </div>
                <div className="mt-2 p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-[10px] text-amber-300/70 space-y-1">
                  <p><strong className="text-amber-300">⚠ Modelo 404?</strong> O nome do modelo mudou. Vai a <span className="text-amber-200 cursor-pointer" onClick={() => window.open('https://console.anthropic.com/settings/limits','_blank')}>console.anthropic.com → Settings → Limits</span> para ver os modelos disponíveis na tua conta e copia o nome exato aqui.</p>
                  <p>Tenta: <span className="font-mono text-amber-200 cursor-pointer select-all" onClick={e => { handleClaudeModelChange('claude-haiku-4-5'); e.target.closest('p').classList.add('opacity-50'); }}>claude-haiku-4-5</span> · <span className="font-mono text-amber-200 cursor-pointer select-all" onClick={e => { handleClaudeModelChange('claude-sonnet-4-5'); e.target.closest('p').classList.add('opacity-50'); }}>claude-sonnet-4-5</span></p>
                </div>
              </div>
            );
          })()}

          {/* ── Manual (Copiar/Colar) ── */}
          {(() => {
            const isActive = activeProvider === 'manual';
            return (
              <div className={`rounded-xl border p-4 transition-colors ${isActive ? 'border-cyan-500/60 bg-cyan-950/20' : 'border-slate-700 bg-slate-950/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-3 cursor-pointer" onClick={() => handleActiveProviderChange('manual')}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'border-cyan-400 bg-cyan-400' : 'border-slate-500 bg-transparent'}`}>
                      {isActive && <div className="w-2 h-2 rounded-full bg-white"/>}
                    </div>
                    <span className={`text-sm font-bold ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>Manual <span className="text-xs font-normal">(Copiar Prompt / Colar Resposta)</span></span>
                    {isActive && <span className="text-[10px] bg-cyan-700 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Ativo</span>}
                  </label>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Sem API. Ao clicar em qualquer geração, o prompt abre num dialog — copia, vai ao <strong className="text-slate-400">gemini.google.com</strong> (ou ChatGPT, Claude.ai, etc.), gera lá, copia a resposta e cola de volta. Ideal para usar o Gemini web sem custos.</p>
              </div>
            );
          })()}

          {/* ── Ollama ── */}
          {(() => {
            const isActive = activeProvider === 'ollama';
            const stColor = ollamaStatus === 'online' ? 'bg-emerald-400' : ollamaStatus === 'offline' ? 'bg-red-400' : ollamaStatus === 'checking' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500';
            const stText = ollamaStatus === 'online' ? 'Online' : ollamaStatus === 'offline' ? 'Offline / Não iniciado' : ollamaStatus === 'checking' ? 'A verificar...' : 'Desconhecido';
            const stTextColor = ollamaStatus === 'online' ? 'text-emerald-400' : ollamaStatus === 'offline' ? 'text-red-400' : ollamaStatus === 'checking' ? 'text-amber-400' : 'text-slate-500';
            return (
              <div className={`rounded-xl border p-4 transition-colors ${isActive ? 'border-emerald-500/60 bg-emerald-950/20' : 'border-slate-700 bg-slate-950/30'}`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-3 cursor-pointer" onClick={() => handleActiveProviderChange('ollama')}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'border-emerald-400 bg-emerald-400' : 'border-slate-500 bg-transparent'}`}>
                      {isActive && <div className="w-2 h-2 rounded-full bg-white"/>}
                    </div>
                    <span className={`text-sm font-bold ${isActive ? 'text-emerald-300' : 'text-slate-400'}`}>Ollama <span className="text-xs font-normal">(Local · sem internet)</span></span>
                    {isActive && <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Ativo · Default</span>}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${stColor}`} />
                    <span className={`text-xs font-bold ${stTextColor}`}>{stText}</span>
                    <button onClick={checkOllamaStatus} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors flex items-center gap-1">
                      <RefreshCw size={11}/> Verificar
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">Modelo instalado</label>
                  {ollamaModels.length > 0 ? (
                    <select value={ollamaModel} onChange={e => handleOllamaModelChange(e.target.value)} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-white font-mono focus:border-emerald-500 outline-none transition-colors">
                      {ollamaModels.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={ollamaModel} onChange={e => handleOllamaModelChange(e.target.value)} className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-sm text-white font-mono focus:border-emerald-500 outline-none transition-colors" placeholder="llama3.2" />
                  )}
                </div>
                <div className="mt-2 p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-[10px] text-emerald-300/70 space-y-1">
                  <p><strong className="text-emerald-300">Provider por defeito</strong> — usado automaticamente quando nenhuma API key está configurada.</p>
                  <p>Carrega modelos em <span className="text-emerald-200">ollama.ai</span> · Clica em Verificar para detetar modelos instalados.</p>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-5 lg:col-span-2">
           <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-4"><Download size={14} /> Importar & Reaproveitar Elementos</h3>
           <p className="text-sm text-slate-400">Importa um ficheiro de um projeto anterior para reutilizar as mesmas personagens ou cenários nesta nova história.</p>
           <div className="relative inline-block">
               <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors relative">
                   <FolderOpen size={16}/> Escolher Ficheiro de Projeto
                   <input type="file" accept=".json" onChange={handleImportAssetsUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Importar JSON" />
               </button>
           </div>
           {(projectData.characters.length > 0 || projectData.settings.length > 0) && (
               <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-800">
                   <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Elementos atualmente em uso:</span>
                   <div className="flex flex-wrap gap-2">
                       {projectData.characters.map(c => <span key={c.id} className="bg-emerald-900/30 border border-emerald-500/50 text-emerald-400 px-3 py-1 text-xs rounded-full">{c.name}</span>)}
                       {projectData.settings.map(s => <span key={s.id} className="bg-amber-900/30 border border-amber-500/50 text-amber-400 px-3 py-1 text-xs rounded-full">{s.name}</span>)}
                   </div>
               </div>
           )}
        </div>
      </div>
      
      <div className="flex justify-end pt-4 border-t border-slate-800">
        <button onClick={() => setCurrentStep(1)} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-900/50 transition-colors">
           Avançar para História e Guião <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  const handleScriptTxtUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      if (text && text.trim()) {
        saveToProjectHistory(projectData);
        setProjectData(prev => ({ ...prev, script: text.trim() }));
        setScriptUploadedFromFile(true);
        setScriptError(null);
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  // ── Pacotes de Geração IA Externa ──────────────────────────────────────────

  const buildPackagePrompt = (type) => {
    const title = renderText(projectData.title) || 'Sem título';
    const filmType = renderText(projectData.filmType) || 'Animação 3D';
    const genre = renderText(projectData.filmGenre) || 'Drama';
    const artStyle = renderText(projectData.artStyle) || 'Pixar/Disney';
    const lang = renderText(projectData.language) || 'Português (Portugal)';
    const logline = projectData.storyPrompt || projectData.idea || '';
    const script = projectData.script ? projectData.script.substring(0, 4000) : '';
    const chars = (projectData.characters || []).map(c => `${renderText(c.name)}: ${renderText(c.description||'').substring(0,120)}`).join(' | ');
    const settings = (projectData.settings || []).map(s => renderText(s.name)).join(', ');
    const scenesSummary = (projectData.scenes || []).map((sc,i) =>
      `Cena ${i+1}: ${renderText(sc.description||sc.title||'')} — ${(sc.takes||[]).map(t=>renderText(t.action||'')).join('. ')}`
    ).join('\n');

    if (type === 'full-script') {
      return `Atua como realizador, argumentista e diretor de arte. Cria TUDO o que é necessário para produzir o filme "${title}" (${filmType}, estilo ${artStyle}, género: ${genre}, língua: ${lang}).

LOGLINE / HISTÓRIA: ${logline}

Gera em PORTUGUÊS DE PORTUGAL (PT-PT) EXCLUSIVAMENTE. Prompts de imagem/vídeo SEMPRE em inglês (EN).

SCHEMA JSON OBRIGATÓRIO (devolve APENAS este JSON, sem texto extra):
{
  "script": "Guião completo dividido em Ato I - Exposição, Ato II - Confronto, Ato III - Resolução. Formatado com parágrafos descritivos. Mínimo 600 palavras.",
  "characters": [
    { "id": "char_1", "name": "Nome PT", "description": "Detailed visual description EN for 3D animation generation, physical appearance, clothing, expression", "physical": { "height": "170", "build": "Normal" }, "voicePrompt": "Descrição da voz PT: tom, velocidade, sotaque, emoção típica" }
  ],
  "settings": [
    { "id": "set_1", "name": "Nome do Local PT", "description": "Detailed visual description EN for 3D scene generation, lighting, atmosphere, key elements" }
  ],
  "scenes": [
    { "id": "scene_1", "description": "Descrição breve da cena PT",
      "takes": [
        { "id": "take_1_1", "settingId": "set_1", "action": "Descrição detalhada da ação PT", "narration": "Narração em voz-off PT (pode ser vazio)", "duration": 5, "visualPromptEN": "Cinematic shot of [CHARACTER NAME] in [SETTING NAME], action description, ${filmType} style, ${artStyle}, 16:9 aspect ratio" }
      ]
    }
  ],
  "finalMessages": [
    { "id": "fm_1", "userInput": "Texto sobreposto na imagem PT", "action": "Descrição da ação PT", "camera": "Camera angle EN", "duration": 5, "visualPromptEN": "Cinematic background scene EN for text overlay, ${filmType} style, ${artStyle}" }
  ]
}

REGRAS CRÍTICAS:
- Nos campos visualPromptEN usa SEMPRE o NOME da personagem/cenário, NUNCA descrições físicas
- Personagens (usa estes nomes nos prompts): cria entre 3 a 5 personagens relevantes
- Cenários: cria entre 3 a 6 cenários/locais
- Cenas: mínimo 6 cenas, cada uma com 2 a 4 takes
- Mensagens Finais: 2 a 3 mensagens de impacto/moral
- Cada take máximo 5-8 segundos de duração`;

    } else if (type === 'social') {
      return `Atua como diretor de marketing digital. Cria TODO o material promocional para lançamento online do filme "${title}" (${filmType}).

CONTEXTO:
Logline: ${logline}
Personagens: ${chars}
Cenários: ${settings}
Guião (resumo): ${scenesSummary.substring(0,1500)}

REGRAS:
- PROIBIDO cinemas, bilhetes, salas. Exclusivamente online (YouTube/Instagram).
- promptEN sempre em inglês. Diálogos em ${lang}.
- Nos campos promptEN usa SEMPRE o NOME da personagem/cenário, NUNCA descrições físicas.
- Vídeos: MAX 10 segundos (≈15-20 palavras). Se mais, divide em Parte 1 e Parte 2.

SCHEMA JSON (devolve APENAS este JSON):
{
  "characterPosters": [{ "characterName": "Nome ou Todas as Personagens", "teaserPT": "Frase impactante PT", "promptEN": "Cinematic 9:16 portrait of [NAME], [SETTING], 3D animation, The K-Brothers logo bottom right" }],
  "behindTheScenes": [{ "characterName": "", "context": "Descrição PT do momento de bastidores", "promptEN": "Behind the scenes image 9:16 of [NAME], studio setting, photorealistic" }],
  "behindTheScenesVideo": [{ "characterName": "", "camera": "Close-up / Medium shot / etc", "action": "Descrição da ação PT", "emotion": "Emoção", "dialogue": "Apelo a seguir nas redes. MAX 10s/20 palavras PT" }],
  "makingOff": [{ "characterName": "", "camera": "", "action": "PT", "emotion": "", "dialogue": "MAX 10s/20 palavras PT" }],
  "whoAmI": [{ "characterName": "", "camera": "", "action": "PT", "emotion": "", "dialogue": "Apresentação em 1ª pessoa. MAX 10s/20 palavras PT" }],
  "talkToMe": [{ "characterName": "", "camera": "", "action": "PT", "emotion": "", "dialogue": "Apelo pós-estreia a ver no YouTube. MAX 10s/20 palavras PT" }],
  "launchImage": [{ "characterName": "", "teaserPT": "Estreia hoje!", "promptEN": "Launch image 9:16 of [NAME], premiere atmosphere, The K-Brothers logo" }],
  "launchVideo": [{ "characterName": "", "camera": "", "action": "PT", "emotion": "", "dialogue": "Anuncia estreia online. MAX 10s/20 palavras PT" }]
}
Inclui 2 a 3 entradas por personagem em cada bloco. Inclui entrada "Todas as Personagens" nos blocos de imagem.`;

    } else if (type === 'social-plan') {
      const soc = projectData.socialMedia;
      const assets = soc ? [
        ...(soc.characterPosters||[]).map((a,i)=>({id:a.id,type:'IMAGEM:Póster',character:a.characterName})),
        ...(soc.behindTheScenes||[]).map((a,i)=>({id:a.id,type:'IMAGEM:BTS',character:a.characterName})),
        ...(soc.behindTheScenesVideo||[]).map((a,i)=>({id:a.id,type:'VÍDEO:BTS',character:a.characterName})),
        ...(soc.makingOff||[]).map((a,i)=>({id:a.id,type:'VÍDEO:MakingOff',character:a.characterName})),
        ...(soc.whoAmI||[]).map((a,i)=>({id:a.id,type:'VÍDEO:WhoAmI',character:a.characterName})),
        ...(soc.talkToMe||[]).map((a,i)=>({id:a.id,type:'VÍDEO:TalkToMe',character:a.characterName})),
        ...(soc.launchImage||[]).map((a,i)=>({id:a.id,type:'IMAGEM:Launch',character:a.characterName})),
        ...(soc.launchVideo||[]).map((a,i)=>({id:a.id,type:'VÍDEO:Launch',character:a.characterName})),
      ] : [];
      const totalDays = projectData.socialPlanDays || 14;
      const premiereDay = Math.floor(totalDays/2)+1;
      return `Atua como diretor de marketing digital. Cria plano de redes sociais de ${totalDays} dias para o filme "${title}".

FICHEIROS DISPONÍVEIS: ${JSON.stringify(assets)}
DIA DE ESTREIA: Dia ${premiereDay} de ${totalDays}

REGRAS:
- Usa TODOS os ids. 2 a 4 publicações/dia a horas diferentes.
- Formatos: REEL, STORY, POST. STORY sempre às 07:00 com caption vazio.
- REEL: exatamente 1 vídeo. POST: só imagens.
- Pré-Estreia (dias 1-${premiereDay-1}): Póster, BTS, MakingOff, WhoAmI.
- Estreia (dia ${premiereDay}): Lançamento + post principal às 20:00 com assetIds:[].
- Pós-Estreia (dias ${premiereDay+1}-${totalDays}): TalkToMe, apelar a ver no YouTube.
- Hashtags: 3 a 5 por legenda (exceto STORY).
- Legendas ÚNICAS e específicas ao filme, referenciando cenas/personagens.

JSON (devolve APENAS):
{ "plan": [{ "dayNumber": 1, "phase": "Pré-Estreia", "time": "14:00", "format": "POST", "content": "Título chamativo do post", "caption": "Legenda única e específica #hashtag", "strategy": "Hype", "assetIds": ["id_aqui"] }] }`;

    } else if (type === 'soundtrack') {
      return `Atua como compositor de bandas sonoras para cinema. Cria a banda sonora ideal para o filme "${title}" (${filmType}, ${genre}).

CONTEXTO:
Logline: ${logline}
${script ? `Guião (excerto): ${script.substring(0,1500)}` : ''}

Devolve APENAS este JSON:
{
  "musicDesc": "Descrição da música ideal em PT-PT: estilo, instrumentos, tempo, atmosfera, como complementa a narrativa",
  "musicPrompt": "Detailed music generation prompt in English: genre, instruments, tempo BPM, mood, key, style references, for AI music generation tools like Suno or Udio"
}`;
    }
    return '';
  };

  const handleManualPackageImport = (type, parsed) => {
    // Garante que um valor é sempre um array
    const toArr = (v) => Array.isArray(v) ? v : (v && typeof v === 'object' && !Array.isArray(v) ? Object.values(v) : []);

    // Transforma um take do Gemini (pode ter schema diferente) para o schema da app
    const transformTake = (t, si, ti, ts) => {
      // Extrai narração: do campo narration, ou dos dialogues, ou vazio
      let narration = t.narration || '';
      if (!narration && t.dialogues && t.dialogues.length > 0) {
        narration = t.dialogues.map(d => `${d.characterName || ''}: "${d.text || ''}"`).join(' / ');
      }
      // Extrai prompt visual: do campo visualPromptEN, ou constrói a partir da ação+câmara
      const visualPromptEN = t.visualPromptEN ||
        (t.action ? `Cinematic ${t.camera || 'medium shot'} of ${t.action}` : '');
      return {
        id: t.id || `take_pkg_${ts}_${si}_${ti}`,
        settingId: t.settingId || '',
        action: t.action || '',
        narration,
        duration: typeof t.duration === 'number' ? t.duration : 5,
        visualPromptEN,
        hasSubtitle: t.hasSubtitle !== false,
        // Preserva campos extras do Gemini para não perder info
        camera: t.camera,
        sound: t.sound,
        dialogues: t.dialogues,
        characterIds: t.characterIds
      };
    };

    saveToProjectHistory(projectData);
    if (type === 'full-script') {
      try {
        const ts = Date.now();
        const newData = {};
        if (parsed.script) newData.script = typeof parsed.script === 'string' ? parsed.script : JSON.stringify(parsed.script);
        // Poster prompt extra (se o Gemini devolver)
        if (parsed.posterPrompt) newData.posterPrompt = parsed.posterPrompt;
        const chars = toArr(parsed.characters);
        if (chars.length) newData.characters = chars.map((c,i)=>({ id: c.id||`char_pkg_${ts}_${i}`, name: c.name||'', description: c.description||'', physical: c.physical||{height:'170',build:'Normal'}, voicePrompt: c.voicePrompt||'' }));
        const sets = toArr(parsed.settings);
        if (sets.length) newData.settings = sets.map((s,i)=>({ id: s.id||`set_pkg_${ts}_${i}`, name: s.name||'', description: s.description||'' }));
        const scenes = toArr(parsed.scenes);
        if (scenes.length) {
          newData.scenes = scenes.map((sc,si)=>({
            id: sc.id||`scene_pkg_${ts}_${si}`,
            title: sc.title || sc.description || `Cena ${si+1}`,
            description: sc.description || sc.title || '',
            takes: toArr(sc.takes).map((t,ti) => transformTake(t, si, ti, ts))
          }));
        }
        const fms = toArr(parsed.finalMessages);
        if (fms.length) newData.finalMessages = fms.map((fm,i)=>({
          id: fm.id||`fm_pkg_${ts}_${i}`,
          userInput: fm.userInput || fm.action || '',
          action: fm.action || '',
          camera: fm.camera || 'Static',
          duration: typeof fm.duration === 'number' ? fm.duration : 5,
          visualPromptEN: fm.visualPromptEN || ''
        }));
        setProjectData(prev => ({ ...prev, ...newData }));
        setCurrentStep(2);
      } catch(e) {
        console.error('Erro no import full-script:', e);
        alert(`Erro ao importar dados: ${e.message}`);
      }
    } else if (type === 'social') {
      const categories = ['characterPosters','behindTheScenes','behindTheScenesVideo','makingOff','whoAmI','talkToMe','launchImage','launchVideo'];
      categories.forEach(cat => {
        if (Array.isArray(parsed[cat])) parsed[cat] = parsed[cat].map((item,i)=>({...item, id:`soc_${cat}_${Date.now()}_${i}`}));
        else parsed[cat] = [];
      });
      setProjectData(prev => ({ ...prev, socialMedia: parsed, socialMediaPlan: null }));
      setCurrentStep(5);
    } else if (type === 'social-plan') {
      if (parsed.plan && Array.isArray(parsed.plan)) {
        if (projectData.socialPremiereHeroImage) {
          const heroId = projectData.socialPremiereHeroImage.id;
          const pDay = Math.floor((projectData.socialPlanDays||14)/2)+1;
          parsed.plan = parsed.plan.map(day => day.dayNumber===pDay && day.time==='20:00' ? {...day, assetIds:[heroId]} : day);
        }
        setProjectData(prev => ({ ...prev, socialMediaPlan: parsed }));
        setCurrentStep(6);
      }
    } else if (type === 'soundtrack') {
      setProjectData(prev => ({
        ...prev,
        ...(parsed.musicDesc && { musicDesc: parsed.musicDesc }),
        ...(parsed.musicPrompt && { musicPrompt: parsed.musicPrompt })
      }));
      setCurrentStep(7);
    }
  };

  const openManualPackage = (type) => {
    const query = buildPackagePrompt(type);
    if (!query) return;
    setManualPasteText('');
    setManualDialog({ query, type,
      resolve: (text) => {
        try {
          const parsed = parseAIResponse(text);
          handleManualPackageImport(type, typeof parsed === 'string' ? JSON.parse(parsed) : parsed);
        } catch(e) {
          alert(`Erro ao processar pacote: ${e.message}`);
        }
      },
      reject: () => {}
    });
  };

  const handleAnalyzeScript = async () => {
    if (!projectData.script) return;
    setIsAnalyzingScript(true);
    setScriptError(null);

    const filmCtx = `Título: "${projectData.title || 'Desconhecido'}" | Tipo: ${projectData.filmType || ''} | Género: ${projectData.filmGenre || ''}`;
    const scriptExcerpt = projectData.script.substring(0, 6000);

    const query = `Atua como diretor de arte e analisa o seguinte guião de filme.

CONTEXTO DO FILME: ${filmCtx}

GUIÃO:
${scriptExcerpt}

Extrai TODAS as personagens e TODOS os cenários/locais mencionados ou implícitos no guião.

Para cada PERSONAGEM gera:
- "id": identificador único simples (ex: "char_joao")
- "name": nome da personagem
- "description": descrição visual detalhada (aparência física, expressão típica, estilo) para geração de imagem em Animação 3D, em inglês
- "physical": { "height": altura estimada em cm, "build": físico (Magro/Normal/Robusto/etc) }
- "voicePrompt": descrição da voz para síntese de voz (tom, velocidade, sotaque, emoção típica), em português de Portugal

Para cada CENÁRIO/LOCAL gera:
- "id": identificador único simples (ex: "set_sala_estar")
- "name": nome do local em português de Portugal
- "description": descrição visual detalhada do espaço para geração de imagem 3D, em inglês

RESPONDE APENAS COM JSON VÁLIDO:
{ "characters": [...], "settings": [...] }`;

    try {
      const text = await callGeminiAPI(query, true);
      if (text) {
        const parsed = parseAIResponse(text);
        if ((parsed.characters && parsed.characters.length > 0) || (parsed.settings && parsed.settings.length > 0)) {
          saveToProjectHistory(projectData);
          setProjectData(prev => ({
            ...prev,
            characters: (parsed.characters || []).map((c, i) => ({ ...c, id: c.id || `char_${Date.now()}_${i}` })),
            settings: (parsed.settings || []).map((s, i) => ({ ...s, id: s.id || `set_${Date.now()}_${i}` }))
          }));
          setScriptUploadedFromFile(false);
          setCurrentStep(2); // avança para Personagens e Cenários
        }
      }
    } catch (e) {
      setScriptError(`Erro na análise: ${e.message}`);
    } finally {
      setIsAnalyzingScript(false);
    }
  };

  const renderScript = () => (
    <div className="space-y-6 animate-fade-in flex flex-col h-full">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-3"><BookOpen className="text-purple-400" size={24} /> 2. História e Guião</h2>
        <div className="flex items-center gap-2">
          {/* Upload TXT sempre visível */}
          <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-colors cursor-pointer">
            <FolderOpen size={15}/> Carregar TXT
            <input type="file" accept=".txt,.TXT" className="hidden" onChange={handleScriptTxtUpload}/>
          </label>
          {projectData.script && (
            <button onClick={() => generateScriptWithAI(false)} disabled={isGeneratingScript}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
              {isGeneratingScript ? <Loader2 size={15} className="animate-spin"/> : <RefreshCw size={15}/>} Regenerar
            </button>
          )}
        </div>
      </div>

      {!projectData.script ? (
        <div className="bg-slate-800/80 p-8 rounded-2xl border border-indigo-500/30 shadow-lg flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center mb-4 text-indigo-400"><Wand2 size={32} /></div>
          <h3 className="text-xl font-bold text-white mb-2">Gerar Argumento Automático</h3>
          <p className="text-slate-400 text-center text-sm mb-6 max-w-md">Gera um guião com IA a partir da logline, ou carrega um ficheiro TXT com o guião já escrito (botão acima).</p>
          <button onClick={() => generateScriptWithAI(false)} disabled={isGeneratingScript || (!projectData.storyPrompt && !projectData.storyFileContent)} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 font-bold text-lg shadow-lg shadow-indigo-900/50 transition-colors">
            {isGeneratingScript ? <Loader2 size={20} className="animate-spin"/> : <Wand2 size={20}/>} Gerar Guião com Inteligência Artificial
          </button>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-700"/>
            <span className="text-xs text-slate-500">ou</span>
            <div className="h-px flex-1 bg-slate-700"/>
          </div>
          <button onClick={() => openManualPackage('full-script')} className="flex items-center gap-2 px-6 py-2.5 bg-cyan-800/60 hover:bg-cyan-700/70 border border-cyan-700/50 text-cyan-300 rounded-xl font-bold text-sm transition-colors">
            <Copy size={16}/> Gerar Tudo (Guião + Personagens + Cenas + Finais) via IA Externa
          </button>
          {scriptError && <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm max-w-md text-center">{renderText(scriptError)}</div>}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Visualizador do guião */}
          <div className="bg-[#fcfaf2] text-slate-900 p-8 rounded-xl font-mono text-sm border border-[#e5ddc5] max-h-[600px] overflow-y-auto shadow-inner">
            {formatScriptText(projectData.script)}
          </div>

          {/* Botão de análise — sempre visível quando há guião */}
          <div className="bg-gradient-to-r from-emerald-950/50 to-teal-950/50 border border-emerald-700/40 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-300 flex items-center gap-2"><Wand2 size={16}/> Analisar Guião — Extrair Personagens e Cenários</p>
              <p className="text-xs text-slate-400 mt-1">A IA lê o guião e cria automaticamente todas as personagens e cenários com descrições visuais e de voz, prontos para a produção.</p>
            </div>
            <button
              onClick={handleAnalyzeScript}
              disabled={isAnalyzingScript}
              className="flex-shrink-0 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg whitespace-nowrap"
            >
              {isAnalyzingScript ? <Loader2 size={18} className="animate-spin"/> : <Users size={18}/>}
              {isAnalyzingScript ? 'A analisar...' : 'Analisar e Extrair'}
            </button>
          </div>

          {/* Caixa de alterações */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Edit3 size={16} className="text-purple-400"/> Pedir Alterações à IA:</h3>
            <textarea value={scriptEditPrompt} onChange={(e) => setScriptEditPrompt(e.target.value)} placeholder="Ex: Muda o final para ser mais feliz..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm min-h-[100px] outline-none focus:border-purple-500 mb-4 resize-none transition-colors" />
            <div className="flex justify-end">
              <button onClick={() => generateScriptWithAI(true)} disabled={isGeneratingScript || !scriptEditPrompt.trim()} className="flex items-center gap-2 px-8 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl disabled:opacity-50 font-bold transition-colors">
                {isGeneratingScript ? <Loader2 size={18} className="animate-spin"/> : <Wand2 size={18}/>} Aplicar Alterações ao Guião
              </button>
            </div>
            {scriptError && <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">{renderText(scriptError)}</div>}
          </div>
        </div>
      )}
      <div className="flex justify-end pt-4 border-t border-slate-800">
        <button onClick={() => setCurrentStep(2)} disabled={!projectData.script} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-bold shadow-lg shadow-blue-900/50 transition-colors">
           Continuar para Personagens e Cenários <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  const renderCharactersSettings = () => (
    <div className={`space-y-8 animate-fade-in flex flex-col h-full relative ${addAssetModal.isOpen ? 'pb-28' : ''}`}>
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Users className="text-emerald-400" /> Personagens e Cenários</h2>
          <p className="text-slate-400 text-sm mt-2">Prompts de imagem otimizados para ferramentas como Midjourney ou Dall-E.</p>
        </div>
      </div>

      {projectData.posterPrompt && (
        <div className="mb-10">
          <h3 className="text-lg font-bold text-amber-500 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2"><ImageIcon size={18}/> Capa / Poster do Filme</h3>
          <div className="bg-slate-900 border border-amber-500/50 p-5 rounded-2xl shadow-lg flex flex-col gap-3">
             <div className="relative">
               <textarea readOnly value={resolvePosterPrompt()} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-amber-100 font-mono resize-none h-24 pr-12 custom-scrollbar" />
               <button onClick={() => handleCopy(resolvePosterPrompt(), 'poster')} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors">
                  {copiedId === 'poster' ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>}
               </button>
             </div>
             {renderPromptActions({ type: 'poster', id: 'poster', item: null, targetField: 'image', onDelete: () => handleDeleteAsset('poster', null), placeholder: 'Ex: Torna o estilo mais sombrio...', btnClass: 'bg-amber-600 hover:bg-amber-500', focusClass: 'focus:border-amber-500'})}
          </div>
        </div>
      )}

      {!projectData.characters?.length && !projectData.settings?.length ? (
         <div className="flex flex-col items-center justify-center p-12 bg-slate-800/30 border border-slate-700/50 rounded-xl border-dashed">
            <Users size={48} className="text-slate-600 mb-4" />
            <p className="text-slate-400">Nenhum asset gerado.</p>
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
                {!projectData.posterPrompt && <button onClick={() => setAddAssetModal({ isOpen: true, type: 'poster', prompt: '' })} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"><Plus size={16}/> Capa do Filme</button>}
                <button onClick={() => setAddAssetModal({ isOpen: true, type: 'character', prompt: '' })} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"><Plus size={16}/> Nova Personagem</button>
                <button onClick={() => setAddAssetModal({ isOpen: true, type: 'setting', prompt: '' })} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"><Plus size={16}/> Novo Cenário</button>
            </div>
         </div>
      ) : (
        <div className="space-y-10">
          <div className="flex justify-end mt-[-10px] gap-2">
             {!projectData.posterPrompt && <button onClick={() => setAddAssetModal({ isOpen: true, type: 'poster', prompt: '' })} className="text-xs bg-amber-600/20 text-amber-400 border border-amber-500/50 px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition-colors hover:bg-amber-600/30"><Plus size={14}/> Criar Capa do Filme</button>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
               <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2"><Users size={18}/> Personagens ({projectData.characters.length})</h3>
               <button onClick={() => setAddAssetModal({ isOpen: true, type: 'character', prompt: '' })} className="text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition-colors hover:bg-emerald-600/30"><Plus size={14}/> Adicionar Personagem</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectData.characters.map((char) => {
                 const promptText = resolveCharPrompt(char);
                 const voicePromptText = resolveCharVoicePrompt(char);
                 return (
                   <div key={char.id} className="bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-lg flex flex-col gap-3">
                     {editingAssetId === char.id ? (
                        <div className="flex flex-col gap-3 w-full bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                           <input value={editingName} onChange={e => setEditingName(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-white text-sm outline-none focus:border-emerald-500 transition-colors" placeholder="Nome" autoFocus />
                           <div className="flex gap-3">
                              <div className="flex flex-1 items-center gap-2 bg-slate-800 border border-slate-600 rounded px-2 py-1.5 focus-within:border-emerald-500 transition-colors">
                                 <label className="text-xs text-slate-400 font-bold">Altura:</label>
                                 <input type="number" value={editingHeight} onChange={e => setEditingHeight(e.target.value)} className="flex-1 bg-transparent text-white text-sm outline-none" placeholder="175" />
                              </div>
                              <select value={editingBuild} onChange={e => setEditingBuild(e.target.value)} className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-white text-sm outline-none focus:border-emerald-500 transition-colors">
                                <option value="">Estrutura...</option>{physicalBuilds.map(pb => <option key={pb} value={pb}>{pb}</option>)}
                              </select>
                           </div>
                           <div className="flex gap-2 justify-end mt-1">
                              <button onClick={() => setEditingAssetId(null)} className="bg-slate-700 hover:bg-slate-600 px-4 py-1.5 rounded-lg text-xs text-slate-300 transition-colors">Cancelar</button>
                              <button onClick={() => saveEditing('character', char.id, char.name)} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 rounded-lg text-xs text-white flex items-center gap-1.5 transition-colors"><Check size={14}/> Guardar</button>
                           </div>
                        </div>
                     ) : (
                       <div className="flex items-center gap-2 mb-1">
                         <h4 className="font-bold text-white text-lg flex items-center gap-2">{renderText(char.name)}</h4>
                         <button onClick={() => startEditing('character', char)} className="text-slate-500 hover:text-emerald-400 ml-1 transition-colors"><Edit3 size={14}/></button>
                       </div>
                     )}
                     <div className="text-xs text-slate-400"><p>{renderText(char.description)}</p></div>
                     
                     <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-slate-800/50">
                       <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Prompt de Imagem IA</label>
                       <div className="relative">
                         <textarea readOnly value={promptText} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-emerald-100 font-mono h-24 custom-scrollbar resize-none pr-12" />
                         <button onClick={() => handleCopy(promptText, `${char.id}_img`)} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors">
                            {copiedId === `${char.id}_img` ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>}
                         </button>
                       </div>
                       {renderPromptActions({ type: 'character', id: char.id, item: char, targetField: 'image', onDelete: () => handleDeleteAsset('character', char.id), placeholder: 'Ex: Muda a cor do casaco...', btnClass: 'bg-emerald-600 hover:bg-emerald-500', focusClass: 'focus:border-emerald-500'})}
                     </div>
                     <div className="mt-2 pt-4 flex flex-col gap-2 border-t border-slate-800/50">
                       <label className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1"><Mic size={12}/> Prompt de Voz IA</label>
                       <div className="relative">
                         <textarea readOnly value={voicePromptText} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-indigo-200 font-mono h-20 custom-scrollbar resize-none pr-12" />
                         <button onClick={() => handleCopy(voicePromptText, `${char.id}_voice`)} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors">
                            {copiedId === `${char.id}_voice` ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>}
                         </button>
                       </div>
                       {renderPromptActions({ type: 'character', id: char.id, item: char, targetField: 'voice', onDelete: () => handleDeleteVoicePrompt(char.id), placeholder: 'Ex: Torna a voz mais rouca...', btnClass: 'bg-indigo-600 hover:bg-indigo-500', focusClass: 'focus:border-indigo-500'})}
                     </div>
                   </div>
                 )
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
               <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2"><Map size={18}/> Cenários ({projectData.settings.length})</h3>
               <button onClick={() => setAddAssetModal({ isOpen: true, type: 'setting', prompt: '' })} className="text-xs bg-amber-600/20 text-amber-400 border border-amber-500/50 px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition-colors hover:bg-amber-600/30"><Plus size={14}/> Adicionar Cenário</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectData.settings.map((setting) => {
                 const promptText = resolveSettingPrompt(setting);
                 return (
                   <div key={setting.id} className="bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-lg flex flex-col gap-3">
                     <div className="flex items-center gap-2 mb-1">
                       {editingAssetId === setting.id ? (
                         <div className="flex w-full gap-2 items-center">
                           <input value={editingName} onChange={e => setEditingName(e.target.value)} className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm outline-none focus:border-amber-500 transition-colors" autoFocus />
                           <button onClick={() => saveEditing('setting', setting.id, setting.name)} className="bg-emerald-600 hover:bg-emerald-500 p-1.5 rounded text-white transition-colors"><Check size={14}/></button>
                           <button onClick={() => setEditingAssetId(null)} className="bg-slate-700 hover:bg-slate-600 p-1.5 rounded text-slate-300 transition-colors"><X size={14}/></button>
                         </div>
                       ) : (
                         <><h4 className="font-bold text-white text-lg">{renderText(setting.name)}</h4><button onClick={() => startEditing('setting', setting)} className="text-slate-500 hover:text-amber-400 ml-1 transition-colors"><Edit3 size={14}/></button></>
                       )}
                     </div>
                     <p className="text-xs text-slate-400">{renderText(setting.description)}</p>
                     <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-slate-800/50">
                       <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Prompt de Imagem IA</label>
                       <div className="relative">
                         <textarea readOnly value={promptText} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-amber-100 font-mono h-24 custom-scrollbar resize-none pr-12" />
                         <button onClick={() => handleCopy(promptText, setting.id)} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors">
                            {copiedId === setting.id ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>}
                         </button>
                       </div>
                       {renderPromptActions({ type: 'setting', id: setting.id, item: setting, targetField: 'image', onDelete: () => handleDeleteAsset('setting', setting.id), placeholder: 'Ex: Adiciona chuva e neon...', btnClass: 'bg-amber-600 hover:bg-amber-500', focusClass: 'focus:border-amber-500'})}
                     </div>
                   </div>
                 )
              })}
            </div>
          </div>
        </div>
      )}

      {addAssetModal.isOpen && (
        <div className="fixed bottom-0 left-0 right-0 w-full bg-slate-900/95 backdrop-blur-xl border-t border-emerald-500/50 p-4 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex justify-center animate-fade-in">
           <div className="max-w-6xl w-full flex flex-col md:flex-row gap-4 items-center px-4">
              <div className="flex flex-col flex-1 w-full">
                 <textarea value={addAssetModal.prompt} onChange={e => setAddAssetModal(prev => ({ ...prev, prompt: e.target.value }))} placeholder={`Descreve detalhadamente...`} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white h-14 outline-none focus:border-emerald-500 resize-none transition-colors" />
              </div>
              <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-6">
                 <button onClick={handleGenerateNewAsset} disabled={isGeneratingAsset || !addAssetModal.prompt.trim()} className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-2 px-6 rounded-lg h-14 transition-colors disabled:opacity-50">
                    {isGeneratingAsset ? 'A criar...' : 'Adicionar'}
                 </button>
                 <button onClick={() => setAddAssetModal({ isOpen: false, type: null, prompt: '' })} className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-4 rounded-lg h-14 transition-colors"><X size={16}/></button>
              </div>
           </div>
        </div>
      )}
      
      <div className="flex justify-end pt-4 border-t border-slate-800 mt-auto">
        <button onClick={() => setCurrentStep(3)} disabled={!projectData.scenes?.length} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/50">
           Avançar para Cenas / Takes <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  const renderTakesAndVideoPrompts = () => {
    let globalTimeTakes = 0;
    
    // Helper para desenhar as narrações aprovadas/pendentes em volta de cada take
    const renderNarrationBlock = (n, scene) => (
       <div key={n.id} className={`p-4 rounded-xl border ${n.isPending ? 'bg-red-950/40 border-red-500/50 shadow-md shadow-red-900/20' : 'bg-slate-900 border-slate-700 shadow-sm'} mb-4 relative group animate-fade-in`}>
           <div className="flex justify-between items-center mb-2">
              <h4 className={`text-xs font-bold uppercase ${n.isPending ? 'text-red-400' : 'text-blue-400'} flex items-center gap-1.5`}><Mic size={14}/> Narrador (Voz OFF) {n.isPending && '- PENDENTE'}</h4>
              <div className={`flex items-center gap-2 transition-opacity ${n.isPending ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100'}`}>
                  {n.isPending ? (
                      <button onClick={() => confirmNarration(scene.id, n.id)} className="bg-red-500/20 text-red-300 hover:bg-red-500/40 px-2 py-1 rounded text-[10px] font-bold transition-colors flex items-center gap-1"><Check size={12}/> Confirmar</button>
                  ) : null}
                  <button onClick={() => regenerateSingleNarration(scene.id, n.id)} disabled={isRegeneratingSingleNarration[n.id]} className="text-slate-400 hover:text-amber-400 disabled:opacity-50" title="Regerar">{isRegeneratingSingleNarration[n.id] ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}</button>
                  <button onClick={() => deleteNarration(scene.id, n.id)} className="text-slate-400 hover:text-red-400" title="Eliminar"><Trash2 size={14}/></button>
              </div>
           </div>
           
           <p className={`text-sm italic ${n.isPending ? 'text-red-200' : 'text-slate-300'}`}>"{renderText(n.text)}"</p>
           
           {n.isPending && (
               <div className="mt-3 pt-3 border-t border-red-500/20 flex flex-col gap-2">
                  <label className="text-[10px] text-red-400 font-bold uppercase">Mover Localização da Narração:</label>
                  <select value={`${n.takeId}|${n.position}`} onChange={(e) => moveNarration(scene.id, n.id, e.target.value)} className="bg-red-950 border border-red-500/50 text-red-200 text-xs rounded p-2 outline-none focus:border-red-400 cursor-pointer">
                     {scene.takes.map((t, idx) => (
                         <optgroup key={t.id} label={`Take ${idx + 1}`}>
                            <option value={`${t.id}|before`}>Antes do Take {idx + 1}</option>
                            <option value={`${t.id}|during`}>Durante o Take {idx + 1}</option>
                            <option value={`${t.id}|after`}>Após o Take {idx + 1}</option>
                         </optgroup>
                     ))}
                  </select>
               </div>
           )}
       </div>
    );

    return (
      <div className={`space-y-6 animate-fade-in flex flex-col h-full relative`}>
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div><h2 className="text-2xl font-bold text-white flex items-center gap-3"><Video className="text-rose-400" /> Cenas e Takes (Vídeo)</h2></div>
          {projectData.scenes?.length > 0 && (
             <div className="flex gap-2">
               <button onClick={handleRegenerateAllScenes} disabled={isGeneratingAllScenes} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  {isGeneratingAllScenes ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>} <span className="hidden md:inline">{isGeneratingAllScenes ? 'A Regenerar...' : 'Regenerar Todas'}</span>
               </button>
               <button onClick={() => setExpandedScenes({})} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg font-bold shadow-sm transition-colors">Recolher Todas</button>
               <button onClick={() => { const allExpanded = {}; projectData.scenes.forEach(s => allExpanded[s.id] = true); setExpandedScenes(allExpanded); }} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg font-bold shadow-sm transition-colors">Expandir Todas</button>
             </div>
          )}
        </div>

        {!projectData.scenes?.length ? (
           <div className="flex flex-col items-center justify-center p-12 bg-slate-800/30 border border-slate-700/50 rounded-xl border-dashed">
              <Video size={48} className="text-slate-600 mb-4" />
              <p className="text-slate-400">Nenhum take gerado. Por favor conclui a geração do Guião primeiro.</p>
           </div>
        ) : (
          <div className="space-y-8">
            {projectData.intro && (() => {
                const startT = globalTimeTakes; globalTimeTakes += (projectData.intro.duration || 0); const endT = globalTimeTakes;
                const timelineStr = `[${formatDuration(startT)} a ${formatDuration(endT)}]`;
                const promptText = resolveIntroPrompt();
                return (
                   <div className="bg-slate-800/50 border border-cyan-500/30 rounded-2xl overflow-hidden shadow-lg mb-8">
                      <div className="bg-slate-800 p-4 border-b border-cyan-500/30"><h3 className="text-lg font-bold text-cyan-300">INTRO - Sequência de Título</h3></div>
                      <div className="p-4 space-y-4">
                         <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col lg:flex-row gap-6">
                          <div className="flex-1 space-y-3">
                             <span className="inline-block px-2 py-1 bg-slate-800 text-cyan-300 text-xs font-bold rounded border border-slate-600">Take Intro • {stylizeTime(formatDuration(projectData.intro.duration))} • ⏱ {stylizeTime(timelineStr)}</span>
                             <div><span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Ação e Câmara:</span><p className="text-sm text-slate-200">[{renderText(projectData.intro.camera)}] - {renderText(projectData.intro.action)}</p></div>
                          </div>
                          <div className="w-full lg:w-[50%] flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-slate-700 pt-4 lg:pt-0 lg:pl-6">
                               <label className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Prompt de Vídeo IA</label>
                               <div className="relative h-full min-h-[100px]">
                                 <textarea readOnly value={promptText} className="w-full h-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-cyan-100 font-mono resize-none pr-12 custom-scrollbar" />
                                 <button onClick={() => handleCopy(promptText, 'intro')} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors">{copiedId === 'intro' ? <Check size={14} className="text-emerald-400"/> : <Copy size={14} className="text-slate-300"/>}</button>
                               </div>
                               {renderPromptActions({ type: 'intro', id: 'intro', item: projectData.intro, targetField: 'image', onDelete: () => handleDeleteSpecialTake('intro'), placeholder: 'Ex: Adiciona luzes dramáticas...', btnClass: 'bg-cyan-600 hover:bg-cyan-500', focusClass: 'focus:border-cyan-500'})}
                          </div>
                         </div>
                      </div>
                   </div>
                );
            })()}

            {projectData.preface && (() => {
                const startT = globalTimeTakes; globalTimeTakes += (projectData.preface.duration || 0); const endT = globalTimeTakes;
                const timelineStr = `[${formatDuration(startT)} a ${formatDuration(endT)}]`;
                const promptText = resolvePrefacePrompt();
                return (
                   <div className="bg-slate-800/50 border border-blue-500/30 rounded-2xl overflow-hidden shadow-lg mb-8">
                      <div className="bg-slate-800 p-4 border-b border-blue-500/30"><h3 className="text-lg font-bold text-blue-300">PREFÁCIO - Introdução</h3></div>
                      <div className="p-4 space-y-4">
                         <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col lg:flex-row gap-6">
                          <div className="flex-1 space-y-3">
                             <span className="inline-block px-2 py-1 bg-slate-800 text-blue-300 text-xs font-bold rounded border border-slate-600">Take Prefácio • {stylizeTime(formatDuration(projectData.preface.duration))} • ⏱ {stylizeTime(timelineStr)}</span>
                             <div><span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Ação e Câmara:</span><p className="text-sm text-slate-200">[{renderText(projectData.preface.camera)}] - {renderText(projectData.preface.action)}</p></div>
                             {projectData.preface.narratorText && (
                               <div className="mt-3 p-3 bg-blue-950/30 rounded-xl border border-blue-500/20">
                                 <strong className="text-blue-400 uppercase text-[10px] block mb-1 flex items-center gap-1"><Mic size={12}/> Narrador (Voz OFF):</strong>
                                 <span className="text-slate-300 text-sm italic">"{renderText(projectData.preface.narratorText)}"</span>
                               </div>
                             )}
                          </div>
                          <div className="w-full lg:w-[50%] flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-slate-700 pt-4 lg:pt-0 lg:pl-6">
                               <label className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Prompt de Vídeo IA</label>
                               <div className="relative h-full min-h-[100px]">
                                 <textarea readOnly value={promptText} className="w-full h-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-blue-100 font-mono resize-none pr-12 custom-scrollbar" />
                                 <button onClick={() => handleCopy(promptText, 'preface')} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors">{copiedId === 'preface' ? <Check size={14} className="text-emerald-400"/> : <Copy size={14} className="text-slate-300"/>}</button>
                               </div>
                               {renderPromptActions({ type: 'preface', id: 'preface', item: projectData.preface, targetField: 'image', onDelete: () => handleDeleteSpecialTake('preface'), placeholder: 'Ex: Muda o texto do narrador...', btnClass: 'bg-blue-600 hover:bg-blue-500', focusClass: 'focus:border-blue-500'})}
                          </div>
                         </div>
                      </div>
                   </div>
                );
            })()}

            {projectData.scenes.map((scene, sIdx) => (
               <div key={scene.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden shadow-lg" id={`scene-container-${scene.id}`}>
                  <div className="bg-slate-800 p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700/80 flex flex-col md:flex-row md:items-center justify-between group select-none transition-colors gap-2" onClick={() => toggleScene(scene.id)}>
                     <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                           <h3 className="text-lg font-bold text-rose-300 flex items-center gap-2"><ChevronRight className={`transition-transform duration-200 ${!expandedScenes[scene.id] ? 'text-slate-500' : 'rotate-90 text-rose-400'}`} size={20} /> Cena {sIdx + 1}: {renderText(scene.title)}</h3>
                           
                           {/* NOVO BOTÃO DE NARRAÇÃO */}
                           <button onClick={(e) => { e.stopPropagation(); setActiveNarrationSceneId(prev => prev === scene.id ? null : scene.id); if(!expandedScenes[scene.id]) toggleScene(scene.id); }} className={`text-[10px] px-2.5 py-1 rounded-md border flex items-center gap-1 transition-colors ${activeNarrationSceneId === scene.id ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900/50 hover:bg-blue-900/50 text-slate-300 hover:text-blue-300 border-slate-600 hover:border-blue-500/50'}`}>
                               <Mic size={12}/> Narração
                           </button>

                           <button onClick={(e) => handleRegenerateSceneTakes(e, scene.id)} disabled={regeneratingSceneId === scene.id} className="text-[10px] bg-slate-900/50 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 px-2.5 py-1 rounded-md border border-slate-600 hover:border-rose-500/50 flex items-center gap-1 transition-colors disabled:opacity-50">
                               {regeneratingSceneId === scene.id ? <Loader2 size={12} className="animate-spin"/> : <RefreshCw size={12}/>} Regerar Takes
                           </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 ml-7 hidden md:block">{renderText(scene.description)}</p>
                     </div>
                     <div className="text-xs font-bold text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full md:self-auto self-start ml-7 md:ml-0 group-hover:text-rose-300 transition-colors">{scene.takes?.length || 0} Takes</div>
                  </div>
                  <div className={!expandedScenes[scene.id] ? "hidden" : "p-4 space-y-4 animate-in fade-in duration-300"}>
                     
                     {/* PAINEL DO ASSISTENTE DE NARRAÇÃO */}
                     {activeNarrationSceneId === scene.id && (
                        <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-5 mb-6 shadow-inner animate-fade-in flex flex-col gap-4">
                           <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2"><Mic size={16}/> Assistente de Narração Automática (Voz OFF)</h4>
                           <textarea value={narrationInstruction} onChange={e => setNarrationInstruction(e.target.value)} placeholder="Instruções para a IA (ex: Preencher takes sem diálogo com uma reflexão melancólica sobre a ação...)" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none focus:border-blue-500 h-20 resize-none transition-colors" />
                           <div className="flex justify-end gap-3">
                              <button onClick={() => setActiveNarrationSceneId(null)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-lg transition-colors">Fechar</button>
                              <button onClick={() => handleGenerateNarrations(scene.id)} disabled={isGeneratingNarrations} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2 rounded-lg flex items-center gap-2 shadow-md transition-colors disabled:opacity-50">
                                 {isGeneratingNarrations ? <Loader2 size={14} className="animate-spin"/> : <Wand2 size={14}/>} {isGeneratingNarrations ? 'A Gerar...' : 'Autogerar Narrações para a Cena'}
                              </button>
                           </div>
                        </div>
                     )}

                     {scene.takes?.map((take, tIdx) => {
                        const startT = globalTimeTakes; globalTimeTakes += (take.duration || 0); const endT = globalTimeTakes;
                        const timelineStr = `[${formatDuration(startT)} a ${formatDuration(endT)}]`;
                        const promptText = resolveTakePrompt(take);
                        const set = projectData.settings?.find(s => s.id === take.settingId);
                        const chars = (take.characterIds || []).map(id => projectData.characters?.find(c => c.id === id)).filter(Boolean);

                        const sceneNarrations = scene.narrations || [];
                        const beforeN = sceneNarrations.filter(n => n.takeId === take.id && n.position === 'before');
                        const duringN = sceneNarrations.filter(n => n.takeId === take.id && n.position === 'during');
                        const afterN = sceneNarrations.filter(n => n.takeId === take.id && n.position === 'after');

                        return (
                           <div key={take.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col gap-6">
                              {/* Narrações Antes */}
                              {beforeN.length > 0 && <div className="w-full">{beforeN.map(n => renderNarrationBlock(n, scene))}</div>}
                              
                              <div className="flex flex-col lg:flex-row gap-6">
                                <div className="flex-1 space-y-3">
                                   <span className="inline-block px-2 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded border border-slate-600 uppercase">Cena {sIdx + 1} - Take {tIdx + 1} • {stylizeTime(formatDuration(take.duration))} • ⏱ {stylizeTime(timelineStr)}</span>
                                   <div>
                                       <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Ação e Câmara:</span>
                                       <p className="text-sm text-slate-200 leading-relaxed">[{renderText(take.camera)}] - {renderText(take.action)}</p>
                                       {(set || chars.length > 0) && (
                                          <div className="flex flex-wrap gap-1.5 mt-2">
                                             {set && <span className="flex items-center gap-1 text-[10px] font-medium bg-amber-950/50 text-amber-400 px-2 py-0.5 rounded border border-amber-900/50"><Map size={10}/> {renderText(set.name)}</span>}
                                             {chars.map(c => <span key={c.id} className="flex items-center gap-1 text-[10px] font-medium bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/50"><Users size={10}/> {renderText(c.name)}</span>)}
                                          </div>
                                       )}
                                     </div>
                                     {getFormattedDialogues(take)}

                                     {/* Narrações Durante */}
                                     {duringN.length > 0 && <div className="w-full mt-4">{duringN.map(n => renderNarrationBlock(n, scene))}</div>}
                                  </div>
                                  <div className="w-full lg:w-[50%] flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-slate-700 pt-4 lg:pt-0 lg:pl-6">
                                     <label className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Prompt de Vídeo IA</label>
                                     <div className="relative h-full min-h-[100px]">
                                       <textarea readOnly value={promptText} className="w-full h-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-rose-100 font-mono resize-none pr-12 custom-scrollbar" />
                                       <button onClick={() => handleCopy(promptText, take.id)} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors">{copiedId === take.id ? <Check size={14} className="text-emerald-400"/> : <Copy size={14} className="text-slate-300"/>}</button>
                                     </div>
                                     {renderPromptActions({ type: 'take', id: take.id, item: take, targetField: 'image', onDelete: () => handleDeleteTake(scene.id, take.id), placeholder: 'Ex: Focar ângulo nos olhos...', btnClass: 'bg-rose-600 hover:bg-rose-500', focusClass: 'focus:border-rose-500'})}
                                  </div>
                              </div>

                              {/* Narrações Depois */}
                              {afterN.length > 0 && <div className="w-full mt-2">{afterN.map(n => renderNarrationBlock(n, scene))}</div>}
                           </div>
                        )
                     })}
                     {scene.takes?.length > 0 && (
                        <div className="flex justify-center mt-4 border-t border-slate-700/50 pt-6 pb-2">
                           <button onClick={() => handleCollapseFromBottom(scene.id)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-rose-400 transition-colors bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-full border border-slate-600 shadow-sm"><ChevronUp size={16} /> Recolher Cena {sIdx + 1}</button>
                        </div>
                     )}
                  </div>
               </div>
            ))}

            {projectData.outro && (() => {
                const startT = globalTimeTakes; globalTimeTakes += (projectData.outro.duration || 0); const endT = globalTimeTakes;
                const timelineStr = `[${formatDuration(startT)} a ${formatDuration(endT)}]`;
                const promptText = resolveOutroPrompt();
                return (
                   <div className="bg-slate-800/50 border border-fuchsia-500/30 rounded-2xl overflow-hidden shadow-lg mt-8">
                      <div className="bg-slate-800 p-4 border-b border-fuchsia-500/30"><h3 className="text-lg font-bold text-fuchsia-300">OUTRO - Final do Filme</h3></div>
                      <div className="p-4 space-y-4">
                         <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col lg:flex-row gap-6">
                          <div className="flex-1 space-y-3">
                             <span className="inline-block px-2 py-1 bg-slate-800 text-fuchsia-300 text-xs font-bold rounded border border-slate-600">Take Final • {stylizeTime(formatDuration(projectData.outro.duration))} • ⏱ {stylizeTime(timelineStr)}</span>
                             <div><span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Ação e Câmara:</span><p className="text-sm text-slate-200">[{renderText(projectData.outro.camera)}] - {renderText(projectData.outro.action)}</p></div>
                          </div>
                          <div className="w-full lg:w-[50%] flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-slate-700 pt-4 lg:pt-0 lg:pl-6">
                               <label className="text-[10px] uppercase font-bold text-fuchsia-400 tracking-wider">Prompt de Vídeo IA (Fim)</label>
                               <div className="relative h-full min-h-[100px]">
                                 <textarea readOnly value={promptText} className="w-full h-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-fuchsia-100 font-mono resize-none pr-12 custom-scrollbar" />
                                 <button onClick={() => handleCopy(promptText, 'outro')} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors">{copiedId === 'outro' ? <Check size={14} className="text-emerald-400"/> : <Copy size={14} className="text-slate-300"/>}</button>
                               </div>
                               {renderPromptActions({ type: 'outro', id: 'outro', item: projectData.outro, targetField: 'image', onDelete: () => handleDeleteSpecialTake('outro'), placeholder: 'Ex: Faz o texto desaparecer...', btnClass: 'bg-fuchsia-600 hover:bg-fuchsia-500', focusClass: 'focus:border-fuchsia-500'})}
                          </div>
                         </div>
                      </div>
                   </div>
                );
            })()}

          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-800 mt-auto">
          <button onClick={() => setCurrentStep(4)} disabled={!projectData.scenes?.length} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/50">
             Avançar para Mensagens Finais <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderFinalMessages = () => {
    let globalTimeTakes = 0;
    if (projectData.intro) globalTimeTakes += (projectData.intro.duration || 0);
    if (projectData.preface) globalTimeTakes += (projectData.preface.duration || 0);
    projectData.scenes?.forEach(scene => { scene.takes?.forEach(take => globalTimeTakes += (take.duration || 0)); });
    if (projectData.outro) globalTimeTakes += (projectData.outro.duration || 0);

    return (
      <div className={`space-y-6 animate-fade-in flex flex-col h-full relative`}>
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
             <h2 className="text-2xl font-bold text-white flex items-center gap-3"><MessageSquare className="text-green-400" /> Mensagens Finais (Pós-Créditos)</h2>
             <p className="text-[11px] text-slate-400 mt-2">Mensagens geradas com base na trilogia: Estatística, Moral e Futuro</p>
          </div>
        </div>

        <div className="space-y-8">
           {(projectData.finalMessages || []).map((fm, fmIdx) => {
              const startT = globalTimeTakes; globalTimeTakes += (fm.duration || 0); const endT = globalTimeTakes;
              const timelineStr = `[${formatDuration(startT)} a ${formatDuration(endT)}]`;
              const promptText = resolveFinalMessagePrompt(fm);

              return (
                 <div key={fm.id} className="bg-slate-800/50 border border-green-500/30 rounded-2xl overflow-hidden shadow-lg">
                    <div className="bg-slate-800 p-4 border-b border-green-500/30 flex justify-between items-center"><h3 className="text-lg font-bold text-green-300">Quadro Extra {fmIdx + 1}</h3></div>
                    <div className="p-4 space-y-4">
                       <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 space-y-3">
                           <span className="inline-block px-2 py-1 bg-slate-800 text-green-300 text-xs font-bold rounded border border-slate-600">Mensagem Final • {stylizeTime(formatDuration(fm.duration))} • ⏱ {stylizeTime(timelineStr)}</span>
                           <div><span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Ação e Câmara:</span><p className="text-sm text-slate-200">[{renderText(fm.camera)}] - {renderText(fm.action)}</p></div>
                           {fm.userInput && (<div className="mt-3 p-3 bg-slate-950/50 rounded-xl border border-green-500/20 text-xs text-slate-400"><strong className="text-green-500 uppercase block mb-1">A tua ideia:</strong> "{renderText(fm.userInput)}"</div>)}
                          </div>
                          <div className="w-full lg:w-[50%] flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-slate-700 pt-4 lg:pt-0 lg:pl-6">
                             <label className="text-[10px] uppercase font-bold text-green-400 tracking-wider">Prompt de Vídeo IA</label>
                             <div className="relative h-full min-h-[100px]">
                               <textarea readOnly value={promptText} className="w-full h-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-green-100 font-mono resize-none pr-12 custom-scrollbar" />
                               <button onClick={() => handleCopy(promptText, fm.id)} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors">{copiedId === fm.id ? <Check size={14} className="text-emerald-400"/> : <Copy size={14} className="text-slate-300"/>}</button>
                             </div>
                             {renderPromptActions({ type: 'finalMessage', id: fm.id, item: fm, targetField: 'image', onDelete: () => handleDeleteFinalMessage(fm.id), placeholder: 'Ex: Muda a cor de fundo...', btnClass: 'bg-green-600 hover:bg-green-500', focusClass: 'focus:border-green-500'})}
                          </div>
                       </div>
                    </div>
                 </div>
              );
           })}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800/50">
           {!addingFinalMessage ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <button onClick={() => setAddingFinalMessage(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors shadow-sm">
                    <Plus size={18} /> Adicionar Mensagem Final Manual
                 </button>
                 <button onClick={handleGenerateAutomaticFinalMessages} disabled={isGeneratingAutoFM || !projectData.script} className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl font-bold transition-colors shadow-lg shadow-green-900/50">
                    {isGeneratingAutoFM ? <Loader2 size={18} className="animate-spin"/> : <RefreshCw size={18}/>} 
                    {isGeneratingAutoFM ? 'A Gerar Trilogia...' : 'Regerar Trilogia Automática'}
                 </button>
              </div>
           ) : (
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-green-500/50 animate-fade-in shadow-lg">
                 <h3 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2"><MessageSquare size={16}/> Nova Mensagem / Cena Extra</h3>
                 <textarea value={finalMessageInput} onChange={e => setFinalMessageInput(e.target.value)} placeholder="Ex: 'Um texto branco no ecrã a dizer: Dedicado a todos os sonhadores.'" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-white outline-none focus:border-green-500 h-24 mb-4 custom-scrollbar resize-none transition-colors" />
                 <div className="flex justify-end gap-3">
                    <button onClick={() => setAddingFinalMessage(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 transition-colors">Cancelar</button>
                    <button onClick={handleGenerateFinalMessage} disabled={isGeneratingFM || !finalMessageInput.trim()} className="bg-green-600 hover:bg-green-500 px-6 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 transition-colors">{isGeneratingFM ? <Loader2 size={16} className="animate-spin"/> : <Wand2 size={16}/>} {isGeneratingFM ? 'A Gerar...' : 'Gerar'}</button>
                 </div>
              </div>
           )}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800 mt-auto">
          <button onClick={() => setCurrentStep(5)} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/50">
             Avançar para Redes Sociais <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderSocialMedia = () => {
    
    return (
      <div className={`space-y-6 animate-fade-in flex flex-col h-full relative`}>
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div><h2 className="text-2xl font-bold text-white flex items-center gap-3"><Share2 className="text-pink-400" /> Redes Sociais (Promoção)</h2></div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-[10px] font-bold text-pink-400 uppercase tracking-wide flex items-center gap-1"><ImageIcon size={11}/> Gerar Imagens (por personagem)</label>
            <input type="number" min="1" max="10" value={projectData.socialImageCount || 3} onChange={(e) => handleProjectDataChange('socialImageCount', Math.max(1, parseInt(e.target.value) || 3))} className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-sm text-white focus:border-pink-500 outline-none w-full transition-colors" />
          </div>
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-[10px] font-bold text-purple-400 uppercase tracking-wide flex items-center gap-1"><Video size={11}/> Gerar Vídeos (por personagem)</label>
            <input type="number" min="1" max="10" value={projectData.socialVideoCount || 3} onChange={(e) => handleProjectDataChange('socialVideoCount', Math.max(1, parseInt(e.target.value) || 3))} className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-sm text-white focus:border-purple-500 outline-none w-full transition-colors" />
          </div>
          <p className="text-[10px] text-slate-500 flex-1">Nº de entradas geradas por personagem (e "Todas as Personagens") em cada bloco de imagens / vídeos. Por defeito: 3.</p>
        </div>

        {/* ── Botão Auto-Gerar sempre visível ── */}
        <div className="bg-gradient-to-r from-pink-950/40 to-indigo-950/40 border border-pink-700/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold text-pink-300 flex items-center gap-2"><Wand2 size={16}/> Auto-Gerar Campanha Completa</p>
            <p className="text-xs text-slate-400 mt-1">Analisa o guião, cenas, personagens e gera automaticamente os blocos com o número ideal de imagens e vídeos, organizados em lógica Pré-Estreia → Estreia → Pós-Estreia.</p>
          </div>
          <button
            onClick={handleAutoGenerateAllSocial}
            disabled={isGeneratingAutoSocial || !projectData.scenes?.length}
            className="flex-shrink-0 flex items-center gap-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-pink-900/50 whitespace-nowrap"
          >
            {isGeneratingAutoSocial ? <Loader2 size={18} className="animate-spin"/> : <Wand2 size={18}/>}
            {isGeneratingAutoSocial ? 'A analisar e gerar...' : (projectData.socialMedia ? 'Regerar Campanha Auto' : 'Gerar Campanha')}
          </button>
          <button onClick={() => openManualPackage('social')} className="flex-shrink-0 flex items-center gap-2 bg-cyan-800/50 hover:bg-cyan-700/60 border border-cyan-700/40 text-cyan-300 px-4 py-3 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
            <Copy size={16}/> IA Externa
          </button>
        </div>

        {!projectData.socialMedia && !(projectData.socialMediaExtraBlocks?.length > 0) ? (
           <div className="flex flex-col items-center justify-center p-8 bg-slate-800/30 border border-slate-700/50 rounded-xl border-dashed min-h-[150px]">
              <Share2 size={32} className="text-slate-600 mb-3" />
              <p className="text-slate-500 text-sm text-center mb-3">Ou gera bloco a bloco com controlo manual:</p>
              <button onClick={handleGenerateSocialMedia} disabled={isGeneratingSocial || !projectData.scenes?.length} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50">{isGeneratingSocial ? <Loader2 size={16} className="animate-spin"/> : <Wand2 size={16}/>} {isGeneratingSocial ? 'A criar...' : 'Gerar Manualmente (Bloco a Bloco)'}</button>
           </div>
        ) : (
          <div className="space-y-12">
            {/* Botão Regerar Manual — só quando há blocos manuais */}
            {projectData.socialMedia && Object.values(projectData.socialMedia).some(arr => Array.isArray(arr) && arr.length > 0) && (
              <div className="flex justify-end mt-[-20px] mb-4">
                <button onClick={handleGenerateSocialMedia} disabled={isGeneratingSocial} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors border border-slate-700 shadow-sm">{isGeneratingSocial ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>} Regerar (Manual)</button>
              </div>
            )}
            {/* Os 8 blocos manuais — só quando socialMedia tem conteúdo */}
            {projectData.socialMedia && Object.values(projectData.socialMedia).some(arr => Array.isArray(arr) && arr.length > 0) && <>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                  <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2"><ImageIcon size={20}/> 1. Pósteres de Personagem & Teasers</h3>
                  <button onClick={() => handleGenerateSocialMediaBlock('characterPosters')} disabled={isGeneratingSocialBlock['characterPosters']} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors border border-slate-700">
                      {isGeneratingSocialBlock['characterPosters'] ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>} Regerar Bloco
                  </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(projectData.socialMedia.characterPosters || []).map((cp, i) => {
                  const promptText = getSocialImagePrompt(cp, 'characterPoster');
                  return (
                  <div key={cp.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
                    <div className="bg-blue-900/40 text-blue-300 text-xs font-bold px-2 py-1 rounded inline-block w-fit border border-blue-800/50">{getStandardizedSocialTitle('characterPosters', i, cp.characterName)}</div>
                    {cp.teaserPT && <p className="text-sm text-slate-300 italic border-l-2 border-blue-500 pl-3">"{renderText(cp.teaserPT)}"</p>}
                    <div className="relative">
                       <textarea readOnly value={promptText} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-blue-100 font-mono resize-none h-24 custom-scrollbar pr-12" />
                       <button onClick={() => handleCopy(promptText, cp.id)} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors">{copiedId === cp.id ? <Check size={14} className="text-emerald-400"/> : <Copy size={14} className="text-slate-300"/>}</button>
                    </div>
                    {renderPromptActions({ type: 'social_characterPosters', id: cp.id, item: cp, targetField: 'image', onDelete: () => handleDeleteSocialAsset('characterPosters', cp.id), placeholder: 'Ex: Muda a pose...', btnClass: 'bg-blue-600 hover:bg-blue-500', focusClass: 'focus:border-blue-500'})}
                  </div>
                )})}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                  <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2"><Camera size={20}/> 2. Behind the Scenes (Imagens)</h3>
                  <button onClick={() => handleGenerateSocialMediaBlock('behindTheScenes')} disabled={isGeneratingSocialBlock['behindTheScenes']} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors border border-slate-700">
                      {isGeneratingSocialBlock['behindTheScenes'] ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>} Regerar Bloco
                  </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(projectData.socialMedia.behindTheScenes || []).map((bts, i) => {
                  const promptText = getSocialImagePrompt(bts, 'bts');
                  return (
                  <div key={bts.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
                    <div className="bg-amber-900/40 text-amber-300 text-xs font-bold px-2 py-1 rounded inline-block w-fit border border-amber-800/50">{getStandardizedSocialTitle('behindTheScenes', i, bts.characterName)}</div>
                    <div className="relative">
                       <textarea readOnly value={promptText} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-amber-100 font-mono resize-none h-24 custom-scrollbar pr-12" />
                       <button onClick={() => handleCopy(promptText, bts.id)} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors">{copiedId === bts.id ? <Check size={14} className="text-emerald-400"/> : <Copy size={14} className="text-slate-300"/>}</button>
                    </div>
                    {renderPromptActions({ type: 'social_behindTheScenes', id: bts.id, item: bts, targetField: 'image', onDelete: () => handleDeleteSocialAsset('behindTheScenes', bts.id), placeholder: 'Ex: Muda o que estão a fazer...', btnClass: 'bg-amber-600 hover:bg-amber-500', focusClass: 'focus:border-amber-500'})}
                  </div>
                )})}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                  <h3 className="text-xl font-bold text-orange-400 flex items-center gap-2"><Video size={20}/> 3. Behind the Scenes (Vídeo)</h3>
                  <button onClick={() => handleGenerateSocialMediaBlock('behindTheScenesVideo')} disabled={isGeneratingSocialBlock['behindTheScenesVideo']} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors border border-slate-700">
                      {isGeneratingSocialBlock['behindTheScenesVideo'] ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>} Regerar Bloco
                  </button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {(projectData.socialMedia.behindTheScenesVideo || []).map((mo, i) => {
                   const promptText = getSocialVideoPrompt(mo);
                   return (
                      <div key={mo.id} className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex flex-col lg:flex-row gap-6 shadow-lg">
                        <div className="flex-1 space-y-4">
                           <div className="bg-orange-900/40 text-orange-300 text-xs font-bold px-2 py-1 rounded inline-block border border-orange-800/50">{getStandardizedSocialTitle('behindTheScenesVideo', i, mo.characterName)}</div>
                           <div><span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Ação e Câmara (PT):</span><p className="text-sm text-slate-200">[{renderText(mo.camera)}] - {renderText(mo.action)}</p></div>
                           <div className="p-3 bg-slate-950/50 rounded-lg border border-orange-500/20 text-sm">
                             <strong className="text-orange-400 uppercase text-[10px] block mb-1">Diálogo {mo.emotion ? `(${renderText(mo.emotion)})` : ''}:</strong>
                             <span className="text-slate-300 italic">"{renderText(mo.dialogue)}"</span>
                             <label className="flex items-center gap-2 mt-3 pt-2 border-t border-orange-500/10 cursor-pointer group">
                               <input type="checkbox" checked={mo.hasSubtitle !== false} onChange={(e) => handleToggleSubtitle('behindTheScenesVideo', i, e.target.checked)} className="accent-orange-500 w-3.5 h-3.5 cursor-pointer" />
                               <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-slate-300 transition-colors">Embutir Legenda no Vídeo</span>
                             </label>
                           </div>
                        </div>
                        <div className="w-full lg:w-[50%] relative flex flex-col">
                           <label className="text-[10px] uppercase font-bold text-orange-500 tracking-wider mb-1 block">Prompt Vídeo IA (Vertical)</label>
                           <div className="relative h-full">
                              <textarea readOnly value={promptText} className="w-full h-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-orange-100 font-mono min-h-[120px] custom-scrollbar resize-none pr-12" />
                              <button onClick={() => handleCopy(promptText, mo.id)} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors">{copiedId === mo.id ? <Check size={14} className="text-emerald-400"/> : <Copy size={14} className="text-slate-300"/>}</button>
                           </div>
                           {renderPromptActions({ type: 'social_behindTheScenesVideo', id: mo.id, item: mo, targetField: 'image', onDelete: () => handleDeleteSocialAsset('behindTheScenesVideo', mo.id), onSplit: () => handleSplitSocialVideo('behindTheScenesVideo', i), placeholder: 'Ex: Foca no riso do ator...', btnClass: 'bg-orange-600 hover:bg-orange-500', focusClass: 'focus:border-orange-500'})}
                        </div>
                      </div>
                   )
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                  <h3 className="text-xl font-bold text-green-400 flex items-center gap-2"><Clapperboard size={20}/> 4. Making OFF (Vídeo)</h3>
                  <button onClick={() => handleGenerateSocialMediaBlock('makingOff')} disabled={isGeneratingSocialBlock['makingOff']} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors border border-slate-700">
                      {isGeneratingSocialBlock['makingOff'] ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>} Regerar Bloco
                  </button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {(projectData.socialMedia.makingOff || []).map((mo, i) => {
                   const promptText = getSocialVideoPrompt(mo);
                   return (
                      <div key={mo.id} className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex flex-col lg:flex-row gap-6 shadow-lg">
                        <div className="flex-1 space-y-4">
                           <div className="bg-green-900/40 text-green-300 text-xs font-bold px-2 py-1 rounded inline-block border border-green-800/50">{getStandardizedSocialTitle('makingOff', i, mo.characterName)}</div>
                           <div><span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Ação e Câmara (PT):</span><p className="text-sm text-slate-200">[{renderText(mo.camera)}] - {renderText(mo.action)}</p></div>
                           <div className="p-3 bg-slate-950/50 rounded-lg border border-green-500/20 text-sm">
                             <strong className="text-green-400 uppercase text-[10px] block mb-1">Diálogo {mo.emotion ? `(${renderText(mo.emotion)})` : ''}:</strong>
                             <span className="text-slate-300 italic">"{renderText(mo.dialogue)}"</span>
                             <label className="flex items-center gap-2 mt-3 pt-2 border-t border-green-500/10 cursor-pointer group">
                               <input type="checkbox" checked={mo.hasSubtitle !== false} onChange={(e) => handleToggleSubtitle('makingOff', i, e.target.checked)} className="accent-green-500 w-3.5 h-3.5 cursor-pointer" />
                               <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-slate-300 transition-colors">Embutir Legenda no Vídeo</span>
                             </label>
                           </div>
                        </div>
                        <div className="w-full lg:w-[50%] relative flex flex-col">
                           <label className="text-[10px] uppercase font-bold text-green-500 tracking-wider mb-1 block">Prompt Vídeo IA (Vertical)</label>
                           <div className="relative h-full">
                              <textarea readOnly value={promptText} className="w-full h-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-green-100 font-mono min-h-[120px] custom-scrollbar resize-none pr-12" />
                              <button onClick={() => handleCopy(promptText, mo.id)} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors">{copiedId === mo.id ? <Check size={14} className="text-emerald-400"/> : <Copy size={14} className="text-slate-300"/>}</button>
                           </div>
                           {renderPromptActions({ type: 'social_makingOff', id: mo.id, item: mo, targetField: 'image', onDelete: () => handleDeleteSocialAsset('makingOff', mo.id), onSplit: () => handleSplitSocialVideo('makingOff', i), placeholder: 'Ex: Muda o texto do convite...', btnClass: 'bg-green-600 hover:bg-green-500', focusClass: 'focus:border-green-500'})}
                        </div>
                      </div>
                   )
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                  <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2"><MonitorPlay size={20}/> 5. Who am I? (Vídeo)</h3>
                  <button onClick={() => handleGenerateSocialMediaBlock('whoAmI')} disabled={isGeneratingSocialBlock['whoAmI']} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors border border-slate-700">
                      {isGeneratingSocialBlock['whoAmI'] ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>} Regerar Bloco
                  </button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {(projectData.socialMedia.whoAmI || []).map((wai, i) => {
                   const promptText = getSocialVideoPrompt(wai);
                   return (
                      <div key={wai.id} className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex flex-col lg:flex-row gap-6 shadow-lg">
                        <div className="flex-1 space-y-4">
                           <div className="bg-purple-900/40 text-purple-300 text-xs font-bold px-2 py-1 rounded inline-block border border-purple-800/50">{getStandardizedSocialTitle('whoAmI', i, wai.characterName)}</div>
                           <div><span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Ação e Câmara (PT):</span><p className="text-sm text-slate-200">[{renderText(wai.camera)}] - {renderText(wai.action)}</p></div>
                           <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-500/20 text-sm">
                             <strong className="text-purple-400 uppercase text-[10px] block mb-1">Diálogo {wai.emotion ? `(${renderText(wai.emotion)})` : ''}:</strong>
                             <span className="text-slate-300 italic">"{renderText(wai.dialogue)}"</span>
                             <label className="flex items-center gap-2 mt-3 pt-2 border-t border-purple-500/10 cursor-pointer group">
                               <input type="checkbox" checked={wai.hasSubtitle !== false} onChange={(e) => handleToggleSubtitle('whoAmI', i, e.target.checked)} className="accent-purple-500 w-3.5 h-3.5 cursor-pointer" />
                               <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-slate-300 transition-colors">Embutir Legenda no Vídeo</span>
                             </label>
                           </div>
                        </div>
                        <div className="w-full lg:w-[50%] relative flex flex-col">
                           <label className="text-[10px] uppercase font-bold text-purple-500 tracking-wider mb-1 block">Prompt Vídeo IA (Vertical)</label>
                           <div className="relative h-full">
                              <textarea readOnly value={promptText} className="w-full h-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-purple-100 font-mono min-h-[120px] custom-scrollbar resize-none pr-12" />
                              <button onClick={() => handleCopy(promptText, wai.id)} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors">{copiedId === wai.id ? <Check size={14} className="text-emerald-400"/> : <Copy size={14} className="text-slate-300"/>}</button>
                           </div>
                           {renderPromptActions({ type: 'social_whoAmI', id: wai.id, item: wai, targetField: 'image', onDelete: () => handleDeleteSocialAsset('whoAmI', wai.id), onSplit: () => handleSplitSocialVideo('whoAmI', i), placeholder: 'Ex: Muda a apresentação...', btnClass: 'bg-purple-600 hover:bg-purple-500', focusClass: 'focus:border-purple-500'})}
                        </div>
                      </div>
                   )
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                  <h3 className="text-xl font-bold text-teal-400 flex items-center gap-2"><MessageCircle size={20}/> 6. Talk to Me! (Vídeo Pós-Estreia)</h3>
                  <button onClick={() => handleGenerateSocialMediaBlock('talkToMe')} disabled={isGeneratingSocialBlock['talkToMe']} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors border border-slate-700">
                      {isGeneratingSocialBlock['talkToMe'] ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>} Regerar Bloco
                  </button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {(projectData.socialMedia.talkToMe || []).map((ttm, i) => {
                   const promptText = getSocialVideoPrompt(ttm);
                   return (
                      <div key={ttm.id} className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex flex-col lg:flex-row gap-6 shadow-lg">
                        <div className="flex-1 space-y-4">
                           <div className="bg-teal-900/40 text-teal-300 text-xs font-bold px-2 py-1 rounded inline-block border border-teal-800/50">{getStandardizedSocialTitle('talkToMe', i, ttm.characterName)}</div>
                           <div><span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Ação e Câmara (PT):</span><p className="text-sm text-slate-200">[{renderText(ttm.camera)}] - {renderText(ttm.action)}</p></div>
                           <div className="p-3 bg-slate-950/50 rounded-lg border border-teal-500/20 text-sm">
                             <strong className="text-teal-400 uppercase text-[10px] block mb-1">Diálogo {ttm.emotion ? `(${renderText(ttm.emotion)})` : ''}:</strong>
                             <span className="text-slate-300 italic">"{renderText(ttm.dialogue)}"</span>
                             <label className="flex items-center gap-2 mt-3 pt-2 border-t border-teal-500/10 cursor-pointer group">
                               <input type="checkbox" checked={ttm.hasSubtitle !== false} onChange={(e) => handleToggleSubtitle('talkToMe', i, e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 cursor-pointer" />
                               <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-slate-300 transition-colors">Embutir Legenda no Vídeo</span>
                             </label>
                           </div>
                        </div>
                        <div className="w-full lg:w-[50%] relative flex flex-col">
                           <label className="text-[10px] uppercase font-bold text-teal-500 tracking-wider mb-1 block">Prompt Vídeo IA (Vertical)</label>
                           <div className="relative h-full">
                              <textarea readOnly value={promptText} className="w-full h-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-teal-100 font-mono min-h-[120px] custom-scrollbar resize-none pr-12" />
                              <button onClick={() => handleCopy(promptText, ttm.id)} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors">{copiedId === ttm.id ? <Check size={14} className="text-emerald-400"/> : <Copy size={14} className="text-slate-300"/>}</button>
                           </div>
                           {renderPromptActions({ type: 'social_talkToMe', id: ttm.id, item: ttm, targetField: 'image', onDelete: () => handleDeleteSocialAsset('talkToMe', ttm.id), onSplit: () => handleSplitSocialVideo('talkToMe', i), placeholder: 'Ex: Muda a pergunta...', btnClass: 'bg-teal-600 hover:bg-teal-500', focusClass: 'focus:border-teal-500'})}
                        </div>
                      </div>
                   )
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                  <h3 className="text-xl font-bold text-rose-400 flex items-center gap-2"><ImageIcon size={20}/> 7. Lançamento Oficial (Imagens)</h3>
                  <button onClick={() => handleGenerateSocialMediaBlock('launchImage')} disabled={isGeneratingSocialBlock['launchImage']} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors border border-slate-700">
                      {isGeneratingSocialBlock['launchImage'] ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>} Regerar Bloco
                  </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(projectData.socialMedia.launchImage || []).map((li, i) => {
                  const promptText = getSocialImagePrompt(li, 'poster');
                  return (
                  <div key={li.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
                    <div className="bg-rose-900/40 text-rose-300 text-xs font-bold px-2 py-1 rounded inline-block w-fit border border-rose-800/50">{getStandardizedSocialTitle('launchImage', i, li.characterName)}</div>
                    {li.teaserPT && <p className="text-sm text-slate-300 italic border-l-2 border-rose-500 pl-3">"{renderText(li.teaserPT)}"</p>}
                    <div className="relative">
                       <textarea readOnly value={promptText} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-rose-100 font-mono resize-none h-24 custom-scrollbar pr-12" />
                       <button onClick={() => handleCopy(promptText, li.id)} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors">{copiedId === li.id ? <Check size={14} className="text-emerald-400"/> : <Copy size={14} className="text-slate-300"/>}</button>
                    </div>
                    {renderPromptActions({ type: 'social_launchImage', id: li.id, item: li, targetField: 'image', onDelete: () => handleDeleteSocialAsset('launchImage', li.id), placeholder: 'Ex: Adiciona confetis...', btnClass: 'bg-rose-600 hover:bg-rose-500', focusClass: 'focus:border-rose-500'})}
                  </div>
                )})}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                  <h3 className="text-xl font-bold text-red-400 flex items-center gap-2"><Video size={20}/> 8. Lançamento Oficial (Vídeos)</h3>
                  <button onClick={() => handleGenerateSocialMediaBlock('launchVideo')} disabled={isGeneratingSocialBlock['launchVideo']} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors border border-slate-700">
                      {isGeneratingSocialBlock['launchVideo'] ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>} Regerar Bloco
                  </button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {(projectData.socialMedia.launchVideo || []).map((lv, i) => {
                   const promptText = getSocialVideoPrompt(lv);
                   return (
                      <div key={lv.id} className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex flex-col lg:flex-row gap-6 shadow-lg">
                        <div className="flex-1 space-y-4">
                           <div className="bg-red-900/40 text-red-300 text-xs font-bold px-2 py-1 rounded inline-block border border-red-800/50">{getStandardizedSocialTitle('launchVideo', i, lv.characterName)}</div>
                           <div><span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Ação e Câmara (PT):</span><p className="text-sm text-slate-200">[{renderText(lv.camera)}] - {renderText(lv.action)}</p></div>
                           <div className="p-3 bg-slate-950/50 rounded-lg border border-red-500/20 text-sm">
                             <strong className="text-red-400 uppercase text-[10px] block mb-1">Diálogo {lv.emotion ? `(${renderText(lv.emotion)})` : ''}:</strong>
                             <span className="text-slate-300 italic">"{renderText(lv.dialogue)}"</span>
                             <label className="flex items-center gap-2 mt-3 pt-2 border-t border-red-500/10 cursor-pointer group">
                               <input type="checkbox" checked={lv.hasSubtitle !== false} onChange={(e) => handleToggleSubtitle('launchVideo', i, e.target.checked)} className="accent-red-500 w-3.5 h-3.5 cursor-pointer" />
                               <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-slate-300 transition-colors">Embutir Legenda no Vídeo</span>
                             </label>
                           </div>
                        </div>
                        <div className="w-full lg:w-[50%] relative flex flex-col">
                           <label className="text-[10px] uppercase font-bold text-red-500 tracking-wider mb-1 block">Prompt Vídeo IA (Vertical)</label>
                           <div className="relative h-full">
                              <textarea readOnly value={promptText} className="w-full h-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-red-100 font-mono min-h-[120px] custom-scrollbar resize-none pr-12" />
                              <button onClick={() => handleCopy(promptText, lv.id)} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors">{copiedId === lv.id ? <Check size={14} className="text-emerald-400"/> : <Copy size={14} className="text-slate-300"/>}</button>
                           </div>
                           {renderPromptActions({ type: 'social_launchVideo', id: lv.id, item: lv, targetField: 'image', onDelete: () => handleDeleteSocialAsset('launchVideo', lv.id), onSplit: () => handleSplitSocialVideo('launchVideo', i), placeholder: 'Ex: Muda o tom da mensagem...', btnClass: 'bg-red-600 hover:bg-red-500', focusClass: 'focus:border-red-500'})}
                        </div>
                      </div>
                   )
                })}
              </div>
            </div>

            </>}

            {/* ── Blocos Extra ── */}
            {(projectData.socialMediaExtraBlocks || []).map((block, bIdx) => (
              <div key={block.id} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-600 pb-2 mb-4">
                  <h3 className="text-xl font-bold text-slate-300 flex items-center gap-2">
                    {block.type === 'video' ? <Video size={20}/> : <ImageIcon size={20}/>}
                    {8 + bIdx + 1}. {block.name}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${block.phase === 'post' ? 'bg-teal-900/50 text-teal-400 border border-teal-700/50' : block.phase === 'premiere' ? 'bg-amber-900/50 text-amber-400 border border-amber-700/50' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                      {block.phase === 'post' ? 'Pós-Estreia' : block.phase === 'premiere' ? 'Estreia' : 'Pré-Estreia'}
                    </span>
                  </h3>
                  <button onClick={() => { saveToProjectHistory(projectData); setProjectData(prev => ({ ...prev, socialMediaExtraBlocks: (prev.socialMediaExtraBlocks || []).filter(b => b.id !== block.id) })); }} className="bg-red-900/30 hover:bg-red-900/60 border border-red-800/50 text-red-300 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors">
                    <Trash2 size={13}/> Remover
                  </button>
                </div>
                <div className={`grid gap-4 ${block.type === 'image' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {(block.items || []).map((item, iIdx) => {
                    const title = `${9 + bIdx}_${String(iIdx + 1).padStart(2, '0')} ${(item.characterName || 'GERAL').toUpperCase()} — ${block.name.toUpperCase()}`;
                    if (block.type === 'image') {
                      const prompt = item.promptEN || '';
                      return (
                        <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
                          <div className="bg-slate-700 text-slate-300 text-xs font-bold px-2 py-1 rounded inline-block">{title}</div>
                          {item.teaserPT && <p className="text-sm text-slate-200 italic">"{renderText(item.teaserPT)}"</p>}
                          <div className="relative">
                            <textarea readOnly value={prompt} rows={4} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-300 font-mono resize-none pr-10"/>
                            <button onClick={() => handleCopy(prompt, item.id)} className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded transition-colors">{copiedId === item.id ? <Check size={13} className="text-emerald-400"/> : <Copy size={13} className="text-slate-400"/>}</button>
                          </div>
                        </div>
                      );
                    } else {
                      const prompt = getSocialVideoPrompt(item);
                      return (
                        <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex flex-col lg:flex-row gap-6">
                          <div className="flex-1 space-y-3">
                            <div className="bg-slate-700 text-slate-300 text-xs font-bold px-2 py-1 rounded inline-block">{title}</div>
                            <p className="text-sm text-slate-200">[{renderText(item.camera)}] — {renderText(item.action)}</p>
                            <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-700 text-sm">
                              <strong className="text-slate-400 uppercase text-[10px] block mb-1">Diálogo:</strong>
                              <span className="text-slate-300 italic">"{renderText(item.dialogue)}"</span>
                            </div>
                          </div>
                          <div className="w-full lg:w-[50%] relative">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Prompt Vídeo IA</label>
                            <div className="relative">
                              <textarea readOnly value={prompt} rows={6} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-300 font-mono resize-none pr-10"/>
                              <button onClick={() => handleCopy(prompt, item.id)} className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded transition-colors">{copiedId === item.id ? <Check size={13} className="text-emerald-400"/> : <Copy size={13} className="text-slate-400"/>}</button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            ))}

            {/* ── Bloco Dia de Estreia ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-amber-800/50 pb-2 mb-4">
                <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                  <ImageIcon size={20}/> Dia de Estreia — Imagem Principal
                  <span className="text-[10px] bg-amber-900/50 text-amber-400 border border-amber-700/50 px-2 py-0.5 rounded-full font-bold uppercase">Estreia · 20h00</span>
                </h3>
                <button
                  onClick={handleGeneratePremiereHeroImage}
                  disabled={isGeneratingPremiereHero}
                  className="bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 font-bold transition-colors"
                >
                  {isGeneratingPremiereHero ? <Loader2 size={14} className="animate-spin"/> : <Wand2 size={14}/>}
                  {projectData.socialPremiereHeroImage ? 'Regenerar' : 'Gerar Imagem'}
                </button>
              </div>
              <p className="text-xs text-slate-500 -mt-2">Imagem da entrada de cinema com cartaz do filme. Usada automaticamente no post das 20h00 do dia de estreia no plano de redes sociais.</p>
              {!projectData.socialPremiereHeroImage ? (
                <div className="flex items-center justify-center p-8 bg-slate-800/30 border border-dashed border-amber-800/40 rounded-xl min-h-[100px]">
                  <p className="text-slate-500 text-sm text-center">Clica em "Gerar Imagem" para criar o prompt da imagem de estreia.</p>
                </div>
              ) : (
                <div className="bg-slate-900 border border-amber-700/40 rounded-xl p-5 flex flex-col md:flex-row gap-5">
                  <div className="flex-1 space-y-3">
                    <div className="bg-amber-900/30 text-amber-300 text-xs font-bold px-2 py-1 rounded inline-block border border-amber-700/50">ESTREIA — CINEMA HERO — {(renderText(projectData.title) || 'FILME').toUpperCase()}</div>
                    <p className="text-sm text-amber-200 italic font-medium">"{renderText(projectData.socialPremiereHeroImage.teaserPT)}"</p>
                    <button onClick={() => { saveToProjectHistory(projectData); setProjectData(prev => ({ ...prev, socialPremiereHeroImage: null })); }} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"><Trash2 size={11}/> Remover</button>
                  </div>
                  <div className="w-full md:w-[55%] relative">
                    <label className="text-[10px] uppercase font-bold text-amber-600 tracking-wider mb-1 block">Prompt Imagem IA (9:16)</label>
                    <div className="relative">
                      <textarea readOnly value={projectData.socialPremiereHeroImage.promptEN} rows={6} className="w-full bg-slate-950 border border-amber-900/40 p-3 rounded-lg text-xs text-amber-100 font-mono resize-none pr-10"/>
                      <button onClick={() => handleCopy(projectData.socialPremiereHeroImage.promptEN, 'premiere_hero')} className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded transition-colors">
                        {copiedId === 'premiere_hero' ? <Check size={13} className="text-emerald-400"/> : <Copy size={13} className="text-amber-400"/>}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Botão Adicionar Bloco ── */}
            <div className="border-t border-slate-700 pt-6">
              {!addingExtraBlock ? (
                <button onClick={() => setAddingExtraBlock(true)} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-600 hover:border-pink-500 text-slate-500 hover:text-pink-400 py-4 rounded-xl font-bold text-sm transition-colors">
                  <Plus size={18}/> Adicionar Bloco Extra
                </button>
              ) : (
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-3">
                  <p className="text-sm font-bold text-slate-300">Novo Bloco — Descreve o tema/conteúdo:</p>
                  <input
                    type="text"
                    value={newExtraBlockPrompt}
                    onChange={e => setNewExtraBlockPrompt(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddExtraBlock(); }}
                    placeholder="Ex: Reações dos fãs, Curiosidades do elenco, Cenas cortadas..."
                    className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-pink-500 outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setAddingExtraBlock(false); setNewExtraBlockPrompt(''); }} className="text-sm text-slate-400 hover:text-white px-4 py-2 transition-colors">Cancelar</button>
                    <button onClick={handleAddExtraBlock} disabled={isGeneratingExtraBlock || !newExtraBlockPrompt.trim()} className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors">
                      {isGeneratingExtraBlock ? <Loader2 size={15} className="animate-spin"/> : <Wand2 size={15}/>}
                      {isGeneratingExtraBlock ? 'A gerar...' : 'Gerar Bloco'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-800 mt-auto">
          <button onClick={() => setCurrentStep(6)} disabled={!projectData.socialMedia} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/50">
             Avançar para Planeamento <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderSocialPlanning = () => {
    const getAssetInfo = (id) => {
        if (!id) return null;
        const soc = projectData.socialMedia;
        const categories = ['characterPosters', 'behindTheScenes', 'behindTheScenesVideo', 'makingOff', 'whoAmI', 'talkToMe', 'launchImage', 'launchVideo'];
        if (soc) {
          for (const cat of categories) {
            const arr = soc[cat] || [];
            const index = arr.findIndex(item => item.id === id);
            if (index > -1) return getStandardizedSocialTitle(cat, index, arr[index].characterName);
          }
        }
        for (const block of (projectData.socialMediaExtraBlocks || [])) {
          const index = (block.items || []).findIndex(item => item.id === id);
          if (index > -1) {
            const item = block.items[index];
            return `${block.name.toUpperCase()} ${String(index+1).padStart(2,'0')} - ${(item.characterName||'GERAL').toUpperCase()}`;
          }
        }
        if (projectData.socialPremiereHeroImage?.id === id) {
          return `ESTREIA 20H00 — CINEMA HERO — ${(renderText(projectData.title)||'FILME').toUpperCase()}`;
        }
        return id; // fallback: mostra o id se não encontrar
    };

    // Lista plana de todos os assets disponíveis para picker manual
    const allSocialAssets = [];
    const soc = projectData.socialMedia;
    const assetCategories = ['characterPosters','behindTheScenes','behindTheScenesVideo','makingOff','whoAmI','talkToMe','launchImage','launchVideo'];
    if (soc) {
      assetCategories.forEach(cat => (soc[cat]||[]).forEach((a,i) => allSocialAssets.push({ id: a.id, name: getStandardizedSocialTitle(cat, i, a.characterName) })));
    }
    (projectData.socialMediaExtraBlocks||[]).forEach(block => (block.items||[]).forEach((a,i) => allSocialAssets.push({ id: a.id, name: `${block.name.toUpperCase()} ${String(i+1).padStart(2,'0')} - ${(a.characterName||'GERAL').toUpperCase()}` })));
    if (projectData.socialPremiereHeroImage) {
      allSocialAssets.push({ id: projectData.socialPremiereHeroImage.id, name: `ESTREIA 20H00 — CINEMA HERO — ${(renderText(projectData.title)||'FILME').toUpperCase()}` });
    }

    return (
      <div className={`space-y-6 animate-fade-in flex flex-col h-full relative`}>
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Calendar className="text-indigo-400" /> Plano de Redes Sociais</h2>
            <p className="text-sm text-slate-400 mt-2">Estratégia de 14 dias: 7 dias de pré-estreia e 7 dias de pós-estreia.</p>
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-lg">
           <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 w-full">
                     <label className="text-xs font-semibold text-slate-400 block mb-2">Dias Corridos (Duração do Plano)</label>
                     <input type="number" min="3" max="60" value={projectData.socialPlanDays || 14} onChange={(e) => handleProjectDataChange('socialPlanDays', Math.max(3, parseInt(e.target.value) || 14))} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-indigo-500 outline-none transition-colors" />
                     <p className="text-[10px] text-slate-500 mt-1">Nº total de dias do plano. O dia de estreia fica no meio: dia {Math.floor((projectData.socialPlanDays || 14) / 2) + 1} de {projectData.socialPlanDays || 14}. Por defeito: 14 dias (estreia no dia 8).</p>
                  </div>
                  <div className="flex-1 w-full">
                     <label className="text-xs font-semibold text-slate-400 block mb-2">Data de Estreia do Filme (Facultativo)</label>
                     <input type="date" value={projectData.socialPlanPremiereDate} onChange={(e) => handleProjectDataChange('socialPlanPremiereDate', e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-indigo-500 outline-none transition-colors" />
                     <p className="text-[10px] text-slate-500 mt-1">Se definires a data, o plano ajusta os dias em torno da estreia. Sem data, mostrará "Dia 01, Dia 02", etc.</p>
                  </div>
                  <div className="flex-[2] w-full">
                     <label className="text-xs font-semibold text-slate-400 block mb-2">Hashtags Obrigatórias nas Legendas</label>
                     <div className="flex items-center gap-2">
                        <label className="flex items-center justify-center cursor-pointer group bg-slate-950 border border-slate-700 p-3 rounded-lg flex-shrink-0 h-[46px] w-[46px]">
                           <input type="checkbox" checked={projectData.socialMediaHashtagsEnabled} onChange={(e) => handleProjectDataChange('socialMediaHashtagsEnabled', e.target.checked)} className="accent-indigo-500 w-4 h-4 cursor-pointer" />
                        </label>
                        <input type="text" value={projectData.socialMediaHashtags} onChange={(e) => handleProjectDataChange('socialMediaHashtags', e.target.value)} disabled={!projectData.socialMediaHashtagsEnabled} placeholder="#Hashtag1 #Hashtag2" className="flex-1 w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-indigo-500 outline-none transition-colors disabled:opacity-50 h-[46px]" />
                     </div>
                     <p className="text-[10px] text-slate-500 mt-1">Estas hashtags serão adicionadas automaticamente a todas as publicações com legenda.</p>
                  </div>
              </div>
              <div className="flex flex-col gap-2">
                 <label className="text-xs font-semibold text-slate-400 block">Link YouTube (Dia da Estreia)</label>
                 <input type="url" value={projectData.socialYoutubeLink || ''} onChange={(e) => handleProjectDataChange('socialYoutubeLink', e.target.value)} placeholder="https://youtu.be/..." className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-indigo-500 outline-none transition-colors" />
                 <p className="text-[10px] text-slate-500">Link do filme no YouTube. Usado automaticamente no post das 20:00 do Dia 8 (estreia), com apelo a seguir o canal <strong className="text-slate-400">koelho2000</strong> e o Instagram <strong className="text-slate-400">@thekbrothers_pt</strong>.</p>
              </div>
              <div className="border-t border-slate-800 pt-4">
                 <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2"><MonitorPlay size={14} className="text-red-400"/> Descrição para YouTube</p>
                 <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                       <label className="text-xs font-semibold text-slate-400 block">Título</label>
                       <input
                          type="text"
                          readOnly
                          value={`${renderText(projectData.title) || ''}${projectData.filmType ? ` | ${renderText(projectData.filmType)}` : ''}${projectData.director ? ` | ${renderText(projectData.director)}` : ''}`}
                          className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm text-white cursor-text select-all outline-none"
                          onClick={e => e.target.select()}
                       />
                       <p className="text-[10px] text-slate-500">Gerado automaticamente: Título | Tipo de Filme | Realizador. Clica para selecionar e copiar.</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                       <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-400 block">Sinopse</label>
                          <button
                             onClick={handleGenerateSinopse}
                             disabled={isGeneratingSinopse}
                             className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                          >
                             {isGeneratingSinopse ? <Loader2 size={12} className="animate-spin"/> : <Wand2 size={12}/>}
                             {isGeneratingSinopse ? 'A gerar...' : 'Gerar com IA'}
                          </button>
                       </div>
                       <textarea
                          value={projectData.socialYoutubeSinopse || ''}
                          onChange={(e) => handleProjectDataChange('socialYoutubeSinopse', e.target.value)}
                          placeholder="Clica em 'Gerar com IA' para criar uma sinopse teaser do filme com hashtags, pronta a copiar para o YouTube..."
                          rows={8}
                          className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-indigo-500 outline-none transition-colors resize-y"
                       />
                       <p className="text-[10px] text-slate-500">Teaser + descrição das personagens + moral da história + hashtags. Editável antes de copiar.</p>
                    </div>
                 </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button onClick={() => openManualPackage('social-plan')} className="flex items-center gap-2 bg-cyan-800/50 hover:bg-cyan-700/60 border border-cyan-700/40 text-cyan-300 px-4 py-3 rounded-xl font-bold text-sm transition-colors">
                    <Copy size={15}/> IA Externa
                  </button>
                  <button onClick={handleGenerateSocialPlan} disabled={isGeneratingSocialPlan || (!projectData.socialMedia && !(projectData.socialMediaExtraBlocks || []).length)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 disabled:opacity-50">
                     {isGeneratingSocialPlan ? <Loader2 size={18} className="animate-spin"/> : <Wand2 size={18}/>}
                     {projectData.socialMediaPlan ? 'Regerar Plano' : 'Gerar Plano'}
                  </button>
              </div>
           </div>
        </div>

        {!projectData.socialMediaPlan ? (
           <div className="flex flex-col items-center justify-center p-12 bg-slate-800/30 border border-slate-700/50 rounded-xl border-dashed min-h-[200px]">
              <Calendar size={48} className="text-slate-600 mb-4" />
              <p className="text-slate-400 text-center">Nenhum planeamento gerado ainda.<br/>Clica no botão acima para criar a estratégia a partir do conteúdo gerado.</p>
           </div>
        ) : (
           <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                 {(projectData.socialMediaPlan.plan || []).map((day, idx) => {
                    const premiereDay = Math.floor((projectData.socialPlanDays || 14) / 2) + 1;
                    const isPremiereDay = day.dayNumber === premiereDay;
                    const isPost = day.phase?.toLowerCase().includes("pós");
                    const rawIds = day.assetIds || (day.assetId ? [day.assetId] : []);
                    // Injeção render-time: premiere hero sempre no post 20h00 do dia de estreia
                    const hero = projectData.socialPremiereHeroImage;
                    const ids = (isPremiereDay && day.time === '20:00' && hero && !rawIds.includes(hero.id))
                      ? [...rawIds, hero.id] : rawIds;
                    const manualAttachments = day.manualAttachments || [];
                    const isHistoria = day.format?.toLowerCase().includes('história') || day.format?.toLowerCase().includes('historias') || day.format?.toLowerCase().includes('stories') || day.format?.toLowerCase() === 'story';
                    const finalCaption = getFinalCaption(day.caption);
                    const isAttachOpen = attachModalIdx === idx;

                    return (
                       <div key={idx} className={`bg-slate-900 border rounded-xl p-5 shadow-sm flex flex-col md:flex-row gap-4 ${isPremiereDay ? 'border-amber-500/80 bg-amber-900/10' : (isPost ? 'border-teal-900/50' : 'border-indigo-900/50')}`}>
                          <div className="md:w-48 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-4 flex flex-col justify-center">
                             <span className={`text-[10px] uppercase font-bold tracking-widest ${isPremiereDay ? 'text-amber-500' : (isPost ? 'text-teal-500' : 'text-indigo-500')}`}>
                                 {isPremiereDay ? '🎬 DIA DA ESTREIA' : day.phase}
                             </span>
                             <strong className="text-lg text-white mt-1">{getDisplayDate(day.dayNumber)}</strong>
                             {day.time && <div className="text-sm font-bold text-slate-400 mt-0.5"><Clock size={12} className="inline mr-1 -mt-0.5"/>{day.time}</div>}
                             <div className="mt-3 inline-block">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase ${
                                   day.format?.toLowerCase().includes('reels') ? 'bg-pink-900/40 text-pink-400 border border-pink-800/50' :
                                   day.format?.toLowerCase().includes('feed') || day.format?.toLowerCase().includes('carrossel') ? 'bg-blue-900/40 text-blue-400 border border-blue-800/50' :
                                   'bg-indigo-900/40 text-indigo-400 border border-indigo-800/50'
                                }`}>{day.format}</span>
                             </div>
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                             <h4 className="text-sm font-bold text-slate-200 mb-1">Publicar: <span className="text-white">{renderText(day.content)}</span></h4>
                             {/* Ficheiros (IA + manuais) */}
                             <div className="mb-2 mt-1">
                               <div className="flex flex-wrap gap-1.5 items-center">
                                 {(ids.length > 0 || manualAttachments.length > 0) && (
                                   <span className="text-[10px] text-slate-500 font-bold uppercase mt-1 mr-1">Ficheiros:</span>
                                 )}
                                 {ids.map(id => {
                                   const info = getAssetInfo(id);
                                   return info ? <span key={id} className="inline-flex items-center gap-1 bg-slate-800 text-indigo-300 text-[10px] px-2 py-1 rounded border border-indigo-500/30">{info}</span> : null;
                                 })}
                                 {manualAttachments.map((att, aIdx) => (
                                   <span key={aIdx} className="inline-flex items-center gap-1 bg-slate-800 text-emerald-300 text-[10px] px-2 py-1 rounded border border-emerald-700/40">
                                     {att.name}
                                     <button onClick={() => updatePlanDay(idx, { manualAttachments: manualAttachments.filter((_,i)=>i!==aIdx) })} className="ml-0.5 text-slate-500 hover:text-red-400 transition-colors"><X size={10}/></button>
                                   </span>
                                 ))}
                                 <button onClick={() => { setAttachModalIdx(isAttachOpen ? null : idx); setAttachFileInput(''); }} className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] px-2 py-1 rounded border border-slate-700 transition-colors">
                                   <Plus size={10}/> Anexar
                                 </button>
                               </div>
                               {isAttachOpen && (
                                 <div className="mt-2 p-3 bg-slate-950 border border-slate-700 rounded-lg space-y-2">
                                   <p className="text-[10px] text-slate-400 font-bold uppercase">Anexar ficheiro:</p>
                                   <div className="flex gap-2 items-center">
                                     <input
                                       type="text"
                                       value={attachFileInput}
                                       onChange={e => setAttachFileInput(e.target.value)}
                                       placeholder="Nome do ficheiro (ex: imagem_cena1.jpg)"
                                       className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white focus:border-emerald-500 outline-none"
                                     />
                                     <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs px-3 py-2 rounded transition-colors flex items-center gap-1.5">
                                       <FolderOpen size={12}/> Explorador
                                       <input type="file" className="hidden" onChange={e => { if(e.target.files[0]) setAttachFileInput(e.target.files[0].name); }} />
                                     </label>
                                   </div>
                                   <div className="flex gap-2 items-center">
                                     <select
                                       defaultValue=""
                                       onChange={e => { if(e.target.value) { const asset = allSocialAssets.find(a=>a.id===e.target.value); if(asset){ updatePlanDay(idx, { manualAttachments: [...manualAttachments, { name: asset.name, socialId: asset.id }] }); setAttachModalIdx(null); } }}}
                                       className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white focus:border-blue-500 outline-none"
                                     >
                                       <option value="">— Ou seleciona do conteúdo Redes Sociais —</option>
                                       {allSocialAssets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                     </select>
                                   </div>
                                   <div className="flex justify-end gap-2 pt-1">
                                     <button onClick={() => setAttachModalIdx(null)} className="text-[10px] text-slate-500 hover:text-white px-3 py-1.5 transition-colors">Cancelar</button>
                                     <button
                                       onClick={() => { if(attachFileInput.trim()){ updatePlanDay(idx, { manualAttachments: [...manualAttachments, { name: attachFileInput.trim() }] }); setAttachFileInput(''); setAttachModalIdx(null); }}}
                                       disabled={!attachFileInput.trim()}
                                       className="text-[10px] bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white px-3 py-1.5 rounded font-bold transition-colors"
                                     >
                                       Confirmar Nome
                                     </button>
                                   </div>
                                 </div>
                               )}
                             </div>
                             {(() => {
                               const showYT = (isPremiereDay || isPost) && !isHistoria;
                               const hasCaption = !isHistoria && day.caption && day.caption.trim() !== "";
                               if (!hasCaption && !showYT) return null;
                               const ytLink = projectData.socialYoutubeLink || 'A DEFINIR';
                               const ytHasLink = !!projectData.socialYoutubeLink;
                               return (
                                 <div className={`mt-1 bg-slate-950 p-3 rounded-lg border relative ${showYT ? (isPremiereDay ? 'border-amber-700/60' : 'border-teal-800/60') : 'border-slate-800'}`}>
                                   <span className={`absolute -top-2.5 left-3 bg-slate-900 px-1 text-[10px] uppercase font-bold tracking-widest ${showYT ? (isPremiereDay ? 'text-amber-400' : 'text-teal-400') : 'text-blue-400'}`}>Legenda / Copy</span>
                                   {hasCaption && <p className="text-sm text-slate-300 italic pt-1 whitespace-pre-wrap">"{renderText(finalCaption)}"</p>}
                                   {showYT && (
                                     <div className={`${hasCaption ? 'mt-2 pt-2 border-t border-slate-800' : 'pt-1'} space-y-0.5`}>
                                       <p className="text-xs flex items-center gap-1.5">
                                         <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">🎬 YouTube:</span>
                                         <span className={`font-mono break-all ${ytHasLink ? 'text-amber-300' : 'text-amber-600 italic'}`}>{ytLink}</span>
                                       </p>
                                       <p className="text-[10px] text-slate-500 italic">📺 Subscreve o canal YouTube <strong className="text-slate-400">koelho2000</strong> · Segue o Instagram <strong className="text-slate-400">@thekbrothers_pt</strong></p>
                                     </div>
                                   )}
                                 </div>
                               );
                             })()}
                             <p className="text-[11px] text-slate-500 uppercase font-bold mt-3">Estratégia: <span className="font-normal text-slate-400 normal-case">{renderText(day.strategy || day.description)}</span></p>
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-800 mt-auto">
          <button onClick={() => setCurrentStep(7)} disabled={!projectData.scenes?.length} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/50">
             Avançar para Banda Sonora <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderSoundtrack = () => (
    <div className="space-y-6 animate-fade-in flex flex-col h-full">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div><h2 className="text-2xl font-bold text-white flex items-center gap-3"><Music className="text-purple-400" /> Banda Sonora</h2></div>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-3 uppercase text-purple-400">1. Escolher Géneros Musicais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[0, 1, 2, 3].map(i => (
             <select key={i} value={(projectData.musicGenres && projectData.musicGenres[i]) ? projectData.musicGenres[i] : ''} onChange={(e) => { const newGenres = [...(projectData.musicGenres || ['', '', '', ''])]; newGenres[i] = e.target.value; handleProjectDataChange('musicGenres', newGenres); }} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-purple-500 outline-none transition-colors">
               <option value="">-- Selecionar Género #{i + 1} --</option>
               {musicCategories.map(cat => <optgroup key={cat.label} label={cat.label}>{cat.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</optgroup>)}
             </select>
          ))}
        </div>

        <h3 className="text-sm font-bold text-white mb-3 uppercase text-purple-400">2. Atmosfera / Mood</h3>
        <select value={projectData.musicMood || ''} onChange={(e) => handleProjectDataChange('musicMood', e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm text-white mb-6 outline-none focus:border-purple-500 transition-colors">
           <option value="">-- Selecionar Atmosfera --</option>{moods.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <h3 className="text-sm font-bold text-white mb-3 uppercase text-purple-400">3. Descrição Opcional</h3>
        <textarea value={projectData.musicDesc || ''} onChange={(e) => handleProjectDataChange('musicDesc', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-sm min-h-[100px] mb-6 outline-none focus:border-purple-500 transition-colors resize-none" />

        <div className="flex justify-end gap-2">
           <button onClick={() => openManualPackage('soundtrack')} className="flex items-center gap-2 bg-cyan-800/50 hover:bg-cyan-700/60 border border-cyan-700/40 text-cyan-300 px-4 py-3 rounded-xl font-bold text-sm transition-colors">
             <Copy size={15}/> IA Externa
           </button>
           <button onClick={generateMusicPrompt} disabled={isGeneratingMusic || !(projectData.musicGenres || []).filter(Boolean).length} className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-xl font-bold text-white text-sm transition-colors flex items-center gap-2 disabled:opacity-50">
             {isGeneratingMusic ? <Loader2 size={16} className="animate-spin"/> : <Wand2 size={16}/>} Gerar Prompt da Música
           </button>
        </div>
      </div>

      {projectData.musicPrompt && (
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-purple-500/30 shadow-lg mt-6">
          <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-3">
             <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2"><Music size={16} className="text-purple-400"/> Prompt Gerado</h3>
             <div className="relative flex-1 max-w-sm"></div>
             <button onClick={() => handleCopy(projectData.musicPrompt, 'music')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors ml-2 border border-slate-700 shadow-sm">
                {copiedId === 'music' ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>} Copiar
             </button>
          </div>
          <p className="font-mono text-sm text-purple-100 leading-relaxed whitespace-pre-wrap bg-slate-950/50 p-4 rounded-lg border border-slate-700/50">{renderText(projectData.musicPrompt)}</p>
          <div className="mt-4 border-t border-slate-700/50 pt-2">
             {renderPromptActions({ type: 'music', id: 'music', item: projectData.musicPrompt, targetField: 'music', onDelete: () => {saveToProjectHistory(projectData); handleProjectDataChange('musicPrompt', '');}, placeholder: 'Ex: Adiciona sons de chuva...', btnClass: 'bg-purple-600 hover:bg-purple-500', focusClass: 'focus:border-purple-500'})}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-slate-800 mt-auto">
        <button onClick={() => setCurrentStep(8)} disabled={!projectData.scenes?.length} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/50">Ver Roteiro Final <ChevronRight size={18} /></button>
      </div>
    </div>
  );

  /* ── TXT para Geração ──────────────────────────────────────────────── */

  const exportTxtPersonagensCenarios = () => {
    const replaceAt = (str) => !str ? '' : str.replace(/anexa na @/g, "anexa na imagem com o mesmo nome").replace(/anexo na @/g, "anexo na imagem com o mesmo nome");
    if (!projectData.characters?.length && !projectData.settings?.length) { alert("Nenhuma personagem ou cenário gerado."); return; }
    let txt = '';
    if (projectData.characters?.length > 0) {
      projectData.characters.forEach(c => {
        txt += `${renderText(c.name).toUpperCase()}\n${replaceAt(resolveCharPrompt(c))}\n\n`;
        txt += `${renderText(c.name).toUpperCase()} (VOZ)\n${replaceAt(resolveCharVoicePrompt(c))}\n\n`;
      });
    }
    if (projectData.settings?.length > 0) {
      projectData.settings.forEach(s => {
        txt += `${renderText(s.name).toUpperCase()}\n${replaceAt(resolveSettingPrompt(s))}\n\n`;
      });
    }
    const blob = new Blob([txt.trimEnd()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TXT_Personagens_Cenarios_${(projectData.title||'Projeto').replace(/[^a-z0-9]/gi,'_').toLowerCase()}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const exportTxtFilme = () => {
    const replaceAt = (str) => !str ? '' : str.replace(/anexa na @/g, "anexa na imagem com o mesmo nome").replace(/anexo na @/g, "anexo na imagem com o mesmo nome");
    if (!projectData.scenes?.length) { alert("Nenhuma cena gerada."); return; }
    let txt = '';
    if (projectData.posterPrompt) {
      txt += `CAPA\n${replaceAt(resolvePosterPrompt())}\n\n`;
    }
    if (projectData.intro) {
      txt += `INTRO\n${replaceAt(resolveIntroPrompt())}\n\n`;
    }
    if (projectData.preface) {
      txt += `PREFÁCIO\n${replaceAt(resolvePrefacePrompt())}\n\n`;
    }
    projectData.scenes.forEach((scene, sIdx) => {
      scene.takes?.forEach((take, tIdx) => {
        const set = projectData.settings?.find(s => s.id === take.settingId);
        txt += `C${sIdx+1}T${tIdx+1}${set ? ` - ${renderText(set.name).toUpperCase()}` : ''}\n${replaceAt(resolveTakePrompt(take, true))}\n\n`;
      });
    });
    if (projectData.outro) {
      txt += `OUTRO\n${replaceAt(resolveOutroPrompt())}\n\n`;
    }
    if (projectData.finalMessages?.length > 0) {
      projectData.finalMessages.forEach((fm, fmIdx) => {
        txt += `QUADRO EXTRA ${fmIdx+1}\n${replaceAt(resolveFinalMessagePrompt(fm))}\n\n`;
      });
    }
    const blob = new Blob([txt.trimEnd()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TXT_Filme_${(projectData.title||'Projeto').replace(/[^a-z0-9]/gi,'_').toLowerCase()}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const exportTxtSocialImagens = () => {
    const replaceAt = (str) => !str ? '' : str.replace(/anexa na @/g, "anexa na imagem com o mesmo nome").replace(/anexo na @/g, "anexo na imagem com o mesmo nome");
    const soc = projectData.socialMedia;
    const antiText = "[IMPORTANTE: Não incluir na imagem o texto com o titulo do prompt, nem PROMPT DE IMAGEM IA (9:16)] ";
    let txt = '';
    // Capa / Poster do Filme
    if (projectData.posterPrompt) {
      txt += `CAPA - POSTER DO FILME\n${antiText}${replaceAt(resolvePosterPrompt())}\n\n`;
    }
    // Blocos de imagem social
    if (soc) {
      if (soc.characterPosters?.length > 0) soc.characterPosters.forEach((p,i) => { txt += `${getStandardizedSocialTitle('characterPosters',i,p.characterName)}\n${antiText}${replaceAt(getSocialImagePrompt(p,'characterPoster'))}\n\n`; });
      if (soc.behindTheScenes?.length > 0) soc.behindTheScenes.forEach((p,i) => { txt += `${getStandardizedSocialTitle('behindTheScenes',i,p.characterName)}\n${antiText}${replaceAt(getSocialImagePrompt(p,'bts'))}\n\n`; });
      if (soc.launchImage?.length > 0) soc.launchImage.forEach((p,i) => { txt += `${getStandardizedSocialTitle('launchImage',i,p.characterName)}\n${antiText}${replaceAt(getSocialImagePrompt(p,'poster'))}\n\n`; });
    }
    // Blocos extra (apenas tipo image)
    (projectData.socialMediaExtraBlocks || []).filter(b => b.type === 'image').forEach(block => {
      (block.items || []).forEach((item, i) => {
        const title = `${block.name.toUpperCase()} ${String(i+1).padStart(2,'0')} - ${(item.characterName||'GERAL').toUpperCase()}`;
        const prompt = item.promptEN || '';
        if (prompt) txt += `${title}\n${antiText}${replaceAt(prompt)}\n\n`;
      });
    });
    // Imagem de Estreia (Cinema Hero)
    if (projectData.socialPremiereHeroImage?.promptEN) {
      const heroTitle = `ESTREIA 20H00 - CINEMA HERO - ${(renderText(projectData.title)||'FILME').toUpperCase()}`;
      txt += `${heroTitle}\n${antiText}${replaceAt(projectData.socialPremiereHeroImage.promptEN)}\n\n`;
    }
    if (!txt.trim()) { alert("Nenhuma imagem encontrada para exportar."); return; }
    const blob = new Blob([txt.trimEnd()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TXT_Social_Imagens_${(projectData.title||'Projeto').replace(/[^a-z0-9]/gi,'_').toLowerCase()}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const exportTxtSocialVideos = () => {
    const replaceAt = (str) => !str ? '' : str.replace(/anexa na @/g, "anexa na imagem com o mesmo nome").replace(/anexo na @/g, "anexo na imagem com o mesmo nome");
    const soc = projectData.socialMedia;
    if (!soc) { alert("Nenhum conteúdo de redes sociais gerado."); return; }
    let txt = '';
    if (soc.behindTheScenesVideo?.length > 0) soc.behindTheScenesVideo.forEach((p,i) => { txt += `${getStandardizedSocialTitle('behindTheScenesVideo',i,p.characterName)}\n${replaceAt(getSocialVideoPrompt(p))}\n\n`; });
    if (soc.makingOff?.length > 0) soc.makingOff.forEach((p,i) => { txt += `${getStandardizedSocialTitle('makingOff',i,p.characterName)}\n${replaceAt(getSocialVideoPrompt(p))}\n\n`; });
    if (soc.whoAmI?.length > 0) soc.whoAmI.forEach((p,i) => { txt += `${getStandardizedSocialTitle('whoAmI',i,p.characterName)}\n${replaceAt(getSocialVideoPrompt(p))}\n\n`; });
    if (soc.talkToMe?.length > 0) soc.talkToMe.forEach((p,i) => { txt += `${getStandardizedSocialTitle('talkToMe',i,p.characterName)}\n${replaceAt(getSocialVideoPrompt(p))}\n\n`; });
    if (soc.launchVideo?.length > 0) soc.launchVideo.forEach((p,i) => { txt += `${getStandardizedSocialTitle('launchVideo',i,p.characterName)}\n${replaceAt(getSocialVideoPrompt(p))}\n\n`; });
    if (!txt) { alert("Nenhum vídeo social gerado."); return; }
    const blob = new Blob([txt.trimEnd()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TXT_Social_Videos_${(projectData.title||'Projeto').replace(/[^a-z0-9]/gi,'_').toLowerCase()}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const renderTxtExport = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3"><FileText className="text-amber-400" /> TXT para Geração</h2>
          <p className="text-sm text-slate-400 mt-2">Exporta os prompts organizados para geração de conteúdo.</p>
        </div>
      </div>
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Exportar Prompts em TXT</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={exportTxtPersonagensCenarios} disabled={!projectData.characters?.length && !projectData.settings?.length} className="bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50 rounded-xl px-5 py-4 font-bold text-sm transition-colors flex items-center gap-3 shadow-sm border border-slate-700 text-left">
            <Users size={20} className="text-blue-400 flex-shrink-0"/>
            <div><div>Exportar Personagens e Cenários</div><div className="text-xs text-slate-400 font-normal mt-0.5">Prompts de imagem e voz por personagem/cenário</div></div>
          </button>
          <button onClick={exportTxtFilme} disabled={!projectData.scenes?.length} className="bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50 rounded-xl px-5 py-4 font-bold text-sm transition-colors flex items-center gap-3 shadow-sm border border-slate-700 text-left">
            <Film size={20} className="text-emerald-400 flex-shrink-0"/>
            <div><div>Exportar Filme</div><div className="text-xs text-slate-400 font-normal mt-0.5">Capa + todos os takes + mensagens finais</div></div>
          </button>
          <button onClick={exportTxtSocialImagens} disabled={!projectData.socialMedia} className="bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50 rounded-xl px-5 py-4 font-bold text-sm transition-colors flex items-center gap-3 shadow-sm border border-slate-700 text-left">
            <ImageIcon size={20} className="text-pink-400 flex-shrink-0"/>
            <div><div>Exportar Social Imagens</div><div className="text-xs text-slate-400 font-normal mt-0.5">Todos os prompts de imagem das redes sociais</div></div>
          </button>
          <button onClick={exportTxtSocialVideos} disabled={!projectData.socialMedia} className="bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50 rounded-xl px-5 py-4 font-bold text-sm transition-colors flex items-center gap-3 shadow-sm border border-slate-700 text-left">
            <Video size={20} className="text-purple-400 flex-shrink-0"/>
            <div><div>Exportar Social Vídeos</div><div className="text-xs text-slate-400 font-normal mt-0.5">Todos os prompts de vídeo das redes sociais</div></div>
          </button>
          <button onClick={exportSocialPlanTXT_Redes} disabled={!projectData.socialMediaPlan?.plan} className="bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50 rounded-xl px-5 py-4 font-bold text-sm transition-colors flex items-center gap-3 shadow-sm border border-slate-700 text-left">
            <Calendar size={20} className="text-indigo-400 flex-shrink-0"/>
            <div><div>Exportar Plano Publicação</div><div className="text-xs text-slate-400 font-normal mt-0.5">Plano completo de publicações</div></div>
          </button>
          <button onClick={exportSocialTitlesTXT} disabled={!projectData.socialMedia} className="bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50 rounded-xl px-5 py-4 font-bold text-sm transition-colors flex items-center gap-3 shadow-sm border border-slate-700 text-left">
            <FileText size={20} className="text-amber-400 flex-shrink-0"/>
            <div><div>Exportar Lista de Títulos</div><div className="text-xs text-slate-400 font-normal mt-0.5">Lista de títulos de todos os conteúdos de redes sociais</div></div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderRoteiroFinal = () => {
    const displayPrompt = (prompt) => !prompt ? '' : (activeRoteiroView === 'global' ? prompt : prompt.replace(/anexa na @/g, "anexa na imagem com o mesmo nome").replace(/anexo na @/g, "anexo na imagem com o mesmo nome"));
    const langStr = renderText(projectData.language) || 'Português (Portugal)';
    const displayLang = langStr === 'Português (Portugal)' ? 'Português de Portugal (NÃO BRASILEIRO)' : langStr;
    let globalTimeFinal = 0;

    return (
      <div className="space-y-6 animate-fade-in flex flex-col h-full relative">
        <div className="sticky top-16 z-30 bg-slate-900/95 backdrop-blur-md px-6 md:px-10 py-4 -mx-6 md:-mx-10 -mt-6 md:-mt-10 border-b border-slate-800 mb-6 rounded-t-3xl flex flex-col xl:flex-row justify-between items-center gap-4 shadow-md">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3"><AlignLeft className="text-blue-400" /> Roteiro Final</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-950/50 p-1.5 rounded-xl border border-slate-700/50 overflow-x-auto">
               <button onClick={() => setActiveRoteiroView('global')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeRoteiroView === 'global' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>Global</button>
               <button onClick={() => setActiveRoteiroView('charactersSettings')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeRoteiroView === 'charactersSettings' ? 'bg-slate-700 text-white border border-slate-600' : 'text-slate-400 hover:bg-slate-800/50'}`}><Users size={14} /> Personagens</button>
               <button onClick={() => setActiveRoteiroView('takes')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeRoteiroView === 'takes' ? 'bg-slate-700 text-white border border-slate-600' : 'text-slate-400 hover:bg-slate-800/50'}`}><Video size={14} /> Cenas</button>
               <button onClick={() => setActiveRoteiroView('finalMessages')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeRoteiroView === 'finalMessages' ? 'bg-slate-700 text-white border border-slate-600' : 'text-slate-400 hover:bg-slate-800/50'}`}><MessageSquare size={14} /> Finais</button>
               <button onClick={() => setActiveRoteiroView('socialMedia')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeRoteiroView === 'socialMedia' ? 'bg-slate-700 text-white border border-slate-600' : 'text-slate-400 hover:bg-slate-800/50'}`}><Share2 size={14} /> Social</button>
               <button onClick={() => setActiveRoteiroView('socialPlan')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeRoteiroView === 'socialPlan' ? 'bg-slate-700 text-white border border-slate-600' : 'text-slate-400 hover:bg-slate-800/50'}`}><Calendar size={14} /> Plano</button>
            </div>
            {activeRoteiroView === 'socialPlan' ? (
                <button onClick={exportSocialPlanHTML} disabled={!projectData.socialMediaPlan?.plan} className="bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 rounded-xl px-4 py-2.5 font-bold text-sm transition-colors flex items-center gap-2"><LayoutTemplate size={16}/> Exportar HTML</button>
            ) : (
                <button onClick={exportHTMLRoteiro} disabled={!projectData.scenes?.length} className="bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 rounded-xl px-4 py-2.5 font-bold text-sm transition-colors flex items-center gap-2"><LayoutTemplate size={16}/> Exportar HTML</button>
            )}
          </div>
        </div>

        {!projectData.scenes?.length ? (
           <div className="flex flex-col items-center justify-center p-12 bg-slate-800/30 border border-slate-700/50 rounded-xl border-dashed">
              <p className="text-slate-400">O roteiro está vazio.</p>
           </div>
        ) : (
          <div className="bg-[#fcfaf2] p-10 md:p-16 rounded-sm shadow-2xl mx-auto w-full max-w-4xl min-h-[800px] text-slate-900 font-mono text-sm leading-relaxed tracking-wide">
             <h1 className="text-3xl font-bold text-center uppercase tracking-widest mb-16 underline underline-offset-8">{renderText(projectData.title)}</h1>

             {(activeRoteiroView === 'global' || activeRoteiroView === 'charactersSettings') && (
                <>
                   {projectData.posterPrompt && (
                     <div className="mb-12"><h2 className="font-bold uppercase text-lg mb-4 border-b-2 border-slate-900 inline-block pb-1">Capa do Filme</h2>
                        <div className="mb-6 bg-slate-100 p-4 border-l-4 border-slate-400"><p className="text-xs text-amber-900 bg-amber-50/50 p-2 border border-amber-200/50"><strong className="uppercase">Prompt Poster:</strong> {displayPrompt(resolvePosterPrompt())}</p></div>
                     </div>
                   )}
                   {projectData.characters && projectData.characters.length > 0 && (
                     <div className="mb-12"><h2 className="font-bold uppercase text-lg mb-4 border-b-2 border-slate-900 inline-block pb-1">Personagens</h2>
                        {projectData.characters.map(c => {
                           const { height, build } = getCharTraits(c);
                           let traitsInfo = "";
                           if (height || build) traitsInfo = ` (${height ? height + (String(height).includes('cm') ? '' : 'cm') : ''}${height && build ? ' - ' : ''}${build || ''})`;
                           return (
                           <div key={c.id} className="mb-6 bg-slate-100 p-4 border-l-4 border-slate-400">
                              <strong className="uppercase block mb-1">{renderText(c.name)}<span className="text-slate-500 normal-case font-normal text-sm">{traitsInfo}</span></strong>
                              <p className="mb-3">{renderText(c.description)}</p>
                              <p className="text-xs text-slate-600 bg-white p-2 border border-slate-300 mb-1"><strong className="uppercase">Prompt Imagem:</strong> {displayPrompt(resolveCharPrompt(c))}</p>
                              <p className="text-xs text-indigo-900 bg-indigo-50/50 p-2 border border-indigo-200/50"><strong className="uppercase">Prompt Voz:</strong> {displayPrompt(resolveCharVoicePrompt(c))}</p>
                           </div>
                           )
                        })}
                     </div>
                   )}
                   {projectData.settings && projectData.settings.length > 0 && (
                     <div className="mb-16"><h2 className="font-bold uppercase text-lg mb-4 border-b-2 border-slate-900 inline-block pb-1">Cenários</h2>
                        {projectData.settings.map(s => (
                           <div key={s.id} className="mb-6 bg-slate-100 p-4 border-l-4 border-slate-400">
                              <strong className="uppercase block mb-1">{renderText(s.name)}</strong>
                              <p className="mb-3">{renderText(s.description)}</p>
                              <p className="text-xs text-slate-600 bg-white p-2 border border-slate-300"><strong className="uppercase">Prompt:</strong> {displayPrompt(resolveSettingPrompt(s))}</p>
                           </div>
                        ))}
                     </div>
                   )}
                </>
             )}

             {(activeRoteiroView === 'global' || activeRoteiroView === 'takes') && (
                <>
                   {projectData.intro && (() => {
                      const startT = globalTimeFinal; globalTimeFinal += (projectData.intro.duration || 0); const endT = globalTimeFinal;
                      const timelineStr = `[${formatDuration(startT)} a ${formatDuration(endT)}]`;
                      return (
                         <div className="mb-12"><h2 className="font-bold uppercase text-lg mb-6 border-b-2 border-cyan-900 text-cyan-900 inline-block pb-1">INTRO (Abertura)</h2>
                            <div className="space-y-4">
                               <div className="font-bold tracking-widest text-cyan-800 flex justify-between items-end border-b border-cyan-200 pb-2">
                                 <span className="uppercase">SEQUÊNCIA DE TÍTULO</span>
                                 <div className="text-right text-[11px] text-cyan-700 flex flex-col uppercase"><span>DURAÇÃO: {stylizeTime(formatDuration(projectData.intro.duration))}</span><span>TIMELINE: {stylizeTime(timelineStr)}</span></div>
                               </div>
                               <p className="px-8 pt-2 text-slate-700">[{renderText(projectData.intro.camera)}] - {renderText(projectData.intro.action)}</p>
                               <div className="px-8 mt-4 mb-6"><div className="bg-cyan-50 p-4 border border-cyan-200 text-xs text-cyan-900 rounded"><strong className="uppercase block mb-1">Prompt de Vídeo IA:</strong> {displayPrompt(resolveIntroPrompt())}</div></div>
                            </div>
                         </div>
                      );
                   })()}

                   {projectData.preface && (() => {
                      const startT = globalTimeFinal; globalTimeFinal += (projectData.preface.duration || 0); const endT = globalTimeFinal;
                      const timelineStr = `[${formatDuration(startT)} a ${formatDuration(endT)}]`;
                      return (
                         <div className="mb-12"><h2 className="font-bold uppercase text-lg mb-6 border-b-2 border-blue-900 text-blue-900 inline-block pb-1">PREFÁCIO</h2>
                            <div className="space-y-4">
                               <div className="font-bold tracking-widest text-blue-800 flex justify-between items-end border-b border-blue-200 pb-2">
                                 <span className="uppercase">PRÓLOGO</span>
                                 <div className="text-right text-[11px] text-blue-700 flex flex-col uppercase"><span>DURAÇÃO: {stylizeTime(formatDuration(projectData.preface.duration))}</span><span>TIMELINE: {stylizeTime(timelineStr)}</span></div>
                               </div>
                               <p className="px-8 pt-2 text-slate-700">[{renderText(projectData.preface.camera)}] - {renderText(projectData.preface.action)}</p>
                               {projectData.preface.narratorText && <div className="px-8 text-center italic mt-2 text-slate-800"><strong>NARRADOR:</strong> "{renderText(projectData.preface.narratorText)}"</div>}
                               <div className="px-8 mt-4 mb-6"><div className="bg-blue-50 p-4 border border-blue-200 text-xs text-blue-900 rounded"><strong className="uppercase block mb-1">Prompt de Vídeo IA:</strong> {displayPrompt(resolvePrefacePrompt())}</div></div>
                            </div>
                         </div>
                      );
                   })()}

                   {projectData.scenes.map((scene, sIdx) => (
                      <div key={scene.id} className="mb-12">
                         <h2 className="font-bold uppercase text-lg mb-6 border-b-2 border-slate-900 flex items-center gap-2 cursor-pointer select-none pb-1 inline-block" onClick={() => toggleScene(`roteiro_${scene.id}`)}>
                           <ChevronRight className={`transition-transform duration-200 ${!expandedScenes[`roteiro_${scene.id}`] ? 'text-slate-400' : 'rotate-90 text-slate-900'}`} size={20} /> CENA {sIdx + 1} - {renderText(scene.title)}
                         </h2>
                         <div className={!expandedScenes[`roteiro_${scene.id}`] ? "hidden" : "space-y-8 pl-2 md:pl-6 border-l-2 border-slate-100"}>
                            {scene.takes?.map((take, tIdx) => {
                               const sceneNarrations = scene.narrations || [];
                               const beforeN = sceneNarrations.filter(n => n.takeId === take.id && n.position === 'before' && !n.isPending);
                               const duringN = sceneNarrations.filter(n => n.takeId === take.id && n.position === 'during' && !n.isPending);
                               const afterN = sceneNarrations.filter(n => n.takeId === take.id && n.position === 'after' && !n.isPending);

                               const set = projectData.settings?.find(s => s.id === take.settingId);
                               const startT = globalTimeFinal; globalTimeFinal += (take.duration || 0); const endT = globalTimeFinal;
                               const timelineStr = `[${formatDuration(startT)} a ${formatDuration(endT)}]`;
                               
                               const chars = (take.characterIds || []).map(id => projectData.characters?.find(c => c.id === id)?.name).filter(Boolean);
                               let refs = [];
                               if (set) refs.push(`Cenário: ${renderText(set.name)}`);
                               if (chars.length > 0) refs.push(`Personagens: ${chars.join(', ')}`);

                               return (
                                  <div key={take.id} className="space-y-4">
                                     <div className="font-bold tracking-widest text-slate-700 flex justify-between items-end border-b border-slate-200 pb-2">
                                      <span className="uppercase">CENA {sIdx + 1} - TAKE {tIdx + 1} {set ? `- EXT/INT. ${renderText(set.name)}` : ''}</span>
                                      <div className="text-right text-[11px] text-slate-500 flex flex-col uppercase"><span>DURAÇÃO: {stylizeTime(formatDuration(take.duration))}</span><span>TIMELINE: {stylizeTime(timelineStr)}</span></div>
                                   </div>

                                   {refs.length > 0 && (
                                      <div className="px-8 text-[10px] text-slate-500 font-bold uppercase mt-2 -mb-2 tracking-wider">
                                          REFS: <span className="text-slate-600">{refs.join(' | ')}</span>
                                      </div>
                                   )}

                                   {beforeN.length > 0 && beforeN.map(n => <div key={n.id} className="flex flex-col items-center text-center mt-2"><span className="uppercase font-bold block ml-12 text-blue-700">NARRADOR (VOZ OFF) diz:</span><p className="w-[60%] text-left mt-1 italic text-slate-800">"{renderText(n.text)}"</p></div>)}

                                   <p className="px-8 text-justify pt-2 text-slate-800">[{renderText(take.camera)}] - {renderText(take.action)}</p>
                                   <div className="px-8 mt-4 mb-6"><div className="bg-slate-100 p-4 border border-slate-300 text-xs text-slate-700 rounded"><strong className="uppercase block mb-1">Prompt de Vídeo IA:</strong> {displayPrompt(resolveTakePrompt(take, true))}</div></div>

                                   {take.dialogues && take.dialogues.length > 0 && (
                                     <div className="space-y-4 mt-6">
                                          {take.dialogues.map((d, i) => (
                                             <div key={i} className="flex flex-col items-center text-center">
                                                <span className="uppercase font-bold block ml-12 text-slate-900">{renderText(d.characterName)} {d.emotion && <span className="lowercase font-normal text-slate-500">({renderText(d.emotion)})</span>} diz:</span>
                                                <p className="w-[60%] text-left mt-1 italic text-slate-800">"{renderText(d.text)}"</p>
                                             </div>
                                          ))}
                                       </div>
                                     )}

                                     {duringN.length > 0 && duringN.map(n => <div key={n.id} className="flex flex-col items-center text-center mt-4"><span className="uppercase font-bold block ml-12 text-blue-700">NARRADOR (VOZ OFF) diz:</span><p className="w-[60%] text-left mt-1 italic text-slate-800">"{renderText(n.text)}"</p></div>)}
                                     {afterN.length > 0 && afterN.map(n => <div key={n.id} className="flex flex-col items-center text-center mt-6"><span className="uppercase font-bold block ml-12 text-blue-700">NARRADOR (VOZ OFF) diz:</span><p className="w-[60%] text-left mt-1 italic text-slate-800">"{renderText(n.text)}"</p></div>)}
                                  </div>
                               )
                            })}
                            {scene.takes?.length > 0 && (
                               <div className="flex justify-start mt-8 border-t-2 border-slate-100 pt-6">
                                  <button onClick={() => toggleScene(`roteiro_${scene.id}`)} className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-200 hover:bg-slate-300 px-5 py-2.5 rounded-full transition-colors"><ChevronUp size={16} /> Recolher Cena {sIdx + 1}</button>
                               </div>
                            )}
                         </div>
                      </div>
                   ))}

                   {projectData.outro && (() => {
                      const startT = globalTimeFinal; globalTimeFinal += (projectData.outro.duration || 0); const endT = globalTimeFinal;
                      const timelineStr = `[${formatDuration(startT)} a ${formatDuration(endT)}]`;
                      return (
                         <div className="mb-12"><h2 className="font-bold uppercase text-lg mb-6 border-b-2 border-fuchsia-900 text-fuchsia-900 inline-block pb-1">OUTRO (Final)</h2>
                            <div className="space-y-4">
                               <div className="font-bold tracking-widest text-fuchsia-800 flex justify-between items-end border-b border-fuchsia-200 pb-2">
                                 <span className="uppercase">CRÉDITOS FINAIS</span>
                                 <div className="text-right text-[11px] text-fuchsia-700 flex flex-col uppercase"><span>DURAÇÃO: {stylizeTime(formatDuration(projectData.outro.duration))}</span><span>TIMELINE: {stylizeTime(timelineStr)}</span></div>
                               </div>
                               <p className="px-8 text-justify pt-2 text-slate-700">[{renderText(projectData.outro.camera)}] - {renderText(projectData.outro.action)}</p>
                               <div className="px-8 mt-4 mb-6"><div className="bg-fuchsia-50 p-4 border border-fuchsia-200 text-xs text-fuchsia-900 rounded"><strong className="uppercase block mb-1">Prompt de Vídeo IA:</strong> {displayPrompt(resolveOutroPrompt())}</div></div>
                            </div>
                         </div>
                      );
                   })()}
                </>
             )}

             {(activeRoteiroView === 'global' || activeRoteiroView === 'finalMessages') && projectData.finalMessages && projectData.finalMessages.length > 0 && (
                 <div className="mb-12"><h2 className="font-bold uppercase text-lg mb-6 border-b-2 border-green-900 text-green-900 inline-block pb-1">MENSAGENS FINAIS (PÓS-CRÉDITOS)</h2>
                    <div className="space-y-8">
                       {projectData.finalMessages.map((fm, fmIdx) => {
                           let startT = 0, endT = 0, timelineStr = '';
                           if (activeRoteiroView === 'global') {
                               startT = globalTimeFinal; globalTimeFinal += (fm.duration || 0); endT = globalTimeFinal;
                               timelineStr = `[${formatDuration(startT)} a ${formatDuration(endT)}]`;
                           } else timelineStr = `[Duração Isolada: ${formatDuration(fm.duration || 0)}]`;
                           return (
                              <div key={fm.id} className="space-y-4">
                                 <div className="font-bold tracking-widest text-green-800 flex justify-between items-end border-b border-green-200 pb-2">
                                   <span className="uppercase">QUADRO EXTRA {fmIdx + 1}</span>
                                   <div className="text-right text-[11px] text-green-700 flex flex-col uppercase"><span>DURAÇÃO: {stylizeTime(formatDuration(fm.duration))}</span><span>TIMELINE: {stylizeTime(timelineStr)}</span></div>
                                 </div>
                                 <p className="px-8 text-justify pt-2 text-slate-700">[{renderText(fm.camera)}] - {renderText(fm.action)}</p>
                                 <div className="px-8 mt-4 mb-6"><div className="bg-green-50 p-4 border border-green-200 text-xs text-green-900 rounded"><strong className="uppercase block mb-1">Prompt de Vídeo IA:</strong> {displayPrompt(resolveFinalMessagePrompt(fm))}</div></div>
                              </div>
                           );
                       })}
                    </div>
                 </div>
             )}

             {(activeRoteiroView === 'global' || activeRoteiroView === 'socialMedia') && projectData.socialMedia && (
                <div className={activeRoteiroView === 'global' ? "mt-16 pt-10 border-t-2 border-pink-900 border-dashed" : ""}>
                   <h2 className="font-bold uppercase text-2xl mb-8 text-pink-700 text-center tracking-widest">Redes Sociais (Promoção)</h2>
                   
                   {projectData.socialMedia.characterPosters?.length > 0 && (
                       <div className="mb-10"><h3 className="font-bold uppercase text-lg mb-4 text-blue-600 border-b border-blue-200 inline-block pb-1">1. Pósteres de Personagem & Teasers</h3>
                           <div className="space-y-6">
                               {projectData.socialMedia.characterPosters.map((cp, i) => {
                                   return (
                                   <div key={cp.id || i} className="bg-blue-50 p-5 border-l-4 border-blue-500 rounded"><strong className="uppercase block mb-2 text-blue-800">{getStandardizedSocialTitle('characterPosters', i, cp.characterName)}</strong>{cp.teaserPT && <p className="mb-3 italic text-slate-700">"{renderText(cp.teaserPT)}"</p>}<div className="bg-white p-3 rounded border border-blue-200 text-xs text-slate-700 font-mono mt-2"><strong className="uppercase block mb-1 text-blue-600">Prompt Imagem (9:16):</strong> {displayPrompt(getSocialImagePrompt(cp, 'characterPoster'))}</div></div>
                                   )
                               })}
                           </div>
                       </div>
                   )}
                   {projectData.socialMedia.behindTheScenes?.length > 0 && (
                       <div className="mb-10"><h3 className="font-bold uppercase text-lg mb-4 text-amber-600 border-b border-amber-200 inline-block pb-1">2. Behind The Scenes (Imagens)</h3>
                           <div className="space-y-6">
                               {projectData.socialMedia.behindTheScenes.map((bts, i) => {
                                   return (
                                   <div key={bts.id || i} className="bg-amber-50 p-5 border-l-4 border-amber-500 rounded"><strong className="uppercase block mb-2 text-amber-800">{getStandardizedSocialTitle('behindTheScenes', i, bts.characterName)}</strong><div className="bg-white p-3 rounded border border-amber-200 text-xs text-slate-700 font-mono mt-2"><strong className="uppercase block mb-1 text-amber-600">Prompt Imagem:</strong> {displayPrompt(getSocialImagePrompt(bts, 'bts'))}</div></div>
                                   )
                               })}
                           </div>
                       </div>
                   )}
                   {projectData.socialMedia.behindTheScenesVideo?.length > 0 && (
                       <div className="mb-10"><h3 className="font-bold uppercase text-lg mb-4 text-orange-600 border-b border-orange-200 inline-block pb-1">3. Behind The Scenes (Vídeo)</h3>
                           <div className="space-y-6">
                               {projectData.socialMedia.behindTheScenesVideo.map((mo, i) => {
                                   return (
                                   <div key={mo.id || i} className="bg-orange-50 p-5 border-l-4 border-orange-500 rounded"><strong className="uppercase block mb-2 text-orange-800">{getStandardizedSocialTitle('behindTheScenesVideo', i, mo.characterName)}</strong><p className="mb-3 text-sm text-slate-700">[{renderText(mo.camera)}] - {renderText(mo.action)}</p>
                                      <div className="flex flex-col items-center text-center mb-4"><span className="uppercase font-bold block text-sm text-orange-900">{renderText(mo.characterName)} {mo.emotion && <span className="lowercase font-normal text-slate-500">({renderText(mo.emotion)})</span>} diz em {displayLang}:</span><p className="w-[60%] text-left mt-1 italic text-slate-800">"{renderText(mo.dialogue)}"</p></div>
                                      <div className="bg-white p-3 rounded border border-orange-200 text-xs text-slate-700 font-mono mt-2"><strong className="uppercase block mb-1 text-orange-600">Prompt Vídeo IA (9:16):</strong> {displayPrompt(getSocialVideoPrompt(mo))}</div></div>
                                   )
                               })}
                           </div>
                       </div>
                   )}
                   {projectData.socialMedia.makingOff?.length > 0 && (
                       <div className="mb-10"><h3 className="font-bold uppercase text-lg mb-4 text-green-600 border-b border-green-200 inline-block pb-1">4. Making OFF (Vídeos)</h3>
                           <div className="space-y-6">
                               {projectData.socialMedia.makingOff.map((mo, i) => {
                                   return (
                                   <div key={mo.id || i} className="bg-green-50 p-5 border-l-4 border-green-500 rounded"><strong className="uppercase block mb-2 text-green-800">{getStandardizedSocialTitle('makingOff', i, mo.characterName)}</strong><p className="mb-3 text-sm text-slate-700">[{renderText(mo.camera)}] - {renderText(mo.action)}</p>
                                      <div className="flex flex-col items-center text-center mb-4"><span className="uppercase font-bold block text-sm text-green-900">{renderText(mo.characterName)} {mo.emotion && <span className="lowercase font-normal text-slate-500">({renderText(mo.emotion)})</span>} diz em {displayLang}:</span><p className="w-[60%] text-left mt-1 italic text-slate-800">"{renderText(mo.dialogue)}"</p></div>
                                      <div className="bg-white p-3 rounded border border-green-200 text-xs text-slate-700 font-mono mt-2"><strong className="uppercase block mb-1 text-green-600">Prompt Vídeo IA (9:16):</strong> {displayPrompt(getSocialVideoPrompt(mo))}</div></div>
                                   )
                               })}
                           </div>
                       </div>
                   )}
                   {projectData.socialMedia.whoAmI?.length > 0 && (
                       <div className="mb-10"><h3 className="font-bold uppercase text-lg mb-4 text-purple-600 border-b border-purple-200 inline-block pb-1">5. Who Am I? (Vídeos)</h3>
                           <div className="space-y-6">
                               {projectData.socialMedia.whoAmI.map((wai, i) => {
                                   return (
                                   <div key={wai.id || i} className="bg-purple-50 p-5 border-l-4 border-purple-500 rounded"><strong className="uppercase block mb-2 text-purple-800">{getStandardizedSocialTitle('whoAmI', i, wai.characterName)}</strong><p className="mb-3 text-sm text-slate-700">[{renderText(wai.camera)}] - {renderText(wai.action)}</p>
                                      <div className="flex flex-col items-center text-center mb-4"><span className="uppercase font-bold block text-sm text-purple-900">{renderText(wai.characterName)} {wai.emotion && <span className="lowercase font-normal text-slate-500">({renderText(wai.emotion)})</span>} diz em {displayLang}:</span><p className="w-[60%] text-left mt-1 italic text-slate-800">"{renderText(wai.dialogue)}"</p></div>
                                      <div className="bg-white p-3 rounded border border-purple-200 text-xs text-slate-700 font-mono mt-2"><strong className="uppercase block mb-1 text-purple-600">Prompt Vídeo IA (9:16):</strong> {displayPrompt(getSocialVideoPrompt(wai))}</div></div>
                                   )
                               })}
                           </div>
                       </div>
                   )}
                   {projectData.socialMedia.talkToMe?.length > 0 && (
                       <div className="mb-10"><h3 className="font-bold uppercase text-lg mb-4 text-teal-600 border-b border-teal-200 inline-block pb-1">6. Talk to Me! (Vídeos Pós-Estreia)</h3>
                           <div className="space-y-6">
                               {projectData.socialMedia.talkToMe.map((ttm, i) => {
                                   return (
                                   <div key={ttm.id || i} className="bg-teal-50 p-5 border-l-4 border-teal-500 rounded"><strong className="uppercase block mb-2 text-teal-800">{getStandardizedSocialTitle('talkToMe', i, ttm.characterName)}</strong><p className="mb-3 text-sm text-slate-700">[{renderText(ttm.camera)}] - {renderText(ttm.action)}</p>
                                      <div className="flex flex-col items-center text-center mb-4"><span className="uppercase font-bold block text-sm text-teal-900">{renderText(ttm.characterName)} {ttm.emotion && <span className="lowercase font-normal text-slate-500">({renderText(ttm.emotion)})</span>} pergunta:</span><p className="w-[60%] text-left mt-1 italic text-slate-800">"{renderText(ttm.dialogue)}"</p></div>
                                      <div className="bg-white p-3 rounded border border-teal-200 text-xs text-slate-700 font-mono mt-2"><strong className="uppercase block mb-1 text-teal-600">Prompt Vídeo IA (9:16):</strong> {displayPrompt(getSocialVideoPrompt(ttm))}</div></div>
                                   )
                               })}
                           </div>
                       </div>
                   )}
                   {projectData.socialMedia.launchImage?.length > 0 && (
                       <div className="mb-10"><h3 className="font-bold uppercase text-lg mb-4 text-rose-600 border-b border-rose-200 inline-block pb-1">7. Lançamento Oficial (Imagens)</h3>
                           <div className="space-y-6">
                               {projectData.socialMedia.launchImage.map((li, i) => {
                                   return (
                                   <div key={li.id || i} className="bg-rose-50 p-5 border-l-4 border-rose-500 rounded"><strong className="uppercase block mb-2 text-rose-800">{getStandardizedSocialTitle('launchImage', i, li.characterName)}</strong>{li.teaserPT && <p className="mb-3 italic text-slate-700">"{renderText(li.teaserPT)}"</p>}<div className="bg-white p-3 rounded border border-rose-200 text-xs text-slate-700 font-mono mt-2"><strong className="uppercase block mb-1 text-rose-600">Prompt Imagem (9:16):</strong> {displayPrompt(getSocialImagePrompt(li, 'poster'))}</div></div>
                                   )
                               })}
                           </div>
                       </div>
                   )}
                   {projectData.socialMedia.launchVideo?.length > 0 && (
                       <div className="mb-10"><h3 className="font-bold uppercase text-lg mb-4 text-red-600 border-b border-red-200 inline-block pb-1">8. Lançamento Oficial (Vídeos)</h3>
                           <div className="space-y-6">
                               {projectData.socialMedia.launchVideo.map((lv, i) => {
                                   return (
                                   <div key={lv.id || i} className="bg-red-50 p-5 border-l-4 border-red-500 rounded"><strong className="uppercase block mb-2 text-red-800">{getStandardizedSocialTitle('launchVideo', i, lv.characterName)}</strong><p className="mb-3 text-sm text-slate-700">[{renderText(lv.camera)}] - {renderText(lv.action)}</p>
                                      <div className="flex flex-col items-center text-center mb-4"><span className="uppercase font-bold block text-sm text-red-900">{renderText(lv.characterName)} {lv.emotion && <span className="lowercase font-normal text-slate-500">({renderText(lv.emotion)})</span>} diz em {displayLang}:</span><p className="w-[60%] text-left mt-1 italic text-slate-800">"{renderText(lv.dialogue)}"</p></div>
                                      <div className="bg-white p-3 rounded border border-red-200 text-xs text-slate-700 font-mono mt-2"><strong className="uppercase block mb-1 text-red-600">Prompt Vídeo IA (9:16):</strong> {displayPrompt(getSocialVideoPrompt(lv))}</div></div>
                                   )
                               })}
                           </div>
                       </div>
                   )}
                </div>
             )}

             {(activeRoteiroView === 'global' || activeRoteiroView === 'socialPlan') && projectData.socialMediaPlan && (
               <div className={activeRoteiroView === 'global' ? "mt-20 pt-10 border-t-2 border-indigo-900 border-dashed" : ""}>
                  <h2 className="font-bold uppercase text-2xl mb-8 text-indigo-700 text-center tracking-widest">Plano de Redes Sociais (14 Dias)</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                       <thead>
                          <tr className="bg-indigo-900 text-white text-left">
                             <th className="p-4 font-bold uppercase text-xs tracking-wider">Data / Dia</th>
                             <th className="p-4 font-bold uppercase text-xs tracking-wider">Hora</th>
                             <th className="p-4 font-bold uppercase text-xs tracking-wider">Fase</th>
                             <th className="p-4 font-bold uppercase text-xs tracking-wider">Formato</th>
                             <th className="p-4 font-bold uppercase text-xs tracking-wider">Conteúdo & Estratégia</th>
                             <th className="p-4 font-bold uppercase text-xs tracking-wider min-w-[200px]">Legenda (Copy)</th>
                             <th className="p-4 font-bold uppercase text-xs tracking-wider">Ficheiros Associados</th>
                          </tr>
                       </thead>
                       <tbody className="text-sm">
                          {(projectData.socialMediaPlan.plan || []).map((day, idx) => {
                             const ids = day.assetIds || (day.assetId ? [day.assetId] : []);
                             let assetInfoHtml = ids.map(id => {
                                 const categories = ['characterPosters', 'behindTheScenes', 'behindTheScenesVideo', 'makingOff', 'whoAmI', 'talkToMe', 'launchImage', 'launchVideo'];
                                 for (const cat of categories) {
                                     const arr = projectData.socialMedia[cat] || [];
                                     const index = arr.findIndex(item => item.id === id);
                                     if (index > -1) {
                                         return getStandardizedSocialTitle(cat, index, arr[index].characterName);
                                     }
                                 }
                                 return null;
                             }).filter(Boolean);

                             const isHistoria = day.format?.toLowerCase().includes('história') || day.format?.toLowerCase().includes('historias') || day.format?.toLowerCase().includes('stories') || day.format?.toLowerCase() === 'story';
                             const finalCaption = getFinalCaption(day.caption);

                             return (
                             <tr key={idx} className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${day.dayNumber === 8 ? 'bg-amber-50' : ''}`}>
                                <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{getDisplayDate(day.dayNumber)}</td>
                                <td className="p-4 font-bold text-slate-600 whitespace-nowrap">{renderText(day.time || '-')}</td>
                                <td className="p-4 text-slate-700">
                                   <span className={`px-2 py-1 rounded text-xs font-bold ${day.dayNumber === 8 ? 'bg-amber-200 text-amber-900' : (day.phase?.toLowerCase().includes("pós") ? "bg-teal-100 text-teal-800" : "bg-indigo-100 text-indigo-800")}`}>
                                      {day.dayNumber === 8 ? 'ESTREIA' : renderText(day.phase)}
                                   </span>
                                </td>
                                <td className="p-4">
                                   <span className="bg-slate-200 text-slate-800 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">{renderText(day.format)}</span>
                                </td>
                                <td className="p-4 font-medium text-slate-800">
                                   {renderText(day.content)}
                                   <div className="text-xs text-slate-500 mt-1 font-normal">({renderText(day.strategy || day.description)})</div>
                                </td>
                                <td className="p-4 text-slate-700 text-xs italic whitespace-pre-wrap">
                                    {!isHistoria && renderText(finalCaption) ? `"${renderText(finalCaption)}"` : <em className="text-slate-400">(Sem legenda associada)</em>}
                                </td>
                                <td className="p-4 text-slate-700 text-xs font-bold">
                                   {assetInfoHtml.length > 0 ? assetInfoHtml.map((info, i) => <div key={i} className="bg-slate-200 px-1.5 py-0.5 rounded inline-block m-0.5">{info}</div>) : '-'}
                                </td>
                             </tr>
                             )
                          })}
                       </tbody>
                    </table>
                  </div>
               </div>
             )}

             {activeRoteiroView === 'global' && projectData.musicPrompt && (
               <div className="mt-20 pt-10 border-t-2 border-slate-900 border-dashed text-center">
                  <h2 className="font-bold uppercase text-xl mb-4 tracking-widest">Banda Sonora</h2>
                  <div className="bg-slate-100 p-6 border-2 border-slate-800 rounded-md mx-auto inline-block text-left text-sm text-slate-700">
                    <p className="whitespace-pre-wrap">{displayPrompt(renderText(projectData.musicPrompt))}</p>
                  </div>
               </div>
             )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {isUpgradingProject && <div className="bg-indigo-600 text-white text-center py-2 text-xs font-bold shadow-lg">A atualizar o teu projeto antigo...</div>}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"><Film size={18} className="text-white" /></div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-white tracking-wide text-lg leading-none flex items-center gap-2">
                K- Magic Prompt 
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">V15</span>
              </span>
              <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold mt-1">The K-Brothers</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <label className="text-slate-400 text-xs mr-4 hidden md:block">Projeto: <strong className="text-white ml-1">{renderText(projectData.title)}</strong></label>
            <button onClick={() => setProjectData(defaultProjectData)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg font-medium transition-colors"><FileText size={16} /> Novo</button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg font-medium relative transition-colors"><FolderOpen size={16} /> Abrir<input type="file" accept=".json" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} /></button>
            <button onClick={handleSaveProject} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg font-bold transition-colors"><Save size={16} /> Gravar</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 pb-24">
        <aside className="w-full md:w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] z-40">
          <div className="w-full h-full relative flex flex-col gap-3">
            <nav className="space-y-2 bg-slate-900/30 p-3 rounded-2xl border border-slate-800/50 flex-shrink-0">
              {[ 
                { id: 'details', title: 'Configuração', icon: <Settings2 size={18} /> }, 
                { id: 'script', title: 'História e Guião', icon: <BookOpen size={18} /> },
                { id: 'chars', title: 'Personagens e Cenários', icon: <Users size={18} /> },
                { id: 'takes', title: 'Cenas / Takes (Vídeo)', icon: <Video size={18} /> },
                { id: 'finalMessages', title: 'Mensagens Finais', icon: <MessageSquare size={18} /> },
                { id: 'socialMedia', title: 'Redes Sociais', icon: <Share2 size={18} /> },
                { id: 'socialPlan', title: 'Plano Redes Sociais', icon: <Calendar size={18} /> },
                { id: 'music', title: 'Banda Sonora', icon: <Music size={18} /> },
                { id: 'roteiro', title: 'Roteiro Final', icon: <AlignLeft size={18} /> },
                { id: 'txt', title: 'TXT para Geração', icon: <FileText size={18} /> }
            ].map((step, index) => {
              const isLocked = index > 1 && (!projectData.scenes || projectData.scenes.length === 0);
              return (
                <button key={step.id} disabled={isLocked} onClick={() => setCurrentStep(index)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left font-bold text-sm tracking-wide transition-all duration-200 ${currentStep === index ? 'bg-blue-600 text-white shadow-lg' : isLocked ? 'opacity-40 cursor-not-allowed text-slate-600' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
                  {step.icon} <span>{step.title}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto bg-slate-900/30 rounded-2xl border border-slate-800/50 flex flex-col shadow-lg flex-shrink-0">
             <div className="p-3 flex flex-col gap-2.5">
                <div className="flex items-center gap-2"><div className="w-6 h-6 bg-indigo-600/20 text-indigo-400 rounded-full flex items-center justify-center"><Wand2 size={12}/></div><span className="text-[11px] font-bold text-white tracking-wide">Assistente IA Global</span></div>
                <div>{isChatProcessing ? (<div className="flex flex-col items-center gap-1 text-indigo-400 text-[10px] font-medium justify-center text-center"><Loader2 size={14} className="animate-spin"/>A processar...</div>) : (<p className="text-[10px] text-slate-400 text-center leading-tight px-1">Acede ao <strong className="text-slate-300">Histórico</strong> ou faz um <strong className="text-indigo-400">Novo Pedido</strong>.</p>)}</div>
                <div className="flex gap-1.5 mt-0.5">
                    <button onClick={() => { setIsHistoryExpanded(false); setIsChatExpanded(true); }} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"><Edit3 size={12}/> Pedido IA</button>
                    <button onClick={() => { setIsChatExpanded(false); setIsHistoryExpanded(true); }} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"><History size={12}/> Histórico</button>
                </div>
             </div>
          </div>

          {/* OVERLAY DO CHAT */}
          {isChatExpanded && (
             <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/50 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col p-5 z-50 animate-fade-in">
                 <div className="flex justify-between items-center pb-3 border-b border-slate-700/50 mb-4 flex-shrink-0"><h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2"><Wand2 size={16}/> Alteração Estrutural</h3><button type="button" onClick={() => setIsChatExpanded(false)} className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg transition-colors"><X size={14}/></button></div>
                 <textarea value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSubmit(); } if (e.key === 'Escape') { setIsChatExpanded(false); e.target.blur(); } }} autoFocus placeholder="Descreve a alteração ao guião..." className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 custom-scrollbar resize-none flex-1 text-sm mb-4 transition-colors" disabled={isChatProcessing} />
                 <button onClick={handleChatSubmit} disabled={isChatProcessing || !chatInput.trim()} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg flex-shrink-0 transition-colors">{isChatProcessing ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}{isChatProcessing ? 'A processar...' : 'Enviar Pedido à IA'}</button>
             </div>
          )}

          {/* OVERLAY DO HISTÓRICO */}
          {isHistoryExpanded && (
             <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/50 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col p-5 z-50 animate-fade-in">
                 <div className="flex justify-between items-center pb-3 border-b border-slate-700/50 mb-4 flex-shrink-0"><h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2"><History size={16}/> Histórico</h3><button type="button" onClick={() => setIsHistoryExpanded(false)} className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg transition-colors"><X size={14}/></button></div>
                 <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar flex flex-col pr-2 pb-4" ref={chatContainerRef}>
                     {activeChatMessages.map(msg => (<div key={msg.id} className={`flex flex-col max-w-[90%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}><div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm'}`}>{msg.text}{msg.isLoading && <Loader2 size={12} className="animate-spin inline ml-2 mt-1"/>}</div></div>))}
                 </div>
             </div>
          )}
          </div>
        </aside>

        <section className="flex-1 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-10 min-h-[600px] shadow-2xl flex flex-col min-w-0">
          {currentStep === 0 && renderDetails()}
          {currentStep === 1 && renderScript()}
          {currentStep === 2 && renderCharactersSettings()}
          {currentStep === 3 && renderTakesAndVideoPrompts()}
          {currentStep === 4 && renderFinalMessages()}
          {currentStep === 5 && renderSocialMedia()}
          {currentStep === 6 && renderSocialPlanning()}
          {currentStep === 7 && renderSoundtrack()}
          {currentStep === 8 && renderRoteiroFinal()}
          {currentStep === 9 && renderTxtExport()}
        </section>
      </main>

      {/* ── Dialog Manual (Copiar/Colar) ── */}
      {manualDialog && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-cyan-700/60 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
                  <Copy size={18}/> Modo Manual — Copiar Prompt / Colar Resposta
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Copia o prompt abaixo, vai ao Gemini (ou outro AI), gera, copia a resposta e cola aqui.</p>
              </div>
              <button onClick={() => { manualDialog.reject(new Error('Cancelado pelo utilizador.')); setManualDialog(null); }} className="text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">1. Prompt a enviar ao Gemini / ChatGPT / Claude.ai</label>
                  <button
                    onClick={() => { navigator.clipboard.writeText(manualDialog.query); }}
                    className="flex items-center gap-1.5 text-xs bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg font-bold transition-colors"
                  >
                    <Copy size={12}/> Copiar Prompt
                  </button>
                </div>
                <textarea
                  readOnly
                  value={manualDialog.query}
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-xs text-slate-300 font-mono resize-none"
                />
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-xs">
                <div className="flex-1 h-px bg-slate-700"/>
                <span>→ Vai ao Gemini, cola o prompt, copia a resposta <strong className="text-slate-300">completa</strong>, cola abaixo ↓</span>
                <div className="flex-1 h-px bg-slate-700"/>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">2. Cola aqui a resposta do Gemini:</label>
                  {manualPasteText.trim() && (
                    <span className="text-[10px] text-slate-500">
                      {manualPasteText.trim().startsWith('{') || manualPasteText.trim().startsWith('[')
                        ? <span className="text-emerald-400">✓ Parece JSON válido</span>
                        : <span className="text-amber-400">⚠ Sem wrapper JSON — a app tentará extrair automaticamente</span>}
                    </span>
                  )}
                </div>
                <textarea
                  value={manualPasteText}
                  onChange={e => setManualPasteText(e.target.value)}
                  rows={10}
                  placeholder="Cola aqui a resposta gerada pelo Gemini / ChatGPT / Claude.ai...&#10;&#10;Dica: se o Gemini devolver texto sem { }, cola na mesma — a app tenta extrair os dados automaticamente."
                  className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-xs text-white font-mono resize-none focus:border-cyan-500 outline-none"
                  autoFocus
                />
                <p className="text-[10px] text-slate-600 mt-1">💡 Se der erro, tenta pedir ao Gemini: <em>"Responde APENAS com JSON puro, sem texto extra, começando por {'{'}"</em></p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
              <button onClick={() => { manualDialog.reject(new Error('Cancelado.')); setManualDialog(null); }} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancelar</button>
              <button
                onClick={() => {
                  if (manualPasteText.trim()) {
                    const result = manualPasteText.trim();
                    manualDialog.resolve(result);
                    setManualDialog(null);
                    setManualPasteText('');
                  }
                }}
                disabled={!manualPasteText.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-sm rounded-xl transition-colors"
              >
                <Check size={16}/> Processar Resposta
              </button>
            </div>
          </div>
        </div>
      )}

      {importAssetsModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2"><Download className="text-indigo-400"/> Importar Personagens e Cenários</h3>
                 <button onClick={() => setImportAssetsModal({ isOpen: false, characters: [], settings: [], selectedCharIds: [], selectedSettingIds: [] })} className="text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
              </div>
              <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                 {importAssetsModal.characters.length > 0 && (
                    <div>
                       <h4 className="text-sm font-bold text-emerald-400 mb-3 border-b border-slate-800 pb-1 flex justify-between"><span>Personagens</span> <button onClick={() => {
                          const allSelected = importAssetsModal.selectedCharIds.length === importAssetsModal.characters.length;
                          setImportAssetsModal(prev => ({ ...prev, selectedCharIds: allSelected ? [] : prev.characters.map(c => c.id) }))
                       }} className="text-xs text-slate-500 hover:text-emerald-400">{importAssetsModal.selectedCharIds.length === importAssetsModal.characters.length ? 'Desmarcar Todos' : 'Selecionar Todos'}</button></h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {importAssetsModal.characters.map(c => (
                             <label key={c.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${importAssetsModal.selectedCharIds.includes(c.id) ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                                <input type="checkbox" className="mt-1 accent-emerald-500 flex-shrink-0" checked={importAssetsModal.selectedCharIds.includes(c.id)} onChange={() => toggleImportSelection('char', c.id)} />
                                <div>
                                   <strong className="text-sm text-white block">{c.name}</strong>
                                   <span className="text-xs text-slate-400 line-clamp-2 mt-0.5">{c.description}</span>
                                </div>
                             </label>
                          ))}
                       </div>
                    </div>
                 )}

                 {importAssetsModal.settings.length > 0 && (
                    <div>
                       <h4 className="text-sm font-bold text-amber-400 mb-3 border-b border-slate-800 pb-1 flex justify-between"><span>Cenários</span> <button onClick={() => {
                          const allSelected = importAssetsModal.selectedSettingIds.length === importAssetsModal.settings.length;
                          setImportAssetsModal(prev => ({ ...prev, selectedSettingIds: allSelected ? [] : prev.settings.map(s => s.id) }))
                       }} className="text-xs text-slate-500 hover:text-amber-400">{importAssetsModal.selectedSettingIds.length === importAssetsModal.settings.length ? 'Desmarcar Todos' : 'Selecionar Todos'}</button></h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {importAssetsModal.settings.map(s => (
                             <label key={s.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${importAssetsModal.selectedSettingIds.includes(s.id) ? 'bg-amber-900/20 border-amber-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                                <input type="checkbox" className="mt-1 accent-amber-500 flex-shrink-0" checked={importAssetsModal.selectedSettingIds.includes(s.id)} onChange={() => toggleImportSelection('setting', s.id)} />
                                <div>
                                   <strong className="text-sm text-white block">{s.name}</strong>
                                   <span className="text-xs text-slate-400 line-clamp-2 mt-0.5">{s.description}</span>
                                </div>
                             </label>
                          ))}
                       </div>
                    </div>
                 )}
              </div>
              <div className="p-5 border-t border-slate-800 flex justify-end gap-3">
                 <button onClick={() => setImportAssetsModal({ isOpen: false, characters: [], settings: [], selectedCharIds: [], selectedSettingIds: [] })} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 transition-colors">Cancelar</button>
                 <button onClick={confirmImportAssets} disabled={importAssetsModal.selectedCharIds.length === 0 && importAssetsModal.selectedSettingIds.length === 0} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
                    Importar Selecionados
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}