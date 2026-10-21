'use strict';
const $=id=>document.getElementById(id),cv=$('c'),X=cv.getContext('2d');
const TAU=Math.PI*2,cl=(v,a,b)=>v<a?a:v>b?b:v,rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0],lerp=(a,b,k)=>a+(b-a)*k;
let W=360,H=640,S=1,DPR=1,VG=null;
const LS={get(k,d){try{const v=localStorage.getItem('rr_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('rr_'+k,JSON.stringify(v))}catch(e){}}};
let coins=LS.get('coins',0),best=LS.get('best',0),bestSt=LS.get('bestSt',0),owned=LS.get('owned',['human']),sel=LS.get('sel','human'),muted=false,view=sel;
let SET=Object.assign({sfx:true,mus:true,hapt:true,shake:true},LS.get('set',{}));muted=!SET.sfx;
let META=LS.get('meta',{}),seen=LS.get('seen',{}),daily=LS.get('daily',{d:'',s:0});const ml=k=>META[k]||0;

/* =================== HEROES (balanced: see BAL notes) =================== */
const RACES=[
{id:'human',n:'Knight',race:'HUMAN',cost:0,hp:3,rate:5.9,dmg:1,proj:'bolt',pc:'#ffd84a',ab:'Rapid fire',desc:'Steel-clad crossbowman. Fast, steady volleys.',
 skin:'#e7b38c',hair:'#5a321c',hs:'helm',ast:'plate',armor:'#b9c2cc',skirt:'#a3acb7',cloth:'#2c3656',boots:'#4a3020',legm:'#a8b1bc',paul:'#c8d0d9',gaunt:'#b0b8c2',tabard:'#2a58c0',emblem:'#f0c64a',plume:'#d42a36',eyes:'#4a7ab8',wpn:'xbow'},
{id:'elf',n:'Ranger',race:'ELF',cost:200,hp:3,rate:4.6,dmg:1,pierce:1,proj:'arrow',pc:'#7dff9a',ab:'Pierces 2 foes',desc:'Forest archer. Arrows pass through enemies.',
 skin:'#f3d3b0',hair:'#ecd27a',hs:'long',ears:1,ast:'leather',armor:'#3f7a3a',skirt:'#5a4428',cloth:'#4a3a24',boots:'#3a2a18',bracer:'#6a4a2a',cape:'#1f5230',eyes:'#3aaf6a',wpn:'bow',quiver:1},
{id:'orc',n:'Warlord',race:'ORC',cost:450,hp:4,rate:1.7,dmg:2.5,big:5,proj:'axe',pc:'#ffb04a',ab:'Heavy axes',desc:'Brutal berserker. Huge hits, thick hide.',
 skin:'#6f9e45',hair:'#1e1e1e',hs:'knot',tusks:1,brow:1,ast:'bare',armor:'#6f9e45',strap:'#5a3a22',skirt:'#5a3a22',cloth:'#3a2a1a',boots:'#2e2014',paul:'#8a9098',spikes:1,bracer:'#5a3a22',bulk:1.2,eyes:'#ffcf3a',mouth:'frown',wpn:'axe'},
{id:'demon',n:'Infernal',race:'DEMON',cost:800,hp:3,rate:4.4,dmg:.9,burn:1.7,proj:'fire',pc:'#ff6a1a',ab:'Burns foes',desc:'Hellborn sorcerer. Fire that keeps burning.',
 skin:'#c43a2c',hair:'#1a0808',hs:'spiky',horns:1,wings:1,tail:1,brow:1,ast:'dark',armor:'#2a0e14',skirt:'#3a1218',cloth:'#1e0a0e',boots:'#140608',paul:'#3a1a1e',trim:'#e0a040',eyes:'#ffd23a',mouth:'fang',wpn:'fire'},
{id:'undead',n:'Lich',race:'UNDEAD',cost:1200,hp:2,rate:3.6,dmg:1.1,revive:1,home:1,proj:'orb',pc:'#3ff0ff',ab:'Revives + homing',desc:'Deathless mage. Seeking orbs, rises once.',
 skin:'#d9d6cc',hs:'hood',hood:'#34324e',robe:'#2a2840',trim:'#8a7cd0',skull:1,eyes:'#5ff',wpn:'staff',orb:'#3ff0ff'}];
/* enemy rigs */
const RG={
imp:{id:'imp',skin:'#9a58d0',hs:'none',horns:2,ears:2,ast:'bare',armor:'#9a58d0',skirt:'#3d2257',cloth:'#2a173d',boots:'#1a0e26',eyes:'#ffe14a',brow:1,bulk:.85,tall:.82,wpn:'claws',tail:1,mouth:'fang',bare:1},
gob:{id:'gob',skin:'#57a882',hair:'#241418',hs:'mohawk',ears:2,ast:'leather',armor:'#6a3e2a',skirt:'#4a2e1e',cloth:'#3a2a1a',boots:'#2a1a10',eyes:'#ff4a3a',brow:1,tall:.86,wpn:'dagger',mouth:'grin'},
bomber:{id:'bomber',skin:'#5aa070',hair:'#c83a1a',hs:'band',ears:2,ast:'leather',armor:'#8a5a2a',skirt:'#5a3a1a',cloth:'#3a2a1a',boots:'#2a1a10',eyes:'#ffd03a',brow:1,tall:.86,wpn:'bomb',mouth:'grin'},
skel:{id:'skel',skin:'#e6dfcb',hs:'none',ast:'ribs',bones:1,skull:1,eyes:'#ff5a3a',bulk:.9,wpn:'bow',armor:'#e6dfcb',skirt:'#4a3a2a',cloth:'#4a3a2a',boots:'#e6dfcb'},
brute:{id:'brute',skin:'#8a7aa8',hs:'none',ast:'bare',armor:'#8a7aa8',strap:'#4a3a2a',skirt:'#4a3a2a',cloth:'#2e2418',boots:'#1e160e',paul:'#767680',spikes:1,eyes:'#ff5a3a',brow:1,bulk:1.4,wpn:'club',tusks:1,mouth:'frown'},
dknight:{id:'dknight',skin:'#555',hs:'greathelm',ast:'plate',armor:'#4a4e5a',skirt:'#3a3e48',cloth:'#22242c',boots:'#1a1a20',legm:'#4a4e5a',paul:'#5a5e6a',gaunt:'#4a4e5a',tabard:'#6a1020',emblem:'#c0c0c0',eyes:'#ff3a3a',bulk:1.08,wpn:'shield'},
dknight2:{id:'dknight2',skin:'#555',hs:'greathelm',ast:'plate',armor:'#4a4e5a',skirt:'#3a3e48',cloth:'#22242c',boots:'#1a1a20',legm:'#4a4e5a',paul:'#5a5e6a',gaunt:'#4a4e5a',tabard:'#6a1020',emblem:'#c0c0c0',eyes:'#ff3a3a',bulk:1.08,wpn:'sword'},
necro:{id:'necro',skin:'#9aa890',hs:'hood',hood:'#1e2a1e',robe:'#26301e',trim:'#6aff6a',eyes:'#7aff5a',skull:1,wpn:'staff',orb:'#5aff4a'},
bat:{id:'bat',kind:'bat'},slime:{id:'slime',kind:'slime',c:'#5ad04a'},slimeS:{id:'slimeS',kind:'slime',c:'#7ae05a'},
ogre:{id:'ogre',skin:'#b0283a',hs:'none',horns:1,hornC:'#efe2c4',ast:'bare',armor:'#b0283a',strap:'#3a1810',skirt:'#2a0c18',cloth:'#1a060e',boots:'#120408',paul:'#e0b040',crown:1,spikes:1,eyes:'#ffe14a',brow:1,bulk:1.5,wpn:'cleaver',tusks:1,mouth:'frown'},
bonelord:{id:'bonelord',skin:'#e6dfcb',hs:'greathelm',ast:'ribs',bones:1,skull:1,eyes:'#5ae0ff',bulk:1.35,armor:'#e6dfcb',skirt:'#2a2a38',cloth:'#2a2a38',boots:'#e6dfcb',paul:'#3a3a4a',spikes:1,horns:1,hornC:'#e6dfcb',wpn:'greatsword'},
demonlord:{id:'demonlord',skin:'#8a1a2a',hair:'#100404',hs:'none',horns:1,hornC:'#2a1010',wings:1,tail:1,brow:1,ast:'dark',armor:'#1a0608',skirt:'#2a0a0e',cloth:'#140406',boots:'#0a0204',paul:'#3a1418',trim:'#ff8a2a',crown:1,eyes:'#ffd23a',mouth:'fang',bulk:1.4,wpn:'fire'}};

/* =================== drawing helpers =================== */
const OL='rgba(16,9,24,.9)';
const rgb=c=>{const n=parseInt(c.slice(1,7),16);return[n>>16,n>>8&255,n&255]};
const rgba=(c,a)=>{const[r,g,b]=rgb(c);return`rgba(${r},${g},${b},${a})`};
const sh=(c,f)=>{const[r,g,b]=rgb(c),m=f>0?255:0,a=Math.abs(f),q=v=>v+(m-v)*a|0;return`rgb(${q(r)},${q(g)},${q(b)})`};
const hx=c=>{const[r,g,b]=rgb(c);return c};
function mk(w,h,z){const c=document.createElement('canvas');c.width=Math.ceil(w*z);c.height=Math.ceil(h*z);const g=c.getContext('2d');g.scale(z,z);return[c,g]}
function ell(g,x,y,rx,ry,rot=0){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,TAU)}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function lin(g,x0,x1,c,k=1){const q=g.createLinearGradient(x0,0,x1,0);q.addColorStop(0,sh(c,.3*k));q.addColorStop(.42,c);q.addColorStop(.85,sh(c,-.38*k));q.addColorStop(1,sh(c,-.22*k));return q}
function vlin(g,y0,y1,c){const q=g.createLinearGradient(0,y0,0,y1);q.addColorStop(0,sh(c,.25));q.addColorStop(1,sh(c,-.35));return q}
function rad(g,x,y,r,c){const q=g.createRadialGradient(x-r*.35,y-r*.4,r*.05,x,y,r*1.1);q.addColorStop(0,sh(c,.5));q.addColorStop(.5,c);q.addColorStop(1,sh(c,-.5));return q}
function fo(g,fill,lw=1.3){g.fillStyle=fill;g.fill();if(lw){g.lineWidth=lw;g.lineJoin='round';g.strokeStyle=OL;g.stroke()}}
function cap(g,x1,y1,x2,y2,w,c,ol=1){g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);if(ol){g.strokeStyle=OL;g.lineWidth=w+2.4;g.stroke()}const m=(x1+x2)/2;g.strokeStyle=lin(g,m-w/2,m+w/2,c);g.lineWidth=w;g.stroke()}
function spec(g,x,y,w,h,a=.5){const q=g.createLinearGradient(x-w,0,x+w,0);q.addColorStop(0,'rgba(255,255,255,0)');q.addColorStop(.5,'rgba(255,255,255,'+a+')');q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;ell(g,x,y,w,h);g.fill()}
const GS={};
function glowS(c){if(GS[c])return GS[c];const[cc,g]=mk(64,64,1);const q=g.createRadialGradient(32,32,0,32,32,32);q.addColorStop(0,rgba(c,1));q.addColorStop(.22,rgba(c,.65));q.addColorStop(.55,rgba(c,.18));q.addColorStop(1,rgba(c,0));g.fillStyle=q;g.fillRect(0,0,64,64);return GS[c]=cc}
function glow(g,x,y,r,c,a=1){const o=g.globalAlpha;g.globalAlpha=o*a;g.drawImage(glowS(c),x-r,y-r,r*2,r*2);g.globalAlpha=o}
function heart(g,x,y,r){g.beginPath();g.moveTo(x,y+r*.95);g.bezierCurveTo(x-r*1.7,y-r*.1,x-r*.95,y-r*1.35,x,y-r*.45);g.bezierCurveTo(x+r*.95,y-r*1.35,x+r*1.7,y-r*.1,x,y+r*.95);g.closePath()}

/* =================== realistic humanoid rig (3/4 view) =================== */
function fig(g,a,f,back){
 if(a.kind=='bat')return batFig(g,a,f);if(a.kind=='slime')return slimeFig(g,a,f);
 const bw=a.bulk||1,hk=a.tall||1,ph=f/8*TAU,s1=Math.sin(ph),bob=-Math.abs(Math.sin(ph))*1.3*hk,
  hipY=-30*hk+bob,waY=-38*hk+bob,shY=-57*hk+bob,shX=13.5*bw,waX=9.6*bw,chX=12.6*bw,R=9.6*(1+(bw-1)*.32),hy=-70.5*hk+bob*1.05,B=a.bones?.55:1;
 g.fillStyle='rgba(0,0,0,.3)';ell(g,0,0,17*bw,5.5);g.fill();
 if(a.wings)wings(g,a,shY,f);
 if(a.cape&&!back)cape(g,a,shY,shX,0);
 if(a.tail&&!back)tail(g,a,hipY);
 if(!a.robe)for(const s of[-1,1]){const lift=Math.max(0,s*s1)*4.2*hk,ax=s*5.6*bw,ay=-5-lift,kx=s*5.9*bw,ky=(hipY+ay)/2-lift*.15;
  cap(g,s*5.1*bw,hipY,kx,ky,7.8*bw*B,a.bones?a.skin:a.cloth);
  cap(g,kx,ky,ax,ay,6.6*bw*B,a.bones?a.skin:(a.legm||a.cloth));
  if(a.legm){ell(g,kx,ky,3.8*bw,3.2);fo(g,rad(g,kx,ky,3.8,a.legm),1.1);spec(g,ax-1.5*s,(ky+ay)/2,1,4,.45)}
  if(a.bones){ell(g,kx,ky,2.6,2.4);fo(g,rad(g,kx,ky,2.6,a.skin),1);ell(g,ax,ay+3,3.6,2.4);fo(g,rad(g,ax,ay+3,3.6,a.skin),1)}
  else{cap(g,ax,ay-4,ax,ay+.5,7*bw,a.boots);ell(g,ax,ay+3.2,4.8*bw,3.3);fo(g,rad(g,ax,ay+2,4.8,a.boots),1.2);g.fillStyle=rgba('#ffffff',.12);g.fillRect(ax-3*bw,ay-4.5,6*bw,1.3)}}
 if(a.tail&&back)tail(g,a,hipY);
 if(back&&a.wpn=='xbow')xbowBack(g,shY);
 if(a.robe)robe(g,a,shY,waY,shX,back);
 else{
  // hip skirt / tassets
  g.beginPath();g.moveTo(-waX-.5,waY);g.lineTo(waX+.5,waY);g.lineTo(waX+3*bw,hipY+5);g.quadraticCurveTo(0,hipY+8,-waX-3*bw,hipY+5);g.closePath();fo(g,lin(g,-waX-3,waX+3,a.skirt));
  if(a.ast=='plate'){g.strokeStyle=rgba('#000000',.3);g.lineWidth=.9;g.beginPath();for(const k of[.35,.7]){const y=lerp(waY,hipY+6,k);g.moveTo(-waX-k*3,y);g.quadraticCurveTo(0,y+2,waX+k*3,y)}g.moveTo(0,waY+1);g.lineTo(0,hipY+7);g.stroke()}
  if(a.ast=='ribs'){g.fillStyle=a.skin;ell(g,0,hipY+1,7*bw,3.5);fo(g,rad(g,0,hipY,7,a.skin),1)}
  torso(g,a,back,shY,waY,shX,waX,chX,bw);}
 if(a.cape&&back)cape(g,a,shY,shX,1);
 if(a.quiver&&back){cap(g,-8,shY+20,5,shY-7,6.4,'#6a4424');g.fillStyle='#c8e0a0';for(let i=0;i<3;i++){g.beginPath();g.moveTo(3+i*2.2,shY-6);g.lineTo(5+i*2.2,shY-14);g.lineTo(7+i*2.2,shY-6);g.closePath();fo(g,'#bfe8a8',.8)}}
 g.fillStyle='rgba(0,0,0,.22)';ell(g,0,shY+2,R*.75,3);g.fill();
 cap(g,0,shY+1,0,hy+R*.6,6.4*(a.bones?.6:1),a.skin);
 const P=pose(a.wpn,back,shY,shX,hk);
 if(P.pre)weapon(g,a,a.wpn,back,P,shY,hk,0);
 arm(g,a,-1,P.l[0],P.l[1],shY,shX,bw,hk);arm(g,a,1,P.r[0],P.r[1],shY,shX,bw,hk);
 if(a.paul)for(const s of[-1,1]){ell(g,s*shX,shY+2,7.6*bw,5.6);fo(g,rad(g,s*shX,shY+1,7.6*bw,a.paul),1.2);ell(g,s*(shX+1),shY+6,6*bw,3.4);fo(g,rad(g,s*shX,shY+6,6,sh(a.paul,-.1)),1);spec(g,s*shX-2,shY-.5,3.2,1.4,.55);
  if(a.spikes){g.beginPath();g.moveTo(s*shX-3,shY-2);g.lineTo(s*(shX+3),shY-14);g.lineTo(s*shX+3.2,shY-2.6);g.closePath();fo(g,lin(g,s*shX-4,s*shX+4,'#ece4d0'),1)}}
 weapon(g,a,a.wpn,back,P,shY,hk,1);
 for(const h of[P.l,P.r]){ell(g,h[0],h[1],3.5*bw,3.5*bw);fo(g,rad(g,h[0],h[1],3.6,a.gaunt||a.skin),1.1)}
 weapon(g,a,a.wpn,back,P,shY,hk,2);
 head(g,a,back,hy,R)}
function pose(w,back,shY,shX,hk){const y=shY;
 switch(w){
  case'xbow':return back?{l:[-6,y+3],r:[6,y+3],pre:1}:{l:[-6,y+10],r:[6,y+10]};
  case'bow':return{l:[-22,y-1],r:[-7,y+2]};
  case'axe':return{l:[7,y+15],r:[14,y+5]};
  case'fire':return{l:[-shX-5,y-2],r:[shX+5,y-2]};
  case'staff':return{l:[-9,y+13],r:[shX+3,y+9]};
  case'claws':return{l:[-shX-4,y+1],r:[shX+4,y+1]};
  case'dagger':return{l:[-shX-1,y+20],r:[shX+1,y+13]};
  case'bomb':return{l:[-5,y+12],r:[5,y+12]};
  case'club':return{l:[-shX-1,y+20],r:[shX+1,y+11]};
  case'cleaver':case'greatsword':return{l:[-shX-1,y+20],r:[shX+2,y+11]};
  case'shield':return{l:[-9,y+12],r:[shX+1,y+14]};
  case'sword':return{l:[-shX-1,y+20],r:[shX+1,y+13]};}
 return{l:[-shX-2,y+20],r:[shX+2,y+20]}}
function arm(g,a,s,hx,hy,shY,shX,bw,hk){const sx=s*shX,sy=shY+3,d=Math.hypot(hx-sx,hy-sy),L=12*hk,bend=Math.max(0,2*L-d)*.7,mx=(sx+hx)/2+s*bend*.85,my=(sy+hy)/2+bend*.3,B=a.bones?.55:1;
 const sl=a.robe||(a.ast=='bare'?a.skin:a.ast=='ribs'?a.skin:sh(a.armor,-.06));
 cap(g,sx,sy,mx,my,6.6*bw*B,sl);cap(g,mx,my,hx,hy,5.8*bw*B,a.gaunt||a.bracer?sl:(a.robe?sh(a.robe,-.1):sl));
 if(a.bones){ell(g,mx,my,2.4,2.4);fo(g,rad(g,mx,my,2.4,a.skin),.9)}
 if(a.bracer||a.gaunt){const c=a.gaunt||a.bracer;cap(g,lerp(mx,hx,.3),lerp(my,hy,.3),lerp(mx,hx,.82),lerp(my,hy,.82),6.6*bw,c);if(a.gaunt)spec(g,lerp(mx,hx,.55)-1,lerp(my,hy,.55),1.2,2.4,.5)}
 if(a.ast=='bare'&&!a.bones){g.strokeStyle=rgba('#000000',.18);g.lineWidth=1;g.beginPath();g.moveTo(lerp(sx,mx,.3)+s*1.5,lerp(sy,my,.3));g.quadraticCurveTo(lerp(sx,mx,.6)+s*3,lerp(sy,my,.6),mx+s*1.2,my);g.stroke()}}
function torso(g,a,back,shY,waY,shX,waX,chX,bw){
 const path=()=>{g.beginPath();g.moveTo(-shX+2,shY);g.quadraticCurveTo(0,shY-2.5,shX-2,shY);g.quadraticCurveTo(chX+1.5,shY+5,chX,shY+11);g.quadraticCurveTo(waX+2,waY-5,waX,waY+1);g.lineTo(-waX,waY+1);g.quadraticCurveTo(-waX-2,waY-5,-chX,shY+11);g.quadraticCurveTo(-chX-1.5,shY+5,-shX+2,shY);g.closePath()};
 if(a.ast=='ribs'){path();fo(g,'#241c1a');g.save();path();g.clip();cap(g,0,shY,0,waY,3.4,a.skin,0);for(let i=0;i<4;i++){const y=shY+4+i*4.3,w=chX-1-i*.8;g.beginPath();g.moveTo(-1,y);g.quadraticCurveTo(-w,y-.5,-w+1,y+3.2);g.moveTo(1,y);g.quadraticCurveTo(w,y-.5,w-1,y+3.2);g.strokeStyle=a.skin;g.lineWidth=2.1;g.stroke()}g.restore();path();g.lineWidth=1.2;g.strokeStyle=OL;g.stroke();return}
 path();fo(g,lin(g,-shX,shX,a.armor));
 g.save();path();g.clip();
 const q=g.createLinearGradient(0,shY,0,waY);q.addColorStop(0,'rgba(255,255,255,.08)');q.addColorStop(1,'rgba(0,0,0,.28)');g.fillStyle=q;g.fillRect(-shX,shY-3,2*shX,waY-shY+6);
 if(a.ast=='plate'){
  if(!back){g.fillStyle=rgba('#7a8088',.9);for(let y=waY-9;y<waY;y+=2.2)for(let x=-waX;x<waX;x+=2.4){g.beginPath();g.arc(x+((y*2|0)%2?1.2:0),y,1.2,0,Math.PI);g.strokeStyle='rgba(40,40,50,.55)';g.lineWidth=.6;g.stroke()}
   g.beginPath();g.moveTo(-chX+1,shY+2);g.quadraticCurveTo(-chX+.5,waY-8,-2,waY-9);g.lineTo(2,waY-9);g.quadraticCurveTo(chX-.5,waY-8,chX-1,shY+2);g.closePath();fo(g,lin(g,-chX,chX,a.armor),.9);
   g.strokeStyle=rgba('#000000',.35);g.lineWidth=.9;g.beginPath();g.moveTo(0,shY+1);g.lineTo(0,waY-9);g.stroke();spec(g,-chX*.42,shY+9,2.2,6,.6);spec(g,chX*.5,shY+10,1.2,5,.25)}
  else{g.strokeStyle=rgba('#000000',.3);g.lineWidth=.9;g.beginPath();g.moveTo(0,shY+1);g.lineTo(0,waY);g.moveTo(-chX+2,shY+9);g.quadraticCurveTo(0,shY+12,chX-2,shY+9);g.stroke();spec(g,-chX*.45,shY+8,2,6,.5)}
  for(const s of[-1,1]){g.fillStyle='#e8dcc0';ell(g,s*(chX-3),shY+3,.9,.9);g.fill()}}
 if(a.ast=='leather'){g.strokeStyle=rgba('#000000',.35);g.lineWidth=.8;g.setLineDash([1.6,1.4]);g.beginPath();g.moveTo(-chX+2.5,shY+2);g.quadraticCurveTo(-waX+1.5,waY-6,-waX+1,waY);g.moveTo(chX-2.5,shY+2);g.quadraticCurveTo(waX-1.5,waY-6,waX-1,waY);g.stroke();g.setLineDash([]);
  if(!back){g.beginPath();g.moveTo(-5,shY);g.lineTo(0,shY+9);g.lineTo(5,shY);g.closePath();fo(g,sh(a.armor,-.3),.8);g.strokeStyle='#d8c8a0';g.lineWidth=.6;g.beginPath();for(let i=0;i<3;i++){g.moveTo(-2.4+i*.6,shY+2+i*2.2);g.lineTo(2.4-i*.6,shY+3.4+i*2.2)}g.stroke()}
  spec(g,-chX*.4,shY+9,2,5,.18)}
 if(a.ast=='bare'){g.strokeStyle=rgba('#000000',.22);g.lineWidth=1.1;g.beginPath();if(!back){g.moveTo(-chX+3,shY+9);g.quadraticCurveTo(-3,shY+12,0,shY+8);g.quadraticCurveTo(3,shY+12,chX-3,shY+9);g.moveTo(0,shY+12);g.lineTo(0,waY-2);for(const y of[waY-10,waY-6])g.moveTo(-4,y),g.quadraticCurveTo(0,y+1.5,4,y)}else{g.moveTo(0,shY+2);g.lineTo(0,waY-1);g.moveTo(-7,shY+5);g.quadraticCurveTo(-4,shY+11,-6,shY+16);g.moveTo(7,shY+5);g.quadraticCurveTo(4,shY+11,6,shY+16)}g.stroke();
  spec(g,-chX*.45,shY+8,2.6,4,.3);
  if(a.strap){g.strokeStyle=OL;g.lineWidth=4.6;g.beginPath();g.moveTo(-shX+3,shY+1);g.lineTo(waX-1,waY-1);g.stroke();g.strokeStyle=a.strap;g.lineWidth=3;g.stroke();g.fillStyle='#c8c0b0';for(let k=.2;k<1;k+=.25){ell(g,lerp(-shX+3,waX-1,k),lerp(shY+1,waY-1,k),.9,.9);g.fill()}}}
 if(a.ast=='dark'){g.strokeStyle=a.trim;g.lineWidth=1;g.beginPath();g.moveTo(-chX+2,shY+3);g.quadraticCurveTo(-3,shY+12,0,waY-3);g.quadraticCurveTo(3,shY+12,chX-2,shY+3);g.stroke();if(!back){glow(g,0,shY+10,7,'#ff6a1a',.9);ell(g,0,shY+10,2.2,2.8);fo(g,rad(g,0,shY+10,2.4,'#ffb04a'),.8)}spec(g,-chX*.45,shY+9,2,5,.28)}
 g.restore();
 if(a.tabard){g.beginPath();g.moveTo(-5.6,shY+(back?5:13));g.lineTo(5.6,shY+(back?5:13));g.lineTo(5.6,waY+11);g.lineTo(0,waY+14);g.lineTo(-5.6,waY+11);g.closePath();fo(g,lin(g,-6,6,a.tabard),1);g.strokeStyle=a.emblem;g.lineWidth=.9;g.stroke();
  if(!back){g.fillStyle=a.emblem;g.beginPath();const cx=0,cy=waY+1;for(let i=0;i<10;i++){const r=i%2?1.4:3.4,an=-Math.PI/2+i*Math.PI/5;g.lineTo(cx+Math.cos(an)*r,cy+Math.sin(an)*r)}g.closePath();g.fill()}}
 g.fillStyle=OL;rr(g,-waX-.6,waY-2.6,2*waX+1.2,4.6,1.5);g.fill();g.fillStyle=lin(g,-waX,waX,'#5a3a22');rr(g,-waX,waY-2,2*waX,3.4,1.2);g.fill();
 if(!back){rr(g,-2.3,waY-2.8,4.6,5,1);fo(g,lin(g,-2,2,'#e8c050'),.8)}
 rr(g,waX-6,waY-.5,5,5.5,1.4);fo(g,lin(g,waX-6,waX-1,'#6a4424'),.9)}
function robe(g,a,shY,waY,shX,back){const hem=-1,n=8;
 g.beginPath();g.moveTo(-shX+2,shY);g.quadraticCurveTo(0,shY-2.5,shX-2,shY);g.quadraticCurveTo(shX+3,waY,shX+6,hem-4);for(let i=n;i>=0;i--)g.lineTo(-shX-6+(2*shX+12)*i/n,hem-(i%2?0:5)+((i*7)%3));g.quadraticCurveTo(-shX-3,waY,-shX+2,shY);g.closePath();
 fo(g,lin(g,-shX-6,shX+6,a.robe));g.save();g.clip();const q=g.createLinearGradient(0,shY,0,hem);q.addColorStop(0,'rgba(255,255,255,.06)');q.addColorStop(1,'rgba(0,0,0,.4)');g.fillStyle=q;g.fillRect(-30,shY-4,60,hem-shY+8);
 g.strokeStyle=rgba('#000000',.4);g.lineWidth=1;g.beginPath();for(const x of[-8,-3,4,9]){g.moveTo(x*.5,waY);g.quadraticCurveTo(x*.9,(waY+hem)/2,x*1.1,hem-2)}g.stroke();g.restore();
 g.strokeStyle=a.trim;g.lineWidth=1.8;g.beginPath();if(!back){g.moveTo(0,shY+3);g.lineTo(0,hem-4)}g.moveTo(-shX+2,shY+1);g.quadraticCurveTo(0,shY+5,shX-2,shY+1);g.stroke();
 g.fillStyle=sh(a.robe,-.5);rr(g,-9.5,waY-2,19,3.4,1.5);g.fill();glow(g,0,waY-.4,5,a.trim,.7)}
function cape(g,a,shY,shX,back){g.beginPath();if(!back){g.moveTo(-shX+1,shY+2);g.quadraticCurveTo(-shX-7,-20,-shX-6,-7);g.quadraticCurveTo(0,-3,shX+6,-7);g.quadraticCurveTo(shX+7,-20,shX-1,shY+2);g.closePath();fo(g,lin(g,-shX-6,shX+6,sh(a.cape,-.2)))}
 else{g.moveTo(-shX,shY+2);g.quadraticCurveTo(-shX-7,-20,-shX-6,-9);for(let i=0;i<=6;i++)g.lineTo(-shX-6+(2*shX+12)*i/6,-9+(i%2?3:0));g.quadraticCurveTo(shX+7,-20,shX,shY+2);g.quadraticCurveTo(0,shY-3,-shX,shY+2);g.closePath();fo(g,lin(g,-shX-6,shX+6,a.cape));
  g.strokeStyle=rgba('#000000',.32);g.lineWidth=1.1;g.beginPath();for(const x of[-8,-2.5,3,8.5]){g.moveTo(x*.6,shY+5);g.quadraticCurveTo(x*1.1,-26,x*1.15,-10)}g.stroke();ell(g,0,shY+3,2.4,2);fo(g,'#e0c050',.8)}}
function tail(g,a,hipY){g.lineCap='round';g.beginPath();g.moveTo(0,hipY+4);g.quadraticCurveTo(16,hipY+22,24,hipY+6);g.strokeStyle=OL;g.lineWidth=5;g.stroke();g.strokeStyle=sh(a.skin,-.15);g.lineWidth=2.8;g.stroke();g.beginPath();g.moveTo(22,hipY);g.lineTo(30,hipY+9);g.lineTo(19,hipY+9);g.closePath();fo(g,sh(a.skin,-.3),1)}
function wings(g,a,ty,f){const fl=Math.sin(f/8*TAU)*3;for(const s of[-1,1]){g.beginPath();g.moveTo(s*7,ty+4);g.quadraticCurveTo(s*26,ty-26-fl,s*48,ty-12-fl);g.quadraticCurveTo(s*42,ty-5,s*44,ty+6);g.quadraticCurveTo(s*35,ty,s*33,ty+12);g.quadraticCurveTo(s*26,ty+6,s*22,ty+16);g.quadraticCurveTo(s*16,ty+10,s*8,ty+15);g.closePath();fo(g,lin(g,s*46,s*6,a.skin=='#8a1a2a'?'#3a0a10':'#5a1620'));
 g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=1.1;g.beginPath();g.moveTo(s*9,ty+6);g.lineTo(s*46,ty-11-fl);g.moveTo(s*12,ty+8);g.lineTo(s*33,ty+11);g.moveTo(s*10,ty+9);g.lineTo(s*22,ty+15);g.stroke()}}
function xbowBack(g,shY){g.beginPath();g.moveTo(-21,shY-3);g.quadraticCurveTo(0,shY-13,21,shY-3);g.strokeStyle=OL;g.lineWidth=5;g.stroke();g.strokeStyle='#7a4a24';g.lineWidth=3;g.stroke();g.strokeStyle='#ddd';g.lineWidth=.7;g.beginPath();g.moveTo(-20,shY-3.4);g.lineTo(20,shY-3.4);g.stroke()}
function weapon(g,a,w,back,P,shY,hk,layer){const hl=P.l,hr=P.r;
 if(layer==0)return;
 if(layer==1){
  if(w=='xbow'&&!back){const y=shY+8;g.beginPath();g.moveTo(-19,y-1);g.quadraticCurveTo(0,y+8,19,y-1);g.strokeStyle=OL;g.lineWidth=5;g.stroke();g.strokeStyle='#7a4a24';g.lineWidth=3;g.stroke();g.strokeStyle='#ddd';g.lineWidth=.7;g.beginPath();g.moveTo(-19,y-1);g.lineTo(19,y-1);g.stroke();
   rr(g,-3,y-6,6,14,2);fo(g,lin(g,-3,3,'#5a3a1e'),1);ell(g,0,y+6,2.4,2);fo(g,'#c8d0d8',.8);spec(g,-1,y-2,.8,3,.4)}
  if(w=='bow'){const bx=-22,y0=shY-24,y1=shY+22;g.beginPath();g.moveTo(bx,y0);g.quadraticCurveTo(bx-14,shY,bx,y1);g.strokeStyle=OL;g.lineWidth=5;g.stroke();g.strokeStyle='#9a6a32';g.lineWidth=2.8;g.stroke();
   g.strokeStyle='#eee';g.lineWidth=.7;g.beginPath();g.moveTo(bx,y0);g.lineTo(hr[0],hr[1]);g.lineTo(bx,y1);g.stroke();g.strokeStyle='#d8c08a';g.lineWidth=1.5;g.beginPath();g.moveTo(hr[0],hr[1]);g.lineTo(bx-4,y0+2);g.stroke();
   g.beginPath();g.moveTo(bx-6.5,y0-4);g.lineTo(bx-6.5,y0+5);g.lineTo(bx-1,y0+3);g.closePath();fo(g,a.id=='skel'?'#bbb':'#c8ffd4',.8);if(a.id!='skel')glow(g,bx-5,y0+1,8,'#7dff9a',.7)}
  if(w=='axe'){const x2=hr[0]+7,y2=shY-36;cap(g,hl[0]-4,shY+26,x2,y2,3.4,'#6a4020');const by=y2+8;
   for(const s of[-1,1]){g.beginPath();g.moveTo(x2,by-7);g.quadraticCurveTo(x2+s*19,by-16,x2+s*17,by+2);g.quadraticCurveTo(x2+s*14,by+12,x2,by+7);g.closePath();fo(g,lin(g,x2-17,x2+17,'#b4bec8'),1.2);g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=.9;g.beginPath();g.moveTo(x2+s*16,by-9);g.quadraticCurveTo(x2+s*18,by-2,x2+s*15,by+6);g.stroke()}
   rr(g,x2-2.6,by-4,5.2,10,2);fo(g,'#4a4038',.9);cap(g,x2,by+10,x2,by+16,3.8,'#3a2a20')}
  if(w=='staff'){const x=hr[0],c=a.orb||'#3ff0ff';cap(g,x,shY+40,x,shY-40,3.2,'#4a3a2e');g.beginPath();g.moveTo(x-7,shY-38);g.quadraticCurveTo(x-10,shY-52,x,shY-56);g.quadraticCurveTo(x+10,shY-52,x+7,shY-38);g.strokeStyle=OL;g.lineWidth=3.6;g.stroke();g.strokeStyle='#8a7cb0';g.lineWidth=2;g.stroke();
   glow(g,x,shY-46,20,c);ell(g,x,shY-46,4.6,4.6);fo(g,rad(g,x,shY-46,4.6,sh(c,.5)),.9)}
  if(w=='club'){const x1=hr[0],y1=hr[1]+5,x2=hr[0]+13,y2=hr[1]-34;cap(g,x1,y1,x2,y2,6,'#6a4628');ell(g,x2,y2,7,8.4);fo(g,rad(g,x2,y2,8,'#80583a'),1.2);
   for(const[dx,dy]of[[-7,-3],[6,-6],[0,-9],[7,3],[-5,5]]){g.beginPath();g.moveTo(x2+dx*.8,y2+dy*.8);g.lineTo(x2+dx*1.45,y2+dy*1.45-1.5);g.lineTo(x2+dx*.8+2,y2+dy*.8);g.closePath();fo(g,'#e0d8c4',.7)}}
  if(w=='cleaver'){const x=hr[0],y=hr[1];cap(g,x,y+6,x+1,y-9,3.6,'#3a2418');g.beginPath();g.moveTo(x-3,y-8);g.lineTo(x+17,y-13);g.lineTo(x+22,y-64);g.quadraticCurveTo(x+12,y-69,x+3,y-60);g.closePath();fo(g,lin(g,x-3,x+22,'#b8c0ca'),1.4);spec(g,x+8,y-38,1.6,16,.5);
   ell(g,x+14,y-52,2.4,2.4);g.fillStyle=OL;g.fill();g.strokeStyle='rgba(150,15,25,.75)';g.lineWidth=2;g.beginPath();g.moveTo(x+19,y-30);g.lineTo(x+20,y-46);g.stroke()}
  if(w=='greatsword'){const x=hr[0],y=hr[1];cap(g,x,y+6,x,y-6,3.4,'#2a2a3a');g.fillStyle='#8a8aa0';rr(g,x-8,y-8,16,3,1.2);fo(g,lin(g,x-8,x+8,'#9a9ab0'),1);g.beginPath();g.moveTo(x-3.6,y-8);g.lineTo(x+3.6,y-8);g.lineTo(x+3,y-70);g.lineTo(x,y-78);g.lineTo(x-3,y-70);g.closePath();fo(g,lin(g,x-4,x+4,'#c8d4e0'),1.2);glow(g,x,y-40,14,'#5ae0ff',.5);g.strokeStyle='rgba(90,224,255,.7)';g.lineWidth=.8;g.beginPath();g.moveTo(x,y-10);g.lineTo(x,y-70);g.stroke()}
  if(w=='sword'){const x=hr[0],y=hr[1];cap(g,x,y+4,x,y-3,2.8,'#2a2a30');rr(g,x-6,y-5,12,2.4,1);fo(g,'#8a8a96',.8);g.beginPath();g.moveTo(x-2.4,y-5);g.lineTo(x+2.4,y-5);g.lineTo(x+2,y-36);g.lineTo(x,y-41);g.lineTo(x-2,y-36);g.closePath();fo(g,lin(g,x-3,x+3,'#c0c8d2'),1)}
  if(w=='dagger'){const x=hr[0],y=hr[1];g.beginPath();g.moveTo(x-2,y-2);g.lineTo(x+6,y-20);g.lineTo(x+3.5,y-1);g.closePath();fo(g,lin(g,x-2,x+6,'#d0d8e0'),1)}}
 if(layer==2){
  if(w=='fire'){const c=a.id=='demonlord'?'#ff3a10':'#ff5a1a';for(const h of[hl,hr]){glow(g,h[0],h[1]-5,a.id=='demonlord'?24:18,c);glow(g,h[0],h[1]-5,8,'#ffe08a');ell(g,h[0],h[1]-5,2.6,3.2);g.fillStyle='#fff';g.fill()}}
  if(w=='claws')for(const h of[hl,hr])for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(h[0]+i*2.2-1,h[1]-2.5);g.quadraticCurveTo(h[0]+i*3.2,h[1]-8.5,h[0]+i*4,h[1]-10.5);g.lineTo(h[0]+i*2.2+1,h[1]-2.5);g.closePath();fo(g,'#f4efe0',.8)}
  if(w=='bomb'){ell(g,0,shY+8,7,7);fo(g,rad(g,0,shY+8,7,'#2a2a34'),1.3);spec(g,-2.4,shY+5,1.8,1.4,.7);cap(g,1,shY+1,4,shY-4,1.6,'#b89a6a',1);glow(g,4.5,shY-5,8,'#ffb03a');glow(g,4.5,shY-5,3,'#fff')}
  if(w=='shield'){const x=hl[0]-1,y=hl[1]-6;g.beginPath();g.moveTo(x-11,y-11);g.quadraticCurveTo(x,y-14,x+11,y-11);g.lineTo(x+10,y+5);g.quadraticCurveTo(x+6,y+16,x,y+21);g.quadraticCurveTo(x-6,y+16,x-10,y+5);g.closePath();fo(g,lin(g,x-11,x+11,'#3a3e4a'),1.6);
   g.save();g.clip();g.fillStyle='#7a1020';g.fillRect(x-2.5,y-14,5,40);g.fillRect(x-12,y-2,24,5);g.restore();g.strokeStyle='#a0a4b0';g.lineWidth=1.4;g.stroke();spec(g,x-5,y-5,2,6,.4);
   const sx=hr[0],sy=hr[1];rr(g,sx-5,sy-4,10,2.4,1);fo(g,'#8a8a96',.8);g.beginPath();g.moveTo(sx-2.2,sy-4);g.lineTo(sx+2.2,sy-4);g.lineTo(sx+1.8,sy-30);g.lineTo(sx,sy-34);g.lineTo(sx-1.8,sy-30);g.closePath();fo(g,lin(g,sx-3,sx+3,'#c0c8d2'),1)}}}
function head(g,a,back,hy,R){
 const hw=R*.9,hh=R*1.05;
 if(a.hs=='long'){g.beginPath();g.moveTo(-hw*1.08,hy-2);g.lineTo(-hw*1.2,hy+R*(back?2.3:1.6));g.quadraticCurveTo(0,hy+R*(back?2.7:2.0),hw*1.2,hy+R*(back?2.3:1.6));g.lineTo(hw*1.08,hy-2);g.closePath();fo(g,lin(g,-R,R,a.hair),1.2);
  if(back){g.strokeStyle=sh(a.hair,-.3);g.lineWidth=.8;g.beginPath();for(const x of[-5,-1.5,2,5.5]){g.moveTo(x,hy);g.quadraticCurveTo(x*1.2,hy+R,x*1.1,hy+R*2.4)}g.stroke()}}
 if(a.hs=='hood'&&!back){ell(g,0,hy+1.5,R*1.38,R*1.36);fo(g,rad(g,0,hy,R*1.35,a.hood),1.4)}
 if(a.ears){const big=a.ears==2;for(const s of[-1,1]){g.beginPath();g.moveTo(s*hw*.88,hy-2);g.lineTo(s*(hw+(big?11:10)),hy-(big?6:11));g.lineTo(s*hw*.86,hy+4);g.closePath();fo(g,lin(g,-R-10,R+10,a.skin),1.1);g.fillStyle=rgba('#ff7a90',.35);g.beginPath();g.moveTo(s*hw*.95,hy-.6);g.lineTo(s*(hw+(big?7.5:7)),hy-(big?4.6:8.5));g.lineTo(s*hw*.95,hy+2.4);g.fill()}}
 if(a.hs=='hood'&&back){ell(g,0,hy,R*1.3,R*1.28);fo(g,rad(g,0,hy-1,R*1.3,a.hood),1.4);g.strokeStyle=sh(a.hood,-.45);g.lineWidth=1.1;g.beginPath();g.moveTo(0,hy-R*1.2);g.quadraticCurveTo(2,hy,0,hy+R*1.2);g.moveTo(-R*.8,hy-R*.6);g.quadraticCurveTo(-R*.5,hy+R*.4,-R*.9,hy+R*.9);g.stroke();return}
 ell(g,0,hy,hw,hh);fo(g,rad(g,0,hy-1,R,a.skin),1.4);
 if(!a.skull){g.save();ell(g,0,hy,hw,hh);g.clip();const q=g.createLinearGradient(0,hy-hh,0,hy+hh);q.addColorStop(.55,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(40,10,10,.28)');g.fillStyle=q;g.fillRect(-R,hy-hh,2*R,2*hh);g.restore()}
 if(back){
  if(a.hs=='helm'||a.hs=='greathelm'){ell(g,0,hy-.5,hw*1.18,hh*1.08);fo(g,rad(g,0,hy-1,R*1.1,a.hs=='helm'?'#c3cbd5':'#4a4e5a'),1.4);g.strokeStyle=rgba('#000000',.3);g.lineWidth=1;g.beginPath();g.moveTo(0,hy-hh);g.lineTo(0,hy+hh);g.moveTo(-hw*1.1,hy+R*.45);g.quadraticCurveTo(0,hy+R*.7,hw*1.1,hy+R*.45);g.stroke();spec(g,-R*.45,hy-R*.4,1.6,4,.6);if(a.plume)plume(g,a,hy,R);}
  else if(a.hs=='knot'){g.strokeStyle=rgba('#000000',.15);g.lineWidth=1;g.beginPath();g.arc(0,hy+3,R*.6,Math.PI*1.15,Math.PI*1.85);g.stroke()}
  else if(a.hs&&a.hs!='none'&&a.hs!='band'){ell(g,0,hy-1,hw*1.06,hh*1.0);fo(g,rad(g,0,hy-1,R,a.hair),1.3);g.strokeStyle=sh(a.hair,-.35);g.lineWidth=.8;g.beginPath();for(const x of[-5,-2,1,4]){g.moveTo(x,hy-R*.9);g.quadraticCurveTo(x*1.3,hy,x*1.1,hy+R*.85)}g.stroke()}
 }else{
  const ex=R*.36,ey=hy+R*.02;
  if(a.skull){for(const s of[-1,1]){ell(g,s*ex,ey,R*.24,R*.27);g.fillStyle='#141218';g.fill();glow(g,s*ex,ey,R*.65,a.eyes);ell(g,s*ex,ey,R*.08,R*.1);g.fillStyle='#fff';g.fill()}
   g.fillStyle='#141218';g.beginPath();g.moveTo(0,hy+R*.3);g.lineTo(-R*.11,hy+R*.48);g.lineTo(R*.11,hy+R*.48);g.fill();g.strokeStyle='#141218';g.lineWidth=.8;g.beginPath();g.moveTo(-R*.4,hy+R*.7);g.lineTo(R*.4,hy+R*.7);for(let i=-3;i<=3;i++){g.moveTo(i*R*.11,hy+R*.6);g.lineTo(i*R*.11,hy+R*.8)}g.stroke();
   g.fillStyle=rgba('#000000',.18);ell(g,-hw*.7,hy+R*.3,R*.22,R*.35);g.fill();ell(g,hw*.7,hy+R*.3,R*.22,R*.35);g.fill()}
  else if(a.hs!='greathelm'){
   for(const s of[-1,1]){ell(g,s*ex,ey,R*.2,R*.11);g.fillStyle='#f6f2ec';g.fill();ell(g,s*ex+s*R*.02,ey+R*.01,R*.09,R*.09);g.fillStyle=a.eyes||'#4a3020';g.fill();ell(g,s*ex+s*R*.02,ey+R*.01,R*.045,R*.045);g.fillStyle='#0a0608';g.fill();ell(g,s*ex-R*.02,ey-R*.03,R*.025,R*.025);g.fillStyle='#fff';g.fill();
    g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.ellipse(s*ex,ey,R*.21,R*.12,0,Math.PI*1.05,Math.PI*1.95);g.stroke();
    g.strokeStyle=sh(a.hair||a.skin,-.4);g.lineWidth=a.brow?1.7:1.2;g.lineCap='round';g.beginPath();if(a.brow){g.moveTo(s*ex*1.65,ey-R*.32);g.lineTo(s*ex*.35,ey-R*.16)}else{g.moveTo(s*ex*1.55,ey-R*.18);g.quadraticCurveTo(s*ex,ey-R*.32,s*ex*.45,ey-R*.22)}g.stroke()}
   g.strokeStyle=sh(a.skin,-.35);g.lineWidth=1;g.beginPath();g.moveTo(R*.03,hy+R*.12);g.lineTo(R*.1,hy+R*.42);g.quadraticCurveTo(0,hy+R*.48,-R*.08,hy+R*.42);g.stroke();spec(g,-R*.02,hy+R*.32,.7,1.6,.45);
   const my=hy+R*.66;g.strokeStyle=sh(a.skin,-.5);g.lineWidth=1.1;g.lineCap='round';g.beginPath();
   if(a.mouth=='grin'){g.moveTo(-R*.38,my-1.5);g.quadraticCurveTo(0,my+R*.32,R*.38,my-1.5);g.closePath();fo(g,'#4a1018',1);g.fillStyle='#fff';for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(i*R*.2-1.4,my-.8);g.lineTo(i*R*.2,my+2.2);g.lineTo(i*R*.2+1.4,my-.8);g.fill()}}
   else if(a.mouth=='frown'){g.moveTo(-R*.24,my+1.2);g.quadraticCurveTo(0,my-1.6,R*.24,my+1.2);g.stroke()}
   else if(a.mouth=='fang'){g.moveTo(-R*.24,my);g.quadraticCurveTo(0,my+.8,R*.24,my);g.stroke();g.fillStyle='#fff';for(const s of[-1,1]){g.beginPath();g.moveTo(s*R*.15-1.1,my);g.lineTo(s*R*.15,my+2.8);g.lineTo(s*R*.15+1.1,my);g.fill()}}
   else{g.moveTo(-R*.2,my);g.quadraticCurveTo(0,my+1.2,R*.2,my);g.stroke();g.strokeStyle=rgba('#ffffff',.25);g.beginPath();g.moveTo(-R*.1,my+1.8);g.lineTo(R*.1,my+1.8);g.stroke()}
   if(a.tusks)for(const s of[-1,1]){g.beginPath();g.moveTo(s*R*.26,my+.8);g.lineTo(s*R*.34,my-R*.42);g.lineTo(s*R*.44,my+.8);g.closePath();fo(g,'#fbf6e8',.9)}
   g.fillStyle=rgba('#000000',.12);ell(g,-hw*.78,hy+R*.25,R*.2,R*.4);g.fill();ell(g,hw*.78,hy+R*.25,R*.2,R*.4);g.fill()}
  // headgear front
  if(a.hs=='hood'){g.beginPath();g.arc(0,hy+1.5,R*1.38,Math.PI*1.06,Math.PI*1.94);g.arc(0,hy+R*.2,R*1.04,Math.PI*1.9,Math.PI*1.1,true);g.closePath();fo(g,rad(g,0,hy-R*.6,R*1.2,a.hood),1.3);g.fillStyle=rgba('#000000',.35);g.beginPath();g.arc(0,hy-R*.1,R*1.0,Math.PI*1.1,Math.PI*1.9);g.lineTo(R*.9,hy-R*.2);g.quadraticCurveTo(0,hy-R*.55,-R*.9,hy-R*.2);g.closePath();g.fill()}
  else if(a.hs=='helm'){g.beginPath();g.arc(0,hy-.5,hw*1.18,Math.PI*.92,Math.PI*2.08);g.lineTo(hw*1.08,hy+R*.62);g.lineTo(hw*.78,hy+R*.66);g.quadraticCurveTo(hw*.82,hy-R*.2,R*.2,hy-R*.32);g.lineTo(R*.13,hy+R*.3);g.lineTo(-R*.13,hy+R*.3);g.lineTo(-R*.2,hy-R*.32);g.quadraticCurveTo(-hw*.82,hy-R*.2,-hw*.78,hy+R*.66);g.lineTo(-hw*1.08,hy+R*.62);g.closePath();
   fo(g,rad(g,0,hy-R*.6,R*1.15,'#c3cbd5'),1.3);spec(g,-R*.42,hy-R*.62,2,1.2,.75);g.strokeStyle=rgba('#000000',.3);g.lineWidth=.8;g.beginPath();g.moveTo(0,hy-hh*1.1);g.lineTo(0,hy-R*.34);g.stroke();g.fillStyle='#e8c24a';for(const x of[-.85,-.6,.6,.85]){ell(g,x*R,hy-R*.12,.8,.8);g.fill()}
   g.fillStyle=rgba('#7a8088',1);for(let x=-R*.9;x<=R*.9;x+=2.1){g.beginPath();g.arc(x,hy+R*.88,1.05,0,Math.PI);g.strokeStyle='rgba(40,40,50,.6)';g.lineWidth=.6;g.stroke()}
   plume(g,a,hy,R)}
  else if(a.hs=='greathelm'){ell(g,0,hy-.5,hw*1.15,hh*1.08);fo(g,rad(g,0,hy-1.5,R*1.15,a.id=='bonelord'?'#3a3a4a':'#4a4e5a'),1.4);g.fillStyle='#0a0a0e';rr(g,-R*.7,hy-R*.12,R*1.4,R*.2,1);g.fill();rr(g,-R*.1,hy-R*.12,R*.2,R*.75,1);g.fill();glow(g,-R*.35,hy-.2,5,a.eyes);glow(g,R*.35,hy-.2,5,a.eyes);spec(g,-R*.45,hy-R*.55,1.8,3,.45);
   g.fillStyle='#b0b4bc';for(const s of[-1,1]){ell(g,s*R*.8,hy+R*.4,.9,.9);g.fill()}}
  else if(a.hs=='short'||a.hs=='long'||a.hs=='spiky'){g.beginPath();g.arc(0,hy-.6,hw*1.1,Math.PI*.95,Math.PI*2.05);const n=7;for(let i=n;i>=0;i--)g.lineTo(-hw*1.06+2.12*hw*i/n,hy-R*.38+(i%2?R*.16:0));g.closePath();fo(g,lin(g,-R,R,a.hair),1.3);
   g.strokeStyle=sh(a.hair,-.3);g.lineWidth=.7;g.beginPath();for(const x of[-4,-1,2,5]){g.moveTo(x*.6,hy-hh*.95);g.quadraticCurveTo(x,hy-R*.6,x*1.1,hy-R*.36)}g.stroke();spec(g,-R*.4,hy-R*.75,2,1,.35)}
  else if(a.hs=='band'){g.fillStyle=a.hair;rr(g,-hw*1.02,hy-R*.5,hw*2.04,R*.3,1);fo(g,lin(g,-R,R,a.hair),1);g.beginPath();g.moveTo(hw*.9,hy-R*.4);g.lineTo(hw*1.6,hy-R*.1);g.lineTo(hw*1.3,hy-R*.6);g.closePath();fo(g,a.hair,.8)}
 }
 if(a.hs=='spiky')for(let i=-2;i<=2;i++){const x=i*R*.36;g.beginPath();g.moveTo(x-R*.24,hy-R*.8);g.lineTo(x+i*1.8,hy-R*1.5+Math.abs(i)*2.6);g.lineTo(x+R*.24,hy-R*.84);g.closePath();fo(g,lin(g,x-5,x+5,a.hair),1)}
 if(a.hs=='mohawk')for(let i=-2;i<=2;i++){const x=i*R*.19;g.beginPath();g.moveTo(x-R*.13,hy-R*.9+Math.abs(i)*1.6);g.lineTo(x,hy-R*1.6+Math.abs(i)*2.6);g.lineTo(x+R*.13,hy-R*.9+Math.abs(i)*1.6);g.closePath();fo(g,lin(g,x-4,x+4,a.hair),.9)}
 if(a.hs=='knot'){ell(g,0,hy-R*1.02,4,3.6);fo(g,rad(g,0,hy-R,4,a.hair),1);g.fillStyle='#c9a23a';g.fillRect(-3,hy-R*.88,6,1.8)}
 if(a.horns){const k=a.horns==2?.62:1,hc=a.hornC||'#2a1414';for(const s of[-1,1]){g.beginPath();g.moveTo(s*R*.42,hy-R*.72);g.quadraticCurveTo(s*R*(.9+.5*k),hy-R*(.9+.2*k),s*R*(.8+.4*k),hy-R*(1+.95*k));g.quadraticCurveTo(s*R*.85,hy-R*1.2,s*R*.1,hy-R*.92);g.closePath();fo(g,lin(g,-R,R,hc),1.2);
  g.strokeStyle=rgba('#000000',.3);g.lineWidth=.7;g.beginPath();for(let t=.3;t<.9;t+=.2){g.moveTo(s*R*lerp(.3,.9+.3*k,t),hy-R*lerp(.85,1.2+.6*k,t));g.lineTo(s*R*lerp(.5,1.0+.35*k,t),hy-R*lerp(.75,1.05+.6*k,t))}g.stroke()}}
 if(a.crown){g.beginPath();g.moveTo(-R*.72,hy-R*.66);g.lineTo(-R*.82,hy-R*1.32);g.lineTo(-R*.42,hy-R*1.0);g.lineTo(0,hy-R*1.48);g.lineTo(R*.42,hy-R*1.0);g.lineTo(R*.82,hy-R*1.32);g.lineTo(R*.72,hy-R*.66);g.quadraticCurveTo(0,hy-R*.84,-R*.72,hy-R*.66);fo(g,lin(g,-R,R,'#f0c040'),1.2);
  for(const x of[-.42,0,.42]){ell(g,x*R,hy-R*.8,1.6,1.6);g.fillStyle='#e0203a';g.fill()}spec(g,-R*.3,hy-R*.95,1.2,2.4,.6)}}
function plume(g,a,hy,R){g.beginPath();g.moveTo(-2.4,hy-R*1.0);g.quadraticCurveTo(-4.5,hy-R*1.85,4,hy-R*2.05);g.quadraticCurveTo(7,hy-R*1.6,4,hy-R*1.3);g.quadraticCurveTo(1.6,hy-R*1.25,2.4,hy-R*1.0);g.closePath();fo(g,lin(g,-4,6,a.plume||'#d42a36'),1.1);g.strokeStyle=rgba('#000000',.25);g.lineWidth=.6;g.beginPath();g.moveTo(-1,hy-R*1.1);g.quadraticCurveTo(-2,hy-R*1.7,3.5,hy-R*1.9);g.stroke()}
function batFig(g,a,f){const fl=Math.sin(f/8*TAU),y=-40;g.fillStyle='rgba(0,0,0,.25)';ell(g,0,0,12,4);g.fill();
 for(const s of[-1,1]){g.beginPath();g.moveTo(s*4,y);g.quadraticCurveTo(s*16,y-14-fl*8,s*28,y-6-fl*10);g.lineTo(s*24,y+2-fl*4);g.quadraticCurveTo(s*20,y-1,s*17,y+6-fl*2);g.quadraticCurveTo(s*13,y+2,s*9,y+8);g.closePath();fo(g,lin(g,s*28,s*4,'#3a2a4a'),1.1);g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=.8;g.beginPath();g.moveTo(s*5,y);g.lineTo(s*26,y-5-fl*10);g.moveTo(s*6,y+2);g.lineTo(s*17,y+5-fl*2);g.stroke()}
 ell(g,0,y+1,7,8);fo(g,rad(g,0,y,8,'#4a3658'),1.2);for(const s of[-1,1]){g.beginPath();g.moveTo(s*2,y-5);g.lineTo(s*6,y-13);g.lineTo(s*6,y-4);g.closePath();fo(g,'#4a3658',1)}
 for(const s of[-1,1]){glow(g,s*2.6,y-1,4,'#ff3a3a');ell(g,s*2.6,y-1,1.3,1.3);g.fillStyle='#ffd0d0';g.fill()}g.fillStyle='#fff';for(const s of[-1,1]){g.beginPath();g.moveTo(s*1.4,y+3);g.lineTo(s*1,y+6);g.lineTo(s*.4,y+3);g.fill()}}
function slimeFig(g,a,f){const k=Math.sin(f/8*TAU),w=17+k*2,h=14-k*2,c=a.c,y=-h;g.fillStyle='rgba(0,0,0,.28)';ell(g,0,0,w+1,4.5);g.fill();
 g.beginPath();g.moveTo(-w,0);g.quadraticCurveTo(-w-1,y*1.2,0,y*2-2);g.quadraticCurveTo(w+1,y*1.2,w,0);g.quadraticCurveTo(0,3,-w,0);g.closePath();g.globalAlpha=.92;fo(g,rad(g,-4,y*1.2,w,c),1.4);g.globalAlpha=1;
 ell(g,-1,y*.8,w*.45,h*.4);g.fillStyle=rgba('#20401a',.35);g.fill();spec(g,-w*.4,y*1.5,3,2,.8);
 for(const s of[-1,1]){ell(g,s*5,y*1.1,2.6,3.2);g.fillStyle='#fff';g.fill();ell(g,s*5,y*1.1+.8,1.4,1.8);g.fillStyle='#102010';g.fill()}
 g.strokeStyle='#103010';g.lineWidth=1.1;g.beginPath();g.arc(0,y*.75,3,.2,Math.PI-.2);g.stroke()}

const SP={};
function spr(a,f,back,z){const k=a.id+f+(back?'b':'f')+z;let c=SP[k];if(c)return c;const r=mk(130,160,z);c=r[0];const g=r[1];g.translate(65,145);fig(g,a,f,back);return SP[k]=c}
function drawFig(g,a,x,feet,s,f,back,z,sx=1,sy=1){const c=spr(a,((f%8)+8)%8,back,z);g.drawImage(c,x-65*s*sx,feet-145*s*sy,130*s*sx,160*s*sy)}

/* =================== projectiles & pickups =================== */
const PS={};
function pspr(k){if(PS[k])return PS[k];const[c,g]=mk(40,40,3);g.translate(20,20);
 if(k=='bolt'){glow(g,0,2,19,'#ffb81a');glow(g,0,-4,9,'#fff3a0');g.beginPath();g.moveTo(0,-15);g.lineTo(3,-7);g.lineTo(2,13);g.lineTo(-2,13);g.lineTo(-3,-7);g.closePath();fo(g,'#fffbe0',1)}
 if(k=='arrow'){glow(g,0,-9,11,'#7dff9a',.9);g.strokeStyle='#e0c890';g.lineWidth=2;g.beginPath();g.moveTo(0,-8);g.lineTo(0,14);g.stroke();g.beginPath();g.moveTo(0,-16);g.lineTo(3.4,-7);g.lineTo(-3.4,-7);g.closePath();fo(g,'#c8ffd4',1);g.fillStyle='#fff';g.beginPath();g.moveTo(0,10);g.lineTo(-4.5,17);g.lineTo(0,14);g.lineTo(4.5,17);g.fill()}
 if(k=='axe'){glow(g,0,0,16,'#ffb04a',.5);cap(g,0,10,0,-8,2.6,'#6a4020');for(const s of[-1,1]){g.beginPath();g.moveTo(0,-9);g.quadraticCurveTo(s*13,-14,s*12,-1);g.quadraticCurveTo(s*10,5,0,-1);g.closePath();fo(g,lin(g,-12,12,'#c8d2dc'),1.1)}}
 if(k=='fire'){glow(g,0,0,19,'#ff4a10');glow(g,0,0,10,'#ffcf4a');ell(g,0,0,3.6,3.6);g.fillStyle='#fff';g.fill()}
 if(k=='orb'){glow(g,0,0,17,'#20e8ff');glow(g,0,0,8,'#c8ffff');ell(g,0,0,3.4,3.4);g.fillStyle='#fff';g.fill()}
 if(k=='eb'){glow(g,0,0,15,'#ff1a5a');ell(g,0,0,5.6,5.6);fo(g,rad(g,0,0,5.6,'#ffb0d0'),1.2)}
 if(k=='ea'){glow(g,0,4,11,'#ff3a3a',.8);g.strokeStyle='#d8d0b8';g.lineWidth=2;g.beginPath();g.moveTo(0,-12);g.lineTo(0,8);g.stroke();g.beginPath();g.moveTo(0,15);g.lineTo(3.4,7);g.lineTo(-3.4,7);g.closePath();fo(g,'#ff8a8a',1)}
 if(k=='coin'){ell(g,0,0,7.5,7.5);fo(g,rad(g,0,0,7.5,'#ffc93a'),1.3);ell(g,0,0,4.4,4.4);g.strokeStyle='#c98a10';g.lineWidth=1.3;g.stroke();g.fillStyle='rgba(255,255,255,.8)';g.fillRect(-3.2,-4.5,1.8,4.5)}
 if(k=='heal'){glow(g,0,0,18,'#ff3a6a',.8);heart(g,0,1,8);fo(g,rad(g,0,0,9,'#ff4a7a'),1.3)}
 if(k=='shield'){glow(g,0,0,18,'#3ac8ff',.8);g.beginPath();g.moveTo(0,-9);g.lineTo(8,-6);g.quadraticCurveTo(8,6,0,10);g.quadraticCurveTo(-8,6,-8,-6);g.closePath();fo(g,rad(g,0,0,9,'#4ad8ff'),1.3)}
 return PS[k]=c}
function dp(g,k,x,y,s=1,rot=0){const c=pspr(k);if(rot){g.save();g.translate(x,y);g.rotate(rot);g.drawImage(c,-20*s,-20*s,40*s,40*s);g.restore()}else g.drawImage(c,x-20*s,y-20*s,40*s,40*s)}

/* =================== biomes =================== */
const BIOMES=[
 {n:'WHISPERING FOREST',grass:['#2a5532','#24492c','#31633a','#3a6e40'],road:['#7d7066','#736860','#86796e','#6c6159','#8a7d70'],gap:'#2a2430',tree:'#2f7a3a',rock:'#8a8296',fl:['#ffe36b','#ff8ab0','#ffffff','#9ad0ff'],moss:'rgba(80,130,60,.5)'},
 {n:'SCORCHED BADLANDS',grass:['#9a6e3a','#8a5e30','#a87a44','#7e5428'],road:['#a0603a','#8e5434','#b06c40','#7e4a2e','#a46440'],gap:'#3a2018',tree:'#7a7a2a',rock:'#a07050',fl:['#e8c070','#c84a2a','#f0d090'],moss:'rgba(60,40,20,.35)',dead:1},
 {n:'FROZEN PEAKS',grass:['#cfdcea','#bccbdc','#dfe8f2','#aebfd2'],road:['#7a8aa0','#6e7e94','#8898ae','#64748a','#8090a8'],gap:'#2a3040',tree:'#1f5a48',rock:'#9aa8ba',fl:['#ffffff','#bfe4ff'],moss:'rgba(220,235,255,.6)',pine:1},
 {n:'INFERNAL WASTES',grass:['#2a1412','#341a16','#20100e','#3a1e18'],road:['#3e3438','#342c30','#463a3e','#2e2629','#40363a'],gap:'#4a1408',tree:'#3a2a2a',rock:'#4a3a3a',fl:['#ff6a1a','#ffb03a'],moss:'rgba(255,80,20,.45)',lava:1}];
const TH=756,BGC={};
function srand(s){return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function makeBG(bi){if(BGC[bi])return BGC[bi];const T=BIOMES[bi],[c,g]=mk(W,TH,2),r=srand(7+bi*31),R=(a,b)=>a+r()*(b-a),P=a=>a[r()*a.length|0];
 const wr=(y,m,fn)=>{fn(y);if(y<m)fn(y+TH);if(y>TH-m)fn(y-TH)};
 g.fillStyle=T.grass[0];g.fillRect(0,0,W,TH);
 for(let i=0;i<1400;i++){const x=R(0,W),y=R(0,TH),col=P(T.grass),rx=R(2,6),ry=R(1,3);wr(y,6,yy=>{ell(g,x,yy,rx,ry);g.fillStyle=col;g.fill()})}
 const L=58,Rr=W-58;g.fillStyle=T.gap;g.fillRect(L-4,0,Rr-L+8,TH);
 for(let row=0;row<TH/14;row++){let x=L-R(0,20);const y=row*14;while(x<Rr){const w=R(15,27),cx=Math.max(x,L),cw=Math.min(x+w,Rr)-cx;
   if(cw>5){const base=P(T.road),i1=R(.8,2),i2=R(.8,2.2),i3=R(.8,2),i4=R(.6,1.8),rd=R(4,6),mo=r()<.1,mx=R(3,cw-3),my=R(3,11),mr=R(2,4.5);
    wr(y,16,yy=>{rr(g,cx+i1,yy+i2,cw-i1-i3,14-i2-i4,rd);const q=g.createLinearGradient(cx,yy,cx+cw*.4,yy+14);q.addColorStop(0,sh(base,.2));q.addColorStop(1,sh(base,-.22));g.fillStyle=q;g.fill();
     g.strokeStyle='rgba(24,16,22,.55)';g.lineWidth=1;g.stroke();g.fillStyle='rgba(255,240,220,.1)';ell(g,cx+cw*.4,yy+4.5,cw*.28,1.6);g.fill();
     if(mo){g.fillStyle=T.moss;ell(g,cx+mx,yy+my,mr,mr*.6);g.fill()}})}
   x+=w}}
 if(T.lava){for(let i=0;i<14;i++){const x=R(L+10,Rr-10),y=R(0,TH),pts=[];let px=x,py=y;for(let k=0;k<5;k++){px+=R(-12,12);py+=R(4,14);pts.push([px,py])}
   wr(y,80,yy=>{g.strokeStyle='rgba(255,90,20,.85)';g.lineWidth=1.6;g.shadowColor='#ff5a10';g.shadowBlur=6;g.beginPath();g.moveTo(x,yy);for(const[a,b]of pts)g.lineTo(a,b-y+yy);g.stroke();g.shadowBlur=0})}}
 {const q=g.createLinearGradient(L,0,Rr,0);q.addColorStop(0,'rgba(0,0,0,.25)');q.addColorStop(.5,'rgba(255,220,170,.06)');q.addColorStop(1,'rgba(0,0,0,.25)');g.fillStyle=q;g.fillRect(L,0,Rr-L,TH)}
 for(const ex of[L,Rr]){const q=g.createLinearGradient(ex-10,0,ex+10,0);q.addColorStop(ex==L?0:1,'rgba(0,0,0,0)');q.addColorStop(.5,'rgba(10,6,16,.45)');q.addColorStop(ex==L?1:0,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(ex-10,0,20,TH);
  for(let y=0;y<TH;y+=7){const x=ex+(ex==L?-1:1)*R(-3,4),rx=R(3,7),ry=R(3,6),col=P(T.grass.slice(1));wr(y,8,yy=>{ell(g,x,yy,rx,ry);g.fillStyle=col;g.fill()})}}
 for(let i=0;i<46;i++){const y=R(0,TH),x=r()<.5?R(-4,40):R(W-40,W+4),a=R(3,6),b=R(2,4);wr(y,8,yy=>{ell(g,x+2,yy+2,a,b);g.fillStyle='rgba(0,0,0,.3)';g.fill();ell(g,x,yy,a,b*1.1);g.fillStyle=rad(g,x,yy,5,T.rock);g.fill()})}
 for(let i=0;i<90;i++){const y=R(0,TH),x=r()<.5?R(0,44):R(W-44,W),col=P(T.fl);wr(y,4,yy=>{if(T.lava){glow(g,x,yy,5,col,.7);return}for(let k=0;k<4;k++){ell(g,x+Math.cos(k*1.57)*1.8,yy+Math.sin(k*1.57)*1.8,1.4,1.4);g.fillStyle=col;g.fill()}ell(g,x,yy,1,1);g.fillStyle='#ffd23a';g.fill()})}
 const trees=[];for(let side=0;side<2;side++)for(let y=0;y<TH;y+=R(70,120))trees.push([side?R(W-22,W+14):R(-14,22),y,R(20,30),r()]);
 for(const[x,y,s]of trees)wr(y,s+12,yy=>{ell(g,x+8,yy+10,s,s*.8);g.fillStyle='rgba(0,0,0,.35)';g.fill()});
 for(const[x,y,s,q]of trees)wr(y,s+12,yy=>{
  if(T.pine){for(let k=0;k<3;k++){const rr2=s*(1-k*.28);g.beginPath();for(let i=0;i<10;i++){const an=i/10*TAU,rd=i%2?rr2*.6:rr2;g.lineTo(x+Math.cos(an)*rd,yy-k*4+Math.sin(an)*rd)}g.closePath();g.fillStyle=rad(g,x,yy-k*4,rr2,T.tree);g.fill();g.strokeStyle='rgba(10,30,24,.6)';g.lineWidth=1;g.stroke()}ell(g,x-2,yy-10,s*.25,s*.18);g.fillStyle='rgba(255,255,255,.85)';g.fill();return}
  if(T.dead||T.lava){for(let k=0;k<3;k++){const a=k*2.1+q*6,ln=s*.9;g.strokeStyle=T.lava?'#1a0e0e':'#5a3a20';g.lineWidth=4-k;g.lineCap='round';g.beginPath();g.moveTo(x,yy);g.lineTo(x+Math.cos(a)*ln,yy+Math.sin(a)*ln);g.stroke()}ell(g,x,yy,s*.35,s*.35);g.fillStyle=rad(g,x,yy,s*.35,T.lava?'#2a1a1a':'#6a4a2a');g.fill();if(T.lava)glow(g,x,yy,s*.8,'#ff4a10',.25);return}
  for(const[dx,dy,k]of[[-s*.4,s*.2,.7],[s*.4,s*.25,.7],[0,-s*.3,.75],[0,0,.8]]){ell(g,x+dx,yy+dy,s*k,s*k);g.fillStyle=rad(g,x+dx,yy+dy,s*k,T.tree);g.fill();g.lineWidth=1.2;g.strokeStyle='rgba(10,30,14,.6)';g.stroke()}
  for(let k=0;k<5;k++){ell(g,x+R(-s*.5,s*.3),yy+R(-s*.6,s*.1),R(2,4),R(2,3));g.fillStyle='rgba(180,240,140,.25)';g.fill()}});
 return BGC[bi]=c}
function makeVG(){const[c,g]=mk(W,H,1);let q=g.createRadialGradient(W/2,H*.55,H*.25,W/2,H*.55,H*.75);q.addColorStop(0,'rgba(8,4,16,0)');q.addColorStop(1,'rgba(8,4,16,.6)');g.fillStyle=q;g.fillRect(0,0,W,H);
 q=g.createLinearGradient(0,0,0,H*.35);q.addColorStop(0,'rgba(20,8,40,.55)');q.addColorStop(1,'rgba(20,8,40,0)');g.fillStyle=q;g.fillRect(0,0,W,H*.35);VG=c}
function bg(d,bi,a=1){const o=d%TH,B=makeBG(bi);X.globalAlpha=a;for(let y=o-TH;y<H;y+=TH)X.drawImage(B,0,y,W,TH);X.globalAlpha=1}
function fit(){DPR=window.devicePixelRatio||1;cv.width=Math.round(innerWidth*DPR);cv.height=Math.round(innerHeight*DPR);S=cv.width/W;H=cv.height/S;makeVG();const hc=$('hc');if(hc)hc.width=hc.height=Math.round(210*DPR)}
addEventListener('resize',fit);

/* =================== audio =================== */
let AC=null,NB=null;
function au(force){if(muted&&!force)return null;try{if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();NB=AC.createBuffer(1,AC.sampleRate*.6|0,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}if(AC.state=='suspended')AC.resume();return AC}catch(e){return null}}
function tone(f1,f2,dur,type,vol,delay=0){const a=au();if(!a)return;const t=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+.03)}
function noise(dur,vol,fq){const a=au();if(!a)return;const t=a.currentTime,s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=NB;f.type='lowpass';f.frequency.value=fq;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0008,t+dur);s.connect(f);f.connect(g);g.connect(a.destination);s.start(t);s.stop(t+dur)}
const SFX={shoot:()=>tone(880,520,.05,'triangle',.02),hit:()=>tone(320,170,.05,'square',.02),kill:()=>{noise(.16,.1,1800);tone(460,90,.14,'square',.035)},
 coin:()=>{tone(1320,1320,.05,'square',.022);tone(1980,1980,.08,'square',.022,.045)},good:()=>[523,659,784,1046].forEach((f,i)=>tone(f,f,.11,'square',.045,i*.055)),
 bad:()=>[392,311,233].forEach((f,i)=>tone(f,f*.92,.13,'sawtooth',.045,i*.08)),hurt:()=>{noise(.25,.22,700);tone(220,60,.3,'sawtooth',.07)},
 boss:()=>{tone(110,40,1.4,'sawtooth',.1);noise(1.2,.1,260)},big:()=>{noise(.9,.28,900);tone(170,30,.9,'square',.09)},click:()=>tone(660,990,.06,'triangle',.06),
 pick:()=>tone(600,1400,.16,'triangle',.07),warn:()=>{tone(440,440,.18,'square',.05);tone(440,440,.18,'square',.05,.3)},buy:()=>[784,988,1318].forEach((f,i)=>tone(f,f,.12,'triangle',.07,i*.07)),
 boom:()=>{noise(.4,.22,700);tone(120,40,.4,'square',.06)},shieldbreak:()=>{noise(.2,.15,3000);tone(900,200,.25,'square',.04)},zap:()=>tone(300,900,.18,'sawtooth',.03),stage:()=>[392,523,659,784,1046].forEach((f,i)=>tone(f,f,.16,'triangle',.06,i*.09))};
const lastS={};function sfx(n,min=0){if(muted)return;const t=performance.now();if(t-(lastS[n]||0)<min)return;lastS[n]=t;try{SFX[n]()}catch(e){}}
/* ---- procedural soundtrack ---- */
const MUS={on:false,next:0,step:0,mode:'menu',gain:null,timer:null};
const NF=n=>440*Math.pow(2,(n-69)/12);
const SONGS={menu:{bpm:84,prog:[[57,60,64],[53,57,60],[55,59,62],[52,56,59]],bass:[45,41,43,40],arp:1,drum:0},
 battle:{bpm:126,prog:[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],bass:[45,41,36,43],arp:2,drum:1},
 boss:{bpm:146,prog:[[57,60,63],[56,59,62],[57,60,63],[59,62,65]],bass:[45,44,45,47],arp:2,drum:2}};
function mnote(f,t,d,type,v,pad){const a=AC,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;if(pad){const fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.value=900;o.connect(fl);fl.connect(g)}else o.connect(g);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+(pad?.5:.008));g.gain.exponentialRampToValueAtTime(.0005,t+d);g.connect(MUS.gain);o.start(t);o.stop(t+d+.05)}
function mkick(t){const a=AC,o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+.14);g.gain.setValueAtTime(.32,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(g);g.connect(MUS.gain);o.start(t);o.stop(t+.22)}
function mnoise(t,hp,v,d){const a=AC,s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=NB;f.type='highpass';f.frequency.value=hp;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);g.connect(MUS.gain);s.start(t,Math.random()*.3,d+.02)}
function musTick(){const a=AC;if(!a||!MUS.on||!MUS.gain)return;const S2=SONGS[MUS.mode],spb=60/S2.bpm/4;if(MUS.next<a.currentTime)MUS.next=a.currentTime+.05;
 while(MUS.next<a.currentTime+.2){const t=MUS.next,st=MUS.step,bar=(st>>4)%4,ch=S2.prog[bar],b=st%16;
  if(b%4==0||(S2.drum&&b%4==3))mnote(NF(S2.bass[bar]),t,spb*(S2.drum?1.6:3.5),'triangle',.13);
  if(S2.arp==2||b%2==0){const n=ch[(S2.arp==2?st:st>>1)%3]+12*(1+((st>>3)&1));mnote(NF(n),t,spb*.9,'square',S2.drum?.016:.022)}
  if(b==0)for(const n of ch)mnote(NF(n),t,spb*16,'sawtooth',.014,1);
  if(S2.drum){if(b%4==0)mkick(t);if(b%8==4)mnoise(t,1400,.13,.16);if(b%2==0)mnoise(t,7000,S2.drum==2?.035:.02,.04)}
  MUS.next+=spb;MUS.step++}}
