/* =========================================================================
   84_gfx3d_scene.js  —  3DS風の立体表示：地形・カメラ・光・毎フレームの描画
   ========================================================================= */

W3.lightSrc = [];
W3.anims = [];

function w3InitScene(){
  const T = W3.T;
  const sc = new T.Scene();
  W3.scene = sc;
  W3.camera = new T.PerspectiveCamera(32, 16/10, 0.1, 900);

  /* 光：空と地面の照り返し＋太陽（影を落とす） */
  W3.hemi = new T.HemisphereLight(0xcfe0ff, 0x6a5040, 1.0);
  sc.add(W3.hemi);
  W3.amb = new T.AmbientLight(0xffffff, 0.25);
  sc.add(W3.amb);
  const sun = new T.DirectionalLight(0xffffff, 2.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048,2048);
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 3;
  const sc2 = sun.shadow.camera;
  sc2.left=-16; sc2.right=16; sc2.top=16; sc2.bottom=-16; sc2.near=1; sc2.far=80;
  sc.add(sun); sc.add(sun.target);
  W3.sun = sun;
  /* 灯り（近いものから順にわりあてる） */
  W3.lamps = [];
  for (let i=0;i<6;i++){
    const l = new T.PointLight(0xffd890, 0, 6, 1.6);
    sc.add(l); W3.lamps.push(l);
  }
  W3.pLamp = new T.PointLight(0xffd8a0, 0, 7, 1.4);
  sc.add(W3.pLamp);

  /* 宇宙（星空の球・惑星） */
  W3.space = w3MakeSpace();
  sc.add(W3.space);

  /* 地形・物・人を入れる箱 */
  W3.areaGrp = new T.Group(); sc.add(W3.areaGrp);
  W3.cropGrp = new T.Group(); sc.add(W3.cropGrp);
  W3.itemGrp = new T.Group(); sc.add(W3.itemGrp);
  W3.npcGrp  = new T.Group(); sc.add(W3.npcGrp);

  W3.player = w3MakePlayer();
  sc.add(W3.player.root);

  /* 目のまえのマスの目じるし */
  const cur = new T.Mesh(new T.PlaneGeometry(1,1), W3.mats.cursor);
  cur.rotation.x = -PI/2; cur.renderOrder = 3; cur.visible=false;
  sc.add(cur); W3.cursor = cur;

  sc.add(W3P.pts);

  W3.area = null; W3.areaObj = null;
  W3.crops = {}; W3.npcs = {}; W3.objs = [];
  W3.camT = null;
  W3.fxSeen = new WeakSet();
}

/* ================================================================ 宇宙 */
function w3SpaceTex(season){
  const w=2048, h=1024;
  const cv = mkCv(w,h), g = cv.getContext('2d');
  const S0 = SEASONS[season||0];
  const gr = g.createLinearGradient(0,0,0,h);
  gr.addColorStop(0, S0.sky[0]); gr.addColorStop(0.5, S0.sky[1]); gr.addColorStop(1, S0.sky[2]);
  g.fillStyle = gr; g.fillRect(0,0,w,h);
  /* 星雲 */
  const neb = [['rgba(255,110,150,',0.2,0.62],['rgba(110,160,255,',0.55,0.35],['rgba(180,120,255,',0.8,0.7],['rgba(90,220,200,',0.35,0.82]];
  for (const n of neb){
    for (let k=0;k<5;k++){
      const x=w*(n[1]+ (hash2(k,season,1)-0.5)*0.15), y=h*(n[2]+(hash2(k,season,2)-0.5)*0.15);
      const r=120+hash2(k,season,3)*220;
      const rg=g.createRadialGradient(x,y,0,x,y,r);
      rg.addColorStop(0,n[0]+'0.16)'); rg.addColorStop(1,n[0]+'0)');
      g.fillStyle=rg; g.fillRect(x-r,y-r,r*2,r*2);
    }
  }
  g.globalAlpha=1;
  const t = w3Tex(cv,false);
  return t;
}
/* 星（点で描くのでぼやけない） */
function w3Stars(){
  const T = W3.T;
  const grp = new T.Group();
  for (const [n, size, seed] of [[2600,1.6,1],[500,2.6,2],[90,3.8,3]]){
    const pos = new Float32Array(n*3), col = new Float32Array(n*3);
    for (let i=0;i<n;i++){
      const u = hash2(i,seed,11)*2-1, th = hash2(i,seed,12)*PI*2;
      const r = Math.sqrt(1-u*u);
      pos[i*3]=Math.cos(th)*r*380; pos[i*3+1]=u*380; pos[i*3+2]=Math.sin(th)*r*380;
      const b = hash2(i,seed,13);
      const c = w3c(b>0.9? '#ffe9b0' : (b>0.75? '#b8d8ff' : '#ffffff'));
      const k = 0.55 + 0.45*hash2(i,seed,14);
      col[i*3]=c.r*k; col[i*3+1]=c.g*k; col[i*3+2]=c.b*k;
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos,3));
    g.setAttribute('color', new T.BufferAttribute(col,3));
    const m = new T.PointsMaterial({ size:size*Math.min(2,(typeof window!=='undefined'&&window.devicePixelRatio)||1), sizeAttenuation:false, vertexColors:true,
                                     map:W3.starTex || (W3.starTex = w3StarDot()), transparent:true, depthWrite:false, fog:false, toneMapped:false });
    const p = new T.Points(g, m);
    p.renderOrder = -9;
    grp.add(p);
  }
  return grp;
}
function w3StarDot(){
  const c = mkCv(16,16), g = c.getContext('2d');
  const rg = g.createRadialGradient(8,8,0,8,8,8);
  rg.addColorStop(0,'rgba(255,255,255,1)'); rg.addColorStop(0.4,'rgba(255,255,255,0.8)'); rg.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=rg; g.fillRect(0,0,16,16);
  return w3Tex(c,false);
}
function w3PlanetTex(){
  const cv = mkCv(256,128), g = cv.getContext('2d');
  const cols=['#e8c89a','#d9a76a','#f0dcb4','#c58a52','#e8c89a','#b8764a','#f2e2c2','#d49a60','#e8c89a'];
  for (let y=0;y<128;y++){
    const k = y/128*cols.length;
    const i = Math.floor(k), f = k-i;
    g.fillStyle = mix(cols[i%cols.length], cols[(i+1)%cols.length], f);
    g.fillRect(0,y,256,1);
  }
  for (let i=0;i<60;i++){
    g.fillStyle='rgba(255,255,255,'+(0.05+hash2(i,4,4)*0.1).toFixed(2)+')';
    g.fillRect(hash2(i,1,1)*256, hash2(i,2,2)*128, 20+hash2(i,3,3)*60, 2);
  }
  g.fillStyle='rgba(180,90,60,0.8)'; g.beginPath(); g.ellipse(170,80,16,8,0,0,6.3); g.fill();
  return w3Tex(cv,false);
}
function w3RingTex(){
  const cv = mkCv(256,8), g = cv.getContext('2d');
  for (let x=0;x<256;x++){
    const a = (0.15 + 0.6*hash2(x>>2,0,9)) * (x<20||x>236? 0.3:1);
    g.fillStyle = 'rgba(236,214,176,'+a.toFixed(2)+')';
    g.fillRect(x,0,1,8);
  }
  return w3Tex(cv,false);
}
function w3MakeSpace(){
  const T = W3.T;
  const grp = new T.Group();
  const sky = new T.Mesh(new T.SphereGeometry(420, 32, 16),
    new T.MeshBasicMaterial({ map:w3SpaceTex(0), side:T.BackSide, depthWrite:false, fog:false, toneMapped:false }));
  sky.renderOrder = -10;
  grp.add(sky); W3.sky = sky; W3.skySeason = 0;
  grp.add(w3Stars());
  /* 環のある惑星 */
  const pl = new T.Group();
  const planet = new T.Mesh(new T.SphereGeometry(60, 48, 24), new T.MeshLambertMaterial({ map:w3PlanetTex() }));
  pl.add(planet);
  const ringGeo = new T.RingGeometry(80, 128, 96, 1);
  /* 環のテクスチャを半径方向に貼る */
  const pos = ringGeo.attributes.position, uv = ringGeo.attributes.uv;
  for (let i=0;i<pos.count;i++){ const r=Math.hypot(pos.getX(i),pos.getY(i)); uv.setXY(i,(r-80)/48,0.5); }
  const ring = new T.Mesh(ringGeo, new T.MeshBasicMaterial({ map:w3RingTex(), transparent:true, side:T.DoubleSide, depthWrite:false, toneMapped:false }));
  ring.rotation.x = -PI/2 + 0.35; ring.rotation.y = 0.25;
  pl.add(ring);
  pl.rotation.z = 0.25;
  W3.planet = pl; W3.planetMesh = planet;
  grp.add(pl);
  /* 遠くの小惑星 */
  W3.rocks = [];
  for (let i=0;i<9;i++){
    const r = 0.6 + hash2(i,5,5)*2.4;
    const m = new T.Mesh(w3rockGeo(r, i*13, 1), W3.mats.flat);
    const col = new Float32Array(m.geometry.attributes.position.count*3);
    const c = w3c(i%3? '#6d6474':'#80705e');
    for (let k=0;k<col.length;k+=3){ col[k]=c.r; col[k+1]=c.g; col[k+2]=c.b; }
    m.geometry.setAttribute('color', new T.BufferAttribute(col,3));
    m.userData = { a: hash2(i,6,6)*PI*2, d: 28+hash2(i,7,7)*26, y: -6-hash2(i,8,8)*18, s: 0.02+hash2(i,9,9)*0.05 };
    grp.add(m); W3.rocks.push(m);
  }
  return grp;
}

