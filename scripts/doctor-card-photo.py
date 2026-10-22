#!/usr/bin/env python3
"""Кадр фото лікаря для картки (ui-kit §6.11 «Картка лікаря – лише з фото», components-map §30.6).

Стандарт кадру: 3:2, 900×600 px, WebP; голова з шиєю; маківка ≈ 10% від верху, підборіддя ≈ 75%;
обличчя по центру; фон – однаковий світлий (--brand-primary-soft основного домену, #e8f4fd).
Вхід – вирізане фото без фону (RGBA). Обличчя знаходить OpenCV (Haar); --face x,y,w,h – ручне уточнення.

Запуск:
  python3 scripts/doctor-card-photo.py <вхід.webp> <slug> [--face x,y,w,h] [--edge 2]
Вихід: public/assets/doctors/cards/<slug>.webp; у БД – doctors.photo_card_url = '/assets/doctors/cards/<slug>.webp'.
Потрібно: pip install opencv-python-headless pillow
"""
import sys, pathlib, argparse
import numpy as np
from PIL import Image, ImageFilter

W, H = 900, 600
BG = (232, 244, 253)            # --brand-primary-soft основного домену
FACE_H_SHARE = 0.48             # висота обличчя (лоб–підборіддя) у кадрі
FACE_TOP_SHARE = 0.20           # верх рамки обличчя від верху кадру (маківка ≈ 10%)

def find_face(img):
    import cv2
    gray = cv2.cvtColor(np.array(img.convert('RGB')), cv2.COLOR_RGB2GRAY)
    casc = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = casc.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=6, minSize=(60, 60))
    if len(faces) == 0:
        sys.exit('обличчя не знайдено – задайте --face x,y,w,h')
    return max(faces, key=lambda f: f[2] * f[3])

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('slug'); ap.add_argument('--face')
    ap.add_argument('--out', default='public/assets/doctors/cards')
    ap.add_argument('--edge', type=int, default=0, help='підрізати край вирізаної постаті на N px (прибирає сіру облямівку)')
    a = ap.parse_args()
    img = Image.open(a.src).convert('RGBA')
    if a.edge:
        r, g, b, al = img.split()
        al = al.filter(ImageFilter.MinFilter(a.edge * 2 + 1)).filter(ImageFilter.GaussianBlur(0.8))
        img = Image.merge('RGBA', (r, g, b, al))
    x, y, w, h = map(int, a.face.split(',')) if a.face else find_face(img)
    crop_h = h / FACE_H_SHARE
    crop_w = crop_h * W / H
    cx = x + w / 2
    top = y - FACE_TOP_SHARE * crop_h
    left = cx - crop_w / 2
    canvas = Image.new('RGBA', (int(round(crop_w)), int(round(crop_h))), BG + (255,))
    canvas.alpha_composite(img, (int(round(-left)), int(round(-top))))
    out = canvas.convert('RGB').resize((W, H), Image.LANCZOS)
    scale = W / crop_w
    if scale > 1.6:
        print(f'⚠ {a.slug}: збільшення {scale:.2f}× – фото буде м\'яким, потрібне джерело більшої роздільності')
    dst = pathlib.Path(a.out); dst.mkdir(parents=True, exist_ok=True)
    f = dst / f'{a.slug}.webp'
    out.save(f, 'WEBP', quality=82, method=6)
    print(f'{f}  обличчя {x},{y},{w},{h}  збільшення {scale:.2f}×  {f.stat().st_size // 1024} КБ')

if __name__ == '__main__':
    main()
