#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ヘッドレスChromeの中で実際にゲームを遊ばせ、その画面を play/ に書き出す。
   python3 play.py [仮想秒数]
"""
import base64, os, re, subprocess, sys

HERE   = os.path.dirname(os.path.abspath(__file__))
HTML   = os.path.join(HERE, 'トマト宇宙農園.html')
SCRIPT = os.path.join(HERE, 'play_script.js')
OUT    = os.path.join(HERE, 'play')
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

def main():
    budget = int(sys.argv[1]) if len(sys.argv) > 1 else 210
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if f.endswith('.png'): os.remove(os.path.join(OUT, f))

    with open(HTML, encoding='utf-8') as fp: html = fp.read()
    with open(SCRIPT, encoding='utf-8') as fp: js = fp.read()

    inject = '<script>setTimeout(function(){\n%s\n},150);</script>' % js
    tmp = os.path.join(OUT, '_play.html')
    with open(tmp, 'w', encoding='utf-8') as fp:
        fp.write(html.replace('</body>', inject + '</body>'))

    cmd = [CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars',
           '--force-device-scale-factor=1', '--window-size=1060,740',
           '--virtual-time-budget=%d' % (budget*1000),
           '--dump-dom', 'file://' + tmp]
    print('遊ばせています…（仮想 %d 秒ぶん）' % budget)
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=1500)
    dom = r.stdout

    n = 0
    for m in re.finditer(r'<i data-n="([^"]+)">data:image/png;base64,([A-Za-z0-9+/=]+)</i>', dom):
        name, b64 = m.group(1), m.group(2)
        with open(os.path.join(OUT, name + '.png'), 'wb') as fp:
            fp.write(base64.b64decode(b64))
        n += 1

    lg = re.search(r'<u id="playlog">(.*?)</u>', dom, re.S)
    print('撮れた画面: %d 枚 → %s/' % (n, os.path.basename(OUT)))
    if lg:
        print('記録: ' + lg.group(1)[:1200])
    else:
        print('（記録が取れませんでした。時間が足りない可能性があります）')
        err = [l for l in (r.stderr or '').splitlines() if 'Uncaught' in l or 'ERROR:CONSOLE' in l]
        for l in err[:6]: print('  ! ' + l[:200])
    os.remove(tmp)
    return 0 if n else 1

if __name__ == '__main__':
    sys.exit(main())
