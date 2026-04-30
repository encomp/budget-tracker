import type { Meta, StoryObj } from '@storybook/react'
import { BpInput } from './BpInput'

const meta: Meta<typeof BpInput> = {
  title: 'BudgetPilot/BpInput',
  component: BpInput,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: '300px' }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof BpInput>

export const Default: Story = { args: { placeholder: 'Enter text...' } }
export const WithLabel: Story = { args: { label: 'Transaction name', placeholder: 'e.g. Grocery store' } }
export const Mono: Story = { args: { label: 'Amount', mono: true, placeholder: '0.00', type: 'number' } }
export const WithError: Story = { args: { label: 'Amount', mono: true, placeholder: '0.00', error: 'Amount must be greater than 0', value: '-5', readOnly: true } }
export const Disabled: Story = { args: { label: 'Locked field', value: 'Cannot edit', disabled: true, readOnly: true } }
