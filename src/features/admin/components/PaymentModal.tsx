/**
 * Admin feature — mark a payment as paid (method + date).
 */
import { useEffect, useState } from 'react';
import { Button, Modal, Select } from '../../../components';
import type { Payment, PaymentMethod } from '../../../types';
import { formatJalali, formatToman } from '../../../utils';
import { PAYMENT_METHOD_LABELS } from '../lib/labels';
import { JalaliDateField } from './JalaliDateField';

interface PaymentModalProps {
  payment: Payment | null;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, paidAt: string) => void;
}

const METHOD_OPTIONS = (Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => ({
  value: method,
  label: PAYMENT_METHOD_LABELS[method],
}));

export function PaymentModal({ payment, onClose, onConfirm }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [paidAt, setPaidAt] = useState('');

  useEffect(() => {
    if (payment) {
      setMethod('card');
      setPaidAt(new Date().toISOString().slice(0, 10));
    }
  }, [payment]);

  return (
    <Modal
      open={payment !== null}
      onClose={onClose}
      title="ثبت پرداخت"
      description={
        payment
          ? `${payment.title} — مبلغ ${formatToman(payment.amount)} (سررسید ${formatJalali(payment.dueDate)})`
          : undefined
      }
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button
            variant="success"
            onClick={() => payment && onConfirm(method, paidAt || new Date().toISOString().slice(0, 10))}
          >
            ثبت پرداخت
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4">
        <Select
          label="روش پرداخت"
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          options={METHOD_OPTIONS}
        />
        <JalaliDateField
          label="تاریخ پرداخت"
          value={paidAt}
          onChange={(e) => setPaidAt(e.target.value)}
        />
      </div>
    </Modal>
  );
}
