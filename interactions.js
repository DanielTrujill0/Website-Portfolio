/* Cursor-reactive dot artwork and hover graphics, without external libraries. */
(function(){
  'use strict';
  let cleanup=[];
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  function init(){
    cleanup.forEach(fn=>fn());cleanup=[];
    const reduced=motion.matches;
    document.querySelectorAll('.dot-field').forEach(canvas=>{
      const ctx=canvas.getContext('2d');if(!ctx)return;
      const poster=canvas.closest('.dot-playground');
      let width=0,height=0,points=[],raf=0,paused=false,visible=true,last=0,layout=canvas.dataset.layout || 'grid';
      const pointer={x:-1000,y:-1000,active:false};
      const dark=!!poster;
      const theme=getComputedStyle(document.documentElement);
      const ink=theme.getPropertyValue('--ink').trim(),accent=theme.getPropertyValue('--accent').trim();
      function target(index,count){
        const cols=Math.max(8,Math.floor(width/28)),rows=Math.ceil(count/cols),u=index/Math.max(1,count-1);
        if(layout==='orbit'){const angle=u*Math.PI*2*3;const radius=Math.min(width,height)*(.13+u*.3);return {x:width*.69+Math.cos(angle)*radius,y:height*.5+Math.sin(angle)*radius};}
        if(layout==='wave'){return {x:width*.06+u*width*.88,y:height*.5+Math.sin(u*Math.PI*6)*height*.23+(index%5-2)*12};}
        return {x:(index%cols+.5)*width/cols,y:(Math.floor(index/cols)+.5)*height/rows};
      }
      function rebuild(){
        const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
        if(!width || !height)return;
        const dpr=Math.min(devicePixelRatio || 1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
        const count=Math.min(dark?240:160,Math.max(70,Math.floor(width*height/1300)));
        points=Array.from({length:count},(_,index)=>{const t=target(index,count);return {x:t.x,y:t.y,tx:t.x,ty:t.y,vx:0,vy:0,r:dark?2+(index%4)*.6:1.5};});
        draw(0,false);start();
      }
      function draw(time,animate){
        ctx.clearRect(0,0,width,height);const step=Math.min(2,last?(time-last)/16.67:1);last=time;
        let moved=0;
        points.forEach((point,index)=>{
          if(animate){
            const dx=point.x-pointer.x,dy=point.y-pointer.y,d=Math.hypot(dx,dy),radius=dark?120:85;
            if(pointer.active && d<radius){const force=(1-d/radius)*2.7;point.vx+=(dx/(d||1))*force;point.vy+=(dy/(d||1))*force;}
            const drift=dark?Math.sin(time*.0005+index*.11)*3:0;
            point.vx+=(point.tx-point.x)*.025;point.vy+=(point.ty+drift-point.y)*.025;
            point.vx*=Math.pow(.86,step);point.vy*=Math.pow(.86,step);point.x+=point.vx*step;point.y+=point.vy*step;
            moved+=Math.abs(point.vx)+Math.abs(point.vy);
          }
          ctx.fillStyle=dark?accent:ink;ctx.globalAlpha=dark?.7:.28;ctx.beginPath();ctx.arc(point.x,point.y,point.r,0,Math.PI*2);ctx.fill();
        });ctx.globalAlpha=1;canvas.dataset.displacement=String(Math.round(moved));
      }
      function tick(time){raf=0;if(reduced || paused || !visible || document.hidden)return;draw(time,true);raf=requestAnimationFrame(tick);}
      function start(){if(!raf&&!reduced&&!paused&&visible&&!document.hidden){last=0;raf=requestAnimationFrame(tick);}}
      function stop(){cancelAnimationFrame(raf);raf=0;}
      function move(event){if(reduced||event.pointerType==='touch')return;const rect=canvas.getBoundingClientRect();pointer.x=event.clientX-rect.left;pointer.y=event.clientY-rect.top;pointer.active=true;}
      function leave(){pointer.active=false;}
      const host=dark?canvas.parentElement:canvas.parentElement;
      host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);
      const observer=new ResizeObserver(rebuild);observer.observe(canvas);
      const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();});intersection.observe(canvas);
      const visibility=()=>document.hidden?stop():start();document.addEventListener('visibilitychange',visibility);
      if(poster){
        poster.querySelectorAll('[data-dot-layout]').forEach(button=>{
          const change=()=>{layout=button.dataset.dotLayout;canvas.dataset.layout=layout;poster.querySelectorAll('[data-dot-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));points.forEach((point,index)=>{const t=target(index,points.length);point.tx=t.x;point.ty=t.y;if(reduced||paused){point.x=t.x;point.y=t.y;}});draw(0,false);start();};
          button.addEventListener('click',change);cleanup.push(()=>button.removeEventListener('click',change));
        });
        const pause=poster.querySelector('[data-dot-pause]');
        pause.disabled=false;pause.textContent='Pause';pause.setAttribute('aria-pressed','false');
        if(reduced){pause.textContent='Motion off';pause.disabled=true;pause.setAttribute('aria-pressed','true');}
        const toggle=()=>{paused=!paused;pause.textContent=paused?'Resume':'Pause';pause.setAttribute('aria-pressed',String(paused));if(paused)stop();else start();};
        pause.addEventListener('click',toggle);cleanup.push(()=>pause.removeEventListener('click',toggle));
      }
      rebuild();
      cleanup.push(()=>{stop();observer.disconnect();intersection.disconnect();host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',visibility);});
    });
    if(!reduced && document.body.dataset.tilt==='true')document.querySelectorAll('.hero-visual,.project-media').forEach(node=>{
      const move=event=>{if(event.pointerType==='touch')return;const rect=node.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;node.style.setProperty('--hover-x',x*22+'px');node.style.setProperty('--hover-y',y*22+'px');node.style.setProperty('--hover-rotate',x*12+'deg');node.style.setProperty('--tilt-x',-y*7+'deg');node.style.setProperty('--tilt-y',x*7+'deg');};
      const leave=()=>['--hover-x','--hover-y','--hover-rotate','--tilt-x','--tilt-y'].forEach(key=>node.style.removeProperty(key));
      node.addEventListener('pointermove',move);node.addEventListener('pointerleave',leave);cleanup.push(()=>{node.removeEventListener('pointermove',move);node.removeEventListener('pointerleave',leave);leave();});
    });
  }
  document.addEventListener('portfolio:rendered',init);motion.addEventListener('change',init);init();
})();

