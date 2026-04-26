export const SCORE_FORMULA_VERSION = 'brain-score-v1';
export const SCORE_HISTORY_RETENTION = 20;

export const SCORE_WEIGHTS = {
  maturity: {
    delivery: 0.30,
    quality: 0.20,
    operations: 0.20,
    knowledge: 0.20,
    integrity: 0.10
  },
  health: {
    operations: 0.40,
    quality: 0.20,
    delivery: 0.10,
    knowledge: 0.10,
    riskPenalty: 0.20
  }
};

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function boolScore(value, yes = 100, no = 40) {
  return value ? yes : no;
}

export function computeScores(snapshotMeta = {}, integrityAlertCount = 0) {
  const deliveryInput = snapshotMeta.delivery ?? {};
  const qualityInput = snapshotMeta.quality ?? {};
  const operationsInput = snapshotMeta.operations ?? {};
  const knowledgeInput = snapshotMeta.knowledge ?? {};
  const riskInput = snapshotMeta.risk ?? {};

  const freshnessScore = Math.max(0, 100 - (Number(knowledgeInput.decisionLogFreshnessDays ?? 0) * 5));
  const deliveryScore = Math.round(avg([
    Number(deliveryInput.scopeClarity ?? 0),
    Number(deliveryInput.milestoneClarity ?? 0),
    Number(deliveryInput.progressPercent ?? 0),
    Number(deliveryInput.predictabilityScore ?? 0)
  ]));
  const qualityScore = Math.round(avg([
    Number(qualityInput.testCoverageScore ?? 0),
    Number(qualityInput.codeReviewScore ?? 0)
  ]));
  const operationsScore = Math.round(avg([
    boolScore(Boolean(operationsInput.ciHealthy), 100, 40),
    boolScore(Boolean(operationsInput.deployReady), 100, 50),
    boolScore(Boolean(operationsInput.rollbackReady), 100, 50),
    boolScore(Boolean(operationsInput.syncHealthy), 100, 30)
  ]));
  const knowledgeScore = Math.round(avg([
    Number(knowledgeInput.docsCoverageScore ?? 0),
    Number(knowledgeInput.runbookCoverageScore ?? 0),
    Number(knowledgeInput.onboardingScore ?? 0),
    freshnessScore
  ]));
  const integrityScore = Math.max(0, 100 - Math.min(40, integrityAlertCount * 15));
  const riskPenaltyScore = Math.min(
    40,
    (Number(riskInput.blockedCount ?? 0) * 12)
    + (Number(riskInput.openRisks ?? 0) * 4)
    + (Number(riskInput.securityRiskScore ?? 0) * 0.15)
    + (Number(riskInput.dependencyRiskScore ?? 0) * 0.1)
  );

  const maturityScore = Math.round(
    (SCORE_WEIGHTS.maturity.delivery * deliveryScore)
    + (SCORE_WEIGHTS.maturity.quality * qualityScore)
    + (SCORE_WEIGHTS.maturity.operations * operationsScore)
    + (SCORE_WEIGHTS.maturity.knowledge * knowledgeScore)
    + (SCORE_WEIGHTS.maturity.integrity * integrityScore)
  );

  const healthScore = Math.round(
    (SCORE_WEIGHTS.health.operations * operationsScore)
    + (SCORE_WEIGHTS.health.quality * qualityScore)
    + (SCORE_WEIGHTS.health.delivery * deliveryScore)
    + (SCORE_WEIGHTS.health.knowledge * knowledgeScore)
    + (SCORE_WEIGHTS.health.riskPenalty * (100 - riskPenaltyScore))
  );

  return {
    formulaId: SCORE_FORMULA_VERSION,
    computedAt: new Date().toISOString(),
    weights: SCORE_WEIGHTS,
    inputs: {
      delivery: deliveryInput,
      quality: qualityInput,
      operations: operationsInput,
      knowledge: {
        ...knowledgeInput,
        freshnessScore
      },
      risk: {
        ...riskInput,
        integrityAlertCount
      }
    },
    components: {
      deliveryScore,
      qualityScore,
      operationsScore,
      knowledgeScore,
      integrityScore,
      riskPenaltyScore
    },
    results: {
      maturityScore,
      healthScore
    },
    drivers: [
      Boolean(operationsInput.rollbackReady) ? 'rollbackReady' : 'rollbackNotReady',
      Boolean(operationsInput.syncHealthy) ? 'syncHealthy' : 'syncNotHealthy',
      Number(riskInput.blockedCount ?? 0) === 0 ? 'blockedCount=0' : `blockedCount=${riskInput.blockedCount}`,
      integrityAlertCount === 0 ? 'integrityClean' : `integrityAlerts=${integrityAlertCount}`
    ]
  };
}

export function deriveTrend(historyEntries = [], currentScores, currentRiskState = {}) {
  const previous = historyEntries.length > 0 ? historyEntries[historyEntries.length - 1] : null;
  const maturityDelta = previous ? currentScores.maturityScore - Number(previous.maturityScore ?? 0) : 0;
  const healthDelta = previous ? currentScores.healthScore - Number(previous.healthScore ?? 0) : 0;
  const hasHighRisk = Boolean(currentRiskState.blockedCount > 0 || currentRiskState.integrityAlertCount > 0);

  let trend = 'stable';
  if (!previous) trend = 'new';
  else if (hasHighRisk) trend = 'watch';
  else if (historyEntries.length >= 2) {
    const recent = [...historyEntries.slice(-2), {
      maturityScore: currentScores.maturityScore,
      healthScore: currentScores.healthScore
    }];
    const first = recent[0];
    const last = recent[recent.length - 1];
    const recentHealthDelta = Number(last.healthScore ?? 0) - Number(first.healthScore ?? 0);
    if (recentHealthDelta >= 5) trend = 'improving';
    else if (recentHealthDelta <= -5) trend = 'declining';
  }

  return {
    trend,
    trendDirection: trend === 'improving' ? 'up' : trend === 'declining' ? 'down' : trend === 'new' ? 'new' : 'flat',
    trendDeltaMaturity: maturityDelta,
    trendDeltaHealth: healthDelta
  };
}
