/* ============================================================================
   check.js  —  ブラウザ無しで中身を検査する（node check.js）
   Canvas と DOM を偽物で置きかえて、実際に起動・数日プレイしてみる。
   ========================================================================== */
const fs = require('fs');
const path = require('path');

const BUNDLE = path.join(__dirname, 'build', 'bundle.js');
if (!fs.existsSync(BUNDLE)){
  console.error('build/bundle.js がありません。先に python3 build.py を実行してください。');
  process.exit(1);
}

/* --------------------------------------------------- Canvas のふりをする */
function fakeCtx(){
  const grad = { addColorStop(){} };
  const ctx = {
    canvas:null,
    imageSmoothingEnabled:true, fillStyle:'', strokeStyle:'', lineWidth:1,
    font:'', textAlign:'', textBaseline:'', globalAlpha:1, globalCompositeOperation:'',
    shadowColor:'', shadowBlur:0, shadowOffsetY:0,
    save(){}, restore(){}, beginPath(){}, closePath(){}, moveTo(){}, lineTo(){},
    quadraticCurveTo(){}, bezierCurveTo(){}, arc(){}, arcTo(){}, ellipse(){}, rect(){},
    fill(){}, stroke(){},
    fillRect(){}, strokeRect(){}, clearRect(){}, clip(){}, translate(){}, rotate(){}, scale(){},
    drawImage(){}, fillText(){}, strokeText(){},
    createLinearGradient(){ return grad; }, createRadialGradient(){ return grad; },
    createPattern(){ return null; },
    measureText(t){ return { width: String(t).length*6 }; },
    getImageData(w,h){ return { data:new Uint8ClampedArray(4) }; },
    putImageData(){}, setTransform(){}, resetTransform(){},
  };
  return ctx;
}
function makeCanvas(){
  const c = {
    width:1, height:1, style:{},
    _ctx:null,
    getContext(){ if(!this._ctx){ this._ctx = fakeCtx(); this._ctx.canvas=this; } return this._ctx; },
    addEventListener(){}, removeEventListener(){},
    getBoundingClientRect(){ return {left:0,top:0,width:this.width,height:this.height}; },
  };
  return c;
}

const store = {};
const localStorage = {
  getItem(k){ return k in store? store[k] : null; },
  setItem(k,v){ store[k]=String(v); },
  removeItem(k){ delete store[k]; },
};

const listeners = {};
const gameCanvas = makeCanvas();
const document_ = {
  readyState:'complete',
  createElement(t){ return makeCanvas(); },
  getElementById(id){ return id==='game'? gameCanvas : null; },
  addEventListener(t,f){ (listeners[t]=listeners[t]||[]).push(f); },
};
let rafQueue = [];
const window_ = {
  innerWidth:1280, innerHeight:800,
  addEventListener(t,f){ (listeners[t]=listeners[t]||[]).push(f); },
  removeEventListener(){},
  AudioContext:null, webkitAudioContext:null,
  devicePixelRatio:1,
  maxTouchPoints:0,
};
const navigator_ = { maxTouchPoints:0, userAgent:'node' };
function raf(fn){ rafQueue.push(fn); return rafQueue.length; }

