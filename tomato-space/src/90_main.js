/* =========================================================================
   90_main.js  —  はじまりと、ぐるぐる回るところ
   ========================================================================= */

function startNew(){
  newGame();
  initNPCs();
  Game.mode='play'; uiClear();
  Game.cam.x=-9999;
  Game.fade = { t:0, dur:0.5, fn:null, phase:1 };
  musicPick();
  if (!Game.noIntro) setTimeout(intro, 500);
}
function startContinue(){
  if (!loadGame()){ startNew(); return; }
  initNPCs();
  Game.mode='play'; uiClear();
  Game.cam.x=-9999;
  Game.fade = { t:0, dur:0.5, fn:null, phase:1 };
  musicPick();
  toast('おかえり。'+seasonNow().name+' '+S.day+'日目。');
}

function intro(){
  dialogSeq([
    {who:'', text:'——　西暦2387年。\n地球のトマトは、疫病で ほとんど絶えた。'},
    {who:'', text:'あなたは 祖母の遺した小惑星農場「ソラナム」に着いた。\n遺品は、種の入った缶と、書きこみだらけの帳面ひとつ。'},
    {who:'オババ', text:'……起きたか。\nわたしは記録から起こされたホログラムだ。本物はもういない。'},
    {who:'オババ', text:'外に畑がある。クワで耕して、種をまいて、水をやりな。\nそれだけだ。それだけを、毎日。'},
    {who:'オババ', text:'ここは宇宙だ。重力も、季節も、降ってくるものも、地球とは違う。\nだがトマトは、どこでもトマトだよ。'},
    {who:'オババ', text:'夜になったらベッドで寝な。寝ないと畑で倒れる。\n……帳面は、そこの机にある。読んでおきな。'},
    {who:'', text:'【Z】つかう・話す　【X】やめる　【Tab】道具をかえる\n【I】もちもの　【P】図鑑　【H】あそびかた'},
  ]);
}

function musicPick(){
  const a = areaOf(S.area);
  if (!a) return;
  const mode = a.mine? 'night' : (isNight()? 'night':'');
  musicStart(SEASONS[S.season].id, mode);
}

/* ---------------------------------------------------------------- 目印 */
function computeHint(){
  const a = areaOf(S.area);
  const [fx_,fy_] = facingTile();
  const n = npcAtTile(fx_,fy_);
  if (n) return NPCS[n.id].name+'　と話す（Z）';
  const o = objAt(a,fx_,fy_);
  if (o && !o.gone){
    const d = OBJDEF[o.t];
    const L = {
      water:'じょうろに水を汲む', bin:'出荷箱に入れる', gravity:'重力コンソール',
      shop:'ZAX-9の店', upgrade:'ナツキの工房', lab:'交配ラボ', sleep:'寝る（次の日へ）',
      calendar:'こよみを見る', note:'オババの帳面（図鑑）', machine:'加工台', sign:'読む',
      down:'下の層へ', up:'上へもどる',
    };
    if (d && d.act && L[d.act]) return L[d.act]+'（Z）';
    const hi0 = handItem();
    if (o.t==='rock') return (hi0 && hi0.id==='t_pick')? '石を割る（Z）' : '石（ツルハシで割れる）';
    if (o.t==='shrub') return (hi0 && hi0.id==='t_sickle')? '低木を刈る（Z）' : 'コスモ低木（カマで刈れる）';
  }
  const c = cropAt(S.area,fx_,fy_);
  if (c){
    if (c.dead) return '枯れた株（カマで片づける）';
    if (cropStage(c)===4) return VARIETIES[c.v].name+'を収穫（Z）';
    return VARIETIES[c.v].name+'（'+['種','芽','若株','花'][cropStage(c)]+'）';
  }
  const t = tileState(S.area,fx_,fy_,false);
  const hi = handItem();
  if (t && t.till){
    if (hi && hi.kind==='seed') return hi.name+'をまく（Z）';
    if (!t.wet) return 'かわいている　水をやろう';
    return '耕された土（うるおっている）';
  }
  if (tileAt(a,fx_,fy_).farm) return 'クワで耕せる（Z）';
  return '';
}

