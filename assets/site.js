(function(){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* nav */
const nav=document.getElementById('nav');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>30),{passive:true});

/* kinetic split headings */
document.querySelectorAll('.split').forEach(el=>{
  let i=0;
  (function walk(node){
    [...node.childNodes].forEach(n=>{
      if(n.nodeType===3){
        const frag=document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part=>{
          if(!part)return;
          if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(' '));return}
          const w=document.createElement('span');w.className='w';
          const s=document.createElement('span');s.textContent=part;s.style.setProperty('--i',i++);
          w.appendChild(s);frag.appendChild(w);
        });
        n.replaceWith(frag);
      }else if(n.nodeType===1&&n.tagName!=='BR')walk(n);
    });
  })(el);
});

/* reveal on scroll */
function countUp(el){
  const to=+el.dataset.count;if(reduce){el.textContent=to;return}
  el.textContent='0';
  const t0=performance.now(),d=1400;
  (function f(t){const p=Math.min((t-t0)/d,1);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)})(t0);
}
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  e.target.classList.add('in');io.unobserve(e.target);
  e.target.querySelectorAll('[data-count]').forEach(countUp);
}),{threshold:.12});
document.querySelectorAll('.reveal,.split').forEach((el,i)=>{if(el.classList.contains('reveal'))el.style.transitionDelay=(i%3*80)+'ms';if(el.id!=='heroTitle')io.observe(el)});
const heroT=document.getElementById('heroTitle');if(heroT)setTimeout(()=>heroT.classList.add('in'),150);

/* scroll-driven sliding text */
const sliders=[...document.querySelectorAll('[data-speed]')];
function onScroll(){
  sliders.forEach(el=>{
    const r=el.parentElement.getBoundingClientRect();
    if(r.bottom<0||r.top>innerHeight)return;
    const prog=(innerHeight-r.top)/(innerHeight+r.height);
    el.style.transform=`translateX(${(prog-.5)*el.offsetWidth*+el.dataset.speed}px)`;
  });
}
if(!reduce){addEventListener('scroll',onScroll,{passive:true});onScroll()}

/* 360 viewer */
if(document.getElementById('viewer')){
const viewer=document.getElementById('viewer');
const strip=document.getElementById('fallbackStrip');
const scenes=[...document.querySelectorAll('#scenes button')];
const vName=document.getElementById('vName'),vLink=document.getElementById('vLink');
function useFallback(src){viewer.classList.add('fallback');viewer.classList.remove('loading');strip.style.backgroundImage=`url('${src.replace('-hd','')}')`}
let setScene=useFallback;
const hasGL=(()=>{try{const c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl')||c.getContext('experimental-webgl')))}catch(e){return false}})();
if(window.THREE&&hasGL){
  const renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  viewer.prepend(renderer.domElement);
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(72,1,1,1100);
  const geo=new THREE.SphereGeometry(500,64,40);geo.scale(-1,1,1);
  const mat=new THREE.MeshBasicMaterial({color:0x1b1b1b});
  scene.add(new THREE.Mesh(geo,mat));
  const loader=new THREE.TextureLoader();const cache={};
  let lon=0,lat=0,tLon=0,tLat=0,dragging=false,sx=0,sy=0,sLon=0,sLat=0,idle=0,visible=true,last=performance.now();
  setScene=src=>{
    const apply=t=>{mat.map=t;mat.color.set(0xffffff);mat.needsUpdate=true;viewer.classList.remove('loading')};
    if(cache[src])return apply(cache[src]);
    viewer.classList.add('loading');
    loader.load(src,t=>{t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;cache[src]=t;apply(t)},undefined,()=>useFallback(src));
  };
  function resize(){const w=viewer.clientWidth,h=viewer.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);cam.aspect=w/h;cam.fov=w<600?85:72;cam.updateProjectionMatrix()}
  new ResizeObserver(resize).observe(viewer);resize();
  viewer.addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;dragging=true;sx=e.clientX;sy=e.clientY;sLon=tLon;sLat=tLat;viewer.setPointerCapture(e.pointerId);viewer.classList.add('grabbing','touched')});
  viewer.addEventListener('pointermove',e=>{if(!dragging)return;tLon=sLon+(sx-e.clientX)*.14;tLat=Math.max(-55,Math.min(55,sLat+(e.clientY-sy)*.14))});
  const end=()=>{if(!dragging)return;dragging=false;idle=performance.now();viewer.classList.remove('grabbing')};
  viewer.addEventListener('pointerup',end);viewer.addEventListener('pointercancel',end);
  new IntersectionObserver(es=>visible=es[0].isIntersecting).observe(viewer);
  (function loop(t){
    requestAnimationFrame(loop);
    const dt=Math.min(t-last,50);last=t;
    if(!visible)return;
    if(!dragging&&t-idle>2500){if(!reduce)tLon+=dt*.006;tLat+=(0-tLat)*.01}
    lon+=(tLon-lon)*.12;lat+=(tLat-lat)*.12;
    const phi=THREE.MathUtils.degToRad(90-lat),th=THREE.MathUtils.degToRad(lon);
    cam.lookAt(500*Math.sin(phi)*Math.cos(th),500*Math.cos(phi),500*Math.sin(phi)*Math.sin(th));
    renderer.render(scene,cam);
  })(last);
}
scenes.forEach(b=>b.addEventListener('click',()=>{
  scenes.forEach(x=>x.classList.toggle('on',x===b));
  vName.textContent=b.dataset.name;vLink.href=b.dataset.href;setScene(b.dataset.src);
}));
setScene(scenes[0].dataset.src);

}

