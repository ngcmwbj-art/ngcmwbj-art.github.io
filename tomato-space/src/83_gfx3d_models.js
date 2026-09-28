/* =========================================================================
   83_gfx3d_models.js  —  3DS風の立体表示：人・トマト・建物の形
   大きさの単位は「1マス＝1」。y が上、+z が手前（画面の下）。
   ========================================================================= */

const PI = Math.PI;

/* ================================================================ 人の骨組み */
/* 頭の大きい2頭身。脚・腕は付け根で回せるように別の Group にする */
function w3Skeleton(){
  const T = W3.T;
  const root = new T.Group();
  const body = new T.Group(); root.add(body);
  const hipL = new T.Group(); hipL.position.set(-0.1,0.36,0); body.add(hipL);
  const hipR = new T.Group(); hipR.position.set( 0.1,0.36,0); body.add(hipR);
  const shL  = new T.Group(); shL.position.set(-0.24,0.78,0); body.add(shL);
  const shR  = new T.Group(); shR.position.set( 0.24,0.78,0); body.add(shR);
  const head = new T.Group(); head.position.set(0,1.02,0); body.add(head);
  return { root, body, hipL, hipR, shL, shR, head };
}
function w3Legs(sk, pants, shoe){
  for (const g of [sk.hipL, sk.hipR]){
    const b = B3();
    b.cap(0.075,0.14, pants, 0,-0.14,0);
    b.sph(0.1, shoe, 0,-0.30,0.035, { sx:1, sy:0.62, sz:1.3 });
    g.add(b.build({outline:true}));
  }
}
function w3Arms(sk, sleeve, hand){
  for (const g of [sk.shL, sk.shR]){
    const b = B3();
    b.cap(0.068,0.12, sleeve, 0,-0.11,0);
    b.sph(0.078, hand, 0,-0.25,0);
    g.add(b.build({outline:true}));
  }
}

/* ================================================================ 自分（宇宙服） */
function w3MakePlayer(){
  const T = W3.T;
  const sk = w3Skeleton();
  const SUIT='#eef0f6', SUIT_D='#b9bfd0', RED='#e5372f', SKIN='#f3c49c',
        HAIR='#3a2820', BOOT='#4a5470', BELT='#6b7490';
  w3Legs(sk, SUIT_D, BOOT);
  w3Arms(sk, SUIT, '#9aa3bb');
  /* 胴 */
  const b = B3();
  b.cap(0.2,0.13, SUIT, 0,0.6,0, { sz:0.86 });
  b.torus(0.19,0.035,18, BELT, 0,0.5,0, { rx:PI/2, sz:0.86 });
  b.sph(0.055, RED, 0,0.66,0.17, { sz:0.5 });
  b.sph(0.022, '#4f9e42', 0,0.715,0.165);
  /* 背中の酸素タンク */
  b.box(0.3,0.32,0.13, '#9aa3bb', 0,0.66,-0.2);
  b.cyl(0.06,0.06,0.3,10, '#c8cfe0', -0.08,0.68,-0.28);
  b.cyl(0.06,0.06,0.3,10, '#c8cfe0',  0.08,0.68,-0.28);
  b.sph(0.03, '#7fe0a8', 0.1,0.8,-0.2, { key:'glow' });
  sk.body.add(b.build({outline:true}));
  /* 頭（ヘルメット） */
  const h = B3();
  h.sph(0.31, SUIT, 0,0.06,0, { seg:20 });
  h.sph(0.235, SKIN, 0,0.03,0.17, { sx:1, sy:0.92, sz:0.62, seg:18 });
  h.sph(0.2, HAIR, 0,0.15,0.15, { sx:1.12, sy:0.5, sz:0.62 });
  h.cap(0.028,0.035, '#1b1b26', -0.085,0.03,0.305);
  h.cap(0.028,0.035, '#1b1b26',  0.085,0.03,0.305);
  h.sph(0.012, '#ffffff', -0.075,0.055,0.33, { key:'glow' });
  h.sph(0.012, '#ffffff',  0.095,0.055,0.33, { key:'glow' });
  h.sph(0.04, '#ff9f9f', -0.15,-0.03,0.27, { sz:0.4 });
  h.sph(0.04, '#ff9f9f',  0.15,-0.03,0.27, { sz:0.4 });
  h.torus(0.225,0.034,24, SUIT_D, 0,0.04,0.235);
  /* アンテナの先にトマト */
  h.cyl(0.012,0.012,0.2,6, '#9aa3bb', 0.17,0.4,-0.02, { rz:-0.25 });
  h.sph(0.055, RED, 0.2,0.52,-0.02);
  h.cone(0.035,0.03,5, '#4f9e42', 0.2,0.575,-0.02);
  const hg = h.build({outline:true});
  /* バイザー（ガラス） */
  const v = B3();
  v.sph(0.25, '#bfe6ff', 0,0.04,0.18, { sx:1.02, sy:0.95, sz:0.7, seg:20, key:'visor' });
  hg.add(v.build());
  sk.head.add(hg);

  /* 道具（ふるときだけ見える） */
  const tools = {};
  const mk = (name, fn)=>{ const bb=B3(); fn(bb); const g=bb.build(); g.visible=false; g.position.set(0,-0.25,0); sk.shR.add(g); tools[name]=g; };
  mk('hoe', bb=>{ bb.cyl(0.022,0.022,0.62,6,'#9c6b3f',0,-0.18,0); bb.box(0.2,0.035,0.12,'#c3cad8',0,-0.49,0.05); });
  mk('pick', bb=>{ bb.cyl(0.022,0.022,0.6,6,'#7d5636',0,-0.18,0); bb.box(0.36,0.045,0.06,'#cfd6e6',0,-0.47,0,{rz:0.1}); bb.cone(0.03,0.08,4,'#a9b1c4',-0.2,-0.47,0,{rz:PI/2}); });
  mk('sickle', bb=>{ bb.cyl(0.022,0.022,0.3,6,'#9c6b3f',0,-0.05,0); bb.torus(0.12,0.018,12,'#d8dfec',0.1,-0.2,0,{arc:PI*1.1, rz:PI*0.6}); });
  mk('water', bb=>{
    bb.cyl(0.11,0.12,0.2,12,'#7fb2d9',0,-0.08,0.1);
    bb.cyl(0.02,0.03,0.25,6,'#9ccbe8',0,-0.02,0.3,{rx:1.0});
    bb.torus(0.08,0.015,10,'#6a9cc0',0,0.05,0.02,{rx:0, ry:PI/2});
  });
  return { root:sk.root, sk, tools, ang:0, walk:0 };
}

