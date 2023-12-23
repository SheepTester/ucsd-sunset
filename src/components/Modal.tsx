import { ReactNode, useEffect, useRef } from 'react'

// Based on https://github.com/acmucsd/membership-portal-ui-v2/blob/00bc37e3ab16b054ced36a69cc73aa5c2a716e65/src/components/common/Modal/index.tsx

export type ModalProps = {
  open: boolean
  onClose: () => void
  children?: ReactNode
}
export function Modal ({ open, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [open])

  return (
    <dialog
      className='modal'
      ref={ref}
      onClick={e => {
        if (e.target === e.currentTarget) {
          e.currentTarget.close()
        }
      }}
      onClose={onClose}
    >
      <form method='dialog' className='modal-body'>
        {children}
      </form>
    </dialog>
  )
}
