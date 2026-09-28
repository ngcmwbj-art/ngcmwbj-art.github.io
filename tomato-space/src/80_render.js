/* =========================================================================
   80_render.js  —  画面を描く
   ========================================================================= */

const VW = 336, VH = 208;     // 世界の見える広さ（ドット）
const R = { cv:null, c:null, W:0, H:0, s:3, world:null, wc:null, light:null, lc:null };

function initRender(cv){
  R.cv = cv; R.c = cv.getContext('2d');
  R.world = mkCv(VW,VH); R.wc = ctxOf(R.world);
  R.light = mkCv(VW,VH); R.lc = ctxOf(R.light);
  resize();
  window.addEventListener('resize', resize);
}
function resize(){
  const ww = window.innerWidth, wh = window.innerHeight;
  let s = Math.min(ww/VW, wh/VH);
  s = s>=2? Math.floor(s) : Math.max(1, Math.floor(s*2)/2);
  R.s = s;
  R.W = Math.round(VW*s); R.H = Math.round(VH*s);
  R.cv.width = R.W; R.cv.height = R.H;
  R.cv.style.width = R.W+'px'; R.cv.style.height = R.H+'px';
  R.c.imageSmoothingEnabled = false;
}

/* ---------------------------------------------------------------- カメラ */
function updateCamera(){
  const a = areaOf(S.area); if (!a) return;
  const mw = a.w*TILE, mh = a.h*TILE;
  let cx = S.px - VW/2, cy = S.py - VH/2 - 8;
  if (mw<=VW) cx = (mw-VW)/2; else cx = Math.max(0, Math.min(mw-VW, cx));
  if (mh<=VH) cy = (mh-VH)/2; else cy = Math.max(0, Math.min(mh-VH, cy));
  if (Game.cam.x<-9000){ Game.cam.x=cx; Game.cam.y=cy; }
  Game.cam.x += (cx-Game.cam.x)*0.22;
  Game.cam.y += (cy-Game.cam.y)*0.22;
}

