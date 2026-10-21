/* ================= persistence & settings ================= */
const LS={get(k,d){try{const v=localStorage.getItem('rr_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){if(window.__sim)return;try{localStorage.setItem('rr_'+k,JSON.stringify(v))}catch(e){}}};
let coins=LS.get('coins',0),best=LS.get('best',0),bestSt=LS.get('bestSt',0),owned=LS.get('owned',['human']),sel=LS.get('sel','human'),view=sel;
let SET=Object.assign({sfx:true,mus:true,hapt:true,shake:true},LS.get('set',{})),muted=!SET.sfx;
let META=LS.get('meta',{}),seen=LS.get('seen',{}),daily=LS.get('daily',{d:'',s:0});const ml=k=>META[k]||0;

/* ================= audio: sfx + synthwave ================= */
let AC=null,NB=null;
function au(force){if(muted&&!force)return null;try{if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();NB=AC.createBuffer(1,AC.sampleRate*.6|0,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}if(AC.state=='suspended')AC.resume();return AC}catch(e){return null}}
function tone(f1,f2,dur,type,vol,delay=0){const a=au();if(!a)return;const t=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+.03)}
function noise(dur,vol,fq,type='lowpass'){const a=au();if(!a)return;const t=a.currentTime,s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=NB;f.type=type;f.frequency.value=fq;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0008,t+dur);s.connect(f);f.connect(g);g.connect(a.destination);s.start(t);s.stop(t+dur)}
const SFX={shoot:()=>tone(1200,600,.04,'square',.012),hit:()=>tone(420,200,.04,'square',.016),kill:()=>{noise(.14,.09,2400);tone(520,80,.13,'sawtooth',.03)},
 coin:()=>{tone(1567,1567,.04,'square',.018);tone(2093,2093,.07,'square',.018,.04)},good:()=>[523,659,784,1046].forEach((f,i)=>tone(f,f,.1,'square',.04,i*.05)),
 bad:()=>{[392,330,262].forEach((f,i)=>tone(f,f*.9,.12,'sawtooth',.04,i*.07));noise(.3,.08,600)},hurt:()=>{noise(.25,.22,700);tone(240,50,.3,'sawtooth',.07)},
 boss:()=>{tone(80,30,2,'sawtooth',.12);noise(1.6,.12,220)},big:()=>{noise(1,.3,800);tone(160,25,1,'square',.1)},click:()=>tone(880,1320,.05,'square',.04),
 pick:()=>tone(700,1600,.14,'triangle',.07),warn:()=>{for(let i=0;i<3;i++){tone(660,660,.14,'square',.05,i*.36);tone(520,520,.14,'square',.05,i*.36+.18)}},buy:()=>[784,988,1318,1568].forEach((f,i)=>tone(f,f,.1,'square',.05,i*.06)),
 boom:()=>{noise(.4,.22,700);tone(120,35,.4,'square',.06)},shieldbreak:()=>{noise(.2,.15,3000,'highpass');tone(900,200,.25,'square',.04)},zap:()=>tone(300,1200,.16,'sawtooth',.03),
 charge:()=>tone(200,900,.5,'sawtooth',.035),laser:()=>{noise(.5,.12,1800,'bandpass');tone(110,90,.5,'sawtooth',.06)},dash:()=>{noise(.18,.15,4000,'highpass');tone(1400,200,.2,'sawtooth',.04)},
 erupt:()=>{noise(.25,.14,500);tone(90,40,.25,'square',.05)},glitch:()=>{for(let i=0;i<5;i++)tone(rnd(200,2000),rnd(100,3000),.04,'square',.03,i*.035)},
 phase:()=>{tone(60,200,1.2,'sawtooth',.1);noise(1.2,.15,400)},stage:()=>[392,523,659,784,1046].forEach((f,i)=>tone(f,f,.14,'square',.05,i*.08)),virus:()=>{tone(300,80,.4,'sawtooth',.06);noise(.3,.1,1500,'bandpass')}};
const lastS={};function sfx(n,min=0){if(muted||window.__sim)return;const t=performance.now();if(t-(lastS[n]||0)<min)return;lastS[n]=t;try{SFX[n]()}catch(e){}}
function buzz(ms){if(!SET.hapt||window.__sim)return;try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}}
const MUS={on:false,next:0,step:0,mode:'menu',gain:null,timer:null};
const NF=n=>440*Math.pow(2,(n-69)/12);
const SONGS={menu:{bpm:92,prog:[[57,60,64],[53,57,60],[55,59,62],[52,55,59]],bass:[45,41,43,40],drum:0,arp:1},
 battle:{bpm:118,prog:[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],bass:[45,41,36,43],drum:1,arp:2},
 boss:{bpm:140,prog:[[57,60,63],[56,59,63],[54,57,61],[56,59,62]],bass:[45,44,42,44],drum:2,arp:2}};
function mnote(f,t,d,type,v,cut){const a=AC,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;if(cut){const fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(cut*2.5,t);fl.frequency.exponentialRampToValueAtTime(cut,t+d*.6);fl.Q.value=4;o.connect(fl);fl.connect(g)}else o.connect(g);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+(d>1?.4:.006));g.gain.exponentialRampToValueAtTime(.0005,t+d);g.connect(MUS.gain);o.start(t);o.stop(t+d+.05)}
function mkick(t){const a=AC,o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(38,t+.15);g.gain.setValueAtTime(.4,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(g);g.connect(MUS.gain);o.start(t);o.stop(t+.24)}
function mnz(t,hp,v,d){const a=AC,s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=NB;f.type='highpass';f.frequency.value=hp;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);g.connect(MUS.gain);s.start(t,Math.random()*.3,d+.02)}
function musTick(){const a=AC;if(!a||!MUS.on||!MUS.gain)return;const S2=SONGS[MUS.mode],spb=60/S2.bpm/4;if(MUS.next<a.currentTime)MUS.next=a.currentTime+.05;
 while(MUS.next<a.currentTime+.2){const t=MUS.next,st=MUS.step,bar=(st>>4)%4,ch=S2.prog[bar],b=st%16;
  if(S2.drum)mnote(NF(S2.bass[bar]-(b%2?0:12)),t,spb*.95,'sawtooth',.075,320);else if(b%4==0)mnote(NF(S2.bass[bar]-12),t,spb*3.8,'sawtooth',.07,260);
  if(S2.arp==2||b%2==0){const n=ch[(S2.arp==2?st:st>>1)%3]+12+12*((st>>2)&1);mnote(NF(n),t,spb*.8,'square',S2.drum?.016:.02,2400)}
  if(b==0)for(const n of ch)mnote(NF(n),t,spb*16,'sawtooth',.012,700);
  if(S2.drum){if(b%4==0)mkick(t);if(b%8==4)mnz(t,1500,.16,.18);if(b%2==1)mnz(t,8000,.025,.03);if(S2.drum==2&&bar==3&&b>=12)mnz(t,1500,.1,.08)}
  MUS.next+=spb;MUS.step++}}
function music(mode){if(mode)MUS.mode=mode;if(!SET.mus||window.__sim){musStop();return}const a=au(1);if(!a)return;if(!MUS.on){MUS.on=true;MUS.gain=a.createGain();MUS.gain.gain.value=.55;MUS.gain.connect(a.destination);MUS.next=a.currentTime+.1;MUS.step=0;MUS.timer=setInterval(musTick,40)}}
function musStop(){MUS.on=false;clearInterval(MUS.timer);if(MUS.gain){try{MUS.gain.disconnect()}catch(e){}MUS.gain=null}}
function musVol(v){if(MUS.gain&&AC)MUS.gain.gain.setTargetAtTime(v,AC.currentTime,.1)}

/* ================= balance & content data =================
 Hero budget P = DPS_eff x EHP ~ equal across heroes.
 Upgrades: diminishing returns 1+MAX(1-e^-Cn).  Enemy HP: 1.25^(s-1) to stage 3, then x1.42/stage (multifold late game). */
const BAL={rateMax:.9,rateC:.32,dmgMax:1.3,dmgC:.28,negK:.18,shotsMax:5,shotExp:.78,bossHP:440,bossGrow:1.42};
const rateMul=n=>n>=0?1+BAL.rateMax*(1-Math.exp(-BAL.rateC*n)):1/(1+BAL.negK*-n);
const dmgMul=n=>n>=0?1+BAL.dmgMax*(1-Math.exp(-BAL.dmgC*n)):1/(1+BAL.negK*-n);
const shotF=n=>Math.pow(n,BAL.shotExp)/n;
const hpMul=s=>s<=3?Math.pow(1.25,s-1):1.5625*Math.pow(1.42,s-3);
const ET={
 drone: {rig:'drone', hp:1,  v:105,r:13,s:.9, val:1,cost:1,from:1,home:.5},
 punk:  {rig:'punk',  hp:3,  v:70, r:15,s:.88,val:2,cost:2,from:1,home:.3},
 micro: {rig:'micro', hp:1.3,v:125,r:12,s:.9, val:1,cost:1,from:2,flock:1},
 sniper:{rig:'sniper',hp:4,  v:62, r:15,s:.9, val:3,cost:3,from:2,shoot:1},
 nanite:{rig:'nanite',hp:6,  v:46, r:17,s:1.15,val:3,cost:3,from:3,split:1},
 mech:  {rig:'mech',  hp:15, v:36, r:24,s:1.0,val:6,cost:5,from:3,heavy:1},
 rigger:{rig:'rigger',hp:2.5,v:92, r:15,s:.88,val:2,cost:2,from:4,bomb:1,home:1.2},
 riot:  {rig:'riot',  hp:11, v:40, r:20,s:1.0,val:6,cost:5,from:4,shield:1,heavy:1},
 hacker:{rig:'hacker',hp:9,  v:52, r:16,s:.95,val:7,cost:6,from:5,summon:1},
 naniteS:{rig:'naniteS',hp:2,v:62, r:12,s:.7, val:1,cost:1,from:99}};
