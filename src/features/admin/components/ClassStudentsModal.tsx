/**
 * Admin feature — class roster modal (students of one class).
 */
import { Avatar, Badge, Button, EmptyState, Modal } from '../../../components';
import type { SchoolClass, Student } from '../../../types';
import { STUDENT_STATUS_LABELS } from '../lib/labels';
import { Inbox } from 'lucide-react';

interface ClassStudentsModalProps {
  schoolClass: SchoolClass | null;
  students: Student[];
  onClose: () => void;
}

export function ClassStudentsModal({ schoolClass, students, onClose }: ClassStudentsModalProps) {
  return (
    <Modal
      open={schoolClass !== null}
      onClose={onClose}
      title={schoolClass ? `دانش‌آموزان ${schoolClass.name}` : 'دانش‌آموزان کلاس'}
      description={
        schoolClass
          ? `ظرفیت ${schoolClass.capacity} نفر • ${schoolClass.enrolled} نفر ثبت‌نام کرده‌اند.`
          : undefined
      }
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          بستن
        </Button>
      }
    >
      {students.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="دانش‌آموزی در این کلاس ثبت نشده است"
          description="از صفحه دانش‌آموزان می‌توانید دانش‌آموز جدید به این کلاس اضافه کنید."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {students.map((student) => (
            <li
              key={student.id}
              className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={student.name} color={student.avatarColor} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-text">{student.name}</p>
                  <p className="text-[11px] text-text-muted">
                    کد دانش‌آموزی {student.studentCode} • ولی: {student.guardianName}
                  </p>
                </div>
              </div>
              <Badge variant={STUDENT_STATUS_LABELS[student.status].variant}>
                {STUDENT_STATUS_LABELS[student.status].label}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