/* ================================================================ 地形 */
function w3GroundCanvas(a){
  const cv = mkCv(a.w*TILE, a.h*TILE);
  return cv;
}
/* 地面の絵をかきなおす（耕した・水をやった などを反映） */
function w3PaintGround(){
  const a = W3.areaObj; if (!a) return;
  const g = W3.gctx;
  g.clearRect(0,0,a.w*TILE,a.h*TILE);
  for (let y=0;y<a.h;y++) for (let x=0;x<a.w;x++){
    const t = tileAt(a,x,y);
    if (!t.tile) continue;
    const vs = TILES[t.tile];
    const px_ = x*TILE, py_ = y*TILE;
    g.drawImage(vs[(x*3+y*7)%vs.length], px_, py_);
    const st = S.tiles[key(S.area,x,y)];
    if (st && st.till){
      const set = st.wet? TILES.wet : TILES.till;
      g.drawImage(set[(x*5+y*3)%set.length], px_, py_);
      if (st.fert){
        const fc = st.fert==='f_basic'?'#6fe0b0': st.fert==='f_sweet'?'#ffe9a8':'#b8e4ff';
        for (let i=0;i<5;i++) px(g, px_+2+((i*7+x)%12), py_+2+((i*5+y)%12), 1,1, fc);
      }
    }
  }
  /* 季節の地面（霜・砂ぼこり・影） */
  if (a.sky){
    const sid = SEASONS[S.season].id;
    const ov = sid==='shimo'? 'rgba(225,238,255,0.24)' : sid==='arashi'? 'rgba(190,150,110,0.14)' : sid==='kage'? 'rgba(60,50,110,0.18)' : null;
    if (ov){
      g.fillStyle = ov;
      for (let y=0;y<a.h;y++) for (let x=0;x<a.w;x++){
        const t = tileAt(a,x,y);
        if (!t.tile || t.tile==='deck' || t.tile==='deckl' || t.farm) continue;
        g.fillRect(x*TILE,y*TILE,TILE,TILE);
        if (sid==='shimo') for (let i=0;i<5;i++) px(g, x*TILE+((hash2(x,y,i)*15)|0), y*TILE+((hash2(y,x,i+9)*15)|0), 1,1, 'rgba(255,255,255,0.9)');
      }
    }
  }
  W3.gtex.needsUpdate = true;
}
/* 地面の状態を文字列にして、変わったときだけ描きなおす */
function w3GroundSig(){
  let s = 'S'+S.season+';';
  const pre = S.area+':';
  for (const k in S.tiles){
    if (k.lastIndexOf(pre,0)!==0) continue;
    const t = S.tiles[k];
    if (t.till) s += k + (t.wet?'w':'') + (t.fert||'') + ';';
  }
  return s;
}

function w3IsWall(a,x,y){ const t=tileAt(a,x,y); return !!(t.tile && t.solid); }
function w3IsFloor(a,x,y){ const t=tileAt(a,x,y); return !!(t.tile && !t.solid); }

