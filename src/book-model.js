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
export function setSpreadLayout(book,index,count){const b=normalizeBook(book);return {...b,spreads:b.spreads.map((s,i)=>i===index&&s.layout!==count?{...s,layout:count,completed:false}:s)}}
export function appendSpread(book,count=1){const b=normalizeBook(book),p=makePage();return {...b,pages:[...b.pages,p],spreads:[...b.spreads,{id:crypto.randomUUID(),layout:count,pageIds:[p.id]}]}}
export function mergeLibraries(local,remote){const map=new Map(local.map(b=>[b.id,b]));for(const b of remote){const old=map.get(b.id);if(!old||(b.updated||0)>(old.updated||0))map.set(b.id,b)}return [...map.values()].map(normalizeBook)}
export function setSpreadCompletion(book,index,completed){const b=normalizeBook(book);return {...b,spreads:b.spreads.map((s,i)=>i===index?{...s,completed:!!completed}:s)}}
