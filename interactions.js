/* Integrated motion background. No libraries, autoplay media, or scroll interception. */
(function(){
  'use strict';
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let dispose=()=>{};
  function initialize(){
    dispose();
    const canvas=document.querySelector('.ambient-canvas');
    if(!canvas)return;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const scene=canvas.parentElement,bar=document.querySelector('.scroll-progress'),toggle=document.querySelector('.motion-toggle');
    const settings=document.body.dataset,theme=getComputedStyle(document.documentElement);
    const ink=theme.getPropertyValue('--ink').trim(),accent=theme.getPropertyValue('--accent').trim();
    const dots=settings.dots==='true' && settings.paper==='dotted',scrollArt=settings.scrollArt==='true',shapes=settings.shapes==='true';
    const density={subtle:.55,balanced:.8,rich:1}[settings.dotDensity] || 1;
    const reduced=preference.matches;
    let width=0,height=0,particles=[],raf=0,last=0,elapsed=0,progress=0,pageScroll=scrollY,paused=false,dirty=true;
    let documentHeight=0;
    const pointer={x:-1000,y:-1000,active:false};
    const ripples=[],trail=[],listeners=[],observers=[];
    function listen(node,type,handler,options){node.addEventListener(type,handler,options);listeners.push(()=>node.removeEventListener(type,handler,options));}
    function hash(index){const value=Math.sin(index*127.1+311.7)*43758.5453;return value-Math.floor(value);}
    function measureScroll(){
      pageScroll=window.scrollY;
      documentHeight=Math.max(1,document.documentElement.scrollHeight-height);
      progress=Math.max(0,Math.min(1,pageScroll/documentHeight));
      if(bar)bar.style.transform='scaleX('+progress+')';
      canvas.dataset.progress=progress.toFixed(3);dirty=true;start();
    }
    function resize(){
      width=innerWidth;height=innerHeight;
      const dpr=Math.min(devicePixelRatio || 1,1.75);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
      const spacing=width<700?34:32;
      const gap=Math.max(spacing/density,Math.sqrt(width*height/(width<700?500:1800))),cols=Math.ceil(width/gap),rows=Math.ceil(height/gap),count=cols*rows;
      particles=Array.from({length:count},(_,index)=>({index,ax:(index%cols+.5)/cols,ay:(Math.floor(index/cols)+.5)/rows,x:(index%cols+.5)*width/cols,y:(Math.floor(index/cols)+.5)*height/rows,vx:0,vy:0}));
      canvas.dataset.particles=String(count);measureScroll();draw(0);start();
    }
    function target(point){
      const offset=!reduced&&scrollArt?pageScroll*.06:0;
      return {x:point.ax*width,y:((point.ay*height-offset)%height+height)%height,z:0};
    }
    function draw(time){
      const active=!reduced&&!paused;
      const step=Math.min(2,last?Math.max(.1,(time-last)/16.67):1);last=time;
      if(active)elapsed+=step*16.67;
      ctx.clearRect(0,0,width,height);
      let displacement=0;
      if(shapes){
        ctx.save();ctx.strokeStyle=ink;ctx.lineWidth=1.2;ctx.globalAlpha=.22;
        for(let i=0;i<7;i++){
          const x=i%2?width-35:24;
          const y=((height*(.15+i*.21)-(reduced?0:pageScroll*.2))%(height+100)+height+100)%(height+100)-40;
          ctx.save();ctx.translate(x,y);ctx.rotate((i%3-1)*.15);ctx.beginPath();
          if(i%3===0){for(let j=0;j<10;j++){const a=j*Math.PI/5-Math.PI/2,r=j%2?7:17;const px=Math.cos(a)*r,py=Math.sin(a)*r;if(j)ctx.lineTo(px,py);else ctx.moveTo(px,py);}ctx.closePath();}
          else if(i%3===1){ctx.moveTo(-10,-20);ctx.bezierCurveTo(18,-6,-22,17,4,35);ctx.moveTo(-3,23);ctx.lineTo(4,35);ctx.lineTo(13,25);}
          else {ctx.moveTo(-8,-18);ctx.lineTo(7,-23);ctx.lineTo(12,16);ctx.quadraticCurveTo(4,30,-3,19);ctx.lineTo(-9,-10);ctx.quadraticCurveTo(-12,-22,-4,-19);ctx.lineTo(2,14);}
          ctx.stroke();ctx.restore();
        }
        while(trail.length&&time-trail[0].time>160)trail.shift();
        canvas.dataset.trailPoints=String(trail.length);
        if(trail.length>1&&!reduced&&!paused){ctx.lineWidth=.9;for(let i=1;i<trail.length;i++){ctx.globalAlpha=Math.max(0,1-(time-trail[i].time)/160)*.14;ctx.beginPath();ctx.moveTo(trail[i-1].x,trail[i-1].y);ctx.lineTo(trail[i].x,trail[i].y);ctx.stroke();}}
        ctx.restore();
      }
      if(dots){
        particles.forEach(point=>{


          const t=target(point);
          if(active){
            const dx=point.x-pointer.x,dy=point.y-pointer.y,d=Math.hypot(dx,dy),radius=width<700?70:115;
            if(dots&&pointer.active&&d<radius){const force=(1-d/radius)*3;point.vx+=dx/(d||1)*force;point.vy+=dy/(d||1)*force;}
            point.vx+=(t.x-point.x)*.024;point.vy+=(t.y-point.y)*.024;
            point.vx*=Math.pow(.84,step);point.vy*=Math.pow(.84,step);point.x+=point.vx*step;point.y+=point.vy*step;
            displacement+=Math.abs(point.vx)+Math.abs(point.vy);
          }else{point.x=t.x;point.y=t.y;point.vx=0;point.vy=0;}
          ctx.fillStyle=ink;ctx.globalAlpha=.16;
          const radius=1.05;
          ctx.beginPath();ctx.arc(point.x,point.y,radius,0,Math.PI*2);ctx.fill();

        });
      }
      if(shapes&&active){for(let i=ripples.length-1;i>=0;i--){const mark=ripples[i];mark.age+=step*16.67;if(mark.age>1100){ripples.splice(i,1);continue;}ctx.strokeStyle=ink;ctx.globalAlpha=(1-mark.age/1100)*.4;ctx.lineWidth=1.3;ctx.beginPath();for(let j=0;j<6;j++){const a=j*Math.PI/3;ctx.moveTo(mark.x+Math.cos(a)*6,mark.y+Math.sin(a)*6);ctx.lineTo(mark.x+Math.cos(a)*17,mark.y+Math.sin(a)*17);}ctx.stroke();}}

      document.querySelectorAll('.sketch-stroke').forEach((path,index)=>{const offset=reduced||!scrollArt?0:Math.max(0,.16-pageScroll/Math.max(1,height)*.5+index*.012);path.style.setProperty('--pencil-offset',String(offset));});
      ctx.globalAlpha=1;canvas.dataset.displacement=String(Math.round(displacement));canvas.dataset.mode=reduced?'reduced':paused?'paused':'active';
      dirty=false;
    }
    function tick(time){raf=0;if(document.hidden)return;draw(time);if(!reduced&&!paused&&(dots||scrollArt||shapes))raf=requestAnimationFrame(tick);}
    function start(){if(!raf&&!document.hidden&&(dirty||(!reduced&&!paused&&(dots||scrollArt||shapes))))raf=requestAnimationFrame(tick);}
    function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
    function clearPointer(){pointer.active=false;scene.style.removeProperty('--pointer-x');scene.style.removeProperty('--pointer-y');}
    listen(window,'pointermove',event=>{if(reduced||paused||event.pointerType==='touch')return;pointer.x=event.clientX;pointer.y=event.clientY;pointer.active=true;if(shapes){trail.push({x:pointer.x,y:pointer.y,time:performance.now()});if(trail.length>16)trail.shift();scene.style.setProperty('--pointer-x',pointer.x+'px');scene.style.setProperty('--pointer-y',pointer.y+'px');}},{passive:true});
    listen(document,'pointerleave',clearPointer);
    listen(window,'blur',clearPointer);
    listen(window,'scroll',measureScroll,{passive:true});
    listen(window,'resize',resize,{passive:true});
    listen(document,'visibilitychange',()=>{if(document.hidden)stop();else{dirty=true;start();}});
    listen(window,'pointerdown',event=>{if(!shapes||reduced||paused||event.target.closest('input,textarea,select'))return;ripples.push({x:event.clientX,y:event.clientY,age:0});if(ripples.length>6)ripples.shift();start();},{passive:true});
    if(toggle){
      toggle.disabled=reduced;toggle.textContent=reduced?'Reduced motion':'Pause motion';toggle.setAttribute('aria-pressed',String(reduced));
      listen(toggle,'click',()=>{paused=!paused;toggle.textContent=paused?'Resume motion':'Pause motion';toggle.setAttribute('aria-pressed',String(paused));if(paused){stop();clearPointer();}else{dirty=true;start();}});
    }
    const contentObserver=new ResizeObserver(measureScroll);contentObserver.observe(document.getElementById('site'));observers.push(contentObserver);
    if(!reduced){
      const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-entering');reveal.unobserve(entry.target);}}),{threshold:.25});document.querySelectorAll('.section-heading h2,.about-grid h2').forEach(node=>reveal.observe(node));observers.push(reveal);
      if(settings.tilt==='true')document.querySelectorAll('.project-media,.empty-card').forEach(node=>{
        listen(node,'pointermove',event=>{if(paused||event.pointerType==='touch')return;const rect=node.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;node.style.setProperty('--tilt-x',-y*7+'deg');node.style.setProperty('--tilt-y',x*7+'deg');},{passive:true});
        listen(node,'pointerleave',()=>{node.style.removeProperty('--tilt-x');node.style.removeProperty('--tilt-y');});
      });
      if(settings.magnetism==='true')document.querySelectorAll('.button').forEach(node=>{
        listen(node,'pointermove',event=>{if(paused||event.pointerType==='touch')return;const rect=node.getBoundingClientRect();node.style.setProperty('--magnet-x',((event.clientX-rect.left)/rect.width-.5)*7+'px');node.style.setProperty('--magnet-y',((event.clientY-rect.top)/rect.height-.5)*7+'px');},{passive:true});
        listen(node,'pointerleave',()=>{node.style.removeProperty('--magnet-x');node.style.removeProperty('--magnet-y');});
      });
    }
    document.querySelectorAll('.sketch-sticker').forEach(button=>{
      let index=0;const notes=['idea no. 01 ↻','rough draft ↻','try something new ↻','keep this one! ↻'];
      let noteX=0,noteY=0,drag=null,dragged=false;
      const moveNote=()=>{button.style.setProperty('--note-x',noteX+'px');button.style.setProperty('--note-y',noteY+'px');};
      listen(button,'pointerdown',event=>{drag={x:event.clientX,y:event.clientY,nx:noteX,ny:noteY};dragged=false;button.setPointerCapture(event.pointerId);});
      listen(button,'pointermove',event=>{if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>6)dragged=true;noteX=Math.max(-100,Math.min(40,drag.nx+dx));noteY=Math.max(-70,Math.min(20,drag.ny+dy));moveNote();});
      listen(button,'pointerup',()=>drag=null);listen(button,'pointercancel',()=>drag=null);
      listen(button,'keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();noteX=Math.max(-100,Math.min(40,noteX+(event.key==='ArrowLeft'?-8:event.key==='ArrowRight'?8:0)));noteY=Math.max(-70,Math.min(20,noteY+(event.key==='ArrowUp'?-8:event.key==='ArrowDown'?8:0)));moveNote();});
      listen(button,'click',()=>{if(dragged){dragged=false;return;}index=(index+1)%notes.length;button.textContent=notes[index];button.closest('.hero-stage').dataset.note=String(index);});
    });
    const gallery=Array.from(document.querySelectorAll('.gallery-zoom'));
    let activeDialog=null;
    gallery.forEach((button,index)=>listen(button,'click',()=>{
      const E=window.PortfolioCore.element;
      let current=index;
      const dialog=E('dialog',{class:'sketch-lightbox','aria-label':'Project image viewer'});
      const picture=E('img',{alt:''}),caption=E('p',{}),close=E('button',{type:'button',class:'button'},'Close ×');
      const previous=E('button',{type:'button',class:'button','aria-label':'Previous image'},'←'),next=E('button',{type:'button',class:'button','aria-label':'Next image'},'→');
      function show(){const img=gallery[current].querySelector('img');previous.disabled=current===0;next.disabled=current===gallery.length-1;if(!img){picture.removeAttribute('src');picture.alt='Image unavailable';caption.textContent='Image unavailable. Check the original file.';return;}picture.src=img.src;picture.alt=img.alt;caption.textContent=gallery[current].closest('figure').querySelector('figcaption')?.textContent || img.alt;}
      previous.addEventListener('click',()=>{if(current>0){current--;show();}});next.addEventListener('click',()=>{if(current<gallery.length-1){current++;show();}});
      close.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
      dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();previous.click();}if(event.key==='ArrowRight'){event.preventDefault();next.click();}});
      dialog.addEventListener('close',()=>{dialog.remove();activeDialog=null;button.focus();},{once:true});
      dialog.append(E('div',{class:'lightbox-toolbar'},previous,next,close),picture,caption);document.body.append(dialog);activeDialog=dialog;show();dialog.showModal();close.focus();
    }));
    resize();
    dispose=()=>{if(activeDialog)activeDialog.close();stop();listeners.forEach(remove=>remove());observers.forEach(observer=>observer.disconnect());document.querySelectorAll('.button,.project-media,.empty-card').forEach(node=>['--magnet-x','--magnet-y','--tilt-x','--tilt-y'].forEach(key=>node.style.removeProperty(key)));clearPointer();};
  }
  document.addEventListener('portfolio:rendered',initialize);preference.addEventListener('change',initialize);initialize();
})();