function w3BuildTerrain(a){
  const T = W3.T;
  const grp = new T.Group();
  const outdoor = !!a.sky;

  /* 地面のテクスチャ */
  const cv = w3GroundCanvas(a);
  W3.gctx = ctxOf(cv);
  W3.gtex = w3Tex(cv, true);
  W3.gtex.generateMipmaps = true;
  W3.groundSig = null;

  /* 壁の高さ：部屋の手前の壁は低くして中が見えるように */
  const wallH = (x,y)=>{
    if (a.mine){
      if (w3IsFloor(a,x,y-1)) return 0.34;
      return 0.9 + hash2(x,y,31)*0.5;
    }
    if (w3IsFloor(a,x,y-1)) return 0.3;
    return a.indoor ? 1.55 : 1.6;
  };

  const pos=[], uv=[], nor=[];
  const quad = (ax,ay,az, bx,by,bz, cx,cy,cz, dx,dy,dz, u0,v0,u1,v1, n)=>{
    /* a b c d：反時計回り */
    pos.push(ax,ay,az, bx,by,bz, cx,cy,cz,  ax,ay,az, cx,cy,cz, dx,dy,dz);
    uv.push(u0,v0, u1,v0, u1,v1,  u0,v0, u1,v1, u0,v1);
    for (let i=0;i<6;i++) nor.push(n[0],n[1],n[2]);
  };
  const W=a.w, H=a.h;
  const U = (x)=>x/W, V=(y)=>1-y/H;
  /* 壁（色つき）とがけ（色つき）の形 */
  const wb = B3();
  const cliffCol = a.mine? '#2c2934' : '#6a5647';
  for (let y=0;y<H;y++) for (let x=0;x<W;x++){
    const t = tileAt(a,x,y);
    if (!t.tile) continue;
    if (t.solid){
      const h = wallH(x,y);
      /* 上面（床の絵を使う） */
      quad(x,h,y+1, x+1,h,y+1, x+1,h,y, x,h,y, U(x),V(y+1),U(x+1),V(y), [0,1,0]);
      let top='#6a6272', side='#57505f', low='#3a3540';
      if (a.id==='houseIn'){ top='#8a6a50'; side='#f1e4cf'; low='#b48a62'; }
      else if (a.id==='shedIn'){ top='#6a5b4e'; side='#b49b7e'; low='#6d5d50'; }
      else if (a.id==='greenIn'){ top='#7f9a90'; side='#d6efe6'; low='#8fb5a8'; }
      else if (a.id==='station'){ top='#5a6274'; side='#8d94a8'; low='#4a5060'; }
      else if (a.mine){ top='#4a4556'; side='#3b3746'; low='#221f29'; }
      /* 側面は周りが床のときだけ */
      const sides = [[0,1,[0,0,1]],[0,-1,[0,0,-1]],[1,0,[1,0,0]],[-1,0,[-1,0,0]]];
      for (const s of sides){
        const nx=x+s[0], ny=y+s[1];
        const nt = tileAt(a,nx,ny);
        if (nt.tile && nt.solid && wallH(nx,ny)>=h-0.01) continue;
        if (!nt.tile && !outdoor) continue;
        const bx = x+0.5+s[0]*0.5, bz = y+0.5+s[1]*0.5;
        const ww = s[0]? 0.001 : 1, dd = s[1]? 0.001 : 1;
        wb.box(ww, h, dd, side, bx, h/2, bz, { key: a.mine? 'flat':'toon', grad:[0,h,low] });
        /* 腰板・幅木 */
        if (!a.mine && a.indoor && h>1) wb.box(ww+(s[0]?0.02:0), 0.3, dd+(s[1]?0.02:0), low, bx+s[0]*0.005, 0.15, bz+s[1]*0.005);
      }
      /* 上面のふち */
      if (!a.mine) wb.box(1.0, 0.04, 1.0, top, x+0.5, h+0.005, y+0.5, { sx:1.001, sz:1.001 });
    } else {
      quad(x,0,y+1, x+1,0,y+1, x+1,0,y, x,0,y, U(x),V(y+1),U(x+1),V(y), [0,1,0]);
    }
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.Float32BufferAttribute(pos,3));
  geo.setAttribute('normal', new T.Float32BufferAttribute(nor,3));
  geo.setAttribute('uv', new T.Float32BufferAttribute(uv,2));
  const gmat = new T.MeshToonMaterial({ map:W3.gtex, gradientMap:W3.grad });
  const ground = new T.Mesh(geo, gmat);
  ground.receiveShadow = true;
  grp.add(ground);
  W3.groundMat = gmat;

  /* 小惑星のがけと、宇宙に浮かぶ岩の塊（下にいくほど細る） */
  if (outdoor){
    /* 宇宙までの距離（何マス内側か） */
    const dist = [];
    for (let y=0;y<H;y++){ dist.push([]); for (let x=0;x<W;x++) dist[y].push(tileAt(a,x,y).tile? 99 : 0); }
    for (let it=0; it<20; it++){
      let ch=false;
      for (let y=0;y<H;y++) for (let x=0;x<W;x++){
        if (!dist[y][x]) continue;
        let m = 99;
        for (const d of [[1,0],[-1,0],[0,1],[0,-1]]){
          const nx=x+d[0], ny=y+d[1];
          const v = (nx<0||ny<0||nx>=W||ny>=H)? 0 : dist[ny][nx];
          m = Math.min(m, v+1);
        }
        if (m<dist[y][x]){ dist[y][x]=m; ch=true; }
      }
      if (!ch) break;
    }
    const tdep = (x,y)=> 1.6 + Math.min(dist[y][x],9)*1.25 + hash2(x,y,77)*0.9;
    /* 角ごとの深さ（周りのマスの最小） */
    const cdep = (i,j)=>{
      let m = 1e9, any=false;
      for (const d of [[0,0],[-1,0],[0,-1],[-1,-1]]){
        const x=i+d[0], y=j+d[1];
        if (x<0||y<0||x>=W||y>=H||!tileAt(a,x,y).tile) continue;
        any=true; m = Math.min(m, tdep(x,y));
      }
      return any? m : 0;
    };
    const rp=[];
    const tri=(p1,p2,p3)=>{ rp.push(...p1,...p2,...p3); };
    for (let y=0;y<H;y++) for (let x=0;x<W;x++){
      if (!tileAt(a,x,y).tile) continue;
      /* 底 */
      const A=[x,-cdep(x,y),y], Bq=[x+1,-cdep(x+1,y),y], C=[x+1,-cdep(x+1,y+1),y+1], D=[x,-cdep(x,y+1),y+1];
      tri(A,C,Bq); tri(A,D,C);
      /* がけ */
      const edges = [
        [0,1, [x,y+1],[x+1,y+1]],
        [0,-1,[x+1,y],[x,y]],
        [1,0, [x+1,y+1],[x+1,y]],
        [-1,0,[x,y],[x,y+1]],
      ];
      for (const e of edges){
        if (tileAt(a,x+e[0],y+e[1]).tile) continue;
        const p=e[2], q=e[3];
        const dp = cdep(p[0],p[1]), dq = cdep(q[0],q[1]);
        const P0=[p[0],0,p[1]], Q0=[q[0],0,q[1]], P1=[p[0],-dp,p[1]], Q1=[q[0],-dq,q[1]];
        /* 途中に段をつけて岩っぽく */
        const mid = 0.35+hash2(x,y,e[0]*3+e[1]+5)*0.15;
        const jx = e[0]*0.12, jz = e[1]*0.12;
        const PM=[p[0]+jx, -dp*mid, p[1]+jz], QM=[q[0]+jx, -dq*mid, q[1]+jz];
        tri(P0,Q0,QM); tri(P0,QM,PM);
        tri(PM,QM,Q1); tri(PM,Q1,P1);
      }
    }
    const rg = new T.BufferGeometry();
    rg.setAttribute('position', new T.Float32BufferAttribute(rp,3));
    rg.computeVertexNormals();
    const col = new Float32Array(rp.length);
    const cTop = w3c(a.id==='station'? '#6f7486':'#8f7058'), cMid=w3c(a.id==='station'? '#4d5162':'#6b5563'), cBot=w3c('#2c2436');
    const tmp = new T.Color();
    for (let i=0;i<rp.length;i+=3){
      const d = -rp[i+1];
      const n = hash2(Math.floor(rp[i]*3),Math.floor(rp[i+2]*3),5)*0.12;
      if (d<0.4) tmp.copy(cTop).lerp(cMid, d/0.4);
      else tmp.copy(cMid).lerp(cBot, Math.min(1,(d-0.4)/9));
      col[i]=tmp.r*(1-n); col[i+1]=tmp.g*(1-n); col[i+2]=tmp.b*(1-n);
    }
    rg.setAttribute('color', new T.BufferAttribute(col,3));
    const rm = new T.Mesh(rg, W3.mats.flatDS);
    rm.receiveShadow = true;
    grp.add(rm);
    /* ふちの草・小石 */
    w3Tufts(a, grp);
  }
  if (a.indoor && !a.mine){
    /* 部屋の外は黒い床板で囲う */
    const pl = new T.Mesh(new T.PlaneGeometry(W+40,H+40), new T.MeshBasicMaterial({ color:0x07080f }));
    pl.rotation.x = -PI/2; pl.position.set(W/2,-0.02,H/2);
    grp.add(pl);
  }
  const wg = wb.build();
  grp.add(wg);
  return grp;
}

/* 苔の上の草むら・レゴリスの上の小石（まとめて1回で描く） */
function w3Tufts(a, grp){
  const T = W3.T;
  const b = B3();
  for (let y=0;y<a.h;y++) for (let x=0;x<a.w;x++){
    const t = tileAt(a,x,y);
    if (!t.tile || t.solid) continue;
    if (objAt(a,x,y)) continue;
    const h = hash2(x,y,41);
    if (t.tile==='moss'){
      for (let k=0;k<3;k++){
        const ox = hash2(x*3+k,y,42), oz = hash2(x,y*3+k,43);
        const col = k%2? '#6fa95f' : '#5f9155';
        for (let j=0;j<3;j++) b.cone(0.03,0.16+hash2(k,j,x)*0.1,3,col,x+0.15+ox*0.7+(j-1)*0.04,0.07,y+0.15+oz*0.7,{ rz:(j-1)*0.35, key:'flat' });
      }
    } else if (t.tile==='rego' && h>0.9){
      b.geo(w3rockGeo(0.07+hash2(x,y,44)*0.07, x*7+y, 0), '#7a6250', x+0.2+hash2(x,y,45)*0.6, 0.03, y+0.2+hash2(x,y,46)*0.6, { sy:0.6, key:'flat' });
    } else if (t.tile==='rego' && h>0.84){
      for (let j=0;j<3;j++) b.cone(0.025,0.12,3,'#7f9a5a',x+0.3+hash2(x,y,47)*0.4+(j-1)*0.04,0.05,y+0.3+hash2(x,y,48)*0.4,{ rz:(j-1)*0.4, key:'flat' });
    }
  }
  if (Object.keys(b.parts).length) grp.add(b.build({ shadow:false }));
}

