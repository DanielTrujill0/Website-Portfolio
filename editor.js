(function () {
  'use strict';
  const C=window.PortfolioCore, e=C.element;
  const storageKey='portfolio-editor-draft-v1';
  const published=C.normalize(window.PORTFOLIO || {});
  let draft=C.normalize(published);
  const status=document.getElementById('save-status');
  const alert=document.getElementById('editor-alert');
  let storageAvailable=true;
  try {const saved=localStorage.getItem(storageKey);if(saved)draft=C.normalize(JSON.parse(saved));}catch{storageAvailable=false;}
  function message(text,error=false){alert.textContent=text;alert.hidden=false;alert.classList.toggle('error',error);}
  function save(){
    try {localStorage.setItem(storageKey,JSON.stringify(draft));storageAvailable=true;status.textContent='Draft saved in this browser';}
    catch {storageAvailable=false;status.textContent='Draft not saved — download to keep changes';}
  }
  let fieldId=0;
  function field(obj,key,label,{type='text',wide=false,help='',options=[]}={}){
    const id='editor-field-'+(++fieldId);
    const wrap=e('div',{class:'field'+(wide?' wide':'')});
    const control=type==='textarea'?e('textarea',{id,rows:'4'}):type==='select'?e('select',{id},options.map(item=>e('option',{value:typeof item==='string'?item:item.value},typeof item==='string'?item:item.label))):e('input',{id,type});
    control.value=obj[key] || '';
    if(type==='checkbox')control.checked=obj[key]!==false;
    control.addEventListener(type==='checkbox'||type==='select'?'change':'input',()=>{obj[key]=type==='checkbox'?control.checked:control.value;save();if(obj===draft.theme)updateThemeSample();});
    wrap.append(e('label',{for:id},label),control);
    if(help){const helpId=id+'-help';control.setAttribute('aria-describedby',helpId);wrap.append(e('span',{class:'field-help',id:helpId},help));}
    return wrap;
  }
  function panel(id,title,description,...children){return e('section',{class:'editor-panel',id,'aria-labelledby':id+'-title'},e('h2',{id:id+'-title'},title),e('p',{class:'panel-description'},description),children);}
  function grid(...items){return e('div',{class:'field-grid'},items);}
  function entryControls(items,index,render){
    const up=e('button',{type:'button','aria-label':'Move entry up'},'↑');up.disabled=index===0;
    const down=e('button',{type:'button','aria-label':'Move entry down'},'↓');down.disabled=index===items.length-1;
    const remove=e('button',{type:'button',class:'remove'},'Remove');
    up.addEventListener('click',()=>{[items[index-1],items[index]]=[items[index],items[index-1]];save();render();});
    down.addEventListener('click',()=>{[items[index+1],items[index]]=[items[index],items[index+1]];save();render();});
    remove.addEventListener('click',()=>{if(confirm('Remove this entry from your draft?')){items.splice(index,1);save();render();}});
    return e('div',{class:'entry-actions'},up,down,remove);
  }
  function collection(id,title,description,key,create,renderFields){
    const list=e('div',{});
    function render(){list.replaceChildren();if(!draft[key].length)list.append(e('p',{class:'editor-empty'},'No entries yet. Add one when you’re ready.'));draft[key].forEach((row,index)=>{const title=e('h3',{},row.title || row.role || 'Entry '+(index+1));const entry=e('article',{class:'entry'},e('div',{class:'entry-header'},title,entryControls(draft[key],index,render)),renderFields(row,index));entry.addEventListener('input',()=>title.textContent=row.title || row.role || 'Entry '+(index+1));list.append(entry);});}
    const add=e('button',{class:'add-button',type:'button'},'+ Add '+title.toLowerCase().replace(/s$/,''));
    add.addEventListener('click',()=>{draft[key].push(create());save();render();list.lastElementChild?.querySelector('input,textarea')?.focus();});
    render();return panel(id,title,description,list,add);
  }
  function galleryFields(project){
    const box=e('div',{class:'gallery-editor'},e('h4',{},'Project gallery'));
    const list=e('div',{});
    function render(){list.replaceChildren();project.gallery.forEach((row,index)=>list.append(e('div',{class:'entry'},e('div',{class:'entry-header'},e('h3',{},'Image '+(index+1)),entryControls(project.gallery,index,render)),grid(field(row,'src','Image path or HTTPS URL',{help:'Example: assets/project-detail.jpg'}),field(row,'alt','Image description',{help:'Describe the image for visitors using screen readers.'}),field(row,'caption','Caption',{wide:true})))));}
    const add=e('button',{type:'button',class:'add-button'},'+ Add gallery image');
    add.addEventListener('click',()=>{project.gallery.push({src:'',alt:'',caption:''});save();render();});
    render();box.append(list,add);return box;
  }
  let sample;
  function luminance(hex){return hex.slice(1).match(/../g).map(value=>parseInt(value,16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);}
  function updateThemeSample(){
    if(!sample)return;const specimen=document.querySelector('.font-specimen');if(specimen){const names={kalam:'Kalam',sketch:'Kalam',caveat:'Caveat',patrick:'Patrick Hand',editorial:'Lora',modern:'DM Sans',technical:'Consolas'};specimen.style.fontFamily=names[draft.theme.font] || 'Kalam';}
    const t=draft.theme;sample.replaceChildren();
    const swatches=e('div',{class:'sample-swatches'});
    ['background','accent','ink'].forEach(key=>{const dot=e('span',{'aria-label':key+' '+t[key]});dot.style.backgroundColor=t[key];swatches.append(dot);});
    const valid=['background','accent','ink'].every(key=>/^#[a-f0-9]{6}$/i.test(t[key]));
    const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
    const min=valid?Math.min(contrast(t.ink,t.background),contrast(t.ink,t.accent)):0;
    sample.append(swatches,e('p',{},e('strong',{},'Palette preview'),e('br'),valid?'Lowest text contrast: '+min.toFixed(1)+':1':'Choose valid colors.'));
    if(min<4.5)sample.append(e('p',{class:'theme-warning'},'Choose colors with at least 4.5:1 contrast for readable text.'));
  }
  function renderEditor(){
    fieldId=0;
    const panels=document.getElementById('editor-panels');panels.replaceChildren();
    panels.append(panel('profile-editor','Introduction','Personal details are blank until you add them.',grid(
      field(draft.profile,'name','Your name'),field(draft.profile,'initials','Logo initials'),field(draft.profile,'role','Role / area of study'),field(draft.profile,'location','Location'),field(draft.profile,'status','Short status / eyebrow',{wide:true}),field(draft.profile,'headline','Homepage headline',{type:'textarea',wide:true,help:'Line breaks are preserved. Example: Ideas into code. / Code into motion.'}),field(draft.profile,'intro','Introduction',{type:'textarea',wide:true}),field(draft.profile,'portrait','Portrait image path or HTTPS URL',{help:'Place your photo in assets/, then enter assets/portrait.jpg.'}),field(draft.profile,'portraitAlt','Portrait description'))));
    const presetField=field(draft.theme,'preset','Color preset',{type:'select',options:Object.keys(C.presets)});
    presetField.querySelector('select').addEventListener('change',()=>{Object.assign(draft.theme,C.presets[draft.theme.preset]);save();renderEditor();});
    sample=e('div',{class:'theme-sample'});
    panels.append(panel('theme-editor','Appearance','Choose a preset or adjust individual colors. Your public site uses this palette.',grid(presetField,field(draft.theme,'font','Heading style',{type:'select',options:[{value:'kalam',label:'Kalam · pencil handwriting'},{value:'caveat',label:'Caveat · loose handwritten notes'},{value:'patrick',label:'Patrick Hand · neat handwriting'},{value:'sketch',label:'Sketchbook · Kalam (legacy)'},{value:'editorial',label:'Lora · editorial serif'},{value:'modern',label:'DM Sans · clean sans serif'},{value:'technical',label:'Consolas · technical monospace'}]}),field(draft.theme,'accent','Accent color',{type:'color'}),field(draft.theme,'background','Background color',{type:'color'}),field(draft.theme,'ink','Text color',{type:'color'}),field(draft.theme,'drawing','Drawing style',{type:'select',options:['pencil','ink','marker']}),field(draft.theme,'paper','Paper style',{type:'select',options:['plain','dotted','ruled']}),field(draft.theme,'radius','Corner style',{type:'select',options:['soft','square','round']})),sample,e('p',{class:'font-specimen'},'Aa — A page of ideas. 0123456789')));updateThemeSample();
    const motionToggles=e('div',{class:'section-toggles'});
    [['dots','Background pencil dots'],['tilt','Artwork hover tilt'],['scroll','Scroll-drawn pencil sketches'],['shapes','Margin doodles & pencil click marks'],['magnetism','Magnetic button hover']].forEach(([key,label])=>{const f=field(draft.interactions,key,label,{type:'checkbox'});f.classList.add('check-field');motionToggles.append(f);});
    document.getElementById('theme-editor').append(e('p',{class:'editor-note'},'Interactive graphics · Reduced-motion preferences are respected automatically.'),motionToggles,grid(field(draft.interactions,'dotDensity','Background dot density',{type:'select',options:['subtle','balanced','rich'],wide:true})));
    const toggles=e('div',{class:'section-toggles'});
    C.sectionKeys.forEach(key=>{const f=field(draft.sections,key,(key==='playground'?'Studies':key[0].toUpperCase()+key.slice(1)),{type:'checkbox'});f.classList.add('check-field');toggles.append(f);});
    panels.append(panel('sections-editor','Sections & headings','Hide sections you don’t need. Project, skill, experience, and experiment order follows the order in this editor.',toggles,e('div',{class:'editor-note'},'Visible empty sections show clearly marked template prompts. Turn them off for a minimal site.'),grid(C.sectionKeys.map(key=>field(draft.labels,key,key[0].toUpperCase()+key.slice(1)+' heading')))));
    panels.append(collection('projects-editor','Projects','Each titled project gets a card and a full case-study page. Use the arrows to reorder projects. Blank titles remain hidden.','projects',()=>({...Object.fromEntries(C.projectKeys.map(key=>[key,''])),id:'project-'+Date.now().toString(36),gallery:[]}),project=>[
      grid(field(project,'title','Project title'),field(project,'category','Category',{help:'Categories become project filters.'}),field(project,'year','Year'),field(project,'status','Status'),field(project,'summary','Short summary',{type:'textarea',wide:true}),field(project,'cover','Cover image path or HTTPS URL'),field(project,'coverAlt','Cover image description'),field(project,'role','Your role'),field(project,'duration','Timeline / duration'),field(project,'tools','Tools',{wide:true,help:'Separate tools with commas.'}),field(project,'repository','Source code HTTPS URL'),field(project,'demo','Live demo HTTPS URL')),
      e('details',{class:'project-settings'},e('summary',{},'Advanced: stable project link'),grid(field(project,'id','Project ID',{wide:true,help:'Use a unique ID such as camera-tracker. Renaming it changes this project’s link.'}))),
      grid(['overview','challenge','process','outcome','lessons'].map(key=>field(project,key,{overview:'Overview',challenge:'The challenge',process:'The process',outcome:'The outcome',lessons:'What I learned'}[key],{type:'textarea',wide:true}))),galleryFields(project)
    ]));
    panels.append(panel('about-editor','About','Tell your story in your own words. Blank information stays blank.',grid(field(draft.profile,'aboutTitle','About headline',{wide:true}),field(draft.profile,'about','Biography',{type:'textarea',wide:true,help:'Separate paragraphs with a blank line.'}),field(draft.profile,'interests','Outside of work / interests',{type:'textarea',wide:true}))));
    panels.append(collection('skills-editor','Skills','Group your tools or interests. No numeric ratings needed.','skills',()=>({title:'',items:''}),row=>grid(field(row,'title','Group title',{wide:true}),field(row,'items','Tools / skills',{type:'textarea',wide:true,help:'Use line breaks or commas.'}))));
    panels.append(collection('experience-editor','Experience','Add education, work, volunteering, or learning milestones.','experience',()=>({period:'',role:'',organization:'',description:''}),row=>grid(field(row,'period','Dates / period'),field(row,'role','Role / degree'),field(row,'organization','Organization / school',{wide:true}),field(row,'description','Description',{type:'textarea',wide:true}))));
    panels.append(collection('playground-editor','Experiments','Small side projects, sketches, prototypes, or other things you want to share.','playground',()=>({title:'',category:'',description:'',url:''}),row=>grid(field(row,'title','Title'),field(row,'category','Category'),field(row,'description','Description',{type:'textarea',wide:true}),field(row,'url','HTTPS link',{wide:true}))));
    panels.append(panel('contact-editor','Contact & links','Only valid, filled-in links appear on your site. No email address or profile links are prefilled.',grid(field(draft.profile,'email','Email',{type:'email'}),field(draft.profile,'github','GitHub HTTPS URL'),field(draft.profile,'linkedin','LinkedIn HTTPS URL'),field(draft.profile,'instagram','Instagram HTTPS URL'),field(draft.profile,'resume','Résumé path or HTTPS URL',{wide:true,help:'Example: assets/resume.pdf. This adds a résumé link to the homepage.'}),field(draft.profile,'contactTitle','Contact headline',{wide:true}),field(draft.profile,'contactText','Contact description',{type:'textarea',wide:true}))));
  }
  const nav=document.getElementById('editor-navigation');
  [['profile-editor','01','Introduction'],['theme-editor','02','Appearance'],['sections-editor','03','Sections'],['projects-editor','04','Projects'],['about-editor','05','About'],['skills-editor','06','Skills'],['experience-editor','07','Experience'],['playground-editor','08','Studies'],['contact-editor','09','Contact & links']].forEach(([id,num,label])=>nav.append(e('a',{href:'#'+id},num+' / '+label)));
  document.getElementById('preview-link').addEventListener('click',event=>{save();if(!storageAvailable){event.preventDefault();message('This browser is blocking draft storage. Download content.js, replace it in your project, and open index.html to preview your edits.',true);}});
  document.getElementById('export-button').addEventListener('click',()=>{
    draft=C.normalize(draft);save();
    const url=URL.createObjectURL(new Blob([C.exportText(draft)],{type:'text/javascript;charset=utf-8'}));
    const a=e('a',{href:url,download:'content.js'});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    message('Downloaded content.js. Replace the content.js in your portfolio folder with this file, then commit and push to publish. Your live site has not been changed.');
    renderEditor();
  });
  const importFile=document.getElementById('import-file');
  document.getElementById('import-button').addEventListener('click',()=>importFile.click());
  importFile.addEventListener('change',async()=>{const file=importFile.files[0];if(!file)return;try{if(file.size>2000000)throw new Error('Choose a content file smaller than 2 MB.');const imported=C.parseContent(await file.text());if(confirm('Replace the current draft with this imported file?')){draft=imported;save();renderEditor();message('Imported content into your local draft. Preview or export when ready.');}}catch(error){message('Import failed: '+error.message,true);}finally{importFile.value='';}});
  document.getElementById('reset-button').addEventListener('click',()=>{if(confirm('Discard your draft and restore the content.js currently loaded by this page?')){draft=C.normalize(published);save();renderEditor();message('Restored the loaded content.js.');}});
  window.addEventListener('storage',event=>{if(event.key===storageKey)message('Another editor tab changed this draft. Reload before editing further to avoid overwriting its changes.',true);});
  renderEditor();save();
})();
