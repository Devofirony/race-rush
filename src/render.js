/* ================= extra rigs for bosses ================= */
RG.queen={id:'queen',skin:'#e8d6ff',hair:'#c03aff',hs:'long',mask:'void',eyes:'#ff3ad8',armor:'#2a0a3a',atrim:'#3ff0ff',cloth:'#1a0628',boots:'#1a0628',glove:'#2a0a3a',neon:'#c03aff',coat:'#3a0a52',ctrim:'#3ff0ff',float:1,holo:1,tall:1.08,wpn:'plasma',ast:'circuit'};
RG.queenC=Object.assign({},RG.queen,{id:'queenC',noshadow:1});
/* ================= world rendering ================= */
let FT=0;
function drawRoad(d,di,a){const R=makeRoad(di),o=((d%TH)+TH)%TH;X.globalAlpha=a;for(let y=o-TH;y<H;y+=TH)X.drawImage(R,0,y,W,TH);X.globalAlpha=1}
function drawRoofs(d,di,a){const R=makeRoofs(di),o=((d%TH)+TH)%TH;X.globalAlpha=a;for(let y=o-TH;y<H;y+=TH){X.drawImage(R,0,y,W,TH);
  add(X,()=>{for(const s of R.signs){const yy=s.y+y;if(yy<-40||yy>H+40)continue;if(s.blink){if(((FT*1.4+s.x)|0)%2)glow(X,s.x,yy,6,s.c,.9);continue}
   const fl=.55+.45*Math.sin(FT*(3+s.x%5)+s.y)*(Math.sin(FT*17+s.x)>.92?0:1);glow(X,s.x,yy,s.h*.75,s.c,.3*fl*a);X.globalAlpha=a*fl*.35;X.fillStyle=s.c;X.fillRect(s.x-s.w*.9,yy-s.h/2,s.w*1.8,s.h);X.globalAlpha=a}})}
 X.globalAlpha=1}
function world(g){const di=g.di;
 if(g.dif>0){drawRoad(g.dist,g.odi,1);drawRoad(g.dist,di,1-g.dif)}else drawRoad(g.dist,di,1);
 if(g.dif>0){drawRoofs(g.rdist,g.odi,1);drawRoofs(g.rdist,di,1-g.dif)}else drawRoofs(g.rdist,di,1)}
function weather(g,dt){const D=DIST[g.di],A=g.A,wx=D.wx;
 const want=wx=='rain'?110:wx=='spores'?40:45;while(A.length<want)A.push({x:rnd(-40,W+40),y:rnd(-H,H),v:rnd(.7,1.3),s:rnd(.5,1.5),w:rnd(0,9)});
 for(const p of A){p.w+=dt*2;if(wx=='rain'){p.x-=90*dt*p.v;p.y+=700*dt*p.v}else if(wx=='spores'){p.x+=Math.sin(p.w)*20*dt;p.y+=(30+g.scroll*.4)*dt}else{p.x+=Math.sin(p.w)*25*dt;p.y-=60*dt*p.v}
  if(p.y>H+20){p.y=-20;p.x=rnd(-20,W+40)}if(p.y<-30){p.y=H+20;p.x=rnd(0,W)}}
 if(wx=='rain'){X.strokeStyle='rgba(170,200,255,.28)';X.lineWidth=1;X.beginPath();for(const p of A){X.moveTo(p.x,p.y);X.lineTo(p.x+7*p.v,p.y-34*p.v)}X.stroke();
  if(Math.random()<.5){const x=rnd(RW0,RW1),y=rnd(0,H);g.P.push({x,y,vx:0,vy:0,l:.25,L:.25,c:'#a8c8ff',k:'r',s:8})}}
 else add(X,()=>{for(const p of A)glow(X,p.x,p.y,4*p.s,wx=='spores'?'#9aff5a':'#ff8a2a',.55)})}
function cars(g,dt){if(Math.random()<dt*.18&&g.cars.length<2){const L=Math.random()<.5;g.cars.push({x:L?-60:W+60,y:rnd(H*.08,H*.6),vx:(L?1:-1)*rnd(220,320),c:pick(DIST[g.di].neon)})}
 for(const c of g.cars){c.x+=c.vx*dt;const d=Math.sign(c.vx);X.save();X.translate(c.x,c.y);X.scale(d,1);
  add(X,()=>{const q=X.createLinearGradient(-120,0,0,0);q.addColorStop(0,'rgba(255,40,60,0)');q.addColorStop(1,'rgba(255,40,60,.55)');X.fillStyle=q;X.fillRect(-120,-6,120,3);X.fillRect(-120,3,120,3);glow(X,24,-4,14,'#ffffff',.5);glow(X,24,4,14,'#ffffff',.5)});
  celP(X,()=>cut(X,-16,-9,40,18,5),'#1e1a2e',c.c,1.6);X.fillStyle='rgba(120,200,255,.35)';X.fillRect(4,-6,10,12);add(X,()=>{X.fillStyle=c.c;X.fillRect(-14,8,34,1.6);glow(X,0,10,20,c.c,.35)});X.restore()}
 g.cars=g.cars.filter(c=>c.x>-200&&c.x<W+200)}
