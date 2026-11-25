/**
 * Chart styling & Persian formatters for Recharts inside the student panel.
 *
 * Uses strictly the global design tokens (#2563EB, #1E3A8A, #16A34A, #F59E0B,
 * #DC2626, #0EA5E9, #0F172A, #64748B, #E2E8F0, #FFFFFF).
 */

import type { ReactNode } from 'react';
import { toPersianDigits } from '../../../utils';
import { formatPersianDecimal } from './studentAnalytics';

export const STUDENT_CHART_COLORS = {
  primary: '#2563EB',
  navy: '#1E3A8A',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#0EA5E9',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  surface: '#FFFFFF',
} as const;

export const studentAxisProps = {
  tick: { fill: STUDENT_CHART_COLORS.muted, fontSize: 11, fontFamily: 'inherit' },
  tickLine: false,
  axisLine: { stroke: STUDENT_CHART_COLORS.border },
} as const;

export const studentTooltipProps = {
  contentStyle: {
    borderRadius: 10,
    border: `1px solid ${STUDENT_CHART_COLORS.border}`,
    backgroundColor: STUDENT_CHART_COLORS.surface,
    boxShadow: '0 8px 24px -8px rgba(15, 23, 42, 0.12)',
    fontSize: 12,
    fontFamily: 'inherit',
    direction: 'rtl' as const,
    textAlign: 'right' as const,
    padding: '8px 12px',
  },
  labelStyle: {
    color: STUDENT_CHART_COLORS.text,
    fontWeight: 700,
    marginBottom: 4,
    fontFamily: 'inherit',
  },
  itemStyle: {
    color: STUDENT_CHART_COLORS.muted,
    fontFamily: 'inherit',
  },
};

export function formatChartTick(value: number): string {
  return toPersianDigits(Math.round(value * 100) / 100);
}

type TooltipResult = [ReactNode, ReactNode];

export function scoreTooltipFormatter(value: unknown, name: unknown): TooltipResult {
  const numeric = Number(value) || 0;
  return [`${formatPersianDecimal(numeric, 2)} از ۲۰`, String(name ?? 'نمره')];
}

export function countTooltipFormatter(unit = 'جلسه') {
  return (value: unknown, name: unknown): TooltipResult => {
    const numeric = Number(value) || 0;
    return [`${toPersianDigits(numeric)} ${unit}`, String(name ?? '')];
  };
}
