/* =========================================================================
   50_player.js  —  操作・歩く・使う
   ========================================================================= */

const Game = {
  mode:'title',          // title / play / ending
  ui:[],                 // 重ねて開く画面（いちばん上が操作対象）
  keys:{}, pressed:{},
  walkT:0, frame:0, moving:false,
  swing:null,
  fx:[], toasts:[],
  fade:null,
  npcs:{},
  cam:{x:0,y:0},
  sky:null, skySeason:-1,
  sleptLate:false, fainting:false,
  touch:false, pad:{x:0,y:0,act:false,cancel:false},
  time:0, lastT:0,
  shake:0,
  ending:0,
  hint:'',
};

const NPC_SPOTS = {
  station:[
    { id:'zax',     x:6,  y:5,  wander:0 },
    { id:'luna',    x:13, y:5,  wander:0 },
    { id:'natsuki', x:18, y:5,  wander:0 },
    { id:'obaba',   x:12, y:8,  wander:0 },
  ],
  home:[
    { id:'toma', x:19, y:21, wander:5 },
  ],
};

function initNPCs(){
  Game.npcs = {};
  for (const a in NPC_SPOTS){
    Game.npcs[a] = NPC_SPOTS[a].map(s=>({
      id:s.id, hx:s.x, hy:s.y, wander:s.wander,
      x:s.x*TILE+8, y:s.y*TILE+15, tx:s.x, ty:s.y, t:Math.random()*10, wait:1+Math.random()*3,
    }));
  }
}

/* ---------------------------------------------------------------- 入力 */
const KEYMAP = {
  ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right',
  KeyW:'up', KeyS:'down', KeyA:'left', KeyD:'right',
  KeyZ:'act', Space:'act', Enter:'act',
  KeyX:'cancel', Escape:'cancel', Backspace:'cancel',
  Tab:'next', KeyQ:'prev', KeyE:'next',
  KeyI:'bag', KeyP:'dex', KeyJ:'quest', KeyM:'map',
  ShiftLeft:'run', ShiftRight:'run',
  Digit1:'s1',Digit2:'s2',Digit3:'s3',Digit4:'s4',Digit5:'s5',
  Digit6:'s6',Digit7:'s7',Digit8:'s8',Digit9:'s9',Digit0:'s0',
  KeyH:'help', KeyF:'sound',
};

function bindInput(cv){
  window.addEventListener('keydown', e=>{
    const k = KEYMAP[e.code];
    if (k){ e.preventDefault(); if (!Game.keys[k]) Game.pressed[k]=true; Game.keys[k]=true; }
    audioResume();
  });
  window.addEventListener('keyup', e=>{
    const k = KEYMAP[e.code];
    if (k){ e.preventDefault(); Game.keys[k]=false; }
  });
  window.addEventListener('blur', ()=>{ Game.keys={}; });

  /* 触って遊ぶ用 */
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints>0;
  if (isTouch){
    Game.touch = true;
    const handle = (e, down)=>{
      e.preventDefault(); audioResume();
      Game.pad.x=0; Game.pad.y=0;
      if (!down){ Game.padAct=false; return; }
      const r = cv.getBoundingClientRect();
      for (let i=0;i<e.touches.length;i++){
        const t = e.touches[i];
        const fx = (t.clientX-r.left)/r.width, fy=(t.clientY-r.top)/r.height;
        if (fx < 0.34 && fy > 0.52){
          /* 左下＝十字 */
          const cx=0.17, cy=0.78;
          const dx=fx-cx, dy=fy-cy;
          if (Math.abs(dx)>Math.abs(dy)) Game.pad.x = dx>0?1:-1;
          else Game.pad.y = dy>0?1:-1;
        } else if (fx > 0.70 && fy > 0.58){
          if (fy > 0.80 || fx < 0.85){ if(!Game.padActPrev) Game.pressed['act']=true; Game.padAct=true; }
          else { if(!Game.padCanPrev) Game.pressed['cancel']=true; }
        } else if (fy < 0.16 && fx > 0.85){
          if (!Game.padBagPrev) Game.pressed['bag']=true;
        } else if (fy < 0.16 && fx > 0.70){
          if (!Game.padNxtPrev) Game.pressed['next']=true;
        }
      }
      Game.padActPrev = Game.padAct;
    };
    cv.addEventListener('touchstart', e=>handle(e,true), {passive:false});
    cv.addEventListener('touchmove',  e=>handle(e,true), {passive:false});
    cv.addEventListener('touchend',   e=>handle(e,false), {passive:false});
    cv.addEventListener('touchcancel',e=>handle(e,false), {passive:false});
  }
  cv.addEventListener('mousedown', ()=>audioResume());
}
function pressed(k){ return !!Game.pressed[k]; }
function held(k){
  if (Game.keys[k]) return true;
  if (Game.touch){
    if (k==='up') return Game.pad.y<0;
    if (k==='down') return Game.pad.y>0;
    if (k==='left') return Game.pad.x<0;
    if (k==='right') return Game.pad.x>0;
  }
  return false;
}
function clearPressed(){ Game.pressed = {}; }

