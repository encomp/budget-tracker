import{a as e,n as t}from"./chunk-DnJy8xQt.js";import{t as n}from"./iframe-DDZiR8S0.js";import{t as r}from"./jsx-runtime-BX9360Lk.js";import{C as i,f as a,t as o,v as s}from"./lucide-react-DKLvfevW.js";function c(){if(p||typeof document>`u`)return;let e=document.createElement(`style`);e.textContent=f,document.head.appendChild(e),p=!0}function l({type:e,size:t=20,className:n}){return u.useEffect(()=>{c()},[]),e===`LoaderCircle`?(0,d.jsx)(a,{size:t,className:`bp-icon-loading ${n??``}`}):e===`CheckCircle`?(0,d.jsx)(s,{size:t,className:`bp-icon-check ${n??``}`}):(0,d.jsx)(i,{size:t,className:`bp-icon-bell ${n??``}`})}var u,d,f,p,m=t((()=>{u=e(n(),1),o(),d=r(),f=`
@keyframes bp-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes bp-check-draw {
  from { stroke-dashoffset: 100; opacity: 0; }
  to   { stroke-dashoffset: 0;   opacity: 1; }
}
@keyframes bp-bell-ring {
  0%, 100% { transform: rotate(0deg); }
  25%       { transform: rotate(15deg); }
  75%       { transform: rotate(-15deg); }
}
.bp-icon-loading { animation: bp-spin 1s linear infinite; }
.bp-icon-check circle, .bp-icon-check path {
  stroke-dasharray: 100;
  animation: bp-check-draw 0.4s var(--bp-easing-default) forwards;
}
.bp-icon-bell { animation: bp-bell-ring 0.6s var(--bp-easing-bounce) infinite; }
`,p=!1,l.__docgenInfo={description:``,methods:[],displayName:`AnimatedIcon`,props:{type:{required:!0,tsType:{name:`union`,raw:`'LoaderCircle' | 'CheckCircle' | 'BellRing'`,elements:[{name:`literal`,value:`'LoaderCircle'`},{name:`literal`,value:`'CheckCircle'`},{name:`literal`,value:`'BellRing'`}]},description:``},size:{required:!1,tsType:{name:`number`},description:``,defaultValue:{value:`20`,computed:!1}},className:{required:!1,tsType:{name:`string`},description:``}}}}));export{m as n,l as t};