/* ---- arenas ---- */
let HEX=null;function hexPat(){if(HEX)return HEX;const[c,g]=mk(400,400,1.5);g.strokeStyle='rgba(255,60,90,.35)';g.lineWidth=1;const r=14,h=r*Math.sqrt(3);for(let y=-h;y<420;y+=h)for(let x=-r*3,i=0;x<420;x+=r*1.5,i++){const yy=y+(i%2?h/2:0);g.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;g.lineTo(x+Math.cos(a)*r,yy+Math.sin(a)*r)}g.closePath();g.stroke()}return HEX=c}
function arenaFloor(g){const A=g.ar;if(!A)return;const k=A.kk,c=g.boss?g.boss.bd.c:'#ff2a4a';
 if(A.k=='ring'){X.save();X.globalAlpha=k;X.beginPath();X.rect(-50,-50,W+100,H+100);X.arc(A.cx,A.cy,A.R,0,TAU,true);X.fillStyle='rgba(3,1,8,.86)';X.fill('evenodd');
  X.save();X.beginPath();X.arc(A.cx,A.cy,A.R,0,TAU);X.clip();X.fillStyle='rgba(10,4,16,.55)';X.fillRect(0,0,W,H);X.globalAlpha=k*.8;X.drawImage(hexPat(),A.cx-200,A.cy-200,400,400);
  add(X,()=>{glow(X,A.cx,A.cy,A.R*.9,c,.18);X.strokeStyle=rgba(c,.35);X.lineWidth=1.2;for(let i=1;i<4;i++){X.beginPath();X.arc(A.cx,A.cy,A.R*i/4,0,TAU);X.stroke()}
   X.save();X.translate(A.cx,A.cy);X.rotate(FT*.3);X.strokeStyle=rgba(c,.5);X.lineWidth=2;for(let i=0;i<3;i++){X.beginPath();X.arc(0,0,A.R*.28,i*TAU/3,i*TAU/3+1.4);X.stroke()}X.restore()});X.restore();
  add(X,()=>{X.lineWidth=10;X.strokeStyle=rgba(c,.25);X.beginPath();X.arc(A.cx,A.cy,A.R,-Math.PI/2,-Math.PI/2+TAU*k);X.stroke();X.lineWidth=2.6;X.strokeStyle=c;X.stroke();X.lineWidth=1;X.strokeStyle='#fff';X.stroke();
   X.save();X.translate(A.cx,A.cy);X.rotate(-FT*.6);for(let i=0;i<24;i++){const a=i/24*TAU;X.fillStyle=i%2?c:'#fff';X.fillRect(Math.cos(a)*(A.R+7)-1.5,Math.sin(a)*(A.R+7)-1.5,3,3)}X.restore()});X.restore();return}
 const x0=A.x0,x1=A.x1,y0=A.y0,y1=A.y1;X.save();X.globalAlpha=k;
 if(A.k=='grid'){X.fillStyle='rgba(3,6,3,.6)';X.fillRect(0,0,W,y0);X.fillRect(0,y1,W,H-y1);X.fillStyle='rgba(6,14,6,.55)';X.fillRect(x0,y0,x1-x0,y1-y0);
  add(X,()=>{const w=(x1-x0)/A.cols,h=(y1-y0)/A.rows;X.strokeStyle=rgba(c,.45);X.lineWidth=1.2;X.beginPath();for(let i=0;i<=A.cols;i++){X.moveTo(x0+i*w,y0);X.lineTo(x0+i*w,y0+(y1-y0)*k)}for(let j=0;j<=A.rows;j++){X.moveTo(x0,y0+j*h);X.lineTo(x0+(x1-x0)*k,y0+j*h)}X.stroke();
   for(let i=0;i<=A.cols;i++)for(let j=0;j<=A.rows;j++)glow(X,x0+i*w,y0+j*h,4,c,.6)});X.restore();return}
 X.fillStyle=A.k=='glitch'?'rgba(10,2,16,.5)':'rgba(16,2,6,.42)';X.fillRect(0,0,W,y0);X.fillRect(0,y0,x0,H);X.fillRect(x1,y0,W-x1,H);
 add(X,()=>{const L=(xa,ya,xb,yb)=>{X.beginPath();X.moveTo(xa,ya);X.lineTo(lerp(xa,xb,k),lerp(ya,yb,k));X.strokeStyle=rgba(c,.3);X.lineWidth=7;X.stroke();X.strokeStyle=c;X.lineWidth=1.8;X.stroke();X.strokeStyle='#fff';X.lineWidth=.6;X.stroke()};
  L(x0,y0,x1,y0);L(x0,y0,x0,y1);L(x1,y0,x1,y1);L(x0,y1,x1,y1);for(const[x,y]of[[x0,y0],[x1,y0],[x0,y1],[x1,y1]])glow(X,x,y,12,c,.9);
  if(A.k=='glitch'){for(let i=0;i<3;i++){const y=y0+((FT*90+i*170)%(y1-y0));X.fillStyle=rgba(i%2?'#3ff0ff':c,.08);X.fillRect(x0,y,x1-x0,6)}}
  else{X.fillStyle=rgba(c,.06);for(let i=0;i<8;i++){X.beginPath();const x=x0+(x1-x0)*i/8+((FT*30)%((x1-x0)/8));X.moveTo(x,y0);X.lineTo(x+10,y0);X.lineTo(x,y0+10);X.fill()}}});
 X.restore()}
function drawHaz(g){
 for(const t of g.TL){const warn=t.t<t.warn,p=warn?t.t/t.warn:1;if(warn){X.fillStyle=rgba('#ff2a3a',.08+.22*p*(.6+.4*Math.sin(FT*30)));X.fillRect(t.x+2,t.y+2,t.w-4,t.h-4);X.strokeStyle=rgba('#ff3a4a',.7*p);X.lineWidth=1.4;X.strokeRect(t.x+3,t.y+3,t.w-6,t.h-6)}
  else add(X,()=>{const k=1-(t.t-t.warn)/t.dur;X.fillStyle=rgba('#c8ff5a',.55*k);X.fillRect(t.x+1,t.y+1,t.w-2,t.h-2);glow(X,t.x+t.w/2,t.y+t.h/2,t.w*.9,'#7aff3a',.8*k);X.fillStyle='rgba(255,255,255,'+.8*k+')';for(let i=0;i<3;i++)X.fillRect(t.x+t.w*(.25+i*.25)-1.5,t.y+t.h*.15-k*8,3,t.h*.6)})}
 for(const b of g.BM){const ex=b.x+Math.cos(b.a)*b.len,ey=b.y+Math.sin(b.a)*b.len;
  if(b.t<b.warn){const p=b.t/b.warn;if(b.a1!=null)add(X,()=>{X.beginPath();X.moveTo(b.x,b.y);X.arc(b.x,b.y,b.len,Math.min(b.a,b.a1),Math.max(b.a,b.a1));X.closePath();X.fillStyle=rgba(b.c,.05+.06*p);X.fill()});add(X,()=>{X.beginPath();X.moveTo(b.x,b.y);X.lineTo(ex,ey);X.strokeStyle=rgba(b.c,.25+.5*p*(.5+.5*Math.sin(FT*40)));X.lineWidth=1+p*2;X.setLineDash([10,8]);X.lineDashOffset=-FT*80;X.stroke();X.setLineDash([]);glow(X,b.x,b.y,10+p*16,b.c,.8)})}
  else add(X,()=>{const k=Math.min(1,(b.t-b.warn)*8)*Math.min(1,(b.warn+b.dur-b.t)*6),w=b.w*k;X.lineCap='round';X.beginPath();X.moveTo(b.x,b.y);X.lineTo(ex,ey);X.strokeStyle=rgba(b.c,.22);X.lineWidth=w*2.6;X.stroke();X.strokeStyle=rgba(b.c,.85);X.lineWidth=w;X.stroke();X.strokeStyle='#fff';X.lineWidth=w*.35;X.stroke();glow(X,b.x,b.y,34,b.c,.9);glow(X,b.x,b.y,16,'#fff',.8)})}
 for(const w of g.WV){if(w.line){const warn=w.t<w.warn;add(X,()=>{if(warn){X.strokeStyle=rgba(w.c,.3+.4*Math.sin(FT*40));X.lineWidth=1.5;X.setLineDash([6,6]);X.beginPath();X.moveTo(0,w.y);X.lineTo(W,w.y);X.stroke();X.setLineDash([])}else{X.fillStyle=rgba(w.c,.7);X.fillRect(0,w.y-8,W,16);X.fillStyle='#fff';X.fillRect(0,w.y-2,W,4);for(let i=0;i<8;i++){X.fillStyle=rgba(i%2?'#3ff0ff':w.c,.5);X.fillRect(rnd(0,W),w.y-rnd(4,14),rnd(20,60),3)}}});continue}
  add(X,()=>{X.beginPath();X.arc(w.x,w.y,w.r,w.a-w.arc/2,w.a+w.arc/2);X.strokeStyle=rgba(w.c,.25);X.lineWidth=w.w*2.6;X.lineCap='round';X.stroke();X.strokeStyle=w.c;X.lineWidth=w.w;X.stroke();X.strokeStyle='#fff';X.lineWidth=2;X.stroke()})}
 const b=g.boss;if(b&&b.dash&&b.dash.t<b.dash.warn)tele(b.x,b.y-24,b.dash.x1,b.dash.y1,b.dash.t/b.dash.warn);
 for(const c of g.CL){if(c.t<c.warn&&c.t>0)tele(c.x0,c.y0-24,c.x1,c.y1-24,c.t/c.warn);if(c.t>0){X.globalAlpha=.55;drawFig(X,c.a,c.x,c.y-24+61,1.9,4,0,3);X.globalAlpha=1;add(X,()=>glow(X,c.x,c.y-30,40,'#ff2a4a',.4))}}}
