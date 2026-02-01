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
import { useAuth } from "@/lib/auth-context";
import {
  PlayArrow,
  School,
  EmojiEvents,
  Speed,
} from "@mui/icons-material";

const drawerWidth = 240;

export default function Home() {
  const [game, setGame] = useState<GameSession>();
  const [open, setOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [socket, setSocket] = useState<any>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [showGameModes, setShowGameModes] = useState(false);
  const [showGameBoard, setShowGameBoard] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    setGame(new GameSession(true));
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleSelectGameMode = (mode: GameMode) => {
    setSelectedMode(mode);
    setShowGameModes(false);
    setShowGameBoard(true);
  };

  const handlePlayLive = () => {
    router.push("/live-match");
  };

  const handlePlayComputer = () => {
    setShowGameBoard(true);
  };

  const handleBackToHome = () => {
    setShowGameModes(false);
    setShowGameBoard(false);
    setSelectedMode(null);
  };

  const handleJoinOnlineGame = (roomId: string, color: "white" | "black") => {
    setIsOnline(true);
    setPlayerColor(color);

    // Detect if running on local network or localhost
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    const socketUrl = `${protocol}//${host === 'localhost' || host === '127.0.0.1' ? 'localhost' : host}:3001`;

    const newSocket = io(socketUrl);
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

  // Feature cards data
  const features = [
    {
      icon: <PlayArrow sx={{ fontSize: 40, color: "#4c6ef5" }} />,
      title: "Play with Friends",
      description: "Challenge your friends in real-time with multiple game modes",
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: "#ff6b6b" }} />,
      title: "Bullet, Blitz & Rapid",
      description: "Choose your pace: 1+0, 3+2, or 10+0 time controls",
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 40, color: "#ffa94d" }} />,
      title: "Competitive Play",
      description: "Test your skills against players of all levels",
    },
  ];

  // Live games data (mock)
  const liveGames = [
    {
      id: 1,
      player1: "Knight Master",
      player2: "Pawn Pusher",
      rating: "2100",
      time: "15:30",
    },
    {
      id: 2,
      player1: "Bishop's Dream",
      player2: "Rook Ruler",
      rating: "1950",
      time: "14:20",
    },
    {
      id: 3,
      player1: "Queen's Gambit",
      player2: "Knight Rider",
      rating: "2300",
      time: "16:45",
    },
  ];

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
          p: 2,
          marginTop: "20px",
          marginLeft: open ? `${drawerWidth}px` : 0,
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* MAIN HOME PAGE - Hero Section */}
        {!showGameBoard && !showGameModes && (
          <Box sx={{ pb: 8, backgroundColor: "#0a0e27", minHeight: "100vh" }}>
            {/* Hero Section with Dark Theme */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #1a1f3a 0%, #2d1b69 50%, #1a1f3a 100%)",
                borderRadius: 3,
                p: { xs: 3, md: 6 },
                color: "white",
                textAlign: "center",
                mb: 6,
                boxShadow: "0 20px 60px rgba(29, 155, 240, 0.2)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Animated background gradient */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "400px",
                  height: "400px",
                  background: "radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)",
                  borderRadius: "50%",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "300px",
                  height: "300px",
                  background: "radial-gradient(circle, rgba(255, 107, 107, 0.1) 0%, transparent 70%)",
                  borderRadius: "50%",
                }}
              />

              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: "bold",
                    mb: 2,
                    fontSize: { xs: "2rem", md: "3.5rem" },
                    background: "linear-gradient(135deg, #4c6ef5 0%, #ff6b6b 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Welcome, {user?.username}! ♟️
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    opacity: 0.95,
                    fontSize: { xs: "1rem", md: "1.3rem" },
                    color: "#b0b9ff",
                  }}
                >
                  Master the Game of Kings - Play with Friends in Real-Time
                </Typography>

                {/* Primary CTA Buttons */}
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handlePlayLive}
                    sx={{
                      background: "linear-gradient(135deg, #4c6ef5 0%, #5578f8 100%)",
                      color: "white",
                      fontWeight: "bold",
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      boxShadow: "0 8px 25px rgba(76, 110, 245, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #5578f8 0%, #667eea 100%)",
                        boxShadow: "0 12px 35px rgba(76, 110, 245, 0.5)",
                      },
                    }}
                  >
                    <PlayArrow sx={{ mr: 1 }} /> Play Live Match
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handlePlayComputer}
                    sx={{
                      background: "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)",
                      color: "white",
                      fontWeight: "bold",
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      boxShadow: "0 8px 25px rgba(255, 107, 107, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #ff8787 0%, #ff6b6b 100%)",
                        boxShadow: "0 12px 35px rgba(255, 107, 107, 0.5)",
                      },
                    }}
                  >
                    Play Computer
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Game Mode Cards - Features Section */}
            <Container maxWidth="lg">
              <Typography
                variant="h4"
                sx={{
                  textAlign: "center",
                  fontWeight: "bold",
                  mb: 4,
                  color: "white",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                Choose Your Game Mode
              </Typography>

              {/* Game Mode Selection Component */}
              <Box sx={{ mb: 8 }}>
                <GameModeSelection onSelectMode={() => handleSelectGameMode} />
              </Box>

              {/* Live Games Section */}
              <Typography
                variant="h4"
                sx={{
                  textAlign: "center",
                  fontWeight: "bold",
                  mb: 4,
                  color: "white",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                🔴 Live Games Now
              </Typography>

              <Grid container spacing={3} sx={{ mb: 8 }}>
                {liveGames.map((game) => (
                  <Grid item xs={12} sm={6} md={4} key={game.id}>
                    <Card
                      sx={{
                        backgroundColor: "#1a1f3a",
                        border: "1px solid rgba(76, 110, 245, 0.3)",
                        borderRadius: 2,
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        "&:hover": {
                          border: "1px solid rgba(76, 110, 245, 0.8)",
                          boxShadow: "0 8px 25px rgba(76, 110, 245, 0.2)",
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      {/* Live indicator */}
                      <Box
                        sx={{
                          background: "linear-gradient(90deg, #ff4757 0%, #ff6b6b 100%)",
                          p: 2,
                          color: "white",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: "white",
                              animation: "pulse 2s infinite",
                              "@keyframes pulse": {
                                "0%": { opacity: 1 },
                                "50%": { opacity: 0.5 },
                                "100%": { opacity: 1 },
                              },
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                            LIVE
                          </Typography>
                        </Box>
                        <Typography variant="body2">{game.time}</Typography>
                      </Box>
                      <CardContent sx={{ color: "white" }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: "#b0b9ff" }}>
                          {game.rating} Rating
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: "#fff" }}>
                          <strong>{game.player1}</strong>
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#666",
                            display: "flex",
                            justifyContent: "center",
                            my: 1,
                          }}
                        >
                          vs
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#fff" }}>
                          <strong>{game.player2}</strong>
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Daily Puzzle Challenge */}
              <Card
                sx={{
                  background: "linear-gradient(135deg, #ff9f43 0%, #ffa94d 100%)",
                  color: "white",
                  p: 4,
                  borderRadius: 3,
                  mb: 8,
                  boxShadow: "0 15px 40px rgba(255, 159, 67, 0.3)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                />
                <Box sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      mb: 1,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                    }}
                  >
                    ⚡ Daily Challenge
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
                    Solve Today's Puzzle
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, opacity: 0.95 }}>
                    Can you find the winning move? Challenge yourself with our daily puzzle!
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: "white",
                      color: "#ff9f43",
                      fontWeight: "bold",
                      px: 3,
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                      },
                    }}
                  >
                    Start Puzzle
                  </Button>
                </Box>
              </Card>

              {/* Features Section */}
              <Typography
                variant="h4"
                sx={{
                  textAlign: "center",
                  fontWeight: "bold",
                  mb: 4,
                  color: "white",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                Why Play Here?
              </Typography>

              <Grid container spacing={3} sx={{ mb: 6 }}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        p: 3,
                        backgroundColor: "#1a1f3a",
                        border: "1px solid rgba(76, 110, 245, 0.2)",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-12px)",
                          border: "1px solid rgba(76, 110, 245, 0.6)",
                          boxShadow: "0 15px 40px rgba(76, 110, 245, 0.2)",
                        },
                      }}
                    >
                      <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", mb: 1, color: "white" }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#b0b9ff" }}>
                        {feature.description}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Stats Section */}
              <Card
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  boxShadow: "0 15px 40px rgba(102, 126, 234, 0.3)",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    mb: 4,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                  }}
                >
                  Platform Statistics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h3" sx={{ fontWeight: "bold", color: "#4c6ef5" }}>
                      50+
                    </Typography>
                    <Typography variant="body1">Live Matches</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h3" sx={{ fontWeight: "bold", color: "#ff6b6b" }}>
                      3
                    </Typography>
                    <Typography variant="body1">Game Modes</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h3" sx={{ fontWeight: "bold", color: "#ffa94d" }}>
                      ∞
                    </Typography>
                    <Typography variant="body1">Unlimited Fun</Typography>
                  </Grid>
                </Grid>
              </Card>
            </Container>
          </Box>
        )}

        {/* GAME MODE SELECTION - From clicked card */}
        {showGameModes && !showGameBoard && (
          <Container maxWidth="lg">
            <Button
              variant="outlined"
              onClick={handleBackToHome}
              sx={{ mb: 3 }}
            >
              ← Back to Home
            </Button>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h3" sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}>
                Welcome, {user?.username}! 🎮
              </Typography>
              <GameModeSelection onSelectMode={handleSelectGameMode} />
            </Box>
          </Container>
        )}

        {/* CHESS BOARD - Play Computer */}
        {showGameBoard && (
          <div className="chess" id="container">
            {/* Back button to home */}
            <Button
              variant="outlined"
              onClick={handleBackToHome}
              sx={{ mb: 2 }}
            >
              ← Back to Home
            </Button>

            {selectedMode && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Mode: <strong>{selectedMode?.name}</strong> ({selectedMode?.timeControl})
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                marginBottom: 3,
                width: "100%",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flex: 1,
                }}
              >
                <Board
                  game={game}
                  isOnline={isOnline}
                  playerColor={playerColor}
                  disabled={isOnline && game.chess.turn() !== playerColor[0]}
                  onMove={handleMove}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <OnlineGame
                  onJoinGame={handleJoinOnlineGame}
                  open={true}
                  onClose={() => { }}
                />
              </Box>
            </Box>
          </div>
        )}
      </Box>
    </Box>
  ) : (
    <></>
  );
}
