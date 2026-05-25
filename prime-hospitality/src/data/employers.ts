// Hardcoded list of Telegram user IDs that are registered employers
// In production this would be checked against Supabase
export const EMPLOYER_TELEGRAM_IDS: number[] = [
  987654321, // Demo employer 1 — Skylight Hotel HR
  555000111, // Demo employer 2 — Radisson Blu HR
  112233445, // Demo employer 3 — Kaldis Coffee Manager
];

export function isEmployer(telegramId: number): boolean {
  return EMPLOYER_TELEGRAM_IDS.includes(telegramId);
}
