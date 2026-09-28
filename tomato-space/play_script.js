/* ============================================================================
   play_script.js — 自動操縦。本物のゲームループの上で、実際に歩いて耕して寝る。
   （ブラウザに流しこんで使う。play.py から呼ばれる）
   ========================================================================== */
(function(){
var T = window.TSF, G = T.Game;
var LOG = [], shots = [];
function log(s){ LOG.push(s); }

/* 毎回おなじ天気・おなじ結果になるように、さいころを固定する */
var _s = 20260929;
Math.random = function(){ _s = (_s * 1103515245 + 12345) % 2147483648; return _s / 2147483648; };

/* 撮った端から DOM に貯める（途中で止まっても取り出せるように） */
var BOX = null;
function box(){
  if (!BOX){
    BOX = document.createElement('div');
    BOX.id = 'shotbox'; BOX.style.display = 'none';
    document.body.appendChild(BOX);
  }
  return BOX;
}
function snap(n){
  try {
    var d = document.getElementById('game').toDataURL('image/png');
    shots.push({ n:n, d:d });
    var e = document.createElement('i');
    e.setAttribute('data-n', n); e.textContent = d;
    box().appendChild(e);
    log('📷 '+n);
  } catch(e){ log('snap fail '+n+': '+e.message); }
}

/* ---------------------------------------------------------- 命令のならび */
var Q = [];
function C(o){ Q.push(o); }
function wait(s){ C({t:'wait', f:Math.max(1,Math.round(s*60))}); }
function go(x,y,order){ C({t:'goto', x:x, y:y, order:order||'xy', max:60*16}); }
function face(d){ C({t:'face', d:d}); }
function act(){ C({t:'act'}); }
function press(k){ C({t:'press', k:k}); }
function actUI(){ C({t:'actUI'}); }
function hand(pred){ C({t:'hand', pred:pred}); }
function shot(n){ C({t:'snap', n:n}); }
function area(a){ C({t:'untilArea', a:a, max:60*12}); }
function noUI(){ C({t:'untilNoUI', max:60*25}); }
function run(f){ C({t:'fn', f:f}); }

/* ------------------------------------------------------------ 手順 */
var FARM = [4,5,6,7];          // 耕す4マス（畑の y=9 の列）

/* 家の中は帳面(6,4)や台所が邪魔なので、下の通路を回って出入りする */
function houseToFarm(){
  go(2,7,'yx'); go(7,7,'xy'); go(7,10,'yx'); go(7,11,'yx'); area('home');
}
function dropToPath(){ C({t:'gotoY', y:8, max:60*8}); }
function farmToBed(){
  dropToPath();
  go(6,8,'xy'); go(6,7,'yx'); area('houseIn');
  go(7,7,'yx'); go(2,7,'xy'); go(2,5,'yx'); go(2,4,'yx'); face(3);
}

shot('01-title');
wait(0.6);
act();                          // 「はじめる」
wait(2.0);
shot('02-intro');
/* オババの話を最後まで送る */
for (var i=0;i<20;i++){ actUI(); wait(0.30); }
noUI();
wait(0.4);
shot('03-house');

/* 家から農場へ */
go(7,10,'xy'); go(7,11,'yx'); area('home'); wait(0.5);
shot('04-farm');

/* 耕す */
hand(function(s){ return s.id==='t_hoe'; });
FARM.forEach(function(x){ go(x,8,'xy'); face(0); act(); wait(0.55); });
wait(0.4);
shot('05-till');

/* 種をまく */
hand(function(s){ return s.id==='sd_akahoshi'; });
FARM.forEach(function(x){ go(x,8,'xy'); face(0); act(); wait(0.45); });
wait(0.4);
shot('06-plant');

/* 水タンクで補給 */
go(12,8,'xy'); go(12,6,'yx'); face(3); act(); wait(0.7);
shot('07-refill');

/* 水をやる（通路 y=8 に戻ってから横移動する。y=6 には木箱がある） */
go(12,8,'yx');
hand(function(s){ return s.id==='t_can'; });
FARM.forEach(function(x){ go(x,8,'xy'); face(0); act(); wait(0.45); });
wait(0.4);
shot('08-water');

/* 1日目 就寝 */
farmToBed(); act(); wait(0.8);
shot('09-sleep');
actUI();                        // 「はい」
wait(2.2);
shot('10-morning');
actUI(); noUI();

/* 2〜4日目：外に出て水をやって、また寝る */
for (var d=0; d<3; d++){
  houseToFarm(); wait(0.3);
  hand(function(s){ return s.id==='t_can'; });
  FARM.forEach(function(x){ go(x,8,'xy'); face(0); act(); wait(0.35); });
  if (d===1){ wait(0.4); shot('11-growing'); }
  farmToBed(); act(); wait(0.6);
  actUI(); wait(2.2);
  actUI(); noUI();
}

/* 収穫 */
houseToFarm(); wait(0.5);
shot('12-ripe');
FARM.forEach(function(x){ go(x,8,'xy'); face(0); act(); wait(0.55); });
wait(1.2);
/* はじめての収穫でオババが出てくるので、送ってから次へ */
for (var q=0;q<6;q++){ actUI(); wait(0.35); }
noUI(); wait(0.3);
shot('13-harvest');

/* 出荷箱へ（看板が真下にあるので、右から回りこむ） */
go(16,8,'xy'); go(16,6,'yx'); go(15,6,'xy'); face(3); act(); wait(0.6);
run(function(){
  var u = G.ui[G.ui.length-1];
  if (u) u.i = T.S.inv.findIndex(function(s){ return s && s.id==='cr_akahoshi'; });
});
wait(0.3);
shot('14-shipbox');
actUI(); wait(0.5);
shot('15-shipped');
press('cancel'); noUI();

/* 寝て精算（看板をよけてから通路へ戻る） */
go(16,6,'xy');
farmToBed(); act(); wait(0.6);
actUI(); wait(2.2);
shot('16-payout');
actUI(); noUI();

/* 中央区へ行って ZAX-9 と話す */
houseToFarm(); wait(0.3);
go(34,8,'xy'); go(34,17,'yx'); area('station'); wait(0.6);
shot('17-station');
go(6,7,'xy'); go(6,6,'yx'); face(3); act(); wait(1.6);
shot('18-zax');
actUI(); wait(1.4);
shot('19-menu');
actUI(); wait(0.8);            // 「買う」
shot('20-shop');

/* おしまい */
run(function(){ finish(); });

/* ------------------------------------------------------------ 実行役 */
var cur = null, curF = 0, started = false, driveN = 0;
function keysOff(){ G.keys.left=G.keys.right=G.keys.up=G.keys.down=false; }

function drive(){
  driveN++;
  if (!started){ started = true; G.keys.run = true; }
  if (!cur){
    cur = Q.shift(); curF = 0;
    if (!cur) return;
  }
  curF++;
  var S = T.S, done = false;

  switch (cur.t){
    case 'wait':  done = curF >= cur.f; break;
    case 'snap':  snap(cur.n); done = true; break;
    case 'face':  S.dir = cur.d; done = true; break;
    case 'press': G.pressed[cur.k] = true; done = true; break;
    case 'act':   if (!G.fade){ G.pressed.act = true; done = true; } break;
    case 'actUI': if (!G.fade){ if (G.ui.length) G.pressed.act = true; done = true; } break;
    case 'hand': {
      var i = S.inv.findIndex(function(s){ return s && cur.pred(s); });
      if (i >= 0){ S.hand = i; } else log('道具が見つからない');
      done = true; break;
    }
    case 'fn': try{ cur.f(); }catch(e){ log('fn err: '+e.message); } done = true; break;
    case 'untilArea':  done = (S.area === cur.a && !G.fade); break;
    case 'untilNoUI':  done = (G.ui.length === 0 && !G.fade); break;
    case 'gotoY': {
      if (G.fade || G.ui.length){ keysOff(); break; }
      var ty2 = cur.y*16 + 14, dy2 = ty2 - S.py;
      keysOff();
      if (Math.abs(dy2) > 2.0){ if (dy2<0) G.keys.up = true; else G.keys.down = true; }
      else done = true;
      break;
    }
    case 'goto': {
      if (G.fade){ keysOff(); break; }
      /* 歩こうとしたのに会話が開いていたら、送って閉じる */
      if (G.ui.length){ keysOff(); if (curF % 14 === 0) G.pressed.act = true; break; }
      /* 扉を踏んで場所が変わったら、その時点で目的達成 */
      if (cur.a0 == null) cur.a0 = S.area;
      if (S.area !== cur.a0){ keysOff(); done = true; break; }
      var tx = cur.x*16 + 8, ty = cur.y*16 + 14;
      var dx = tx - S.px, dy = ty - S.py;
      keysOff();
      var pri = (cur.order === 'xy') ? ['x','y'] : ['y','x'];
      var moved = false;
      for (var k=0; k<2 && !moved; k++){
        if (pri[k]==='x' && Math.abs(dx) > 2.0){ if (dx<0) G.keys.left = true; else G.keys.right = true; moved = true; }
        if (pri[k]==='y' && Math.abs(dy) > 2.0){ if (dy<0) G.keys.up = true;   else G.keys.down  = true; moved = true; }
      }
      if (!moved){ keysOff(); done = true; }
      break;
    }
  }

  if (!done && cur.max && curF > cur.max){
    log('⏱ 時間切れ: ' + cur.t + ' ' + (cur.x!=null ? cur.x+','+cur.y : (cur.a||cur.n||'')));
    if (cur.t === 'goto'){ T.S.px = cur.x*16+8; T.S.py = cur.y*16+14; }
    if (cur.t === 'untilNoUI'){ G.ui.length = 0; }
    keysOff(); done = true;
  }
  if (done){ if (cur.t === 'goto') keysOff(); cur = null; }
}

function status(){
  try{
    return T.SEASONS[T.S.season].name + T.S.day + '日 ' + Math.floor(T.S.time/60) + '時 ' +
           T.S.area + ' ' + T.S.credits + 'c 収穫' + (T.S.stat.harvested||0) + '個 ' +
           '残り命令' + Q.length + ' 駆動' + driveN + 'F mode=' + T.Game.mode +
           ' cur=' + (cur? cur.t : '-') + ' ui=' + T.Game.ui.length;
  }catch(e){ return 'status err'; }
}
function flushLog(){
  var lg = document.getElementById('playlog');
  if (!lg){ lg = document.createElement('u'); lg.id='playlog'; box().appendChild(lg); }
  lg.textContent = LOG.join(' | ') + ' || ' + status();
}
var finished = false;
function finish(){
  if (finished) return;
  finished = true;
  keysOff();
  flushLog();
  document.title = 'DONE ' + shots.length;
}

/* --------------------------------------------------------------------------
   ヘッドレスでは requestAnimationFrame が仮想時間で進まないので、
   ゲームの進行をこちらが引き取る。1フレーム＝16.7ms 固定なので結果も毎回おなじ。
   -------------------------------------------------------------------------- */
window.requestAnimationFrame = function(){ return 0; };
var ts = 1000, MAXF = 26000;
function step(){
  if (finished || driveN > MAXF){ finish(); return; }
  ts += 16.7;
  try { T.loop(ts); } catch(e){ log('loop err: '+e.message); finish(); return; }
  try { drive(); } catch(e){ log('drive err: '+e.message); finish(); return; }
  if ((driveN % 240) === 0) flushLog();
  /* 17ms ずつ進める＝ゲーム内の1フレームと仮想時計の歩幅をそろえる。
     こうしないと setTimeout で出てくる会話（導入・初収穫）の間が合わない。 */
  setTimeout(step, 17);
}
setTimeout(step, 17);
})();
