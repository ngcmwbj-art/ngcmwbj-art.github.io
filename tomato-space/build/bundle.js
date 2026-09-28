/* ==== 00_data.js ==== */
/* =========================================================================
   トマト宇宙農園 / TOMATO STAR FARM
   00_data.js  —  世界の定数・作物・アイテム・住民のデータ
   ========================================================================= */

const TILE = 16;                 // 1タイルのドット数
const DAYS_PER_SEASON = 14;      // 1軌道季の日数
const DAY_START = 360;           // 6:00
const DAY_END   = 1560;          // 26:00（2:00）＝強制就寝
const MIN_PER_SEC = 1.45;        // 実時間1秒あたりのゲーム内分（1日 ≒ 13.8分）

/* ---------------------------------------------------------------- 軌道季 */
const SEASONS = [
  { id:'hi',     name:'陽季', kana:'ひのき',   sky:['#0a1130','#121c44','#1d2a5c'],
    ground:'#b8794f', tint:'rgba(255,214,150,0.10)',
    note:'恒星に最も近づく季。光が強く、フレアも多い。' },
  { id:'arashi', name:'嵐季', kana:'あらしき', sky:['#150f26','#251a3e','#3a2a55'],
    ground:'#8f6a4a', tint:'rgba(180,150,255,0.10)',
    note:'デブリ帯を横切る季。隕石雨と砂嵐の季節。' },
  { id:'shimo',  name:'霜季', kana:'しもき',   sky:['#060d1c','#0e1c34','#17304e'],
    ground:'#8e9aa8', tint:'rgba(180,220,255,0.14)',
    note:'恒星から最も遠い季。放っておけば土は凍る。' },
  { id:'kage',   name:'影季', kana:'かげき',   sky:['#040409','#0b0c18','#15142b'],
    ground:'#6b6154', tint:'rgba(90,90,160,0.20)',
    note:'巨大ガス惑星の影に入る季。昼が来ない。' },
];
const SEASON_BY_ID = {};
SEASONS.forEach((s,i)=>{ s.index=i; SEASON_BY_ID[s.id]=s; });

/* ---------------------------------------------------------------- 天候 */
const WEATHERS = {
  clear:  { name:'快晴',     icon:'sun',   note:'よく晴れている。' },
  dew:    { name:'結露',     icon:'drop',  note:'ドーム内が結露した。畑は勝手に潤う。' },
  dust:   { name:'砂嵐',     icon:'dust',  note:'レゴリスの砂嵐。外の作物は今日は伸びない。' },
  meteor: { name:'隕石雨',   icon:'meteor',note:'小さな隕石が降っている。畑に石が転がる。' },
  flare:  { name:'恒星フレア',icon:'flare', note:'強い宇宙線。シールドが無いと作物が変異する。' },
  outage: { name:'停電',     icon:'plug',  note:'station の電力が落ちた。機械とヒーターが止まる。' },
};
// 季ごとの天候の出やすさ
const WEATHER_TABLE = {
  hi:     [['clear',52],['dew',14],['flare',20],['dust',8],['outage',6]],
  arashi: [['clear',30],['dew',10],['dust',24],['meteor',24],['outage',12]],
  shimo:  [['clear',48],['dew',22],['dust',12],['meteor',8],['outage',10]],
  kage:   [['clear',44],['dew',18],['dust',10],['meteor',10],['flare',6],['outage',12]],
};

/* ---------------------------------------------------------------- 重力 */
const GRAVITY_STEPS = [
  { g:0.3, name:'0.3G', label:'微小重力',
    size:1.55, sugar:-3, growMul:0.85, fallRisk:0.22,
    note:'実は驚くほど大きく育つ。が、茎が自分の重さに負けて倒れる。' },
  { g:0.6, name:'0.6G', label:'低重力',
    size:1.22, sugar:-1, growMul:0.94, fallRisk:0.08,
    note:'ほどよく大きく育つ。少しだけ倒伏のおそれ。' },
  { g:1.0, name:'1.0G', label:'標準重力',
    size:1.00, sugar:0,  growMul:1.00, fallRisk:0.0,
    note:'地球と同じ。祖母の帳面どおりに育つ。' },
  { g:1.4, name:'1.4G', label:'高重力',
    size:0.80, sugar:+4, growMul:1.22, fallRisk:0.0,
    note:'実は締まって甘くなる。ただし育つのは遅い。' },
];

/* ---------------------------------------------------------------- 品種 */
/* stage: 0=種 1=芽 2=若株 3=開花 4=収穫可
   growDays: 0→4 に必要な「水をやれた日数」
   regrow: 収穫後に4へ戻るまでの日数（nullなら一度きり）           */
const VARIETIES = {
  akahoshi: {
    id:'akahoshi', name:'アカホシ', tier:1, growDays:4, regrow:null, yield:1,
    base:90, sugar:5, size:1.00, seasons:['hi','arashi','shimo','kage'],
    fruit:'#e5372f', fruit2:'#f77a63', dark:'#9c1f1c', leaf:'#4f9e42',
    desc:'祖母の帳面の一番はじめに書かれていた品種。どの軌道季でも育つ。',
    lore:'「まずアカホシを育てなさい。こいつが育つ土なら、何でも育つ。」',
  },
  comet: {
    id:'comet', name:'コメット', tier:1, growDays:5, regrow:2, yield:3,
    base:48, sugar:7, size:0.55, seasons:['hi','arashi','kage'],
    fruit:'#ff6b52', fruit2:'#ffa58f', dark:'#c33c2a', leaf:'#5cae4d',
    desc:'ミニトマト。一度実れば2日おきに何度も採れる、働き者。',
    lore:'房のつきかたが彗星の尾に似ているから、そう呼ばれる。',
  },
  sunflare: {
    id:'sunflare', name:'サンフレア', tier:2, growDays:5, regrow:null, yield:2,
    base:200, sugar:6, size:1.05, seasons:['hi'],
    fruit:'#f5b625', fruit2:'#ffe08a', dark:'#b47708', leaf:'#6ab24a',
    flare:'love', desc:'黄色い大玉。恒星フレアを浴びるとむしろ一段育つ。',
    lore:'フレアの日に畑へ出ると、この株だけが光を追って首を回している。',
  },
  frostbell: {
    id:'frostbell', name:'フロストベル', tier:3, growDays:6, regrow:null, yield:2,
    base:265, sugar:8, size:0.90, seasons:['shimo'],
    fruit:'#e4f2ff', fruit2:'#ffffff', dark:'#8fb4cf', leaf:'#77b39c',
    cold:true, desc:'霜季専用の白トマト。ヒーターが無くても凍らない。',
    lore:'実を振ると、中の種が鈴のように鳴る。',
  },
  jupiter: {
    id:'jupiter', name:'ジュピター', tier:3, growDays:8, regrow:null, yield:1,
    base:400, sugar:4, size:1.65, seasons:['hi','arashi'],
    fruit:'#cf4a2b', fruit2:'#e8865c', dark:'#8d2a17', leaf:'#4a8f3d',
    lowG:true, desc:'超大玉。低重力にするとさらに膨れ、抱えきれない大きさになる。',
    lore:'0.3Gで育てた記録は直径41cm。オババの自慢話の定番。',
  },
  nebula: {
    id:'nebula', name:'ネビュラ', tier:4, growDays:7, regrow:2, yield:2,
    base:345, sugar:9, size:0.95, seasons:['kage'],
    fruit:'#6fd79a', fruit2:'#b6f2cf', dark:'#2f8a5c', leaf:'#3f7d6a',
    dark_ok:true, desc:'影季の緑トマト。光の無い所でも、星の色だけで実る。',
    lore:'切ると断面に星雲のような渦が出る。渦の形は株ごとに違う。',
  },
  stormheart: {
    id:'stormheart', name:'ストームハート', tier:4, growDays:6, regrow:null, yield:2,
    base:330, sugar:7, size:1.00, seasons:['arashi'],
    fruit:'#e0533f', fruit2:'#ffd9a0', dark:'#8f2b20', leaf:'#4f9e42', striped:true,
    storm:true, desc:'嵐季の縞トマト。砂嵐も隕石雨もこいつだけは平気。',
    lore:'嵐の夜に畑の真ん中で一本だけ立っていた株から採れた種が始まり。',
  },
  blackhole: {
    id:'blackhole', name:'ブラックホール', tier:5, growDays:9, regrow:null, yield:1,
    base:640, sugar:12, size:0.85, seasons:['shimo','kage'],
    fruit:'#2b2434', fruit2:'#5d5170', dark:'#120e1a', leaf:'#3c6b58',
    highG:true, cold:true, desc:'黒トマト。高重力で育てると糖度が異常に上がる。',
    lore:'光を吸うほど黒い。ひと口食べると、しばらく他の味が分からなくなる。',
  },
  cosmoblue: {
    id:'cosmoblue', name:'コスモブルー', tier:6, growDays:8, regrow:null, yield:2,
    base:920, sugar:10, size:1.00, seasons:['hi','arashi','shimo','kage'],
    fruit:'#3f7bff', fruit2:'#8fb8ff', dark:'#1e3f9c', leaf:'#4f9e8a', glow:'#6f9bff',
    mutantOnly:true, desc:'宇宙線を浴びた株から、ごくまれに生まれる青。買えない。',
    lore:'オババの帳面の最後のページに、青い染みだけが残っていた。',
  },
  galaxia: {
    id:'galaxia', name:'ギャラクシア', tier:7, growDays:12, regrow:null, yield:1,
    base:2800, sugar:15, size:1.30, seasons:['hi','arashi','shimo','kage'],
    fruit:'#b464ff', fruit2:'#ffd0f0', dark:'#4a1f77', leaf:'#6fd79a',
    rainbow:true, glow:'#c98bff', crossOnly:true,
    desc:'交配の果てに一度だけ生まれる虹のトマト。地球へ持ち帰るための種。',
    lore:'「これを地球の土に埋めなさい。そこからまた、はじまる。」',
  },
};
const VARIETY_LIST = Object.keys(VARIETIES);

