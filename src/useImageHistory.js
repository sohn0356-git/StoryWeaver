import {useLayoutEffect,useRef} from 'react';
const MARKER='__storyweaverImageOverlay';

export default function useImageHistory(onClose){
 const close=useRef(onClose),entry=useRef(null);close.current=onClose;
 useLayoutEffect(()=>{
  const existing=history.state?.[MARKER];const current={id:typeof existing==='string'?existing:crypto.randomUUID(),pushed:typeof existing==='string',requested:false,closed:false};entry.current=current;
  const pop=()=>{if(!current.closed&&history.state?.[MARKER]!==current.id){current.closed=true;close.current()}};
  window.addEventListener('popstate',pop);
  try{if(!current.pushed){const state=history.state;history.pushState({...((state&&typeof state==='object')?state:{}),[MARKER]:current.id},'',location.href);current.pushed=true}}catch{}
  return()=>{window.removeEventListener('popstate',pop);if(entry.current===current)entry.current=null;queueMicrotask(()=>{if(!entry.current&&current.pushed&&!current.closed&&!current.requested&&history.state?.[MARKER]===current.id){current.requested=true;history.back()}})};
 },[]);
 return ()=>{const current=entry.current;if(current?.requested||current?.closed)return;if(current?.pushed&&history.state?.[MARKER]===current.id){current.requested=true;history.back()}else{if(current)current.closed=true;close.current()}};
}
