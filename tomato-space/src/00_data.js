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