/* 交配表（順不同） */
const CROSS_TABLE = [
  ['akahoshi','comet',      'sunflare'],
  ['akahoshi','sunflare',   'jupiter'],
  ['comet','sunflare',      'frostbell'],
  ['sunflare','frostbell',  'nebula'],
  ['jupiter','frostbell',   'stormheart'],
  ['jupiter','nebula',      'blackhole'],
  ['blackhole','cosmoblue', 'galaxia'],
];
function crossResult(a,b){
  for (const row of CROSS_TABLE){
    if ((row[0]===a && row[1]===b) || (row[0]===b && row[1]===a)) return row[2];
  }
  return null;
}
/* フレア変異でコスモブルーになれる品種 */
const MUTATE_TO_BLUE = ['nebula','frostbell','stormheart','jupiter'];

/* ---------------------------------------------------------------- 加工 */
const PROCESS = {
  juice:   { id:'juice',   name:'ジュース',      need:1, mul:1.7,  days:1, machine:'juicer' },
  ketchup: { id:'ketchup', name:'ケチャップ',    need:2, mul:2.6,  days:1, machine:'ketchupper' },
  dried:   { id:'dried',   name:'ドライトマト',  need:1, mul:2.1,  days:2, machine:'dryer' },
  sauce:   { id:'sauce',   name:'宇宙パスタソース',need:3, mul:4.6, days:2, machine:'saucepan' },
  wine:    { id:'wine',    name:'トマトワイン',  need:2, mul:6.4,  days:4, machine:'cask' },
};
const MACHINES = {
  juicer:     { id:'juicer',     name:'ジューサー',   proc:'juice',   price:2200,  mats:{m_iron:6,m_silicon:2} },
  ketchupper: { id:'ketchupper', name:'ケチャップ釜', proc:'ketchup', price:4800,  mats:{m_iron:12,m_silicon:4} },
  dryer:      { id:'dryer',      name:'真空ドライヤー',proc:'dried',  price:7500,  mats:{m_iron:14,m_silicon:8,m_ice:6} },
  saucepan:   { id:'saucepan',   name:'ソース鍋',     proc:'sauce',   price:14000, mats:{m_iron:20,m_silicon:12,m_crystal:2} },
  cask:       { id:'cask',       name:'発酵樽',       proc:'wine',    price:26000, mats:{m_iron:24,m_silicon:14,m_crystal:5} },
};

/* ---------------------------------------------------------------- アイテム */
/* kind: tool / seed / crop / good / mat / use / key   */
const ITEMS = {};
function defItem(o){ ITEMS[o.id]=o; return o; }

defItem({ id:'t_hoe',    kind:'tool', name:'クワ',      desc:'レゴリスを耕して畑にする。', ep:3 });
defItem({ id:'t_can',    kind:'tool', name:'じょうろ',  desc:'耕した土に水をやる。水タンクで補給。', ep:1 });
defItem({ id:'t_sickle', kind:'tool', name:'カマ',      desc:'草を刈る。作物も刈れてしまうので注意。', ep:1 });
defItem({ id:'t_pick',   kind:'tool', name:'ツルハシ',  desc:'石を割る。坑道で鉱石が採れる。', ep:4 });
defItem({ id:'t_scan',   kind:'tool', name:'生育スキャナ', desc:'作物にかざすと、育ち具合と糖度が読める。', ep:0 });

defItem({ id:'f_basic',  kind:'use', name:'培養ジェル',   price:120,  sell:60,  desc:'耕した土に撒く。育つのが1日早くなる。' });
defItem({ id:'f_sweet',  kind:'use', name:'糖蜜スプレー', price:260,  sell:130, desc:'耕した土に撒く。糖度が上がり、等級が上がりやすい。' });
defItem({ id:'f_giant',  kind:'use', name:'膨張ガス',     price:340,  sell:170, desc:'耕した土に撒く。実が1.35倍に育つ。' });
defItem({ id:'jelly',    kind:'use', name:'栄養ゼリー',   price:300,  sell:150, desc:'食べると元気が40戻る。味は、無い。', energy:40 });
defItem({ id:'jelly_hi', kind:'use', name:'高濃度ゼリー', price:900,  sell:450, desc:'食べると元気が全部戻る。工房の特製。', energy:999 });

defItem({ id:'m_iron',    kind:'mat', name:'鉄くず',      sell:38,  desc:'坑道でよく採れる。何にでも使う。' });
defItem({ id:'m_silicon', kind:'mat', name:'シリコン',    sell:65,  desc:'basalt を割ると出る。機械の脳になる。' });
defItem({ id:'m_ice',     kind:'mat', name:'氷塊',        sell:28,  desc:'溶かせば水。冷やせば保存。' });
defItem({ id:'m_crystal', kind:'mat', name:'ヘリオ結晶',  sell:190, desc:'恒星の光を溜めこんだ結晶。深い層にある。' });
defItem({ id:'m_meteor',  kind:'mat', name:'隕鉄',        sell:330, desc:'隕石雨の後、畑に落ちている。妙に重い。' });

defItem({ id:'key_note', kind:'key', name:'オババの帳面', desc:'祖母がつけていた栽培の記録。図鑑の元になっている。' });

/* 品種ごとに「種」「実」「加工品」を自動生成 */
for (const v of VARIETY_LIST){
  const V = VARIETIES[v];
  defItem({ id:'sd_'+v, kind:'seed', variety:v, name:V.name+'の種',
            price: Math.round(V.base*0.62), sell: Math.round(V.base*0.28),
            desc:V.desc });
  defItem({ id:'cr_'+v, kind:'crop', variety:v, name:V.name,
            sell:V.base, desc:V.lore });
  for (const p of Object.keys(PROCESS)){
    const P = PROCESS[p];
    defItem({ id:'g_'+p+'_'+v, kind:'good', variety:v, proc:p,
              name:V.name+'の'+P.name,
              sell: Math.round(V.base*P.mul/ (P.need>1?1:1)),
              desc:V.name+'を'+P.name+'にしたもの。そのまま売るより高く売れる。' });
  }
}

/* 等級（★）による売値倍率 */
const QUALITY = [
  { star:0, name:'並',   mul:1.00, color:'#cfd6e0' },
  { star:1, name:'良',   mul:1.28, color:'#8fd6a0' },
  { star:2, name:'優',   mul:1.70, color:'#7fb8ff' },
  { star:3, name:'特級', mul:2.40, color:'#ffcf5c' },
];
function qualityOf(sugar, size){
  const score = sugar + (size-1)*6;
  if (score >= 17) return 3;
  if (score >= 12) return 2;
  if (score >= 8)  return 1;
  return 0;
}
function itemValue(slot){
  const it = ITEMS[slot.id]; if (!it) return 0;
  const base = it.sell || 0;
  const q = QUALITY[slot.q||0] || QUALITY[0];
  return Math.max(1, Math.round(base * q.mul));
}

