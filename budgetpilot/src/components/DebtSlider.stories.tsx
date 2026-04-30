import type { Meta, StoryObj } from '@storybook/react'
import { DebtSlider } from './DebtSlider'

const meta: Meta<typeof DebtSlider> = {
  title: 'Components/DebtSlider',
  component: DebtSlider,
  parameters: { layout: 'padded' },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 500, step: 25 } },
    min: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    step: { control: { type: 'number' } },
  },
}

export default meta
type Story = StoryObj<typeof DebtSlider>

export const AtZero: Story = {
  args: { value: 0, min: 0, max: 500, step: 25, onChange: () => {} },
}

export const At200: Story = {
  args: { value: 200, min: 0, max: 500, step: 25, onChange: () => {} },
}

export const At500: Story = {
  args: { value: 500, min: 0, max: 500, step: 25, onChange: () => {} },
}

export const LargeRange: Story = {
  name: 'Large Range ($0–$2,000)',
  args: { value: 750, min: 0, max: 2000, step: 25, onChange: () => {}, label: 'Extra Monthly Payment' },
}

export const CustomLabel: Story = {
  args: {
    value: 300,
    min: 0,
    max: 1000,
    step: 50,
    onChange: () => {},
    label: 'Accelerated Payment',
    currencySymbol: '£',
  },
}