const ELITE={over:{n:'OVERCLOCKED',c:'#ff2ad8'},armor:{n:'ARMORED',c:'#ffd84a'},vol:{n:'VOLATILE',c:'#ff8a2a'}};
const BOSSES=[
 {k:'overseer',name:'OVERSEER-0',title:'THE ALL-SEEING EYE',arena:'lockdown',c:'#ff2a4a'},
 {k:'hydra',name:'HYDRA PROTOCOL',title:'THREE-HEADED SIEGE ENGINE',arena:'grid',c:'#7aff3a'},
 {k:'shogun',name:'NEON SHOGUN',title:'BLADE OF THE SYNDICATE',arena:'ring',c:'#ff2a4a'},
 {k:'queen',name:'GLITCH QUEEN',title:'ERROR IN THE SYSTEM',arena:'glitch',c:'#c03aff'}];
const DB={lag:{n:'LAG',d:'Fire rate -45%',t:7},jam:{n:'JAMMED',d:'Weapon stutters',t:6},glitch:{n:'GLITCH',d:'Controls inverted',t:5},drag:{n:'DRAG',d:'Sluggish movement',t:7},black:{n:'BLACKOUT',d:'Vision reduced',t:6},emp:{n:'EMP',d:'Skills & shield offline',t:6}};
const BF={over:{n:'OVERDRIVE',t:6,c:'#ffd84a'},chrono:{n:'CHRONO',t:5,c:'#7a8aff'},magnet:{n:'MAGNET',t:8,c:'#ff6a6a'}};
const RAR={common:'#9ab8d8',rare:'#3ab0ff',epic:'#c06aff',legendary:'#ffb21f'};
const SK=[
 {k:'multi',n:'Split Barrel',d:'+1 projectile per volley',ic:'⇈',max:3,rar:'epic'},
 {k:'crit',n:'Kill Code',d:'+15% chance to deal 2.5× damage',ic:'◎',max:3,rar:'rare'},
 {k:'side',n:'Flank Rounds',d:'Also fire two diagonal shots',ic:'⟰',max:2,rar:'rare'},
 {k:'rico',n:'Ricochet',d:'Shots bounce to another enemy',ic:'↯',max:2,rar:'epic'},
 {k:'blades',n:'Mono-Wire Orbit',d:'Laser blades circle you',ic:'✦',max:3,rar:'epic'},
 {k:'frost',n:'Cryo Rounds',d:'Hits slow enemies by 35%',ic:'❄',max:1,rar:'rare'},
 {k:'heart',n:'Biomod',d:'+1 max heart and heal fully',ic:'♥',max:3,rar:'common'},
 {k:'ward',n:'Aegis Firmware',d:'Regain a shield every 25s',ic:'⛨',max:1,rar:'rare'},
 {k:'boom',n:'Detonator',d:'Slain enemies explode',ic:'✸',max:2,rar:'legendary'},
 {k:'power',n:'Overcharge',d:'+20% damage',ic:'⚔',max:5,rar:'common'},
 {k:'haste',n:'Cooling Loop',d:'+15% fire rate',ic:'⚡',max:5,rar:'common'},
 {k:'firewall',n:'Firewall',d:'Power-downs last 50% shorter',ic:'⛊',max:1,rar:'rare'}];
const TAL=[
 {k:'dmg',n:'Overclocked Core',d:'+6% damage per level',ic:'⚔',max:5,c:[100,200,350,550,800]},
 {k:'rate',n:'Servo Trigger',d:'+5% fire rate per level',ic:'⚡',max:5,c:[100,200,350,550,800]},
 {k:'hp',n:'Reinforced Frame',d:'+1 max heart per level',ic:'♥',max:2,c:[450,1200]},
 {k:'coin',n:'Data Miner',d:'+10% credits per level',ic:'◆',max:5,c:[80,160,280,450,700]},
 {k:'shield',n:'Aegis Boot',d:'Start every stage with a shield',ic:'⛨',max:1,c:[650]},
 {k:'luck',n:'Lucky Packet',d:'+25% pickup drops',ic:'✚',max:3,c:[150,300,500]},
 {k:'reroll',n:'Predictive AI',d:'+1 skill reroll per pick',ic:'↻',max:2,c:[300,700]},
 {k:'anti',n:'Antivirus',d:'Power-downs 20% shorter per level',ic:'⛊',max:2,c:[250,600]}];
const CODEX={drone:['Seeker Drone','Cheap corp surveillance. Swarms in packs.'],punk:['Neon Punk','Bat-swinging street muscle that drifts toward you.'],micro:['Micro Swarm','Kamikaze darts that weave in flocks.'],sniper:['Corp Sniper','Stops at range. Red glow means a shot is coming.'],
 nanite:['Nanite Cube','Splits in two when destroyed.'],mech:['Strider Mech','Slow armored walker. Barely flinches.'],rigger:['Rigger','Explosive runner. The blast also hits its allies.'],riot:['Riot Unit','Hex shield absorbs 70% until it breaks.'],hacker:['Hacker','Summons drones and throws virus chips. Kill first.'],
 b0:['OVERSEER-0','Locks the street down. Sweeping eye lasers.'],b1:['HYDRA PROTOCOL','The floor explodes. Never stand still.'],b2:['NEON SHOGUN','Duels in a ring. Watch the dash lines.'],b3:['GLITCH QUEEN','Only one of her is real. Corrupts your controls.']};
const DAYR=[60,90,120,160,200,260,500];

/* ================= run state ================= */
const GS_={shots:{lab:'SHOTS',k:14},rate:{lab:'FIRE RATE',k:6},dmg:{lab:'DAMAGE',k:6}};
let G=null,st='menu',last=0,menuT=0;
function show(id){['m','p','o','sk','tal','cod','dly','set'].forEach(k=>$(k).classList.toggle('on',k==id));$('pz').style.display=st=='play'?'grid':'none'}
function start(){const base=RACES.find(a=>a.id==sel)||RACES[0],r=Object.assign({},base);r.dmg*=1+.06*ml('dmg');r.rate*=1+.05*ml('rate');const mh=r.hp+ml('hp');
 G={r,t:0,dist:0,rdist:0,scroll:110,sc:0,co:0,kills:0,stage:0,hp:mh,mh,px:W/2,py:H-130,tx:W/2,ty:H-130,lv:{shots:1,rate:0,dmg:0},cd:0,inv:0,sh:0,rev:r.revive||0,
  shk:0,hf:0,slow:1,hs:0,dead:0,mf:0,cpop:0,sk:{},skT:0,ang:0,coinMul:1+.1*ml('coin'),dropMul:1+.25*ml('luck'),db:{},bf:{},trail:[],
  E:[],B:[],EB:[],Gt:[],P:[],T:[],D:[],C:[],K:[],A:[],BM:[],TL:[],WV:[],CL:[],cars:[],
  boss:null,ar:null,lb:0,zoom:1,zx:W/2,zy:H/2,flash:0,gl:0,card:null,banner:null,alarm:0,di:0,odi:0,dif:0,phase:'rest',pt:1.2,waves:[],wi:0,q:[],wt:0,storm:20,stormT:0};
 nextStage();st='play';show(null);sfx('click');music('battle');openPick('INSTALL A MOD','Choose your first upgrade for this run')}
function nextStage(){const g=G;g.stage++;if(ml('shield'))g.sh=1;g.odi=g.di;g.di=(g.stage-1)%4;g.dif=g.stage>1?1:0;g.waves=makeWaves(g.stage);g.wi=0;g.q=[];g.phase='rest';g.pt=g.stage==1?1.4:2.4;
 g.banner={t:2.8,a:'DISTRICT '+String(g.stage).padStart(2,'0'),b:DIST[g.di].n,c:{2:'NEW: Micro swarms · Corp snipers',3:'NEW: Nanite cubes · Strider mechs · Data storms',4:'NEW: Riggers · Riot units · Elite enemies',5:'NEW: Hackers'}[g.stage]||''}}
function makeWaves(s){const nW=Math.min(8,4+Math.ceil(s/2)),B=6+s*5+Math.pow(Math.max(0,s-3),1.6)*3,roster=Object.keys(ET).filter(k=>ET[k].from<=s),fresh=roster.filter(k=>ET[k].from==s),out=[];
 for(let i=0;i<nW;i++){let bud=B*(.7+.5*i/Math.max(1,nW-1))*(i==0?(s==1?.55:.8):1);const list=[];
  if(fresh.length&&i<2){const k=fresh[i%fresh.length];const n=ET[k].flock?5:1;for(let j=0;j<n;j++)list.push(k);bud-=ET[k].cost*n}
  let guard=0;while(bud>0&&guard++<80){const w=roster.map(k=>[k,1/ET[k].cost+(k=='drone'?.6:0)]),tot=w.reduce((a,b)=>a+b[1],0);let x=Math.random()*tot,k=w[0][0];for(const[kk,ww]of w){x-=ww;if(x<=0){k=kk;break}}
   if(ET[k].flock){for(let j=0;j<5;j++)list.push(k);bud-=5*ET[k].cost}else{list.push(k);bud-=ET[k].cost}}
  out.push({list,gate:i>0&&i%2==1})}
 return out}
