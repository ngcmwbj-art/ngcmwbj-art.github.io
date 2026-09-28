/* =========================================================================
   10_art.js  —  ドット絵はすべてコードで描く（外部画像ゼロ）
   ========================================================================= */

function mkCv(w,h){
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  return c;
}
function ctxOf(c){ const x=c.getContext('2d'); x.imageSmoothingEnabled=false; return x; }

/* 決まった見た目を作るためのハッシュ（同じ座標なら毎回同じ模様） */
function hash2(x,y,s){
  let h = (x|0)*374761393 + (y|0)*668265263 + (s|0)*1442695040;
  h = (h ^ (h>>13)) * 1274126177;
  h = h ^ (h>>16);
  return ((h>>>0) % 100000) / 100000;
}
function shade(hex, amt){
  const n = parseInt(hex.slice(1),16);
  let r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  r=Math.max(0,Math.min(255,Math.round(r+amt)));
  g=Math.max(0,Math.min(255,Math.round(g+amt)));
  b=Math.max(0,Math.min(255,Math.round(b+amt)));
  return '#'+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0');
}
function mix(a,b,t){
  const na=parseInt(a.slice(1),16), nb=parseInt(b.slice(1),16);
  const r=Math.round(((na>>16)&255)*(1-t)+((nb>>16)&255)*t);
  const g=Math.round(((na>>8)&255)*(1-t)+((nb>>8)&255)*t);
  const bl=Math.round((na&255)*(1-t)+(nb&255)*t);
  return '#'+((r<<16)|(g<<8)|bl).toString(16).padStart(6,'0');
}
function px(c,x,y,w,h,col){ c.fillStyle=col; c.fillRect(x|0,y|0,w|0,h|0); }

/* =======================================================  タイル・アトラス */
const TILES = {};   // TILES[name] = [canvas, canvas, ...] 4種のばらつき

function bakeTiles(){
  const V = 4;
  function bake(name, fn){
    TILES[name] = [];
    for (let v=0; v<V; v++){
      const c = mkCv(TILE,TILE), g = ctxOf(c);
      fn(g, v);
      TILES[name].push(c);
    }
  }

  /* レゴリス（小惑星の地面） */
  bake('rego', (g,v)=>{
    px(g,0,0,TILE,TILE,'#8a6b51');
    for (let y=0;y<TILE;y++) for (let x=0;x<TILE;x++){
      const n = hash2(x+v*31,y+v*17,1);
      if (n>0.82) px(g,x,y,1,1,'#9b7c5f');
      else if (n<0.16) px(g,x,y,1,1,'#77593f');
    }
    for (let i=0;i<3;i++){
      const n1=hash2(i,v,7), n2=hash2(i,v,9);
      px(g,(n1*14)|0,(n2*14)|0,2,1,'#6b4f38');
    }
  });

  /* モス（コケ・緑化したところ） */
  bake('moss', (g,v)=>{
    px(g,0,0,TILE,TILE,'#4e7a4a');
    for (let y=0;y<TILE;y++) for (let x=0;x<TILE;x++){
      const n = hash2(x+v*13,y+v*29,3);
      if (n>0.80) px(g,x,y,1,1,'#5f9155');
      else if (n<0.18) px(g,x,y,1,1,'#3f6640');
      if (n>0.965) px(g,x,y-1,1,2,'#76a95f');
    }
  });

  /* 金属デッキ */
  bake('deck', (g,v)=>{
    px(g,0,0,TILE,TILE,'#5a6274');
    px(g,0,0,TILE,1,'#6e7688');
    px(g,0,TILE-1,TILE,1,'#454c5c');
    px(g,0,0,1,TILE,'#6a7284');
    px(g,TILE-1,0,1,TILE,'#474e5e');
    for (let i=0;i<4;i++){
      const n=hash2(i,v,11);
      px(g,(n*12+2)|0,(hash2(i,v,12)*12+2)|0,1,1,'#6f7789');
    }
    px(g,3,3,2,2,'#3f4655'); px(g,TILE-5,TILE-5,2,2,'#3f4655');
  });

  /* 未耕作の畑土（ふかふかの黒土。耕せる場所の目印に、小さな草がある） */
  bake('soil', (g,v)=>{
    px(g,0,0,TILE,TILE,'#5e4430');
    for (let y=0;y<TILE;y++) for (let x=0;x<TILE;x++){
      const n = hash2(x+v*7,y+v*23,5);
      if (n>0.84) px(g,x,y,1,1,'#6d5039');
      else if (n<0.15) px(g,x,y,1,1,'#4c3626');
    }
    if (v%2===0){
      const gx=(hash2(0,v,61)*11+3)|0, gy=(hash2(0,v,62)*10+4)|0;
      px(g,gx,gy,1,3,'#557f46'); px(g,gx+1,gy+1,1,2,'#61914f');
    }
    px(g,0,0,TILE,1,'rgba(0,0,0,0.12)');
  });

  /* 耕した土（畝） */
  bake('till', (g,v)=>{
    px(g,0,0,TILE,TILE,'#5d4130');
    for (let r=0;r<TILE;r+=4){
      px(g,0,r,TILE,2,'#6f4f3a');
      px(g,0,r+2,TILE,1,'#4b3427');
    }
    for (let i=0;i<8;i++){
      const n=hash2(i,v,15);
      px(g,(n*15)|0,(hash2(i,v,16)*15)|0,1,1,'#7a5842');
    }
  });

  /* 水をやった土 */
  bake('wet', (g,v)=>{
    px(g,0,0,TILE,TILE,'#3d2b20');
    for (let r=0;r<TILE;r+=4){
      px(g,0,r,TILE,2,'#4a3428');
      px(g,0,r+2,TILE,1,'#2e2018');
    }
    for (let i=0;i<7;i++){
      const n=hash2(i,v,17);
      px(g,(n*14)|0,(hash2(i,v,18)*14)|0,2,1,'#5b7d8f');
    }
  });

  /* 岩壁 */
  bake('wall', (g,v)=>{
    px(g,0,0,TILE,TILE,'#4d4a52');
    px(g,0,0,TILE,3,'#635f6b');
    for (let y=0;y<TILE;y++) for (let x=0;x<TILE;x++){
      const n=hash2(x+v*5,y+v*11,19);
      if (n>0.86) px(g,x,y,1,1,'#5b5762');
      else if (n<0.13) px(g,x,y,1,1,'#3c3942');
    }
    px(g,0,TILE-2,TILE,2,'#2f2d35');
  });

  /* 坑道の壁（暗く、鉱脈がひかる） */
  bake('mwall', (g,v)=>{
    px(g,0,0,TILE,TILE,'#33303b');
    px(g,0,0,TILE,3,'#43404d');
    for (let y=0;y<TILE;y++) for (let x=0;x<TILE;x++){
      const n=hash2(x+v*9,y+v*3,21);
      if (n>0.88) px(g,x,y,1,1,'#3f3c48');
      else if (n<0.10) px(g,x,y,1,1,'#26242d');
    }
    /* まれに鉱脈が光る */
    if (v===1){
      px(g,4,6,2,1,'#4f8aa8'); px(g,5,7,1,1,'#7fd4ff'); px(g,6,7,2,1,'#4f8aa8');
    } else if (v===3){
      px(g,10,11,1,2,'#4f8aa8'); px(g,11,12,2,1,'#7fd4ff');
    }
  });

  /* 坑道の床（壁とはっきり見分けがつくよう明るく） */
  bake('mfloor', (g,v)=>{
    px(g,0,0,TILE,TILE,'#6e6878');
    for (let y=0;y<TILE;y++) for (let x=0;x<TILE;x++){
      const n=hash2(x+v*21,y+v*13,23);
      if (n>0.82) px(g,x,y,1,1,'#7d7688');
      else if (n<0.20) px(g,x,y,1,1,'#5c5666');
    }
    for (let i=0;i<4;i++){
      const gx=(hash2(i,v,81)*14)|0, gy=(hash2(i,v,82)*14)|0;
      px(g,gx,gy,2,1,'#87808f');
    }
    px(g,0,0,TILE,1,'rgba(255,255,255,0.05)');
  });

  /* 木の床（家の中） */
  bake('wood', (g,v)=>{
    px(g,0,0,TILE,TILE,'#8a6240');
    for (let r=0;r<TILE;r+=5){ px(g,0,r,TILE,1,'#6f4d31'); }
    for (let i=0;i<5;i++){
      const n=hash2(i,v,25);
      px(g,(n*14)|0,(hash2(i,v,26)*14)|0,3,1,'#966d49');
    }
  });

  /* 温室のガラス床（白タイル） */
  bake('gfloor', (g,v)=>{
    px(g,0,0,TILE,TILE,'#c9d4cf');
    px(g,0,0,TILE,1,'#dde6e1'); px(g,0,TILE-1,TILE,1,'#aab5b0');
    px(g,0,0,1,TILE,'#d8e1dc'); px(g,TILE-1,0,1,TILE,'#adb8b3');
    if (v%2) px(g,6,6,4,4,'#bcc7c2');
  });

  /* 通路の標示（黄色い斜線） */
  bake('deckl', (g,v)=>{
    px(g,0,0,TILE,TILE,'#4e576b');
    px(g,0,0,TILE,1,'#626a7e'); px(g,0,TILE-1,TILE,1,'#3c4354');
    g.save(); g.beginPath(); g.rect(0,0,TILE,TILE); g.clip();
    g.strokeStyle='rgba(212,170,60,0.55)'; g.lineWidth=3;
    for (let i=-TILE;i<TILE*2;i+=8){
      g.beginPath(); g.moveTo(i,TILE); g.lineTo(i+TILE,0); g.stroke();
    }
    g.restore();
    px(g,0,0,1,TILE,'#5b6376'); px(g,TILE-1,0,1,TILE,'#3f4657');
  });

  /* 道（踏み固めた路） */
  bake('path', (g,v)=>{
    px(g,0,0,TILE,TILE,'#a08863');
    for (let y=0;y<TILE;y++) for (let x=0;x<TILE;x++){
      const n=hash2(x+v*17,y+v*19,27);
      if (n>0.86) px(g,x,y,1,1,'#b09571');
      else if (n<0.15) px(g,x,y,1,1,'#8d7757');
    }
  });
}

