import type { Meta, StoryObj } from '@storybook/react'
import { BpProgressBar } from './BpProgressBar'

const meta: Meta<typeof BpProgressBar> = {
  title: 'BudgetPilot/BpProgressBar',
  component: BpProgressBar,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: '300px' }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof BpProgressBar>

export const Zero: Story = { args: { value: 0, label: 'No spending', showValue: true } }
export const Healthy: Story = { args: { value: 45, label: 'Groceries', showValue: true } }
export const Normal: Story = { args: { value: 72, label: 'Transport', showValue: true } }
export const Warning: Story = { args: { value: 88, label: 'Dining', showValue: true } }
export const AtLimit: Story = { args: { value: 100, label: 'Entertainment', showValue: true } }
export const Over: Story = { args: { value: 120, label: 'Shopping', showValue: true } }

export const AllStates = {
  render: () => (
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <BpProgressBar value={0} label="0% — empty" showValue />
      <BpProgressBar value={45} label="45% — healthy (teal)" showValue />
      <BpProgressBar value={72} label="72% — healthy (teal)" showValue />
      <BpProgressBar value={88} label="88% — warning (amber)" showValue />
      <BpProgressBar value={100} label="100% — over (red)" showValue />
      <BpProgressBar value={120} label="120% — over (red)" showValue />
    </div>
  ),
}
