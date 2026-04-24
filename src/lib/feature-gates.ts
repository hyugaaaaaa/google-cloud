export type PlanTier = 'free' | 'pro';

export type StudyContext = {
  isGuest: boolean;
  planTier: PlanTier;
};

export type FeatureEntitlements = {
  categoryQuestionCap: number;
  mockExamsPerDay: number;
  detailedAnalytics: boolean;
  aiFeatures: boolean;
  weakInsights: boolean;
};

const FREE_ENTITLEMENTS: FeatureEntitlements = {
  categoryQuestionCap: 20,
  mockExamsPerDay: 1,
  detailedAnalytics: false,
  aiFeatures: false,
  weakInsights: false,
};

const PRO_ENTITLEMENTS: FeatureEntitlements = {
  categoryQuestionCap: Number.POSITIVE_INFINITY,
  mockExamsPerDay: Number.POSITIVE_INFINITY,
  detailedAnalytics: true,
  aiFeatures: true,
  weakInsights: true,
};

export function resolvePlanTier(rawTier: string | null | undefined): PlanTier {
  return rawTier === 'pro' ? 'pro' : 'free';
}

export function getEntitlements({ isGuest, planTier }: StudyContext): FeatureEntitlements {
  if (isGuest) {
    return FREE_ENTITLEMENTS;
  }

  return planTier === 'pro' ? PRO_ENTITLEMENTS : FREE_ENTITLEMENTS;
}

export function canStartMockExam(
  ctx: StudyContext,
  mockExamsToday: number,
): { allowed: boolean; reason?: string } {
  const limits = getEntitlements(ctx);

  if (mockExamsToday < limits.mockExamsPerDay) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'Freeプランは1日1回まで模擬試験を受けられます。Proで無制限になります。',
  };
}

export function isPremiumPlan(planTier: PlanTier): boolean {
  return planTier === 'pro';
}