/* --------------------------------------------------- 読み込んで実行する */
const code = fs.readFileSync(BUNDLE,'utf8');
let api;
try {
  const f = new Function(
    'window','document','localStorage','navigator','requestAnimationFrame','console',
    code + `
    ;return {
      AREAS, TERRAIN, OBJDEF, VARIETIES, VARIETY_LIST, ITEMS, PROCESS, MACHINES,
      UPGRADES, RANKS, NPCS, SEASONS, QUALITY, GRAVITY_STEPS, CROSS_TABLE, crossResult,
      Game, R, loop, boot, drawIcon, drawPlant, drawNPC, drawTomato, mkCv, ctxOf,
      newGame, startNew, advanceDay, cropStage, tileState, actTill, actWater, plantNow,
      actHarvest, invPut, invCount, invTake, invSize, absDay, rankNow, makeQuests,
      shipPut, shipValue, doCross, genMine, isSolid, tileAt, objAt, warpAt, itemValue,
      getS: ()=>S, setS:(v)=>{S=v;}, bakeTiles, TILES, makeSky, qualityOf,
      openBag, openShip, openGravity, openCalendar, openShop, openVend, openMachineShop,
      openUpgrade, openLab, openDex, openQuests, openHelp, openSystem, openMachine,
      dialogSeq, confirmBox, showMorning, uiTop, uiClear, uiPush, uiPop, interact,
      updatePlay, drawWorld, drawHUD, initNPCs, enterMine, facingTile, computeHint,
      talkTo, goSleep, refillCan, actPick, actSickle, openVend2:openVend, PROCESS, crossResult2:crossResult,
      saveGame, loadGame, hasSave, deleteSave,
    };`
  );
  api = f(window_, document_, localStorage, navigator_, raf, console);
} catch(e){
  console.error('✗ 読み込みで失敗:', e.message);
  console.error(e.stack.split('\n').slice(0,6).join('\n'));
  process.exit(1);
}

let fails = 0, warns = 0;
function ok(msg){ console.log('  ✓ '+msg); }
function bad(msg){ console.log('  ✗ '+msg); fails++; }
function warn(msg){ console.log('  ! '+msg); warns++; }
function is(cond,msg){ cond? ok(msg) : bad(msg); }

console.log('\n=== 1. 地図のかたち ===');
for (const id in api.AREAS){
  const a = api.AREAS[id];
  const bad_rows = [];
  if (a.map.length !== a.h) bad_rows.push('行数 '+a.map.length+' ≠ h '+a.h);
  a.map.forEach((r,i)=>{ if (r.length!==a.w) bad_rows.push('行'+i+' の長さ '+r.length+' ≠ w '+a.w); });
  /* 未知の記号 */
  const unknown = new Set();
  a.map.forEach(r=>{ for (const ch of r) if (!(ch in api.TERRAIN)) unknown.add(ch); });
  if (unknown.size) bad_rows.push('未知の記号: '+[...unknown].join(''));
  /* 置いたものが場外に出ていないか */
  for (const o of a.objs||[]){
    const d = api.OBJDEF[o.t];
    if (!d){ bad_rows.push('未知の物体 '+o.t); continue; }
    if (o.x<0||o.y<0||o.x+d.w>a.w||o.y+d.h>a.h) bad_rows.push(o.t+' が場外 ('+o.x+','+o.y+')');
  }
  /* ワープ先の確認 */
  for (const w of a.warps||[]){
    if (w.mine) continue;
    const t = api.AREAS[w.to];
    if (!t){ bad_rows.push('ワープ先が無い: '+w.to); continue; }
    if (api.isSolid(t, w.tx, w.ty)) bad_rows.push('ワープ先が壁: '+w.to+' ('+w.tx+','+w.ty+')');
    const tt = api.tileAt(a, w.x, w.y);
    if (tt.solid) bad_rows.push('ワープ元が壁: ('+w.x+','+w.y+')');
  }
  /* 出発地点が歩けるか */
  if (a.spawn && api.isSolid(a, a.spawn.x, a.spawn.y)) bad_rows.push('spawn が壁の中');
  if (bad_rows.length) bad('['+id+'] '+bad_rows.join(' / '));
  else ok('['+id+'] '+a.w+'×'+a.h+'　物体'+(a.objs||[]).length+'　ワープ'+(a.warps||[]).length);
}

