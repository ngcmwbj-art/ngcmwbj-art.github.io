/* =========================================================================
   40_state.js  —  ゲームの状態・もちもの・セーブ
   ========================================================================= */

const SAVE_KEY = 'tomato_space_farm_save_v1';
let S = null;

function newGame(farmName, playerName){
  S = {
    ver:1,
    farmName: farmName || 'ソラナム農場',
    who: playerName || 'あなた',
    year:1, season:0, day:1, time:DAY_START,
    credits:800, energy:100, energyMax:100,
    gravIdx:2, weather:'clear', tomorrowWeather:null,
    area:'houseIn', px:7*TILE+8, py:9*TILE+15, dir:0,
    invMax:20, inv:new Array(40).fill(null), hand:0,
    water:0, waterMax:20,
    tiles:{}, crops:{}, ground:[],
    ship:[],
    machines:new Array(8).fill(null),
    ups:{}, dex:{}, npc:{}, quests:[], questDay:0,
    totalShipped:0, rank:0, flags:{},
    mineFloor:1, mineSeed:(Math.random()*99999)|0, mineDay:0,
    log:[], t:0, day2:1,
    stat:{ harvested:0, shipped:0, watered:0, tilled:0, rocks:0, mutations:0, days:0 },
  };
  for (const id of NPC_LIST) S.npc[id] = { hearts:0, pts:0, talkDay:0, giftDay:0 };
  invPut('t_hoe',1); invPut('t_can',1); invPut('t_sickle',1); invPut('t_pick',1);
  invPut('sd_akahoshi',12);
  invPut('jelly',2);
  S.day2 = 1;
  rollWeather();
  makeQuests();
  return S;
}

function saveGame(){
  try{
    const copy = Object.assign({}, S);
    delete copy.mineArea; delete copy.t;
    localStorage.setItem(SAVE_KEY, JSON.stringify(copy));
    return true;
  }catch(e){ console.warn('save failed', e); return false; }
}
function hasSave(){
  try{ return !!localStorage.getItem(SAVE_KEY); }catch(e){ return false; }
}
function loadGame(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const o = JSON.parse(raw);
    if (!o || !o.inv) return false;
    S = o;
    S.t = 0;
    if (!S.stat) S.stat = { harvested:0, shipped:0, watered:0, tilled:0, rocks:0, mutations:0, days:0 };
    if (!S.ground) S.ground = [];
    if (S.area==='mine') S.area='home', S.px=5*TILE+8, S.py=23*TILE+12;
    return true;
  }catch(e){ console.warn('load failed', e); return false; }
}
function deleteSave(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }

/* ---------------------------------------------------------------- 便利 */
function hasUp(id){ return !!(S && S.ups && S.ups[id]); }
function seasonNow(){ return SEASONS[S.season]; }
function gravNow(){ return GRAVITY_STEPS[S.gravIdx]; }
function key(area,x,y){ return area+':'+x+','+y; }
function absDay(){ return (S.year-1)*(DAYS_PER_SEASON*4) + S.season*DAYS_PER_SEASON + S.day; }
function clockStr(){
  let m = S.time|0;
  const h = Math.floor(m/60)%24, mi = m%60;
  return String(h).padStart(2,'0')+':'+String(Math.floor(mi/10)*10).padStart(2,'0');
}
function isNight(){ return S.time >= 1140 || S.time < 390; }
function rankNow(){
  let r=0;
  for (let i=0;i<RANKS.length;i++) if (S.totalShipped >= RANKS[i].need) r=i;
  return r;
}

/* ---------------------------------------------------------------- 在庫 */
function invSize(){ return hasUp('bag2')? 40 : hasUp('bag')? 30 : 20; }
function stackMax(id){
  const it = ITEMS[id];
  if (!it) return 1;
  if (it.kind==='tool') return 1;
  return 99;
}
function invCount(id, q){
  let n=0;
  for (let i=0;i<invSize();i++){
    const s=S.inv[i]; if (!s) continue;
    if (s.id===id && (q==null || (s.q||0)===q)) n += s.qty;
  }
  return n;
}
function invPut(id, qty, q){
  q = q||0; qty = qty||1;
  const max = stackMax(id), N = invSize();
  /* 同じものに足す */
  for (let i=0;i<N && qty>0;i++){
    const s = S.inv[i];
    if (s && s.id===id && (s.q||0)===q && s.qty<max){
      const add = Math.min(max-s.qty, qty);
      s.qty += add; qty -= add;
    }
  }
  /* 空き枠へ */
  for (let i=0;i<N && qty>0;i++){
    if (!S.inv[i]){
      const add = Math.min(max, qty);
      S.inv[i] = { id:id, qty:add, q:q };
      qty -= add;
    }
  }
  return qty;   // 入りきらなかった数
}
function invTake(id, qty, q){
  qty = qty||1;
  let need = qty;
  for (let i=0;i<invSize() && need>0;i++){
    const s=S.inv[i]; if(!s) continue;
    if (s.id===id && (q==null || (s.q||0)===q)){
      const t = Math.min(s.qty, need);
      s.qty -= t; need -= t;
      if (s.qty<=0) S.inv[i]=null;
    }
  }
  return qty-need;
}
function invTakeSlot(i, qty){
  const s = S.inv[i]; if (!s) return null;
  const t = Math.min(s.qty, qty||s.qty);
  const out = { id:s.id, qty:t, q:s.q||0 };
  s.qty -= t; if (s.qty<=0) S.inv[i]=null;
  return out;
}
function invHasRoom(id, qty){
  let left = qty||1;
  const max = stackMax(id);
  for (let i=0;i<invSize() && left>0;i++){
    const s=S.inv[i];
    if (!s) left -= max;
    else if (s.id===id && s.qty<max) left -= (max-s.qty);
  }
  return left<=0;
}
function handSlot(){ return S.inv[S.hand]; }
function handItem(){ const s = handSlot(); return s? ITEMS[s.id] : null; }

