import * as React from 'react'
import type { Meta } from '@storybook/react'
import { BpConfirmDialog } from './BpConfirmDialog'
import { BpButton } from './BpButton'

const meta: Meta = {
  title: 'BudgetPilot/BpConfirmDialog',
  parameters: { layout: 'centered' },
}
export default meta

function ConfirmDemo({ variant }: { variant: 'default' | 'danger' }) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <BpButton variant={variant === 'danger' ? 'danger' : 'primary'} onClick={() => setOpen(true)}>
        Open {variant} confirm
      </BpButton>
      <BpConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={variant === 'danger' ? 'Delete Transaction' : 'Confirm Action'}
        description={variant === 'danger' ? 'This will permanently delete the transaction. This cannot be undone.' : 'Are you sure you want to proceed?'}
        confirmLabel={variant === 'danger' ? 'Delete' : 'Confirm'}
        variant={variant}
        onConfirm={() => console.log('confirmed')}
      />
    </>
  )
}

export const Default = { render: () => <ConfirmDemo variant="default" /> }
export const Danger = { render: () => <ConfirmDemo variant="danger" /> }
