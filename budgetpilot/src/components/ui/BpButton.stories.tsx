import type { Meta, StoryObj } from '@storybook/react'
import { BpButton } from './BpButton'

const meta: Meta<typeof BpButton> = {
  title: 'BudgetPilot/BpButton',
  component: BpButton,
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof BpButton>

export const Primary: Story = { args: { variant: 'primary', children: 'Primary Button' } }
export const Secondary: Story = { args: { variant: 'secondary', children: 'Secondary Button' } }
export const Ghost: Story = { args: { variant: 'ghost', children: 'Ghost Button' } }
export const Danger: Story = { args: { variant: 'danger', children: 'Danger Button' } }
export const Loading: Story = { args: { variant: 'primary', loading: true, children: 'Loading' } }
export const Disabled: Story = { args: { variant: 'primary', disabled: true, children: 'Disabled' } }

export const AllVariants = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
      <BpButton variant="primary">Primary</BpButton>
      <BpButton variant="secondary">Secondary</BpButton>
      <BpButton variant="ghost">Ghost</BpButton>
      <BpButton variant="danger">Danger</BpButton>
      <BpButton variant="primary" loading>Loading</BpButton>
      <BpButton variant="primary" disabled>Disabled</BpButton>
      <BpButton variant="primary" size="sm">Small</BpButton>
      <BpButton variant="primary" size="md">Medium</BpButton>
      <BpButton variant="primary" size="lg">Large</BpButton>
    </div>
  ),
}
