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
  if (W3.on){
    /* 3D のときは画面いっぱい。文字や枠は高解像度で描く */
    const dpr = Math.min(2, window.devicePixelRatio||1);
    const s = Math.min(ww/VW, wh/VH) * 0.92;
    R.s = s*dpr;
    R.W = Math.round(ww*dpr); R.H = Math.round(wh*dpr);
    R.cv.width = R.W; R.cv.height = R.H;
    R.cv.style.width = ww+'px'; R.cv.style.height = wh+'px';
    R.c.imageSmoothingEnabled = true;
    w3Resize(ww, wh, dpr);
    return;
  }
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
const SEASON_COL = { hi:'#ff8a3d', arashi:'#a57bff', shimo:'#3fb4f0', kage:'#7a64d8' };
/* 丸い札（白） */
function pill(c,x,y,w,h,opt){
  card(c,x,y,w,h,h/2,opt);
}
function drawHUD(){
  const c = R.c, s = R.s, W=R.W, H=R.H;
  const s0 = seasonNow();
  const sc = SEASON_COL[s0.id] || '#ff8a3d';

  /* ── 左上：こよみと時計 ── */
  const cx0 = 5*s, cy0 = 5*s, cw = 106*s, ch = 34*s;
  card(c, cx0, cy0, cw, ch, 9*s);
  /* 季節の丸いしるし */
  const mx = cx0+16*s, my = cy0+ch/2;
  c.save();
  const bg = c.createRadialGradient(mx-4*s,my-5*s,1*s,mx,my,12*s);
  bg.addColorStop(0, mix(sc,'#ffffff',0.55)); bg.addColorStop(1, sc);
  c.fillStyle=bg; c.beginPath(); c.arc(mx,my,11.5*s,0,6.2832); c.fill();
  c.strokeStyle='#ffffff'; c.lineWidth=Math.max(1,1.5*s); c.stroke();
  c.restore();
  UI_DARK = true; txt(c, s0.name[0], mx, my-6.5*s, 11*s, '#ffffff','center',true); UI_DARK = false;
  txt(c, s0.name+' '+S.day+'日　'+S.year+'年目', cx0+31*s, cy0+5*s, 7.5*s, COL.dim);
  txt(c, clockStr(), cx0+31*s, cy0+14*s, 13*s, isNight()? '#3f6fd8' : '#2b3246', 'left', true);
  drawWeatherIcon(c, cx0+cw-19*s, cy0+5*s, 13*s);
  txt(c, clipText(c, WEATHERS[S.weather].name, 34*s, 6.5*s), cx0+cw-6*s, cy0+21*s, 6.5*s, COL.dim, 'right');

  /* ── 右上：おかね ── */
  const mw = 84*s, mh = 18*s, mx0 = W-mw-5*s, my0 = 5*s;
  pill(c, mx0, my0, mw, mh);
  c.save();
  const coin = c.createRadialGradient(mx0+10*s,my0+6*s,1*s,mx0+11*s,my0+9*s,7*s);
  coin.addColorStop(0,'#fff6c8'); coin.addColorStop(0.5,'#ffd24a'); coin.addColorStop(1,'#d99a10');
  c.fillStyle=coin; c.beginPath(); c.arc(mx0+11*s, my0+9*s, 6.2*s, 0, 6.2832); c.fill();
  c.strokeStyle='#b07a08'; c.lineWidth=Math.max(1,0.8*s); c.stroke();
  c.fillStyle='#9a6a00'; c.font='bold '+(7.5*s)+'px '+UI_FONT; c.textAlign='center'; c.textBaseline='middle';
  c.fillText('c', mx0+11*s, my0+9.3*s);
  c.restore();
  txt(c, S.credits.toLocaleString(), mx0+mw-9*s, my0+3.6*s, 10.5*s, '#2b3246','right',true);

  /* ── 場所と重力 ── */
  const a = areaOf(S.area);
  c.save(); c.font=(7.5*s)+'px '+UI_FONT;
  const nw = c.measureText(a.name).width + 14*s; c.restore();
  let lx = W-nw-5*s;
  pill(c, lx, my0+mh+4*s, nw, 13*s);
  txt(c, a.name, lx+nw/2, my0+mh+6.5*s, 7.5*s, COL.text,'center');
  if (a.sky){
    const gn = gravNow().name;
    c.save(); c.font='bold '+(7*s)+'px '+UI_FONT; const gw=c.measureText(gn).width+12*s; c.restore();
    const gx = W-gw-5*s, gy = my0+mh+20*s;
    c.save();
    const gg=c.createLinearGradient(0,gy,0,gy+12*s); gg.addColorStop(0,'#b99cff'); gg.addColorStop(1,'#7a52e0');
    c.fillStyle=gg; rr(c,gx,gy,gw,12*s,6*s); c.fill();
    c.strokeStyle='#ffffff'; c.lineWidth=Math.max(1,s); rr(c,gx,gy,gw,12*s,6*s); c.stroke();
    c.restore();
    UI_DARK=true; txt(c, gn, gx+gw/2, gy+2.3*s, 7*s, '#ffffff','center',true); UI_DARK=false;
  }

  /* ── 下：手持ち10枠 ── */
  const cell = 19*s, tw = cell*10;
  const tx0 = (W-tw)/2, ty0 = H-cell-6*s;
  card(c, tx0-4*s, ty0-4*s, tw+8*s, cell+8*s, 8*s, { top:'rgba(255,255,255,0.9)', bot:'rgba(226,234,246,0.9)' });
  for (let i=0;i<10;i++){
    const sl = S.inv[i], sel = i===S.hand;
    const x = tx0+i*cell + 1*s, y = ty0 + 1*s - (sel? 2*s : 0), w = cell-2*s;
    if (sel){
      selBox(c, x, y, w, w, 4*s);
    } else {
      const g = c.createLinearGradient(0,y,0,y+w);
      g.addColorStop(0,'#ffffff'); g.addColorStop(1,'#e3eaf4');
      c.fillStyle=g; rr(c,x,y,w,w,4*s); c.fill();
      c.strokeStyle='rgba(140,160,195,0.55)'; c.lineWidth=1; rr(c,x+0.5,y+0.5,w-1,w-1,4*s); c.stroke();
    }
    txt(c, String((i+1)%10), x+2*s, y+1*s, 5.5*s, 'rgba(120,135,165,0.9)');
    if (sl){
      icon(c, sl.id, x+2.5*s, y+3*s, w-5*s);
      if (sl.qty>1){
        const qs = String(sl.qty);
        c.save(); c.font='bold '+(6.5*s)+'px '+UI_FONT; const qw = c.measureText(qs).width+5*s; c.restore();
        c.fillStyle='rgba(40,52,80,0.85)'; rr(c, x+w-qw-0.5*s, y+w-8.5*s, qw, 8*s, 4*s); c.fill();
        UI_DARK=true; txt(c, qs, x+w-qw/2-0.5*s, y+w-8*s, 6.5*s, '#ffffff','center',true); UI_DARK=false;
      }
      if (sl.q) txt(c, starStr(sl.q), x+w-2*s, y+1*s, 5.5*s, QUALITY[sl.q].color,'right');
    }
    if (sel){
      const b = Math.abs(Math.sin(Game.time*4))*1.5*s;
      c.fillStyle='#29a8ea';
      c.beginPath(); c.moveTo(x+w/2-3.5*s, y-6*s-b); c.lineTo(x+w/2+3.5*s, y-6*s-b); c.lineTo(x+w/2, y-2*s-b); c.closePath(); c.fill();
    }
  }
  /* 持っているものの名前 */
  const hi = handItem();
  let ny = ty0 - 22*s;
  if (hi){
    c.save(); c.font='bold '+(8*s)+'px '+UI_FONT; const w0 = c.measureText(hi.name).width+16*s; c.restore();
    pill(c, (W-w0)/2, ny, w0, 13*s);
    txt(c, hi.name, W/2, ny+2.5*s, 8*s, COL.text,'center',true);
    ny -= 16*s;
  }
  /* 目のまえのもの（Z は A ボタンとして見せる） */
  if (Game.hint){
    let h = Game.hint, useA = false;
    if (/（Z）$/.test(h)){ h = h.replace(/（Z）$/,''); useA = true; }
    c.save(); c.font=(8*s)+'px '+UI_FONT; const w0 = c.measureText(h).width+(useA? 26:16)*s; c.restore();
    const hx = (W-w0)/2;
    pill(c, hx, ny, w0, 14*s, { top:'rgba(236,249,255,0.97)', bot:'rgba(206,236,255,0.97)', line:'rgba(90,190,245,0.9)' });
    if (useA){ btnGlyph(c,'A', hx+9.5*s, ny+7*s, 5.3*s, '#e8453c'); txt(c, h, hx+17*s, ny+3*s, 8*s, COL.blue); }
    else txt(c, h, W/2, ny+3*s, 8*s, COL.blue, 'center');
  }

  /* ── 左下：元気・水 ── */
  const sw = 106*s, sh = 30*s;
  /* 下の隅に入らないときは、時計の下にならべる */
  let sx = 5*s, sy = H-sh-5*s;
  if (sx+sw > tx0-6*s || Game.touch) sy = cy0 + ch + 4*s;
  card(c, sx, sy, sw, sh, 8*s);
  /* ハートとしずく */
  const ex = S.energy/S.energyMax;
  const ecol = ex>0.4? '#46c97e' : ex>0.18? '#f0b020':'#ef5a43';
  c.save(); c.fillStyle='#ff6b7a';
  const hx0 = sx+9*s, hy0 = sy+9*s, hr = 3.2*s;
  c.beginPath(); c.arc(hx0-hr*0.55,hy0-hr*0.2,hr*0.62,0,6.2832); c.arc(hx0+hr*0.55,hy0-hr*0.2,hr*0.62,0,6.2832); c.fill();
  c.beginPath(); c.moveTo(hx0-hr*1.15,hy0); c.lineTo(hx0+hr*1.15,hy0); c.lineTo(hx0,hy0+hr*1.3); c.closePath(); c.fill();
  c.fillStyle='#4aa8f0';
  const dx0 = sx+9*s, dy0 = sy+21*s;
  c.beginPath(); c.moveTo(dx0,dy0-4.5*s); c.quadraticCurveTo(dx0+3.6*s,dy0,dx0,dy0+3*s); c.quadraticCurveTo(dx0-3.6*s,dy0,dx0,dy0-4.5*s); c.fill();
  c.restore();
  bar(c, sx+17*s, sy+6*s, 58*s, 7*s, S.energy, S.energyMax, ecol);
  txt(c, Math.ceil(S.energy)+'/'+S.energyMax, sx+sw-6*s, sy+5.2*s, 6.8*s, COL.dim,'right');
  bar(c, sx+17*s, sy+17.5*s, 58*s, 7*s, S.water, S.waterMax, '#4aa8f0');
  txt(c, S.water+'/'+S.waterMax, sx+sw-6*s, sy+16.7*s, 6.8*s, COL.dim,'right');

  /* 出荷箱の中身 */
  if (S.ship.length){
    const st = '出荷箱 '+S.ship.length+'件　'+shipValue()+'c';
    c.save(); c.font=(7.5*s)+'px '+UI_FONT; const w0=c.measureText(st).width+14*s; c.restore();
    const oy = (sy < H/2)? sy+sh+4*s : sy-16*s;
    pill(c, sx, oy, w0, 13*s);
    txt(c, st, sx+7*s, oy+2.5*s, 7.5*s, COL.gold);
  }

  /* 通知（右から滑りこむ） */
  for (let i=0;i<Game.toasts.length;i++){
    const t = Game.toasts[i];
    const al = Math.min(1, Math.min(t.t*4, (3.6-t.t)*2));
    if (al<=0) continue;
    c.save(); c.globalAlpha = al;
    const y = 58*s + i*17*s;
    c.font = (8.5*s)+'px '+UI_FONT;
    const txtStr = clipText(c, t.text, W-40*s, 8.5*s);
    const w = c.measureText(txtStr).width + 20*s;
    const slide = (1-Math.min(1,t.t*5))*40*s;
    const x = W-w-6*s+slide;
    card(c, x, y, w, 14*s, 7*s);
    c.fillStyle='#29a8ea'; rr(c, x+3*s, y+3*s, 3*s, 8*s, 1.5*s); c.fill();
    txt(c, txtStr, W-13*s+slide, y+2.8*s, 8.5*s, COL.text,'right');
    c.restore();
  }

  /* 触って遊ぶときのボタン */
  if (Game.touch) drawTouchPad(c);
}

