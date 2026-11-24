import type { Teacher } from '../types';

export const mockTeachers: Teacher[] = [
  { id: 't-01', employeeCode: 'EMP-1001', name: 'علی رستمی', phone: '09121110001', email: 'a.rostami@school.ir', specialty: 'ریاضی', subjectIds: ['sub-01'], classIds: ['c-01'], status: 'active', joinedAt: '2016-09-21', avatarColor: '#2563EB' },
  { id: 't-02', employeeCode: 'EMP-1002', name: 'مریم کریمی', phone: '09121110002', email: 'm.karimi@school.ir', specialty: 'ریاضی و حسابان', subjectIds: ['sub-02'], classIds: ['c-03', 'c-05'], status: 'active', joinedAt: '2019-09-21', avatarColor: '#16A34A' },
  { id: 't-03', employeeCode: 'EMP-1003', name: 'حسین محمدی', phone: '09121110003', email: 'h.mohammadi@school.ir', specialty: 'فیزیک', subjectIds: ['sub-03'], classIds: ['c-01', 'c-03', 'c-05'], status: 'active', joinedAt: '2014-09-21', avatarColor: '#0EA5E9' },
  { id: 't-04', employeeCode: 'EMP-1004', name: 'زهرا تقوی', phone: '09121110004', email: 'z.taghavi@school.ir', specialty: 'زیست‌شناسی', subjectIds: ['sub-04'], classIds: ['c-02', 'c-04'], status: 'active', joinedAt: '2021-09-21', avatarColor: '#DB2777' },
  { id: 't-05', employeeCode: 'EMP-1005', name: 'مینا عباسی', phone: '09121110005', email: 'm.abbasi@school.ir', specialty: 'شیمی', subjectIds: ['sub-05'], classIds: ['c-01', 'c-02', 'c-03', 'c-04', 'c-05'], status: 'active', joinedAt: '2017-09-21', avatarColor: '#7C3AED' },
  { id: 't-06', employeeCode: 'EMP-1006', name: 'رضا رضایی', phone: '09121110006', email: 'r.rezaei@school.ir', specialty: 'زبان انگلیسی و عربی', subjectIds: ['sub-07', 'sub-08'], classIds: ['c-01', 'c-02', 'c-03', 'c-06'], status: 'active', joinedAt: '2012-09-21', avatarColor: '#F59E0B' },
  { id: 't-07', employeeCode: 'EMP-1007', name: 'لیلا احمدی', phone: '09121110007', email: 'l.ahmadi@school.ir', specialty: 'ادبیات فارسی و جغرافیا', subjectIds: ['sub-06', 'sub-12'], classIds: ['c-01', 'c-02', 'c-06'], status: 'active', joinedAt: '2010-09-21', avatarColor: '#059669' },
  { id: 't-08', employeeCode: 'EMP-1008', name: 'محسن شریفی', phone: '09121110008', email: 'm.sharifi@school.ir', specialty: 'معارف و تربیت بدنی', subjectIds: ['sub-09', 'sub-10', 'sub-11'], classIds: ['c-01', 'c-02', 'c-03', 'c-04'], status: 'active', joinedAt: '2022-09-21', avatarColor: '#64748B' },
];