/* ===========================================================  宇宙の背景 */
function makeSky(w,h,season,seed){
  const c = mkCv(w,h), g = ctxOf(c);
  const S = SEASONS[season];
  const grd = g.createLinearGradient(0,0,0,h);
  grd.addColorStop(0,S.sky[0]); grd.addColorStop(0.55,S.sky[1]); grd.addColorStop(1,S.sky[2]);
  g.fillStyle = grd; g.fillRect(0,0,w,h);

  /* 星雲 */
  for (let i=0;i<26;i++){
    const nx = hash2(i,seed,31)*w, ny = hash2(i,seed,32)*h*0.8;
    const r  = 10+hash2(i,seed,33)*40;
    const col = ['rgba(120,90,200,0.055)','rgba(200,90,150,0.05)','rgba(90,160,220,0.055)'][i%3];
    const rg = g.createRadialGradient(nx,ny,0,nx,ny,r);
    rg.addColorStop(0,col); rg.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=rg; g.beginPath(); g.arc(nx,ny,r,0,6.2832); g.fill();
  }
  /* 星 */
  for (let i=0;i<220;i++){
    const sx=(hash2(i,seed,41)*w)|0, sy=(hash2(i,seed,42)*h)|0;
    const b = hash2(i,seed,43);
    const a = 0.25+b*0.75;
    px(g,sx,sy,1,1,`rgba(255,255,255,${a.toFixed(2)})`);
    if (b>0.965){
      px(g,sx-1,sy,3,1,`rgba(200,225,255,${(a*0.5).toFixed(2)})`);
      px(g,sx,sy-1,1,3,`rgba(200,225,255,${(a*0.5).toFixed(2)})`);
    }
  }
  /* ガスの巨人（影季は大きく近い） */
  const big = season===3;
  const pr = big? h*0.85 : h*0.38;
  const pcx = big? w*0.78 : w*0.80, pcy = big? h*0.30 : h*0.14;
  const pg = g.createRadialGradient(pcx-pr*0.3,pcy-pr*0.3,pr*0.1,pcx,pcy,pr);
  if (big){ pg.addColorStop(0,'#5a4a7a'); pg.addColorStop(0.7,'#2d2544'); pg.addColorStop(1,'#14101f'); }
  else    { pg.addColorStop(0,'#e0b27a'); pg.addColorStop(0.6,'#b5854f'); pg.addColorStop(1,'#6d4c2c'); }
  g.fillStyle=pg; g.beginPath(); g.arc(pcx,pcy,pr,0,6.2832); g.fill();
  /* 帯 */
  g.save(); g.beginPath(); g.arc(pcx,pcy,pr,0,6.2832); g.clip();
  for (let i=0;i<9;i++){
    const yy = pcy-pr + (i+0.5)*(pr*2/9);
    g.fillStyle = big? `rgba(255,255,255,${0.02+ (i%2)*0.02})` : `rgba(90,60,30,${0.10+(i%2)*0.09})`;
    g.fillRect(pcx-pr, yy-pr*0.06, pr*2, pr*0.12);
  }
  g.restore();
  /* 環 */
  g.save();
  g.translate(pcx,pcy); g.rotate(-0.30); g.scale(1,0.16);
  g.strokeStyle = big? 'rgba(180,170,220,0.30)':'rgba(240,220,190,0.35)';
  g.lineWidth = pr*0.10; g.beginPath(); g.arc(0,0,pr*1.55,0,6.2832); g.stroke();
  g.strokeStyle = big? 'rgba(150,140,200,0.18)':'rgba(220,200,170,0.20)';
  g.lineWidth = pr*0.05; g.beginPath(); g.arc(0,0,pr*1.80,0,6.2832); g.stroke();
  g.restore();
  return c;
}

/* ===========================================================  トマトの株 */
/* cx,cy = タイルの中心の下端（足元）。size は実の大きさ倍率 */
function drawPlant(g, cx, by, vid, stage, size, opt){
  opt = opt||{};
  const V = VARIETIES[vid] || VARIETIES.akahoshi;
  const seed = opt.seed||0;
  const leaf = opt.dead? '#8a7a5c' : V.leaf;
  const leafD = shade(leaf,-28);
  const stem = opt.dead? '#7a6a4e' : shade(V.leaf,-18);

  if (opt.fallen){ g.save(); g.translate(cx,by); g.rotate(0.62); g.translate(-cx,-by); }

  if (stage<=0){
    px(g,cx-1,by-2,3,2,'#3b2a1e');
    px(g,cx,by-3,1,1,shade(V.fruit,-40));
  } else if (stage===1){
    px(g,cx,by-4,1,4,stem);
    px(g,cx-3,by-4,3,2,leaf); px(g,cx+1,by-5,3,2,leaf);
    px(g,cx-3,by-3,2,1,leafD);
  } else if (stage===2){
    px(g,cx,by-8,1,8,stem);
    px(g,cx-4,by-5,4,2,leaf); px(g,cx+1,by-7,4,2,leaf);
    px(g,cx-4,by-4,3,1,leafD); px(g,cx+2,by-6,3,1,leafD);
    px(g,cx-3,by-8,3,2,leaf); px(g,cx+1,by-9,2,2,leaf);
  } else {
    /* 3=開花 / 4=収穫可 */
    const H = 12 + (stage===4?2:0);
    px(g,cx,by-H,1,H,stem);
    px(g,cx-1,by-H+2,1,4,stem);
    /* 葉 */
    const lv = [[-5,-6,5,2],[2,-8,5,2],[-5,-11,4,2],[2,-13,4,2],[-4,-3,4,2]];
    for (let i=0;i<lv.length;i++){
      const L=lv[i];
      px(g,cx+L[0],by+L[1],L[2],L[3],leaf);
      px(g,cx+L[0],by+L[1]+L[3]-1,L[2]-1,1,leafD);
    }
    if (stage===3){
      /* 花 */
      const fl=[[-3,-9],[3,-12],[0,-14]];
      for (const f of fl){
        px(g,cx+f[0],by+f[1],2,2,'#ffe066');
        px(g,cx+f[0]+1,by+f[1]+1,1,1,'#f0a52a');
      }
    } else {
      /* 実（大きく育つほど、間隔もひらく） */
      const n = Math.max(1, Math.min(4, V.yield||1));
      const r = Math.max(2, Math.min(5.4, 2.5*size*(V.size||1)));
      const sp = 0.75 + r*0.16;
      const pos = [[-2.6,-6.2],[2.6,-9.6],[-1.6,-12.4],[3.4,-4.6]];
      for (let i=0;i<n;i++){
        const p = pos[i]; if (!p) break;
        const fx = cx + p[0]*sp, fy = by + p[1] - (r-2.5)*0.9;
        drawTomato(g, fx, fy, r, V, seed+i, opt);
      }
    }
  }
  if (opt.fallen) g.restore();
}

