import React,{useLayoutEffect,useRef,useState} from 'react';

export default function PageTurn({pageKey,direction,children}){
 const previous=useRef({key:pageKey,children}),timer=useRef(null);
 const [turn,setTurn]=useState(null);
 useLayoutEffect(()=>{
  const old=previous.current;
  if(old.key!==pageKey){
   clearTimeout(timer.current);
   if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){setTurn({children:old.children,direction:direction<0?'previous':'next',key:pageKey});timer.current=setTimeout(()=>setTurn(null),460)}else setTurn(null);
  }
  previous.current={key:pageKey,children};
  return()=>clearTimeout(timer.current);
 },[pageKey]);
 useLayoutEffect(()=>{previous.current={key:pageKey,children}},[children,pageKey]);
 return <div className={`page-turn-stage ${turn?'is-turning turn-'+turn.direction:''}`} data-page-key={pageKey}><div className="page-turn-current">{children}</div>{turn&&<div className="page-turn-outgoing" key={turn.key} aria-hidden="true" inert><div className="page-turn-snapshot">{turn.children}</div></div>}</div>;
}
