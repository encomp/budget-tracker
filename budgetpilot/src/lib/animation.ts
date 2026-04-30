export function getMotionConfig() {
  const style = getComputedStyle(document.documentElement)
  return {
    duration: parseFloat(style.getPropertyValue('--bp-duration-normal').trim()) / 1000,
    // BezierDefinition [x1, y1, x2, y2] matching --bp-easing-spring
    ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  }
}
