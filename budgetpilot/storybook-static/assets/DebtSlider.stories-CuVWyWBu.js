import{n as e}from"./chunk-DnJy8xQt.js";import{t}from"./iframe-tWz5sYml.js";import{t as n}from"./jsx-runtime-BX9360Lk.js";import{n as r,t as i}from"./BpSlider-Z3HoomBe.js";function a({value:e,min:t,max:n,step:r=25,onChange:a,label:s=`Extra Monthly Payment`,currencySymbol:c=`$`}){return(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`12px`},children:[s&&(0,o.jsx)(`span`,{style:{fontSize:`13px`,color:`var(--bp-text-secondary)`,fontFamily:`var(--bp-font-ui)`,textTransform:`uppercase`,letterSpacing:`0.05em`},children:s}),(0,o.jsxs)(`div`,{style:{fontSize:`28px`,fontFamily:`var(--bp-font-mono)`,color:`var(--bp-accent)`,fontWeight:500,lineHeight:1},children:[c,e.toLocaleString(),` / month`]}),(0,o.jsx)(i,{value:e,min:t,max:n,step:r,onChange:a,variant:`premium`}),(0,o.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,fontSize:`11px`,color:`var(--bp-text-muted)`,fontFamily:`var(--bp-font-mono)`},children:[(0,o.jsxs)(`span`,{children:[c,t]}),(0,o.jsxs)(`span`,{children:[c,n.toLocaleString()]})]})]})}var o,s=e((()=>{t(),r(),o=n(),a.__docgenInfo={description:``,methods:[],displayName:`DebtSlider`,props:{value:{required:!0,tsType:{name:`number`},description:``},min:{required:!0,tsType:{name:`number`},description:``},max:{required:!0,tsType:{name:`number`},description:``},step:{required:!1,tsType:{name:`number`},description:``,defaultValue:{value:`25`,computed:!1}},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: number) => void`,signature:{arguments:[{type:{name:`number`},name:`value`}],return:{name:`void`}}},description:``},label:{required:!1,tsType:{name:`string`},description:``,defaultValue:{value:`'Extra Monthly Payment'`,computed:!1}},currencySymbol:{required:!1,tsType:{name:`string`},description:``,defaultValue:{value:`'$'`,computed:!1}}}}})),c,l,u,d,f,p,m;e((()=>{s(),c={title:`Components/DebtSlider`,component:a,parameters:{layout:`padded`},argTypes:{value:{control:{type:`range`,min:0,max:500,step:25}},min:{control:{type:`number`}},max:{control:{type:`number`}},step:{control:{type:`number`}}}},l={args:{value:0,min:0,max:500,step:25,onChange:()=>{}}},u={args:{value:200,min:0,max:500,step:25,onChange:()=>{}}},d={args:{value:500,min:0,max:500,step:25,onChange:()=>{}}},f={name:`Large Range ($0–$2,000)`,args:{value:750,min:0,max:2e3,step:25,onChange:()=>{},label:`Extra Monthly Payment`}},p={args:{value:300,min:0,max:1e3,step:50,onChange:()=>{},label:`Accelerated Payment`,currencySymbol:`£`}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    value: 0,
    min: 0,
    max: 500,
    step: 25,
    onChange: () => {}
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    value: 200,
    min: 0,
    max: 500,
    step: 25,
    onChange: () => {}
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    value: 500,
    min: 0,
    max: 500,
    step: 25,
    onChange: () => {}
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Large Range ($0–$2,000)',
  args: {
    value: 750,
    min: 0,
    max: 2000,
    step: 25,
    onChange: () => {},
    label: 'Extra Monthly Payment'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    value: 300,
    min: 0,
    max: 1000,
    step: 50,
    onChange: () => {},
    label: 'Accelerated Payment',
    currencySymbol: '£'
  }
}`,...p.parameters?.docs?.source}}},m=[`AtZero`,`At200`,`At500`,`LargeRange`,`CustomLabel`]}))();export{u as At200,d as At500,l as AtZero,p as CustomLabel,f as LargeRange,m as __namedExportsOrder,c as default};