/* ---------------------------------------------------------------- 設備 */
const UPGRADES = {
  can2:    { id:'can2',    name:'じょうろ（大）',    price:1800,  mats:{m_iron:5},
             desc:'水が40まで入る。', req:null },
  can3:    { id:'can3',    name:'じょうろ（特大）',  price:9000,  mats:{m_iron:14,m_silicon:6},
             desc:'水が90まで入り、3マスまとめて撒ける。', req:'can2' },
  pick2:   { id:'pick2',   name:'ツルハシ強化',      price:2600,  mats:{m_iron:10},
             desc:'石を一撃で割れる。消費も減る。', req:null },
  stake:   { id:'stake',   name:'支柱セット',        price:3200,  mats:{m_iron:12},
             desc:'低重力でも茎が倒れなくなる。', req:null },
  shield:  { id:'shield',  name:'放射線シールド',    price:12000, mats:{m_iron:18,m_silicon:10,m_crystal:3},
             desc:'フレアの日に作物を守る。変異もしなくなる。', req:null },
  heater:  { id:'heater',  name:'土壌ヒーター',      price:9500,  mats:{m_iron:14,m_ice:10},
             desc:'霜季でも霜季以外の品種が育つ。', req:null },
  lamp:    { id:'lamp',    name:'育成ライト',        price:11000, mats:{m_iron:14,m_silicon:10,m_crystal:2},
             desc:'影季でも作物が育つ。', req:null },
  sprink:  { id:'sprink',  name:'自動散水装置',      price:22000, mats:{m_iron:26,m_silicon:14,m_ice:12},
             desc:'毎朝、第1農場と温室に自動で水がまかれる。', req:'can2' },
  sprink2: { id:'sprink2', name:'自動散水（全域）',  price:48000, mats:{m_iron:40,m_silicon:26,m_crystal:8},
             desc:'農場ぜんぶに自動で水がまかれる。', req:'sprink' },
  bag:     { id:'bag',     name:'収納バッグ拡張',    price:4000,  mats:{m_iron:6},
             desc:'持てる枠が30になる。', req:null },
  bag2:    { id:'bag2',    name:'収納バッグ特大',    price:16000, mats:{m_iron:16,m_silicon:8},
             desc:'持てる枠が40になる。', req:'bag' },
  body:    { id:'body',    name:'強化スーツI',       price:6000,  mats:{m_iron:10,m_silicon:4},
             desc:'元気の上限が130になる。', req:null },
  body2:   { id:'body2',   name:'強化スーツII',      price:20000, mats:{m_iron:22,m_silicon:12,m_crystal:4},
             desc:'元気の上限が170になる。', req:'body' },
  greenh:  { id:'greenh',  name:'温室の修理',        price:15000, mats:{m_iron:20,m_silicon:8},
             desc:'温室が使えるようになる。中はいつも陽季・1.0G。', req:null },
  cart:    { id:'cart',    name:'出荷便の増便',      price:30000, mats:{m_iron:30,m_silicon:16},
             desc:'出荷の手取りが15%増える。', req:null },
  lab:     { id:'lab',     name:'交配ラボの起動',    price:18000, mats:{m_iron:22,m_silicon:14,m_crystal:4},
             desc:'Dr.ルナの交配装置が動く。2品種から新しい種を作れる。', req:null },
};

/* ---------------------------------------------------------------- 階級 */
const RANKS = [
  { need:0,      name:'見習い農夫',   note:'まずはアカホシを実らせること。' },
  { need:6000,   name:'ドーム農家',   note:'温室の修理が視野に入る。' },
  { need:30000,  name:'第一種栽培士', note:'ルナが交配ラボの鍵をくれる。' },
  { need:95000,  name:'軌道農園主',   note:'坑道の深層が開く。' },
  { need:260000, name:'惑星種苗家',   note:'地球行きの補給船が寄港できる。' },
];

/* ---------------------------------------------------------------- 住民 */
const NPCS = {
  obaba: {
    id:'obaba', name:'オババ', role:'ホログラム', color:'#8fe6ff',
    likes:['cr_akahoshi','g_juice_akahoshi','g_wine_akahoshi'],
    hello:[
      'おや、起きたのかい。土は待ってくれないよ。',
      'この小惑星の土はね、怒りっぽいが正直だ。水をやれば必ず返してくる。',
      'わたしはもう声だけの存在だが、トマトの味は覚えている。',
      '帳面は読んだかい。読んだなら、書き足しなさい。あんたの畑の分を。',
    ],
    warm:[
      'あんたの畑、だんだんわたしの畑に似てきたね。',
      '今日のトマト、いい匂いがしたよ。……匂いはもう嗅げないんだけどね。',
      'そろそろ青いのに出会うころだ。焦らず、フレアを恐れず。',
    ],
  },
  zax: {
    id:'zax', name:'ZAX-9', role:'行商ロボ', color:'#ffd15c',
    likes:['m_meteor','m_crystal','g_ketchup_akahoshi'],
    hello:[
      'イラッシャイマセ。種・肥料・雑貨、全品 在庫アリマス。',
      '本日ノ相場、トマト類ハ やや強気デス。出荷ハ今日ガ良イ。',
      'ワタシノ前ノ所有者モ 農家デシタ。彼ハ 水ヲ やり忘レテ 星ヲ出マシタ。',
      '依頼ボード、更新済ミ。報酬ハ 現金デス。',
    ],
    warm:[
      'オ得意サマ価格、適用中デス。内緒デスヨ。',
      'ワタシ、アナタノ畑ノ生産曲線ヲ 記録シテイマス。……趣味デス。',
    ],
  },
  natsuki: {
    id:'natsuki', name:'ナツキ', role:'整備士', color:'#7fe0a8',
    likes:['m_iron','m_silicon','g_dried_comet'],
    hello:[
      'よう。壊れてるもんある？ わりと何でも直すよ。',
      '鉄くず持ってきてくれたら助かる。あれ、いくらでも使い道あんの。',
      'この農場、配管が古いんだよな。あたしが来る前から。',
      'スプリンクラー入れたら人生変わるよ。まじで。',
    ],
    warm:[
      'あんたの畑の見回り、勝手にしてる。……不具合探しね、趣味。',
      '今度さ、温室の梁のとこ見てよ。あたしのサイン、彫ってある。',
    ],
  },
  luna: {
    id:'luna', name:'Dr.ルナ', role:'育種研究者', color:'#c9a6ff',
    likes:['cr_cosmoblue','cr_nebula','cr_blackhole','m_crystal'],
    hello:[
      'その実、少し分けてもらえます？ 断面が見たいんです。',
      '交配は賭けではありません。二つの記憶を重ねる作業です。',
      'あなたの祖母の帳面、わたしも一度だけ読ませてもらいました。美しい記録でした。',
      '青いトマトの標本、まだ一つも手に入っていません。……まだ。',
    ],
    warm:[
      '共同研究者、と呼んでもいいですか。断られたら泣きます。',
      'ギャラクシア。理論上は在ります。あとは、あなたの畑の時間だけ。',
    ],
  },
  toma: {
    id:'toma', name:'トマ', role:'宇宙猫', color:'#ffb37a',
    likes:['cr_comet','g_juice_comet','m_ice'],
    hello:['にゃあ。','……（畑をじっと見ている）','ごろごろ。','（トマトの上で寝ている）'],
    warm:['にゃーん！（足にすりよってきた）','（収穫かごの中で丸くなっている）'],
  },
};
const NPC_LIST = Object.keys(NPCS);

/* ---------------------------------------------------------------- 依頼 */
const QUEST_TEMPLATES = [
  { kind:'crop', text:(n,it)=>`${ITEMS[it].name} を ${n}個 ほしい`, pay:1.55 },
  { kind:'good', text:(n,it)=>`${ITEMS[it].name} を ${n}個 ほしい`, pay:1.40 },
  { kind:'mat',  text:(n,it)=>`${ITEMS[it].name} を ${n}個 ほしい`, pay:1.70 },
];

/* ---------------------------------------------------------------- 文字 */
const TIP_LINES = [
  'Z/スペース＝つかう　X＝しまう/やめる　Tab＝道具切替　I＝もちもの',
  '耕して→種をまいて→水をやる。水をやり忘れた日は、作物は伸びない。',
  '重力コンソールで畑の重力を変えられる。低いと大きく、高いと甘くなる。',
  'フレアの日にシールドが無いと作物が変異する。……悪いことばかりでもない。',
  '同じ品種どうしを交配すると、等級の上がりやすい「選抜種」になる。',
  '出荷箱に入れたものは、翌朝おかねになる。売るより箱のほうが手間がない。',
  '元気が0になると、その場で気を失って翌朝になる。おかねも少し落とす。',
  '坑道の石は毎朝もどってくる。鉄くずは工房でいくらでも使う。',
];

/* ==== 10_art.js ==== */
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

/* ==== 20_audio.js ==== */
/* =========================================================================
   20_audio.js  —  音もぜんぶコードで作る（外部ファイルなし）
   ========================================================================= */

const Audio_ = {
  ctx:null, master:null, musicGain:null, sfxGain:null,
  on:true, musicOn:true, started:false,
  tune:null, step:0, nextT:0, timer:null, bpm:96, curSeason:-1, curMode:'',
};

function mtof(m){ return 440 * Math.pow(2,(m-69)/12); }

function audioInit(){
  if (Audio_.ctx) return;
  try{
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    Audio_.ctx = ctx;
    const m = ctx.createGain(); m.gain.value = 0.85; m.connect(ctx.destination);
    Audio_.master = m;
    const mg = ctx.createGain(); mg.gain.value = 0.30; mg.connect(m); Audio_.musicGain = mg;
    const sg = ctx.createGain(); sg.gain.value = 0.55; sg.connect(m); Audio_.sfxGain = sg;
    /* ノイズ用バッファ */
    const len = ctx.sampleRate*1.2;
    const buf = ctx.createBuffer(1,len,ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i=0;i<len;i++) d[i] = Math.random()*2-1;
    Audio_.noise = buf;
  }catch(e){ Audio_.ctx=null; }
}
function audioResume(){
  audioInit();
  if (Audio_.ctx && Audio_.ctx.state==='suspended') Audio_.ctx.resume();
}