function music(mode){if(mode)MUS.mode=mode;if(!SET.mus||window.__sim){musStop();return}const a=au(1);if(!a)return;if(!MUS.on){MUS.on=true;MUS.gain=a.createGain();MUS.gain.gain.value=.5;MUS.gain.connect(a.destination);MUS.next=a.currentTime+.1;MUS.step=0;MUS.timer=setInterval(musTick,40)}}
function musStop(){MUS.on=false;clearInterval(MUS.timer);if(MUS.gain){try{MUS.gain.disconnect()}catch(e){}MUS.gain=null}}
function musVol(v){if(MUS.gain&&AC)MUS.gain.gain.setTargetAtTime(v,AC.currentTime,.1)}
function buzz(ms){if(!SET.hapt||window.__sim)return;try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}}

/* =================== BALANCE MODEL ===================
 Hero power budget  P = DPS_eff x EHP  (all heroes ~= 17-18)
 Upgrades: diminishing returns  mult(n) = 1 + MAX*(1-e^(-C*n))  -> runaway-proof
 Enemy HP: exponential  base * 1.2^(stage-1)  (front-loaded easy)
 Stage pacing: sawtooth - waves ramp 70%->120% budget, lull, boss spike, rest valley */
const BAL={hpGrow:1.3,spdGrow:.055,rateMax:.9,rateC:.32,dmgMax:1.3,dmgC:.28,negK:.18,shotsMax:5,shotExp:.78,bossHP:240,bossGrow:1.34};
const rateMul=n=>n>=0?1+BAL.rateMax*(1-Math.exp(-BAL.rateC*n)):1/(1+BAL.negK*-n);
const dmgMul=n=>n>=0?1+BAL.dmgMax*(1-Math.exp(-BAL.dmgC*n)):1/(1+BAL.negK*-n);
const shotF=n=>Math.pow(n,BAL.shotExp)/n;
const hpMul=s=>Math.pow(BAL.hpGrow,s-1);
const ET={
 imp:   {rig:'imp',  hp:1,  v:100,r:13,s:.8,val:1,cost:1,from:1,home:.5},
 gob:   {rig:'gob',  hp:3,  v:68, r:15,s:.88,val:2,cost:2,from:1,home:.3},
 bat:   {rig:'bat',  hp:1.4,v:118,r:13,s:.82, val:1,cost:1,from:2,fly:1},
 archer:{rig:'skel', hp:4,  v:62, r:15,s:.9,val:3,cost:3,from:2,shoot:1},
 slime: {rig:'slime',hp:6,  v:44, r:18,s:1,val:3,cost:3,from:3,split:1},
 brute: {rig:'brute',hp:15, v:36, r:24,s:1.04, val:6,cost:5,from:3,heavy:1},
 bomber:{rig:'bomber',hp:2.5,v:90,r:15,s:.88,val:2,cost:2,from:4,bomb:1,home:1.2},
 knight:{rig:'dknight',hp:11,v:40,r:20,s:1,val:6,cost:5,from:4,shield:1,heavy:1},
 shaman:{rig:'necro',hp:9,  v:52, r:16,s:.96,val:7,cost:6,from:5,summon:1},
 slimeS:{rig:'slimeS',hp:2, v:60, r:12,s:.62,val:1,cost:1,from:99}};