function tele(x0,y0,x1,y1,p){add(X,()=>{X.beginPath();X.moveTo(x0,y0);X.lineTo(x1,y1);X.strokeStyle=rgba('#ff2a4a',.15+.3*p);X.lineWidth=26*(1-p*.6);X.lineCap='round';X.stroke();X.strokeStyle=rgba('#ff6a7a',.5+.5*Math.sin(FT*40));X.lineWidth=1.6;X.stroke();glow(X,x1,y1,14+p*10,'#ff2a4a',.8)})}
/* ---- bosses ---- */
function drawBoss(b){const g=G,j=b.dying?rnd(-4,4):0;X.save();X.translate(j,j);({overseer:dOverseer,shogun:dShogun,hydra:dHydra,queen:dQueen})[b.k](b);X.restore();
 if(b.fl>0)add(X,()=>glow(X,b.x,b.y-(b.k=='shogun'?24:0),70,'#ffffff',.35));if(b.inv>0&&g.phase=='boss')add(X,()=>{ell(X,b.x,b.y-(b.k=='shogun'?24:0),70,70);X.strokeStyle=rgba('#ffffff',.3+.3*Math.sin(FT*30));X.lineWidth=2;X.stroke()})}
function dOverseer(b){X.save();X.translate(b.x,b.y);X.scale(1.55,1.55);X.translate(-b.x,-b.y);dOverseer0(b);X.restore()}
function dOverseer0(b){const x=b.x,y=b.y,ph=b.ph,t=b.t,c='#ff2a4a';X.fillStyle='rgba(0,0,0,.35)';ell(X,x,y+90,60,14);X.fill();add(X,()=>glow(X,x,y+90,70,c,.15));
 for(let i=0;i<4;i++){const a=i/4*TAU+.4;X.strokeStyle='#14121c';X.lineWidth=3;X.beginPath();X.moveTo(x+Math.cos(a)*30,y+20);X.quadraticCurveTo(x+Math.cos(a)*44,y+60,x+Math.cos(a)*36+Math.sin(t*2+i)*4,y+76);X.stroke();add(X,()=>glow(X,x+Math.cos(a)*36+Math.sin(t*2+i)*4,y+76,4,c,.8))}
 for(let i=0;i<6;i++){const a=i/6*TAU+t*.4,det=ph>=2&&i%2?6+Math.sin(t*3+i)*2:0,r0=44+det,r1=60+det;X.save();X.translate(x,y);X.rotate(a);celP(X,()=>poly(X,[r0,-14,r1,-10,r1,10,r0,14]),ph==3&&i%3==0?'#3a1a20':'#2a2a38',c,1.8);add(X,()=>{X.fillStyle=c;X.fillRect(r0+3,-2,r1-r0-6,4)});X.restore();if(det&&Math.random()<.15)G.P.push({x:x+Math.cos(a)*r0,y:y+Math.sin(a)*r0,vx:rnd(-40,40),vy:rnd(-40,40),l:.2,L:.2,c:'#ffd08a',k:'g',s:2})}
 celE(X,x,y,38,38,'#1c1a28',c);celE(X,x,y,28,28,'#0c0a12');
 const charge=G.BM.some(q=>q.att===b&&q.t<q.warn),ex=Math.cos(b.eye)*7,ey=Math.sin(b.eye)*7;
 ell(X,x,y,22,22);X.fillStyle='#e8e0e8';X.fill();ell(X,x+ex,y+ey,13,13);X.fillStyle=charge?'#ffffff':c;X.fill();ell(X,x+ex,y+ey,6,6);X.fillStyle=INK;X.fill();
 add(X,()=>{glow(X,x+ex,y+ey,charge?50:30,c,charge?.95:.6);if(ph==3){X.strokeStyle=rgba(c,.8);X.lineWidth=1.4;X.beginPath();X.moveTo(x-20,y-30);X.lineTo(x-8,y-12);X.lineTo(x-14,y);X.moveTo(x+24,y+18);X.lineTo(x+10,y+10);X.stroke()}});
 X.strokeStyle=INK;X.lineWidth=2;ell(X,x,y,22,22);X.stroke();ell(X,x-8,y-9,4,3);X.fillStyle='rgba(255,255,255,.8)';X.fill()}
function dShogun(b){const g=G,x=b.x,y=b.y;if(b.dash&&b.dash.t>=b.dash.warn)for(let i=1;i<5;i++){X.globalAlpha=.18;drawFig(X,b.a,x-(b.dash.x1-b.dash.x0)*.03*i,y+61-(b.dash.y1-b.dash.y0)*.03*i,1.9,4,0,3);X.globalAlpha=1}
 add(X,()=>{glow(X,x,y-20,80,'#ff2a4a',.25+(b.storm>0?.25:0));if(b.dash&&b.dash.t<b.dash.warn)glow(X,x,y-20,60,'#ffffff',.3*Math.sin(FT*40))});
 const f=b.dash?3:(b.dist*.12|0);drawFig(X,b.a,x,y+61,1.9,f,0,3.4);
 if(b.storm>0)add(X,()=>{X.save();X.translate(x,y-24);X.rotate(b.sa||0);for(let i=0;i<4;i++){X.rotate(Math.PI/2);X.strokeStyle=rgba('#ff2a4a',.6);X.lineWidth=3;X.beginPath();X.arc(0,0,46,-.3,.3);X.stroke()}X.restore()})}
function dHydra(b){const k=HK;X.save();X.translate(b.x,b.y);X.scale(k,k);X.translate(-b.x,-b.y);const hs=b.heads;b.heads=hs.map(h=>({x:b.x+(h.x-b.x)/k,y:b.y+(h.y-b.y)/k,i:h.i}));dHydra0(b);b.heads=hs;X.restore()}
function dHydra0(b){const x=b.x,y=b.y,c='#7aff3a',t=b.t;X.fillStyle='rgba(0,0,0,.4)';ell(X,x,y+40,110,18);X.fill();
 for(const h of b.heads){const n=7;for(let i=0;i<n;i++){const k=i/(n-1),cx=lerp(x+h.i*30,h.x,k),cy=lerp(y+10,h.y,k)-Math.sin(k*Math.PI)*18;celE(X,cx,cy,7-k*2,6-k*2,'#2a3a2a',c,1.6)}}
 celP(X,()=>poly(X,[x-70,y-24,x+70,y-24,x+86,y+4,x+60,y+30,x-60,y+30,x-86,y+4]),'#2a302a',c,2.2);
 X.save();X.beginPath();poly(X,[x-70,y-24,x+70,y-24,x+86,y+4,x+60,y+30,x-60,y+30,x-86,y+4]);X.clip();for(let i=-8;i<9;i++){X.fillStyle=i%2?'#ffcf2a':INK;X.beginPath();X.moveTo(x+i*12,y+20);X.lineTo(x+i*12+8,y+20);X.lineTo(x+i*12+2,y+32);X.lineTo(x+i*12-6,y+32);X.fill()}X.restore();
 celE(X,x,y-2,18,14,'#14180f',c);add(X,()=>{glow(X,x,y-2,30,c,.7+.3*Math.sin(t*4));for(let i=-2;i<=2;i++){if(i==0)continue;X.fillStyle=c;X.fillRect(x+i*26-4,y-16,8,3)}});
 for(const h of b.heads){X.save();X.translate(h.x,h.y);X.rotate(Math.atan2(G.py-h.y,G.px-h.x)-Math.PI/2);
  celP(X,()=>poly(X,[-13,-10,13,-10,16,6,6,22,-6,22,-16,6]),'#344034',c,1.9);celP(X,()=>poly(X,[-9,12,9,12,5,26,-5,26]),'#222a22',null,1.6);
  add(X,()=>{for(const s of[-1,1]){X.fillStyle=c;X.beginPath();X.moveTo(s*4,2);X.lineTo(s*11,-2);X.lineTo(s*10,3);X.closePath();X.fill();glow(X,s*8,1,9,c,.9)}glow(X,0,26,10,c,.6)});
  for(const s of[-1,1])celP(X,()=>poly(X,[s*10,-8,s*18,-22,s*14,-6]),'#4a5a4a',null,1.4);X.restore()}}