function drawWeatherIcon(c,x,y,sz){
  const w = WEATHERS[S.weather].icon;
  c.save(); c.translate(x,y);
  if (w==='sun' && isNight()){
    /* 夜は月（別の小さな絵に描いてから貼る） */
    if (!Game._moon){
      const mc = mkCv(64,64), mg = mc.getContext('2d');
      const gr = mg.createRadialGradient(24,24,4,32,32,24);
      gr.addColorStop(0,'#fffbe0'); gr.addColorStop(1,'#ffd860');
      mg.fillStyle=gr; mg.beginPath(); mg.arc(32,32,22,0,6.2832); mg.fill();
      mg.globalCompositeOperation='destination-out';
      mg.beginPath(); mg.arc(44,22,19,0,6.2832); mg.fill();
      mg.globalCompositeOperation='source-over';
      mg.fillStyle='#fff6c0'; mg.fillRect(52,46,4,4); mg.fillRect(12,8,3,3); mg.fillRect(56,30,2,2);
      Game._moon = mc;
    }
    c.drawImage(Game._moon, 0, 0, sz, sz);
  }
  else if (w==='sun'){
    const g=c.createRadialGradient(sz*0.45,sz*0.42,sz*0.05,sz/2,sz/2,sz*0.32);
    g.addColorStop(0,'#fff6c0'); g.addColorStop(1,'#ffb020');
    c.fillStyle=g; c.beginPath(); c.arc(sz/2,sz/2,sz*0.28,0,6.2832); c.fill();
    c.strokeStyle='#ffb020'; c.lineWidth=Math.max(1,sz*0.09); c.lineCap='round';
    for(let i=0;i<8;i++){ const a=i/8*6.2832+Game.time*0.4; c.beginPath();
      c.moveTo(sz/2+Math.cos(a)*sz*0.38, sz/2+Math.sin(a)*sz*0.38);
      c.lineTo(sz/2+Math.cos(a)*sz*0.49, sz/2+Math.sin(a)*sz*0.49); c.stroke(); } }
  else if (w==='drop'){ c.fillStyle='#4aa8f0'; c.beginPath();
    c.moveTo(sz/2,sz*0.12); c.quadraticCurveTo(sz*0.88,sz*0.62,sz/2,sz*0.9); c.quadraticCurveTo(sz*0.12,sz*0.62,sz/2,sz*0.12); c.fill();
    c.fillStyle='rgba(255,255,255,0.7)'; c.beginPath(); c.arc(sz*0.4,sz*0.6,sz*0.08,0,6.2832); c.fill(); }
  else if (w==='dust'){ c.strokeStyle='#c8904a'; c.lineWidth=Math.max(1,sz*0.1); c.lineCap='round';
    for(let i=0;i<3;i++){ c.beginPath(); c.moveTo(sz*0.1,sz*(0.3+i*0.2)); c.quadraticCurveTo(sz*0.5,sz*(0.2+i*0.2),sz*(0.9-i*0.12),sz*(0.3+i*0.2)); c.stroke(); } }
  else if (w==='meteor'){ c.strokeStyle='#ffb020'; c.lineWidth=Math.max(1,sz*0.12); c.lineCap='round';
    c.beginPath(); c.moveTo(sz*0.55,sz*0.45); c.lineTo(sz*0.12,sz*0.88); c.stroke();
    c.fillStyle='#ff7a40'; c.beginPath(); c.arc(sz*0.66,sz*0.34,sz*0.2,0,6.2832); c.fill(); }
  else if (w==='flare'){ c.fillStyle='#ffd040'; c.beginPath(); c.arc(sz/2,sz/2,sz*0.24,0,6.2832); c.fill();
    c.strokeStyle='rgba(255,140,40,0.95)'; c.lineWidth=Math.max(1,sz*0.09);
    c.beginPath(); c.arc(sz/2,sz/2,sz*0.42,0.4,2.2); c.stroke();
    c.beginPath(); c.arc(sz/2,sz/2,sz*0.42,3.6,5.4); c.stroke(); }
  else if (w==='plug'){ c.fillStyle='#8d94a8'; c.fillRect(sz*0.25,sz*0.3,sz*0.5,sz*0.45);
    c.fillRect(sz*0.33,sz*0.12,sz*0.10,sz*0.20); c.fillRect(sz*0.57,sz*0.12,sz*0.10,sz*0.20);
    c.fillStyle='#ef5a43'; c.fillRect(sz*0.45,sz*0.75,sz*0.10,sz*0.15); }
  c.restore();
}

