/**
 * Admin feature — destructive-action confirmation dialog.
 * Wraps the shared <Modal> so every delete in the admin area asks first.
 */
import { Trash2 } from 'lucide-react';
import { Button, Modal } from '../../../components';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'حذف',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            انصراف
          </Button>
          <Button variant="danger" leftIcon={Trash2} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-[13px] leading-7 text-text-muted">{message}</p>
    </Modal>
  );
}
