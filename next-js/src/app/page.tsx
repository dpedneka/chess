"use client";

import Image from "next/image";
import { io } from "socket.io-client";
import "@/components/board/board.scss";
import { Box, CssBaseline, useTheme } from "@mui/material";
import GameSession from "@/lib/session";
import { useEffect, useState } from "react";
import Header from "@/components/header";
import OnlineGame from "@/components/online-game";
import Board from "@/components/board";
const drawerWidth = 240;

export default function Home() {
  const [game, setGame] = useState<GameSession>();
  const [open, setOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [socket, setSocket] = useState<any>(null);
  const theme = useTheme();

  useEffect(() => {
    setGame(new GameSession(true));
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleJoinOnlineGame = (roomId: string, color: "white" | "black") => {
    setIsOnline(true);
    setPlayerColor(color);
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("opponentMove", ({ move, fen }) => {
      if (game) {
        game.move(move);
      }
    });

    newSocket.on("playerDisconnected", () => {
      alert("Opponent disconnected");
      setIsOnline(false);
      newSocket.close();
      setSocket(null);
    });
  };

  const handleMove = (move: any) => {
    if (socket && isOnline) {
      socket.emit("move", {
        move,
        fen: game?.chess.fen(),
      });
    }
  };

  return game ? (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Header
        drawerWidth={drawerWidth}
        game={game}
        isOnline={isOnline}
        playerColor={playerColor}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 1,
          marginTop: "20px",
          marginLeft: open ? `${drawerWidth}px` : 0,
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <div className="chess" id="container">
          <Box
            sx={{
              display: "flex",
              marginBottom: 3,
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                marginLeft: 2,
                marginRight: 2,
                flex: 1,
              }}
            >
              <Board
                game={game}
                isOnline={isOnline}
                playerColor={playerColor}
                disabled={isOnline && game.chess.turn() !== playerColor[0]}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                marginLeft: 2,
                marginRight: 2,
                flex: 1,
              }}
            >
              <OnlineGame
                onJoinGame={handleJoinOnlineGame}
                open={true}
                onClose={() => {}}
              />
            </Box>
          </Box>

          {/* <Controls game={game} /> */}
        </div>
      </Box>
    </Box>
  ) : (
    <></>
  );
}
