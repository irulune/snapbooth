const T=[
{t:'drivers license',a:'Olivia Rodrigo',c:'Empty roads, full heart',k:'#7b6cf6',f:'Dusk'},
{t:'good 4 u',a:'Olivia Rodrigo',c:'Calm face, loud mind',k:'#ff3b8d',f:'Vivid'},
{t:'vampire',a:'Olivia Rodrigo',c:'Back out after dark',k:'#b3122e',f:'Noir'},
{t:'bad idea right?',a:'Olivia Rodrigo',c:'Ok but what if we did',k:'#ff9f0a',f:'Film'},
{t:'get him back!',a:'Olivia Rodrigo',c:'Plot twist, party of me',k:'#34c759',f:'Vivid'},
{t:'Flowers',a:'Miley Cyrus',c:'Party of one, still glowing',k:'#ffd60a',f:'Dreamy'},
{t:'Anti-Hero',a:'Taylor Swift',c:'Main character, side quest',k:'#5e5ce6',f:'Mono'},
{t:'Cruel Summer',a:'Taylor Swift',c:'Sunburnt and unbothered',k:'#ff453a',f:'Film'},
{t:'As It Was',a:'Harry Styles',c:'Spinning in the kitchen',k:'#ff6482',f:'Dreamy'},
{t:'Espresso',a:'Sabrina Carpenter',c:'Caffeinated, camera ready',k:'#c8a27a',f:'Film'},
{t:'Blinding Lights',a:'The Weeknd',c:'Neon after midnight',k:'#0a84ff',f:'Dusk'}];
const F={None:'none',Mono:'grayscale(1) contrast(1.1)',Film:'sepia(.35) contrast(1.1) saturate(1.2) brightness(1.05)',Dreamy:'brightness(1.1) saturate(1.3) contrast(.9) blur(.6px)',Vivid:'saturate(1.7) contrast(1.15)',Noir:'grayscale(1) contrast(1.6) brightness(.9)',Dusk:'hue-rotate(-15deg) saturate(1.3) sepia(.2) brightness(.95)'};
const shots=[],info=[],au=new Audio();au.preload='none';
let stream=null,step='left',ti=0,fk='Dusk',busy=false,lay='grid',vis='public',cOff=false,hLikes=false,imgText='',capText='',ui={};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const lum=c=>{const n=parseInt(c.slice(1),16);return(.299*(n>>16)+.587*(n>>8&255)+.114*(n&255))/255};
const fonts=()=>Promise.all(['700 38px Fraunces','500 22px DM Sans','600 36px Caveat'].map(f=>document.fonts.load(f))).catch(()=>{});

