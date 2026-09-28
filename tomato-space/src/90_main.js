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
    if (o.t==='rock') return '石を割る（ツルハシ）';
    if (o.t==='shrub') return 'コスモ低木（カマで刈れる）';
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
    for (const k in Game.pressed) if (Game.pressed[k]) top.key(k);
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
    for (const k in Game.pressed) if (Game.pressed[k]) top.key(k);
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
    drawWorld();
    c.clearRect(0,0,R.W,R.H);
    c.drawImage(R.world, 0,0, R.W, R.H);
    drawHUD();
    for (const u of Game.ui) if (u.draw) u.draw(c);
  }
  drawFade();
  clearPressed();
  requestAnimationFrame(loop);
}

function boot(){
  const cv = document.getElementById('game');
  bakeTiles();
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
};
