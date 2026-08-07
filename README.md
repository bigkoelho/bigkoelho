# Transcrever

Aplicação web para transcrição de áudio e vídeo em texto, usando
[Whisper](https://github.com/SYSTRAN/faster-whisper). Todo o processamento
acontece localmente — nenhum arquivo é enviado para serviços externos.

## Recursos

- Upload por arrastar-e-soltar ou seleção de arquivo
- Gravação direta pelo microfone do navegador
- Detecção automática de idioma (ou seleção manual)
- Tradução para inglês além da transcrição
- Exportação em texto puro, SRT e VTT (com timestamps)
- Segmentos com marcação de tempo

## Instalação

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Execução

```bash
uvicorn app.main:app --reload
```

Acesse http://127.0.0.1:8000

Na primeira execução o modelo Whisper é baixado do Hugging Face
(~150 MB para o modelo `base`) e fica em cache localmente.

## Configuração

Variáveis de ambiente opcionais:

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `WHISPER_MODEL` | `base` | `tiny`, `base`, `small`, `medium`, `large-v3` |
| `WHISPER_DEVICE` | `cpu` | `cpu` ou `cuda` |
| `WHISPER_COMPUTE_TYPE` | `int8` | `int8`, `float16`, `float32` |
| `MAX_UPLOAD_MB` | `200` | Tamanho máximo de upload |

Modelos maiores são mais precisos e mais lentos. Com GPU:

```bash
WHISPER_MODEL=large-v3 WHISPER_DEVICE=cuda WHISPER_COMPUTE_TYPE=float16 uvicorn app.main:app
```

## API

### `POST /api/transcribe`

Campos do formulário: `file` (obrigatório), `language` (opcional, vazio =
detecção automática), `task` (`transcribe` ou `translate`).

```bash
curl -X POST -F "file=@audio.mp3" -F "language=pt" \
  http://127.0.0.1:8000/api/transcribe
```

Resposta:

```json
{
  "text": "Olá, isto é um teste.",
  "segments": [{ "id": 0, "start": 0.0, "end": 2.4, "text": "Olá, isto é um teste." }],
  "language": "pt",
  "language_probability": 0.987,
  "duration": 5.0,
  "srt": "1\n00:00:00,000 --> 00:00:02,400\n...",
  "vtt": "WEBVTT\n\n00:00:00.000 --> 00:00:02.400\n..."
}
```

### `GET /api/health`

Retorna o status do serviço e o modelo configurado.

## Formatos suportados

MP3, WAV, M4A, OGG, OPUS, FLAC, WEBM, MP4, MPEG, AAC, WMA, MOV, AVI, MKV.

Arquivos enviados são gravados temporariamente e removidos assim que a
transcrição termina.