/* ================================================================ 片づけ */
/* 使い終わった形・材質をGPUから下ろす（共有しているものは残す） */
function w3Dispose(root){
  const keepGeo = new Set(Object.values(W3.geoCache));
  const keepMat = new Set(Object.values(W3.mats));
  if (W3.fadeCache) for (const k in W3.fadeCache) keepMat.add(W3.fadeCache[k]);
  const keepTex = new Set([W3.arrowTex, W3.starTex].concat(Object.values(W3.iconTex||{})));
  root.traverse(m=>{
    if (m.geometry && !keepGeo.has(m.geometry)) m.geometry.dispose();
    const mats = m.material ? (Array.isArray(m.material)? m.material : [m.material]) : [];
    for (const mt of mats){
      if (keepMat.has(mt)) continue;
      if (mt.map && !keepTex.has(mt.map)) mt.map.dispose();
      mt.dispose();
    }
  });
}

/* ================================================================ 場所の組み立て */
function w3EnterArea(){
  const T = W3.T;
  const a = areaOf(S.area);
  W3.area = S.area; W3.areaObj = a; W3.objArr = a.objs; W3.objLen = (a.objs||[]).length;
  /* 片づけ */
  const clear = (g, dispose)=>{
    while (g.children.length){ const c = g.children[0]; g.remove(c); if (dispose) w3Dispose(c); }
  };
  if (W3.gtex){ W3.gtex.dispose(); W3.gtex = null; }
  /* 作物は形を使いまわしているので下ろさない。人は場所ごとに作りなおす */
  clear(W3.areaGrp, true); clear(W3.cropGrp, false); clear(W3.itemGrp, true); clear(W3.npcGrp, true);
  W3.crops = {}; W3.npcs = {}; W3.objs = []; W3.items = [];
  W3.lightSrc = []; W3.anims = [];
  W3.areaGrp.add(w3BuildTerrain(a));
  for (const o of a.objs||[]) W3.objs.push({ o, sig:null, grp:null });
  w3WarpMarks(a);
  w3SyncObjs(true);
  W3.space.visible = !!a.sky;
  W3.camT = null;
  if (a.sky && W3.skySeason !== S.season){
    W3.sky.material.map.dispose();
    W3.sky.material.map = w3SpaceTex(S.season);
    W3.sky.material.needsUpdate = true;
    W3.skySeason = S.season;
  }
}
/* 出入り口の床に光る矢印 */
function w3ArrowTex(){
  const c = mkCv(64,64), g = c.getContext('2d');
  g.fillStyle='rgba(255,255,255,0.95)';
  for (let k=0;k<2;k++){
    const y = 14 + k*20;
    g.beginPath(); g.moveTo(12,y); g.lineTo(32,y+16); g.lineTo(52,y); g.lineTo(52,y+8); g.lineTo(32,y+24); g.lineTo(12,y+8); g.closePath(); g.fill();
  }
  return w3Tex(c,false);
}
function w3WarpMarks(a){
  const T = W3.T;
  const ws = (a.warps||[]).slice();
  if (a.mine && a.upWarp) ws.push({ x:a.upWarp.x, y:a.upWarp.y, skip:true });
  W3.arrowTex = W3.arrowTex || w3ArrowTex();
  const done = {};
  for (const w of ws){
    if (w.skip) continue;
    /* 向き：部屋の中なら外（下）へ。外なら、となりのゲートのほうへ */
    let dir = null;
    if (a.indoor) dir = [0,1];
    else {
      for (const d of [[0,1],[0,-1],[1,0],[-1,0]]){
        const o = objAt(a, w.x+d[0], w.y+d[1]);
        if (o && (o.t==='gate')) { dir = d; break; }
      }
    }
    if (!dir) continue;
    const k = w.to+':'+dir; if (done[k]) continue; done[k]=1;
    /* 同じ行き先の出口は、まとめて真ん中に1つ */
    const same = ws.filter(q=>q.to===w.to);
    const cx = same.reduce((p,q)=>p+q.x,0)/same.length + 0.5;
    const cz = same.reduce((p,q)=>p+q.y,0)/same.length + 0.5;
    const m = new T.Mesh(new T.PlaneGeometry(0.8,0.8), new T.MeshBasicMaterial({
      map:W3.arrowTex, color:0x8fe0ff, transparent:true, depthWrite:false, blending:T.AdditiveBlending, toneMapped:false }));
    m.rotation.x = -PI/2;
    m.rotation.z = Math.atan2(dir[0], dir[1]);
    m.position.set(cx, 0.03, cz);
    m.renderOrder = 3;
    W3.areaGrp.add(m);
    w3anim((t)=>{ m.material.opacity = 0.45 + Math.sin(t*4)*0.3; m.position.y = 0.03; });
  }
}
function w3SyncObjs(force){
  const a = W3.areaObj;
  for (const e of W3.objs){
    const sig = w3ObjSig(e.o);
    if (!force && sig===e.sig) continue;
    /* 作りなおすと灯り・仕掛けが二重になるので、その物の分を消す */
    if (e.grp){
      W3.areaGrp.remove(e.grp);
      w3Dispose(e.grp);
      W3.lightSrc = W3.lightSrc.filter(l=>l.obj!==e.o);
      W3.anims = W3.anims.filter(f=>f.obj!==e.o);
    }
    e.sig = sig; e.grp = null; e.faded = false;
    if (sig==='gone') continue;
    const d = OBJDEF[e.o.t]; if (!d) continue;
    const fn = W3OBJ[e.o.t];
    let g;
    W3._curObj = e.o;
    try { g = fn ? fn(e.o, d, a) : w3Fallback(e.o, d); }
    catch(err){ g = w3Fallback(e.o, d); }
    W3._curObj = null;
    g.position.set(e.o.x, 0, e.o.y);
    W3.areaGrp.add(g);
    e.grp = g;
  }
}

/* ================================================================ 作物 */
function w3SyncCrops(){
  const T = W3.T;
  const seen = {};
  const pre = S.area+':';
  for (const k in S.crops){
    if (k.lastIndexOf(pre,0)!==0) continue;
    const c = S.crops[k];
    const xy = k.slice(pre.length).split(',').map(Number);
    const st = cropStage(c);
    const V = VARIETIES[c.v];
    const grav = GRAVITY_STEPS[c.gi!=null?c.gi:S.gravIdx];
    let size = grav.size * (c.fert==='f_giant'?1.3:1) * (1+(c.elite||0)*0.08);
    if (V && V.lowG && grav.g<1) size*=1.2;
    const opt = { seed:c.seed||0, fallen:c.fallen, dead:c.dead };
    const sig = w3PlantKey(c.v, st, size, opt);
    seen[k] = 1;
    let e = W3.crops[k];
    if (e && e.sig===sig) continue;
    if (e) W3.cropGrp.remove(e.m);
    let proto = W3.plantCache && W3.plantCache[sig];
    if (!proto){
      W3.plantCache = W3.plantCache || {};
      proto = w3MakePlant(c.v, st, size, opt);
      W3.plantCache[sig] = proto;
    }
    const m = proto.clone();
    m.position.set(xy[0]+0.5, 0, xy[1]+0.55);
    m.scale.setScalar(1.4);
    m.rotation.y = ((c.seed||0)%7)/7*PI*2 * (opt.fallen? 0:1);
    W3.cropGrp.add(m);
    W3.crops[k] = { m, sig, c, x:xy[0], y:xy[1], seed:c.seed||0 };
  }
  for (const k in W3.crops) if (!seen[k]){ W3.cropGrp.remove(W3.crops[k].m); delete W3.crops[k]; }
}

