import * as React from 'react'
import type { Meta } from '@storybook/react'
import { BpSlider } from './BpSlider'

const meta: Meta = {
  title: 'BudgetPilot/BpSlider',
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: '320px', padding: '24px' }}><Story /></div>],
}
export default meta

export const Standard30 = {
  render: () => {
    const [v, setV] = React.useState(30)
    return (
      <div>
        <p style={{ color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)', fontSize: '12px', marginBottom: '12px' }}>Standard — {v}%</p>
        <BpSlider value={v} min={0} max={100} onChange={setV} variant="standard" />
      </div>
    )
  },
}

export const Standard70 = {
  render: () => {
    const [v, setV] = React.useState(70)
    return (
      <div>
        <p style={{ color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)', fontSize: '12px', marginBottom: '12px' }}>Standard — {v}%</p>
        <BpSlider value={v} min={0} max={100} onChange={setV} variant="standard" />
      </div>
    )
  },
}

export const Premium30 = {
  render: () => {
    const [v, setV] = React.useState(30)
    return (
      <div>
        <p style={{ color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)', fontSize: '12px', marginBottom: '12px' }}>Premium — ${v} extra payment</p>
        <BpSlider value={v} min={0} max={500} step={10} onChange={setV} variant="premium" />
      </div>
    )
  },
}

export const Premium70 = {
  render: () => {
    const [v, setV] = React.useState(350)
    return (
      <div>
        <p style={{ color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)', fontSize: '12px', marginBottom: '12px' }}>Premium — ${v} extra payment</p>
        <BpSlider value={v} min={0} max={500} step={10} onChange={setV} variant="premium" />
      </div>
    )
  },
}
