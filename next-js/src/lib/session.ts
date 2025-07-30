import { Chess } from "chess.js";
import {
  GameSessionHistory,
  GameSessionListeners,
  GameSessionStorage,
  GameSessionTimer,
} from "./types";

const initialTimer: GameSessionTimer = { white: 600, black: 600 };
const initialPosition =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

class GameSession {
  chess: Chess;
  listeners: GameSessionListeners;
  timer: GameSessionTimer;
  history: GameSessionHistory[];
  timeout?: number;
  currentIndex: number;
  isReset?: boolean;
  movesHistory: string[] = [];

  constructor(loadFromStorage?: boolean) {
    const storedSessionValue = localStorage.getItem("gameSession");
    const session: GameSessionStorage =
      storedSessionValue && loadFromStorage
        ? JSON.parse(storedSessionValue)
        : undefined;

    this.chess = new Chess();
    this.chess.load(session ? session.position : initialPosition);

    this.timer = session ? session.timer : { ...initialTimer };

    this.history = session
      ? session.history
      : [
          {
            timer: { ...initialTimer },
            position: initialPosition,
            moveNotation: '',
            fullMoveNumber: 0
          },
        ];

    this.currentIndex = session ? session.currentIndex : 0;

    this.listeners = { move: [], timer: [] };

    this.startTimer();
  }

  killTimer() {
    if (this.timeout) {
      clearInterval(this.timeout);
    }
  }

  startTimer() {
    this.timeout = window.setInterval(() => {
      if (this.isReset) {
        this.isReset = false;
        return;
      }

      if (!this.isGameOver() && !this.isFirstMove()) {
        this.setTimer({
          ...this.timer,
          [this.getOrientation()]: this.timer[this.getOrientation()] - 1,
        });
        this.save();
      }
    }, 1000);
  }

  getOrientation() {
    return this.chess.turn() === "w" ? "white" : "black";
  }

  move(move: { from: string; to: string; promotion?: string }) {
    const moved = this.chess.move(move);

    if (!moved) {
      return null;
    }

    // Store move in algebraic notation
    const moveNumber = Math.floor((this.chess.moveNumber() - 1) / 2) + 1;
    const isWhiteMove = this.chess.turn() === "b"; // Already made the move, so check opposite
    const moveNotation = moved.san;

    if (isWhiteMove) {
      this.movesHistory.push(`${moveNumber}. ${moveNotation}`);
    } else {
      this.movesHistory[this.movesHistory.length - 1] += ` ${moveNotation}`;
    }

    // Check if the board is not in the latest state of the history
    if (this.history.length !== this.currentIndex + 1) {
      const regression = this.history.length - (this.currentIndex + 1);
      this.history.splice(-regression);
      this.movesHistory.splice(-regression);
    }

    this.history = [
      ...this.history,
      {
        timer: this.timer,
        position: this.getPosition(),
        moveNotation: moveNotation,
        fullMoveNumber: moveNumber,
      },
    ];
    this.currentIndex++;

    this.trigger("move", this.getPosition());
    this.save();

    return moved;
  }

  reset() {
    this.killTimer();
    this.isReset = true;
    this.chess.reset();
    this.history = [
      {
        timer: { ...initialTimer },
        position: initialPosition,
      },
    ];
    this.movesHistory = [];
    this.trigger("move", initialPosition);
    this.setTimer(initialTimer);
    this.currentIndex = 0;
    this.save();
    this.startTimer();
  }

  getMoveHistory(): string[] {
    return [...this.movesHistory];
  }

  getFormattedMoveHistory(): string {
    return this.movesHistory.join("\n");
  }

  undo() {
    const previousPosition = this.history[this.currentIndex - 1];
    const currentPosition = this.history[this.currentIndex];
    if (!previousPosition) {
      return;
    }

    this.chess.load(previousPosition.position);
    this.timer = currentPosition.timer;
    this.currentIndex--;
    this.trigger("move", previousPosition.position);
    this.save();
  }

  redo() {
    const nextPosition = this.history[this.currentIndex + 1];
    const currentPosition = this.history[this.currentIndex];

    if (!nextPosition) {
      return;
    }

    this.chess.load(nextPosition.position);
    this.timer = currentPosition.timer;
    this.currentIndex++;
    this.trigger("move", nextPosition.position);
    this.save();
  }

  setTimer(value: GameSessionTimer) {
    this.timer = { ...value };
    this.trigger("timer", { ...this.timer });
  }

  getPosition() {
    return this.chess.fen();
  }

  save() {
    const game: GameSessionStorage = {
      history: this.history,
      position: this.history[this.currentIndex].position,
      timer: this.timer,
      currentIndex: this.currentIndex,
      movesHistory: this.movesHistory,
    };

    localStorage.setItem("gameSession", JSON.stringify(game));
  }

  isGameOver() {
    return !this.timer.white || !this.timer.black || this.chess.isGameOver();
  }

  isFirstMove() {
    return this.history.length === 1;
  }

  getLoser() {
    return this.chess.isCheckmate() ||
      this.timer.black === 0 ||
      this.timer.white === 0
      ? this.chess.turn() !== "w"
        ? "white"
        : "black"
      : "draw";
  }

  // Event handlers
  onBoardChange(handler: GameSessionListeners["move"][number]) {
    this.listeners.move.push(handler);
  }

  onTimerChange(handler: GameSessionListeners["timer"][number]) {
    this.listeners.timer.push(handler);
  }

  trigger<Events extends keyof GameSessionListeners>(
    event: Events,
    data: Parameters<GameSessionListeners[Events][number]>[number]
  ) {
    this.listeners[event].forEach((listener) => listener(data as any));
  }
}

export default GameSession;
