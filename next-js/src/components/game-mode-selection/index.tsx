import React from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
} from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
import ThunderboltIcon from "@mui/icons-material/Bolt";

export interface GameMode {
    id: "bullet" | "rapid" | "blitz";
    name: string;
    description: string;
    timeControl: string;
    icon: React.ReactNode;
    timeLimit: number; // in seconds
    color: string;
}

const GAME_MODES: GameMode[] = [
    {
        id: "bullet",
        name: "Bullet",
        description: "Lightning fast chess",
        timeControl: "1+0",
        icon: <ThunderboltIcon sx={{ fontSize: 40 }} />,
        timeLimit: 60,
        color: "#ff6b6b",
    },
    {
        id: "blitz",
        name: "Blitz",
        description: "Quick tactical battles",
        timeControl: "3+2",
        icon: <ThunderboltIcon sx={{ fontSize: 40 }} />,
        timeLimit: 180,
        color: "#ffa94d",
    },
    {
        id: "rapid",
        name: "Rapid",
        description: "Strategic gameplay",
        timeControl: "10+0",
        icon: <TimerIcon sx={{ fontSize: 40 }} />,
        timeLimit: 600,
        color: "#4c6ef5",
    },
];

interface GameModeSelectionProps {
    onSelectMode: (mode: GameMode) => void;
    isLoading?: boolean;
}

const GameModeSelection: React.FC<GameModeSelectionProps> = ({
    onSelectMode,
    isLoading = false,
}) => {
    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ mb: 4, textAlign: "center", fontWeight: "bold" }}>
                Select Game Mode
            </Typography>

            <Grid container spacing={3}>
                {GAME_MODES.map((mode) => (
                    <Grid item xs={12} sm={6} md={4} key={mode.id}>
                        <Card
                            sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-8px)",
                                    boxShadow: 4,
                                    borderColor: mode.color,
                                },
                                border: `2px solid transparent`,
                            }}
                        >
                            <CardContent
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 2,
                                    flex: 1,
                                }}
                            >
                                <Box sx={{ color: mode.color }}>{mode.icon}</Box>

                                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                                    {mode.name}
                                </Typography>

                                <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center" }}>
                                    {mode.description}
                                </Typography>

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mt: 1,
                                    }}
                                >
                                    <TimerIcon sx={{ fontSize: 20, color: "primary.main" }} />
                                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                        {mode.timeControl}
                                    </Typography>
                                </Box>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => onSelectMode(mode)}
                                    disabled={isLoading}
                                    sx={{
                                        mt: 2,
                                        bgcolor: mode.color,
                                        "&:hover": {
                                            bgcolor: mode.color,
                                            opacity: 0.9,
                                        },
                                    }}
                                >
                                    Play {mode.name}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default GameModeSelection;
export { GAME_MODES };