const BOSSES=[{rig:'ogre',name:'OGRE KING',s:1.8,pats:['spread','ring','burst','sweep']},{rig:'bonelord',name:'BONE WARLORD',s:1.8,pats:['sweep','summon','spread','burst']},{rig:'demonlord',name:'DEMON LORD',s:1.78,pats:['spiral','ring','spread','sweep']}];
const NEWS={2:'NEW: Bats & Skeleton Archers',3:'NEW: Slimes & Brutes',4:'NEW: Bombers & Dark Knights',5:'NEW: Necromancers'};

/* =================== skills / forge / codex =================== */
const RAR={common:'#9ab8d8',rare:'#4ab0ff',epic:'#c06aff',legendary:'#ffb21f'};
const SK=[
 {k:'multi',n:'Multishot',d:'+1 projectile per volley',ic:'⇈',max:3,rar:'epic'},
 {k:'crit',n:'Critical Eye',d:'+15% chance to deal 2.5× damage',ic:'◎',max:3,rar:'rare'},
 {k:'side',n:'Side Shots',d:'Also fire two diagonal shots',ic:'⟰',max:2,rar:'rare'},
 {k:'rico',n:'Ricochet',d:'Shots bounce to another enemy',ic:'↯',max:2,rar:'epic'},
 {k:'blades',n:'Orbiting Blades',d:'Spectral blades circle and cut foes',ic:'✦',max:3,rar:'epic'},
 {k:'frost',n:'Frost Touch',d:'Hits slow enemies by 35%',ic:'❄',max:1,rar:'rare'},
 {k:'heart',n:'Vital Surge',d:'+1 max heart and heal fully',ic:'♥',max:3,rar:'common'},
 {k:'ward',n:'Aegis Ward',d:'Regain a shield every 25 seconds',ic:'⛨',max:1,rar:'rare'},
 {k:'boom',n:'Blast Rounds',d:'Slain enemies explode',ic:'✸',max:2,rar:'legendary'},
 {k:'power',n:'Power Up',d:'+20% damage',ic:'⚔',max:5,rar:'common'},
 {k:'haste',n:'Haste',d:'+15% fire rate',ic:'⚡',max:5,rar:'common'}];