function dQueen(b){const g=G;const A=b.tp>0?(b.tp>.25?(b.tp-.25)/.25:1-b.tp/.25):1;
 const draw=(x,y,rig,real)=>{const f=(b.dist*.1|0);X.globalAlpha=A*(real?1:.92);
  const c=spr(rig,((f%8)+8)%8,0,4),s=2.05,w=140*s,h=170*s,dx=x-70*s,dy=y+92-150*s;
  for(let i=0;i<8;i++){const sy=i/8,off=Math.random()<.15?rnd(-8,8):0;X.drawImage(c,0,sy*c.height,c.width,c.height/8,dx+off,dy+sy*h,w,h/8)}
  X.globalAlpha=1;add(X,()=>glow(X,x,y-10,60,'#c03aff',.25))};
 draw(b.x,b.y,RG.queen,1);for(const c of b.copies)draw(c.x,c.y,RG.queenC,0);
 add(X,()=>{for(const p of[b,...b.copies]){X.save();X.translate(p.x,p.y-104);X.rotate(FT*.8);X.strokeStyle=rgba('#3ff0ff',.5);X.lineWidth=1.2;for(let i=0;i<3;i++){X.rotate(TAU/3);X.strokeRect(-10,-10,20,20)}X.restore()}})}
/* ---- entities ---- */
function drawEnemy(e){const f=(e.dist*.11+e.ph)|0,feet=e.y+40*e.s,z=3,sx=1+e.sq*.1,sy=1-e.sq*.08;
 if(e.el){const c=ELITE[e.el].c;add(X,()=>{ell(X,e.x,feet-2,e.r*1.4,e.r*.5);X.strokeStyle=rgba(c,.8);X.lineWidth=2;X.stroke();glow(X,e.x,e.y,e.r*2.2,c,.3+.15*Math.sin(FT*8))})}
 if(e.state=='aim'){add(X,()=>{if(e.d.shoot){const a=Math.atan2(G.py-10-e.y,G.px-e.x);X.beginPath();X.moveTo(e.x,e.y-10);X.lineTo(e.x+Math.cos(a)*900,e.y-10+Math.sin(a)*900);X.strokeStyle=rgba('#ff2a3a',.35+.35*Math.sin(FT*40));X.lineWidth=1.2;X.stroke()}glow(X,e.x,e.y-8,24,e.d.summon?'#3aff6a':'#ff2a3a',.4+.25*Math.sin(e.t*30))})}
 drawFig(X,e.a,e.x,feet,e.s,f,0,z,sx,sy);
 if(e.fl>0)add(X,()=>{X.globalAlpha=.55;drawFig(X,e.a,e.x,feet,e.s,f,0,z,sx,sy);X.globalAlpha=1});
 if(e.burn>0)add(X,()=>glow(X,e.x,e.y,e.r*1.6,'#ff2ad8',.35+Math.random()*.2));
 if(e.slow>0)add(X,()=>glow(X,e.x,e.y,e.r*1.4,'#7ad8ff',.25));
 if(e.d.bomb)add(X,()=>glow(X,e.x,e.y-6*e.s,8+Math.random()*5,'#ff8a2a',.9));
 if(e.hp<e.mh||e.el){const w=Math.max(22,e.r*2),y=feet-80*e.s-6;X.fillStyle='rgba(0,0,0,.7)';X.fillRect(e.x-w/2-1,y-1,w+2,5);X.fillStyle=e.el?ELITE[e.el].c:'#ff2a4a';X.fillRect(e.x-w/2,y,w*Math.max(0,e.hp/e.mh),3);
  if(e.shp>0){X.fillStyle='#3a8aff';X.fillRect(e.x-w/2,y-4,w*Math.max(0,e.shp/(e.mh*.6)),2)}}}
function drawPlayer(g){const r=g.r,py=g.py,feet=py+52,s=1.08;
 for(const t of g.trail)add(X,()=>{X.globalAlpha=t.t*1.6;drawFig(X,r,t.x,t.y+52,s,(g.t*12)|0,1,3.6);X.globalAlpha=1});
 add(X,()=>glow(X,g.px,feet-2,26,r.neon,.35));
 const blink=g.inv>0&&((g.t*14|0)%2);X.globalAlpha=blink?.4:(r.holo?.9:1);
 if(r.holo&&Math.random()<.12){const c=spr(r,(g.t*12|0)%8,1,3.6),y0=rnd(.2,.8);drawFig(X,r,g.px,feet,s,(g.t*12)|0,1,3.6);X.drawImage(c,0,c.height*y0,c.width,c.height*.08,g.px-70*s+rnd(-6,6),feet-150*s+170*s*y0,140*s,170*s*.08)}
 else drawFig(X,r,g.px,feet,s,(g.t*12)|0,1,3.6);X.globalAlpha=1;
 if(r.wpn=='drones')for(let i=0;i<2;i++){const a=g.t*2.4+i*Math.PI,x=g.px+Math.cos(a)*24,y=py-46+Math.sin(a)*8;celE(X,x,y,5,4,'#12302a',r.neon,1.4);add(X,()=>glow(X,x,y,9,r.neon,.9))}
 if(g.mf>0)add(X,()=>glow(X,g.px,py-56,22,r.pc,.9));
 if(g.K2)0;
 if(g.sk.blades&&!g.db.emp){const nb=g.sk.blades+1;for(let i=0;i<nb;i++){const a=g.ang+i*TAU/nb,bx=g.px+Math.cos(a)*52,by=py-18+Math.sin(a)*40;add(X,()=>{glow(X,bx,by,20,'#c06aff',.7);X.save();X.translate(bx,by);X.rotate(a+FT*10);X.fillStyle='#f0e0ff';X.fillRect(-11,-1.2,22,2.4);X.restore()})}}
 if(g.sh>0&&!g.db.emp)add(X,()=>{X.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+FT;X.lineTo(g.px+Math.cos(a)*34,py-14+Math.sin(a)*42)}X.closePath();X.strokeStyle=rgba('#3ac8ff',.6+.3*Math.sin(FT*8));X.lineWidth=2;X.stroke();X.fillStyle=rgba('#3ac8ff',.08);X.fill()});
 if(g.bf.over)add(X,()=>glow(X,g.px,py-20,50,'#ffd84a',.25+.1*Math.sin(FT*20)))}
