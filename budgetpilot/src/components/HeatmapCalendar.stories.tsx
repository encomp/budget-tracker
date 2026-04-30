import type { Meta, StoryObj } from '@storybook/react'
import { HeatmapCalendar } from './HeatmapCalendar'

const meta: Meta<typeof HeatmapCalendar> = {
  title: 'Components/HeatmapCalendar',
  component: HeatmapCalendar,
  parameters: {
    backgrounds: { default: 'dark' },
    layout: 'padded',
  },
}
export default meta
type Story = StoryObj<typeof HeatmapCalendar>

// Mock: daily budget = $100/day (month budget $3100). Shows all 4 heat states.
const MOCK_SPEND: Record<string, number> = {
  '2026-04-01': 0,       // none
  '2026-04-02': 45,      // low  (< $95)
  '2026-04-03': 80,      // low
  '2026-04-04': 98,      // mid  (within 5% of $100)
  '2026-04-05': 102,     // mid
  '2026-04-06': 155,     // high (> $105)
  '2026-04-07': 220,     // high
  '2026-04-08': 0,
  '2026-04-09': 60,
  '2026-04-10': 95,
  '2026-04-11': 105,
  '2026-04-12': 190,
  '2026-04-13': 0,
  '2026-04-14': 0,
  '2026-04-15': 33,
  '2026-04-16': 125,     // high — tooltip demo
  '2026-04-17': 99,
  '2026-04-18': 0,
  '2026-04-19': 72,
  '2026-04-20': 101,
  '2026-04-21': 145,
  '2026-04-22': 0,
  '2026-04-23': 55,
  '2026-04-24': 0,
  '2026-04-25': 200,
  '2026-04-26': 88,
  '2026-04-27': 103,
  '2026-04-28': 0,
  '2026-04-29': 42,
  '2026-04-30': 67,
}

export const AllHeatStates: Story = {
  args: {
    month: '2026-04',
    dailySpendOverride: MOCK_SPEND,
    dailyBudgetOverride: 100,
  },
}

export const EmptyMonth: Story = {
  args: {
    month: '2026-04',
    dailySpendOverride: {},
    dailyBudgetOverride: 100,
  },
}

export const OverBudgetMonth: Story = {
  args: {
    month: '2026-04',
    dailySpendOverride: Object.fromEntries(
      Object.keys(MOCK_SPEND).map((d) => [d, 180])
    ),
    dailyBudgetOverride: 100,
  },
}

export const NoBudgetSet: Story = {
  args: {
    month: '2026-04',
    dailySpendOverride: MOCK_SPEND,
    dailyBudgetOverride: 0,
  },
}
