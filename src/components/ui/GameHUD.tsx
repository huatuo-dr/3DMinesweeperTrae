import { useGameStore } from '../../store/useGameStore';
import { useNavigate } from 'react-router-dom';
import { Clock, Bomb, Flag, RefreshCw, Home, HelpCircle, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SIZE_LABELS } from '../../types/game';

export default function GameHUD() {
  const navigate = useNavigate();
  const { 
    mineCount, 
    flaggedCount, 
    gameStatus, 
    startTime, 
    endTime,
    resetGame,
    mode,
    size,
    density
  } = useGameStore();

  const [time, setTime] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (gameStatus === 'playing' && startTime) {
      const interval = setInterval(() => {
        setTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    } else if (gameStatus === 'ready') {
      setTime(0);
    } else if (endTime && startTime) {
      setTime(Math.floor((endTime - startTime) / 1000));
    }
  }, [gameStatus, startTime, endTime]);

  useEffect(() => {
    if (gameStatus === 'won' || gameStatus === 'lost') {
      setShowIndicator(true);
      const t = setTimeout(() => setShowIndicator(false), 1500);
      return () => clearTimeout(t);
    }
  }, [gameStatus]);

  return (
    <div className="absolute top-0 left-0 w-full p-4 pointer-events-none z-10 flex flex-col justify-between h-full">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-slate-800/80 p-3 rounded-xl text-white pointer-events-auto backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="hover:text-blue-400 transition">
            <Home size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-blue-400" />
            <span className="font-mono text-xl">{time}s</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Flag size={20} className="text-yellow-400" />
            <span className="font-mono text-xl">{flaggedCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Bomb size={20} className="text-red-400" />
            <span className="font-mono text-xl">{mineCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowHelp(true)} className="hover:text-blue-400 transition">
            <HelpCircle size={24} />
          </button>
          <button onClick={resetGame} className="hover:text-green-400 transition">
            <RefreshCw size={24} />
          </button>
        </div>
      </div>

      {showIndicator && (gameStatus === 'won' || gameStatus === 'lost') && (
        <div className="absolute inset-0 flex items-start justify-center pt-24 pointer-events-none">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg animate-pulse ${gameStatus === 'won' ? 'bg-green-600/80 text-white' : 'bg-red-600/80 text-white'}`}>
            {gameStatus === 'won' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
            <span className="font-semibold">{gameStatus === 'won' ? 'You Won' : 'Game Over'}</span>
          </div>
        </div>
      )}

      {(gameStatus === 'won' || gameStatus === 'lost') && (
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <div className="bg-slate-800/90 text-white rounded-xl border border-slate-700 shadow-2xl backdrop-blur-sm max-w-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <div className={`flex items-center gap-2 ${gameStatus === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                {gameStatus === 'won' ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                <span className="font-semibold">{gameStatus === 'won' ? 'You Won' : 'Game Over'}</span>
              </div>
              <button onClick={() => setCollapsed(!collapsed)} className="text-slate-300 hover:text-white transition">
                {collapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            {!collapsed && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-slate-300 mb-4">
                  <div><span className="text-slate-400">Mode:</span> <span className="font-semibold">{mode === 'cube' ? 'Cube' : 'Sphere'}</span></div>
                  <div><span className="text-slate-400">Size:</span> <span className="font-semibold">{SIZE_LABELS[size] || size}</span></div>
                  <div><span className="text-slate-400">Density:</span> <span className="font-semibold">{Math.round(density * 100)}%</span></div>
                  <div><span className="text-slate-400">Time:</span> <span className="font-semibold">{time}s</span></div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={resetGame}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold"
                  >
                    Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showHelp && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <div className="bg-slate-800 text-white rounded-2xl shadow-2xl border border-slate-700 w-[520px] max-w-[90vw]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <HelpCircle size={20} className="text-blue-400" />
                <span className="font-semibold">帮助</span>
              </div>
              <button onClick={() => setShowHelp(false)} className="hover:text-blue-300 transition">关闭</button>
            </div>
            <div className="p-4 text-slate-200 space-y-2">
              <div>桌面端：左键揭开；右键标记旗帜；滚轮缩放；拖拽旋转视角。</div>
              <div>移动端：单击揭开；双击标记旗帜；双指缩放；拖拽旋转视角。</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