function leaveCreate(){
 step='left';busy=false;
 if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
 au.pause();document.documentElement.style.setProperty('--a','#7b6cf6');
}
async function viewCreate(v){
 leaveCreate();shots.length=0;step='shoot';ui={v};
 renderShoot(v);startCam();fonts();
}
async function startCam(){
 if(ui.msg)ui.msg.hidden=true;
 try{
  const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:960}},audio:false});
  if(step!=='shoot'){s.getTracks().forEach(t=>t.stop());return}
  stream=s;ui.vid.srcObject=s;ui.go.disabled=false;
 }catch(e){
  stream=null;ui.mt.textContent=navigator.mediaDevices?'Camera access is blocked. Allow it in your browser settings, then tap Allow camera.':'Camera needs HTTPS.';ui.msg.hidden=false;
 }
}
async function song(i){
 if(info[i])return info[i];
 try{const r=await fetch('/api/song?title='+encodeURIComponent(T[i].t)+'&artist='+encodeURIComponent(T[i].a));info[i]=r.ok?await r.json():{}}catch(e){info[i]={}}
 return info[i];
}
async function showSong(i){
 au.pause();au.removeAttribute('src');ui.pf.style.width='0';ui.pp.disabled=true;
 ui.nt.textContent=T[i].t;ui.na.textContent=T[i].a;ui.art.removeAttribute('src');ui.lb.replaceChildren();ui.lc.textContent='';
 const d=await song(i);if(i!==ti||step!=='shoot')return;
 if(d.preview){au.src=d.preview;ui.pp.disabled=false}
 if(d.art)ui.art.src=d.art;
 if(d.lyrics&&d.lyrics.length){d.lyrics.forEach(s=>ui.lb.append(h('p',{},s)));ui.lc.textContent=d.copyright||'';if(d.pixel)new Image().src=d.pixel}
 else ui.lb.textContent='Lyrics are not available for this song.';
}
function pick(i){
 ti=i;fk=T[i].f;
 ui.songs.forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));
 ui.chips.forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===fk)));
 ui.vid.style.filter=F[fk];document.documentElement.style.setProperty('--a',T[i].k);showSong(i);
}
function renderShoot(v){
 const vid=h('video',{id:'v',autoplay:true,playsinline:true});vid.muted=true;
 const cd=h('div',{id:'cd','aria-live':'assertive'}),fl=h('div',{id:'fl'}),mt=h('p',{}),msg=h('div',{id:'msg',hidden:true},mt,h('button',{class:'btn p',onclick:startCam},'Allow camera'));
 const go=h('button',{id:'go','aria-label':'Take 4 photos',onclick:run});go.disabled=true;
 const hint=h('p',{class:'hint mute',style:'text-align:center;margin:0'},'Four photos, three seconds apart. Press space on a keyboard.');
 const chips=Object.keys(F).map(k=>h('button',{class:'chip','aria-pressed':String(k===fk),onclick:()=>{fk=k;ui.chips.forEach(c=>c.setAttribute('aria-pressed',String(c.textContent===k)));vid.style.filter=F[k]}},k));
 const songs=T.map((t,i)=>h('button',{class:'song','aria-pressed':String(i===ti),style:'--c:'+t.k+';--t:'+(lum(t.k)>.62?'#1c1a16':'#fff'),onclick:()=>pick(i)},h('i'),h('span',{},t.t)));
 const art=h('img',{alt:''}),nt=h('b',{}),na=h('span',{}),pf=h('i'),pp=h('button',{id:'pp','aria-label':'Play preview',onclick:()=>{if(au.paused)au.play().catch(()=>toast('Could not play the preview'));else au.pause()}},'\u25B6');
 const lb=h('div',{class:'lb'}),lc=h('p',{class:'cp'});
 Object.assign(ui,{vid,cd,fl,go,msg,mt,hint,chips,songs,art,nt,na,pf,pp,lb,lc});
 au.onplay=()=>{if(ui.pp)ui.pp.textContent='\u275A\u275A'};au.onpause=au.onended=()=>{if(ui.pp)ui.pp.textContent='\u25B6'};
 au.ontimeupdate=()=>{if(ui.pf)ui.pf.style.width=(au.duration?au.currentTime/au.duration*100:0)+'%'};
 v.replaceChildren(h('div',{class:'cr'},
  h('h2',{},'New post'),
  h('div',{class:'view'},vid,fl,cd,msg),
  h('div',{class:'frow',role:'group','aria-label':'Filters'},...chips),
  h('div',{class:'shut'},go),hint,
  h('div',{class:'lbl'},'Song vibe'),
  h('div',{class:'songs',role:'group','aria-label':'Songs'},...songs),
  h('div',{class:'np'},art,h('div',{class:'meta'},nt,na,h('div',{class:'pbar'},pf)),pp),
  h('p',{class:'hint mute',style:'margin:0'},'30-second previews from iTunes. The music plays while you pose.'),
  h('details',{},h('summary',{},'Lyrics'),lb,lc)));
 pick(ti);
}
function grab(){
 const c=document.createElement('canvas');c.width=560;c.height=420;const x=c.getContext('2d'),v=ui.vid;
 const vw=v.videoWidth,vh=v.videoHeight;let sw=vw,sh=vh,sx=0,sy=0;
 if(vw/vh>4/3){sw=vh*4/3;sx=(vw-sw)/2}else{sh=vw*3/4;sy=(vh-sh)/2}
 if('filter' in x)x.filter=F[fk];
 x.translate(560,0);x.scale(-1,1);x.drawImage(v,sx,sy,sw,sh,0,0,560,420);
 return c;
}
async function run(){
 if(busy||!stream||step!=='shoot')return;
 busy=true;ui.go.disabled=true;shots.length=0;
 if(au.src&&au.paused)au.play().catch(()=>{});
 for(let i=0;i<4;i++){
  ui.hint.textContent='Photo '+(i+1)+' of 4';
  for(let n=3;n>0;n--){ui.cd.textContent=n;await wait(900);if(step!=='shoot')return}
  ui.cd.textContent='';ui.fl.classList.remove('on');void ui.fl.offsetWidth;ui.fl.classList.add('on');
  if(navigator.vibrate)navigator.vibrate(15);
  shots.push(grab());await wait(500);if(step!=='shoot')return;
 }
 busy=false;step='compose';imgText=T[ti].c;capText='';
 if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
 renderCompose(ui.v);
}
function paint(c,l){
 const t=T[ti],grid=l==='grid',W=grid?1160:640,P=40,G=28,H=grid?1062:P+4*408+3*G+190,x=c.getContext('2d');
 c.width=W;c.height=H;x.fillStyle='#fbf8f1';x.fillRect(0,0,W,H);
 for(let i=0;i<4;i++){
  const px=grid?24+(i%2)*568:48,py=grid?24+Math.floor(i/2)*432:P+i*(408+G);
  x.save();x.shadowColor='rgba(60,45,15,.25)';x.shadowBlur=10;x.shadowOffsetY=3;x.fillStyle='#fff';x.fillRect(px-5,py-5,554,418);x.restore();
  if(shots[i])x.drawImage(shots[i],px,py,544,408);
 }
 const y0=grid?950:P+4*408+3*G+54;
 x.textAlign='center';x.fillStyle='#1c1a16';
 x.font='700 38px Fraunces,Georgia,serif';x.fillText(t.t,W/2,y0);
 x.globalAlpha=.65;x.font='500 22px DM Sans,sans-serif';x.fillText(t.a,W/2,y0+32);x.globalAlpha=1;
 const s=imgText.trim();
 if(s){x.font='600 36px Caveat,cursive';const w=x.measureText(s).width;x.globalAlpha=.4;x.fillStyle=t.k;x.fillRect(W/2-w/2-10,y0+64,w+20,34);x.globalAlpha=1;x.fillStyle='#1c1a16';x.fillText(s,W/2,y0+90)}
}
const toJpeg=l=>{const c=document.createElement('canvas');paint(c,l);return new Promise(r=>c.toBlob(r,'image/jpeg',.9))};
function renderCompose(v){
 const cv=h('canvas',{class:'cpv'}),draw=()=>{paint(cv,lay);cv.className='cpv'+(lay==='strip'?' s':'')};
 const segs=[['grid','Collage'],['strip','Tall strip']].map(([k,l])=>h('button',{class:'chip','aria-pressed':String(lay===k),onclick:()=>{lay=k;segs.forEach(s=>s.setAttribute('aria-pressed',String(s.dataset.k===lay)));draw()},'data-k':k},l));
 const ti2=h('input',{maxlength:40,value:imgText,placeholder:'Text on the image','aria-label':'Text on the image',oninput:e=>{imgText=e.target.value;draw()}});
 const ta=h('textarea',{maxlength:300,rows:3,placeholder:'Write a caption','aria-label':'Caption',oninput:e=>{capText=e.target.value}},capText);
 const opts=Object.keys(VIS).map(k=>h('button',{class:'opt',role:'radio','aria-checked':String(vis===k),'data-k':k,onclick:()=>{vis=k;opts.forEach(o=>o.setAttribute('aria-checked',String(o.dataset.k===vis)))}},h('div',{},h('b',{},VIS[k][0]),h('small',{},VIS[k][1]))));
 const sw=(t,get,set)=>h('label',{class:'sw'},t,h('input',{type:'checkbox',checked:get(),onchange:e=>set(e.target.checked)}));
 const share=h('button',{class:'btn p wide'},'Share');
 share.onclick=async()=>{
  share.disabled=true;
  const bucket=vis==='public'?'posts':'strips',path=me.id+'/'+crypto.randomUUID()+'.jpg',blob=await toJpeg(lay);
  const up=await sb.storage.from(bucket).upload(path,blob,{contentType:'image/jpeg'});
  if(up.error){share.disabled=false;return toast('Could not upload. Try again.')}
  const ins=await sb.from('posts').insert({image_path:path,caption:capText.trim(),song:T[ti].t,artist:T[ti].a,visibility:vis,layout:lay,filter:fk,comments_off:cOff,hide_likes:hLikes});
  if(ins.error){await sb.storage.from(bucket).remove([path]);share.disabled=false;return toast('Could not share. Try again.')}
  toast(vis==='private'?'Saved to your profile (only you can see it)':'Posted');location.hash='#/u/'+mp.username;
 };
 v.replaceChildren(h('div',{class:'cr'},
  h('h2',{},'New post'),
  h('div',{class:'seg2',role:'group','aria-label':'Layout'},...segs),
  cv,ti2,
  h('button',{class:'chip',style:'justify-self:start',onclick:()=>{ta.value=capText=T[ti].c}},'Use: '+T[ti].c),ta,
  h('div',{class:'lbl'},'Who can see this'),h('div',{role:'radiogroup','aria-label':'Visibility',style:'display:grid;gap:8px'},...opts),
  h('div',{class:'lbl'},'More settings'),
  sw('Turn off commenting',()=>cOff,x=>{cOff=x}),sw('Hide like count',()=>hLikes,x=>{hLikes=x}),
  share,
  h('div',{class:'seg2',style:'justify-content:center'},
   h('button',{class:'btn',onclick:async()=>{const b=await toJpeg(lay),a=h('a',{href:URL.createObjectURL(b),download:'snapbooth-'+T[ti].t.replace(/[^a-z0-9]+/gi,'-')+'.jpg'});a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}},'Download'),
   h('button',{class:'btn',onclick:()=>printImgs([cv.toDataURL('image/jpeg',.92)])},'Print'),
   h('button',{class:'btn',onclick:()=>viewCreate(v)},'Retake'))));
 draw();fonts().then(draw);
}
document.addEventListener('keydown',e=>{if(e.code==='Space'&&step==='shoot'&&location.hash==='#/create'&&!/INPUT|BUTTON|TEXTAREA|SUMMARY/.test(document.activeElement.tagName)){e.preventDefault();run()}});
boot();
