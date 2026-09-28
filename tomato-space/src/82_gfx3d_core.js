/* =========================================================================
   82_gfx3d_core.js  —  3DS風の立体表示：土台（描画器・材質・形の組み立て）
   three.js が使えない環境では W3.on = false のまま、元の2D表示で動く。
   ========================================================================= */

const W3 = {
  on:false, T:null, renderer:null, cv:null,
  scene:null, camera:null,
  mats:{}, texCache:{}, geoCache:{},
  grad:null,
  w:1, h:1, dpr:1,
};

/* ---------------------------------------------------------------- 起動 */
function w3Init(){
  try {
    const T = (typeof window!=='undefined') ? window.THREE : null;
    const cv = (typeof document!=='undefined' && document.getElementById) ? document.getElementById('g3d') : null;
    if (!T || !cv || !cv.getContext) return false;
    if (typeof location!=='undefined' && /[?&]2d\b/.test(location.search||'')) return false;
    const renderer = new T.WebGLRenderer({ canvas:cv, antialias:true, alpha:false,
                                           powerPreference:'high-performance', preserveDrawingBuffer:false });
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.NoToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.setClearColor(0x05060c, 1);
    W3.T = T; W3.renderer = renderer; W3.cv = cv;

    /* 3段の陰影（トゥーン）。3DSのやわらかいアニメ調の陰 */
    const g = new Uint8Array([96, 176, 255]);
    const gt = new T.DataTexture(g, 3, 1, T.RedFormat);
    gt.minFilter = T.NearestFilter; gt.magFilter = T.NearestFilter; gt.needsUpdate = true;
    W3.grad = gt;

    w3InitMats();
    w3InitParticles();
    w3InitScene();
    w3InitTitle();
    W3.on = true;
    return true;
  } catch(e){
    if (typeof console!=='undefined') console.warn('3D表示を使えないため2Dで動かします', e);
    W3.on = false;
    return false;
  }
}

function w3Resize(cssW, cssH, dpr){
  if (!W3.on) return;
  W3.dpr = Math.min(2, dpr||1);
  W3.w = cssW; W3.h = cssH;
  W3.renderer.setPixelRatio(W3.dpr);
  W3.renderer.setSize(cssW, cssH, false);
  W3.cv.style.width = cssW+'px'; W3.cv.style.height = cssH+'px';
  for (const cam of [W3.camera, W3.tCam]){
    if (!cam) continue;
    cam.aspect = cssW/cssH; cam.updateProjectionMatrix();
  }
}

/* ---------------------------------------------------------------- 色 */
const _w3col = {};
function w3c(hex){
  /* 文字の色 → three の Color（線形）。同じ色は使いまわす */
  let c = _w3col[hex];
  if (!c){ c = new W3.T.Color(); c.setStyle(hex); _w3col[hex] = c; }
  return c;
}

