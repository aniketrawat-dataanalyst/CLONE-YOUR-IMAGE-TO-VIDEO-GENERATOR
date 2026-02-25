import React, { useState, useEffect } from 'react';
import { AppState } from '../types';
import { GoogleGenAI } from '@google/genai';
import { Loader2, Lock, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function Step2Analyze({ state, updateState, nextStep, prevStep }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.avatarIdentity && state.images.length > 0) {
      analyzeImages();
    }
  }, []);

  const analyzeImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const parts = state.images.map(img => {
        const base64Data = img.split(',')[1];
        const mimeType = img.split(';')[0].split(':')[1];
        return {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        };
      });

      let responseText = "";
      let retries = 3;
      let success = false;

      while (!success && retries > 0) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
              ...parts,
              { text: "Analyze the uploaded avatar images and extract a Persistent Avatar Identity Profile. Return ONLY a JSON object matching this schema: { avatar_id: 'LOCKED_AVATAR_001', origin: 'user_uploaded_image', face_shape: '', skin_tone: '', hair: '', gender_expression: '', age_range: '', facial_proportions: '', eye_shape: '', camera_framing: '', lighting_reference: '', identity_lock: true }" }
            ],
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
      
      const identity = JSON.parse(responseText);
      updateState({ avatarIdentity: identity });
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to analyze image");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center">
          Identity Analysis
          {state.avatarIdentity && <Lock className="ml-3 w-6 h-6 text-emerald-500" />}
        </h2>
        <p className="mt-2 text-zinc-400">Extracting a persistent avatar identity profile. This will be locked for all scenes.</p>
      </div>

      {loading ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
          <p className="text-zinc-400 font-mono text-sm">Analyzing facial geometry and lighting...</p>
        </div>
      ) : error ? (
        <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <p className="text-red-400 text-center">{error}</p>
          <button onClick={analyzeImages} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
            Retry Analysis
          </button>
        </div>
      ) : state.avatarIdentity ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="bg-zinc-800/50 px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
            <span className="font-mono text-sm text-emerald-400">LOCKED_AVATAR_IDENTITY_OBJECT</span>
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded font-mono border border-emerald-500/20">
              IMMUTABLE
            </span>
          </div>
          <div className="p-6">
            <pre className="text-sm font-mono text-zinc-300 overflow-x-auto">
              {JSON.stringify(state.avatarIdentity, null, 2)}
            </pre>
          </div>
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
          disabled={!state.avatarIdentity}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Confirm & Lock Identity
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
