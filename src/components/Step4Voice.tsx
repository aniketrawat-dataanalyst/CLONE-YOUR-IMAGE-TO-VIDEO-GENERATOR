import React from 'react';
import { AppState } from '../types';
import { ArrowRight, ArrowLeft, Mic2 } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const voiceTypes = ['male', 'female', 'neutral'];
const speakingSpeeds = ['Slow', 'Normal', 'Fast', 'Very Fast'];
const emotionalTones = ['calm', 'confident', 'persuasive', 'energetic', 'empathetic'];
const levels = ['Low', 'Medium', 'High'];
const platforms = ['TikTok', 'YouTube Shorts', 'Instagram Reels', 'Ads', 'Corporate'];

export default function Step4Voice({ state, updateState, nextStep, prevStep }: Props) {
  const handleChange = (field: keyof typeof state.voiceParameters, value: string) => {
    updateState({
      voiceParameters: {
        ...state.voiceParameters,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center">
          Voice & Delivery Parameters
          <Mic2 className="ml-3 w-6 h-6 text-zinc-500" />
        </h2>
        <p className="mt-2 text-zinc-400">Global settings applied to all generated scenes.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-emerald-400 border-b border-zinc-800 pb-2">Vocal Characteristics</h3>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Voice Type</label>
              <div className="flex space-x-3">
                {voiceTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => handleChange('voice_type', type)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all border ${
                      state.voiceParameters.voice_type === type
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                        : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Speaking Speed</label>
              <select
                value={state.voiceParameters.speaking_speed}
                onChange={(e) => handleChange('speaking_speed', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 outline-none"
              >
                {speakingSpeeds.map(speed => <option key={speed} value={speed}>{speed}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Emotional Tone</label>
              <select
                value={state.voiceParameters.emotional_tone}
                onChange={(e) => handleChange('emotional_tone', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 outline-none capitalize"
              >
                {emotionalTones.map(tone => <option key={tone} value={tone}>{tone}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-emerald-400 border-b border-zinc-800 pb-2">Delivery Mechanics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'emphasis_strength', label: 'Emphasis' },
                { id: 'pause_frequency', label: 'Pauses' },
                { id: 'eye_contact_intensity', label: 'Eye Contact' },
                { id: 'gesture_frequency', label: 'Gestures' }
              ].map(control => (
                <div key={control.id}>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">{control.label}</label>
                  <select
                    value={state.voiceParameters[control.id as keyof typeof state.voiceParameters]}
                    onChange={(e) => handleChange(control.id as any, e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 outline-none text-sm"
                  >
                    {levels.map(level => <option key={level} value={level}>{level}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Platform Intent</label>
              <select
                value={state.voiceParameters.platform_intent}
                onChange={(e) => handleChange('platform_intent', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 outline-none"
              >
                {platforms.map(platform => <option key={platform} value={platform}>{platform}</option>)}
              </select>
            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-colors flex items-center"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back
        </button>
        <button
          onClick={nextStep}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg transition-colors flex items-center"
        >
          Next: Script Input
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