function drawTouchPad(c){
  const s=R.s,W=R.W,H=R.H;
  const cx = W*0.17, cy = H*0.78, r = 26*s;
  c.save();
  /* スライドパッド */
  c.globalAlpha=0.55;
  const g=c.createRadialGradient(cx,cy-r*0.3,r*0.2,cx,cy,r*1.35);
  g.addColorStop(0,'#f4f6fa'); g.addColorStop(1,'#9aa4b8');
  c.fillStyle=g; c.beginPath(); c.arc(cx,cy,r*1.3,0,6.2832); c.fill();
  c.globalAlpha=0.85;
  const nx = cx + Game.pad.x*r*0.55, ny = cy + Game.pad.y*r*0.55;
  const g2=c.createRadialGradient(nx-5*s,ny-6*s,2*s,nx,ny,15*s);
  g2.addColorStop(0,'#ffffff'); g2.addColorStop(1,'#b8c0d0');
  c.fillStyle=g2; c.beginPath(); c.arc(nx,ny,14*s,0,6.2832); c.fill();
  c.strokeStyle='rgba(90,100,120,0.5)'; c.lineWidth=Math.max(1,s); c.stroke();
  c.restore();
  c.save(); c.globalAlpha=0.9;
  btnGlyph(c,'A', W*0.86, H*0.86, 17*s, '#e8453c');
  btnGlyph(c,'B', W*0.76, H*0.68, 13*s, '#f2b705');
  c.restore();
  /* 袋・道具のボタン（押せる範囲も覚えておく） */
  const by0 = H*0.46;
  const bx1 = W-40*s, bx2 = W-80*s;
  pill(c, bx1, by0, 34*s, 16*s); txt(c,'袋', bx1+17*s, by0+3.5*s, 8.5*s, COL.text,'center',true);
  pill(c, bx2, by0, 36*s, 16*s); txt(c,'道具', bx2+18*s, by0+3.5*s, 8.5*s, COL.text,'center',true);
  const pad = 4*s;
  Game.touchRects = {
    bag:  [(bx1-pad)/W, (by0-pad)/H, (bx1+34*s+pad)/W, (by0+16*s+pad)/H],
    next: [(bx2-pad)/W, (by0-pad)/H, (bx2+36*s+pad)/W, (by0+16*s+pad)/H],
  };
}

