import React,{useState} from 'react';
import {ImagePlus,Images,Upload,X,Check} from 'lucide-react';
import {sceneArtwork,setSceneArtwork} from './book-model';
const ACCEPT='image/png,image/jpeg,image/webp,image/gif';

export default function BookSceneEditor({page,layout,index,onChange,onUpload,completion,onToggleCompleted,onZoom}){
 const [uploading,setUploading]=useState(false);
 const artwork=sceneArtwork(page),wide=layout===2;
 async function select(files,target){if(!files?.length||uploading)return;setUploading(true);try{await onUpload(page.id,Array.from(files),!wide&&files.length===2?'pair':target)}finally{setUploading(false)}}
 const slots=wide?[{key:'spread',label:'펼침',image:artwork.spread,text:page.text||'',textKey:'text',width:358}]:[{key:'left',label:'왼쪽',image:artwork.left,text:page.text||'',textKey:'text',width:182},{key:'right',label:'오른쪽',image:artwork.right,text:page.rightText||'',textKey:'rightText',width:182}];
 return <div className="book-composer">
 {!wide&&<div className="pair-upload-row"><span>왼쪽과 오른쪽에 이미지를 넣어주세요.</span><label className={'pair-upload '+(uploading?'disabled':'')}><Images size={16}/>{uploading?'업로드 중…':'이미지 2장 업로드'}<input aria-label="좌우 이미지 2장 업로드" type="file" multiple accept={ACCEPT} disabled={uploading} onChange={e=>{select(e.target.files,'pair');e.target.value=''}}/></label></div>}
 <div className={'open-book '+(wide?'wide-artwork':'separate-artworks')} aria-label={wide?'펼침 이미지 한 장':'왼쪽 오른쪽 두 페이지'}>
 {slots.map(slot=><section className="book-leaf" key={slot.key} aria-label={`${slot.label} 페이지`}><div className="leaf-heading"><span>{slot.label}{wide?' · 2페이지 한 장':' · 1페이지'}</span><small>{slot.width} × 254mm</small><button className={'leaf-completion '+(completion[slot.key]?'is-complete':'')} aria-label={`${slot.label} 페이지 ${completion[slot.key]?'완료 해제':'완료로 표시'}`} title={`${slot.label} 페이지 ${completion[slot.key]?'완료 해제':'완료로 표시'}`} aria-pressed={!!completion[slot.key]} onClick={()=>onToggleCompleted(slot.key)}><Check size={18}/></button></div><article className="book-sheet" style={{aspectRatio:`${slot.width} / 254`}} data-width-mm={slot.width} data-height-mm="254">
 <div className="artwork-frame" aria-busy={uploading} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();select(e.dataTransfer.files,slot.key)}}>
 {slot.image?<><button className="artwork-zoom" aria-label={`${slot.label} 사진 확대`} onClick={()=>onZoom({src:slot.image,alt:`${slot.label} 이미지`})}><img className="uploaded-artwork" src={slot.image} alt={`${slot.label} 이미지`}/></button><div className="artwork-actions"><label className="artwork-replace" title={`${slot.label} 이미지 변경`}><Upload size={15}/><input aria-label={`${slot.label} 이미지 변경`} type="file" accept={ACCEPT} disabled={uploading} onChange={e=>{select(e.target.files,slot.key);e.target.value=''}}/></label><button aria-label={`${slot.label} 이미지 삭제`} disabled={uploading} onClick={()=>onChange(page.id,p=>setSceneArtwork(p,{[slot.key]:''}))}><X size={17}/></button></div></>:<label className="artwork-placeholder"><ImagePlus size={28}/><span>{uploading?'이미지 준비 중…':wide?'양쪽을 채우는 이미지':`${slot.label} 이미지`}</span><small>{wide?'한 장이 왼쪽·오른쪽을 모두 차지해요':'눌러서 업로드'}</small><input aria-label={`${slot.label} 이미지 업로드`} type="file" accept={ACCEPT} disabled={uploading} onChange={e=>{select(e.target.files,slot.key);e.target.value=''}}/></label>}
 </div></article><textarea className="leaf-description" aria-label={`${index+1}번째 장면 ${slot.label} 설명`} placeholder={wide?'펼침 이미지 아래에 설명을 적어주세요…':`${slot.label} 이미지 아래 설명…`} value={slot.text} onChange={e=>onChange(page.id,{[slot.textKey]:e.target.value})}/>
 </section>)}
 </div></div>;
}