const TAL=[
 {k:'dmg',n:'Sharpened Steel',d:'+6% damage per level',ic:'⚔',max:5,c:[100,200,350,550,800]},
 {k:'rate',n:'Quick Hands',d:'+5% fire rate per level',ic:'⚡',max:5,c:[100,200,350,550,800]},
 {k:'hp',n:'Vitality',d:'+1 max heart per level',ic:'♥',max:2,c:[450,1200]},
 {k:'coin',n:'Greed',d:'+10% coins per level',ic:'●',max:5,c:[80,160,280,450,700]},
 {k:'shield',n:'Aegis',d:'Start every stage with a shield',ic:'⛨',max:1,c:[650]},
 {k:'luck',n:'Fortune',d:'+25% heart & shield drops',ic:'✚',max:3,c:[150,300,500]},
 {k:'reroll',n:'Insight',d:'+1 skill reroll per pick',ic:'↻',max:2,c:[300,700]}];
const CODEX={imp:['Imp','Fast, fragile swarmer that comes in packs.'],gob:['Goblin','Sturdier grunt that drifts toward you.'],bat:['Cave Bat','Weaves in flocks. Hard to pin down.'],archer:['Skeleton Archer','Stops at range to fire aimed arrows. Watch for the red glow.'],
 slime:['Slime','Splits into two smaller slimes when slain.'],brute:['Brute','Slow armored tank. Barely flinches.'],bomber:['Goblin Bomber','Rushes you. Its blast also hurts nearby enemies.'],knight:['Dark Knight','Shield blocks 70% of damage until it breaks.'],shaman:['Necromancer','Summons imps from the back line. Kill it first.'],
 b0:['Ogre King','Fans, rings and bursts. Learn the rhythm.'],b1:['Bone Warlord','Walls of bone with one gap. Summons archers.'],b2:['Demon Lord','Spirals of hellfire. Keep moving.']};
