import type { Meta } from '@storybook/react'
import { AnimatedIcon } from './AnimatedIcon'

const meta: Meta = {
  title: 'BudgetPilot/AnimatedIcon',
  parameters: { layout: 'centered' },
}
export default meta

export const AllTypes = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <AnimatedIcon type="LoaderCircle" size={32} />
        <span style={{ color: 'var(--bp-text-muted)', fontSize: '12px', fontFamily: 'var(--bp-font-ui)' }}>LoaderCircle</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <AnimatedIcon type="CheckCircle" size={32} />
        <span style={{ color: 'var(--bp-text-muted)', fontSize: '12px', fontFamily: 'var(--bp-font-ui)' }}>CheckCircle</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <AnimatedIcon type="BellRing" size={32} />
        <span style={{ color: 'var(--bp-text-muted)', fontSize: '12px', fontFamily: 'var(--bp-font-ui)' }}>BellRing</span>
      </div>
    </div>
  ),
}

export const LoaderCircleIcon = {
  render: () => <AnimatedIcon type="LoaderCircle" size={40} />,
}

export const CheckCircleIcon = {
  render: () => <AnimatedIcon type="CheckCircle" size={40} />,
}

export const BellRingIcon = {
  render: () => <AnimatedIcon type="BellRing" size={40} />,
}