/* ---------------------------------------------------------------- 世界 */
function drawWorld(){
  const g = R.wc, a = areaOf(S.area);
  let camx = Math.round(Game.cam.x), camy = Math.round(Game.cam.y);
  if (Game.shake>0){
    camx += Math.round((Math.random()-0.5)*Game.shake*4);
    camy += Math.round((Math.random()-0.5)*Game.shake*4);
  }

  /* 背景 */
  if (a.sky){
    if (Game.skySeason !== S.season){ Game.sky = makeSky(VW*1.6|0, VH, S.season, 7); Game.skySeason = S.season; }
    g.drawImage(Game.sky, -Math.round(camx*0.25)%((VW*1.6|0)-VW), 0);
    /* 遠景：もう一つの小惑星 */
    g.fillStyle='#3a3340';
    const ox = 40 - camx*0.12, oy = 26;
    g.beginPath(); g.ellipse(ox,oy,26,10,0.2,0,6.2832); g.fill();
    g.fillStyle='#4a4250'; g.beginPath(); g.ellipse(ox-5,oy-3,18,6,0.2,0,6.2832); g.fill();
  } else if (a.mine){
    g.fillStyle='#0b0a10'; g.fillRect(0,0,VW,VH);
  } else {
    g.fillStyle='#161420'; g.fillRect(0,0,VW,VH);
  }

  const x0 = Math.floor(camx/TILE)-1, y0 = Math.floor(camy/TILE)-1;
  const x1 = x0 + Math.ceil(VW/TILE)+3, y1 = y0 + Math.ceil(VH/TILE)+3;

  /* 地面 */
  for (let y=y0;y<=y1;y++){
    for (let x=x0;x<=x1;x++){
      const t = tileAt(a,x,y);
      if (!t.tile) continue;
      const px_ = x*TILE-camx, py_ = y*TILE-camy;
      const vs = TILES[t.tile];
      g.drawImage(vs[(x*3+y*7)%vs.length], px_, py_);
      /* 耕し・水 */
      const st = S.tiles[key(S.area,x,y)];
      if (st && st.till){
        const set = st.wet? TILES.wet : TILES.till;
        g.drawImage(set[(x*5+y*3)%set.length], px_, py_);
        if (st.fert){
          const fc = st.fert==='f_basic'?'#6fe0b0': st.fert==='f_sweet'?'#ffe9a8':'#b8e4ff';
          for (let i=0;i<5;i++){
            px(g, px_+2+((i*7+x)%12), py_+2+((i*5+y)%12), 1,1, fc);
          }
        }
      }
    }
  }
  /* 縁の影（宇宙との境目） */
  for (let y=y0;y<=y1;y++) for (let x=x0;x<=x1;x++){
    const t = tileAt(a,x,y);
    if (t.tile) continue;
    const px_=x*TILE-camx, py_=y*TILE-camy;
    if (tileAt(a,x,y-1).tile){ g.fillStyle='rgba(0,0,0,0.45)'; g.fillRect(px_,py_,TILE,3); }
  }

  /* 奥行き順に並べる */
  const list = [];
  /* 落ちもの */
  for (const gi of S.ground){
    if (gi.area!==S.area) continue;
    list.push({ y:gi.y*TILE+14, f:()=>{
      const bob = Math.sin(Game.time*3+gi.x)*1.5;
      icon2(g, gi.id, gi.x*TILE-camx+2, gi.y*TILE-camy+2+bob);
    }});
  }
  /* 作物 */
  for (const k in S.crops){
    const p = k.split(':'); if (p[0]!==S.area) continue;
    const xy = p[1].split(',').map(Number);
    if (xy[0]<x0-1||xy[0]>x1+1||xy[1]<y0-1||xy[1]>y1+1) continue;
    const c = S.crops[k];
    list.push({ y:xy[1]*TILE+15, f:()=>{
      const st = cropStage(c);
      const V = VARIETIES[c.v];
      const grav = GRAVITY_STEPS[c.gi!=null?c.gi:S.gravIdx];
      let size = grav.size * (c.fert==='f_giant'?1.3:1) * (1+(c.elite||0)*0.08);
      if (V.lowG && grav.g<1) size*=1.2;
      drawPlant(g, xy[0]*TILE-camx+8, xy[1]*TILE-camy+14, c.v, st, size,
                { seed:c.seed, fallen:c.fallen, dead:c.dead });
      if (st===4 && !c.dead){
        const t=(Game.time*1.4 + c.seed)%3;
        if (t<0.5) drawSparkle(g, xy[0]*TILE-camx+8+((c.seed%7)-3), xy[1]*TILE-camy+4, t*2, '#fff6c0');
      }
    }});
  }
  /* 置いてあるもの */
  for (const o of a.objs||[]){
    if (o.gone) continue;
    const d = OBJDEF[o.t]; if (!d) continue;
    if (o.x+d.w<x0||o.x>x1||o.y+d.h<y0||o.y>y1) continue;
    list.push({ y:(o.y+d.h)*TILE, f:()=>{ d.draw(g, o.x*TILE-camx, o.y*TILE-camy, o, S); }});
  }
  /* 住民 */
  const npcs = Game.npcs[S.area]||[];
  for (const n of npcs){
    list.push({ y:n.y, f:()=>{ drawNPC(g, n.id, n.x-camx, n.y-camy, Game.time+n.t, 0); }});
  }
  /* 自分 */
  list.push({ y:S.py, f:()=>{
    drawPlayer(g, S.px-camx, S.py-camy, S.dir, Game.moving?Game.frame:0,
               Game.swing? Game.swing.act:null, Game.swing? Game.swing.t:0);
  }});

  list.sort((p,q)=>p.y-q.y);
  for (const e of list) e.f();

  /* 目じるし：向いているマス */
  const [fx_,fy_] = facingTile();
  const ft = tileAt(a,fx_,fy_);
  const hasTarget = !!objAt(a,fx_,fy_) || !!cropAt(S.area,fx_,fy_) ||
                    (ft.farm) || !!npcAtTile(fx_,fy_);
  if (hasTarget){
    g.strokeStyle='rgba(255,255,255,0.45)'; g.lineWidth=1;
    g.strokeRect(fx_*TILE-camx+0.5, fy_*TILE-camy+0.5, TILE-1, TILE-1);
  }

  /* 効果 */
  for (const e of Game.fx){
    if (e.area!==S.area) continue;
    const ex = e.x*TILE-camx+8, ey = e.y*TILE-camy+8;
    if (e.type==='water') drawWaterSplash(g,ex,ey,e.t);
    else if (e.type==='harvest'){ drawSparkle(g,ex,ey-4,e.t,e.col); drawSparkle(g,ex+5,ey,e.t*0.8,'#ffffff'); }
    else if (e.type==='dirt'){
      for (let i=0;i<5;i++){
        const a2=i/5*6.2832; px(g, ex+Math.cos(a2)*e.t*8, ey+Math.sin(a2)*e.t*5-e.t*4+e.t*e.t*8,1,1,'#7a5842');
      }
    }
    else if (e.type==='rock'){
      for (let i=0;i<8;i++){
        const a2=i/8*6.2832; px(g, ex+Math.cos(a2)*e.t*11, ey+Math.sin(a2)*e.t*8,2,2,'#8d94a8');
      }
    }
    else if (e.type==='chip'){ for (let i=0;i<3;i++) px(g, ex+(i-1)*3, ey-e.t*7, 1,1,'#cfd6e6'); }
    else if (e.type==='plant'||e.type==='fert') drawSparkle(g,ex,ey,e.t,'#9fe8b0');
    else if (e.type==='cut'){ for (let i=0;i<4;i++) px(g, ex+(i-2)*4, ey+e.t*8-4, 2,1,'#6fa95f'); }
  }

  /* 天候 */
  drawWeather(g, camx, camy, a);

  /* 夜と灯り */
  drawLight(g, camx, camy, a);

  /* 季の色味 */
  if (a.sky){ g.fillStyle = SEASONS[S.season].tint; g.fillRect(0,0,VW,VH); }
}

