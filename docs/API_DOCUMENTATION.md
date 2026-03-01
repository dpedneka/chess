# Live Chess Match API Documentation

## Overview
This document describes the REST API and WebSocket events for the Live Chess Match system.

## Server Base URL
- **REST API**: `http://localhost:3001`
- **WebSocket**: `ws://localhost:3001`

---

## REST API Endpoints

### 1. Server Status & Health

#### GET `/`
Get server status and available endpoints.

**Response:**
```json
{
  "status": "Server is running",
  "message": "Welcome to Chess Game WebSocket Server",
  "version": "1.0.0",
  "endpoints": {
    "websocket": "ws://localhost:3001",
    "rest": {
      "health": "GET /health",
      "rooms": "GET /api/rooms",
      "room": "GET /api/rooms/:roomId",
      "matches": "GET /api/matches",
      "match": "GET /api/matches/:matchId",
      "createRoom": "POST /api/rooms"
    }
  }
}
```

#### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-08T10:30:00Z",
  "activeRooms": 5,
  "activeMatches": 3
}
```

---

### 2. Room Management

#### GET `/api/rooms`
Get all active rooms.

**Response:**
```json
{
  "rooms": [
    {
      "roomId": "550e8400-e29b-41d4-a716-446655440000",
      "playersCount": 2,
      "status": "active",
      "createdAt": "2025-12-08T10:30:00Z",
      "players": [
        { "name": "Alice", "color": "white" },
        { "name": "Bob", "color": "black" }
      ]
    }
  ]
}
```

#### GET `/api/rooms/:roomId`
Get specific room details.

**Parameters:**
- `roomId` (path): UUID of the room

**Response:**
```json
{
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "active",
  "playersCount": 2,
  "players": [
    {
      "id": "socket-id-1",
      "name": "Alice",
      "color": "white",
      "connected": true
    },
    {
      "id": "socket-id-2",
      "name": "Bob",
      "color": "black",
      "connected": true
    }
  ],
  "gameState": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "createdAt": "2025-12-08T10:30:00Z",
  "matchId": "match-uuid-123"
}
```

#### POST `/api/rooms`
Create a new room.

**Request Body:**
```json
{
  "playerName": "Alice"
}
```

**Response (201 Created):**
```json
{
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "matchId": "match-uuid-123",
  "message": "Room created successfully"
}
```

---

### 3. Match Management

#### GET `/api/matches`
Get all active matches.

**Response:**
```json
{
  "matches": [
    {
      "matchId": "match-uuid-123",
      "roomId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "active",
      "playersCount": 2,
      "players": [
        { "name": "Alice", "color": "white", "id": "socket-1", "connected": true },
        { "name": "Bob", "color": "black", "id": "socket-2", "connected": true }
      ],
      "startTime": "2025-12-08T10:30:00Z",
      "endTime": null,
      "winner": null
    }
  ]
}
```

#### GET `/api/matches/:matchId`
Get specific match details.

**Parameters:**
- `matchId` (path): UUID of the match

**Response:**
```json
{
  "matchId": "match-uuid-123",
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "active",
  "players": [
    {
      "id": "socket-id-1",
      "name": "Alice",
      "color": "white",
      "connected": true
    },
    {
      "id": "socket-id-2",
      "name": "Bob",
      "color": "black",
      "connected": true
    }
  ],
  "startTime": "2025-12-08T10:30:00Z",
  "endTime": null,
  "winner": null,
  "movesCount": 15,
  "moves": [
    {
      "move": { "from": "e2", "to": "e4" },
      "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      "timestamp": "2025-12-08T10:30:05Z"
    }
  ]
}
```

---

## WebSocket Events

### Client → Server Events

#### `joinRoom`
Join or create a room.

**Emit:**
```javascript
socket.emit("joinRoom", {
  roomId: "550e8400-e29b-41d4-a716-446655440000",
  playerName: "Alice",
  userId: "unique-user-id"
});
```

**Description:**
- If `roomId` doesn't exist, creates a new room with the player as white
- If `roomId` exists and has space, adds player as black and starts the match
- If `roomId` is full, emits `roomFull` event

---

#### `move`
Send a move to the opponent.

**Emit:**
```javascript
socket.emit("move", {
  roomId: "550e8400-e29b-41d4-a716-446655440000",
  move: { 
    from: "e2", 
    to: "e4", 
    promotion: "q" // optional
  },
  fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
});
```

**Description:**
- Sends the move to the opponent in the same room
- Updates the game state on the server
- Opponent receives `opponentMove` event

---

#### `endGame`
End the current match.

**Emit:**
```javascript
socket.emit("endGame", {
  roomId: "550e8400-e29b-41d4-a716-446655440000",
  winner: "white", // "white", "black", or "draw"
  reason: "checkmate" // "checkmate", "resignation", "timeout", "draw"
});
```

**Description:**
- Ends the match and records the result
- All players in the room receive `matchEnded` event

---

#### `exitRoom`
Leave the current room.

**Emit:**
```javascript
socket.emit("exitRoom", {
  roomId: "550e8400-e29b-41d4-a716-446655440000"
});
```

**Description:**
- Leaves the room and disconnects from the match
- Other players receive `playerDisconnected` event
- Room is deleted if empty

---

### Server → Client Events

#### `playerColor`
Emitted when player joins a room successfully.

**Receive:**
```javascript
socket.on("playerColor", (color) => {
  console.log("You are playing as:", color); // "white" or "black"
});
```

---

#### `gameStart`
Emitted when both players are in the room.

**Receive:**
```javascript
socket.on("gameStart", (players) => {
  console.log("Match started with players:", players);
  // players = [
  //   { id: "socket-1", name: "Alice", color: "white", connected: true },
  //   { id: "socket-2", name: "Bob", color: "black", connected: true }
  // ]
});
```

---

#### `opponentMove`
Emitted when opponent makes a move.

**Receive:**
```javascript
socket.on("opponentMove", ({ move, fen }) => {
  console.log("Opponent moved:", move);
  console.log("New position:", fen);
});
```

---

#### `playerDisconnected`
Emitted when opponent disconnects.

**Receive:**
```javascript
socket.on("playerDisconnected", () => {
  console.log("Opponent has disconnected");
});
```

---

#### `matchEnded`
Emitted when match ends.

**Receive:**
```javascript
socket.on("matchEnded", ({ winner, reason, timestamp }) => {
  console.log("Match ended");
  console.log("Winner:", winner); // "white", "black", or "draw"
  console.log("Reason:", reason); // "checkmate", "resignation", etc.
  console.log("Time:", timestamp);
});
```

---

#### `roomFull`
Emitted when attempting to join a full room.

**Receive:**
```javascript
socket.on("roomFull", () => {
  console.log("Room is full");
});
```

---

#### `invalidRoom`
Emitted when room ID is invalid.

**Receive:**
```javascript
socket.on("invalidRoom", () => {
  console.log("Room does not exist");
});
```

---

## Example Usage Flow

### Creating a New Match

```javascript
// 1. Connect to server
const socket = io("http://localhost:3001");

