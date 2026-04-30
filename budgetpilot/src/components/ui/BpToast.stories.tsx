import * as React from 'react'
import type { Meta } from '@storybook/react'
import type { BpToastVariant } from './BpToast'
import { BpToast } from './BpToast'
import { BpButton } from './BpButton'

const meta: Meta = {
  title: 'BudgetPilot/BpToast',
  parameters: { layout: 'centered' },
}
export default meta

function ToastDemo({ variant, message }: { variant: BpToastVariant; message: string }) {
  const [visible, setVisible] = React.useState(false)
  return (
    <>
      <BpButton onClick={() => setVisible(true)}>Show {variant} toast</BpButton>
      <BpToast variant={variant} message={message} visible={visible} onDismiss={() => setVisible(false)} />
    </>
  )
}

export const Info = { render: () => <ToastDemo variant="info" message="Data saved successfully." /> }
export const Success = { render: () => <ToastDemo variant="success" message="Import complete — 42 transactions added." /> }
export const Error = { render: () => <ToastDemo variant="error" message="Failed to save. Please try again." /> }
export const Bell = { render: () => <ToastDemo variant="bell" message="Backup reminder: last backup was 7 days ago." /> }

export const AllVariants = {
  render: () => {
    const variants: Array<{ v: BpToastVariant; msg: string }> = [
      { v: 'info', msg: 'Info message' },
      { v: 'success', msg: 'Success message' },
      { v: 'error', msg: 'Error message' },
      { v: 'bell', msg: 'Bell notification' },
    ]
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {variants.map(({ v, msg }) => (
          <ToastDemo key={v} variant={v} message={msg} />
        ))}
      </div>
    )
  },
}
