export const makePage=()=>({id:crypto.randomUUID(),text:'',image:'',caption:''});
export function normalizeBook(book){
 if(book.deleted)return book;
 const pages=book.pages?.length?book.pages:[makePage()];
 if(book.spreads?.length)return {...book,pages};
 const stride=book.layout===2?2:1;
 const spreads=[];
 for(let i=0;i<pages.length;i+=stride)spreads.push({id:`spread-${pages[i].id}`,pageIds:pages.slice(i,i+stride).map(p=>p.id)});
 return {...book,pages,spreads};
}
export function setSpreadLayout(book,index,count){
 const b=normalizeBook(book),spreads=b.spreads.map(s=>({...s,pageIds:[...s.pageIds]})),pages=[...b.pages],s=spreads[index];
 if(!s||s.pageIds.length===count)return b;
 if(count===2){const p=makePage();pages.push(p);s.pageIds.push(p.id)}
 else {const extra=s.pageIds.splice(1);spreads.splice(index+1,0,...extra.map(id=>({id:crypto.randomUUID(),pageIds:[id]})))}
 return {...b,spreads,pages};
}
export function appendSpread(book,count=1){const b=normalizeBook(book),pages=Array.from({length:count},makePage);return {...b,pages:[...b.pages,...pages],spreads:[...b.spreads,{id:crypto.randomUUID(),pageIds:pages.map(p=>p.id)}]}}
export function mergeLibraries(local,remote){const map=new Map(local.map(b=>[b.id,b]));for(const b of remote){const old=map.get(b.id);if(!old||(b.updated||0)>(old.updated||0))map.set(b.id,b)}return [...map.values()].map(normalizeBook)}
