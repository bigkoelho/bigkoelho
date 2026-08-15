# Voice Changer

Aplicação web que troca a voz de um ficheiro de áudio pela voz de uma amostra que forneces.

Dás uma amostra de voz (carregas um ficheiro ou gravas pelo microfone), dás o áudio a converter,
e recebes o mesmo áudio — mesmas palavras, mesmo ritmo, mesma entoação — dito com a voz da amostra.

Não é preciso treinar nada: o modelo é *zero-shot*, aprende a voz a partir da amostra no momento da
conversão. Por omissão corre localmente, sem enviar ficheiros para lado nenhum.

## Como funciona

```
amostra de voz ──► limpeza (corte de silêncio, normalização, máx. 30 s) ──┐
                                                                          ├──► modelo de conversão ──► junção ──► WAV/MP3
áudio de origem ──► descodificação (mono, 24 kHz) ──► corte em blocos ────┘
```

1. **Amostra** — cortada nos silêncios do início e do fim, normalizada a −20 LUFS e limitada a 30 s.
   É daqui que sai a identidade da voz, por isso a qualidade da amostra domina a qualidade do resultado.
2. **Origem** — qualquer formato de áudio ou vídeo é descodificado com ffmpeg para mono a 24 kHz.
3. **Blocos** — ficheiros longos são cortados em pedaços de ~20 s, sempre dentro de silêncios, para que
   os cortes fiquem inaudíveis e a memória não dispare. Cada bloco é convertido separadamente.
4. **Junção** — os blocos são unidos com um *crossfade* de 12 ms e exportados em WAV ou MP3, com
   normalização de volume opcional (−16 LUFS).

## Requisitos

- Python 3.10 ou superior
- **ffmpeg** e **ffprobe** no PATH (`sudo apt install ffmpeg` / `brew install ffmpeg`)
- ~2 GB de disco para as dependências e ~1 GB para os pesos do modelo (descarregados na primeira conversão)

Corre em CPU. Se houver GPU NVIDIA disponível, é usada automaticamente.

## Arranque

```bash
cd voice-changer
./run.sh
```

O script cria o `.venv`, instala as dependências e arranca o servidor em <http://127.0.0.1:8000>.
A primeira execução demora alguns minutos a instalar (o PyTorch é grande).

Manualmente:

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Utilização

1. **Voz de referência** — carrega um ficheiro, grava diretamente pelo microfone, ou escolhe uma voz
   já guardada. Entre 10 e 30 segundos de fala limpa (sem música nem ruído de fundo) chegam.
   Marca *Guardar esta voz na biblioteca* para a reutilizares depois sem voltar a enviar a amostra.
2. **Áudio a converter** — o ficheiro cuja voz vai ser substituída. Aceita áudio ou vídeo.
3. **Opções** — formato de saída (WAV ou MP3), motor, modelo e normalização de volume.
   Carrega em *Converter voz*.

O resultado aparece com dois leitores lado a lado (original e convertido) e um botão para descarregar.

> A gravação pelo microfone só funciona em `localhost` ou por HTTPS — é uma restrição dos browsers.

## Motores