/* ================================================================ 落ちもの */
function w3SyncItems(){
  const T = W3.T;
  const want = S.ground.filter(g=>g.area===S.area);
  if (W3.items.length===want.length && W3.items.every((e,i)=>e.g===want[i])) return;
  for (const e of W3.items){ W3.itemGrp.remove(e.sp); W3.itemGrp.remove(e.sh); e.sp.material.dispose(); }
  W3.items = want.map(g=>{
    W3.iconTex = W3.iconTex || {};
    let tex = W3.iconTex[g.id];
    if (!tex){ const cv=mkCv(16,16); drawIcon(ctxOf(cv),g.id,0,0,1); tex=w3Tex(cv,true); W3.iconTex[g.id]=tex; }
    const sp = new T.Sprite(new T.SpriteMaterial({ map:tex, transparent:true }));
    sp.scale.set(0.55,0.55,1);
    sp.position.set(g.x+0.5,0.4,g.y+0.5);
    W3.itemGrp.add(sp);
    const sh = new T.Mesh(w3geo('cyl',0.18,0.18,0.01,12), W3.mats.blob);
    sh.position.set(g.x+0.5,0.01,g.y+0.5);
    W3.itemGrp.add(sh);
    return { g, sp, sh };
  });
}

/* ================================================================ 住民 */
function w3SyncNPCs(){
  const list = Game.npcs[S.area] || [];
  for (const n of list){
    if (!W3.npcs[n.id]){
      const m = w3MakeNPC(n.id);
      W3.npcGrp.add(m.root);
      W3.npcs[n.id] = m;
    }
  }
}

/* ================================================================ 光と時間 */
function w3Env(){
  const a = W3.areaObj;
  const t = S.time;
  let dark = 0;
  if (a.mine) dark = 0.8;
  else if (a.indoor) dark = isNight()? 0.3 : 0.05;
  else {
    if (t < 420) dark = 0.62*(420-t)/60;
    else if (t > 1050) dark = Math.min(0.82, (t-1050)/260*0.82);
    if (SEASONS[S.season].id==='kage') dark = Math.max(dark, 0.55);
    if (S.weather==='outage') dark = Math.min(0.9, dark+0.25);
  }
  dark = Math.max(0, Math.min(0.92, dark));
  return dark;
}
function w3Lighting(dark){
  const T = W3.T;
  const a = W3.areaObj;
  const sid = SEASONS[S.season].id;
  const t = S.time;
  const day = 1-dark;
  /* 太陽の色：朝は桃色、昼は白、夕方は橙、夜は青 */
  let sunC = new T.Color('#fff6e8');
  if (a.sky){
    if (t < 480) sunC.set('#ffc8a8');
    else if (t > 960) sunC.set(mix('#fff6e8','#ff9a5a', Math.min(1,(t-960)/200)));
    if (sid==='arashi') sunC.lerp(new T.Color('#e8c0ff'),0.3);
    if (sid==='shimo') sunC.lerp(new T.Color('#cfe6ff'),0.45);
    if (sid==='kage') sunC.lerp(new T.Color('#b8a0ff'),0.5);
    if (S.weather==='flare'){ const p=0.5+0.5*Math.max(0,Math.sin(Game.time*0.9)); sunC.lerp(new T.Color('#fff0b0'), p*0.6); }
  }
  const nightC = new T.Color('#5a6cc8');
  if (a.mine){
    W3.sun.intensity = 0.0;
    W3.hemi.color.set('#6a5a9a'); W3.hemi.groundColor.set('#201828'); W3.hemi.intensity = 0.55;
    W3.amb.color.set('#403858'); W3.amb.intensity = 0.35;
  } else if (a.indoor){
    W3.sun.intensity = isNight()? 0.5 : 1.2;
    W3.sun.color.set(isNight()? '#ffcf9a' : '#fff4e0');
    W3.hemi.color.set(isNight()? '#ffd8b0':'#fff4e8'); W3.hemi.groundColor.set('#7a6050'); W3.hemi.intensity = isNight()? 1.0 : 1.15;
    W3.amb.color.set('#ffffff'); W3.amb.intensity = 0.25;
  } else {
    W3.sun.intensity = 2.8*day + 0.12;
    W3.sun.color.copy(sunC).lerp(nightC, dark*0.9);
    W3.hemi.color.set('#d8e6ff').lerp(new T.Color('#4050a0'), dark);
    W3.hemi.groundColor.set('#7a5a48').lerp(new T.Color('#1a1830'), dark);
    W3.hemi.intensity = 1.05 - dark*0.72;
    W3.amb.color.set('#ffffff').lerp(new T.Color('#6070c0'), dark);
    W3.amb.intensity = 0.28 - dark*0.12;
    if (S.weather==='dust'){ W3.hemi.color.lerp(new T.Color('#e0b080'),0.35); }
  }
  /* 太陽の向き：東から西へ */
  const tgt = W3.camT;
  const f = Math.max(0, Math.min(1, (t-360)/(1140-360)));
  const az = -1.1 + f*2.2;
  W3.sun.position.set(tgt.x + Math.sin(az)*14, 22, tgt.z + 10 + Math.cos(az)*2);
  W3.sun.target.position.set(tgt.x, 0, tgt.z);
  W3.sun.shadow.camera.updateProjectionMatrix();

  /* 窓の灯り */
  const nightGlow = a.mine? 1 : Math.min(1, dark*1.8 + (a.indoor? 0.4:0));
  W3.mats.win.color.setRGB(0.55+0.45*nightGlow, 0.62+0.38*nightGlow, 0.75+0.1*nightGlow);

  /* 近い灯りから順に */
  const px_ = S.px/TILE, pz = S.py/TILE;
  const L = W3.lightSrc.slice().sort((p,q)=> (Math.hypot(p.x-px_,p.z-pz) - Math.hypot(q.x-px_,q.z-pz)));
  const lampOn = Math.min(1, dark*1.6) + (a.indoor&&!a.mine? 0.25:0);
  for (let i=0;i<W3.lamps.length;i++){
    const l = W3.lamps[i], s = L[i];
    if (!s || lampOn<=0.02){ l.intensity = 0; continue; }
    l.position.set(s.x, s.y, s.z);
    l.color.set(s.col);
    l.distance = s.r;
    l.intensity = s.str * lampOn * 2.2;
  }
  if (hasUp('lamp') && S.area==='home' && dark>0.2){
    /* 農場の照明（ナツキの工房の設備） */
    const l = W3.lamps[W3.lamps.length-1];
    l.position.set(13, 3, 12); l.distance=14; l.color.set('#fff0c8'); l.intensity = dark*3;
  }
  /* 自分の手もとの灯り */
  const pl = W3.pLamp;
  pl.position.set(px_, 2.4, pz+0.9);
  pl.intensity = a.mine? 3.6 : (dark>0.25? dark*2.4 : 0);
  pl.distance = a.mine? 8.5 : 6;
  pl.color.set(a.mine? '#ffcf8a' : '#ffe6c0');
}

