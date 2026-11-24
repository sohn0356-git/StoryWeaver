import {zipSync} from 'fflate';
import {orderedLeaves} from './page-order.js';
export const safeBookName=title=>(title||'StoryWeaver').replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').trim().slice(0,100)||'StoryWeaver';
export async function createImageArchive(book,onProgress=()=>{}){
 const leaves=orderedLeaves(book).filter(leaf=>leaf.image);if(!leaves.length)throw Error('다운로드할 이미지가 없습니다.');
 const files={},title=safeBookName(book.title);let completed=0;
 for(const leaf of leaves){const response=await fetch(leaf.image);if(!response.ok)throw Error(`${leaf.label} 이미지를 읽지 못했습니다.`);const blob=await response.blob(),extension=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'})[blob.type]||'jpg';const number=leaf.label.replace('쪽','').replace('–','-');files[`${title}_${number.split('-').map(n=>n.padStart(3,'0')).join('-')}쪽.${extension}`]=new Uint8Array(await blob.arrayBuffer());onProgress(++completed,leaves.length)}
 return new Blob([zipSync(files,{level:0})],{type:'application/zip'});
}
