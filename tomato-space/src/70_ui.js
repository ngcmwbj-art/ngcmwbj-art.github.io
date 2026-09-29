/* =========================================================================
   70_ui.js  —  画面・メニュー・会話
   ========================================================================= */

const UI_FONT = '"Hiragino Maru Gothic ProN","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",sans-serif';
const COL = {
  bg:'#121a2e', bg2:'#1b2540', line:'#5f7bb5', line2:'#2c3c62',
  text:'#eef2ff', dim:'#9fb0d4', gold:'#ffd15c', red:'#ff7a63',
  green:'#7fe0a8', blue:'#7fd6ff', purple:'#c9a6ff',
};

function uiPush(u){ Game.ui.push(u); SFX.menu(); }
/* 指（やマウス）で押せる場所を、このフレームのぶん登録する。いちばん上の画面のものだけ */
function tapZone(owner,x,y,w,h,fn){
  if (owner && owner!==uiTop()) return;
  if (!owner && uiTop()) return;
  (Game.tapHits || (Game.tapHits=[])).push({ x, y, w, h, fn });
}
function uiPop(){ Game.ui.pop(); SFX.menu(); }
function uiTop(){ return Game.ui.length? Game.ui[Game.ui.length-1] : null; }
function uiClear(){ Game.ui.length = 0; }

/* ---------------------------------------------------------------- 通知 */
function toast(text){
  Game.toasts.push({ text:text, t:0 });
  if (Game.toasts.length>4) Game.toasts.shift();
}
function fx(x,y,type,col){
  Game.fx.push({ x:x, y:y, type:type, t:0, col:col||'#ffffff', area:S.area });
}
function fadeOut(fn, dur){
  Game.fade = { t:0, dur:dur||0.55, fn:fn, phase:0 };
}

/* ================================================================ 描画部品 */
function rr(c,x,y,w,h,r){
  c.beginPath();
  c.moveTo(x+r,y); c.lineTo(x+w-r,y); c.quadraticCurveTo(x+w,y,x+w,y+r);
  c.lineTo(x+w,y+h-r); c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  c.lineTo(x+r,y+h); c.quadraticCurveTo(x,y+h,x,y+h-r);
  c.lineTo(x,y+r); c.quadraticCurveTo(x,y,x+r,y); c.closePath();
}
/* ---------------------------------------------------------------- 3DS風の色 */
/* 白いパネルの上で読めるように、明るい文字色を濃くする（もとの色味は残す） */
let UI_DARK = false;           // true のあいだは暗い背景の上に書く（色をそのまま使う）
const _inkCache = {};
function _parseCol(col){
  col = String(col).trim();
  let r,g,b,a=1;
  if (col[0]==='#'){
    if (col.length===4){ r=parseInt(col[1]+col[1],16); g=parseInt(col[2]+col[2],16); b=parseInt(col[3]+col[3],16); }
    else { r=parseInt(col.slice(1,3),16); g=parseInt(col.slice(3,5),16); b=parseInt(col.slice(5,7),16); }
  } else {
    const m = col.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map(Number);
    r=p[0]; g=p[1]; b=p[2]; a = p.length>3? p[3] : 1;
  }
  return [r,g,b,a];
}
function _rgb2hsl(r,g,b){
  r/=255; g/=255; b/=255;
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b);
  let h=0, s2=0; const l=(mx+mn)/2;
  if (mx!==mn){
    const d=mx-mn;
    s2 = l>0.5? d/(2-mx-mn) : d/(mx+mn);
    if (mx===r) h=(g-b)/d+(g<b?6:0); else if (mx===g) h=(b-r)/d+2; else h=(r-g)/d+4;
    h/=6;
  }
  return [h,s2,l];
}
function _hsl(h,s2,l,a){
  return 'hsla('+Math.round(h*360)+','+Math.round(s2*100)+'%,'+Math.round(l*100)+'%,'+(a==null?1:a)+')';
}
function inkCol(col){
  if (_inkCache[col]) return _inkCache[col];
  const p = _parseCol(col);
  let out = col;
  if (p){
    const [h,sa,l] = _rgb2hsl(p[0],p[1],p[2]);
    const a = Math.max(p[3], 0.8);
    if (col===COL.text) out = '#2b3246';
    else if (col===COL.dim) out = '#6a7389';
    else if (sa<0.5 && l>0.6) out = _hsl(h, Math.min(sa,0.22), 0.26+(1-l)*0.45, a);
    else if (l>0.45) out = _hsl(h, Math.min(sa,0.78), 0.42, a);
    else out = _hsl(h, sa, l, a);
  }
  _inkCache[col] = out;
  return out;
}
/* 見出しの帯の色（アクセントを少し濃く・鮮やかに） */
function accentMid(col, l){
  const p = _parseCol(col||COL.blue); if (!p) return col;
  const [h,sa] = _rgb2hsl(p[0],p[1],p[2]);
  return _hsl(h, Math.min(0.85, Math.max(0.45,sa)), l==null? 0.55 : l, 1);
}
/* うすい斜線の地模様 */
function _stripePat(c){
  if (!Game._stripe){
    const cv = mkCv(12,12), g = cv.getContext('2d');
    g.strokeStyle='rgba(120,150,190,0.10)'; g.lineWidth=3;
    g.beginPath(); g.moveTo(-3,15); g.lineTo(15,-3); g.stroke();
    g.beginPath(); g.moveTo(9,15); g.lineTo(15,9); g.stroke();
    g.beginPath(); g.moveTo(-3,3); g.lineTo(3,-3); g.stroke();
    Game._stripe = cv;
  }
  return c.createPattern(Game._stripe,'repeat');
}

