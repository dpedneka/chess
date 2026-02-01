"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import {
    Box,
    CssBaseline,
    useTheme,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import GameSession from "@/lib/session";
import Header from "@/components/header";
import Board from "@/components/board";
import PlayerInfo from "@/components/player-info";
import MatchTimer from "@/components/match-timer";
import SettingsModal from "@/components/settings/SettingsModal";
import { DEFAULT_THEME_ID, getThemeById } from "@/lib/themes";
import { useAuth } from "@/lib/auth-context";

const drawerWidth = 240;

interface Player {
    id: string;
    name: string;
    color: "white" | "black";
    connected: boolean;
}

interface MatchState {
    roomId: string;
    status: "waiting" | "active" | "finished";
    players: Player[];
    currentTurn: "white" | "black";
    winner?: "white" | "black" | "draw";
    startTime?: number;
    endTime?: number;
    gameMode?: string;
}

export default function PlayGame() {
    const router = useRouter();
    const params = useParams();
    const theme = useTheme();
    const { user, isLoading, isAuthenticated } = useAuth();

    const roomId = params.roomId as string;

    const [game, setGame] = useState<GameSession | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [matchState, setMatchState] = useState<MatchState | null>(null);
    const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
    const [error, setError] = useState("");
    const [isConnecting, setIsConnecting] = useState(true);
    const [roomFullDialog, setRoomFullDialog] = useState(false);
    const [open, setOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [themeId, setThemeId] = useState<string>(DEFAULT_THEME_ID);

    // Initialize game
    useEffect(() => {
        setGame(new GameSession(false));
    }, []);

    // load theme from localStorage on client
    useEffect(() => {
        try {
            if (typeof window !== "undefined") {
                const stored = localStorage.getItem("boardTheme");
                if (stored) setThemeId(stored);
            }
        } catch (err) {
            // ignore
        }
    }, []);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/auth");
        }
    }, [isLoading, isAuthenticated, router]);

    // Initialize socket connection and join room
    useEffect(() => {
        if (!game || !user || !roomId) return;

        // Detect if running on local network or localhost
        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
        const socketUrl = `${protocol}//${host === 'localhost' || host === '127.0.0.1' ? 'localhost' : host}:3001`;

        const newSocket = io(socketUrl, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        newSocket.on("connect", () => {
            console.log("Connected to server:", newSocket.id);

            // Join the room
            newSocket.emit("joinRoom", {
                roomId,
                playerName: user.username,
                userId: newSocket.id,
            });
        });

        newSocket.on("playerColor", (color: "white" | "black") => {
            setPlayerColor(color);
        });

        newSocket.on("gameStart", (players: any[]) => {
            setIsConnecting(false);
            setMatchState((prev) =>
                prev
                    ? {
                        ...prev,
                        status: "active",
                        players: players,
                        startTime: Date.now(),
                    }
                    : {
                        roomId,
                        status: "active",
                        players,
                        currentTurn: "white",
                        startTime: Date.now(),
                    }
            );
        });

        newSocket.on("opponentMove", ({ move, fen }: any) => {
            if (game) {
                game.move(move);
                // Update current turn after opponent's move
                setMatchState((prev) =>
                    prev
                        ? {
                            ...prev,
                            currentTurn: game.chess.turn() === 'w' ? 'white' : 'black',
                        }
                        : null
                );
            }
        });

        newSocket.on("playerDisconnected", () => {
            setMatchState((prev) =>
                prev
                    ? {
                        ...prev,
                        status: "finished",
                        winner: playerColor === "white" ? "white" : "black",
                    }
                    : null
            );
        });

        newSocket.on("matchEnded", ({ winner }: any) => {
            setMatchState((prev) =>
                prev
                    ? {
                        ...prev,
                        status: "finished",
                        winner,
                        endTime: Date.now(),
                    }
                    : null
            );
        });

        newSocket.on("roomFull", () => {
            setError("Room is full. Please try another room.");
            setRoomFullDialog(true);
            setIsConnecting(false);
        });

        setSocket(newSocket);

        // Set initial match state
        setMatchState({
            roomId,
            status: "waiting",
            players: [
                {
                    id: newSocket.id?.toString() || "",
                    name: user.username,
                    color: "white",
                    connected: true,
                },
            ],
            currentTurn: "white",
        });

        return () => {
            newSocket.close();
        };
    }, [game, user, roomId]);

    const handleMove = (move: any) => {
        if (socket && matchState && game) {
            socket.emit("move", {
                roomId: matchState.roomId,
                move,
                fen: game?.chess.fen(),
            });
            // Update current turn after local move
            setMatchState((prev) =>
                prev
                    ? {
                        ...prev,
                        currentTurn: game.chess.turn() === 'w' ? 'white' : 'black',
                    }
                    : null
            );
        }
    };

    const handleExitMatch = () => {
        if (socket && matchState) {
            socket.emit("exitRoom", { roomId: matchState.roomId });
        }
        router.push("/");
    };

    const handleRoomFullClose = () => {
        setRoomFullDialog(false);
        router.push("/");
    };

    const handleThemeChange = (id: string) => {
        setThemeId(id);
    };

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

    if (!game || !matchState) {
        return (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                <CircularProgress />
                <Typography>Joining room: {roomId}</Typography>
            </Box>
        );
    }

    return (
        <>
            <Dialog open={roomFullDialog} onClose={handleRoomFullClose}>
                <DialogTitle>Room Full</DialogTitle>
                <DialogContent>
                    <Typography>
                        The room is full. Please try another room or create a new one.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRoomFullClose} variant="contained">
                        Go Back Home
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <Header
                    drawerWidth={drawerWidth}
                    game={game}
                    isOnline={true}
                    playerColor={playerColor}
                    onOpenSettings={() => setSettingsOpen(true)}
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
                    {isConnecting && !matchState.players.length ? (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 2,
                                height: "400px",
                            }}
                        >
                            <CircularProgress />
                            <Typography>Waiting for opponent...</Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ mb: 3, display: "flex", gap: 2, justifyContent: "space-between" }}>
                                <Box sx={{ flex: 1 }}>
                                    <MatchTimer matchState={matchState} />
                                </Box>
                                <Button variant="outlined" color="error" onClick={handleExitMatch}>
                                    Exit Match
                                </Button>
                            </Box>

                            <Box sx={{ display: "flex", gap: 3 }}>
                                {/* Board Section */}
                                <Box sx={{ flex: 2 }}>
                                    <Board
                                        game={game}
                                        isOnline={true}
                                        playerColor={playerColor}
                                        themeId={themeId}
                                        disabled={
                                            matchState.status !== "active" ||
                                            game.chess.turn() !== playerColor[0]
                                        }
                                        onMove={handleMove}
                                    />
                                </Box>

                                {/* Match Info Section */}
                                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                                    <Typography variant="h6">Room: {matchState.roomId}</Typography>

                                    {matchState.players.map((player) => (
                                        <React.Fragment key={player.id}>
                                            <PlayerInfo
                                                player={player}
                                                isCurrentPlayer={playerColor === player.color}
                                                isCurrentTurn={matchState.currentTurn === player.color}
                                            />
                                        </React.Fragment>
                                    ))}

                                    {matchState.status === "finished" && (
                                        <Box sx={{ p: 2, bgcolor: "success.light", borderRadius: 1 }}>
                                            <Typography variant="subtitle1">
                                                Match Finished
                                            </Typography>
                                            <Typography>
                                                {matchState.winner === "draw"
                                                    ? "It's a Draw!"
                                                    : `Winner: ${matchState.winner}`}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </>
                    )}
                </Box>
            </Box>
            <SettingsModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                value={themeId}
                onChange={(id) => handleThemeChange(id)}
            />
        </>
    );
}
