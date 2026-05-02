import { useTranslation } from 'react-i18next'
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
  confirmLabel,
  cancelLabel,
  variant = 'default',
  onConfirm,
}: BpConfirmDialogProps) {
  const { t } = useTranslation()
  const resolvedConfirm = confirmLabel ?? t('components.confirmDialog.defaultConfirm')
  const resolvedCancel = cancelLabel ?? t('components.confirmDialog.defaultCancel')
  const footer = (
    <>
      <BpButton variant="ghost" onClick={() => onOpenChange(false)}>
        {resolvedCancel}
      </BpButton>
      <BpButton
        variant={variant === 'danger' ? 'danger' : 'primary'}
        onClick={() => {
          onConfirm()
          onOpenChange(false)
        }}
      >
        {resolvedConfirm}
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