/* 白くてつやのある板（HUDの部品） */
function card(c,x,y,w,h,r,opt){
  const s = R.s; opt = opt||{};
  c.save();
  c.shadowColor='rgba(16,24,48,0.35)'; c.shadowBlur=8*s; c.shadowOffsetY=2*s;
  const g = c.createLinearGradient(0,y,0,y+h);
  g.addColorStop(0, opt.top||'rgba(255,255,255,0.97)'); g.addColorStop(1, opt.bot||'rgba(232,238,247,0.97)');
  c.fillStyle=g; rr(c,x,y,w,h,r); c.fill();
  c.shadowColor='transparent';
  c.lineWidth=Math.max(1,0.8*s); c.strokeStyle=opt.line||'rgba(255,255,255,0.95)';
  rr(c,x+0.5,y+0.5,w-1,h-1,r); c.stroke();
  c.strokeStyle='rgba(150,170,200,0.35)'; c.lineWidth=1;
  rr(c,x+1.5*s,y+1.5*s,w-3*s,h-3*s,Math.max(1,r-1.5*s)); c.stroke();
  c.restore();
}
function panel(c,x,y,w,h,title,accent){
  const s = R.s, r = 7*s;
  const ac = accent||COL.line;
  c.save();
  /* 影 */
  c.shadowColor='rgba(10,18,40,0.45)'; c.shadowBlur=16*s; c.shadowOffsetY=5*s;
  const g = c.createLinearGradient(0,y,0,y+h);
  g.addColorStop(0,'#ffffff'); g.addColorStop(1,'#e6ecf5');
  c.fillStyle=g; rr(c,x,y,w,h,r); c.fill();
  c.shadowColor='transparent';
  /* 地模様 */
  c.save(); rr(c,x,y,w,h,r); c.clip();
  c.fillStyle=_stripePat(c); c.fillRect(x,y,w,h);
  /* 見出しの帯 */
  if (title){
    const hh = 14*s;
    const hg = c.createLinearGradient(0,y,0,y+hh);
    hg.addColorStop(0, accentMid(ac,0.64)); hg.addColorStop(1, accentMid(ac,0.5));
    c.fillStyle=hg; c.fillRect(x,y,w,hh);
    c.fillStyle='rgba(255,255,255,0.35)'; c.fillRect(x,y,w,hh*0.45);
    c.fillStyle='rgba(0,0,0,0.12)'; c.fillRect(x,y+hh-1*s,w,1*s);
  }
  c.restore();
  /* 枠 */
  c.lineWidth=Math.max(1,1.6*s); c.strokeStyle=accentMid(ac,0.72);
  rr(c,x+0.8*s,y+0.8*s,w-1.6*s,h-1.6*s,r); c.stroke();
  c.lineWidth=1; c.strokeStyle='rgba(255,255,255,0.9)';
  rr(c,x+2.2*s,y+2.2*s,w-4.4*s,h-4.4*s,r-2*s); c.stroke();
  if (title){
    c.font='bold '+(8.5*s)+'px '+UI_FONT;
    c.textAlign='left'; c.textBaseline='middle';
    c.fillStyle='rgba(0,0,0,0.25)'; c.fillText(title, x+8*s, y+7.6*s);
    c.fillStyle='#ffffff'; c.fillText(title, x+7.5*s, y+7*s);
  }
  c.restore();
}
/* 選ばれている行（水色に光る帯。3DSのカーソル） */
function selBox(c,x,y,w,h,r){
  const s=R.s;
  const p = 0.5+0.5*Math.sin(Game.time*5);
  c.save();
  c.shadowColor='rgba(40,170,240,'+(0.35+p*0.35).toFixed(2)+')'; c.shadowBlur=(4+p*4)*s;
  const g=c.createLinearGradient(0,y,0,y+h);
  g.addColorStop(0,'#f2fbff'); g.addColorStop(1,'#c8ecff');
  c.fillStyle=g; rr(c,x,y,w,h,r||3*s); c.fill();
  c.shadowColor='transparent';
  c.lineWidth=Math.max(1.5,1.4*s); c.strokeStyle='hsl(199,85%,'+Math.round(52+p*8)+'%)';
  rr(c,x+0.5,y+0.5,w-1,h-1,r||3*s); c.stroke();
  c.restore();
}
/* 丸いボタンの記号（A・B など） */
function btnGlyph(c,label,x,y,r,col){
  c.save();
  const g=c.createRadialGradient(x-r*0.35,y-r*0.4,r*0.1,x,y,r);
  g.addColorStop(0,'#ffffff'); g.addColorStop(0.25,col); g.addColorStop(1,shade(col,-35));
  c.fillStyle=g; c.beginPath(); c.arc(x,y,r,0,6.2832); c.fill();
  c.strokeStyle='rgba(255,255,255,0.9)'; c.lineWidth=Math.max(1,r*0.12); c.stroke();
  c.fillStyle='#ffffff'; c.font='bold '+(r*1.25)+'px '+UI_FONT; c.textAlign='center'; c.textBaseline='middle';
  c.fillText(label,x,y+r*0.06);
  c.restore();
}
/* 触って遊ぶときは、キーの名前を画面のボタンの名前にかえて見せる */
function keyNames(str){
  if (!Game.touch) return str;
  return String(str)
    .replace(/Z(?=\s?で|＝|）|】)/g,'A').replace(/X(?=\s?で|＝|】)/g,'B')
    .replace('Z/スペース','A').replace('X または Esc','B').replace('Z または スペース','A');
}
function txt(c,str,x,y,size,color,align,bold){
  str = keyNames(str);
  c.save();
  c.font=(bold?'bold ':'')+(size)+'px '+UI_FONT;
  c.textAlign=align||'left'; c.textBaseline='top';
  if (UI_DARK){
    c.fillStyle='rgba(0,0,0,0.55)';
    c.fillText(str,x+Math.max(1,size*0.06),y+Math.max(1,size*0.07));
    c.fillStyle=color||'#ffffff';
  } else {
    c.fillStyle='rgba(255,255,255,0.75)';
    c.fillText(str,x,y+Math.max(1,size*0.08));
    c.fillStyle=inkCol(color||COL.text);
  }
  c.fillText(str,x,y);
  c.restore();
}
function txtLines(c,str,x,y,size,color,lh,align){
  const ls = String(str).split('\n');
  for (let i=0;i<ls.length;i++) txt(c,ls[i],x,y+i*(lh||size*1.35),size,color,align);
  return ls.length*(lh||size*1.35);
}
function bar(c,x,y,w,h,v,max,col,bg){
  c.save();
  c.fillStyle=bg||'#d3dbe8'; rr(c,x,y,w,h,h/2); c.fill();
  c.strokeStyle='rgba(90,110,140,0.35)'; c.lineWidth=1; rr(c,x+0.5,y+0.5,w-1,h-1,h/2); c.stroke();
  const f = Math.max(0,Math.min(1,v/max));
  if (f>0){
    const fw = Math.max(h,(w-2)*f);
    const g = c.createLinearGradient(0,y,0,y+h);
    g.addColorStop(0, mix(col,'#ffffff',0.35)); g.addColorStop(0.5,col); g.addColorStop(1, shade(col,-30));
    c.fillStyle=g; rr(c,x+1,y+1,fw,h-2,(h-2)/2); c.fill();
    c.fillStyle='rgba(255,255,255,0.45)'; rr(c,x+2,y+1.5,Math.max(1,fw-2),(h-2)*0.35,(h-2)/4); c.fill();
  }
  c.restore();
}
/* アイテムのアイコンを任意の大きさで */
function icon(c,id,x,y,size){
  const tmp = Game._iconCache || (Game._iconCache = {});
  if (!tmp[id]){
    const cv = mkCv(16,16); drawIcon(ctxOf(cv), id, 0,0, 1);
    tmp[id]=cv;
  }
  c.save(); c.imageSmoothingEnabled=false;
  c.drawImage(tmp[id], x, y, size, size);
  c.restore();
}
function starStr(q){ return q>0? '★'.repeat(q) : ''; }
/* 枠の幅で折り返す（日本語はどこでも折れてよい。英数字は語の途中で折らない） */
function wrapJP(c, str, maxW, size){
  c.save(); c.font = size+'px '+UI_FONT;
  const out = [];
  for (const para of String(str).split('\n')){
    let line = '';
    for (let i=0;i<para.length;i++){
      const ch = para[i];
      const test = line + ch;
      if (c.measureText(test).width > maxW && line.length){
        /* 行頭に来てはいけない文字は前の行に残す */
        if ('。、）」』！？…・ー'.indexOf(ch) >= 0){ out.push(test); line=''; continue; }
        out.push(line); line = ch;
      } else line = test;
    }
    out.push(line);
  }
  c.restore();
  return out.join('\n');
}
/* 枠におさまるように文字を切り詰める */
function clipText(c,str,maxW,size){
  c.save(); c.font=size+'px '+UI_FONT;
  if (c.measureText(str).width <= maxW){ c.restore(); return str; }
  let s2 = str;
  while (s2.length>1 && c.measureText(s2+'…').width > maxW) s2 = s2.slice(0,-1);
  c.restore();
  return s2+'…';
}

