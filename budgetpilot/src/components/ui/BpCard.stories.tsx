import type { Meta, StoryObj } from '@storybook/react'
import { BpCard } from './BpCard'

const meta: Meta<typeof BpCard> = {
  title: 'BudgetPilot/BpCard',
  component: BpCard,
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof BpCard>

export const Default: Story = {
  args: { children: <p style={{ color: 'var(--bp-text-primary)' }}>Card content</p>, padding: 'md' },
}
export const SmallPadding: Story = {
  args: { children: <p style={{ color: 'var(--bp-text-primary)' }}>Small padding</p>, padding: 'sm' },
}
export const LargePadding: Story = {
  args: { children: <p style={{ color: 'var(--bp-text-primary)' }}>Large padding</p>, padding: 'lg' },
}
export const Hoverable: Story = {
  args: { children: <p style={{ color: 'var(--bp-text-primary)' }}>Hover over me</p>, hoverable: true, padding: 'md' },
}

export const AllVariants = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <BpCard padding="sm"><p style={{ color: 'var(--bp-text-primary)' }}>Small padding</p></BpCard>
      <BpCard padding="md"><p style={{ color: 'var(--bp-text-primary)' }}>Medium padding</p></BpCard>
      <BpCard padding="lg"><p style={{ color: 'var(--bp-text-primary)' }}>Large padding</p></BpCard>
      <BpCard hoverable padding="md"><p style={{ color: 'var(--bp-text-primary)' }}>Hoverable (try hovering)</p></BpCard>
    </div>
  ),
}
