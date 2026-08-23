/* =============== PARTICLE CANVAS =============== */
(function(){
  const c=document.getElementById('particles');
  const ctx=c.getContext('2d');
  let w,h,dots=[];
  const mouse={x:-1000,y:-1000};

  function resize(){
    w=c.width=window.innerWidth;
    h=c.height=window.innerHeight;
    initDots();
  }
  function initDots(){
    dots=[];
    const gap=42;
    for(let x=gap/2;x<w;x+=gap){
      for(let y=gap/2;y<h;y+=gap){
        dots.push({ox:x,oy:y,x,y,vx:0,vy:0});
      }
    }
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    for(let i=0;i<dots.length;i++){
      const d=dots[i];
      // mouse repel
      const dx=d.x-mouse.x, dy=d.y-mouse.y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<140){
        const f=(140-dist)/140;
        d.vx+=dx/dist*f*0.9;
        d.vy+=dy/dist*f*0.9;
      }
      // spring back
      d.vx+=(d.ox-d.x)*0.02;
      d.vy+=(d.oy-d.y)*0.02;
      d.vx*=0.86;d.vy*=0.86;
      d.x+=d.vx;d.y+=d.vy;

      const disp=Math.abs(d.x-d.ox)+Math.abs(d.y-d.oy);
      const alpha=Math.min(0.6,0.15+disp*0.05);
      ctx.beginPath();
      ctx.arc(d.x,d.y,disp>2?1.6:1,0,Math.PI*2);
      ctx.fillStyle=`rgba(139,92,246,${alpha})`;
      ctx.fill();

      if(disp>4){
        ctx.beginPath();
        ctx.arc(d.x,d.y,2.4,0,Math.PI*2);
        ctx.fillStyle=`rgba(57,255,136,${Math.min(0.7,disp*0.04)})`;
        ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',resize);
  window.addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY});
  window.addEventListener('mouseleave',()=>{mouse.x=-1000;mouse.y=-1000});
  window.addEventListener('touchmove',e=>{if(e.touches[0]){mouse.x=e.touches[0].clientX;mouse.y=e.touches[0].clientY}});
  resize();draw();
})();

/* =============== SIDEBAR =============== */
const sidebar=document.getElementById('sidebar');
document.getElementById('menuOpen').onclick=()=>sidebar.classList.add('open');
document.getElementById('menuClose').onclick=()=>sidebar.classList.remove('open');
document.querySelectorAll('.sidebar a').forEach(a=>{
  a.addEventListener('click',()=>sidebar.classList.remove('open'));
});

/* =============== REVEAL ON SCROLL =============== */
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}});
},{threshold:0.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* =============== LIVE METRICS =============== */
let steps=0;
const coh=document.getElementById('coherence');
const stepsEl=document.getElementById('steps');
const qubitsEl=document.getElementById('qubits');
const qStates=['|Ψ⟩','|0⟩','|1⟩','|+⟩','|−⟩','|Φ⟩'];
setInterval(()=>{
  const v=(98.5+Math.random()*1.5).toFixed(2);
  coh.textContent=v+'%';
  qubitsEl.textContent=qStates[Math.floor(Math.random()*qStates.length)];
},1800);
window.addEventListener('scroll',()=>{
  steps=Math.floor(window.scrollY/10);
  stepsEl.textContent=steps.toString().padStart(4,'0');
});

/* =============== SMOOTH SCROLL =============== */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',function(e){
    const t=document.querySelector(this.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});

/* =============== CONFIG (Easy update) =============== */
/* Change these to update globally */
const CONFIG={
  eventDate:'OCT 2026',
  unstopLink:'https://unstop.com/'
};
document.getElementById('event-date').textContent=CONFIG.eventDate;
document.getElementById('register-btn').href=CONFIG.unstopLink;