const DAYR=[60,90,120,160,200,260,500];
/* =================== game state =================== */
const SCROLL=110,GS_={shots:{lab:'SHOTS',k:14},rate:{lab:'FIRE RATE',k:6},dmg:{lab:'DAMAGE',k:6}};
let G=null,st='menu',last=0,menuT=0;
function show(id){['m','p','o','sk','tal','cod','dly','set'].forEach(k=>$(k).classList.toggle('on',k==id));$('pz').style.display=st=='play'?'grid':'none'}
function start(){const base=RACES.find(a=>a.id==sel)||RACES[0],r=Object.assign({},base);r.dmg*=1+.06*ml('dmg');r.rate*=1+.05*ml('rate');const mh=r.hp+ml('hp');
 G={r,t:0,dist:0,sc:0,co:0,kills:0,stage:0,hp:mh,mh,sk:{},skT:0,coinMul:1+.1*ml('coin'),dropMul:1+.25*ml('luck'),A:[],ang:0,px:W/2,tx:W/2,lv:{shots:1,rate:0,dmg:0},cd:0,inv:0,sh:0,rev:r.revive||0,shk:0,hf:0,slow:1,dead:0,mf:0,
  E:[],B:[],EB:[],Gt:[],P:[],T:[],D:[],C:[],K:[],boss:null,ban:0,cpop:0,bi:0,obi:0,bif:0,phase:'rest',pt:1.2,waves:[],wi:0,q:[],wt:0,banner:null};
 nextStage();st='play';show(null);sfx('click');music('battle');openPick('CHOOSE YOUR FIRST SKILL','Shape your build for this run')}
function rollSkills(){const g=G,pool=SK.filter(k=>(g.sk[k.k]||0)<k.max),w=k=>({common:5,rare:3.2,epic:2,legendary:1}[k.rar]),out=[];
 while(out.length<3&&pool.length){let x=Math.random()*pool.reduce((a,k)=>a+w(k),0),i=0;for(;i<pool.length-1;i++){x-=w(pool[i]);if(x<=0)break}out.push(pool.splice(i,1)[0])}return out}
let pickRR=0;
function openPick(t,sub){const g=G;pickRR=1+ml('reroll');const opts=rollSkills();if(!opts.length)return;
 if(window.__sim){takeSkill(pick(opts));return}
 st='pick';$('skT').textContent=t;$('skS').textContent=sub;renderPick(opts);show('sk');musVol(.3)}
function renderPick(opts){const L=$('skL');L.innerHTML='';const g=G;
 for(const k of opts){const b=document.createElement('button'),lv=g.sk[k.k]||0;b.className='skc';b.style.setProperty('--rc',RAR[k.rar]);
  b.innerHTML=`<div class="ic">${k.ic}</div><div><b>${k.n}${lv?' <small style="color:#ffd84a">Lv'+(lv+1)+'</small>':''}</b><span>${k.d}</span></div><em>${k.rar.toUpperCase()}</em>`;
  b.onclick=()=>{takeSkill(k);st='play';show(null);musVol(.5)};L.append(b)}
 $('skR').textContent='REROLL ('+pickRR+')';$('skR').classList.toggle('dis',pickRR<=0)}
function takeSkill(k){const g=G;g.sk[k.k]=(g.sk[k.k]||0)+1;sfx('buy');if(k.k=='heart'){g.mh++;g.hp=g.mh}if(k.k=='ward')g.sh=1;
 if(!window.__sim){txt(g.px,H-200,k.n.toUpperCase()+'!',RAR[k.rar],22,1.4);ring(g.px,H-130,RAR[k.rar],90);part(g.px,H-130,RAR[k.rar],30,260,'g')}}
function nextStage(){const g=G;g.stage++;if(ml('shield'))g.sh=1;g.obi=g.bi;g.bi=(g.stage-1)%4;g.bif=g.stage>1?1:0;g.waves=makeWaves(g.stage);g.wi=0;g.q=[];g.phase='rest';g.pt=g.stage==1?1.2:2.6;
 g.banner={t:2.6,a:'STAGE '+g.stage,b:BIOMES[g.bi].n,c:NEWS[g.stage]||''}}