/* ------------------------------------------------------------------ SFX */
function blip(freq, dur, type, vol, slide, delay){
  if (!Audio_.ctx || !Audio_.on || Audio_.ctx.state!=='running') return;
  const c = Audio_.ctx, t0 = c.currentTime + (delay||0);
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type||'square'; o.frequency.setValueAtTime(freq,t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20,slide), t0+dur);
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(vol||0.25, t0+0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
  o.connect(g); g.connect(Audio_.sfxGain); o.start(t0); o.stop(t0+dur+0.02);
}
function noiseHit(dur, vol, filt, type, delay){
  if (!Audio_.ctx || !Audio_.on || !Audio_.noise || Audio_.ctx.state!=='running') return;
  const c = Audio_.ctx, t0 = c.currentTime + (delay||0);
  const s = c.createBufferSource(); s.buffer = Audio_.noise;
  const f = c.createBiquadFilter(); f.type = type||'bandpass'; f.frequency.value = filt||900; f.Q.value = 1.2;
  const g = c.createGain();
  g.gain.setValueAtTime(vol||0.25,t0);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  s.connect(f); f.connect(g); g.connect(Audio_.sfxGain);
  s.start(t0); s.stop(t0+dur+0.02);
}

const SFX = {
  step(){ noiseHit(0.05,0.07,420,'lowpass'); },
  hoe(){ noiseHit(0.13,0.34,700,'bandpass'); blip(150,0.14,'triangle',0.2,70); },
  water(){ noiseHit(0.34,0.16,1500,'bandpass'); blip(760,0.22,'sine',0.08,1250); },
  harvest(){ blip(620,0.09,'square',0.20,880); blip(880,0.10,'square',0.16,1180,0.06); },
  pick(){ noiseHit(0.10,0.30,2200,'highpass'); blip(230,0.10,'square',0.16,110); },
  rockBreak(){ noiseHit(0.30,0.40,600,'lowpass'); blip(120,0.26,'sawtooth',0.18,48); },
  menu(){ blip(760,0.05,'square',0.12); },
  ok(){ blip(660,0.07,'square',0.17); blip(990,0.09,'square',0.15,null,0.05); },
  no(){ blip(180,0.16,'sawtooth',0.16,110); },
  coin(){ blip(1180,0.07,'square',0.16); blip(1570,0.12,'square',0.14,null,0.06); },
  levelup(){ [0,4,7,12,16].forEach((n,i)=> blip(mtof(64+n),0.16,'square',0.16,null,i*0.075)); },
  plant(){ noiseHit(0.10,0.16,500,'lowpass'); blip(420,0.08,'sine',0.12,300); },
  sleep(){ [0,-2,-5,-7].forEach((n,i)=> blip(mtof(69+n),0.30,'sine',0.14,null,i*0.16)); },
  mutate(){
    if(!Audio_.ctx||!Audio_.on) return;
    const c=Audio_.ctx,t0=c.currentTime;
    const o=c.createOscillator(),g=c.createGain();
    o.type='sawtooth'; o.frequency.setValueAtTime(120,t0);
    o.frequency.exponentialRampToValueAtTime(1600,t0+0.6);
    g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(0.18,t0+0.05);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+0.8);
    o.connect(g); g.connect(Audio_.sfxGain); o.start(t0); o.stop(t0+0.85);
  },
  boom(){ noiseHit(0.55,0.45,220,'lowpass'); blip(70,0.5,'sine',0.25,35); },
  warp(){ [0,3,7,10,14].forEach((n,i)=> blip(mtof(60+n),0.13,'triangle',0.13,null,i*0.05)); },
  cat(){ blip(880,0.12,'sine',0.14,1320); blip(1180,0.18,'sine',0.10,760,0.10); },
  talk(){ blip(520,0.035,'square',0.07); },
  ship(){ blip(392,0.1,'triangle',0.16); blip(523,0.12,'triangle',0.15,null,0.08); blip(659,0.18,'triangle',0.14,null,0.16); },
};

/* ---------------------------------------------------------------- 音楽 */
/* 各軌道季のテーマ。[音程(midi, nullは休), 長さ(16分)] */
const TUNES = {
  hi: { bpm:112, wave:'square',
    mel:[[72,2],[76,2],[79,2],[76,2],[74,2],[72,2],[69,4],
         [71,2],[74,2],[76,2],[74,2],[72,2],[69,2],[67,4],
         [72,2],[76,2],[81,2],[79,2],[76,2],[72,2],[74,4],
         [71,2],[67,2],[69,2],[71,2],[72,6],[null,2]],
    bass:[[48,4],[55,4],[52,4],[55,4],[47,4],[55,4],[45,4],[52,4],
          [48,4],[55,4],[52,4],[55,4],[43,4],[50,4],[48,8]] },
  arashi:{ bpm:126, wave:'sawtooth',
    mel:[[69,2],[72,1],[71,1],[69,2],[67,2],[64,2],[67,2],[69,4],
         [74,2],[72,1],[71,1],[69,2],[67,2],[69,4],[null,2],
         [76,2],[74,2],[72,2],[71,2],[69,2],[67,2],[64,4],
         [65,2],[67,2],[69,4],[null,4]],
    bass:[[45,2],[45,2],[52,4],[43,4],[50,4],[41,4],[48,4],[45,4],[52,4],
          [45,2],[45,2],[52,4],[40,4],[47,4],[45,8]] },
  shimo:{ bpm:80, wave:'triangle',
    mel:[[69,4],[72,4],[76,4],[74,4],[71,4],[69,4],[67,8],
         [71,4],[74,4],[79,4],[76,4],[74,2],[72,2],[69,8],
         [64,4],[67,4],[71,4],[69,12]],
    bass:[[45,8],[52,8],[43,8],[50,8],[41,8],[48,8],[45,8],[40,8]] },
  kage:{ bpm:70, wave:'sine',
    mel:[[62,4],[65,4],[69,4],[67,4],[65,4],[62,8],[null,4],
         [60,4],[64,4],[67,4],[65,4],[64,4],[60,8],[null,4],
         [69,4],[67,4],[65,4],[62,4],[60,12]],
    bass:[[38,8],[45,8],[36,8],[43,8],[34,8],[41,8],[38,16]] },
};

function musicStart(seasonId, mode){
  audioInit();
  if (!Audio_.ctx) return;
  const key = seasonId + '/' + (mode||'');
  if (Audio_.curMode === key && Audio_.timer) return;
  Audio_.curMode = key;
  Audio_.tune = TUNES[seasonId] || TUNES.hi;
  Audio_.mode = mode||'';
  Audio_.melI = 0; Audio_.melT = 0; Audio_.basI = 0; Audio_.basT = 0;
  Audio_.nextT = Audio_.ctx.currentTime + 0.1;
  if (!Audio_.timer) Audio_.timer = setInterval(musicTick, 40);
}
function musicStop(){
  if (Audio_.timer){ clearInterval(Audio_.timer); Audio_.timer=null; }
  Audio_.curMode='';
}
function musicSetOn(v){
  Audio_.musicOn = v;
  if (Audio_.musicGain) Audio_.musicGain.gain.value = v? 0.30 : 0.0;
}

function musicVoice(midi, dur, wave, vol, det){
  const c=Audio_.ctx, t0=Audio_.nextT;
  const o=c.createOscillator(), g=c.createGain();
  o.type=wave; o.frequency.value = mtof(midi) * (det||1);
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(vol,t0+0.015);
  g.gain.exponentialRampToValueAtTime(vol*0.55,t0+dur*0.5);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur*0.98);
  o.connect(g); g.connect(Audio_.musicGain);
  o.start(t0); o.stop(t0+dur);
}

function musicTick(){
  if (!Audio_.ctx || !Audio_.tune) return;
  const c = Audio_.ctx;
  /* まだ音を出す許可が下りていない間は、何も予約しない（作りっぱなしを防ぐ） */
  if (c.state !== 'running'){ Audio_.nextT = c.currentTime + 0.1; return; }
  if (Audio_.nextT < c.currentTime) Audio_.nextT = c.currentTime + 0.05;
  const T = Audio_.tune;
  let bpm = T.bpm * (Audio_.mode==='night'? 0.86 : 1);
  const sixteenth = 60/bpm/4;
  let guard=0;
  while (Audio_.nextT < c.currentTime + 0.25 && guard++ < 64){
    /* メロディ */
    if (Audio_.melT <= 0){
      const n = T.mel[Audio_.melI % T.mel.length];
      Audio_.melI++;
      Audio_.melT = n[1];
      if (n[0]!=null){
        const d = n[1]*sixteenth*0.92;
        musicVoice(n[0], d, T.wave, Audio_.mode==='night'?0.10:0.14);
        musicVoice(n[0]+12, d*0.7, 'sine', 0.035, 1.003);
      }
    }
    /* ベース */
    if (Audio_.basT <= 0){
      const n = T.bass[Audio_.basI % T.bass.length];
      Audio_.basI++;
      Audio_.basT = n[1];
      if (n[0]!=null) musicVoice(n[0], n[1]*sixteenth*0.85, 'triangle', 0.13);
    }
    /* 軽いパーカッション */
    if (Audio_.mode!=='night' && (Audio_.melI % 2)===0){
      const t0=Audio_.nextT;
      const s=c.createBufferSource(); s.buffer=Audio_.noise;
      const f=c.createBiquadFilter(); f.type='highpass'; f.frequency.value=5200;
      const g=c.createGain(); g.gain.setValueAtTime(0.045,t0);
      g.gain.exponentialRampToValueAtTime(0.0001,t0+0.05);
      s.connect(f); f.connect(g); g.connect(Audio_.musicGain);
      s.start(t0); s.stop(t0+0.07);
    }
    Audio_.melT--; Audio_.basT--;
    Audio_.nextT += sixteenth;
  }
}

