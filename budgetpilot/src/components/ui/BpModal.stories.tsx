import * as React from 'react'
import type { Meta } from '@storybook/react'
import { BpModal } from './BpModal'
import { BpButton } from './BpButton'

const meta: Meta = {
  title: 'BudgetPilot/BpModal',
  parameters: { layout: 'centered' },
}
export default meta

function ModalDemo({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <BpButton onClick={() => setOpen(true)}>Open {size} modal</BpButton>
      <BpModal open={open} onOpenChange={setOpen} title={`${size.toUpperCase()} Modal`} description="This is a modal description." size={size}>
        <p style={{ color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)', fontSize: '14px' }}>
          Modal body content goes here.
        </p>
      </BpModal>
    </>
  )
}

function ModalWithFooterDemo() {
  const [open, setOpen] = React.useState(false)
  const footer = (
    <>
      <BpButton variant="ghost" onClick={() => setOpen(false)}>Cancel</BpButton>
      <BpButton variant="primary" onClick={() => setOpen(false)}>Save Changes</BpButton>
    </>
  )
  return (
    <>
      <BpButton onClick={() => setOpen(true)}>Open modal with footer</BpButton>
      <BpModal open={open} onOpenChange={setOpen} title="Modal with Footer" description="Footer has action buttons." footer={footer}>
        <p style={{ color: 'var(--bp-text-secondary)', fontFamily: 'var(--bp-font-ui)', fontSize: '14px' }}>
          Content area.
        </p>
      </BpModal>
    </>
  )
}

export const Small = { render: () => <ModalDemo size="sm" /> }
export const Medium = { render: () => <ModalDemo size="md" /> }
export const Large = { render: () => <ModalDemo size="lg" /> }
export const WithFooter = { render: () => <ModalWithFooterDemo /> }
