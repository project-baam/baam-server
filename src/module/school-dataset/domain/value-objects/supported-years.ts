export const supportedYears = [2024, 2025, 2026, 2027] as const;
export type SupportedYears = (typeof supportedYears)[number];
