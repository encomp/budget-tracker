import{a as e,n as t}from"./chunk-DnJy8xQt.js";import{t as n}from"./iframe-DDZiR8S0.js";import{a as r,i,n as a,r as o,t as s}from"./dist-Ba0TRya2.js";import{t as c}from"./jsx-runtime-BX9360Lk.js";function l(){if(m||typeof document>`u`)return;let e=document.createElement(`style`);e.textContent=p,document.head.appendChild(e),m=!0}function u({value:e,min:t,max:n,step:s=1,onChange:c,variant:u=`standard`,disabled:p,className:m}){d.useEffect(()=>{l()},[]);let h=`${u===`premium`?`bp-slider-premium`:`bp-slider-standard`} ${m??``}`;return(0,f.jsxs)(o,{"data-slot":`slider`,className:`relative flex w-full touch-none items-center select-none ${h}`,min:t,max:n,step:s,value:[e],onValueChange:([e])=>c(e),disabled:p,children:[(0,f.jsx)(r,{"data-slot":`slider-track`,className:`relative grow overflow-hidden rounded-full data-horizontal:h-full data-horizontal:w-full`,children:(0,f.jsx)(a,{"data-slot":`slider-range`,className:`absolute data-horizontal:h-full`})}),(0,f.jsx)(i,{"data-slot":`slider-thumb`,className:`block shrink-0`})]})}var d,f,p,m,h=t((()=>{d=e(n(),1),s(),f=c(),p=`
.bp-slider-standard [data-slot="slider-track"] {
  height: 6px;
  background: var(--bp-bg-surface-alt);
  border-radius: var(--bp-radius-sm);
}
.bp-slider-standard [data-slot="slider-range"] {
  background: var(--bp-accent);
}
.bp-slider-standard [data-slot="slider-thumb"] {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bp-accent);
  border: 2px solid var(--bp-bg-surface);
  transition: all var(--bp-duration-fast) var(--bp-easing-default);
  outline: none;
  cursor: pointer;
}
.bp-slider-premium [data-slot="slider-track"] {
  height: 8px;
  background: var(--bp-bg-surface-alt);
  border-radius: var(--bp-radius-sm);
}
.bp-slider-premium [data-slot="slider-range"] {
  background: var(--bp-accent);
}
.bp-slider-premium [data-slot="slider-thumb"] {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bp-accent);
  border: none;
  transition: all var(--bp-duration-fast) var(--bp-easing-spring);
  outline: none;
  cursor: pointer;
}
.bp-slider-premium [data-slot="slider-thumb"]:focus,
.bp-slider-premium [data-slot="slider-thumb"]:active {
  transform: scale(1.15);
  box-shadow: 0 0 0 8px var(--bp-accent-glow);
}
`,m=!1,u.__docgenInfo={description:``,methods:[],displayName:`BpSlider`,props:{value:{required:!0,tsType:{name:`number`},description:``},min:{required:!0,tsType:{name:`number`},description:``},max:{required:!0,tsType:{name:`number`},description:``},step:{required:!1,tsType:{name:`number`},description:``,defaultValue:{value:`1`,computed:!1}},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: number) => void`,signature:{arguments:[{type:{name:`number`},name:`value`}],return:{name:`void`}}},description:``},variant:{required:!1,tsType:{name:`union`,raw:`'standard' | 'premium'`,elements:[{name:`literal`,value:`'standard'`},{name:`literal`,value:`'premium'`}]},description:``,defaultValue:{value:`'standard'`,computed:!1}},disabled:{required:!1,tsType:{name:`boolean`},description:``},className:{required:!1,tsType:{name:`string`},description:``}}}}));export{h as n,u as t};