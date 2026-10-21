'use strict';
/* ================= core utils ================= */
const $=id=>document.getElementById(id),cv=$('c'),X=cv.getContext('2d');
const TAU=Math.PI*2,cl=(v,a,b)=>v<a?a:v>b?b:v,rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0],lerp=(a,b,k)=>a+(b-a)*k;
let W=360,H=640,S=1,DPR=1;
const INK='#07040e';
const rgb=c=>{const n=parseInt(c.slice(1,7),16);return[n>>16,n>>8&255,n&255]};
const rgba=(c,a)=>{const[r,g,b]=rgb(c);return`rgba(${r},${g},${b},${a})`};
const sh=(c,f)=>{const[r,g,b]=rgb(c),m=f>0?255:0,a=Math.abs(f),q=v=>v+(m-v)*a|0;return'#'+[q(r),q(g),q(b)].map(v=>v.toString(16).padStart(2,'0')).join('')};
function mk(w,h,z){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w*z));c.height=Math.max(1,Math.ceil(h*z));const g=c.getContext('2d');g.scale(z,z);return[c,g]}
function ell(g,x,y,rx,ry,rot=0){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,TAU)}
function rr(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function poly(g,pts){g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.closePath()}
function cut(g,x,y,w,h,c){g.beginPath();g.moveTo(x+c,y);g.lineTo(x+w,y);g.lineTo(x+w,y+h-c);g.lineTo(x+w-c,y+h);g.lineTo(x,y+h);g.lineTo(x,y+c);g.closePath()}
const GS={};
function glowS(c){if(GS[c])return GS[c];const[cc,g]=mk(64,64,1);const q=g.createRadialGradient(32,32,0,32,32,32);q.addColorStop(0,rgba(c,1));q.addColorStop(.2,rgba(c,.7));q.addColorStop(.5,rgba(c,.2));q.addColorStop(1,rgba(c,0));g.fillStyle=q;g.fillRect(0,0,64,64);return GS[c]=cc}
function glow(g,x,y,r,c,a=1){if(r<=0||a<=0)return;const o=g.globalAlpha;g.globalAlpha=o*a;g.drawImage(glowS(c),x-r,y-r,r*2,r*2);g.globalAlpha=o}
function add(g,f){const o=g.globalCompositeOperation;g.globalCompositeOperation='lighter';f();g.globalCompositeOperation=o}
function heart(g,x,y,r){g.beginPath();g.moveTo(x,y+r*.95);g.bezierCurveTo(x-r*1.7,y-r*.1,x-r*.95,y-r*1.35,x,y-r*.45);g.bezierCurveTo(x+r*.95,y-r*1.35,x+r*1.7,y-r*.1,x,y+r*.95);g.closePath()}

/* ================= cel shading (ink outline, hard light band, neon rim) ================= */
function celE(g,x,y,rx,ry,c,rim,lw=1.9){ell(g,x,y,rx,ry);g.fillStyle=sh(c,-.45);g.fill();
 g.save();ell(g,x,y,rx,ry);g.clip();ell(g,x-rx*.2,y-ry*.18,rx*.96,ry*.96);g.fillStyle=c;g.fill();ell(g,x-rx*.45,y-ry*.45,rx*.36,ry*.28);g.fillStyle=sh(c,.25);g.fill();
 if(rim){ell(g,x-1.6,y-.4,rx,ry);g.lineWidth=1.8;g.strokeStyle=rim;g.stroke()}g.restore();ell(g,x,y,rx,ry);g.lineWidth=lw;g.strokeStyle=INK;g.stroke()}
function celP(g,path,c,rim,lw=1.9,dx=-2.4,dy=-1.8){path();g.fillStyle=sh(c,-.45);g.fill();g.save();path();g.clip();g.translate(dx,dy);path();g.fillStyle=c;g.fill();
 if(rim){g.translate(-dx-1.8,-dy+.3);path();g.lineWidth=1.8;g.strokeStyle=rim;g.stroke()}g.restore();path();g.lineWidth=lw;g.lineJoin='round';g.strokeStyle=INK;g.stroke()}
function celC(g,x1,y1,x2,y2,w,c,rim){g.lineCap='round';const L=()=>{g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2)};
 L();g.strokeStyle=INK;g.lineWidth=w+3.4;g.stroke();L();g.strokeStyle=sh(c,-.45);g.lineWidth=w;g.stroke();
 const ox=-w*.17,oy=-w*.08;g.beginPath();g.moveTo(x1+ox,y1+oy);g.lineTo(x2+ox,y2+oy);g.strokeStyle=c;g.lineWidth=w*.6;g.stroke();
 if(rim){g.beginPath();g.moveTo(x1+w*.36,y1);g.lineTo(x2+w*.36,y2);g.strokeStyle=rim;g.lineWidth=1.2;g.stroke()}}
function neon(g,pts,c,w=1.4,closed){g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);if(closed)g.closePath();g.lineCap='round';g.lineJoin='round';
 g.strokeStyle=rgba(c,.28);g.lineWidth=w*4;g.stroke();g.strokeStyle=c;g.lineWidth=w;g.stroke();g.strokeStyle=rgba('#ffffff',.7);g.lineWidth=w*.4;g.stroke()}

/* ================= hero & enemy definitions (art) ================= */
const RACES=[
{id:'human',n:'VEX',title:'THE NETRUNNER',race:'HUMAN',cost:0,hp:3,rate:5.9,dmg:1,proj:'dart',pc:'#3ff0ff',ab:'Rapid fire',lore:'Ex-corp hacker with a smart pistol and nothing left to lose.',
 skin:'#e3a782',hair:'#ff2a8a',hs:'undercut',visor:'#3ff0ff',coat:'#1d1934',ctrim:'#3ff0ff',armor:'#2c2546',cloth:'#141020',boots:'#0d0a16',glove:'#26203a',neon:'#3ff0ff',wpn:'pistol'},
{id:'elf',n:'KAIRO',title:'THE RAIL SAINT',race:'ANDROID',cost:200,hp:3,rate:4.6,dmg:1,pierce:1,proj:'rail',pc:'#ffd84a',ab:'Pierces 2 foes',lore:'A temple android that judges with a railgun.',
 skin:'#ece6dc',hair:'#f2f2ff',hs:'long',mask:'android',eyes:'#ffd84a',halo:'#ffd84a',armor:'#dfe3ec',atrim:'#ffd84a',cloth:'#26263a',boots:'#d8dce6',glove:'#dfe3ec',neon:'#ffd84a',tall:1.05,bulk:.94,wpn:'rail',ast:'android'},
{id:'orc',n:'MAMMOTH',title:'THE JUGGERNAUT',race:'CYBORG',cost:450,hp:4,rate:1.75,dmg:2.7,big:5,proj:'slug',pc:'#ff8a2a',ab:'Heavy slugs',lore:'More steel than man. The arm cannon does the talking.',
 skin:'#a37a62',hair:'#1a1a1a',hs:'buzz',mask:'mono',eyes:'#ff3a2a',armor:'#3a3b44',cloth:'#22232a',boots:'#18181e',glove:'#3a3b44',neon:'#ff8a2a',bulk:1.3,wpn:'cannon',ast:'heavy',pipes:1},
{id:'demon',n:'HEX',title:'THE PLASMA WITCH',race:'AUGMENT',cost:800,hp:3,rate:4.4,dmg:.9,burn:1.7,proj:'plasma',pc:'#ff2ad8',ab:'Burns foes',lore:'Street shaman. Her oni mask hums with stolen plasma.',
 skin:'#d8a088',hair:'#14081a',hs:'bob',mask:'oni',eyes:'#ff2ad8',armor:'#2a0c2c',atrim:'#ff2ad8',cloth:'#1a0a1c',boots:'#0e060e',glove:'#3a1240',neon:'#ff2ad8',wpn:'plasma',ast:'kimono'},
{id:'undead',n:'ECHO',title:'THE GHOST',race:'HOLOGRAM',cost:1200,hp:2,rate:4,dmg:1.1,revive:1,home:1,proj:'seeker',pc:'#3aff9a',ab:'Homing + reboot',lore:'A dead runner\'s mind, still online. Reboots once.',
 skin:'#1a3a2a',hs:'hood',hood:'#123024',mask:'void',eyes:'#3aff9a',armor:'#12302a',atrim:'#3aff9a',cloth:'#0e2018',boots:'#0e2018',glove:'#12302a',neon:'#3aff9a',holo:1,float:1,wpn:'drones',ast:'circuit'}];
