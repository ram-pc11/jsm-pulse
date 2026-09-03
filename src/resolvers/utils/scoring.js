// Pulse AI's own grade/severity computation. This is derived client-side from
// aggregated ticket data already fetched by the other resolvers -- it is not
// backed by any Jira/JSM API call.

const GRADE_THRESHOLDS = [
  { min: 90, grade: 'A' },
  { min: 80, grade: 'B' },
  { min: 70, grade: 'C' },
  { min: 60, grade: 'D' },
  { min: 0, grade: 'F' },
];

export function gradeFromScore(score) {
  return GRADE_THRESHOLDS.find(({ min }) => score >= min).grade;
}

export function severityFromScore(score) {
  if (score >= 90) return 'low';
  if (score >= 75) return 'moderate';
  if (score >= 60) return 'elevated';
  if (score >= 40) return 'high';
  return 'critical';
}

// counts: { incidents, problems, changes, breachedSlaCount, totalSlaTracked }
export function computeCompositeScore(counts) {
  const {
    incidents = 0,
    problems = 0,
    changes = 0,
    breachedSlaCount = 0,
    totalSlaTracked = 0,
  } = counts;

  const slaBreachRate = totalSlaTracked > 0 ? breachedSlaCount / totalSlaTracked : 0;
  const volumePenalty = Math.min(40, (incidents * 2) + (problems * 3) + (changes * 1));
  const slaPenalty = Math.min(40, slaBreachRate * 100);

  const score = Math.max(0, Math.round(100 - volumePenalty - slaPenalty));

  return {
    score,
    grade: gradeFromScore(score),
    severity: severityFromScore(score),
  };
}
