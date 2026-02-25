import React from 'react';
import { AppState } from '../types';
import { ArrowRight, ArrowLeft, UserCircle2 } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const styles = [
  'Tech Educator',
  'Business Coach',
  'Lifestyle Creator',
  'Motivational Speaker',
  'News Explainer',
  'Sales Presenter',
  'Friendly Host'
];

const levels = ['Low', 'Medium', 'High', 'Extreme'];

export default function Step3Style({ state, updateState, nextStep, prevStep }: Props) {
  const handleChange = (field: keyof typeof state.presentationStyle, value: string) => {
    updateState({
      presentationStyle: {
        ...state.presentationStyle,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center">
          Presentation Style
          <UserCircle2 className="ml-3 w-6 h-6 text-zinc-500" />
        </h2>
        <p className="mt-2 text-zinc-400">Select the delivery style. This affects behavior, not appearance.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-8">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">Delivery Persona</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {styles.map(style => (
              <button
                key={style}
                onClick={() => handleChange('style', style)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                  state.presentationStyle.style === style
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-zinc-800">
          <h3 className="text-lg font-medium text-zinc-200">Behavioral Controls</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { id: 'gesture_intensity', label: 'Gesture Intensity' },
              { id: 'head_movement_level', label: 'Head Movement' },
              { id: 'expression_range', label: 'Expression Range' },
              { id: 'energy_level', label: 'Energy Level' }
            ].map(control => (
              <div key={control.id}>
                <label className="block text-sm font-medium text-zinc-400 mb-2">{control.label}</label>
                <select
                  value={state.presentationStyle[control.id as keyof typeof state.presentationStyle]}
                  onChange={(e) => handleChange(control.id as any, e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            ))}
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
          Next: Voice & Delivery
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
