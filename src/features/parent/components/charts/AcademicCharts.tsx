import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SubjectAverage } from '../../lib/parentAnalytics';
import type { ProgressPoint } from '../../lib/parentAnalytics';
import {
  CHART,
  axisProps,
  chartNumber,
  chartScore,
  tooltipCount,
  tooltipPercentOrScore,
  tooltipScore,
  tooltipScoreBySeries,
  tooltipStyle,
} from '../../lib/chartTheme';

/* -------------------------------------------------------------------------- */
/*                       Subject averages — horizontal bars                   */
/* -------------------------------------------------------------------------- */

export function SubjectAverageChart({
  subjects,
  height,
}: {
  subjects: SubjectAverage[];
  /** Defaults to a height that keeps every subject label readable. */
  height?: number;
}) {
  const data = subjects.map((subject) => ({
    name: subject.subjectName,
    average: subject.average,
    color: subject.color,
  }));

  // Grow with the number of subjects so category labels never collapse.
  const chartHeight = height ?? Math.max(180, subjects.length * 34 + 40);

  return (
    <div style={{ width: '100%', height: chartHeight }} dir="ltr">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 20]}
            ticks={[0, 5, 10, 15, 20]}
            tickFormatter={(value: number) => chartNumber(value, 0)}
            {...axisProps}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={96}
            interval={0}
            tickLine={false}
            tick={{
              fill: CHART.muted,
              fontSize: 11,
              fontFamily: 'inherit',
              textAnchor: 'end',
            }}
          />
          <Tooltip
            {...tooltipStyle}
            cursor={{ fill: 'rgba(226, 232, 240, 0.45)' }}
            formatter={tooltipScore('میانگین')}
          />
          <ReferenceLine
            x={10}
            stroke={CHART.warning}
            strokeDasharray="4 4"
            label={{
              value: 'حد نصاب',
              position: 'top',
              fill: CHART.warning,
              fontSize: 10,
              fontFamily: 'inherit',
            }}
          />
          <Bar dataKey="average" radius={[0, 6, 6, 0]} barSize={16} isAnimationActive>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                    Grade progress over time (line + rolling)               */
/* -------------------------------------------------------------------------- */

