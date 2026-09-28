#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""src/*.js を1枚のHTMLにまとめる。
   使い方:  python3 build.py
   出力  :  トマト宇宙農園.html  と  build/bundle.js（検査用）
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC  = os.path.join(HERE, 'src')
OUT_HTML = os.path.join(HERE, 'トマト宇宙農園.html')
BUILD = os.path.join(HERE, 'build')

def main():
    files = sorted(f for f in os.listdir(SRC)
                   if f.endswith('.js') and not f.startswith('_'))
    parts = []
    for f in files:
        with open(os.path.join(SRC, f), encoding='utf-8') as fp:
            parts.append('/* ==== %s ==== */\n%s' % (f, fp.read()))
    bundle = '\n'.join(parts)

    if '</script' in bundle.lower():
        print('！ bundle に </script が含まれています。中断します。')
        return 1

    os.makedirs(BUILD, exist_ok=True)
    with open(os.path.join(BUILD, 'bundle.js'), 'w', encoding='utf-8') as fp:
        fp.write(bundle)

    with open(os.path.join(HERE, 'shell.html'), encoding='utf-8') as fp:
        shell = fp.read()
    three_path = os.path.join(HERE, 'vendor', 'three.min.js')
    three = ''
    if os.path.exists(three_path):
        with open(three_path, encoding='utf-8') as fp:
            three = fp.read()
        if '</script' in three.lower():
            print('！ three.min.js に </script が含まれています。中断します。')
            return 1
    else:
        print('（vendor/three.min.js が無いので、2D表示だけで作ります）')
    html = shell.replace('/*__THREE__*/', three).replace('/*__BUNDLE__*/', bundle)
    with open(OUT_HTML, 'w', encoding='utf-8') as fp:
        fp.write(html)

    kb = len(html.encode('utf-8'))/1024
    print('できました: %s  (%.1f KB / %d ファイル)' % (os.path.basename(OUT_HTML), kb, len(files)))
    for f in files:
        n = sum(1 for _ in open(os.path.join(SRC,f), encoding='utf-8'))
        print('   %-18s %5d 行' % (f, n))
    return 0

if __name__ == '__main__':
    sys.exit(main())