/* ==== 30_world.js ==== */
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

/* ==== 40_state.js ==== */
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

/* ==== 50_player.js ==== */
/* =========================================================================
   50_player.js  —  操作・歩く・使う
   ========================================================================= */

const Game = {
  mode:'title',          // title / play / ending
  ui:[],                 // 重ねて開く画面（いちばん上が操作対象）
  keys:{}, pressed:{},
  walkT:0, frame:0, moving:false,
  swing:null,
  fx:[], toasts:[],
  fade:null,
  npcs:{},
  cam:{x:0,y:0},
  sky:null, skySeason:-1,
  sleptLate:false, fainting:false,
  touch:false, pad:{x:0,y:0,act:false,cancel:false},
  time:0, lastT:0,
  shake:0,
  ending:0,
  hint:'',
};

const NPC_SPOTS = {
  station:[
    { id:'zax',     x:6,  y:5,  wander:0 },
    { id:'luna',    x:13, y:5,  wander:0 },
    { id:'natsuki', x:18, y:5,  wander:0 },
    { id:'obaba',   x:12, y:8,  wander:0 },
  ],
  home:[
    { id:'toma', x:19, y:21, wander:5 },
  ],
};

function initNPCs(){
  Game.npcs = {};
  for (const a in NPC_SPOTS){
    Game.npcs[a] = NPC_SPOTS[a].map(s=>({
      id:s.id, hx:s.x, hy:s.y, wander:s.wander,
      x:s.x*TILE+8, y:s.y*TILE+15, tx:s.x, ty:s.y, t:Math.random()*10, wait:1+Math.random()*3,
    }));
  }
}

/* ---------------------------------------------------------------- 入力 */
const KEYMAP = {
  ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right',
  KeyW:'up', KeyS:'down', KeyA:'left', KeyD:'right',
  KeyZ:'act', Space:'act', Enter:'act',
  KeyX:'cancel', Escape:'cancel', Backspace:'cancel',
  Tab:'next', KeyQ:'prev', KeyE:'next',
  KeyI:'bag', KeyP:'dex', KeyJ:'quest', KeyM:'map',
  ShiftLeft:'run', ShiftRight:'run',
  Digit1:'s1',Digit2:'s2',Digit3:'s3',Digit4:'s4',Digit5:'s5',
  Digit6:'s6',Digit7:'s7',Digit8:'s8',Digit9:'s9',Digit0:'s0',
  KeyH:'help', KeyF:'sound',
};

function bindInput(cv){
  window.addEventListener('keydown', e=>{
    const k = KEYMAP[e.code];
    if (k){ e.preventDefault(); if (!Game.keys[k]) Game.pressed[k]=true; Game.keys[k]=true; }
    audioResume();
  });
  window.addEventListener('keyup', e=>{
    const k = KEYMAP[e.code];
    if (k){ e.preventDefault(); Game.keys[k]=false; }
  });
  window.addEventListener('blur', ()=>{ Game.keys={}; });

  /* 触って遊ぶ用 */
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints>0;
  if (isTouch){
    Game.touch = true;
    const handle = (e, down)=>{
      e.preventDefault(); audioResume();
      Game.pad.x=0; Game.pad.y=0;
      let act=false, can=false, bag=false, nxt=false;
      const r = cv.getBoundingClientRect();
      const touches = down? e.touches : [];
      for (let i=0;i<touches.length;i++){
        const t = touches[i];
        const fx = (t.clientX-r.left)/r.width, fy=(t.clientY-r.top)/r.height;
        const TR = Game.touchRects;
        const inR = (q)=> q && fx>=q[0] && fx<=q[2] && fy>=q[1] && fy<=q[3];
        /* A・B は丸いボタンの近いほう */
        const dA = Math.hypot((fx-0.86)*r.width, (fy-0.86)*r.height);
        const dB = Math.hypot((fx-0.76)*r.width, (fy-0.68)*r.height);
        const rad = Math.min(r.width, r.height)*0.16;
        if (TR && inR(TR.bag)) bag = true;
        else if (TR && inR(TR.next)) nxt = true;
        else if (fx < 0.34 && fy > 0.52){
          /* 左下＝スライドパッド */
          const cx=0.17, cy=0.78;
          const dx=(fx-cx)*r.width, dy=(fy-cy)*r.height;
          if (Math.hypot(dx,dy) > rad*0.18){
            if (Math.abs(dx)>Math.abs(dy)) Game.pad.x = dx>0?1:-1;
            else Game.pad.y = dy>0?1:-1;
          }
        } else if (Math.min(dA,dB) < rad || (fx > 0.62 && fy > 0.52)){
          if (dA <= dB) act = true; else can = true;
        } else if (!TR && fy < 0.16 && fx > 0.85) bag = true;
        else if (!TR && fy < 0.16 && fx > 0.70) nxt = true;
      }
      /* 押した瞬間だけ「押された」にする（指を置いたままでは繰り返さない） */
      if (act && !Game.padActPrev) Game.pressed['act']=true;
      if (can && !Game.padCanPrev) Game.pressed['cancel']=true;
      if (bag && !Game.padBagPrev) Game.pressed['bag']=true;
      if (nxt && !Game.padNxtPrev) Game.pressed['next']=true;
      Game.padAct = act;
      Game.padActPrev = act; Game.padCanPrev = can; Game.padBagPrev = bag; Game.padNxtPrev = nxt;
    };
    cv.addEventListener('touchstart', e=>handle(e,true), {passive:false});
    cv.addEventListener('touchmove',  e=>handle(e,true), {passive:false});
    cv.addEventListener('touchend',   e=>handle(e,false), {passive:false});
    cv.addEventListener('touchcancel',e=>handle(e,false), {passive:false});
  }
  cv.addEventListener('mousedown', ()=>audioResume());
}
function pressed(k){ return !!Game.pressed[k]; }
function held(k){
  if (Game.keys[k]) return true;
  if (Game.touch){
    if (k==='up') return Game.pad.y<0;
    if (k==='down') return Game.pad.y>0;
    if (k==='left') return Game.pad.x<0;
    if (k==='right') return Game.pad.x>0;
  }
  return false;
}
function clearPressed(){ Game.pressed = {}; }

/* ---------------------------------------------------------------- 更新 */
function facingTile(){
  const tx = Math.floor(S.px/TILE), ty = Math.floor((S.py-2)/TILE);
  const d = [[0,1],[-1,0],[1,0],[0,-1]][S.dir];
  return [tx+d[0], ty+d[1]];
}
function standTile(){ return [Math.floor(S.px/TILE), Math.floor((S.py-2)/TILE)]; }

function canWalk(area, nx, ny){
  const a = areaOf(area);
  const pts = [[nx-5,ny-5],[nx+5,ny-5],[nx-5,ny-1],[nx+5,ny-1]];
  for (const p of pts){
    const tx = Math.floor(p[0]/TILE), ty = Math.floor(p[1]/TILE);
    if (isSolid(a,tx,ty)) return false;
  }
  return true;
}

function updatePlayer(dt){
  /* 道具のふり */
  if (Game.swing){
    Game.swing.t += dt*3.6;
    if (Game.swing.t>=1) Game.swing=null;
  }
  const speed = (held('run')?128:80) * dt;
  let dx=0, dy=0;
  if (!Game.swing){
    if (held('left')) dx-=1;
    if (held('right')) dx+=1;
    if (held('up')) dy-=1;
    if (held('down')) dy+=1;
  }
  if (dx&&dy){ dx*=0.7071; dy*=0.7071; }
  Game.moving = !!(dx||dy);
  if (dx<0) S.dir=1; else if (dx>0) S.dir=2;
  else if (dy<0) S.dir=3; else if (dy>0) S.dir=0;

  if (dx){
    const nx = S.px + dx*speed;
    if (canWalk(S.area,nx,S.py)) S.px = nx;
  }
  if (dy){
    const ny = S.py + dy*speed;
    if (canWalk(S.area,S.px,ny)) S.py = ny;
  }
  if (Game.moving){
    Game.walkT += dt*(held('run')?11:7.5);
    const f = Math.floor(Game.walkT)%4;
    if (f!==Game.frame){
      Game.frame=f;
      if (f===1||f===3) SFX.step();
    }
  } else { Game.frame=0; Game.walkT=0; }

  /* 落ちものを拾う */
  const st = standTile();
  for (let i=S.ground.length-1;i>=0;i--){
    const g = S.ground[i];
    if (g.area!==S.area) continue;
    if (Math.abs(g.x-st[0])<=0 && Math.abs(g.y-st[1])<=0){
      if (invPut(g.id,g.qty,g.q||0)===0){
        toast(ITEMS[g.id].name+'×'+g.qty+' を拾った');
        SFX.coin(); S.ground.splice(i,1);
      }
    }
  }

  /* ワープ */
  const a = areaOf(S.area);
  const w = warpAt(a, st[0], st[1]);
  if (w && !Game.fade){
    doWarp(w);
  }
}

