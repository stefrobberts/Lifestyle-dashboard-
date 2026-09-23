export type TrendPoint = { x: number; y: number };

/**
 * Lineaire regressie (kleinste-kwadraten) over de gegeven punten, voor de
 * trendlijn naast de echte meetpunten in de grafiek.
 */
export function calculateTrendLine(points: TrendPoint[]): { slope: number; intercept: number } | null {
  if (points.length < 2) return null;

  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

/** Verschil t.o.v. de vorige meting, afgerond op 1 decimaal. */
export function measurementDelta(current: number, previous: number): number {
  return Math.round((current - previous) * 10) / 10;
}