/* ---------------------------------------------------------------- 更新 */
function facingTile(){
  const tx = Math.floor(S.px/TILE), ty = Math.floor((S.py-2)/TILE);
  const d = [[0,1],[-1,0],[1,0],[0,-1]][S.dir];
  return [tx+d[0], ty+d[1]];
}
function standTile(){ return [Math.floor(S.px/TILE), Math.floor((S.py-2)/TILE)]; }

function canWalk(area, nx, ny){
  const a = areaOf(area);
  const pts = [[nx-5,ny-5],[nx+5,ny-5],[nx-5,ny-1],[nx+5,ny-1]];
  for (const p of pts){
    const tx = Math.floor(p[0]/TILE), ty = Math.floor(p[1]/TILE);
    if (isSolid(a,tx,ty)) return false;
  }
  return true;
}

function updatePlayer(dt){
  /* 道具のふり */
  if (Game.swing){
    Game.swing.t += dt*3.6;
    if (Game.swing.t>=1) Game.swing=null;
  }
  const speed = (held('run')?128:80) * dt;
  let dx=0, dy=0;
  if (!Game.swing){
    if (held('left')) dx-=1;
    if (held('right')) dx+=1;
    if (held('up')) dy-=1;
    if (held('down')) dy+=1;
  }
  if (dx&&dy){ dx*=0.7071; dy*=0.7071; }
  Game.moving = !!(dx||dy);
  if (dx<0) S.dir=1; else if (dx>0) S.dir=2;
  else if (dy<0) S.dir=3; else if (dy>0) S.dir=0;

  if (dx){
    const nx = S.px + dx*speed;
    if (canWalk(S.area,nx,S.py)) S.px = nx;
  }
  if (dy){
    const ny = S.py + dy*speed;
    if (canWalk(S.area,S.px,ny)) S.py = ny;
  }
  if (Game.moving){
    Game.walkT += dt*(held('run')?11:7.5);
    const f = Math.floor(Game.walkT)%4;
    if (f!==Game.frame){
      Game.frame=f;
      if (f===1||f===3) SFX.step();
    }
  } else { Game.frame=0; Game.walkT=0; }

  /* 落ちものを拾う */
  const st = standTile();
  for (let i=S.ground.length-1;i>=0;i--){
    const g = S.ground[i];
    if (g.area!==S.area) continue;
    if (Math.abs(g.x-st[0])<=0 && Math.abs(g.y-st[1])<=0){
      if (invPut(g.id,g.qty,g.q||0)===0){
        toast(ITEMS[g.id].name+'×'+g.qty+' を拾った');
        SFX.coin(); S.ground.splice(i,1);
      }
    }
  }

  /* ワープ */
  const a = areaOf(S.area);
  const w = warpAt(a, st[0], st[1]);
  if (w && !Game.fade){
    doWarp(w);
  }
}

function doWarp(w){
  if (w.to==='greenIn' && !hasUp('greenh')){
    if (!Game.greenMsg || Game.time-Game.greenMsg > 4){
      Game.greenMsg = Game.time;
      toast('温室は壊れている。ナツキの工房で直してもらおう。');
      SFX.no();
    }
    S.py += 12;   // 扉から押し返す
    return;
  }
  SFX.warp();
  fadeOut(()=>{
    if (w.mine){ enterMine(1); return; }
    S.area = w.to;
    S.px = w.tx*TILE+8; S.py = w.ty*TILE+14;
    S.dir = w.dir!=null? w.dir : 0;
    Game.cam.x = -9999;
  }, 0.22);
}
function enterMine(floor){
  S.mineFloor = floor;
  S.mineArea = genMine(floor, S.mineSeed);
  S.area='mine';
  S.px = S.mineArea.spawn.x*TILE+8;
  S.py = S.mineArea.spawn.y*TILE+14;
  S.dir = 0;
  Game.cam.x=-9999;
}