function icon2(g,id,x,y){
  const tmp = Game._iconCache2 || (Game._iconCache2={});
  if (!tmp[id]){ const cv=mkCv(16,16); drawIcon(ctxOf(cv),id,0,0,1); tmp[id]=cv; }
  g.drawImage(tmp[id], Math.round(x), Math.round(y), 12,12);
}

function drawWeather(g, camx, camy, a){
  const w = S.weather;
  if (!a.sky) return;
  const t = Game.time;
  if (w==='dust'){
    g.fillStyle='rgba(180,140,90,0.16)'; g.fillRect(0,0,VW,VH);
    for (let i=0;i<90;i++){
      const sx = ((i*53 + t*180)%(VW+40))-20;
      const sy = ((i*97 + Math.sin(t*2+i)*12)%VH);
      px(g,sx,sy, 3,1, 'rgba(220,190,140,'+(0.15+ (i%5)*0.07).toFixed(2)+')');
    }
  } else if (w==='meteor'){
    g.fillStyle='rgba(60,40,70,0.15)'; g.fillRect(0,0,VW,VH);
    for (let i=0;i<14;i++){
      const ph = (t*0.42 + i*0.137)%1;
      const sx = (i*37 % VW) + ph*90;
      const sy = -20 + ph*(VH+50);
      for (let k=0;k<7;k++){
        px(g, sx-k*2.2, sy-k*3.0, 2,2, 'rgba(255,'+(200-k*18)+',150,'+(0.85-k*0.11).toFixed(2)+')');
      }
    }
  } else if (w==='flare'){
    const pulse = 0.10 + Math.max(0,Math.sin(t*0.9))*0.22;
    g.fillStyle='rgba(255,220,150,'+pulse.toFixed(3)+')'; g.fillRect(0,0,VW,VH);
    for (let i=0;i<30;i++){
      const sy=(i*61 + t*40)%VH;
      px(g,0,sy,VW,1,'rgba(255,240,200,0.05)');
    }
    if (Math.sin(t*0.9)>0.985){ g.fillStyle='rgba(255,255,255,0.35)'; g.fillRect(0,0,VW,VH); }
  } else if (w==='dew'){
    for (let i=0;i<50;i++){
      const sx=(i*67)%VW, sy=((i*101 + t*18)%VH);
      px(g,sx,sy,1,2,'rgba(170,220,255,0.35)');
    }
  } else if (w==='outage'){
    g.fillStyle='rgba(10,10,30,0.30)'; g.fillRect(0,0,VW,VH);
  }
}

