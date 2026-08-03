"""
extract_standards.py
מחלץ טקסט מכל קבצי PDF של תקנים ישראליים ויוצר אינדקס לחיפוש.
הרצה: python scripts/extract_standards.py
"""

import os
import json
import re
import sys
import pdfplumber

STANDARDS_DIR = r"C:\Users\Haim\Desktop\תקנים ישראלים"
OUTPUT_FILE   = os.path.join(os.path.dirname(__file__), "..", "public", "standards", "chunks.json")
CHUNK_SIZE    = 800   # תווים לכל צ'אנק
MIN_TEXT_LEN  = 50   # מינימום תווים לעמוד "בעל תוכן"

def extract_standard_number(filename):
    """מנסה לחלץ מספר ת״י מתוך שם הקובץ"""
    m = re.search(r'(?:ת["\']?י|תקן)[^\d]*(\d{2,4})', filename)
    if m:
        return m.group(1)
    m = re.search(r'\b(\d{3,4})\b', filename)
    if m:
        return m.group(1)
    return None

def chunk_text(text, size=CHUNK_SIZE):
    """מחלק טקסט לצ'אנקים לפי גודל, עם חפיפה קלה"""
    chunks = []
    words = text.split()
    current = []
    current_len = 0
    for word in words:
        current.append(word)
        current_len += len(word) + 1
        if current_len >= size:
            chunks.append(" ".join(current))
            current = current[-20:]  # חפיפה של 20 מילים
            current_len = sum(len(w) + 1 for w in current)
    if current:
        chunks.append(" ".join(current))
    return chunks

def process_pdf(pdf_path, rel_path):
    """מחלץ טקסט מ-PDF ומחזיר רשימת צ'אנקים"""
    filename = os.path.basename(pdf_path)
    std_num  = extract_standard_number(filename)
    chunks   = []

    try:
        with pdfplumber.open(pdf_path) as pdf:
            num_pages = len(pdf.pages)
            pages_with_text = 0

            for page_num, page in enumerate(pdf.pages, 1):
                try:
                    text = page.extract_text() or ""
                    text = text.strip()
                    if len(text) < MIN_TEXT_LEN:
                        continue
                    pages_with_text += 1

                    for i, chunk_text_val in enumerate(chunk_text(text)):
                        chunks.append({
                            "file":    filename.replace(".pdf", ""),
                            "path":    rel_path,
                            "std_num": std_num,
                            "page":    page_num,
                            "chunk":   i,
                            "text":    chunk_text_val,
                        })
                except Exception:
                    continue

            if pages_with_text == 0:
                return chunks, "scanned"
            return chunks, f"{pages_with_text}/{num_pages} עמודים"
    except Exception as e:
        return [], f"שגיאה: {e}"

def main():
    all_chunks = []
    stats = {"total": 0, "ok": 0, "scanned": 0, "error": 0}

    print(f"סורק: {STANDARDS_DIR}\n")

    for root, dirs, files in os.walk(STANDARDS_DIR):
        for fname in files:
            if not fname.lower().endswith(".pdf"):
                continue
            stats["total"] += 1

            full_path = os.path.join(root, fname)
            rel_path  = os.path.relpath(full_path, STANDARDS_DIR)

            chunks, status = process_pdf(full_path, rel_path)
            all_chunks.extend(chunks)

            icon = "✓" if chunks else ("◌" if status == "scanned" else "✗")
            if chunks:
                stats["ok"] += 1
            elif status == "scanned":
                stats["scanned"] += 1
            else:
                stats["error"] += 1

            print(f"  {icon} {fname[:55]:<55} {len(chunks):>3} צ'אנקים  [{status}]")

    # שמירת האינדקס
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=None, separators=(",", ":"))

    size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    print(f"\n{'='*60}")
    print(f"סה\"כ קבצים:   {stats['total']}")
    print(f"עם טקסט:      {stats['ok']}")
    print(f"סרוקים (אין טקסט): {stats['scanned']}")
    print(f"שגיאות:       {stats['error']}")
    print(f"סה\"כ צ'אנקים: {len(all_chunks)}")
    print(f"גודל אינדקס:  {size_kb:.0f} KB")
    print(f"\nנשמר: {OUTPUT_FILE}")

    if stats["scanned"] > 0:
        print(f"\nשים לב: {stats['scanned']} קבצים סרוקים — טקסט לא חולץ.")
        print("לחילוץ סרוקים דרוש OCR (pytesseract).")

if __name__ == "__main__":
    main()