/* ================================================================ 会話 */
function dialogSeq(lines){
  if (!lines || !lines.length) return;
  uiPush({
    kind:'dialog', lines:lines, i:0, ch:0, sel:0,
    key(k){
      const L = this.lines[this.i];
      if (L.menu){
        if (k==='up'){ this.sel=(this.sel-1+L.menu.length)%L.menu.length; SFX.menu(); return; }
        if (k==='down'){ this.sel=(this.sel+1)%L.menu.length; SFX.menu(); return; }
        if (k==='act'){
          const m = L.menu[this.sel];
          uiPop();
          if (m.act) m.act();
          return;
        }
        if (k==='cancel'){ uiPop(); return; }
        return;
      }
      if (k==='act'||k==='cancel'){
        const n = this.full().length;
        if (this.ch < n){ this.ch = n; return; }
        this.i++;
        this.ch=0; this.sel=0;
        SFX.talk();
        if (this.i>=this.lines.length) uiPop();
      }
    },
    full(){
      const L = this.lines[this.i];
      return (this.wrapI===this.i && this.wrapped!=null)? this.wrapped : (L? (L.text||'') : '');
    },
    update(dt){
      const L = this.lines[this.i]; if (!L) return;
      const n = this.full().length;
      if (this.ch<n){
        this.ch = Math.min(n, this.ch + dt*46);
        if (Math.random()<0.28) SFX.talk();
      }
    },
    draw(c){
      const s=R.s, W=R.W, H=R.H;
      const L = this.lines[this.i]; if (!L) return;
      const bw = Math.min(W-16*s, 300*s);
      if (this.wrapI !== this.i){
        this.wrapped = wrapJP(c, L.text||'', bw-20*s, 9.5*s);
        this.wrapI = this.i;
      }
      const nl = this.wrapped.split('\n').length;
      const bh = Math.max(58*s, (22 + nl*13)*s);
      const bx = (W-bw)/2, by = H - bh - 8*s;
      panel(c,bx,by,bw,bh,null, L.who? npcColor(L.who) : COL.line);
      if (!L.menu || this.ch < (this.wrapped||'').length) tapZone(this, bx,by-10*s,bw,bh+10*s, ()=>this.key('act'));
      /* 名札（色つきの札に白い字） */
      if (L.who){
        c.save(); c.font='bold '+(9*s)+'px '+UI_FONT;
        const tw = c.measureText(L.who).width + 16*s;
        c.restore();
        const nx = bx+8*s, ny = by-9*s, nh = 15*s;
        c.save();
        c.shadowColor='rgba(0,0,0,0.3)'; c.shadowBlur=5*s; c.shadowOffsetY=2*s;
        const ng = c.createLinearGradient(0,ny,0,ny+nh);
        ng.addColorStop(0, accentMid(npcColor(L.who),0.62)); ng.addColorStop(1, accentMid(npcColor(L.who),0.46));
        c.fillStyle=ng; rr(c,nx,ny,tw,nh,nh/2); c.fill();
        c.shadowColor='transparent';
        c.strokeStyle='#ffffff'; c.lineWidth=Math.max(1,1.2*s); rr(c,nx,ny,tw,nh,nh/2); c.stroke();
        c.restore();
        UI_DARK = true;
        txt(c,L.who,nx+tw/2,ny+2.8*s,9*s,'#ffffff','center',true);
        UI_DARK = false;
      }
      const full = this.wrapped;
      const shown = full.slice(0, Math.floor(this.ch));
      txtLines(c, shown, bx+10*s, by+11*s, 9.5*s, COL.text, 13*s);
      /* 選択肢 */
      if (L.menu && this.ch>=full.length){
        const mw = 110*s, mh = L.menu.length*14*s + 8*s;
        const mx = bx+bw-mw-8*s, my = by-mh-12*s;
        panel(c,mx,my,mw,mh,null,COL.gold);
        for (let i=0;i<L.menu.length;i++){
          const sel = i===this.sel;
          if (sel) selBox(c,mx+4*s,my+4*s+i*14*s,mw-8*s,14*s,3*s);
          tapZone(this, mx+2*s,my+4*s+i*14*s,mw-4*s,14*s, ()=>{ this.sel=i; this.key('act'); });
          txt(c,(sel?'▶ ':'　')+L.menu[i].label, mx+7*s, my+7*s+i*14*s, 9*s, sel?COL.blue:COL.dim, 'left', sel);
        }
      } else if (this.ch>=full.length){
        const b = Math.abs(Math.sin(Game.time*5))*2.5*s;
        txt(c,'▼', bx+bw-16*s, by+bh-17*s+b, 9*s, COL.blue);
      }
    },
  });
}
function npcColor(name){
  for (const id in NPCS) if (NPCS[id].name===name) return NPCS[id].color;
  if (name==='生育スキャナ') return COL.green;
  return COL.blue;
}

function confirmBox(text, onYes, onNo){
  uiPush({
    kind:'confirm', text:text, sel:0,
    key(k){
      if (k==='left'||k==='right'||k==='up'||k==='down'){ this.sel=1-this.sel; SFX.menu(); return; }
      if (k==='act'){ const y=this.sel===0; uiPop(); if (y) onYes&&onYes(); else onNo&&onNo(); return; }
      if (k==='cancel'){ uiPop(); onNo&&onNo(); return; }
    },
    draw(c){
      const s=R.s,W=R.W,H=R.H;
      const bw=190*s, bh=62*s, bx=(W-bw)/2, by=(H-bh)/2;
      c.fillStyle='rgba(12,20,44,0.42)'; c.fillRect(0,0,W,H);
      panel(c,bx,by,bw,bh,null,COL.gold);
      txtLines(c,this.text,bx+bw/2,by+12*s,9.5*s,COL.text,13*s,'center');
      const opts=['はい','いいえ'];
      for (let i=0;i<2;i++){
        const ox = bx+bw/2 + (i===0? -48*s : 8*s);
        const sel = i===this.sel;
        tapZone(this, ox-4*s,by+bh-24*s,48*s,22*s, ()=>{ this.sel=i; this.key('act'); });
        if (sel) selBox(c,ox,by+bh-20*s,40*s,14*s,7*s);
        else { c.fillStyle='#eef2f8'; rr(c,ox,by+bh-20*s,40*s,14*s,7*s); c.fill(); c.strokeStyle='#c9d3e2'; c.lineWidth=1; rr(c,ox+0.5,by+bh-20*s+0.5,40*s-1,14*s-1,7*s); c.stroke(); }
        txt(c,opts[i],ox+20*s,by+bh-17*s,9.5*s,sel?COL.blue:COL.dim,'center',sel);
      }
    },
  });
}

