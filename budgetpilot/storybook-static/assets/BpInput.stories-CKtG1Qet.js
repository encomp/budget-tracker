import{a as e,n as t}from"./chunk-DnJy8xQt.js";import{t as n}from"./iframe-DDZiR8S0.js";import{t as r}from"./jsx-runtime-BX9360Lk.js";function i({mono:e=!1,error:t,label:n,id:r,className:i,style:s,...c}){let[l,u]=a.useState(!1),d=r??n?.toLowerCase().replace(/\s+/g,`-`),f={width:`100%`,background:`var(--bp-bg-surface-alt)`,border:`1px solid ${t?`var(--bp-danger)`:l?`var(--bp-accent)`:`var(--bp-border)`}`,borderRadius:`var(--bp-radius-sm)`,color:`var(--bp-text-primary)`,fontFamily:e?`var(--bp-font-mono)`:`var(--bp-font-ui)`,fontSize:`14px`,padding:`8px 12px`,outline:`none`,boxShadow:l&&!t?`0 0 0 2px var(--bp-accent-muted)`:`none`,transition:`all var(--bp-duration-fast) var(--bp-easing-default)`,...s};return(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},className:i,children:[n&&(0,o.jsx)(`label`,{htmlFor:d,style:{fontSize:`13px`,color:`var(--bp-text-secondary)`,fontFamily:`var(--bp-font-ui)`},children:n}),(0,o.jsx)(`input`,{id:d,style:f,onFocus:()=>u(!0),onBlur:()=>u(!1),...c}),t&&(0,o.jsx)(`span`,{style:{fontSize:`12px`,color:`var(--bp-danger)`,fontFamily:`var(--bp-font-ui)`},children:t})]})}var a,o,s=t((()=>{a=e(n(),1),o=r(),i.__docgenInfo={description:``,methods:[],displayName:`BpInput`,props:{mono:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},error:{required:!1,tsType:{name:`string`},description:``},label:{required:!1,tsType:{name:`string`},description:``}}}})),c,l,u,d,f,p,m,h;t((()=>{s(),c=r(),l={title:`BudgetPilot/BpInput`,component:i,parameters:{layout:`centered`},decorators:[e=>(0,c.jsx)(`div`,{style:{width:`300px`},children:(0,c.jsx)(e,{})})]},u={args:{placeholder:`Enter text...`}},d={args:{label:`Transaction name`,placeholder:`e.g. Grocery store`}},f={args:{label:`Amount`,mono:!0,placeholder:`0.00`,type:`number`}},p={args:{label:`Amount`,mono:!0,placeholder:`0.00`,error:`Amount must be greater than 0`,value:`-5`,readOnly:!0}},m={args:{label:`Locked field`,value:`Cannot edit`,disabled:!0,readOnly:!0}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Enter text...'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Transaction name',
    placeholder: 'e.g. Grocery store'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Amount',
    mono: true,
    placeholder: '0.00',
    type: 'number'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Amount',
    mono: true,
    placeholder: '0.00',
    error: 'Amount must be greater than 0',
    value: '-5',
    readOnly: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Locked field',
    value: 'Cannot edit',
    disabled: true,
    readOnly: true
  }
}`,...m.parameters?.docs?.source}}},h=[`Default`,`WithLabel`,`Mono`,`WithError`,`Disabled`]}))();export{u as Default,m as Disabled,f as Mono,p as WithError,d as WithLabel,h as __namedExportsOrder,l as default};