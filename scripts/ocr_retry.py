"""
ocr_retry.py
מריץ שוב OCR על עמודים שנכשלו — עם retry ו-3 workers במקום 5.
מחייב שocr_standards.py כבר רץ לפחות פעם אחת.
הרצה: python scripts/ocr_retry.py
"""

import os, json, base64, time, re, sys
import fitz
import urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

STANDARDS_DIR  = r"C:\Users\Haim\Desktop\תקנים ישראלים"
OUTPUT_FILE    = os.path.join(os.path.dirname(__file__), "..", "public", "standards", "chunks.json")
PROGRESS_FILE  = os.path.join(os.path.dirname(__file__), "..", "public", "standards", "ocr_progress.json")
RETRY_LOG      = os.path.join(os.path.dirname(__file__), "..", "public", "standards", "retry_progress.json")

API_URL    = "https://api.anthropic.com/v1/messages"
MODEL      = "claude-haiku-4-5-20251001"
DPI        = 150
CHUNK_SIZE = 800
WORKERS    = 2   # פחות workers, פחות timeouts
MAX_RETRIES = 3
_lock = threading.Lock()

def _load_api_key():
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if key: return key
    env_file = r"C:\Users\Haim\Desktop\אג'נטים לחברת פיקוח\.env"
    if os.path.exists(env_file):
        with open(env_file, encoding="utf-8") as f:
            for line in f:
                if line.startswith("ANTHROPIC_API_KEY="):
                    return line.split("=", 1)[1].strip()
    return ""

API_KEY = _load_api_key()

SKIP_PHRASES = [
    "אני רואה שהתמונה", "לא יכול לקרוא", "התמונה ריקה", "לא ניתן לקרוא",
    "i cannot", "image appears to be", "blank page", "empty page",
]

def is_good_ocr(text):
    t = text.lower()
    return not any(p in t for p in SKIP_PHRASES) and len(text.strip()) > 30

def page_to_base64(page):
    mat = fitz.Matrix(DPI/72, DPI/72)
    pix = page.get_pixmap(matrix=mat, colorspace=fitz.csRGB)
    return base64.b64encode(pix.tobytes("png")).decode()

