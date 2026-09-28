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