function doWarp(w){
  if (w.to==='greenIn' && !hasUp('greenh')){
    if (!Game.greenMsg || Game.time-Game.greenMsg > 4){
      Game.greenMsg = Game.time;
      toast('温室は壊れている。ナツキの工房で直してもらおう。');
      SFX.no();
    }
    S.py += 12;   // 扉から押し返す
    return;
  }
  SFX.warp();
  fadeOut(()=>{
    if (w.mine){ enterMine(1); return; }
    S.area = w.to;
    S.px = w.tx*TILE+8; S.py = w.ty*TILE+14;
    S.dir = w.dir!=null? w.dir : 0;
    Game.cam.x = -9999;
  }, 0.22);
}
function enterMine(floor){
  S.mineFloor = floor;
  S.mineArea = genMine(floor, S.mineSeed);
  S.area='mine';
  S.px = S.mineArea.spawn.x*TILE+8;
  S.py = S.mineArea.spawn.y*TILE+14;
  S.dir = 0;
  Game.cam.x=-9999;
}

/* ---------------------------------------------------------------- 住民 */
function updateNPCs(dt){
  const list = Game.npcs[S.area];
  if (!list) return;
  for (const n of list){
    n.t += dt;
    if (!n.wander) continue;
    n.wait -= dt;
    if (n.wait<=0){
      n.wait = 1.5+Math.random()*3.5;
      const a = areaOf(S.area);
      for (let i=0;i<8;i++){
        const nx = n.hx + ((Math.random()*2*n.wander)|0) - n.wander;
        const ny = n.hy + ((Math.random()*2*n.wander)|0) - n.wander;
        if (!isSolid(a,nx,ny)){ n.tx=nx; n.ty=ny; break; }
      }
    }
    const gx = n.tx*TILE+8, gy = n.ty*TILE+15;
    const ddx = gx-n.x, ddy = gy-n.y;
    const d = Math.hypot(ddx,ddy);
    if (d>1.2){ n.x += ddx/d*26*dt; n.y += ddy/d*26*dt; }
  }
}
function npcAtTile(x,y){
  const list = Game.npcs[S.area]; if (!list) return null;
  for (const n of list){
    const nx = Math.floor(n.x/TILE), ny = Math.floor((n.y-2)/TILE);
    if (nx===x && ny===y) return n;
    if (nx===x && ny-1===y) return n;   // 背の高い相手は1マス上も当たり判定
  }
  return null;
}

/* ---------------------------------------------------------------- 使う */
function swing(act){ Game.swing = { act:act, t:0 }; }

function interact(){
  const [fx_, fy_] = facingTile();
  const a = areaOf(S.area);

  /* 住民 */
  const n = npcAtTile(fx_,fy_);
  if (n){ talkTo(n.id); return; }

  /* 置いてあるもの */
  const o = objAt(a, fx_, fy_);
  if (o && !o.gone){
    const d = OBJDEF[o.t];
    if (d && d.act){
      switch (d.act){
        case 'water':   refillCan(); return;
        case 'bin':     openShip(); return;
        case 'gravity': openGravity(); return;
        case 'shop':    openShop(); return;
        case 'upgrade': openUpgrade(); return;
        case 'lab':     openLab(); return;
        case 'sleep':   goSleep(); return;
        case 'calendar':openCalendar(); return;
        case 'note':    openDex(); return;
        case 'machine': openMachine(o.n); return;
        case 'vend':    openVend(); return;
        case 'sign':    dialogSeq([{who:'', text:o.text||'……読めない。'}]); return;
        case 'down':
          if (S.mineFloor>=10){ toast('これより下は岩盤だ。'); return; }
          if (S.mineFloor>=4 && rankNow()<3){ toast('これより下は崩れやすい。評価が上がれば下りられる。'); return; }
          SFX.warp(); fadeOut(()=>enterMine(S.mineFloor+1), 0.22); return;
        case 'up':
          SFX.warp();
          fadeOut(()=>{
            if (S.mineFloor<=1){ S.area='home'; S.px=5*TILE+8; S.py=23*TILE+14; S.dir=0; S.mineArea=null; }
            else enterMine(S.mineFloor-1);
            Game.cam.x=-9999;
          },0.22);
          return;
      }
    }
    if (o.t==='rock'){ actPick(fx_,fy_); return; }
    if (o.t==='shrub'){ toast('コスモ低木。カマで刈れる。'); return; }
    if (o.t==='crate'){ toast('農機具の箱。中身はもう空っぽ。'); return; }
    if (o.t==='poster'){ dialogSeq([{who:'', text:'色あせたポスター。\n『地球産トマト　—— もう一度、あの味を。』'}]); return; }
  }

  /* 実っていたら収穫 */
  const c = cropAt(S.area,fx_,fy_);
  const hs = handSlot(), hi = handItem();
  if (c && cropStage(c)===4 && !(hi && hi.id==='t_sickle')){
    if (hi && hi.id==='t_scan'){ scanCrop(c); return; }
    actHarvest(fx_,fy_); return;
  }

  /* 手に持っているもので */
  if (hi){
    if (hi.kind==='tool'){
      switch (hi.id){
        case 't_hoe':    actTill(fx_,fy_); return;
        case 't_can':    actWater(fx_,fy_); return;
        case 't_sickle': actSickle(fx_,fy_); return;
        case 't_pick':   actPick(fx_,fy_); return;
        case 't_scan':   scanTile(fx_,fy_); return;
      }
    }
    if (hi.kind==='seed'){ actPlant(fx_,fy_,S.hand); return; }
    if (hi.kind==='use' && hi.id.startsWith('f_')){ actFert(fx_,fy_,S.hand); return; }
    if (hi.kind==='use' && hi.energy){ eatItem(S.hand); return; }
    if (hi.kind==='crop'){ eatCrop(S.hand); return; }
  }
  if (c){ scanCrop(c); return; }
  toast('……なにもない。');
}

function eatItem(i){
  const s = S.inv[i]; if (!s) return;
  const it = ITEMS[s.id];
  S.energy = Math.min(S.energyMax, S.energy + (it.energy>=999? S.energyMax : it.energy));
  invTake(s.id,1,s.q||0);
  SFX.ok(); toast(it.name+'を食べた。元気が戻った。');
}
function eatCrop(i){
  const s = S.inv[i]; if (!s) return;
  const it = ITEMS[s.id];
  const V = VARIETIES[it.variety];
  confirmBox(it.name+'を食べる？\n（元気が'+(10+V.sugar*2)+'ほど戻る）', ()=>{
    S.energy = Math.min(S.energyMax, S.energy + 10 + V.sugar*2 + (s.q||0)*6);
    invTake(s.id,1,s.q||0);
    SFX.ok();
    toast(V.name+'を食べた。'+ (V.sugar>=10? '……甘い。ひどく甘い。' : V.sugar>=7? '甘くて、少し青い匂いがする。' : '土の味がする。悪くない。'));
  });
}
function scanCrop(c){
  const V = VARIETIES[c.v];
  const st = cropStage(c);
  const names = ['種をまいた','芽が出た','株が立った','花がついた','実っている'];
  let t = V.name+'\n状態：'+names[st];
  if (c.dead) t = V.name+'\n状態：枯れてしまった（カマで片づけられる）';
  else {
    t += '\n育ち：'+c.prog+' / '+c.need+' 日';
    if (c.re>0) t += '\n次の実まで：あと'+c.re+'日';
    if (c.fallen) t += '\n⚠ 倒れている（支柱があれば防げた）';
    if (c.fert) t += '\n肥料：'+ITEMS[c.fert].name;
    if (c.elite) t += '\n選抜種：★'+c.elite+'相当';
    const grav = GRAVITY_STEPS[c.gi!=null?c.gi:S.gravIdx];
    t += '\n重力：'+grav.name;
  }
  dialogSeq([{who:'生育スキャナ', text:t}]);
}
function scanTile(x,y){
  const c = cropAt(S.area,x,y);
  if (c){ scanCrop(c); return; }
  const t = tileState(S.area,x,y,false);
  if (t && t.till){
    dialogSeq([{who:'生育スキャナ', text:'耕された土。\n水：'+(t.wet?'足りている':'かわいている')+
      (t.fert? '\n肥料：'+ITEMS[t.fert].name : '\n肥料：なし')}]);
    return;
  }
  const grav = gravNow();
  dialogSeq([{who:'生育スキャナ', text:
    seasonNow().name+'（'+S.day+'日目）　天候：'+WEATHERS[S.weather].name+
    '\n重力：'+grav.name+'（'+grav.label+'）'+
    '\n'+grav.note+
    '\n\n'+seasonNow().note}]);
}

