import * as React from 'react'
import type { Meta } from '@storybook/react'
import { BpSelect } from './BpSelect'

const meta: Meta = {
  title: 'BudgetPilot/BpSelect',
  parameters: { layout: 'centered' },
}
export default meta

const options = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'transport', label: 'Transportation' },
  { value: 'housing', label: 'Housing' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health' },
]

export const Default = {
  render: () => {
    const [value, setValue] = React.useState('')
    return <BpSelect options={options} value={value} onValueChange={setValue} placeholder="Select category" />
  },
}

export const WithValue = {
  render: () => {
    const [value, setValue] = React.useState('food')
    return <BpSelect options={options} value={value} onValueChange={setValue} />
  },
}

export const Disabled = {
  render: () => (
    <BpSelect options={options} value="transport" onValueChange={() => {}} disabled />
  ),
}