function queueWave(w){const g=G,fm=pick(['line','v','column','sides','scatter']),n=w.list.length;let fx=rnd(60,W-60);
 w.list.forEach((k,i)=>{let x,d;
  if(ET[k].flock){x=fx+rnd(-30,30);d=i*.12}
  else if(fm=='line'){x=40+(W-80)*((i%6)+.5)/Math.min(6,n);d=Math.floor(i/6)*1.1}
  else if(fm=='v'){const c=(i%7)-3;x=W/2+c*34;d=Math.abs(c)*.22+Math.floor(i/7)*1.4}
  else if(fm=='column'){x=i%2?W*.3:W*.7;d=i*.45}
  else if(fm=='sides'){x=i%2?50:W-50;d=Math.floor(i/2)*.55}
  else{x=rnd(36,W-36);d=i*.32}
  g.q.push({k,x:cl(x,30,W-30),d})});
 if(w.gate){const risk=g.stage>=2&&Math.random()<.4,gd=Math.random()<.5;g.Gt.push({y:-110,L:mkG(gd||Math.random()<.35,risk&&!gd),R:mkG(!gd||Math.random()<.35,risk&&gd)})}}
function addE(k,x,y,extra){const d=ET[k],g=G,m=hpMul(g.stage),e={k,d,a:RG[d.rig],x,y,vx:0,vy:0,r:d.r,hp:d.hp*m,mh:d.hp*m,v:d.v*(1+.05*(g.stage-1)),val:d.val,s:d.s,ph:rnd(0,8),dist:rnd(0,40),fl:-1,burn:0,kb:0,sq:0,t:0,state:'walk',st:0,shots:0,bx:x,stopY:rnd(H*.16,H*.3),sum:0,el:null};
 if(d.shield)e.shp=e.mh*.6;
 const ec=cl((g.stage-3)*.08,0,.5);if(!extra&&Math.random()<ec&&k!='naniteS'){e.el=pick(['over','armor','vol']);if(e.el=='over')e.v*=1.6;if(e.el=='armor'){e.hp*=2.2;e.mh*=2.2}e.val*=2}
 if(!seen[k]&&CODEX[k])seen[k]=1;
 Object.assign(e,extra||{});g.E.push(e);return e}
function txt(x,y,s,c,sz=22,l=1.1){G.T.push({x,y,s,c,sz,l,L:l})}
function part(x,y,c,n,sp=180,kind='c'){for(let i=0;i<n;i++){const a=rnd(0,TAU),v=rnd(.3,1)*sp;G.P.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(kind=='c'?60:0),l:rnd(.35,.8),L:.8,c,k:kind,r:rnd(0,TAU),s:rnd(2,4.5)})}}
function ring(x,y,c,r=40){G.P.push({x,y,vx:0,vy:0,l:.45,L:.45,c,k:'r',s:r})}
function mkG(good,risk){const s=pick(['shots','rate','dmg','rate','dmg']);let v=s=='shots'?1:1+(Math.random()<.4?1:0);if(risk)return{s,v:s=='shots'?2:3,h:0,pulse:0,risk:1};return{s,v:good?v:-v,h:0,pulse:0}}
function gDelta(o){const L=G.lv;if(o.s=='shots'){const n=cl(L.shots+o.v,1,BAL.shotsMax)-L.shots;return{t:(n>=0?'+':'')+n,n}}
 const f=o.s=='rate'?rateMul:dmgMul,cur=f(L[o.s]),nx=f(L[o.s]+o.v),p=Math.round((nx/cur-1)*100);return{t:(p>=0?'+':'')+p+'%',n:p}}
function apply(o){const g=G,dl=gDelta(o);
 if(o.s=='shots')g.lv.shots=cl(g.lv.shots+o.v,1,BAL.shotsMax);else g.lv[o.s]=cl(g.lv[o.s]+o.v,-6,20);
 const good=o.v>0;txt(g.px,g.py-50,dl.t+' '+GS_[o.s].lab,good?'#7dffb0':'#ff6b7b',24,1.3);ring(g.px,g.py,good?'#3ff0ff':'#ff3a4a',70);part(g.px,g.py,good?'#3ff0ff':'#ff3a5a',22,240,'g');sfx(good?'good':'bad');if(!good)buzz(40);
 if(o.risk)debuff(pick(Object.keys(DB)))}
function debuff(k){const g=G,t=DB[k].t*(g.sk.firewall?.5:1)*(1-.2*ml('anti'));g.db[k]=Math.max(g.db[k]||0,t);g.gl=.5;sfx('virus');buzz(60);txt(g.px,g.py-70,'⚠ '+DB[k].n,'#ff3a5a',22,1.4);if(k=='emp')g.sh=0;part(g.px,g.py,'#ff1a3a',20,200,'g')}
function buff(k){const g=G;g.bf[k]=BF[k].t;sfx('pick');txt(g.px,g.py-70,BF[k].n+'!',BF[k].c,22,1.3);ring(g.px,g.py,BF[k].c,80)}
function hurt(n){const g=G;if(g.inv>0||g.dead||g.phase=='intro'||g.phase=='bdeath')return;if(window.__sim){window.HC=window.HC||{};HC[window.HS]=(HC[window.HS]||0)+1}g.shk=.4;g.hf=1;g.hs=.06;g.gl=Math.max(g.gl,.25);buzz(80);sfx('hurt');
 if(g.sh>0&&!g.db.emp){g.sh=0;g.inv=1;txt(g.px,g.py-50,'BLOCKED','#9fe8ff');ring(g.px,g.py,'#3ac8ff',60);return}
 g.hp-=n;g.inv=1.5;part(g.px,g.py,'#ff2a4a',18,220);
 if(g.hp<=0){if(g.rev>0){g.rev--;g.hp=g.mh;g.inv=3;g.gl=1;txt(g.px,g.py-70,'REBOOTING...','#3aff9a',26,1.6);ring(g.px,g.py,'#3aff9a',140);part(g.px,g.py,'#3aff9a',40,300,'g');sfx('glitch');for(const b of g.EB)b.dead=1}
  else{g.dead=1.6;g.slow=.2;part(g.px,g.py,g.r.pc,60,340,'g');part(g.px,g.py,g.r.armor,26,260);ring(g.px,g.py,'#fff',160);g.flash=.8;sfx('big');buzz(220)}}}
function over(){const g=G;st='over';g.sc=Math.floor(g.sc);for(const c of g.C)g.co+=c.v;g.C=[];g.co=Math.round(g.co);coins+=g.co;const nb=g.sc>best;best=Math.max(best,g.sc);bestSt=Math.max(bestSt,g.stage);LS.set('coins',coins);LS.set('best',best);LS.set('bestSt',bestSt);LS.set('seen',seen);
 if(window.__sim)return;music('menu');
 $('nb').style.display=nb?'block':'none';$('ost').textContent=g.stage;$('okl').textContent=g.kills;show('o');
 const t0=performance.now(),A=g.sc,Bc=g.co;(function cnt(){const k=Math.min(1,(performance.now()-t0)/900),e=1-Math.pow(1-k,3);$('osc').textContent=Math.round(A*e);$('oc').textContent='+'+Math.round(Bc*e);if(k<1&&st=='over')requestAnimationFrame(cnt)})()}
const pwr=()=>{const g=G;return g.r.dmg*dmgMul(g.lv.dmg)*(1+.2*(g.sk.power||0))};
function kill(e,silent,chain){const g=G;if(e.dead)return;g.kills++;e.dead=1;g.sc+=e.val*10;
 if(!silent){part(e.x,e.y,e.a.neon||e.a.eye||e.a.c||'#ff2a8a',12,200,'g');part(e.x,e.y,'#2a2a34',8,200);ring(e.x,e.y,e.a.neon||e.a.eye||'#fff',e.r*2);sfx('kill',40)}
 if(!e.a.kind)g.K.push({a:e.a,x:e.x,y:e.y,s:e.s,f:(e.dist*.11|0),t:0,rot:rnd(-.6,.6)});
 const cv=e.val*.3,n=Math.max(1,Math.min(4,Math.round(cv))),each=cv*g.coinMul/n;for(let i=0;i<n;i++){const a=rnd(0,TAU),v=rnd(60,150);g.C.push({x:e.x,y:e.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,v:each})}
 if(e.d.split)for(const s of[-1,1])addE('naniteS',e.x+s*12,e.y,{vx:s*90});
 if(e.d.bomb)explode(e.x,e.y,62,6*hpMul(g.stage),1);
 if(e.el=='vol'){for(let i=0;i<8;i++){const a=i/8*TAU;g.EB.push({x:e.x,y:e.y,vx:Math.cos(a)*150,vy:Math.sin(a)*150,k:'eb2'})}ring(e.x,e.y,'#ff8a2a',50)}
 if(g.sk.boom&&!chain)explode(e.x,e.y,38+12*g.sk.boom,pwr()*1.6*g.sk.boom,1);
 const dr=Math.random(),dm=g.dropMul;
 if(e.el&&dr<.35*dm)g.D.push({x:e.x,y:e.y,k:pick(['over','chrono','magnet','shield','heal']),t:0});
 else if(dr<.045*dm)g.D.push({x:e.x,y:e.y,k:Math.random()<.5?'heal':'shield',t:0});
 else if(dr<.05*dm&&g.stage>=3)g.D.push({x:e.x,y:e.y,k:'nuke',t:0})}
