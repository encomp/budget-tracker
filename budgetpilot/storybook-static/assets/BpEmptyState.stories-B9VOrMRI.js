import{n as e}from"./chunk-DnJy8xQt.js";import{t}from"./iframe-tWz5sYml.js";import{t as n}from"./jsx-runtime-BX9360Lk.js";import{i as r,t as i}from"./lucide-react-D10WrdMU.js";import{n as a,t as o}from"./BpButton-DXsQK8jg.js";function s({icon:e,heading:t,subtext:n,action:r}){return(0,c.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,textAlign:`center`,padding:`40px 24px`,gap:`12px`},children:[e&&(0,c.jsx)(`div`,{style:{color:`var(--bp-text-muted)`,width:`48px`,height:`48px`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:e}),(0,c.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,c.jsx)(`p`,{style:{color:`var(--bp-text-primary)`,fontFamily:`var(--bp-font-ui)`,fontSize:`16px`,fontWeight:600},children:t}),(0,c.jsx)(`p`,{style:{color:`var(--bp-text-secondary)`,fontFamily:`var(--bp-font-ui)`,fontSize:`14px`},children:n})]}),r&&(0,c.jsx)(o,{variant:`primary`,onClick:r.onClick,children:r.label})]})}var c,l=e((()=>{t(),a(),c=n(),s.__docgenInfo={description:``,methods:[],displayName:`BpEmptyState`,props:{icon:{required:!1,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:``},heading:{required:!0,tsType:{name:`string`},description:``},subtext:{required:!0,tsType:{name:`string`},description:``},action:{required:!1,tsType:{name:`signature`,type:`object`,raw:`{
  label: string
  onClick: () => void
}`,signature:{properties:[{key:`label`,value:{name:`string`,required:!0}},{key:`onClick`,value:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}},required:!0}}]}},description:``}}}})),u,d,f,p,m,h;e((()=>{l(),i(),u=n(),d={title:`BudgetPilot/BpEmptyState`,component:s,parameters:{layout:`centered`}},f={args:{icon:(0,u.jsx)(r,{size:48}),heading:`No transactions yet`,subtext:`Add your first transaction to get started tracking your budget.`,action:{label:`Add Transaction`,onClick:()=>{}}}},p={args:{icon:(0,u.jsx)(r,{size:48}),heading:`Nothing here`,subtext:`There is nothing to display at this time.`}},m={args:{heading:`No data available`,subtext:`Check back later.`,action:{label:`Refresh`,onClick:()=>{}}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    icon: <Inbox size={48} />,
    heading: 'No transactions yet',
    subtext: 'Add your first transaction to get started tracking your budget.',
    action: {
      label: 'Add Transaction',
      onClick: () => {}
    }
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    icon: <Inbox size={48} />,
    heading: 'Nothing here',
    subtext: 'There is nothing to display at this time.'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'No data available',
    subtext: 'Check back later.',
    action: {
      label: 'Refresh',
      onClick: () => {}
    }
  }
}`,...m.parameters?.docs?.source}}},h=[`WithAction`,`WithoutAction`,`NoIcon`]}))();export{m as NoIcon,f as WithAction,p as WithoutAction,h as __namedExportsOrder,d as default};