function drawTomato(g, fx, fy, r, V, seed, opt){
  opt = opt||{};
  let main = V.fruit, hi = V.fruit2, dk = V.dark;
  if (opt.dead){ main='#7c6a52'; hi='#93805f'; dk='#5c4d3b'; }
  if (V.rainbow && !opt.dead){
    const t = ((seed*7)%5)/5;
    main = ['#ff6b8a','#ffc861','#7be58f','#6fb4ff','#c98bff'][((seed*3)|0)%5];
    hi = mix(main,'#ffffff',0.45); dk = shade(main,-60);
  }
  if (V.glow && !opt.dead){
    g.save(); g.globalAlpha=0.22; g.fillStyle=V.glow;
    g.beginPath(); g.arc(fx,fy,r+2.5,0,6.2832); g.fill(); g.restore();
  }
  /* 丸い実（ドット風に階段状で） */
  g.fillStyle = main;
  g.beginPath(); g.arc(fx,fy,r,0,6.2832); g.fill();
  g.fillStyle = dk;
  g.beginPath(); g.arc(fx+r*0.28,fy+r*0.30,r*0.75,0,6.2832); g.fill();
  g.fillStyle = main;
  g.beginPath(); g.arc(fx-r*0.05,fy-r*0.05,r*0.86,0,6.2832); g.fill();
  if (V.striped){
    g.save(); g.beginPath(); g.arc(fx,fy,r,0,6.2832); g.clip();
    g.fillStyle = V.fruit2;
    for (let i=-1;i<=1;i++) g.fillRect(fx-r+ (i+1)*(r*0.66), fy-r*1.1, Math.max(1,r*0.22), r*2.2);
    g.restore();
  }
  /* つや */
  if (r<=4){
    px(g, Math.round(fx-r*0.55), Math.round(fy-r*0.62), Math.max(1,Math.round(r*0.45)), Math.max(1,Math.round(r*0.4)), hi);
  } else {
    g.save(); g.globalAlpha=0.9; g.fillStyle=hi;
    g.beginPath(); g.ellipse(fx-r*0.38, fy-r*0.44, r*0.30, r*0.20, -0.5, 0, 6.2832); g.fill();
    g.globalAlpha=0.45;
    g.beginPath(); g.ellipse(fx-r*0.52, fy-r*0.10, r*0.12, r*0.26, -0.25, 0, 6.2832); g.fill();
    g.restore();
  }
  /* ヘタ（大きさに応じて葉が開く） */
  const lc = V.leaf, ld = shade(V.leaf,-22);
  if (r<=4){
    px(g, Math.round(fx-1), Math.round(fy-r-1), 2, 2, lc);
    px(g, Math.round(fx-r*0.7), Math.round(fy-r), Math.max(1,Math.round(r*0.5)), 1, ld);
    px(g, Math.round(fx+r*0.2), Math.round(fy-r), Math.max(1,Math.round(r*0.5)), 1, ld);
  } else {
    g.save(); g.translate(fx, fy-r*0.90);
    for (let i=0;i<5;i++){
      const a = -Math.PI/2 + (i-2)*0.62;
      g.save(); g.rotate(a+Math.PI/2);
      g.fillStyle = (i%2)? lc : ld;
      g.beginPath(); g.ellipse(0, -r*0.24, r*0.10, r*0.32, 0, 0, 6.2832); g.fill();
      g.restore();
    }
    g.fillStyle = ld;
    g.beginPath(); g.ellipse(0,0,r*0.16,r*0.12,0,0,6.2832); g.fill();
    g.fillStyle = shade(V.leaf,-6);
    g.fillRect(-Math.max(1,r*0.07), -r*0.42, Math.max(1,r*0.14), r*0.30);
    g.restore();
  }
}

/* ===========================================================  プレイヤー */
/* dir: 0=下 1=左 2=右 3=上 */
function drawPlayer(g, x, y, dir, frame, act, actT){
  const SUIT='#e9ebf2', SUIT_D='#b9bfd0', RED='#e5372f', SKIN='#f0bd93',
        HAIR='#33241f', VIS='#2c3d72', VIS_H='#7fa8e8', BOOT='#4a5470', BELT='#6b7490';
  const bob = (frame===1||frame===3)?0:(frame===2?1:0);
  const step = frame;
  g.save();
  g.translate(Math.round(x), Math.round(y));

  /* 影 */
  g.fillStyle='rgba(0,0,0,0.28)';
  g.beginPath(); g.ellipse(0,0,6,2.4,0,0,6.2832); g.fill();

  const T = -22 + bob;   // 頭のてっぺん
  /* 脚 */
  const la = (step===1)? -1 : (step===3? 1 : 0);
  px(g,-4, -7+ (la>0?1:0), 3, 7, BOOT);
  px(g, 1, -7+ (la<0?1:0), 3, 7, BOOT);
  px(g,-4, -1, 3, 1, '#333a4d'); px(g,1,-1,3,1,'#333a4d');
  /* 胴 */
  px(g,-5, T+9, 10, 10, SUIT);
  px(g,-5, T+9, 10, 1, '#fdfdff');
  px(g,-5, T+17, 10, 2, SUIT_D);
  px(g,-5, T+14, 10, 2, BELT);
  /* トマトの紋章 */
  px(g,-2, T+11, 4, 3, RED);
  px(g,-1, T+10, 2, 1, '#4f9e42');
  /* 腕 */
  let armY = T+10;
  let swing = 0;
  if (act) swing = Math.sin(actT*Math.PI)* (act==='water'? 0.5 : 1.0);
  if (dir===1){ px(g,-7, armY+(step===1?-1:0), 3, 7, SUIT); }
  else if (dir===2){ px(g, 4, armY+(step===1?-1:0), 3, 7, SUIT); }
  else { px(g,-7, armY, 3, 7, SUIT); px(g, 4, armY, 3, 7, SUIT); }

  /* 首 */
  px(g,-2, T+7, 4, 2, SUIT_D);
  /* ヘルメット */
  px(g,-6, T, 12, 8, SUIT);
  px(g,-6, T, 12, 1, '#ffffff');
  px(g,-7, T+2, 1, 4, SUIT_D); px(g, 6, T+2, 1, 4, SUIT_D);
  px(g,-6, T+8, 12, 1, SUIT_D);
  /* バイザー / 顔 */
  if (dir===3){
    px(g,-5, T+2, 10, 5, mix(VIS,'#000000',0.25));
    px(g,-4, T+3, 3, 1, 'rgba(255,255,255,0.20)');
  } else if (dir===0){
    px(g,-5, T+2, 10, 5, VIS);
    px(g,-4, T+3, 3, 2, VIS_H);
    /* 顔（バイザー越し） */
    px(g,-3, T+4, 6, 3, mix(SKIN,VIS,0.45));
    px(g,-2, T+5, 1, 1, '#1b1b26'); px(g, 1, T+5, 1, 1, '#1b1b26');
    px(g,-4, T+2, 8, 1, HAIR);
  } else {
    const s = dir===1? -1: 1;
    px(g, s<0?-5:0, T+2, 5, 5, VIS);
    px(g, s<0?-4:1, T+3, 2, 2, VIS_H);
    px(g, s<0?-3:1, T+4, 2, 2, mix(SKIN,VIS,0.45));
    px(g,-4, T+2, 8, 1, HAIR);
  }
  /* 背中のタンク（下向き以外で見える） */
  if (dir===3){ px(g,-4,T+9,8,6,'#9aa3bb'); px(g,-3,T+10,2,4,'#c8cfe0'); }

  /* 道具 */
  if (act){
    const s = dir===1? -1 : 1;
    const ox = dir===1? -8 : (dir===2? 8 : 0);
    g.save();
    if (dir===0 || dir===3){ g.translate(6, T+12); g.rotate(-0.9+swing*1.5); }
    else { g.translate(ox, T+12); g.rotate(s*(-0.6+swing*1.6)); }
    if (act==='hoe'){ px(g,0,-1,2,11,'#9c6b3f'); px(g,-3,9,6,3,'#b9c0d0'); }
    else if (act==='pick'){ px(g,0,-1,2,11,'#7d5636'); px(g,-5,9,11,2,'#cfd6e6'); px(g,-5,8,2,3,'#a9b1c4'); px(g,3,8,2,3,'#a9b1c4'); }
    else if (act==='sickle'){ px(g,0,0,2,8,'#9c6b3f'); px(g,-4,7,7,2,'#c8d0e0'); }
    else if (act==='water'){
      px(g,-1,2,8,6,'#7fb2d9'); px(g,5,0,2,4,'#9ccbe8'); px(g,-4,3,4,2,'#6a9cc0');
      if (actT>0.3){
        for (let i=0;i<5;i++){
          const t=(actT-0.3)*1.4 + i*0.12;
          px(g, 8+ i*2, 4+ i*i*1.2, 1, 2, 'rgba(140,200,240,0.9)');
        }
      }
    }
    g.restore();
  }
  g.restore();
}

