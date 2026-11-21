const sb=supabase.createClient('https://xpqrroetdrrnkbbevzbv.supabase.co','sb_publishable_Fd73gR2c71B4TapPq-clIA_5Zfu5lRo');
const $=id=>document.getElementById(id);
const h=(t,p={},...k)=>{const e=document.createElement(t);for(const a in p){const b=p[a];if(b==null||b===false)continue;if(a==='class')e.className=b;else if(a.startsWith('on'))e[a]=b;else e.setAttribute(a,b===true?'':b)}e.append(...k.flat().filter(x=>x!=null&&x!==false));return e};
const SVG={home:`<path d='M3 11l9-8 9 8v10h-6v-6H9v6H3z'/>`,search:`<circle cx='11' cy='11' r='7'/><path d='M21 21l-5-5'/>`,plus:`<rect x='3' y='3' width='18' height='18' rx='5'/><path d='M12 8v8M8 12h8'/>`,send:`<path d='M22 3L9.5 14.5M22 3l-7 18-5.5-6.5L3 9z'/>`,heart:`<path d='M12 21s-8-5.3-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.7-8 11-8 11z'/>`,comment:`<path d='M21 12a8 8 0 01-11.6 7.1L3 21l1.9-5.4A8 8 0 1121 12z'/>`,user:`<circle cx='12' cy='8' r='4'/><path d='M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7'/>`,more:`<circle cx='5' cy='12' r='1.6'/><circle cx='12' cy='12' r='1.6'/><circle cx='19' cy='12' r='1.6'/>`};
const ico=(n,s=26)=>{const e=document.createElement('span');e.style.display='grid';e.innerHTML=`<svg viewBox='0 0 24 24' width='${s}' height='${s}' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'>${SVG[n]}</svg>`;return e};
const pub=p=>sb.storage.from('posts').getPublicUrl(p).data.publicUrl;
const POST='id,user_id,image_path,caption,song,artist,created_at,visibility,layout,filter,comments_off,hide_likes,profiles!posts_user_id_fkey(username,avatar_path),likes(count),comments(count)';
const VIS={public:['Public','Everyone on Snapbooth can see it'],followers:['Followers','Only people who follow you'],private:['Only me','Just you, like a saved draft']};
let me=null,mp=null,unread=0,cur=null,mode='following',menuEl=null;
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),3000)}
function ago(d){const s=(Date.now()-new Date(d))/1000;if(s<60)return 'now';if(s<3600)return Math.floor(s/60)+'m';if(s<86400)return Math.floor(s/3600)+'h';if(s<604800)return Math.floor(s/86400)+'d';return new Date(d).toLocaleDateString()}
function hue(s){let n=0;for(const c of s)n=(n*31+c.charCodeAt(0))%360;return n}
function avatar(p,size){const a=h('span',{class:'av'});if(size)a.style.cssText='width:'+size+'px;height:'+size+'px;font-size:'+Math.round(size/2.4)+'px';if(p.avatar_path)a.append(h('img',{src:pub(p.avatar_path),alt:'',style:'width:100%;height:100%;object-fit:cover'}));else{a.textContent=(p.username||'?')[0].toUpperCase();a.style.background='hsl('+hue(p.username||'')+' 45% 50%)'}return a}
const closeDlg=()=>{const d=$('dlg');if(d.open)d.close()};
async function copy(t,m){try{await navigator.clipboard.writeText(t);toast(m||'Link copied')}catch(e){toast('Could not copy')}}

