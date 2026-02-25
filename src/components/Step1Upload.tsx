import React, { useCallback } from 'react';
import { AppState } from '../types';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  nextStep: () => void;
}

export default function Step1Upload({ state, updateState, nextStep }: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3 - state.images.length) as File[];
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            updateState({ images: [...state.images, event.target.result as string] });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...state.images];
    newImages.splice(index, 1);
    updateState({ images: newImages });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Upload Avatar Reference</h2>
        <p className="mt-2 text-zinc-400">Upload 1-3 clear images of the avatar. Face must be visible, front or slight angle.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-700 border-dashed rounded-xl hover:border-emerald-500/50 transition-colors">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-zinc-500" />
            <div className="flex text-sm text-zinc-400">
              <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-emerald-400 hover:text-emerald-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                <span>Upload a file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handleFileChange} disabled={state.images.length >= 3} />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-zinc-500">PNG, JPG up to 10MB</p>
          </div>
        </div>

        {state.images.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            {state.images.map((img, idx) => (
              <div key={idx} className="relative rounded-lg overflow-hidden border border-zinc-700 aspect-square group">
                <img src={img} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={nextStep}
          disabled={state.images.length === 0}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Analyze Identity
          <ImageIcon className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
