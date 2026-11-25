import type { Payment } from '../types';

export const mockPayments: Payment[] = [
  { id: 'pay-01', studentId: 's-01', title: 'شهریه نوبت اول', amount: 4_800_000, dueDate: '2026-11-30', status: 'pending' },
  { id: 'pay-02', studentId: 's-01', title: 'سرویس مدرسه — آذرماه', amount: 1_200_000, dueDate: '2026-12-05', status: 'pending' },
  { id: 'pay-03', studentId: 's-02', title: 'شهریه نوبت اول', amount: 4_800_000, dueDate: '2026-10-15', paidAt: '2026-10-12T10:35:00', status: 'paid', method: 'card' },
  { id: 'pay-04', studentId: 's-03', title: 'شهریه نوبت اول', amount: 3_500_000, dueDate: '2026-11-10', status: 'overdue' },
  { id: 'pay-05', studentId: 's-04', title: 'کتاب و لوازم‌التحریر', amount: 950_000, dueDate: '2026-10-20', paidAt: '2026-10-18T09:12:00', status: 'paid', method: 'online' },
  { id: 'pay-06', studentId: 's-05', title: 'شهریه نوبت اول', amount: 4_800_000, dueDate: '2026-10-15', paidAt: '2026-10-10T16:45:00', status: 'paid', method: 'transfer' },
  { id: 'pay-07', studentId: 's-06', title: 'شهریه نوبت اول', amount: 4_800_000, dueDate: '2026-11-30', status: 'pending' },
  { id: 'pay-08', studentId: 's-09', title: 'شهریه نوبت اول', amount: 4_800_000, dueDate: '2026-11-10', status: 'overdue' },
  { id: 'pay-09', studentId: 's-10', title: 'کلاس فوق‌برنامه — نقاشی', amount: 600_000, dueDate: '2026-11-25', paidAt: '2026-11-11T12:20:00', status: 'paid', method: 'cash' },
  { id: 'pay-10', studentId: 's-12', title: 'سرویس مدرسه — آذرماه', amount: 1_200_000, dueDate: '2026-12-05', status: 'pending' },
  { id: 'pay-11', studentId: 's-25', title: 'کتاب و لوازم‌التحریر', amount: 950_000, dueDate: '2026-10-20', paidAt: '2026-10-17T11:05:00', status: 'paid', method: 'online' },
  { id: 'pay-12', studentId: 's-25', title: 'شهریه نوبت اول', amount: 4_800_000, dueDate: '2026-12-10', status: 'pending' },
  { id: 'pay-13', studentId: 's-12', title: 'شهریه نوبت اول', amount: 4_800_000, dueDate: '2026-10-30', status: 'overdue' },
];