function drawLight(g, camx, camy, a){
  let dark = 0;
  if (a.mine) dark = 0.58;
  else if (a.indoor) dark = isNight()? 0.28 : 0.05;
  else {
    const t = S.time;
    if (t < 420) dark = 0.48*(420-t)/60;
    else if (t > 1050) dark = Math.min(0.74, (t-1050)/260*0.74);
    if (SEASONS[S.season].id==='kage') dark = Math.max(dark, 0.50);
    if (S.weather==='outage') dark = Math.min(0.88, dark+0.25);
  }
  if (dark<=0.01) return;
  const lc = R.lc;
  lc.clearRect(0,0,VW,VH);
  lc.fillStyle = a.mine? 'rgba(4,4,12,'+dark+')' : 'rgba(10,16,46,'+dark+')';
  lc.fillRect(0,0,VW,VH);
  lc.globalCompositeOperation='destination-out';
  function lamp(x,y,r,str){
    const rg = lc.createRadialGradient(x,y,0,x,y,r);
    rg.addColorStop(0,'rgba(0,0,0,'+str+')');
    rg.addColorStop(0.55,'rgba(0,0,0,'+(str*0.55)+')');
    rg.addColorStop(1,'rgba(0,0,0,0)');
    lc.fillStyle=rg; lc.beginPath(); lc.arc(x,y,r,0,6.2832); lc.fill();
  }
  lamp(S.px-camx, S.py-camy-10, a.mine? 74:52, a.mine? 1.0:0.92);
  /* 建物・設備の灯り */
  for (const o of a.objs||[]){
    if (o.gone) continue;
    const d = OBJDEF[o.t]; if (!d) continue;
    const cx = o.x*TILE-camx + d.w*TILE/2, cy = o.y*TILE-camy + d.h*TILE/2;
    if (cx<-70||cx>VW+70||cy<-70||cy>VH+70) continue;
    if (o.t==='lamppost'){ lamp(cx,cy+6, 52, 0.95); continue; }
    if (a.mine){
      if (o.t==='ladderUp'||o.t==='ladderDn') lamp(cx,cy, 40, 0.85);
      else if (o.t==='rock' && o.k===3) lamp(cx,cy, 24, 0.55);
      else if (o.t==='rock' && o.k===2) lamp(cx,cy, 16, 0.35);
      continue;
    }
    if (o.t==='house'||o.t==='stall'||o.t==='terminal'||o.t==='gate'||o.t==='cave'||
        o.t==='workbench'||o.t==='pedestal'||o.t==='slot'||o.t==='console'||o.t==='vend')
      lamp(cx,cy, 34, 0.85);
    if (o.t==='greenhouse' && hasUp('greenh')) lamp(cx,cy,46,0.9);
  }
  if (hasUp('lamp') && S.area==='home'){
    lamp(7.5*TILE-camx, 12*TILE-camy, 62, 0.55);
    lamp(19.5*TILE-camx, 12*TILE-camy, 62, 0.55);
  }
  lc.globalCompositeOperation='source-over';
  g.drawImage(R.light,0,0);
}