/* ================================================================ 住民 */
function w3MakeNPC(id){
  const T = W3.T;
  if (id==='obaba') return w3MakeObaba();
  if (id==='zax') return w3MakeZax();
  if (id==='toma') return w3MakeCat();
  const sk = w3Skeleton();
  if (id==='natsuki'){
    const OV='#3f7a5c', OV2='#7fe0a8', SKIN='#f0bd93', HAIR='#5a3726';
    w3Legs(sk, '#4a5470', '#3a3040');
    w3Arms(sk, '#e8e2d0', SKIN);
    const b=B3();
    b.cap(0.2,0.12, OV, 0,0.6,0, { sz:0.85 });
    b.box(0.24,0.16,0.05, OV2, 0,0.72,0.15);
    b.box(0.11,0.08,0.03, '#d9b25c', 0,0.69,0.18);
    b.torus(0.18,0.03,14,'#2b3245',0,0.52,0,{rx:PI/2,sz:0.85});
    /* 腰の工具 */
    b.box(0.05,0.14,0.04,'#b9c0d0',0.2,0.5,0.1,{rz:0.3});
    sk.body.add(b.build({outline:true}));
    const h=B3();
    h.sph(0.29, SKIN, 0,0.02,0, { seg:18 });
    h.sph(0.31, HAIR, 0,0.1,-0.03, { sx:1.02, sy:0.85, sz:1.0, seg:18 });
    h.sph(0.13, HAIR, 0,0.2,0.2, { sx:1.6, sy:0.5, sz:0.6 });
    /* ゴーグル */
    h.torus(0.3,0.03,20,'#2b3245',0,0.14,0,{rx:PI/2+0.25});
    h.cyl(0.07,0.07,0.05,12,'#2b3245',-0.1,0.2,0.25,{rx:PI/2-0.3});
    h.cyl(0.07,0.07,0.05,12,'#2b3245', 0.1,0.2,0.25,{rx:PI/2-0.3});
    h.cyl(0.05,0.05,0.02,12,'#8fd6ff',-0.1,0.21,0.28,{rx:PI/2-0.3, key:'glow'});
    h.cyl(0.05,0.05,0.02,12,'#8fd6ff', 0.1,0.21,0.28,{rx:PI/2-0.3, key:'glow'});
    w3Face(h, '#2a1a14', 0.26);
    /* ポニーテール */
    h.sph(0.08, HAIR, 0,0.12,-0.3);
    h.cap(0.07,0.18, HAIR, 0,-0.05,-0.36, { rx:0.4 });
    sk.head.add(h.build({outline:true}));
  } else if (id==='luna'){
    const COAT='#f2f3fa', HAIR='#b98cf5', SKIN='#f5cfae';
    w3Legs(sk, '#5b6280', '#40405a');
    w3Arms(sk, COAT, SKIN);
    const b=B3();
    b.cyl(0.17,0.27,0.5,14, COAT, 0,0.52,0, { sz:0.85 });
    b.sph(0.19, COAT, 0,0.76,0, { sz:0.85 });
    b.box(0.03,0.45,0.02,'#d4d8e8',0,0.55,0.2);
    b.box(0.03,0.1,0.02,'#8fb8ff',-0.1,0.72,0.18);
    b.box(0.12,0.12,0.03,'#c9a6ff',0.08,0.62,0.2);
    sk.body.add(b.build({outline:true}));
    const h=B3();
    h.sph(0.29, SKIN, 0,0.02,0, { seg:18 });
    h.sph(0.315, HAIR, 0,0.08,-0.04, { sx:1.04, sy:0.9, sz:1.0, seg:18 });
    h.sph(0.14, HAIR, -0.08,0.18,0.2, { sx:1.4, sy:0.5, sz:0.5, rz:0.3 });
    h.cap(0.12,0.35, HAIR, 0,-0.2,-0.14, { sx:1.9, sz:0.8 });
    /* めがね */
    h.torus(0.06,0.012,14,'#4a3b66',-0.095,0.02,0.285);
    h.torus(0.06,0.012,14,'#4a3b66', 0.095,0.02,0.285);
    h.box(0.06,0.012,0.012,'#4a3b66',0,0.03,0.29);
    h.sph(0.056,'#cfe8ff',-0.095,0.02,0.28,{sz:0.2,key:'glass'});
    h.sph(0.056,'#cfe8ff', 0.095,0.02,0.28,{sz:0.2,key:'glass'});
    w3Face(h, '#3a2b4d', 0.265);
    sk.head.add(h.build({outline:true}));
  } else {
    w3Legs(sk,'#556','#334'); w3Arms(sk,'#aab','#fcd');
    const b=B3(); b.cap(0.2,0.12,'#88a',0,0.6,0); sk.body.add(b.build({outline:true}));
    const h=B3(); h.sph(0.29,'#fcd',0,0.02,0); w3Face(h,'#222',0.26); sk.head.add(h.build({outline:true}));
  }
  return { root:sk.root, sk, id, ang:0 };
}
/* 顔（目・ほお） */
function w3Face(h, eye, z){
  h.cap(0.026,0.04, eye, -0.09,0.0,z);
  h.cap(0.026,0.04, eye,  0.09,0.0,z);
  h.sph(0.011,'#ffffff',-0.08,0.025,z+0.025,{key:'glow'});
  h.sph(0.011,'#ffffff', 0.1,0.025,z+0.025,{key:'glow'});
  h.sph(0.04,'#ff9f9f',-0.16,-0.07,z-0.03,{sz:0.4});
  h.sph(0.04,'#ff9f9f', 0.16,-0.07,z-0.03,{sz:0.4});
  h.box(0.05,0.012,0.01,'#b0605a',0,-0.08,z+0.01);
}

function w3MakeObaba(){
  const T = W3.T;
  const root = new T.Group();
  const body = new T.Group(); root.add(body);
  const C='#6fdcff', D='#2f8fc0', L='#c6f4ff';
  const b = B3();
  b.cyl(0.14,0.3,0.6,16, C, 0,0.32,0, { key:'holo' });
  b.box(0.3,0.06,0.2, D, 0,0.5,0.1, { key:'holo' });
  b.box(0.04,0.45,0.02, L, 0,0.4,0.19, { key:'holo', rz:0.3 });
  b.cap(0.06,0.18, C, -0.22,0.52,0.02, { rz:0.35, key:'holo' });
  b.cap(0.06,0.18, C,  0.22,0.52,0.02, { rz:-0.35, key:'holo' });
  b.sph(0.26, C, 0,0.9,0, { key:'holo' });
  b.sph(0.14, L, 0,1.16,-0.05, { key:'holo' });
  b.sph(0.26, L, 0,0.98,-0.04, { sx:1.05, sy:0.6, sz:1, key:'holo' });
  b.cap(0.022,0.03,'#0a3b52',-0.08,0.88,0.24,{key:'toon'});
  b.cap(0.022,0.03,'#0a3b52', 0.08,0.88,0.24,{key:'toon'});
  b.cyl(0.05,0.05,0.7,6, D, 0.34,0.35,0.05, { key:'holo' });  /* 杖 */
  body.add(b.build());
  /* 足もとの投影機と光の柱 */
  const p = B3();
  p.cyl(0.32,0.36,0.08,20,'#5a6274',0,0.04,0,{key:'toon'});
  p.torus(0.3,0.025,24,'#8fe6ff',0,0.085,0,{rx:PI/2,key:'glow'});
  p.cyl(0.3,0.34,1.5,20,'#8fe6ff',0,0.8,0,{key:'beam'});
  root.add(p.build());
  const holoMat = W3.mats.holo;
  return { root, sk:{ body, root }, id:'obaba', ang:0, holo:true };
}

function w3MakeZax(){
  const T = W3.T;
  const root = new T.Group();
  const body = new T.Group(); root.add(body);
  const M_='#9a9cae', B='#d0a53c', B2='#ffd15c';
  const b = B3();
  b.box(0.62,0.5,0.46, M_, 0,0.95,0, { key:'shiny' });
  b.box(0.66,0.06,0.5, '#c3c5d4', 0,1.22,0, { key:'shiny' });
  b.box(0.48,0.28,0.04, '#161c2b', 0,0.97,0.23);
  b.sph(0.06, B2, -0.1,0.99,0.25, { key:'glow' });
  b.sph(0.06, B2,  0.1,0.99,0.25, { key:'glow' });
  b.box(0.2,0.025,0.01, B, 0,0.88,0.25, { key:'glow' });
  b.cyl(0.018,0.018,0.26,6, M_, 0,1.36,0);
  b.sph(0.055,'#ff6b52', 0,1.5,0, { key:'glow' });
  b.cap(0.05,0.2, B, -0.38,0.9,0, { rz:0.25 });
  b.cap(0.05,0.2, B,  0.38,0.9,0, { rz:-0.25 });
  /* お腹の商品棚 */
  b.box(0.56,0.2,0.4, B, 0,0.6,0.02);
  b.box(0.5,0.02,0.02, '#8a6a20', 0,0.66,0.23);
  b.sph(0.05,'#e5372f',-0.16,0.58,0.2);
  b.sph(0.05,'#f5b625', 0,0.58,0.2);
  b.sph(0.05,'#6fd79a', 0.16,0.58,0.2);
  b.cone(0.18,0.2,12, '#6d6f80', 0,0.42,0, { rx:PI });
  body.add(b.build({outline:true}));
  /* 推進の炎 */
  const f = B3();
  f.cone(0.12,0.3,10,'#ffb45a',0,0.2,0,{ rx:PI, key:'beam' });
  f.sph(0.08,'#ffe0a0',0,0.32,0,{ key:'glow' });
  const fl = f.build(); body.add(fl);
  return { root, sk:{ body, root }, id:'zax', ang:0, flame:fl, hover:true };
}

