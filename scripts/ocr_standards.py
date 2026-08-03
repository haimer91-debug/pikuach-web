"""
ocr_standards.py
OCR לכל PDFs הסרוקים של תקנים ישראליים — שולח ל-Claude Vision, שומר ב-JSON.
הרצה: python scripts/ocr_standards.py
(מחייב ANTHROPIC_API_KEY בסביבה)
"""

import os, json, base64, time, re, sys
import fitz          # PyMuPDF
import urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

STANDARDS_DIR = r"C:\Users\Haim\Desktop\תקנים ישראלים"
OUTPUT_FILE   = os.path.join(os.path.dirname(__file__), "..", "public", "standards", "chunks.json")
PROGRESS_FILE = os.path.join(os.path.dirname(__file__), "..", "public", "standards", "ocr_progress.json")

# קרא מ-.env אם לא מוגדר בסביבה
def _load_api_key():
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if key:
        return key
    env_file = r"C:\Users\Haim\Desktop\אג'נטים לחברת פיקוח\.env"
    if os.path.exists(env_file):
        with open(env_file, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("ANTHROPIC_API_KEY="):
                    return line.split("=", 1)[1].strip()
    return ""

API_KEY   = _load_api_key()
API_URL   = "https://api.anthropic.com/v1/messages"
MODEL     = "claude-haiku-4-5-20251001"   # מהיר + זול לOCR
DPI        = 150   # רזולוציה לסריקה
MAX_PAGES  = 60    # מקסימום עמודים לקובץ
CHUNK_SIZE = 800   # תווים לצ'אנק
WORKERS    = 5     # קריאות מקביליות ל-API
_lock      = threading.Lock()

HE_STOPWORDS = {"של","על","את","עם","אל","לא","הוא","היא","הם","הן","זה",
                "זו","אם","כן","עד","רק","גם","לפי","בין","ב","ל","מ","ה","ו","כ","ש"}

def page_to_base64(page, dpi=DPI):
    mat  = fitz.Matrix(dpi/72, dpi/72)
    pix  = page.get_pixmap(matrix=mat, colorspace=fitz.csRGB)
    return base64.b64encode(pix.tobytes("png")).decode()

def ocr_page(img_b64, filename, page_num):
    if not API_KEY:
        raise RuntimeError("ANTHROPIC_API_KEY לא מוגדר. הגדר: set ANTHROPIC_API_KEY=...")

    prompt = (
        "זהו עמוד סרוק מתקן ישראלי (ת\"י). "
        "חלץ את כל הטקסט בעברית (ובאנגלית אם יש) בדיוק כפי שמופיע. "
        "אל תוסיף הסברים — רק הטקסט המקורי."
    )
    body = json.dumps({
        "model": MODEL,
        "max_tokens": 2000,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": img_b64}},
                {"type": "text",  "text": prompt}
            ]
        }]
    }).encode()

    req = urllib.request.Request(API_URL, data=body, headers={
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    })
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            resp = json.loads(r.read())
            return resp["content"][0]["text"].strip()
    except urllib.error.HTTPError as e:
        body_err = e.read().decode()
        raise RuntimeError(f"HTTP {e.code}: {body_err[:200]}")

def text_to_chunks(text, filename, std_num, page_num):
    chunks = []
    words  = text.split()
    cur    = []
    cur_len = 0
    for w in words:
        cur.append(w)
        cur_len += len(w) + 1
        if cur_len >= CHUNK_SIZE:
            chunk_text = " ".join(cur)
            if len(chunk_text.strip()) > 30:
                chunks.append({"file": filename, "std_num": std_num, "page": page_num, "text": chunk_text})
            cur     = cur[-15:]
            cur_len = sum(len(x)+1 for x in cur)
    if cur:
        chunk_text = " ".join(cur)
        if len(chunk_text.strip()) > 30:
            chunks.append({"file": filename, "std_num": std_num, "page": page_num, "text": chunk_text})
    return chunks

def extract_std_num(filename):
    m = re.search(r'(?:ת["\']?י|תקן)[^\d]*(\d{2,4})', filename)
    if m: return m.group(1)
    m = re.search(r'\b(\d{3,5})\b', filename)
    if m: return m.group(1)
    return None

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {"done": [], "chunks": []}

def save_progress(progress):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, separators=(",",":"))

def main():
    if not API_KEY:
        print("שגיאה: ANTHROPIC_API_KEY לא מוגדר.")
        print("הגדר: set ANTHROPIC_API_KEY=sk-ant-...")
        sys.exit(1)

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    # טען צ'אנקים קיימים מtext-extraction (אם יש)
    existing_chunks = []
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, encoding="utf-8") as f:
            existing_chunks = json.load(f)

    progress = load_progress()
    done_files = set(progress["done"])
    all_chunks = list(progress["chunks"])
    # הוסף גם צ'אנקים מtext-extraction שעוד לא ב-progress
    existing_keys = {(c["file"], c.get("page")) for c in all_chunks}
    for c in existing_chunks:
        if (c["file"], c.get("page")) not in existing_keys:
            all_chunks.append(c)

    # אסוף כל PDF סרוק שטרם עובד
    pdf_files = []
    for root, _, files in os.walk(STANDARDS_DIR):
        for fname in files:
            if fname.lower().endswith(".pdf") and fname not in done_files:
                pdf_files.append((os.path.join(root, fname), fname))

    if not pdf_files:
        print("כל הקבצים כבר עובדו!")
    else:
        print(f"נמצאו {len(pdf_files)} קבצים לעיבוד OCR\n")

    cost_pages = 0

    def process_file(args):
        idx, (path, fname) = args
        std_num    = extract_std_num(fname)
        file_chunks = []
        ocr_count   = 0
        try:
            doc = fitz.open(path)
        except Exception as e:
            print(f"  ✗ [{idx}] {fname[:50]}: לא ניתן לפתוח ({e})")
            return fname, [], 0

        pages_to_do = min(len(doc), MAX_PAGES)
        for pg_idx in range(pages_to_do):
            page        = doc[pg_idx]
            native_text = (page.get_text() or "").strip()
            if len(native_text) > 50:
                file_chunks.extend(text_to_chunks(native_text, fname, std_num, pg_idx+1))
                continue
            try:
                img_b64 = page_to_base64(page)
                text    = ocr_page(img_b64, fname, pg_idx+1)
                file_chunks.extend(text_to_chunks(text, fname, std_num, pg_idx+1))
                ocr_count += 1
            except Exception as e:
                print(f"  ⚠ [{idx}] {fname[:40]} עמוד {pg_idx+1}: {e}")
        doc.close()
        print(f"  ✓ [{idx}/{len(pdf_files)}] {fname[:55]} → {len(file_chunks)} צ'אנקים")
        return fname, file_chunks, ocr_count

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(process_file, (i+1, item)): item for i, item in enumerate(pdf_files)}
        for future in as_completed(futures):
            fname, chunks, ocr_count = future.result()
            with _lock:
                all_chunks.extend(chunks)
                done_files.add(fname)
                cost_pages += ocr_count
                progress = {"done": list(done_files), "chunks": all_chunks}
                save_progress(progress)
                with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                    json.dump(all_chunks, f, ensure_ascii=False, separators=(",",":"))

    print(f"\n{'='*55}")
    print(f"סה\"כ צ'אנקים: {len(all_chunks)}")
    print(f"עמודים שעברו OCR: {cost_pages}")
    print(f"עלות משוערת (Haiku): ~${cost_pages * 0.0004:.2f}")
    print(f"נשמר: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
