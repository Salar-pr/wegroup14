import type { Homework } from '../types';

export const mockHomework: Homework[] = [
  { id: 'hw-01', title: 'حل تمرینات صفحه ۴۵ تا ۵۰', description: 'تمرینات زوج ریاضی فصل سوم در دفتر حل شده تحویل داده شود.', subjectId: 'sub-01', teacherId: 't-01', classId: 'c-01', assignedAt: '2026-11-18', dueDate: '2026-11-27', maxScore: 2 },
  { id: 'hw-02', title: 'پاسخ تمرین‌های فصل نور', description: 'تمرین‌های ۳ تا ۸ فصل «نور و بازتاب» با رسم شکل پاسخ داده شود.', subjectId: 'sub-03', teacherId: 't-03', classId: 'c-01', assignedAt: '2026-11-20', dueDate: '2026-11-29', maxScore: 2 },
  { id: 'hw-03', title: 'نگارش انشا درباره پاییز', description: 'انشای حداقل ۱۵ سطره با رعایت قواعد نگارشی.', subjectId: 'sub-06', teacherId: 't-07', classId: 'c-01', assignedAt: '2026-11-19', dueDate: '2026-11-26', maxScore: 3 },
  { id: 'hw-04', title: 'مرور لغات درس ۴', description: 'به خاطر سپردن لغات پرتکرار درس ۴ کتاب زبان انگلیسی و جمله‌سازی با پنج لغت.', subjectId: 'sub-07', teacherId: 't-06', classId: 'c-01', assignedAt: '2026-11-22', dueDate: '2026-11-25', maxScore: 1 },
  { id: 'hw-05', title: 'حل معادلات درجه دو', description: '۱۲ معادله صفحه ۶۲ با روش تشکیل دلتای فصل جبر ۲ حل شود.', subjectId: 'sub-02', teacherId: 't-02', classId: 'c-03', assignedAt: '2026-11-20', dueDate: '2026-11-28', maxScore: 2 },
  { id: 'hw-06', title: 'خلاصه فصل ژنتیک', description: 'خلاصه فصل «ژنتیک و وراثت» در یک برگه A4 به همراه دیکشنری اصطلاحات.', subjectId: 'sub-04', teacherId: 't-04', classId: 'c-02', assignedAt: '2026-11-21', dueDate: '2026-11-30', maxScore: 2 },
  { id: 'hw-07', title: 'گزارش آزمایش تیتراسیون', description: 'گزارش کامل آزمایش تیتراسیون اسید و باز شامل هدف، شرح، جدول داده‌ها و نتیجه‌گیری.', subjectId: 'sub-05', teacherId: 't-05', classId: 'c-02', assignedAt: '2026-11-22', dueDate: '2026-12-02', maxScore: 3 },
  { id: 'hw-08', title: 'تحقیق درباره عید غدیر', description: 'تحقیق دو صفحه‌ای درباره تاریخچه عید غدیر خم.', subjectId: 'sub-09', teacherId: 't-08', classId: 'c-01', assignedAt: '2026-11-23', dueDate: '2026-12-03', maxScore: 1 },
];