function w3MakeCat(){
  const T = W3.T;
  const root = new T.Group();
  const body = new T.Group(); root.add(body);
  const F='#ffb37a', F2='#ffe0c2', D='#d98a55';
  const b = B3();
  b.sph(0.2, F, 0,0.2,-0.04, { sx:0.9, sy:0.85, sz:1.2 });
  b.sph(0.12, F2, 0,0.18,0.1, { sx:1, sy:0.9, sz:0.7 });
  b.sph(0.2, F, 0,0.46,0.08, { seg:16 });
  b.cone(0.07,0.12,4, F, -0.11,0.64,0.07, { rz:0.25 });
  b.cone(0.07,0.12,4, F,  0.11,0.64,0.07, { rz:-0.25 });
  b.cone(0.04,0.07,4, '#ff9f9f', -0.11,0.63,0.1, { rz:0.25 });
  b.cone(0.04,0.07,4, '#ff9f9f',  0.11,0.63,0.1, { rz:-0.25 });
  b.sph(0.1, F2, 0,0.41,0.22, { sx:1.2, sy:0.8, sz:0.6 });
  b.cap(0.02,0.03,'#2b2028',-0.07,0.48,0.26);
  b.cap(0.02,0.03,'#2b2028', 0.07,0.48,0.26);
  b.sph(0.018,'#e0705c',0,0.43,0.285);
  for (const sx of [-1,1]) for (const sz of [-1,1]) b.cap(0.045,0.06,F, sx*0.1,0.06,sz*0.08-0.02);
  b.cap(0.04,0.3,D, 0,0.34,-0.3, { rx:-0.7 });
  body.add(b.build({outline:true}));
  const g = B3();
  g.sph(0.27,'#c8ecff',0,0.46,0.08,{ key:'glass', seg:18 });
  body.add(g.build());
  return { root, sk:{ body, root }, id:'toma', ang:0, cat:true };
}

/* ================================================================ トマトの株 */
/* 1株の形。同じ見た目の株は形を使いまわす */
function w3PlantKey(vid, stage, size, opt){
  const V = VARIETIES[vid]||VARIETIES.akahoshi;
  return vid+'|'+stage+'|'+Math.round(size*8)+'|'+(opt.fallen?1:0)+'|'+(opt.dead?1:0)+'|'+(V.rainbow? (opt.seed||0)%5 : 0);
}
function w3MakePlant(vid, stage, size, opt){
  const T = W3.T;
  opt = opt||{};
  const V = VARIETIES[vid] || VARIETIES.akahoshi;
  const dead = !!opt.dead;
  const leaf = dead? '#8a7a5c' : V.leaf;
  const leafD = shade(leaf,-24), leafL = shade(leaf,18);
  const stem = dead? '#7a6a4e' : shade(V.leaf,-18);
  const b = B3();
  /* 株もとの土 */
  b.sph(0.24, '#4a3426', 0,0,0, { sy:0.22, seg:10 });
  if (opt.fallen){
    const m = new T.Matrix4().makeRotationFromEuler(new T.Euler(0.15,0,1.05));
    m.setPosition(0.02,0.04,0);
    b.post = m;
  }
  const leafAt = (h, a, d, s, col)=>{
    /* 小葉を2〜3枚つないだ葉 */
    const cx = Math.cos(a), cz = -Math.sin(a);
    b.sph(0.1*s, col, cx*d*0.6, h, cz*d*0.6, { sx:1.3, sy:0.22, sz:0.72, ry:a, rz:-0.35, seg:8 });
    b.sph(0.09*s, col===leaf? leafL : col, cx*d*1.15, h-0.04*s, cz*d*1.15, { sx:1.25, sy:0.22, sz:0.78, ry:a, rz:-0.55, seg:8 });
    b.sph(0.05*s, col, cx*d*0.85 - cz*0.07, h+0.01, cz*d*0.85 + cx*0.07, { sx:1.2, sy:0.25, sz:0.7, ry:a+0.9, rz:-0.3, seg:6 });
  };
  if (stage<=0){
    b.sph(0.05, shade(V.fruit,-40), 0,0.05,0, { seg:6 });
    b.cone(0.018,0.09,4, '#6fa95f', 0.03,0.1,0);
  } else if (stage===1){
    b.cyl(0.018,0.022,0.22,5, stem, 0,0.11,0);
    leafAt(0.21, 0.3, 0.12, 0.9, leaf);
    leafAt(0.23, PI+0.3, 0.12, 0.9, leafL);
  } else if (stage===2){
    b.cyl(0.022,0.03,0.46,6, stem, 0,0.23,0);
    for (let i=0;i<5;i++) leafAt(0.12+i*0.08, i*2.4+0.4, 0.16, 1.0, i%2? leaf:leafD);
    b.sph(0.06, leafL, 0,0.47,0, { sy:0.6, seg:8 });
  } else {
    const H = stage===4? 0.86 : 0.8;
    if (!opt.fallen) {
      /* 支柱と結び目 */
      b.cyl(0.018,0.018,1.0,5, '#c9a374', -0.1,0.5,-0.08);
      b.torus(0.035,0.01,8, '#e8e0c0', -0.07,0.55,-0.06, { rx:PI/2 });
    }
    b.cyl(0.024,0.036,H,6, stem, 0,H/2,0);
    for (let i=0;i<9;i++) leafAt(0.18+i*0.07, i*2.39+0.2, 0.2 - i*0.008, 1.05 - i*0.03, i%3===0? leafD : (i%3===1? leaf : leafL));
    b.sph(0.08, leafL, 0,H+0.02,0, { sy:0.6, seg:8 });
    if (stage===3){
      const fl=[[0.13,0.5,0.06],[-0.12,0.66,0.08],[0.05,0.8,0.1],[0.1,0.35,-0.1]];
      for (const f of fl){
        for (let k=0;k<5;k++){
          const a=k/5*PI*2;
          b.sph(0.03,'#ffe066',f[0]+Math.cos(a)*0.03,f[1],f[2]+Math.sin(a)*0.03,{ sy:0.35, seg:6 });
        }
        b.sph(0.018,'#f0a52a',f[0],f[1]+0.012,f[2],{ seg:6 });
      }
    } else {
      /* 実（大きく育つほど、間隔もひらく） */
      const n = Math.max(1, Math.min(4, V.yield||1));
      const r = Math.max(0.085, Math.min(0.34, 0.15*size*(V.size||1)));
      const sp = 0.8 + r*1.6;
      const pos = [[-0.16,0.42,0.1],[0.16,0.6,0.06],[-0.06,0.74,-0.1],[0.2,0.32,-0.06]];
      const fkey = dead? 'fruit' : (V.glow? 'fruitGlow' : (V.rainbow? 'fruitRain' : 'fruit'));
      for (let i=0;i<n;i++){
        const p = pos[i];
        const fx = p[0]*sp, fz = p[2]*sp + 0.04;
        const fy = Math.max(r+0.05, p[1] - (r-0.12)*0.8);
        let main = V.fruit, hi = V.fruit2, dk = V.dark;
        if (dead){ main='#7c6a52'; hi='#93805f'; dk='#5c4d3b'; }
        else if (V.rainbow){
          main = ['#ff6b8a','#ffc861','#7be58f','#6fb4ff','#c98bff'][((opt.seed||0)+i*2)%5];
          hi = mix(main,'#ffffff',0.5); dk = shade(main,-60);
        }
        const cMain = w3c(main).clone(), cDk = w3c(dk).clone(), cHi = w3c(hi).clone();
        const striped = V.striped && !dead;
        /* ふっくら・少しつぶれた球。下と奥ほど暗い */
        b.sph(r, main, fx,fy,fz, { sy:0.86, seg:14, key:fkey, fn:(x,y,z)=>{
          const t = Math.max(0,Math.min(1, (y-(fy-r))/(r*1.3)));
          const c = cDk.clone().lerp(cMain, 0.35+0.65*t);
          if (striped){
            const a = Math.atan2(z-fz, x-fx);
            if (((a/(PI*2)+1)*6)%1 < 0.28) c.lerp(cHi, 0.85);
          }
          return c;
        }});
        /* つや（光っている点） */
        b.sph(r*0.2, mix(hi,'#ffffff',0.6), fx-r*0.38, fy+r*0.42, fz+r*0.62, { sy:0.7, seg:8, key:'glow' });
        /* ヘタ */
        const lc = dead? '#6a5a44' : V.leaf;
        for (let k=0;k<5;k++){
          const a = k/5*PI*2;
          b.sph(r*0.2, k%2? lc : shade(lc,-20), fx+Math.cos(a)*r*0.2, fy+r*0.83, fz+Math.sin(a)*r*0.2, { sx:1.6, sy:0.3, sz:0.55, ry:-a, seg:6 });
        }
        b.cyl(r*0.05,r*0.07,r*0.35,5, shade(lc,-10), fx, fy+r*0.98, fz);
      }
    }
  }
  const g = b.build();
  return g;
}

/* ================================================================ 置いてあるもの */
/* ここでつくる形はすべて、左上のマスの角を原点、足もとが y=0。
   光る場所は W3.lightSrc に、動く仕掛けは W3.anims に登録する */
function w3doorX(o, d, area){
  for (const w of (area.warps||[])){
    if (w.y===o.y+d.h && w.x>=o.x && w.x<o.x+d.w) return w.x - o.x + 0.5;
  }
  return d.w/2;
}
function w3light(o, lx, ly, lz, col, r, str){
  W3.lightSrc.push({ x:o.x+lx, y:ly, z:o.y+lz, col:col, r:r||6, str:str||1, obj:o });
}
function w3anim(fn){ W3.anims.push({ fn, obj:W3._curObj||null }); }

