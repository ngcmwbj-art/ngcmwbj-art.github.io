#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ヘッドレスChromeで画面を撮る。 python3 shots.py [場面名...]"""
import os, subprocess, sys, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(HERE, 'トマト宇宙農園.html')
OUT  = os.path.join(HERE, 'shots')
def _find_chrome():
    """Chrome の場所。環境変数 TSF_CHROME があればそれを使う"""
    cands = [os.environ.get('TSF_CHROME',''),
             '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
             '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
             shutil.which('google-chrome') or '', shutil.which('chromium') or '']
    for c in cands:
        if c and os.path.exists(c): return c
    return cands[1]
CHROME = _find_chrome()
# 3D表示（WebGL）をGPUなしでも描けるように
GL_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
if hasattr(os, 'geteuid') and os.geteuid() == 0:
    GL_ARGS.append('--no-sandbox')   # root で動かすとき（コンテナなど）

SCENES = {
 'title': "",

 'farm': """
  T.startNew(); T.uiClear(); var S=T.S;
  S.area='home'; S.px=8*16+8; S.py=13*16+14; S.time=560; S.credits=4210;
  var vs=['akahoshi','akahoshi','comet','akahoshi','sunflare','comet','akahoshi','jupiter'];
  var n=0;
  for (var x=3;x<=12;x++) for (var y=9;y<=15;y++){
    var t=T.tileState('home',x,y,true); t.till=true; t.wet=((x+y)%3!==0);
    var v=vs[(x*3+y)%vs.length];
    S.crops['home:'+x+','+y]={v:v,prog:Math.min(9,(x+y)%10),need:5,re:0,seed:x*7+y,gi:2,elite:0};
  }
  for (var x=15;x<=20;x++) for (var y=9;y<=12;y++){
    var t2=T.tileState('home',x,y,true); t2.till=true; t2.wet=true;
  }
  S.water=18; S.energy=84; T.Game.hint='アカホシを収穫（Z）';
 """,

 'night': """
  T.startNew(); T.uiClear(); var S=T.S;
  S.area='home'; S.px=12*16+8; S.py=12*16+14; S.time=1290; S.gravIdx=1;
  S.ups.lamp=1; S.ups.greenh=1;
  for (var x=3;x<=12;x++) for (var y=9;y<=15;y++){
    var t=T.tileState('home',x,y,true); t.till=true; t.wet=true;
    S.crops['home:'+x+','+y]={v:(x%3?'akahoshi':'nebula'),prog:9,need:5,re:0,seed:x*5+y,gi:1,elite:0};
  }
 """,

 'flare': """
  T.startNew(); T.uiClear(); var S=T.S;
  S.area='home'; S.px=9*16+8; S.py=11*16+14; S.time=760; S.weather='flare'; S.gravIdx=0;
  for (var x=3;x<=12;x++) for (var y=9;y<=14;y++){
    var t=T.tileState('home',x,y,true); t.till=true; t.wet=true;
    S.crops['home:'+x+','+y]={v:(x%4===0?'cosmoblue':'sunflare'),prog:9,need:5,re:0,seed:x+y*3,gi:0,elite:0,fallen:(x%5===0)};
  }
 """,

 'kage': """
  T.startNew(); T.uiClear(); var S=T.S;
  S.season=3; S.day=6; S.area='home'; S.px=8*16+8; S.py=12*16+14; S.time=800;
  T.Game.skySeason=-1; S.ups.lamp=1;
  for (var x=3;x<=12;x++) for (var y=9;y<=15;y++){
    var t=T.tileState('home',x,y,true); t.till=true; t.wet=true;
    S.crops['home:'+x+','+y]={v:(x%3===0?'blackhole':'nebula'),prog:9,need:6,re:0,seed:x*3+y,gi:3,elite:1};
  }
 """,

 'station': """
  T.startNew(); T.uiClear(); var S=T.S;
  S.area='station'; S.px=16*16+8; S.py=13*16+14; S.time=700; S.credits=18400;
 """,

 'talk': """
  T.startNew(); T.uiClear(); var S=T.S;
  S.area='station'; S.px=16*16+8; S.py=13*16+14; S.time=700;
  T.dialogSeq([{who:'オババ', text:'この小惑星の土はね、怒りっぽいが正直だ。\\n水をやれば必ず返してくる。', menu:[{label:'昔の話を聞く'},{label:'今日の助言をもらう'},{label:'なんでもない'}]}]);
  T.Game.ui[0].ch = 999;
 """,

 'shop': """
  T.startNew(); T.uiClear(); var S=T.S;
  S.area='station'; S.px=8*16+8; S.py=8*16+14; S.credits=12600;
  S.dex={akahoshi:{n:9,bestSize:1.4,bestSugar:11,bestQ:2},comet:{n:22,bestSize:0.7,bestSugar:9,bestQ:1},
         sunflare:{n:4,bestSize:1.2,bestSugar:8,bestQ:2}};
  S.npc.zax.hearts=4;
  T.openShop();
 """,

 'dex': """
  T.startNew(); T.uiClear(); var S=T.S;
  S.dex={akahoshi:{n:41,bestSize:1.62,bestSugar:12,bestQ:3},comet:{n:88,bestSize:0.71,bestSugar:10,bestQ:2},
         sunflare:{n:19,bestSize:1.30,bestSugar:9,bestQ:2},jupiter:{n:7,bestSize:2.56,bestSugar:6,bestQ:3},
         frostbell:{n:12,bestSize:1.02,bestSugar:11,bestQ:2},nebula:{n:5,bestSize:1.05,bestSugar:13,bestQ:3}};
  T.openDex();
 """,

 'bag': """
  T.startNew(); T.uiClear(); var S=T.S;
  S.ups.bag=1;
  T.invPut('cr_akahoshi',7,2); T.invPut('cr_comet',23,1); T.invPut('cr_jupiter',2,3);
  T.invPut('g_ketchup_akahoshi',4,1); T.invPut('g_wine_blackhole',1,3);
  T.invPut('m_iron',18); T.invPut('m_silicon',9); T.invPut('m_crystal',3); T.invPut('m_meteor',1);
  T.invPut('sd_comet',8); T.invPut('sd_nebula',3,1); T.invPut('f_giant',2); T.invPut('key_note',1);
  T.openBag();
 """,

 'upgrade': """
  T.startNew(); T.uiClear(); var S=T.S;
  S.credits=52000; T.invPut('m_iron',40); T.invPut('m_silicon',30); T.invPut('m_ice',20); T.invPut('m_crystal',10);
  S.ups.can2=1; S.ups.stake=1;
  T.openUpgrade();
 """,

 'greenhouse': """
  T.startNew(); T.uiClear(); var S=T.S;
  S.ups.greenh=1; S.area='greenIn'; S.px=10*16+8; S.py=10*16+14; S.time=700;
  for (var x=3;x<=18;x++) for (var y=3;y<=8;y++){
    var t=T.tileState('greenIn',x,y,true); t.till=true; t.wet=true;
    var v=['galaxia','cosmoblue','blackhole','frostbell','jupiter'][(x+y)%5];
    S.crops['greenIn:'+x+','+y]={v:v,prog:9,need:6,re:0,seed:x*11+y,gi:2,elite:2};
  }
 """,

 'shed': """
  T.startNew(); T.uiClear(); var S=T.S;
  S.area='shedIn'; S.px=9*16+8; S.py=6*16+14; S.time=700;
  S.machines[0]={type:'juicer',in:{variety:'akahoshi',q:1},out:null,doneDay:T.S.day2+1};
  S.machines[1]={type:'ketchupper',in:null,out:{id:'g_ketchup_comet',n:1,q:2},doneDay:T.S.day2};
  S.machines[2]={type:'dryer',in:{variety:'comet',q:0},out:null,doneDay:T.S.day2+2};
  S.machines[3]={type:'saucepan',in:null,out:null,doneDay:null};
  S.machines[5]={type:'cask',in:{variety:'blackhole',q:3},out:null,doneDay:T.S.day2+3};
 """,

 'mine': """
  T.startNew(); T.uiClear(); var S=T.S;
  S.mineSeed=4242; T.enterMine(6); S.time=800;
 """,

 'morning': """
  T.startNew(); T.uiClear(); var S=T.S;
  S.area='houseIn'; S.px=7*16+8; S.py=9*16+14;
  S.log=['出荷：4種・3,120クレジット','結露で畑が潤った。','宇宙線でコスモブルーに変異した株がある。'];
  S.credits=9840; S.weather='dew'; S.tomorrowWeather='flare';
  T.showMorning();
 """,

 'walk': """
  T.startNew(); T.uiClear();
  function K(code,down){ window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{code:code,bubbles:true})); }
  K('ArrowDown',true);
  setTimeout(function(){
    K('ArrowDown',false); K('ArrowLeft',true);
    setTimeout(function(){
      K('ArrowLeft',false); K('ArrowDown',true);
      setTimeout(function(){
        K('ArrowDown',false);
        var n=0, iv=setInterval(function(){
          K('KeyZ',true); setTimeout(function(){K('KeyZ',false);},30);
          if (++n>6) clearInterval(iv);
        }, 120);
      }, 900);
    }, 500);
  }, 900);
 """,

 'ending': """
  T.startNew(); T.uiClear();
  T.Game.mode='ending'; T.Game.ending=9; T.musicStop();
 """,
}

