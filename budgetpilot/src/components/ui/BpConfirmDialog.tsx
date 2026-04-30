import { BpModal } from './BpModal'
import { BpButton } from './BpButton'

export interface BpConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  onConfirm: () => void
}

export function BpConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
}: BpConfirmDialogProps) {
  const footer = (
    <>
      <BpButton variant="ghost" onClick={() => onOpenChange(false)}>
        {cancelLabel}
      </BpButton>
      <BpButton
        variant={variant === 'danger' ? 'danger' : 'primary'}
        onClick={() => {
          onConfirm()
          onOpenChange(false)
        }}
      >
        {confirmLabel}
      </BpButton>
    </>
  )

  return (
    <BpModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      footer={footer}
    >
      <div />
    </BpModal>
  )
}