function drawGates(t){const g=G;
 for(const side of[0,1]){const o=side?t.R:t.L,x0=side?W/2+3:7,w=W/2-10,y=t.y,h=56,dl=gDelta(o),good=dl.n>0||(dl.n==0&&o.v>0),c=o.risk?'#ff2ad8':good?'#3ff0ff':'#ff2a4a';
  X.save();cut(X,x0,y,w,h,10);X.clip();let q=X.createLinearGradient(0,y,0,y+h);q.addColorStop(0,rgba(c,.05));q.addColorStop(1,rgba(c,.42));X.fillStyle=q;X.fillRect(x0,y,w,h);
  X.fillStyle=rgba(c,.12);for(let yy=y;yy<y+h;yy+=3)X.fillRect(x0,yy,w,1);const sx=x0-40+((g.t*140+side*90)%(w+80));q=X.createLinearGradient(sx-24,0,sx+24,0);q.addColorStop(0,'rgba(255,255,255,0)');q.addColorStop(.5,'rgba(255,255,255,.2)');q.addColorStop(1,'rgba(255,255,255,0)');X.fillStyle=q;X.fillRect(sx-24,y,48,h);X.restore();
  add(X,()=>{cut(X,x0,y,w,h,10);X.strokeStyle=rgba(c,.35);X.lineWidth=6;X.stroke();X.strokeStyle=c;X.lineWidth=1.8;X.stroke()});
  X.save();const ps=1+o.pulse*.2;X.translate(x0+w/2,y+h/2);X.scale(ps,ps);X.textAlign='center';X.textBaseline='middle';X.font='900 26px ui-monospace,Menlo,monospace';X.lineJoin='round';X.lineWidth=5;X.strokeStyle='rgba(0,0,10,.7)';X.strokeText(dl.t,0,-6);X.fillStyle='#fff';X.fillText(dl.t,0,-6);
  X.font='800 9px ui-monospace,Menlo,monospace';X.fillStyle=c;X.fillText(o.risk?'⚠ '+GS_[o.s].lab+' + VIRUS':GS_[o.s].lab,0,15);X.restore()}
 add(X,()=>{for(const px of[5,W/2,W-5]){X.fillStyle='#1a1a24';X.fillRect(px-3,t.y-8,6,72);glow(X,px,t.y-8,10,'#ffffff',.6);glow(X,px,t.y+64,10,'#ffffff',.6)}})}
/* ---- master draw ---- */
function drawWorld(dt){const g=G,r=g.r;FT+=dt;X.save();
 if(g.zoom!=1){X.translate(g.zx,g.zy);X.scale(g.zoom,g.zoom);X.translate(-g.zx,-g.zy)}
 if(g.shk>0&&SET.shake){const k=g.shk*12;X.translate(rnd(-k,k),rnd(-k,k))}
 world(g);
 if(g.alarm>0)add(X,()=>{X.fillStyle=rgba('#ff1a2a',.12*(.5+.5*Math.sin(FT*12)));X.fillRect(0,0,W,H)});
 arenaFloor(g);
 for(const t of g.Gt)drawGates(t);
 for(const k of g.K){X.save();X.globalAlpha=1-k.t/.6;X.translate(k.x,k.y+40*k.s);X.rotate(k.rot*k.t*2);X.scale(1,1-k.t*.6);drawFig(X,k.a,0,0,k.s,k.f,0,3);X.restore()}
 drawHaz(g);
 for(const d of g.D){const bob=Math.sin(d.t*5)*3;dp(X,d.k,d.x,d.y+bob,d.k=='virus'?1.15:1.1,d.k=='virus'?Math.sin(d.t*9)*.3:0)}
 const L=g.E.filter(e=>!e.b).sort((a,b)=>a.y-b.y);for(const e of L)drawEnemy(e);
 if(g.boss)drawBoss(g.boss);
 if(!g.dead)drawPlayer(g);
 add(X,()=>{for(const b of g.B){const k=r.proj,rot=Math.atan2(b.vx,-b.vy);if(k=='plasma'||k=='seeker')dp(X,k,b.x-b.vx*.02,b.y-b.vy*.02,.6,rot);dp(X,k,b.x,b.y,k=='slug'?1.2:1.1,k=='slug'?0:rot)}
  for(const p of g.P){const a=cl(p.l/p.L,0,1);if(p.k=='g')glow(X,p.x,p.y,p.s*3,p.c,a);else if(p.k=='r'){X.globalAlpha=a;X.lineWidth=2.5*a;X.strokeStyle=p.c;X.beginPath();X.arc(p.x,p.y,p.s*(1.2-a),0,TAU);X.stroke();X.globalAlpha=1}}});
 for(const p of g.P)if(p.k=='c'){X.globalAlpha=cl(p.l/p.L*1.5,0,1);X.save();X.translate(p.x,p.y);X.rotate(p.r);X.fillStyle=p.c;X.fillRect(-p.s/2,-p.s/2,p.s,p.s);X.restore();X.globalAlpha=1}
 add(X,()=>{for(const b of g.EB){if(b.k=='ea')dp(X,'ea',b.x,b.y,1,Math.atan2(-b.vx,b.vy));else dp(X,b.k||'eb',b.x,b.y,1,b.k=='eb3'?FT*6:0)}});
 for(const b of g.EB)if(b.k!='ea'){ell(X,b.x,b.y,2.6,2.6);X.fillStyle='#fff';X.fill()}
 for(const c of g.C)dp(X,'coin',c.x,c.y,.85,FT*4);
 X.textAlign='center';X.textBaseline='middle';X.lineJoin='round';
 for(const t of g.T){const k=1-t.l/t.L,s=k<.12?.4+k/.12*.85:1.25-Math.min(.25,(k-.12)*1.6);X.save();X.globalAlpha=cl(t.l/.3,0,1);X.translate(t.x,t.y);X.scale(s,s);X.font='italic 900 '+t.sz+'px system-ui,sans-serif';X.lineWidth=6;X.strokeStyle='rgba(6,2,12,.85)';X.strokeText(t.s,0,0);X.fillStyle=t.c;X.fillText(t.s,0,0);X.restore()}
 weather(g,dt);cars(g,dt);
 X.restore();
 post(g,dt);hud(g)}
function post(g,dt){const D=DIST[g.di];
 X.save();X.globalCompositeOperation='overlay';X.fillStyle=rgba(D.tint,.07);X.fillRect(0,0,W,H);X.restore();
 X.drawImage(VG,0,0,W,H);X.drawImage(SCAN,0,0,W,H);
 if(g.db.black){X.save();const q=X.createRadialGradient(g.px,g.py-20,40,g.px,g.py-20,150);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(0,0,0,.96)');X.fillStyle=q;X.fillRect(0,0,W,H);X.restore()}
 if(g.hf>0){const q=X.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,H*.7);q.addColorStop(0,'rgba(255,0,40,0)');q.addColorStop(1,'rgba(255,0,40,'+(.5*g.hf)+')');X.fillStyle=q;X.fillRect(0,0,W,H)}
 const glv=Math.max(g.gl,g.db.glitch?.35:0);if(glv>0&&Math.random()<.7)glitch(glv);
 if(g.flash>0){X.fillStyle='rgba(255,250,240,'+Math.min(.85,g.flash)+')';X.fillRect(0,0,W,H)}
 if(g.lb>.01){const h=H*.085*g.lb;X.fillStyle='#000';X.fillRect(0,0,W,h);X.fillRect(0,H-h,W,h)}
 if(g.phase=='approach')warnBanner(g);
 if(g.banner)stageBanner(g.banner);
 if(g.card)titleCard(g.card)}
function glitch(k){X.save();X.setTransform(1,0,0,1,0,0);const n=2+(k*6|0);for(let i=0;i<n;i++){const y=Math.random()*cv.height,h=rnd(4,30)*DPR,dx=rnd(-20,20)*k*DPR;X.globalAlpha=.85;X.drawImage(cv,0,y,cv.width,h,dx,y,cv.width,h)}
 X.globalCompositeOperation='lighter';X.globalAlpha=.12*k;X.drawImage(cv,4*k*DPR,0);X.restore()}
