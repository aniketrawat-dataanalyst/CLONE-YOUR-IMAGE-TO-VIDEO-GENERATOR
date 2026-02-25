import React, { useState } from 'react';
import { AppState } from '../types';
import { Download, Play, ArrowLeft, CheckCircle2, Film, Layers, Loader2 } from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

interface Props {
  state: AppState;
  prevStep: () => void;
}

export default function Step11Preview({ state, prevStep }: Props) {
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);

  const downloadAll = () => {
    // In a real app, this would generate a ZIP file using JSZip
    alert("Downloading all clips as ZIP...");
  };

  const downloadMerged = async () => {
    if (!state.renderSettings.autoMerge) return;
    
    setIsMerging(true);
    try {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
        wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm",
      });

      const completedClips = state.renderedClips.filter(c => c.status === 'completed' && c.url);
      
      // Write files to FFmpeg FS
      let concatList = "";
      for (let i = 0; i < completedClips.length; i++) {
        const clip = completedClips[i];
        const fileName = `clip${i}.mp4`;
        await ffmpeg.writeFile(fileName, await fetchFile(clip.url!));
        concatList += `file '${fileName}'\n`;
      }
      
      await ffmpeg.writeFile('concat_list.txt', concatList);
      
      // Run concat
      await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', '-c', 'copy', 'output.mp4']);
      
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `merged_avatar_video.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Merging failed", e);
      alert("Failed to merge videos. Check console for details.");
    }
    setIsMerging(false);
  };

  const downloadScene = async (url: string, sceneId: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `scene_${sceneId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error(e);
      alert("Failed to download scene.");
    }
  };

  const completedClips = state.renderedClips.filter(c => c.status === 'completed' && c.url);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center">
          Preview & Export
          <Film className="ml-3 w-6 h-6 text-emerald-500" />
        </h2>
        <p className="mt-2 text-zinc-400">Review your rendered scenes and download the final assets.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-8">
        
        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-700 rounded-xl bg-zinc-950 hover:border-emerald-500/50 transition-colors">
            <Layers className="w-12 h-12 text-zinc-500 mb-4" />
            <h3 className="text-xl font-bold text-zinc-200 mb-2">Individual Clips</h3>
            <p className="text-zinc-400 text-sm text-center mb-6">
              Download all {completedClips.length} scenes as separate MP4 files in a ZIP archive.
            </p>
            <button
              onClick={downloadAll}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-lg transition-colors flex items-center w-full justify-center"
            >
              <Download className="mr-2 w-5 h-5" />
              Download ZIP
            </button>
          </div>

          <div className="flex flex-col items-center justify-center p-8 border-2 border-emerald-500/30 rounded-xl bg-emerald-950/10 hover:border-emerald-500/60 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
            <Film className="w-12 h-12 text-emerald-500 mb-4 relative z-10" />
            <h3 className="text-xl font-bold text-emerald-400 mb-2 relative z-10">Merged Video</h3>
            <p className="text-zinc-400 text-sm text-center mb-6 relative z-10">
              Download a single continuous MP4 with all scenes automatically merged in order.
            </p>
            <button
              onClick={downloadMerged}
              disabled={!state.renderSettings.autoMerge || isMerging}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg transition-all hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center w-full justify-center relative z-10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isMerging ? (
                <><Loader2 className="mr-2 w-5 h-5 animate-spin" /> Merging...</>
              ) : (
                <><Download className="mr-2 w-5 h-5" /> {state.renderSettings.autoMerge ? 'Download Merged MP4' : 'Auto-Merge Disabled'}</>
              )}
            </button>
          </div>
        </div>

        {/* Scene Previews */}
        <div className="space-y-4 pt-8 border-t border-zinc-800">
          <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Scene Previews</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {completedClips.map((clip) => (
              <div key={clip.scene_id} className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-[16/9]">
                <video 
                  src={clip.url} 
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                  <button 
                    onClick={() => setActivePreview(clip.url!)}
                    className="p-3 bg-emerald-500 text-zinc-950 rounded-full hover:scale-110 transition-transform"
                  >
                    <Play className="w-5 h-5 ml-1" />
                  </button>
                  <button 
                    onClick={() => downloadScene(clip.url!, clip.scene_id)}
                    className="p-2 bg-zinc-800 text-zinc-300 rounded-full hover:bg-zinc-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Info Bar */}
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-medium text-zinc-300">Scene {clip.scene_id}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{clip.duration?.toFixed(1)}s</span>
                  </div>
                </div>
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
          Back to Dashboard
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-colors flex items-center"
        >
          Start New Project
        </button>
      </div>

      {/* Video Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setActivePreview(null)}>
          <div className="relative max-h-full max-w-full aspect-[16/9] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800" onClick={e => e.stopPropagation()}>
            <video 
              src={activePreview} 
              controls 
              autoPlay 
              className="w-full h-full object-contain"
            />
            <button 
              onClick={() => setActivePreview(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