/* ===========================================================  住民 */
function drawNPC(g, id, x, y, t, dir){
  g.save(); g.translate(Math.round(x), Math.round(y));
  g.fillStyle='rgba(0,0,0,0.26)';
  g.beginPath(); g.ellipse(0,0,6,2.3,0,0,6.2832); g.fill();
  const bob = Math.round(Math.sin(t*2.0)*0.6);

  if (id==='obaba'){
    /* ホログラムのおばあさん（半透明・走査線） */
    g.globalAlpha = 0.82;
    const C='#8fe6ff', D='#4fb9e0';
    px(g,-5,-20+bob,10,7,C);              // 頭（丸髷）
    px(g,-6,-21+bob,12,3,mix(C,'#ffffff',0.4));
    px(g,-3,-16+bob,1,1,'#0a2b3a'); px(g,2,-16+bob,1,1,'#0a2b3a');
    px(g,-2,-14+bob,4,1,D);
    px(g,-6,-13+bob,12,11,C);             // 着物
    px(g,-6,-9+bob,12,2,D);
    px(g,-1,-13+bob,2,11,mix(C,'#ffffff',0.3));
    px(g,-8,-12+bob,2,7,C); px(g,6,-12+bob,2,7,C);
    px(g,-5,-2+bob,10,2,D);
    g.globalAlpha=1;
    /* 走査線 */
    for (let yy=-22; yy<0; yy+=3){
      px(g,-8,yy+((t*9)|0)%3,16,1,'rgba(180,240,255,0.16)');
    }
    /* 台座の光 */
    g.fillStyle='rgba(143,230,255,0.16)';
    g.beginPath(); g.moveTo(-8,0); g.lineTo(8,0); g.lineTo(5,-22); g.lineTo(-5,-22); g.closePath(); g.fill();

  } else if (id==='zax'){
    /* 浮遊する行商ロボ */
    const fy = Math.round(Math.sin(t*1.6)*1.6) - 3;
    const B='#c9a13c', B2='#ffd15c', M='#8d8fa0';
    px(g,-7,-18+fy,14,12,M);
    px(g,-7,-18+fy,14,2,'#b7b9c9');
    px(g,-5,-16+fy,10,6,'#1c2233');
    px(g,-4,-15+fy,3,3,B2); px(g, 1,-15+fy,3,3,B2);   // 目
    px(g,-3,-11+fy,6,1,B);
    px(g,-1,-22+fy,2,4,M); px(g,-2,-24+fy,4,2,'#ff6b52'); // アンテナ
    px(g,-9,-14+fy,2,6,B); px(g, 7,-14+fy,2,6,B);
    px(g,-6,-6+fy,12,4,B);                             // 商品棚
    px(g,-5,-5+fy,3,2,'#e5372f'); px(g,-1,-5+fy,3,2,'#f5b625'); px(g,3,-5+fy,2,2,'#6fd79a');
    /* 推進の光 */
    g.fillStyle='rgba(255,180,90,0.30)';
    g.beginPath(); g.moveTo(-5,-2+fy); g.lineTo(5,-2+fy); g.lineTo(3,0); g.lineTo(-3,0); g.closePath(); g.fill();

  } else if (id==='natsuki'){
    const OV='#3f7a5c', OV2='#7fe0a8', SKIN='#f0bd93', HAIR='#4a2f22';
    px(g,-4,-8+bob,3,8,'#4a5470'); px(g,1,-8+bob,3,8,'#4a5470');
    px(g,-5,-19+bob,10,11,OV);
    px(g,-5,-19+bob,10,2,OV2);
    px(g,-2,-16+bob,4,4,'#d9b25c');       // 胸ポケット
    px(g,-7,-18+bob,2,8,OV); px(g,5,-18+bob,2,8,OV);
    px(g,-4,-26+bob,8,7,SKIN);
    px(g,-5,-27+bob,10,4,HAIR);
    px(g,-5,-24+bob,10,2,'#2b3245');       // ゴーグル
    px(g,-4,-24+bob,3,2,'#8fd6ff'); px(g,1,-24+bob,3,2,'#8fd6ff');
    px(g,-1,-21+bob,2,1,'#b9825f');
    px(g,5,-27+bob,3,5,HAIR);              // ポニーテール

  } else if (id==='luna'){
    const COAT='#eef0f8', HAIR='#c9a6ff', SKIN='#f5cfae';
    px(g,-4,-7+bob,3,7,'#5b6280'); px(g,1,-7+bob,3,7,'#5b6280');
    px(g,-6,-20+bob,12,13,COAT);
    px(g,-6,-20+bob,12,2,'#ffffff');
    px(g,-1,-20+bob,2,13,'#d4d8e8');
    px(g,-5,-16+bob,2,3,'#8fb8ff');        // 胸のペン
    px(g,-8,-19+bob,2,9,COAT); px(g,6,-19+bob,2,9,COAT);
    px(g,-4,-27+bob,8,7,SKIN);
    px(g,-6,-29+bob,12,5,HAIR);
    px(g,-7,-25+bob,2,8,HAIR); px(g,5,-25+bob,2,8,HAIR);
    px(g,-3,-24+bob,2,1,'#3a2b4d'); px(g,1,-24+bob,2,1,'#3a2b4d');
    px(g,-4,-25+bob,9,1,'rgba(255,255,255,0.45)');  // めがね反射

  } else if (id==='toma'){
    /* 宇宙猫（ちいさい） */
    const F='#ffb37a', F2='#ffd6b0', D='#c9834f';
    const sit = Math.sin(t*1.1)>0.2;
    px(g,-5,-8+bob,10,7,F);
    px(g,-5,-6+bob,3,5,F2);
    px(g,-6,-12+bob,8,6,F);
    px(g,-6,-14+bob,2,3,F); px(g,-1,-14+bob,2,3,F);   // 耳
    px(g,-5,-10+bob,1,1,'#2b2028'); px(g,-1,-10+bob,1,1,'#2b2028');
    px(g,-3,-9+bob,2,1,'#e0705c');
    px(g,4,-10+bob,3,2,F);  px(g,6,-13+bob,2,4,F);     // しっぽ
    px(g,-4,-1+bob,2,1,D);  px(g,0,-1+bob,2,1,D);
    /* 小さなヘルメット */
    g.globalAlpha=0.35; g.fillStyle='#b8e4ff';
    g.beginPath(); g.arc(-2,-11+bob,6,0,6.2832); g.fill(); g.globalAlpha=1;
  }
  g.restore();
}

