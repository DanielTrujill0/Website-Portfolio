(function () {
  'use strict';
  const {normalize,safeUrl,emailUrl,applyTheme,element:e}=window.PortfolioCore;
  const params=new URLSearchParams(location.search);
  const preview=params.get('preview')==='1';
  let data=normalize(window.PORTFOLIO || {});
  if(preview) { try { const draft=localStorage.getItem('portfolio-editor-draft-v1'); if(draft) data=normalize(JSON.parse(draft)); } catch {} }
  applyTheme(data.theme);
  let p=data.profile;
  let name=p.name || 'Your portfolio';
  let projects=data.projects.filter(project => project.title.trim());
  const site=document.getElementById('site');
  const arrow=()=>e('span',{'aria-hidden':'true'},'↗');
  const previewSuffix=preview ? '&preview=1' : '';
  const home=()=> 'index.html' + (preview ? '?preview=1' : '');
  const projectUrl=project => 'project.html?id='+encodeURIComponent(project.id)+previewSuffix;
  const link=(label,url,cls='')=>safeUrl(url) ? e('a',{href:safeUrl(url),class:cls},label,arrow()) : null;
  const paragraph=text=>e('p',{class:'prose'},text);
  const placeholder=text=>e('p',{class:'quiet-empty'},e('span',{class:'placeholder'},'Not filled in yet'),e('br'),text);
  function image(src,alt,cls='',eager=false) {
    const img=e('img',{src:safeUrl(src),alt:alt || '',class:cls,loading:eager?'eager':'lazy',decoding:'async'});
    img.addEventListener('error',()=>img.replaceWith(e('div',{class:'image-error'},'Image unavailable. Check the image path.')),{once:true});
    return img;
  }
  function media(project,index,cover=false) {
    const block=e('div',{class:'project-media'+(cover?' detail-cover':'')});
    if(safeUrl(project.cover)) block.append(image(project.cover,project.coverAlt || project.title,'',cover));
    else block.append(e('div',{class:'project-abstract','aria-hidden':'true'},e('span',{},String(index+1).padStart(2,'0'))));
    if(!cover) block.append(e('span',{class:'media-arrow','aria-hidden':'true'},'↗'));
    return block;
  }
  function heading(id,number,label,description) {
    return e('div',{class:'section-heading'},e('div',{},e('p',{class:'mono'},number+' / '+(label==='playground'?'studies':label)),e('h2',{id},data.labels[label] || ({projects:'Selected work',about:'A little more about me',skills:'Tools & interests',experience:'The journey so far',playground:'Studies & explorations',contact:'Let’s start a conversation.'})[label])),description?e('p',{},description):null);
  }
  function section(id,title,...children) { return e('section',{id,class:'section','aria-labelledby':title},children); }
  function header() {
    const nav=e('nav',{class:'nav container','aria-label':'Main navigation'});
    nav.append(e('a',{class:'brand',href:home()},e('span',{class:'brand-mark','aria-hidden':'true'},p.initials || '✳'),name));
    const menu=e('div',{class:'nav-links',id:'navigation-links'});
    [['projects','Work'],['about','About'],['playground','Studies'],['contact','Contact']].forEach(([id,title])=>{if(data.sections[id]) menu.append(e('a',{href:home()+'#'+id,class:id==='contact'?'nav-contact':''},title));});
    const toggle=e('button',{class:'menu-toggle',type:'button','aria-expanded':'false','aria-controls':'navigation-links'},'Menu');
    toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));menu.classList.toggle('is-open',open);});
    menu.addEventListener('click',()=>{toggle.setAttribute('aria-expanded','false');menu.classList.remove('is-open');});
    nav.append(toggle,menu); return e('header',{class:'site-header'},nav);
  }
  function footer() {return e('footer',{class:'container site-footer'},e('span',{},'© '+new Date().getFullYear()+' '+(p.name || 'Portfolio')),e('div',{class:'footer-links'},link('GitHub',p.github),e('button',{type:'button',class:'motion-toggle','aria-pressed':'false'},'Pause motion'),e('a',{href:'#main'},'Back to top ↑')));}
  function contact() {
    const links=e('div',{class:'contact-links'});
    if(emailUrl(p.email)){links.append(e('a',{class:'button primary',href:emailUrl(p.email)},'Say hello',arrow()));const copy=e('button',{type:'button',class:'button','aria-live':'polite'},'Copy email');copy.addEventListener('click',async()=>{try{await window.PortfolioCore.copyText(p.email);copy.textContent='Email copied ✓';}catch{copy.textContent=p.email;}setTimeout(()=>copy.textContent='Copy email',2200);});links.append(copy);}
    [['GitHub',p.github],['LinkedIn',p.linkedin],['Instagram',p.instagram]].forEach(([label,url])=>{const a=link(label,url,'button');if(a)links.append(a);});
    if(!links.children.length) links.append(e('span',{class:'placeholder'},'Contact links not added yet'));
    return section('contact','contact-title',e('div',{class:'contact-panel'},e('div',{},e('p',{class:'mono'},'06 / Get in touch'),e('h2',{id:'contact-title'},p.contactTitle || data.labels.contact || 'Let’s start a conversation.'),e('p',{},p.contactText || 'Add your email and social links when you’re ready to share them.')),links));
  }
  function homePage() {
    document.title=p.name ? p.name+' — Portfolio' : 'Your portfolio';
    document.querySelector('meta[name="description"]').content=p.intro || 'A personal portfolio of projects, ideas, and the process behind them.';
    const main=e('main',{id:'main',class:'container'});
    const actions=e('div',{class:'actions'});
    if(data.sections.projects) actions.append(e('a',{href:'#projects',class:'button primary'},'Explore the work',e('span',{'aria-hidden':'true'},'↘')));
    if(safeUrl(p.resume)) actions.append(link('View résumé',p.resume,'button'));
    else if(data.sections.about) actions.append(e('a',{href:'#about',class:'button'},'About me',e('span',{'aria-hidden':'true'},'→')));
    const visual=e('div',{class:'hero-visual hero-stage'});
    if(safeUrl(p.portrait)) visual.append(image(p.portrait,p.portraitAlt || p.name,'',true));
    else {visual.append(window.PortfolioSketch.create());visual.append(e('button',{type:'button',class:'sketch-sticker','aria-label':'Sketchbook note. Click to change, drag to move, or use arrow keys.'},'idea no. 01 ↻'));}
    main.append(e('div',{class:'hero'},e('div',{},e('p',{class:'eyebrow mono'},e('span',{class:'status-dot','aria-hidden':'true'}),p.status || p.role || 'Portfolio / Make it yours'),e('h1',{},p.headline || 'A space for\nwhat you make.'),e('p',{class:'hero-intro'},p.intro || 'Your story starts here. Add an introduction, share your projects, and let the work speak for itself.'),actions),visual));
    main.append(e('div',{class:'hero-bottom mono'},e('span',{},[p.role,p.location].filter(Boolean).join(' · ') || 'Thoughts · Projects · Possibilities'),e('span',{},p.name ? 'Scroll to explore ↓' : 'Blank template · Ready for your story')));
    if(data.sections.projects) {
      const work=section('projects','projects-title',heading('projects-title','01','projects','The ideas, decisions, and details behind the work.'));
      if(projects.length) {
        const categories=[...new Set(projects.map(project=>project.category).filter(Boolean))];
        const filters=e('div',{class:'filters','aria-label':'Filter projects'});
        const grid=e('div',{class:'project-grid'});
        const search=e('input',{id:'project-search',type:'search',placeholder:'Search projects, tools, or ideas…','aria-label':'Search projects'});
        const count=e('p',{class:'project-count',role:'status','aria-live':'polite'});
        const empty=e('p',{class:'search-empty',hidden:true},'No matching projects. Try another word or category.');
        let selectedCategory=null;
        const cards=projects.map((project,index)=>{
          const card=e('article',{class:'project-card'});
          const a=e('a',{class:'project-link',href:projectUrl(project)},media(project,index),e('div',{class:'project-caption'},e('div',{},e('h3',{},project.title),e('p',{},[project.category,project.year,project.status].filter(Boolean).join(' · '))),e('span',{'aria-hidden':'true'},'↗')));
          card.append(a);
          if(project.summary)card.append(e('p',{class:'project-summary'},project.summary));
          if(project.tools)card.append(e('div',{class:'tags'},project.tools.split(',').map(tool=>tool.trim()).filter(Boolean).map(tool=>e('span',{class:'tag'},tool))));
          grid.append(card);return {card,category:project.category,text:[project.title,project.summary,project.tools,project.category].join(' ').toLowerCase()};
        });
        function updateResults(){const query=search.value.trim().toLowerCase();let found=0;cards.forEach(({card,category,text})=>{card.hidden=(selectedCategory!==null&&category!==selectedCategory)||!text.includes(query);if(!card.hidden)found++;});count.textContent=found+' of '+cards.length+' projects';empty.hidden=found!==0;}
        search.addEventListener('input',updateResults);search.addEventListener('keydown',event=>{if(event.key==='Escape'){search.value='';updateResults();}});
        [{label:'All',value:null},...categories.map(category=>({label:category,value:category}))].forEach(({label,value})=>{const button=e('button',{type:'button',class:'filter','aria-pressed':String(value===null)},label);button.addEventListener('click',()=>{filters.querySelectorAll('button').forEach(btn=>btn.setAttribute('aria-pressed',String(btn===button)));selectedCategory=value;updateResults();});filters.append(button);});
        work.append(e('div',{class:'project-search-row'},e('label',{for:'project-search',class:'mono'},'Find a project'),search,count));if(categories.length)work.append(filters);work.append(grid,empty);updateResults();
      } else {
        work.append(e('div',{class:'empty-grid'},['Your first project','Your next big idea'].map((title,index)=>e('div',{class:'empty-card'},e('div',{class:'empty-art','aria-hidden':'true'},index?'↗':'✳'),e('div',{},e('p',{class:'placeholder'},'Project placeholder / '+String(index+1).padStart(2,'0')),e('h3',{},title),e('p',{},'Add images, a summary, and a full case study in the editor.'))))));
      }
      main.append(work);
    }
    if(data.sections.about) main.append(section('about','about-title',e('div',{class:'about-grid'},e('div',{},e('p',{class:'mono'},'02 / Behind the work'),e('h2',{id:'about-title'},p.aboutTitle || data.labels.about || 'A little more about me')),e('div',{},p.about ? paragraph(p.about) : placeholder('Your background, what you care about, and where you want to go. This space is intentionally blank.'),p.interests ? e('p',{class:'personal-note'},p.interests) : null))));
    if(data.sections.skills) {
      const skills=data.skills.filter(row=>row.title || row.items);
      main.append(section('skills','skills-title',heading('skills-title','03','skills'),skills.length ? e('div',{class:'skills-grid'},skills.map(row=>e('article',{class:'skill-group'},row.title?e('h3',{},row.title):null,e('p',{},row.items)))) : placeholder('Add groups of tools, skills, or interests. No skill levels or credentials have been filled in.')));
    }
    if(data.sections.experience) {
      const entries=data.experience.filter(row=>row.role || row.organization);
      main.append(section('experience','experience-title',heading('experience-title','04','experience'),entries.length ? e('div',{class:'timeline'},entries.map(row=>e('article',{class:'timeline-row'},e('p',{class:'mono'},row.period),e('div',{},row.role?e('h3',{},row.role):null,row.organization?e('p',{class:'org'},row.organization):null,row.description?paragraph(row.description):null)))) : placeholder('Education, experience, milestones, or independent learning. Add only the details you want to share.')));
    }
    if(data.sections.playground) {
      const items=data.playground.filter(row=>row.title);
      main.append(section('playground','playground-title',heading('playground-title','05','playground','A place for experiments, sketches, and things that don’t fit neatly in a category.'),items.length ? e('div',{class:'playground-grid'},items.map(row=>e('article',{class:'experiment'},e('p',{class:'mono'},row.category || 'Experiment'),e('h3',{},row.title),e('p',{},row.description),link('Take a look',row.url)))) : placeholder('This shelf is empty for now. Fill it with side projects, sketches, demos, or small discoveries.')));
    }
    if(data.sections.contact) main.append(contact());
    return main;
  }
  function projectPage() {
    const main=e('main',{id:'main',class:'container'});
    const index=projects.findIndex(project=>project.id===params.get('id'));
    if(index<0){document.title='Project not found — Portfolio';main.append(e('div',{class:'not-found'},e('p',{class:'mono'},'Project not found'),e('h1',{},'Nothing here just yet.'),e('p',{},'This project may have been renamed or removed.'),e('div',{class:'actions'},e('a',{class:'button primary',href:home()},'Back to the portfolio'))));return main;}
    const project=projects[index];document.title=project.title+' — '+name;
    const facts=e('dl',{class:'project-facts'});
    [['Role',project.role],['Timeline',project.duration || project.year],['Tools',project.tools],['Status',project.status]].forEach(([label,value])=>{if(value)facts.append(e('div',{},e('dt',{},label),e('dd',{},value)));});
    const actions=e('div',{class:'actions'},link('Source code',project.repository,'button'),link('Live demo',project.demo,'button primary'));
    main.append(e('div',{class:'detail-hero'},e('a',{class:'back-link',href:home()+'#projects'},'← Back to selected work'),e('h1',{},project.title),project.summary?e('p',{class:'detail-intro'},project.summary):null,facts.children.length?facts:null,actions.children.length?actions:null),media(project,index,true));
    const contents=e('nav',{class:'case-contents','aria-label':'Case study contents'},e('span',{class:'mono'},'On this page'));[['overview','Overview'],['challenge','Challenge'],['process','Process'],['outcome','Outcome'],['lessons','Lessons']].forEach(([key,label])=>{if(project[key])contents.append(e('a',{href:'#case-'+key},label));});if(contents.querySelector('a'))main.append(contents);
    let filled=0;
    [['overview','Overview'],['challenge','The challenge'],['process','The process'],['outcome','The outcome'],['lessons','What I learned']].forEach(([key,label])=>{if(project[key]){filled++;main.append(e('section',{class:'case-section','aria-labelledby':'case-'+key},e('h2',{id:'case-'+key},label),paragraph(project[key])));}});
    if(!filled)main.append(placeholder('The case study hasn’t been filled in yet.'));
    const gallery=project.gallery.filter(row=>safeUrl(row.src));
    if(gallery.length)main.append(e('div',{class:'gallery'},gallery.map(row=>e('figure',{},e('button',{type:'button',class:'gallery-zoom','aria-label':'Expand '+(row.alt || 'project image')},image(row.src,row.alt)),row.caption?e('figcaption',{},row.caption):null))));
    if(projects.length>1){const next=projects[(index+1)%projects.length];main.append(e('a',{class:'next-project',href:projectUrl(next)},e('div',{},e('p',{class:'mono'},'Next project'),e('h3',{},next.title)),arrow()));}
    if(data.sections.contact)main.append(contact());
    return main;
  }
  function render(){
    p=data.profile; name=p.name || 'Your portfolio'; projects=data.projects.filter(project=>project.title.trim());
    site.replaceChildren();
    if(preview)site.append(e('div',{class:'preview-banner'},'Draft preview — changes are saved only in this browser.',e('a',{href:'editor.html'},'Return to editor')));
    site.append(e('div',{class:'ambient-scene','aria-hidden':'true'},e('canvas',{class:'ambient-canvas'})),e('div',{class:'scroll-progress','aria-hidden':'true'}),header(),document.body.dataset.page==='project'?projectPage():homePage(),footer());
    document.body.dataset.tilt=String(data.interactions.tilt);
    document.body.dataset.dots=String(data.interactions.dots);
    document.body.dataset.scrollArt=String(data.interactions.scroll);
    document.body.dataset.shapes=String(data.interactions.shapes);
    document.body.dataset.magnetism=String(data.interactions.magnetism);
    document.body.dataset.dotDensity=data.interactions.dotDensity;
    document.body.classList.add('sketchbook');
    document.dispatchEvent(new CustomEvent('portfolio:rendered'));
    const themeMeta=document.querySelector('meta[name="theme-color"]');if(themeMeta)themeMeta.content=data.theme.background;
  }
  document.addEventListener('keydown',event=>{if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.target.matches('input,textarea,select,[contenteditable]')){const search=document.getElementById('project-search');if(search){event.preventDefault();search.focus();}}});
  render();
  if(preview)window.addEventListener('storage',event=>{if(event.key==='portfolio-editor-draft-v1'&&event.newValue){try{data=normalize(JSON.parse(event.newValue));applyTheme(data.theme);render();}catch{}}});
})();