const RG={
drone:{id:'drone',kind:'drone',c:'#2a2a38',eye:'#ff2a4a'},
micro:{id:'micro',kind:'micro',c:'#3a2a3a',eye:'#ff3a8a'},
punk:{id:'punk',skin:'#c88f6a',hair:'#7aff3a',hs:'mohawk',armor:'#2c1a1a',cloth:'#1a1a2a',boots:'#121212',glove:'#c88f6a',neon:'#7aff3a',eyes:'#ff3a3a',brow:1,wpn:'bat',ast:'jacket',tall:.95},
sniper:{id:'sniper',skin:'#b08a70',hs:'helmet',visor:'#ff2a3a',armor:'#2a2e3a',atrim:'#ff2a3a',cloth:'#1c1e26',boots:'#101016',glove:'#2a2e3a',neon:'#ff2a3a',wpn:'rifle',ast:'tactical'},
nanite:{id:'nanite',kind:'cube',c:'#3ff0ff',c2:'#ff2ad8'},
naniteS:{id:'naniteS',kind:'cube',c:'#ff2ad8',c2:'#3ff0ff'},
mech:{id:'mech',kind:'mech',c:'#4a4a56',eye:'#ff3a2a'},
rigger:{id:'rigger',skin:'#b8805a',hair:'#ff8a2a',hs:'band',armor:'#3a2a1a',cloth:'#1e1a14',boots:'#121008',glove:'#b8805a',neon:'#ff8a2a',eyes:'#ffd03a',brow:1,wpn:'bomb',ast:'jacket',tall:.92,bomb:1},
riot:{id:'riot',skin:'#a07a62',hs:'helmet',visor:'#3a8aff',armor:'#1c2440',atrim:'#3a8aff',cloth:'#141a2c',boots:'#0c0e16',glove:'#1c2440',neon:'#3a8aff',bulk:1.12,wpn:'shield',ast:'tactical'},
riot2:{id:'riot2',skin:'#a07a62',hs:'helmet',visor:'#3a8aff',armor:'#1c2440',atrim:'#3a8aff',cloth:'#141a2c',boots:'#0c0e16',glove:'#1c2440',neon:'#3a8aff',bulk:1.12,wpn:'baton',ast:'tactical'},
hacker:{id:'hacker',skin:'#9a8a7a',hs:'hood',hood:'#14201a',mask:'screen',eyes:'#3aff6a',armor:'#1a241e',atrim:'#3aff6a',cloth:'#121812',boots:'#0c100c',glove:'#1a241e',neon:'#3aff6a',wpn:'tablet',ast:'circuit'},
shogun:{id:'shogun',skin:'#b07a5a',hs:'kabuto',mask:'menpo',eyes:'#ff2a4a',armor:'#2a0a12',atrim:'#ff2a4a',cloth:'#1a0a10',boots:'#0e0608',glove:'#2a0a12',neon:'#ff2a4a',coat:'#3a0a16',ctrim:'#ff2a4a',bulk:1.15,wpn:'katana',ast:'samurai'}};

/* ================= the rig: 3/4 view, cel shaded ================= */
function fig(g,a,f,back){
 if(a.kind=='drone')return droneFig(g,a,f);if(a.kind=='micro')return microFig(g,a,f);if(a.kind=='cube')return cubeFig(g,a,f);if(a.kind=='mech')return mechFig(g,a,f);
 const bw=a.bulk||1,hk=a.tall||1,ph=f/8*TAU,s1=Math.sin(ph),bob=a.float?Math.sin(ph)*1.6-3:-Math.abs(s1)*1.3*hk,
  hipY=-30*hk+bob,waY=-38*hk+bob,shY=-57*hk+bob,shX=13.6*bw,waX=9.4*bw,chX=12.6*bw,R=9.4*(1+(bw-1)*.28),hy=-70*hk+bob*1.05,N=a.neon;
 if(!a.noshadow){g.fillStyle='rgba(0,0,0,.4)';ell(g,0,0,16*bw,5);g.fill();if(N){add(g,()=>glow(g,0,0,20*bw,N,.25))}}
 // coat back panel / pipes behind
 if(a.coat&&!back)coatPanels(g,a,shY,waY,shX,bw,f,0);
 if(a.pipes&&!back)for(const s of[-1,1]){celC(g,s*7,shY+8,s*9,shY-12,5,'#4a4a52',null);add(g,()=>glow(g,s*9,shY-14,8,N,.8))}
 // legs
 if(a.float){for(let i=0;i<5;i++){const y=hipY+4+i*5,w=(waX+2)*(1-i*.17);g.globalAlpha=.75-i*.14;g.fillStyle=i%2?sh(a.cloth,.1):a.armor;rr(g,-w,y,w*2,3,1.5);g.fill();g.globalAlpha=1;neon(g,[-w,y+3,w,y+3],N,.6)}}
 else for(const s of[-1,1]){const lift=Math.max(0,s*s1)*4.2*hk,ax=s*5.5*bw,ay=-5-lift,kx=s*5.9*bw,ky=(hipY+ay)/2-lift*.15;
  celC(g,s*5*bw,hipY,kx,ky,7.8*bw,a.cloth,N&&a.ast!='heavy'?null:null);celC(g,kx,ky,ax,ay,6.6*bw,a.ast=='android'||a.ast=='heavy'?a.boots:a.cloth,N);
  if(a.ast=='heavy'||a.ast=='tactical'||a.ast=='samurai'){celE(g,kx,ky,3.9*bw,3.3,a.armor,N)}
  celC(g,ax,ay-4.5,ax,ay+.6,7*bw,a.boots);celE(g,ax,ay+3,4.8*bw,3.2,a.boots);g.strokeStyle=N||'#444';g.lineWidth=1.1;g.beginPath();g.moveTo(ax-4*bw,ay+5.3);g.lineTo(ax+4*bw,ay+5.3);g.stroke()}
 if(a.coat&&back)coatPanels(g,a,shY,waY,shX,bw,f,1);
 // torso
 torso(g,a,back,shY,waY,hipY,shX,waX,chX,bw,N);
 if(a.pipes&&back)for(const s of[-1,1]){celC(g,s*6,shY+16,s*8,shY-10,6,'#4a4a52',null);celE(g,s*8,shY-11,4,2.4,'#2a2a30');add(g,()=>glow(g,s*8,shY-12,10,N,.9))}
 if(a.bomb&&back){rr(g,-8,shY+4,16,18,4);celP(g,()=>rr(g,-8,shY+4,16,18,4),'#3a3a3a');add(g,()=>glow(g,0,shY+12,10,'#ff8a2a',.9))}
 // neck
 celC(g,0,shY+1,0,hy+R*.6,6.2,a.skin);g.fillStyle='rgba(0,0,0,.3)';ell(g,0,shY+1.5,R*.7,2.6);g.fill();
 // arms + weapons
 const P=pose(a.wpn,back,shY,shX,hk);
 if(a.wpn=='rail')weapon(g,a,back,P,shY,0);
 if(a.wpn!='cannon')arm(g,a,-1,P.l,shY,shX,bw);else arm(g,a,-1,P.l,shY,shX,bw);
 if(a.wpn!='cannon')arm(g,a,1,P.r,shY,shX,bw);
 shoulder(g,a,shY,shX,bw,N);
 weapon(g,a,back,P,shY,1);
 for(const[h,s]of[[P.l,-1],[P.r,1]]){if(a.wpn=='cannon'&&s==1)continue;celE(g,h[0],h[1],3.5*bw,3.5*bw,a.glove||a.skin)}
 weapon(g,a,back,P,shY,2);
 head(g,a,back,hy,R,N);
 if(a.halo){add(g,()=>{ell(g,0,hy-R*1.55,R*1.05,R*.32);g.strokeStyle=rgba(a.halo,.35);g.lineWidth=5;g.stroke();g.strokeStyle=a.halo;g.lineWidth=1.6;g.stroke();glow(g,0,hy-R*1.55,R*1.5,a.halo,.3)})}}