function explode(x,y,r,dmg,chain){const g=G;sfx('boom',80);g.shk=Math.max(g.shk,.25);part(x,y,'#ff8a2a',26,260,'g');part(x,y,'#3a2a20',12,200);ring(x,y,'#ffb04a',r*1.2);
 for(const o of g.E)if(!o.dead&&!o.b&&Math.hypot(o.x-x,o.y-y)<r+o.r){o.hp-=dmg;o.fl=.08;if(o.hp<=0)kill(o,0,chain)}}
function shoot(e,a,sp,k='eb'){sp*=1+Math.min(.5,(G.stage-1)*.045);G.EB.push({x:e.x+Math.cos(a)*10,y:e.y+Math.sin(a)*10,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,k})}
function eshot(x,y,a,sp,k='eb',extra){sp*=1+Math.min(.4,(G.stage-1)*.035);const b={x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,k};if(extra)Object.assign(b,extra);G.EB.push(b);return b}
function later(s,fn,b){(G.LT=G.LT||[]).push({t:s,fn,b})}

/* ================= skills ================= */
function rollSkills(){const g=G,pool=SK.filter(k=>(g.sk[k.k]||0)<k.max),w=k=>({common:5,rare:3.2,epic:2,legendary:1}[k.rar]),out=[];
 while(out.length<3&&pool.length){let x=Math.random()*pool.reduce((a,k)=>a+w(k),0),i=0;for(;i<pool.length-1;i++){x-=w(pool[i]);if(x<=0)break}out.push(pool.splice(i,1)[0])}return out}
let pickRR=0;
function openPick(t,sub){pickRR=1+ml('reroll');const opts=rollSkills();if(!opts.length)return;
 if(window.__sim){takeSkill(pick(opts));return}
 st='pick';$('skT').textContent=t;$('skS').textContent=sub;renderPick(opts);show('sk');musVol(.3)}
function renderPick(opts){const L=$('skL');L.innerHTML='';const g=G;
 for(const k of opts){const b=document.createElement('button'),lv=g.sk[k.k]||0;b.className='skc';b.style.setProperty('--rc',RAR[k.rar]);
  b.innerHTML=`<div class="ic">${k.ic}</div><div><b>${k.n}${lv?' <small style="color:#ffd84a">MK'+(lv+1)+'</small>':''}</b><span>${k.d}</span></div><em>${k.rar.toUpperCase()}</em>`;
  b.onclick=()=>{takeSkill(k);st='play';show(null);musVol(.55)};L.append(b)}
 $('skR').textContent='REROLL ('+pickRR+')';$('skR').classList.toggle('dis',pickRR<=0)}
function takeSkill(k){const g=G;g.sk[k.k]=(g.sk[k.k]||0)+1;sfx('buy');if(k.k=='heart'){g.mh++;g.hp=g.mh}if(k.k=='ward')g.sh=1;
 if(!window.__sim){txt(g.px,g.py-70,k.n.toUpperCase(),RAR[k.rar],22,1.4);ring(g.px,g.py,RAR[k.rar],90);part(g.px,g.py,RAR[k.rar],30,260,'g')}}

/* ================= boss system ================= */
function arenaOf(k){const cx=W/2;
 if(k=='ring')return{k,cx,cy:H*.5,R:Math.min(W*.47,H*.3),R0:Math.min(W*.47,H*.3),kk:0};
 if(k=='grid')return{k,x0:10,x1:W-10,y0:H*.3,y1:H-56,cols:6,rows:7,kk:0};
 return{k,x0:14,x1:W-14,y0:H*.36,y1:H-60,X0:14,X1:W-14,kk:0}}
function clampArena(g){const A=g.ar;if(!A||g.phase!='boss')return;
 if(A.k=='ring'){const dx=g.tx-A.cx,dy=g.ty-A.cy,d=Math.hypot(dx,dy),m=A.R-14;if(d>m){g.tx=A.cx+dx/d*m;g.ty=A.cy+dy/d*m}}
 else{g.tx=cl(g.tx,A.x0+12,A.x1-12);g.ty=cl(g.ty,A.y0+10,A.y1-10)}}
function spawnBoss(){const g=G,bi=(g.stage-1)%4,bd=BOSSES[bi],hp=BAL.bossHP*Math.pow(BAL.bossGrow,g.stage-1);
 const b={b:1,bd,k:bd.k,d:{},a:{},x:W/2,y:-160,hp,mh:hp,r:58,ph:1,t:0,cd:1.6,inv:0,fl:-1,val:30+g.stage*15,burn:0,kb:0,sq:0,dist:0,s:1,tgtY:H*.25,heads:[],copies:[],eye:Math.PI/2,n:0};
 if(b.k=='shogun'){b.tgtY=H*.36;b.r=30;b.a=RG.shogun;b.s=1.9}
 if(b.k=='hydra'){b.tgtY=H*.17;b.r=40}
 if(b.k=='queen'){b.tgtY=H*.28;b.r=32}
 g.boss=b;g.E.push(b);seen['b'+bi]=1;return b}
function bossHit(b,x,y){if(b.k=='hydra'){for(const h of b.heads)if(Math.hypot(h.x-x,h.y-y)<30)return 1;return Math.hypot(b.x-x,b.y-y)<54?1:0}
 if(b.k=='queen'){if(b.tp>0)return 0;if(Math.hypot(b.x-x,b.y-y)<b.r+6)return 1;for(const c of b.copies)if(Math.hypot(c.x-x,c.y-y)<b.r+6){c.fl=.08;return 2}return 0}
 if(b.k=='shogun')return Math.hypot(b.x-x,b.y-24-y)<b.r+8?1:0;
 return Math.hypot(b.x-x,b.y-y)<b.r+6?1:0}
function beam(o){const b=Object.assign({t:0,warn:.8,dur:1,w:16,len:1200,sweep:0,c:'#ff2a4a'},o);G.BM.push(b);return b}
function bossAI(b,dt){const g=G,A=g.ar,ph=b.ph;b.t+=dt;b.inv-=dt;
 if(g.phase=='intro'){b.y=lerp(b.y,b.tgtY,Math.min(1,dt*1.5));b.dist+=dt*30;if(b.k=='hydra')hydraHeads(b);return}
 if(g.phase!='boss')return;
 if(b.inv>0){if(b.k=='hydra')hydraHeads(b);return}
 const thr=ph==1?.66:.33;if(ph<3&&b.hp<b.mh*thr){phaseShift(b);return}
 const fast=1+(ph-1)*.28+Math.min(.45,(g.stage-1)*.035);if(!g.BM.length)b.cd-=dt*fast;else b.cd=Math.max(b.cd,.35);
 ({overseer:aiOverseer,shogun:aiShogun,hydra:aiHydra,queen:aiQueen})[b.k](b,dt,ph,A)}
function phaseShift(b){const g=G;b.ph++;b.inv=1.8;b.cd=1.2;b.dash=null;b.storm=0;b.q=0;for(const e of g.EB)e.dead=1;g.BM=[];g.WV=[];g.TL=[];g.CL=[];g.LT=[];
 g.shk=.9;g.flash=.45;g.gl=.8;g.zoom=1.12;g.zx=b.x;g.zy=b.y;sfx('phase');buzz(150);ring(b.x,b.y,'#fff',220);ring(b.x,b.y,b.bd.c,300);part(b.x,b.y,b.bd.c,50,380,'g');
 g.card={t:1.6,a:'PHASE '+['','I','II','III'][b.ph],b:b.ph==3?'// FINAL PROTOCOL':'// OVERCLOCKED',c:b.bd.c,small:1};
 if(b.k=='shogun'&&b.ph==3)g.ar.Rt=g.ar.R0*(g.stage>4?.74:.84);if(g.hp<g.mh)g.D.push({x:g.ar.k=='ring'?g.ar.cx:W/2,y:g.ar.k=='ring'?g.ar.cy:H*.55,k:'heal',t:0,vx:0,vy:0});
 if(b.k=='queen'){b.copies=b.ph>=2?[{x:W*.22,y:b.y,fl:0},{x:W*.78,y:b.y,fl:0}]:[];if(b.ph==3)g.ar.shrink=1}}
/* --- OVERSEER-0 : lockdown arena, sweeping eye lasers --- */
function aiOverseer(b,dt,ph,A){const g=G;b.x=W/2+Math.sin(b.t*.5)*(W/2-80)*(ph==3?.45:1);b.y=b.tgtY+Math.sin(b.t*1.3)*8;b.eye=Math.atan2(g.py-b.y,g.px-b.x);b.dist+=dt*30;
 if(b.q>0){b.qt=(b.qt||0)-dt;if(b.qt<=0){b.qt=.06;b.q--;b.qa+=.33;for(let i=0;i<2;i++)eshot(b.x,b.y,b.qa+i*Math.PI,150,'eb3')}}
 if(b.cd>0)return;const acts=ph==1?['sweep','burst','drones','sweep','burst']:ph==2?['cross','burst','sweep','drones','spiral']:(G.stage>4?['twin','cross','spiral','burst','sweep']:['cross','spiral','burst','sweep','burst']);const act=acts[b.n++%acts.length];
 if(act=='sweep'){const side=g.px<b.x?-1:1,a0=Math.atan2(A.y1-b.y,(side<0?A.x0:A.x1)-b.x),a1=Math.PI/2-side*.14;beam({x:b.x,y:b.y,a:a0,a1,att:b,warn:.9,dur:1.7,w:18,sweep:.75*(ph>1?1.25:1)});sfx('charge');b.cd=2.6}
 if(act=='burst'){for(let k=0;k<(ph==1?2:3);k++)later(k*.38,()=>{const n=14+ph*2;for(let i=0;i<n;i++)eshot(b.x,b.y,i/n*TAU+k*.2,150,'eb')},b);b.cd=2}
 if(act=='drones'){for(let i=0;i<3+ph;i++)addE('drone',cl(b.x+(i-1.5)*50,30,W-30),b.y+30,{home:1});sfx('zap');b.cd=2.2}
 if(act=='cross'){const a0=rnd(0,TAU);for(let i=0;i<4;i++)beam({x:b.x,y:b.y,a:a0+i*Math.PI/2,att:b,warn:1.2,dur:2,w:13,sweep:.36*(ph==3?1.2:1)});sfx('charge');b.cd=3.6}
 if(act=='spiral'){b.q=40;b.qa=0;b.cd=3}
 if(act=='twin'){const oy=A.y0-30,gap=34;beam({x:6,y:oy,a:.04,a1:Math.atan2(A.y1-oy,W/2-gap-6),warn:1,dur:2.2,w:15,sweep:.7});beam({x:W-6,y:oy,a:Math.PI-.04,a1:Math.atan2(A.y1-oy,W/2+gap-(W-6)),warn:1,dur:2.2,w:15,sweep:.7});sfx('charge');b.cd=3.4}}
