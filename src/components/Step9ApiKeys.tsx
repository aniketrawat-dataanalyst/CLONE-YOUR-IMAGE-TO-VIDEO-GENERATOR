import React, { useState } from 'react';
import { AppState, ApiKey } from '../types';
import { Key, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const providers = ['official', 'fal.ai', 'kie.ai'];

export default function Step9ApiKeys({ state, updateState, nextStep, prevStep }: Props) {
  const [newKey, setNewKey] = useState({ name: '', key: '', provider: 'official' });
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const addKey = () => {
    if (!newKey.name || !newKey.key) return;
    
    const key: ApiKey = {
      id: Math.random().toString(36).substring(7),
      name: newKey.name,
      key: newKey.key,
      provider: newKey.provider,
      enabled: true
    };
    
    updateState({ apiKeys: [...state.apiKeys, key] });
    setNewKey({ name: '', key: '', provider: 'official' });
  };

  const removeKey = (id: string) => {
    updateState({ apiKeys: state.apiKeys.filter(k => k.id !== id) });
  };

  const toggleKey = (id: string) => {
    updateState({
      apiKeys: state.apiKeys.map(k => k.id === id ? { ...k, enabled: !k.enabled } : k)
    });
  };

  const toggleShow = (id: string) => {
    setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center">
          API Key Management
          <Key className="ml-3 w-6 h-6 text-zinc-500" />
        </h2>
        <p className="mt-2 text-zinc-400">Add provider API keys for rendering. Keys are stored securely and never exposed.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-8">
        
        {/* Add New Key */}
        <div className="space-y-4 bg-zinc-950 p-6 rounded-xl border border-zinc-800">
          <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wider">Add New Key</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <select
                value={newKey.provider}
                onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 outline-none text-sm"
              >
                {providers.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="md:col-span-1">
              <input
                type="text"
                placeholder="Key Name (e.g. My fal.ai key)"
                value={newKey.name}
                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 outline-none text-sm placeholder:text-zinc-600"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <input
                type="password"
                placeholder="sk-..."
                value={newKey.key}
                onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 outline-none text-sm placeholder:text-zinc-600 font-mono"
              />
              <button
                onClick={addKey}
                disabled={!newKey.name || !newKey.key}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Key List */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Saved Keys</h3>
          {state.apiKeys.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-xl">
              No API keys added yet. You need at least one key to render.
            </div>
          ) : (
            <div className="space-y-3">
              {state.apiKeys.map(key => (
                <div key={key.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${key.enabled ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-950 border-zinc-800 opacity-60'}`}>
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleKey(key.id)} className="text-zinc-400 hover:text-emerald-400 transition-colors">
                      {key.enabled ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-200">{key.name}</span>
                        <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded font-mono border border-zinc-700">
                          {key.provider}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-zinc-500">
                          {showKey[key.id] ? key.key : '••••••••••••••••••••••••'}
                        </span>
                        <button onClick={() => toggleShow(key.id)} className="text-zinc-500 hover:text-zinc-300">
                          {showKey[key.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeKey(key.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Render Settings */}
        <div className="space-y-4 pt-6 border-t border-zinc-800">
          <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wider">Render Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Provider</label>
              <select
                value={state.renderSettings.provider}
                onChange={(e) => updateState({ renderSettings: { ...state.renderSettings, provider: e.target.value as any } })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 outline-none text-sm"
              >
                {providers.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Render Mode</label>
              <select
                value={state.renderSettings.mode}
                onChange={(e) => updateState({ renderSettings: { ...state.renderSettings, mode: e.target.value as any } })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/50 outline-none text-sm"
              >
                <option value="batch">Full Batch (All Scenes)</option>
                <option value="scene-by-scene">Scene-by-Scene</option>
              </select>
            </div>
            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={state.renderSettings.autoMerge}
                    onChange={(e) => updateState({ renderSettings: { ...state.renderSettings, autoMerge: e.target.checked } })}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${state.renderSettings.autoMerge ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${state.renderSettings.autoMerge ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">Auto-Merge Scenes</span>
              </label>
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
          Go to Render Dashboard
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Mock Circle icon since it might not be imported correctly above
function Circle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}