/* ---------------------------------------------------------------- 更新 */
function updatePlay(dt){
  S.t = Game.time;
  S.day2 = absDay();

  const top = uiTop();
  if (top){
    if (top.update) top.update(dt);
    uiKeys(top);
    Game.hint='';
  } else if (!Game.fade || Game.fade.phase===1){
    updatePlayer(dt);
    updateNPCs(dt);
    Game.hint = computeHint();

    if (pressed('act')) interact();
    if (pressed('cancel')) openSystem();
    if (pressed('bag')) openBag();
    if (pressed('dex')) openDex();
    if (pressed('quest')) openQuests();
    if (pressed('help')) openHelp();
    if (pressed('next')) cycleHand(1);
    if (pressed('prev')) cycleHand(-1);
    if (pressed('sound')){ musicSetOn(!Audio_.musicOn); toast(Audio_.musicOn?'音楽：オン':'音楽：オフ'); }
    for (let i=0;i<10;i++){
      if (pressed('s'+((i+1)%10))){ S.hand=i; SFX.menu(); }
    }
    /* 26:00 で力つき */
    if (S.time >= DAY_END && !Game.fainting) faint();
  }

  /* 効果・通知 */
  for (let i=Game.fx.length-1;i>=0;i--){
    Game.fx[i].t += dt*2.6;
    if (Game.fx[i].t>=1) Game.fx.splice(i,1);
  }
  for (let i=Game.toasts.length-1;i>=0;i--){
    Game.toasts[i].t += dt;
    if (Game.toasts[i].t>3.6) Game.toasts.splice(i,1);
  }
  if (Game.shake>0) Game.shake = Math.max(0, Game.shake-dt*3);

  updateCamera();
  musicPick();
}

/* 時間の進み（読みやすく分けた） */
function tickClock(dt){
  if (uiTop()) return;
  if (Game.fade && Game.fade.phase===0) return;
  S.time += dt * MIN_PER_SEC;
}

function updateTitle(dt){
  const opts = Game.titleOpts || ['はじめる','あそびかた'];
  if (pressed('up')){ Game.titleSel=((Game.titleSel||0)-1+opts.length)%opts.length; SFX.menu(); }
  if (pressed('down')){ Game.titleSel=((Game.titleSel||0)+1)%opts.length; SFX.menu(); }
  if (uiTop()){
    const top=uiTop();
    if (top.update) top.update(dt);
    uiKeys(top);
    return;
  }
  if (pressed('act')){
    const o = opts[Game.titleSel||0];
    SFX.ok();
    if (o==='つづきから') startContinue();
    else if (o==='はじめる'||o==='はじめから'){
      if (hasSave()) confirmBox('いまの記録を消して、はじめから遊ぶ？', ()=>{ deleteSave(); startNew(); });
      else startNew();
    }
    else openHelp();
  }
}

/* 触って遊ぶとき：スライドパッドを倒したら、メニューでも上下左右を押したことにする
   （倒したままなら、少し待ってから連続で送る） */
function padToKeys(dt){
  if (!Game.touch) return;
  const px_ = Game.pad.x, py_ = Game.pad.y;
  let dir = null;
  if (Math.abs(py_) >= Math.abs(px_)){ if (py_<0) dir='up'; else if (py_>0) dir='down'; }
  if (!dir){ if (px_<0) dir='left'; else if (px_>0) dir='right'; }
  const menu = !!uiTop() || Game.mode!=='play';
  if (dir !== Game.padDir){
    Game.padDir = dir; Game.padRep = 0.38;
    if (dir && menu) Game.pressed[dir] = true;
  } else if (dir && menu){
    Game.padRep -= dt;
    if (Game.padRep <= 0){ Game.padRep = 0.12; Game.pressed[dir] = true; }
  }
}

/* 押されたキーをいちばん上の画面へ。上下左右は押された回数ぶん送る */
function uiKeys(top){
  for (const k in Game.pressed){
    if (!Game.pressed[k]) continue;
    const dirKey = (k==='up'||k==='down'||k==='left'||k==='right');
    const n = dirKey? Math.min(8, Game.pressed[k]|0 || 1) : 1;
    for (let i=0;i<n;i++){
      if (uiTop()!==top) return;   /* 画面が閉じたり変わったりしたら、そこでやめる */
      top.key(k);
    }
  }
}

/* ---------------------------------------------------------------- 本体 */
function loop(ts){
  if (!Game.lastT) Game.lastT = ts;
  let dt = (ts - Game.lastT)/1000;
  Game.lastT = ts;
  if (dt>0.1) dt=0.1;
  Game.time += dt;

  /* 暗転 */
  if (Game.fade){
    const f = Game.fade;
    f.t += dt;
    if (f.phase===0 && f.t>=f.dur){
      f.phase=1; f.t=0;
      if (f.fn) f.fn();
    } else if (f.phase===1 && f.t>=f.dur){
      Game.fade=null;
    }
  }

  const c = R.c;
  padToKeys(dt);
  Game.tapHits = [];
  if (Game.mode==='title'){
    updateTitle(dt);
    drawTitle();
  } else if (Game.mode==='ending'){
    Game.ending += dt;
    drawEnding();
    if (Game.ending > ENDING.length+10 && pressed('act')){
      Game.mode='play'; Game.ending=0; SFX.ok();
      toast('ギャラクシアの種は、まだ手もとにある。');
    }
  } else {
    tickClock(dt);
    updatePlay(dt);
    if (W3.on){
      w3Frame(dt);
      c.clearRect(0,0,R.W,R.H);
      drawOverlay3D();
    } else {
      drawWorld();
      c.clearRect(0,0,R.W,R.H);
      c.drawImage(R.world, 0,0, R.W, R.H);
    }
    drawHUD();
    for (const u of Game.ui) if (u.draw) u.draw(c);
  }
  drawFade();
  clearPressed();
  requestAnimationFrame(loop);
}

