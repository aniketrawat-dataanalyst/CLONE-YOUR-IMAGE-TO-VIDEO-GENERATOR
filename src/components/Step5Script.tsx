import React from 'react';
import { AppState } from '../types';
import { ArrowRight, ArrowLeft, FileText } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function Step5Script({ state, updateState, nextStep, prevStep }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center">
          Script Input
          <FileText className="ml-3 w-6 h-6 text-zinc-500" />
        </h2>
        <p className="mt-2 text-zinc-400">Paste your full script below. The engine will automatically split it into short scenes.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <textarea
          value={state.script}
          onChange={(e) => updateState({ script: e.target.value })}
          placeholder="Most creators fail because they focus on tools instead of clarity..."
          className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-zinc-200 text-lg leading-relaxed focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none resize-none placeholder:text-zinc-700 font-serif"
        />
        <div className="mt-4 flex justify-between items-center text-sm text-zinc-500">
          <span>{state.script.length} characters</span>
          <span>~{Math.ceil(state.script.split(/\s+/).length / 150)} min read</span>
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
          disabled={state.script.trim().length < 10}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Split Script into Scenes
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
