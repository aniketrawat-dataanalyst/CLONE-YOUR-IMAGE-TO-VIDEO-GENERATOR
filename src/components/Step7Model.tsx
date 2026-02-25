import React from 'react';
import { AppState } from '../types';
import { ArrowRight, ArrowLeft, Cpu } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function Step7Model({ state, updateState, nextStep, prevStep }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center">
          Target Model Selection
          <Cpu className="ml-3 w-6 h-6 text-zinc-500" />
        </h2>
        <p className="mt-2 text-zinc-400">Select the destination model. This only changes the prompt format.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => updateState({ targetModel: 'veo-3.1' })}
            className={`p-6 rounded-2xl text-left transition-all border-2 relative overflow-hidden ${
              state.targetModel === 'veo-3.1'
                ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {state.targetModel === 'veo-3.1' && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/20 blur-2xl rounded-full" />
            )}
            <h3 className={`text-xl font-bold ${state.targetModel === 'veo-3.1' ? 'text-emerald-400' : 'text-zinc-300'}`}>Google Veo 3.1</h3>
            <p className="mt-2 text-sm text-zinc-500">Generates structured JSON prompts optimized for Veo's API schema.</p>
            <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center justify-between text-xs font-mono text-zinc-600">
              <span>FORMAT: JSON</span>
              <span>ASPECT: 16:9</span>
            </div>
          </button>

          <button
            onClick={() => updateState({ targetModel: 'sora-2' })}
            className={`p-6 rounded-2xl text-left transition-all border-2 relative overflow-hidden ${
              state.targetModel === 'sora-2'
                ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.1)]'
                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {state.targetModel === 'sora-2' && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/20 blur-2xl rounded-full" />
            )}
            <h3 className={`text-xl font-bold ${state.targetModel === 'sora-2' ? 'text-blue-400' : 'text-zinc-300'}`}>Sora 2</h3>
            <p className="mt-2 text-sm text-zinc-500">Generates descriptive text prompts optimized for Sora's natural language understanding.</p>
            <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center justify-between text-xs font-mono text-zinc-600">
              <span>FORMAT: TEXT</span>
              <span>ASPECT: 9:16</span>
            </div>
          </button>
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
          Generate Prompts
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
