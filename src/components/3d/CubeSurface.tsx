import { useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { CUBE_SIZES } from '../../types/game';
import Cell3D from './Cell3D';

export default function CubeSurface() {
  const { cells, size } = useGameStore();
  
  const cellSize = useMemo(() => {
    const gridDimension = CUBE_SIZES[size];
    return 2 / gridDimension;
  }, [size]);

  const cellList = useMemo(() => Array.from(cells.values()), [cells]);

  return (
    <group>
      {/* Inner Cube to hide gaps */}
      <mesh>
        <boxGeometry args={[1.98, 1.98, 1.98]} />
        <meshStandardMaterial color="#334155" /> 
      </mesh>

      {cellList.map((cell) => (
        <Cell3D key={cell.id} cell={cell} size={cellSize} />
      ))}
    </group>
  );
}
