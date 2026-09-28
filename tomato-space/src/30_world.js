/* =========================================================================
   30_world.js  —  小惑星ソラナムの地図
   ========================================================================= */

/* 地形記号の意味 */
const TERRAIN = {
  ' ': { tile:null,     solid:true,  void:true  },   // 宇宙（落ちる）
  '.': { tile:'rego',   solid:false },
  ',': { tile:'moss',   solid:false },
  ':': { tile:'path',   solid:false },
  '=': { tile:'deck',   solid:false },
  '-': { tile:'deckl',  solid:false },
  'F': { tile:'soil',   solid:false, farm:true },
  'W': { tile:'wood',   solid:false },
  'g': { tile:'gfloor', solid:false },
  '#': { tile:'wall',   solid:true  },
  'M': { tile:'mwall',  solid:true,  minewall:true },
  'm': { tile:'mfloor', solid:false },
};

/* 置いてあるものの寸法（タイル単位）と描き方 */
const OBJDEF = {
  house:      { w:5,h:4, solid:true,  draw:(g,x,y)=>drawHouse(g,x,y,80,64) },
  greenhouse: { w:6,h:5, solid:true,  draw:(g,x,y,o,S)=>drawGreenhouse(g,x,y,96,80, hasUp('greenh')) },
  shed:       { w:5,h:4, solid:true,  draw:(g,x,y)=>drawShed(g,x,y,80,64) },
  tank:       { w:1,h:2, solid:true,  draw:(g,x,y)=>drawTank(g,x,y+5), act:'water' },
  bin:        { w:1,h:1, solid:true,  draw:(g,x,y,o)=>drawBin(g,x,y-1, (S.ship&&S.ship.length>0)), act:'bin' },
  console:    { w:1,h:2, solid:true,  draw:(g,x,y)=>drawConsole(g,x,y+10, S.gravIdx), act:'gravity' },
  gate:       { w:2,h:2, solid:true,  draw:(g,x,y)=>drawGate(g,x+4,y+2, true) },
  cave:       { w:3,h:2, solid:true,  draw:(g,x,y)=>drawCave(g,x,y) },
  stall:      { w:3,h:2, solid:true,  draw:(g,x,y)=>drawStall(g,x+7,y+8), act:'shop' },
  workbench:  { w:2,h:2, solid:true,  draw:(g,x,y)=>drawWorkbench(g,x,y+4), act:'upgrade' },
  terminal:   { w:1,h:2, solid:true,  draw:(g,x,y)=>drawTerminal(g,x,y+10), act:'lab' },
  pedestal:   { w:1,h:1, solid:true,  draw:(g,x,y)=>drawPedestal(g,x,y) },
  bench:      { w:2,h:1, solid:true,  draw:(g,x,y)=>drawBench(g,x+6,y+2) },
  bed:        { w:1,h:2, solid:true,  draw:(g,x,y)=>drawBed(g,x,y+3), act:'sleep' },
  kitchen:    { w:2,h:2, solid:true,  draw:(g,x,y)=>drawKitchen(g,x,y+7) },
  calendar:   { w:2,h:1, solid:true,  draw:(g,x,y)=>drawCalendar(g,x+5,y), act:'calendar' },
  poster:     { w:2,h:1, solid:true,  draw:(g,x,y)=>drawPoster(g,x+6,y) },
  note:       { w:1,h:1, solid:true,  draw:(g,x,y)=>drawIcon(g,'key_note',x,y,1), act:'note' },
  slot:       { w:1,h:2, solid:true,  draw:(g,x,y,o)=>drawSlot(g,x,y,o), act:'machine' },
  ladderDn:   { w:1,h:1, solid:false, draw:(g,x,y)=>drawLadder(g,x,y,true),  act:'down' },
  ladderUp:   { w:1,h:1, solid:false, draw:(g,x,y)=>drawLadder(g,x,y,false), act:'up' },
  rock:       { w:1,h:1, solid:true,  draw:(g,x,y,o)=>drawRock(g,x,y,o.k||1) },
  shrub:      { w:1,h:1, solid:true,  draw:(g,x,y)=>drawShrub(g,x,y) },
  sign:       { w:1,h:1, solid:true,  draw:(g,x,y,o)=>drawSign(g,x,y,o.c), act:'sign' },
  fence:      { w:1,h:1, solid:true,  draw:(g,x,y)=>drawFence(g,x,y) },
  window:     { w:4,h:1, solid:true,  draw:(g,x,y)=>drawWindowPane(g,x,y+2,64,14) },
  planter:    { w:2,h:2, solid:true,  draw:(g,x,y)=>drawPlanter(g,x,y+8) },
  lamppost:   { w:1,h:2, solid:true,  draw:(g,x,y)=>drawLamppost(g,x,y+3) },
  vend:       { w:1,h:2, solid:true,  draw:(g,x,y)=>drawVend(g,x,y+3), act:'vend' },
  crate:      { w:1,h:1, solid:true,  draw:(g,x,y)=>{ px(g,x+1,y+3,14,13,'#8a6240'); px(g,x+1,y+3,14,2,'#a5824f');
                 px(g,x+2,y+6,12,9,'#6d4a2e'); px(g,x+3,y+8,10,2,'#8a6240'); } },
};