console.log('\n=== 2. データの整合 ===');
is(api.VARIETY_LIST.length===10, '品種は10種（'+api.VARIETY_LIST.length+'）');
let itemBad = [];
for (const id in api.ITEMS){
  const it = api.ITEMS[id];
  if (!it.name) itemBad.push(id+': 名前なし');
  if (!it.kind) itemBad.push(id+': kind なし');
  if (it.kind==='seed' && !api.VARIETIES[it.variety]) itemBad.push(id+': 品種不明');
}
is(itemBad.length===0, 'アイテム定義 '+Object.keys(api.ITEMS).length+'件 '+(itemBad.length?itemBad.join(','):'すべて正常'));
/* 交配表の到達性 */
const reach = new Set(['akahoshi','comet']);
for (let i=0;i<20;i++){
  for (const [a,b,c] of api.CROSS_TABLE) if (reach.has(a)&&reach.has(b)) reach.add(c);
  reach.add('cosmoblue');   // 変異で入手
}
const unreachable = api.VARIETY_LIST.filter(v=>!reach.has(v));
is(unreachable.length===0, '全品種に到達できる'+(unreachable.length? '（届かない: '+unreachable.join(',')+'）':''));
/* 設備の前提 */
let upBad=[];
for (const k in api.UPGRADES){ const U=api.UPGRADES[k]; if (U.req && !api.UPGRADES[U.req]) upBad.push(k); }
is(upBad.length===0, '設備の前提条件 '+(upBad.length? upBad.join(','):'すべて正常'));

console.log('\n=== 3. 起動して絵を描く ===');
try {
  api.boot();
  ok('boot() 成功');
} catch(e){ bad('boot() で例外: '+e.message+'\n'+e.stack.split('\n')[1]); }
try {
  /* タイトル画面を数フレーム */
  for (let i=0;i<5 && rafQueue.length;i++){
    const fn = rafQueue.shift();
    fn(1000+i*16);
  }
  ok('タイトル画面 5フレーム描画');
} catch(e){ bad('タイトル描画で例外: '+e.message+'\n'+e.stack.split('\n')[1]); }
/* 全アイテムのアイコン */
try {
  const cv = api.mkCv(16,16), g = api.ctxOf(cv);
  for (const id in api.ITEMS) api.drawIcon(g, id, 0,0,1);
  ok('アイコン '+Object.keys(api.ITEMS).length+'種すべて描けた');
} catch(e){ bad('アイコン描画で例外: '+e.message); }
/* 全品種・全成長段階の株 */
try {
  const cv = api.mkCv(32,32), g = api.ctxOf(cv);
  for (const v of api.VARIETY_LIST) for (let st=0;st<=4;st++)
    for (const f of [false,true]) for (const d of [false,true])
      api.drawPlant(g, 16, 28, v, st, 1.2, {seed:3, fallen:f, dead:d});
  ok('株 '+(api.VARIETY_LIST.length*5*4)+'パターン描けた');
} catch(e){ bad('株の描画で例外: '+e.message); }
/* 住民 */
try {
  const cv = api.mkCv(32,32), g = api.ctxOf(cv);
  for (const id in api.NPCS) for (let d=0;d<4;d++) api.drawNPC(g,id,16,28,1.5,d);
  ok('住民 '+Object.keys(api.NPCS).length+'人すべて描けた');
} catch(e){ bad('住民の描画で例外: '+e.message); }

