export const PAGE_FORMATS={
 1:{label:'단면 · 1페이지',width:182,height:254,ratio:'182:254'},
 2:{label:'펼침 · 2페이지 한 장',width:358,height:254,ratio:'358:254'}
};
export const makePage=()=>({id:crypto.randomUUID(),text:'',image:'',caption:''});
export function normalizeBook(book){
 if(book.deleted)return book;
 const sourcePages=book.pages?.length?book.pages:[makePage()];
 if(book.canvasVersion===1&&book.spreads?.length&&book.spreads.every(s=>s.pageIds.length===1))return {...book,pages:sourcePages};
 let sourceSpreads=book.spreads;
 if(!sourceSpreads?.length){const stride=book.layout===2?2:1;sourceSpreads=[];for(let i=0;i<sourcePages.length;i+=stride)sourceSpreads.push({id:`spread-${sourcePages[i].id}`,pageIds:sourcePages.slice(i,i+stride).map(p=>p.id)})}
 const pages=[],spreads=[];
 for(const scene of sourceSpreads){
  const original=scene.pageIds.map(id=>sourcePages.find(p=>p.id===id)).filter(Boolean);
  const first=original[0]||makePage();
  const images=original.flatMap(p=>[p.image,...(p.extraImages||[])]).filter(Boolean);
  const merged={...first,text:original.map(p=>p.text||'').filter(Boolean).join('\n\n'),image:images[0]||'',extraImages:images.slice(1),caption:original.map(p=>p.caption||'').filter(Boolean).join(' / ')};
  pages.push(merged);spreads.push({...scene,pageIds:[merged.id],layout:scene.layout===2||scene.pageIds.length>1?2:1});
 }
 return {...book,canvasVersion:1,pages,spreads};
}
export function setSpreadLayout(book,index,count){const b=normalizeBook(book),scene=b.spreads[index];if(!scene||scene.layout===count)return b;const id=scene.pageIds[0];const pages=b.pages.map(p=>{if(p.id!==id)return p;const art=sceneArtwork(p),target=count===2?'spread':'left',source=count===2?'left':'spread';return !art[target]&&!p.artworkModes?.[target]&&art[source]?setSceneArtwork(p,{[target]:art[source]}):p});return {...b,pages,spreads:b.spreads.map((s,i)=>i===index?{...s,layout:count,completed:false}:s)}}
export function appendSpread(book,count=1){const b=normalizeBook(book),p=makePage();return {...b,pages:[...b.pages,p],spreads:[...b.spreads,{id:crypto.randomUUID(),layout:count,pageIds:[p.id]}]}}
export function mergeLibraries(local,remote){const map=new Map(local.map(b=>[b.id,b]));for(const b of remote){const old=map.get(b.id);if(!old||(b.updated||0)>(old.updated||0))map.set(b.id,b)}return ensureShelfOrder([...map.values()].map(normalizeBook))}
export function setSpreadCompletion(book,index,completed){const b=normalizeBook(book);return {...b,spreads:b.spreads.map((s,i)=>i===index?{...s,completed:!!completed}:s)}}

export function sortLibrary(books){return books.filter(b=>!b.deleted).map((book,index)=>({book,index})).sort((a,b)=>(a.book.shelfOrder??a.index)-(b.book.shelfOrder??b.index)||a.book.id.localeCompare(b.book.id)||a.index-b.index).map(x=>x.book)}
export function ensureShelfOrder(books){let next=Math.max(-1,...books.filter(b=>Number.isFinite(b.shelfOrder)).map(b=>b.shelfOrder))+1;return books.map(b=>b.deleted||Number.isFinite(b.shelfOrder)?b:{...b,shelfOrder:next++})}
export function moveLibraryBook(books,sourceId,targetId,now=Date.now()){
 const ordered=sortLibrary(books),from=ordered.findIndex(b=>b.id===sourceId),to=ordered.findIndex(b=>b.id===targetId);
 if(from<0||to<0||from===to)return books;
 const [moved]=ordered.splice(from,1);ordered.splice(to,0,moved);
 const stamp=Math.max(now,...ordered.map(b=>b.updated||0))+1;
 return [...ordered.map((b,i)=>b.shelfOrder===i?b:{...b,shelfOrder:i,updated:stamp}),...books.filter(b=>b.deleted)];
}

export function sceneArtwork(page){return page.artwork?{left:'',right:'',spread:'',...page.artwork}:{left:page.image||'',right:page.extraImages?.[0]||'',spread:page.image||''}}
export function setSceneArtwork(page,patch){return {...page,artwork:{...sceneArtwork(page),...patch},artworkModes:{...page.artworkModes,...Object.fromEntries(Object.keys(patch).map(key=>[key,true]))}}}
