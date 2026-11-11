import {getFirestore,collection,doc,onSnapshot,getDocs,writeBatch} from 'firebase/firestore';
import {firebaseApp} from './firebase.js';
// Keep JSON chunks well below Firestore's 1 MiB document limit, including UTF-8 text.
const CHUNK_SIZE=180000;
export function chunkBook(book){const json=JSON.stringify(book),chunks=[];for(let start=0;start<json.length;){let end=Math.min(start+CHUNK_SIZE,json.length);const code=json.charCodeAt(end-1);if(end<json.length&&code>=0xD800&&code<=0xDBFF)end--;chunks.push(json.slice(start,end));start=end}return chunks}
export function connectCloudLibrary(uid,{onBooks,onStatus,onError},database=getFirestore(firebaseApp)){
 const db=database,root=collection(db,'users',uid,'books');
 let closed=false,chain=Promise.resolve(),known=new Map();
 const stop=onSnapshot(root,{includeMetadataChanges:true},snap=>{
  if(snap.metadata.fromCache)return;
  chain=chain.then(async()=>{
   const books=[];
   for(const snapshot of snap.docs){
    const meta=snapshot.data();
    if(known.get(snapshot.id)===meta.revision)continue;
    if(meta.deleted){known.set(snapshot.id,meta.revision);books.push({id:snapshot.id,updated:meta.updated,deleted:true});continue}
    const chunks=await getDocs(collection(snapshot.ref,'revisions',meta.revision,'chunks'));
    const sorted=chunks.docs.map(d=>d.data()).sort((a,b)=>a.index-b.index);
    if(sorted.length!==meta.chunks)throw new Error('incomplete-cloud-book');
    const book=JSON.parse(sorted.map(c=>c.text).join(''));
    known.set(book.id,meta.revision);books.push(book);
   }
   if(!closed){onBooks(books);onStatus('ready')}
  }).catch(e=>{if(!closed)onError(e)});
 },e=>{if(!closed)onError(e)});
 return {close(){closed=true;stop()},save(book){
  const task=chain.then(async()=>{
   if(closed)return;
   onStatus('uploading');
   const ref=doc(root,book.id),revision=crypto.randomUUID();let batch=writeBatch(db);
   if(book.deleted){batch.set(ref,{deleted:true,updated:book.updated,revision,chunks:0})}
   else{
    const parts=chunkBook(book),chunks=parts.length;
    if(chunks>450)throw new Error('cloud-book-too-large');
    for(let i=0;i<chunks;i++){batch.set(doc(ref,'revisions',revision,'chunks',String(i)),{index:i,text:parts[i]});if((i+1)%8===0){await batch.commit();batch=writeBatch(db)}}
    batch.set(ref,{deleted:false,updated:book.updated,revision,chunks});
   }
   await batch.commit();known.set(book.id,revision);
  });
  chain=task.catch(()=>{});return task;
 }};
}
export function cloudErrorMessage(error){
 if(error.code==='permission-denied')return '계정 동기화 권한이 없습니다. Firestore 데이터베이스와 보안 규칙을 확인해 주세요.';
 if(error.code==='unavailable')return '서버에 연결할 수 없습니다. 이 기기에 저장한 뒤 연결 시 다시 동기화합니다.';
 return '계정 동기화에 실패했습니다. Firestore 활성화와 보안 규칙을 확인해 주세요.';
}
