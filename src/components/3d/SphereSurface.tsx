import { useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import Cell3D from './Cell3D';

export default function SphereSurface() {
  const { cells, totalCells } = useGameStore();
  
  const cellSize = useMemo(() => {
    // Surface area of sphere r=1 is 4*PI
    // Area per cell = 4*PI / totalCells
    // Side length of square with same area = sqrt(Area)
    if (totalCells === 0) return 0.2;
    return Math.sqrt(4 * Math.PI / totalCells) * 0.8; // 0.8 scaling factor for spacing
  }, [totalCells]);

  const cellList = useMemo(() => Array.from(cells.values()), [cells]);

  return (
    <group>
      {/* Inner Sphere to hide gaps */}
      <mesh>
        <icosahedronGeometry args={[0.98, 4]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {cellList.map((cell) => (
        <Cell3D key={cell.id} cell={cell} size={cellSize} />
      ))}
    </group>
  );
}