console.log('\n=== 4. 何日か耕してみる ===');
try {
  api.startNew();
  const S = api.getS();
  is(S.credits>0, '所持金 '+S.credits+'c');
  is(api.invCount('sd_akahoshi')===12, '最初の種 12個');

  /* 温室ではなく畑で試す */
  S.area='home';
  let planted=0;
  for (let x=3;x<=12;x++){
    for (let y=9;y<=11;y++){
      S.energy = 100;
      api.actTill(x,y);
      const t = api.tileState('home',x,y,false);
      if (!t || !t.till) continue;
      const slot = S.inv.findIndex(sl=>sl&&sl.id==='sd_akahoshi');
      if (slot<0) break;
      api.plantNow(x,y,slot);
      planted++;
    }
  }
  is(planted>=10, planted+'株 植えられた');

  /* 水をやって6日すすめる */
  let harvested = 0;
  for (let day=0; day<8; day++){
    for (const k in S.crops){
      const p=k.split(':'); if (p[0]!=='home') continue;
      const t = api.tileState('home', ...p[1].split(',').map(Number), true);
      t.wet = true;
    }
    api.advanceDay(false);
    for (const k in S.crops){
      const c = S.crops[k];
      if (api.cropStage(c)===4 && !c.dead){
        const xy = k.split(':')[1].split(',').map(Number);
        S.energy=100;
        if (api.actHarvest(xy[0],xy[1])) harvested++;
      }
    }
  }
  is(harvested>0, harvested+'株 収穫できた（8日間）');
  is(api.invCount('cr_akahoshi')>0, 'アカホシの実 '+api.invCount('cr_akahoshi')+'個');
  is(Object.keys(S.dex).length>0, '図鑑に記録された（'+Object.keys(S.dex).join(',')+'）');

  /* 出荷 */
  const before = S.credits;
  const slot = S.inv.findIndex(sl=>sl&&sl.id==='cr_akahoshi');
  if (slot>=0){ api.shipPut(slot); const v=api.shipValue(); api.advanceDay(false);
    is(S.credits>before, '出荷で '+(S.credits-before)+'c 増えた（見積 '+v+'c）'); }

  /* 1年ぶん（56日）まわして落ちないか */
  for (let i=0;i<60;i++) api.advanceDay(false);
  is(S.year>=2, '1年以上すすめた（'+S.year+'年目 '+api.SEASONS[S.season].name+' '+S.day+'日）');
  ok('56日×1周で例外なし');
} catch(e){
  bad('農作業のあいだに例外: '+e.message+'\n'+e.stack.split('\n').slice(1,4).join('\n'));
}

console.log('\n=== 5. 交配の道すじ ===');
try {
  const S = api.getS();
  S.ups.lab = 1;
  const chain = [['akahoshi','comet'],['akahoshi','sunflare'],['comet','sunflare'],
                 ['sunflare','frostbell'],['jupiter','frostbell'],['jupiter','nebula']];
  let got = [];
  for (const [a,b] of chain){
    api.invPut('sd_'+a, 2); api.invPut('sd_'+b, 2);
    api.doCross(a,b);
    const r = api.crossResult(a,b);
    if (api.invCount('sd_'+r)>0) got.push(api.VARIETIES[r].name);
    else bad('交配失敗: '+a+'×'+b);
  }
  is(got.length===chain.length, '交配で新品種 '+got.join('→'));
  /* ギャラクシアまで */
  api.invPut('sd_blackhole',2); api.invPut('sd_cosmoblue',2);
  api.doCross('blackhole','cosmoblue');
  is(api.invCount('sd_galaxia')>0, 'ギャラクシアの種に到達できる');
} catch(e){ bad('交配で例外: '+e.message); }

console.log('\n=== 6. 坑道 ===');
try {
  let bads=[];
  for (let f=1;f<=10;f++){
    const m = api.genMine(f, 12345+f);
    if (m.map.length!==m.h) bads.push('F'+f+' 行数');
    m.map.forEach((r,i)=>{ if (r.length!==m.w) bads.push('F'+f+' 行'+i); });
    const up = m.objs.find(o=>o.t==='ladderUp'), dn = m.objs.find(o=>o.t==='ladderDn');
    if (!up||!dn) bads.push('F'+f+' はしご欠け');
    if (api.isSolid(m, m.spawn.x, m.spawn.y)) bads.push('F'+f+' spawn が壁');
    const rocks = m.objs.filter(o=>o.t==='rock').length;
    if (rocks<8) bads.push('F'+f+' 石が少ない('+rocks+')');
  }
  is(bads.length===0, '地下1〜10層 生成 '+(bads.length? bads.join(','):'すべて正常'));
} catch(e){ bad('坑道生成で例外: '+e.message); }

