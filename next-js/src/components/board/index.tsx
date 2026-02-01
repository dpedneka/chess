import React, { JSX, useLayoutEffect, useState, useEffect } from "react";
import { Chessboard, PieceDropHandlerArgs } from "react-chessboard";
import GameSession from "../../lib/session";
import { useInitialEffect } from "../../lib/utils";
import "./board.scss";

type Props = {
  game: GameSession;
  isOnline?: boolean;
  playerColor?: "white" | "black";
  onMove?: (move: any) => void;
  disabled?: boolean;
  themeId?: string;
};

import { getThemeById } from "@/lib/themes";

function Board({ game, isOnline, playerColor, onMove, disabled, themeId }: Props): JSX.Element {
  const [position, setPosition] = useState<string>(game.getPosition());
  const [fen, setFen] = useState(game.chess.fen());
  const [evaluation, setEvaluation] = useState<string>("0");

  const getStockfishAnalysis = async (fenString: string) => {
    try {
      const encodedFen = encodeURIComponent(fenString);
      const response = await fetch(
        `https://stockfish.online/api/s/v2.php?fen=${encodedFen}&depth=15`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting Stockfish analysis:", error);
      return null;
    }
  };

  // Observers
  useInitialEffect(() => {
    game.onBoardChange((position) => {
      console.log(game.timer);
      setPosition(position);
      setFen(game.chess.fen());
    });
  });

  // Request evaluation whenever the position changes (including external updates)
  useEffect(() => {
    let mounted = true;
    const fenString = game.chess.fen();
    setEvaluation("...");
    getStockfishAnalysis(fenString)
      .then((analysis) => {
        if (!mounted) return;
        if (analysis && analysis.evaluation !== undefined) {
          setEvaluation(analysis.evaluation);
        } else {
          setEvaluation("0");
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Analysis error:", err);
        setEvaluation("0");
      });

    return () => {
      mounted = false;
    };
  }, [position]);

  const onDrop = ({
    piece,
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs): boolean => {
    if (!targetSquare) return false;

    // Check if move is disabled
    if (disabled) {
      console.log("Move is disabled - not your turn");
      return false;
    }

    try {
      const move = {
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      };

      const result = game.move(move);
      debugger;

      if (result === null) return false; // illegal move

      const newPosition = game.getPosition();
      setPosition(newPosition);
      setFen(newPosition);

      // If online, emit the move to opponent
      if (isOnline && onMove) {
        onMove(move);
      }

      // Get Stockfish analysis after the move
      getStockfishAnalysis(game.chess.fen())
        .then((analysis) => {
          if (analysis) {
            console.log("Stockfish Analysis:", analysis.evaluation);
            setEvaluation(analysis.evaluation);
          }
        })
        .catch((error) => console.error("Analysis error:", error));

      if (game.isGameOver()) {
        console.log("Game over");
        alert("Game over!"); // Notify the user
      }

      return true;
    } catch (error) {
      console.log("Invalid move:", error);
      return false;
    }
  };

  const onSquareClickHandler = ({ square }: any) => {
    console.log("Square clicked:", square);
    // Implement any logic you want when a square is clicked
  };

  const boardOrientation = playerColor || "white";
  const theme = getThemeById(themeId);

  return (
    <div className="board" data-testid="board">
      {evaluation && (
        <div className="evaluation" style={{ marginBottom: "10px" }}>
          Position Evaluation: {evaluation}
        </div>
      )}
      {disabled && (
        <div style={{
          padding: "10px",
          backgroundColor: "#ffeb3b",
          color: "#000",
          borderRadius: "4px",
          marginBottom: "10px",
          textAlign: "center",
          fontWeight: "bold"
        }}>
          Waiting for opponent...
        </div>
      )}
      <Chessboard
        options={{
          animationDurationInMs: 200,
          boardOrientation: boardOrientation as any,
          position,
          lightSquareStyle: { backgroundColor: theme.light },
          darkSquareStyle: { backgroundColor: theme.dark },
          onPieceDrop: onDrop,

          onSquareClick: onSquareClickHandler,
          boardStyle: {
            borderRadius: "4px",
            height: "500px",
            width: "500px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
          },
        }}
      />
    </div>
  );
}

export default Board;