function w3Door(b, dx, z, h, col, col2){
  b.box(0.82,h+0.08,0.08, '#5b4a3a', dx,(h+0.08)/2+0.1,z);
  b.box(0.66,h,0.06, col, dx,h/2+0.12,z+0.03);
  b.box(0.54,0.04,0.02, col2||shade(col,20), dx,h*0.72,z+0.065);
  b.box(0.54,0.04,0.02, col2||shade(col,20), dx,h*0.35,z+0.065);
  b.sph(0.035,'#e8c35c', dx+0.22,h*0.52+0.1,z+0.08);
  b.box(1.0,0.07,0.3, '#8d94a8', dx,0.035,z+0.18);
}

const W3OBJ = {
  house(o,d,a){
    const b=B3(); const dx=w3doorX(o,d,a);
    b.box(4.8,0.12,3.7,'#4a4553',2.5,0.06,1.95);
    b.box(4.4,1.35,3.2,'#d0d4e0',2.5,0.795,1.95);
    b.box(4.5,0.1,3.3,'#eef1f7',2.5,1.5,1.95);
    b.box(4.46,0.18,3.26,'#a8aec0',2.5,0.21,1.95);
    for (let x=0.75;x<4.4;x+=0.72) if (Math.abs(x-dx)>0.55) b.box(0.07,1.25,0.05,'#aab0c2',x,0.8,3.56);
    b.hemi(1,'#c2412f',2.5,1.55,1.95,{ sx:2.3, sy:1.3, sz:1.72, seg:24 });
    b.torus(1,0.06,32,'#8d2f22',2.5,1.56,1.95,{ rx:PI/2, sx:2.3, sy:1.72 });
    b.hemi(1,'#e0624c',2.5,1.56,1.95,{ sx:0.55, sy:1.38, sz:0.42, seg:12 });
    b.cyl(0.26,0.26,0.1,16,'#ffe9a8',2.5,2.86,1.95,{ key:'win' });
    /* 窓 */
    for (const wx of [0.95, 4.05]){
      if (Math.abs(wx-dx)<0.6) continue;
      b.box(0.78,0.62,0.06,'#8d94a8',wx,0.98,3.57);
      b.box(0.62,0.46,0.04,'#ffe3a0',wx,0.98,3.6,{ key:'win' });
      b.box(0.04,0.46,0.02,'#8d94a8',wx,0.98,3.63);
      b.box(0.8,0.06,0.16,'#9aa1b5',wx,0.64,3.62);
      w3light(o,wx,1.0,4.2,'#ffcf80',4,0.6);
    }
    w3Door(b,dx,3.56,0.95,'#8a6240');
    b.sph(0.07,'#fff0b8',dx,1.28,3.66,{ key:'win' });
    w3light(o,dx,1.3,4.3,'#ffd890',5,1);
    /* 換気塔と旗 */
    b.cyl(0.2,0.24,1.0,12,'#8d94a8',3.9,2.1,1.1);
    b.cyl(0.3,0.3,0.1,12,'#b0b7c9',3.9,2.62,1.1);
    b.cyl(0.025,0.025,1.4,6,'#9aa1b5',0.8,2.2,1.2);
    b.box(0.55,0.34,0.03,'#e5372f',1.09,2.7,1.2);
    b.sph(0.07,'#4f9e42',1.09,2.74,1.225,{ sz:0.3 });
    b.sph(0.045,'#ffd15c',0.8,2.92,1.2);
    return b.build();
  },
  greenhouse(o,d,a){
    const on = hasUp('greenh');
    const b=B3(); const dx=w3doorX(o,d,a);
    b.box(5.8,0.14,4.8,'#4a4553',3,0.07,2.5);
    b.box(5.4,0.04,4.4, on? '#c9d4cf':'#8a9297',3,0.15,2.5);
    const fr = on? '#9fe6c8' : '#7d898f';
    const gl = on? '#c8fff0' : '#90a0a8';
    /* ガラスのかまぼこ */
    b.cyl(2.6,2.6,4.3,24, gl, 3,0.1,2.45, { rx:PI/2, key:'glass' });
    for (let z=0.35;z<=4.6;z+=0.72) b.torus(2.62,0.05,24,fr,3,0.1,z,{ arc:PI });
    b.box(0.08,0.08,4.3,fr,3,2.72,2.45);
    b.box(0.06,0.06,4.3,fr,3-1.84,1.94,2.45);
    b.box(0.06,0.06,4.3,fr,3+1.84,1.94,2.45);
    /* 扉 */
    b.box(0.95,1.35,0.08,fr,dx,0.78,4.62);
    b.box(0.75,1.2,0.04, on? '#8fd6b8':'#4a5058', dx,0.75,4.66, { key: on? 'glass':'toon' });
    if (!on){
      b.box(0.9,0.12,0.05,'#8a6240',dx,0.9,4.7,{ rz:0.35 });
      b.box(0.9,0.12,0.05,'#8a6240',dx,0.6,4.7,{ rz:-0.3 });
      b.box(0.5,0.4,0.02,'#2b3038',1.6,1.3,4.52);
      b.box(0.4,0.5,0.02,'#2b3038',4.3,1.0,4.52);
    }
    /* 中の緑 */
    if (on){
      for (let i=0;i<6;i++) for (let j=0;j<2;j++){
        const gx=0.9+i*0.85, gz=1.3+j*1.6;
        b.cyl(0.02,0.03,0.6,5,'#3f7d3a',gx,0.45,gz);
        b.sph(0.22,'#5cae4d',gx,0.72,gz,{ sy:0.8, seg:8 });
        b.sph(0.06,'#e5372f',gx+0.1,0.6,gz+0.15,{ seg:8 });
      }
      w3light(o,3,1.5,2.5,'#9fffd0',7,0.9);
    }
    return b.build();
  },
  shed(o,d,a){
    const b=B3(); const dx=w3doorX(o,d,a);
    b.box(4.8,0.12,3.7,'#4a4553',2.5,0.06,1.95);
    b.box(4.4,1.25,3.0,'#8a7766',2.5,0.745,2.05);
    for (let x=0.45;x<4.6;x+=0.3) b.box(0.03,1.2,0.02,'#6d5d50',x,0.74,3.56);
    b.prism(4.9,1.0,3.5,'#98a0b4',2.5,1.37,2.05,{ key:'flat' });
    for (let x=0.2;x<4.9;x+=0.35) b.prism(0.05,1.02,3.52,'#b3bacb',x+0.05,1.37,2.05,{ key:'flat' });
    b.box(0.34,0.8,0.34,'#6a5b4e',3.9,2.2,1.4);
    b.box(0.44,0.08,0.44,'#4d4238',3.9,2.62,1.4);
    /* 看板 */
    b.box(2.0,0.34,0.06,'#3a3f4d',2.5,1.2,3.6);
    b.sph(0.07,'#ff6b52',1.9,1.2,3.64,{ key:'win' });
    b.sph(0.07,'#ffd15c',2.5,1.2,3.64,{ key:'win' });
    b.sph(0.07,'#6fe0b0',3.1,1.2,3.64,{ key:'win' });
    w3Door(b,dx,3.56,0.95,'#7a6450');
    b.box(0.6,0.4,0.02,'#ffd98a',0.9,0.75,3.57,{ key:'win' });
    w3light(o,dx,1.2,4.3,'#ffcf80',5,0.9);
    const sx=o.x+3.9, sz=o.y+1.4;
    w3anim((t,dt)=>{ if (Math.random()<dt*5) w3emit(sx+(Math.random()-0.5)*0.1,2.7,sz, (Math.random()-0.5)*0.2,0.5,(Math.random()-0.5)*0.2,'#9aa0b0',2.2,0.55,-0.05); });
    return b.build();
  },
  tank(o,d,a){
    const b=B3(); const z=1.3;
    for (const [lx,lz] of [[-0.25,-0.25],[0.25,-0.25],[-0.25,0.25],[0.25,0.25]]) b.cyl(0.035,0.035,0.3,6,'#5e6b80',0.5+lx,0.15,z+lz);
    b.cyl(0.4,0.4,1.1,18,'#8a96ab',0.5,0.85,z,{ key:'shiny' });
    b.hemi(0.4,'#a8b3c6',0.5,1.4,z,{ seg:18, key:'shiny' });
    b.torus(0.4,0.03,20,'#5e6b80',0.5,0.4,z,{ rx:PI/2 });
    b.torus(0.4,0.03,20,'#5e6b80',0.5,1.3,z,{ rx:PI/2 });
    /* 水の窓 */
    b.box(0.34,0.72,0.04,'#3f8fbf',0.5,0.85,z+0.39,{ key:'glow', fn:(x,y)=> y>1.1? w3c('#bfe8ff'): null });
    b.box(0.2,0.1,0.14,'#b0b7c9',0.5,0.44,z+0.42);
    b.cyl(0.03,0.03,0.12,6,'#8d94a8',0.5,0.36,z+0.48);
    b.box(0.3,0.12,0.02,'#eef0f6',0.5,1.18,z+0.4);
    const px_=o.x+0.5, pz=o.y+z+0.5;
    w3anim((t,dt)=>{ if (Math.random()<dt*1.2) w3emit(px_,0.3,pz,0,-0.2,0,'#8fd0ff',0.6,0.12,8); });
    return b.build();
  },
  bin(o,d,a){
    const full = S.ship && S.ship.length>0;
    const b=B3();
    b.box(0.82,0.5,0.7,'#7a6450',0.5,0.27,0.52);
    b.box(0.86,0.06,0.74,'#9a8168',0.5,0.05,0.52);
    b.box(0.86,0.07,0.74,'#9a8168',0.5,0.5,0.52);
    for (const x of [0.13,0.87]) b.box(0.06,0.52,0.74,'#5b4a3a',x,0.27,0.52);
    b.box(0.3,0.16,0.02,'#e8c35c',0.5,0.3,0.88);
    b.box(0.86,0.05,0.4,'#8d94a8',0.5,0.72,0.2,{ rx:-1.1 });
    if (full){
      b.sph(0.12,'#e5372f',0.35,0.53,0.5,{ key:'fruit' });
      b.sph(0.11,'#f5b625',0.6,0.54,0.6,{ key:'fruit' });
      b.sph(0.1,'#6fd79a',0.55,0.55,0.38,{ key:'fruit' });
    }
    return b.build();
  },
  console(o,d,a){
    const b=B3(); const z=1.3, gi=S.gravIdx;
    b.box(0.8,0.1,0.6,'#3f4553',0.5,0.05,z);
    b.box(0.5,0.72,0.36,'#5a6274',0.5,0.46,z);
    b.box(0.68,0.06,0.5,'#787f92',0.5,0.85,z+0.05,{ rx:-0.5 });
    b.box(0.58,0.02,0.4,'#101726',0.5,0.885,z+0.07,{ rx:-0.5 });
    const cols=['#7fd6ff','#6fe0b0','#ffd15c','#ff8a6a'];
    for (let i=0;i<4;i++){
      const on = i<=gi;
      const h = 0.05+i*0.04;
      b.box(0.08,h,0.03, on? cols[i] : '#2b3a4a', 0.28+i*0.15, 0.9+h/2, z+0.05, { rx:-0.5, key: on? 'glow':'toon' });
    }
    b.cyl(0.04,0.04,0.9,6,'#8d94a8',0.5,1.3,z-0.12);
    b.torus(0.12,0.02,16,'#c9a6ff',0.5,1.72,z-0.12,{ key:'glow' });
    b.sph(0.06,'#c9a6ff',0.5,1.78,z-0.12,{ key:'glow' });
    w3light(o,0.5,1.2,z+0.4,'#c9a6ff',3.5,0.7);
    return b.build();
  },
  gate(o,d,a){
    const b=B3();
    const z=1.0;
    b.box(2.1,0.1,0.7,'#3f4553',1,0.05,z);
    b.box(0.26,1.9,0.34,'#8a96ab',0.14,0.95,z,{ key:'shiny' });
    b.box(0.26,1.9,0.34,'#8a96ab',1.86,0.95,z,{ key:'shiny' });
    b.box(2.2,0.26,0.4,'#a8b3c6',1,1.95,z,{ key:'shiny' });
    b.sph(0.06,'#6fe0b0',0.14,1.5,z+0.18,{ key:'glow' });
    b.sph(0.06,'#6fe0b0',1.86,1.5,z+0.18,{ key:'glow' });
    b.box(1.46,1.72,0.02,'#7fd6ff',1,0.94,z,{ key:'beam' });
    const g = b.build();
    /* 流れる光の筋 */
    const T=W3.T;
    const lines=[];
    for (let i=0;i<5;i++){
      const m = new T.Mesh(w3geo('box',1.4,0.03,0.03), W3.mats.glowCyan || (W3.mats.glowCyan=new T.MeshBasicMaterial({color:0xbff0ff, transparent:true, opacity:0.7, blending:T.AdditiveBlending, depthWrite:false, toneMapped:false})));
      m.position.set(1,0.1+i*0.35,z); g.add(m); lines.push(m);
    }
    w3anim((t)=>{ for (let i=0;i<lines.length;i++) lines[i].position.y = 0.1 + ((t*0.5 + i/lines.length)%1)*1.7; });
    w3light(o,1,1.2,z+0.6,'#7fd6ff',5,1);
    return g;
  },
  cave(o,d,a){
    const b=B3();
    b.geo(w3rockGeo(1, 7, 1), '#5e5868', 1.5,0.15,0.85, { sx:1.55, sy:1.05, sz:0.95, key:'flat' });
    b.geo(w3rockGeo(0.5, 11, 0), '#6b6575', 0.35,0.2,1.4, { key:'flat' });
    b.geo(w3rockGeo(0.45, 13, 0), '#6b6575', 2.7,0.15,1.35, { key:'flat' });
    b.cyl(0.46,0.46,0.12,16,'#0c0a12',1.5,0.52,1.72,{ rx:PI/2 });
    b.box(0.92,0.52,0.12,'#0c0a12',1.5,0.26,1.72);
    b.box(0.1,1.05,0.1,'#8d6a42',0.98,0.52,1.8);
    b.box(0.1,1.05,0.1,'#8d6a42',2.02,0.52,1.8);
    b.box(1.2,0.12,0.12,'#a5824f',1.5,1.06,1.8);
    b.sph(0.07,'#ffd15c',1.5,0.9,1.88,{ key:'glow' });
    b.box(0.05,0.03,0.8,'#6a7185',1.35,0.02,1.6);
    b.box(0.05,0.03,0.8,'#6a7185',1.65,0.02,1.6);
    for (let i=0;i<4;i++) b.box(0.4,0.03,0.06,'#6d4a2e',1.5,0.01,1.3+i*0.2);
    w3light(o,1.5,0.9,2.3,'#ffcf6a',4.5,1);
    return b.build();
  },
  stall(o,d,a){
    const b=B3();
    b.box(2.8,0.7,0.6,'#7a6450',1.5,0.35,1.55);
    b.box(2.9,0.08,0.7,'#a88c70',1.5,0.74,1.55);
    for (let x=0.3;x<2.8;x+=0.4) b.box(0.03,0.6,0.02,'#5b4a3a',x,0.35,1.86);
    b.box(2.9,1.3,0.3,'#5b4a3a',1.5,0.65,0.35);
    for (let s=0;s<2;s++) b.box(2.7,0.05,0.28,'#9a8168',1.5,0.6+s*0.4,0.45);
    for (let i=0;i<6;i++){
      b.sph(0.08,['#e5372f','#f5b625','#6fd79a','#ff6b52','#c9a6ff','#7fd6ff'][i],0.4+i*0.42,0.72,0.45,{ key:'fruit' });
      b.sph(0.07,['#f5b625','#e5372f','#ff6b52','#6fd79a','#e5372f','#f5b625'][i],0.5+i*0.4,1.12,0.45,{ key:'fruit' });
    }
    /* 縞の日よけ */
    for (let i=0;i<7;i++){
      b.box(0.43,0.05,1.5, i%2? '#e5372f':'#fbf0dc', 0.21+i*0.43, 1.62, 1.1, { rx:0.28 });
      b.sph(0.215, i%2? '#e5372f':'#fbf0dc', 0.21+i*0.43, 1.42, 1.84, { sy:0.5, sz:0.3, seg:10 });
    }
    b.cyl(0.04,0.04,1.55,8,'#8d94a8',0.1,0.78,1.8);
    b.cyl(0.04,0.04,1.55,8,'#8d94a8',2.9,0.78,1.8);
    /* 木箱に入ったトマト */
    for (const [cx,col] of [[0.6,'#e5372f'],[1.3,'#f5b625'],[2.1,'#6fd79a']]){
      b.box(0.5,0.16,0.36,'#8a6240',cx,0.86,1.55);
      for (let k=0;k<4;k++) b.sph(0.07,col,cx-0.12+(k%2)*0.24,0.97,1.47+(k>>1)*0.16,{ key:'fruit' });
    }
    b.box(0.5,0.3,0.03,'#fbf0dc',2.6,1.0,1.9,{ rx:-0.2 });
    b.box(0.3,0.04,0.01,'#e5372f',2.6,1.05,1.92,{ rx:-0.2 });
    w3light(o,1.5,1.4,2.2,'#ffd08a',5,1);
    return b.build();
  },
  workbench(o,d,a){
    const b=B3();
    b.box(1.85,0.1,0.72,'#a88c70',1,0.72,1.3);
    for (const [x,z] of [[0.15,1.0],[1.85,1.0],[0.15,1.6],[1.85,1.6]]) b.box(0.08,0.68,0.08,'#5a6274',x,0.34,z);
    b.box(1.8,0.06,0.6,'#6a5b4e',1,0.25,1.3);
    b.box(1.9,1.05,0.08,'#4d5468',1,1.25,0.92);
    for (let x=0.2;x<1.9;x+=0.2) for (let y=0.85;y<1.7;y+=0.2) b.box(0.02,0.02,0.01,'#6a7185',x,y,0.965);
    b.box(0.05,0.4,0.03,'#b9c0d0',0.3,1.3,0.98); b.box(0.16,0.07,0.03,'#8d6a42',0.3,1.08,0.98);
    b.cyl(0.02,0.02,0.45,6,'#9c6b3f',0.6,1.3,0.98); b.box(0.2,0.08,0.05,'#cfd6e6',0.6,1.5,0.98);
    b.torus(0.1,0.03,8,'#ffd15c',1.0,1.4,0.99);
    b.torus(0.07,0.025,8,'#e8c35c',1.25,1.2,0.99);
    b.box(0.3,0.08,0.03,'#8d94a8',1.55,1.5,0.98);
    b.box(0.3,0.08,0.03,'#8d94a8',1.55,1.3,0.98);
    b.box(0.34,0.16,0.24,'#5a6274',1.3,0.85,1.35);
    b.box(0.2,0.1,0.2,'#e5372f',0.6,0.82,1.4);
    b.cyl(0.02,0.02,0.35,6,'#8d94a8',1.75,0.95,1.1);
    b.cone(0.1,0.1,10,'#ffd15c',1.75,1.1,1.18,{ rx:1.2 });
    b.sph(0.05,'#fff4c0',1.75,1.07,1.24,{ key:'glow' });
    w3light(o,1.2,1.4,1.9,'#ffe2a0',4,0.9);
    return b.build();
  },
  terminal(o,d,a){
    const b=B3(); const z=1.3;
    b.box(0.86,0.1,0.6,'#3f4553',0.5,0.05,z);
    b.box(0.8,1.3,0.4,'#4d5468',0.5,0.72,z-0.05);
    b.box(0.8,0.06,0.44,'#6a7185',0.5,1.4,z-0.05);
    b.box(0.66,0.16,0.28,'#39404f',0.5,0.62,z+0.26,{ rx:0.4 });
    for (let i=0;i<5;i++) b.box(0.08,0.02,0.06,'#8d94a8',0.26+i*0.12,0.7,z+0.3,{ rx:0.4 });
    const g = b.build();
    const cv = mkCv(64,64), c = cv.getContext('2d');
    c.fillStyle='#0f2a3f'; c.fillRect(0,0,64,64);
    const cols=['#7fd6ff','#c9a6ff','#7fe0a8','#ffd15c'];
    for (let i=0;i<7;i++){ c.fillStyle=cols[i%4]; c.fillRect(6,6+i*7,10+((i*13)%38),3); }
    c.strokeStyle='#c9a6ff'; c.lineWidth=2; c.beginPath(); c.arc(46,46,9,0,6.3); c.stroke();
    c.fillStyle='rgba(143,230,255,0.2)'; for(let y=0;y<64;y+=3) c.fillRect(0,y,64,1);
    const scr = w3Board(cv, 0.62, 0.62);
    scr.position.set(0.5,1.02,z+0.16);
    g.add(scr);
    w3light(o,0.5,1.0,z+0.6,'#8fd6ff',4,0.9);
    return g;
  },
  pedestal(o,d,a){
    const b=B3();
    b.cyl(0.4,0.44,0.14,20,'#5a6274',0.5,0.07,0.5);
    b.cyl(0.3,0.36,0.14,20,'#787f92',0.5,0.21,0.5);
    b.torus(0.28,0.025,24,'#8fe6ff',0.5,0.29,0.5,{ rx:PI/2, key:'glow' });
    b.cyl(0.12,0.12,0.04,12,'#8fe6ff',0.5,0.3,0.5,{ key:'glow' });
    w3light(o,0.5,0.6,0.5,'#8fe6ff',3,0.8);
    return b.build();
  },
  bench(o,d,a){
    const b=B3();
    for (let i=0;i<3;i++) b.box(1.7,0.05,0.12,'#a88c70',1,0.42,0.38+i*0.14);
    for (let i=0;i<2;i++) b.box(1.7,0.1,0.04,'#a88c70',1,0.62+i*0.14,0.26,{ rx:-0.15 });
    for (const x of [0.2,1.8]){ b.box(0.07,0.42,0.4,'#5a6274',x,0.21,0.5); b.box(0.07,0.5,0.05,'#5a6274',x,0.66,0.26); }
    return b.build();
  },
  bed(o,d,a){
    const b=B3();
    b.box(0.92,0.28,1.86,'#7a5636',0.5,0.16,1.0);
    b.box(0.95,0.72,0.1,'#6b4a2e',0.5,0.36,0.1);
    b.box(0.8,0.14,1.7,'#f2f3f8',0.5,0.36,1.02);
    b.cap(0.1,0.42,'#ffffff',0.5,0.46,0.34,{ rz:PI/2, sy:1, sz:1.5 });
    b.box(0.86,0.12,1.14,'#d05a50',0.5,0.46,1.3);
    for (let i=0;i<3;i++) b.box(0.87,0.125,0.08,'#ee8a80',0.5,0.465,0.95+i*0.3);
    b.box(0.86,0.08,0.25,'#f4ddd0',0.5,0.51,0.75);
    return b.build();
  },
  kitchen(o,d,a){
    const b=B3();
    b.box(1.9,0.85,0.72,'#8a96ab',1,0.425,0.55);
    b.box(1.95,0.06,0.76,'#c3cad8',1,0.88,0.55);
    b.box(0.85,0.6,0.02,'#6a7690',0.5,0.4,0.92);
    b.box(0.85,0.6,0.02,'#6a7690',1.5,0.4,0.92);
    b.box(0.08,0.04,0.03,'#d9dce6',0.5,0.62,0.94); b.box(0.08,0.04,0.03,'#d9dce6',1.5,0.62,0.94);
    for (const [x,z] of [[0.35,0.4],[0.65,0.4],[0.35,0.7],[0.65,0.7]]) b.torus(0.08,0.02,10,'#ff8a4a',x,0.92,z,{ rx:PI/2, key:'glow' });
    b.cyl(0.16,0.14,0.2,14,'#b0b7c9',0.5,1.02,0.55,{ key:'shiny' });
    b.box(1.9,0.06,0.3,'#6b4a2e',1,1.5,0.2);
    b.cyl(0.07,0.07,0.16,8,'#e5372f',1.2,1.61,0.2);
    b.cyl(0.07,0.07,0.2,8,'#f5b625',1.45,1.63,0.2);
    b.cyl(0.06,0.06,0.14,8,'#6fd79a',1.7,1.6,0.2);
    b.box(0.5,0.3,0.3,'#e8eaf2',1.45,1.06,0.45);
    w3light(o,0.5,1.1,0.8,'#ffae6a',2.5,0.6);
    return b.build();
  },
  calendar(o,d,a){
    const b=B3();
    b.box(1.5,0.55,0.4,'#8a6240',1,0.275,0.25);
    b.box(1.55,0.05,0.44,'#a07854',1,0.56,0.25);
    b.cyl(0.08,0.07,0.16,10,'#ffffff',0.5,0.66,0.25);
    b.sph(0.1,'#e5372f',0.5,0.8,0.25,{ key:'fruit' });
    const g=b.build();
    const cv=mkCv(24,20), c=ctxOf(cv); drawCalendar(c,1,1);
    const bd=w3Board(cv,0.95,0.8,{ lit:true, transparent:true });
    bd.position.set(1.2,1.05,0.06); g.add(bd);
    return g;
  },
  poster(o,d,a){
    const b=B3();
    b.box(0.06,1.1,0.06,'#6b4a2e',0.55,0.55,0.55,{ rx:-0.12 });
    b.box(0.06,1.1,0.06,'#6b4a2e',1.45,0.55,0.55,{ rx:-0.12 });
    b.box(1.2,0.06,0.2,'#6b4a2e',1,0.45,0.62);
    const g=b.build();
    const cv=mkCv(22,18), c=ctxOf(cv); drawPoster(c,1,1);
    const bd=w3Board(cv,1.0,0.8,{ lit:true });
    bd.position.set(1,0.95,0.56); bd.rotation.x=-0.12; g.add(bd);
    return g;
  },
  note(o,d,a){
    const b=B3();
    b.box(0.8,0.06,0.6,'#a07854',0.5,0.6,0.5);
    for (const [x,z] of [[0.18,0.28],[0.82,0.28],[0.18,0.72],[0.82,0.72]]) b.box(0.06,0.6,0.06,'#6b4a2e',x,0.3,z);
    b.box(0.38,0.06,0.28,'#b8402f',0.5,0.66,0.5,{ ry:0.2 });
    b.box(0.34,0.05,0.25,'#f5eedc',0.5,0.67,0.5,{ ry:0.2 });
    b.box(0.04,0.01,0.2,'#ffd15c',0.62,0.7,0.5,{ ry:0.2 });
    const g=b.build();
    const x0=o.x+0.5, z0=o.y+0.5;
    w3anim((t,dt)=>{ if (Math.random()<dt*1.5) w3emit(x0+(Math.random()-0.5)*0.3,0.8,z0,0,0.3,0,'#ffe9a8',1.2,0.16,0); });
    return g;
  },
  slot(o,d,a){
    const m = S.machines && S.machines[o.n];
    const b=B3(); const z=1.3;
    b.box(0.9,0.08,0.7,'#353b48',0.5,0.04,z);
    if (!m){
      b.box(0.72,0.6,0.5,'#4d5468',0.5,0.38,z);
      b.box(0.74,0.04,0.52,'#727a8e',0.5,0.69,z);
      b.box(0.5,0.3,0.02,'#39404f',0.5,0.4,z+0.26);
      return b.build();
    }
    const busy = m.doneDay!=null && S.day2 < m.doneDay;
    const ready= m.doneDay!=null && S.day2 >= m.doneDay;
    b.box(0.8,0.8,0.56,'#6a7390',0.5,0.48,z,{ key:'shiny' });
    b.box(0.82,0.05,0.58,'#8a93aa',0.5,0.9,z);
    b.box(0.6,0.36,0.02,'#252b38',0.5,0.5,z+0.29);
    const t = m.type;
    if (t==='juicer'){
      b.cyl(0.2,0.16,0.45,14,'#ffd0c8',0.5,1.15,z,{ key:'glass' });
      b.cyl(0.17,0.14,0.3,14,'#e5372f',0.5,1.08,z,{ key:'fruit' });
      b.cyl(0.08,0.08,0.12,8,'#8d94a8',0.5,1.43,z);
    } else if (t==='ketchupper'){
      b.cyl(0.26,0.22,0.35,14,'#b8402f',0.5,1.1,z,{ key:'shiny' });
      b.cyl(0.03,0.05,0.25,8,'#a5acbe',0.5,1.35,z,{ rx:0.5 });
    } else if (t==='dryer'){
      for (let i=0;i<3;i++){
        b.box(0.62,0.03,0.42,'#a5acbe',0.5,0.98+i*0.14,z);
        for (let k=0;k<3;k++) b.cyl(0.06,0.06,0.02,8,'#d98a4a',0.3+k*0.2,1.0+i*0.14,z);
      }
      b.box(0.7,0.04,0.5,'#8d94a8',0.5,1.35,z);
    } else if (t==='saucepan'){
      b.cyl(0.28,0.24,0.24,16,'#b0b7c9',0.5,1.05,z,{ key:'shiny' });
      b.cyl(0.25,0.25,0.02,16,'#c94a32',0.5,1.16,z);
      b.torus(0.08,0.02,8,'#8d94a8',0.83,1.1,z,{ ry:PI/2 });
    } else if (t==='cask'){
      b.cyl(0.3,0.3,0.5,16,'#8a6240',0.5,1.15,z,{ rz:PI/2, sy:1.1 });
      b.torus(0.31,0.02,16,'#a5acbe',0.35,1.15,z,{ ry:PI/2 });
      b.torus(0.31,0.02,16,'#a5acbe',0.65,1.15,z,{ ry:PI/2 });
      b.cyl(0.04,0.04,0.06,8,'#4a3526',0.5,0.98,z+0.28,{ rx:PI/2 });
    }
    const lamp = ready? '#6fe0b0' : (busy? '#ffd15c' : '#5a3a3a');
    b.sph(0.05,lamp,0.8,0.8,z+0.29,{ key: ready||busy? 'glow':'toon' });
    const g = b.build();
    if (ready){
      const s = B3(); s.ico(0.12,'#6fe0b0',0,0,0,{ key:'glow' }); const gem = s.build();
      gem.position.set(0.5,1.75,z); g.add(gem);
      w3anim((tt)=>{ gem.position.y = 1.75 + Math.sin(tt*3)*0.08; gem.rotation.y = tt*2; });
      w3light(o,0.5,1.6,z,'#6fe0b0',3,0.9);
    }
    if (busy){
      const x0=o.x+0.5, z0=o.y+z;
      w3anim((tt,dt)=>{ if (Math.random()<dt*4) w3emit(x0+(Math.random()-0.5)*0.2,1.4,z0,0,0.45,0,'#ffffff',1.4,0.3,-0.05); });
    }
    return g;
  },
  ladderDn(o,d,a){
    const b=B3();
    b.cyl(0.42,0.42,0.03,20,'#0c0a12',0.5,0.012,0.5);
    b.torus(0.42,0.06,20,'#5c5666',0.5,0.02,0.5,{ rx:PI/2, key:'flat' });
    b.box(0.05,0.5,0.05,'#8d6a42',0.3,0.2,0.5); b.box(0.05,0.5,0.05,'#8d6a42',0.7,0.2,0.5);
    b.box(0.44,0.04,0.04,'#a5824f',0.5,0.3,0.5);
    w3light(o,0.5,0.5,0.5,'#ffcf6a',3,0.6);
    return b.build();
  },
  ladderUp(o,d,a){
    const b=B3();
    b.box(0.06,2.6,0.06,'#8d6a42',0.28,1.3,0.4); b.box(0.06,2.6,0.06,'#8d6a42',0.72,1.3,0.4);
    for (let i=0;i<8;i++) b.box(0.44,0.04,0.05,'#a5824f',0.5,0.2+i*0.32,0.4);
    b.cyl(0.5,0.5,3,16,'#fff2c0',0.5,1.5,0.45,{ key:'beam' });
    w3light(o,0.5,1.5,0.6,'#fff2c0',5,1.1);
    return b.build();
  },
  rock(o,d,a){
    const k = o.k||1;
    const base = k===1? '#77727f' : k===2? '#5f6a78' : '#84765f';
    const seed = o.x*31+o.y*17;
    const b=B3();
    b.geo(w3rockGeo(0.36, seed, 0), base, 0.5,0.22,0.5,{ sy:0.8, key:'flat' });
    b.geo(w3rockGeo(0.2, seed+5, 0), shade(base,12), 0.28,0.12,0.62,{ key:'flat' });
    if (k===2){
      b._push(w3geo('cone',0.07,0.3,4), '#7fd4ff', 0.6,0.45,0.55, { rz:-0.3, key:'glow' });
      b._push(w3geo('cone',0.05,0.2,4), '#bfe8ff', 0.42,0.42,0.68, { rz:0.4, key:'glow' });
      if (a.mine) w3light(o,0.5,0.6,0.5,'#7fd4ff',2.6,0.6);
    }
    if (k===3){
      b._push(w3geo('cone',0.08,0.28,4), '#ffd15c', 0.58,0.44,0.6, { rz:-0.2, key:'glow' });
      b._push(w3geo('cone',0.05,0.18,4), '#fff0a0', 0.4,0.4,0.66, { rz:0.5, key:'glow' });
      if (a.mine) w3light(o,0.5,0.6,0.5,'#ffd15c',3,0.8);
    }
    return b.build();
  },
  shrub(o,d,a){
    const seed=o.x*7+o.y*13;
    const b=B3();
    b.cyl(0.04,0.06,0.3,5,'#4a6b3a',0.5,0.15,0.5);
    const cl=[[0,0.36,0,0.3],[-0.18,0.28,0.08,0.22],[0.2,0.3,0.05,0.22],[0.02,0.52,-0.05,0.2],[0.05,0.25,0.2,0.18]];
    for (let i=0;i<cl.length;i++){
      const c=cl[i];
      b.geo(w3rockGeo(c[3], seed+i, 1), i%2? '#5f9b55':'#6fae5f', 0.5+c[0],c[1],0.5+c[2],{ key:'flat' });
    }
    for (let i=0;i<5;i++) b.sph(0.045,'#8fb8ff',0.5+Math.cos(i*1.3+seed)*0.25,0.3+hash2(i,seed,3)*0.25,0.5+Math.sin(i*1.3+seed)*0.2+0.08,{ key:'fruit', seg:8 });
    return b.build();
  },
  sign(o,d,a){
    const b=B3();
    b.box(0.08,0.8,0.08,'#8d6a42',0.5,0.4,0.55);
    b.box(0.8,0.46,0.07,'#c9a374',0.5,0.82,0.58);
    b.box(0.86,0.52,0.05,'#8d6a42',0.5,0.82,0.55);
    b.box(0.55,0.05,0.02,o.c||'#6d4a2e',0.5,0.9,0.62);
    b.box(0.4,0.05,0.02,o.c||'#6d4a2e',0.45,0.78,0.62);
    b.box(0.5,0.05,0.02,'#8a6a4a',0.5,0.68,0.62);
    return b.build();
  },
  fence(o,d,a){
    const b=B3();
    const vert = !!(objAt(a,o.x,o.y-1)&&objAt(a,o.x,o.y-1).t==='fence') || !!(objAt(a,o.x,o.y+1)&&objAt(a,o.x,o.y+1).t==='fence');
    if (vert){
      b.box(0.1,0.65,0.1,'#8d6a42',0.5,0.32,0.1); b.box(0.1,0.65,0.1,'#8d6a42',0.5,0.32,0.9);
      b.box(0.06,0.08,1.0,'#b08d5f',0.5,0.45,0.5); b.box(0.06,0.08,1.0,'#b08d5f',0.5,0.22,0.5);
    } else {
      b.box(0.1,0.65,0.1,'#8d6a42',0.1,0.32,0.5); b.box(0.1,0.65,0.1,'#8d6a42',0.9,0.32,0.5);
      b.box(1.0,0.08,0.06,'#b08d5f',0.5,0.45,0.5); b.box(1.0,0.08,0.06,'#b08d5f',0.5,0.22,0.5);
    }
    return b.build();
  },
  window(o,d,a){
    const b=B3();
    b.box(3.8,1.1,0.1,'#6a7185',2,0.95,0.96);
    b.box(0.08,1.0,0.06,'#8d94a8',1.35,0.95,1.02);
    b.box(0.08,1.0,0.06,'#8d94a8',2.65,0.95,1.02);
    b.box(3.9,0.1,0.25,'#8d94a8',2,0.36,1.05);
    const g=b.build();
    const cv=mkCv(96,26), c=ctxOf(cv);
    c.fillStyle='#0b0f22'; c.fillRect(0,0,96,26);
    for (let i=0;i<70;i++){ c.fillStyle='rgba(255,255,255,'+(0.3+hash2(i,o.x,71)*0.7).toFixed(2)+')'; c.fillRect((hash2(i,o.x,72)*96)|0,(hash2(i,o.x,73)*26)|0,1,1); }
    c.fillStyle='#d9a76a'; c.beginPath(); c.arc(78,30,18,0,6.3); c.fill();
    c.fillStyle='rgba(255,255,255,0.08)'; c.fillRect(0,0,96,8);
    const bd=w3Board(cv,3.6,0.95); bd.position.set(2,0.95,1.02); g.add(bd);
    return g;
  },
  planter(o,d,a){
    const b=B3();
    b.box(1.8,0.45,1.3,'#8a7058',1,0.225,1.1);
    b.box(1.86,0.06,1.36,'#a88c70',1,0.46,1.1);
    b.box(1.66,0.02,1.16,'#4a3728',1,0.47,1.1);
    const g=b.build();
    for (let i=0;i<3;i++){
      const p = w3MakePlant('comet', i===1?3:4, 0.8, { seed:i });
      p.scale.setScalar(0.7);
      p.position.set(0.45+i*0.55,0.47,1.0+(i%2)*0.2);
      g.add(p);
    }
    return g;
  },
  lamppost(o,d,a){
    const b=B3(); const z=1.4;
    b.cyl(0.18,0.22,0.12,12,'#3f4553',0.5,0.06,z);
    b.cyl(0.045,0.06,1.9,8,'#6a7185',0.5,1.0,z,{ key:'shiny' });
    b.cyl(0.24,0.16,0.1,12,'#8d94a8',0.5,2.0,z);
    b.sph(0.14,'#fff0b8',0.5,1.9,z,{ key:'win' });
    b.cone(0.26,0.14,12,'#8d94a8',0.5,2.1,z);
    w3light(o,0.5,1.85,z,'#ffe2a0',6.5,1.3);
    return b.build();
  },
  vend(o,d,a){
    const b=B3(); const z=1.3;
    b.box(0.86,1.55,0.62,'#4d5468',0.5,0.78,z,{ key:'shiny' });
    b.box(0.88,0.08,0.64,'#6a7185',0.5,1.58,z);
    b.box(0.2,0.3,0.02,'#2a3040',0.73,0.7,z+0.32);
    b.box(0.5,0.12,0.04,'#141b2b',0.36,0.2,z+0.31);
    const g=b.build();
    const cv=mkCv(32,48), c=ctxOf(cv);
    c.fillStyle='#141b2b'; c.fillRect(0,0,32,48);
    const cols=['#e5372f','#f5b625','#6fd79a','#7fd6ff','#c9a6ff'];
    for (let r=0;r<4;r++) for (let k=0;k<3;k++){ c.fillStyle=cols[(r*3+k)%5]; c.fillRect(3+k*10,4+r*11,6,8); c.fillStyle='rgba(255,255,255,0.5)'; c.fillRect(4+k*10,5+r*11,1,6); }
    c.fillStyle='rgba(127,214,255,0.25)'; c.fillRect(0,0,32,2);
    const bd=w3Board(cv,0.5,0.9); bd.position.set(0.36,0.95,z+0.315); g.add(bd);
    w3light(o,0.5,1.0,z+0.7,'#9fd8ff',3.5,0.8);
    return g;
  },
  crate(o,d,a){
    const b=B3();
    const r = (hash2(o.x,o.y,5)-0.5)*0.4;
    b.box(0.76,0.66,0.76,'#9a7048',0.5,0.33,0.5,{ ry:r });
    const edge='#6d4a2e';
    b.box(0.8,0.08,0.8,edge,0.5,0.04,0.5,{ ry:r }); b.box(0.8,0.08,0.8,edge,0.5,0.63,0.5,{ ry:r });
    b.box(0.08,0.66,0.8,edge,0.5,0.33,0.5,{ ry:r, pre:new W3.T.Matrix4().makeTranslation(-0.36,0,0) });
    b.box(0.08,0.66,0.8,edge,0.5,0.33,0.5,{ ry:r, pre:new W3.T.Matrix4().makeTranslation(0.36,0,0) });
    b.box(0.9,0.08,0.02,edge,0.5,0.33,0.5,{ ry:r, pre:new W3.T.Matrix4().makeRotationZ(0.72).setPosition(0,0,0.385) });
    return b.build();
  },
};