console.log('\n=== 7. 等級の計算 ===');
try {
  const rows = [[5,1.0],[8,1.0],[12,1.2],[16,1.6],[20,2.0]];
  const out = rows.map(([s,z])=>api.qualityOf(s,z));
  ok('糖度/大きさ → 等級: '+rows.map((r,i)=>r[0]+'/'+r[1]+'→'+api.QUALITY[out[i]].name).join('　'));
  is(out[0]===0 && out[out.length-1]===3, '並から特級まで出る');
} catch(e){ bad('等級で例外: '+e.message); }

console.log('\n=== 8. 画面をぜんぶ開いて、全部のキーを押してみる ===');
try {
  api.startNew();
  api.initNPCs();
  const S = api.getS();
  S.credits = 99999; S.ups.lab=1; S.ups.greenh=1; S.ups.bag=1;
  api.invPut('sd_comet',5); api.invPut('sd_sunflare',5); api.invPut('cr_akahoshi',9,2);
  api.invPut('m_iron',50); api.invPut('m_silicon',30); api.invPut('m_ice',30); api.invPut('m_crystal',10);
  S.machines[0] = { type:'juicer', in:null, out:null, doneDay:null };
  S.dex.akahoshi = { n:3, bestSize:1.2, bestSugar:9, bestQ:1 };
  api.makeQuests();

  const screens = [
    ['もちもの', ()=>api.openBag()],
    ['出荷箱', ()=>api.openShip()],
    ['重力コンソール', ()=>api.openGravity()],
    ['こよみ', ()=>api.openCalendar()],
    ['商店', ()=>api.openShop()],
    ['自販機', ()=>api.openVend()],
    ['加工機の店', ()=>api.openMachineShop()],
    ['工房', ()=>api.openUpgrade()],
    ['交配ラボ', ()=>api.openLab()],
    ['図鑑', ()=>api.openDex()],
    ['依頼', ()=>api.openQuests()],
    ['あそびかた', ()=>api.openHelp()],
    ['メニュー', ()=>api.openSystem()],
    ['加工台', ()=>api.openMachine(0)],
    ['朝の報告', ()=>api.showMorning()],
    ['会話', ()=>api.dialogSeq([{who:'オババ',text:'ためし'},{who:'',text:'ためし2',menu:[{label:'A',act:null},{label:'B',act:null}]}])],
    ['たしかめ', ()=>api.confirmBox('よい？', ()=>{}, ()=>{})],
    ['住民と話す', ()=>api.talkTo('zax')],
  ];
  const keys = ['down','up','right','left','act','down','act','cancel','cancel','cancel'];
  let opened = 0;
  for (const [name, open] of screens){
    api.uiClear();
    open();
    if (!api.uiTop()){ warn(name+' は開かなかった'); continue; }
    opened++;
    for (let i=0;i<keys.length;i++){
      const top = api.uiTop();
      if (!top) break;
      if (top.update) top.update(0.016);
      top.key(keys[i]);
      const t2 = api.uiTop();
      if (t2 && t2.draw) t2.draw(api.R.c);
    }
  }
  api.uiClear();
  is(opened>=16, opened+'/'+screens.length+' 画面が開いて、キー操作でも落ちなかった');
} catch(e){
  bad('画面操作で例外: '+e.message+'\n'+e.stack.split('\n').slice(1,4).join('\n'));
}