/* --- NEON SHOGUN : circular duel ring, dashes, crescents, clones --- */
function aiShogun(b,dt,ph,A){const g=G;
 if(b.dash){const d=b.dash;d.t+=dt;if(d.t<d.warn){b.dist+=dt*10;return}const sp=1100*dt,dx=d.x1-b.x,dy=d.y1-b.y,dd=Math.hypot(dx,dy);
  if(dd<=sp){b.x=d.x1;b.y=d.y1;b.dash=null;if(b.chain>0){b.chain--;startDash(b,A)}else{crescent(b,Math.atan2(g.py-(b.y-24),g.px-b.x),ph);b.cd=Math.max(b.cd,.9)}}
  else{b.x+=dx/dd*sp;b.y+=dy/dd*sp;g.P.push({x:b.x,y:b.y-24,vx:0,vy:0,l:.3,L:.3,c:'#ff2a4a',k:'g',s:7})}
  if(Math.hypot(b.x-g.px,b.y-24-g.py)<26){window.HS='dash';hurt(1)}return}
 const tx=A.cx+Math.cos(b.t*.7)*A.R*.4,ty=A.cy-A.R*.3+Math.sin(b.t*.9)*20+24;b.x=lerp(b.x,tx,dt*1.2);b.y=lerp(b.y,ty,dt*1.2);b.dist+=dt*40;
 if(b.storm>0){b.storm-=dt;b.sa=(b.sa||0)+dt*2.2;b.sft=(b.sft||0)-dt;if(b.sft<=0){b.sft=.1;for(let i=0;i<4;i++)eshot(b.x,b.y-24,b.sa+i*Math.PI/2,165,'eb3')}return}
 if(b.cd>0)return;const acts=ph==1?['dash','crescent','shuriken','dash','crescent']:ph==2?['dash3','crescent','clones','shuriken','dash']:(G.stage>4?['storm','dashc','crescent','dash3','clones']:['storm','crescent','dash3','clones','shuriken']);const act=acts[b.n++%acts.length];
 if(act=='dash'||act=='dash3'||act=='dashc'){b.chain=act=='dash'?0:act=='dash3'?1:2;startDash(b,A);if(act=='dashc')clones(b,A,2);b.cd=1.2}
 if(act=='crescent'){const a0=Math.atan2(g.py-(b.y-24),g.px-b.x);for(let k=0;k<ph+1;k++)later(k*.38,()=>crescent(b,a0+(k%2?.42:-.42)*(k?1:0),ph),b);b.cd=2.1}
 if(act=='shuriken'){const n=8+ph*2;for(let i=0;i<n;i++)eshot(b.x,b.y-24,i/n*TAU,140,'eb3',{curve:ph==1?1.1:1.6});b.cd=1.8}
 if(act=='clones'){clones(b,A,2);b.cd=2.4}
 if(act=='storm'){b.storm=2.6;b.cd=3.4;sfx('charge')}}
function lineInRing(A,x,y,a){let x1=x,y1=y;for(let d=0;d<900;d+=6){const xx=x+Math.cos(a)*d,yy=y+Math.sin(a)*d;if(Math.hypot(xx-A.cx,yy-A.cy)>A.R-22)break;x1=xx;y1=yy}return[x1,y1]}
function startDash(b,A){const g=G,a=Math.atan2(g.py-(b.y-24),g.px-b.x),[x1,y1]=lineInRing(A,b.x,b.y,a);b.dash={x0:b.x,y0:b.y,x1,y1,t:0,warn:b.ph==1?.75:.64};sfx('dash')}
function clones(b,A,n){const g=G;for(let i=0;i<n;i++){const a=rnd(0,TAU),sx=A.cx+Math.cos(a)*(A.R-26),sy=A.cy+Math.sin(a)*(A.R-26),ta=Math.atan2(g.py-sy,g.px-sx)+rnd(-.3,.3),[ex,ey]=lineInRing(A,sx,sy,ta);
  g.CL.push({x:sx,y:sy,x0:sx,y0:sy,x1:ex,y1:ey,t:-i*.15,warn:.78,a:b.a})}sfx('dash')}
function crescent(b,a,ph){G.WV.push({x:b.x,y:b.y-24,r:20,v:195+ph*20,a,arc:ph==1?.7:.85,w:8,t:0,c:'#ff2a4a'});sfx('dash',60)}
/* --- HYDRA PROTOCOL : exploding grid floor + three heads --- */
const HK=1.4;function hydraHeads(b){b.heads=[-1,0,1].map(i=>({x:b.x+(i*80+Math.sin(b.t*1.6+i*2)*10)*HK*.82,y:b.y+(46+(i==0?20:0)+Math.cos(b.t*1.3+i)*8)*HK,i}))}
function aiHydra(b,dt,ph,A){const g=G;b.x=W/2+Math.sin(b.t*.4)*30;b.y=b.tgtY;b.dist+=dt*20;hydraHeads(b);
 if(b.chase>0){b.ct=(b.ct||0)-dt;if(b.ct<=0){b.ct=ph==3?.28:.36;b.chase--;tileAt(g.px,g.py,.6)}}
 if(b.cd>0)return;const acts=ph==1?['scatter','heads','rows','heads','scatter']:ph==2?['chase','heads','rows','missiles','scatter']:['checker','chase','beams','missiles','rows'];const act=acts[b.n++%acts.length];
 if(act=='scatter'){for(let i=0;i<A.cols;i++)for(let j=0;j<A.rows;j++)if(Math.random()<(ph==1?.3:.4))tile(i,j,1.05);b.cd=2.1}
 if(act=='rows'){const gap=Math.random()*A.cols|0;for(let j=0;j<A.rows;j++)for(let i=0;i<A.cols;i++)if(i!=gap)tile(i,j,.9+j*.3);b.cd=3.6}
 if(act=='checker'){const p=Math.random()<.5?0:1;for(let i=0;i<A.cols;i++)for(let j=0;j<A.rows;j++)if((i+j)%2==p)tile(i,j,1);later(1.5,()=>{for(let i=0;i<A.cols;i++)for(let j=0;j<A.rows;j++)if((i+j)%2!=p)tile(i,j,1)},b);b.cd=3.4}
 if(act=='heads'){for(const h of b.heads){const a=Math.atan2(g.py-h.y,g.px-h.x);for(let k=-2;k<=2;k++)eshot(h.x,h.y,a+k*.17,185,'eb2')}b.cd=1.6}
 if(act=='chase'){b.chase=8+ph*2;b.ct=0;b.cd=3.4}
 if(act=='missiles'){for(const h of b.heads)eshot(h.x,h.y,Math.PI/2+rnd(-.6,.6),120,'eb',{home:1.6});b.cd=1.8}
 if(act=='beams'){for(const h of b.heads){const a=Math.PI/2+h.i*.32;beam({x:h.x,y:h.y,a,a1:a-h.i*.16,warn:1,dur:1.8,w:14,sweep:.2,c:'#7aff3a'})}sfx('charge');b.cd=3}}