function drawSlot(g,x,y,o){
  /* 加工小屋の機械台。機械が入っていれば機械を、無ければ空台を描く */
  const m = S.machines && S.machines[o.n];
  if (!m){
    px(g,x+1,y+27,14,3,'#353b48');
    px(g,x+2,y+13,12,14,'#4d5468');
    px(g,x+2,y+13,12,2,'#727a8e');
    px(g,x+3,y+16,10,8,'#39404f');
    px(g,x+4,y+18,3,1,'#5c6478'); px(g,x+9,y+21,3,1,'#5c6478');
    px(g,x+3,y+14,1,1,'#8d94a8'); px(g,x+12,y+14,1,1,'#8d94a8');
    px(g,x+2,y+24,12,2,'#3f4553');
    return;
  }
  const busy = m.doneDay!=null && S.day2 < m.doneDay;
  const ready= m.doneDay!=null && S.day2 >= m.doneDay;
  drawMachine(g,x,y+4,m.type,busy,ready, S.t||0);
}

/* ---------------------------------------------------------------- 地図 */
function M(w,rows){
  const out=[];
  for (let i=0;i<rows.length;i++){
    let r = rows[i];
    if (r.length < w) r = r + ' '.repeat(w-r.length);
    else if (r.length > w) { console.warn('map row too long', i, r.length, w); r = r.slice(0,w); }
    out.push(r);
  }
  return out;
}

const AREAS = {};

