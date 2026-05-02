import{a as e,n as t}from"./chunk-DnJy8xQt.js";import{t as n}from"./iframe-DDZiR8S0.js";import{t as r}from"./jsx-runtime-BX9360Lk.js";import{n as i,t as a}from"./AnimatedIcon-CYjNj-uD.js";import{n as o,t as s}from"./BpButton-CYAqgZHE.js";function c({variant:e,message:t,visible:n,onDismiss:r,autoDismissMs:i=4e3,action:o}){return l.useEffect(()=>{if(!n)return;let e=setTimeout(r,i);return()=>clearTimeout(e)},[n,r,i]),(0,u.jsxs)(`div`,{style:{position:`fixed`,bottom:`16px`,right:`16px`,zIndex:9999,background:`var(--bp-bg-surface)`,border:`1px solid var(--bp-border)`,borderLeft:`4px solid ${d[e]}`,borderRadius:`var(--bp-radius-md)`,padding:`12px 16px`,display:`flex`,alignItems:`center`,gap:`8px`,fontFamily:`var(--bp-font-ui)`,fontSize:`14px`,color:`var(--bp-text-primary)`,maxWidth:`360px`,transform:n?`translateY(0)`:`translateY(16px)`,opacity:+!!n,pointerEvents:n?`auto`:`none`,transition:`transform var(--bp-duration-normal) var(--bp-easing-spring), opacity var(--bp-duration-normal) var(--bp-easing-spring)`},role:`alert`,children:[e===`bell`&&(0,u.jsx)(a,{type:`BellRing`,size:16}),(0,u.jsx)(`span`,{style:{flex:1},children:t}),o&&(0,u.jsx)(`button`,{onClick:()=>{o.onClick(),r()},style:{background:`none`,border:`none`,color:`var(--bp-accent)`,cursor:`pointer`,fontFamily:`var(--bp-font-ui)`,fontSize:`13px`,fontWeight:600,padding:`0 8px`,transition:`opacity var(--bp-duration-fast) var(--bp-easing-default)`},children:o.label}),(0,u.jsx)(`button`,{onClick:r,style:{background:`none`,border:`none`,color:`var(--bp-text-muted)`,cursor:`pointer`,padding:`0 0 0 8px`,fontSize:`16px`,lineHeight:1},"aria-label":`Dismiss`,children:`×`})]})}var l,u,d,f=t((()=>{l=e(n(),1),i(),u=r(),d={info:`var(--bp-accent)`,success:`var(--bp-positive)`,error:`var(--bp-danger)`,bell:`var(--bp-warning)`},c.__docgenInfo={description:``,methods:[],displayName:`BpToast`,props:{variant:{required:!0,tsType:{name:`union`,raw:`'info' | 'success' | 'error' | 'bell'`,elements:[{name:`literal`,value:`'info'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'error'`},{name:`literal`,value:`'bell'`}]},description:``},message:{required:!0,tsType:{name:`string`},description:``},visible:{required:!0,tsType:{name:`boolean`},description:``},onDismiss:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``},autoDismissMs:{required:!1,tsType:{name:`number`},description:``,defaultValue:{value:`4000`,computed:!1}},action:{required:!1,tsType:{name:`signature`,type:`object`,raw:`{ label: string; onClick: () => void }`,signature:{properties:[{key:`label`,value:{name:`string`,required:!0}},{key:`onClick`,value:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}},required:!0}}]}},description:``}}}}));function p({variant:e,message:t}){let[n,r]=m.useState(!1);return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsxs)(s,{onClick:()=>r(!0),children:[`Show `,e,` toast`]}),(0,h.jsx)(c,{variant:e,message:t,visible:n,onDismiss:()=>r(!1)})]})}var m,h,g,_,v,y,b,x,S;t((()=>{m=e(n(),1),f(),o(),h=r(),g={title:`BudgetPilot/BpToast`,parameters:{layout:`centered`}},_={render:()=>(0,h.jsx)(p,{variant:`info`,message:`Data saved successfully.`})},v={render:()=>(0,h.jsx)(p,{variant:`success`,message:`Import complete — 42 transactions added.`})},y={render:()=>(0,h.jsx)(p,{variant:`error`,message:`Failed to save. Please try again.`})},b={render:()=>(0,h.jsx)(p,{variant:`bell`,message:`Backup reminder: last backup was 7 days ago.`})},x={render:()=>(0,h.jsx)(`div`,{style:{display:`flex`,gap:`8px`,flexWrap:`wrap`},children:[{v:`info`,msg:`Info message`},{v:`success`,msg:`Success message`},{v:`error`,msg:`Error message`},{v:`bell`,msg:`Bell notification`}].map(({v:e,msg:t})=>(0,h.jsx)(p,{variant:e,message:t},e))})},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <ToastDemo variant="info" message="Data saved successfully." />
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <ToastDemo variant="success" message="Import complete — 42 transactions added." />
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <ToastDemo variant="error" message="Failed to save. Please try again." />
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <ToastDemo variant="bell" message="Backup reminder: last backup was 7 days ago." />
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const variants: Array<{
      v: BpToastVariant;
      msg: string;
    }> = [{
      v: 'info',
      msg: 'Info message'
    }, {
      v: 'success',
      msg: 'Success message'
    }, {
      v: 'error',
      msg: 'Error message'
    }, {
      v: 'bell',
      msg: 'Bell notification'
    }];
    return <div style={{
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    }}>
        {variants.map(({
        v,
        msg
      }) => <ToastDemo key={v} variant={v} message={msg} />)}
      </div>;
  }
}`,...x.parameters?.docs?.source}}},S=[`Info`,`Success`,`Error`,`Bell`,`AllVariants`]}))();export{x as AllVariants,b as Bell,y as Error,_ as Info,v as Success,S as __namedExportsOrder,g as default};