/* ===========================================================  建物・設備 */
function drawHouse(g,x,y,w,h){
  const W='#c6cbd9', W2='#9aa1b5', R='#b8402f', R2='#d9614c';
  px(g,x,y+h-4,w,4,'#4a4553');
  px(g,x+2,y+8,w-4,h-11,W);
  px(g,x+2,y+8,w-4,2,'#e2e6f0');
  for (let i=x+4;i<x+w-4;i+=6) px(g,i,y+12,2,h-16,W2);
  /* 屋根（ドーム） */
  g.fillStyle=R; g.beginPath(); g.ellipse(x+w/2,y+10,w/2,10,0,Math.PI,0); g.fill();
  g.fillStyle=R2; g.beginPath(); g.ellipse(x+w/2-2,y+9,w/2-5,7,0,Math.PI,0); g.fill();
  px(g,x,y+9,w,2,'#8d2f22');
  /* 窓 */
  px(g,x+5,y+14,7,6,'#2e4a72'); px(g,x+6,y+15,3,2,'#7fb2d9');
  px(g,x+w-12,y+14,7,6,'#2e4a72'); px(g,x+w-11,y+15,3,2,'#7fb2d9');
  /* 扉 */
  const dx = x+(w>>1)-5;
  px(g,dx,y+h-14,10,14,'#6d4a2e');
  px(g,dx+1,y+h-13,8,12,'#8a6240');
  px(g,dx+7,y+h-8,1,2,'#d9b25c');
  /* 煙突（換気塔） */
  px(g,x+w-8,y-4,5,10,'#8d94a8'); px(g,x+w-9,y-6,7,2,'#b0b7c9');
  /* トマトの旗 */
  px(g,x+4,y-10,1,12,'#9aa1b5'); px(g,x+5,y-10,7,5,'#e5372f'); px(g,x+7,y-9,2,2,'#4f9e42');
}

function drawGreenhouse(g,x,y,w,h,on){
  px(g,x,y+h-3,w,3,'#4a4553');
  /* ガラスのかまくら */
  g.save();
  g.fillStyle = on? 'rgba(160,220,200,0.45)':'rgba(120,140,150,0.30)';
  g.beginPath(); g.moveTo(x,y+h-3); g.lineTo(x,y+12);
  g.quadraticCurveTo(x+w/2,y-8,x+w,y+12); g.lineTo(x+w,y+h-3); g.closePath(); g.fill();
  g.strokeStyle= on? '#8fd6b8':'#6d7a80'; g.lineWidth=1; g.stroke();
  g.restore();
  for (let i=1;i<5;i++){
    const xx = x + i*(w/5);
    px(g,xx,y+6,1,h-9, on? 'rgba(200,255,235,0.5)':'rgba(140,155,160,0.4)');
  }
  px(g,x,y+16,w,1, on? 'rgba(200,255,235,0.4)':'rgba(140,155,160,0.35)');
  /* 中のうっすら緑 */
  if (on){
    for (let i=0;i<7;i++){
      const gx = x+6+ i*((w-12)/7);
      px(g,gx,y+h-12,2,9,'#4f9e42'); px(g,gx-2,y+h-10,6,2,'#5cae4d');
    }
  }
  /* 扉 */
  const dx=x+(w>>1)-5;
  px(g,dx,y+h-15,10,15,on?'#3f6b58':'#4a5058');
  px(g,dx+1,y+h-14,8,13,on?'#8fd6b8':'#6d7a80');
  if(!on){ px(g,dx+2,y+h-11,6,5,'#2b3038'); px(g,dx+3,y+h-10,4,1,'#d9b25c'); }
}

function drawShed(g,x,y,w,h){
  px(g,x,y+h-3,w,3,'#4a4553');
  px(g,x+1,y+6,w-2,h-9,'#7a6a5c');
  px(g,x+1,y+6,w-2,2,'#94836f');
  for (let i=x+3;i<x+w-3;i+=4) px(g,i,y+9,1,h-13,'#6a5b4e');
  /* 波板屋根 */
  px(g,x-2,y+2,w+4,5,'#8d94a8');
  for (let i=x-2;i<x+w+2;i+=3) px(g,i,y+2,1,5,'#a5acbe');
  px(g,x-2,y+6,w+4,1,'#6a7185');
  /* 煙突と湯気 */
  px(g,x+w-7,y-3,4,6,'#6a5b4e');
  px(g,x+w-7,y-7,2,3,'rgba(255,255,255,0.35)');
  /* 扉 */
  const dx=x+(w>>1)-6;
  px(g,dx,y+h-16,12,16,'#5b4a3a');
  px(g,dx+1,y+h-15,10,14,'#7a6450');
  px(g,dx+2,y+h-12,8,5,'#2b2620');
  px(g,dx+8,y+h-8,1,2,'#d9b25c');
  /* 看板 */
  px(g,x+2,y+9,w-4,5,'#3a3f4d');
  px(g,x+4,y+11,3,1,'#e5372f'); px(g,x+8,y+11,3,1,'#f5b625'); px(g,x+12,y+11,3,1,'#6fd79a');
}

function drawTank(g,x,y){
  px(g,x+1,y+22,14,4,'#4a4553');
  px(g,x+2,y+4,12,20,'#7f8ba0');
  px(g,x+2,y+4,12,2,'#a3aec2');
  px(g,x+3,y+7,10,15,'#3f6f8f');
  /* 水面 */
  px(g,x+3,y+9,10,2,'#7fc4e8');
  px(g,x+4,y+9,3,1,'#d0eeff');
  for (let i=0;i<4;i++) px(g,x+4+i*2,y+13+ (i%2)*3,2,1,'rgba(200,240,255,0.5)');
  px(g,x+2,y+6,12,1,'#5e6b80');
  /* 蛇口 */
  px(g,x+6,y+24,4,3,'#b0b7c9');
  px(g,x+7,y+26,2,2,'#8d94a8');
  /* ラベル */
  px(g,x+4,y+18,8,3,'#e8eaf2'); px(g,x+5,y+19,2,1,'#3f6f8f'); px(g,x+8,y+19,3,1,'#3f6f8f');
}

function drawBin(g,x,y,full){
  px(g,x+1,y+14,14,3,'#4a4553');
  px(g,x+1,y+4,14,12,'#6a5b4e');
  px(g,x+1,y+4,14,2,'#877462');
  px(g,x+2,y+7,12,7,'#4d4238');
  /* 中身 */
  if (full){
    px(g,x+3,y+6,4,3,'#e5372f'); px(g,x+8,y+5,4,3,'#f5b625');
    px(g,x+5,y+4,3,2,'#6fd79a');
  }
  px(g,x+1,y+3,14,2,'#8d94a8');
  /* 出荷マーク */
  px(g,x+5,y+10,6,4,'#d9b25c');
  px(g,x+6,y+11,4,1,'#6a5b4e');
}

function drawConsole(g,x,y,g_idx){
  px(g,x+1,y+18,14,3,'#3f4553');
  px(g,x+2,y+6,12,13,'#5a6274');
  px(g,x+2,y+6,12,2,'#787f92');
  px(g,x+3,y+8,10,7,'#101726');
  /* 重力の目盛り */
  for (let i=0;i<4;i++){
    const on = i<=g_idx;
    px(g,x+4+i*2,y+13-i,1,2+i, on? '#6fe0b0':'#2b3a4a');
  }
  px(g,x+4,y+9,8,1,'#2d4a6b');
  px(g,x+4,y+10,Math.max(1,(g_idx+1)*2),1,'#7fd6ff');
  /* つまみ */
  px(g,x+4+g_idx*2,y+16,2,2,'#ffd15c');
  px(g,x+3,y+17,10,1,'#3f4553');
  /* ポール */
  px(g,x+7,y+1,2,5,'#8d94a8');
  px(g,x+5,y-1,6,2,'#a5acbe');
}

function drawTerminal(g,x,y,on){
  px(g,x+1,y+18,14,3,'#3f4553');
  px(g,x+2,y+2,12,17,'#4d5468');
  px(g,x+3,y+4,10,10, on? '#0f2a3f':'#141822');
  if (on){
    for (let i=0;i<4;i++) px(g,x+4,y+5+i*2, 2+((i*3)%7), 1, ['#7fd6ff','#c9a6ff','#7fe0a8','#ffd15c'][i]);
    px(g,x+9,y+11,3,3,'#c9a6ff');
  }
  px(g,x+3,y+15,10,2,'#39404f');
  for (let i=0;i<5;i++) px(g,x+4+i*2,y+15,1,1,'#6a7185');
}

