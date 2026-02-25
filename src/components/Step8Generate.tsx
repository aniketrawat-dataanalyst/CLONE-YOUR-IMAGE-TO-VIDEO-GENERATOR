import React, { useState, useEffect } from 'react';
import { AppState } from '../types';
import { GoogleGenAI } from '@google/genai';
import { Loader2, Zap, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function Step8Generate({ state, updateState, nextStep, prevStep }: Props) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.prompts.length === 0 && state.scenes.length > 0) {
      generatePrompts();
    }
  }, []);

  const generatePrompts = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const generatedPrompts = [];

      // Process all scenes in a single API call to avoid rate limits
      let responseText = "";
      let retries = 3;
      let success = false;

      while (!success && retries > 0) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate animation instructions for the following scenes.
Presentation Style: ${JSON.stringify(state.presentationStyle)}
Voice Parameters: ${JSON.stringify(state.voiceParameters)}

Scenes:
${JSON.stringify(state.scenes, null, 2)}

Return ONLY a JSON array of objects, one for each scene, in the exact same order. Schema for each object:
{
 "facial_expression": "string",
 "eye_behavior": "string",
 "head_movement": "string",
 "gesture": "string",
 "breathing": "string",
 "pause_before": "string",
 "pause_after": "string",
 "emotion_intensity": number
}`,
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
      
      const animations = JSON.parse(responseText);
      
      for (let i = 0; i < state.scenes.length; i++) {
        const scene = state.scenes[i];
        const animation = animations[i];
        
        let promptContent;
        if (state.targetModel === 'veo-3.1') {
          promptContent = {
            model: "veo-3.1",
            aspect_ratio: "16:9",
            avatar_identity: state.avatarIdentity,
            scene_text: scene.scene_text,
            animation: animation,
            visual_style: {
              realism: "ultra-realistic",
              lighting: state.avatarIdentity?.lighting_reference || "soft studio",
              camera: state.avatarIdentity?.camera_framing || "stable chest-up",
              background: "clean neutral"
            }
          };
        } else {
          promptContent = `Create a horizontal 16:9 ultra-realistic talking avatar video.

Avatar identity (must remain identical across all scenes):
${JSON.stringify(state.avatarIdentity, null, 2)}

Speech text:
"${scene.scene_text}"

Behavior & animation:
- ${animation.eye_behavior}
- ${animation.head_movement}
- ${animation.gesture}
- ${animation.breathing}
- ${animation.facial_expression}

Style:
- cinematic realism
- ${state.avatarIdentity?.lighting_reference || "studio lighting"}
- ${state.avatarIdentity?.camera_framing || "stable chest-up framing"}`;
        }
        
        generatedPrompts.push({
          scene_id: scene.scene_id,
          prompt_content: promptContent
        });

        setProgress(((i + 1) / state.scenes.length) * 100);
      }

      updateState({ prompts: generatedPrompts });
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to generate prompts");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center">
          Prompt Generation
          <Zap className="ml-3 w-6 h-6 text-emerald-500" />
        </h2>
        <p className="mt-2 text-zinc-400">Synthesizing animation metadata and formatting prompts for {state.targetModel}.</p>
      </div>

      {loading ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center space-y-8">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-800" />
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                className="text-emerald-500 transition-all duration-300 ease-out"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progress) / 100}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-zinc-200">{Math.round(progress)}%</span>
            </div>
          </div>
          <p className="text-zinc-400 font-mono text-sm">Generating per-scene animation metadata...</p>
        </div>
      ) : error ? (
        <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <p className="text-red-400 text-center">{error}</p>
          <button onClick={generatePrompts} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
            Retry Generation
          </button>
        </div>
      ) : state.prompts.length > 0 ? (
        <div className="space-y-6">
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-emerald-400">Generation Complete</h3>
              <p className="text-sm text-emerald-500/80 mt-1">{state.prompts.length} scene prompts ready for export.</p>
            </div>
            <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg font-mono text-sm border border-emerald-500/20">
              {state.targetModel.toUpperCase()}
            </div>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {state.prompts.map((prompt, idx) => (
              <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-800/50 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
                  <span className="font-mono text-xs text-zinc-400">SCENE_{prompt.scene_id}</span>
                </div>
                <div className="p-4">
                  <pre className="text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                    {typeof prompt.prompt_content === 'string' 
                      ? prompt.prompt_content 
                      : JSON.stringify(prompt.prompt_content, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
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
          disabled={state.prompts.length === 0}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Export & Download
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