/* ---------------------------------------------------------------- HUD */
function drawHUD(){
  const c = R.c, s = R.s, W=R.W, H=R.H;
  const s0 = seasonNow();

  /* 左上：日付・時計・天候 */
  const pw = 92*s, ph = 30*s;
  panel(c, 4*s, 4*s, pw, ph, null, COL.line2);
  txt(c, s0.name+' '+S.day+'日　'+S.year+'年目', 10*s, 8*s, 9*s, COL.text,'left',true);
  txt(c, clockStr(), 10*s, 18*s, 9*s, isNight()? COL.blue : COL.gold,'left',true);
  txt(c, WEATHERS[S.weather].name, pw-6*s, 18*s, 8*s, COL.dim,'right');
  /* 天候アイコン */
  drawWeatherIcon(c, pw-14*s, 6*s, 10*s);

  /* 右上：おかね */
  const cw = 78*s;
  panel(c, W-cw-4*s, 4*s, cw, 16*s, null, COL.line2);
  txt(c, S.credits.toLocaleString()+' c', W-9*s, 9*s, 10*s, COL.gold,'right',true);

  /* 左下：元気・水 */
  const bx = 6*s, by = H-40*s;
  txt(c,'元気', bx, by-1*s, 7.5*s, COL.dim);
  bar(c, bx+18*s, by, 60*s, 7*s, S.energy, S.energyMax,
      S.energy/S.energyMax>0.4? '#7fe0a8' : S.energy/S.energyMax>0.18? '#ffd15c':'#ff6b52');
  txt(c, Math.ceil(S.energy)+'/'+S.energyMax, bx+80*s, by-0.5*s, 7*s, COL.dim);
  txt(c,'水', bx, by+9*s, 7.5*s, COL.dim);
  bar(c, bx+18*s, by+10*s, 60*s, 7*s, S.water, S.waterMax, '#7fb2d9');
  txt(c, S.water+'/'+S.waterMax, bx+80*s, by+9.5*s, 7*s, COL.dim);

  /* 手持ち10枠 */
  const cell = 19*s, tw = cell*10;
  const tx0 = (W-tw)/2, ty0 = H-cell-4*s;
  c.fillStyle='rgba(10,16,32,0.72)';
  rr(c, tx0-3*s, ty0-3*s, tw+6*s, cell+6*s, 3*s); c.fill();
  c.strokeStyle='rgba(120,150,200,0.25)'; c.lineWidth=1;
  rr(c, tx0-3*s+0.5, ty0-3*s+0.5, tw+6*s-1, cell+6*s-1, 3*s); c.stroke();
  for (let i=0;i<10;i++){
    const cx = tx0+i*cell, sl = S.inv[i], sel = i===S.hand;
    c.fillStyle = sel? 'rgba(127,224,168,0.20)':'rgba(34,46,76,0.75)';
    rr(c,cx+1*s,ty0+1*s,cell-2*s,cell-2*s,2*s); c.fill();
    c.strokeStyle = sel? COL.green : 'rgba(120,150,200,0.22)';
    c.lineWidth = sel? 2:1;
    rr(c,cx+1*s+0.5,ty0+1*s+0.5,cell-2*s-1,cell-2*s-1,2*s); c.stroke();
    txt(c,String((i+1)%10), cx+3*s, ty0+2*s, 6*s, 'rgba(180,200,240,0.45)');
    if (sl){
      icon(c, sl.id, cx+3.5*s, ty0+4*s, cell-7*s);
      if (sl.qty>1){
        c.fillStyle='rgba(8,12,24,0.72)';
        rr(c, cx+cell-11*s, ty0+cell-10*s, 9*s, 8*s, 2*s); c.fill();
        txt(c,String(sl.qty), cx+cell-3*s, ty0+cell-9.5*s, 7*s, COL.text,'right');
      }
      if (sl.q) txt(c, starStr(sl.q), cx+cell-3*s, ty0+2*s, 5.5*s, QUALITY[sl.q].color,'right');
    }
  }
  const hi = handItem();
  if (hi) txt(c, hi.name, W/2, ty0-13*s, 9*s, COL.text,'center',true);

  /* 目のまえのもの */
  if (Game.hint) txt(c, Game.hint, W/2, ty0-24*s, 8*s, COL.blue,'center');

  /* 場所の名まえ */
  const a = areaOf(S.area);
  txt(c, a.name, W-9*s, 24*s, 8*s, COL.dim,'right');
  if (a.sky) txt(c, gravNow().name, W-9*s, 33*s, 8*s, COL.purple,'right');

  /* 出荷箱の中身 */
  if (S.ship.length) txt(c, '出荷箱 '+S.ship.length+'件 '+shipValue()+'c', 6*s, by-14*s, 8*s, COL.gold);

  /* 通知 */
  for (let i=0;i<Game.toasts.length;i++){
    const t = Game.toasts[i];
    const al = Math.min(1, Math.min(t.t*4, (3.6-t.t)*2));
    if (al<=0) continue;
    c.save(); c.globalAlpha = al;
    const y = 44*s + i*15*s;
    c.font = (8.5*s)+'px '+UI_FONT;
    const txtStr = clipText(c, t.text, W-40*s, 8.5*s);
    const w = c.measureText(txtStr).width + 14*s;
    c.fillStyle='rgba(10,16,32,0.82)'; rr(c, W-w-6*s, y, w, 13*s, 3*s); c.fill();
    c.strokeStyle='rgba(127,214,255,0.3)'; c.lineWidth=1;
    rr(c, W-w-6*s+0.5, y+0.5, w-1, 13*s-1, 3*s); c.stroke();
    txt(c, txtStr, W-13*s, y+2.5*s, 8.5*s, COL.text,'right');
    c.restore();
  }

  /* 触って遊ぶときのボタン */
  if (Game.touch) drawTouchPad(c);
}