function drawStall(g,x,y){
  px(g,x,y+20,32,3,'#4a4553');
  /* カウンター */
  px(g,x+2,y+12,28,9,'#7a6450');
  px(g,x+2,y+12,28,2,'#9a8168');
  /* 屋根（縞のオーニング） */
  for (let i=0;i<7;i++) px(g,x+ i*5, y+2, 5, 6, i%2? '#e5372f':'#f5e6d0');
  px(g,x,y+8,35,2,'#b8402f');
  px(g,x+1,y+10,2,11,'#8d94a8'); px(g,x+30,y+10,2,11,'#8d94a8');
  /* 商品 */
  px(g,x+5,y+9,4,3,'#6b4f38'); px(g,x+6,y+8,2,1,'#4f9e42');
  px(g,x+11,y+9,4,3,'#6b4f38'); px(g,x+12,y+8,2,1,'#f5b625');
  px(g,x+17,y+9,4,3,'#6b4f38'); px(g,x+18,y+8,2,1,'#6fd79a');
  px(g,x+23,y+9,5,3,'#8fb8ff');
}

function drawBench(g,x,y){
  px(g,x,y+8,20,3,'#6a5b4e');
  px(g,x,y+6,20,2,'#877462');
  px(g,x+1,y+11,2,4,'#5a6274'); px(g,x+17,y+11,2,4,'#5a6274');
  px(g,x,y+1,20,2,'#877462'); px(g,x+1,y+3,2,3,'#6a5b4e'); px(g,x+17,y+3,2,3,'#6a5b4e');
}

function drawMachine(g,x,y,type,busy,ready,t){
  const base='#5d6478';
  px(g,x+1,y+20,14,3,'#3f4553');
  px(g,x+1,y+6,14,15,base);
  px(g,x+1,y+6,14,2,'#7b8296');
  px(g,x+2,y+9,12,8,'#252b38');
  if (type==='juicer'){
    px(g,x+4,y+10,8,6,'#e5372f'); px(g,x+5,y+9,2,8,'#ff7a63');
    px(g,x+6,y+3,4,4,'#8d94a8');
  } else if (type==='ketchupper'){
    px(g,x+3,y+11,10,5,'#b8402f'); px(g,x+4,y+10,8,1,'#e5624c');
    px(g,x+5,y+3,6,4,'#8d94a8'); px(g,x+7,y+1,2,3,'#a5acbe');
  } else if (type==='dryer'){
    px(g,x+3,y+10,10,6,'#2b3038');
    for(let i=0;i<3;i++) px(g,x+4+i*3,y+11,2,4,'#d98a4a');
    px(g,x+2,y+4,12,3,'#8d94a8');
  } else if (type==='saucepan'){
    px(g,x+3,y+11,10,5,'#c94a32'); px(g,x+2,y+10,12,1,'#8d94a8');
    px(g,x+6,y+4,4,5,'#b0b7c9');
  } else if (type==='cask'){
    px(g,x+2,y+8,12,11,'#7a5636');
    px(g,x+2,y+11,12,1,'#a5acbe'); px(g,x+2,y+15,12,1,'#a5acbe');
    px(g,x+7,y+16,2,2,'#4a3526');
  }
  /* 状態ランプ */
  const lamp = ready? '#6fe0b0' : (busy? (Math.sin(t*4)>0? '#ffd15c':'#8a6a20') : '#5a3a3a');
  px(g,x+12,y+7,2,2,lamp);
  if (busy){
    for (let i=0;i<3;i++){
      const a = ((t*0.8 + i*0.33)%1);
      px(g,x+6+i*2, y+4-a*5, 1, 2, `rgba(255,255,255,${(0.35*(1-a)).toFixed(2)})`);
    }
  }
  if (ready){
    const yy = y - 6 + Math.round(Math.sin(t*3)*1.5);
    px(g,x+6,yy,4,4,'#6fe0b0'); px(g,x+7,yy+1,2,2,'#eafff5');
  }
}

function drawRock(g,x,y,kind){
  const base = kind===1? '#6e6a78' : kind===2? '#5a6470' : '#7a6d5e';
  px(g,x+2,y+13,12,3,'rgba(0,0,0,0.25)');
  g.fillStyle=base;
  g.beginPath(); g.moveTo(x+2,y+14); g.lineTo(x+3,y+6); g.lineTo(x+7,y+3);
  g.lineTo(x+12,y+5); g.lineTo(x+14,y+12); g.lineTo(x+13,y+14); g.closePath(); g.fill();
  g.fillStyle=shade(base,22);
  g.beginPath(); g.moveTo(x+4,y+8); g.lineTo(x+7,y+4); g.lineTo(x+10,y+6); g.lineTo(x+7,y+9); g.closePath(); g.fill();
  px(g,x+3,y+12,10,2,shade(base,-26));
  if (kind===2){ px(g,x+6,y+8,2,2,'#7fd4ff'); px(g,x+9,y+10,1,1,'#7fd4ff'); }
  if (kind===3){ px(g,x+6,y+7,2,2,'#ffd15c'); }
}

function drawShrub(g,x,y){
  px(g,x+4,y+14,8,2,'rgba(0,0,0,0.22)');
  px(g,x+7,y+8,2,7,'#4a6b3a');
  const col='#5f9155', col2='#76a95f';
  px(g,x+3,y+6,10,5,col); px(g,x+4,y+4,8,3,col);
  px(g,x+5,y+3,6,2,col2); px(g,x+4,y+7,4,2,col2);
  px(g,x+2,y+8,3,2,col); px(g,x+11,y+8,3,2,col);
  /* 小さな青い実 */
  px(g,x+5,y+6,1,1,'#8fb8ff'); px(g,x+10,y+5,1,1,'#8fb8ff');
}

function drawBed(g,x,y){
  px(g,x,y+2,16,26,'#7a5636');
  px(g,x+1,y+3,14,24,'#96693f');
  px(g,x+1,y+3,14,9,'#e8eaf2');          // 枕
  px(g,x+2,y+4,12,7,'#ffffff');
  px(g,x+1,y+12,14,15,'#c9544a');        // 掛けぶとん
  px(g,x+1,y+12,14,2,'#e5726a');
  px(g,x+3,y+16,10,2,'#e5726a'); px(g,x+3,y+21,10,2,'#e5726a');
  px(g,x,y+26,16,2,'#5b4028');
}

function drawKitchen(g,x,y){
  px(g,x,y+8,32,16,'#7f8ba0');
  px(g,x,y+8,32,2,'#a3aec2');
  px(g,x+2,y+12,12,10,'#5a6274');
  px(g,x+16,y+12,14,10,'#5a6274');
  px(g,x+4,y+4,8,5,'#3f4553'); px(g,x+5,y+5,6,3,'#ff8a4a');  // コンロ
  px(g,x+18,y+2,10,7,'#4d5468'); px(g,x+19,y+3,8,5,'#2a3240'); // 棚
  px(g,x+20,y+5,2,2,'#e5372f'); px(g,x+24,y+5,2,2,'#f5b625');
}

function drawCalendar(g,x,y){
  px(g,x,y,22,18,'#e8eaf2');
  px(g,x,y,22,5,'#e5372f');
  px(g,x+2,y+1,3,3,'#ffffff'); px(g,x+17,y+1,3,3,'#ffffff');
  for (let r=0;r<3;r++) for (let c=0;c<6;c++){
    px(g,x+2+c*3,y+7+r*3,2,2, (r*6+c)%5===0? '#8fb8ff':'#b9bfd0');
  }
}

function drawPoster(g,x,y){
  px(g,x,y,20,16,'#3a3f4d');
  px(g,x+1,y+1,18,14,'#1b2440');
  for (let i=0;i<18;i++) px(g,x+1+((i*7)%18),y+1+((i*5)%14),1,1,'rgba(255,255,255,0.5)');
  drawTomato(g,x+10,y+8,4,VARIETIES.akahoshi,1,{});
  px(g,x+3,y+13,14,1,'#ffd15c');
}

