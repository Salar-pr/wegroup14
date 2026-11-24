import type { SchoolClass } from '../types';

export const mockClasses: SchoolClass[] = [
  { id: 'c-01', name: 'دهم ریاضی ۱', gradeLevel: 'دهم', field: 'ریاضی', homeroomTeacherId: 't-01', capacity: 32, enrolled: 28, room: 'کلاس ۲' },
  { id: 'c-02', name: 'دهم تجربی ۱', gradeLevel: 'دهم', field: 'تجربی', homeroomTeacherId: 't-04', capacity: 32, enrolled: 30, room: 'کلاس ۴' },
  { id: 'c-03', name: 'یازدهم ریاضی ۱', gradeLevel: 'یازدهم', field: 'ریاضی', homeroomTeacherId: 't-02', capacity: 30, enrolled: 27, room: 'کلاس ۵' },
  { id: 'c-04', name: 'یازدهم تجربی ۱', gradeLevel: 'یازدهم', field: 'تجربی', homeroomTeacherId: 't-05', capacity: 30, enrolled: 29, room: 'کلاس ۷' },
  { id: 'c-05', name: 'دوازدهم ریاضی ۱', gradeLevel: 'دوازدهم', field: 'ریاضی', homeroomTeacherId: 't-02', capacity: 28, enrolled: 25, room: 'کلاس ۸' },
  { id: 'c-06', name: 'دوازدهم انسانی ۱', gradeLevel: 'دوازدهم', field: 'انسانی', homeroomTeacherId: 't-07', capacity: 30, enrolled: 24, room: 'کلاس ۹' },
];
