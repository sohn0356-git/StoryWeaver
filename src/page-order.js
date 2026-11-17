import {normalizeBook,sceneArtwork,pageCompletion,isSceneComplete} from './book-model.js';
export function orderedLeaves(book){const b=normalizeBook(book);return b.spreads.flatMap((scene,index)=>{const page=b.pages.find(p=>p.id===scene.pageIds[0]);return (scene.layout===2?['spread']:['left','right']).map(side=>({id:`${scene.id}:${side}`,label:side==='spread'?`${index*2+1}–${index*2+2}쪽`:`${index*2+(side==='right'?2:1)}쪽`,scene,page,side,image:sceneArtwork(page)[side],text:side==='right'?page.rightText||'':page.text||'',done:pageCompletion(scene)[side]}))})}
export function reorderLeaves(book,sourceId,targetId){const leaves=orderedLeaves(book),from=leaves.findIndex(p=>p.id===sourceId),to=leaves.findIndex(p=>p.id===targetId);if(from<0||to<0||from===to)return {book,index:Math.max(0,book.spreads.findIndex(s=>sourceId.startsWith(s.id+':')))};const [moved]=leaves.splice(from,1);leaves.splice(to,0,moved);const spreads=[],pages=[],used=new Set();let selected=0;
 function pair(left,right){const reusable=!used.has(left.scene.id)&&left.scene.layout===1;const id=reusable?left.scene.id:crypto.randomUUID();used.add(id);const page={...left.page,id:reusable?left.page.id:crypto.randomUUID(),text:left.text,rightText:right?.text||'',image:'',extraImages:[],artwork:{left:left.image,right:right?.image||'',spread:sceneArtwork(left.page).spread},artworkModes:{left:true,right:true,spread:!!left.page.artworkModes?.spread}};const scene={...left.scene,id,layout:1,pageIds:[page.id],pageCompletion:{left:left.done,right:right?.done||false,spread:false}};scene.completed=isSceneComplete(scene);if(left.id===sourceId||right?.id===sourceId)selected=spreads.length;spreads.push(scene);pages.push(page)}
 for(let i=0;i<leaves.length;i++){const leaf=leaves[i];if(leaf.side==='spread'){used.add(leaf.scene.id);if(leaf.id===sourceId)selected=spreads.length;spreads.push(leaf.scene);pages.push(leaf.page)}else{const next=leaves[i+1];pair(leaf,next?.side!=='spread'?next:null);if(next&&next.side!=='spread')i++}}
 return {book:{...book,pages,spreads},index:selected};
}

// Keep the next wide image at its original page numbers when a single page is removed.
export function deleteLeaf(book,leafId){
 const b=normalizeBook(book),leaves=orderedLeaves(b),at=leaves.findIndex(p=>p.id===leafId);if(at<0)return {book,index:0};
 const selected=leaves[at],sceneIndex=b.spreads.findIndex(s=>s.id===selected.scene.id);
 if(selected.side==='spread'){
  const page={...selected.page,text:'',rightText:'',image:'',extraImages:[],artwork:{left:'',right:'',spread:''},artworkModes:{left:true,right:true,spread:true}};
  return {book:{...b,pages:b.pages.map(p=>p.id===page.id?page:p),spreads:b.spreads.map(s=>s.id===selected.scene.id?{...s,completed:false,pageCompletion:{left:false,right:false,spread:false}}:s)},index:sceneIndex};
 }
 let end=at;while(end+1<leaves.length&&leaves[end+1].side!=='spread')end++;
 const patches=new Map(),checks=new Map();
 for(let i=at;i<=end;i++){
  const slot=leaves[i],source=i<end?leaves[i+1]:null;
  const page=patches.get(slot.page.id)||{...slot.page,image:'',extraImages:[],artwork:{...sceneArtwork(slot.page)},artworkModes:{...slot.page.artworkModes}};
  page[slot.side==='left'?'text':'rightText']=source?.text||'';page.artwork[slot.side]=source?.image||'';page.artworkModes[slot.side]=true;patches.set(page.id,page);
  const done=checks.get(slot.scene.id)||{...pageCompletion(slot.scene)};done[slot.side]=!!source?.done;checks.set(slot.scene.id,done);
 }
 return {book:{...b,pages:b.pages.map(p=>patches.get(p.id)||p),spreads:b.spreads.map(s=>{if(!checks.has(s.id))return s;const scene={...s,pageCompletion:checks.get(s.id)};return {...scene,completed:isSceneComplete(scene)}})},index:sceneIndex};
}
export const pageRange=index=>`${index*2+1}–${index*2+2}쪽`;
