import React, { JSX, useLayoutEffect, useState } from "react";
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
};

function Board({ game }: Props): JSX.Element {
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
    });
  });

  const onDrop = ({
    piece,
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs): boolean => {
    if (!targetSquare) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
      debugger;

      if (move === null) return false; // illegal move

      const newPosition = game.getPosition();
      setPosition(newPosition);
      setFen(newPosition);

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

  return (
    <div className="board" data-testid="board">
      {evaluation && (
        <div className="evaluation" style={{ marginBottom: "10px" }}>
          Position Evaluation: {evaluation}
        </div>
      )}
      <Chessboard
        options={{
          animationDurationInMs: 200,
          boardOrientation: "white",
          position,
          lightSquareStyle: { backgroundColor: "rgb(217 227 232)" },
          darkSquareStyle: { backgroundColor: "rgb(149 176 191)" },
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