function coatPanels(g,a,shY,waY,shX,bw,f,back){const sw=Math.sin(f/8*TAU)*2.2,hem=-11;
 if(!back){for(const s of[-1,1]){celP(g,()=>poly(g,[s*(shX-3),shY+2,s*(shX+1),shY+6,s*(shX+5+sw*s*.5),hem+sw*.3,s*(shX-2),hem+3,s*6,waY+4,s*8,shY+6]),a.coat,null);
   neon(g,[s*(shX+5+sw*s*.5),hem+sw*.3,s*(shX-2),hem+3],a.ctrim,.9)}}
 else{celP(g,()=>poly(g,[-shX+1,shY+1,shX-1,shY+1,shX+5+sw,hem,2,hem+3,0,hem-6,-2,hem+3,-shX-5+sw,hem]),a.coat,a.ctrim);neon(g,[0,hem-6,0,waY+2],a.ctrim,.8);neon(g,[-shX-5+sw,hem,-2,hem+3],a.ctrim,.9);neon(g,[2,hem+3,shX+5+sw,hem],a.ctrim,.9)}}
function torso(g,a,back,shY,waY,hipY,shX,waX,chX,bw,N){
 const path=()=>{g.beginPath();g.moveTo(-shX+2,shY);g.quadraticCurveTo(0,shY-2.5,shX-2,shY);g.quadraticCurveTo(chX+1.5,shY+5,chX,shY+11);g.quadraticCurveTo(waX+2,waY-5,waX,waY+1);g.lineTo(waX+2,hipY+4);g.quadraticCurveTo(0,hipY+7,-waX-2,hipY+4);g.lineTo(-waX,waY+1);g.quadraticCurveTo(-waX-2,waY-5,-chX,shY+11);g.quadraticCurveTo(-chX-1.5,shY+5,-shX+2,shY);g.closePath()};
 celP(g,path,a.armor,N);
 g.save();path();g.clip();
 const T=a.ast||'';
 if(T=='heavy'){for(let i=-3;i<4;i++){g.fillStyle=i%2?'#ffcf2a':'#1a1a1a';g.beginPath();g.moveTo(-waX-2+i*5,waY+1);g.lineTo(-waX+3+i*5,waY+1);g.lineTo(-waX+i*5,hipY+5);g.lineTo(-waX-5+i*5,hipY+5);g.fill()}
  celP(g,()=>rr(g,-chX+2,shY+3,2*chX-4,12,3),sh(a.armor,.12),N,1.4);if(!back){add(g,()=>glow(g,0,shY+9,9,N,.9));celE(g,0,shY+9,3,3,'#ffb06a')}}
 if(T=='android'){g.strokeStyle=rgba('#000000',.35);g.lineWidth=.9;g.beginPath();g.moveTo(0,shY);g.lineTo(0,waY);g.moveTo(-chX+2,shY+10);g.quadraticCurveTo(0,shY+14,chX-2,shY+10);g.moveTo(-waX,waY-4);g.lineTo(waX,waY-4);g.stroke();neon(g,[-chX+3,shY+3,-3,shY+8,-3,waY],a.atrim,.8);neon(g,[chX-3,shY+3,3,shY+8,3,waY],a.atrim,.8)}
 if(T=='kimono'&&!back){celP(g,()=>poly(g,[-shX+3,shY,-2,waY+2,2,waY+2,-4,shY]),sh(a.armor,.1),null,1.2);neon(g,[-shX+4,shY+1,-1,waY+1],a.atrim,1);neon(g,[shX-4,shY+1,1,waY-3],a.atrim,1)}
 if(T=='kimono'&&back){neon(g,[-8,shY+8,0,shY+16,8,shY+8],a.atrim,1);add(g,()=>glow(g,0,shY+12,8,a.atrim,.6))}
 if(T=='circuit'){neon(g,[-5,shY+2,-5,shY+10,-9,shY+14],a.atrim,.7);neon(g,[5,shY+2,5,shY+12,1,shY+16,1,waY],a.atrim,.7);neon(g,[-waX+2,waY-2,waX-2,waY-2],a.atrim,.7)}
 if(T=='jacket'){g.strokeStyle=rgba('#ffffff',.12);g.lineWidth=1;g.beginPath();g.moveTo(-chX+2,shY+3);g.lineTo(-1,waY);g.stroke();if(!back){g.fillStyle='#d8d8d8';for(let i=0;i<4;i++){ell(g,-chX+3+i*1.6,shY+3+i*4,.9,.9);g.fill()}}else{neon(g,[-6,shY+6,6,shY+6,0,shY+14],N,.9)}}
 if(T=='tactical'){celP(g,()=>rr(g,-chX+2,shY+3,2*chX-4,waY-shY-6,3),sh(a.armor,.1),null,1.2);g.fillStyle=sh(a.armor,-.2);for(const x of[-7,-2,3])g.fillRect(x,waY-9,4,5);neon(g,[-chX+3,shY+3,chX-3,shY+3],a.atrim,.7)}
 if(T=='samurai'){for(let i=0;i<3;i++){const y=shY+5+i*6;celP(g,()=>rr(g,-chX+1,y,2*chX-2,5.5,1.5),i%2?sh(a.armor,.12):a.armor,null,1.1);neon(g,[-chX+2,y+5,chX-2,y+5],a.atrim,.5)}}
 if(!T||T=='jacket'){const q=g.createLinearGradient(0,shY,0,hipY);q.addColorStop(0,'rgba(255,255,255,0)');q.addColorStop(1,'rgba(0,0,0,.25)');g.fillStyle=q;g.fillRect(-shX,shY,2*shX,hipY-shY+8)}
 g.restore();
 // belt
 g.fillStyle=INK;rr(g,-waX-.8,waY-2.6,2*waX+1.6,4.6,1.4);g.fill();g.fillStyle='#2a2a30';rr(g,-waX,waY-2,2*waX,3.2,1);g.fill();if(N&&!back){add(g,()=>{g.fillStyle=N;g.fillRect(-2.4,waY-1.6,4.8,2.4);glow(g,0,waY,5,N,.7)})}}
function shoulder(g,a,shY,shX,bw,N){const T=a.ast;
 if(T=='heavy'||T=='samurai'||T=='tactical'||T=='android'){for(const s of[-1,1]){celE(g,s*shX,shY+1.5,7.4*bw,5.6,T=='android'?a.armor:sh(a.armor,.1),N);if(T=='samurai'){celP(g,()=>poly(g,[s*(shX-6),shY+3,s*(shX+8),shY+1,s*(shX+9),shY+9,s*(shX-4),shY+10]),a.armor,null,1.2);neon(g,[s*(shX-4),shY+10,s*(shX+9),shY+9],a.atrim,.6)}
  if(T=='heavy'){g.fillStyle='#ffcf2a';g.fillRect(s*shX-3,shY-1,6,1.6)}}}
 if(a.coat)for(const s of[-1,1]){celE(g,s*(shX-1),shY+1,6.4*bw,4.6,a.coat,a.ctrim)}}
function pose(w,back,shY,shX){const y=shY;
 switch(w){case'pistol':return back?{l:[-5,y+6],r:[6,y-4]}:{l:[-shX-2,y+20],r:[7,y+8]};
  case'rail':return{l:[-6,y+12],r:[7,y+3]};
  case'cannon':return{l:[-shX-2,y+19],r:[shX+3,y+6]};
  case'plasma':return{l:[-shX-6,y-2],r:[shX+6,y-2]};
  case'drones':return{l:[-shX-3,y+12],r:[shX+3,y+12]};
  case'bat':return{l:[-shX-1,y+20],r:[shX+1,y+9]};
  case'rifle':return{l:[-4,y+10],r:[7,y+14]};
  case'bomb':return{l:[-shX-1,y+19],r:[shX+1,y+16]};
  case'shield':return{l:[-9,y+12],r:[shX+1,y+15]};
  case'baton':return{l:[-shX-1,y+20],r:[shX+1,y+12]};
  case'tablet':return{l:[-6,y+12],r:[6,y+12]};
  case'katana':return{l:[-3,y+14],r:[4,y+11]};}
 return{l:[-shX-2,y+20],r:[shX+2,y+20]}}
function arm(g,a,s,h,shY,shX,bw){const sx=s*shX,sy=shY+3,d=Math.hypot(h[0]-sx,h[1]-sy),L=12,bend=Math.max(0,2*L-d)*.7,mx=(sx+h[0])/2+s*bend*.85,my=(sy+h[1])/2+bend*.3;
 const sl=a.coat||a.armor;celC(g,sx,sy,mx,my,6.6*bw,sl,a.ctrim||null);celC(g,mx,my,h[0],h[1],5.8*bw,a.coat?a.coat:sh(a.armor,-.05),a.neon);
 if(a.glove&&a.ast!='kimono'){celC(g,lerp(mx,h[0],.55),lerp(my,h[1],.55),lerp(mx,h[0],.9),lerp(my,h[1],.9),6.2*bw,a.glove)}}
