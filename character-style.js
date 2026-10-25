/* Shared cosmetic profile. No Campaign, Gauntlet, army or combat data is written here. */
(()=>{
 'use strict';
 const KEY='crownrunner-character-v1';
 const palettes={gold:{name:'Gold',fill:'#ffd342',accent:'#c68c25'},ivory:{name:'Ivory',fill:'#f0e5cf',accent:'#d8c6a3'},coral:{name:'Coral',fill:'#ffad94',accent:'#f28283'},mint:{name:'Mint',fill:'#9de0be',accent:'#70cbb0'},sky:{name:'Sky',fill:'#9bd5f1',accent:'#6cbada'},lilac:{name:'Lilac',fill:'#cfb5f3',accent:'#b193df'}};
 const crowns={classic:{name:'Classic',shape:'<path d="M19 9V7Q15 9 15.5 6.5Q15.5 4.5 19 6V4Q16.5 1 20 1Q23.5 1 21 4V6Q24.5 4.5 24.5 6.5Q25 9 21 7V9Z"/>'},street:{name:'Street',shape:'<path d="M12 9L16 13L20 7L24 13L28 9L26 17H14Z"/><path d="M20 3V7M17.5 4.5H22.5" fill="none"/>'},regal:{name:'Regal',shape:'<path d="M12 10L15 14L17 9L20 14L23 9L25 14L28 10L26 18H14Z"/><path d="M20 3V10M17 5H23" fill="none"/>'},runic:{name:'Runic',shape:'<path d="M20 3L25 8L20 15L15 8ZM12 11L15 15H25L28 11L26 19H14Z"/>'}};
 const crests={none:{name:'None',shape:''},diamond:{name:'Diamond',shape:'M20 22L23 26L20 29L17 26Z'},bolt:{name:'Spark',shape:'M21 21L17 26H20L19 30L24 24H21Z'},star:{name:'Star',shape:'M20 21L21.3 24L24.5 24.4L22 26.5L22.7 29.5L20 28L17.3 29.5L18 26.5L15.5 24.4L18.7 24Z'}};
 const designs=window.CrownfallPieceDesigns;
 const sizes={compact:{name:'Compact',scale:.82},balanced:{name:'Balanced',scale:.94},large:{name:'Large',scale:1.04},grand:{name:'Grand',scale:1.12}};
 const finishes={matte:{name:'Matte'},polished:{name:'Polished'},duo:{name:'Two-tone'}};
 const types={K:'King',Q:'Queen',R:'Rook',B:'Bishop',N:'Knight',P:'Pawn'};
 const defaults={name:'Crownrunner',palette:'gold',crown:'classic',crest:'none',pieceSet:'sculpted',size:'large',finish:'polished',pieces:{}};
 const clean=value=>{const v=value&&typeof value==='object'?value:{},pieces={};for(const t of Object.keys(types))if(v.pieces&&Object.hasOwn(designs.sets,v.pieces[t]))pieces[t]=v.pieces[t];return {name:typeof v.name==='string'?v.name.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,20)||defaults.name:defaults.name,palette:Object.hasOwn(palettes,v.palette)?v.palette:defaults.palette,crown:Object.hasOwn(crowns,v.crown)?v.crown:defaults.crown,crest:Object.hasOwn(crests,v.crest)?v.crest:defaults.crest,pieceSet:Object.hasOwn(designs.sets,v.pieceSet)?v.pieceSet:defaults.pieceSet,size:Object.hasOwn(sizes,v.size)?v.size:defaults.size,finish:Object.hasOwn(finishes,v.finish)?v.finish:defaults.finish,pieces};};
 const get=()=>{try{return clean(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{return {...defaults};}};
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const designId=(t,v=get())=>{const p=clean(v);return p.pieces[t]||p.pieceSet;};
 const shape=(v=get())=>crowns[clean(v).crown].shape+designs.kingBody(designId('K',v));
 const crest=(v=get())=>{const c=crests[clean(v).crest];return c.shape?`<path d="${c.shape}" fill="#25313a" stroke="none"/>`:'';};
 // Approved Comic ink: classic silhouettes, flat color, hard-edged shadows.
 function art(t,side='me',value=get(),material={}){
  const me=side!=='en',p=clean(me?value:{...defaults,pieceSet:'sculpted',size:'balanced',finish:'polished'}),id=designId(t,p),color=palettes[p.palette],fill=material.fill||(me?color.fill:'#7964b5'),stroke='#16111e',scale=sizes[p.size].scale;
  const outline=t==='K'?(me?crowns[p.crown].shape:crowns.classic.shape)+designs.kingBody(id):designs.outline(id,t),base=designs.base(id);
  const key=['comic',me?'me':'en',id,t,p.palette,p.crown,p.crest,p.finish,fill].join('-').replace(/[^a-z0-9-]/gi,'');
  const shade=me?color.accent:'#403266',shine=me?'#fff0b0':'#c9abe8',baseFill=p.finish==='duo'?shade:fill;
  const shadow=`<path d="M25 0H40V40H8L12 33H27L23 28L25 24L24 19L28 16L24 14Z" fill="${shade}"/>`;
  const highlight=p.finish==='matte'?'':`<path d="M15 12L17 10M16 25L17.5 22M12 33H24" fill="none" stroke="${shine}" stroke-width="1.7" stroke-linecap="round"/>`;
  return `<defs><clipPath id="${key}"><g>${outline}${base}</g></clipPath></defs><g class="piece-sculpture comic-ink" transform="translate(20 20) scale(${scale}) translate(-20 -20)" data-piece-design="${id}" data-piece-render="comic-ink"><g fill="${fill}" stroke="${stroke}" stroke-width="1.65" stroke-linejoin="round">${outline}</g><g fill="${baseFill}" stroke="${stroke}" stroke-width="1.65" stroke-linejoin="round">${base}</g><g clip-path="url(#${key})">${shadow}${highlight}</g><g fill="none" stroke="${stroke}" stroke-width="1.65" stroke-linejoin="miter">${outline}${base}</g>${t==='N'?`<circle cx="23" cy="12.5" r="1.05" fill="${stroke}"/>`:''}${t==='K'&&me?crest(p):''}</g>`;
 }
 const piece=(t,v=get(),map=false)=>`<svg xmlns="http://www.w3.org/2000/svg" class="character-piece${map?' king-piece':''}" data-piece-type="${t}" viewBox="0 0 40 40" ${map?'x="-19" y="-19" width="38" height="38"':'width="80" height="80"'} aria-hidden="true">${art(t,'me',v)}</svg>`;
 const svg=(v=get(),map=false)=>piece('K',v,map);
 function refresh(){const p=get();document.querySelectorAll('[data-character-token]').forEach(el=>{el.innerHTML=svg(p,el.dataset.characterToken==='map');});document.querySelectorAll('[data-character-name]').forEach(el=>el.textContent=p.name);document.querySelectorAll('.player-marker').forEach(el=>el.style.stroke=palettes[p.palette].accent);}
 function save(value){const p=clean(value);try{localStorage.setItem(KEY,JSON.stringify(p));}catch{return false;}refresh();window.dispatchEvent(new CustomEvent('crownfall-character-changed'));return true;}
 function open(){
  const existing=document.querySelector('.character-dialog');if(existing){existing.focus();return;}
  let draft=get();const before=document.activeElement,dialog=document.createElement('dialog');dialog.className='character-dialog';dialog.setAttribute('aria-labelledby','characterTitle');
  const options=(items,selected)=>Object.entries(items).map(([id,item])=>`<option value="${id}" ${id===selected?'selected':''}>${item.name}</option>`).join('');
  const field=(id,label,items,value)=>`<label class="look-select">${label}<select id="${id}">${options(items,value)}</select></label>`;
  dialog.innerHTML=`<form class="character-form"><header><div><small>YOUR ARMY</small><h2 id="characterTitle">Choose your look.</h2></div><button type="button" class="character-close" aria-label="Cancel customization">×</button></header>
   <div class="army-style-preview" aria-label="Your army preview"></div><p class="piece-hint">Changes apply to your pieces only.</p>
   ${field('armyStyle','Piece style',designs.sets,draft.pieceSet)}
   <p class="mixed-look-note" hidden>Individual piece styles are active. Choosing a set applies it to your whole army.</p>
   <fieldset class="look-colors"><legend>Army color</legend><div class="character-colors">${Object.entries(palettes).map(([id,color])=>`<button type="button" class="character-option" data-color="${id}" aria-label="${color.name}" title="${color.name}" style="--swatch:${color.fill}"><i class="character-swatch" aria-hidden="true"></i><span>${color.name}</span></button>`).join('')}</div></fieldset>
   ${field('armySize','Piece size',sizes,draft.size)}
   <details class="look-more"><summary>More options</summary>
    ${field('armyFinish','Finish',finishes,draft.finish)}
    <label class="character-name">Character name<input id="characterName" maxlength="20" autocomplete="off" value="${escape(draft.name)}"></label>
    ${field('kingCrown','King’s crown',crowns,draft.crown)}${field('kingCrest','King’s crest',crests,draft.crest)}
    <details class="look-individual"><summary>Individual piece styles</summary><p class="piece-hint">Leave a piece on “Army style” to follow your chosen set.</p>${Object.entries(types).map(([t,name])=>`<label class="look-select">${name}<select data-piece="${t}"><option value="">Army style</option>${options(designs.sets,draft.pieces[t])}</select></label>`).join('')}</details>
   </details>
   <footer><p class="character-status" role="alert" hidden></p><button type="button" class="character-cancel">Cancel</button><button type="submit" class="character-save">Save look</button></footer></form>`;
  const preview=()=>{
   dialog.querySelector('.army-style-preview').innerHTML=Object.entries(types).map(([t,name])=>`<span class="army-preview-piece">${piece(t,draft)}<span>${name}</span></span>`).join('');
   dialog.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===draft.palette)));
   dialog.querySelector('.mixed-look-note').hidden=!Object.keys(draft.pieces).length;
  };
  const close=()=>{dialog.close();dialog.remove();before?.focus({preventScroll:true});};
  dialog.querySelector('.character-close').onclick=close;dialog.querySelector('.character-cancel').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.querySelector('#armyStyle').onchange=e=>{draft.pieceSet=e.target.value;draft.pieces={};dialog.querySelectorAll('[data-piece]').forEach(select=>select.value='');preview();};
  for(const [id,key]of [['armySize','size'],['armyFinish','finish'],['kingCrown','crown'],['kingCrest','crest']])dialog.querySelector('#'+id).onchange=e=>{draft[key]=e.target.value;preview();};
  dialog.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{draft.palette=b.dataset.color;preview();});
  dialog.querySelector('#characterName').oninput=e=>{draft.name=e.target.value;};
  dialog.querySelectorAll('[data-piece]').forEach(select=>{select.value=draft.pieces[select.dataset.piece]||'';select.onchange=e=>{const t=e.target.dataset.piece;if(e.target.value)draft.pieces[t]=e.target.value;else delete draft.pieces[t];preview();};});
  dialog.querySelector('form').onsubmit=e=>{e.preventDefault();if(!save(draft)){const status=dialog.querySelector('.character-status');status.hidden=false;status.textContent='Your browser could not save this look. Try again.';return;}close();};
  document.body.append(dialog);preview();dialog.showModal();dialog.querySelector('.character-close').focus();
 }
 window.CrownfallCharacter={get,save,shape,crest,svg,piece,art,designId,palette:()=>palettes[get().palette],open};
 window.addEventListener('storage',e=>{if(!e.key||e.key.endsWith(KEY)){refresh();window.dispatchEvent(new CustomEvent('crownfall-character-changed'));}});
 document.addEventListener('DOMContentLoaded',refresh);
})();
