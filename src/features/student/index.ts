export { default, StudentApp } from './StudentApp';

// Pages
export { default as StudentDashboardPage } from './pages/DashboardPage';
export { default as StudentSchedulePage } from './pages/SchedulePage';
export { default as StudentGradesPage } from './pages/GradesPage';
export { default as StudentAttendancePage } from './pages/AttendancePage';
export { default as StudentHomeworkPage } from './pages/HomeworkPage';
export { default as StudentAnnouncementsPage } from './pages/AnnouncementsPage';
export { default as StudentProfilePage } from './pages/ProfilePage';
export { default as StudentReportCardPage } from './pages/ReportCardPage';
export { default as StudentMessagesPage } from './pages/MessagesPage';

// Feature components
export { StudentProfileCard } from './components/StudentProfileCard';
export { WeeklySchedule } from './components/WeeklySchedule';
export { GradeCard } from './components/GradeCard';
export { SectionCard } from './components/SectionCard';
export { StudentQuickBar } from './components/StudentQuickBar';
export { HomeworkSubmissionModal } from './components/HomeworkSubmissionModal';
export {
  SubjectPerformanceBarChart,
  GradeTrendLineChart,
  AttendanceBreakdownChart,
} from './components/AcademicCharts';