/* ---------------------------------------------------------------- 住民 */
function updateNPCs(dt){
  const list = Game.npcs[S.area];
  if (!list) return;
  for (const n of list){
    n.t += dt;
    if (!n.wander) continue;
    n.wait -= dt;
    if (n.wait<=0){
      n.wait = 1.5+Math.random()*3.5;
      const a = areaOf(S.area);
      for (let i=0;i<8;i++){
        const nx = n.hx + ((Math.random()*2*n.wander)|0) - n.wander;
        const ny = n.hy + ((Math.random()*2*n.wander)|0) - n.wander;
        if (!isSolid(a,nx,ny)){ n.tx=nx; n.ty=ny; break; }
      }
    }
    const gx = n.tx*TILE+8, gy = n.ty*TILE+15;
    const ddx = gx-n.x, ddy = gy-n.y;
    const d = Math.hypot(ddx,ddy);
    if (d>1.2){ n.x += ddx/d*26*dt; n.y += ddy/d*26*dt; }
  }
}
function npcAtTile(x,y){
  const list = Game.npcs[S.area]; if (!list) return null;
  for (const n of list){
    const nx = Math.floor(n.x/TILE), ny = Math.floor((n.y-2)/TILE);
    if (nx===x && ny===y) return n;
    if (nx===x && ny-1===y) return n;   // 背の高い相手は1マス上も当たり判定
  }
  return null;
}

/* ---------------------------------------------------------------- 使う */
function swing(act){ Game.swing = { act:act, t:0 }; }

function interact(){
  const [fx_, fy_] = facingTile();
  const a = areaOf(S.area);

  /* 住民 */
  const n = npcAtTile(fx_,fy_);
  if (n){ talkTo(n.id); return; }

  /* 置いてあるもの */
  const o = objAt(a, fx_, fy_);
  if (o && !o.gone){
    const d = OBJDEF[o.t];
    if (d && d.act){
      switch (d.act){
        case 'water':   refillCan(); return;
        case 'bin':     openShip(); return;
        case 'gravity': openGravity(); return;
        case 'shop':    openShop(); return;
        case 'upgrade': openUpgrade(); return;
        case 'lab':     openLab(); return;
        case 'sleep':   goSleep(); return;
        case 'calendar':openCalendar(); return;
        case 'note':    openDex(); return;
        case 'machine': openMachine(o.n); return;
        case 'vend':    openVend(); return;
        case 'sign':    dialogSeq([{who:'', text:o.text||'……読めない。'}]); return;
        case 'down':
          if (S.mineFloor>=10){ toast('これより下は岩盤だ。'); return; }
          if (S.mineFloor>=4 && rankNow()<3){ toast('これより下は崩れやすい。評価が上がれば下りられる。'); return; }
          SFX.warp(); fadeOut(()=>enterMine(S.mineFloor+1), 0.22); return;
        case 'up':
          SFX.warp();
          fadeOut(()=>{
            if (S.mineFloor<=1){ S.area='home'; S.px=5*TILE+8; S.py=23*TILE+14; S.dir=0; S.mineArea=null; }
            else enterMine(S.mineFloor-1);
            Game.cam.x=-9999;
          },0.22);
          return;
      }
    }
    if (o.t==='rock'){ actPick(fx_,fy_); return; }
    if (o.t==='shrub'){ toast('コスモ低木。カマで刈れる。'); return; }
    if (o.t==='crate'){ toast('農機具の箱。中身はもう空っぽ。'); return; }
    if (o.t==='poster'){ dialogSeq([{who:'', text:'色あせたポスター。\n『地球産トマト　—— もう一度、あの味を。』'}]); return; }
  }

  /* 実っていたら収穫 */
  const c = cropAt(S.area,fx_,fy_);
  const hs = handSlot(), hi = handItem();
  if (c && cropStage(c)===4 && !(hi && hi.id==='t_sickle')){
    if (hi && hi.id==='t_scan'){ scanCrop(c); return; }
    actHarvest(fx_,fy_); return;
  }

  /* 手に持っているもので */
  if (hi){
    if (hi.kind==='tool'){
      switch (hi.id){
        case 't_hoe':    actTill(fx_,fy_); return;
        case 't_can':    actWater(fx_,fy_); return;
        case 't_sickle': actSickle(fx_,fy_); return;
        case 't_pick':   actPick(fx_,fy_); return;
        case 't_scan':   scanTile(fx_,fy_); return;
      }
    }
    if (hi.kind==='seed'){ actPlant(fx_,fy_,S.hand); return; }
    if (hi.kind==='use' && hi.id.startsWith('f_')){ actFert(fx_,fy_,S.hand); return; }
    if (hi.kind==='use' && hi.energy){ eatItem(S.hand); return; }
    if (hi.kind==='crop'){ eatCrop(S.hand); return; }
  }
  if (c){ scanCrop(c); return; }
  toast('……なにもない。');
}

