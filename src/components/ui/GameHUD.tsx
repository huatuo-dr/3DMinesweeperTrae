import { useGameStore } from '../../store/useGameStore';
import { useNavigate } from 'react-router-dom';
import { Clock, Bomb, Flag, RefreshCw, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GameHUD() {
  const navigate = useNavigate();
  const { 
    mineCount, 
    flaggedCount, 
    gameStatus, 
    startTime, 
    endTime,
    resetGame 
  } = useGameStore();

  const [time, setTime] = useState(0);

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

        <button onClick={resetGame} className="hover:text-green-400 transition">
          <RefreshCw size={24} />
        </button>
      </div>

      {/* Game Over / Win Overlay */}
      {(gameStatus === 'won' || gameStatus === 'lost') && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-auto backdrop-blur-sm">
          <div className="bg-slate-800 p-8 rounded-2xl text-center shadow-2xl border border-slate-700">
            <h2 className={`text-4xl font-bold mb-4 ${gameStatus === 'won' ? 'text-green-400' : 'text-red-400'}`}>
              {gameStatus === 'won' ? 'You Won!' : 'Game Over'}
            </h2>
            <p className="text-slate-300 mb-6">Time: {time} seconds</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={resetGame}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition font-semibold"
              >
                Play Again
              </button>
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition font-semibold"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