function drawLadder(g,x,y,down){
  px(g,x+2,y,2,16,'#8d6a42'); px(g,x+12,y,2,16,'#8d6a42');
  for (let i=0;i<5;i++) px(g,x+2,y+1+i*3,12,1,'#a5824f');
  px(g,x,y+ (down?14:0),16,2, down? '#2b2620':'#6a7185');
}

function drawGate(g,x,y,on){
  px(g,x,y+26,24,3,'#3f4553');
  px(g,x+1,y+2,4,26,'#7f8ba0'); px(g,x+19,y+2,4,26,'#7f8ba0');
  px(g,x+1,y,22,4,'#9aa5ba');
  px(g,x+5,y+4,14,24, on? 'rgba(127,214,255,0.30)':'rgba(60,70,90,0.55)');
  if (on){
    for (let i=0;i<6;i++) px(g,x+6,y+6+i*4,12,1,'rgba(200,240,255,0.45)');
    px(g,x+10,y+12,4,8,'rgba(230,250,255,0.35)');
  }
  px(g,x+2,y+6,2,2, on? '#6fe0b0':'#8a3a3a');
  px(g,x+20,y+6,2,2, on? '#6fe0b0':'#8a3a3a');
}

function drawCave(g,x,y){
  px(g,x,y+14,48,18,'#5a5462');
  g.fillStyle='#4d4a52';
  g.beginPath(); g.moveTo(x,y+32); g.lineTo(x+2,y+12); g.lineTo(x+12,y+2);
  g.lineTo(x+36,y+2); g.lineTo(x+46,y+13); g.lineTo(x+48,y+32); g.closePath(); g.fill();
  g.fillStyle='#635f6b';
  g.beginPath(); g.moveTo(x+4,y+14); g.lineTo(x+13,y+4); g.lineTo(x+34,y+4); g.lineTo(x+43,y+14); g.closePath(); g.fill();
  /* 洞口 */
  g.fillStyle='#14121a';
  g.beginPath(); g.moveTo(x+14,y+32); g.lineTo(x+15,y+16); g.lineTo(x+24,y+9);
  g.lineTo(x+33,y+16); g.lineTo(x+34,y+32); g.closePath(); g.fill();
  /* 支保工 */
  px(g,x+12,y+14,2,18,'#8d6a42'); px(g,x+34,y+14,2,18,'#8d6a42');
  px(g,x+12,y+12,24,2,'#a5824f');
  /* ランプ */
  px(g,x+23,y+15,2,2,'#ffd15c');
  g.fillStyle='rgba(255,209,92,0.18)';
  g.beginPath(); g.arc(x+24,y+16,7,0,6.2832); g.fill();
  /* レール */
  px(g,x+18,y+28,2,4,'#6a7185'); px(g,x+28,y+28,2,4,'#6a7185');
}

function drawWorkbench(g,x,y){
  px(g,x,y+24,32,4,'#3f4553');
  px(g,x+1,y+14,30,11,'#7a6450');
  px(g,x+1,y+14,30,2,'#9a8168');
  px(g,x+2,y+25,3,6,'#5a6274'); px(g,x+27,y+25,3,6,'#5a6274');
  /* 背板と工具 */
  px(g,x+2,y+2,28,12,'#4d5468');
  px(g,x+2,y+2,28,1,'#6a7185');
  px(g,x+4,y+4,2,8,'#b9c0d0');  px(g,x+3,y+11,4,2,'#8d6a42');
  px(g,x+9,y+4,1,9,'#9c6b3f');  px(g,x+7,y+4,5,2,'#cfd6e6');
  px(g,x+15,y+5,6,2,'#8d94a8'); px(g,x+15,y+8,6,2,'#8d94a8');
  px(g,x+24,y+4,4,4,'#ffd15c'); px(g,x+25,y+9,2,4,'#b9c0d0');
  /* 作業中の火花 */
  px(g,x+12,y+12,3,2,'#e5372f');
  px(g,x+18,y+16,6,3,'#5a6274'); px(g,x+19,y+17,4,1,'#8d94a8');
}

function drawPedestal(g,x,y){
  px(g,x,y+11,16,5,'#3f4553');
  px(g,x+2,y+4,12,8,'#5a6274');
  px(g,x+2,y+4,12,2,'#787f92');
  px(g,x+3,y+6,10,3,'#101726');
  px(g,x+4,y+7,3,1,'#8fe6ff');
  px(g,x+1,y+2,14,2,'#6a7185');
  px(g,x+5,y+1,6,1,'#8fe6ff');
}

function drawSign(g,x,y,col){
  px(g,x+7,y+6,2,10,'#8d6a42');
  px(g,x+1,y+1,14,8,'#a5824f');
  px(g,x+2,y+2,12,6,'#c9a374');
  px(g,x+3,y+4,10,1,col||'#6d4a2e');
  px(g,x+3,y+6,7,1,col||'#6d4a2e');
}

function drawWindowPane(g,x,y,w,h){
  px(g,x,y,w,h,'#10131f');
  for (let i=0;i<w*h/16;i++){
    const sx=x+((hash2(i,x,71)*w)|0), sy=y+((hash2(i,y,72)*h)|0);
    px(g,sx,sy,1,1,`rgba(255,255,255,${(0.25+hash2(i,x+y,73)*0.7).toFixed(2)})`);
  }
  px(g,x,y,w,2,'#6a7185'); px(g,x,y+h-2,w,2,'#4a5060');
  px(g,x,y,2,h,'#6a7185'); px(g,x+w-2,y,2,h,'#4a5060');
  for (let i=1;i*32<w;i++) px(g,x+i*32-1,y,2,h,'#5a6274');
  px(g,x+2,y+2,w*0.3,1,'rgba(255,255,255,0.18)');
}

function drawPlanter(g,x,y){
  px(g,x+1,y+20,30,4,'#3f4553');
  px(g,x+1,y+12,30,9,'#7a6450');
  px(g,x+1,y+12,30,2,'#9a8168');
  px(g,x+2,y+15,28,4,'#5b4a3a');
  px(g,x+2,y+10,28,3,'#4a3728');
  /* 中の草とトマト */
  for (let i=0;i<5;i++){
    const bx = x+5+i*5;
    px(g,bx,y+4,1,7,'#4a6b3a');
    px(g,bx-2,y+5,4,2,'#5f9155'); px(g,bx+1,y+3,3,2,'#76a95f');
  }
  drawTomato(g,x+9,y+5,2.4,VARIETIES.comet,1,{});
  drawTomato(g,x+22,y+6,2.2,VARIETIES.comet,2,{});
}
function drawLamppost(g,x,y){
  px(g,x+5,y+26,6,3,'#3f4553');
  px(g,x+7,y+6,2,21,'#6a7185');
  px(g,x+6,y+6,4,1,'#8d94a8');
  px(g,x+4,y+1,8,5,'#8d94a8');
  px(g,x+5,y+4,6,3,'#fff0b8');
  g.save(); g.globalAlpha=0.16; g.fillStyle='#ffe9a8';
  g.beginPath(); g.moveTo(x+4,y+6); g.lineTo(x+12,y+6); g.lineTo(x+16,y+28); g.lineTo(x,y+28); g.closePath(); g.fill();
  g.restore();
}
function drawVend(g,x,y){
  px(g,x+1,y+26,14,3,'#3f4553');
  px(g,x+1,y+4,14,23,'#4d5468');
  px(g,x+1,y+4,14,2,'#6a7185');
  px(g,x+2,y+7,9,14,'#141b2b');
  for (let r=0;r<3;r++) for (let c=0;c<3;c++){
    px(g,x+3+c*3,y+8+r*4,2,3,['#e5372f','#f5b625','#6fd79a','#7fd6ff','#c9a6ff'][(r*3+c)%5]);
  }
  px(g,x+11,y+8,3,5,'#2a3040'); px(g,x+11,y+9,3,1,'#7fd6ff');
  px(g,x+11,y+15,3,3,'#6a7185'); px(g,x+11,y+20,3,4,'#141b2b');
  px(g,x+2,y+22,9,3,'#39404f');
}
function drawFence(g,x,y){
  px(g,x+1,y+4,2,10,'#8d6a42'); px(g,x+13,y+4,2,10,'#8d6a42');
  px(g,x,y+6,16,2,'#a5824f'); px(g,x,y+10,16,2,'#a5824f');
}