/* ---------------------------------------------------------------- 会話 */
function talkTo(id){
  const N = NPCS[id], st = S.npc[id];
  const lines = [];
  const warm = st.hearts>=4 && Math.random()<0.5;
  const pool = warm? N.warm : N.hello;
  lines.push({who:N.name, text:pool[(absDay()+st.hearts)%pool.length]});

  if (st.talkDay !== absDay()){
    st.talkDay = absDay();
    npcGain(id, 12);
  }

  /* 役割ごとの追い足し */
  if (id==='zax'){
    lines.push({who:N.name, text:'ご用ハ？', menu:[
      {label:'買う', act:()=>openShop()},
      {label:'依頼ボードを見る', act:()=>openQuests()},
      {label:'なんでもない', act:null},
    ]});
  } else if (id==='natsuki'){
    lines.push({who:N.name, text:'設備、どうする？', menu:[
      {label:'工房を見る', act:()=>openUpgrade()},
      {label:'加工機を買う', act:()=>openMachineShop()},
      {label:'また来る', act:null},
    ]});
  } else if (id==='luna'){
    lines.push({who:N.name, text:'研究の話をしましょうか。', menu:[
      {label:'交配する', act:()=>openLab()},
      {label:'トマト図鑑を見る', act:()=>openDex()},
      {label:'また来ます', act:null},
    ]});
  } else if (id==='obaba'){
    if (!S.flags.told1){ S.flags.told1=1; lines.push({who:'オババ', text:'帳面は家の中だ。読んでおきな。\n図鑑になってる。'}); }
    lines.push({who:N.name, text:'', menu:[
      {label:'昔の話を聞く', act:()=>obabaLore()},
      {label:'今日の助言をもらう', act:()=>obabaHint()},
      {label:'なんでもない', act:null},
    ]});
  } else if (id==='toma'){
    SFX.cat();
    npcGain(id, 4);
    lines.push({who:'', text:'（トマをなでた。しばらく元気が出た）'});
    S.energy = Math.min(S.energyMax, S.energy+6);
  }
  dialogSeq(lines);
}

const LORE = [
  'この小惑星に最初に来たのは、わたしの母だ。\n土なんぞ一粒も無かったところに、堆肥を積んだ。',
  'トマトは水をやりすぎると味が抜ける。かわいがりすぎるな、ということだ。\n人も同じかもしれんね。',
  '重力をいじるようになったのは、わたしの代からだ。\n小さく甘くするのも、大きく水っぽくするのも、農家の選択だ。',
  '青いトマトを見たのは一度だけだ。\nフレアの翌朝、畑の隅で光っていた。種は取れなかった。',
  '地球のトマトはもう無い。だがな、無くなったのは畑だ。\n種は、まだある。あんたの手の中に。',
  'ギャラクシア。理屈は帳面に書いてある。\n黒と青を掛け合わせろ、と。わたしは間に合わなかった。',
];
function obabaLore(){
  const i = (S.flags.loreI|0) % LORE.length;
  S.flags.loreI = i+1;
  dialogSeq([{who:'オババ', text:LORE[i]}]);
  npcGain('obaba', 6);
}
function obabaHint(){
  const t = [];
  const grav = gravNow();
  let n=0;
  for (const k in S.crops){ const c=S.crops[k]; if (cropStage(c)===4 && !c.dead) n++; }
  if (n) t.push('実ってるのが'+n+'株ある。早く採りな。');
  let dry=0;
  for (const k in S.tiles){ const kk=k.split(':')[0]; if (kk==='home' && S.tiles[k].till && !S.tiles[k].wet && S.crops[k]) dry++; }
  if (dry) t.push('水をやってない株が'+dry+'ある。');
  if (S.tomorrowWeather==='flare' && !hasUp('shield')) t.push('明日はフレアだ。シールドが無いなら、覚悟しておきな。……悪いことばかりでもない。');
  if (S.tomorrowWeather==='meteor') t.push('明日は隕石雨だ。畑に石が転がるよ。隕鉄が落ちてることもある。');
  if (S.tomorrowWeather==='dew') t.push('明日は結露だ。水やりは休んでいい。');
  if (seasonNow().id==='shimo' && !hasUp('heater')) t.push('霜季だ。フロストベルとブラックホール以外は凍る。');
  if (seasonNow().id==='kage' && !hasUp('lamp')) t.push('影季だ。ネビュラ以外は光が足りん。');
  if (grav.fallRisk>0 && !hasUp('stake')) t.push('その重力じゃ茎が倒れる。支柱を買いな。');
  if (!t.length) t.push('今日は特にない。よくやってるよ。');
  if (S.day===DAYS_PER_SEASON) t.push('明日から季が変わる。植えっぱなしの株に気をつけな。');
  dialogSeq([{who:'オババ', text:t.slice(0,3).join('\n')}]);
  npcGain('obaba', 4);
}

/* ---------------------------------------------------------------- 手持ち */
function cycleHand(dir){
  for (let i=0;i<10;i++){
    S.hand = (S.hand + dir + 10) % 10;
    if (S.inv[S.hand]) break;
  }
  SFX.menu();
}

/* ==== 60_farm.js ==== */
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

