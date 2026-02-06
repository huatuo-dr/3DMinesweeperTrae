import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Globe, Play } from 'lucide-react';
import { GameMode, SIZE_LABELS } from '../types/game';

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<GameMode>('cube');
  const [size, setSize] = useState<number>(1); // Default Small (index 1)
  const [density, setDensity] = useState<number>(15); // 15%

  const handleStart = () => {
    navigate(`/game/${mode}?size=${size}&density=${density / 100}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in-down">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
          3D Minesweeper
        </h1>
        <p className="text-slate-400 text-xl">Explore the surface, avoid the mines.</p>
      </div>

      {/* Main Card */}
      <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-2xl">
        
        {/* Mode Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-300 mb-4 uppercase tracking-wider">Select Mode</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode('cube')}
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group
                ${mode === 'cube' 
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
                  : 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'}`}
            >
              <Box size={48} className={mode === 'cube' ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
              <span className="font-bold text-xl">Cube</span>
            </button>
            <button
              onClick={() => setMode('sphere')}
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group
                ${mode === 'sphere' 
                  ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20' 
                  : 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'}`}
            >
              <Globe size={48} className={mode === 'sphere' ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'} />
              <span className="font-bold text-xl">Sphere</span>
            </button>
          </div>
        </div>

        {/* Size Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-300 mb-4 uppercase tracking-wider">Size</h2>
          <div className="grid grid-cols-5 gap-2">
            {SIZE_LABELS.map((label, index) => (
              <button
                key={index}
                onClick={() => setSize(index)}
                className={`py-3 px-1 rounded-xl border transition-all text-sm font-medium
                  ${size === index
                    ? 'bg-slate-100 text-slate-900 border-slate-100' 
                    : 'bg-transparent border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Density Selection */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-semibold text-slate-300 uppercase tracking-wider">Mine Density</h2>
            <span className="text-2xl font-bold text-blue-400">{density}%</span>
          </div>
          
          <input
            type="range"
            min="10"
            max="30"
            value={density}
            onChange={(e) => setDensity(parseInt(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Easy (10%)</span>
            <span>Medium (15%)</span>
            <span>Hard (20%)</span>
            <span>Extreme (25%)</span>
            <span>Hell (30%)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleStart}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Play size={24} fill="currentColor" />
            Start Game
          </button>
        </div>

      </div>
      
      <div className="mt-8 text-slate-500 text-sm">
        v0.2.0 • Custom Difficulty Update
      </div>
    </div>
  );
}
