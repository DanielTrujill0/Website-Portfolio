/* Shared content schema and helpers. No dependencies or build step. */
(function () {
  'use strict';
  const profileKeys = ['name','initials','role','location','status','headline','intro','email','github','linkedin','instagram','resume','portrait','portraitAlt','aboutTitle','about','interests','contactTitle','contactText'];
  const sectionKeys = ['projects','about','skills','experience','playground','contact'];
  const projectKeys = ['id','title','category','year','status','summary','role','duration','tools','cover','coverAlt','repository','demo','overview','challenge','process','outcome','lessons'];
  const presets = {
    sage: {accent:'#c7edaa',background:'#f7f7f2',ink:'#23332a'},
    ocean: {accent:'#a8e6ee',background:'#f4f8fa',ink:'#173648'},
    clay: {accent:'#efbf9e',background:'#faf5ef',ink:'#422c24'},
    lilac: {accent:'#d8cafa',background:'#f8f5fc',ink:'#322846'},
    midnight: {accent:'#36503e',background:'#17221c',ink:'#f1f5ec'}
  };
  const text = value => typeof value === 'string' ? value.slice(0,30000) : '';
  const rows = value => Array.isArray(value) ? value.slice(0,100).filter(row => row && typeof row === 'object' && !Array.isArray(row)) : [];
  function pick(input, keys) { return Object.fromEntries(keys.map(key => [key,text(input?.[key])])); }
  function normalize(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Content must be an object.');
    const theme = input.theme || {};
    const preset = Object.hasOwn(presets,theme.preset) ? theme.preset : 'sage';
    const colors = presets[preset];
    const ids = new Set();
    const projects = rows(input.projects).map((row,index) => {
      const project = pick(row,projectKeys);
      const base = (project.id || project.title || 'project-' + (index+1)).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'project';
      let id = base, suffix = 2;
      while(ids.has(id)) id = base + '-' + suffix++;
      ids.add(id); project.id = id;
      project.gallery = rows(row.gallery).map(image => pick(image,['src','alt','caption']));
      return project;
    });
    return {
      version:1, profile:pick(input.profile,profileKeys),
      interactions:Object.fromEntries(['dots','tilt','ribbon'].map(key=>[key,input.interactions?.[key] !== false])),
      theme:{preset, ...Object.fromEntries(['accent','background','ink'].map(key => [key,/^#[a-f0-9]{6}$/i.test(theme[key]) ? theme[key] : colors[key]])),font:['editorial','modern','technical'].includes(theme.font) ? theme.font : 'editorial',radius:['soft','square','round'].includes(theme.radius) ? theme.radius : 'soft'},
      sections:Object.fromEntries(sectionKeys.map(key => [key,input.sections?.[key] !== false])),
      labels:pick(input.labels,sectionKeys), projects,
      skills:rows(input.skills).map(row => pick(row,['title','items'])),
      experience:rows(input.experience).map(row => pick(row,['period','role','organization','description'])),
      playground:rows(input.playground).map(row => pick(row,['title','category','description','url']))
    };
  }
  function safeUrl(value) {
    if (!value || typeof value !== 'string' || /[\u0000-\u0020\\]/.test(value)) return '';
    if (/^https:\/\//i.test(value)) { try { const url=new URL(value); return url.hostname && !url.username && !url.password ? url.href : ''; } catch { return ''; } }
    if (/^(?:[a-z0-9_.~-]+\/)*[a-z0-9_.~-]+(?:[?#][^\s]*)?$/i.test(value) && !value.includes('..') && !value.includes(':')) return value;
    return '';
  }
  function emailUrl(value) { return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value) ? 'mailto:' + encodeURIComponent(value).replace(/%40/g,'@') : ''; }
  function applyTheme(theme) {
    const root = document.documentElement;
    ['accent','background','ink'].forEach(key => root.style.setProperty('--'+key,theme[key]));
    root.style.setProperty('--heading', theme.font === 'editorial' ? "Georgia,'Times New Roman',serif" : theme.font === 'technical' ? 'Consolas,monospace' : "'Segoe UI',Arial,sans-serif");
    root.style.setProperty('--radius', {soft:'18px',square:'3px',round:'32px'}[theme.radius]);
  }
  function element(tag,attrs,...children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key,value]) => { if(value !== undefined && value !== null) { if(key==='class') node.className=value; else node.setAttribute(key,value); } });
    children.flat(Infinity).forEach(child => { if(child !== null && child !== undefined) node.append(child instanceof Node ? child : document.createTextNode(String(child))); });
    return node;
  }
  function exportText(data) { return '/* Edit with editor.html or customize this file directly. */\nwindow.PORTFOLIO = ' + JSON.stringify(normalize(data),null,2) + ';\n'; }
  function parseContent(source) {
    const raw = source.trim().replace(/^\uFEFF/,'');
    const match = raw.match(/window\.PORTFOLIO\s*=\s*([\s\S]*?);?\s*$/);
    return normalize(JSON.parse(match ? match[1].replace(/;\s*$/,'') : raw));
  }
  window.PortfolioCore={normalize,safeUrl,emailUrl,applyTheme,element,exportText,parseContent,presets,profileKeys,sectionKeys,projectKeys};
})();