/* ============================ ホームドーム ============================ */
AREAS.home = {
  id:'home', name:'ソラナム農場', w:40, h:28, outdoor:true, sky:true,
  map: M(40,[
    "                                        ",
    "      ............................      ",
    "    ................................    ",
    "  ....................................  ",
    "  ....................................  ",
    "  ....................................  ",
    "  ....................................  ",
    "  ....:...............................  ",
    "  .::::::::::::::::::::::::::::::::...  ",
    "  .FFFFFFFFFF::FFFFFFFFFF::.......:...  ",
    "  .FFFFFFFFFF::FFFFFFFFFF::.......:...  ",
    "  .FFFFFFFFFF::FFFFFFFFFF::.......:...  ",
    "  .FFFFFFFFFF::FFFFFFFFFF::.......:...  ",
    "  .FFFFFFFFFF::FFFFFFFFFF::.......:...  ",
    "  .FFFFFFFFFF::FFFFFFFFFF::.......:...  ",
    "  .FFFFFFFFFF::FFFFFFFFFF::.......:...  ",
    "  ................................:...  ",
    "  ................................:...  ",
    "  ....................................  ",
    "  ....................................  ",
    "  ....................................  ",
    "  ......,,,,,,,,,,,,,.................  ",
    "  ......,,,,,,,,,,,,,.................  ",
    "  ......,,,,,,,,,,,,,.................  ",
    "  ....................................  ",
    "   ..................................   ",
    "     ..............................     ",
    "                                        ",
  ]),
  objs:[
    {t:'house', x:4, y:3},
    {t:'tank',  x:12, y:4},
    {t:'bin',   x:15, y:5},
    {t:'console',x:18, y:4},
    {t:'greenhouse', x:28, y:3},
    {t:'shed',  x:28, y:12},
    {t:'gate',  x:33, y:18},
    {t:'cave',  x:4,  y:20},
    {t:'sign',  x:3,  y:7,  c:'#e5372f', text:'第1農場\nここから耕す。クワ → 種 → 水。'},
    {t:'sign',  x:15, y:7,  c:'#f5b625', text:'第2農場\n自動散水は最初は第1農場だけ。'},
    {t:'shrub', x:14, y:18},{t:'shrub', x:22, y:19},{t:'shrub', x:9, y:25},
    {t:'shrub', x:26, y:22},{t:'shrub', x:31, y:21},{t:'shrub', x:6, y:17},
    {t:'rock',  x:16, y:23, k:1},{t:'rock', x:20, y:24, k:2},{t:'rock', x:11, y:20, k:1},
    {t:'rock',  x:29, y:24, k:3},{t:'rock', x:24, y:17, k:1},
    {t:'crate', x:10, y:6},{t:'crate', x:11, y:6},
    {t:'fence', x:2, y:9},{t:'fence', x:2, y:10},{t:'fence', x:2, y:11},
  ],
  warps:[
    { x:6,  y:7,  to:'houseIn',  tx:7,  ty:9,  dir:3 },
    { x:30, y:8,  to:'greenIn',  tx:10, ty:11, dir:3 },
    { x:30, y:16, to:'shedIn',   tx:8,  ty:9,  dir:3 },
    { x:34, y:17, to:'station',  tx:4,  ty:15, dir:0 },
    { x:5,  y:22, to:'mine',     tx:-1, ty:-1, dir:0, mine:1 },
  ],
  spawn:{x:6,y:9},
};

/* ============================== 中央区画 ============================== */
AREAS.station = {
  id:'station', name:'ソラナム中央区', w:26, h:18, outdoor:true, sky:true,
  map: M(26,[
    "                          ",
    "  ######################  ",
    "  ======================  ",
    "  ======================  ",
    "  ======================  ",
    "  ==========-===========  ",
    "  ==========-===========  ",
    "  ==========-===========  ",
    "  ==========-===========  ",
    "  ==========-===========  ",
    "  ==-----------------===  ",
    "  ==========-===========  ",
    "  ==========-===========  ",
    "  ==========-===========  ",
    "  ==========-===========  ",
    "  ======================  ",
    "   ====================   ",
    "                          ",
  ]),
  objs:[
    {t:'window', x:4,  y:1},{t:'window', x:9, y:1},{t:'window', x:14, y:1},{t:'window', x:19, y:1},
    {t:'stall',    x:5,  y:3},
    {t:'terminal', x:12, y:3},
    {t:'workbench',x:17, y:3},
    {t:'pedestal', x:12, y:9},
    {t:'gate',     x:3,  y:12},
    {t:'bench', x:7, y:12},{t:'bench', x:16, y:12},
    {t:'planter', x:8, y:6},{t:'planter', x:16, y:6},
    {t:'lamppost', x:5, y:8},{t:'lamppost', x:20, y:8},
    {t:'vend', x:21, y:4},
    {t:'crate', x:20, y:14},{t:'crate', x:21, y:14},{t:'crate', x:21, y:13},
    {t:'shrub', x:3, y:3},{t:'shrub', x:3, y:15},{t:'shrub', x:22, y:15},{t:'shrub', x:22, y:2},
    {t:'sign', x:5, y:11, c:'#7fd6ff', text:'ソラナム中央区\n↑ZAX-9商店　↑Dr.ルナ研究端末　↑ナツキ工房\n←農場ゲート'},
  ],
  warps:[
    { x:4, y:14, to:'home', tx:34, ty:16, dir:3 },
  ],
  spawn:{x:4,y:15},
};

