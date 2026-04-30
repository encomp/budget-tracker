import{a as e,n as t}from"./chunk-DnJy8xQt.js";import{t as n}from"./iframe-tWz5sYml.js";import{t as r}from"./jsx-runtime-BX9360Lk.js";import{n as i,t as a}from"./BpSlider-Z3HoomBe.js";var o,s,c,l,u,d,f,p;t((()=>{o=e(n(),1),i(),s=r(),c={title:`BudgetPilot/BpSlider`,parameters:{layout:`centered`},decorators:[e=>(0,s.jsx)(`div`,{style:{width:`320px`,padding:`24px`},children:(0,s.jsx)(e,{})})]},l={render:()=>{let[e,t]=o.useState(30);return(0,s.jsxs)(`div`,{children:[(0,s.jsxs)(`p`,{style:{color:`var(--bp-text-secondary)`,fontFamily:`var(--bp-font-ui)`,fontSize:`12px`,marginBottom:`12px`},children:[`Standard — `,e,`%`]}),(0,s.jsx)(a,{value:e,min:0,max:100,onChange:t,variant:`standard`})]})}},u={render:()=>{let[e,t]=o.useState(70);return(0,s.jsxs)(`div`,{children:[(0,s.jsxs)(`p`,{style:{color:`var(--bp-text-secondary)`,fontFamily:`var(--bp-font-ui)`,fontSize:`12px`,marginBottom:`12px`},children:[`Standard — `,e,`%`]}),(0,s.jsx)(a,{value:e,min:0,max:100,onChange:t,variant:`standard`})]})}},d={render:()=>{let[e,t]=o.useState(30);return(0,s.jsxs)(`div`,{children:[(0,s.jsxs)(`p`,{style:{color:`var(--bp-text-secondary)`,fontFamily:`var(--bp-font-ui)`,fontSize:`12px`,marginBottom:`12px`},children:[`Premium — $`,e,` extra payment`]}),(0,s.jsx)(a,{value:e,min:0,max:500,step:10,onChange:t,variant:`premium`})]})}},f={render:()=>{let[e,t]=o.useState(350);return(0,s.jsxs)(`div`,{children:[(0,s.jsxs)(`p`,{style:{color:`var(--bp-text-secondary)`,fontFamily:`var(--bp-font-ui)`,fontSize:`12px`,marginBottom:`12px`},children:[`Premium — $`,e,` extra payment`]}),(0,s.jsx)(a,{value:e,min:0,max:500,step:10,onChange:t,variant:`premium`})]})}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [v, setV] = React.useState(30);
    return <div>
        <p style={{
        color: 'var(--bp-text-secondary)',
        fontFamily: 'var(--bp-font-ui)',
        fontSize: '12px',
        marginBottom: '12px'
      }}>Standard — {v}%</p>
        <BpSlider value={v} min={0} max={100} onChange={setV} variant="standard" />
      </div>;
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [v, setV] = React.useState(70);
    return <div>
        <p style={{
        color: 'var(--bp-text-secondary)',
        fontFamily: 'var(--bp-font-ui)',
        fontSize: '12px',
        marginBottom: '12px'
      }}>Standard — {v}%</p>
        <BpSlider value={v} min={0} max={100} onChange={setV} variant="standard" />
      </div>;
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [v, setV] = React.useState(30);
    return <div>
        <p style={{
        color: 'var(--bp-text-secondary)',
        fontFamily: 'var(--bp-font-ui)',
        fontSize: '12px',
        marginBottom: '12px'
      }}>Premium — \${v} extra payment</p>
        <BpSlider value={v} min={0} max={500} step={10} onChange={setV} variant="premium" />
      </div>;
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [v, setV] = React.useState(350);
    return <div>
        <p style={{
        color: 'var(--bp-text-secondary)',
        fontFamily: 'var(--bp-font-ui)',
        fontSize: '12px',
        marginBottom: '12px'
      }}>Premium — \${v} extra payment</p>
        <BpSlider value={v} min={0} max={500} step={10} onChange={setV} variant="premium" />
      </div>;
  }
}`,...f.parameters?.docs?.source}}},p=[`Standard30`,`Standard70`,`Premium30`,`Premium70`]}))();export{d as Premium30,f as Premium70,l as Standard30,u as Standard70,p as __namedExportsOrder,c as default};