/* ---------------------------------------------------------------- 材質 */
function w3InitMats(){
  const T = W3.T, M = W3.mats;
  M.toon  = new T.MeshToonMaterial({ vertexColors:true, gradientMap:W3.grad });
  /* 角ばった面（岩など）。面ごとの向きは形の側で計算する */
  M.flat  = new T.MeshToonMaterial({ vertexColors:true, gradientMap:W3.grad, side:T.DoubleSide });
  M.flatDS = M.flat;
  M.shiny = new T.MeshPhongMaterial({ vertexColors:true, shininess:80, specular:0x8899aa, flatShading:false });
  M.glow  = new T.MeshBasicMaterial({ vertexColors:true, toneMapped:false });
  /* 夜になると灯る窓（色の掛け算を毎フレーム変える） */
  M.win   = new T.MeshBasicMaterial({ vertexColors:true, toneMapped:false });
  M.glass = new T.MeshPhongMaterial({ vertexColors:true, transparent:true, opacity:0.38, shininess:120,
                                      specular:0xffffff, depthWrite:false, side:T.DoubleSide });
  M.visor = new T.MeshPhongMaterial({ vertexColors:true, transparent:true, opacity:0.22, shininess:140,
                                      specular:0xffffff, depthWrite:false });
  M.holo  = new T.MeshBasicMaterial({ vertexColors:true, transparent:true, opacity:0.62,
                                      blending:T.AdditiveBlending, depthWrite:false, toneMapped:false });
  M.beam  = new T.MeshBasicMaterial({ vertexColors:true, transparent:true, opacity:0.22,
                                      blending:T.AdditiveBlending, depthWrite:false, side:T.DoubleSide, toneMapped:false });
  M.fruit = new T.MeshPhongMaterial({ vertexColors:true, shininess:70, specular:0x5a4a4a });
  M.fruitGlow = new T.MeshPhongMaterial({ vertexColors:true, shininess:90, specular:0x8899ff,
                                          emissive:0x2a3a88, emissiveIntensity:1 });
  M.fruitRain = new T.MeshPhongMaterial({ vertexColors:true, shininess:90, specular:0xffffff,
                                          emissive:0x442255, emissiveIntensity:1 });
  M.outline = new T.MeshBasicMaterial({ color:0x221a2a, side:T.BackSide });
  M.outline.onBeforeCompile = (sh)=>{
    sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>',
      'vec3 transformed = vec3(position) + normalize(normal) * 0.022;');
  };
  /* 地面の上に貼る目じるし */
  M.cursor = new T.MeshBasicMaterial({ map:w3CursorTex(), transparent:true, depthWrite:false, toneMapped:false });
  M.blob = new T.MeshBasicMaterial({ map:w3BlobTex(), transparent:true, depthWrite:false, opacity:0.55 });
}

/* ---------------------------------------------------------------- 手描きのテクスチャ */
function w3Tex(cv, nearest){
  const T = W3.T;
  const t = new T.CanvasTexture(cv);
  t.colorSpace = T.SRGBColorSpace;
  if (nearest){ t.magFilter = T.NearestFilter; t.minFilter = T.LinearMipmapLinearFilter; }
  t.anisotropy = 4;
  return t;
}
function w3CursorTex(){
  const c = mkCv(64,64), g = c.getContext('2d');
  g.strokeStyle='rgba(255,255,255,0.95)'; g.lineWidth=5;
  const r=12;
  g.beginPath();
  g.moveTo(6+r,6); g.lineTo(58-r,6); g.quadraticCurveTo(58,6,58,6+r);
  g.lineTo(58,58-r); g.quadraticCurveTo(58,58,58-r,58);
  g.lineTo(6+r,58); g.quadraticCurveTo(6,58,6,58-r);
  g.lineTo(6,6+r); g.quadraticCurveTo(6,6,6+r,6); g.closePath(); g.stroke();
  g.fillStyle='rgba(120,220,255,0.18)'; g.fill();
  return w3Tex(c,false);
}
function w3BlobTex(){
  const c = mkCv(64,64), g = c.getContext('2d');
  const rg = g.createRadialGradient(32,32,0,32,32,32);
  rg.addColorStop(0,'rgba(0,0,0,0.9)'); rg.addColorStop(0.6,'rgba(0,0,0,0.45)'); rg.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=rg; g.fillRect(0,0,64,64);
  return w3Tex(c,false);
}
function w3SoftTex(){
  const c = mkCv(64,64), g = c.getContext('2d');
  const rg = g.createRadialGradient(32,32,0,32,32,32);
  rg.addColorStop(0,'rgba(255,255,255,1)'); rg.addColorStop(0.35,'rgba(255,255,255,0.8)');
  rg.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=rg; g.fillRect(0,0,64,64);
  /* 十字のきらめき */
  g.fillStyle='rgba(255,255,255,0.9)';
  g.fillRect(30,4,4,56); g.fillRect(4,30,56,4);
  return w3Tex(c,false);
}

/* ================================================================
   形の組み立て係（B）
   いくつもの箱や球を、材質ごとに1つの形へまとめて描く回数を減らす。
   ================================================================ */
