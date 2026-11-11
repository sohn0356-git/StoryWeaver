// Run with Firestore emulator only; this never connects to the production project.
import test from 'node:test';
import assert from 'node:assert/strict';
import {initializeApp,deleteApp} from 'firebase/app';
import {getFirestore,connectFirestoreEmulator,getDoc,doc} from 'firebase/firestore';
import {connectCloudLibrary} from '../src/cloud-library.js';
const projectId='demo-storyweaver';
function client(name,uid){const app=initializeApp({projectId,apiKey:'fake',appId:'fake'},name);const db=getFirestore(app);connectFirestoreEmulator(db,'127.0.0.1',8080,{mockUserToken:{sub:uid,user_id:uid}});return{app,db}}
const waitFor=async condition=>{const deadline=Date.now()+15000;while(!condition()){if(Date.now()>deadline)throw Error('Timed out waiting for synchronization');await new Promise(r=>setTimeout(r,30))}};
test('two isolated clients sync text, images, layouts, updates and deletion; other accounts cannot read',async()=>{
 assert.ok(process.env.FIRESTORE_EMULATOR_HOST,'Run via firebase emulators:exec');
 const a=client('device-a','alice'),b=client('device-b','alice'),intruder=client('other-user','bob');
 let receivedA=[],receivedB=[],readyA=false,readyB=false;const errors=[];
 const ca=connectCloudLibrary('alice',{onBooks:books=>receivedA.push(...books),onStatus:s=>{if(s==='ready')readyA=true},onError:e=>errors.push(e)},a.db);
 const cb=connectCloudLibrary('alice',{onBooks:books=>receivedB.push(...books),onStatus:s=>{if(s==='ready')readyB=true},onError:e=>errors.push(e)},b.db);
 try{
  await waitFor(()=>readyA&&readyB);
  const book={id:'cross-device',updated:1,title:'다른 PC의 책',pages:[{id:'p',text:'계정으로 이어쓰기',image:'data:image/jpeg;base64,'+'x'.repeat(1800000)}],spreads:[{id:'s',pageIds:['p']}]};
  await ca.save(book);await waitFor(()=>receivedB.some(x=>x.id===book.id));assert.deepEqual(receivedB.find(x=>x.id===book.id),book);
  const newer={...book,updated:2,title:'PC B에서 수정'};await cb.save(newer);await waitFor(()=>receivedA.some(x=>x.updated===2));assert.equal(receivedA.find(x=>x.updated===2).title,newer.title);
  await assert.rejects(getDoc(doc(intruder.db,'users','alice','books',book.id)),e=>e.code==='permission-denied');
  const fresh=client('fresh-pc','alice');let restored=[];const cc=connectCloudLibrary('alice',{onBooks:books=>restored.push(...books),onStatus:()=>{},onError:e=>errors.push(e)},fresh.db);
  try{await waitFor(()=>restored.some(x=>x.updated===2));assert.equal(restored.find(x=>x.updated===2).pages[0].image,book.pages[0].image)}finally{cc.close();await deleteApp(fresh.app)}
  await ca.save({id:book.id,deleted:true,updated:3});await waitFor(()=>receivedB.some(x=>x.deleted));assert.equal(errors.length,0);
 }finally{ca.close();cb.close();await Promise.all([a,b,intruder].map(c=>deleteApp(c.app)))}
});