function weapon(g,a,back,P,shY,layer){const w=a.wpn,hl=P.l,hr=P.r,N=a.neon;
 if(layer==0&&w=='rail'){const x0=hl[0]-8,y0=shY+26,x1=hr[0]+10,y1=shY-46;celC(g,x0,y0,x1,y1,5.4,'#e8ecf4',null);celC(g,lerp(x0,x1,.25),lerp(y0,y1,.25),lerp(x0,x1,.55),lerp(y0,y1,.55),8,'#c8ccd8',null);
  for(let k=.32;k<.55;k+=.07)add(g,()=>glow(g,lerp(x0,x1,k),lerp(y0,y1,k),4,N,.9));neon(g,[lerp(x0,x1,.6),lerp(y0,y1,.6),x1,y1],N,1.1);add(g,()=>glow(g,x1,y1,8,N,.8));return}
 if(layer==1){
  if(w=='pistol'){const x=hr[0],y=hr[1];celP(g,()=>rr(g,x-2.6,y-15,5.2,14,1.6),'#2a2a38',N,1.4);celP(g,()=>rr(g,x-2.2,y-3,4.4,7,1.2),'#1a1a24',null,1.2);neon(g,[x,y-14,x,y-6],N,.8);add(g,()=>glow(g,x,y-16,6,N,.9))}
  if(w=='cannon'){const sx=shX0(a),y=shY;celC(g,sx,y+3,sx+2,y-8,12,'#3a3b44',N);celP(g,()=>rr(g,sx-6.5,y-34,13,30,4),'#4a4b55',N,1.9);celP(g,()=>rr(g,sx-5,y-40,10,8,2),'#2a2a30',null,1.6);
   for(let i=0;i<3;i++){g.fillStyle=N;add(g,()=>{g.fillRect(sx-5.5,y-28+i*7,2.4,3.6);glow(g,sx-4.3,y-26+i*7,4,N,.8)})}add(g,()=>glow(g,sx,y-40,10,N,.9));g.fillStyle='#ffcf2a';g.fillRect(sx+2,y-12,3,6)}
  if(w=='bat'){const x1=hr[0],y1=hr[1]+4,x2=hr[0]+12,y2=hr[1]-30;celC(g,x1,y1,x2,y2,4.6,'#2a1a2a',null);add(g,()=>{g.beginPath();g.moveTo(lerp(x1,x2,.3),lerp(y1,y2,.3));g.lineTo(x2,y2);g.strokeStyle=rgba('#ff3ad8',.35);g.lineWidth=8;g.lineCap='round';g.stroke();g.strokeStyle='#ff8ae8';g.lineWidth=2.4;g.stroke()})}
  if(w=='rifle'){const x=hr[0],y=hr[1];celP(g,()=>poly(g,[x-3,y+4,x+3,y+4,x+2.4,y-34,x-2.4,y-34]),'#22252e',null,1.5);celP(g,()=>rr(g,x-4,y-20,8,6,2),'#33363f',null,1.2);add(g,()=>glow(g,x,y-34,5,N,.9))}
  if(w=='baton'){const x=hr[0],y=hr[1];celC(g,x,y+3,x+4,y-24,3.4,'#1a1a24');neon(g,[x+1.4,y-8,x+4,y-24],N,1.4)}
  if(w=='katana'){const x=hr[0],y=hr[1];celC(g,x-2,y+8,x,y-2,3.2,'#1a0a0a');add(g,()=>{g.beginPath();g.moveTo(x,y-3);g.quadraticCurveTo(x+6,y-30,x+3,y-58);g.strokeStyle=rgba(N,.35);g.lineWidth=7;g.lineCap='round';g.stroke();g.strokeStyle='#ffd0d8';g.lineWidth=2;g.stroke()});g.fillStyle='#e0b040';g.fillRect(x-4,y-4,8,2)}}
 if(layer==2){
  if(w=='plasma')for(const h of[hl,hr])add(g,()=>{glow(g,h[0],h[1]-5,18,N);glow(g,h[0],h[1]-5,8,'#ffd0f8');ell(g,h[0],h[1]-5,2.6,3.2);g.fillStyle='#fff';g.fill()});
  if(w=='drones')for(const h of[hl,hr])add(g,()=>glow(g,h[0],h[1],9,N,.8));
  if(w=='bomb'){celE(g,hr[0]+2,hr[1]-2,3,3,'#3a3a3a');add(g,()=>glow(g,hr[0]+2,hr[1]-4,5,'#ff3a2a',.9))}
  if(w=='tablet'){const y=shY+10;celP(g,()=>rr(g,-9,y-3,18,8,1.5),'#101810',N,1.4);add(g,()=>{g.fillStyle=rgba(N,.6);g.fillRect(-7.5,y-1.6,15,5);glow(g,0,y-6,16,N,.5)})}
  if(w=='shield'){const x=hl[0]-1,y=hl[1]-6;add(g,()=>{g.beginPath();for(let i=0;i<6;i++){const an=i/6*TAU+Math.PI/6;g.lineTo(x+Math.cos(an)*15,y+Math.sin(an)*17)}g.closePath();g.fillStyle=rgba(N,.22);g.fill();g.strokeStyle=N;g.lineWidth=1.8;g.stroke();g.strokeStyle=rgba(N,.4);g.lineWidth=.8;g.beginPath();for(let i=-1;i<=1;i++){g.moveTo(x-12,y+i*6);g.lineTo(x+12,y+i*6)}g.stroke();glow(g,x,y,18,N,.3)})}}}