/* ============================================================ 一覧メニュー */
/* items: [{label, sub, right, icon, act, disabled, color}] */
function listMenu(opt){
  const u = {
    kind:'list', title:opt.title, items:opt.items, i:opt.i||0, top:0,
    rows:opt.rows||8, w:opt.w||210, footer:opt.footer, accent:opt.accent||COL.blue,
    onSel:opt.onSel, extra:opt.extra, qty:1, allowQty:opt.allowQty,
    key(k){
      const n = this.items.length;
      if (!n){ if (k==='cancel'||k==='act') uiPop(); return; }
      if (k==='up'){ this.i=(this.i-1+n)%n; this.qty=1; SFX.menu(); }
      else if (k==='down'){ this.i=(this.i+1)%n; this.qty=1; SFX.menu(); }
      else if (k==='left' && this.allowQty){ this.qty=Math.max(1,this.qty-1); SFX.menu(); }
      else if (k==='right' && this.allowQty){ this.qty=Math.min(99,this.qty+1); SFX.menu(); }
      else if (k==='act'){
        const it = this.items[this.i];
        if (!it || it.disabled){ SFX.no(); return; }
        if (it.act) it.act(this.qty, this);
      }
      else if (k==='cancel'){ uiPop(); if (opt.onClose) opt.onClose(); }
      if (this.i < this.top) this.top=this.i;
      if (this.i >= this.top+this.rows) this.top=this.i-this.rows+1;
      if (this.onSel) this.onSel(this.items[this.i]);
    },
    draw(c){
      const s=R.s,W=R.W,H=R.H;
      const bw=this.w*s;
      const anySub = this.items.some(it=>it && it.sub);
      const rowH=(anySub? 19:14)*s;
      const bh = 22*s + Math.min(this.rows,Math.max(1,this.items.length))*rowH + (this.footer?20*s:8*s);
      const bx=(W-bw)/2, by=(H-bh)/2 - 6*s;
      c.fillStyle='rgba(12,20,44,0.42)'; c.fillRect(0,0,W,H);
      panel(c,bx,by,bw,bh,this.title,this.accent);
      if (!this.items.length){
        txt(c,'（なにもない）',bx+bw/2,by+30*s,9.5*s,COL.dim,'center');
      }
      for (let r=0;r<Math.min(this.rows,this.items.length);r++){
        const idx=this.top+r; const it=this.items[idx]; if(!it) break;
        const ry = by+19*s + r*rowH;
        const sel = idx===this.i;
        tapZone(this, bx+4*s, ry, bw-8*s, rowH, ()=>{ this.i=idx; this.key('act'); });
        if (sel){ selBox(c,bx+4*s,ry,bw-8*s,rowH,4*s);
          c.fillStyle=accentMid(this.accent,0.55); rr(c,bx+5*s,ry+2*s,2.2*s,rowH-4*s,1*s); c.fill(); }
        let tx0 = bx+9*s;
        if (it.icon){
          c.fillStyle='rgba(255,255,255,0.8)'; rr(c,tx0-1*s,ry+1*s,15*s,15*s,3*s); c.fill();
          c.strokeStyle='rgba(150,170,200,0.45)'; c.lineWidth=1; rr(c,tx0-1*s+0.5,ry+1*s+0.5,15*s-1,15*s-1,3*s); c.stroke();
          icon(c,it.icon,tx0,ry+2*s,13*s); tx0 += 17*s; }
        const col = it.disabled? '#6a769a' : (it.color|| (sel?COL.text:'#cfd8ee'));
        const rightW = it.right? 34*s : 0;
        txt(c,it.label,tx0,ry+2*s,8.6*s,col,'left',sel);
        if (it.sub) txt(c,clipText(c,it.sub,bw-(tx0-bx)-12*s-rightW,7*s),tx0,ry+11.2*s,7*s,it.disabled?'#5c6788':COL.dim);
        if (it.right) txt(c,it.right,bx+bw-9*s,ry+(anySub?4*s:2.5*s),9*s,it.rightColor||(it.disabled?'#6a769a':COL.gold),'right');
      }
      /* スクロール印 */
      if (this.items.length>this.rows){
        if (this.top>0){ txt(c,'▲',bx+bw-5*s,by+19*s,7*s,COL.dim,'center');
          tapZone(this, bx, by+12*s, bw, 8*s, ()=>this.key('up')); }
        if (this.top+this.rows<this.items.length){ txt(c,'▼',bx+bw-5*s,by+bh-(this.footer?27*s:13*s),7*s,COL.dim,'center');
          tapZone(this, bx, by+19*s+this.rows*rowH, bw, 10*s, ()=>this.key('down')); }
      }
      if (this.footer){
        txt(c,this.footer,bx+9*s,by+bh-15*s,8*s,COL.dim);
        if (this.allowQty){ txt(c,'◀ '+this.qty+'個 ▶', bx+bw-9*s, by+bh-15*s, 8*s, COL.green,'right');
          tapZone(this, bx+bw-60*s, by+bh-19*s, 25*s, 16*s, ()=>this.key('left'));
          tapZone(this, bx+bw-30*s, by+bh-19*s, 25*s, 16*s, ()=>this.key('right')); }
      } else if (this.allowQty){
        txt(c,'◀ '+this.qty+'個 ▶', bx+bw-9*s, by+bh-13*s, 8*s, COL.green,'right');
      }
      if (this.extra) this.extra(c,bx,by,bw,bh);
    },
  };
  uiPush(u);
  return u;
}

/* ============================================================ もちもの格子 */
function gridMenu(opt){
  const u = {
    kind:'grid', title:opt.title, i:0, cols:10,
    filter:opt.filter, onPick:opt.onPick, footer:opt.footer, accent:opt.accent||COL.green,
    slots(){
      const out=[];
      for (let k=0;k<invSize();k++){
        const sl=S.inv[k];
        if (opt.filter && sl && !opt.filter(sl)) continue;
        out.push(k);
      }
      return out;
    },
    key(k){
      const N = invSize(), cols=this.cols;
      if (k==='left'){ this.i=(this.i-1+N)%N; SFX.menu(); }
      else if (k==='right'){ this.i=(this.i+1)%N; SFX.menu(); }
      else if (k==='up'){ this.i=(this.i-cols+N)%N; SFX.menu(); }
      else if (k==='down'){ this.i=(this.i+cols)%N; SFX.menu(); }
      else if (k==='act'){ if (this.onPick) this.onPick(this.i, this); }
      else if (k==='cancel'){ uiPop(); if (opt.onClose) opt.onClose(); }
    },
    draw(c){
      const s=R.s,W=R.W,H=R.H;
      const N=invSize(), cols=this.cols, rows=Math.ceil(N/cols);
      const cell=20*s;
      const bw = cols*cell + 14*s;
      const bh = 22*s + rows*cell + 34*s;
      const bx=(W-bw)/2, by=(H-bh)/2;
      c.fillStyle='rgba(12,20,44,0.42)'; c.fillRect(0,0,W,H);
      panel(c,bx,by,bw,bh,this.title,this.accent);
      for (let k=0;k<N;k++){
        const cx = bx+7*s + (k%cols)*cell, cy = by+19*s + Math.floor(k/cols)*cell;
        const sel = k===this.i;
        const sl = S.inv[k];
        const dim = opt.filter && sl && !opt.filter(sl);
        tapZone(this, cx, cy, cell-2*s, cell-2*s, ()=>{ if (this.i===k) this.key('act'); else { this.i=k; SFX.menu(); } });
        if (sel) selBox(c,cx,cy,cell-2*s,cell-2*s,3*s);
        else {
          const cg = c.createLinearGradient(0,cy,0,cy+cell);
          cg.addColorStop(0, k<10? '#ffffff':'#f6f8fb'); cg.addColorStop(1, k<10? '#e6eef9':'#e4e8ef');
          c.fillStyle=cg; rr(c,cx,cy,cell-2*s,cell-2*s,3*s); c.fill();
          c.strokeStyle= k<10? 'rgba(90,150,210,0.45)':'rgba(150,165,190,0.45)'; c.lineWidth=1;
          rr(c,cx+0.5,cy+0.5,cell-2*s-1,cell-2*s-1,3*s); c.stroke();
        }
        if (sl){
          c.save(); if (dim) c.globalAlpha=0.3;
          icon(c,sl.id,cx+2*s,cy+2*s,(cell-6*s));
          c.restore();
          if (sl.qty>1) txt(c,String(sl.qty),cx+cell-4*s,cy+cell-10*s,7.5*s,COL.text,'right');
          if (sl.q) txt(c,starStr(sl.q),cx+2*s,cy+1*s,6*s,QUALITY[sl.q].color);
        }
        if (k===S.hand){ c.strokeStyle=accentMid(COL.green,0.45); c.lineWidth=Math.max(1.5,1.2*s); rr(c,cx-1,cy-1,cell-2*s+2,cell-2*s+2,3*s); c.stroke(); }
      }
      /* 説明 */
      const sl = S.inv[this.i];
      const dy = by+19*s + rows*cell + 3*s;
      if (sl){
        const it=ITEMS[sl.id];
        txt(c,it.name+(sl.q?'　'+starStr(sl.q):'')+'　×'+sl.qty, bx+8*s, dy, 9.5*s, COL.text,'left',true);
        txt(c,it.desc||'', bx+8*s, dy+11*s, 7.5*s, COL.dim);
        if (it.sell) txt(c,'売値 '+itemValue(sl)+'c', bx+bw-8*s, dy, 8.5*s, COL.gold,'right');
      } else {
        txt(c, this.footer||'空いている枠', bx+8*s, dy, 8.5*s, COL.dim);
      }
    },
  };
  uiPush(u);
  return u;
}

