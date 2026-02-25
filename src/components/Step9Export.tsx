import React from 'react';
import { AppState } from '../types';
import { Download, FileJson, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface Props {
  state: AppState;
  prevStep: () => void;
}

export default function Step9Export({ state, prevStep }: Props) {
  const isVeo = state.targetModel === 'veo-3.1';
  const fileExtension = isVeo ? 'json' : 'txt';
  
  const downloadAll = () => {
    const content = isVeo 
      ? JSON.stringify(state.prompts.map(p => p.prompt_content), null, 2)
      : state.prompts.map(p => p.prompt_content).join('\n\n---\n\n');
      
    const blob = new Blob([content], { type: isVeo ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avatar_prompts_${state.targetModel}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadScene = (sceneId: number, content: any) => {
    const fileContent = isVeo ? JSON.stringify(content, null, 2) : content;
    const blob = new Blob([fileContent], { type: isVeo ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scene_${sceneId}_${state.targetModel}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center">
          Export & Download
          <Download className="ml-3 w-6 h-6 text-emerald-500" />
        </h2>
        <p className="mt-2 text-zinc-400">Your model-ready prompts are generated and ready for external rendering.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-8">
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-950">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-6" />
          <h3 className="text-2xl font-bold text-zinc-100 mb-2">Ready for {state.targetModel === 'veo-3.1' ? 'Veo 3.1' : 'Sora 2'}</h3>
          <p className="text-zinc-400 mb-8 text-center max-w-md">
            {state.prompts.length} scenes generated with locked identity profile and per-scene animation metadata.
          </p>
          
          <button
            onClick={downloadAll}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center text-lg"
          >
            {isVeo ? <FileJson className="mr-3 w-6 h-6" /> : <FileText className="mr-3 w-6 h-6" />}
            Download Master Bundle (.{fileExtension})
          </button>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Individual Scenes</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {state.prompts.map((prompt) => (
              <div key={prompt.scene_id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
                <span className="font-mono text-sm text-zinc-300">Scene {prompt.scene_id}</span>
                <button
                  onClick={() => downloadScene(prompt.scene_id, prompt.prompt_content)}
                  className="p-2 bg-zinc-900 text-zinc-400 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                  title="Download individual scene"
                >
                  <Download className="w-4 h-4" />
                </button>
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
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-colors flex items-center"
        >
          Start New Project
        </button>
      </div>
    </div>
  );
}
