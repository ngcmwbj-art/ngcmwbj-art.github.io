/* =========================================================================
   60_farm.js  —  耕す・撒く・水をやる・実る。そして一日が終わる
   ========================================================================= */

function tileState(area,x,y,make){
  const k = key(area,x,y);
  let t = S.tiles[k];
  if (!t && make){ t = S.tiles[k] = { till:false, wet:false, fert:null }; }
  return t;
}
function cropAt(area,x,y){ return S.crops[key(area,x,y)] || null; }
function cropStage(c){
  if (!c) return -1;
  if (c.dead) return 4;
  if (c.re>0) return 3;
  if (c.prog>=c.need) return 4;
  return Math.min(3, Math.floor(c.prog / c.need * 4));
}
function isFarmTile(area,x,y){
  const a = areaOf(area);
  const t = tileAt(a,x,y);
  return !!t.farm;
}
function areaIsGreen(area){ return area==='greenIn'; }

/* ---------------------------------------------------------------- 元気 */
function useEnergy(n){
  S.energy -= n;
  if (S.energy <= 0){ S.energy = 0; faint(); return false; }
  return true;
}
function faint(){
  if (Game.fainting) return;
  Game.fainting = true;
  SFX.no();
  const lost = Math.min(1200, Math.round(S.credits*0.08));
  S.credits = Math.max(0, S.credits - lost);
  fadeOut(()=>{
    S.area='houseIn'; S.px=7*TILE+8; S.py=9*TILE+15; S.dir=0;
    advanceDay(true);
    S.energy = Math.round(S.energyMax*0.5);
    Game.fainting = false;
    dialogSeq([
      {who:'', text:'……気を失っていた。'},
      {who:'ナツキ', text:'畑のまん中で倒れてたよ。運ぶの重かったんだから。\n手当て代、'+lost+'クレジットもらっとくね。'},
    ]);
  });
}