/* 3D表示のうえに重ねる、画面全体の効果（砂嵐・フレア・停電と、四隅のかげり） */
function drawOverlay3D(){
  const c = R.c, a = areaOf(S.area);
  if (a && a.sky){
    const w = S.weather;
    if (w==='dust' || w==='flare' || w==='outage'){
      R.wc.clearRect(0,0,VW,VH);
      drawWeather(R.wc, 0, 0, a);
      c.save(); c.imageSmoothingEnabled = true;
      c.drawImage(R.world, 0,0, R.W, R.H);
      c.restore();
    } else if (w==='meteor'){
      c.fillStyle='rgba(60,40,70,0.12)'; c.fillRect(0,0,R.W,R.H);
    }
  }
  if (!Game._vig || Game._vigW!==R.W || Game._vigH!==R.H){
    const cv = mkCv(R.W, R.H), g = cv.getContext('2d');
    const rg = g.createRadialGradient(R.W/2,R.H*0.48,Math.min(R.W,R.H)*0.35,R.W/2,R.H/2,Math.max(R.W,R.H)*0.75);
    rg.addColorStop(0,'rgba(0,0,0,0)'); rg.addColorStop(1,'rgba(6,8,24,0.42)');
    g.fillStyle=rg; g.fillRect(0,0,R.W,R.H);
    Game._vig = cv; Game._vigW=R.W; Game._vigH=R.H;
  }
  c.drawImage(Game._vig,0,0);
}

function boot(){
  const cv = document.getElementById('game');
  bakeTiles();
  if (w3Init() && document.body) document.body.classList.add('is3d');
  initRender(cv);
  bindInput(cv);
  /* 仮の状態（タイトル画面でも季節などを参照するため） */
  S = { season:0, day:1, year:1, time:600, gravIdx:2, weather:'clear', npc:{}, inv:[], ups:{}, dex:{}, crops:{}, tiles:{}, ship:[], machines:[], ground:[], stat:{}, credits:0, energy:1, energyMax:1, water:0, waterMax:20, area:'home', flags:{} };
  Game.mode='title'; Game.titleSel = 0;
  Game.titleOpts = hasSave()? ['つづきから','はじめから','あそびかた'] : ['はじめる','あそびかた'];
  const ld = document.getElementById('loading');
  if (ld) ld.style.display='none';
  requestAnimationFrame(loop);
}

if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

/* 手もとの確認用の窓口（遊ぶうえでは使わない） */
window.TSF = {
  Game:Game, R:R, AREAS:AREAS, VARIETIES:VARIETIES, ITEMS:ITEMS, NPCS:NPCS, SEASONS:SEASONS,
  loop:loop, boot:boot,
  get S(){ return S; }, set S(v){ S = v; },
  startNew:startNew, startContinue:startContinue, advanceDay:advanceDay, newGame:newGame,
  initNPCs:initNPCs, plantNow:plantNow, tileState:tileState, invPut:invPut, genMine:genMine,
  openShop:openShop, openDex:openDex, openBag:openBag, openUpgrade:openUpgrade, openLab:openLab,
  openQuests:openQuests, openCalendar:openCalendar, openHelp:openHelp, openGravity:openGravity,
  dialogSeq:dialogSeq, showMorning:showMorning, enterMine:enterMine, uiClear:uiClear,
  cropStage:cropStage, musicStop:musicStop,
  W3:W3,
  /* 立体の画面と文字の画面を重ねた1枚の絵（自動プレイの記録用） */
  snapshot:function(){
    if (!W3.on) return document.getElementById('game').toDataURL('image/png');
    if (Game.mode==='play') W3.renderer.render(W3.scene, W3.camera);
    else W3.renderer.render(W3.tScene, W3.tCam);
    const out = mkCv(R.W, R.H), g = out.getContext('2d');
    g.drawImage(W3.cv, 0, 0, R.W, R.H);
    g.drawImage(R.cv, 0, 0);
    return out.toDataURL('image/png');
  },
};
