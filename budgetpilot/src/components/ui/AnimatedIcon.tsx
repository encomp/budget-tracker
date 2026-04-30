// Uses static lucide-react icons with CSS animations (lucide-react-dynamic not available on npm)
import * as React from 'react'
import { LoaderCircle, CheckCircle, BellRing } from 'lucide-react'

export type AnimatedIconType = 'LoaderCircle' | 'CheckCircle' | 'BellRing'

export interface AnimatedIconProps {
  type: AnimatedIconType
  size?: number
  className?: string
}

const css = `
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
`

let styleInjected = false
function injectStyles() {
  if (styleInjected || typeof document === 'undefined') return
  const el = document.createElement('style')
  el.textContent = css
  document.head.appendChild(el)
  styleInjected = true
}

export function AnimatedIcon({ type, size = 20, className }: AnimatedIconProps) {
  React.useEffect(() => { injectStyles() }, [])

  if (type === 'LoaderCircle') {
    return <LoaderCircle size={size} className={`bp-icon-loading ${className ?? ''}`} />
  }
  if (type === 'CheckCircle') {
    return <CheckCircle size={size} className={`bp-icon-check ${className ?? ''}`} />
  }
  return <BellRing size={size} className={`bp-icon-bell ${className ?? ''}`} />
}
