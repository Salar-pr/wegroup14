/** Shared primitive aliases used across all domain models. */

export type ID = string;

/**
 * ISO 8601 date or datetime, e.g. "2026-11-24" or "2026-11-24T08:30:00".
 * Dates are always absolute strings; formatting to Jalali happens in the UI
 * through `src/utils/date`.
 */
export type ISODateString = string;
