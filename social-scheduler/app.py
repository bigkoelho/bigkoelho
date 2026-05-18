import os
import csv
import io
import json
import sqlite3
import requests
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="static")
DB_PATH = os.path.join(os.path.dirname(__file__), "posts.db")

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scheduled_at TEXT NOT NULL,
                message TEXT NOT NULL,
                image_url TEXT,
                platforms TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                error TEXT,
                published_at TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS config (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        """)

# ---------------------------------------------------------------------------
# Meta Graph API helpers
# ---------------------------------------------------------------------------

GRAPH = "https://graph.facebook.com/v19.0"

def get_config():
    with get_db() as conn:
        rows = conn.execute("SELECT key, value FROM config").fetchall()
    return {r["key"]: r["value"] for r in rows}

def publish_facebook(cfg, message, image_url):
    page_id = cfg.get("fb_page_id")
    token = cfg.get("fb_page_token")
    if not page_id or not token:
        raise ValueError("Facebook Page ID e Page Token não configurados")

    if image_url:
        resp = requests.post(f"{GRAPH}/{page_id}/photos", data={
            "url": image_url,
            "caption": message,
            "access_token": token,
        }, timeout=30)
    else:
        resp = requests.post(f"{GRAPH}/{page_id}/feed", data={
            "message": message,
            "access_token": token,
        }, timeout=30)

    data = resp.json()
    if "error" in data:
        raise RuntimeError(data["error"]["message"])
    return data.get("id") or data.get("post_id")

def publish_instagram(cfg, message, image_url):
    ig_id = cfg.get("ig_account_id")
    token = cfg.get("fb_page_token")
    if not ig_id or not token:
        raise ValueError("Instagram Account ID e Page Token não configurados")
    if not image_url:
        raise ValueError("Instagram requer uma imagem (image_url)")

    # Step 1: create media container
    r1 = requests.post(f"{GRAPH}/{ig_id}/media", data={
        "image_url": image_url,
        "caption": message,
        "access_token": token,
    }, timeout=30)
    d1 = r1.json()
    if "error" in d1:
        raise RuntimeError(d1["error"]["message"])
    container_id = d1["id"]

    # Step 2: publish container
    r2 = requests.post(f"{GRAPH}/{ig_id}/media_publish", data={
        "creation_id": container_id,
        "access_token": token,
    }, timeout=30)
    d2 = r2.json()
    if "error" in d2:
        raise RuntimeError(d2["error"]["message"])
    return d2.get("id")

# ---------------------------------------------------------------------------
# Scheduler job
# ---------------------------------------------------------------------------

def run_due_posts():
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    with get_db() as conn:
        due = conn.execute(
            "SELECT * FROM posts WHERE status='pending' AND scheduled_at <= ?",
            (now + ":59",)
        ).fetchall()

    cfg = get_config()
    for post in due:
        platforms = [p.strip() for p in post["platforms"].split(",")]
        errors = []
        success = []
        for platform in platforms:
            try:
                if platform == "facebook":
                    publish_facebook(cfg, post["message"], post["image_url"])
                    success.append("facebook")
                elif platform == "instagram":
                    publish_instagram(cfg, post["message"], post["image_url"])
                    success.append("instagram")
            except Exception as e:
                errors.append(f"{platform}: {e}")

        status = "published" if not errors else ("partial" if success else "error")
        error_msg = "; ".join(errors) if errors else None
        with get_db() as conn:
            conn.execute(
                "UPDATE posts SET status=?, error=?, published_at=? WHERE id=?",
                (status, error_msg, datetime.utcnow().isoformat(), post["id"])
            )

# ---------------------------------------------------------------------------
# Routes – static
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return send_from_directory("static", "index.html")

# ---------------------------------------------------------------------------
# Routes – config
# ---------------------------------------------------------------------------

@app.route("/api/config", methods=["GET"])
def api_get_config():
    cfg = get_config()
    # Mask tokens
    masked = {}
    for k, v in cfg.items():
        masked[k] = ("*" * 6 + v[-4:]) if ("token" in k and v) else v
    return jsonify(masked)

@app.route("/api/config", methods=["POST"])
def api_save_config():
    data = request.json or {}
    with get_db() as conn:
        for key in ("fb_page_id", "fb_page_token", "ig_account_id"):
            if key in data and data[key]:
                conn.execute(
                    "INSERT INTO config(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
                    (key, data[key])
                )
    return jsonify({"ok": True})

# ---------------------------------------------------------------------------
# Routes – posts
# ---------------------------------------------------------------------------

@app.route("/api/posts", methods=["GET"])
def api_list_posts():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM posts ORDER BY scheduled_at ASC").fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/posts", methods=["DELETE"])
def api_clear_posts():
    with get_db() as conn:
        conn.execute("DELETE FROM posts WHERE status='pending'")
    return jsonify({"ok": True})

@app.route("/api/posts/<int:post_id>", methods=["DELETE"])
def api_delete_post(post_id):
    with get_db() as conn:
        conn.execute("DELETE FROM posts WHERE id=? AND status='pending'", (post_id,))
    return jsonify({"ok": True})

@app.route("/api/posts/<int:post_id>/retry", methods=["POST"])
def api_retry_post(post_id):
    with get_db() as conn:
        conn.execute("UPDATE posts SET status='pending', error=NULL WHERE id=?", (post_id,))
    return jsonify({"ok": True})

# ---------------------------------------------------------------------------
# Routes – upload CSV / TXT
# ---------------------------------------------------------------------------

@app.route("/api/upload", methods=["POST"])
def api_upload():
    f = request.files.get("file")
    if not f:
        return jsonify({"error": "Nenhum ficheiro enviado"}), 400

    content = f.read().decode("utf-8-sig")
    rows_added = 0
    errors = []

    # Detect delimiter
    sample = content[:1024]
    delimiter = "," if content.count(",") >= content.count(";") else ";"

    reader = csv.DictReader(io.StringIO(content), delimiter=delimiter)
    required = {"date", "time", "message"}

    if not reader.fieldnames or not required.issubset({h.strip().lower() for h in reader.fieldnames}):
        return jsonify({"error": f"O ficheiro precisa das colunas: date, time, message. Encontradas: {reader.fieldnames}"}), 400

    # Normalize headers
    reader.fieldnames = [h.strip().lower() for h in reader.fieldnames]

    with get_db() as conn:
        for i, row in enumerate(reader, start=2):
            try:
                date_str = row.get("date", "").strip()
                time_str = row.get("time", "").strip()
                message = row.get("message", "").strip()
                image_url = row.get("image_url", "").strip() or None
                platforms_raw = row.get("platforms", "instagram,facebook").strip()
                if not platforms_raw:
                    platforms_raw = "instagram,facebook"

                # Validate date/time
                scheduled_at = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M").strftime("%Y-%m-%d %H:%M")

                if not message:
                    errors.append(f"Linha {i}: mensagem vazia")
                    continue

                conn.execute(
                    "INSERT INTO posts (scheduled_at, message, image_url, platforms) VALUES (?,?,?,?)",
                    (scheduled_at, message, image_url, platforms_raw)
                )
                rows_added += 1
            except ValueError as e:
                errors.append(f"Linha {i}: {e}")

    return jsonify({"added": rows_added, "errors": errors})

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    init_db()
    scheduler = BackgroundScheduler(timezone="UTC")
    scheduler.add_job(run_due_posts, "interval", minutes=1, id="publisher")
    scheduler.start()
    app.run(host="0.0.0.0", port=5000, debug=False)
