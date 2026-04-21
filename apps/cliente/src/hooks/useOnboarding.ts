import { useState, useCallback } from 'react';

const STORAGE_KEY = 'tpv-onboarding-completed';
const ZUSTAND_KEY = 'tpv-sorveteria-storage';

function getStoredProfile(): { nome: string } | null {
  try {
    const raw = localStorage.getItem(ZUSTAND_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.state?.perfilUsuario || null;
  } catch {
    return null;
  }
}

export type OnboardingStep = 'welcome' | 'register' | 'consumo' | 'allergy' | 'tutorial' | 'complete' | 'returning';

export interface OnboardingState {
  step: OnboardingStep;
  tutorialStep: number;
  isFirstAccess: boolean;
  returningUser: { nome: string } | null;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    const profile = getStoredProfile();

    if (completed) {
      return { step: 'complete', tutorialStep: 0, isFirstAccess: false, returningUser: null };
    }

    if (profile?.nome) {
      return { step: 'returning', tutorialStep: 0, isFirstAccess: false, returningUser: profile };
    }

    return { step: 'welcome', tutorialStep: 0, isFirstAccess: true, returningUser: null };
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
    setState({ step: 'complete', tutorialStep: 0, isFirstAccess: false, returningUser: null });
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ZUSTAND_KEY);
    setState({ step: 'welcome', tutorialStep: 0, isFirstAccess: true, returningUser: null });
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
