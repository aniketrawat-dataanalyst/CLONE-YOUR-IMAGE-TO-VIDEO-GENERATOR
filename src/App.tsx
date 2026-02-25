/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppState } from './types';
import Sidebar from './components/Sidebar';
import Step1Upload from './components/Step1Upload';
import Step2Analyze from './components/Step2Analyze';
import Step3Style from './components/Step3Style';
import Step4Voice from './components/Step4Voice';
import Step5Script from './components/Step5Script';
import Step6Split from './components/Step6Split';
import Step7Model from './components/Step7Model';
import Step8Generate from './components/Step8Generate';
import Step9ApiKeys from './components/Step9ApiKeys';
import Step10Render from './components/Step10Render';
import Step11Preview from './components/Step11Preview';

const initialState: AppState = {
  step: 1,
  images: [],
  avatarIdentity: null,
  presentationStyle: {
    style: 'Tech Educator',
    gesture_intensity: 'Medium',
    head_movement_level: 'Medium',
    expression_range: 'Medium',
    energy_level: 'Medium',
  },
  voiceParameters: {
    voice_type: 'neutral',
    speaking_speed: 'Normal',
    emotional_tone: 'confident',
    emphasis_strength: 'Medium',
    pause_frequency: 'Medium',
    eye_contact_intensity: 'High',
    gesture_frequency: 'Medium',
    head_movement_level: 'Medium',
    expression_range: 'Medium',
    platform_intent: 'YouTube Shorts',
  },
  script: '',
  scenes: [],
  targetModel: 'veo-3.1',
  prompts: [],
  apiKeys: [],
  renderSettings: {
    provider: 'official',
    mode: 'batch',
    autoMerge: true,
  },
  renderedClips: [],
};

export default function App() {
  const [state, setState] = useState<AppState>(initialState);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => updateState({ step: state.step + 1 });
  const prevStep = () => updateState({ step: state.step - 1 });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex font-sans selection:bg-emerald-500/30">
      <Sidebar currentStep={state.step} />
      <main className="flex-1 p-8 overflow-y-auto relative">
        <div className="max-w-4xl mx-auto pb-24">
          {state.step === 1 && <Step1Upload state={state} updateState={updateState} nextStep={nextStep} />}
          {state.step === 2 && <Step2Analyze state={state} updateState={updateState} nextStep={nextStep} prevStep={prevStep} />}
          {state.step === 3 && <Step3Style state={state} updateState={updateState} nextStep={nextStep} prevStep={prevStep} />}
          {state.step === 4 && <Step4Voice state={state} updateState={updateState} nextStep={nextStep} prevStep={prevStep} />}
          {state.step === 5 && <Step5Script state={state} updateState={updateState} nextStep={nextStep} prevStep={prevStep} />}
          {state.step === 6 && <Step6Split state={state} updateState={updateState} nextStep={nextStep} prevStep={prevStep} />}
          {state.step === 7 && <Step7Model state={state} updateState={updateState} nextStep={nextStep} prevStep={prevStep} />}
          {state.step === 8 && <Step8Generate state={state} updateState={updateState} nextStep={nextStep} prevStep={prevStep} />}
          {state.step === 9 && <Step9ApiKeys state={state} updateState={updateState} nextStep={nextStep} prevStep={prevStep} />}
          {state.step === 10 && <Step10Render state={state} updateState={updateState} nextStep={nextStep} prevStep={prevStep} />}
          {state.step === 11 && <Step11Preview state={state} prevStep={prevStep} />}
        </div>
      </main>
    </div>
  );
}
