export function getMotionConfig() {
  const style = getComputedStyle(document.documentElement)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const intensity = prefersReduced
    ? 0
    : parseFloat(style.getPropertyValue('--bp-motion-intensity').trim() || '1')
  const duration = intensity === 0
    ? 0.01
    : parseFloat(style.getPropertyValue('--bp-duration-normal').trim()) / 1000
  return {
    duration,
    // BezierDefinition [x1, y1, x2, y2] matching --bp-easing-spring
    ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
    easing: style.getPropertyValue('--bp-easing-spring').trim(),
    intensity,
    prefersReduced,
  }
}