| Motor | O que é | Notas |
|---|---|---|
| `coqui` (omissão) | Modelos locais via [coqui-tts](https://pypi.org/project/coqui-tts/) | Offline depois do primeiro download. Sem custos. |
| `elevenlabs` | API de *speech-to-speech* da ElevenLabs | Melhor qualidade. Envia o áudio para o serviço e exige `ELEVENLABS_API_KEY` e um plano com clonagem de voz. |
| `passthrough` | Devolve o áudio original sem converter | Só para testar a aplicação sem carregar modelos. |

### Que modelo escolher

O motor `coqui` traz quatro modelos. Escolhe-os no seletor *Modelo* da interface (troca-se a meio da
sessão, sem reiniciar) ou define o modelo por omissão com `VC_COQUI_MODEL`:

- `freevc` (omissão) — FreeVC 24 kHz. Rápido, estável e o que melhor preserva a articulação.
- `openvoice_v2` / `openvoice_v1` — transferem o timbre preservando melhor a prosódia, e são os
  candidatos naturais para línguas que não o inglês.
- `knnvc` — kNN-VC. Constrói a voz a partir de fragmentos da própria amostra, por isso precisa de
  amostras longas; com 15 s de referência a articulação degrada-se de forma audível.

Medição feita neste projeto, convertendo 7,9 s de fala **em português** (voz masculina, 92 Hz) para
uma voz de referência feminina (171 Hz):

| Modelo | F0 do resultado | Correlação do envelope com a origem | Saída |
|---|---|---|---|
| `freevc` | 186 Hz | **0,91** | 24 kHz |
| `knnvc` | 166 Hz | 0,65 | 16 kHz |

Ambos levam o tom para a gama da referência, mas a correlação do envelope — que mede quanto do
ritmo e da articulação do original sobrevive — separa-os claramente: o `knnvc` esbate a fala.
Daí o `freevc` ser o modelo por omissão.

> O `openvoice_v2` **não pôde ser medido aqui**: os pesos vêm do `huggingface.co`, bloqueado no
> ambiente onde este projeto foi desenvolvido. Numa máquina com acesso normal à internet descarrega
> sem problema — vale a pena compará-lo com o `freevc` na tua própria voz, que é o único teste que
> conta. O resultado indica sempre que modelo o produziu, para a comparação ser justa.

## Configuração

Tudo por variáveis de ambiente:

| Variável | Omissão | Para que serve |
|---|---|---|
| `VC_ENGINE` | `coqui` | Motor usado por omissão |
| `VC_COQUI_MODEL` | `freevc` | Modelo local pré-selecionado (`freevc`, `openvoice_v2`, `openvoice_v1`, `knnvc`) |
| `VC_DEVICE` | `auto` | `auto`, `cpu`, `cuda` ou `mps` |
| `VC_DATA_DIR` | `./data` | Onde ficam vozes, uploads e resultados |
| `VC_CHUNK_SECONDS` | `20` | Tamanho máximo de cada bloco |
| `VC_MAX_UPLOAD_MB` | `200` | Limite por ficheiro |
| `VC_MAX_SOURCE_SECONDS` | `900` | Duração máxima do áudio de origem |
| `VC_MAX_REFERENCE_SECONDS` | `30` | Quanto se aproveita da amostra |
| `VC_JOB_RETENTION_HOURS` | `12` | Quanto tempo os resultados ficam no disco |
| `VC_PRELOAD_ENGINE` | `false` | Carregar o modelo no arranque em vez de na primeira conversão |
| `ELEVENLABS_API_KEY` | — | Ativa o motor na nuvem |

## API

A interface web usa esta API; podes usá-la diretamente.

```bash
# guardar uma voz
curl -X POST localhost:8000/api/voices -F "name=Ana" -F "sample=@amostra.wav"

# converter com uma voz guardada (o campo model é opcional)
curl -X POST localhost:8000/api/convert \
     -F "source=@podcast.mp3" -F "voice_id=0de267467544" \
     -F "output_format=mp3" -F "model=openvoice_v2"

# acompanhar e descarregar
curl localhost:8000/api/jobs/<job_id>
curl -o resultado.mp3 localhost:8000/api/jobs/<job_id>/download
```

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/health` | Estado do servidor, motor e limites |
| `GET` | `/api/engines` | Motores disponíveis |
| `GET` `POST` | `/api/voices` | Listar / criar vozes |
| `GET` `DELETE` | `/api/voices/{id}` | Ouvir amostra (`/sample`) / apagar |
| `POST` | `/api/convert` | Iniciar conversão (devolve `202` com o `id` do trabalho) |
| `GET` | `/api/jobs/{id}` | Estado e progresso |
| `GET` | `/api/jobs/{id}/download` | Resultado (`?inline=true` para reproduzir no browser) |

A conversão é assíncrona: `/api/convert` devolve imediatamente um `id` e o progresso é consultado em
`/api/jobs/{id}`. Os trabalhos são processados um de cada vez, para não duplicar o modelo em memória.

## Testes

```bash
.venv/bin/python -m pytest
```

Os testes correm com o motor `passthrough`, por isso não descarregam modelos nem precisam de GPU.
Cobrem o corte em blocos, a junção, as conversões via ffmpeg e o fluxo completo da API.

## Desempenho medido

Medido neste projeto em 4 vCPU, sem GPU, com o modelo `freevc`:

| Operação | Tempo |
|---|---|
| Carregamento do modelo (só na primeira conversão) | ~22 s |
| Converter 3,9 s de áudio | 1,6 s |
| Converter 51 s de áudio (3 blocos) | 17,1 s |

Ou seja, cerca de 3× mais rápido que tempo real depois do modelo estar carregado. Com `VC_PRELOAD_ENGINE=true`
o carregamento acontece no arranque e a primeira conversão já não paga esse custo.

## Limitações

- O modelo converte **fala**. Música, várias pessoas a falar ao mesmo tempo ou muito ruído de fundo
  degradam bastante o resultado — o ideal é uma voz só, gravada de forma limpa.
- O sotaque e a entoação vêm do áudio de origem; só o timbre vem da amostra.
- O FreeVC foi treinado sobretudo com inglês. Funciona com outras línguas, incluindo português,
  mas a semelhança pode ser menor — se for o teu caso, experimenta o `openvoice_v2` no seletor.
- Os resultados ficam em disco durante `VC_JOB_RETENTION_HOURS` e depois são apagados.
- Não há autenticação: pensada para correr localmente ou atrás de um proxy que trate disso.

## Uso responsável

Usa apenas vozes que sejam tuas ou para as quais tenhas autorização de quem fala. Fazer passar áudio
gerado por declarações reais de outra pessoa é fraude, e em muitos países é crime. A aplicação não
tem forma de o verificar — a responsabilidade é de quem a usa.
