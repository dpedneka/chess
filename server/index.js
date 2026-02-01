const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const crypto = require("crypto");
const redis = require("redis");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server for Socket.io
const httpServer = createServer(app);

// ============ REDIS CONFIGURATION ============
// Use Redis for distributed session management
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redisClient = redis.createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});

redisClient.on("error", (err) => console.log("Redis Error", err));
redisClient.on("connect", () => console.log("✓ Redis connected"));

// For backwards compatibility - use in-memory fallback if Redis unavailable
let isRedisConnected = false;

redisClient.connect().then(() => {
  isRedisConnected = true;
}).catch((err) => {
  console.warn("⚠ Redis connection failed, using in-memory storage:", err.message);
  isRedisConnected = false;
});

// ============ STORAGE ABSTRACTION LAYER ============
// Works with both Redis and in-memory storage

// In-memory fallback storage
const memoryStore = {
  rooms: new Map(),
  matches: new Map(),
  playerSessions: new Map(),
  users: new Map(),
  tokens: new Map()
};

// Storage wrapper that works with Redis or memory
const storage = {
  // ROOMS
  setRoom: async (roomId, room) => {
    if (isRedisConnected) {
      await redisClient.set(`room:${roomId}`, JSON.stringify(room), { EX: 86400 }); // 24h expiry
    } else {
      memoryStore.rooms.set(roomId, room);
    }
  },

  getRoom: async (roomId) => {
    if (isRedisConnected) {
      const data = await redisClient.get(`room:${roomId}`);
      return data ? JSON.parse(data) : null;
    } else {
      return memoryStore.rooms.get(roomId);
    }
  },

  deleteRoom: async (roomId) => {
    if (isRedisConnected) {
      await redisClient.del(`room:${roomId}`);
    } else {
      memoryStore.rooms.delete(roomId);
    }
  },

  getAllRooms: async () => {
    if (isRedisConnected) {
      const keys = await redisClient.keys("room:*");
      const rooms = [];
      for (const key of keys) {
        const data = await redisClient.get(key);
        if (data) rooms.push(JSON.parse(data));
      }
      return rooms;
    } else {
      return Array.from(memoryStore.rooms.values());
    }
  },

  // MATCHES
  setMatch: async (matchId, match) => {
    if (isRedisConnected) {
      await redisClient.set(`match:${matchId}`, JSON.stringify(match), { EX: 86400 });
    } else {
      memoryStore.matches.set(matchId, match);
    }
  },

  getMatch: async (matchId) => {
    if (isRedisConnected) {
      const data = await redisClient.get(`match:${matchId}`);
      return data ? JSON.parse(data) : null;
    } else {
      return memoryStore.matches.get(matchId);
    }
  },

  getAllMatches: async () => {
    if (isRedisConnected) {
      const keys = await redisClient.keys("match:*");
      const matches = [];
      for (const key of keys) {
        const data = await redisClient.get(key);
        if (data) matches.push(JSON.parse(data));
      }
      return matches;
    } else {
      return Array.from(memoryStore.matches.values());
    }
  },

  // USERS
  setUser: async (userId, user) => {
    if (isRedisConnected) {
      await redisClient.set(`user:${userId}`, JSON.stringify(user));
    } else {
      memoryStore.users.set(userId, user);
    }
  },

  getUser: async (userId) => {
    if (isRedisConnected) {
      const data = await redisClient.get(`user:${userId}`);
      return data ? JSON.parse(data) : null;
    } else {
      return memoryStore.users.get(userId);
    }
  },

  getAllUsers: async () => {
    if (isRedisConnected) {
      const keys = await redisClient.keys("user:*");
      const users = [];
      for (const key of keys) {
        const data = await redisClient.get(key);
        if (data) users.push(JSON.parse(data));
      }
      return users;
    } else {
      return Array.from(memoryStore.users.values());
    }
  },

  // TOKENS
  setToken: async (token, userId) => {
    if (isRedisConnected) {
      await redisClient.set(`token:${token}`, userId, { EX: 604800 }); // 7 days
    } else {
      memoryStore.tokens.set(token, userId);
    }
  },

  getToken: async (token) => {
    if (isRedisConnected) {
      return await redisClient.get(`token:${token}`);
    } else {
      return memoryStore.tokens.get(token);
    }
  },

  deleteToken: async (token) => {
    if (isRedisConnected) {
      await redisClient.del(`token:${token}`);
    } else {
      memoryStore.tokens.delete(token);
    }
  },

  // SESSIONS
  setSession: async (sessionId, session) => {
    if (isRedisConnected) {
      await redisClient.set(`session:${sessionId}`, JSON.stringify(session), { EX: 86400 });
    } else {
      memoryStore.playerSessions.set(sessionId, session);
    }
  },

  getSession: async (sessionId) => {
    if (isRedisConnected) {
      const data = await redisClient.get(`session:${sessionId}`);
      return data ? JSON.parse(data) : null;
    } else {
      return memoryStore.playerSessions.get(sessionId);
    }
  },

  deleteSession: async (sessionId) => {
    if (isRedisConnected) {
      await redisClient.del(`session:${sessionId}`);
    } else {
      memoryStore.playerSessions.delete(sessionId);
    }
  },

  // COUNT
  getRoomsCount: async () => {
    if (isRedisConnected) {
      return await redisClient.dbSize().then(async (size) => {
        // Approximate count
        return (await redisClient.keys("room:*")).length;
      });
    } else {
      return memoryStore.rooms.size;
    }
  },

  getMatchesCount: async () => {
    if (isRedisConnected) {
      return (await redisClient.keys("match:*")).length;
    } else {
      return memoryStore.matches.size;
    }
  }
};

