import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { useGameStore } from '../store/useGameStore';
import { GameMode } from '../types/game';
import CubeSurface from '../components/3d/CubeSurface';
import SphereSurface from '../components/3d/SphereSurface';
import GameHUD from '../components/ui/GameHUD';

export default function Game() {
  const { mode } = useParams<{ mode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initializeGame = useGameStore(state => state.initializeGame);

  useEffect(() => {
    if (mode === 'cube' || mode === 'sphere') {
      const sizeParam = searchParams.get('size');
      const densityParam = searchParams.get('density');

      const size = sizeParam ? parseInt(sizeParam) : 1; // Default to Small (index 1)
      const density = densityParam ? parseFloat(densityParam) : 0.15; // Default to 15%

      console.log(`Initializing Game: Mode=${mode}, Size=${size}, Density=${density}`);
      initializeGame(mode as GameMode, size, density);
    } else {
      navigate('/');
    }
  }, [mode, searchParams, initializeGame, navigate]);

  return (
    <div className="w-full h-screen bg-slate-900 relative">
      <GameHUD />
      
      <Canvas camera={{ position: [0, 0, 4] }} shadows style={{ touchAction: 'none' }}>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        {/* Environment component was causing crash due to fetch error. Removing it for now. */}
        {/* <Environment preset="city" /> */}
        <Stars />
        
        {mode === 'cube' && <CubeSurface />}
        {mode === 'sphere' && <SphereSurface />}
        
        <OrbitControls enablePan={false} minDistance={2} maxDistance={8} />
      </Canvas>
    </div>
  );
}
