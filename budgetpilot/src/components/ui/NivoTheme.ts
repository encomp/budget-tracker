// Maps --bp-* CSS variables to a Nivo chart theme object.
// Re-reads from DOM on each render so theme switches apply instantly.
// Usage: const theme = useNivoTheme(); pass to <ResponsiveBar theme={theme} />
import { useAppStore } from '../../store/useAppStore'

export function useNivoTheme() {
  // Subscribing to activeTheme triggers re-render when theme changes
  useAppStore((s) => s.activeTheme)

  const style = getComputedStyle(document.documentElement)
  const get = (v: string) => style.getPropertyValue(v).trim()

  return {
    background: 'transparent',
    textColor: get('--bp-text-secondary'),
    fontSize: 12,
    axis: {
      ticks: { text: { fill: get('--bp-text-muted') } },
      legend: { text: { fill: get('--bp-text-secondary') } },
    },
    grid: { line: { stroke: get('--bp-border'), strokeWidth: 1 } },
    legends: { text: { fill: get('--bp-text-secondary') } },
    tooltip: {
      container: {
        background: get('--bp-bg-surface'),
        border: `1px solid ${get('--bp-border')}`,
        borderRadius: get('--bp-radius-sm'),
        color: get('--bp-text-primary'),
        fontFamily: get('--bp-font-ui'),
      },
    },
  }
}
