import type { Meta, StoryObj } from '@storybook/react'
import { BpBadge } from './BpBadge'

const meta: Meta<typeof BpBadge> = {
  title: 'BudgetPilot/BpBadge',
  component: BpBadge,
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof BpBadge>

export const Default: Story = { args: { variant: 'default', children: 'Default' } }
export const Success: Story = { args: { variant: 'success', children: 'Success' } }
export const Warning: Story = { args: { variant: 'warning', children: 'Uncategorized' } }
export const Danger: Story = { args: { variant: 'danger', children: 'Danger' } }
export const Muted: Story = { args: { variant: 'muted', children: 'Muted' } }
export const Csv: Story = { args: { variant: 'csv' } }
export const Manual: Story = { args: { variant: 'manual' } }

export const AllVariants = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <BpBadge variant="default">Default</BpBadge>
      <BpBadge variant="success">Success</BpBadge>
      <BpBadge variant="warning">Uncategorized</BpBadge>
      <BpBadge variant="danger">Danger</BpBadge>
      <BpBadge variant="muted">Muted</BpBadge>
      <BpBadge variant="csv" />
      <BpBadge variant="manual" />
    </div>
  ),
}