console.log('\n=== 9. 実際に歩かせてみる ===');
try {
  api.startNew(); api.initNPCs(); api.uiClear();
  const S = api.getS();
  api.Game.noIntro = true;
  api.Game.fade = null;
  /* 家から外へ */
  let warped = false;
  api.Game.keys.down = true;
  for (let i=0;i<260;i++){
    api.updatePlay(0.016);
    api.drawWorld(); api.drawHUD();
    if (api.Game.fade && api.Game.fade.fn){ api.Game.fade.fn(); api.Game.fade=null; }
    if (S.area==='home'){ warped = true; break; }
  }
  api.Game.keys.down = false;
  is(warped, '家から出て農場に着いた（'+S.area+'　'+Math.round(S.px/16)+','+Math.round(S.py/16)+'）');

  /* 畑まで歩いて耕す */
  S.px = 5*16+8; S.py = 9*16+14; S.dir = 0;
  S.hand = 0;
  api.interact();
  const t = api.tileState('home', 5, 10, false);
  is(t && t.till, 'クワで目の前のマスを耕せた');
  is(api.computeHint().length>0, '目のまえの案内が出る（「'+api.computeHint()+'」）');

  /* 水タンクで補給 */
  S.px = 12*16+8; S.py = 6*16+14; S.dir = 3;
  api.interact();
  is(S.water>0, 'タンクでじょうろに水を汲めた（'+S.water+'）');

  /* 石を割る */
  api.enterMine(3);
  const m = S.mineArea;
  const rock = m.objs.find(o=>o.t==='rock');
  S.px = rock.x*16+8; S.py = (rock.y+1)*16+14; S.dir = 3;
  S.hand = 3; S.energy = 100;
  const before = api.invCount('m_iron')+api.invCount('m_silicon')+api.invCount('m_crystal');
  for (let i=0;i<4;i++) api.interact();
  const after = api.invCount('m_iron')+api.invCount('m_silicon')+api.invCount('m_crystal');
  is(after>before, '坑道で石を割って鉱石が採れた（+'+(after-before)+'）');

  /* 描画も一通り */
  for (const area of ['home','station','houseIn','greenIn','shedIn']){
    S.area = area; S.mineArea=null;
    const a = api.AREAS[area];
    S.px = a.spawn.x*16+8; S.py = a.spawn.y*16+14;
    api.Game.cam.x = -9999;
    api.updatePlay(0.016); api.drawWorld(); api.drawHUD();
  }
  ok('全エリアを描画できた');
} catch(e){
  bad('歩かせている途中で例外: '+e.message+'\n'+e.stack.split('\n').slice(1,4).join('\n'));
}

console.log('\n=== 10. セーブして読みなおす ===');
try {
  api.startNew();
  let S = api.getS();
  S.credits = 4321; S.gravIdx = 3; S.ups.stake = 1;
  api.invPut('cr_blackhole', 5, 3);
  api.tileState('home', 4, 9, true).till = true;
  S.crops['home:4,9'] = { v:'nebula', prog:3, need:7, re:0, seed:9, gi:3, elite:1 };
  api.advanceDay(false);                       // 就寝時と同じ流れ（中で保存される）
  const beforeCredits = S.credits, beforeDay = api.absDay();
  is(api.hasSave(), '保存された');
  /* まっさらから読みなおす */
  api.startNew();
  is(api.getS().credits===800, '新規はじめでいったん初期化');
  const okLoad = api.loadGame();
  S = api.getS();
  is(okLoad, '読み込めた');
  is(S.credits===beforeCredits, '所持金が戻った（'+S.credits+'c）');
  is(api.absDay()===beforeDay, '日付が戻った（'+api.absDay()+'日目）');
  is(S.gravIdx===3, '重力設定が戻った');
  is(!!S.ups.stake, '設備が戻った');
  is(api.invCount('cr_blackhole',3)===5, '★3のブラックホールが5個 戻った');
  is(!!S.crops['home:4,9'], '畑の株が戻った（'+(S.crops['home:4,9']||{}).v+'）');
  api.deleteSave();
  is(!api.hasSave(), '記録を消せる');
} catch(e){ bad('セーブで例外: '+e.message+'\n'+e.stack.split('\n')[1]); }

console.log('\n───────────────────────────');
console.log(fails? ('✗ 問題 '+fails+'件'+(warns?('　注意 '+warns+'件'):'')) : ('✓ すべて通りました'+(warns?('　注意 '+warns+'件'):'')));
process.exit(fails? 1:0);