function makeWaves(s){const nW=Math.min(8,4+Math.ceil(s/2)),B=6+s*5+Math.max(0,s-4)*2,roster=Object.keys(ET).filter(k=>ET[k].from<=s),fresh=roster.filter(k=>ET[k].from==s),out=[];
 for(let i=0;i<nW;i++){let bud=B*(.7+.5*i/Math.max(1,nW-1))*(i==0?(s==1?.55:.8):1);const list=[];
  if(fresh.length&&i<2){const k=fresh[i%fresh.length];list.push(k);if(ET[k].fly)for(let j=0;j<4;j++)list.push(k);bud-=ET[k].cost*(ET[k].fly?5:1)}
  let guard=0;while(bud>0&&guard++<60){const w=roster.map(k=>[k,1/ET[k].cost+(k=='imp'?.6:0)]),tot=w.reduce((a,b)=>a+b[1],0);let x=Math.random()*tot,k=w[0][0];for(const[kk,ww]of w){x-=ww;if(x<=0){k=kk;break}}
   if(ET[k].fly){for(let j=0;j<5;j++)list.push(k);bud-=5*ET[k].cost}else{list.push(k);bud-=ET[k].cost}}
  out.push({list,gate:i>0&&i%2==1})}
 return out}
function queueWave(w){const g=G,fm=pick(['line','v','column','sides','scatter']),n=w.list.length;let flyX=rnd(60,W-60);
 w.list.forEach((k,i)=>{let x,d;
  if(ET[k].fly){x=flyX+rnd(-30,30);d=i*.12}
  else if(fm=='line'){x=40+(W-80)*((i%6)+.5)/Math.min(6,n);d=Math.floor(i/6)*1.1}
  else if(fm=='v'){const c=(i%7)-3;x=W/2+c*34;d=Math.abs(c)*.22+Math.floor(i/7)*1.4}
  else if(fm=='column'){x=i%2?W*.3:W*.7;d=i*.45}
  else if(fm=='sides'){x=i%2?50:W-50;d=Math.floor(i/2)*.55}
  else{x=rnd(36,W-36);d=i*.32}
  g.q.push({k,x:cl(x,30,W-30),d})});
 if(w.gate){const gd=Math.random()<.5;g.Gt.push({y:-110,L:mkG(gd||Math.random()<.35),R:mkG(!gd||Math.random()<.35)})}}
function addE(k,x,y,extra){const d=ET[k],g=G,m=hpMul(g.stage),e={k,d,a:RG[d.rig],x,y,vx:0,vy:0,r:d.r,hp:d.hp*m,mh:d.hp*m,v:d.v*(1+BAL.spdGrow*(g.stage-1)),val:d.val,s:d.s,ph:rnd(0,8),dist:rnd(0,40),fl:-1,burn:0,kb:0,sq:0,t:0,state:'walk',st:0,shots:0,bx:x,stopY:rnd(H*.16,H*.3),sum:0};
 if(d.shield){e.shp=e.mh*.6}if(!seen[k]&&CODEX[k]){seen[k]=1}
 Object.assign(e,extra||{});g.E.push(e);return e}
function spawnBoss(){const g=G,bd=BOSSES[(g.stage-1)%3],hp=BAL.bossHP*Math.pow(BAL.bossGrow,g.stage-1);
 g.boss={b:1,bd,k:'boss',d:{},a:RG[bd.rig],x:W/2,y:-140,vx:0,vy:0,r:44,hp,mh:hp,val:30+g.stage*15,s:bd.s,ph:0,dist:0,fl:-1,burn:0,kb:0,sq:0,t:0,cd:2.4,pi:0,q:0,qc:0,chg:0,spin:0};
 g.E.push(g.boss);g.shk=.5;sfx('boss');buzz(120);music('boss');seen['b'+((g.stage-1)%3)]=1}
function txt(x,y,s,c,sz=22,l=1.1){G.T.push({x,y,s,c,sz,l,L:l})}
function part(x,y,c,n,sp=180,kind='c'){for(let i=0;i<n;i++){const a=rnd(0,TAU),v=rnd(.3,1)*sp;G.P.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(kind=='c'?60:0),l:rnd(.35,.8),L:.8,c,k:kind,r:rnd(0,TAU),s:rnd(2,4.5)})}}
function ring(x,y,c,r=40){G.P.push({x,y,vx:0,vy:0,l:.4,L:.4,c,k:'r',s:r})}
function mkG(good){const s=pick(['shots','rate','dmg','rate','dmg']);const v=s=='shots'?1:1+(Math.random()<.4?1:0);return{s,v:good?v:-v,h:0,pulse:0}}
function gDelta(o){const L=G.lv;if(o.s=='shots'){const n=cl(L.shots+o.v,1,BAL.shotsMax)-L.shots;return{t:(n>=0?'+':'')+n,n}}
 const f=o.s=='rate'?rateMul:dmgMul,cur=f(L[o.s]),nx=f(L[o.s]+o.v),p=Math.round((nx/cur-1)*100);return{t:(p>=0?'+':'')+p+'%',n:p}}
function power(L){return rateMul(L.rate)*dmgMul(L.dmg)*L.shots*shotF(L.shots)}
function apply(o){const g=G,dl=gDelta(o);
 if(o.s=='shots')g.lv.shots=cl(g.lv.shots+o.v,1,BAL.shotsMax);else g.lv[o.s]=cl(g.lv[o.s]+o.v,-6,20);
 const good=o.v>0;txt(g.px,H-180,dl.t+' '+GS_[o.s].lab,good?'#7dffb0':'#ff6b7b',24,1.3);ring(g.px,H-130,good?'#4ac8ff':'#ff3a4a',70);part(g.px,H-130,good?'#7ad8ff':'#ff5a6a',22,240,'g');sfx(good?'good':'bad');if(!good)buzz(40)}
function hurt(n){const g=G;if(g.inv>0||g.dead)return;g.shk=.35;g.hf=1;buzz(70);sfx('hurt');
 if(g.sh>0){g.sh=0;g.inv=.9;txt(g.px,H-180,'BLOCKED!','#9fe8ff');ring(g.px,H-130,'#4ad8ff',60);return}
 g.hp-=n;g.inv=1.4;part(g.px,H-130,'#ff4a5a',16,200);
 if(g.hp<=0){if(g.rev>0){g.rev--;g.hp=g.mh;g.inv=2.8;txt(g.px,H-200,'RISEN AGAIN!','#5ff',26,1.6);ring(g.px,H-130,'#3ff0ff',120);part(g.px,H-130,'#5ff',40,300,'g');sfx('good');for(const b of g.EB)b.dead=1}
  else{g.dead=1.4;g.slow=.25;part(g.px,H-130,g.r.pc,50,320,'g');part(g.px,H-130,g.r.armor,24,260);ring(g.px,H-130,'#fff',140);sfx('big');buzz(200)}}}
function over(){const g=G;st='over';g.sc=Math.floor(g.sc);for(const c of g.C)g.co+=c.v;g.C=[];g.co=Math.round(g.co);coins+=g.co;const nb=g.sc>best;best=Math.max(best,g.sc);bestSt=Math.max(bestSt,g.stage);LS.set('coins',coins);LS.set('best',best);LS.set('bestSt',bestSt);LS.set('seen',seen);
 if(window.__sim)return;music('menu');
 $('nb').style.display=nb?'block':'none';$('ost').textContent=g.stage;$('okl').textContent=g.kills;show('o');
 const t0=performance.now(),A=g.sc,Bc=g.co;(function cnt(){const k=Math.min(1,(performance.now()-t0)/900),e=1-Math.pow(1-k,3);$('osc').textContent=Math.round(A*e);$('oc').textContent='+'+Math.round(Bc*e);if(k<1&&st=='over')requestAnimationFrame(cnt)})()}
function corpse(e){const g=G;if(e.d.fly||e.a.kind){return}g.K.push({a:e.a,x:e.x,y:e.y,s:e.s,f:(e.dist*.12|0),t:0,rot:rnd(-.5,.5)})}
function kill(e,silent,chain){const g=G;if(e.dead)return;g.kills++;e.dead=1;g.sc+=e.val*10;
 if(!silent){part(e.x,e.y,e.a.skin||e.a.c||'#5a4a6a',e.b?40:10,e.b?320:190);part(e.x,e.y,'#ffe8a0',e.b?40:7,e.b?380:220,'g');ring(e.x,e.y,'#fff',e.r*2);sfx('kill',40)}
 corpse(e);
 const cv=e.val*.3,n=e.b?24:Math.max(1,Math.min(4,Math.round(cv))),each=cv*g.coinMul/n;if(g.sk.boom&&!chain&&!e.b)explode(e.x,e.y,38+12*g.sk.boom,r0dmg()*1.6*g.sk.boom,1);for(let i=0;i<n;i++){const a=rnd(0,TAU),v=rnd(60,e.b?320:150);g.C.push({x:e.x,y:e.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,v:each})}
 if(e.d.split){for(const s of[-1,1])addE('slimeS',e.x+s*12,e.y,{vx:s*90,hp:ET.slimeS.hp*hpMul(g.stage)*1,mh:ET.slimeS.hp*hpMul(g.stage)})}
 if(e.d.bomb)explode(e.x,e.y,62,6*hpMul(g.stage));
 if(e.b){g.boss=null;g.slow=.2;g.shk=.6;buzz(150);sfx('big');for(const b of g.EB)b.dead=1;txt(W/2,H*.38,'STAGE CLEAR!','#ffd84a',34,2.2);for(let i=0;i<4;i++)ring(e.x,e.y,'#ffd84a',80+i*50);
  g.phase='clear';g.pt=2.6;if(g.hp<g.mh){g.hp++;txt(g.px,H-200,'+1 HEART','#ff8aa8',20,1.6)}sfx('stage')}
 else if(Math.random()<.05*g.dropMul)g.D.push({x:e.x,y:e.y,k:Math.random()<.5?'heal':'shield',t:0})}
function r0dmg(){const g=G;return g.r.dmg*dmgMul(g.lv.dmg)*(1+.2*(g.sk.power||0))}
function explode(x,y,r,dmg,chain){const g=G;sfx('boom',80);g.shk=Math.max(g.shk,.25);part(x,y,'#ff9a2a',26,260,'g');part(x,y,'#3a2a20',14,200);ring(x,y,'#ffb04a',r*1.2);
 for(const o of g.E)if(!o.dead&&!o.b&&Math.hypot(o.x-x,o.y-y)<r+o.r){o.hp-=dmg;o.fl=.08;if(o.hp<=0)kill(o,0,chain)}}
function shoot(e,a,sp,k='eb'){sp*=1+Math.min(.45,(G.stage-1)*.04);G.EB.push({x:e.x+Math.cos(a)*10,y:e.y+Math.sin(a)*10,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,k})}

/* =================== update =================== */
function upd(rdt){const g=G,r=g.r,py=H-130;g.slow=Math.min(1,g.slow+rdt*1.3);const dt=rdt*g.slow;
 g.t+=dt;g.dist+=SCROLL*dt;g.inv-=dt;g.shk-=rdt;g.hf=Math.max(0,g.hf-rdt*2.5);g.mf-=dt;g.cpop=Math.max(0,g.cpop-rdt*4);g.bif=Math.max(0,g.bif-rdt*.7);
 if(g.banner){g.banner.t-=rdt;if(g.banner.t<=0)g.banner=null}
 g.px+=(g.tx-g.px)*Math.min(1,dt*20);
 if(g.dead){g.dead-=rdt;if(g.dead<=0){over();return}}
 else{g.sc+=dt*3;
  const K=g.sk;g.cd-=dt;if(g.cd<=0){const L=g.lv;g.cd=1/(r.rate*rateMul(L.rate)*(1+.15*(K.haste||0)));const n=cl(L.shots+(K.multi||0),1,8),d=r.dmg*dmgMul(L.dmg)*(1+.2*(K.power||0))*shotF(n);g.mf=.06;sfx('shoot',70);
   for(let i=0;i<n;i++){const o=i-(n-1)/2;g.B.push({x:g.px+o*9,y:py-44,vx:o*32,vy:-620,d,p:r.pierce||0,hit:[],rot:0,home:r.home,rc:K.rico||0})}
   if(K.side)for(const s of[-1,1])g.B.push({x:g.px+s*8,y:py-40,vx:s*250,vy:-560,d:d*(K.side>1?1:.6)*Math.max(1,n*shotF(n)*.5),p:0,hit:[],rot:0,rc:0})}
  if(K.ward&&g.sh==0){g.skT+=dt;if(g.skT>25){g.skT=0;g.sh=1;ring(g.px,H-130,'#4ad8ff',60);sfx('pick')}}
  if(K.blades){g.ang+=dt*4.2;const nb=K.blades+1,bd=r.dmg*dmgMul(g.lv.dmg)*(1+.2*(K.power||0))*1.3;for(let i=0;i<nb;i++){const a=g.ang+i*TAU/nb,bx=g.px+Math.cos(a)*52,by=py-18+Math.sin(a)*40;
    for(const e of g.E){if(e.dead||(e.bcd||0)>g.t)continue;if(Math.hypot(e.x-bx,e.y-by)<e.r+12){e.hp-=bd;e.bcd=g.t+.35;e.fl=.05;e.sq=1;g.P.push({x:bx,y:by,vx:rnd(-80,80),vy:rnd(-80,80),l:.2,L:.2,c:'#c8a0ff',k:'g',s:3});if(e.hp<=0)kill(e)}}}}}
 // ---- stage director ----
 const alive=g.E.filter(e=>!e.b).length;
 if(g.phase=='rest'){g.pt-=dt;if(g.pt<=0){g.phase='waves';g.wi=0;queueWave(g.waves[0]);g.wt=0}}
 else if(g.phase=='waves'){g.wt+=dt;for(const q of g.q)q.d-=dt;const due=g.q.filter(q=>q.d<=0);g.q=g.q.filter(q=>q.d>0);
  for(const q of due)addE(q.k,q.x,-40-rnd(0,20));
  if(!g.q.length&&(alive<=1||g.wt>13)){if(g.wi<g.waves.length-1){g.wi++;g.wt=0;queueWave(g.waves[g.wi])}else if(alive==0){g.phase='lull';g.pt=1.4}}}
 else if(g.phase=='lull'){g.pt-=dt;if(g.pt<=0){g.phase='warn';g.ban=2.6;sfx('warn')}}
 else if(g.phase=='warn'){g.ban-=rdt;if(g.ban<=0){g.ban=0;g.phase='boss';spawnBoss()}}
 else if(g.phase=='clear'){g.pt-=dt;if(g.pt<=0){nextStage();music('battle');openPick('STAGE '+(g.stage-1)+' CLEARED','Claim your reward')}}
 // ---- bullets ----
 for(const b of g.B){if(b.home){let tg=null,bd=1e9;for(const e of g.E){if(e.dead||e.y>b.y)continue;const d=Math.abs(e.x-b.x)+(b.y-e.y)*.4;if(d<bd){bd=d;tg=e}}if(tg){const want=cl((tg.x-b.x)*3,-260,260);b.vx+=(want-b.vx)*Math.min(1,dt*4)}}
  b.x+=b.vx*dt;b.y+=b.vy*dt;b.rot+=dt*18}
 // ---- gates ----
 for(const t of g.Gt){t.y+=SCROLL*dt;for(const o of[t.L,t.R])o.pulse=Math.max(0,o.pulse-dt*5);
  for(const b of g.B){if(b.dead||b.y<t.y||b.y>t.y+56)continue;const o=b.x<W/2?t.L:t.R;b.dead=1;o.pulse=1;
   if(++o.h>=GS_[o.s].k&&o.v<(o.s=='shots'?1:3)){o.h=0;o.v++;if(o.v==0)o.v=1;txt(b.x<W/2?W/4:W*.75,t.y-6,'UP!','#bfe8ff',16,.6)}
   if(Math.random()<.4)g.P.push({x:b.x,y:t.y+56,vx:rnd(-50,50),vy:rnd(20,80),l:.25,L:.25,c:o.v>0?'#7ad8ff':'#ff7a8a',k:'g',s:3})}
  if(!t.used&&t.y+56>=py-14&&!g.dead){t.used=1;apply(g.px<W/2?t.L:t.R)}}
 g.Gt=g.Gt.filter(t=>!t.used&&t.y<H);
 // ---- enemies ----
 for(const e of g.E){if(e.dead)continue;e.t+=dt;e.fl-=dt;e.sq=Math.max(0,e.sq-dt*6);
  if(e.b)bossAI(e,dt,py);else enemyAI(e,dt,py);
  if(e.burn>0){e.burn-=dt;e.hp-=dt*r.burn*dmgMul(g.lv.dmg);if(Math.random()<.4)g.P.push({x:e.x+rnd(-8,8),y:e.y+rnd(-10,6),vx:rnd(-10,10),vy:-50,l:.35,L:.35,c:'#ff7a1a',k:'g',s:4})}
  for(const b of g.B){if(b.dead||b.hit.includes(e))continue;const dx=b.x-e.x,dy=b.y-e.y,rr2=e.r+6+(r.big||0);
   if(dx*dx+dy*dy<rr2*rr2){let dm=b.d;if(e.shp>0&&b.y>e.y-10){const ab=dm*.7;e.shp-=ab;dm*=.3;if(e.shp<=0){e.a=RG.dknight2;sfx('shieldbreak');part(e.x-8,e.y,'#8a8e9a',14,180);txt(e.x,e.y-40,'BROKEN!','#ffd0a0',14,.8)}else g.P.push({x:b.x,y:b.y,vx:rnd(-80,80),vy:rnd(-40,40),l:.18,L:.18,c:'#e0e8ff',k:'g',s:3})}
    if(g.sk.crit&&Math.random()<.15*g.sk.crit){dm*=2.5;txt(e.x+rnd(-10,10),e.y-30,'CRIT','#ffe04a',13,.5)}if(g.sk.frost)e.slow=1.5;
    e.hp-=dm;if(e.fl<-.06)e.fl=.05;e.sq=1;if(!e.b&&!e.d.heavy)e.kb=Math.min(e.kb+40,110);else if(!e.b)e.kb=Math.min(e.kb+10,30);
    b.hit.push(e);if(r.burn)e.burn=2.5;if(b.p>0)b.p--;else if(b.rc>0){let tg=null,bd2=170;for(const o of g.E){if(o.dead||o==e||b.hit.includes(o))continue;const dd=Math.hypot(o.x-e.x,o.y-e.y);if(dd<bd2){bd2=dd;tg=o}}if(tg){b.rc--;const a=Math.atan2(tg.y-b.y,tg.x-b.x);b.vx=Math.cos(a)*620;b.vy=Math.sin(a)*620;b.home=0}else b.dead=1}else b.dead=1;sfx('hit',60);
    for(let i=0;i<2;i++)g.P.push({x:b.x,y:b.y,vx:rnd(-90,90),vy:rnd(-90,20),l:.22,L:.22,c:r.pc,k:'g',s:3.5})}}
  if(e.hp<=0){kill(e);continue}
  if(g.dead)continue;
  const dx=e.x-g.px,dy=e.y-py;if(dx*dx+dy*dy<(e.r*.8+10)**2){if(!e.b){if(e.d.bomb){explode(e.x,e.y,62,6*hpMul(g.stage));kill(e,1)}else{e.dead=1;part(e.x,e.y,e.a.skin||e.a.c,10,180);corpse(e)}}hurt(1)}
  else if(e.y>H+30){e.dead=1}}
 // separation (smooth crowd flow)
 const E=g.E;for(let i=0;i<E.length;i++){const a=E[i];if(a.b||a.dead)continue;for(let j=i+1;j<E.length;j++){const b=E[j];if(b.b||b.dead)continue;const dx=b.x-a.x,dy=b.y-a.y,m=a.r+b.r;if(Math.abs(dx)<m&&Math.abs(dy)<m){const d=Math.hypot(dx,dy)||1;if(d<m){const p=(m-d)/d*.5*Math.min(1,dt*10);a.x-=dx*p;b.x+=dx*p;a.y-=dy*p*.4;b.y+=dy*p*.4}}}}
 for(const b of g.EB){if(b.spin){b.a+=b.spin*dt}b.x+=b.vx*dt;b.y+=b.vy*dt;const dx=b.x-g.px,dy=b.y-(py-10);if(!g.dead&&dx*dx+dy*dy<105){b.dead=1;hurt(1)}}
 for(const d of g.D){d.y+=SCROLL*dt;d.t+=dt;const dx=d.x-g.px,dy=d.y-py;if(!g.dead&&dx*dx+dy*dy<1000){d.dead=1;sfx('pick');ring(d.x,d.y,d.k=='heal'?'#ff4a7a':'#4ad8ff',50);
  if(d.k=='heal'){g.hp=Math.min(g.mh,g.hp+1);txt(d.x,d.y-20,'+1 HEART','#ff8aa8')}else{g.sh=1;txt(d.x,d.y-20,'SHIELD','#9fe8ff')}}}
 const cx=W-104,cy=24;
 for(const c of g.C){c.t+=rdt;if(c.t<.35){c.x+=c.vx*rdt;c.y+=c.vy*rdt;c.vx*=.9;c.vy*=.9}else{const dx=cx-c.x,dy=cy-c.y,d=Math.hypot(dx,dy),sp=300+c.t*900;if(d<14){c.dead=1;g.co+=c.v;g.cpop=1;sfx('coin',45)}else{c.x+=dx/d*sp*rdt;c.y+=dy/d*sp*rdt}}}
 for(const p of g.P){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;if(p.k=='c'){p.vy+=500*dt;p.r+=dt*8}else{p.vx*=.94;p.vy*=.94}}
 for(const k of g.K){k.t+=dt;k.y+=SCROLL*dt}
 for(const t of g.T){t.y-=26*rdt;t.l-=rdt}
 const ok=o=>!o.dead&&o.y>-200&&o.y<H+60&&o.x>-60&&o.x<W+60;
 g.B=g.B.filter(ok);g.EB=g.EB.filter(ok);g.D=g.D.filter(ok);g.E=g.E.filter(e=>!e.dead&&(e.b||e.y<H+60));g.C=g.C.filter(c=>!c.dead);g.K=g.K.filter(k=>k.t<.6);
 g.P=g.P.filter(p=>p.l>0);g.T=g.T.filter(t=>t.l>0);if(g.P.length>450)g.P.splice(0,g.P.length-450)}