function B3(){
  return new _B3();
}
function _B3(){ this.parts = {}; this.extra = []; }
_B3.prototype._push = function(geo, col, x,y,z, o){
  const T = W3.T;
  o = o||{};
  let g = geo.index ? geo.toNonIndexed() : geo.clone();
  if (g.attributes.uv) g.deleteAttribute('uv');
  if (g.attributes.uv1) g.deleteAttribute('uv1');
  const m = new T.Matrix4();
  const q = new T.Quaternion().setFromEuler(new T.Euler(o.rx||0, o.ry||0, o.rz||0, o.order||'XYZ'));
  m.compose(new T.Vector3(x||0,y||0,z||0), q, new T.Vector3(o.sx||1, o.sy||1, o.sz||1));
  if (o.pre) g.applyMatrix4(o.pre);
  g.applyMatrix4(m);
  const post = o.post || this.post;
  if (post) g.applyMatrix4(post);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n*3);
  const base = w3c(col);
  const pos = g.attributes.position.array;
  for (let i=0;i<n;i++){
    let r=base.r, gg=base.g, b=base.b;
    if (o.grad){  /* 下にいくほど暗く（y で線形にまぜる） */
      const yy = pos[i*3+1];
      const t = Math.max(0, Math.min(1, (yy - o.grad[0]) / (o.grad[1]-o.grad[0])));
      const c2 = w3c(o.grad[2]);
      r = c2.r + (r-c2.r)*t; gg = c2.g + (gg-c2.g)*t; b = c2.b + (b-c2.b)*t;
    }
    if (o.fn){ const cc = o.fn(pos[i*3],pos[i*3+1],pos[i*3+2], i); if (cc){ r=cc.r; gg=cc.g; b=cc.b; } }
    arr[i*3]=r; arr[i*3+1]=gg; arr[i*3+2]=b;
  }
  g.setAttribute('color', new T.BufferAttribute(arr,3));
  const k = o.key || 'toon';
  (this.parts[k] = this.parts[k] || []).push(g);
  return this;
};
_B3.prototype.box = function(w,h,d, col, x,y,z, o){
  return this._push(w3geo('box',w,h,d), col, x,y,z, o);
};
_B3.prototype.cyl = function(rt,rb,h,seg, col, x,y,z, o){
  return this._push(w3geo('cyl',rt,rb,h,seg||10), col, x,y,z, o);
};
_B3.prototype.sph = function(r, col, x,y,z, o){
  const seg = (o&&o.seg)||12;
  return this._push(w3geo('sph',r,seg,Math.max(4,Math.round(seg*0.7))), col, x,y,z, o);
};
_B3.prototype.ico = function(r, col, x,y,z, o){
  return this._push(w3geo('ico',r,(o&&o.detail)||0), col, x,y,z, o);
};
_B3.prototype.cone = function(r,h,seg, col, x,y,z, o){
  return this._push(w3geo('cone',r,h,seg||8), col, x,y,z, o);
};
_B3.prototype.torus = function(r,t,seg, col, x,y,z, o){
  return this._push(w3geo('torus',r,t,seg||16, (o&&o.arc)||Math.PI*2), col, x,y,z, o);
};
_B3.prototype.cap = function(r,len, col, x,y,z, o){
  return this._push(w3geo('cap',r,len), col, x,y,z, o);
};
_B3.prototype.geo = function(geo, col, x,y,z, o){ return this._push(geo, col, x,y,z, o); };
_B3.prototype.mesh = function(m){ this.extra.push(m); return this; };
/* まとめて1つの Group に */
_B3.prototype.build = function(opt){
  const T = W3.T;
  opt = opt||{};
  const grp = new T.Group();
  for (const k in this.parts){
    const list = this.parts[k];
    const geo = list.length===1 ? list[0] : W3.T.mergeGeometries(list, false);
    if (k==='flat') geo.computeVertexNormals();   /* ばらばらの三角形なので面ごとの向きになる */
    const mat = W3.mats[k] || W3.mats.toon;
    const mesh = new T.Mesh(geo, mat);
    const lit = (k==='toon'||k==='flat'||k==='shiny'||k==='fruit'||k==='fruitGlow'||k==='fruitRain');
    mesh.castShadow = lit && opt.shadow!==false;
    mesh.receiveShadow = lit;
    if (k==='glass'||k==='holo'||k==='beam'||k==='visor') mesh.renderOrder = 2;
    grp.add(mesh);
    if (opt.outline && (k==='toon'||k==='shiny')){
      const ol = new T.Mesh(geo, W3.mats.outline);
      grp.add(ol);
    }
  }
  for (const m of this.extra) grp.add(m);
  return grp;
};
/* 同じ寸法の形は作りなおさない */
function w3geo(kind, a,b,c,d){
  const key = kind+':'+a+':'+b+':'+c+':'+d;
  let g = W3.geoCache[key];
  if (g) return g;
  const T = W3.T;
  if (kind==='box') g = new T.BoxGeometry(a,b,c);
  else if (kind==='cyl') g = new T.CylinderGeometry(a,b,c,d);
  else if (kind==='sph') g = new T.SphereGeometry(a,b,c);
  else if (kind==='ico') g = new T.IcosahedronGeometry(a,b);
  else if (kind==='cone') g = new T.ConeGeometry(a,b,c);
  else if (kind==='torus') g = new T.TorusGeometry(a,b,6,c,d);
  else if (kind==='cap') g = new T.CapsuleGeometry(a,b,4,10);
  else if (kind==='hemi') g = new T.SphereGeometry(a,b,c,0,Math.PI*2,0,Math.PI/2);
  else if (kind==='prism') g = w3prismGeo(a,b,c);
  W3.geoCache[key] = g;
  return g;
}

