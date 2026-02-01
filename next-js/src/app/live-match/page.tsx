"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    Alert,
} from "@mui/material";
import GameModeSelection, { GameMode } from "@/components/game-mode-selection";
import { useAuth } from "@/lib/auth-context";
import { v4 as uuidv4 } from "uuid";

export default function LiveMatch() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();

    const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
    const [roomId, setRoomId] = useState("");
    const [error, setError] = useState("");
    const [showModeSelection, setShowModeSelection] = useState(true);
    const [isLoading2, setIsLoading2] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/auth");
        }
    }, [isLoading, isAuthenticated, router]);

    const handleSelectGameMode = (mode: GameMode) => {
        setSelectedMode(mode);
        setShowModeSelection(false);
        setError("");
        setRoomId("");
    };

    const handleCreateRoom = () => {
        if (!selectedMode) return;

        const newRoomId = uuidv4();
        setIsLoading2(true);

        // Redirect to the play page with the new room ID
        setTimeout(() => {
            router.push(`/play/${newRoomId}`);
        }, 300);
    };

    const handleJoinRoom = () => {
        if (!roomId.trim()) {
            setError("Please enter a room ID");
            return;
        }

        if (!selectedMode) {
            setError("Please select a game mode first");
            return;
        }

        setIsLoading2(true);
        setError("");

        // Redirect to the play page with the room ID
        setTimeout(() => {
            router.push(`/play/${roomId}`);
        }, 300);
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

    if (showModeSelection) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    p: 3,
                }}
            >
                <Button
                    variant="outlined"
                    onClick={() => router.push("/")}
                    sx={{ mb: 2, color: "white", borderColor: "white" }}
                >
                    ← Back
                </Button>
                <Box sx={{ bgcolor: "white", borderRadius: 2, p: 4 }}>
                    <GameModeSelection onSelectMode={handleSelectGameMode} />
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
            }}
        >
            <Box sx={{ bgcolor: "white", borderRadius: 2, p: 4, maxWidth: "500px", width: "100%" }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}>
                    {selectedMode?.name} Match - {selectedMode?.timeControl}
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {error && (
                        <Alert severity="error">{error}</Alert>
                    )}

                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={handleCreateRoom}
                        disabled={isLoading2}
                        sx={{ py: 1.5 }}
                    >
                        {isLoading2 ? <CircularProgress size={20} sx={{ mr: 1 }} /> : ""}
                        Create New Match
                    </Button>

                    <Typography sx={{ textAlign: "center", my: 1 }}>OR</Typography>

                    <TextField
                        label="Room ID"
                        value={roomId}
                        onChange={(e) => {
                            setRoomId(e.target.value);
                            setError("");
                        }}
                        fullWidth
                        placeholder="Paste friend's room ID"
                        disabled={isLoading2}
                    />

                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={handleJoinRoom}
                        disabled={isLoading2 || !roomId}
                        sx={{ py: 1.5 }}
                    >
                        {isLoading2 ? <CircularProgress size={20} sx={{ mr: 1 }} /> : ""}
                        Join Match
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => {
                            setShowModeSelection(true);
                            setSelectedMode(null);
                            setRoomId("");
                            setError("");
                        }}
                    >
                        Choose Different Mode
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
