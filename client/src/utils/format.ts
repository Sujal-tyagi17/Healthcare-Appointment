/**
 * Cleanly format doctor names to guarantee exactly one "Dr." prefix
 */
export function formatDoctorName(name?: string): string {
  if (!name) return 'Doctor';
  const cleaned = name.replace(/^(Dr\.?\s*)+/i, '').trim();
  return cleaned ? `Dr. ${cleaned}` : 'Doctor';
}