/* ---------------------------------------------------------------- タイトル */
function drawTitle(){
  const c = R.c, s=R.s, W=R.W, H=R.H;
  if (W3.on){
    w3RenderTitle(0,'title');
    c.clearRect(0,0,W,H);
  } else {
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
  g.fillStyle='rgba(90,160,90,0.30)';
  g.beginPath(); g.ellipse(cx-14,cy+6,16,9,0.4,0,6.2832); g.fill();
  g.beginPath(); g.ellipse(cx+16,cy-10,10,7,-0.3,0,6.2832); g.fill();
  for (let i=0;i<3;i++){
    const a = t*0.5 + i*2.1;
    const ox = cx + Math.cos(a)*76, oy = cy + Math.sin(a)*22;
    g.fillStyle='#8a6b51';
    g.beginPath(); g.ellipse(ox,oy,7,3,0,0,6.2832); g.fill();
    drawPlant(g, ox, oy, ['akahoshi','comet','sunflare'][i], 4, 0.7, {seed:i});
  }
  const sx = ((t*18)%(VW+80))-40;
  px(g, sx, 28, 10,4,'#c6cbd9'); px(g,sx+9,29,4,2,'#8d94a8');
  px(g, sx+2,26,4,2,'#7fd6ff'); px(g,sx-4,29,4,2,'rgba(255,150,90,0.8)');
  R.c.drawImage(R.world, 0,0, R.W, R.H);
  }

  /* 題（白いふちどり・ぷっくりした字） */
  const bounce = Math.sin(Game.time*2)*1.5*s;
  const ty = H*0.1 + bounce;
  const fs = Math.min(30*s, W/9);
  c.save();
  c.textAlign='center'; c.textBaseline='alphabetic';
  c.font='bold '+fs+'px '+UI_FONT;
  c.lineJoin='round';
  c.fillStyle='rgba(20,10,40,0.45)'; c.fillText('トマト宇宙農園', W/2+2*s, ty+fs*0.85+3*s);
  c.strokeStyle='#ffffff'; c.lineWidth=fs*0.2; c.strokeText('トマト宇宙農園', W/2, ty+fs*0.85);
  c.strokeStyle='#ffb3a6'; c.lineWidth=fs*0.08; c.strokeText('トマト宇宙農園', W/2, ty+fs*0.85);
  const grd = c.createLinearGradient(0,ty,0,ty+fs);
  grd.addColorStop(0,'#ffe07a'); grd.addColorStop(0.45,'#ff7a52'); grd.addColorStop(1,'#d8261e');
  c.fillStyle=grd; c.fillText('トマト宇宙農園', W/2, ty+fs*0.85);
  c.restore();
  /* 副題の札 */
  const st = 'TOMATO  STAR  FARM';
  c.save(); c.font='bold '+(8.5*s)+'px '+UI_FONT; const stw = c.measureText(st).width+22*s; c.restore();
  c.save();
  const sg = c.createLinearGradient(0,ty+fs+6*s,0,ty+fs+20*s);
  sg.addColorStop(0,'#5ad0ff'); sg.addColorStop(1,'#1f8fe0');
  c.fillStyle=sg; rr(c,(W-stw)/2, ty+fs+6*s, stw, 14*s, 7*s); c.fill();
  c.strokeStyle='#ffffff'; c.lineWidth=Math.max(1,1.4*s); rr(c,(W-stw)/2, ty+fs+6*s, stw, 14*s, 7*s); c.stroke();
  c.restore();
  UI_DARK = true;
  txt(c, st, W/2, ty+fs+8.8*s, 8.5*s, '#ffffff','center',true);
  txt(c,'小惑星ソラナム　軌道農場記', W/2, ty+fs+24*s, 8.5*s, '#e8eeff','center');
  UI_DARK = false;

  /* メニュー（丸いボタンが縦にならぶ） */
  const opts = hasSave()? ['つづきから','はじめから','あそびかた'] : ['はじめる','あそびかた'];
  Game.titleOpts = opts;
  const bw=120*s, bh=18*s, gap=5*s;
  const my=H-(opts.length*(bh+gap))-24*s;
  for (let i=0;i<opts.length;i++){
    const sel = i===(Game.titleSel||0);
    const x=(W-bw)/2 + (sel? 0 : 0), y=my+i*(bh+gap);
    if (sel) selBox(c,x-3*s,y-1*s,bw+6*s,bh+2*s,(bh+2*s)/2);
    else card(c,x,y,bw,bh,bh/2);
    txt(c, opts[i], W/2, y+4.2*s, 9.5*s, sel? COL.blue : COL.text, 'center', true);
    if (sel) btnGlyph(c,'A', x+bw-8*s, y+bh/2, 5.5*s, '#e8453c');
  }
  const tip = TIP_LINES[Math.floor(Game.time/5)%TIP_LINES.length];
  c.save(); c.font=(7.5*s)+'px '+UI_FONT; const tw2 = c.measureText(tip).width+18*s; c.restore();
  c.fillStyle='rgba(8,12,30,0.55)'; rr(c,(W-tw2)/2,H-17*s,tw2,13*s,6.5*s); c.fill();
  UI_DARK = true; txt(c, tip, W/2, H-14.5*s, 7.5*s, 'rgba(225,235,255,0.9)','center'); UI_DARK = false;
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
  if (W3.on){
    w3RenderTitle(0,'ending');
    c.clearRect(0,0,W,H);
    c.fillStyle='rgba(6,8,18,0.45)'; c.fillRect(0,0,W,H);
  } else {
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
  }
  const t = Game.ending;
  UI_DARK = true;
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
  UI_DARK = false;
}

/* ---------------------------------------------------------------- 暗転 */
function drawFade(){
  if (!Game.fade) return;
  const f = Game.fade, c=R.c;
  let a;
  if (f.phase===0) a = Math.min(1, f.t/f.dur);
  else a = Math.max(0, 1 - f.t/f.dur);
  /* 丸く閉じて、丸く開く（アイリス） */
  const W=R.W, H=R.H;
  const maxR = Math.hypot(W,H)*0.55;
  const e = a*a*(3-2*a);
  const rad = maxR*(1-e);
  c.save();
  c.fillStyle='#05060c';
  c.beginPath(); c.rect(0,0,W,H);
  if (rad>0.5){ c.moveTo(W/2+rad, H*0.52); c.arc(W/2, H*0.52, rad, 0, 6.2832, true); }
  c.fill('evenodd');
  if (rad>0.5 && rad<maxR*0.98){
    c.strokeStyle='rgba(127,214,255,0.55)'; c.lineWidth=Math.max(2,R.s*1.5);
    c.beginPath(); c.arc(W/2, H*0.52, rad, 0, 6.2832); c.stroke();
  }
  c.restore();
}