// ============ AUTH HELPERS ============
const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const generateUserId = () => {
  return "user_" + crypto.randomBytes(8).toString("hex");
};

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = await storage.getToken(token);
  if (!userId) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  req.user = user;
  next();
};

// ============ REST API ENDPOINTS ============

// Server status
app.get("/", (req, res) => {
  res.json({
    status: "Server is running",
    message: "Welcome to Chess Game WebSocket Server",
    version: "1.0.0",
    endpoints: {
      websocket: "ws://localhost:3001",
      rest: {
        health: "GET /health",
        rooms: "GET /api/rooms",
        room: "GET /api/rooms/:roomId",
        matches: "GET /api/matches",
        match: "GET /api/matches/:matchId",
        createRoom: "POST /api/rooms",
      },
    },
  });
});

// Health check
app.get("/health", async (req, res) => {
  const roomsCount = await storage.getRoomsCount();
  const matchesCount = await storage.getMatchesCount();

  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    activeRooms: roomsCount,
    activeMatches: matchesCount,
    storage: isRedisConnected ? "Redis" : "In-Memory",
    redisUrl: isRedisConnected ? "✓ Connected" : "✗ Fallback"
  });
});

// ============ AUTH ENDPOINTS ============

// Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const allUsers = await storage.getAllUsers();
    for (const user of allUsers) {
      if (user.email === email) {
        return res.status(400).json({ error: "Email already registered" });
      }
      if (user.username === username) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }

    const userId = generateUserId();
    const token = generateToken();
    const user = {
      id: userId,
      email,
      username,
      password, // In production, hash this!
      createdAt: new Date().toISOString(),
    };

    await storage.setUser(userId, user);
    await storage.setToken(token, userId);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    let user = null;
    const allUsers = await storage.getAllUsers();
    for (const u of allUsers) {
      if (u.email === email && u.password === password) {
        user = u;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken();
    await storage.setToken(token, user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get current user
app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    username: req.user.username,
    createdAt: req.user.createdAt,
  });
});

// Logout
app.post("/api/auth/logout", authMiddleware, async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    await storage.deleteToken(token);
  }
  res.json({ message: "Logged out successfully" });
});

// Demo users for testing - Initialize immediately in memory
const demoUser1 = {
  id: "user_demo_1",
  email: "test@chess.com",
  username: "TestPlayer",
  password: "password",
  createdAt: new Date().toISOString(),
};

const demoUser2 = {
  id: "user_demo_2",
  email: "player2@chess.com",
  username: "ChampionPlayer",
  password: "password",
  createdAt: new Date().toISOString(),
};

// Initialize demo users in both memory and Redis
(async function initializeDemoUsers() {
  try {
    // Always initialize in memory first
    memoryStore.users.set("user_demo_1", demoUser1);
    memoryStore.users.set("user_demo_2", demoUser2);

    // If Redis is available, also store there
    if (isRedisConnected) {
      await storage.setUser("user_demo_1", demoUser1);
      await storage.setUser("user_demo_2", demoUser2);
    }

    console.log("✓ Demo users initialized:");
    console.log("  - Account 1: test@chess.com / password (TestPlayer)");
    console.log("  - Account 2: player2@chess.com / password (ChampionPlayer)");
  } catch (error) {
    console.error("Error initializing demo users:", error);
  }
})();