/* ===========================================================  アイコン */
/* もちもち欄のアイコン。16x16の枠に描く */
function drawIcon(g, id, x, y, s){
  s = s||1;
  g.save(); g.translate(x,y); g.scale(s,s);
  const it = ITEMS[id];
  if (!it){ g.restore(); return; }
  if (it.kind==='tool'){
    if (id==='t_hoe'){ px(g,7,2,2,12,'#9c6b3f'); px(g,3,12,9,3,'#b9c0d0'); px(g,3,11,3,2,'#8d94a8'); }
    if (id==='t_can'){ px(g,3,6,9,7,'#7fb2d9'); px(g,11,4,2,5,'#9ccbe8'); px(g,1,7,3,2,'#6a9cc0'); px(g,4,4,4,2,'#6a9cc0'); px(g,13,3,2,2,'#cbe8fa'); }
    if (id==='t_sickle'){ px(g,9,4,2,10,'#9c6b3f'); px(g,2,3,8,2,'#c8d0e0'); px(g,2,5,2,3,'#c8d0e0'); }
    if (id==='t_pick'){ px(g,7,3,2,12,'#7d5636'); px(g,2,3,12,2,'#cfd6e6'); px(g,2,2,3,3,'#a9b1c4'); px(g,11,2,3,3,'#a9b1c4'); }
    if (id==='t_scan'){ px(g,3,3,10,8,'#4d5468'); px(g,4,4,8,6,'#0f2a3f'); px(g,5,6,6,1,'#7fd6ff'); px(g,5,8,4,1,'#6fe0b0'); px(g,6,11,4,3,'#39404f'); }
  } else if (it.kind==='seed'){
    const V=VARIETIES[it.variety];
    px(g,2,2,12,12,'#b08a5c'); px(g,2,2,12,2,'#c9a374');
    px(g,3,4,10,9,'#8d6a42');
    drawTomato(g,8,8,3.2,V,3,{});
    px(g,2,12,12,2,'#8a6a45');
  } else if (it.kind==='crop'){
    const V=VARIETIES[it.variety];
    drawTomato(g,8,9,Math.min(6.2, 4.2*(V.size||1)+1),V,2,{});
  } else if (it.kind==='good'){
    const V=VARIETIES[it.variety], p=it.proc;
    if (p==='juice'){ px(g,5,3,6,2,'#cfd6e6'); px(g,4,5,8,10,'#cfd6e6'); px(g,5,7,6,7,V.fruit); px(g,6,8,2,2,V.fruit2); }
    if (p==='ketchup'){ px(g,6,2,4,3,'#b9bfd0'); px(g,4,5,8,10,V.fruit); px(g,5,8,6,5,'#f5e6d0'); px(g,6,9,4,1,V.dark); px(g,6,11,3,1,V.dark); }
    if (p==='dried'){ px(g,3,6,5,4,shade(V.fruit,-45)); px(g,8,4,5,4,shade(V.fruit,-30)); px(g,5,10,6,4,shade(V.fruit,-38)); px(g,4,7,2,1,V.fruit2); }
    if (p==='sauce'){ px(g,3,4,10,3,'#cfd6e6'); px(g,4,7,8,8,V.fruit); px(g,5,8,6,2,V.fruit2); px(g,6,11,2,2,'#f5e6d0'); px(g,9,12,2,1,'#6fd79a'); }
    if (p==='wine'){ px(g,7,2,2,4,'#8d6a42'); px(g,5,6,6,3,'#cfd6e6'); px(g,4,9,8,6,shade(V.fruit,-25)); px(g,5,10,2,2,V.fruit2); px(g,4,12,8,1,'#f5e6d0'); }
  } else if (it.kind==='mat'){
    if (id==='m_iron'){ px(g,3,7,7,5,'#8d94a8'); px(g,4,5,5,3,'#a9b1c4'); px(g,9,9,4,3,'#6a7185'); px(g,4,8,2,1,'#c6cbd9'); }
    if (id==='m_silicon'){ px(g,3,4,10,9,'#3f4553'); px(g,4,5,8,7,'#7f8ba0'); px(g,5,6,3,2,'#c6cbd9'); for(let i=0;i<4;i++) px(g,2,5+i*2,1,1,'#d9b25c'); for(let i=0;i<4;i++) px(g,13,5+i*2,1,1,'#d9b25c'); }
    if (id==='m_ice'){ px(g,4,4,8,9,'#a8dcf0'); px(g,5,5,6,7,'#d6f2ff'); px(g,6,6,2,2,'#ffffff'); px(g,4,12,8,1,'#7fb2d9'); }
    if (id==='m_crystal'){ g.fillStyle='#ffd15c'; g.beginPath(); g.moveTo(8,2); g.lineTo(13,8); g.lineTo(8,14); g.lineTo(3,8); g.closePath(); g.fill();
      g.fillStyle='#fff3c4'; g.beginPath(); g.moveTo(8,3); g.lineTo(11,8); g.lineTo(8,8); g.closePath(); g.fill();
      px(g,7,8,2,4,'#e0a82a'); }
    if (id==='m_meteor'){ px(g,3,5,10,8,'#4d4a52'); px(g,4,4,8,2,'#635f6b'); px(g,5,7,3,3,'#2f2d35'); px(g,9,9,2,2,'#2f2d35'); px(g,6,5,2,1,'#8d94a8'); px(g,10,6,2,1,'#ffb37a'); }
  } else if (it.kind==='use'){
    if (id==='f_basic'){ px(g,5,2,6,3,'#6fe0b0'); px(g,4,5,8,10,'#3f7a5c'); px(g,5,7,6,6,'#6fe0b0'); px(g,6,8,2,2,'#c9ffe8'); }
    if (id==='f_sweet'){ px(g,6,1,4,4,'#b9bfd0'); px(g,4,5,8,10,'#d9b25c'); px(g,5,7,6,6,'#ffe9a8'); px(g,11,3,3,2,'#cfd6e6'); }
    if (id==='f_giant'){ px(g,5,3,6,3,'#8d94a8'); px(g,3,6,10,9,'#7fb2d9'); px(g,4,7,8,7,'#b8e4ff'); px(g,6,9,4,3,'#ffffff'); }
    if (id==='jelly'){ px(g,4,3,8,11,'#7fe0a8'); px(g,5,4,6,9,'#b6f2cf'); px(g,4,3,8,2,'#cfd6e6'); px(g,6,6,2,3,'#eafff5'); }
    if (id==='jelly_hi'){ px(g,4,3,8,11,'#c9a6ff'); px(g,5,4,6,9,'#e2d0ff'); px(g,4,3,8,2,'#cfd6e6'); px(g,6,6,2,3,'#ffffff'); px(g,3,2,2,2,'#ffd15c'); }
  } else if (it.kind==='key'){
    px(g,2,2,12,12,'#8a6240'); px(g,3,3,10,10,'#e8dcc0');
    for (let i=0;i<4;i++) px(g,5,5+i*2,7,1,'#9a8a6a');
    px(g,2,2,2,12,'#6d4a2e'); drawTomato(g,11,11,2.2,VARIETIES.akahoshi,1,{});
  }
  g.restore();
}

/* ===========================================================  効果 */
function drawSparkle(g,x,y,t,col){
  const a = 1-t;
  const r = 2 + t*5;
  g.save(); g.globalAlpha = Math.max(0,a);
  px(g,x-r,y,r*2,1,col); px(g,x,y-r,1,r*2,col);
  px(g,x-1,y-1,2,2,'#ffffff');
  g.restore();
}
function drawWaterSplash(g,x,y,t){
  g.save(); g.globalAlpha=Math.max(0,1-t);
  for (let i=0;i<6;i++){
    const a = i/6*6.2832;
    const d = t*7;
    px(g, x+Math.cos(a)*d, y+Math.sin(a)*d*0.5, 1, 1, '#9cd6f5');
  }
  g.restore();
}
