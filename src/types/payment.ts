import type { ID, ISODateString } from './common';

export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type PaymentMethod = 'card' | 'online' | 'cash' | 'transfer';

export interface Payment {
  id: ID;
  studentId: ID;
  /** e.g. «شهریه نوبت اول»، «سرویس مدرسه» */
  title: string;
  /** Amount in Iranian Toman */
  amount: number;
  dueDate: ISODateString;
  paidAt?: ISODateString;
  status: PaymentStatus;
  method?: PaymentMethod;
}