/* price calculator */
if(document.getElementById('vp')){
const vp=document.getElementById('vp'),vpNum=document.getElementById('vpNum'),gbp=document.getElementById('gbp');
const addons=[...document.querySelectorAll('.addon')];
const tLo=document.getElementById('tLo'),tHi=document.getElementById('tHi');
let shownLo=0,shownHi=0,anim;
const k=n=>Math.round(n/1000)+'K';
function tween(lo,hi){
  cancelAnimationFrame(anim);const fl=shownLo,fh=shownHi,t0=performance.now(),d=reduce?1:450;
  (function f(t){const p=Math.min((t-t0)/d,1),e=1-Math.pow(1-p,3);shownLo=fl+(lo-fl)*e;shownHi=fh+(hi-fh)*e;tLo.textContent=k(shownLo);tHi.textContent=k(shownHi);if(p<1)anim=requestAnimationFrame(f)})(t0);
}
function calc(){
  const n=+vp.value,g=gbp.checked?20000:0,lo=n*8000+g,hi=n*10000+g;
  vpNum.textContent=n;vp.style.setProperty('--p',((n-vp.min)/(vp.max-vp.min)*100)+'%');
  document.getElementById('bVp').textContent=`${n} viewpoints × 8–10K`;
  document.getElementById('bVpAmt').textContent=`${k(n*8000)}–${k(n*10000)}`;
  document.getElementById('bGbp').classList.toggle('off',!gbp.checked);
  const sel=addons.filter(a=>a.checked).map(a=>a.value);
  document.getElementById('bAdd').classList.toggle('off',!sel.length);
  document.getElementById('bAddTxt').textContent=sel.length?sel.join(', '):'Interactive features';
  tween(lo,hi);
  let msg=`Hi Curators360, I'd like a quote for a virtual tour.\n\n• About ${n} viewpoints\n• Google Business Profile upload: ${gbp.checked?'Yes':'No'}`;
  if(sel.length)msg+=`\n• Interested in: ${sel.join(', ')}`;
  msg+=`\n\nEstimate from your site: PKR ${k(lo)}–${k(hi)}${sel.length?' + features':''}\n\nBusiness name & location: `;
  document.getElementById('sendQuote').href='https://wa.me/923452016125?text='+encodeURIComponent(msg);
}
vp.addEventListener('input',calc);gbp.addEventListener('change',calc);addons.forEach(a=>a.addEventListener('change',calc));
document.querySelectorAll('.presets button').forEach(b=>b.addEventListener('click',()=>{vp.value=b.dataset.v;calc()}));
calc();

}

/* custom cursor + magnetic buttons (mouse only) */
if(matchMedia('(pointer:fine)').matches&&!reduce){
  document.documentElement.classList.add('has-cur');
  const cur=document.createElement('div');cur.className='cur';cur.innerHTML='<span></span>';document.body.appendChild(cur);
  const lab=cur.firstChild;let mx=-100,my=-100,cx=-100,cy=-100;
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.classList.add('show')},{passive:true});
  document.addEventListener('mouseleave',()=>cur.classList.remove('show'));
  (function f(){cx+=(mx-cx)*.2;cy+=(my-cy)*.2;cur.style.transform=`translate(${cx}px,${cy}px)`;requestAnimationFrame(f)})();
  document.querySelectorAll('[data-cursor]').forEach(el=>{
    el.addEventListener('mouseenter',()=>{lab.textContent=el.dataset.cursor;cur.classList.add('big')});
    el.addEventListener('mouseleave',()=>{cur.classList.remove('big');const p=el.parentElement&&el.parentElement.closest('[data-cursor]');if(p){lab.textContent=p.dataset.cursor;cur.classList.add('big')}});
  });
  document.querySelectorAll('a,button,input,label').forEach(el=>{
    if(el.closest('[data-cursor]'))return;
    el.addEventListener('mouseenter',()=>cur.classList.add('hide'));
    el.addEventListener('mouseleave',()=>cur.classList.remove('hide'));
  });
  document.querySelectorAll('#scenes button').forEach(el=>{
    el.addEventListener('mouseenter',()=>cur.classList.add('hide'));
    el.addEventListener('mouseleave',()=>cur.classList.remove('hide'));
  });
  document.querySelectorAll('.mag').forEach(el=>{
    el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`});
    el.addEventListener('mouseleave',()=>{el.style.transition='transform .5s cubic-bezier(.22,1,.36,1),background .25s,color .25s';el.style.transform='';setTimeout(()=>el.style.transition='',500)});
  });
}
})();