function chroma(txt,x,y,c){X.save();X.globalCompositeOperation='lighter';X.fillStyle='rgba(255,0,60,.8)';X.fillText(txt,x-2,y);X.fillStyle='rgba(0,240,255,.8)';X.fillText(txt,x+2,y);X.restore();X.fillStyle=c;X.fillText(txt,x,y)}
function warnBanner(g){const t=g.pt,a=Math.min(1,(2.4-t)*4,t*4);X.save();X.globalAlpha=a;const y=H*.4;
 X.fillStyle='rgba(60,0,10,.75)';X.fillRect(0,y-50,W,100);X.save();X.beginPath();X.rect(0,y-50,W,10);X.rect(0,y+40,W,10);X.clip();X.fillStyle='#ff2a3a';for(let x=-40+((FT*120)%40);x<W+40;x+=40){X.beginPath();X.moveTo(x,y-50);X.lineTo(x+20,y-50);X.lineTo(x+10,y+50);X.lineTo(x-10,y+50);X.fill()}X.restore();
 X.textAlign='center';X.textBaseline='middle';X.font='italic 900 40px system-ui,sans-serif';const s=1+Math.sin(FT*14)*.04;X.translate(W/2,y-6);X.scale(s,s);chroma('WARNING',0,0,'#ff3a4a');
 X.font='700 11px ui-monospace,Menlo,monospace';X.fillStyle='#ffd0d0';X.fillText('HOSTILE SIGNATURE DETECTED · ROAD LOCKDOWN',0,28);X.restore()}
function stageBanner(b){const k=2.8-b.t,a=Math.min(1,k*3,b.t*2.5),y=H*.34,sl=(1-Math.min(1,k*3))*50;X.save();X.globalAlpha=a;X.textAlign='center';X.textBaseline='middle';
 const q=X.createLinearGradient(0,0,W,0);q.addColorStop(0,'rgba(6,2,14,0)');q.addColorStop(.5,'rgba(6,2,14,.82)');q.addColorStop(1,'rgba(6,2,14,0)');X.fillStyle=q;X.fillRect(0,y-46,W,b.c?108:92);
 const D=DIST[G.di];add(X,()=>{X.fillStyle=D.line;X.fillRect(W/2-90+sl,y-44,180,1.5);X.fillRect(W/2-90-sl,y+(b.c?60:44),180,1.5)});
 X.font='700 11px ui-monospace,Menlo,monospace';X.fillStyle=D.line;X.fillText(b.a,W/2+sl,y-26);
 X.font='italic 900 30px system-ui,sans-serif';chroma(b.b,W/2-sl,y+2,'#ffffff');
 if(b.c){X.font='700 10.5px ui-monospace,Menlo,monospace';X.fillStyle='#ffb0c8';X.fillText(b.c,W/2,y+36)}X.restore()}
function titleCard(c){const L=c.small?1.6:3.2,k=L-c.t,a=Math.min(1,k*4,c.t*3),y=c.small?H*.3:H*.62;X.save();X.globalAlpha=a;X.textAlign='center';X.textBaseline='middle';
 const name=k<.35?c.a.split('').map(ch=>ch==' '?' ':Math.random()<.5?String.fromCharCode(33+Math.random()*60|0):ch).join(''):c.a;
 if(!c.small){X.fillStyle='rgba(4,0,8,.6)';X.fillRect(0,y-46,W,92);add(X,()=>{X.fillStyle=c.c;X.fillRect(0,y-46,W*Math.min(1,k*2),2);X.fillRect(W*(1-Math.min(1,k*2)),y+44,W,2)})}
 X.font='italic 900 '+(c.small?28:38)+'px system-ui,sans-serif';const sc=c.small?1:1+Math.max(0,.3-k)*.6;X.save();X.translate(W/2,y-8);X.scale(sc,sc);chroma(name,0,0,c.small?c.c:'#ffffff');X.restore();
 X.font='700 '+(c.small?10:11)+'px ui-monospace,Menlo,monospace';X.fillStyle=c.c;X.fillText(c.b,W/2,y+(c.small?14:22));X.restore()}
function hud(g){X.save();X.textBaseline='middle';
 let q=X.createLinearGradient(0,0,0,84);q.addColorStop(0,'rgba(4,2,10,.85)');q.addColorStop(1,'rgba(4,2,10,0)');X.fillStyle=q;X.fillRect(0,0,W,84);
 for(let i=0;i<g.mh;i++){const x=14+i*19,y=16;X.beginPath();X.moveTo(x+4,y);X.lineTo(x+16,y);X.lineTo(x+12,y+14);X.lineTo(x,y+14);X.closePath();if(i<g.hp){X.fillStyle='#ff2a5a';X.fill();add(X,()=>glow(X,x+8,y+7,12,'#ff2a5a',.5))}X.strokeStyle=i<g.hp?'#ffb0c0':'rgba(255,255,255,.25)';X.lineWidth=1.2;X.stroke()}
 let ix=18+g.mh*19;if(g.rev){X.font='900 13px system-ui';X.fillStyle='#3aff9a';X.textAlign='left';X.fillText('↻',ix-4,23);ix+=14}if(g.sh>0&&!g.db.emp)dp(X,'shield',ix+4,23,.6);
 // status effects
 let sx=12;const chip=(n,c,t,T)=>{X.fillStyle='rgba(6,2,12,.8)';cut(X,sx,38,62,16,4);X.fill();X.strokeStyle=c;X.lineWidth=1;X.stroke();X.fillStyle=c;X.fillRect(sx+2,51,58*cl(t/T,0,1),2);X.font='800 8.5px ui-monospace,Menlo,monospace';X.textAlign='left';X.fillText(n,sx+5,45.5);sx+=66};
 for(const k in g.db)chip('⚠'+DB[k].n,'#ff3a5a',g.db[k],DB[k].t);for(const k in g.bf)chip(BF[k].n,BF[k].c,g.bf[k],BF[k].t);
 X.textAlign='center';X.font='900 24px ui-monospace,Menlo,monospace';X.lineWidth=5;X.strokeStyle='rgba(0,0,0,.7)';const sc=String(Math.floor(g.sc)).padStart(6,'0');X.strokeText(sc,W/2,20);X.fillStyle='#fff';X.fillText(sc,W/2,20);
 const D=DIST[g.di],pw=110,px0=W/2-pw/2,py0=38,n=g.waves.length;for(let i=0;i<n;i++){const done=g.phase!='rest'&&(g.phase!='waves'||i<g.wi||(i==g.wi&&!g.q.length)),cur=g.phase=='waves'&&i==g.wi,w=pw/n-2;X.fillStyle=done?D.line:cur?rgba(D.line,.5):'rgba(255,255,255,.12)';X.fillRect(px0+i*(pw/n),py0,w,4)}
 X.font='800 8px ui-monospace,Menlo,monospace';X.fillStyle=D.line;X.textAlign='right';X.fillText('D'+String(g.stage).padStart(2,'0'),px0-5,py0+2.5);X.textAlign='left';X.fillStyle=g.boss?'#ff2a4a':'#8a7ab0';X.fillText('☠',px0+pw+4,py0+2.5);
 const cw=74,cx0=W-58-cw,ps=1+g.cpop*.12;X.save();X.translate(cx0+cw/2,22);X.scale(ps,ps);cut(X,-cw/2,-11,cw,22,5);X.fillStyle='rgba(6,2,12,.8)';X.fill();X.strokeStyle='rgba(255,216,74,.5)';X.lineWidth=1.2;X.stroke();dp(X,'coin',-cw/2+12,0,.8);X.textAlign='left';X.font='900 14px ui-monospace,Menlo,monospace';X.fillStyle='#ffe08a';X.fillText(Math.floor(g.co),-cw/2+24,1);X.restore();
 const b=g.boss;if(b&&g.phase!='intro'){b.hpL=b.hpL==null?b.hp:lerp(b.hpL,b.hp,.05);const bw=W-48,bx=24,by=70,c=b.bd.c;X.textAlign='left';X.font='italic 900 11px system-ui';X.fillStyle='#fff';X.fillText(b.bd.name,bx,by-9);X.textAlign='right';X.font='800 8px ui-monospace,Menlo,monospace';X.fillStyle=c;X.fillText('PHASE '+['','I','II','III'][b.ph],bx+bw,by-9);
  cut(X,bx,by,bw,9,3);X.fillStyle='rgba(0,0,0,.7)';X.fill();X.fillStyle='rgba(255,255,255,.5)';X.fillRect(bx+1,by+1,(bw-2)*Math.max(0,b.hpL/b.mh),7);X.fillStyle=c;X.fillRect(bx+1,by+1,(bw-2)*Math.max(0,b.hp/b.mh),7);add(X,()=>glow(X,bx+(bw-2)*Math.max(0,b.hp/b.mh),by+4,10,c,.8));
  X.fillStyle='#000';X.fillRect(bx+bw*.66,by,1.5,9);X.fillRect(bx+bw*.33,by,1.5,9);cut(X,bx,by,bw,9,3);X.strokeStyle=rgba(c,.8);X.lineWidth=1;X.stroke()}
 const L=g.lv,K=g.sk,ch=[['SHOTS',cl(L.shots+(K.multi||0),1,8)+'×','#ffd84a'],['RATE',Math.round(rateMul(L.rate)*(1+.15*(K.haste||0))*100)+'%','#3ff0ff'],['DMG',Math.round(dmgMul(L.dmg)*(1+.2*(K.power||0))*100)+'%','#ff2a8a']],cw2=88,y=H-24;
 ch.forEach((c,i)=>{const x=W/2+(i-1)*(cw2+6);cut(X,x-cw2/2,y-11,cw2,22,5);X.fillStyle='rgba(6,2,12,.75)';X.fill();X.strokeStyle=rgba(c[2],.5);X.lineWidth=1;X.stroke();X.textAlign='left';X.font='800 8px ui-monospace,Menlo,monospace';X.fillStyle=rgba(c[2],.8);X.fillText(c[0],x-cw2/2+7,y+1);X.textAlign='right';X.font='900 13px ui-monospace,Menlo,monospace';X.fillStyle='#fff';X.fillText(c[1],x+cw2/2-7,y+1)});
 X.restore()}