// ============ REST API ENDPOINTS ============
app.get("/api/rooms", async (req, res) => {
  try {
    const allRooms = await storage.getAllRooms();
    const roomsList = allRooms.map((room) => ({
      roomId: room.roomId,
      playersCount: room.players.length,
      status: room.status,
      createdAt: room.createdAt,
      players: room.players.map((p) => ({ name: p.name, color: p.color })),
    }));
    res.json({ rooms: roomsList });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// Get specific room details
app.get("/api/rooms/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await storage.getRoom(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({
      roomId,
      status: room.status,
      playersCount: room.players.length,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        connected: p.connected,
      })),
      gameState: room.gameState,
      createdAt: room.createdAt,
      matchId: room.matchId,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

// Create a new room
app.post("/api/rooms", async (req, res) => {
  try {
    const { playerName } = req.body;

    if (!playerName) {
      return res.status(400).json({ error: "playerName is required" });
    }

    const { v4: uuid } = require("uuid");
    const roomId = uuid();
    const matchId = uuid();

    const room = {
      roomId,
      matchId,
      status: "waiting",
      players: [],
      gameState: null,
      createdAt: new Date(),
      moves: [],
    };

    const match = {
      matchId,
      roomId,
      status: "waiting",
      players: [{ name: playerName, color: "white" }],
      startTime: new Date(),
      endTime: null,
      winner: null,
      moves: [],
    };

    await storage.setRoom(roomId, room);
    await storage.setMatch(matchId, match);

    res.status(201).json({
      roomId,
      matchId,
      message: "Room created successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

// Get all active matches
app.get("/api/matches", async (req, res) => {
  try {
    const allMatches = await storage.getAllMatches();
    const matchesList = allMatches.map((match) => ({
      matchId: match.matchId,
      roomId: match.roomId,
      status: match.status,
      playersCount: match.players.length,
      players: match.players,
      startTime: match.startTime,
      endTime: match.endTime,
      winner: match.winner,
    }));
    res.json({ matches: matchesList });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

// Get specific match details
app.get("/api/matches/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    const match = await storage.getMatch(matchId);

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json({
      matchId,
      roomId: match.roomId,
      status: match.status,
      players: match.players,
      startTime: match.startTime,
      endTime: match.endTime,
      winner: match.winner,
      movesCount: match.moves.length,
      moves: match.moves.slice(-10), // Last 10 moves
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch match" });
  }
});

// ============ WEBSOCKET EVENTS ============

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://192.168.1.103:3000",
      "http://192.168.1.103:3001"
    ],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`[${new Date().toISOString()}] User connected:`, socket.id);

  // Join a room and start/join a match
  socket.on("joinRoom", async ({ roomId, playerName, userId }) => {
    console.log(
      `[${new Date().toISOString()}] Player ${playerName} attempting to join room ${roomId}`
    );

    let room = await storage.getRoom(roomId);

    if (!room) {
      // Create new room
      const { v4: uuid } = require("uuid");
      const matchId = uuid();
      room = {
        roomId,
        matchId,
        status: "waiting",
        players: [
          {
            id: socket.id,
            name: playerName,
            color: "white",
            connected: true,
          },
        ],
        gameState: null,
        createdAt: new Date(),
        moves: [],
      };

      const match = {
        matchId,
        roomId,
        status: "waiting",
        players: [
          {
            id: socket.id,
            name: playerName,
            color: "white",
            connected: true,
          },
        ],
        startTime: new Date(),
        endTime: null,
        winner: null,
        moves: [],
      };

      await storage.setRoom(roomId, room);
      await storage.setMatch(matchId, match);

      socket.join(roomId);
      socket.emit("playerColor", "white");

      console.log(
        `[${new Date().toISOString()}] New room created: ${roomId} by ${playerName}`
      );
    } else {
      if (room.players.length >= 2) {
        socket.emit("roomFull");
        console.log(
          `[${new Date().toISOString()}] Room ${roomId} is full. Connection rejected.`
        );
        return;
      }

      // Join existing room
      room.players.push({
        id: socket.id,
        name: playerName,
        color: "black",
        connected: true,
      });

      const match = await storage.getMatch(room.matchId);
      if (match) {
        match.players.push({
          id: socket.id,
          name: playerName,
          color: "black",
          connected: true,
        });
        match.status = "active";
        await storage.setMatch(room.matchId, match);
      }

      room.status = "active";
      await storage.setRoom(roomId, room);

      socket.join(roomId);
      socket.emit("playerColor", "black");

      // Notify all players in the room
      io.to(roomId).emit("gameStart", room.players);

      console.log(
        `[${new Date().toISOString()}] Player ${playerName} joined room ${roomId}. Match started.`
      );
    }

    // Store player session
    await storage.setSession(socket.id, {
      playerName,
      roomId,
      userId,
      connectedAt: new Date(),
    });
  });

  // Handle moves
  socket.on("move", async ({ roomId, move, fen }) => {
    const room = await storage.getRoom(roomId);
    if (room) {
      room.gameState = fen;
      room.moves.push({
        move,
        fen,
        timestamp: new Date(),
      });
      await storage.setRoom(roomId, room);

      const match = await storage.getMatch(room.matchId);
      if (match) {
        match.moves.push({
          move,
          fen,
          timestamp: new Date(),
        });
        await storage.setMatch(room.matchId, match);
      }

      socket.to(roomId).emit("opponentMove", { move, fen });
      console.log(`[${new Date().toISOString()}] Move in room ${roomId}:`, move);
    }
  });

  // Handle game end
  socket.on("endGame", async ({ roomId, winner, reason }) => {
    const room = await storage.getRoom(roomId);
    if (room) {
      room.status = "finished";
      await storage.setRoom(roomId, room);

      const match = await storage.getMatch(room.matchId);
      if (match) {
        match.status = "finished";
        match.winner = winner;
        match.endTime = new Date();
        await storage.setMatch(room.matchId, match);
      }

      io.to(roomId).emit("matchEnded", {
        winner,
        reason,
        timestamp: new Date(),
      });

      console.log(
        `[${new Date().toISOString()}] Match in room ${roomId} ended. Winner: ${winner}`
      );
    }
  });

  // Handle room exit
  socket.on("exitRoom", async ({ roomId }) => {
    const session = await storage.getSession(socket.id);
    console.log(
      `[${new Date().toISOString()}] Player exiting room ${roomId}:`,
      session?.playerName
    );

    socket.leave(roomId);
    const room = await storage.getRoom(roomId);

    if (room) {
      room.players = room.players.filter((p) => p.id !== socket.id);
      await storage.setRoom(roomId, room);

      if (room.players.length === 0) {
        await storage.deleteRoom(roomId);
        const match = await storage.getMatch(room.matchId);
        if (match) {
          match.status = "abandoned";
          match.endTime = new Date();
          await storage.setMatch(room.matchId, match);
        }
      } else {
        io.to(roomId).emit("playerDisconnected");
      }
    }

    await storage.deleteSession(socket.id);
  });

  // Handle disconnection
  socket.on("disconnect", async () => {
    const session = await storage.getSession(socket.id);
    console.log(
      `[${new Date().toISOString()}] User disconnected:`,
      socket.id,
      "Name:",
      session?.playerName
    );

    const allRooms = await storage.getAllRooms();
    for (const room of allRooms) {
      const playerIndex = room.players.findIndex((p) => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players[playerIndex].connected = false;
        await storage.setRoom(room.roomId, room);
        io.to(room.roomId).emit("playerDisconnected");

        // Clean up empty rooms
        if (room.players.length === 1) {
          setTimeout(async () => {
            const currentRoom = await storage.getRoom(room.roomId);
            if (
              currentRoom &&
              currentRoom.players.every((p) => !p.connected)
            ) {
              await storage.deleteRoom(room.roomId);
              console.log(
                `[${new Date().toISOString()}] Empty room ${room.roomId} deleted`
              );
            }
          }, 5000);
        }
      }
    }

    await storage.deleteSession(socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log(`[${new Date().toISOString()}] ✓ Chess Server running on port ${PORT}`);
  console.log(`[${new Date().toISOString()}] WebSocket: ws://localhost:${PORT}`);
  console.log(`[${new Date().toISOString()}] REST API: http://localhost:${PORT}/api`);
  console.log(`[${new Date().toISOString()}] Storage: ${isRedisConnected ? "✓ Redis" : "⚠ In-Memory Fallback"}`);
  console.log("=".repeat(60) + "\n");
});