/* ================================================================ 各画面 */
function openBag(){
  gridMenu({
    title:'もちもの（'+invSize()+'枠）　1〜10枠が手持ち',
    accent:COL.green,
    onPick(i,me){
      const sl = S.inv[i];
      if (!sl){ SFX.no(); return; }
      const it = ITEMS[sl.id];
      const items=[];
      if (i>=10) items.push({ label:'手持ちの枠へ移す', act:()=>{
        let t=-1;
        for (let k=0;k<10;k++) if (!S.inv[k]){ t=k; break; }
        if (t<0) t=S.hand;
        const tmp=S.inv[t]; S.inv[t]=S.inv[i]; S.inv[i]=tmp;
        S.hand=t; uiPop(); SFX.ok();
      }});
      else items.push({ label:'これを持つ', act:()=>{ S.hand=i; uiPop(); SFX.ok(); }});
      if (it.kind==='use' && it.energy) items.push({ label:'食べる', act:()=>{ uiPop(); eatItem(i); }});
      if (it.kind==='crop') items.push({ label:'食べる', act:()=>{ uiPop(); eatCrop(i); }});
      if (it.kind==='seed') items.push({ label:'詳しく見る', act:()=>{ uiPop(); varietyDetail(it.variety); }});
      if (it.kind==='crop') items.push({ label:'詳しく見る', act:()=>{ uiPop(); varietyDetail(it.variety); }});
      items.push({ label:'並べかえ（ほかの枠と入れ替え）', act:()=>{
        uiPop();
        gridMenu({ title:'どの枠と入れ替える？', accent:COL.gold,
          onPick(j){ const t=S.inv[j]; S.inv[j]=S.inv[i]; S.inv[i]=t; uiPop(); SFX.ok(); } });
      }});
      if (it.kind!=='tool' && it.kind!=='key') items.push({ label:'捨てる', color:COL.red, act:()=>{
        uiPop();
        confirmBox(it.name+'を捨てる？', ()=>{ invTakeSlot(i); SFX.no(); });
      }});
      listMenu({ title:it.name, items:items, w:150, rows:6 });
    },
  });
}

function openShip(){
  const total = shipValue();
  gridMenu({
    title:'出荷箱　—　いま '+total+'c ぶん（翌朝に精算）',
    accent:COL.gold,
    filter:(sl)=>{ const it=ITEMS[sl.id]; return it.kind!=='tool' && it.kind!=='key'; },
    footer:'Z＝入れる　X＝とじる',
    onPick(i,me){
      const sl=S.inv[i]; if (!sl){ SFX.no(); return; }
      const it=ITEMS[sl.id];
      if (it.kind==='tool'||it.kind==='key'){ toast('これは出荷できない。'); SFX.no(); return; }
      shipPut(i);
      me.title = '出荷箱　—　いま '+shipValue()+'c ぶん（翌朝に精算）';
    },
  });
}

function openGravity(){
  const items = GRAVITY_STEPS.map((g,i)=>({
    label:g.name+'　'+g.label + (i===S.gravIdx? '　◀ いま':''),
    sub:g.note,
    right:'実'+(g.size>=1?'×':'×')+g.size.toFixed(2)+'　糖'+(g.sugar>=0?'+':'')+g.sugar,
    color: i===S.gravIdx? COL.green : undefined,
    act:()=>{
      S.gravIdx=i; SFX.ok(); uiPop();
      toast('農場の重力を'+g.name+'にした。');
      if (g.fallRisk>0 && !hasUp('stake')) toast('※ 支柱が無いと茎が倒れる。');
    },
  }));
  listMenu({ title:'重力コンソール　—　農場の人工重力', items:items, w:240, rows:4, accent:COL.purple,
    footer:'重力は「これから育つぶん」に効く。植えた時の重力で育ちの速さが決まる。' });
}

function openCalendar(){
  const s0=seasonNow();
  const r = rankNow();
  const next = r+1 < RANKS.length? RANKS[r+1] : null;
  const owned = Object.keys(S.ups).map(k=>UPGRADES[k]? UPGRADES[k].name:k);
  const lines = [
    '第'+S.year+'年　'+s0.name+'（'+s0.kana+'）　'+S.day+' / '+DAYS_PER_SEASON+'日',
    s0.note,
    '',
    '今日の天候：'+WEATHERS[S.weather].name,
    '　'+WEATHERS[S.weather].note,
    '明日の予報：'+WEATHERS[S.tomorrowWeather||'clear'].name,
    '',
    '農場評価：'+RANKS[r].name+'　（累計出荷 '+S.totalShipped.toLocaleString()+'c）',
    next? '次の評価まで：あと '+(next.need-S.totalShipped).toLocaleString()+'c' : '最高評価に達している。',
    '図鑑：'+dexCount()+' / '+VARIETY_LIST.length+' 種',
    '重力：'+gravNow().name+'（'+gravNow().label+'）',
    '',
    '収穫 '+S.stat.harvested+'個　耕した '+S.stat.tilled+'回　割った石 '+S.stat.rocks+'個',
    '変異 '+S.stat.mutations+'回　過ごした日 '+S.stat.days+'日',
    '',
    '設備：'+(owned.length? owned.join('・') : 'まだ何も無い'),
  ];
  uiPush({
    kind:'calendar',
    key(k){ if (k==='cancel'||k==='act') uiPop(); },
    draw(c){
      const s=R.s,W=R.W,H=R.H;
      const bw=Math.min(W-14*s,250*s), bh=Math.min(H-14*s, lines.length*12.5*s+34*s);
      const bx=(W-bw)/2, by=(H-bh)/2;
      c.fillStyle='rgba(12,20,44,0.42)'; c.fillRect(0,0,W,H);
      panel(c,bx,by,bw,bh,'こよみ・農場の記録',COL.gold);
      tapZone(this, bx,by,bw,bh, ()=>this.key('act'));
      txtLines(c, lines.join('\n'), bx+11*s, by+22*s, 8.8*s, COL.text, 12.5*s);
      txt(c,'X でとじる', bx+bw-11*s, by+bh-13*s, 8*s, COL.dim,'right');
    },
  });
}

