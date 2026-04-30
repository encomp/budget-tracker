import type { Meta, StoryObj } from '@storybook/react'
import { BpEmptyState } from './BpEmptyState'
import { Inbox } from 'lucide-react'

const meta: Meta<typeof BpEmptyState> = {
  title: 'BudgetPilot/BpEmptyState',
  component: BpEmptyState,
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof BpEmptyState>

export const WithAction: Story = {
  args: {
    icon: <Inbox size={48} />,
    heading: 'No transactions yet',
    subtext: 'Add your first transaction to get started tracking your budget.',
    action: { label: 'Add Transaction', onClick: () => {} },
  },
}

export const WithoutAction: Story = {
  args: {
    icon: <Inbox size={48} />,
    heading: 'Nothing here',
    subtext: 'There is nothing to display at this time.',
  },
}

export const NoIcon: Story = {
  args: {
    heading: 'No data available',
    subtext: 'Check back later.',
    action: { label: 'Refresh', onClick: () => {} },
  },
}
