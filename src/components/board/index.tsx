import React, { JSX, useLayoutEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import GameSession from "../../lib/session";
import { useInitialEffect } from "../../lib/utils";
import "./board.scss";
import { Chess } from "chess.js";

type Props = {
  game: GameSession;
};

function Board({ game }: Props): JSX.Element {
  const [position, setPosition] = useState<string>(game.getPosition());
  const [fen, setFen] = useState(game.chess.fen());

  // const [chessboardSize, setChessboardSize] = useState<number | undefined>(
  //   undefined
  // );

  // Observers
  useInitialEffect(() => {
    game.onBoardChange((position) => {
      console.log(game.timer);
      setPosition(position);
    });
  });

  // Chess resize
  // useLayoutEffect(() => {
  //   function handleResize() {
  //     const display = document.getElementById("container") as HTMLElement;
  //     setChessboardSize(Math.min(720, display?.offsetWidth - 20));
  //   }

  //   window.addEventListener("resize", handleResize);
  //   handleResize();
  //   return () => window.removeEventListener("resize", handleResize);
  // });

  // Functions

  const onSquareClickHandler = ({ square }: any) => {
    console.log("Square clicked:", square);
    // Implement any logic you want when a square is clicked
  };

  const onDrop = ({ sourceSquare, targetSquare }: any) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (move === null) return false; // illegal move

      const newPosition = game.getPosition();
      setPosition(newPosition);
      setFen(newPosition);

      if (game.isGameOver()) {
        console.log("Game over");
        alert("Game over!"); // Notify the user
        // Handle game over logic here, e.g., show a message or reset the game
      }

      return true;
    } catch (error) {
      console.log("Invalid move:", error);
      return false;
    }
  };

  return (
    <div className="board" data-testid="board">
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
