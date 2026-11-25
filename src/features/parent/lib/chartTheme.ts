/**
 * Chart theming for the parent panel.
 *
 * Recharts renders SVG text with latin digit + latin locale defaults, so every
 * axis / tooltip in this feature is Persian-ised through these constants and
 * the formatters below (never `toLocaleString()` inline in a page).
 */

export const CHART = {
  primary: '#2563EB',
  navy: '#1E3A8A',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#0EA5E9',
  grid: '#E2E8F0',
  axis: '#94A3B8',
  text: '#0F172A',
  muted: '#64748B',
  surface: '#FFFFFF',
} as const;

/** Shared axis props: Persian font, muted color, compact ticks. */
export const axisProps = {
  tick: { fill: CHART.axis, fontSize: 11, fontFamily: 'inherit' },
  tickLine: false,
  axisLine: { stroke: CHART.grid },
} as const;

/** Tooltip card style matching the design system surfaces. */
export const tooltipStyle = {
  contentStyle: {
    borderRadius: 10,
    border: `1px solid ${CHART.grid}`,
    boxShadow: '0 8px 24px -8px rgba(15, 23, 42, 0.12)',
    fontSize: 12,
    fontFamily: 'inherit',
    direction: 'rtl' as const,
    textAlign: 'right' as const,
    padding: '8px 10px',
  },
  labelStyle: { color: CHART.text, fontWeight: 700, marginBottom: 2, fontFamily: 'inherit' },
  itemStyle: { color: CHART.muted, fontFamily: 'inherit' },
};

/** Persian number formatter for chart ticks/labels. */
export function chartNumber(value: number, maximumFractionDigits = 1): string {
  return value.toLocaleString('fa-IR', { maximumFractionDigits });
}

/** Persian score with at most two decimals, e.g. ۱۸٫۷۵ */
export function chartScore(value: number): string {
  return value.toLocaleString('fa-IR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/** Persian percent, e.g. ۹۱٪ */
export function chartPercent(value: number): string {
  return `${value.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}٪`;
}

/* -------------------------------------------------------------------------- */
/*                       Typed Recharts tooltip formatters                    */
/* -------------------------------------------------------------------------- */

import type { ReactNode } from 'react';

type TooltipTuple = [ReactNode, ReactNode];

/**
 * Recharts 3 types the tooltip `value` as `ValueType | undefined` (string,
 * number, or array), so feature formatters must accept the loose type and
 * narrow inside. These helpers keep the pages free of casts.
 */
export function tooltipScore(label: string) {
  return (value: unknown): TooltipTuple => [chartScore(Number(value) || 0), label];
}

export function tooltipScoreBySeries(value: unknown, name: unknown): TooltipTuple {
  return [chartScore(Number(value) || 0), String(name ?? '')];
}

export function tooltipCount(label: string) {
  return (value: unknown): TooltipTuple => [chartNumber(Number(value) || 0, 0), label];
}

export function tooltipPercentOrScore(
  metricLabel: string,
  mode: 'score' | 'percent',
) {
  return (value: unknown, name: unknown): TooltipTuple => {
    const numeric = Number(value) || 0;
    return [
      mode === 'percent' ? chartPercent(numeric) : chartScore(numeric),
      String(name ?? metricLabel),
    ];
  };
}
