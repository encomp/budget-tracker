import{n as e}from"./chunk-DnJy8xQt.js";import{t}from"./jsx-runtime-BX9360Lk.js";function n(e){return e>=100?`var(--bp-danger)`:e>=85?`var(--bp-warning)`:`var(--bp-positive)`}function r({value:e,label:t,showValue:r=!1,className:a}){let o=Math.min(e,100),s=n(e);return(0,i.jsxs)(`div`,{className:a,style:{width:`100%`},children:[(t||r)&&(0,i.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,marginBottom:`4px`,fontSize:`12px`,color:`var(--bp-text-secondary)`,fontFamily:`var(--bp-font-ui)`},children:[t&&(0,i.jsx)(`span`,{children:t}),r&&(0,i.jsxs)(`span`,{children:[e,`%`]})]}),(0,i.jsx)(`div`,{style:{background:`var(--bp-bg-surface-alt)`,borderRadius:`var(--bp-radius-sm)`,height:`8px`,overflow:`hidden`},children:(0,i.jsx)(`div`,{style:{width:`${o}%`,height:`100%`,background:s,borderRadius:`var(--bp-radius-sm)`,transition:`width var(--bp-duration-normal) var(--bp-easing-default)`}})})]})}var i,a=e((()=>{i=t(),r.__docgenInfo={description:``,methods:[],displayName:`BpProgressBar`,props:{value:{required:!0,tsType:{name:`number`},description:``},label:{required:!1,tsType:{name:`string`},description:``},showValue:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},className:{required:!1,tsType:{name:`string`},description:``}}}})),o,s,c,l,u,d,f,p,m,h;e((()=>{a(),o=t(),s={title:`BudgetPilot/BpProgressBar`,component:r,parameters:{layout:`centered`},decorators:[e=>(0,o.jsx)(`div`,{style:{width:`300px`},children:(0,o.jsx)(e,{})})]},c={args:{value:0,label:`No spending`,showValue:!0}},l={args:{value:45,label:`Groceries`,showValue:!0}},u={args:{value:72,label:`Transport`,showValue:!0}},d={args:{value:88,label:`Dining`,showValue:!0}},f={args:{value:100,label:`Entertainment`,showValue:!0}},p={args:{value:120,label:`Shopping`,showValue:!0}},m={render:()=>(0,o.jsxs)(`div`,{style:{width:`300px`,display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,o.jsx)(r,{value:0,label:`0% — empty`,showValue:!0}),(0,o.jsx)(r,{value:45,label:`45% — healthy (teal)`,showValue:!0}),(0,o.jsx)(r,{value:72,label:`72% — healthy (teal)`,showValue:!0}),(0,o.jsx)(r,{value:88,label:`88% — warning (amber)`,showValue:!0}),(0,o.jsx)(r,{value:100,label:`100% — over (red)`,showValue:!0}),(0,o.jsx)(r,{value:120,label:`120% — over (red)`,showValue:!0})]})},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    value: 0,
    label: 'No spending',
    showValue: true
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    value: 45,
    label: 'Groceries',
    showValue: true
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    value: 72,
    label: 'Transport',
    showValue: true
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    value: 88,
    label: 'Dining',
    showValue: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    value: 100,
    label: 'Entertainment',
    showValue: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    value: 120,
    label: 'Shopping',
    showValue: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h=[`Zero`,`Healthy`,`Normal`,`Warning`,`AtLimit`,`Over`,`AllStates`]}))();export{m as AllStates,f as AtLimit,l as Healthy,u as Normal,p as Over,d as Warning,c as Zero,h as __namedExportsOrder,s as default};