function tile(i,j,warn){const A=G.ar,w=(A.x1-A.x0)/A.cols,h=(A.y1-A.y0)/A.rows;G.TL.push({x:A.x0+i*w,y:A.y0+j*h,w,h,t:0,warn,dur:.45})}
function tileAt(x,y,warn){const A=G.ar,w=(A.x1-A.x0)/A.cols,h=(A.y1-A.y0)/A.rows,i=cl((x-A.x0)/w|0,0,A.cols-1),j=cl((y-A.y0)/h|0,0,A.rows-1);tile(i,j,warn)}
/* --- GLITCH QUEEN : fake copies, mirrored fans, viruses, closing walls --- */
function aiQueen(b,dt,ph,A){const g=G;b.dist+=dt*30;
 if(b.tp>0){b.tp-=dt;if(b.tp<=0){const P=()=>({x:rnd(60,W-60),y:rnd(H*.22,H*.32)}),p0=P();b.x=p0.x;b.y=p0.y;b.copies.forEach(c=>Object.assign(c,P()));sfx('glitch');g.gl=Math.max(g.gl,.3)}return}
 b.x=cl(b.x+Math.sin(b.t*1.1)*30*dt,40,W-40);for(const c of b.copies){c.x=cl(c.x+Math.cos(b.t*1.3)*26*dt,40,W-40);c.fl-=dt}
 if(A.shrink){const k=(Math.sin(b.t*.6)*.5+.5)*.3;A.x0=A.X0+W*k*.5;A.x1=A.X1-W*k*.5}
 if(b.cd>0)return;const acts=ph==1?['mirror','tp','virus','mirror','rain']:ph==2?['mirror','invert','tp','virus','rain']:['tear','mirror','tp','invert','rain','virus'];const act=acts[b.n++%acts.length];
 const srcs=[b,...b.copies];
 if(act=='mirror'){for(const s of srcs){const a=Math.atan2(g.py-s.y,g.px-s.x);for(let k=-2;k<=2;k++)eshot(s.x,s.y,a+k*.16,165,'eb3')}for(let k=0;k<5;k++){eshot(4,A.y0-40+k*34,rnd(-.1,.1),150,'eb3');eshot(W-4,A.y0-23+k*34,Math.PI+rnd(-.1,.1),150,'eb3')}b.cd=2.1}
 if(act=='tp'){b.tp=.5;b.cd=1.2}
 if(act=='virus'){for(let k=-1;k<=1;k++){const a=Math.atan2(g.py-b.y,g.px-b.x)+k*.32;g.D.push({x:b.x,y:b.y,k:'virus',t:0,vx:Math.cos(a)*120,vy:Math.sin(a)*120})}sfx('virus');b.cd=1.8}
 if(act=='invert'){g.card={t:1.2,a:'⚠ INPUT CORRUPTION',b:'controls invert in 1s',c:'#c03aff',small:1};later(1,()=>debuff('glitch'),b);b.cd=2.2}
 if(act=='rain'){for(let i=0;i<14;i++)later(i*.09,()=>eshot(rnd(A.x0,A.x1),-10,Math.PI/2,190,'eb3'),b);b.cd=2}
 if(act=='tear'){for(let k=0;k<3;k++){const y=rnd(A.y0,A.y1-20);g.WV.push({line:1,y,t:0,warn:.85,dur:.6,c:'#c03aff'})}sfx('glitch');b.cd=2.2}}

