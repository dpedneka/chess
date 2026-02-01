import React from "react";
import { Box, Typography, Chip } from "@mui/material";

interface Player {
    id: string;
    name: string;
    color: "white" | "black";
    connected: boolean;
}

interface PlayerInfoProps {
    player: Player;
    isCurrentPlayer: boolean;
    isCurrentTurn: boolean;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({
    player,
    isCurrentPlayer,
    isCurrentTurn,
}) => {
    return (
        <Box
            sx={{
                p: 2,
                border: isCurrentTurn ? "2px solid" : "1px solid",
                borderColor: isCurrentTurn ? "primary.main" : "divider",
                borderRadius: 1,
                bgcolor: isCurrentTurn ? "action.hover" : "transparent",
                transition: "all 0.3s ease",
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {player.name} {isCurrentPlayer && "(You)"}
                </Typography>
                <Chip
                    label={player.color}
                    size="small"
                    color={player.color === "white" ? "default" : "default"}
                    variant="outlined"
                />
            </Box>
            <Typography variant="body2" color="textSecondary">
                Status: {player.connected ? "Connected" : "Disconnected"}
            </Typography>
            {isCurrentTurn && (
                <Typography variant="body2" sx={{ color: "primary.main", mt: 1 }}>
                    ➤ Your Turn
                </Typography>
            )}
        </Box>
    );
};

export default PlayerInfo;