/* ================================================================ カメラ */
function w3UpdateCamera(dt){
  const a = W3.areaObj;
  const tx = S.px/TILE, tz = (S.py-4)/TILE;
  const zoom = a.mine? 0.8 : (a.indoor? 0.86 : 1.0);
  const asp = W3.w/Math.max(1,W3.h);
  const dist = 19.5*zoom * (asp<0.9? 1.6 : (asp<1.3? 1.25 : 1));
  const pitch = 0.84;
  const cam = W3.camera;
  /* いま映っている範囲（注視点から北・南・横に何マス見えるか） */
  const half = cam.fov*PI/360;
  const hgt = dist*Math.sin(pitch), off = dist*Math.cos(pitch);
  const north = hgt/Math.tan(pitch-half) - off;
  const south = off - hgt/Math.tan(pitch+half);
  const side = Math.tan(half)*asp*dist*0.92;
  const m = a.sky? 2.2 : 0.4;
  let cx = tx, cz = tz;
  if (a.w <= side*2 - m*2) cx = a.w/2;
  else cx = Math.max(side-m, Math.min(a.w-side+m, cx));
  if (a.h <= north+south - m*2) cz = (a.h + north - south)/2;
  else cz = Math.max(north-m-0.6, Math.min(a.h-south+m, cz));
  if (!W3.camT) W3.camT = { x:cx, z:cz };
  const k = 1-Math.pow(0.001, dt);
  W3.camT.x += (cx-W3.camT.x)*k;
  W3.camT.z += (cz-W3.camT.z)*k;
  let sx=0, sz=0;
  if (Game.shake>0){ sx=(Math.random()-0.5)*Game.shake*0.25; sz=(Math.random()-0.5)*Game.shake*0.25; }
  cam.position.set(W3.camT.x+sx, hgt, W3.camT.z + off + sz);
  cam.lookAt(W3.camT.x+sx, 0, W3.camT.z+sz);
  /* 宇宙は遠くにあるので、カメラについてくる */
  W3.space.position.set(cam.position.x, 0, cam.position.z);
  W3.planet.position.set(95, -175, -250);
}

/* ================================================================ 毎フレーム */
function w3Frame(dt){
  const T = W3.T;
  const a = areaOf(S.area);
  if (!a) return;
  /* 場所が変わった・置いてあるものが増えた（隕石の石など）ときは組みなおす */
  if (W3.area !== S.area || W3.areaObj !== a || W3.objArr !== a.objs || W3.objLen !== (a.objs||[]).length) w3EnterArea();
  w3UpdateCamera(dt);
  const dark = w3Env();
  w3Lighting(dark);

  /* 地面の絵 */
  if ((Game.time - (W3.gTime||0)) > 0.12){
    W3.gTime = Game.time;
    const sig = w3GroundSig();
    if (sig !== W3.groundSig){ W3.groundSig = sig; w3PaintGround(); }
  }
  w3SyncObjs(false);
  w3SyncCrops();
  w3SyncItems();
  w3SyncNPCs();

  const tm = Game.time;
  /* 作物のゆれ・実ったもののきらめき */
  for (const k in W3.crops){
    const e = W3.crops[k];
    e.m.rotation.z = Math.sin(tm*1.3 + e.seed)*0.035;
    if (cropStage(e.c)===4 && !e.c.dead && Math.random() < dt*0.6)
      w3emit(e.x+0.5+(Math.random()-0.5)*0.4, 0.5+Math.random()*0.4, e.y+0.55+(Math.random()-0.5)*0.3, 0,0.3,0,'#fff6c0',0.9,0.22,0);
  }
  /* 落ちもの */
  for (const e of W3.items){
    e.sp.position.y = 0.42 + Math.sin(tm*3 + e.g.x)*0.07;
  }
  /* 仕掛け */
  for (const f of W3.anims) f.fn(tm, dt);

  w3UpdatePlayer(dt);
  w3UpdateNPCs(dt);
  w3FadeOccluders();
  w3UpdateCursor();
  w3SpawnFx();
  w3Weather(dt, a);
  w3updParticles(dt);

  /* 遠くの岩はゆっくり回る */
  if (a.sky){
    for (const r of W3.rocks){
      const u = r.userData;
      r.position.set(Math.cos(u.a + tm*0.01)*u.d, u.y + Math.sin(tm*0.3+u.a)*0.4, Math.sin(u.a+tm*0.01)*u.d*0.6 - 10);
      r.rotation.x += u.s*dt; r.rotation.y += u.s*dt*0.7;
    }
    W3.planetMesh.rotation.y += dt*0.01;
  }
  W3.renderer.setClearColor(a.mine? 0x07060b : (a.indoor? 0x0b0c14 : 0x05060c), 1);
  W3.renderer.render(W3.scene, W3.camera);
}

/* 自分が建物の裏に入ったら、その建物をすかす */
const W3_TALL = { house:2.8, greenhouse:2.2, shed:2.4, cave:1.4, stall:1.8, workbench:1.3, terminal:1.4,
                  lamppost:1.9, vend:1.6, gate:2.0, tank:1.5, console:1.6, kitchen:1.4, slot:1.2, ladderUp:2.4 };
function w3FadeOccluders(){
  const px_ = S.px/TILE, pz = (S.py-4)/TILE;
  for (const e of W3.objs){
    if (!e.grp) continue;
    const h = W3_TALL[e.o.t]; if (!h) continue;
    const d = OBJDEF[e.o.t];
    const on = px_ > e.o.x-0.45 && px_ < e.o.x+d.w+0.45 && pz < e.o.y+d.h-0.15 && pz > e.o.y - h*0.75;
    if (!!e.faded === on) continue;
    e.faded = on;
    e.grp.traverse(m=>{
      if (!m.isMesh) return;
      if (on){
        m.userData.base = m.material;
        m.material = w3FadeMat(m.material);
        m.castShadow = m.castShadow;
      } else if (m.userData.base){
        m.material = m.userData.base; m.userData.base = null;
      }
    });
  }
}
function w3FadeMat(base){
  W3.fadeCache = W3.fadeCache || {};
  let f = W3.fadeCache[base.uuid];
  if (!f){
    f = base.clone();
    f.transparent = true; f.opacity = Math.min(base.opacity, 0.32); f.depthWrite = false;
    W3.fadeCache[base.uuid] = f;
  }
  return f;
}

/* 向きの角度を、近いほうへまわす */
function w3turn(cur, tgt, k){
  let d = tgt-cur;
  while (d>PI) d-=PI*2; while (d<-PI) d+=PI*2;
  return cur + d*k;
}
const W3_DIR = [0, -PI/2, PI/2, PI];