function drawWeatherIcon(c,x,y,sz){
  const w = WEATHERS[S.weather].icon;
  c.save(); c.translate(x,y);
  if (w==='sun'){ c.fillStyle='#ffd15c'; c.beginPath(); c.arc(sz/2,sz/2,sz*0.30,0,6.2832); c.fill();
    c.strokeStyle='#ffd15c'; c.lineWidth=Math.max(1,sz*0.08);
    for(let i=0;i<8;i++){ const a=i/8*6.2832; c.beginPath();
      c.moveTo(sz/2+Math.cos(a)*sz*0.40, sz/2+Math.sin(a)*sz*0.40);
      c.lineTo(sz/2+Math.cos(a)*sz*0.50, sz/2+Math.sin(a)*sz*0.50); c.stroke(); } }
  else if (w==='drop'){ c.fillStyle='#7fb2d9'; c.beginPath();
    c.moveTo(sz/2,sz*0.15); c.lineTo(sz*0.82,sz*0.70);
    c.arc(sz/2,sz*0.70,sz*0.32,0,Math.PI); c.closePath(); c.fill(); }
  else if (w==='dust'){ c.fillStyle='#d9b27a';
    for(let i=0;i<3;i++) c.fillRect(sz*0.1, sz*(0.25+i*0.22), sz*0.8-i*sz*0.15, Math.max(1,sz*0.12)); }
  else if (w==='meteor'){ c.fillStyle='#ff9a5c';
    c.beginPath(); c.arc(sz*0.68,sz*0.32,sz*0.20,0,6.2832); c.fill();
    c.strokeStyle='#ffd15c'; c.lineWidth=Math.max(1,sz*0.12);
    c.beginPath(); c.moveTo(sz*0.55,sz*0.45); c.lineTo(sz*0.12,sz*0.88); c.stroke(); }
  else if (w==='flare'){ c.fillStyle='#fff0a0'; c.beginPath(); c.arc(sz/2,sz/2,sz*0.26,0,6.2832); c.fill();
    c.strokeStyle='rgba(255,200,90,0.9)'; c.lineWidth=Math.max(1,sz*0.09);
    c.beginPath(); c.arc(sz/2,sz/2,sz*0.42,0.4,2.2); c.stroke();
    c.beginPath(); c.arc(sz/2,sz/2,sz*0.42,3.6,5.4); c.stroke(); }
  else if (w==='plug'){ c.fillStyle='#8d94a8'; c.fillRect(sz*0.25,sz*0.3,sz*0.5,sz*0.45);
    c.fillRect(sz*0.33,sz*0.12,sz*0.10,sz*0.20); c.fillRect(sz*0.57,sz*0.12,sz*0.10,sz*0.20);
    c.fillStyle='#ff6b52'; c.fillRect(sz*0.45,sz*0.75,sz*0.10,sz*0.15); }
  c.restore();
}

function drawTouchPad(c){
  const s=R.s,W=R.W,H=R.H;
  const cx = W*0.17, cy = H*0.78, r = 26*s;
  c.save(); c.globalAlpha=0.30;
  c.fillStyle='#ffffff';
  for (let i=0;i<4;i++){
    const a = i*Math.PI/2;
    const dx = Math.cos(a)*r, dy = Math.sin(a)*r;
    c.beginPath(); c.arc(cx+dx, cy+dy, 11*s, 0, 6.2832); c.fill();
  }
  c.beginPath(); c.arc(cx,cy,7*s,0,6.2832); c.fill();
  /* ボタン */
  c.fillStyle='#7fe0a8'; c.beginPath(); c.arc(W*0.86, H*0.86, 17*s, 0, 6.2832); c.fill();
  c.fillStyle='#ff9a8a'; c.beginPath(); c.arc(W*0.76, H*0.68, 13*s, 0, 6.2832); c.fill();
  c.restore();
  txt(c,'A', W*0.86, H*0.86-5*s, 10*s, '#0d2018','center',true);
  txt(c,'B', W*0.76, H*0.68-4*s, 8*s, '#2a0d08','center',true);
  txt(c,'袋', W*0.93, H*0.06, 9*s, 'rgba(255,255,255,0.55)','center');
  txt(c,'道具', W*0.79, H*0.06, 9*s, 'rgba(255,255,255,0.55)','center');
}