/* ================= menu & meta UI ================= */
const LOCK='<svg class="lki" viewBox="0 0 24 24" fill="#ff2a8a"><path d="M7 10V7a5 5 0 0110 0v3h1a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2h1zm2 0h6V7a3 3 0 00-6 0v3z"/></svg>';
const SON='<svg viewBox="0 0 24 24" fill="#3ff0ff"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" stroke="#3ff0ff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const SOFF='<svg viewBox="0 0 24 24" fill="#8a7ab0"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6" stroke="#ff2a5a" stroke-width="2" stroke-linecap="round"/></svg>';
function sndUI(){$('snd').innerHTML=SET.sfx?SON:SOFF;document.querySelectorAll('.sw').forEach(e=>e.classList.toggle('on',!!SET[e.dataset.k]))}
const heroDPS=r=>r.rate*r.dmg*(r.pierce?1.35:1)*(r.burn?1.4:1)*(r.big?.85:1)*(r.home?1.1:1);
function roster(){$('mc').textContent=coins;$('mb').textContent=best;$('mbs').textContent=bestSt;const ro=$('ro');ro.innerHTML='';
 RACES.forEach(r=>{const own=owned.includes(r.id),d=document.createElement('button');d.className='rc'+(r.id==view?' sel':'')+(own?'':' lk');d.style.setProperty('--hc',r.neon);
  const c=document.createElement('canvas');c.width=Math.round(60*DPR);c.height=Math.round(72*DPR);const g=c.getContext('2d');g.scale(DPR,DPR);drawFig(g,r,30,74,.56,0,0,3);d.append(c);
  if(!own)d.insertAdjacentHTML('beforeend',LOCK+'<div class="pr">◆ '+r.cost+'</div>');
  d.onclick=()=>{view=r.id;if(own){sel=r.id;LS.set('sel',sel)}sfx('click');$('msg').textContent='';roster()};ro.append(d)});
 const r=RACES.find(a=>a.id==view),own=owned.includes(view);$('hn').textContent=r.n;$('hn').style.setProperty('--hc',r.neon);$('hr').textContent=r.title;$('hd').textContent=r.lore;
 const hpv=(r.hp+(r.revive?r.hp:0))/6,dps=heroDPS(r)/7;
 $('hs').innerHTML=[['ARMOR',hpv,'#ff2a5a'],['FIREPOWER',dps,'#3ff0ff']].map(([l,v,c])=>`<span>${l}</span><div class="bar"><i style="width:${cl(v,.05,1)*100}%;background:${c};box-shadow:0 0 8px ${c}"></i></div>`).join('')+`<span>ABILITY</span><b class="abl">${r.ab}</b>`;
 const go=$('go'),lb=$('lb');if(own){go.textContent='DEPLOY';go.classList.remove('dis');lb.style.display='none'}else{go.textContent='UNLOCK ◆ '+r.cost;go.classList.toggle('dis',coins<r.cost);lb.style.display='block';lb.textContent='LOCKED'}}
function menu(){st='menu';G=null;view=sel;show('m');roster();$('dDot').style.display=dailyReady()?'block':'none';music('menu')}
const MB={dist:0,cars:[],A:[],P:[],scroll:60,di:0};
function drawMenuBG(dt){FT+=dt;MB.dist+=40*dt;drawRoad(MB.dist,0,1);drawRoofs(MB.dist*1.2,0,1);const fake={A:MB.A,P:MB.P,cars:MB.cars,di:0,scroll:40};weather(fake,dt);cars(fake,dt);MB.P.length=0;X.drawImage(VG,0,0,W,H);X.drawImage(SCAN,0,0,W,H)}
function drawShow(t){const c=$('hc'),g=c.getContext('2d'),r=RACES.find(a=>a.id==view);g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);g.scale(DPR,DPR);
 add(g,()=>{glow(g,105,120,100,r.neon,.2);const q=g.createLinearGradient(0,0,0,210);q.addColorStop(0,rgba(r.neon,0));q.addColorStop(1,rgba(r.neon,.18));g.fillStyle=q;g.fillRect(55,0,100,200);
  for(let i=0;i<3;i++){g.save();g.translate(105,200);g.scale(1,.3);g.rotate(t*(i%2?-.8:.6)+i);g.strokeStyle=rgba(r.neon,.6-i*.15);g.lineWidth=2;g.setLineDash([20+i*10,10]);g.beginPath();g.arc(0,0,58+i*14,0,TAU);g.stroke();g.restore()}g.setLineDash([])});
 g.save();g.translate(105,204);drawFig(g,r,0,Math.sin(t*2.2)*.6,1.8,0,0,5.6);g.restore();
 if(r.holo&&Math.random()<.1){g.globalAlpha=.5;g.fillStyle=rgba(r.neon,.3);g.fillRect(40,rnd(20,190),130,rnd(2,6));g.globalAlpha=1}
 add(g,()=>{for(let i=0;i<8;i++){const k=(t*.35+i/8)%1;glow(g,105+Math.sin(i*2.1+t)*70,200-k*180,4,r.neon,(1-k)*.9)}})}
$('go').onclick=()=>{const r=RACES.find(a=>a.id==view);if(owned.includes(view)){fade(start);return}
 if(coins<r.cost){$('msg').textContent='NEED '+(r.cost-coins)+' MORE CREDITS';sfx('bad');return}
 coins-=r.cost;owned.push(r.id);sel=r.id;LS.set('coins',coins);LS.set('owned',owned);LS.set('sel',sel);sfx('buy');$('msg').textContent='';roster()};
