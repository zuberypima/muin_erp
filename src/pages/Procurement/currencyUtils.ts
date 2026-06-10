/**
 * Shared currency formatting utilities for the Procurement module.
 * All amounts are in TZS (Tanzanian Shillings).
 */

/**
 * Format a number as TZS currency: "TZS 1,234,567"
 */
export const fmtKES = (value: number | string | undefined | null): string => {
  const n = Number(value ?? 0);
  return `TZS ${n.toLocaleString('sw-TZ', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

/**
 * Format a compact TZS amount for KPI cards (e.g. TZS 1.2M)
 */
export const fmtKESCompact = (value: number | string | undefined | null): string => {
  const n = Number(value ?? 0);
  if (n >= 1_000_000) return `TZS ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `TZS ${(n / 1_000).toFixed(1)}K`;
  return `TZS ${n.toLocaleString('sw-TZ')}`;
};