const shX0=a=>13.6*(a.bulk||1)+3;
function head(g,a,back,hy,R,N){const hw=R*.9,hh=R*1.04;
 if(a.hs=='long'){celP(g,()=>{g.beginPath();g.moveTo(-hw*1.08,hy-2);g.lineTo(-hw*1.25,hy+R*(back?2.4:1.7));g.quadraticCurveTo(0,hy+R*(back?2.8:2.1),hw*1.25,hy+R*(back?2.4:1.7));g.lineTo(hw*1.08,hy-2);g.closePath()},a.hair,null,1.6)}
 if(a.hs=='hood'){celE(g,0,hy+1.5,R*1.36,R*1.34,a.hood,N)}
 celE(g,0,hy,hw,hh,a.skin);
 if(a.hs=='hood'&&back){celE(g,0,hy-.5,R*1.28,R*1.26,a.hood,N);neon(g,[0,hy-R*1.1,0,hy+R*.9],N,.6);return}
 if(back){
  if(a.hs=='undercut'){celP(g,()=>{g.beginPath();g.ellipse(0,hy-.5,hw*1.06,hh,0,0,TAU)},sh(a.skin,-.25),null,1.6);celP(g,()=>{g.beginPath();g.moveTo(-hw*1.1,hy-R*.2);g.quadraticCurveTo(-hw*.9,hy-hh*1.15,hw*.4,hy-hh*1.1);g.quadraticCurveTo(hw*1.3,hy-R*.6,hw*1.15,hy+R*.6);g.quadraticCurveTo(hw*.2,hy+R*.2,-hw*1.1,hy-R*.2)},a.hair,null,1.6);add(g,()=>glow(g,hw*.3,hy-R*.3,R,a.hair,.3))}
  else if(a.hs=='helmet'||a.hs=='kabuto'){celE(g,0,hy-.5,hw*1.18,hh*1.1,a.hs=='kabuto'?'#1a0a10':a.armor,N);if(a.hs=='kabuto')kabuto(g,a,hy,R,N)}
  else if(a.hs=='buzz'){g.fillStyle=rgba(a.hair,.5);ell(g,0,hy-1,hw*1.02,hh*.95);g.fill();neon(g,[-hw*.5,hy+R*.2,-hw*.2,hy-R*.4,hw*.3,hy-R*.1],a.neon,.7)}
  else if(a.hs=='mohawk'){mohawk(g,a,hy,R)}
  else if(a.hs=='bob'||a.hs=='long'||a.hs=='band'){celE(g,0,hy-1,hw*1.12,hh*1.06,a.hair,a.hs=='bob'?N:null);if(a.hs=='band'){celP(g,()=>rr(g,-hw*1.05,hy-R*.35,hw*2.1,R*.32,1),a.neon,null,1.2)}}
  if(a.mask=='oni'){for(const s of[-1,1])celP(g,()=>poly(g,[s*R*.4,hy-R*.75,s*R*1.05,hy-R*1.75,s*R*.8,hy-R*.6]),'#c81a3a',N,1.4)}
  return}
 // ---- front face ----
 if(a.mask=='android'){celP(g,()=>{g.beginPath();g.ellipse(0,hy+1,hw*.86,hh*.9,0,0,TAU)},'#f6f2ea',null,1.3);g.strokeStyle=rgba('#000000',.35);g.lineWidth=.8;g.beginPath();g.moveTo(0,hy-R*.6);g.lineTo(0,hy+R*.9);g.moveTo(-hw*.8,hy+R*.2);g.lineTo(hw*.8,hy+R*.2);g.stroke();
  g.fillStyle='#1a1620';rr(g,-hw*.82,hy-R*.2,hw*1.64,R*.3,R*.12);g.fill();for(const s of[-1,1]){g.fillStyle=a.eyes;g.fillRect(s*R*.36-R*.17,hy-R*.12,R*.34,R*.14)}add(g,()=>{for(const s of[-1,1])glow(g,s*R*.36,hy-R*.05,R*.6,a.eyes,.9)})}
 else if(a.mask=='mono'){eyes(g,a,hy,R,1);celP(g,()=>rr(g,-hw*.95,hy-R*.3,hw*1.9,R*.42,2),'#2a2a30',null,1.4);add(g,()=>{ell(g,R*.25,hy-R*.1,R*.2,R*.16);g.fillStyle=a.eyes;g.fill();glow(g,R*.25,hy-R*.1,R*.8,a.eyes,.9)});mouth(g,a,hy,R,'grim')}
 else if(a.mask=='oni'){celP(g,()=>{g.beginPath();g.moveTo(-hw*.95,hy-R*.5);g.quadraticCurveTo(0,hy-R*.75,hw*.95,hy-R*.5);g.lineTo(hw*.85,hy+R*.6);g.quadraticCurveTo(0,hy+R*1.15,-hw*.85,hy+R*.6);g.closePath()},'#c81a3a',null,1.5);
  for(const s of[-1,1]){celP(g,()=>poly(g,[s*R*.35,hy-R*.6,s*R*1.0,hy-R*1.7,s*R*.75,hy-R*.45]),'#e8e0d0',null,1.3)}
  add(g,()=>{for(const s of[-1,1]){g.beginPath();g.moveTo(s*R*.6,hy-R*.12);g.lineTo(s*R*.15,hy+R*.02);g.strokeStyle=a.eyes;g.lineWidth=2;g.stroke();glow(g,s*R*.38,hy-R*.04,R*.5,a.eyes,.7)}});
  g.fillStyle=INK;g.beginPath();g.moveTo(-R*.42,hy+R*.48);g.lineTo(R*.42,hy+R*.48);g.lineTo(R*.2,hy+R*.72);g.lineTo(-R*.2,hy+R*.72);g.fill();g.fillStyle='#fff';for(const s of[-1,1]){g.beginPath();g.moveTo(s*R*.32,hy+R*.48);g.lineTo(s*R*.24,hy+R*.66);g.lineTo(s*R*.16,hy+R*.48);g.fill()}
  neon(g,[-R*.2,hy+R*.88,0,hy+R*.98,R*.2,hy+R*.88],N,.7)}
 else if(a.mask=='void'){g.fillStyle='#03080a';ell(g,0,hy+1,hw*.8,hh*.82);g.fill();add(g,()=>{for(const s of[-1,1]){ell(g,s*R*.32,hy,R*.13,R*.08);g.fillStyle=a.eyes;g.fill();glow(g,s*R*.32,hy,R*.6,a.eyes,.9)}})}
 else if(a.mask=='screen'){g.fillStyle='#030a04';ell(g,0,hy+1,hw*.8,hh*.82);g.fill();add(g,()=>{g.fillStyle=rgba(a.eyes,.85);g.font='bold 5px monospace';g.fillText('>_',-R*.4,hy+R*.2);glow(g,0,hy,R*.8,a.eyes,.4)})}
 else if(a.mask=='menpo'){eyes(g,a,hy,R,0,1);celP(g,()=>{g.beginPath();g.moveTo(-hw*.9,hy+R*.15);g.lineTo(hw*.9,hy+R*.15);g.lineTo(hw*.6,hy+R*1.0);g.lineTo(-hw*.6,hy+R*1.0);g.closePath()},'#1a0a10',N,1.4);g.fillStyle='#e8e0d0';for(let i=-2;i<=2;i++){g.fillRect(i*R*.18-.6,hy+R*.42,1.2,R*.28)}}
 else{eyes(g,a,hy,R,0,a.brow);mouth(g,a,hy,R,a.brow?'snarl':'')}
 if(a.visor){add(g,()=>{const y=hy-R*.08;g.fillStyle=rgba(a.visor,.75);rr(g,-hw*1.02,y-R*.17,hw*2.04,R*.34,R*.17);g.fill();g.fillStyle=rgba('#ffffff',.85);g.fillRect(-hw*.8,y-R*.04,hw*.5,R*.06);glow(g,0,y,R*1.3,a.visor,.5)});g.strokeStyle=INK;g.lineWidth=1.3;rr(g,-hw*1.02,hy-R*.25,hw*2.04,R*.34,R*.17);g.stroke()}
 // hair / helmets front
 if(a.hs=='undercut'){celP(g,()=>{g.beginPath();g.moveTo(-hw*1.05,hy-R*.1);g.quadraticCurveTo(-hw*1.1,hy-hh*1.15,hw*.2,hy-hh*1.12);g.quadraticCurveTo(hw*1.4,hy-hh*.9,hw*1.3,hy+R*.55);g.quadraticCurveTo(hw*1.05,hy-R*.3,hw*.2,hy-R*.42);g.quadraticCurveTo(-hw*.6,hy-R*.6,-hw*1.05,hy-R*.1)},a.hair,'#ffd0f0',1.6);add(g,()=>glow(g,hw*.4,hy-R*.6,R*1.1,a.hair,.25))}
 else if(a.hs=='long'){celP(g,()=>{g.beginPath();g.arc(0,hy-.6,hw*1.12,Math.PI*.95,Math.PI*2.05);for(let i=7;i>=0;i--)g.lineTo(-hw*1.08+2.16*hw*i/7,hy-R*.45+(i%2?R*.14:0));g.closePath()},a.hair,null,1.5)}
 else if(a.hs=='bob'){celP(g,()=>{g.beginPath();g.arc(0,hy-.6,hw*1.16,Math.PI*.88,Math.PI*2.12);g.lineTo(hw*1.1,hy+R*.6);g.lineTo(hw*.8,hy+R*.6);g.lineTo(hw*.75,hy-R*.45);g.lineTo(-hw*.75,hy-R*.45);g.lineTo(-hw*.8,hy+R*.6);g.lineTo(-hw*1.1,hy+R*.6);g.closePath()},a.hair,N,1.5)}
 else if(a.hs=='helmet'){celP(g,()=>{g.beginPath();g.arc(0,hy-.5,hw*1.2,Math.PI*.9,Math.PI*2.1);g.lineTo(hw*1.1,hy+R*.5);g.lineTo(hw*.8,hy+R*.5);g.lineTo(hw*.8,hy-R*.35);g.lineTo(-hw*.8,hy-R*.35);g.lineTo(-hw*.8,hy+R*.5);g.lineTo(-hw*1.1,hy+R*.5);g.closePath()},a.armor,N,1.6)}
 else if(a.hs=='kabuto'){celP(g,()=>{g.beginPath();g.arc(0,hy-.5,hw*1.2,Math.PI*.95,Math.PI*2.05);g.closePath()},'#1a0a10',N,1.6);celP(g,()=>poly(g,[-hw*1.7,hy-R*.1,hw*1.7,hy-R*.1,hw*1.3,hy+R*.25,-hw*1.3,hy+R*.25]),'#2a0a14',N,1.4);kabuto(g,a,hy,R,N)}
 else if(a.hs=='mohawk')mohawk(g,a,hy,R);
 else if(a.hs=='band'){celP(g,()=>rr(g,-hw*1.05,hy-R*.62,hw*2.1,R*.32,1),a.neon,null,1.2);celP(g,()=>{g.beginPath();g.arc(0,hy-.6,hw*1.08,Math.PI*1.05,Math.PI*1.95);g.closePath()},a.hair,null,1.2)}
 else if(a.hs=='buzz'){g.fillStyle=rgba(a.hair,.5);g.beginPath();g.arc(0,hy-.6,hw*1.0,Math.PI,TAU);g.fill()}
 if(a.hs=='hood'){celP(g,()=>{g.beginPath();g.arc(0,hy+1.5,R*1.36,Math.PI*1.06,Math.PI*1.94);g.arc(0,hy+R*.22,R*1.04,Math.PI*1.9,Math.PI*1.1,true);g.closePath()},a.hood,N,1.4)}
 if(a.mask=='android'&&a.hs=='long'){celP(g,()=>{g.beginPath();g.arc(0,hy-.6,hw*1.12,Math.PI*1.0,Math.PI*1.35);g.lineTo(-hw*.3,hy-R*.55);g.closePath()},a.hair,null,1.3)}}
