'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ClinicBranch, CheckupProgram } from '@/lib/types';

export type Gender = 'female' | 'male';
export type AgeGroup = 'do-30' | '30-40' | '40-50' | '50+';
export type PreferredContact = 'call' | 'telegram' | 'viber';
export type QuizPhase =
  | 'gender'
  | 'age'
  | 'tags'
  | 'roadmap'
  | 'branch'
  | 'contacts'
  | 'confirmed';

export interface QuizState {
  phase: QuizPhase;
  gender: Gender | null;
  age: AgeGroup | null;
  tags: string[];
  selectedProgram: CheckupProgram | null;
  standardProgram: CheckupProgram | null;
  clinicProgram: CheckupProgram | null;
  chosenProgramType: 'standard' | 'clinic' | null;
  selectedBranchId: string | null;
  branches: ClinicBranch[];
  name: string;
  phone: string;
  preferredContact: PreferredContact;
  consentGiven: boolean;
}

interface QuizActions {
  setPhase: (phase: QuizPhase) => void;
  setGender: (g: Gender) => void;
  setAge: (a: AgeGroup) => void;
  toggleTag: (id: string) => void;
  setSelectedProgram: (p: CheckupProgram | null) => void;
  setStandardProgram: (p: CheckupProgram | null) => void;
  setClinicProgram: (p: CheckupProgram | null) => void;
  setChosenProgramType: (t: 'standard' | 'clinic') => void;
  setSelectedBranchId: (id: string | null) => void;
  setBranches: (b: ClinicBranch[]) => void;
  setName: (n: string) => void;
  setPhone: (p: string) => void;
  setPreferredContact: (c: PreferredContact) => void;
  setConsentGiven: (v: boolean) => void;
  reset: () => void;
}

const initialState: QuizState = {
  phase: 'gender',
  gender: null,
  age: null,
  tags: [],
  selectedProgram: null,
  standardProgram: null,
  clinicProgram: null,
  chosenProgramType: null,
  selectedBranchId: null,
  branches: [],
  name: '',
  phone: '',
  preferredContact: 'call',
  consentGiven: false,
};

const QuizContext = createContext<(QuizState & QuizActions) | null>(null);

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
  return ctx;
}

interface QuizProviderProps {
  children: ReactNode;
  presetGender?: Gender;
  presetAge?: AgeGroup;
  branches?: ClinicBranch[];
}

export function QuizProvider({ children, presetGender, presetAge, branches: initialBranches = [] }: QuizProviderProps) {
  // Determine starting phase based on presets
  const startPhase: QuizPhase = presetGender && presetAge
    ? 'tags'
    : presetGender
      ? 'age'
      : 'gender';

  const [state, setState] = useState<QuizState>({
    ...initialState,
    phase: startPhase,
    gender: presetGender || null,
    age: presetAge || null,
    branches: initialBranches,
  });

  const setPhase = useCallback((phase: QuizPhase) => setState(s => ({ ...s, phase })), []);
  const setGender = useCallback((gender: Gender) => setState(s => ({ ...s, gender })), []);
  const setAge = useCallback((age: AgeGroup) => setState(s => ({ ...s, age })), []);

  const toggleTag = useCallback((id: string) => {
    setState(s => {
      if (id === 'checkup') {
        return { ...s, tags: s.tags.includes('checkup') ? [] : ['checkup'] };
      }
      const without = s.tags.filter(t => t !== 'checkup');
      const next = without.includes(id) ? without.filter(t => t !== id) : [...without, id];
      return { ...s, tags: next };
    });
  }, []);

  const setSelectedProgram = useCallback((p: CheckupProgram | null) => setState(s => ({ ...s, selectedProgram: p })), []);
  const setStandardProgram = useCallback((p: CheckupProgram | null) => setState(s => ({ ...s, standardProgram: p })), []);
  const setClinicProgram = useCallback((p: CheckupProgram | null) => setState(s => ({ ...s, clinicProgram: p })), []);
  const setChosenProgramType = useCallback((t: 'standard' | 'clinic') => setState(s => ({
    ...s,
    chosenProgramType: t,
    selectedProgram: t === 'standard' ? s.standardProgram : s.clinicProgram,
  })), []);
  const setSelectedBranchId = useCallback((id: string | null) => setState(s => ({ ...s, selectedBranchId: id })), []);
  const setBranches = useCallback((b: ClinicBranch[]) => setState(s => ({ ...s, branches: b })), []);
  const setName = useCallback((name: string) => setState(s => ({ ...s, name })), []);
  const setPhone = useCallback((phone: string) => setState(s => ({ ...s, phone })), []);
  const setPreferredContact = useCallback((preferredContact: PreferredContact) => setState(s => ({ ...s, preferredContact })), []);
  const setConsentGiven = useCallback((consentGiven: boolean) => setState(s => ({ ...s, consentGiven })), []);

  const reset = useCallback(() => {
    setState({
      ...initialState,
      phase: startPhase,
      gender: presetGender || null,
      age: presetAge || null,
      branches: initialBranches,
    });
  }, [startPhase, presetGender, presetAge, initialBranches]);

  return (
    <QuizContext.Provider value={{ ...state, setPhase, setGender, setAge, toggleTag, setSelectedProgram, setStandardProgram, setClinicProgram, setChosenProgramType, setSelectedBranchId, setBranches, setName, setPhone, setPreferredContact, setConsentGiven, reset }}>
      {children}
    </QuizContext.Provider>
  );
}