def shoot(name, js):
    os.makedirs(OUT, exist_ok=True)
    with open(HTML, encoding='utf-8') as fp:
        html = fp.read()
    inject = """
<script>
setTimeout(function(){
  var T = window.TSF;
  T.Game.noIntro = true;
  try{ %s }catch(e){ document.title='ERR: '+e.message; console.error(e); }
  T.Game.cam.x=-9999; T.Game.fade=null;
}, 120);
</script>
""" % js
    html = html.replace('</body>', inject + '</body>')
    tmp = os.path.join(OUT, '_%s.html' % name)
    with open(tmp, 'w', encoding='utf-8') as fp:
        fp.write(html)
    png = os.path.join(OUT, '%s.png' % name)
    if os.path.exists(png): os.remove(png)
    cmd = [CHROME, '--headless=new', '--hide-scrollbars'] + GL_ARGS + [
           '--force-device-scale-factor=1',
           '--window-size=1400,880',
           '--virtual-time-budget=2600',
           '--screenshot=' + png,
           'file://' + tmp]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
    err = [l for l in (r.stderr or '').splitlines()
           if 'ERROR' in l or 'Uncaught' in l or 'Error' in l]
    stat = 'OK ' if os.path.exists(png) else 'NG '
    print('%s %-12s %s' % (stat, name, ('  ⚠ '+err[0][:120]) if err else ''))
    os.remove(tmp)
    return os.path.exists(png)

if __name__ == '__main__':
    want = sys.argv[1:] or list(SCENES.keys())
    for n in want:
        if n not in SCENES: print('?? unknown scene', n); continue
        shoot(n, SCENES[n])
