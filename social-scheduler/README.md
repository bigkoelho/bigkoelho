# Social Media Scheduler

Agenda e publica automaticamente posts no **Instagram** e **Facebook** a partir de um ficheiro CSV.

## Instalação

```bash
cd social-scheduler
pip install -r requirements.txt
python app.py
```

Abre o browser em **http://localhost:5000**

## Configuração da Meta API

1. Vai a [developers.facebook.com](https://developers.facebook.com) → Graph API Explorer
2. Seleciona a tua app e a tua Page
3. Gera um **Page Access Token** com as permissões:
   - `pages_manage_posts`
   - `instagram_basic`
   - `instagram_content_publish`
4. Vai a **Configurações** na app e preenche:
   - **Facebook Page ID** — encontras no "About" da página
   - **Facebook Page Access Token** — gerado no passo 3
   - **Instagram Business Account ID** — encontras via `GET /me/accounts` e depois `GET /{page-id}?fields=instagram_business_account`

## Formato do CSV

| Coluna | Obrigatório | Exemplo |
|--------|-------------|---------|
| date | ✓ | 2026-05-20 |
| time | ✓ | 09:00 |
| message | ✓ | Texto do post |
| image_url | — | https://example.com/img.jpg |
| platforms | — | instagram,facebook |

> **Nota:** Instagram requer sempre uma `image_url`. Datas/horas em UTC.