function eatItem(i){
  const s = S.inv[i]; if (!s) return;
  const it = ITEMS[s.id];
  S.energy = Math.min(S.energyMax, S.energy + (it.energy>=999? S.energyMax : it.energy));
  invTake(s.id,1,s.q||0);
  SFX.ok(); toast(it.name+'を食べた。元気が戻った。');
}
function eatCrop(i){
  const s = S.inv[i]; if (!s) return;
  const it = ITEMS[s.id];
  const V = VARIETIES[it.variety];
  confirmBox(it.name+'を食べる？\n（元気が'+(10+V.sugar*2)+'ほど戻る）', ()=>{
    S.energy = Math.min(S.energyMax, S.energy + 10 + V.sugar*2 + (s.q||0)*6);
    invTake(s.id,1,s.q||0);
    SFX.ok();
    toast(V.name+'を食べた。'+ (V.sugar>=10? '……甘い。ひどく甘い。' : V.sugar>=7? '甘くて、少し青い匂いがする。' : '土の味がする。悪くない。'));
  });
}
function scanCrop(c){
  const V = VARIETIES[c.v];
  const st = cropStage(c);
  const names = ['種をまいた','芽が出た','株が立った','花がついた','実っている'];
  let t = V.name+'\n状態：'+names[st];
  if (c.dead) t = V.name+'\n状態：枯れてしまった（カマで片づけられる）';
  else {
    t += '\n育ち：'+c.prog+' / '+c.need+' 日';
    if (c.re>0) t += '\n次の実まで：あと'+c.re+'日';
    if (c.fallen) t += '\n⚠ 倒れている（支柱があれば防げた）';
    if (c.fert) t += '\n肥料：'+ITEMS[c.fert].name;
    if (c.elite) t += '\n選抜種：★'+c.elite+'相当';
    const grav = GRAVITY_STEPS[c.gi!=null?c.gi:S.gravIdx];
    t += '\n重力：'+grav.name;
  }
  dialogSeq([{who:'生育スキャナ', text:t}]);
}
function scanTile(x,y){
  const c = cropAt(S.area,x,y);
  if (c){ scanCrop(c); return; }
  const t = tileState(S.area,x,y,false);
  if (t && t.till){
    dialogSeq([{who:'生育スキャナ', text:'耕された土。\n水：'+(t.wet?'足りている':'かわいている')+
      (t.fert? '\n肥料：'+ITEMS[t.fert].name : '\n肥料：なし')}]);
    return;
  }
  const grav = gravNow();
  dialogSeq([{who:'生育スキャナ', text:
    seasonNow().name+'（'+S.day+'日目）　天候：'+WEATHERS[S.weather].name+
    '\n重力：'+grav.name+'（'+grav.label+'）'+
    '\n'+grav.note+
    '\n\n'+seasonNow().note}]);
}