/* ------------------------------------------------------------ 店 */
function shopStock(){
  const rank = rankNow();
  const list = [];
  const sid = seasonNow().id;
  for (const v of VARIETY_LIST){
    const V = VARIETIES[v];
    if (V.mutantOnly || V.crossOnly) continue;
    if (V.tier>2 && !S.dex[v]) continue;          // 一度育てた品種は取り寄せてくれる
    if (V.tier===2 && !S.dex[v] && rank<1) continue;
    const off = V.seasons.indexOf(sid)<0;
    list.push({ id:'sd_'+v, off:off });
  }
  list.push({id:'f_basic'},{id:'f_sweet'},{id:'f_giant'},{id:'jelly'});
  if (rank>=2) list.push({id:'jelly_hi'});
  return list;
}
function priceOf(id){
  const it = ITEMS[id];
  const h = S.npc.zax.hearts;
  const disc = 1 - Math.min(0.20, Math.floor(h/2)*0.05);
  return Math.max(1, Math.round((it.price||it.sell||10) * disc));
}
function openShop(){
  const mk = ()=> shopStock().map(e=>{
    const it = ITEMS[e.id];
    const p = priceOf(e.id);
    return {
      icon:e.id, label:it.name + (e.off? '（今は季節外）':''),
      sub:it.desc, right:p+'c',
      color: e.off? '#9a8f7a': undefined,
      act:(qty,me)=>{
        const cost = p*qty;
        if (S.credits<cost){ toast('おかねが足りない。'); SFX.no(); return; }
        if (!invHasRoom(e.id,qty)){ toast('もちものがいっぱい。'); SFX.no(); return; }
        S.credits-=cost; invPut(e.id,qty);
        SFX.coin(); toast(it.name+'×'+qty+' を買った（-'+cost+'c）');
        npcGain('zax', Math.min(10, Math.ceil(cost/500)));
        me.footer = '所持 '+S.credits+'c　　◀▶で個数';
      },
    };
  });
  const items = mk();
  items.push({ label:'── 売る（値の8割） ──', disabled:true });
  items.push({ label:'もちものから売る', icon:'m_iron', act:()=>{
    gridMenu({ title:'なにを売る？（表示額の8割で買い取り）', accent:COL.gold,
      filter:(sl)=>{ const it=ITEMS[sl.id]; return it.kind!=='tool'&&it.kind!=='key'; },
      onPick(i,me){
        const sl=S.inv[i]; if(!sl) return;
        const it=ITEMS[sl.id];
        if (it.kind==='tool'||it.kind==='key'){ SFX.no(); return; }
        const per = Math.max(1, Math.round(itemValue(sl)*0.8));
        confirmBox(it.name+'×'+sl.qty+' を '+(per*sl.qty)+'c で売る？', ()=>{
          const t = invTakeSlot(i);
          S.credits += per*t.qty; SFX.coin();
          toast('+'+(per*t.qty)+'c');
        });
      }});
  }});
  listMenu({ title:'ZAX-9 移動商店', items:items, w:250, rows:8, accent:COL.gold,
    allowQty:true, footer:'所持 '+S.credits+'c　　◀▶で個数' });
}

function openVend(){
  const stock = ['jelly','jelly_hi','f_basic'];
  const items = stock.map(id=>{
    const it = ITEMS[id], p = Math.round((it.price||100)*1.15);
    return { icon:id, label:it.name, sub:it.desc, right:p+'c', act:(qty,me)=>{
      const cost=p*qty;
      if (S.credits<cost){ toast('おかねが足りない。'); SFX.no(); return; }
      if (!invHasRoom(id,qty)){ toast('もちものがいっぱい。'); SFX.no(); return; }
      S.credits-=cost; invPut(id,qty); SFX.coin();
      toast(it.name+'×'+qty+'（-'+cost+'c）');
      me.footer='所持 '+S.credits+'c　　自販機は少し割高';
    }};
  });
  listMenu({ title:'自動販売機', items:items, w:220, rows:4, accent:COL.blue,
    allowQty:true, footer:'所持 '+S.credits+'c　　自販機は少し割高' });
}

function openMachineShop(){
  const items = Object.keys(MACHINES).map(k=>{
    const M = MACHINES[k], P = PROCESS[M.proc];
    const have = S.machines.filter(m=>m&&m.type===k).length;
    const free = S.machines.indexOf(null);
    const ok = S.credits>=M.price && hasMats(M.mats) && free>=0;
    return {
      label:M.name+(have?'（'+have+'台）':''),
      sub:'トマト'+P.need+'個 → '+P.name+'　'+P.days+'日　価値×'+P.mul+'　／　'+matsText(M.mats),
      right:M.price+'c', disabled:!ok,
      act:()=>{
        if (!ok){ SFX.no(); return; }
        S.credits-=M.price; payMats(M.mats);
        S.machines[free] = { type:k, in:null, out:null, doneDay:null };
        SFX.levelup(); toast(M.name+'を加工小屋に設置した。');
        uiPop(); openMachineShop();
      },
    };
  });
  const free = S.machines.filter(m=>!m).length;
  listMenu({ title:'ナツキの工房 — 加工機', items:items, w:280, rows:6, accent:COL.green,
    footer:'所持 '+S.credits+'c　加工小屋の空き台 '+free+'／8' });
}

function openUpgrade(){
  const items = [];
  for (const k in UPGRADES){
    const U = UPGRADES[k];
    if (S.ups[k]) continue;
    if (U.req && !S.ups[U.req]) continue;
    const ok = S.credits>=U.price && hasMats(U.mats);
    items.push({
      label:U.name, sub:U.desc+'　／　'+matsText(U.mats),
      right:U.price+'c', disabled:!ok,
      act:()=>{
        if (!ok){ SFX.no(); return; }
        S.credits-=U.price; payMats(U.mats);
        S.ups[k]=1;
        if (k==='body') S.energyMax=130;
        if (k==='body2') S.energyMax=170;
        if (k==='can2') S.waterMax=40;
        if (k==='can3') S.waterMax=90;
        SFX.levelup(); npcGain('natsuki', 10);
        uiPop();
        dialogSeq([{who:'ナツキ', text:'はい、'+U.name+'。取り付けといたよ。\n'+U.desc}]);
      },
    });
  }
  if (!items.length) items.push({label:'もう取り付けるものは無い', disabled:true});
  const owned = Object.keys(S.ups).map(k=>UPGRADES[k]? UPGRADES[k].name : k);
  listMenu({ title:'ナツキの工房 — 設備', items:items, w:290, rows:7, accent:COL.green,
    footer:'所持 '+S.credits+'c　　導入済み：'+(owned.length? owned.join('・') : 'なし') });
}

/* ------------------------------------------------------------ 加工台 */
function openMachine(n){
  const m = S.machines[n];
  if (!m){
    dialogSeq([{who:'', text:'からっぽの加工台。\nナツキの工房で加工機を買えば、ここに置ける。'}]);
    return;
  }
  const P = PROCESS[MACHINES[m.type].proc];
  if (m.out){
    const got = invPut(m.out.id, m.out.n, m.out.q);
    if (got>0){ toast('もちものがいっぱい。'); SFX.no(); return; }
    toast(ITEMS[m.out.id].name+'×'+m.out.n+' を受け取った');
    SFX.coin(); m.out=null; m.doneDay=null; m.in=null;
    return;
  }
  if (m.doneDay!=null){
    if (absDay() >= m.doneDay){
      /* 完成 */
      const v = m.in.variety;
      m.out = { id:'g_'+P.id+'_'+v, n:1, q:m.in.q };
      m.doneDay = absDay();
      openMachine(n);
      return;
    }
    toast(MACHINES[m.type].name+'：あと'+(m.doneDay-absDay())+'日');
    return;
  }
  /* 材料を入れる */
  gridMenu({
    title:MACHINES[m.type].name+'　—　トマト'+P.need+'個を入れる',
    accent:COL.gold,
    filter:(sl)=> ITEMS[sl.id].kind==='crop',
    onPick(i){
      const sl=S.inv[i]; if(!sl) return;
      const it=ITEMS[sl.id];
      if (it.kind!=='crop'){ SFX.no(); return; }
      if (sl.qty < P.need){ toast('この品種が'+P.need+'個 必要。'); SFX.no(); return; }
      const q = sl.q||0;
      invTake(sl.id, P.need, q);
      m.in = { variety:it.variety, q:q };
      m.doneDay = absDay() + P.days;
      SFX.ok(); uiPop();
      toast(it.name+'を'+P.name+'にしている。'+P.days+'日後にできる。');
    },
  });
}