function w3UpdatePlayer(dt){
  const P = W3.player, sk = P.sk;
  const x = S.px/TILE, z = (S.py-4)/TILE;
  P.root.position.set(x, 0, z);
  P.ang = w3turn(P.ang, W3_DIR[S.dir], 1-Math.pow(0.0005,dt));
  P.root.rotation.y = P.ang;
  const run = held('run');
  if (Game.moving) P.walk += dt*(run? 13 : 9);
  else P.walk = 0;
  const w = P.walk;
  const amp = Game.moving? (run? 0.85:0.6) : 0;
  sk.hipL.rotation.x = Math.sin(w)*amp;
  sk.hipR.rotation.x = -Math.sin(w)*amp;
  sk.shL.rotation.x = -Math.sin(w)*amp*0.8;
  sk.shR.rotation.x = Math.sin(w)*amp*0.8;
  sk.shL.rotation.z = -0.12; sk.shR.rotation.z = 0.12;
  sk.body.position.y = Game.moving? Math.abs(Math.sin(w))*0.06 : Math.sin(Game.time*2)*0.012;
  sk.body.rotation.x = Game.moving? (run? 0.14:0.07) : 0;
  sk.head.rotation.z = Game.moving? Math.sin(w)*0.05 : Math.sin(Game.time*1.3)*0.03;
  for (const k in P.tools) P.tools[k].visible = false;
  if (Game.swing){
    const act = Game.swing.act, t = Math.min(1, Game.swing.t);
    const tool = P.tools[act];
    if (tool) tool.visible = true;
    if (act==='water'){
      sk.shR.rotation.x = -1.2; sk.shR.rotation.z = 0.05;
      if (tool) tool.rotation.x = -0.2 - Math.sin(t*PI)*0.8;
      if (t>0.25 && Math.random()<0.8){
        const d = [[0,1],[-1,0],[1,0],[0,-1]][S.dir];
        w3emit(x + d[0]*0.75 + (Math.random()-0.5)*0.2, 0.55, z + d[1]*0.75 + (Math.random()-0.5)*0.2,
               d[0]*0.8+(Math.random()-0.5)*0.4, 0.2, d[1]*0.8+(Math.random()-0.5)*0.4, '#8fd0ff', 0.5, 0.14, 7);
      }
    } else {
      /* ふりかぶって、ふりおろす */
      const e = t<0.45 ? t/0.45 : 1;
      const k2 = t<0.45 ? 0 : (t-0.45)/0.55;
      const ang = -0.6 - e*2.2 + k2*2.6;
      sk.shR.rotation.x = ang; sk.shL.rotation.x = ang*0.6;
      sk.body.rotation.x = -0.1 + k2*0.3;
      if (tool) tool.rotation.x = 0;
    }
  }
}
function w3UpdateNPCs(dt){
  const list = Game.npcs[S.area] || [];
  const px_ = S.px/TILE, pz = (S.py-4)/TILE;
  for (const n of list){
    const m = W3.npcs[n.id]; if (!m) continue;
    const x = n.x/TILE, z = (n.y-4)/TILE;
    const moved = m.lx!=null ? Math.hypot(x-m.lx, z-m.lz) : 0;
    let tgt = m.ang;
    if (moved > 0.0005) tgt = Math.atan2(x-m.lx, z-m.lz);
    else if (Math.hypot(px_-x, pz-z) < 3.5) tgt = Math.atan2(px_-x, pz-z);
    else tgt = 0;
    m.ang = w3turn(m.ang, tgt, 1-Math.pow(0.02,dt));
    m.lx = x; m.lz = z;
    m.root.position.set(x, 0, z);
    m.root.rotation.y = m.ang;
    const t = Game.time + n.t;
    const sk = m.sk;
    if (m.hover){
      sk.body.position.y = 0.12 + Math.sin(t*1.6)*0.06;
      m.flame.scale.y = 0.8 + Math.random()*0.4;
    } else if (m.holo){
      sk.body.position.y = 0.05 + Math.sin(t*1.2)*0.03;
      W3.mats.holo.opacity = 0.5 + Math.sin(t*9)*0.05 + (Math.random()<0.02? -0.3:0);
      if (Math.random()<dt*3) w3emit(x+(Math.random()-0.5)*0.5, 0.2, z+(Math.random()-0.5)*0.5, 0, 0.6, 0, '#8fe6ff', 1.3, 0.14, 0);
    } else if (m.cat){
      sk.body.position.y = moved>0.0005? Math.abs(Math.sin(t*12))*0.04 : 0;
    } else if (sk.hipL){
      const walking = moved>0.0005;
      const w = t*9;
      sk.hipL.rotation.x = walking? Math.sin(w)*0.6 : 0;
      sk.hipR.rotation.x = walking? -Math.sin(w)*0.6 : 0;
      sk.shL.rotation.x = walking? -Math.sin(w)*0.5 : Math.sin(t*1.1)*0.05;
      sk.shR.rotation.x = walking? Math.sin(w)*0.5 : -Math.sin(t*1.1)*0.05;
      sk.shL.rotation.z = -0.1; sk.shR.rotation.z = 0.1;
      sk.body.position.y = Math.sin(t*2)*0.012;
      sk.head.rotation.z = Math.sin(t*0.9)*0.05;
    }
  }
}
function w3UpdateCursor(){
  const a = W3.areaObj;
  const cur = W3.cursor;
  if (uiTop() || Game.mode!=='play'){ cur.visible=false; return; }
  const [fx_,fy_] = facingTile();
  const ft = tileAt(a,fx_,fy_);
  const has = !!objAt(a,fx_,fy_) || !!cropAt(S.area,fx_,fy_) || ft.farm || !!npcAtTile(fx_,fy_);
  cur.visible = has;
  if (!has) return;
  cur.position.set(fx_+0.5, 0.025, fy_+0.5);
  const p = 0.92 + Math.sin(Game.time*6)*0.05;
  cur.scale.set(p,p,1);
  cur.material.opacity = 0.65 + Math.sin(Game.time*6)*0.25;
}
function w3SpawnFx(){
  for (const e of Game.fx){
    if (W3.fxSeen.has(e)) continue;
    W3.fxSeen.add(e);
    if (e.area!==S.area) continue;
    const x = e.x+0.5, z = e.y+0.55;
    const R_ = Math.random;
    if (e.type==='water'){
      for (let i=0;i<16;i++) w3emit(x+(R_()-0.5)*0.4,0.15,z+(R_()-0.5)*0.4,(R_()-0.5)*1.4,1.2+R_()*1.2,(R_()-0.5)*1.4,'#8fd0ff',0.7,0.14,7);
      for (let i=0;i<5;i++) w3emit(x+(R_()-0.5)*0.5,0.05,z+(R_()-0.5)*0.5,0,0.05,0,'#cfefff',0.6,0.3,0);
    } else if (e.type==='harvest'){
      const c = e.col || '#ffd15c';
      for (let i=0;i<14;i++){ const a2=R_()*PI*2; w3emit(x,0.6,z,Math.cos(a2)*1.4,1.6+R_(),Math.sin(a2)*1.4,i%2? c : '#ffffff',0.9,0.24,4); }
      for (let i=0;i<6;i++) w3emit(x+(R_()-0.5)*0.3,0.5+R_()*0.4,z,0,0.9,0,'#fff6c0',1.1,0.34,0);
    } else if (e.type==='dirt'){
      for (let i=0;i<12;i++) w3emit(x+(R_()-0.5)*0.3,0.08,z+(R_()-0.5)*0.3,(R_()-0.5)*1.6,1.2+R_()*1.4,(R_()-0.5)*1.6,'#8a6a50',0.7,0.13,9);
    } else if (e.type==='rock'){
      for (let i=0;i<16;i++) w3emit(x,0.3,z,(R_()-0.5)*2.6,1.5+R_()*1.8,(R_()-0.5)*2.6,i%3? '#9aa0b0':'#d8dce8',0.8,0.15,9);
    } else if (e.type==='chip'){
      for (let i=0;i<6;i++) w3emit(x,0.35,z,(R_()-0.5)*1.2,1.4,(R_()-0.5)*1.2,'#cfd6e6',0.5,0.1,8);
    } else if (e.type==='plant'||e.type==='fert'){
      for (let i=0;i<10;i++) w3emit(x+(R_()-0.5)*0.5,0.1,z+(R_()-0.5)*0.5,0,0.6+R_()*0.6,0,'#9fe8b0',1.0,0.2,0);
    } else if (e.type==='cut'){
      for (let i=0;i<10;i++) w3emit(x,0.3,z,(R_()-0.5)*1.8,1.3,(R_()-0.5)*1.8,'#6fa95f',0.7,0.13,8);
    }
  }
}
function w3Weather(dt, a){
  if (!a.sky) return;
  const w = S.weather, tg = W3.camT;
  const R_ = Math.random;
  if (w==='meteor' && R_()<dt*2.5){
    const x = tg.x + (R_()-0.3)*24, z = tg.z - 8 - R_()*10;
    for (let k=0;k<10;k++) w3emit(x-k*0.25, 10-k*0.1, z+k*0.12, -9, -7, 3, k<2? '#ffffff':'#ffb070', 0.9, 0.5-k*0.03, 0);
  } else if (w==='dew' && R_()<dt*14){
    w3emit(tg.x+(R_()-0.5)*18, 6, tg.z+(R_()-0.5)*12, 0, -3, 0, '#bfe4ff', 1.8, 0.1, 1);
  } else if (w==='dust' && R_()<dt*30){
    w3emit(tg.x-12, 0.3+R_()*2, tg.z+(R_()-0.5)*14, 6+R_()*3, 0, (R_()-0.5), '#d8b888', 3.5, 0.32, 0);
  }
}