/* ---------------------------------------------------------------- タイトル */
function drawTitle(){
  const c = R.c, s=R.s, W=R.W, H=R.H;
  if (!Game.titleSky) Game.titleSky = makeSky(VW,VH,0,3);
  const g = R.wc;
  g.drawImage(Game.titleSky,0,0);
  /* 大きなトマトの惑星 */
  const t = Game.time;
  const cx = VW*0.5, cy = VH*0.62 + Math.sin(t*0.5)*2;
  g.save();
  g.globalAlpha=0.25; g.fillStyle='#e5372f';
  g.beginPath(); g.arc(cx,cy,52,0,6.2832); g.fill(); g.restore();
  drawTomato(g, cx, cy, 40, VARIETIES.akahoshi, 1, {});
  /* 大陸のような模様 */
  g.fillStyle='rgba(90,160,90,0.30)';
  g.beginPath(); g.ellipse(cx-14,cy+6,16,9,0.4,0,6.2832); g.fill();
  g.beginPath(); g.ellipse(cx+16,cy-10,10,7,-0.3,0,6.2832); g.fill();
  /* 軌道を回る小さな畑 */
  for (let i=0;i<3;i++){
    const a = t*0.5 + i*2.1;
    const ox = cx + Math.cos(a)*76, oy = cy + Math.sin(a)*22;
    g.fillStyle='#8a6b51';
    g.beginPath(); g.ellipse(ox,oy,7,3,0,0,6.2832); g.fill();
    drawPlant(g, ox, oy, ['akahoshi','comet','sunflare'][i], 4, 0.7, {seed:i});
  }
  /* 宇宙船 */
  const sx = ((t*18)%(VW+80))-40;
  px(g, sx, 28, 10,4,'#c6cbd9'); px(g,sx+9,29,4,2,'#8d94a8');
  px(g, sx+2,26,4,2,'#7fd6ff'); px(g,sx-4,29,4,2,'rgba(255,150,90,0.8)');

  R.c.drawImage(R.world, 0,0, R.W, R.H);

  /* 題 */
  const ty = H*0.13;
  c.save();
  c.textAlign='center';
  c.font='bold '+(30*s)+'px '+UI_FONT;
  c.fillStyle='rgba(0,0,0,0.6)'; c.fillText('トマト宇宙農園', W/2+2*s, ty+2*s+30*s*0.8);
  const grd = c.createLinearGradient(0,ty,0,ty+34*s);
  grd.addColorStop(0,'#ffe9a8'); grd.addColorStop(0.5,'#ff8a72'); grd.addColorStop(1,'#e5372f');
  c.fillStyle=grd; c.fillText('トマト宇宙農園', W/2, ty+30*s*0.8);
  c.restore();
  txt(c,'— TOMATO  STAR  FARM —', W/2, ty+34*s, 9*s, COL.gold,'center');
  txt(c,'小惑星ソラナム　軌道農場記', W/2, ty+46*s, 8.5*s, COL.dim,'center');

  /* メニュー */
  const opts = hasSave()? ['つづきから','はじめから','あそびかた'] : ['はじめる','あそびかた'];
  Game.titleOpts = opts;
  const mw=120*s, mh=opts.length*17*s+10*s;
  const mx=(W-mw)/2, my=H-mh-20*s;
  panel(c,mx,my,mw,mh,null,COL.gold);
  for (let i=0;i<opts.length;i++){
    const sel = i===(Game.titleSel||0);
    if (sel){ c.fillStyle='rgba(255,209,92,0.18)'; rr(c,mx+5*s,my+5*s+i*17*s,mw-10*s,16*s,3*s); c.fill(); }
    txt(c,(sel?'▶ ':'　')+opts[i], mx+mw/2, my+8*s+i*17*s, 10*s, sel?COL.gold:COL.dim,'center',sel);
  }
  txt(c, TIP_LINES[Math.floor(Game.time/5)%TIP_LINES.length], W/2, H-14*s, 7.5*s, 'rgba(200,215,245,0.55)','center');
}