/* 3Dの形がまだ無いものは、2Dの絵を立て看板にして出す */
function w3Fallback(o,d){
  const T=W3.T;
  const cv = mkCv(d.w*TILE+16, d.h*TILE+32), g = ctxOf(cv);
  try { d.draw(g, 8, 24, o, S); } catch(e){}
  const sp = new T.Sprite(new T.SpriteMaterial({ map:w3Tex(cv,true), transparent:true }));
  sp.scale.set(cv.width/TILE, cv.height/TILE, 1);
  sp.center.set(0.5, 0.15);
  const grp = new T.Group(); sp.position.set(d.w/2, 0, d.h-0.1); grp.add(sp);
  return grp;
}

/* 状態で見た目が変わるものは、この文字列が変わったら作りなおす */
function w3ObjSig(o){
  if (o.gone) return 'gone';
  switch(o.t){
    case 'bin': return 'b'+(S.ship&&S.ship.length>0?1:0);
    case 'console': return 'c'+S.gravIdx;
    case 'greenhouse': return 'g'+(hasUp('greenh')?1:0);
    case 'slot': {
      const m = S.machines && S.machines[o.n];
      if (!m) return 's0';
      return 's'+m.type+(m.doneDay!=null && S.day2 < m.doneDay ? 'B':'')+(m.doneDay!=null && S.day2 >= m.doneDay ? 'R':'');
    }
    case 'rock': return 'r'+(o.k||1);
  }
  return '1';
}