/* ---------------------------------------------------------------- 行動 */
function actTill(x,y){
  if (!isFarmTile(S.area,x,y)) { toast('ここは耕せない。'); SFX.no(); return; }
  if (cropAt(S.area,x,y)){ toast('作物が植わっている。'); SFX.no(); return; }
  const t = tileState(S.area,x,y,true);
  if (t.till){ toast('もう耕してある。'); return; }
  if (!useEnergy(ITEMS.t_hoe.ep)) return;
  t.till = true; S.stat.tilled++;
  SFX.hoe(); fx(x,y,'dirt');
  swing('hoe');
}
function actWater(x,y){
  if (S.water<=0){ toast('じょうろが空っぽ。水タンクで汲もう。'); SFX.no(); return; }
  const targets = [[x,y]];
  if (hasUp('can3')){
    const d=[[0,1],[0,-1],[-1,0],[1,0]][S.dir===0?0:S.dir===3?1:S.dir===1?2:3];
    targets.push([x+d[0],y+d[1]]);
    targets.push([x-d[1], y-d[0]]);
  }
  let did=0;
  for (const [tx,ty] of targets){
    if (S.water<=0) break;
    const t = tileState(S.area,tx,ty,false);
    if (!t || !t.till || t.wet) continue;
    t.wet = true; S.water--; did++; S.stat.watered++;
    fx(tx,ty,'water');
  }
  if (!did){ toast('ここに水はいらない。'); return; }
  useEnergy(ITEMS.t_can.ep);
  SFX.water(); swing('water');
}
function actPlant(x,y,slotIdx){
  const s = S.inv[slotIdx]; if (!s) return;
  const it = ITEMS[s.id]; if (!it || it.kind!=='seed') return;
  const V = VARIETIES[it.variety];
  const t = tileState(S.area,x,y,false);
  if (!t || !t.till){ toast('先に耕そう。'); SFX.no(); return; }
  if (cropAt(S.area,x,y)){ toast('もう植わっている。'); SFX.no(); return; }
  const green = areaIsGreen(S.area);
  if (!green && V.seasons.indexOf(seasonNow().id)<0){
    const ok = (seasonNow().id==='shimo' && hasUp('heater')) || (seasonNow().id==='kage' && hasUp('lamp'));
    if (!ok){
      confirmBox(V.name+'は'+seasonNow().name+'には育たない。\nそれでも植える？（育たずに時間だけが過ぎる）', ()=>plantNow(x,y,slotIdx));
      return;
    }
  }
  plantNow(x,y,slotIdx);
}
function plantNow(x,y,slotIdx){
  const s = S.inv[slotIdx]; if (!s) return;
  const it = ITEMS[s.id];
  const V = VARIETIES[it.variety];
  const t = tileState(S.area,x,y,true);
  const green = areaIsGreen(S.area);
  const grav = green? GRAVITY_STEPS[2] : gravNow();
  let need = Math.max(2, Math.round(V.growDays * grav.growMul));
  if (t.fert==='f_basic') need = Math.max(2, need-1);
  S.crops[key(S.area,x,y)] = {
    v: it.variety, prog:0, need:need, re:0, fallen:false, dead:false,
    fert: t.fert, elite: s.q||0, seed:(Math.random()*1000)|0, gi:green?2:S.gravIdx,
    planted: absDay(),
  };
  t.fert = null;
  invTake(s.id, 1, s.q||0);
  SFX.plant(); fx(x,y,'plant');
  if (!S.flags.firstPlant){ S.flags.firstPlant=1; toast('植えた。あとは水をやって、明日を待つ。'); }
}
function actFert(x,y,slotIdx){
  const s = S.inv[slotIdx]; if (!s) return;
  const t = tileState(S.area,x,y,false);
  if (!t || !t.till){ toast('耕した土に撒くもの。'); SFX.no(); return; }
  if (cropAt(S.area,x,y)){ toast('植える前に撒こう。'); SFX.no(); return; }
  if (t.fert){ toast('もう撒いてある。'); return; }
  t.fert = s.id;
  invTake(s.id,1,s.q||0);
  SFX.plant(); fx(x,y,'fert');
  toast(ITEMS[s.id].name+'を撒いた。');
}
function actHarvest(x,y){
  const c = cropAt(S.area,x,y); if (!c) return false;
  if (cropStage(c)!==4) return false;
  const V = VARIETIES[c.v];
  if (c.dead){
    delete S.crops[key(S.area,x,y)];
    toast('枯れた株を片づけた。'); SFX.pick();
    return true;
  }
  const green = areaIsGreen(S.area);
  const grav = green? GRAVITY_STEPS[2] : GRAVITY_STEPS[c.gi!=null?c.gi:S.gravIdx];
  let size = (V.size||1) * grav.size;
  if (V.lowG && grav.g<1) size *= 1.25;
  if (c.fert==='f_giant') size *= 1.35;
  size *= 1 + (c.elite||0)*0.09;
  let sugar = (V.sugar||5) + grav.sugar;
  if (V.highG && grav.g>1) sugar += 4;
  if (c.fert==='f_sweet') sugar += 3;
  sugar += (c.elite||0)*2;
  if (green) sugar += 1;
  if (c.fallen) sugar -= 3;
  let q = qualityOf(sugar, size);
  if (c.fallen) q = Math.max(0,q-1);
  const n = Math.max(1, V.yield||1);
  const left = invPut('cr_'+c.v, n, q);
  if (left>0){ toast('もちものがいっぱい！'); SFX.no(); return false; }
  dexRecord(c.v, size, sugar, q);
  S.stat.harvested += n;
  SFX.harvest(); fx(x,y,'harvest', V.fruit);
  toast(V.name+'を'+n+'個 収穫（'+ '★'.repeat(q) + (q?'':'並') +'　糖度'+sugar.toFixed(0)+'　大きさ'+size.toFixed(2)+'）');
  useEnergy(1);
  if (V.regrow){ c.re = V.regrow; c.prog = c.need; }
  else delete S.crops[key(S.area,x,y)];
  if (!S.flags.firstHarvest){
    S.flags.firstHarvest=1;
    setTimeout(()=>dialogSeq([
      {who:'オババ', text:'……採れたね。\nその手ざわりを覚えておきなさい。土が返事をした音だ。'},
      {who:'オババ', text:'売るのもいい。出荷箱に入れれば、朝には金になっている。\nだが一度くらいは、自分で食べてごらん。'},
    ]),600);
  }
  checkEnding(c.v);
  return true;
}
function actSickle(x,y){
  const c = cropAt(S.area,x,y);
  if (c){
    if (cropStage(c)===4 && !c.dead){ toast('実っている。刈るのはもったいない。'); return; }
    confirmBox('この株を刈る？（もどらない）', ()=>{
      delete S.crops[key(S.area,x,y)];
      SFX.pick(); fx(x,y,'cut'); useEnergy(ITEMS.t_sickle.ep);
    });
    return;
  }
  const a = areaOf(S.area);
  const o = objAt(a,x,y);
  if (o && o.t==='shrub' && !o.gone){
    o.gone = true; SFX.pick(); fx(x,y,'cut');
    useEnergy(ITEMS.t_sickle.ep);
    if (Math.random()<0.35) invPut('m_ice',1);
    return;
  }
  swing('sickle'); SFX.pick();
}
function actPick(x,y){
  const a = areaOf(S.area);
  const o = objAt(a,x,y);
  if (!o || o.t!=='rock' || o.gone){ swing('pick'); SFX.pick(); return; }
  if (!useEnergy(hasUp('pick2')? 2 : ITEMS.t_pick.ep)) return;
  swing('pick');
  o.hp = (o.hp||0)+1;
  const need = hasUp('pick2')? 1 : (o.k===3?3:2);
  if (o.hp < need){ SFX.pick(); fx(x,y,'chip'); return; }
  o.gone = true; S.stat.rocks++;
  SFX.rockBreak(); fx(x,y,'rock');
  const floor = (a.mine? a.floor : 0);
  const drops = [];
  const r = Math.random();
  if (o.k===1){ drops.push(['m_iron', 1+((Math.random()*2)|0)]); if (r<0.25) drops.push(['m_ice',1]); }
  else if (o.k===2){ drops.push(['m_silicon', 1+((Math.random()*2)|0)]); if (r<0.3) drops.push(['m_iron',1]); }
  else { drops.push(['m_crystal', 1]); if (r<0.4) drops.push(['m_silicon',1]); }
  if (floor>=5 && Math.random()<0.10+floor*0.01) drops.push(['m_meteor',1]);
  if (floor>=8 && Math.random()<0.05) drops.push(['m_crystal',1]);
  let msg=[];
  for (const [id,n] of drops){ invPut(id,n); msg.push(ITEMS[id].name+'×'+n); }
  toast(msg.join('　'));
}

