const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

// Add route handler for root path
app.get("/", (req, res) => {
  res.send({
    status: "Server is running",
    message: "Welcome to Chess Game WebSocket Server",
    endpoints: {
      websocket: "ws://localhost:3001",
      availableRoutes: [
        {
          path: "/",
          method: "GET",
          description: "Server status and information",
        },
        {
          path: "/health",
          method: "GET",
          description: "Server health check",
        },
      ],
    },
  });
});

// Add health check endpoint
app.get("/health", (req, res) => {
  res.send({ status: "healthy" });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Create or join a room
  socket.on("joinRoom", (roomId) => {
    if (!rooms.has(roomId)) {
      // Create new room
      rooms.set(roomId, {
        players: [socket.id],
        gameState: null,
      });
      socket.join(roomId);
      socket.emit("playerColor", "white");
    } else {
      const room = rooms.get(roomId);
      if (room.players.length < 2) {
        // Join existing room
        room.players.push(socket.id);
        socket.join(roomId);
        socket.emit("playerColor", "black");
        io.to(roomId).emit("gameStart", true);
      } else {
        socket.emit("roomFull");
      }
    }
  });

  // Handle moves
  socket.on("move", ({ roomId, move, fen }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.gameState = fen;
      socket.to(roomId).emit("opponentMove", { move, fen });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    rooms.forEach((room, roomId) => {
      const playerIndex = room.players.indexOf(socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        io.to(roomId).emit("playerDisconnected");
        if (room.players.length === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