/* 切妻屋根の三角柱。棟は x 方向。幅 w（x）・高さ h・奥行 d（z） */
function w3prismGeo(w,h,d){
  const T = W3.T;
  const x0=-w/2, x1=w/2, z0=-d/2, z1=d/2;
  const A=[x0,0,z1], B=[x0,0,z0], C=[x0,h,0], D=[x1,0,z1], E=[x1,0,z0], F=[x1,h,0];
  const tris = [ A,C,B,  D,E,F,   A,D,F, A,F,C,   B,C,F, B,F,E,   A,B,E, A,E,D ];
  const pos = new Float32Array(tris.length*3);
  for (let i=0;i<tris.length;i++){ pos[i*3]=tris[i][0]; pos[i*3+1]=tris[i][1]; pos[i*3+2]=tris[i][2]; }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.BufferAttribute(pos,3));
  g.computeVertexNormals();
  return g;
}
_B3.prototype.hemi = function(r, col, x,y,z, o){
  const seg=(o&&o.seg)||16;
  return this._push(w3geo('hemi',r,seg,Math.max(4,seg>>1)), col, x,y,z, o);
};
_B3.prototype.prism = function(w,h,d, col, x,y,z, o){
  return this._push(w3geo('prism',w,h,d), col, x,y,z, o);
};

/* 岩のように角をランダムにずらした形 */
function w3rockGeo(r, seed, detail){
  const T = W3.T;
  const g = new T.IcosahedronGeometry(r, detail||0);
  const p = g.attributes.position;
  const seen = {};
  for (let i=0;i<p.count;i++){
    const x=p.getX(i), y=p.getY(i), z=p.getZ(i);
    const k = x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);
    let f = seen[k];
    if (f==null){ f = 0.78 + hash2(i*7+seed, seed*3+1, 991)*0.44; seen[k]=f; }
    p.setXYZ(i, x*f, y*f, z*f);
  }
  g.computeVertexNormals();
  return g;
}