function setT(k,v){SET[k]=v;LS.set('set',SET);muted=!SET.sfx;if(k=='mus'){if(v)music();else musStop()}sndUI();sfx('click')}
$('snd').onclick=()=>setT('sfx',!SET.sfx);
document.querySelectorAll('.sw').forEach(e=>e.parentElement.onclick=()=>setT(e.dataset.k,!SET[e.dataset.k]));
let backTo='m';
function openOv(id){backTo=st=='pause'?'p':'m';sfx('click');show(id)}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{sfx('click');show(backTo);if(backTo=='m')roster()});
$('skR').onclick=()=>{if(pickRR<=0)return;pickRR--;sfx('click');renderPick(rollSkills())};
$('bSet').onclick=()=>openOv('set');$('bSet2').onclick=()=>openOv('set');
$('bTal').onclick=()=>{renderTal();openOv('tal')};
function renderTal(){$('tc').textContent=coins;const L=$('tL');L.innerHTML='';
 for(const t of TAL){const lv=ml(t.k),mx=lv>=t.max,c=mx?0:t.c[lv],d=document.createElement('div');d.className='it';
  d.innerHTML=`<div class="tico">${t.ic}</div><div class="tx"><b>${t.n}</b><span>${t.d}</span><div class="pips">${Array.from({length:t.max},(_,i)=>'<i class="'+(i<lv?'on':'')+'"></i>').join('')}</div></div><button class="buy ${mx||coins<c?'dis':''}">${mx?'MAX':'◆ '+c}</button>`;
  d.querySelector('.buy').onclick=()=>{if(mx)return;if(coins<c){sfx('bad');return}coins-=c;META[t.k]=lv+1;LS.set('meta',META);LS.set('coins',coins);sfx('buy');renderTal()};L.append(d)}}
$('bCod').onclick=()=>{renderCod();openOv('cod')};
function renderCod(){const L=$('cL');L.innerHTML='';const keys=Object.keys(CODEX);let n=0;
 for(const k of keys){const m=!!seen[k];if(m)n++;const d=document.createElement('div');d.className='it';const c=document.createElement('canvas');c.width=96;c.height=112;const g=c.getContext('2d');g.scale(2,2);
  const isB=k[0]=='b'&&k.length==2,bi=isB?+k[1]:0;if(isB){g.save();g.translate(24,30);g.scale(.42,.42);const fake={b:1};if(bi==2)drawFig(g,RG.shogun,0,60,.95,0,0,2.4);else if(bi==3)drawFig(g,RG.queen,0,60,.95,0,0,2.4);else{celE(g,0,0,38,38,bi==0?'#1c1a28':'#2a302a',bi==0?'#ff2a4a':'#7aff3a');add(g,()=>glow(g,0,0,30,bi==0?'#ff2a4a':'#7aff3a'))}g.restore()}
  else drawFig(g,RG[ET[k].rig],24,52,.48,0,0,2.4);if(!m){g.globalCompositeOperation='source-atop';g.fillStyle='#0a0614';g.fillRect(0,0,48,56)}
  d.append(c);d.insertAdjacentHTML('beforeend',`<div class="tx"><b>${m?CODEX[k][0]:'// ENCRYPTED'}</b><span>${m?CODEX[k][1]:'Not yet encountered.'}</span></div>`);L.append(d)}
 $('cS').textContent='DECRYPTED '+n+' / '+keys.length}
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
function dailyReady(){return daily.d!=today()}
function dayIdx(){const y=new Date();y.setDate(y.getDate()-1);const yd=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();return daily.d==yd?daily.s%7:0}
function renderDay(){const L=$('dL'),ready=dailyReady(),i=ready?dayIdx():((daily.s-1)%7);L.innerHTML=DAYR.map((v,k)=>`<div class="dy ${k<i||(!ready&&k==i)?'got':''} ${ready&&k==i?'now':''}">DAY ${k+1}<b>◆ ${v}</b></div>`).join('');
 const c=$('dC');c.textContent=ready?'CLAIM ◆ '+DAYR[i]:'COME BACK TOMORROW';c.classList.toggle('dis',!ready);$('dDot').style.display=ready?'block':'none'}
$('bDay').onclick=()=>{renderDay();openOv('dly')};
$('dC').onclick=()=>{if(!dailyReady())return;const i=dayIdx(),v=DAYR[i];daily={d:today(),s:i+1};coins+=v;LS.set('daily',daily);LS.set('coins',coins);sfx('buy');renderDay();$('mc').textContent=coins};

/* ================= loop & input ================= */
function fit(){DPR=window.devicePixelRatio||1;cv.width=Math.round(innerWidth*DPR);cv.height=Math.round(innerHeight*DPR);S=cv.width/W;H=cv.height/S;makeVG();const hc=$('hc');if(hc)hc.width=hc.height=Math.round(210*DPR);if(G&&G.ar)0}
addEventListener('resize',fit);
function loop(ts){const dt=Math.min(.033,(ts-last)/1000||0);last=ts;X.setTransform(S,0,0,S,0,0);
 if(st=='play')upd(dt);
 if(G)drawWorld(st=='play'?dt:0);else drawMenuBG(dt);
 if(st=='menu'){menuT+=dt;drawShow(menuT)}
 requestAnimationFrame(loop)}
let tx=null,ty=null;
addEventListener('pointerdown',e=>{tx=e.clientX;ty=e.clientY;au(1);if(SET.mus&&!MUS.on)music()});
addEventListener('pointermove',e=>{if(tx==null||st!='play'||!G)return;const k=W/innerWidth*1.35,inv=G.db.glitch?-1:1;G.tx=cl(G.tx+(e.clientX-tx)*k*inv,18,W-18);if(G.ar&&G.phase=='boss')G.ty=cl(G.ty+(e.clientY-ty)*k*inv,40,H-40);tx=e.clientX;ty=e.clientY});
addEventListener('pointerup',()=>tx=null);addEventListener('pointercancel',()=>tx=null);
function pause(){if(st=='play'){st='pause';show('p');musVol(.15)}}
function resume(){st='play';show(null);sfx('click');musVol(.55)}
window.pauseGame=pause;
window.back=()=>{const ov=['sk','tal','cod','dly','set'].find(k=>$(k).classList.contains('on'));if(ov&&ov!='sk'){show(backTo);if(backTo=='m')roster();return true}if(ov=='sk')return true;if(st=='play'){pause();return true}if(st=='pause'){resume();return true}if(st=='over'){menu();return true}if(st=='menu'&&view!=sel){view=sel;roster();return true}return false};
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();try{AC&&AC.suspend()}catch(e){}}else{try{AC&&AC.resume()}catch(e){}}});
function fade(fn){const f=$('fade');f.style.opacity=1;setTimeout(()=>{fn();f.style.opacity=0},320)}
$('again').onclick=()=>fade(start);$('home').onclick=()=>{sfx('click');fade(menu)};$('quit').onclick=()=>{sfx('click');fade(menu)};$('res').onclick=resume;$('pz').onclick=pause;
fit();sndUI();menu();requestAnimationFrame(loop);
(function warm(){const jobs=[];for(const r of RACES)for(let f=0;f<8;f++)jobs.push(()=>spr(r,f,1,3.6));for(const k of['drone','punk'])for(let f=0;f<8;f++)jobs.push(()=>spr(RG[k],f,0,3));for(let i=0;i<4;i++){jobs.push(()=>makeRoad(i));jobs.push(()=>makeRoofs(i))}
 (function step(){const j=jobs.shift();if(j){j();setTimeout(step,0)}})()})();