/* ================================================================ タイトル */
function w3InitTitle(){
  const T = W3.T;
  const sc = new T.Scene();
  W3.tScene = sc;
  W3.tCam = new T.PerspectiveCamera(38, 16/10, 0.1, 900);
  sc.add(new T.HemisphereLight(0xd8e6ff, 0x3a2a40, 1.1));
  const key = new T.DirectionalLight(0xfff0e0, 2.6); key.position.set(-6,8,10); sc.add(key);
  const rim = new T.DirectionalLight(0x7fb8ff, 1.6); rim.position.set(8,2,-8); sc.add(rim);
  const sky = new T.Mesh(new T.SphereGeometry(420,32,16), new T.MeshBasicMaterial({ map:w3SpaceTex(0), side:T.BackSide, depthWrite:false, toneMapped:false }));
  sc.add(sky);
  const st = w3Stars(); sc.add(st); W3.tStarPts = st;
  /* 惑星 */
  const pl = new T.Group();
  pl.add(new T.Mesh(new T.SphereGeometry(60,48,24), new T.MeshLambertMaterial({ map:w3PlanetTex() })));
  const ringGeo = new T.RingGeometry(80,128,96,1);
  const pos = ringGeo.attributes.position, uv = ringGeo.attributes.uv;
  for (let i=0;i<pos.count;i++){ const r=Math.hypot(pos.getX(i),pos.getY(i)); uv.setXY(i,(r-80)/48,0.5); }
  const ring = new T.Mesh(ringGeo, new T.MeshBasicMaterial({ map:w3RingTex(), transparent:true, side:T.DoubleSide, depthWrite:false, toneMapped:false }));
  ring.rotation.x = -PI/2+0.35; pl.add(ring);
  pl.position.set(70,30,-190); pl.rotation.z=0.3; pl.scale.setScalar(0.9);
  sc.add(pl); W3.tPlanet = pl;
  /* 大きなトマトの星 */
  const tom = new T.Group();
  const tb = B3();
  const R0 = 2.6;
  tb.sph(R0,'#e5372f',0,0,0,{ seg:40, sy:0.9, key:'fruit', fn:(x,y,z)=>{
    const a = Math.atan2(z,x);
    const rib = Math.cos(a*6)*0.5+0.5;
    const t = (y/R0+1)/2;
    return w3c('#9c1f1c').clone().lerp(w3c('#f04a3a'), 0.25+0.75*t).lerp(w3c('#c02a22'), (1-rib)*0.25);
  }});
  /* 大陸（畑） */
  for (let i=0;i<7;i++){
    const th = hash2(i,1,2)*PI*2, ph = 0.6+hash2(i,2,3)*1.6;
    const x = Math.cos(th)*Math.sin(ph)*R0, y = Math.cos(ph)*R0*0.9, z = Math.sin(th)*Math.sin(ph)*R0;
    const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0), new T.Vector3(x,y,z).normalize());
    tb.sph(0.5+hash2(i,4,4)*0.4,'#5caa4d',0,0,0,{ sy:0.3, key:'toon', post:new T.Matrix4().makeRotationFromQuaternion(q).setPosition(x*0.96,y*0.96,z*0.96) });
  }
  for (let k=0;k<6;k++){
    const a = k/6*PI*2;
    tb.sph(0.9,'#3f8f3a',Math.cos(a)*0.9,R0*0.9-0.05,Math.sin(a)*0.9,{ sx:1.4, sy:0.22, sz:0.5, ry:-a, rz:0.25 });
  }
  tb.cyl(0.18,0.26,0.9,10,'#3a7a35',0,R0*0.9+0.4,0,{ rz:0.15 });
  const tg = tb.build({ shadow:false });
  tom.add(tg);
  sc.add(tom); W3.tTomato = tom; W3.tTomatoInner = tg;
  /* まわりを回る小さな畑 */
  W3.tIslands = [];
  const vids = ['akahoshi','comet','sunflare','nebula'];
  for (let i=0;i<4;i++){
    const g = new T.Group();
    const b = B3();
    b.geo(w3rockGeo(0.7, i*9+3, 1), '#6b5563', 0,-0.35,0, { sy:0.9, key:'flat' });
    b.cyl(0.72,0.66,0.2,12,'#8f7058',0,0,0,{ key:'flat' });
    b.cyl(0.66,0.66,0.02,12,'#5e4430',0,0.11,0);
    g.add(b.build({ shadow:false }));
    const p = w3MakePlant(vids[i],4,1.0,{ seed:i });
    p.position.y = 0.11; p.scale.setScalar(0.9); g.add(p);
    const p2 = w3MakePlant(vids[(i+1)%4],3,1.0,{ seed:i+3 });
    p2.position.set(0.35,0.11,0.2); p2.scale.setScalar(0.6); g.add(p2);
    sc.add(g); W3.tIslands.push(g);
  }
  /* 宇宙船 */
  const sb = B3();
  sb.cap(0.3,1.0,'#dfe3ee',0,0,0,{ rz:PI/2, key:'shiny' });
  sb.sph(0.26,'#7fd6ff',0.45,0.14,0,{ sz:0.8, key:'glass' });
  sb.box(0.5,0.05,1.3,'#b0b7c9',-0.2,0,0);
  sb.box(0.4,0.4,0.05,'#e5372f',-0.6,0.25,0);
  sb.cone(0.22,0.5,10,'#ffb45a',-1.05,0,0,{ rz:PI/2, key:'beam' });
  sb.sph(0.14,'#fff0c0',-0.85,0,0,{ key:'glow' });
  const ship = sb.build({ shadow:false });
  sc.add(ship); W3.tShip = ship;
  W3.tStars = sky;
}
function w3RenderTitle(dt, mode){
  const tm = Game.time;
  const cam = W3.tCam;
  const T = W3.T;
  if (mode==='ending'){
    const e = Game.ending;
    cam.position.set(Math.sin(e*0.03)*3, 1.5 + e*0.02, 13 + e*0.05);
    cam.lookAt(0,0,0);
  } else {
    cam.position.set(Math.sin(tm*0.12)*1.4, 1.2 + Math.sin(tm*0.2)*0.4, 12.5);
    cam.lookAt(0,-0.8,0);
  }
  W3.tTomato.position.set(0, -2.1 + Math.sin(tm*0.6)*0.12, 0);
  W3.tTomato.scale.setScalar(0.9);
  W3.tTomatoInner.rotation.y = tm*0.15;
  W3.tTomato.rotation.z = 0.12;
  for (let i=0;i<W3.tIslands.length;i++){
    const g = W3.tIslands[i];
    const a = tm*0.35 + i*PI*0.5;
    g.position.set(Math.cos(a)*5.4, -1.9 + Math.sin(a)*0.9 + Math.sin(tm+i)*0.1, Math.sin(a)*2.8);
    g.rotation.y = tm*0.4 + i;
    g.rotation.z = Math.sin(tm*0.7+i)*0.08;
  }
  const s = ((tm*0.08) % 1);
  W3.tShip.position.set(-14 + s*28, 3.5 + Math.sin(tm*0.7)*0.3, -6);
  W3.tShip.rotation.z = Math.sin(tm*0.9)*0.08;
  W3.tStars.rotation.y = tm*0.004; W3.tStarPts.rotation.y = tm*0.004;
  W3.renderer.setClearColor(0x05060c,1);
  W3.renderer.render(W3.tScene, cam);
}