/* ---------------------------------------------------------------- 終幕 */
const ENDING = [
  '',
  '　補給船が来た。',
  '',
  '　オババの帳面の最後のページに書かれていた',
  '　虹色のトマト——ギャラクシアが、',
  '　いま、あなたの手のなかにある。',
  '',
  '　Dr.ルナが種を採り、',
  '　ナツキが輸送用の低温槽を組んだ。',
  '　ZAX-9 は運賃を受け取らなかった。',
  '',
  '「地球ノ土壌ハ 回復傾向デス。',
  '　……ワタシノ 計算デハ、育チマス」',
  '',
  '　オババのホログラムは、',
  '　畑のほうを向いたまま何も言わなかった。',
  '　言わなくてもよかった。',
  '',
  '　船が離れる。小惑星ソラナムは、',
  '　あなたが来たときより ずっと緑だった。',
  '',
  '',
  '　　　—— トマト宇宙農園 ——',
  '',
  '　　　畑はまだ、ここにある。',
  '',
];
function drawEnding(){
  const c=R.c,s=R.s,W=R.W,H=R.H;
  const g=R.wc;
  if (!Game.endSky) Game.endSky = makeSky(VW,VH,2,11);
  g.drawImage(Game.endSky,0,0);
  const t = Game.ending;
  /* 離れていく船 */
  const sh = Math.min(1, t/26);
  const sx = VW*0.5 + sh*80, sy = VH*0.5 - sh*40;
  const sc = 1-sh*0.7;
  g.save(); g.translate(sx,sy); g.scale(sc,sc);
  px(g,-14,-5,28,10,'#c6cbd9'); px(g,12,-3,8,6,'#8d94a8');
  px(g,-10,-8,8,3,'#7fd6ff'); px(g,-4,-8,6,3,'#7fd6ff');
  px(g,-20,-3,6,6,'rgba(255,170,90,0.9)'); px(g,-26,-2,6,4,'rgba(255,220,150,0.5)');
  g.restore();
  /* ソラナム */
  g.fillStyle='#6b6154';
  g.beginPath(); g.ellipse(VW*0.28, VH*0.80, 70,26,0.1,0,6.2832); g.fill();
  g.fillStyle='#4e7a4a';
  g.beginPath(); g.ellipse(VW*0.28, VH*0.78, 62,18,0.1,0,6.2832); g.fill();
  for (let i=0;i<14;i++){
    drawPlant(g, VW*0.28-58+i*9, VH*0.78+2+((i%3)-1)*3, ['akahoshi','comet','galaxia','nebula'][i%4], 4, 0.8, {seed:i});
  }
  R.c.drawImage(R.world,0,0,R.W,R.H);
  c.fillStyle='rgba(6,8,18,0.55)'; c.fillRect(0,0,W,H);
  /* 文字が下から上へ */
  const start = H - t*15*s;
  for (let i=0;i<ENDING.length;i++){
    const y = start + i*15*s;
    if (y<-20*s || y>H) continue;
    const al = Math.min(1, Math.min((H-y)/(40*s), (y+10*s)/(30*s)));
    c.save(); c.globalAlpha=Math.max(0,al);
    txt(c, ENDING[i], W/2, y, i>=ENDING.length-4? 12*s : 10*s,
        i>=ENDING.length-4? COL.gold : COL.text, 'center', i>=ENDING.length-4);
    c.restore();
  }
  if (t > ENDING.length+10){
    txt(c,'Z で農場にもどる（このあとも遊べます）', W/2, H-18*s, 9*s, COL.blue,'center');
  }
}

/* ---------------------------------------------------------------- 暗転 */
function drawFade(){
  if (!Game.fade) return;
  const f = Game.fade, c=R.c;
  let a;
  if (f.phase===0) a = Math.min(1, f.t/f.dur);
  else a = Math.max(0, 1 - f.t/f.dur);
  c.fillStyle='rgba(0,0,0,'+a.toFixed(3)+')';
  c.fillRect(0,0,R.W,R.H);
}
