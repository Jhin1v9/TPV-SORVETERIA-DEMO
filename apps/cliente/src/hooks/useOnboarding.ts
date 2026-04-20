import { useState, useCallback } from 'react';

const STORAGE_KEY = 'tpv-onboarding-completed';
const STORAGE_PROFILE = 'tpv-user-profile';

export type OnboardingStep = 'welcome' | 'register' | 'allergy' | 'tutorial' | 'complete';

export interface OnboardingState {
  step: OnboardingStep;
  tutorialStep: number;
  isFirstAccess: boolean;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    return {
      step: completed ? 'complete' : 'welcome',
      tutorialStep: 0,
      isFirstAccess: !completed,
    };
  });

  const goToStep = useCallback((step: OnboardingStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const nextTutorialStep = useCallback(() => {
    setState((prev) => {
      const next = prev.tutorialStep + 1;
      if (next >= 6) {
        localStorage.setItem(STORAGE_KEY, 'true');
        return { ...prev, step: 'complete', tutorialStep: next, isFirstAccess: false };
      }
      return { ...prev, tutorialStep: next };
    });
  }, []);

  const prevTutorialStep = useCallback(() => {
    setState((prev) => ({ ...prev, tutorialStep: Math.max(0, prev.tutorialStep - 1) }));
  }, []);

  const skipOnboarding = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setState({ step: 'complete', tutorialStep: 0, isFirstAccess: false });
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_PROFILE);
    setState({ step: 'welcome', tutorialStep: 0, isFirstAccess: true });
  }, []);

  return {
    ...state,
    goToStep,
    nextTutorialStep,
    prevTutorialStep,
    skipOnboarding,
    resetOnboarding,
  };
}
