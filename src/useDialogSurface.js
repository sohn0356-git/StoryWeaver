import {useEffect,useRef} from 'react';
let locks=0,originalOverflow='';
export default function useDialogSurface(ref,onClose,enabled=true){
 const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{if(!enabled||!ref.current)return;const root=ref.current,previous=document.activeElement;if(locks===0)originalOverflow=document.body.style.overflow;locks++;document.body.style.overflow='hidden';root.querySelector('button:not(:disabled)')?.focus();
 const key=e=>{const overlays=[...document.querySelectorAll('[data-overlay-open="true"]')];if(overlays.at(-1)!==root)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close.current();return}if(e.key!=='Tab')return;const nodes=[...root.querySelectorAll('button,[tabindex="0"]')].filter(n=>!n.disabled&&n.getClientRects().length);if(!nodes.length){e.preventDefault();return}const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&(document.activeElement===first||!root.contains(document.activeElement))){e.preventDefault();last.focus()}else if(!e.shiftKey&&(document.activeElement===last||!root.contains(document.activeElement))){e.preventDefault();first.focus()}};
 window.addEventListener('keydown',key,true);return()=>{window.removeEventListener('keydown',key,true);locks=Math.max(0,locks-1);document.body.style.overflow=locks?'hidden':originalOverflow;if(previous?.isConnected)previous.focus()};
 },[enabled]);
}