/* ================================ 自宅 ================================ */
AREAS.houseIn = {
  id:'houseIn', name:'じぶんの家', w:16, h:12, indoor:true,
  map: M(16,[
    "################",
    "#WWWWWWWWWWWWWW#",
    "#WWWWWWWWWWWWWW#",
    "#WWWWWWWWWWWWWW#",
    "#WWWWWWWWWWWWWW#",
    "#WWWWWWWWWWWWWW#",
    "#WWWWWWWWWWWWWW#",
    "#WWWWWWWWWWWWWW#",
    "#WWWWWWWWWWWWWW#",
    "#WWWWWWWWWWWWWW#",
    "#WWWWWWWWWWWWWW#",
    "#######WW#######",
  ]),
  objs:[
    {t:'bed', x:2, y:2},
    {t:'kitchen', x:9, y:2},
    {t:'calendar', x:5, y:1},
    {t:'poster', x:12, y:5},
    {t:'note', x:6, y:4},
    {t:'crate', x:13, y:9},{t:'crate', x:2, y:9},
  ],
  warps:[
    { x:7, y:11, to:'home', tx:6, ty:8, dir:0 },
    { x:8, y:11, to:'home', tx:6, ty:8, dir:0 },
  ],
  spawn:{x:7,y:9},
};

/* =============================== 温室 =============================== */
AREAS.greenIn = {
  id:'greenIn', name:'温室', w:22, h:14, indoor:true, greenhouse:true,
  map: M(22,[
    "######################",
    "#gggggggggggggggggggg#",
    "#gggggggggggggggggggg#",
    "#gFFFFFFFFFFFFFFFFFFg#",
    "#gFFFFFFFFFFFFFFFFFFg#",
    "#gFFFFFFFFFFFFFFFFFFg#",
    "#gFFFFFFFFFFFFFFFFFFg#",
    "#gFFFFFFFFFFFFFFFFFFg#",
    "#gFFFFFFFFFFFFFFFFFFg#",
    "#gggggggggggggggggggg#",
    "#gggggggggggggggggggg#",
    "#gggggggggggggggggggg#",
    "##########gg##########",
    "######################",
  ]),
  objs:[
    {t:'crate', x:2, y:11},{t:'crate', x:19, y:11},
    {t:'sign', x:3, y:1, c:'#6fd79a', text:'温室：いつでも陽季・1.0G・水は自動'},
  ],
  warps:[
    { x:10, y:12, to:'home', tx:30, ty:9, dir:0 },
    { x:11, y:12, to:'home', tx:30, ty:9, dir:0 },
  ],
  spawn:{x:10,y:11},
};

/* ============================= 加工小屋 ============================= */
AREAS.shedIn = {
  id:'shedIn', name:'加工小屋', w:17, h:11, indoor:true,
  map: M(17,[
    "#################",
    "#===============#",
    "#===============#",
    "#===============#",
    "#===============#",
    "#===============#",
    "#===============#",
    "#===============#",
    "#===============#",
    "#===============#",
    "#######===#######",
  ]),
  objs:[
    {t:'slot', x:2,  y:1, n:0},{t:'slot', x:5,  y:1, n:1},
    {t:'slot', x:8,  y:1, n:2},{t:'slot', x:11, y:1, n:3},
    {t:'slot', x:14, y:1, n:4},
    {t:'slot', x:2,  y:6, n:5},{t:'slot', x:5,  y:6, n:6},
    {t:'slot', x:8,  y:6, n:7},
    {t:'crate', x:14, y:8},{t:'crate', x:13, y:8},{t:'crate', x:14, y:7},
    {t:'poster', x:12, y:4},
    {t:'sign', x:11, y:7, c:'#ffd15c', text:'加工台\nトマトを入れて、できあがったら受け取る。\nそのまま売るより ずっと高く売れる。'},
  ],
  warps:[
    { x:7, y:10, to:'home', tx:30, ty:17, dir:0 },
    { x:8, y:10, to:'home', tx:30, ty:17, dir:0 },
    { x:9, y:10, to:'home', tx:30, ty:17, dir:0 },
  ],
  spawn:{x:8,y:9},
};

