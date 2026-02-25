import React, { useState, useEffect } from 'react';
import { AppState } from '../types';
import { GoogleGenAI } from '@google/genai';
import { Loader2, Scissors, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function Step6Split({ state, updateState, nextStep, prevStep }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.scenes.length === 0 && state.script.trim().length > 0) {
      splitScript();
    }
  }, []);

  const splitScript = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let responseText = "";
      let retries = 3;
      let success = false;

      while (!success && retries > 0) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Split the following script into short talking scenes.
Rules:
• 6–9 seconds per scene
• 20–28 words per scene
• No mid-sentence cuts
• One clear idea per scene
• Natural pauses preserved

Script:
${state.script}

Return ONLY a JSON array of objects with schema: [{ "scene_id": number, "scene_text": "string" }]`,
            config: {
              responseMimeType: "application/json",
            }
          });
          responseText = response.text;
          success = true;
        } catch (err: any) {
          const isRateLimit = err.status === 429 || err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED');
          if (isRateLimit && retries > 1) {
            retries--;
            const delay = (4 - retries) * 10000; // 10s, 20s, 30s
            await new Promise(resolve => setTimeout(resolve, delay));
          } else if (isRateLimit) {
            throw new Error("API rate limit or daily quota exceeded. If you are on the free tier, you may have hit the 15 requests/minute or 1500 requests/day limit. Please try again later.");
          } else {
            throw err;
          }
        }
      }
      
      const scenes = JSON.parse(responseText);
      updateState({ scenes });
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to split script");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center">
          Scene Splitting Engine
          <Scissors className="ml-3 w-6 h-6 text-emerald-500" />
        </h2>
        <p className="mt-2 text-zinc-400">Automatically splitting your script into optimal 6-9 second segments.</p>
      </div>

      {loading ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
          <p className="text-zinc-400 font-mono text-sm">Processing semantic boundaries...</p>
        </div>
      ) : error ? (
        <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <p className="text-red-400 text-center">{error}</p>
          <button onClick={splitScript} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
            Retry Splitting
          </button>
        </div>
      ) : state.scenes.length > 0 ? (
        <div className="space-y-4">
          {state.scenes.map((scene, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex gap-4 hover:border-emerald-500/30 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center font-mono text-emerald-400 font-bold">
                {scene.scene_id}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-zinc-300 font-serif leading-relaxed">"{scene.scene_text}"</p>
                <div className="mt-3 flex gap-3 text-xs font-mono text-zinc-500">
                  <span>{scene.scene_text.split(/\s+/).length} words</span>
                  <span>~{Math.max(6, Math.min(9, Math.round(scene.scene_text.split(/\s+/).length / 3)))}s</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

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
          disabled={state.scenes.length === 0}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Select Target Model
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