/* ------------------------------------------------------------ 交配ラボ */
function openLab(){
  if (!hasUp('lab')){
    dialogSeq([
      {who:'Dr.ルナ', text:'交配装置は、まだ電源が入りません。\nナツキの工房で『交配ラボの起動』を頼んでください。'},
    ]);
    return;
  }
  const seeds = [];
  const seen = {};
  for (let i=0;i<invSize();i++){
    const sl=S.inv[i]; if(!sl) continue;
    const it=ITEMS[sl.id];
    if (it.kind!=='seed') continue;
    if (seen[it.variety]) continue;
    seen[it.variety]=1;
    seeds.push(it.variety);
  }
  if (seeds.length<2 && !(seeds.length===1 && invCount('sd_'+seeds[0])>=2)){
    dialogSeq([{who:'Dr.ルナ', text:'種が足りません。\n2種類、あるいは同じ種を2つ持ってきてください。'}]);
    return;
  }
  const items = seeds.map(v=>({
    icon:'sd_'+v, label:VARIETIES[v].name, sub:'持っている数：'+invCount('sd_'+v),
    act:()=>{
      uiPop();
      const items2 = seeds.map(w=>({
        icon:'sd_'+w, label:VARIETIES[w].name,
        sub: w===v? '同じ品種どうし → 選抜種（要2つ）' : (crossResult(v,w)&&S.flags['cross_'+crossResult(v,w)]? '→ '+VARIETIES[crossResult(v,w)].name : '結果はやってみないと分からない'),
        disabled: (w===v && invCount('sd_'+v)<2),
        act:()=>{ uiPop(); doCross(v,w); },
      }));
      listMenu({ title:VARIETIES[v].name+' × ？', items:items2, w:240, rows:8, accent:COL.purple,
        footer:'交配表は帳面（図鑑）に記録されていく。' });
    },
  }));
  listMenu({ title:'交配装置　—　親その1をえらぶ', items:items, w:240, rows:8, accent:COL.purple,
    footer:'同じ品種どうしを掛けると「選抜種」になり、等級が上がりやすくなる。' });
}

/* ------------------------------------------------------------ 図鑑 */
function openDex(){
  const u = {
    kind:'dex', i:0,
    key(k){
      const n=VARIETY_LIST.length;
      if (k==='left'){ this.i=(this.i-1+n)%n; SFX.menu(); }
      else if (k==='right'){ this.i=(this.i+1)%n; SFX.menu(); }
      else if (k==='up'){ this.i=(this.i-5+n)%n; SFX.menu(); }
      else if (k==='down'){ this.i=(this.i+5)%n; SFX.menu(); }
      else if (k==='cancel'||k==='act') uiPop();
    },
    draw(c){
      const s=R.s,W=R.W,H=R.H;
      const bw=Math.min(W-12*s, 300*s);
      const cell=Math.floor((bw-20*s)/5);
      const gRows=Math.ceil(VARIETY_LIST.length/5);
      const bh=Math.min(H-12*s, 26*s + gRows*(cell*0.78) + 60*s);
      const bx=(W-bw)/2, by=(H-bh)/2;
      c.fillStyle='rgba(12,20,44,0.46)'; c.fillRect(0,0,W,H);
      panel(c,bx,by,bw,bh,'オババの帳面 — トマト図鑑　'+dexCount()+'/'+VARIETY_LIST.length, COL.red);
      for (let i=0;i<VARIETY_LIST.length;i++){
        const v=VARIETY_LIST[i], V=VARIETIES[v], d=S.dex[v];
        const cx=bx+10*s+(i%5)*cell, cy=by+22*s+Math.floor(i/5)*(cell*0.78);
        const sel=i===this.i;
        tapZone(this, cx, cy, cell-4*s, cell*0.78-4*s, ()=>{ this.i=i; SFX.menu(); });
        if (sel) selBox(c,cx,cy,cell-4*s,cell*0.78-4*s,4*s);
        else {
          c.fillStyle = d? '#fbfcfe':'#e3e8f0';
          rr(c,cx,cy,cell-4*s,cell*0.78-4*s,4*s); c.fill();
          c.strokeStyle='rgba(150,165,195,0.5)'; c.lineWidth=1;
          rr(c,cx+0.5,cy+0.5,cell-4*s-1,cell*0.78-4*s-1,4*s); c.stroke();
        }
        /* 実の絵 */
        const tmp = Game._dexCache || (Game._dexCache={});
        if (!tmp[v]){ const cv=mkCv(24,24); drawTomato(ctxOf(cv),12,13,7.5,V,3,{}); tmp[v]=cv; }
        c.save(); c.imageSmoothingEnabled=false;
        if (!d){ c.globalAlpha=0.18; }
        c.drawImage(tmp[v], cx+(cell-4*s)/2-9*s, cy+3*s, 18*s,18*s);
        c.restore();
        txt(c, d? V.name : '？？？', cx+(cell-4*s)/2, cy+cell*0.78-14*s, 7.5*s, d?COL.text:'#5c6788','center');
        if (d) txt(c, starStr(d.bestQ)||'並', cx+(cell-4*s)/2, cy+cell*0.78-7*s, 6.5*s, QUALITY[d.bestQ].color,'center');
      }
      /* 説明 */
      const v=VARIETY_LIST[this.i], V=VARIETIES[v], d=S.dex[v];
      const dy=by+bh-56*s;
      c.fillStyle='rgba(255,255,255,0.85)'; rr(c,bx+8*s,dy,bw-16*s,48*s,4*s); c.fill();
      c.strokeStyle='rgba(150,170,200,0.5)'; c.lineWidth=1; rr(c,bx+8*s+0.5,dy+0.5,bw-16*s-1,48*s-1,4*s); c.stroke();
      if (d){
        txt(c,V.name+'　（第'+V.tier+'階梯）',bx+14*s,dy+4*s,9.5*s,COL.text,'left',true);
        txt(c,V.desc,bx+14*s,dy+15*s,8*s,COL.dim);
        txt(c,'「'+V.lore+'」',bx+14*s,dy+25*s,7.5*s,COL.blue);
        txt(c,'収穫 '+d.n+'回　最高 '+starStr(d.bestQ)+'　最大 '+d.bestSize.toFixed(2)+'　最高糖度 '+d.bestSugar.toFixed(0),
            bx+14*s,dy+36*s,7.5*s,COL.gold);
        txt(c,'育つ季：'+V.seasons.map(sd=>SEASON_BY_ID[sd].name).join('・')+'　'+V.growDays+'日'+(V.regrow?'（'+V.regrow+'日ごとに再収穫）':''),
            bx+bw-14*s,dy+36*s,7.5*s,COL.green,'right');
      } else {
        txt(c,'？？？',bx+14*s,dy+4*s,9.5*s,'#6a769a','left',true);
        const hint = V.mutantOnly? '宇宙線を浴びた株から、まれに生まれるという。'
                   : V.crossOnly? '帳面の最後のページに書かれている。'
                   : '交配で生まれる品種。組み合わせを探すこと。';
        txt(c, hint, bx+14*s,dy+18*s,8*s,'#6a769a');
      }
      txt(c,'←→↑↓でえらぶ　X でとじる', bx+bw-12*s, by+bh-10*s, 7.5*s, COL.dim,'right');
    },
  };
  uiPush(u);
}
function varietyDetail(v){
  const V=VARIETIES[v], d=S.dex[v];
  let t = V.name+'（Tier'+V.tier+'）\n'+V.desc+'\n\n'+
    '育つ季：'+V.seasons.map(sd=>SEASON_BY_ID[sd].name).join('・')+
    '\n育つ日数：'+V.growDays+'日'+(V.regrow?'（収穫後'+V.regrow+'日でまた実る）':'')+
    '\n基本の値：'+V.base+'c　糖度'+V.sugar+'　大きさ'+V.size;
  if (V.lowG) t+='\n低重力で実がさらに大きくなる。';
  if (V.highG) t+='\n高重力で糖度がさらに上がる。';
  if (V.cold) t+='\n霜季でも凍らない。';
  if (V.dark_ok) t+='\n光が無くても育つ。';
  if (V.storm) t+='\n砂嵐・隕石雨に強い。';
  if (V.flare==='love') t+='\nフレアを浴びると一段育つ。';
  if (d) t+='\n\n収穫'+d.n+'回　最高'+(starStr(d.bestQ)||'並');
  dialogSeq([{who:'', text:t}]);
}