/* ============================== 坑道 ============================== */
/* 階ごとに毎回ほりなおす。石は毎朝もどる */
function genMine(floor, seed){
  const w=30, h=24;
  const rows=[];
  for (let y=0;y<h;y++){ rows.push(new Array(w).fill('M')); }
  const rnd = (i)=> hash2(i*13+floor*977, seed+floor*31, 1234+i);
  /* 部屋をいくつか掘る */
  const rooms=[];
  const n = 5 + (floor%3);
  for (let i=0;i<n;i++){
    const rw = 4 + Math.floor(rnd(i*5)*6);
    const rh = 3 + Math.floor(rnd(i*5+1)*5);
    const rx = 2 + Math.floor(rnd(i*5+2)*(w-rw-4));
    const ry = 2 + Math.floor(rnd(i*5+3)*(h-rh-4));
    rooms.push({x:rx,y:ry,w:rw,h:rh,cx:rx+(rw>>1),cy:ry+(rh>>1)});
    for (let y=ry;y<ry+rh;y++) for (let x=rx;x<rx+rw;x++) rows[y][x]='m';
  }
  /* 部屋どうしを通路でつなぐ */
  for (let i=1;i<rooms.length;i++){
    const a=rooms[i-1], b=rooms[i];
    let x=a.cx, y=a.cy;
    while (x!==b.cx){ rows[y][x]='m'; rows[y+1] && (rows[y+1][x]='m'); x += (b.cx>x?1:-1); }
    while (y!==b.cy){ rows[y][x]='m'; rows[y][x+1]!==undefined && (rows[y][x+1]='m'); y += (b.cy>y?1:-1); }
    rows[y][x]='m';
  }
  const map = rows.map(r=>r.join(''));
  const objs=[];
  /* 上り口は最初の部屋、下り口は最後の部屋 */
  const up = rooms[0], dn = rooms[rooms.length-1];
  objs.push({t:'ladderUp', x:up.cx, y:up.cy});
  objs.push({t:'ladderDn', x:dn.cx, y:dn.cy});
  /* 石を置く */
  let placed=0;
  for (let i=0;i<260 && placed < 16+floor*2; i++){
    const rx = 1+Math.floor(rnd(500+i)* (w-2));
    const ry = 1+Math.floor(rnd(900+i)* (h-2));
    if (map[ry][rx] !== 'm') continue;
    if ((rx===up.cx&&ry===up.cy)||(rx===dn.cx&&ry===dn.cy)) continue;
    if (objs.some(o=>o.x===rx&&o.y===ry)) continue;
    const r = rnd(1300+i);
    const kind = r>0.86? 3 : (r>0.55? 2 : 1);
    objs.push({t:'rock', x:rx, y:ry, k:kind, mine:true});
    placed++;
  }
  return {
    id:'mine', name:'ソラナム坑道 地下'+floor+'層', w:w, h:h, indoor:true, mine:true, floor:floor,
    map:map, objs:objs, warps:[], spawn:{x:up.cx, y:up.cy+1},
    upWarp:{x:up.cx,y:up.cy}, dnWarp:{x:dn.cx,y:dn.cy},
  };
}

/* ---------------------------------------------------------------- 便利 */
function areaOf(id){
  if (id==='mine') return S.mineArea;
  return AREAS[id];
}
function tileAt(area, x, y){
  if (!area || y<0 || y>=area.h || x<0 || x>=area.w) return TERRAIN[' '];
  const ch = area.map[y][x] || ' ';
  return TERRAIN[ch] || TERRAIN[' '];
}
function objAt(area, x, y){
  if (!area.objs) return null;
  for (const o of area.objs){
    const d = OBJDEF[o.t]; if (!d) continue;
    if (x>=o.x && x<o.x+d.w && y>=o.y && y<o.y+d.h) return o;
  }
  return null;
}
function isSolid(area, x, y){
  const t = tileAt(area,x,y);
  if (t.solid) return true;
  const o = objAt(area,x,y);
  if (o){
    const d = OBJDEF[o.t];
    if (d && d.solid && !o.gone) return true;
  }
  return false;
}
function warpAt(area, x, y){
  if (!area.warps) return null;
  for (const w of area.warps) if (w.x===x && w.y===y) return w;
  return null;
}