function eyes(g,a,hy,R,skip,angry){if(skip)return;const ex=R*.36,ey=hy+R*.04;
 for(const s of[-1,1]){ell(g,s*ex,ey,R*.2,R*.11);g.fillStyle='#f4eee8';g.fill();ell(g,s*ex+s*R*.02,ey+R*.01,R*.09,R*.09);g.fillStyle=a.eyes||'#3a2a1a';g.fill();ell(g,s*ex+s*R*.02,ey+R*.01,R*.045,R*.045);g.fillStyle=INK;g.fill();
  g.strokeStyle=INK;g.lineWidth=1.3;g.beginPath();g.ellipse(s*ex,ey,R*.21,R*.12,0,Math.PI*1.05,Math.PI*1.95);g.stroke();
  g.lineWidth=angry?2:1.4;g.lineCap='round';g.beginPath();if(angry){g.moveTo(s*ex*1.7,ey-R*.34);g.lineTo(s*ex*.35,ey-R*.16)}else{g.moveTo(s*ex*1.55,ey-R*.2);g.quadraticCurveTo(s*ex,ey-R*.34,s*ex*.45,ey-R*.24)}g.stroke()}
 g.strokeStyle=sh(a.skin,-.4);g.lineWidth=1;g.beginPath();g.moveTo(R*.05,hy+R*.14);g.lineTo(R*.1,hy+R*.42);g.lineTo(-R*.06,hy+R*.44);g.stroke()}
function mouth(g,a,hy,R,t){const my=hy+R*.66;g.strokeStyle=INK;g.lineWidth=1.3;g.lineCap='round';g.beginPath();
 if(t=='snarl'){g.moveTo(-R*.3,my);g.quadraticCurveTo(0,my-1.4,R*.3,my+1);g.stroke();g.fillStyle='#fff';g.fillRect(-R*.12,my-.4,R*.24,1.4)}
 else if(t=='grim'){g.moveTo(-R*.26,my+1);g.lineTo(R*.26,my+1);g.stroke()}
 else{g.moveTo(-R*.2,my);g.quadraticCurveTo(0,my+1.4,R*.2,my);g.stroke()}}
function mohawk(g,a,hy,R){for(let i=-2;i<=2;i++){const x=i*R*.19;celP(g,()=>poly(g,[x-R*.14,hy-R*.88+Math.abs(i)*1.4,x,hy-R*1.75+Math.abs(i)*3,x+R*.14,hy-R*.88+Math.abs(i)*1.4]),a.hair,null,1.1)}add(g,()=>glow(g,0,hy-R*1.3,R*1.1,a.hair,.4))}
function kabuto(g,a,hy,R,N){add(g,()=>{g.beginPath();g.moveTo(0,hy-R*.9);g.quadraticCurveTo(-R*1.4,hy-R*1.6,-R*1.9,hy-R*2.6);g.moveTo(0,hy-R*.9);g.quadraticCurveTo(R*1.4,hy-R*1.6,R*1.9,hy-R*2.6);g.strokeStyle=rgba(N,.35);g.lineWidth=6;g.lineCap='round';g.stroke();g.strokeStyle='#ffc0c8';g.lineWidth=2;g.stroke();glow(g,0,hy-R*1.1,R,N,.6)})}
/* ---- non-humanoids ---- */
function droneFig(g,a,f){const y=-36,sp=f/8*TAU;g.fillStyle='rgba(0,0,0,.35)';ell(g,0,0,13,4);g.fill();
 for(const[dx,dy]of[[-12,-7],[12,-7],[-12,7],[12,7]]){celC(g,0,y,dx,y+dy,3,'#33333f');add(g,()=>{ell(g,dx,y+dy,8,3.4);g.fillStyle='rgba(180,200,255,.14)';g.fill();g.strokeStyle='rgba(200,220,255,.35)';g.lineWidth=.6;g.beginPath();g.moveTo(dx+Math.cos(sp)*8,y+dy+Math.sin(sp)*3.4);g.lineTo(dx-Math.cos(sp)*8,y+dy-Math.sin(sp)*3.4);g.stroke()})}
 celE(g,0,y,9,7,a.c,a.eye);celE(g,0,y-1,5,4,'#3a3a4a');add(g,()=>{ell(g,0,y+2,3,2.4);g.fillStyle=a.eye;g.fill();glow(g,0,y+2,10,a.eye,.9);glow(g,0,0,12,a.eye,.3)})}
function microFig(g,a,f){const y=-32+Math.sin(f/8*TAU)*2;g.fillStyle='rgba(0,0,0,.3)';ell(g,0,0,8,3);g.fill();
 celP(g,()=>poly(g,[0,y+9,-9,y-6,0,y-2,9,y-6]),a.c,a.eye,1.6);add(g,()=>{glow(g,0,y+3,8,a.eye,.9);g.fillStyle='#fff';ell(g,0,y+3,1.4,1.4);g.fill();for(const s of[-1,1])glow(g,s*8,y-6,4,a.eye,.7)})}
function cubeFig(g,a,f){const t=f/8*TAU,y=-30+Math.sin(t)*2,s=9;g.fillStyle='rgba(0,0,0,.3)';ell(g,0,0,12,4);g.fill();
 const top=[0,y-s,s,y-s*.5,0,y,-s,y-s*.5],l=[-s,y-s*.5,0,y,0,y+s,-s,y+s*.5],r=[0,y,s,y-s*.5,s,y+s*.5,0,y+s];
 celP(g,()=>poly(g,l),sh(a.c,-.25),null,1.6);celP(g,()=>poly(g,r),sh(a.c2,-.2),null,1.6);celP(g,()=>poly(g,top),a.c,null,1.6);
 add(g,()=>{neon(g,[0,y,0,y+s],'#ffffff',.6);neon(g,[-s,y-s*.5,0,y,s,y-s*.5],a.c,.7);for(let i=0;i<4;i++){const an=t*1.5+i*1.57;glow(g,Math.cos(an)*14,y+Math.sin(an)*6,3,i%2?a.c:a.c2,.9)}})}
function mechFig(g,a,f){const ph=f/8*TAU,s1=Math.sin(ph),y=-44+Math.abs(s1)*-1.5;g.fillStyle='rgba(0,0,0,.4)';ell(g,0,0,20,6);g.fill();
 for(const s of[-1,1]){const lift=Math.max(0,s*s1)*5,kx=s*14,ky=-22-lift*.4;celC(g,s*8,y+10,kx,ky,6,'#3a3a44');celC(g,kx,ky,s*10,-4-lift,5,'#3a3a44');celP(g,()=>poly(g,[s*10-6,-lift,s*10+6,-lift,s*10+4,-5-lift,s*10-4,-5-lift]),'#2a2a32',null,1.4)}
 celP(g,()=>{g.beginPath();g.moveTo(-16,y-8);g.lineTo(16,y-8);g.lineTo(19,y+6);g.lineTo(12,y+14);g.lineTo(-12,y+14);g.lineTo(-19,y+6);g.closePath()},a.c,'#ff8a5a');
 for(const s of[-1,1]){celP(g,()=>rr(g,s*20-6,y-12,12,12,3),'#3a3a44',null,1.6);g.fillStyle=INK;for(let i=0;i<2;i++)for(let j=0;j<2;j++){ell(g,s*20-2.6+i*5.2,y-8.4+j*5,1.6,1.6);g.fill()}celC(g,s*18,y+6,s*20,y+20,4,'#2a2a32')}
 celP(g,()=>rr(g,-8,y-4,16,7,3),'#1a1a20',null,1.4);add(g,()=>{g.fillStyle=a.eye;g.fillRect(-6,y-2,12,3);glow(g,0,y,14,a.eye,.8)});g.fillStyle='#ffcf2a';for(let i=-2;i<=2;i++)g.fillRect(i*5-1,y+10,2.5,2)}