// 2. Emit joinRoom (creates new room as player 1)
socket.emit("joinRoom", {
  roomId: "550e8400-e29b-41d4-a716-446655440000",
  playerName: "Alice",
  userId: "user-123"
});

// 3. Receive player color
socket.on("playerColor", (color) => {
  console.log("You are:", color); // "white"
});

// Share room ID with opponent...

// 4. Player 2 joins
// (Same socket.emit with same roomId, different playerName)

// 5. Both players receive gameStart
socket.on("gameStart", (players) => {
  console.log("Match started!");
});

// 6. During game - send move
socket.emit("move", {
  roomId: "550e8400-e29b-41d4-a716-446655440000",
  move: { from: "e2", to: "e4" },
  fen: "..."
});

// 7. Opponent receives move
socket.on("opponentMove", ({ move, fen }) => {
  console.log("Opponent played:", move);
});

// 8. When game ends
socket.emit("endGame", {
  roomId: "550e8400-e29b-41d4-a716-446655440000",
  winner: "white",
  reason: "checkmate"
});

// 9. Both receive notification
socket.on("matchEnded", ({ winner, reason }) => {
  console.log("Match finished. Winner:", winner);
});
```

---

## Error Handling

### Common Errors

1. **Room Not Found**: When joining with invalid roomId
   - Event: `invalidRoom`

2. **Room Full**: When room already has 2 players
   - Event: `roomFull`

3. **Connection Lost**: Automatic reconnection with exponential backoff
   - Max 5 reconnection attempts
   - 1-5 second delay between attempts

---

## Data Models

### Room
```typescript
{
  roomId: string;           // UUID
  matchId: string;          // UUID
  status: "waiting" | "active" | "finished";
  players: Player[];
  gameState: string;        // FEN notation
  createdAt: Date;
  moves: Move[];
}
```

### Match
```typescript
{
  matchId: string;          // UUID
  roomId: string;
  status: "waiting" | "active" | "finished" | "abandoned";
  players: Player[];
  startTime: Date;
  endTime: Date | null;
  winner: "white" | "black" | "draw" | null;
  moves: Move[];
}
```

### Player
```typescript
{
  id: string;               // Socket ID
  name: string;
  color: "white" | "black";
  connected: boolean;
}
```

### Move
```typescript
{
  move: {
    from: string;           // e.g., "e2"
    to: string;             // e.g., "e4"
    promotion?: string;     // e.g., "q"
  };
  fen: string;              // Updated board state
  timestamp: Date;
}
```

---

## Implementation Notes

1. **Room Cleanup**: Empty rooms are automatically deleted after 5 seconds
2. **Auto-Reconnection**: Client automatically reconnects on disconnect
3. **Move Validation**: Move validation should be done on the client before sending
4. **State Persistence**: Game state is stored on server during the match
5. **Player Tracking**: Each player session is tracked with timestamp and metadata
