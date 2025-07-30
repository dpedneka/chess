export interface GameSessionTimer {
  white: number;
  black: number;
}

export interface GameSessionHistory {
  timer: GameSessionTimer;
  position: string;
  moveNotation: string;
  fullMoveNumber: number;
}

export interface GameSessionStorage {
  history: GameSessionHistory[];
  position: string;
  timer: GameSessionTimer;
  currentIndex: number;
  movesHistory: string[];
}

export interface GameSessionListeners {
  move: ((position: string) => void)[];
  timer: ((timer: GameSessionTimer) => void)[];
}