function closeMenu(){if(menuEl){menuEl.remove();menuEl=null}}
function openMenu(items,x,y){
 closeMenu();
 const m=h('div',{class:'menu',role:'menu'});
 items.forEach(it=>{
  if(it.head)return m.append(h('div',{class:'mh'},it.head));
  if(it.sep)return m.append(h('hr'));
  m.append(h('button',{role:it.on==null?'menuitem':'menuitemradio','aria-checked':it.on==null?null:String(!!it.on),class:it.danger?'danger':'',onclick:()=>{closeMenu();it.fn()}},h('span',{class:'ck'},it.on?'\u2713':''),it.label));
 });
 document.body.append(m);menuEl=m;
 m.style.left=Math.max(8,Math.min(x,innerWidth-m.offsetWidth-8))+'px';m.style.top=Math.max(8,Math.min(y,innerHeight-m.offsetHeight-8))+'px';
 const f=m.querySelector('button');if(f)f.focus({preventScroll:true});
}
document.addEventListener('pointerdown',e=>{if(menuEl&&!menuEl.contains(e.target))closeMenu()},true);
addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
addEventListener('resize',closeMenu);

async function hydrate(list){
 const priv=list.filter(p=>p.visibility!=='public'),m={};
 if(priv.length){const r=await sb.storage.from('strips').createSignedUrls(priv.map(p=>p.image_path),3600);(r.data||[]).forEach(x=>{if(x.signedUrl)m[x.path]=x.signedUrl})}
 list.forEach(p=>{p._url=p.visibility==='public'?pub(p.image_path):(m[p.image_path]||'')});
 return list;
}
function imgEl(p,props){
 const im=h('img',Object.assign({src:p._url||null},props));
 im.onerror=async()=>{im.onerror=null;let u=null;if(p.visibility==='public'){const r=await sb.storage.from('strips').createSignedUrl(p.image_path,3600);u=r.data&&r.data.signedUrl}else u=pub(p.image_path);if(u){p._url=u;im.src=u}};
 return im;
}
async function fetchImg(p){
 try{const r=await fetch(pub(p.image_path));if(r.ok&&(r.headers.get('content-type')||'').startsWith('image'))return await r.blob()}catch(e){}
 const d=await sb.storage.from('strips').download(p.image_path);if(!d.error)return d.data;
 throw new Error('missing');
}
async function dl(p){
 try{const b=await fetchImg(p),a=h('a',{href:URL.createObjectURL(b),download:'snapbooth-'+(p.song||'post').replace(/[^a-z0-9]+/gi,'-')+(b.type.includes('png')?'.png':'.jpg')});a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}catch(e){toast('Could not download')}
}
async function printImgs(list){
 const pa=$('pa')||document.body.appendChild(h('div',{id:'pa','aria-hidden':'true'}));pa.replaceChildren();
 const ims=list.map(u=>{const i=new Image();i.src=u;return i});
 await Promise.all(ims.map(i=>i.decode().catch(()=>{})));
 pa.append(...ims);window.onafterprint=()=>pa.replaceChildren();window.print();
}

