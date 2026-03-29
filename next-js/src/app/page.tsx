"use client";

import Image from "next/image";
import { io } from "socket.io-client";
import "@/components/board/board.scss";
import {
  Box,
  CssBaseline,
  useTheme,
  Button,
  Container,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import GameSession from "@/lib/session";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import OnlineGame from "@/components/online-game";
import Board from "@/components/board";
import GameModeSelection, { GameMode } from "@/components/game-mode-selection";
// import { useAuth } from "@/lib/auth-context";
import {
  PlayArrow,
  School,
  EmojiEvents,
  Speed,
} from "@mui/icons-material";
import LiveGamesHomePage from "@/components/live-games/home-page";

const drawerWidth = 240;

export default function Home() {
  const [game, setGame] = useState<GameSession>();
  const [isOnline, setIsOnline] = useState(false);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  // const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    setGame(new GameSession(true));
  }, []);

  // Redirect to login if not authenticated
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     router.push("/auth");
  //   }
  // }, [isLoading, isAuthenticated, router]);

  // if (isLoading) {
  // return (
  //   <Box
  //     sx={{
  //       display: "flex",
  //       alignItems: "center",
  //       justifyContent: "center",
  //       height: "100vh",
  //     }}
  //   >
  //     <CircularProgress />
  //   </Box>
  // );
  // }

  return game ? (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />
      <Header
      // drawerWidth={drawerWidth}
      // game={game}
      // isOnline={isOnline}
      // playerColor={playerColor}
      />
      <LiveGamesHomePage />
    </Box>
  ) : (
    <></>
  );
}
