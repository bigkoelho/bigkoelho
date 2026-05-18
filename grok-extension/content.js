if (typeof window.kBrothersInjected === 'undefined') {
  window.kBrothersInjected = true;
  window.kBrothersIsWorking = false;

  function relatarProgresso(index, state, text) {
    chrome.runtime.sendMessage({ action: "update_ui_progress", index, state, text });
  }

  // React-compatible text injection using native value setter
  function injectarTextoReact(el, texto) {
    try {
      if (el.tagName === 'TEXTAREA') {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        if (setter) {
          setter.call(el, texto);
          el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
          el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
          return;
        }
      }
      if (el.isContentEditable) {
        el.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, texto);
        return;
      }
    } catch (e) {}
    // Last resort fallback
    el.focus();
    document.execCommand('insertText', false, texto);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Returns the best NEW media URL, excluding any URL already in blackList.
  // For video: filters blacklist FIRST, then sorts remaining by display area + resolution.
  function obterMediaUrl(tipo, blackList = []) {
    if (tipo === 'video') {
      const scored = Array.from(document.querySelectorAll('video'))
        .map(v => {
          const src = v.src && !v.src.startsWith('blob:null')
            ? v.src
            : v.querySelector('source')?.src || null;
          if (!src || blackList.includes(src)) return null;
          const rect = v.getBoundingClientRect();
          return { src, displayArea: rect.width * rect.height, resolution: (v.videoWidth || 0) * (v.videoHeight || 0) };
        })
        .filter(Boolean);
      if (scored.length === 0) return null;
      scored.sort((a, b) => b.displayArea !== a.displayArea ? b.displayArea - a.displayArea : b.resolution - a.resolution);
      return scored[0].src;
    } else {
      const imgs = Array.from(document.querySelectorAll('img')).filter(img => {
        const alt = (img.getAttribute('alt') || '').toLowerCase();
        const src = img.src || '';
        if (!src || src.startsWith('data:image/svg')) return false;
        if (alt.includes('avatar') || alt.includes('profile') || src.includes('avatar')) return false;
        if (img.width > 0 && img.width < 250) return false;
        if (img.height > 0 && img.height < 250) return false;
        if (blackList.includes(src)) return false;
        return true;
      });
      if (imgs.length > 0) return imgs[imgs.length - 1].src;
    }
    return null;
  }

  function obterTodasUrlsMedia(tipo) {
    const urls = [];
    if (tipo === 'video') {
      document.querySelectorAll('video').forEach(v => {
        if (v.src && !v.src.startsWith('blob:null')) urls.push(v.src);
        const s = v.querySelector('source');
        if (s?.src && !s.src.startsWith('blob:null')) urls.push(s.src);
      });
    } else {
      document.querySelectorAll('img').forEach(img => {
        const alt = (img.getAttribute('alt') || '').toLowerCase();
        if (alt.includes('avatar') || alt.includes('profile')) return;
        if (img.width > 0 && img.width < 250) return;
        if (img.height > 0 && img.height < 250) return;
        if (img.src) urls.push(img.src);
      });
    }
    return urls;
  }

  const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  async function fecharJanelasEModais() {
    // Only close buttons that are INSIDE a visible dialog — never click stray "close"
    // buttons elsewhere on the page (e.g. gallery cards, side-panel toggles).
    const modaisVisiveis = Array.from(document.querySelectorAll(
      'dialog, [role="dialog"], [role="alertdialog"]'
    )).filter(el => el.offsetWidth > 0 && el.offsetHeight > 0);

    for (const modal of modaisVisiveis) {
      const btnFechar = modal.querySelector(
        'button[aria-label*="close" i], button[aria-label*="fechar" i], button[title*="close" i]'
      );
      if (btnFechar) { btnFechar.click(); await esperar(600); break; }
    }

    document.body.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true
    }));
    await esperar(500);
  }

  async function navegarParaImagine() {
    const links = Array.from(document.querySelectorAll('a, button'));
    const btnImagine = links.find(el => {
      const txt = (el.innerText || '').trim().toLowerCase();
      const href = (el.getAttribute('href') || '').toLowerCase();
      if (txt.includes('enhancer')) return false;
      return txt === 'imagine' || href === '/imagine' || href.includes('/imagine');
    });
    if (btnImagine) { btnImagine.click(); await esperar(3000); }
  }

  window.addEventListener('START_GROK_TASK', async (e) => {
    if (window.kBrothersIsWorking) return;
    window.kBrothersIsWorking = true;

    const { originalIndex, titulo, config, prompt, images } = e.detail;

    try {
      relatarProgresso(originalIndex, "running", "Preparação: A limpar a área de trabalho...");
      await fecharJanelasEModais();

      const btnClear = document.querySelector(
        'button[aria-label*="Clear" i], button[aria-label*="New" i], button[aria-label*="Nova" i]'
      );
      if (btnClear) { btnClear.click(); await esperar(1500); }

      await navegarParaImagine();

      relatarProgresso(originalIndex, "running", "Configuração: A definir parâmetros...");

      const clicarExato = (textosEsperados) => {
        const elementos = Array.from(document.querySelectorAll(
          'button, [role="tab"], [role="radio"], [role="option"]'
        ));
        const alvo = elementos.find(el =>
          textosEsperados.includes((el.innerText || '').trim().toLowerCase())
        );
        if (alvo) alvo.click();
        return !!alvo;
      };

      if (config.media === 'video') {
        clicarExato(['video', 'vídeo']);
        await esperar(500);
        clicarExato([config.duration, config.duration.replace('s', ' s'), config.duration.replace('s', ' seconds')]);
        await esperar(500);
        if (config.quality === '480') {
          clicarExato(['480', '480p', 'low', 'baixa', 'standard']);
        } else {
          clicarExato(['720', '720p', 'high', 'alta', 'hd']);
        }
      } else {
        clicarExato(['image', 'imagem', 'photo', 'foto']);
        await esperar(500);
      }
      await esperar(500);
      clicarExato([config.ratio]);
      await esperar(1500);

      // STEP 1: ATTACH IMAGES
      if (images.length > 0) {
        relatarProgresso(originalIndex, "running", `Passo 1: A anexar ${images.length} imagem(ns)...`);

        const inputsFicheiro = document.querySelectorAll('input[type="file"]');
        const fileInput = inputsFicheiro.length > 0 ? inputsFicheiro[inputsFicheiro.length - 1] : null;

        if (fileInput) {
          // Baseline: count small visible images already in the compose area BEFORE upload
          const obterThumbnailsCompose = () => {
            const ta = document.querySelector('textarea[placeholder*="Imagine" i]') ||
                       document.querySelector('textarea[placeholder*="Message" i]') ||
                       document.querySelector('textarea[placeholder*="Grok" i]') ||
                       document.querySelector('textarea[placeholder*="Mensagem" i]');
            let container = ta ? ta.parentElement : document.body;
            for (let i = 0; i < 6 && container && container.tagName !== 'BODY'; i++) {
              container = container.parentElement;
            }
            return Array.from((container || document.body).querySelectorAll('img')).filter(img => {
              const src = img.src || '';
              return src && !src.startsWith('data:image/svg') &&
                     img.offsetWidth > 5 && img.offsetWidth < 200 && img.offsetHeight > 5;
            }).length;
          };

          const thumbsAntes = obterThumbnailsCompose();

          const dataTransfer = new DataTransfer();
          for (let img of images) {
            const res = await fetch(img.data);
            dataTransfer.items.add(new File([await res.blob()], img.name, { type: img.type }));
          }
          fileInput.files = dataTransfer.files;
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));

          // Wait until Grok shows thumbnails for ALL uploaded images in the compose area
          relatarProgresso(originalIndex, "running", `Passo 1: A aguardar confirmação do carregamento...`);
          let uploadConfirmado = false;
          for (let chk = 1; chk <= 40; chk++) { // max 80s
            await esperar(2000);
            const thumbsDepois = obterThumbnailsCompose();
            if (thumbsDepois >= thumbsAntes + images.length) {
              uploadConfirmado = true;
              relatarProgresso(originalIndex, "running", `Passo 1: ${images.length} imagem(ns) confirmada(s)!`);
              await esperar(1000);
              break;
            }
            relatarProgresso(originalIndex, "running", `Passo 1: A carregar imagens... ${chk * 2}s`);
          }

          if (!uploadConfirmado) {
            relatarProgresso(originalIndex, "running", `Passo 1: Aviso — upload não confirmado visualmente. A continuar...`);
            await esperar(3000);
          }
        } else {
          relatarProgresso(originalIndex, "error", "Falha: Caixa de anexo bloqueada pelo Grok.");
          chrome.runtime.sendMessage({ action: "task_done" });
          window.kBrothersIsWorking = false;
          return;
        }
      }

      // STEPS 2 & 3: INJECT PROMPT AND SEND
      relatarProgresso(originalIndex, "running", "Passo 2: A escrever o prompt...");
      let pedidoEnviado = false;
      let urlsAnteriores = [];

      for (let tentativa = 1; tentativa <= 15; tentativa++) {
        const modalAberto = Array.from(document.querySelectorAll(
          'textarea, input, [contenteditable="true"], [role="textbox"]'
        )).find(el => {
          const ph = (el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
          return (ph.includes('ediç') || ph.includes('edit') || ph.includes('descreva') || ph.includes('describe'))
            && el.offsetWidth > 0;
        });

        if (modalAberto) {
          relatarProgresso(originalIndex, "running", `Passo 2: A fechar modal intruso...`);
          await fecharJanelasEModais();
          await esperar(1500);
          continue;
        }

        let tx = document.querySelector('textarea[placeholder*="Imagine" i]') ||
          document.querySelector('textarea[placeholder*="Grok" i]') ||
          document.querySelector('textarea[placeholder*="Message" i]') ||
          document.querySelector('textarea[placeholder*="Mensagem" i]');

        if (!tx) {
          const caixas = Array.from(document.querySelectorAll('textarea, [contenteditable="true"]'));
          tx = caixas.reverse().find(el => {
            const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
            if (placeholder.includes('ediç') || placeholder.includes('edit') || placeholder.includes('descreva')) return false;
            const style = window.getComputedStyle(el);
            return el.offsetWidth > 10 && el.offsetHeight > 10 && !el.disabled
              && style.opacity !== '0' && style.visibility !== 'hidden' && style.display !== 'none';
          });
        }

        if (!tx) { await esperar(1000); continue; }

        tx.focus();
        const textoAntes = tx.value || tx.textContent || "";

        if (textoAntes.trim().length < 5) {
          relatarProgresso(originalIndex, "running", `Passo 2: A injetar prompt... (Tentativa ${tentativa})`);
          injectarTextoReact(tx, prompt);
          await esperar(2500);
          continue;
        }

        const textoValidado = tx.value || tx.textContent || "";
        if (textoValidado.trim().length >= 5) {
          relatarProgresso(originalIndex, "running", `Passo 3: A enviar pedido único...`);

          const botoesSend = Array.from(document.querySelectorAll('button')).filter(b => {
            const aria = (b.getAttribute('aria-label') || '' + b.getAttribute('title') || '' + b.innerText).toLowerCase();
            if (aria.includes('upload') || aria.includes('image') || aria.includes('attach') || aria.includes('anexo')) return false;
            if (b.type === 'submit') return true;
            return aria === 'send message' || aria === 'send' || aria === 'enviar mensagem' ||
              aria === 'enviar' || aria.includes('submit') || aria.includes('grok');
          });

          const btnSend = botoesSend.reverse().find(b => b.offsetWidth > 0 && !b.disabled);
          urlsAnteriores = obterTodasUrlsMedia(config.media);

          if (btnSend) {
            btnSend.click();
          } else if (images.length === 0) {
            // Only use keyboard Enter when there are no attached images.
            // If images are present and the send button is disabled, Grok is still
            // processing the uploads — using Enter would skip the reference images.
            tx.dispatchEvent(new KeyboardEvent('keydown', {
              key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true
            }));
          } else {
            // Images attached but send button still disabled — wait for next iteration
            relatarProgresso(originalIndex, "running", `Passo 3: A aguardar que o Grok processe as imagens...`);
          }

          await esperar(3000);

          const textoPosEnvio = tx.value || tx.textContent || "";
          const progressEl = Array.from(document.querySelectorAll('div, span, p')).find(el =>
            el.innerText && /^\d{1,3}%$/.test(el.innerText.trim())
          );
          const btnStop = document.querySelector('button[aria-label*="Stop" i], button[aria-label*="Cancel" i]');

          if (textoPosEnvio.trim().length < 5 || progressEl || btnStop) {
            pedidoEnviado = true;
            relatarProgresso(originalIndex, "running", "Passo 3: Pedido submetido com sucesso!");
            break;
          }
        }
      }

      if (!pedidoEnviado) {
        relatarProgresso(originalIndex, "error", "Erro fatal: Interface encravou — impossível enviar.");
        chrome.runtime.sendMessage({ action: "task_done" });
        window.kBrothersIsWorking = false;
        return;
      }

      // STEP 4: WAIT FOR GENERATION
      relatarProgresso(originalIndex, "running", "Passo 4: A aguardar geração pela IA...");
      let geracaoTerminada = false;
      let urlEmProcessamento = null;
      let contadorEstabilidade = 0;
      let contadorBotaoDownload = 0;
      const maxIteracoes = config.media === 'video' ? 300 : 150; // 10min / 5min

      for (let t = 1; t <= maxIteracoes; t++) {
        await esperar(2000);

        const btnStop = document.querySelector('button[aria-label*="Stop" i], button[aria-label*="Cancel" i]');
        // Blacklist is already applied inside obterMediaUrl — returns only new URLs
        const urlVerificacao = obterMediaUrl(config.media, urlsAnteriores);

        const modalEdicaoAberto = Array.from(document.querySelectorAll(
          'textarea, input, [contenteditable="true"], [role="textbox"]'
        )).find(el => {
          const ph = (el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
          return (ph.includes('ediç') || ph.includes('edit') || ph.includes('descreva') || ph.includes('describe'))
            && el.offsetWidth > 0;
        });

        if (modalEdicaoAberto) {
          relatarProgresso(originalIndex, "running", "Passo 4 Concluído: Grok finalizou a geração!");
          geracaoTerminada = true;
          break;
        }

        // Primary signal: native download button visible without stop button = generation done
        const btnDownloadNativo = Array.from(document.querySelectorAll('button, a, [role="button"]')).find(el => {
          const aria = (el.getAttribute('aria-label') || '').toLowerCase();
          const title = (el.getAttribute('title') || '').toLowerCase();
          return aria.includes('download') || aria.includes('baixar') || aria.includes('guardar') ||
            aria.includes('save') || title.includes('download');
        });

        if (btnDownloadNativo && !btnStop) {
          contadorBotaoDownload++;
          if (contadorBotaoDownload >= 5) { // 10s stable with download button = final version ready
            relatarProgresso(originalIndex, "running", "Passo 4 Concluído: Ficheiro pronto para download!");
            geracaoTerminada = true;
            break;
          }
        } else {
          contadorBotaoDownload = 0;
        }

        if (urlVerificacao) {
          if (urlVerificacao !== urlEmProcessamento) {
            // URL changed — Grok started a second enhancement pass; reset stability counter
            urlEmProcessamento = urlVerificacao;
            contadorEstabilidade = 0;
            contadorBotaoDownload = 0;
            relatarProgresso(originalIndex, "running", `Passo 4: Nova versão detetada, a aguardar melhoria...`);
          } else if (!btnStop) {
            contadorEstabilidade++;
            // Wait 20 stable iterations (40s). If the URL changes (draft→final enhancement),
            // the counter resets so we always capture the enhanced video.
            if (contadorEstabilidade >= 20) {
              relatarProgresso(originalIndex, "running", "Passo 4 Concluído: Versão final confirmada!");
              geracaoTerminada = true;
              break;
            } else {
              relatarProgresso(originalIndex, "running", `Passo 4: A confirmar versão final (${contadorEstabilidade}/20)...`);
            }
          } else {
            relatarProgresso(originalIndex, "running", `Passo 4: IA a processar...`);
          }
        } else {
          const progressEl = Array.from(document.querySelectorAll('div, span, p')).find(el =>
            el.innerText && /^\d{1,3}%$/.test(el.innerText.trim())
          );
          // Detect Grok server errors (toast messages, error banners)
          const erroServidor = Array.from(document.querySelectorAll(
            '[class*="error" i], [class*="toast" i], [role="alert"]'
          )).find(el => {
            const txt = (el.innerText || '').trim();
            return txt.length > 5 && txt.length < 300 &&
              /something went wrong|try again|server error|falhou|tente novamente/i.test(txt);
          });
          if (erroServidor) {
            relatarProgresso(originalIndex, "error", `Erro do servidor Grok. A avançar para o próximo.`);
            geracaoTerminada = true;
            break;
          } else if (progressEl) {
            relatarProgresso(originalIndex, "running", `Passo 4: A renderizar (${progressEl.innerText.trim()})...`);
          } else {
            const tempoEst = config.media === 'video' ? '~2-4 min' : '~30s';
            relatarProgresso(originalIndex, "running", `Passo 4: A aguardar resposta... ${t * 2}s (estimado ${tempoEst})`);
          }
        }
      }

      if (!geracaoTerminada) {
        relatarProgresso(originalIndex, "error", "Erro: Tempo limite excedido na geração.");
        chrome.runtime.sendMessage({ action: "task_done" });
        window.kBrothersIsWorking = false;
        return;
      }

      // STEP 5: DOWNLOAD
      relatarProgresso(originalIndex, "running", "Passo 5: A guardar ficheiro...");
      let ficheiroSalvo = false;
      const nomeLimpo = titulo.replace(/[^a-zA-Z0-9\s_-]/g, '').trim().replace(/\s+/g, '_') || 'KBrothers_Media';
      const pastaOutput = config.folder
        ? config.folder.replace(/[^a-zA-Z0-9\s_-]/g, '').trim().replace(/\s+/g, '_') + '/'
        : '';
      const extensao = config.media === 'video' ? '.mp4' : '.png';
      const nomeFicheiro = pastaOutput + nomeLimpo + extensao;

      for (let tentaDown = 1; tentaDown <= 5; tentaDown++) {
        await esperar(2000);

        const urlFinalDownload = obterMediaUrl(config.media, urlsAnteriores);

        if (urlFinalDownload) {
          if (urlFinalDownload.startsWith('blob:')) {
            // Fetch the blob from the page context (content script has access),
            // convert to a data URL and send to background. background.js then calls
            // chrome.downloads.download({ url: dataUrl, filename }) which guarantees
            // the correct filename — bypassing <a> tag / onDeterminingFilename issues.
            try {
              relatarProgresso(originalIndex, "running", "Passo 5: A preparar ficheiro...");
              const res = await fetch(urlFinalDownload);
              const blob = await res.blob();
              const dataUrl = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              });
              chrome.runtime.sendMessage({ action: "download_media", url: dataUrl, filename: nomeFicheiro });
              relatarProgresso(originalIndex, "done", `Guardado: ${nomeFicheiro}`);
              ficheiroSalvo = true;
              break;
            } catch (fetchErr) {
              // Fallback: <a> tag click (less reliable for filename)
              await chrome.runtime.sendMessage({ action: "expect_download", filename: nomeFicheiro });
              const a = document.createElement('a');
              a.href = urlFinalDownload;
              a.download = nomeLimpo;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              relatarProgresso(originalIndex, "done", `Guardado: ${nomeFicheiro}`);
              ficheiroSalvo = true;
              break;
            }
          } else if (!urlFinalDownload.startsWith('data:')) {
            chrome.runtime.sendMessage({ action: "download_media", url: urlFinalDownload, filename: nomeFicheiro });
            relatarProgresso(originalIndex, "done", `Guardado: ${nomeFicheiro}`);
            ficheiroSalvo = true;
            break;
          }
        }

        // Fallback: native download buttons
        const botoesDownload = Array.from(document.querySelectorAll('button, a, [role="button"]')).filter(el => {
          const aria = (el.getAttribute('aria-label') || '').toLowerCase();
          const title = (el.getAttribute('title') || '').toLowerCase();
          const inner = (el.innerHTML || '').toLowerCase();
          return aria.includes('download') || aria.includes('baixar') || aria.includes('guardar') ||
            aria.includes('save') || title.includes('download') || inner.includes('<title>download</title>');
        });

        if (botoesDownload.length > 0) {
          await chrome.runtime.sendMessage({ action: "expect_download", filename: nomeFicheiro });
          botoesDownload[botoesDownload.length - 1].click();
          relatarProgresso(originalIndex, "done", `Guardado via botão nativo: ${nomeFicheiro}`);
          ficheiroSalvo = true;
          break;
        }
      }

      if (!ficheiroSalvo) {
        relatarProgresso(originalIndex, "error", "Erro: Não foi possível descarregar o ficheiro gerado.");
      }

      await esperar(1500);
      await fecharJanelasEModais();
      await esperar(2000);
      chrome.runtime.sendMessage({ action: "task_done" });

    } catch (err) {
      relatarProgresso(originalIndex, "error", `Erro inesperado: ${err.message || 'Verifique o Grok.'}`);
      chrome.runtime.sendMessage({ action: "task_done" });
    } finally {
      window.kBrothersIsWorking = false;
    }
  });
}