/* ---------------------------------------------------------------- 素材 */
function payMats(mats){
  for (const k in mats) if (invCount(k) < mats[k]) return false;
  for (const k in mats) invTake(k, mats[k]);
  return true;
}
function hasMats(mats){
  for (const k in mats) if (invCount(k) < mats[k]) return false;
  return true;
}
function matsText(mats){
  const a=[];
  for (const k in mats) a.push(ITEMS[k].name+'×'+mats[k]+'('+invCount(k)+')');
  return a.join('　');
}

/* ---------------------------------------------------------------- 図鑑 */
function dexRecord(vid, size, sugar, q){
  if (!S.dex[vid]) S.dex[vid] = { n:0, bestSize:0, bestSugar:0, bestQ:0, first:absDay() };
  const d = S.dex[vid];
  d.n++;
  if (size>d.bestSize) d.bestSize=size;
  if (sugar>d.bestSugar) d.bestSugar=sugar;
  if (q>d.bestQ) d.bestQ=q;
}
function dexCount(){ return Object.keys(S.dex).length; }

/* ---------------------------------------------------------------- 好感 */
function npcGain(id, pts){
  const n = S.npc[id]; if (!n) return;
  const before = n.hearts;
  n.pts += pts;
  while (n.pts >= 100 && n.hearts < 10){ n.pts -= 100; n.hearts++; }
  if (n.hearts > before){ SFX.levelup(); toast(NPCS[id].name+'との仲が深まった（♥'+n.hearts+'）'); }
}

/* ---------------------------------------------------------------- 天候 */
function rollWeather(){
  const tbl = WEATHER_TABLE[SEASONS[S.season].id];
  let tot=0; for (const t of tbl) tot+=t[1];
  let r = Math.random()*tot;
  for (const t of tbl){ r-=t[1]; if (r<=0){ S.tomorrowWeather = t[0]; return; } }
  S.tomorrowWeather='clear';
}

/* ---------------------------------------------------------------- 依頼 */
function makeQuests(){
  S.quests = [];
  S.questDay = absDay();
  const rank = rankNow();
  const pool = [];
  for (const v of VARIETY_LIST){
    const V = VARIETIES[v];
    if (V.tier > rank+2) continue;
    if (!S.dex[v] && V.tier>1) continue;
    pool.push({ id:'cr_'+v, kind:'crop' });
    if (S.dex[v]) for (const p of Object.keys(PROCESS)){
      if (S.machines.some(m=>m && m.type===PROCESS[p].machine)) pool.push({ id:'g_'+p+'_'+v, kind:'good' });
    }
  }
  pool.push({id:'m_iron',kind:'mat'},{id:'m_ice',kind:'mat'});
  if (S.mineFloor>3) pool.push({id:'m_silicon',kind:'mat'});
  if (S.mineFloor>6) pool.push({id:'m_crystal',kind:'mat'});
  const used = {};
  for (let i=0;i<3 && pool.length;i++){
    let pick=null, guard=0;
    do { pick = pool[(Math.random()*pool.length)|0]; guard++; } while (used[pick.id] && guard<20);
    used[pick.id]=1;
    const it = ITEMS[pick.id];
    const n = pick.kind==='mat'? (3+((Math.random()*8)|0)) : (1+((Math.random()*4)|0));
    const tpl = QUEST_TEMPLATES.find(t=>t.kind===pick.kind) || QUEST_TEMPLATES[0];
    S.quests.push({
      id: pick.id, n:n, kind:pick.kind,
      text: tpl.text(n, pick.id),
      pay: Math.max(120, Math.round((it.sell||60) * n * tpl.pay)),
      by: NPC_LIST[(Math.random()*4)|0],
      done:false,
    });
  }
}