/* ------------------------------------------------------------ 水タンク */
function refillCan(){
  const mx = hasUp('can3')? 90 : hasUp('can2')? 40 : 20;
  S.waterMax = mx;
  if (S.water>=mx){ toast('じょうろは満タン。'); return; }
  S.water = mx;
  SFX.water(); toast('じょうろに水を満たした。（'+mx+'）');
}

/* ------------------------------------------------------------ 出荷 */
function shipPut(slotIdx){
  const s = S.inv[slotIdx]; if (!s) return;
  const it = ITEMS[s.id];
  if (it.kind==='tool' || it.kind==='key'){ toast('これは出荷できない。'); SFX.no(); return; }
  const taken = invTakeSlot(slotIdx);
  S.ship.push(taken);
  SFX.ship();
  toast(it.name+'×'+taken.qty+'を出荷箱へ（'+ (itemValue(taken)*taken.qty) +'クレジット）');
}
function shipValue(){
  let v=0;
  for (const s of S.ship) v += itemValue(s)*s.qty;
  if (hasUp('cart')) v = Math.round(v*1.15);
  return v;
}

/* ================================================================= 一日 */
function advanceDay(fainted){
  const beforeRank = rankNow();
  const log = [];

  /* --- 出荷精算 --- */
  if (S.ship.length){
    const v = shipValue();
    S.credits += v; S.totalShipped += v;
    S.stat.shipped += S.ship.reduce((a,b)=>a+b.qty,0);
    log.push('出荷：'+S.ship.length+'種・'+v+'クレジット');
    S.ship = [];
  }

  /* --- 日付を進める --- */
  S.day++;
  if (S.day > DAYS_PER_SEASON){
    S.day = 1; S.season++;
    if (S.season>3){ S.season=0; S.year++; log.push('◆ '+S.year+'年目に入った'); }
    log.push('◆ 軌道季が'+SEASONS[S.season].name+'に変わった');
  }
  S.day2 = absDay();
  S.time = DAY_START;
  S.stat.days++;
  const wPrev = S.weather;
  S.weather = S.tomorrowWeather || 'clear';
  rollWeather();

  /* --- 自動散水 --- */
  const sprinkAreas = hasUp('sprink2')? ['home','greenIn'] : hasUp('sprink')? ['home','greenIn'] : ['greenIn'];
  for (const k in S.tiles){
    const t = S.tiles[k];
    const ar = k.split(':')[0];
    if (!t.till) continue;
    if (ar==='greenIn'){ t.wet = true; continue; }          // 温室は常に自動
    if (S.weather==='dew'){ t.wet = true; continue; }        // 結露
    if (hasUp('sprink') && ar==='home'){
      const xy = k.split(':')[1].split(',').map(Number);
      const inFieldA = xy[0]>=3 && xy[0]<=12;
      if (hasUp('sprink2') || inFieldA) t.wet = true;
    }
  }
  if (S.weather==='dew') log.push('結露で畑が潤った。');

  /* --- 作物の成長 --- */
  const grav = gravNow();
  let withered=0, mutated=[], fell=0, grewAny=false;
  for (const k in S.crops){
    const c = S.crops[k];
    const parts = k.split(':'); const ar = parts[0];
    const xy = parts[1].split(',').map(Number);
    const V = VARIETIES[c.v];
    const green = (ar==='greenIn');
    const t = S.tiles[k];
    const watered = green? true : (t && t.wet);
    const sid = green? 'hi' : seasonNow().id;
    if (c.dead) continue;

    /* 季節の可否 */
    let seasonOK = V.seasons.indexOf(sid)>=0;
    if (!seasonOK && !green){
      if (sid==='shimo' && (hasUp('heater') && S.weather!=='outage')) seasonOK = true;
      if (sid==='kage'  && (hasUp('lamp')   && S.weather!=='outage')) seasonOK = true;
    }
    if (green) seasonOK = true;
    /* 霜季に凍る */
    if (!green && sid==='shimo' && !V.cold && !(hasUp('heater')&&S.weather!=='outage')){
      if (Math.random()<0.30){ c.dead=true; withered++; continue; }
    }
    /* 天候 */
    let weatherOK = true;
    if (!green){
      if (S.weather==='dust' && !V.storm) weatherOK = false;
      if (S.weather==='meteor' && !V.storm && Math.random()<0.07){ c.dead=true; withered++; continue; }
    }
    /* フレア */
    if (!green && S.weather==='flare'){
      if (V.flare==='love'){ c.prog += 1; }
      else if (!hasUp('shield')){
        const r = Math.random();
        if (r<0.13){
          const nv = mutateVariety(c.v);
          if (nv){ c.v = nv; c.need = Math.max(2,Math.round(VARIETIES[nv].growDays*grav.growMul));
                   c.prog = Math.min(c.prog, c.need-1); mutated.push([xy[0],xy[1],nv]); S.stat.mutations++; }
        } else if (r<0.20){ c.dead=true; withered++; continue; }
      }
    }
    /* 倒伏 */
    if (!green && !c.fallen && !hasUp('stake') && grav.fallRisk>0 && cropStage(c)>=2){
      if (Math.random()<grav.fallRisk){ c.fallen=true; fell++; }
    }
    /* 育つ */
    if (watered && seasonOK && weatherOK && !c.fallen){
      if (c.re>0){ c.re--; }
      else if (c.prog < c.need){ c.prog++; grewAny=true; }
    }
    if (t) t.wet = false;
  }
  for (const k in S.tiles){ const t=S.tiles[k]; if (t.till && !S.crops[k]) t.wet=false; }

  if (withered) log.push('作物が'+withered+'株 枯れた。');
  if (fell) log.push(fell+'株が低重力で倒れた。（支柱があれば防げる）');
  for (const m of mutated) log.push('宇宙線で'+VARIETIES[m[2]].name+'に変異した株がある。');
  if (mutated.length) setTimeout(()=>SFX.mutate(), 400);

  /* --- 隕石雨 --- */
  if (S.weather==='meteor'){
    const a = AREAS.home;
    let n = 2 + ((Math.random()*3)|0);
    for (let i=0;i<40 && n>0;i++){
      const x = 2+((Math.random()*36)|0), y = 16+((Math.random()*9)|0);
      if (isSolid(a,x,y) || S.crops[key('home',x,y)]) continue;
      if (a.objs.some(o=>o.x===x&&o.y===y&&!o.gone)) continue;
      a.objs.push({t:'rock',x:x,y:y,k:(Math.random()<0.3?3:1),spawned:true});
      n--;
    }
    if (Math.random()<0.6){
      S.ground.push({area:'home', x:6+((Math.random()*28)|0), y:17+((Math.random()*7)|0), id:'m_meteor', qty:1, q:0});
      log.push('隕鉄がどこかに落ちている。');
    }
  }

  /* --- 加工機 --- */
  if (S.weather!=='outage'){
    for (const m of S.machines){
      if (m && m.doneDay!=null && m.doneDay<=S.day2 && !m.notified){ m.notified=true; }
    }
  } else {
    for (const m of S.machines){ if (m && m.doneDay!=null && m.doneDay>S.day2) m.doneDay++; }
    log.push('停電で加工が1日ずれた。');
  }

  /* --- 坑道を掘りなおす --- */
  S.mineSeed = (Math.random()*99999)|0;
  S.mineArea = null;

  /* --- 依頼 --- */
  makeQuests();

  /* --- 住民 --- */
  for (const id in S.npc){ S.npc[id].talkDay = 0; S.npc[id].giftDay = 0; }

  /* --- 元気 --- */
  if (!fainted){
    const late = Game.sleptLate;
    S.energyMax = hasUp('body2')? 170 : hasUp('body')? 130 : 100;
    S.energy = late? Math.round(S.energyMax*0.8) : S.energyMax;
  }
  S.waterMax = hasUp('can3')? 90 : hasUp('can2')? 40 : 20;

  /* --- 階級 --- */
  const r = rankNow();
  if (r > beforeRank){
    S.rank = r;
    setTimeout(()=>{
      SFX.levelup();
      dialogSeq([{who:'ZAX-9', text:'農場評価ガ 更新サレマシタ。\n新シイ称号：「'+RANKS[r].name+'」\n'+RANKS[r].note}]);
    }, 900);
  }
  S.log = log;
  saveGame();
}

