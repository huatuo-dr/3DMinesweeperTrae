
import { generateGame } from './logic/gridGenerator';
import { GameMode } from './types/game';

console.log('Testing Grid Generation...');

try {
  const cubeCells = generateGame('cube', 1, 0.15); // Size index 1 (Small), 15% density
  console.log(`Cube (Size 1): Generated ${cubeCells.size} cells.`);
  
  if (cubeCells.size === 0) {
    console.error('ERROR: Cube generation returned 0 cells!');
  } else {
    const firstCell = cubeCells.values().next().value;
    console.log('First Cube Cell:', JSON.stringify(firstCell, null, 2));
  }

  const sphereCells = generateGame('sphere', 1, 0.15); // Size index 1
  console.log(`Sphere (Size 1): Generated ${sphereCells.size} cells.`);
  
  if (sphereCells.size === 0) {
    console.error('ERROR: Sphere generation returned 0 cells!');
  } else {
    const firstCell = sphereCells.values().next().value;
    // Simplify output for sphere cell (remove polygonVertices for readability)
    const { polygonVertices, ...rest } = firstCell;
    console.log('First Sphere Cell (no vertices):', JSON.stringify(rest, null, 2));
  }

} catch (error) {
  console.error('CRITICAL ERROR:', error);
}