function enemyAI(e,dt,py){const g=G,d=e.d;
 // entry: decelerate in from top, no attacks until on screen (telegraphed arrival)
 const entry=e.y<30;if(e.slow>0)e.slow-=dt;const spd=e.v*(entry?1.8:1)*(e.slow>0?.65:1);
 let wantVx=0,wantVy=spd;
 if(d.fly){e.bx+=(g.px-e.bx)*Math.min(1,dt*.5);wantVx=(e.bx+Math.sin(e.t*3+e.ph)*46-e.x)*3;wantVy=spd*(.7+.5*Math.sin(e.t*2+e.ph))}
 else if(d.shoot&&e.state!='go'){if(e.y<e.stopY)wantVy=spd;else{wantVy=0;e.st-=dt;if(e.st<=0){if(e.state=='aim'){shoot(e,Math.atan2(py-10-e.y,g.px-e.x),240,'ea');e.shots++;e.state='walk';e.st=1.6;if(e.shots>=3)e.state='go'}else{e.state='aim';e.st=.55}}}}
 else if(d.summon&&e.state!='go'){if(e.y<e.stopY*.8)wantVy=spd;else{wantVy=0;e.st-=dt;if(e.st<=0){if(e.state=='aim'){for(const s of[-1,1])addE('imp',cl(e.x+s*28,24,W-24),e.y+6);sfx('zap');ring(e.x,e.y,'#7aff5a',40);e.sum++;e.state='walk';e.st=3.6;if(e.sum>=3)e.state='go'}else{e.state='aim';e.st=.8}}}}
 const hm=d.home||(e.y>H*.55&&!d.fly&&!d.heavy?.25:0);if(hm&&!entry&&e.y<py-40)wantVx=cl((g.px-e.x)*hm,-e.v*.55,e.v*.55);
 if(!d.fly&&!hm)wantVx=Math.sin(e.t*1.6+e.ph)*12;
 if(e.vx===undefined)e.vx=0;
 const k=Math.min(1,dt*3.2);e.vx+=(wantVx-e.vx)*k;e.vy+=(wantVy-e.vy)*k;
 e.kb*=Math.exp(-7*dt);
 e.x+=e.vx*dt;e.y+=(e.vy-e.kb)*dt;e.x=cl(e.x,16,W-16);
 e.dist+=Math.hypot(e.vx,e.vy)*dt*.9+(d.fly?dt*90:0)+(e.state=='aim'?0:0)}
function bossAI(e,dt,py){const g=G,P=e.bd.pats;
 if(e.y<150){e.y+=(160-e.y)*Math.min(1,dt*1.4)+20*dt;e.dist+=40*dt;return}
 const tx=W/2+Math.sin(e.t*.55)*(W/2-78);e.vx+=((tx-e.x)*2-e.vx)*Math.min(1,dt*2);e.x+=e.vx*dt;e.dist+=Math.abs(e.vx)*dt*.6+12*dt;
 if(e.q>0){e.qc-=dt;if(e.qc<=0){e.q--;e.qc=.12;if(e.cur=='burst')shoot(e,Math.atan2(py-e.y,g.px-e.x),270);if(e.cur=='spiral'){e.spin+=.42;for(let i=0;i<3;i++)shoot(e,e.spin+i*TAU/3,170)}}return}
 e.cd-=dt;if(e.chg>0){e.chg-=dt;if(e.chg<=0)bossFire(e,py);return}
 if(e.cd<=0){e.cur=P[e.pi++%P.length];e.chg=.55;e.cd=Math.max(1.1,2.3-g.stage*.08)}}
function bossFire(e,py){const g=G,a=Math.atan2(py-e.y,g.px-e.x);sfx('zap');
 switch(e.cur){
  case'spread':for(let i=-2;i<=2;i++)shoot(e,a+i*.2,215);break;
  case'ring':{const n=12+Math.min(6,g.stage);for(let i=0;i<n;i++)shoot(e,i/n*TAU+e.t,165);break}
  case'burst':e.q=5;e.qc=0;break;
  case'spiral':e.q=14;e.qc=0;break;
  case'sweep':{const gap=rnd(50,W-50);for(let x=14;x<W;x+=26)if(Math.abs(x-gap)>34)g.EB.push({x,y:e.y+20,vx:0,vy:150,k:'eb'});break}
  case'summon':for(let i=0;i<3;i++)addE(i==1?'archer':'imp',cl(e.x+(i-1)*60,30,W-30),e.y+20);break}}

/* =================== render =================== */
function drawGates(t){const g=G;
 for(const side of[0,1]){const o=side?t.R:t.L,x0=side?W/2+3:7,w=W/2-10,y=t.y,h=56,dl=gDelta(o),good=dl.n>0||(dl.n==0&&o.v>0),c=good?'#2f9bff':'#ff3048';
  X.save();rr(X,x0,y,w,h,10);X.clip();
  let q=X.createLinearGradient(0,y,0,y+h);q.addColorStop(0,rgba(c,.08));q.addColorStop(.55,rgba(c,.38));q.addColorStop(1,rgba(c,.7));X.fillStyle=q;X.fillRect(x0,y,w,h);
  const sx=x0-40+((g.t*140+side*90)%(w+80));q=X.createLinearGradient(sx-24,0,sx+24,0);q.addColorStop(0,'rgba(255,255,255,0)');q.addColorStop(.5,'rgba(255,255,255,.22)');q.addColorStop(1,'rgba(255,255,255,0)');X.fillStyle=q;X.fillRect(sx-24,y,48,h);
  X.globalCompositeOperation='lighter';X.fillStyle=rgba(c,.9);X.fillRect(x0,y+h-4,w,4);X.restore();
  rr(X,x0,y,w,h,10);X.lineWidth=2.5;X.strokeStyle=good?'rgba(170,225,255,.95)':'rgba(255,170,180,.95)';X.stroke();
  X.save();const ps=1+o.pulse*.22;X.translate(x0+w/2,y+h/2);X.scale(ps,ps);X.textAlign='center';X.textBaseline='middle';
  X.font='900 26px system-ui,sans-serif';X.lineWidth=5;X.strokeStyle='rgba(0,0,20,.55)';X.lineJoin='round';X.strokeText(dl.t,0,-6);X.fillStyle='#fff';X.fillText(dl.t,0,-6);
  X.font='900 10px system-ui,sans-serif';X.fillStyle=good?'#d4efff':'#ffd8dc';X.fillText(GS_[o.s].lab,0,15);X.restore()}
 for(const px of[4,W/2,W-4]){rr(X,px-5,t.y-6,10,68,4);X.fillStyle=lin(X,px-5,px+5,'#7a7088');X.fill();X.lineWidth=1.4;X.strokeStyle=OL;X.stroke();glow(X,px,t.y-6,10,'#ffe8a0',.8)}}
function drawEnemy(e){const g=G,f=(e.dist*.11+e.ph)|0,feet=e.y+40*e.s,z=e.b?4.4:3,sx=1+e.sq*.1,sy=1-e.sq*.08;
 if(e.state=='aim'&&!e.b){X.globalCompositeOperation='lighter';glow(X,e.x,e.y-6,24,e.d.summon?'#7aff5a':'#ff3a3a',.35+.25*Math.sin(e.t*30));X.globalCompositeOperation='source-over'}
 if(e.b&&e.chg>0){X.globalCompositeOperation='lighter';glow(X,e.x,e.y-20,70*(1-e.chg/.55)+20,'#ff4a6a',.5);X.globalCompositeOperation='source-over'}
 drawFig(X,e.a,e.x,feet,e.s,f,0,z,sx,sy);
 if(e.fl>0){X.globalCompositeOperation='lighter';X.globalAlpha=e.b?.35:.6;drawFig(X,e.a,e.x,feet,e.s,f,0,z,sx,sy);X.globalAlpha=1;X.globalCompositeOperation='source-over'}
 if(e.burn>0){X.globalCompositeOperation='lighter';glow(X,e.x,e.y,e.r*1.6,'#ff6a1a',.35+Math.random()*.2);X.globalCompositeOperation='source-over'}
 if(e.d.bomb){X.globalCompositeOperation='lighter';glow(X,e.x+4*e.s,e.y-8*e.s,8+Math.random()*4,'#ffb03a',.9);X.globalCompositeOperation='source-over'}
 if(!e.b&&e.hp<e.mh){const w=Math.max(20,e.r*2),y=e.y-e.r-58*e.s+8;rr(X,e.x-w/2,y,w,5,2.5);X.fillStyle='rgba(0,0,0,.6)';X.fill();rr(X,e.x-w/2+1,y+1,(w-2)*Math.max(0,e.hp/e.mh),3,1.5);X.fillStyle='#ff4a5a';X.fill();
  if(e.shp>0){rr(X,e.x-w/2+1,y-4,(w-2)*Math.max(0,e.shp/(e.mh*.6)),2.4,1.2);X.fillStyle='#c8d4ff';X.fill()}}}
function drawWorld(){const g=G,r=g.r,py=H-130;
 X.save();if(g.shk>0&&SET.shake){const k=g.shk*12;X.translate(rnd(-k,k),rnd(-k,k))}
 if(g.bif>0){bg(g.dist,g.obi);bg(g.dist,g.bi,1-g.bif)}else bg(g.dist,g.bi);
 for(const t of g.Gt)drawGates(t);
 for(const k of g.K){const a=1-k.t/.6;X.save();X.globalAlpha=a;X.translate(k.x,k.y+40*k.s);X.rotate(k.rot*k.t*2);X.scale(1,1-k.t*.6);drawFig(X,k.a,0,0,k.s,k.f,0,3);X.restore()}
 for(const d of g.D)dp(X,d.k,d.x,d.y+Math.sin(d.t*5)*3,1.1);
 const L=g.E.slice().sort((a,b)=>a.y-b.y);for(const e of L)drawEnemy(e);
 if(!g.dead){const blink=g.inv>0&&((g.t*14|0)%2);X.globalAlpha=blink?.45:1;drawFig(X,r,g.px,py+48,.96,(g.t*12)|0,1,3.4);X.globalAlpha=1;
  if(g.mf>0){X.globalCompositeOperation='lighter';glow(X,g.px,py-52,20,r.pc,.8);X.globalCompositeOperation='source-over'}
  if(g.sk.blades){const nb=g.sk.blades+1;for(let i=0;i<nb;i++){const a=g.ang+i*TAU/nb,bx=g.px+Math.cos(a)*52,by=py-18+Math.sin(a)*40;X.globalCompositeOperation='lighter';glow(X,bx,by,20,'#a06aff',.7);X.globalCompositeOperation='source-over';X.save();X.translate(bx,by);X.rotate(a+g.t*10);X.beginPath();for(let j=0;j<4;j++){const aa=j*TAU/4;X.lineTo(Math.cos(aa)*9,Math.sin(aa)*9);X.lineTo(Math.cos(aa+.785)*3,Math.sin(aa+.785)*3)}X.closePath();fo(X,'#e8dcff',1.2);X.restore()}}
  if(g.sh>0){X.globalCompositeOperation='lighter';glow(X,g.px,py-12,50,'#3ac8ff',.35);X.globalCompositeOperation='source-over';ell(X,g.px,py-12,30,44);X.lineWidth=2;X.strokeStyle='rgba(140,220,255,'+(.5+Math.sin(g.t*8)*.2)+')';X.stroke()}}
 X.globalCompositeOperation='lighter';
 for(const b of g.B){if(r.proj=='fire'||r.proj=='orb')dp(X,r.proj,b.x-b.vx*.02,b.y+12,.6);dp(X,r.proj,b.x,b.y,r.proj=='axe'?1.1:1.1,r.proj=='axe'?b.rot:Math.atan2(b.vx,-b.vy))}
 for(const p of g.P){const a=cl(p.l/p.L,0,1);if(p.k=='g')glow(X,p.x,p.y,p.s*3,p.c,a);
  else if(p.k=='r'){X.globalAlpha=a;X.lineWidth=3*a;X.strokeStyle=p.c;X.beginPath();X.arc(p.x,p.y,p.s*(1.2-a),0,TAU);X.stroke();X.globalAlpha=1}}
 X.globalCompositeOperation='source-over';
 for(const p of g.P)if(p.k=='c'){X.globalAlpha=cl(p.l/p.L*1.5,0,1);X.save();X.translate(p.x,p.y);X.rotate(p.r);X.fillStyle=p.c;X.fillRect(-p.s/2,-p.s/2,p.s,p.s);X.strokeStyle=OL;X.lineWidth=.8;X.strokeRect(-p.s/2,-p.s/2,p.s,p.s);X.restore();X.globalAlpha=1}
 // enemy bullets drawn above effects for readability
 X.globalCompositeOperation='lighter';for(const b of g.EB){if(b.k=='ea')dp(X,'ea',b.x,b.y,1,Math.atan2(-b.vx,b.vy));else dp(X,'eb',b.x,b.y,1)}X.globalCompositeOperation='source-over';
 for(const b of g.EB){if(b.k!='ea'){ell(X,b.x,b.y,3,3);X.fillStyle='#fff';X.fill()}}
 for(const c of g.C)dp(X,'coin',c.x,c.y,.9);
 X.textAlign='center';X.textBaseline='middle';X.lineJoin='round';
 for(const t of g.T){const k=1-t.l/t.L,s=k<.12?.4+k/.12*.85:1.25-Math.min(.25,(k-.12)*1.6);X.save();X.globalAlpha=cl(t.l/.3,0,1);X.translate(t.x,t.y);X.scale(s,s);X.font='900 '+t.sz+'px system-ui,sans-serif';X.lineWidth=6;X.strokeStyle='rgba(10,4,20,.75)';X.strokeText(t.s,0,0);X.fillStyle=t.c;X.fillText(t.s,0,0);X.restore()}
 ambient(g);
 X.restore();
 X.drawImage(VG,0,0,W,H);
 if(g.hf>0){const q=X.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,H*.7);q.addColorStop(0,'rgba(255,0,30,0)');q.addColorStop(1,'rgba(255,0,30,'+(.5*g.hf)+')');X.fillStyle=q;X.fillRect(0,0,W,H)}
 if(g.ban)warnBanner(g.ban);
 if(g.banner)stageBanner(g.banner);
 hud()}