/* ==== 70_ui.js ==== */
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
function txt(c,str,x,y,size,color,align,bold){
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
        if (this.top>0) txt(c,'▲',bx+bw-5*s,by+19*s,7*s,COL.dim,'center');
        if (this.top+this.rows<this.items.length) txt(c,'▼',bx+bw-5*s,by+bh-(this.footer?27*s:13*s),7*s,COL.dim,'center');
      }
      if (this.footer){
        txt(c,this.footer,bx+9*s,by+bh-15*s,8*s,COL.dim);
        if (this.allowQty) txt(c,'◀ '+this.qty+'個 ▶', bx+bw-9*s, by+bh-15*s, 8*s, COL.green,'right');
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

/* ==== 80_render.js ==== */
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

/* ==== 82_gfx3d_core.js ==== */
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

/* ==== 83_gfx3d_models.js ==== */
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

/* ==== 84_gfx3d_scene.js ==== */
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
  W3.area = S.area; W3.areaObj = a;
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
    e.sig = sig; e.grp = null;
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
  if (W3.area !== S.area || W3.areaObj !== a) w3EnterArea();
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

/* ==== 90_main.js ==== */
/* =========================================================================
   90_main.js  —  はじまりと、ぐるぐる回るところ
   ========================================================================= */

function startNew(){
  newGame();
  initNPCs();
  Game.mode='play'; uiClear();
  Game.cam.x=-9999;
  Game.fade = { t:0, dur:0.5, fn:null, phase:1 };
  musicPick();
  if (!Game.noIntro) setTimeout(intro, 500);
}
function startContinue(){
  if (!loadGame()){ startNew(); return; }
  initNPCs();
  Game.mode='play'; uiClear();
  Game.cam.x=-9999;
  Game.fade = { t:0, dur:0.5, fn:null, phase:1 };
  musicPick();
  toast('おかえり。'+seasonNow().name+' '+S.day+'日目。');
}

function intro(){
  dialogSeq([
    {who:'', text:'——　西暦2387年。\n地球のトマトは、疫病で ほとんど絶えた。'},
    {who:'', text:'あなたは 祖母の遺した小惑星農場「ソラナム」に着いた。\n遺品は、種の入った缶と、書きこみだらけの帳面ひとつ。'},
    {who:'オババ', text:'……起きたか。\nわたしは記録から起こされたホログラムだ。本物はもういない。'},
    {who:'オババ', text:'外に畑がある。クワで耕して、種をまいて、水をやりな。\nそれだけだ。それだけを、毎日。'},
    {who:'オババ', text:'ここは宇宙だ。重力も、季節も、降ってくるものも、地球とは違う。\nだがトマトは、どこでもトマトだよ。'},
    {who:'オババ', text:'夜になったらベッドで寝な。寝ないと畑で倒れる。\n……帳面は、そこの机にある。読んでおきな。'},
    {who:'', text:'【Z】つかう・話す　【X】やめる　【Tab】道具をかえる\n【I】もちもの　【P】図鑑　【H】あそびかた'},
  ]);
}

function musicPick(){
  const a = areaOf(S.area);
  if (!a) return;
  const mode = a.mine? 'night' : (isNight()? 'night':'');
  musicStart(SEASONS[S.season].id, mode);
}

/* ---------------------------------------------------------------- 目印 */
function computeHint(){
  const a = areaOf(S.area);
  const [fx_,fy_] = facingTile();
  const n = npcAtTile(fx_,fy_);
  if (n) return NPCS[n.id].name+'　と話す（Z）';
  const o = objAt(a,fx_,fy_);
  if (o && !o.gone){
    const d = OBJDEF[o.t];
    const L = {
      water:'じょうろに水を汲む', bin:'出荷箱に入れる', gravity:'重力コンソール',
      shop:'ZAX-9の店', upgrade:'ナツキの工房', lab:'交配ラボ', sleep:'寝る（次の日へ）',
      calendar:'こよみを見る', note:'オババの帳面（図鑑）', machine:'加工台', sign:'読む',
      down:'下の層へ', up:'上へもどる',
    };
    if (d && d.act && L[d.act]) return L[d.act]+'（Z）';
    if (o.t==='rock') return '石を割る（ツルハシ）';
    if (o.t==='shrub') return 'コスモ低木（カマで刈れる）';
  }
  const c = cropAt(S.area,fx_,fy_);
  if (c){
    if (c.dead) return '枯れた株（カマで片づける）';
    if (cropStage(c)===4) return VARIETIES[c.v].name+'を収穫（Z）';
    return VARIETIES[c.v].name+'（'+['種','芽','若株','花'][cropStage(c)]+'）';
  }
  const t = tileState(S.area,fx_,fy_,false);
  const hi = handItem();
  if (t && t.till){
    if (hi && hi.kind==='seed') return hi.name+'をまく（Z）';
    if (!t.wet) return 'かわいている　水をやろう';
    return '耕された土（うるおっている）';
  }
  if (tileAt(a,fx_,fy_).farm) return 'クワで耕せる（Z）';
  return '';
}

/* ---------------------------------------------------------------- 更新 */
function updatePlay(dt){
  S.t = Game.time;
  S.day2 = absDay();

  const top = uiTop();
  if (top){
    if (top.update) top.update(dt);
    for (const k in Game.pressed) if (Game.pressed[k]) top.key(k);
    Game.hint='';
  } else if (!Game.fade || Game.fade.phase===1){
    updatePlayer(dt);
    updateNPCs(dt);
    Game.hint = computeHint();

    if (pressed('act')) interact();
    if (pressed('cancel')) openSystem();
    if (pressed('bag')) openBag();
    if (pressed('dex')) openDex();
    if (pressed('quest')) openQuests();
    if (pressed('help')) openHelp();
    if (pressed('next')) cycleHand(1);
    if (pressed('prev')) cycleHand(-1);
    if (pressed('sound')){ musicSetOn(!Audio_.musicOn); toast(Audio_.musicOn?'音楽：オン':'音楽：オフ'); }
    for (let i=0;i<10;i++){
      if (pressed('s'+((i+1)%10))){ S.hand=i; SFX.menu(); }
    }
    /* 26:00 で力つき */
    if (S.time >= DAY_END && !Game.fainting) faint();
  }

  /* 効果・通知 */
  for (let i=Game.fx.length-1;i>=0;i--){
    Game.fx[i].t += dt*2.6;
    if (Game.fx[i].t>=1) Game.fx.splice(i,1);
  }
  for (let i=Game.toasts.length-1;i>=0;i--){
    Game.toasts[i].t += dt;
    if (Game.toasts[i].t>3.6) Game.toasts.splice(i,1);
  }
  if (Game.shake>0) Game.shake = Math.max(0, Game.shake-dt*3);

  updateCamera();
  musicPick();
}

/* 時間の進み（読みやすく分けた） */
function tickClock(dt){
  if (uiTop()) return;
  if (Game.fade && Game.fade.phase===0) return;
  S.time += dt * MIN_PER_SEC;
}

function updateTitle(dt){
  const opts = Game.titleOpts || ['はじめる','あそびかた'];
  if (pressed('up')){ Game.titleSel=((Game.titleSel||0)-1+opts.length)%opts.length; SFX.menu(); }
  if (pressed('down')){ Game.titleSel=((Game.titleSel||0)+1)%opts.length; SFX.menu(); }
  if (uiTop()){
    const top=uiTop();
    if (top.update) top.update(dt);
    for (const k in Game.pressed) if (Game.pressed[k]) top.key(k);
    return;
  }
  if (pressed('act')){
    const o = opts[Game.titleSel||0];
    SFX.ok();
    if (o==='つづきから') startContinue();
    else if (o==='はじめる'||o==='はじめから'){
      if (hasSave()) confirmBox('いまの記録を消して、はじめから遊ぶ？', ()=>{ deleteSave(); startNew(); });
      else startNew();
    }
    else openHelp();
  }
}

/* ---------------------------------------------------------------- 本体 */
function loop(ts){
  if (!Game.lastT) Game.lastT = ts;
  let dt = (ts - Game.lastT)/1000;
  Game.lastT = ts;
  if (dt>0.1) dt=0.1;
  Game.time += dt;

  /* 暗転 */
  if (Game.fade){
    const f = Game.fade;
    f.t += dt;
    if (f.phase===0 && f.t>=f.dur){
      f.phase=1; f.t=0;
      if (f.fn) f.fn();
    } else if (f.phase===1 && f.t>=f.dur){
      Game.fade=null;
    }
  }

  const c = R.c;
  if (Game.mode==='title'){
    updateTitle(dt);
    drawTitle();
  } else if (Game.mode==='ending'){
    Game.ending += dt;
    drawEnding();
    if (Game.ending > ENDING.length+10 && pressed('act')){
      Game.mode='play'; Game.ending=0; SFX.ok();
      toast('ギャラクシアの種は、まだ手もとにある。');
    }
  } else {
    tickClock(dt);
    updatePlay(dt);
    if (W3.on){
      w3Frame(dt);
      c.clearRect(0,0,R.W,R.H);
      drawOverlay3D();
    } else {
      drawWorld();
      c.clearRect(0,0,R.W,R.H);
      c.drawImage(R.world, 0,0, R.W, R.H);
    }
    drawHUD();
    for (const u of Game.ui) if (u.draw) u.draw(c);
  }
  drawFade();
  clearPressed();
  requestAnimationFrame(loop);
}

/* 3D表示のうえに重ねる、画面全体の効果（砂嵐・フレア・停電と、四隅のかげり） */
function drawOverlay3D(){
  const c = R.c, a = areaOf(S.area);
  if (a && a.sky){
    const w = S.weather;
    if (w==='dust' || w==='flare' || w==='outage'){
      R.wc.clearRect(0,0,VW,VH);
      drawWeather(R.wc, 0, 0, a);
      c.save(); c.imageSmoothingEnabled = true;
      c.drawImage(R.world, 0,0, R.W, R.H);
      c.restore();
    } else if (w==='meteor'){
      c.fillStyle='rgba(60,40,70,0.12)'; c.fillRect(0,0,R.W,R.H);
    }
  }
  if (!Game._vig || Game._vigW!==R.W || Game._vigH!==R.H){
    const cv = mkCv(R.W, R.H), g = cv.getContext('2d');
    const rg = g.createRadialGradient(R.W/2,R.H*0.48,Math.min(R.W,R.H)*0.35,R.W/2,R.H/2,Math.max(R.W,R.H)*0.75);
    rg.addColorStop(0,'rgba(0,0,0,0)'); rg.addColorStop(1,'rgba(6,8,24,0.42)');
    g.fillStyle=rg; g.fillRect(0,0,R.W,R.H);
    Game._vig = cv; Game._vigW=R.W; Game._vigH=R.H;
  }
  c.drawImage(Game._vig,0,0);
}

function boot(){
  const cv = document.getElementById('game');
  bakeTiles();
  if (w3Init() && document.body) document.body.classList.add('is3d');
  initRender(cv);
  bindInput(cv);
  /* 仮の状態（タイトル画面でも季節などを参照するため） */
  S = { season:0, day:1, year:1, time:600, gravIdx:2, weather:'clear', npc:{}, inv:[], ups:{}, dex:{}, crops:{}, tiles:{}, ship:[], machines:[], ground:[], stat:{}, credits:0, energy:1, energyMax:1, water:0, waterMax:20, area:'home', flags:{} };
  Game.mode='title'; Game.titleSel = 0;
  Game.titleOpts = hasSave()? ['つづきから','はじめから','あそびかた'] : ['はじめる','あそびかた'];
  const ld = document.getElementById('loading');
  if (ld) ld.style.display='none';
  requestAnimationFrame(loop);
}

if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

/* 手もとの確認用の窓口（遊ぶうえでは使わない） */
window.TSF = {
  Game:Game, R:R, AREAS:AREAS, VARIETIES:VARIETIES, ITEMS:ITEMS, NPCS:NPCS, SEASONS:SEASONS,
  loop:loop, boot:boot,
  get S(){ return S; }, set S(v){ S = v; },
  startNew:startNew, startContinue:startContinue, advanceDay:advanceDay, newGame:newGame,
  initNPCs:initNPCs, plantNow:plantNow, tileState:tileState, invPut:invPut, genMine:genMine,
  openShop:openShop, openDex:openDex, openBag:openBag, openUpgrade:openUpgrade, openLab:openLab,
  openQuests:openQuests, openCalendar:openCalendar, openHelp:openHelp, openGravity:openGravity,
  dialogSeq:dialogSeq, showMorning:showMorning, enterMine:enterMine, uiClear:uiClear,
  cropStage:cropStage, musicStop:musicStop,
  W3:W3,
  /* 立体の画面と文字の画面を重ねた1枚の絵（自動プレイの記録用） */
  snapshot:function(){
    if (!W3.on) return document.getElementById('game').toDataURL('image/png');
    if (Game.mode==='play') W3.renderer.render(W3.scene, W3.camera);
    else W3.renderer.render(W3.tScene, W3.tCam);
    const out = mkCv(R.W, R.H), g = out.getContext('2d');
    g.drawImage(W3.cv, 0, 0, R.W, R.H);
    g.drawImage(R.cv, 0, 0);
    return out.toDataURL('image/png');
  },
};