/* ------------------------------------------------------------ 依頼 */
function openQuests(){
  const items = S.quests.map((q,i)=>{
    const have = invCount(q.id);
    const ok = !q.done && have>=q.n;
    return {
      icon:q.id,
      label:(q.done?'【済】':'')+q.text,
      sub:NPCS[q.by].name+'より　手持ち '+have+'/'+q.n,
      right:q.pay+'c',
      disabled:!ok,
      color:q.done?'#6a769a':undefined,
      act:()=>{
        if (!ok){ SFX.no(); return; }
        invTake(q.id,q.n);
        S.credits+=q.pay; q.done=true;
        npcGain(q.by, 18);
        SFX.coin(); uiPop();
        dialogSeq([{who:NPCS[q.by].name, text:'たしかに受け取りました。\n'+q.pay+'クレジット、どうぞ。'}]);
      },
    };
  });
  if (!items.length) items.push({label:'いまは依頼が無い', disabled:true});
  listMenu({ title:'依頼ボード（毎朝入れ替わる）', items:items, w:270, rows:5, accent:COL.blue,
    footer:'品物を持って選ぶと納品できる。' });
}

/* ------------------------------------------------------------ 朝の報告 */
function showMorning(){
  const s0=seasonNow();
  const lines=[];
  lines.push('第'+S.year+'年　'+s0.name+' '+S.day+'日目');
  lines.push('天候：'+WEATHERS[S.weather].name+'　—　'+WEATHERS[S.weather].note);
  if (S.log && S.log.length) lines.push('');
  for (const l of S.log) lines.push('・'+l);
  let ripe=0;
  for (const k in S.crops) if (cropStage(S.crops[k])===4 && !S.crops[k].dead) ripe++;
  lines.push('');
  lines.push('実っている株：'+ripe+'　　所持：'+S.credits.toLocaleString()+'c');
  if (S.tomorrowWeather) lines.push('明日の予報：'+WEATHERS[S.tomorrowWeather].name);

  uiPush({
    kind:'morning', t:0,
    key(k){ if (k==='act'||k==='cancel') uiPop(); },
    draw(c){
      const s=R.s,W=R.W,H=R.H;
      const bw=Math.min(W-20*s,250*s);
      /* 枠の幅で折り返す（大きさが変わったときだけ計算しなおす） */
      if (this.wrapW !== bw){ this.wrapW = bw; this.wrapped = wrapJP(c, lines.join('\n'), bw-24*s, 9*s).split('\n'); }
      const ls = this.wrapped;
      const bh=Math.min(H-20*s, ls.length*12.5*s+40*s);
      const bx=(W-bw)/2, by=(H-bh)/2;
      c.fillStyle='rgba(12,20,44,0.42)'; c.fillRect(0,0,W,H);
      panel(c,bx,by,bw,bh,'おはよう',COL.gold);
      tapZone(this, bx,by,bw,bh, ()=>this.key('act'));
      txtLines(c,ls.join('\n'),bx+12*s,by+24*s,9*s,COL.text,12.5*s);
      txt(c,'Z でとじる',bx+bw-12*s,by+bh-14*s,8*s,COL.dim,'right');
    },
  });
}

/* ------------------------------------------------------------ 遊びかた */
function openHelp(){
  const lines = [
    '【うごく】方向キー / WASD　　【はやく】Shift',
    '【つかう・話す】Z または スペース',
    '【やめる・とじる】X または Esc',
    '【道具をかえる】Tab / Q・E / 数字キー 1〜0',
    '【もちもの】I　【図鑑】P　【依頼】J　【こよみ】…家のカレンダー',
    '【音】F でオン・オフ',
    '',
    '◆ はじめの流れ',
    '1. 家を出て、クワで畑を耕す（第1農場）',
    '2. 種を持って、耕した土にまく',
    '3. 水タンクでじょうろに水を汲み、毎日水をやる',
    '4. 実ったら Z で収穫。出荷箱に入れれば翌朝おかねになる',
    '5. 夜は家のベッドで寝る（Z）。寝ないと26時に倒れる',
    '',
    '◆ 宇宙ならでは',
    '・重力コンソールで畑の重力を変えられる（大きさ↔糖度）',
    '・恒星フレアの日は作物が変異する（青い品種の入り口）',
    '・軌道季（陽・嵐・霜・影）で育つ品種が変わる',
    '・坑道で鉄くずを掘って、工房で設備を強くする',
    '・交配ラボで品種を掛け合わせ、最後の「ギャラクシア」を目指す',
  ];
  uiPush({
    kind:'help',
    key(k){ if (k==='act'||k==='cancel') uiPop(); },
    draw(c){
      const s=R.s,W=R.W,H=R.H;
      const bw=Math.min(W-12*s,290*s), bh=Math.min(H-12*s, lines.length*11.5*s+34*s);
      const bx=(W-bw)/2, by=(H-bh)/2;
      c.fillStyle='rgba(12,20,44,0.5)'; c.fillRect(0,0,W,H);
      panel(c,bx,by,bw,bh,'あそびかた',COL.blue);
      tapZone(this, bx,by,bw,bh, ()=>this.key('act'));
      txtLines(c,lines.join('\n'),bx+12*s,by+22*s,8.5*s,COL.text,11.5*s);
      txt(c,'X でとじる',bx+bw-12*s,by+bh-13*s,8*s,COL.dim,'right');
    },
  });
}

/* ------------------------------------------------------------ 設定 */
function openSystem(){
  listMenu({ title:'メニュー', w:180, rows:8, accent:COL.purple, items:[
    {label:'もちもの', act:()=>{ uiPop(); openBag(); }},
    {label:'トマト図鑑', act:()=>{ uiPop(); openDex(); }},
    {label:'依頼ボード', act:()=>{ uiPop(); openQuests(); }},
    {label:'こよみ・農場の記録', act:()=>{ uiPop(); openCalendar(); }},
    {label:'あそびかた', act:()=>{ uiPop(); openHelp(); }},
    {label:(Audio_.musicOn?'音楽を止める':'音楽を鳴らす'), act:()=>{ musicSetOn(!Audio_.musicOn); uiPop(); openSystem(); }},
    {label:'いまの状態を保存する', act:()=>{ saveGame(); SFX.ok(); toast('保存した。'); uiPop(); }},
    {label:'タイトルへ戻る（保存してから）', color:COL.red, act:()=>{
      saveGame(); uiPop();
      confirmBox('タイトルへ戻る？（保存済み）', ()=>{ uiClear(); Game.mode='title'; Game.titleSel=0; musicStop(); });
    }},
  ]});
}