export function GradeProgressChart({
  points,
  height = 280,
}: {
  points: ProgressPoint[];
  height?: number;
}) {
  const data = points.map((point) => ({
    label: point.label,
    نمره: point.score,
    میانگین: point.rolling,
    title: `${point.title} — ${point.subjectName}`,
  }));

  return (
    <div style={{ width: '100%', height }} dir="ltr">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis
            domain={[6, 20]}
            ticks={[6, 10, 14, 17, 20]}
            tickFormatter={(value: number) => chartNumber(value, 0)}
            width={34}
            {...axisProps}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={tooltipScoreBySeries}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={28}
            iconSize={9}
            wrapperStyle={{ fontSize: 11, fontFamily: 'inherit', direction: 'rtl' }}
          />
          <ReferenceLine y={17} stroke={CHART.success} strokeDasharray="4 4" strokeOpacity={0.6} />
          <ReferenceLine y={10} stroke={CHART.danger} strokeDasharray="4 4" strokeOpacity={0.6} />
          <Line
            type="monotone"
            dataKey="نمره"
            stroke={CHART.primary}
            strokeWidth={2}
            dot={{ r: 3.5, fill: CHART.surface, stroke: CHART.primary, strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="میانگین"
            stroke={CHART.info}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                     Score distribution (coloured bars)                      */
/* -------------------------------------------------------------------------- */

export function ScoreDistributionChart({
  distribution,
  height = 200,
}: {
  distribution: Array<{ label: string; count: number; tone: string }>;
  height?: number;
}) {
  const toneColor: Record<string, string> = {
    success: CHART.success,
    info: CHART.info,
    warning: CHART.warning,
    danger: CHART.danger,
  };

  return (
    <div style={{ width: '100%', height }} dir="ltr">
      <ResponsiveContainer>
        <BarChart data={distribution} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis
            allowDecimals={false}
            width={28}
            tickFormatter={(value: number) => chartNumber(value, 0)}
            {...axisProps}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={tooltipCount('تعداد نمره')}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
            {distribution.map((entry) => (
              <Cell key={entry.label} fill={toneColor[entry.tone] ?? CHART.primary} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                     Subject profile radar (strengths/weaknesses)           */
/* -------------------------------------------------------------------------- */

export function SubjectRadarChart({
  subjects,
  height = 280,
}: {
  subjects: SubjectAverage[];
  height?: number;
}) {
  // Keep the radar readable: at most 8 axes.
  const data = subjects.slice(0, 8).map((subject) => ({
    subject: subject.subjectName,
    score: subject.average,
  }));

  // A radar needs at least three axes to describe a shape; below that we show
  // a plain readout instead of a degenerate line.
  if (data.length < 3) {
    return (
      <div className="flex h-full flex-col justify-center gap-2 py-4">
        <p className="text-center text-[11px] leading-6 text-text-muted">
          نمودار پروفایل درسی برای مقایسهٔ هم‌زمان حداقل سه درس معنا پیدا می‌کند. برای این دانش‌آموز
          فعلاً {chartNumber(data.length, 0)} درس نمره دارد:
        </p>
        <ul className="mx-auto flex w-full max-w-xs flex-col gap-1.5">
          {subjects.map((subject) => (
            <li
              key={subject.subjectId}
              className="flex items-center justify-between rounded-btn border border-border px-2.5 py-1.5"
            >
              <span className="text-[11.5px] font-semibold text-text">{subject.subjectName}</span>
              <span className="text-[11.5px] font-extrabold text-primary">
                {chartScore(subject.average)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }} dir="ltr">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke={CHART.grid} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: CHART.muted, fontSize: 10, fontFamily: 'inherit' }}
          />
          <PolarRadiusAxis
            domain={[0, 20]}
            tick={{ fill: CHART.axis, fontSize: 9, fontFamily: 'inherit' }}
            tickFormatter={(value: number) => chartNumber(value, 0)}
            axisLine={false}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={tooltipScore('میانگین درس')}
          />
          <Radar
            dataKey="score"
            stroke={CHART.primary}
            fill={CHART.primary}
            fillOpacity={0.22}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                 Multi-child comparison (grouped bar by subject)            */
/* -------------------------------------------------------------------------- */

export interface ComparisonSeries {
  childId: string;
  childName: string;
  color: string;
  values: Array<{ subjectName: string; value: number }>;
}

export function ChildComparisonChart({
  series,
  metricLabel,
  maxValue,
  height = 300,
}: {
  series: ComparisonSeries[];
  metricLabel: string;
  maxValue: number;
  height?: number;
}) {
  // Union of subject names across children, preserving first series order.
  const subjectNames: string[] = [];
  for (const child of series) {
    for (const item of child.values) {
      if (!subjectNames.includes(item.subjectName)) subjectNames.push(item.subjectName);
    }
  }

  const data = subjectNames.map((subjectName) => {
    const row: Record<string, string | number> = { name: subjectName };
    for (const child of series) {
      row[child.childName] = child.values.find((item) => item.subjectName === subjectName)?.value ?? 0;
    }
    return row;
  });

  return (
    <div style={{ width: '100%', height }} dir="ltr">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }} barGap={4}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" {...axisProps} interval={0} angle={0} height={34} />
          <YAxis
            domain={[0, maxValue]}
            width={34}
            tickFormatter={(value: number) => chartNumber(value, 0)}
            {...axisProps}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={tooltipPercentOrScore(metricLabel, metricLabel === 'درصد' ? 'percent' : 'score')}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={28}
            iconSize={9}
            wrapperStyle={{ fontSize: 11, fontFamily: 'inherit', direction: 'rtl' }}
          />
          {series.map((child) => (
            <Bar
              key={child.childId}
              dataKey={child.childName}
              fill={child.color}
              radius={[5, 5, 0, 0]}
              barSize={18}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                        Attendance breakdown (pie-ish bar)                   */
/* -------------------------------------------------------------------------- */

export function AttendanceDonutLegend({
  items,
}: {
  items: Array<{ label: string; value: number; color: string }>;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
        return (
          <li key={item.label} className="flex items-center gap-2 text-[11px]">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className="flex-1 text-text-muted">{item.label}</span>
            <span className="font-bold text-text">{chartNumber(item.value, 0)}</span>
            <span className="w-10 text-end text-text-muted">{chartNumber(percent, 0)}٪</span>
          </li>
        );
      })}
    </ul>
  );
}