/* ---- sprite cache ---- */
const SP={};
function spr(a,f,back,z){const k=a.id+f+(back?'b':'f')+z;let c=SP[k];if(c)return c;const r=mk(140,170,z);c=r[0];const g=r[1];g.translate(70,150);fig(g,a,f,back);
 if(a.holo){g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='destination-out';g.fillStyle='rgba(0,0,0,.45)';for(let y=0;y<c.height;y+=Math.max(2,z*1.4|0))g.fillRect(0,y,c.width,Math.max(1,z*.5|0));g.globalCompositeOperation='source-atop';g.fillStyle=rgba(a.neon||'#3aff9a',.12);g.fillRect(0,0,c.width,c.height)}
 return SP[k]=c}
function drawFig(g,a,x,feet,s,f,back,z,sx=1,sy=1){const c=spr(a,((f%8)+8)%8,back,z);g.drawImage(c,x-70*s*sx,feet-150*s*sy,140*s*sx,170*s*sy)}

/* ================= projectiles / pickups sprites ================= */
const PS={};
function pspr(k){if(PS[k])return PS[k];const[c,g]=mk(48,48,3);g.translate(24,24);
 const core=(col,r)=>{glow(g,0,0,r*3.2,col);ell(g,0,0,r,r);g.fillStyle='#fff';g.fill()};
 switch(k){
  case'dart':glow(g,0,4,16,'#3ff0ff');g.beginPath();g.moveTo(0,-14);g.lineTo(2.4,-4);g.lineTo(1.4,12);g.lineTo(-1.4,12);g.lineTo(-2.4,-4);g.closePath();g.fillStyle='#e8ffff';g.fill();break;
  case'rail':glow(g,0,0,16,'#ffd84a');g.fillStyle='#fffbe0';g.fillRect(-1.6,-20,3.2,40);glow(g,0,-16,8,'#fff');break;
  case'slug':glow(g,0,0,18,'#ff8a2a');ell(g,0,0,5,7);g.fillStyle='#ffe0b0';g.fill();g.strokeStyle='#ff8a2a';g.lineWidth=1.5;g.stroke();break;
  case'plasma':glow(g,0,0,19,'#ff2ad8');glow(g,0,0,9,'#ffc0f0');ell(g,0,0,3.6,3.6);g.fillStyle='#fff';g.fill();break;
  case'seeker':glow(g,0,0,15,'#3aff9a');poly(g,[0,-8,5,4,0,1,-5,4]);g.fillStyle='#d8ffe8';g.fill();break;
  case'eb':glow(g,0,0,15,'#ff1a5a');ell(g,0,0,5.4,5.4);g.fillStyle='#ffd0e0';g.fill();g.strokeStyle='#ff1a5a';g.lineWidth=1.6;g.stroke();break;
  case'eb2':glow(g,0,0,15,'#ffb81a');ell(g,0,0,5,5);g.fillStyle='#fff0c0';g.fill();g.strokeStyle='#ff8a1a';g.lineWidth=1.6;g.stroke();break;
  case'eb3':glow(g,0,0,15,'#c03aff');poly(g,[0,-6,6,0,0,6,-6,0]);g.fillStyle='#f0d0ff';g.fill();g.strokeStyle='#c03aff';g.lineWidth=1.4;g.stroke();break;
  case'ea':glow(g,0,0,13,'#ff2a3a');g.fillStyle='#ffd0d0';g.fillRect(-1.4,-11,2.8,22);break;
  case'coin':glow(g,0,0,14,'#ffd84a',.6);poly(g,[0,-8,7,-4,7,4,0,8,-7,4,-7,-4]);g.fillStyle='#ffcf3a';g.fill();g.strokeStyle=INK;g.lineWidth=1.4;g.stroke();poly(g,[0,-4,3.5,-2,3.5,2,0,4,-3.5,2,-3.5,-2]);g.fillStyle='#fff3b0';g.fill();break;
  case'heal':glow(g,0,0,18,'#ff3a6a',.9);heart(g,0,1,8);g.fillStyle='#ff4a7a';g.fill();g.strokeStyle=INK;g.lineWidth=1.5;g.stroke();break;
  case'shield':glow(g,0,0,18,'#3ac8ff',.9);g.beginPath();for(let i=0;i<6;i++){const an=i/6*TAU+Math.PI/6;g.lineTo(Math.cos(an)*9,Math.sin(an)*9)}g.closePath();g.fillStyle='#4ad8ff';g.fill();g.strokeStyle=INK;g.lineWidth=1.5;g.stroke();break;
  case'over':glow(g,0,0,18,'#ffd84a',.9);poly(g,[2,-10,-6,2,-1,2,-3,10,6,-2,1,-2]);g.fillStyle='#fff3a0';g.fill();g.strokeStyle=INK;g.lineWidth=1.4;g.stroke();break;
  case'chrono':glow(g,0,0,18,'#7a8aff',.9);ell(g,0,0,8,8);g.fillStyle='#c8d0ff';g.fill();g.strokeStyle=INK;g.lineWidth=1.4;g.stroke();g.beginPath();g.moveTo(0,-5);g.lineTo(0,0);g.lineTo(4,2);g.stroke();break;
  case'magnet':glow(g,0,0,18,'#ff5a5a',.9);g.beginPath();g.arc(0,0,7,Math.PI,0);g.lineTo(7,6);g.lineTo(3,6);g.lineTo(3,0);g.arc(0,0,3,0,Math.PI,true);g.lineTo(-3,6);g.lineTo(-7,6);g.closePath();g.fillStyle='#ff6a6a';g.fill();g.strokeStyle=INK;g.lineWidth=1.3;g.stroke();break;
  case'nuke':glow(g,0,0,20,'#ffffff',.9);ell(g,0,0,8,8);g.fillStyle='#ffe04a';g.fill();g.strokeStyle=INK;g.lineWidth=1.4;g.stroke();g.fillStyle=INK;for(let i=0;i<3;i++){g.beginPath();g.moveTo(0,0);g.arc(0,0,6.5,i*2.094-.45,i*2.094+.45);g.fill()}break;
  case'virus':glow(g,0,0,19,'#ff1a3a',.9);g.save();g.rotate(.785);cut(g,-7,-7,14,14,3);g.fillStyle='#2a0008';g.fill();g.strokeStyle='#ff2a4a';g.lineWidth=1.8;g.stroke();g.restore();g.fillStyle='#ff4a5a';g.font='bold 10px monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('!',0,1);break;}
 return PS[k]=c}
function dp(g,k,x,y,s=1,rot=0){const c=pspr(k);if(rot){g.save();g.translate(x,y);g.rotate(rot);g.drawImage(c,-24*s,-24*s,48*s,48*s);g.restore()}else g.drawImage(c,x-24*s,y-24*s,48*s,48*s)}

/* ================= neon city districts ================= */
const DIST=[
 {n:'NEON BOULEVARD',road:'#15121f',line:'#ff2a8a',neon:['#ff2a8a','#3ff0ff','#ffd84a','#a05aff'],roof:['#1d1932','#231d3c','#18142a','#211a30'],tint:'#ff2a8a',wx:'rain'},
 {n:'CHROME DOCKS',road:'#0f1a1f',line:'#3ff0ff',neon:['#3ff0ff','#ff8a2a','#e8f8ff','#3a8aff'],roof:['#17262c','#1d2e35','#132026','#1a2a30'],tint:'#3ff0ff',wx:'rain'},
 {n:'TOXIC UNDERCITY',road:'#0d150e',line:'#7aff3a',neon:['#7aff3a','#ff3ad8','#3affd0','#d8ff3a'],roof:['#152015','#1b2919','#111a11','#18241a'],tint:'#7aff3a',wx:'spores'},
 {n:'CORPORATE SPIRE',road:'#1a140f',line:'#ffb03a',neon:['#ffb03a','#ff3a3a','#fff0c0','#ff6a2a'],roof:['#2a2018','#31271d','#221a12','#2c2219'],tint:'#ffb03a',wx:'embers'}];
const TH=768,RW0=50,RW1=310,BGC={},RFC={};
function srand(s){return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function makeRoad(di){if(BGC[di])return BGC[di];const D=DIST[di],[c,g]=mk(W,TH,2),r=srand(11+di*7),R=(a,b)=>a+r()*(b-a);
 const wr=(y,m,fn)=>{fn(y);if(y<m)fn(y+TH);if(y>TH-m)fn(y-TH)};
 g.fillStyle=D.road;g.fillRect(0,0,W,TH);
 for(let i=0;i<2600;i++){const x=R(0,W),y=R(0,TH),a=R(.02,.07);g.fillStyle=r()<.5?rgba('#ffffff',a):rgba('#000000',a*2);g.fillRect(x,y,R(.6,1.6),R(.6,1.6))}
 // wet patches with neon reflections
 for(let i=0;i<16;i++){const x=R(RW0+10,RW1-10),y=R(0,TH),w=R(14,46),h=R(30,90),col=pick(D.neon);
  wr(y,h,yy=>{const q=g.createLinearGradient(0,yy-h/2,0,yy+h/2);q.addColorStop(0,rgba(col,0));q.addColorStop(.5,rgba(col,.14));q.addColorStop(1,rgba(col,0));g.fillStyle=q;ell(g,x,yy,w/2,h/2);g.fill();g.fillStyle='rgba(0,0,0,.25)';ell(g,x,yy,w*.45,h*.42);g.fill();
   g.globalCompositeOperation='lighter';g.fillStyle=rgba(col,.18);for(let k=0;k<3;k++)g.fillRect(x-w*.3+k*w*.25,yy-h*.4,1.2,h*.8);g.globalCompositeOperation='source-over'})}
 // sidewalks
 for(const[x0,x1]of[[0,RW0],[RW1,W]]){g.fillStyle=sh(D.road,.08);g.fillRect(x0,0,x1-x0,TH);g.strokeStyle='rgba(255,255,255,.05)';g.lineWidth=1;for(let y=0;y<TH;y+=16){g.beginPath();g.moveTo(x0,y);g.lineTo(x1,y);g.stroke()}}
 // curb neon strips
 for(const x of[RW0,RW1]){g.globalCompositeOperation='lighter';const q=g.createLinearGradient(x-8,0,x+8,0);q.addColorStop(0,rgba(D.line,0));q.addColorStop(.5,rgba(D.line,.35));q.addColorStop(1,rgba(D.line,0));g.fillStyle=q;g.fillRect(x-8,0,16,TH);g.fillStyle=D.line;g.fillRect(x-.8,0,1.6,TH);g.globalCompositeOperation='source-over'}
 // lane dashes
 for(const x of[RW0+(RW1-RW0)/3,RW0+(RW1-RW0)*2/3])for(let y=0;y<TH;y+=48){g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',.08);g.fillRect(x-4,y,8,26);g.fillStyle=rgba(D.line,.55);g.fillRect(x-1.2,y,2.4,26);g.globalCompositeOperation='source-over'}
 // crosswalk + manholes + cracks
 const cy=R(100,TH-140);for(let i=0;i<9;i++){g.fillStyle='rgba(230,230,240,.1)';g.fillRect(RW0+12+i*28,cy,16,40)}
 for(let i=0;i<4;i++){const x=R(RW0+20,RW1-20),y=R(0,TH);wr(y,10,yy=>{ell(g,x,yy,9,9);g.fillStyle='#0a0a10';g.fill();g.strokeStyle='rgba(255,255,255,.12)';g.lineWidth=1;g.stroke();for(let k=-2;k<=2;k++){g.beginPath();g.moveTo(x-7,yy+k*3);g.lineTo(x+7,yy+k*3);g.stroke()}})}
 for(let i=0;i<14;i++){let x=R(RW0,RW1),y=R(0,TH);g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=.8;g.beginPath();g.moveTo(x,y);for(let k=0;k<5;k++){x+=R(-8,8);y+=R(3,10);g.lineTo(x,y)}g.stroke()}
 return BGC[di]=c}
function makeRoofs(di){if(RFC[di])return RFC[di];const D=DIST[di],[c,g]=mk(W,TH,2),r=srand(91+di*13),R=(a,b)=>a+r()*(b-a),signs=[];
 for(const side of[0,1]){let y=0;while(y<TH){const h=Math.min(R(70,150),TH-y),w=R(30,46),x=side?W-w:0,col=pick(D.roof);
   // roof slab
   g.fillStyle='rgba(0,0,0,.55)';g.fillRect(side?x-7:x+w,y+4,7,h-4);
   g.fillStyle=col;g.fillRect(x,y+1,w,h-2);g.fillStyle=sh(col,.12);g.fillRect(x,y+1,w,2.5);g.fillRect(side?x:x+w-2.5,y+1,2.5,h-2);g.fillStyle=sh(col,-.35);g.fillRect(x,y+h-3,w,2);
   g.strokeStyle=INK;g.lineWidth=1.4;g.strokeRect(x+.7,y+1.7,w-1.4,h-3.4);
   // details
   const n=2+(r()*3|0);for(let i=0;i<n;i++){const t=r(),dx=x+R(4,w-16),dy=y+R(8,h-18);
    if(t<.3){g.fillStyle='#2a2a34';g.fillRect(dx,dy,12,10);g.strokeStyle=INK;g.strokeRect(dx,dy,12,10);ell(g,dx+6,dy+5,3.6,3.6);g.fillStyle='#16161c';g.fill();g.strokeStyle='#4a4a56';g.lineWidth=.8;g.beginPath();g.moveTo(dx+3,dy+5);g.lineTo(dx+9,dy+5);g.moveTo(dx+6,dy+2);g.lineTo(dx+6,dy+8);g.stroke();g.lineWidth=1.4}
    else if(t<.5){ell(g,dx+6,dy+6,7,7);g.fillStyle='#3a3440';g.fill();g.strokeStyle=INK;g.stroke();ell(g,dx+4.5,dy+4.5,3,3);g.fillStyle='rgba(255,255,255,.12)';g.fill()}
    else if(t<.7){g.fillStyle='#1a2236';g.fillRect(dx,dy,14,10);g.strokeStyle='rgba(120,160,255,.35)';g.lineWidth=.6;for(let k=1;k<4;k++){g.beginPath();g.moveTo(dx+k*3.5,dy);g.lineTo(dx+k*3.5,dy+10);g.stroke()}g.lineWidth=1.4}
    else{g.strokeStyle='#5a5a66';g.lineWidth=1.2;g.beginPath();g.moveTo(dx+4,dy+10);g.lineTo(dx+4,dy-6);g.stroke();signs.push({x:dx+4,y:dy-6,w:0,h:0,c:'#ff2a2a',blink:1});g.lineWidth=1.4}}
   // neon sign on edge facing road
   if(r()<.75){const sw=R(6,9),sh2=R(24,Math.min(60,h-14)),sx=side?x-1:x+w-sw+1,sy=y+R(6,h-sh2-6),sc=pick(D.neon);
    g.fillStyle='#0a0810';g.fillRect(sx,sy,sw,sh2);g.strokeStyle=INK;g.strokeRect(sx,sy,sw,sh2);
    g.globalCompositeOperation='lighter';for(let k=0;k<sh2-6;k+=7){const gl=r();g.fillStyle=rgba(sc,.85);if(gl<.33)g.fillRect(sx+2,sy+3+k,sw-4,1.4),g.fillRect(sx+sw/2-.7,sy+3+k,1.4,5);else if(gl<.66)g.fillRect(sx+2,sy+3+k,1.4,5),g.fillRect(sx+2,sy+5+k,sw-4,1.4);else g.fillRect(sx+2,sy+4+k,sw-4,3)}g.globalCompositeOperation='source-over';
    signs.push({x:sx+sw/2,y:sy+sh2/2,w:sw,h:sh2,c:sc})}
   y+=h}}
 c.signs=signs;return RFC[di]=c}
let VG=null,SCAN=null;
function makeVG(){const[c,g]=mk(W,H,1);let q=g.createRadialGradient(W/2,H*.55,H*.22,W/2,H*.55,H*.78);q.addColorStop(0,'rgba(4,2,10,0)');q.addColorStop(1,'rgba(4,2,10,.72)');g.fillStyle=q;g.fillRect(0,0,W,H);VG=c;
 const[s2,g2]=mk(W,H,1);g2.fillStyle='rgba(0,0,0,.09)';for(let y=0;y<H;y+=3)g2.fillRect(0,y,W,1);SCAN=s2}