async function patchPost(p,patch,msg){
 const r=await sb.from('posts').update(Object.assign({},patch,{updated_at:new Date().toISOString()})).eq('id',p.id);
 if(r.error)toast('Could not save that change');else toast(msg||'Saved');
 route();
}
async function setVis(p,v){
 if(v===p.visibility)return;
 const from=p.visibility==='public'?'posts':'strips',to=v==='public'?'posts':'strips';
 try{
  if(from!==to){
   const blob=await fetchImg(p);
   const up=await sb.storage.from(to).upload(p.image_path,blob,{contentType:blob.type||'image/jpeg',upsert:true});
   if(up.error)throw up.error;
  }
  const r=await sb.from('posts').update({visibility:v,updated_at:new Date().toISOString()}).eq('id',p.id);
  if(r.error){if(from!==to)await sb.storage.from(to).remove([p.image_path]);throw r.error}
  if(from!==to)await sb.storage.from(from).remove([p.image_path]);
  toast('Now visible to: '+VIS[v][0].toLowerCase());
 }catch(e){toast('Could not change visibility')}
 route();
}
function editCaption(p){
 const d=$('dlg'),ta=h('textarea',{maxlength:300,rows:4,'aria-label':'Caption'},p.caption||'');
 d.replaceChildren(h('h2',{},'Edit caption'),ta,h('div',{class:'cf'},h('button',{class:'btn p',onclick:()=>{d.close();patchPost(p,{caption:ta.value.trim()},'Caption updated')}},'Save'),h('button',{class:'btn',onclick:closeDlg},'Cancel')));
 d.showModal();ta.focus();
}
async function delPost(p){
 if(!confirm('Delete this post? This cannot be undone.'))return;
 await sb.storage.from('posts').remove([p.image_path]);await sb.storage.from('strips').remove([p.image_path]);
 const r=await sb.from('posts').delete().eq('id',p.id);
 toast(r.error?'Could not delete':'Post deleted');route();
}
function postMenu(p,x,y){
 const mine=p.user_id===me.id,it=[];
 if(mine){
  it.push({head:'Who can see this'});
  Object.keys(VIS).forEach(k=>it.push({label:VIS[k][0],on:p.visibility===k,fn:()=>setVis(p,k)}));
  it.push({sep:1},{label:'Edit caption',fn:()=>editCaption(p)},{label:p.comments_off?'Turn commenting on':'Turn commenting off',fn:()=>patchPost(p,{comments_off:!p.comments_off},p.comments_off?'Commenting is on':'Commenting is off')},{label:p.hide_likes?'Show like count':'Hide like count',fn:()=>patchPost(p,{hide_likes:!p.hide_likes},p.hide_likes?'Like count is visible':'Like count is hidden')},{sep:1});
 }
 it.push({label:'Print',fn:()=>printImgs([p._url])},{label:'Download',fn:()=>dl(p)});
 if(p.visibility==='public')it.push({label:'Copy link',fn:()=>copy(location.origin+'/#/p/'+p.id)});
 if(!mine)it.push({label:'View profile',fn:()=>{location.hash='#/u/'+p.profiles.username}},{label:'Message',fn:()=>{location.hash='#/inbox/'+p.profiles.username}});
 if(mine)it.push({sep:1},{label:'Delete',danger:1,fn:()=>delPost(p)});
 openMenu(it,x,y);
}

function authScreen(){
 let up=false;
 const em=h('input',{type:'email',placeholder:'Email',autocomplete:'email',required:true,'aria-label':'Email'}),pw=h('input',{type:'password',placeholder:'Password',minlength:6,autocomplete:'current-password',required:true,'aria-label':'Password'}),err=h('p',{class:'err',role:'alert'}),go=h('button',{class:'btn p wide'},'Log in'),sw=h('button',{type:'button',class:'lnk'},'New here? Create an account');
 sw.onclick=()=>{up=!up;go.textContent=up?'Create account':'Log in';sw.textContent=up?'Have an account? Log in':'New here? Create an account';pw.autocomplete=up?'new-password':'current-password';err.textContent=''};
 const f=h('form',{class:'auth',onsubmit:async e=>{e.preventDefault();err.textContent='';go.disabled=true;const c={email:em.value.trim(),password:pw.value};const r=up?await sb.auth.signUp(c):await sb.auth.signInWithPassword(c);go.disabled=false;if(r.error){err.textContent=r.error.message;return}if(up&&!r.data.session){err.textContent='Check your email to confirm your account, then log in.';sw.onclick()}}},
  h('div',{class:'logo'},'Snapbooth'),h('p',{class:'mute'},'Photobooth strips with your people.'),em,pw,err,go,sw);
 $('root').replaceChildren(f);
}
function link(href,i,t,badge){const a=h('a',{href,'data-r':href},ico(i),h('span',{class:'l'},t));if(badge)a.append(h('span',{class:'badge',id:'bd',hidden:true}));return a}
function shell(){
 $('root').replaceChildren(h('nav',{},h('span',{class:'brand logo'},'Snapbooth'),link('#/','home','Home'),link('#/search','search','Search'),link('#/create','plus','Create'),link('#/inbox','send','Messages',true),link('#/u/'+mp.username,'user','Profile')),h('main',{id:'view'}));
}
async function refreshUnread(){const r=await sb.from('messages').select('id',{count:'exact',head:true}).eq('recipient_id',me.id).is('read_at',null);unread=r.count||0;const b=$('bd');if(b){b.hidden=!unread;b.textContent=unread>9?'9+':unread}}

