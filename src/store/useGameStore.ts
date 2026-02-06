import { create } from 'zustand';
import { GameState, GameMode, Cell } from '../types/game';
import { generateGame } from '../logic/gridGenerator';

interface GameActions {
  initializeGame: (mode: GameMode, size: number, density: number) => void;
  revealCell: (id: string) => void;
  toggleFlag: (id: string) => void;
  resetGame: () => void;
  checkWin: () => void;
}

// Initial state helper
const getInitialState = (): GameState => ({
  cells: new Map(),
  gameStatus: 'ready',
  mode: 'cube',
  size: 2, // Default Medium (index 2)
  density: 0.15, // Default 15%
  totalCells: 0,
  mineCount: 0,
  revealedCount: 0,
  flaggedCount: 0,
  startTime: null,
  endTime: null,
});

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...getInitialState(),

  initializeGame: (mode, size, density) => {
    console.log(`[Store] initializing... mode=${mode} size=${size} density=${density}`);
    const cells = generateGame(mode, size, density);
    console.log(`[Store] generated ${cells.size} cells`);
    let mineCount = 0;
    cells.forEach(cell => {
      if (cell.isMine) mineCount++;
    });

    set({
      cells,
      gameStatus: 'ready',
      mode,
      size,
      density,
      totalCells: cells.size,
      mineCount,
      revealedCount: 0,
      flaggedCount: 0,
      startTime: null,
      endTime: null,
    });
  },

  resetGame: () => {
    const { mode, size, density } = get();
    get().initializeGame(mode, size, density);
  },

  revealCell: (id) => {
    const state = get();
    if (state.gameStatus !== 'playing' && state.gameStatus !== 'ready') return;
    
    const cells = new Map(state.cells);
    const cell = cells.get(id);

    if (!cell || cell.isRevealed || cell.isFlagged) return;

    // Start game if ready
    let startTime = state.startTime;
    let gameStatus = state.gameStatus;
    
    if (gameStatus === 'ready') {
      gameStatus = 'playing';
      startTime = Date.now();
      // Ensure first click is not a mine (optional, but good UX)
      // For now, if it is a mine, tough luck or implement "safe start" logic.
      // Implementing "safe start" requires moving mines.
      // Let's implement simple "if mine, game over" for now, can improve later.
    }

    if (cell.isMine) {
      cell.isRevealed = true;
      cells.set(id, cell);
      set({
        cells,
        gameStatus: 'lost',
        startTime,
        endTime: Date.now(),
      });
      return;
    }

    // Flood fill
    const stack = [id];
    let revealedDelta = 0;

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      const currentCell = cells.get(currentId);
      
      if (!currentCell || currentCell.isRevealed || currentCell.isFlagged) continue;

      currentCell.isRevealed = true;
      revealedDelta++;
      cells.set(currentId, currentCell);

      if (currentCell.neighborCount === 0 && !currentCell.isMine) {
        currentCell.neighbors.forEach(nId => {
          const neighbor = cells.get(nId);
          if (neighbor && !neighbor.isRevealed && !neighbor.isFlagged) {
            stack.push(nId);
          }
        });
      }
    }

    set((prev) => {
      const newRevealedCount = prev.revealedCount + revealedDelta;
      // Check win condition
      const isWin = newRevealedCount === prev.totalCells - prev.mineCount;
      
      return {
        cells,
        gameStatus: isWin ? 'won' : gameStatus,
        startTime,
        endTime: isWin ? Date.now() : prev.endTime,
        revealedCount: newRevealedCount,
      };
    });
  },

  toggleFlag: (id) => {
    const state = get();
    if (state.gameStatus !== 'playing' && state.gameStatus !== 'ready') return;

    const cells = new Map(state.cells);
    const cell = cells.get(id);

    if (!cell || cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    cells.set(id, cell);

    set((prev) => ({
      cells,
      flaggedCount: prev.flaggedCount + (cell.isFlagged ? 1 : -1),
    }));
  },

  checkWin: () => {
    // Already handled in revealCell
  }
}));