function ambient(g){const bi=g.bi,A=g.A,dt=1/60;
 if(A.length<(bi==2?70:bi==3?40:22)&&Math.random()<.5)A.push({x:rnd(-20,W+20),y:-10,vx:bi==2?rnd(-15,15):bi==1?rnd(30,70):rnd(-25,25),vy:bi==3?-rnd(30,70):rnd(40,90),r:rnd(0,TAU),s:rnd(1.5,3.5),w:rnd(0,9),y0:0});
 for(const p of A){p.w+=dt*2;p.x+=(p.vx+Math.sin(p.w)*(bi==0?30:10))*dt;p.y+=(p.vy+SCROLL*.3)*dt;p.r+=dt*2;if(bi==3&&p.y<-20){p.y=H+10}}
 g.A=A.filter(p=>p.y<H+20&&p.y>-30&&p.x>-40&&p.x<W+40);
 for(const p of g.A){if(bi==3){X.globalCompositeOperation='lighter';glow(X,p.x,p.y,p.s*3,'#ff6a1a',.7);X.globalCompositeOperation='source-over'}
  else if(bi==2){ell(X,p.x,p.y,p.s*.8,p.s*.8);X.fillStyle='rgba(255,255,255,.85)';X.fill()}
  else if(bi==1){X.fillStyle='rgba(230,190,130,.35)';ell(X,p.x,p.y,p.s*1.6,p.s*.5,p.r*.2);X.fill()}
  else{X.save();X.translate(p.x,p.y);X.rotate(p.r);X.fillStyle=p.s>2.5?'#6aa84a':'#c8a03a';ell(X,0,0,p.s*1.4,p.s*.6);X.fill();X.restore()}}}
function warnBanner(t){const k=2.6-t,a=Math.min(1,k*4,t*4);X.save();X.globalAlpha=a;const y=H*.38,bd=BOSSES[(G.stage-1)%3];
 X.fillStyle='rgba(120,0,20,.55)';X.fillRect(0,y-46,W,92);X.save();X.beginPath();X.rect(0,y-46,W,10);X.rect(0,y+36,W,10);X.clip();X.fillStyle='#ffcf3a';for(let x=-40+((k*120)%40);x<W+40;x+=40){X.beginPath();X.moveTo(x,y-46);X.lineTo(x+20,y-46);X.lineTo(x+10,y+46);X.lineTo(x-10,y+46);X.fill()}X.restore();
 X.textAlign='center';X.textBaseline='middle';X.font='italic 900 38px system-ui,sans-serif';X.lineWidth=6;X.strokeStyle='#3a0008';const sc=1+Math.sin(k*12)*.04;X.translate(W/2,y-6);X.scale(sc,sc);X.strokeText('WARNING',0,0);X.fillStyle='#ff4a5a';X.fillText('WARNING',0,0);
 X.font='900 13px system-ui,sans-serif';X.fillStyle='#ffe0a0';X.fillText('THE '+bd.name+' APPROACHES',0,26);X.restore()}
function stageBanner(b){const k=2.6-b.t,a=Math.min(1,k*3,b.t*2.5),y=H*.36,sl=(1-Math.min(1,k*3))*40;X.save();X.globalAlpha=a;X.textAlign='center';X.textBaseline='middle';
 const q=X.createLinearGradient(0,0,W,0);q.addColorStop(0,'rgba(10,6,20,0)');q.addColorStop(.5,'rgba(10,6,20,.75)');q.addColorStop(1,'rgba(10,6,20,0)');X.fillStyle=q;X.fillRect(0,y-46,W,b.c?104:88);
 X.font='italic 900 40px system-ui,sans-serif';X.lineWidth=6;X.strokeStyle='#3a1a00';X.strokeText(b.a,W/2-sl,y-10);const g2=X.createLinearGradient(0,y-30,0,y+10);g2.addColorStop(0,'#fff6c8');g2.addColorStop(1,'#ff9a1f');X.fillStyle=g2;X.fillText(b.a,W/2-sl,y-10);
 X.font='900 12px system-ui,sans-serif';X.fillStyle='#d8ccff';X.fillText(b.b,W/2+sl,y+22);if(b.c){X.font='800 12px system-ui';X.fillStyle='#ffb0a0';X.fillText(b.c,W/2+sl,y+42)}X.restore()}
function hud(){const g=G;X.save();X.textBaseline='middle';
 let q=X.createLinearGradient(0,0,0,84);q.addColorStop(0,'rgba(8,4,16,.82)');q.addColorStop(1,'rgba(8,4,16,0)');X.fillStyle=q;X.fillRect(0,0,W,84);
 for(let i=0;i<g.mh;i++){const x=20+i*21,y=24;heart(X,x,y,8.5);fo(X,i<g.hp?rad(X,x,y,9,'#ff3a5a'):'rgba(255,255,255,.12)',1.6)}
 let ix=20+g.mh*21;if(g.rev){X.font='900 14px system-ui';X.fillStyle='#5ff';X.textAlign='left';X.fillText('✚',ix-6,24);ix+=16}
 if(g.sh>0)dp(X,'shield',ix+2,24,.75);
 X.textAlign='center';X.font='900 26px system-ui,sans-serif';X.lineWidth=5;X.strokeStyle='rgba(0,0,0,.6)';X.lineJoin='round';const sc=Math.floor(g.sc);X.strokeText(sc,W/2,22);X.fillStyle='#fff';X.fillText(sc,W/2,22);
 // stage progress bar
 const pw=120,px0=W/2-pw/2,py0=42,n=g.waves.length,prog=g.phase=='rest'?0:g.phase=='waves'?(g.wi+(g.q.length?0:.5))/n:1;
 rr(X,px0,py0,pw,6,3);X.fillStyle='rgba(0,0,0,.55)';X.fill();rr(X,px0+1,py0+1,(pw-2)*cl(prog,0,1),4,2);X.fillStyle='#ffd84a';X.fill();
 X.font='900 9px system-ui';X.fillStyle='#ffd84a';X.textAlign='right';X.fillText('STAGE '+g.stage,px0-6,py0+3.5);
 X.textAlign='left';X.fillStyle=g.phase=='boss'?'#ff5a6a':'#b8a8d8';X.fillText('☠',px0+pw+5,py0+3.5);
 const cw=72,cx0=W-56-cw,ps=1+g.cpop*.12;X.save();X.translate(cx0+cw/2,24);X.scale(ps,ps);rr(X,-cw/2,-12,cw,24,12);X.fillStyle='rgba(10,6,20,.7)';X.fill();X.lineWidth=1.5;X.strokeStyle='rgba(255,207,74,.45)';X.stroke();
 dp(X,'coin',-cw/2+13,0,.9);X.textAlign='left';X.font='900 15px system-ui,sans-serif';X.fillStyle='#ffe08a';X.fillText(Math.floor(g.co),-cw/2+25,1);X.restore();
 if(g.boss){const bw=W-80,bx=40,by=72;X.textAlign='center';X.font='900 11px system-ui';X.fillStyle='#ff8a9a';X.fillText(g.boss.bd.name,W/2,by-8);rr(X,bx,by,bw,10,5);X.fillStyle='rgba(0,0,0,.6)';X.fill();X.lineWidth=1.5;X.strokeStyle='rgba(255,120,140,.6)';X.stroke();
  q=X.createLinearGradient(0,by,0,by+10);q.addColorStop(0,'#ff7a8a');q.addColorStop(1,'#c0102a');rr(X,bx+2,by+2,(bw-4)*Math.max(0,g.boss.hp/g.boss.mh),6,3);X.fillStyle=q;X.fill()}
 const L=g.lv,K=g.sk,ch=[['⇈',cl(L.shots+(K.multi||0),1,8)+'×','#ffd84a'],['⚡',Math.round(rateMul(L.rate)*(1+.15*(K.haste||0))*100)+'%','#7ad8ff'],['⚔',Math.round(dmgMul(L.dmg)*(1+.2*(K.power||0))*100)+'%','#ff8a6a']],cw2=86,y=H-26;
 ch.forEach((c,i)=>{const x=W/2+(i-1)*(cw2+8);rr(X,x-cw2/2,y-13,cw2,26,13);X.fillStyle='rgba(10,6,20,.65)';X.fill();X.lineWidth=1.2;X.strokeStyle='rgba(255,255,255,.12)';X.stroke();
  X.textAlign='center';X.font='900 13px system-ui,sans-serif';X.fillStyle=c[2];X.fillText(c[0]+'  '+c[1],x,y+1)});
 X.restore()}

/* =================== menu =================== */
const LOCK='<svg class="lki" viewBox="0 0 24 24" fill="#ffd84a"><path d="M7 10V7a5 5 0 0110 0v3h1a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2h1zm2 0h6V7a3 3 0 00-6 0v3z"/></svg>';
const SON='<svg viewBox="0 0 24 24" fill="#fff"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const SOFF='<svg viewBox="0 0 24 24" fill="#fff"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6" stroke="#ff7a8a" stroke-width="2" stroke-linecap="round"/></svg>';
function sndUI(){$('snd').innerHTML=SET.sfx?SON:SOFF;document.querySelectorAll('.sw').forEach(e=>e.classList.toggle('on',!!SET[e.dataset.k]))}
const heroDPS=r=>r.rate*r.dmg*(r.pierce?1.35:1)*(r.burn?1.4:1)*(r.big?.85:1)*(r.home?1.1:1);
function roster(){$('mc').textContent=coins;$('mb').textContent=best;$('mbs').textContent=bestSt;const ro=$('ro');ro.innerHTML='';
 RACES.forEach(r=>{const own=owned.includes(r.id),d=document.createElement('button');d.className='rc'+(r.id==view?' sel':'')+(own?'':' lk');
  const c=document.createElement('canvas');c.width=Math.round(60*DPR);c.height=Math.round(72*DPR);const g=c.getContext('2d');g.scale(DPR,DPR);drawFig(g,r,30,72,.56,0,0,3);d.append(c);
  if(!own)d.insertAdjacentHTML('beforeend',LOCK+'<div class="pr">● '+r.cost+'</div>');
  d.onclick=()=>{view=r.id;if(own){sel=r.id;LS.set('sel',sel)}sfx('click');$('msg').textContent='';roster()};ro.append(d)});
 const r=RACES.find(a=>a.id==view),own=owned.includes(view);$('hn').textContent=r.n;$('hr').textContent=r.race;$('hd').textContent=r.desc;
 const hpv=(r.hp+(r.revive?r.hp:0))/6,dps=heroDPS(r)/7;
 $('hs').innerHTML=[['HEALTH',hpv,'#ff4a6a,#ff8a9a'],['FIREPOWER',dps,'#ff9a2a,#ffd84a']].map(([l,v,c])=>`<span>${l}</span><div class="bar"><i style="width:${cl(v,.05,1)*100}%;background:linear-gradient(90deg,${c})"></i></div>`).join('')+`<span>ABILITY</span><b class="abl">${r.ab}</b>`;
 const go=$('go'),lb=$('lb');if(own){go.textContent='PLAY';go.classList.remove('dis');lb.style.display='none'}else{go.textContent='UNLOCK  ● '+r.cost;go.classList.toggle('dis',coins<r.cost);lb.style.display='block';lb.textContent='LOCKED'}}
function menu(){st='menu';G=null;view=sel;show('m');roster();$('dDot').style.display=dailyReady()?'block':'none';music('menu')}
function drawShow(t){const c=$('hc'),g=c.getContext('2d'),r=RACES.find(a=>a.id==view);g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);g.scale(DPR,DPR);
 g.save();g.globalCompositeOperation='lighter';glow(g,105,120,90,r.pc,.18);g.restore();
 const b=Math.sin(t*2.2)*1.5;g.save();g.translate(105,204);g.scale(1,1+Math.sin(t*2.2)*.01);drawFig(g,r,0,b*.3,1.78,0,0,5.5);g.restore();
 g.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const k=(t*.35+i/6)%1;glow(g,105+Math.sin(i*2.1+t)*70,200-k*170,5,r.pc,(1-k)*.8)}g.globalCompositeOperation='source-over'}
$('go').onclick=()=>{const r=RACES.find(a=>a.id==view);if(owned.includes(view)){fade(start);return}
 if(coins<r.cost){$('msg').textContent='Need '+(r.cost-coins)+' more coins';sfx('bad');return}
 coins-=r.cost;owned.push(r.id);sel=r.id;LS.set('coins',coins);LS.set('owned',owned);LS.set('sel',sel);sfx('buy');$('msg').textContent='';roster()};
function setT(k,v){SET[k]=v;LS.set('set',SET);muted=!SET.sfx;if(k=='mus'){if(v)music();else musStop()}sndUI();sfx('click')}
$('snd').onclick=()=>setT('sfx',!SET.sfx);
document.querySelectorAll('.sw').forEach(e=>e.parentElement.onclick=()=>setT(e.dataset.k,!SET[e.dataset.k]));
let backTo=null;
function openOv(id){backTo=st=='pause'?'p':'m';sfx('click');show(id)}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{sfx('click');show(backTo);if(backTo=='m')roster()});
$('skR').onclick=()=>{if(pickRR<=0)return;pickRR--;sfx('click');renderPick(rollSkills())};
$('bSet').onclick=()=>openOv('set');$('bSet2').onclick=()=>openOv('set');
$('bTal').onclick=()=>{renderTal();openOv('tal')};
function renderTal(){$('tc').textContent=coins;const L=$('tL');L.innerHTML='';
 for(const t of TAL){const lv=ml(t.k),mx=lv>=t.max,c=mx?0:t.c[lv],d=document.createElement('div');d.className='it';
  d.innerHTML=`<div class="tico">${t.ic}</div><div class="tx"><b>${t.n}</b><span>${t.d}</span><div class="pips">${Array.from({length:t.max},(_,i)=>'<i class="'+(i<lv?'on':'')+'"></i>').join('')}</div></div><button class="buy ${mx||coins<c?'dis':''}">${mx?'MAX':'● '+c}</button>`;
  d.querySelector('.buy').onclick=()=>{if(mx)return;if(coins<c){sfx('bad');return}coins-=c;META[t.k]=lv+1;LS.set('meta',META);LS.set('coins',coins);sfx('buy');renderTal()};L.append(d)}}
$('bCod').onclick=()=>{renderCod();openOv('cod')};
function renderCod(){const L=$('cL');L.innerHTML='';const keys=Object.keys(CODEX);let n=0;
 for(const k of keys){const m=!!seen[k];if(m)n++;const d=document.createElement('div');d.className='it';const c=document.createElement('canvas');c.width=96;c.height=112;const g=c.getContext('2d');g.scale(2,2);
  const rig=k[0]=='b'&&k.length==2?RG[BOSSES[+k[1]].rig]:RG[ET[k].rig];drawFig(g,rig,24,54,k[0]=='b'&&k.length==2?.42:.5,0,0,2.4);if(!m){g.globalCompositeOperation='source-atop';g.fillStyle='#120c22';g.fillRect(0,0,48,56)}
  d.append(c);d.insertAdjacentHTML('beforeend',`<div class="tx"><b>${m?CODEX[k][0]:'???'}</b><span>${m?CODEX[k][1]:'Not yet encountered.'}</span></div>`);L.append(d)}
 $('cS').textContent='Discovered '+n+' / '+keys.length}
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
function dailyReady(){return daily.d!=today()}
function dayIdx(){const y=new Date();y.setDate(y.getDate()-1);const yd=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();return daily.d==yd?daily.s%7:0}
function renderDay(){const L=$('dL'),ready=dailyReady(),i=ready?dayIdx():((daily.s-1)%7);L.innerHTML=DAYR.map((v,k)=>`<div class="dy ${k<i||(!ready&&k==i)?'got':''} ${ready&&k==i?'now':''}">DAY ${k+1}<b>● ${v}</b></div>`).join('');
 const c=$('dC');c.textContent=ready?'CLAIM  ● '+DAYR[i]:'COME BACK TOMORROW';c.classList.toggle('dis',!ready);$('dDot').style.display=ready?'block':'none'}
$('bDay').onclick=()=>{renderDay();openOv('dly')};
$('dC').onclick=()=>{if(!dailyReady())return;const i=dayIdx(),v=DAYR[i];daily={d:today(),s:i+1};coins+=v;LS.set('daily',daily);LS.set('coins',coins);sfx('buy');renderDay();$('mc').textContent=coins};

/* =================== loop & input =================== */
function loop(ts){const dt=Math.min(.033,(ts-last)/1000||0);last=ts;X.setTransform(S,0,0,S,0,0);
 if(st=='play')upd(dt);
 if(G)drawWorld();else{menuT+=dt;bg(menuT*60,0);X.drawImage(VG,0,0,W,H)}
 if(st=='menu')drawShow(menuT);
 requestAnimationFrame(loop)}
let tx=null;
addEventListener('pointerdown',e=>{tx=e.clientX;au(1);if(SET.mus&&!MUS.on)music()});
addEventListener('pointermove',e=>{if(tx==null||st!='play'||!G)return;G.tx=cl(G.tx+(e.clientX-tx)*W/innerWidth*1.35,18,W-18);tx=e.clientX});
addEventListener('pointerup',()=>tx=null);addEventListener('pointercancel',()=>tx=null);
function pause(){if(st=='play'){st='pause';show('p');musVol(.15)}}
function resume(){st='play';show(null);sfx('click');musVol(.5)}
window.pauseGame=pause;
window.back=()=>{const ov=['sk','tal','cod','dly','set'].find(k=>$(k).classList.contains('on'));if(ov&&ov!='sk'){show(backTo);if(backTo=='m')roster();return true}if(ov=='sk')return true;if(st=='play'){pause();return true}if(st=='pause'){resume();return true}if(st=='over'){menu();return true}if(st=='menu'&&view!=sel){view=sel;roster();return true}return false};
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();try{AC&&AC.suspend()}catch(e){}}else{try{AC&&AC.resume()}catch(e){}}});
function fade(fn){const f=$('fade');f.style.opacity=1;setTimeout(()=>{fn();f.style.opacity=0},300)}
$('again').onclick=()=>fade(start);$('home').onclick=()=>{sfx('click');fade(menu)};$('quit').onclick=()=>{sfx('click');fade(menu)};$('res').onclick=resume;$('pz').onclick=pause;
fit();sndUI();menu();requestAnimationFrame(loop);
(function warm(){const jobs=[];for(const r of RACES)for(let f=0;f<8;f++)jobs.push(()=>spr(r,f,1,3.4));for(const k of['imp','gob'])for(let f=0;f<8;f++)jobs.push(()=>spr(RG[k],f,0,3));jobs.push(()=>makeBG(1));
 (function step(){const j=jobs.shift();if(j){j();setTimeout(step,0)}})()})();
