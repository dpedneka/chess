import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, Chip } from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";

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
}

interface MatchTimerProps {
    matchState: MatchState;
}

const MatchTimer: React.FC<MatchTimerProps> = ({ matchState }) => {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        if (matchState.status !== "active" || !matchState.startTime) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - matchState.startTime!) / 1000);
            setElapsedTime(elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [matchState]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
                .toString()
                .padStart(2, "0")}`;
        }
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <TimerIcon />
                    <Typography variant="h6">Match Status</Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Chip
                        label={matchState.status.toUpperCase()}
                        color={
                            matchState.status === "active"
                                ? "success"
                                : matchState.status === "waiting"
                                    ? "warning"
                                    : "default"
                        }
                        variant="filled"
                    />
                    <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
                        Elapsed: <strong sx={{ ml: 1 }}>{formatTime(elapsedTime)}</strong>
                    </Typography>
                </Box>

                {matchState.status === "waiting" && (
                    <Typography variant="body2" color="textSecondary">
                        Waiting for opponent...
                    </Typography>
                )}

                {matchState.status === "active" && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="textSecondary">
                            Players in room: {matchState.players.length}
                        </Typography>
                    </Box>
                )}

                {matchState.status === "finished" && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: "success.light", borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                            {matchState.winner === "draw"
                                ? "Match Ended in a Draw"
                                : `${matchState.winner?.toUpperCase()} Won!`}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default MatchTimer;