/* 絵（キャンバス）を板に貼る。看板・画面など */
function w3Board(cv, w, h, opt){
  const T = W3.T;
  opt = opt||{};
  const tex = w3Tex(cv, opt.nearest!==false);
  const mat = opt.lit ? new T.MeshToonMaterial({ map:tex, gradientMap:W3.grad, transparent:!!opt.transparent })
                      : new T.MeshBasicMaterial({ map:tex, transparent:!!opt.transparent, toneMapped:false });
  const m = new T.Mesh(new T.PlaneGeometry(w,h), mat);
  return m;
}

/* ================================================================
   粒子（水しぶき・きらめき・土くれ）
   ================================================================ */
const W3P = { max:900, n:0, pos:null, col:null, size:null, alpha:null, list:[], geo:null, pts:null };
function w3InitParticles(){
  const T = W3.T;
  const N = W3P.max;
  W3P.pos = new Float32Array(N*3); W3P.col = new Float32Array(N*3);
  W3P.size = new Float32Array(N); W3P.alpha = new Float32Array(N);
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(W3P.pos,3));
  geo.setAttribute('color', new T.BufferAttribute(W3P.col,3));
  geo.setAttribute('size', new T.BufferAttribute(W3P.size,1));
  geo.setAttribute('alpha', new T.BufferAttribute(W3P.alpha,1));
  geo.setDrawRange(0,0);
  const mat = new T.ShaderMaterial({
    uniforms:{ map:{ value:w3SoftTex() }, scale:{ value:400 } },
    vertexShader:`
      attribute float size; attribute float alpha; attribute vec3 color;
      varying vec3 vC; varying float vA;
      uniform float scale;
      void main(){
        vC = color; vA = alpha;
        vec4 mv = modelViewMatrix * vec4(position,1.0);
        gl_PointSize = size * scale / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader:`
      uniform sampler2D map; varying vec3 vC; varying float vA;
      void main(){
        vec4 t = texture2D(map, gl_PointCoord);
        gl_FragColor = vec4(vC, t.a * vA);
        if (gl_FragColor.a < 0.02) discard;
      }`,
    transparent:true, depthWrite:false, blending:T.AdditiveBlending,
  });
  W3P.geo = geo;
  W3P.pts = new T.Points(geo, mat);
  W3P.pts.frustumCulled = false;
  W3P.pts.renderOrder = 5;
  W3P.mat = mat;
}
/* 1粒だす。x,y,z 位置 / vx,vy,vz 速さ / col 色 / life 秒 / size 大きさ / grav 重力 */
function w3emit(x,y,z, vx,vy,vz, col, life, size, grav){
  if (W3P.list.length >= W3P.max) W3P.list.shift();
  const c = w3c(col);
  W3P.list.push({ x,y,z, vx,vy,vz, r:c.r,g:c.g,b:c.b, t:0, life:life||0.8, size:size||0.2, grav:grav==null?6:grav });
}
function w3updParticles(dt){
  const L = W3P.list;
  let n = 0;
  for (let i=L.length-1;i>=0;i--){
    const p = L[i];
    p.t += dt;
    if (p.t >= p.life){ L.splice(i,1); continue; }
  }
  for (const p of L){
    p.vy -= p.grav*dt;
    p.x += p.vx*dt; p.y += p.vy*dt; p.z += p.vz*dt;
    if (p.y < 0.02 && p.grav>0){ p.y = 0.02; p.vy *= -0.3; p.vx*=0.6; p.vz*=0.6; }
    const k = p.t/p.life;
    W3P.pos[n*3]=p.x; W3P.pos[n*3+1]=p.y; W3P.pos[n*3+2]=p.z;
    W3P.col[n*3]=p.r; W3P.col[n*3+1]=p.g; W3P.col[n*3+2]=p.b;
    W3P.size[n] = p.size * (k<0.15? k/0.15 : 1);
    W3P.alpha[n] = k>0.6 ? (1-k)/0.4 : 1;
    n++;
  }
  const g = W3P.geo;
  g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true;
  g.attributes.size.needsUpdate = true; g.attributes.alpha.needsUpdate = true;
  g.setDrawRange(0,n);
  W3P.mat.uniforms.scale.value = W3.h * W3.dpr * 0.9;
}
