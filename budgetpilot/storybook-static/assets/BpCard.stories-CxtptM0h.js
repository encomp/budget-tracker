import{a as e,n as t}from"./chunk-DnJy8xQt.js";import{t as n}from"./iframe-tWz5sYml.js";import{t as r}from"./jsx-runtime-BX9360Lk.js";function i({children:e,padding:t=`md`,hoverable:n=!1,className:r}){let[i,c]=a.useState(!1);return(0,o.jsx)(`div`,{style:{background:`var(--bp-bg-surface)`,border:`1px solid ${i&&n?`var(--bp-border-strong)`:`var(--bp-border)`}`,borderRadius:`var(--bp-radius-md)`,padding:s[t],transform:i&&n?`translateY(-1px)`:`translateY(0)`,transition:`all var(--bp-duration-fast) var(--bp-easing-default)`},className:r,onMouseEnter:()=>n&&c(!0),onMouseLeave:()=>n&&c(!1),children:e})}var a,o,s,c=t((()=>{a=e(n(),1),o=r(),s={sm:`12px`,md:`20px`,lg:`28px`},i.__docgenInfo={description:``,methods:[],displayName:`BpCard`,props:{children:{required:!0,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:``},padding:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md' | 'lg'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`},{name:`literal`,value:`'lg'`}]},description:``,defaultValue:{value:`'md'`,computed:!1}},hoverable:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},className:{required:!1,tsType:{name:`string`},description:``}}}})),l,u,d,f,p,m,h,g;t((()=>{c(),l=r(),u={title:`BudgetPilot/BpCard`,component:i,parameters:{layout:`centered`}},d={args:{children:(0,l.jsx)(`p`,{style:{color:`var(--bp-text-primary)`},children:`Card content`}),padding:`md`}},f={args:{children:(0,l.jsx)(`p`,{style:{color:`var(--bp-text-primary)`},children:`Small padding`}),padding:`sm`}},p={args:{children:(0,l.jsx)(`p`,{style:{color:`var(--bp-text-primary)`},children:`Large padding`}),padding:`lg`}},m={args:{children:(0,l.jsx)(`p`,{style:{color:`var(--bp-text-primary)`},children:`Hover over me`}),hoverable:!0,padding:`md`}},h={render:()=>(0,l.jsxs)(`div`,{style:{display:`flex`,gap:`16px`,flexWrap:`wrap`},children:[(0,l.jsx)(i,{padding:`sm`,children:(0,l.jsx)(`p`,{style:{color:`var(--bp-text-primary)`},children:`Small padding`})}),(0,l.jsx)(i,{padding:`md`,children:(0,l.jsx)(`p`,{style:{color:`var(--bp-text-primary)`},children:`Medium padding`})}),(0,l.jsx)(i,{padding:`lg`,children:(0,l.jsx)(`p`,{style:{color:`var(--bp-text-primary)`},children:`Large padding`})}),(0,l.jsx)(i,{hoverable:!0,padding:`md`,children:(0,l.jsx)(`p`,{style:{color:`var(--bp-text-primary)`},children:`Hoverable (try hovering)`})})]})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    children: <p style={{
      color: 'var(--bp-text-primary)'
    }}>Card content</p>,
    padding: 'md'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    children: <p style={{
      color: 'var(--bp-text-primary)'
    }}>Small padding</p>,
    padding: 'sm'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    children: <p style={{
      color: 'var(--bp-text-primary)'
    }}>Large padding</p>,
    padding: 'lg'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    children: <p style={{
      color: 'var(--bp-text-primary)'
    }}>Hover over me</p>,
    hoverable: true,
    padding: 'md'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  }}>
      <BpCard padding="sm"><p style={{
        color: 'var(--bp-text-primary)'
      }}>Small padding</p></BpCard>
      <BpCard padding="md"><p style={{
        color: 'var(--bp-text-primary)'
      }}>Medium padding</p></BpCard>
      <BpCard padding="lg"><p style={{
        color: 'var(--bp-text-primary)'
      }}>Large padding</p></BpCard>
      <BpCard hoverable padding="md"><p style={{
        color: 'var(--bp-text-primary)'
      }}>Hoverable (try hovering)</p></BpCard>
    </div>
}`,...h.parameters?.docs?.source}}},g=[`Default`,`SmallPadding`,`LargePadding`,`Hoverable`,`AllVariants`]}))();export{h as AllVariants,d as Default,m as Hoverable,p as LargePadding,f as SmallPadding,g as __namedExportsOrder,u as default};