def ocr_page_with_retry(img_b64):
    prompt = ('זהו עמוד סרוק מתקן ישראלי. חלץ את כל הטקסט בעברית ובאנגלית כפי שמופיע. '
              'אל תוסיף הסברים — רק הטקסט המקורי.')
    body = json.dumps({
        "model": MODEL, "max_tokens": 2000,
        "messages": [{"role": "user", "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": img_b64}},
            {"type": "text", "text": prompt}
        ]}]
    }).encode()
    req = urllib.request.Request(API_URL, data=body, headers={
        "x-api-key": API_KEY, "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    })
    for attempt in range(MAX_RETRIES):
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                resp = json.loads(r.read())
                return resp["content"][0]["text"].strip()
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                wait = 2 ** attempt * 3  # 3s, 6s, 12s
                time.sleep(wait)
            else:
                raise e

def text_to_chunks(text, fname, std_num, page_num):
    chunks = []
    words = text.split()
    cur, cur_len = [], 0
    for w in words:
        cur.append(w); cur_len += len(w) + 1
        if cur_len >= CHUNK_SIZE:
            ct = " ".join(cur)
            if len(ct.strip()) > 30:
                chunks.append({"file": fname, "std_num": std_num, "page": page_num, "text": ct})
            cur = cur[-15:]; cur_len = sum(len(x)+1 for x in cur)
    if cur:
        ct = " ".join(cur)
        if len(ct.strip()) > 30:
            chunks.append({"file": fname, "std_num": std_num, "page": page_num, "text": ct})
    return chunks

def extract_std_num(filename):
    m = re.search(r'(?:ת["\']?י|תקן)[^\d]*(\d{2,4})', filename)
    if m: return m.group(1)
    m = re.search(r'\b(\d{3,5})\b', filename)
    if m: return m.group(1)
    return None

def get_covered_pages(chunks):
    """מפת קובץ → set של עמודים שכבר יש להם chunks"""
    covered = {}
    for c in chunks:
        key = c["file"]
        if key not in covered:
            covered[key] = set()
        covered[key].add(c["page"])
    return covered

def main():
    if not API_KEY:
        print("שגיאה: ANTHROPIC_API_KEY לא מוגדר.")
        sys.exit(1)

    # טען מה שכבר יש
    if not os.path.exists(OUTPUT_FILE):
        print("אין chunks.json — הרץ קודם ocr_standards.py")
        sys.exit(1)

    with open(OUTPUT_FILE, encoding="utf-8") as f:
        existing_chunks = json.load(f)

    covered = get_covered_pages(existing_chunks)
    print(f"קיים: {len(existing_chunks)} צ'אנקים")
    print(f"קבצים עם כיסוי: {len(covered)}")

    # אסוף כל PDF ובדוק אילו עמודים חסרים
    todo = []  # list of (pdf_path, fname, std_num, page_list)
    for root, _, files in os.walk(STANDARDS_DIR):
        for fname in files:
            if not fname.lower().endswith(".pdf"):
                continue
            full_path = os.path.join(root, fname)
            std_num = extract_std_num(fname)
            try:
                doc = fitz.open(full_path)
            except Exception:
                continue

            n_pages = min(len(doc), 60)
            doc_covered = covered.get(fname, set())
            missing = []
            for pg_idx in range(n_pages):
                pg_num = pg_idx + 1
                if pg_num in doc_covered:
                    continue
                # בדוק אם יש טקסט native
                native = (doc[pg_idx].get_text() or "").strip()
                if len(native) > 50:
                    # יש טקסט — הוסף ישירות
                    he_ratio = sum(1 for ch in native if 'א'<=ch<='ת') / max(len(native),1)
                    if he_ratio > 0.15:
                        existing_chunks.extend(text_to_chunks(native, fname, std_num, pg_num))
                    continue
                missing.append(pg_idx)
            doc.close()
            if missing:
                todo.append((full_path, fname, std_num, missing))

    print(f"\nקבצים עם עמודים חסרים: {len(todo)}")
    total_missing = sum(len(t[3]) for t in todo)
    print(f"סה\"כ עמודים לretry: {total_missing}")
    print(f"עלות משוערת (Haiku): ~${total_missing * 0.0004:.2f}\n")

    if not todo:
        print("אין עמודים חסרים!")
        return

    new_chunks = list(existing_chunks)
    done_pages = 0

    def process_page(args):
        pdf_path, fname, std_num, pg_idx = args
        try:
            doc = fitz.open(pdf_path)
            page = doc[pg_idx]
            img_b64 = page_to_base64(page)
            doc.close()
            text = ocr_page_with_retry(img_b64)
            if is_good_ocr(text):
                return text_to_chunks(text, fname, std_num, pg_idx+1), fname, pg_idx+1, None
            return [], fname, pg_idx+1, "bad_ocr"
        except Exception as e:
            return [], fname, pg_idx+1, str(e)[:80]

    # בנה רשימת משימות
    tasks = []
    for pdf_path, fname, std_num, missing_pages in todo:
        for pg_idx in missing_pages:
            tasks.append((pdf_path, fname, std_num, pg_idx))

    print(f"מתחיל {WORKERS} workers...\n")
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(process_page, t): t for t in tasks}
        for future in as_completed(futures):
            chunks, fname, pg_num, err = future.result()
            with _lock:
                if chunks:
                    new_chunks.extend(chunks)
                    done_pages += 1
                    if done_pages % 20 == 0:
                        print(f"  [{done_pages}/{total_missing}] שמירה ביניים...")
                        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                            json.dump(new_chunks, f, ensure_ascii=False, separators=(",",":"))
                elif err and err != "bad_ocr":
                    print(f"  ✗ {fname} עמ.{pg_num}: {err}")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(new_chunks, f, ensure_ascii=False, separators=(",",":"))

    size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    print(f"\n{'='*55}")
    print(f"סה\"כ צ'אנקים: {len(new_chunks)}")
    print(f"עמודים שעובדו: {done_pages}")
    print(f"גודל אינדקס: {size_kb:.0f} KB")
    print(f"נשמר: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