function route(){
 closeDlg();closeMenu();if(window.leaveCreate)leaveCreate();
 const r=location.hash.slice(2).split('/'),v=$('view');cur=null;
 document.body.classList.toggle('inthread',r[0]==='inbox'&&!!r[1]);
 const key='#/'+r.slice(0,r[0]==='u'?2:1).join('/');
 document.querySelectorAll('nav a').forEach(a=>{if(a.dataset.r===key)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 v.replaceChildren(h('p',{class:'mute pad'},'Loading'));
 const f=r[0]==='search'?viewSearch:r[0]==='inbox'?(r[1]?viewThread:viewInbox):r[0]==='u'?viewProfile:r[0]==='p'?viewPost:r[0]==='create'?window.viewCreate:viewFeed;
 Promise.resolve().then(()=>f(v,r[1])).catch(()=>v.replaceChildren(h('p',{class:'pad'},'Something went wrong. Try again in a moment.')));
 window.scrollTo(0,0);
}

function postCard(p,liked){
 const mine=p.user_id===me.id,pr=p.profiles;
 let on=liked,n=p.likes[0].count,cc=p.comments[0].count;
 const card=h('article',{class:'post'}),cnt=h('b',{}),lk=h('button',{class:'ib','aria-label':'Like'},ico('heart')),pop=h('div',{class:'pop'},ico('heart'));
 const paint=()=>{lk.setAttribute('aria-pressed',String(on));cnt.textContent=p.hide_likes&&!mine?'':(n===1?'1 like':n+' likes')+(p.hide_likes?' (hidden from others)':'')};paint();
 const toggle=async()=>{on=!on;n+=on?1:-1;paint();const r=on?await sb.from('likes').insert({post_id:p.id}):await sb.from('likes').delete().match({post_id:p.id,user_id:me.id});if(r.error){on=!on;n+=on?1:-1;paint();toast('Could not update like')}};
 lk.onclick=toggle;
 const box=h('div',{class:'pi'+(p.layout==='strip'?' tall':'')},imgEl(p,{alt:'Photobooth post by '+pr.username,loading:'lazy'}),pop);
 box.ondblclick=()=>{pop.classList.remove('on');void pop.offsetWidth;pop.classList.add('on');if(!on)toggle()};
 const cline=(u,b)=>h('p',{},h('a',{href:'#/u/'+u},h('b',{},u)),' ',b);
 const list=h('div',{}),inp=h('input',{placeholder:'Add a comment',maxlength:300,'aria-label':'Comment'}),post=h('button',{class:'btn p'},'Post'),cm=h('div',{class:'cm',hidden:true});
 const label=()=>cc?'View '+cc+(cc>1?' comments':' comment'):'Add a comment';
 const cbtn=h('button',{class:'lnk'},label());
 let loaded=false;
 const showC=async()=>{cm.hidden=!cm.hidden;if(cm.hidden||loaded)return;loaded=true;const r=await sb.from('comments').select('id,body,profiles!comments_user_id_fkey(username)').eq('post_id',p.id).order('created_at').limit(50);(r.data||[]).forEach(c=>list.append(cline(c.profiles.username,c.body)));inp.focus()};
 cbtn.onclick=showC;
 post.onclick=async()=>{const body=inp.value.trim();if(!body)return;post.disabled=true;const r=await sb.from('comments').insert({post_id:p.id,body});post.disabled=false;if(r.error)return toast('Could not post comment');inp.value='';list.append(cline(mp.username,body));cc++;cbtn.textContent=label()};
 cm.append(list,h('div',{class:'cf'},inp,post));
 const cb=p.comments_off?null:h('button',{class:'ib','aria-label':'Comments',onclick:showC},ico('comment'));
 const more=h('button',{class:'ib','aria-label':'Post options','aria-haspopup':'menu',onclick:e=>{const r=e.currentTarget.getBoundingClientRect();postMenu(p,r.right-240,r.bottom)}},ico('more',22));
 card.oncontextmenu=e=>{e.preventDefault();postMenu(p,e.clientX,e.clientY)};
 card.append(
  h('div',{class:'ph'},h('a',{href:'#/u/'+pr.username},avatar(pr)),h('a',{href:'#/u/'+pr.username},h('b',{},pr.username)),p.visibility!=='public'?h('span',{class:'vb'},VIS[p.visibility][0]):null,h('small',{},ago(p.created_at)),more),
  box,
  h('div',{class:'pa'},lk,cb),
  h('div',{class:'pt'},cnt,p.caption?h('p',{},h('a',{href:'#/u/'+pr.username},h('b',{},pr.username)),' ',p.caption):null,p.song?h('p',{class:'song2 mute'},'\u266A '+p.song+(p.artist?' - '+p.artist:'')):null,p.comments_off?(mine?h('p',{class:'mute'},'Comments are off'):null):cbtn),
  p.comments_off?null:cm);
 return card;
}

async function viewFeed(v){
 const tabs=h('div',{class:'bar'},h('span',{class:'logo mob'},'Snapbooth'),h('div',{class:'seg'},...['following','explore'].map(m=>h('button',{class:'chip','aria-pressed':String(mode===m),onclick:()=>{mode=m;viewFeed(v)}},m==='following'?'Following':'Explore'))));
 let ids=null;
 if(mode==='following'){const f=await sb.from('follows').select('following_id').eq('follower_id',me.id);ids=[me.id,...(f.data||[]).map(x=>x.following_id)]}
 let q=sb.from('posts').select(POST).order('created_at',{ascending:false}).limit(30);
 q=mode==='following'?q.in('user_id',ids).neq('visibility','private'):q.eq('visibility','public');
 const r=await q;if(r.error)throw r.error;
 await hydrate(r.data);
 let liked=new Set();
 if(r.data.length){const L=await sb.from('likes').select('post_id').eq('user_id',me.id).in('post_id',r.data.map(p=>p.id));liked=new Set((L.data||[]).map(x=>x.post_id))}
 const empty=h('div',{class:'empty'},h('b',{},mode==='following'?'Your feed is quiet':'No posts yet'),h('p',{class:'mute'},'Follow people from Search, or share a strip of your own.'),h('a',{class:'btn p',href:'#/create'},'Make a strip'));
 v.replaceChildren(tabs,...(r.data.length?r.data.map(p=>postCard(p,liked.has(p.id))):[empty]));
}
async function loadPost(id){
 const r=await sb.from('posts').select(POST).eq('id',id).maybeSingle();if(!r.data)return null;
 await hydrate([r.data]);
 const l=await sb.from('likes').select('post_id').eq('user_id',me.id).eq('post_id',id).maybeSingle();
 return postCard(r.data,!!l.data);
}
async function openPost(id){
 const c=await loadPost(id);if(!c)return toast('Post not found');
 const d=$('dlg');d.replaceChildren(c,h('button',{class:'btn wide',onclick:closeDlg},'Close'));d.showModal();
}
async function viewPost(v,id){const c=await loadPost(id);v.replaceChildren(c||h('p',{class:'pad'},'This post is not available.'))}

async function uploadAvatar(f){
 const img=await createImageBitmap(f),s=Math.min(img.width,img.height),c=document.createElement('canvas');c.width=c.height=256;
 c.getContext('2d').drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,256,256);
 const b=await new Promise(r=>c.toBlob(r,'image/jpeg',.9)),path=me.id+'/avatar-'+Date.now()+'.jpg';
 const up=await sb.storage.from('posts').upload(path,b,{contentType:'image/jpeg'});if(up.error)throw up.error;
 if(mp.avatar_path)sb.storage.from('posts').remove([mp.avatar_path]);
 return path;
}
function editProfile(u){
 const d=$('dlg'),dn=h('input',{value:u.display_name||'',maxlength:50,'aria-label':'Name'}),un=h('input',{value:u.username,maxlength:24,autocapitalize:'none','aria-label':'Username'}),bio=h('textarea',{maxlength:150,rows:3,'aria-label':'Bio'},u.bio||''),file=h('input',{type:'file',accept:'image/*','aria-label':'Profile photo'}),err=h('p',{class:'err',role:'alert'});
 const save=h('button',{class:'btn p'},'Save');
 save.onclick=async()=>{
  err.textContent='';const name=un.value.trim().toLowerCase();
  if(!/^[a-z0-9_.]{3,24}$/.test(name)){err.textContent='Username: 3 to 24 letters, numbers, dots or underscores.';return}
  const patch={display_name:dn.value.trim(),username:name,bio:bio.value.trim()};
  save.disabled=true;
  if(file.files[0]){try{patch.avatar_path=await uploadAvatar(file.files[0])}catch(e){save.disabled=false;err.textContent='Could not upload that image.';return}}
  const r=await sb.from('profiles').update(patch).eq('id',me.id);save.disabled=false;
  if(r.error){err.textContent=r.error.code==='23505'?'That username is taken.':'Could not save. Try again.';return}
  Object.assign(mp,patch);d.close();shell();const nh='#/u/'+name;if(location.hash===nh)route();else location.hash=nh;refreshUnread();
 };
 d.replaceChildren(h('h2',{},'Edit profile'),h('label',{},'Photo',file),h('label',{},'Name',dn),h('label',{},'Username',un),h('label',{},'Bio',bio),err,h('div',{class:'cf'},save,h('button',{class:'btn',onclick:closeDlg},'Cancel'),h('button',{class:'btn',onclick:async()=>{await sb.auth.signOut()}},'Log out')));
 d.showModal();
}
async function viewProfile(v,name){
 const r=await sb.from('profiles').select('*').eq('username',name).maybeSingle();
 if(!r.data){v.replaceChildren(h('p',{class:'pad'},'No one here by that name.'));return}
 const u=r.data,mine=u.id===me.id;
 const [pc,fr,fg,fo,ps]=await Promise.all([
  sb.from('posts').select('id',{count:'exact',head:true}).eq('user_id',u.id),
  sb.from('follows').select('follower_id',{count:'exact',head:true}).eq('following_id',u.id),
  sb.from('follows').select('following_id',{count:'exact',head:true}).eq('follower_id',u.id),
  mine?Promise.resolve({data:null}):sb.from('follows').select('follower_id').eq('follower_id',me.id).eq('following_id',u.id).maybeSingle(),
  sb.from('posts').select('id,user_id,image_path,caption,song,artist,created_at,visibility,layout,filter,comments_off,hide_likes').eq('user_id',u.id).order('created_at',{ascending:false}).limit(60)]);
 let following=!!fo.data,fc=fr.count||0;
 const posts=ps.data||[];posts.forEach(x=>{x.profiles={username:u.username,avatar_path:u.avatar_path}});await hydrate(posts);
 const fcEl=h('b',{},String(fc)),fb=h('button',{class:'btn'});
 const paintF=()=>{fb.textContent=following?'Following':'Follow';fb.className='btn'+(following?'':' p')};paintF();
 const toggleF=async()=>{following=!following;fc+=following?1:-1;fcEl.textContent=fc;paintF();const x=following?await sb.from('follows').insert({following_id:u.id}):await sb.from('follows').delete().match({follower_id:me.id,following_id:u.id});if(x.error){following=!following;fc+=following?1:-1;fcEl.textContent=fc;paintF();toast('Could not update follow')}};
 fb.onclick=toggleF;
 const act=mine?[h('button',{class:'btn',onclick:()=>editProfile(u)},'Edit profile')]:[fb,h('a',{class:'btn',href:'#/inbox/'+u.username},'Message')];
 const tiles=posts.map(x=>{
  const t=h('button',{class:'tile','aria-label':'Open post',onclick:()=>openPost(x.id)},imgEl(x,{alt:'',loading:'lazy',class:x.layout==='strip'?'top':null}),x.visibility!=='public'?h('span',{class:'vb'},VIS[x.visibility][0]):null);
  t.oncontextmenu=e=>{e.preventDefault();postMenu(x,e.clientX,e.clientY)};return t});
 const head=h('div',{class:'pf'},avatar(u,84),h('div',{class:'stats'},h('div',{},h('b',{},String(pc.count||0)),'posts'),h('div',{},fcEl,'followers'),h('div',{},h('b',{},String(fg.count||0)),'following')));
 head.oncontextmenu=e=>{e.preventDefault();openMenu(mine?[{label:'Edit profile',fn:()=>editProfile(u)},{label:'Copy profile link',fn:()=>copy(location.origin+'/#/u/'+u.username)}]:[{label:following?'Unfollow':'Follow',fn:toggleF},{label:'Message',fn:()=>{location.hash='#/inbox/'+u.username}},{label:'Copy profile link',fn:()=>copy(location.origin+'/#/u/'+u.username)}],e.clientX,e.clientY)};
 v.replaceChildren(head,
  h('div',{class:'pad'},h('b',{},u.display_name||u.username),h('div',{class:'mute'},'@'+u.username),u.bio?h('p',{class:'bio'},u.bio):null,h('div',{class:'cf'},...act)),
  tiles.length?h('div',{class:'grid3'},...tiles):h('p',{class:'empty mute'},mine?'No posts yet. Make a strip and share it.':'No posts to show.'),
  mine&&tiles.length?h('p',{class:'hint mute pad'},'Tip: right-click a post, or tap the dots on it, to change who can see it.'):null);
}

function userRow(u){
 return h('div',{class:'row'},h('a',{class:'row grow',style:'border:0;padding:0',href:'#/u/'+u.username},avatar(u,44),h('div',{class:'grow'},h('b',{},u.username),h('div',{class:'mute cut'},u.display_name||''))),h('a',{class:'btn',href:'#/inbox/'+u.username},'Message'));
}
async function viewSearch(v){
 const list=h('div',{}),inp=h('input',{placeholder:'Search people',type:'search','aria-label':'Search people',autocomplete:'off'});
 let t;
 const run=async()=>{const q=inp.value.trim().toLowerCase().replace(/[^a-z0-9_.]/g,'');let x=sb.from('profiles').select('id,username,display_name,avatar_path').neq('id',me.id).limit(20);x=q?x.ilike('username','%'+q+'%'):x.order('created_at',{ascending:false});const r=await x;const d=r.data||[];list.replaceChildren(...d.map(userRow));if(!d.length)list.append(h('p',{class:'mute pad'},'No one found.'))};
 inp.oninput=()=>{clearTimeout(t);t=setTimeout(run,250)};
 v.replaceChildren(h('div',{class:'pad'},inp),list);run();
}
async function viewInbox(v){
 const r=await sb.from('messages').select('sender_id,recipient_id,body,created_at,read_at').order('created_at',{ascending:false}).limit(300);
 const m=new Map();
 (r.data||[]).forEach(x=>{const o=x.sender_id===me.id?x.recipient_id:x.sender_id;let e=m.get(o);if(!e){e={last:x,un:0};m.set(o,e)}if(x.recipient_id===me.id&&!x.read_at)e.un++});
 let pr=[];const ids=[...m.keys()];
 if(ids.length)pr=(await sb.from('profiles').select('id,username,display_name,avatar_path').in('id',ids)).data||[];
 pr.sort((a,b)=>new Date(m.get(b.id).last.created_at)-new Date(m.get(a.id).last.created_at));
 const rows=pr.map(p=>{const e=m.get(p.id);return h('a',{class:'row',href:'#/inbox/'+p.username},avatar(p,48),h('div',{class:'grow'},h('b',{},p.username),h('div',{class:(e.un?'':'mute ')+'cut'},(e.last.sender_id===me.id?'You: ':'')+e.last.body)),h('small',{class:'mute'},ago(e.last.created_at)),e.un?h('span',{class:'dot','aria-label':'Unread'}):null)});
 v.replaceChildren(h('div',{class:'bar'},h('h2',{},'Messages'),h('a',{class:'btn',href:'#/search'},'New message')),...(rows.length?rows:[h('div',{class:'empty'},h('b',{},'No messages yet'),h('p',{class:'mute'},'Find someone in Search and say hi.'))]));
}
async function viewThread(v,name){
 const r=await sb.from('profiles').select('id,username,display_name,avatar_path').eq('username',name).maybeSingle();
 if(!r.data){v.replaceChildren(h('p',{class:'pad'},'No one here by that name.'));return}
 const u=r.data;
 const q=await sb.from('messages').select('id,sender_id,body,created_at').or('and(sender_id.eq.'+me.id+',recipient_id.eq.'+u.id+'),and(sender_id.eq.'+u.id+',recipient_id.eq.'+me.id+')').order('created_at',{ascending:false}).limit(100);
 const list=h('div',{class:'msgs'}),seen=new Set();
 const add=m=>{if(seen.has(m.id))return;seen.add(m.id);const b=h('div',{class:'b'+(m.sender_id===me.id?' me':''),title:ago(m.created_at)},m.body);b.oncontextmenu=e=>{e.preventDefault();openMenu([{label:'Copy message',fn:()=>copy(m.body,'Message copied')}],e.clientX,e.clientY)};list.append(b);requestAnimationFrame(()=>window.scrollTo(0,document.body.scrollHeight))};
 (q.data||[]).reverse().forEach(add);
 const inp=h('input',{placeholder:'Message',maxlength:1000,'aria-label':'Message',autocomplete:'off'});
 const form=h('form',{class:'compose',onsubmit:async e=>{e.preventDefault();const body=inp.value.trim();if(!body)return;inp.value='';const x=await sb.from('messages').insert({recipient_id:u.id,body}).select('id,sender_id,body,created_at').single();if(x.error){inp.value=body;return toast('Could not send')}add(x.data)}},inp,h('button',{class:'btn p'},'Send'));
 v.replaceChildren(h('div',{class:'row'},h('a',{href:'#/inbox','aria-label':'Back to messages',class:'lnk'},'Back'),h('a',{class:'row grow',style:'border:0;padding:0',href:'#/u/'+u.username},avatar(u,36),h('b',{},u.username))),list,form);
 cur={other:u.id,add};
 sb.rpc('mark_read',{other:u.id}).then(refreshUnread);
 requestAnimationFrame(()=>window.scrollTo(0,document.body.scrollHeight));
}
function listen(){
 sb.channel('dm').on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'recipient_id=eq.'+me.id},p=>{
  const m=p.new;
  if(cur&&cur.other===m.sender_id){cur.add(m);sb.rpc('mark_read',{other:m.sender_id}).then(refreshUnread)}
  else{refreshUnread();if(location.hash==='#/inbox')route();else toast('New message')}
 }).subscribe();
}
async function boot(){
 const s=await sb.auth.getSession();me=s.data.session?s.data.session.user:null;
 if(!me)return authScreen();
 const r=await sb.from('profiles').select('*').eq('id',me.id).maybeSingle();mp=r.data;
 if(!mp){$('root').replaceChildren(h('p',{class:'pad'},'Setting up your profile. Refresh in a moment.'));return}
 shell();await refreshUnread();listen();route();
}
sb.auth.onAuthStateChange(ev=>{if(ev==='SIGNED_IN'&&!me)setTimeout(boot,0);if(ev==='SIGNED_OUT')setTimeout(()=>location.reload(),0)});
addEventListener('hashchange',()=>{if(me&&mp)route()});
