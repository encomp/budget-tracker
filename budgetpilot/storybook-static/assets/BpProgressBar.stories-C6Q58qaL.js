import{n as e}from"./chunk-DnJy8xQt.js";import{t}from"./iframe-tWz5sYml.js";import{t as n}from"./jsx-runtime-BX9360Lk.js";function r(e){return e>=100?`var(--bp-danger)`:e>=85?`var(--bp-warning)`:`var(--bp-positive)`}function i({value:e,label:t,showValue:n=!1,className:i}){let o=Math.min(e,100),s=r(e);return(0,a.jsxs)(`div`,{className:i,style:{width:`100%`},children:[(t||n)&&(0,a.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,marginBottom:`4px`,fontSize:`12px`,color:`var(--bp-text-secondary)`,fontFamily:`var(--bp-font-ui)`},children:[t&&(0,a.jsx)(`span`,{children:t}),n&&(0,a.jsxs)(`span`,{children:[e,`%`]})]}),(0,a.jsx)(`div`,{style:{background:`var(--bp-bg-surface-alt)`,borderRadius:`var(--bp-radius-sm)`,height:`8px`,overflow:`hidden`},children:(0,a.jsx)(`div`,{style:{width:`${o}%`,height:`100%`,background:s,borderRadius:`var(--bp-radius-sm)`,transition:`width var(--bp-duration-normal) var(--bp-easing-default)`}})})]})}var a,o=e((()=>{t(),a=n(),i.__docgenInfo={description:``,methods:[],displayName:`BpProgressBar`,props:{value:{required:!0,tsType:{name:`number`},description:``},label:{required:!1,tsType:{name:`string`},description:``},showValue:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},className:{required:!1,tsType:{name:`string`},description:``}}}})),s,c,l,u,d,f,p,m,h,g;e((()=>{o(),s=n(),c={title:`BudgetPilot/BpProgressBar`,component:i,parameters:{layout:`centered`},decorators:[e=>(0,s.jsx)(`div`,{style:{width:`300px`},children:(0,s.jsx)(e,{})})]},l={args:{value:0,label:`No spending`,showValue:!0}},u={args:{value:45,label:`Groceries`,showValue:!0}},d={args:{value:72,label:`Transport`,showValue:!0}},f={args:{value:88,label:`Dining`,showValue:!0}},p={args:{value:100,label:`Entertainment`,showValue:!0}},m={args:{value:120,label:`Shopping`,showValue:!0}},h={render:()=>(0,s.jsxs)(`div`,{style:{width:`300px`,display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,s.jsx)(i,{value:0,label:`0% — empty`,showValue:!0}),(0,s.jsx)(i,{value:45,label:`45% — healthy (teal)`,showValue:!0}),(0,s.jsx)(i,{value:72,label:`72% — healthy (teal)`,showValue:!0}),(0,s.jsx)(i,{value:88,label:`88% — warning (amber)`,showValue:!0}),(0,s.jsx)(i,{value:100,label:`100% — over (red)`,showValue:!0}),(0,s.jsx)(i,{value:120,label:`120% — over (red)`,showValue:!0})]})},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    value: 0,
    label: 'No spending',
    showValue: true
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    value: 45,
    label: 'Groceries',
    showValue: true
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    value: 72,
    label: 'Transport',
    showValue: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    value: 88,
    label: 'Dining',
    showValue: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    value: 100,
    label: 'Entertainment',
    showValue: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    value: 120,
    label: 'Shopping',
    showValue: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
      <BpProgressBar value={0} label="0% — empty" showValue />
      <BpProgressBar value={45} label="45% — healthy (teal)" showValue />
      <BpProgressBar value={72} label="72% — healthy (teal)" showValue />
      <BpProgressBar value={88} label="88% — warning (amber)" showValue />
      <BpProgressBar value={100} label="100% — over (red)" showValue />
      <BpProgressBar value={120} label="120% — over (red)" showValue />
    </div>
}`,...h.parameters?.docs?.source}}},g=[`Zero`,`Healthy`,`Normal`,`Warning`,`AtLimit`,`Over`,`AllStates`]}))();export{h as AllStates,p as AtLimit,u as Healthy,d as Normal,m as Over,f as Warning,l as Zero,g as __namedExportsOrder,c as default};