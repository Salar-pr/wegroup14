import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  STUDENT_CHART_COLORS,
  countTooltipFormatter,
  formatChartTick,
  scoreTooltipFormatter,
  studentAxisProps,
  studentTooltipProps,
} from '../lib/chartTheme';
import type {
  StudentAcademicSummary,
  StudentAttendanceSummary,
  SubjectGradeSummary,
} from '../lib/studentAnalytics';

/* -------------------------------------------------------------------------- */
/*             1. Subject vs Class Average Bar Chart (Recharts)               */
/* -------------------------------------------------------------------------- */

export function SubjectPerformanceBarChart({
  subjects,
  height = 290,
}: {
  subjects: SubjectGradeSummary[];
  height?: number;
}) {
  const data = subjects.map((item) => ({
    name: item.subjectName,
    'میانگین من': item.average,
    'میانگین کلاس': item.classAverage,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-[13px] text-text-muted">
        هنوز داده‌ای برای نمایش نمودار دروس ثبت نشده است.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }} dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid
            stroke={STUDENT_CHART_COLORS.border}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis dataKey="name" {...studentAxisProps} />
          <YAxis
            domain={[0, 20]}
            ticks={[0, 5, 10, 15, 20]}
            tickFormatter={formatChartTick}
            width={34}
            {...studentAxisProps}
          />
          <Tooltip
            {...studentTooltipProps}
            cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
            formatter={scoreTooltipFormatter}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={30}
            iconSize={10}
            wrapperStyle={{ fontSize: 12, fontFamily: 'inherit', direction: 'rtl' }}
          />
          <ReferenceLine
            y={10}
            stroke={STUDENT_CHART_COLORS.danger}
            strokeDasharray="4 4"
            strokeOpacity={0.55}
          />
          <Bar
            dataKey="میانگین من"
            fill={STUDENT_CHART_COLORS.primary}
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            dataKey="میانگین کلاس"
            fill={STUDENT_CHART_COLORS.info}
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*               2. Chronological Grade Trend Line Chart (Recharts)           */
/* -------------------------------------------------------------------------- */

export function GradeTrendLineChart({
  series,
  targetGpa,
  height = 290,
}: {
  series: StudentAcademicSummary['progressSeries'];
  targetGpa?: number;
  height?: number;
}) {
  const data = series.map((point) => ({
    name: point.label,
    'نمره کسب‌شده': point.score,
    'میانگین تجمعی': point.rollingAverage,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-[13px] text-text-muted">
        نمره‌ای برای رسم روند پیشرفت ثبت نشده است.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }} dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 20, left: 0, bottom: 8 }}>
          <CartesianGrid
            stroke={STUDENT_CHART_COLORS.border}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis dataKey="name" {...studentAxisProps} />
          <YAxis
            domain={[8, 20]}
            ticks={[8, 10, 12, 15, 17, 20]}
            tickFormatter={formatChartTick}
            width={34}
            {...studentAxisProps}
          />
          <Tooltip {...studentTooltipProps} formatter={scoreTooltipFormatter} />
          <Legend
            verticalAlign="top"
            align="right"
            height={30}
            iconSize={10}
            wrapperStyle={{ fontSize: 12, fontFamily: 'inherit', direction: 'rtl' }}
          />
          {targetGpa !== undefined && (
            <ReferenceLine
              y={targetGpa}
              stroke={STUDENT_CHART_COLORS.success}
              strokeDasharray="5 5"
              strokeOpacity={0.75}
            />
          )}
          <Line
            type="monotone"
            dataKey="نمره کسب‌شده"
            stroke={STUDENT_CHART_COLORS.primary}
            strokeWidth={2.5}
            dot={{
              r: 4,
              fill: STUDENT_CHART_COLORS.surface,
              stroke: STUDENT_CHART_COLORS.primary,
              strokeWidth: 2,
            }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="میانگین تجمعی"
            stroke={STUDENT_CHART_COLORS.navy}
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: STUDENT_CHART_COLORS.navy }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                3. Attendance Composition Donut Chart (Recharts)            */
/* -------------------------------------------------------------------------- */

export function AttendanceBreakdownChart({
  summary,
  height = 240,
}: {
  summary: StudentAttendanceSummary;
  height?: number;
}) {
  const segments = [
    { name: 'حاضر', value: summary.present, color: STUDENT_CHART_COLORS.success },
    { name: 'تأخیر', value: summary.late, color: STUDENT_CHART_COLORS.warning },
    { name: 'غیبت موجه', value: summary.excused, color: STUDENT_CHART_COLORS.info },
    { name: 'غایب', value: summary.absent, color: STUDENT_CHART_COLORS.danger },
  ].filter((item) => item.value > 0);

  if (segments.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-[13px] text-text-muted">
        رکورد حضوری ثبت نشده است.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }} dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={segments}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={84}
            paddingAngle={3}
          >
            {segments.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip {...studentTooltipProps} formatter={countTooltipFormatter('روز')} />
          <Legend
            verticalAlign="bottom"
            height={28}
            iconSize={10}
            wrapperStyle={{ fontSize: 12, fontFamily: 'inherit', direction: 'rtl' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