/* ================= update ================= */
function upd(rdt){const g=G;
 if(g.hs>0){g.hs-=rdt;return}
 g.slow=Math.min(1,g.slow+rdt*(g.phase=='bdeath'?.25:1.3));const chrono=g.bf.chrono>0?.45:1,dt=rdt*g.slow,edt=dt*chrono;
 g.t+=dt;g.inv-=dt;g.shk-=rdt;g.hf=Math.max(0,g.hf-rdt*2.5);g.mf-=dt;g.cpop=Math.max(0,g.cpop-rdt*4);g.dif=Math.max(0,g.dif-rdt*.7);g.flash=Math.max(0,g.flash-rdt*2);g.gl=Math.max(0,g.gl-rdt*1.5);g.alarm=Math.max(0,g.alarm-rdt);
 for(const k in g.db){g.db[k]-=dt;if(g.db[k]<=0)delete g.db[k]}for(const k in g.bf){g.bf[k]-=dt;if(g.bf[k]<=0)delete g.bf[k]}
 if(g.banner){g.banner.t-=rdt;if(g.banner.t<=0)g.banner=null}if(g.card){g.card.t-=rdt;if(g.card.t<=0)g.card=null}
 if(g.LT){for(const l of g.LT){l.t-=edt;if(l.t<=0&&!l.done){l.done=1;if(G.boss===l.b&&G.phase=='boss')l.fn()}}g.LT=g.LT.filter(l=>!l.done)}
 const arena=g.phase=='intro'||g.phase=='boss'||g.phase=='bdeath'||g.phase=='approach';g.scroll=lerp(g.scroll,arena?0:110,Math.min(1,dt*(arena?1.2:.8)));
 g.dist+=g.scroll*dt;g.rdist+=g.scroll*1.22*dt;
 g.lb=lerp(g.lb,g.phase=='intro'||g.phase=='bdeath'?1:0,Math.min(1,rdt*4));g.zoom=lerp(g.zoom,g.phase=='intro'?1.1:1,Math.min(1,rdt*2.5));
 if(g.ar){g.ar.kk=cl(g.ar.kk+rdt*(g.phase=='clear'?-1.2:.7),0,1);if(g.ar.Rt)g.ar.R=lerp(g.ar.R,g.ar.Rt,rdt*.8);if(g.phase=='clear'&&g.ar.kk<=0)g.ar=null}
 // player movement
 if(!g.ar)g.ty=lerp(g.ty,H-130,Math.min(1,dt*3));
 if(g.phase=='intro'&&g.ar){g.tx=lerp(g.tx,g.ar.k=='ring'?g.ar.cx:W/2,dt*2);g.ty=lerp(g.ty,g.ar.k=='ring'?g.ar.cy+g.ar.R*.6:g.ar.y1-50,dt*2)}
 if(g.phase=='clear')g.ty=lerp(g.ty,H-130,dt*3);
 clampArena(g);const follow=g.db.drag?4:22,ox=g.px,oy=g.py;g.px+=(g.tx-g.px)*Math.min(1,dt*follow);g.py+=(g.ty-g.py)*Math.min(1,dt*follow);
 const mv=Math.hypot(g.px-ox,g.py-oy)/Math.max(dt,1e-3);if(mv>260&&!window.__sim)g.trail.push({x:g.px,y:g.py,t:.22});for(const t of g.trail)t.t-=rdt;g.trail=g.trail.filter(t=>t.t>0);
 const r=g.r,py=g.py,K=g.sk,emp=!!g.db.emp;
 if(g.dead){g.dead-=rdt;if(g.dead<=0){over();return}}
 else if(g.phase!='intro'&&g.phase!='bdeath'&&g.phase!='approach'){g.sc+=dt*3;
  const jam=g.db.jam&&(g.t%1.2)<.6;g.cd-=dt;
  if(g.cd<=0&&!jam){const L=g.lv,rm=r.rate*rateMul(L.rate)*(1+.15*(K.haste||0))*(g.db.lag?.55:1)*(g.bf.over?1.8:1);g.cd=1/rm;const n=cl(L.shots+(K.multi||0),1,8),d=pwr()*shotF(n);g.mf=.06;sfx('shoot',80);
   let aim=-Math.PI/2;if(g.boss&&g.phase=='boss'&&g.ar){const tg=aimTarget(g.boss);aim=Math.atan2(tg.y-(py-40),tg.x-g.px)}
   const px2=Math.cos(aim+Math.PI/2),py2=Math.sin(aim+Math.PI/2);
   for(let i=0;i<n;i++){const o=i-(n-1)/2,a=aim+o*.06;g.B.push({x:g.px+px2*o*9,y:py-40+py2*o*9,vx:Math.cos(a)*640,vy:Math.sin(a)*640,d,p:(r.pierce||0)+(g.bf.over?1:0),hit:[],rot:0,home:r.home,rc:K.rico||0})}
   if(K.side&&!emp)for(const s of[-1,1]){const a=aim+s*.5;g.B.push({x:g.px,y:py-36,vx:Math.cos(a)*580,vy:Math.sin(a)*580,d:d*(K.side>1?1:.6)*Math.max(1,n*shotF(n)*.5),p:0,hit:[],rot:0,rc:0})}}
  if(K.ward&&g.sh==0&&!emp){g.skT+=dt;if(g.skT>25){g.skT=0;g.sh=1;ring(g.px,py,'#3ac8ff',60);sfx('pick')}}
  if(K.blades&&!emp){g.ang+=dt*4.2;const nb=K.blades+1,bd=pwr()*1.3;for(let i=0;i<nb;i++){const a=g.ang+i*TAU/nb,bx=g.px+Math.cos(a)*52,by=py-18+Math.sin(a)*40;
    for(const e of g.E){if(e.dead||(e.bcd||0)>g.t)continue;const hit=e.b?(g.phase=='boss'&&e.inv<=0&&bossHit(e,bx,by)==1):Math.hypot(e.x-bx,e.y-by)<e.r+12;if(!hit)continue;
     e.hp-=bd;e.bcd=g.t+.35;e.fl=.05;e.sq=1;g.P.push({x:bx,y:by,vx:rnd(-80,80),vy:rnd(-80,80),l:.2,L:.2,c:'#c8a0ff',k:'g',s:3});if(e.hp<=0&&!e.b)kill(e)}}}}
 director(dt,rdt);
 for(const b of g.B){if(b.home){let tg=null,bd=1e9;for(const e of g.E){if(e.dead||(!e.b&&e.y>b.y))continue;const t2=e.b?aimTarget(e):e,d=Math.abs(t2.x-b.x)+Math.abs(b.y-t2.y)*.4;if(d<bd){bd=d;tg=t2}}if(tg){const want=cl((tg.x-b.x)*3,-260,260);b.vx+=(want-b.vx)*Math.min(1,dt*4)}}
  b.x+=b.vx*dt;b.y+=b.vy*dt;b.rot+=dt*18}
 for(const t of g.Gt){t.y+=g.scroll*dt;for(const o of[t.L,t.R])o.pulse=Math.max(0,o.pulse-dt*5);
  for(const b of g.B){if(b.dead||b.y<t.y||b.y>t.y+56)continue;const o=b.x<W/2?t.L:t.R;b.dead=1;o.pulse=1;
   if(!o.risk&&++o.h>=GS_[o.s].k&&o.v<(o.s=='shots'?1:3)){o.h=0;o.v++;if(o.v==0)o.v=1;txt(b.x<W/2?W/4:W*.75,t.y-6,'UP','#bfe8ff',16,.6)}}
  if(!t.used&&t.y+56>=py-14&&!g.dead){t.used=1;apply(g.px<W/2?t.L:t.R)}}
 g.Gt=g.Gt.filter(t=>!t.used&&t.y<H);
 for(const e of g.E){if(e.dead)continue;e.t+=edt;e.fl-=dt;e.sq=Math.max(0,e.sq-dt*6);
  if(e.b)bossAI(e,edt);else enemyAI(e,edt);
  if(e.burn>0){e.burn-=dt;if(!e.b||(e.inv<=0&&g.phase=='boss'))e.hp-=dt*(r.burn||0)*dmgMul(g.lv.dmg)*(e.b?.9:1);if(Math.random()<.4)g.P.push({x:e.x+rnd(-8,8),y:e.y+rnd(-10,6),vx:rnd(-10,10),vy:-50,l:.35,L:.35,c:'#ff2ad8',k:'g',s:4})}
  for(const b of g.B){if(b.dead||b.hit.includes(e))continue;let hit=0;
   if(e.b){if(g.phase!='boss')continue;hit=bossHit(e,b.x,b.y);if(hit==2){b.dead=1;g.P.push({x:b.x,y:b.y,vx:rnd(-60,60),vy:rnd(-60,60),l:.2,L:.2,c:'#c03aff',k:'g',s:3});continue}if(hit&&e.inv>0){b.dead=1;g.P.push({x:b.x,y:b.y,vx:rnd(-60,60),vy:rnd(-60,60),l:.2,L:.2,c:'#ffffff',k:'g',s:3});continue}}
   else{const dx=b.x-e.x,dy=b.y-e.y,rr2=e.r+6+(r.big||0);hit=dx*dx+dy*dy<rr2*rr2}
   if(!hit)continue;let dm=b.d;
   if(e.shp>0&&b.y>e.y-10){const ab=dm*.7;e.shp-=ab;dm*=.3;if(e.shp<=0){e.a=RG.riot2;sfx('shieldbreak');part(e.x-8,e.y,'#3a8aff',16,180,'g');txt(e.x,e.y-40,'BREACHED','#9ac8ff',13,.8)}else g.P.push({x:b.x,y:b.y,vx:rnd(-80,80),vy:rnd(-40,40),l:.18,L:.18,c:'#3a8aff',k:'g',s:3})}
   if(K.crit&&Math.random()<.15*K.crit){dm*=2.5;txt(b.x+rnd(-10,10),b.y-20,'CRIT','#ffe04a',13,.5)}if(K.frost&&!e.b)e.slow=1.5;
   e.hp-=dm;if(e.fl<-.06)e.fl=.05;e.sq=1;if(!e.b&&!e.d.heavy)e.kb=Math.min(e.kb+40,110);else if(!e.b)e.kb=Math.min(e.kb+10,30);
   b.hit.push(e);if(r.burn)e.burn=2.5;if(b.p>0)b.p--;else if(b.rc>0&&!e.b){let tg=null,bd2=170;for(const o of g.E){if(o.dead||o==e||o.b||b.hit.includes(o))continue;const dd=Math.hypot(o.x-e.x,o.y-e.y);if(dd<bd2){bd2=dd;tg=o}}if(tg){b.rc--;const a=Math.atan2(tg.y-b.y,tg.x-b.x);b.vx=Math.cos(a)*620;b.vy=Math.sin(a)*620;b.home=0}else b.dead=1}else b.dead=1;sfx('hit',60);
   g.P.push({x:b.x,y:b.y,vx:rnd(-90,90),vy:rnd(-90,20),l:.22,L:.22,c:r.pc,k:'g',s:3.5})}
  if(e.hp<=0){if(e.b)bossDown(e);else{kill(e);if(e.el)g.hs=.04}continue}
  if(g.dead||e.b)continue;
  const dx=e.x-g.px,dy=e.y-py;if(dx*dx+dy*dy<(e.r*.8+10)**2){window.HS='contact:'+e.k;if(e.d.bomb){explode(e.x,e.y,62,6*hpMul(g.stage),1);kill(e,1)}else{e.dead=1;part(e.x,e.y,e.a.neon||'#ff2a8a',10,180,'g')}hurt(1)}
  else if(e.y>H+30)e.dead=1}
 const E=g.E;for(let i=0;i<E.length;i++){const a=E[i];if(a.b||a.dead)continue;for(let j=i+1;j<E.length;j++){const b=E[j];if(b.b||b.dead)continue;const dx=b.x-a.x,dy=b.y-a.y,m=a.r+b.r;if(Math.abs(dx)<m&&Math.abs(dy)<m){const d=Math.hypot(dx,dy)||1;if(d<m){const p=(m-d)/d*.5*Math.min(1,dt*10);a.x-=dx*p;b.x+=dx*p;a.y-=dy*p*.4;b.y+=dy*p*.4}}}}
 for(const b of g.EB){if(b.curve){const a=Math.atan2(b.vy,b.vx)+b.curve*edt,sp=Math.hypot(b.vx,b.vy);b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp}
  if(b.home>0){b.home-=edt;const a=Math.atan2(g.py-b.y,g.px-b.x),ca=Math.atan2(b.vy,b.vx);let da=a-ca;while(da>Math.PI)da-=TAU;while(da<-Math.PI)da+=TAU;const na=ca+cl(da,-2*edt,2*edt),sp=Math.hypot(b.vx,b.vy);b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp}
  b.x+=b.vx*edt;b.y+=b.vy*edt;const dx=b.x-g.px,dy=b.y-(py-10);if(!g.dead&&dx*dx+dy*dy<105){b.dead=1;window.HS='bullet:'+(b.k||'eb');hurt(1)}}
 hazards(edt,py);
 const mag=g.bf.magnet>0;
 for(const d of g.D){d.t+=dt;if(d.vx!==undefined){d.x+=d.vx*edt;d.y+=d.vy*edt;d.vx*=.995;d.vy*=.995}else d.y+=(g.scroll+(g.ar?45:0))*dt;
  if(mag&&d.k!='virus'){const a=Math.atan2(py-d.y,g.px-d.x);d.x+=Math.cos(a)*240*dt;d.y+=Math.sin(a)*240*dt}
  const dx=d.x-g.px,dy=d.y-py;if(!g.dead&&dx*dx+dy*dy<(d.k=='virus'?420:1000)){d.dead=1;ring(d.x,d.y,d.k=='virus'?'#ff1a3a':'#3ff0ff',50);
   if(d.k=='heal'){g.hp=Math.min(g.mh,g.hp+1);txt(d.x,d.y-20,'+1 HEART','#ff8aa8');sfx('pick')}else if(d.k=='shield'){g.sh=1;txt(d.x,d.y-20,'SHIELD','#9fe8ff');sfx('pick')}
   else if(d.k=='virus')debuff(pick(Object.keys(DB)));else if(d.k=='nuke')nuke();else buff(d.k)}}
 const cx=W-110,cy=24;
 for(const c of g.C){c.t+=rdt;if(c.t<.35){c.x+=c.vx*rdt;c.y+=c.vy*rdt;c.vx*=.9;c.vy*=.9}else{const dx=cx-c.x,dy=cy-c.y,d=Math.hypot(dx,dy),sp=300+c.t*900;if(d<14){c.dead=1;g.co+=c.v;g.cpop=1;sfx('coin',45)}else{c.x+=dx/d*sp*rdt;c.y+=dy/d*sp*rdt}}}
 for(const p of g.P){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;if(p.k=='c'){p.vy+=500*dt;p.r+=dt*8}else{p.vx*=.94;p.vy*=.94}}
 for(const k of g.K){k.t+=dt;k.y+=g.scroll*dt}
 for(const t of g.T){t.y-=26*rdt;t.l-=rdt}
 const ok=o=>!o.dead&&o.y>-220&&o.y<H+60&&o.x>-60&&o.x<W+60;
 g.B=g.B.filter(ok);g.EB=g.EB.filter(ok);g.D=g.D.filter(ok);g.E=g.E.filter(e=>!e.dead&&(e.b||e.y<H+60));g.C=g.C.filter(c=>!c.dead);g.K=g.K.filter(k=>k.t<.6);
 g.P=g.P.filter(p=>p.l>0);g.T=g.T.filter(t=>t.l>0);if(g.P.length>480)g.P.splice(0,g.P.length-480)}
function aimTarget(b){const g=G;if(b.k=='hydra'&&b.heads.length){let best=b.heads[0],bd=1e9;for(const h of b.heads){const d=Math.abs(h.x-g.px);if(d<bd){bd=d;best=h}}return best}
 if(b.k=='queen'&&b.copies.length){let best=b,bd=Math.abs(b.x-g.px);for(const c of b.copies){const d=Math.abs(c.x-g.px);if(d<bd){bd=d;best=c}}return best}
 return{x:b.x,y:b.y-(b.k=='shogun'?24:0)}}