/* ---------------------------------------------------------------- 会話 */
function talkTo(id){
  const N = NPCS[id], st = S.npc[id];
  const lines = [];
  const warm = st.hearts>=4 && Math.random()<0.5;
  const pool = warm? N.warm : N.hello;
  lines.push({who:N.name, text:pool[(absDay()+st.hearts)%pool.length]});

  if (st.talkDay !== absDay()){
    st.talkDay = absDay();
    npcGain(id, 12);
  }

  /* 役割ごとの追い足し */
  if (id==='zax'){
    lines.push({who:N.name, text:'ご用ハ？', menu:[
      {label:'買う', act:()=>openShop()},
      {label:'依頼ボードを見る', act:()=>openQuests()},
      {label:'なんでもない', act:null},
    ]});
  } else if (id==='natsuki'){
    lines.push({who:N.name, text:'設備、どうする？', menu:[
      {label:'工房を見る', act:()=>openUpgrade()},
      {label:'加工機を買う', act:()=>openMachineShop()},
      {label:'また来る', act:null},
    ]});
  } else if (id==='luna'){
    lines.push({who:N.name, text:'研究の話をしましょうか。', menu:[
      {label:'交配する', act:()=>openLab()},
      {label:'トマト図鑑を見る', act:()=>openDex()},
      {label:'また来ます', act:null},
    ]});
  } else if (id==='obaba'){
    if (!S.flags.told1){ S.flags.told1=1; lines.push({who:'オババ', text:'帳面は家の中だ。読んでおきな。\n図鑑になってる。'}); }
    lines.push({who:N.name, text:'', menu:[
      {label:'昔の話を聞く', act:()=>obabaLore()},
      {label:'今日の助言をもらう', act:()=>obabaHint()},
      {label:'なんでもない', act:null},
    ]});
  } else if (id==='toma'){
    SFX.cat();
    npcGain(id, 4);
    lines.push({who:'', text:'（トマをなでた。しばらく元気が出た）'});
    S.energy = Math.min(S.energyMax, S.energy+6);
  }
  dialogSeq(lines);
}

const LORE = [
  'この小惑星に最初に来たのは、わたしの母だ。\n土なんぞ一粒も無かったところに、堆肥を積んだ。',
  'トマトは水をやりすぎると味が抜ける。かわいがりすぎるな、ということだ。\n人も同じかもしれんね。',
  '重力をいじるようになったのは、わたしの代からだ。\n小さく甘くするのも、大きく水っぽくするのも、農家の選択だ。',
  '青いトマトを見たのは一度だけだ。\nフレアの翌朝、畑の隅で光っていた。種は取れなかった。',
  '地球のトマトはもう無い。だがな、無くなったのは畑だ。\n種は、まだある。あんたの手の中に。',
  'ギャラクシア。理屈は帳面に書いてある。\n黒と青を掛け合わせろ、と。わたしは間に合わなかった。',
];
function obabaLore(){
  const i = (S.flags.loreI|0) % LORE.length;
  S.flags.loreI = i+1;
  dialogSeq([{who:'オババ', text:LORE[i]}]);
  npcGain('obaba', 6);
}
function obabaHint(){
  const t = [];
  const grav = gravNow();
  let n=0;
  for (const k in S.crops){ const c=S.crops[k]; if (cropStage(c)===4 && !c.dead) n++; }
  if (n) t.push('実ってるのが'+n+'株ある。早く採りな。');
  let dry=0;
  for (const k in S.tiles){ const kk=k.split(':')[0]; if (kk==='home' && S.tiles[k].till && !S.tiles[k].wet && S.crops[k]) dry++; }
  if (dry) t.push('水をやってない株が'+dry+'ある。');
  if (S.tomorrowWeather==='flare' && !hasUp('shield')) t.push('明日はフレアだ。シールドが無いなら、覚悟しておきな。……悪いことばかりでもない。');
  if (S.tomorrowWeather==='meteor') t.push('明日は隕石雨だ。畑に石が転がるよ。隕鉄が落ちてることもある。');
  if (S.tomorrowWeather==='dew') t.push('明日は結露だ。水やりは休んでいい。');
  if (seasonNow().id==='shimo' && !hasUp('heater')) t.push('霜季だ。フロストベルとブラックホール以外は凍る。');
  if (seasonNow().id==='kage' && !hasUp('lamp')) t.push('影季だ。ネビュラ以外は光が足りん。');
  if (grav.fallRisk>0 && !hasUp('stake')) t.push('その重力じゃ茎が倒れる。支柱を買いな。');
  if (!t.length) t.push('今日は特にない。よくやってるよ。');
  if (S.day===DAYS_PER_SEASON) t.push('明日から季が変わる。植えっぱなしの株に気をつけな。');
  dialogSeq([{who:'オババ', text:t.slice(0,3).join('\n')}]);
  npcGain('obaba', 4);
}

/* ---------------------------------------------------------------- 手持ち */
function cycleHand(dir){
  for (let i=0;i<10;i++){
    S.hand = (S.hand + dir + 10) % 10;
    if (S.inv[S.hand]) break;
  }
  SFX.menu();
}
