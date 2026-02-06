import { Vector3 } from 'three';

export type GameMode = 'cube' | 'sphere';
export type GameStatus = 'ready' | 'playing' | 'won' | 'lost';

export interface Cell {
  id: string;
  position: Vector3;
  normal: Vector3; // Normal vector for orientation
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
  neighbors: string[]; // IDs of neighboring cells
  // For visualization geometry
  polygonVertices?: Vector3[];
  geometryData?: any; 
}

export interface GameState {
  cells: Map<string, Cell>;
  gameStatus: GameStatus;
  mode: GameMode;
  size: number;
  density: number;
  totalCells: number;
  mineCount: number;
  revealedCount: number;
  flaggedCount: number;
  startTime: number | null;
  endTime: number | null;
}

export const SIZE_LABELS = ['Mini', 'Small', 'Medium', 'Large', 'Extra Large'];

export const CUBE_SIZES = [4, 6, 8, 10, 12];

// Sphere Subdivisions: 1 (42), 2 (162), 3 (642), 4 (2562)
// Mapping indices 0-4 to subdivisions. 
// Mini=1, Small=2, Medium=3, Large=3(dupe?), XL=4
// Or: Mini=0(12), Small=1(42), Medium=2(162), Large=3(642), XL=4(2562)
// Let's use 0-4 directly as subdivisions index, but skip 0 (12 is too small)
// Let's shift: Mini=1, Small=2, Medium=3, Large=3, XL=4 is weird.
// Let's try: [1, 2, 3, 3, 4] or just [1, 2, 3, 4, 4]?
// Actually, let's use:
export const SPHERE_SUBDIVISIONS = [1, 2, 3, 3, 4]; 
// Note: 4 is heavy (2562 cells). 3 is 642. 
// Maybe Large should be 3 and XL be 4.
// Let's stick to [1, 2, 3, 4, 4] for now, or just limit sphere options if needed.

export interface LeaderboardEntry {
  id: string;
  username: string;
  mode: GameMode;
  size: number;
  density: number;
  time: number;
  created_at: string;
}