function nuke(){const g=G;g.flash=.7;g.shk=.6;sfx('big');for(const b of g.EB)b.dead=1;for(const e of g.E){if(e.b){if(g.phase=='boss'&&e.inv<=0)e.hp-=e.mh*.05}else{e.hp-=pwr()*12;if(e.hp<=0)kill(e)}}ring(g.px,g.py,'#fff',400);txt(W/2,H*.45,'SYSTEM PURGE','#ffffff',30,1.4)}
function hazards(dt,py){const g=G,px=g.px,pY=py-10;
 for(const b of g.BM){b.t+=dt;if(b.att){b.x=b.att.x;b.y=b.att.y}if(b.t>b.warn){if(b.a1!=null){const d=b.a1-b.a,s2=Math.abs(b.sweep)*dt;b.a+=Math.abs(d)<s2?d:Math.sign(d)*s2}else b.a+=b.sweep*dt}
  if(b.t>b.warn&&!b.snd){b.snd=1;sfx('laser');g.shk=Math.max(g.shk,.15)}
  if(b.t>b.warn&&b.t<b.warn+b.dur&&!g.dead){const ex=b.x+Math.cos(b.a)*b.len,ey=b.y+Math.sin(b.a)*b.len;if(segD(px,pY,b.x,b.y,ex,ey)<b.w/2+4){window.HS='beam';hurt(1)}}}
 g.BM=g.BM.filter(b=>b.t<b.warn+b.dur);
 for(const t of g.TL){t.t+=dt;if(t.t>t.warn&&!t.boom){t.boom=1;sfx('erupt',60);part(t.x+t.w/2,t.y+t.h/2,'#7aff3a',6,160,'g')}
  if(t.t>t.warn&&t.t<t.warn+t.dur&&!g.dead&&px>t.x+3&&px<t.x+t.w-3&&pY>t.y+3&&pY<t.y+t.h-3){window.HS='tile';hurt(1)}}
 g.TL=g.TL.filter(t=>t.t<t.warn+t.dur);
 for(const w of g.WV){w.t+=dt;if(w.line){if(w.t>w.warn&&w.t<w.warn+w.dur&&Math.abs(pY-w.y)<10)hurt(1);continue}
  w.r+=w.v*dt;const d=Math.hypot(px-w.x,pY-w.y);let da=Math.atan2(pY-w.y,px-w.x)-w.a;while(da>Math.PI)da-=TAU;while(da<-Math.PI)da+=TAU;if(Math.abs(d-w.r)<w.w&&Math.abs(da)<w.arc/2){window.HS='wave';hurt(1)}}
 g.WV=g.WV.filter(w=>w.line?w.t<w.warn+w.dur:w.r<700);
 for(const c of g.CL){c.t+=dt;if(c.t<c.warn)continue;const k=Math.min(1,(c.t-c.warn)*2.2);c.x=lerp(c.x0,c.x1,k);c.y=lerp(c.y0,c.y1,k);if(Math.hypot(c.x-px,c.y-24-pY)<24){window.HS='clone';hurt(1)}if(k>=1)c.done=(c.done||0)+dt}
 g.CL=g.CL.filter(c=>!(c.done>.25))}
function segD(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,l=dx*dx+dy*dy||1,t=cl(((px-x1)*dx+(py-y1)*dy)/l,0,1);return Math.hypot(px-(x1+dx*t),py-(y1+dy*t))}
function bossDown(b){const g=G;if(g.phase=='bdeath')return;b.hp=0;g.phase='bdeath';g.pt=2.8;g.slow=.18;g.EB.forEach(e=>e.dead=1);g.BM=[];g.TL=[];g.WV=[];g.CL=[];g.LT=[];for(const e of g.E)if(!e.b)kill(e,1);
 g.zx=b.x;g.zy=b.y;sfx('big');buzz(250);b.dying=1}
function director(dt,rdt){const g=G,alive=g.E.filter(e=>!e.b).length;
 if(g.phase=='rest'){g.pt-=dt;if(g.pt<=0){g.phase='waves';g.wi=0;queueWave(g.waves[0]);g.wt=0}}
 else if(g.phase=='waves'){g.wt+=dt;for(const q of g.q)q.d-=dt;const due=g.q.filter(q=>q.d<=0);g.q=g.q.filter(q=>q.d>0);for(const q of due)addE(q.k,q.x,-40-rnd(0,20));
  if(g.stage>=3){g.storm-=dt;if(g.storm<=0){g.storm=rnd(22,32);g.stormT=3.2;g.card={t:1.4,a:'⚠ DATA STORM',b:'virus chips incoming',c:'#ff1a3a',small:1};sfx('warn')}}
  if(g.stormT>0){g.stormT-=dt;if(Math.random()<dt*2.2)g.D.push({x:rnd(40,W-40),y:-20,k:Math.random()<.12?'over':'virus',t:0})}
  if(!g.q.length&&(alive<=1||g.wt>13)){if(g.wi<g.waves.length-1){g.wi++;g.wt=0;queueWave(g.waves[g.wi])}else if(alive==0){g.phase='lull';g.pt=1.2}}}
 else if(g.phase=='lull'){g.pt-=dt;if(g.pt<=0){g.phase='approach';g.pt=2.4;g.alarm=2.4;sfx('warn');g.D=g.D.filter(d=>d.k!='virus')}}
 else if(g.phase=='approach'){g.pt-=rdt;if(g.pt<=0){g.phase='intro';g.pt=3.4;const b=spawnBoss();g.ar=arenaOf(b.bd.arena);g.card={t:3.2,a:b.bd.name,b:b.bd.title,c:b.bd.c};g.zx=W/2;g.zy=H*.3;sfx('boss');music('boss');buzz(120)}}
 else if(g.phase=='intro'){g.pt-=rdt;if(g.pt<=0){g.phase='boss';g.boss.cd=1}}
 else if(g.phase=='bdeath'){g.pt-=rdt;const b=g.boss;if(b&&Math.random()<rdt*14){const x=b.x+rnd(-50,50),y=b.y+rnd(-50,40);part(x,y,b.bd.c,10,260,'g');ring(x,y,'#fff',rnd(30,70));sfx('boom',90);g.shk=.3}
  if(g.pt<=0&&b){g.flash=1;g.shk=.8;part(b.x,b.y,'#ffffff',60,500,'g');part(b.x,b.y,b.bd.c,60,420,'g');for(let i=0;i<4;i++)ring(b.x,b.y,i%2?'#fff':b.bd.c,100+i*80);
   b.dead=1;g.kills++;g.sc+=b.val*10;const n=24,cv=b.val*.3*g.coinMul;for(let i=0;i<n;i++){const a=rnd(0,TAU),v=rnd(80,340);g.C.push({x:b.x,y:b.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,v:cv/n})}
   g.boss=null;g.card={t:2.4,a:'TARGET ELIMINATED',b:b.bd.name+' // DISTRICT '+String(g.stage).padStart(2,'0')+' CLEAR',c:'#ffd84a'};if(g.hp<g.mh){g.hp++;txt(g.px,g.py-60,'+1 HEART','#ff8aa8',20,1.6)}
   g.phase='clear';g.pt=2.4;g.db={};sfx('stage');music('battle')}}
 else if(g.phase=='clear'){g.pt-=dt;if(g.pt<=0){nextStage();openPick('DISTRICT '+String(g.stage-1).padStart(2,'0')+' SECURED','Choose your reward')}}}
function enemyAI(e,dt){const g=G,d=e.d,py=g.py,entry=e.y<30;if(e.slow>0)e.slow-=dt;const spd=e.v*(entry?1.8:1)*(e.slow>0?.65:1);
 let wantVx=0,wantVy=spd;
 if(g.ar){const a=Math.atan2(py-e.y,g.px-e.x);wantVx=Math.cos(a)*spd*.8;wantVy=Math.sin(a)*spd*.8}
 else if(d.flock){e.bx+=(g.px-e.bx)*Math.min(1,dt*.5);wantVx=(e.bx+Math.sin(e.t*3+e.ph)*46-e.x)*3;wantVy=spd*(.7+.5*Math.sin(e.t*2+e.ph))}
 else if(d.shoot&&e.state!='go'){if(e.y<e.stopY)wantVy=spd;else{wantVy=0;e.st-=dt;if(e.st<=0){if(e.state=='aim'){shoot(e,Math.atan2(py-10-e.y,g.px-e.x),250,'ea');e.shots++;e.state='walk';e.st=1.5;if(e.shots>=3)e.state='go'}else{e.state='aim';e.st=.6}}}}
 else if(d.summon&&e.state!='go'){if(e.y<e.stopY*.8)wantVy=spd;else{wantVy=0;e.st-=dt;if(e.st<=0){if(e.state=='aim'){for(const s of[-1,1])addE('drone',cl(e.x+s*28,24,W-24),e.y+6,{home:.8});
    const a=Math.atan2(py-e.y,g.px-e.x);g.D.push({x:e.x,y:e.y,k:'virus',t:0,vx:Math.cos(a)*110,vy:Math.sin(a)*110});sfx('zap');ring(e.x,e.y,'#3aff6a',40);e.sum++;e.state='walk';e.st=3.4;if(e.sum>=3)e.state='go'}else{e.state='aim';e.st=.8}}}}
 if(!g.ar){const hm=d.home||(e.y>H*.55&&!d.flock&&!d.heavy?.25:0);if(hm&&!entry&&e.y<py-40)wantVx=cl((g.px-e.x)*hm,-e.v*.55,e.v*.55);if(!d.flock&&!hm)wantVx=Math.sin(e.t*1.6+e.ph)*12}
 const k=Math.min(1,dt*3.2);e.vx+=(wantVx-e.vx)*k;e.vy+=(wantVy-e.vy)*k;e.kb*=Math.exp(-7*dt);
 e.x+=e.vx*dt;e.y+=(e.vy-e.kb)*dt;e.x=cl(e.x,16,W-16);e.dist+=Math.hypot(e.vx,e.vy)*dt*.9+(d.flock?dt*90:0)}