function mutateVariety(from){
  const V = VARIETIES[from];
  if (MUTATE_TO_BLUE.indexOf(from)>=0 && Math.random()<0.30) return 'cosmoblue';
  const cands = VARIETY_LIST.filter(v=>{
    const W = VARIETIES[v];
    return !W.mutantOnly && !W.crossOnly && v!==from && Math.abs(W.tier - V.tier)<=1;
  });
  if (!cands.length) return null;
  return cands[(Math.random()*cands.length)|0];
}

/* ------------------------------------------------------------ 就寝 */
function goSleep(){
  const late = S.time > 1440;
  confirmBox('今日はここまでにする？', ()=>{
    Game.sleptLate = late;
    SFX.sleep();
    fadeOut(()=>{
      advanceDay(false);
      Game.sleptLate = false;
      showMorning();
    });
  });
}

/* ------------------------------------------------------------ 交配 */
function doCross(a,b){
  if (!hasUp('lab')){ toast('交配ラボがまだ動いていない。'); SFX.no(); return; }
  if (invCount('sd_'+a)<1 || invCount('sd_'+b)<1){ toast('種が足りない。'); SFX.no(); return; }
  if (a===b){
    /* 同じ品種どうし＝選抜 */
    const have = [];
    for (let i=0;i<invSize();i++){ const s=S.inv[i]; if (s && s.id==='sd_'+a) have.push(s); }
    have.sort((x,y)=>(y.q||0)-(x.q||0));
    if (invCount('sd_'+a)<2){ toast('選抜には同じ種が2つ要る。'); SFX.no(); return; }
    const q = Math.min(3, (have[0].q||0)+1);
    invTake('sd_'+a,2);
    invPut('sd_'+a, 1, q);
    SFX.levelup();
    dialogSeq([{who:'Dr.ルナ', text:VARIETIES[a].name+'の選抜種ができました。\n等級が上がりやすくなります（★'+q+'相当の素質）。'}]);
    return;
  }
  const res = crossResult(a,b);
  invTake('sd_'+a,1); invTake('sd_'+b,1);
  if (!res){
    const back = Math.random()<0.5? a : b;
    invPut('sd_'+back, 1);
    SFX.no();
    dialogSeq([{who:'Dr.ルナ', text:'……交わりませんでした。\n'+VARIETIES[back].name+'の種だけが残っています。\n組み合わせには相性があるようです。'}]);
    return;
  }
  invPut('sd_'+res, 2);
  SFX.levelup();
  S.flags['cross_'+res]=1;
  dialogSeq([
    {who:'Dr.ルナ', text:'……出ました。\n'+VARIETIES[a].name+' × '+VARIETIES[b].name+' → 『'+VARIETIES[res].name+'』'},
    {who:'Dr.ルナ', text:VARIETIES[res].desc+'\n種を2つ、お渡しします。育ててみてください。'},
  ]);
}

/* ------------------------------------------------------------ 結末 */
function checkEnding(vid){
  if (vid!=='galaxia' || S.flags.ending) return;
  S.flags.ending = 1;
  setTimeout(()=>{
    Game.ending = 0;
    Game.mode = 'ending';
    musicStart('shimo','night');
  }, 900);
}
