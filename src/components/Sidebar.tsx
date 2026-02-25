import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const steps = [
  { id: 1, name: 'Avatar Upload' },
  { id: 2, name: 'Identity Analysis' },
  { id: 3, name: 'Presentation Style' },
  { id: 4, name: 'Voice & Delivery' },
  { id: 5, name: 'Script Input' },
  { id: 6, name: 'Scene Splitting' },
  { id: 7, name: 'Target Model' },
  { id: 8, name: 'Generate Prompts' },
  { id: 9, name: 'API & Provider' },
  { id: 10, name: 'Render Dashboard' },
  { id: 11, name: 'Preview & Export' },
];

export default function Sidebar({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-tight text-emerald-400">Avatar Studio</h1>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Render Engine</p>
      </div>
      
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <div 
              key={step.id}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                isCurrent ? 'bg-zinc-800 text-emerald-400' : 
                isCompleted ? 'text-zinc-300' : 'text-zinc-600'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-500 flex-shrink-0" />
              ) : (
                <Circle className={`w-5 h-5 mr-3 flex-shrink-0 ${isCurrent ? 'text-emerald-400' : 'text-zinc-700'}`} />
              )}
              {step.name}
            </div>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-zinc-800">
        <div className="text-xs text-zinc-500 font-mono">
          DIRECT RENDERING<br/>
          AVATAR CONSISTENCY<br/>
          AUTO-MERGE
        </div>
      </div>
    </div>
  );
}
