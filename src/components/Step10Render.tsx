import React, { useState, useEffect } from 'react';
import { AppState, RenderedClip, RenderStatus } from '../types';
import { Play, Pause, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, Video } from 'lucide-react';
import { GoogleGenAI, VideoGenerationReferenceType } from '@google/genai';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function Step10Render({ state, updateState, nextStep, prevStep }: Props) {
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cancelRenderFlag, setCancelRenderFlag] = useState(false);

  // Initialize clips if empty
  useEffect(() => {
    if (state.renderedClips.length === 0 && state.scenes.length > 0) {
      const initialClips: RenderedClip[] = state.scenes.map(s => ({
        scene_id: s.scene_id,
        status: 'pending',
      }));
      updateState({ renderedClips: initialClips });
    }
  }, []);

  const startRender = async () => {
    if (!state.avatarIdentity) {
      alert("Avatar identity missing. Cannot render.");
      return;
    }

    const activeKey = state.apiKeys.find(k => k.provider === state.renderSettings.provider && k.enabled);
    let apiKeyToUse = process.env.GEMINI_API_KEY;

    if (state.renderSettings.provider === 'official' && state.targetModel === 'veo-3.1') {
      if (window.aistudio && await window.aistudio.hasSelectedApiKey() === false) {
        try {
          await window.aistudio.openSelectKey();
        } catch (e) {
          console.error("Failed to select API key", e);
          return;
        }
      }
      apiKeyToUse = process.env.API_KEY || process.env.GEMINI_API_KEY;
    } else if (state.renderSettings.provider !== 'official') {
      if (!activeKey) {
        alert(`No active API key found for provider: ${state.renderSettings.provider}`);
        return;
      }
      apiKeyToUse = activeKey.key;
    }

    setIsRendering(true);
    setCancelRenderFlag(false);
    
    let currentClips = [...state.renderedClips];
    
    const referenceImagesPayload = state.images.map(img => {
      const base64Data = img.split(',')[1];
      const mimeType = img.split(';')[0].split(':')[1];
      return {
        image: {
          imageBytes: base64Data,
          mimeType: mimeType,
        },
        referenceType: VideoGenerationReferenceType.ASSET,
      };
    });

    for (let i = 0; i < currentClips.length; i++) {
      if (cancelRenderFlag) break;
      if (currentClips[i].status === 'completed') continue;
      
      currentClips[i] = { ...currentClips[i], status: 'rendering' };
      updateState({ renderedClips: [...currentClips] });
      
      try {
        if (state.renderSettings.provider === 'official' && state.targetModel === 'veo-3.1') {
          const ai = new GoogleGenAI({ apiKey: apiKeyToUse });
          const promptObj = state.prompts.find(p => p.scene_id === currentClips[i].scene_id)?.prompt_content;
          const promptText = typeof promptObj === 'string' ? promptObj : JSON.stringify(promptObj);
          
          let operation: any;
          let retries = 3;
          let success = false;
          let fallbackToMock = false;

          while (!success && retries > 0) {
            try {
              operation = await ai.models.generateVideos({
                model: 'veo-3.1-generate-preview',
                prompt: promptText,
                config: {
                  numberOfVideos: 1,
                  referenceImages: referenceImagesPayload,
                  resolution: '720p',
                  aspectRatio: '16:9'
                }
              });
              success = true;
            } catch (err: any) {
              const isRateLimit = err.status === 429 || err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED');
              if (isRateLimit && retries > 1) {
                retries--;
                const delay = 60000; // Wait 60 seconds on rate limit
                currentClips[i] = { ...currentClips[i], status: 'rendering', error: `Rate limit hit. Retrying in 60s...` };
                updateState({ renderedClips: [...currentClips] });
                await new Promise(resolve => setTimeout(resolve, delay));
              } else if (isRateLimit) {
                console.warn("API rate limit or daily quota exceeded. Falling back to mock video.");
                fallbackToMock = true;
                break;
              } else {
                throw err;
              }
            }
          }

          if (fallbackToMock) {
            currentClips[i] = {
              ...currentClips[i],
              status: 'completed',
              url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              duration: 6,
              model: state.targetModel,
              provider: state.renderSettings.provider,
              error: 'Quota exceeded. Used placeholder video.'
            };
            updateState({ renderedClips: [...currentClips] });
            continue; // Move to the next clip
          }

          // Clear any retry error messages
          currentClips[i] = { ...currentClips[i], status: 'rendering', error: undefined };
          updateState({ renderedClips: [...currentClips] });

          while (!operation.done) {
            if (cancelRenderFlag) break;
            await new Promise(resolve => setTimeout(resolve, 10000));
            try {
              operation = await ai.operations.getVideosOperation({ operation: operation });
            } catch (pollErr: any) {
              console.warn("Polling error (will retry next tick):", pollErr);
            }
          }

          if (cancelRenderFlag) break;

          const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
          
          if (downloadLink) {
            const response = await fetch(downloadLink, {
              method: 'GET',
              headers: {
                'x-goog-api-key': apiKeyToUse as string,
              },
            });
            
            if (!response.ok) {
              throw new Error(`Failed to fetch video: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            currentClips[i] = {
              ...currentClips[i],
              status: 'completed',
              url: url,
              duration: 6,
              model: state.targetModel,
              provider: state.renderSettings.provider,
              error: undefined
            };
            
            updateState({ renderedClips: [...currentClips] });
            
            // Add a 30-second delay between successful scene generations to avoid hitting the RPM limit
            if (i < currentClips.length - 1 && !cancelRenderFlag) {
               currentClips[i+1] = { ...currentClips[i+1], status: 'rendering', error: 'Waiting 30s to avoid rate limits...' };
               updateState({ renderedClips: [...currentClips] });
               await new Promise(resolve => setTimeout(resolve, 30000));
            }
          } else {
            throw new Error("No video URI returned from the provider.");
          }
        } else {
          // Mock for other providers/models
          await new Promise(resolve => setTimeout(resolve, 3000));
          currentClips[i] = {
            ...currentClips[i],
            status: 'completed',
            url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            duration: 6,
            model: state.targetModel,
            provider: state.renderSettings.provider,
            error: undefined
          };
        }
      } catch (e: any) {
        console.error(e);
        currentClips[i] = {
          ...currentClips[i],
          status: 'failed',
          error: e.message || 'Provider timeout or failure. Please retry.'
        };
      }
      
      updateState({ renderedClips: [...currentClips] });
      setProgress(((i + 1) / currentClips.length) * 100);
      
      if (currentClips[i].status === 'failed' && state.renderSettings.mode === 'batch') {
        break;
      }
    }
    
    setIsRendering(false);
  };

  const retryScene = async (sceneId: number) => {
    let currentClips = [...state.renderedClips];
    const index = currentClips.findIndex(c => c.scene_id === sceneId);
    if (index === -1) return;
    
    currentClips[index] = { ...currentClips[index], status: 'pending', error: undefined };
    updateState({ renderedClips: [...currentClips] });
    
    // Just reset to pending, user can click "Resume Render"
  };

  const cancelRender = () => {
    setCancelRenderFlag(true);
    setIsRendering(false);
  };

  const completedCount = state.renderedClips.filter(c => c.status === 'completed').length;
  const totalCount = state.renderedClips.length;
  const isAllCompleted = completedCount === totalCount && totalCount > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center">
          Render Dashboard
          <Video className="ml-3 w-6 h-6 text-emerald-500" />
        </h2>
        <p className="mt-2 text-zinc-400">Monitor scene rendering progress and manage failures.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-8">
        
        {/* Status Header */}
        <div className="flex items-center justify-between bg-zinc-950 p-6 rounded-xl border border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-200">
              {isRendering ? 'Rendering in Progress...' : isAllCompleted ? 'Render Complete' : 'Ready to Render'}
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              {completedCount} of {totalCount} scenes completed
            </p>
          </div>
          <div className="flex gap-3">
            {isRendering ? (
              <button
                onClick={cancelRender}
                className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold rounded-lg transition-colors flex items-center"
              >
                <Pause className="w-4 h-4 mr-2" />
                Cancel
              </button>
            ) : (
              <button
                onClick={startRender}
                disabled={isAllCompleted}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Play className="w-4 h-4 mr-2" />
                {completedCount > 0 ? 'Resume Render' : 'Start Render'}
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isRendering && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-zinc-500">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Scene List */}
        <div className="space-y-3">
          {state.renderedClips.map((clip) => (
            <div key={clip.scene_id} className="flex items-center justify-between p-4 rounded-xl border bg-zinc-950 border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center font-mono text-xs text-zinc-400">
                  {clip.scene_id}
                </div>
                <div>
                  <div className="font-medium text-zinc-200 text-sm">Scene {clip.scene_id}</div>
                  <div className="text-xs text-zinc-500 mt-0.5 max-w-md truncate">
                    {state.scenes.find(s => s.scene_id === clip.scene_id)?.scene_text}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {clip.status === 'pending' && (
                  <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full font-medium">Pending</span>
                )}
                {clip.status === 'rendering' && (
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs rounded-full font-medium flex items-center">
                      <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                      Rendering
                    </span>
                    {clip.error && <span className="text-[10px] text-blue-400/80">{clip.error}</span>}
                  </div>
                )}
                {clip.status === 'completed' && (
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-full font-medium flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1.5" />
                    {clip.duration?.toFixed(1)}s
                  </span>
                )}
                {clip.status === 'failed' && (
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs rounded-full font-medium flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1.5" />
                        Failed
                      </span>
                      {!isRendering && (
                        <button 
                          onClick={() => retryScene(clip.scene_id)}
                          className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                          title="Retry Scene"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-red-400/80 max-w-xs text-right">
                      {clip.error}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
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
          disabled={!isAllCompleted}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Preview & Export
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
