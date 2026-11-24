/** Central export for every domain model. Import types from `src/types`. */
export type { ID, ISODateString } from './common';
export type { UserRole, User, DemoAccount } from './user';
export type { StudentStatus, Student } from './student';
export type { TeacherStatus, Teacher } from './teacher';
export type { ParentRelation, Parent } from './parent';
export type { GradeLevel, SchoolClass } from './schoolClass';
export type { Subject } from './subject';
export type { GradeType, Grade } from './grade';
export type { AttendanceStatus, Attendance } from './attendance';
export type { Homework } from './homework';
export type {
  AnnouncementAudience,
  AnnouncementPriority,
  Announcement,
} from './announcement';
export type { PaymentStatus, PaymentMethod, Payment } from './payment';
export type { MessageSender, Message } from './message';
export type { Weekday, ScheduleEntry } from './schedule';
export { WEEKDAY_LABELS } from './schedule';
export type { ToastType, Toast } from './toast';
