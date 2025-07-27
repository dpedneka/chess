import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

interface OnlineGameProps {
  onJoinGame: (roomId: string, color: "white" | "black") => void;
  open: boolean;
  onClose: () => void;
}
// interface OnlineGameProps {
//   onJoinGame: (roomId: string, color: "white" | "black") => void;
// }

const OnlineGame: React.FC<OnlineGameProps> = ({ onJoinGame }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("playerColor", (color: "white" | "black") => {
      onJoinGame(roomId, color);
      setIsLoading(false);
      setDialogOpen(false);
    });

    socket.on("roomFull", () => {
      setError("Room is full");
      setIsLoading(false);
    });

    return () => {
      socket.off("playerColor");
      socket.off("roomFull");
    };
  }, [socket, roomId, onJoinGame]);

  const createGame = () => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    setIsLoading(true);
    socket?.emit("joinRoom", newRoomId);
  };

  const joinGame = () => {
    if (!roomId) {
      setError("Please enter a room ID");
      return;
    }
    setIsLoading(true);
    socket?.emit("joinRoom", roomId);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          my: 5,
          flex: 1,
        }}
      >
        <Button
          sx={{
            width: "100%",
            height: "70px",
            fontSize: "1.2rem",
          }}
          variant="outlined"
          onClick={() => setDialogOpen(true)}
        >
          Play Online
        </Button>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Play Online</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 2 }}>
            <LoadingButton
              loading={isLoading}
              variant="contained"
              onClick={createGame}
            >
              Create New Game
            </LoadingButton>

            <Typography align="center">OR</Typography>

            <TextField
              label="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              error={!!error}
              helperText={error}
            />

            <LoadingButton
              loading={isLoading}
              variant="contained"
              onClick={joinGame}
            >
              Join Game
            </LoadingButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OnlineGame;
