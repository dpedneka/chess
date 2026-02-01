# 🎮 Chess Live Match - Visual Guide & Flow Diagrams

Complete visual reference for understanding the system architecture and user flows.

---

## 🎯 User Flow Diagram

```
┌─────────────────┐          ┌─────────────────┐
│    Player 1     │          │    Player 2     │
│   (Web Browser) │          │   (Web Browser) │
└────────┬────────┘          └────────┬────────┘
         │                             │
         │ Click "Play Live Match"     │ Click "Play Live Match"
         │                             │
    ┌────▼─────────────────────────────▼────┐
    │   Live Match Page Component           │
    │  (/app/live-match/page.tsx)          │
    │                                      │
    │  ┌─────────────────────────────────┐ │
    │  │  Join Room Dialog               │ │
    │  │  - Enter player name            │ │
    │  │  - Create room / Enter room ID  │ │
    │  └─────────────────────────────────┘ │
    └────┬─────────────────────────────────┬┘
         │                                 │
         │ "Create Room"                  │ "Join Room"
         │ (generates UUID)               │ (uses existing ID)
         │                                 │
    ┌────▼────────────┐             ┌─────▼─────────┐
    │  Socket.emit    │             │  Socket.emit  │
    │  "joinRoom"     │             │  "joinRoom"   │
    │  - roomId       │             │  - roomId     │
    │  - playerName   │             │  - playerName │
    │  - userId       │             │  - userId     │
    └────┬────────────┘             └─────┬─────────┘
         │                                 │
         └──────────────┬──────────────────┘
                        │
                        ▼ (WebSocket)
              ┌─────────────────────┐
              │  Chess Server       │
              │ (Socket.io handler) │
              │  /server/index.js   │
              │                     │
              │ ┌─────────────────┐ │
              │ │ Check if room   │ │
              │ │ exists          │ │
              │ └─────────────────┘ │
              └─────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
    NO  ▼                         YES  ▼
  ┌───────────────┐         ┌───────────────┐
  │ Create Room   │         │  Join Room    │
  │ Player 1=W    │         │  Player 2=B   │
  │ Status=Wait   │         │  Status=Active│
  └───────────────┘         └───────────────┘
         │                         │
         │ "playerColor":"white"  │ "playerColor":"black"
         │                         │
         │◄────────────────────────┘
         │
         │ "gameStart": [players]
         │
    ┌────▼────────────────────────────────────────┐
    │  Live Match Page (Active State)             │
    │                                             │
    │  ┌────────────────────┐  ┌─────────────┐   │
    │  │  Chess Board       │  │  Player 1   │   │
    │  │  (react-chessboard)│  │  - Name     │   │
    │  │                    │  │  - Color: ♔ │   │
    │  │    ♜ ♞ ♝ ♛ ♚ ... │  │  - Status   │   │
    │  │    ♟ ♟ ♟ ♟ ♟ ... │  │  - Your Turn│   │
    │  │    8 7 6 5 4 3 2 1│  └─────────────┘   │
    │  │    a b c d e f g h│  ┌─────────────┐   │
    │  │    ♙ ♙ ♙ ♙ ♙ ... │  │  Player 2   │   │
    │  │    ♖ ♘ ♗ ♕ ♔ ... │  │  - Name     │   │
    │  │                    │  │  - Color: ♞ │   │
    │  └────────────────────┘  │  - Status   │   │
    │                          │  - Waiting  │   │
    │  ┌────────────────────┐  └─────────────┘   │
    │  │  Match Timer       │                    │
    │  │  - Status: Active  │  ┌─────────────┐   │
    │  │  - Elapsed: 5:32   │  │  Room ID    │   │
    │  │  - Players: 2      │  │  550e8400...│   │
    │  └────────────────────┘  └─────────────┘   │
    └────┬────────────────────────────────────────┘
         │
         │ Player moves a piece (e2 -> e4)
         │
         │ Socket.emit "move"
         │
         ▼ (WebSocket)
      ┌─────────────────────┐
      │  Chess Server       │
      │ Store move          │
      │ Update game state   │
      └─────────────────────┘
              │
              │ Socket.to(roomId).emit "opponentMove"
              │
              ▼
      ┌─────────────────────┐
      │  Opponent's Screen  │
      │  Board updates      │
      │  Turn changes       │
      └─────────────────────┘
              │
              │ Game continues...
              │
              ▼
      ┌─────────────────────┐
      │ End Game condition  │
      │ - Checkmate         │
      │ - Resignation       │
      │ - Draw              │
      └─────────────────────┘
              │
              │ Socket.emit "endGame"
              │
              ▼
      ┌─────────────────────┐
      │  Chess Server       │
      │ Record result       │
      │ Update match status │
      └─────────────────────┘
              │
              │ Socket.to(roomId).emit "matchEnded"
              │
              ▼
      ┌─────────────────────┐
      │  Both Players       │
      │ "Match Finished"    │
      │ "Winner: White"     │
      │ [Exit Match Button] │
      └─────────────────────┘
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js App Directory                   │  │
│  │                                                      │  │
│  │  ┌──────────────────┐  ┌──────────────────────────┐ │  │
│  │  │  / (home)        │  │  /live-match (NEW!)      │ │  │
│  │  │                  │  │                          │ │  │
│  │  │ - Local game     │  │ - Join room dialog      │ │  │
│  │  │ - Online game    │  │ - Match state mgmt      │ │  │
│  │  │ - Play button ──────► - Real-time sync        │ │  │
│  │  └──────────────────┘  │ - Player info display   │ │  │
│  │                        │ - Match timer display   │ │  │
│  │                        └──────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                              │
│  ┌──────────────────────────▼─────────────────────────────┐ │
│  │           Components (Reusable UI)                     │ │
│  │                                                        │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐      │ │
│  │  │   Board    │  │PlayerInfo  │  │MatchTimer │      │ │
│  │  │(UPDATED)   │  │(NEW!)      │  │(NEW!)     │      │ │
│  │  │            │  │            │  │           │      │ │
│  │  │chess board │  │player name │  │elapsed ⏱ │      │ │
│  │  │+controls   │  │status ●    │  │match info │      │ │
│  │  │onMove()    │  │turn ▶      │  │status    │      │ │
│  │  │disabled    │  │color badge │  │result    │      │ │
│  │  └────────────┘  └────────────┘  └────────────┘      │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐      │ │
│  │  │  Header    │  │ OnlineGame │  │ Controls   │      │ │
│  │  └────────────┘  └────────────┘  └────────────┘      │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│  ┌──────────────────────────▼─────────────────────────────┐ │
│  │            Game Logic Library                          │ │
│  │                                                        │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │ GameSession (session.ts)                        │  │ │
│  │  │ - Chess.js integration                          │  │ │
│  │  │ - Move validation                               │  │ │
│  │  │ - Timer management                              │  │ │
│  │  │ - Game state tracking                           │  │ │
│  │  │ - Move history                                  │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
└──────────────────────────────┼───────────────────────────────┘
                              │
                              │ Socket.io Connection
                              │ http://localhost:3001
                              │
┌──────────────────────────────▼───────────────────────────────┐
│                      BACKEND (Express)                       │
│                    /server/index.js                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            REST API Endpoints                         │ │
│  │                                                        │ │
│  │  GET  /                   Server status              │ │
│  │  GET  /health             Health check               │ │
│  │  GET  /api/rooms          List all rooms             │ │
│  │  GET  /api/rooms/:id      Room details               │ │
│  │  POST /api/rooms          Create room                │ │
│  │  GET  /api/matches        List matches               │ │
│  │  GET  /api/matches/:id    Match details              │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│  ┌────────────────────────────▼────────────────────────────┐ │
│  │        Socket.io Event Handlers                        │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ joinRoom (→)                                     │ │ │
│  │  │ ├─ Check if room exists                         │ │ │
│  │  │ ├─ Create or add to room                        │ │ │
│  │  │ ├─ Assign color (white/black)                   │ │ │
│  │  │ └─ Emit playerColor (←)                         │ │ │
│  │  │ Emit gameStart when 2 players join (←)          │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ move (→)                                         │ │ │
│  │  │ ├─ Validate move                                │ │ │
│  │  │ ├─ Store in move history                        │ │ │
│  │  │ ├─ Update game state (FEN)                      │ │ │
│  │  │ └─ Broadcast opponentMove (←)                   │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ endGame (→) / exitRoom (→)                       │ │ │
│  │  │ ├─ Update match status                          │ │ │
│  │  │ ├─ Record winner                                │ │ │
│  │  │ ├─ Clean up resources                           │ │ │
│  │  │ └─ Emit matchEnded (←)                          │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│  ┌────────────────────────────▼────────────────────────────┐ │
│  │        Data Storage (In-Memory Maps)                   │ │
│  │                                                        │ │
│  │  rooms: Map                                          │ │
│  │  ├─ roomId                                           │ │
│  │  ├─ matchId                                          │ │
│  │  ├─ players[]                                        │ │
│  │  ├─ gameState (FEN)                                 │ │
│  │  ├─ moves[]                                         │ │
│  │  └─ status                                          │ │
│  │                                                        │ │
│  │  matches: Map                                         │ │
│  │  ├─ matchId                                          │ │
│  │  ├─ roomId                                           │ │
│  │  ├─ players[]                                        │ │
│  │  ├─ status                                          │ │
│  │  ├─ winner                                          │ │
│  │  ├─ startTime / endTime                             │ │
│  │  └─ moves[]                                         │ │
│  │                                                        │ │
│  │  playerSessions: Map                                  │ │
│  │  ├─ socketId → playerName, roomId, etc             │ │
│  │  └─ connectedAt                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 WebSocket Event Flow (Detailed)

```
TIMELINE: Game Start to Move

T=0s  Player1 connects to /live-match page
      └─ socket.io client initialized
      └─ waiting for Socket connection event

T=1s  ┌─────────────────────┐
      │ Player1: joinRoom   │
      │ roomId: abc123      │
      │ playerName: Alice   │
      └─────────────────────┘
              │
              ▼ (WebSocket → Server)
      ┌──────────────────────────────────────┐
      │ Server receives joinRoom             │
      │ - Room doesn't exist → Create room   │
      │ - Add Player1 as WHITE               │
      │ - Store in rooms Map                 │
      │ - Create match record                │
      └──────────────────────────────────────┘
              │
              ▼ (WebSocket ← Server)
      ┌──────────────────────────────────────┐
      │ Player1 receives playerColor         │
      │ color: "white"                       │
      │ Display: "You are WHITE"             │
      │ Status: Waiting for opponent...      │
      └──────────────────────────────────────┘

T=5s  Player2 connects & enters same roomId
      │
      ▼ (WebSocket → Server)
      ┌──────────────────────────────────────┐
      │ Server receives joinRoom             │
      │ - Room exists with 1 player          │
      │ - Add Player2 as BLACK               │
      │ - Update room status: "active"       │
      │ - Update match status: "active"      │
      └──────────────────────────────────────┘
              │
        ┌─────┴─────┐
        │           │
        ▼           ▼
      ┌────────────────────────────────────────┐
      │ Player1 receives:                      │
      │ gameStart([                            │
      │   {id:X, name:Alice, color:white},   │
      │   {id:Y, name:Bob, color:black}      │
      │ ])                                     │
      └────────────────────────────────────────┘
      
      ┌────────────────────────────────────────┐
      │ Player2 receives:                      │
      │ playerColor("black")                   │
      │ gameStart([                            │
      │   {id:X, name:Alice, color:white},   │
      │   {id:Y, name:Bob, color:black}      │
      │ ])                                     │
      └────────────────────────────────────────┘

T=10s Player1 moves e2 → e4
      │
      ▼ (WebSocket → Server)
      ┌──────────────────────────────────────┐
      │ Server receives move                  │
      │ move: {from: e2, to: e4, ...}        │
      │ fen: "rnbqkbnr/pppppppp/8/8/4P3..."│
      │                                      │
      │ - Validate & store move              │
      │ - Update room.gameState              │
      │ - Add to move history                │
      └──────────────────────────────────────┘
              │
              ▼ (WebSocket ← Server)
      ┌──────────────────────────────────────┐
      │ Player2 receives opponentMove         │
      │ move: {from: e2, to: e4, ...}        │
      │ fen: "rnbqkbnr/pppppppp/8/8/4P3..."│
      │                                      │
      │ - Update local board state           │
      │ - Change turn indicator              │
      │ - Wait for their move                │
      └──────────────────────────────────────┘

T=15s Player2 moves c7 → c5
      │
      ▼ (WebSocket → Server)
      │
      ▼ (WebSocket ← Server)
      │ Player1 receives opponentMove
      │
      (Process repeats...)

T=150s Player1 achieves checkmate
       │
       ▼ (WebSocket → Server)
       ┌──────────────────────────────────────┐
       │ Server receives endGame               │
       │ winner: "white"                      │
       │ reason: "checkmate"                  │
       │                                      │
       │ - Update match.status: "finished"    │
       │ - Set match.winner: "white"          │
       │ - Record endTime                     │
       └──────────────────────────────────────┘
               │
         ┌─────┴─────┐
         │           │
         ▼           ▼
       ┌──────────────────────────────────────┐
       │ Both Players receive matchEnded       │
       │ winner: "white"                      │
       │ reason: "checkmate"                  │
       │ timestamp: "2025-12-08T14:30:45Z"   │
       │                                      │
       │ UI shows: "Match Finished"           │
       │          "White Won!"                │
       │          [Exit Match] button         │
       └──────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌──────────────────────────────────────────────────────┐
│         USER INTERACTION                             │
│                                                      │
│  1. Opens /live-match page                          │
│  2. Enters name + creates/joins room                │
│  3. Makes moves by dragging pieces                  │
│  4. Sees opponent's moves in real-time              │
│  5. Game ends when checkmate/draw/resignation       │
│  6. Clicks exit to leave match                      │
└───────────────┬──────────────────────────────────────┘
                │
                ▼
        ┌──────────────────┐
        │  React Component │
        │  State Changes   │
        │  (matchState)    │
        └───────┬──────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
┌────────┐ ┌────────┐ ┌───────────┐
│ Board  │ │ Player │ │ Match     │
│Display │ │ Info   │ │ Timer     │
│        │ │Display │ │ Display   │
└────┬───┘ └─────┬──┘ └─────┬─────┘
     │           │          │
     └─────┬─────┴──────────┘
           │
           ▼ (WebSocket Event)
     ┌──────────────────┐
     │ socket.emit()    │
     │ or              │
     │ socket.on()      │
     └────────┬─────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Socket.io Client   │
    │  (/node_modules)    │
    └────────┬────────────┘
             │
             │ HTTP WebSocket Upgrade
             │ (TCP connection)
             │
    ┌────────▼────────────────────────────────┐
    │  Express Server (server/index.js)        │
    │                                         │
    │  Socket.io Handler                      │
    │  ├─ joinRoom                           │
    │  ├─ move                               │
    │  ├─ endGame                            │
    │  └─ exitRoom                           │
    │                                         │
    │  Data Storage                           │
    │  ├─ rooms Map                          │
    │  ├─ matches Map                        │
    │  └─ playerSessions Map                │
    └────────┬────────────────────────────────┘
             │
    ┌────────▼────────────────────────────────┐
    │  REST Endpoints (HTTP GET/POST)        │
    │  ├─ /api/rooms                         │
    │  ├─ /api/matches                       │
    │  ├─ /health                            │
    │  └─ /                                  │
    └────────────────────────────────────────┘
```

---

## 🎮 State Machine Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Match State Machine                        │
└─────────────────────────────────────────────────────────┘

                    [START]
                       │
                       ▼
              ┌─────────────────┐
              │     WAITING     │
              │  (1 player)     │
              └────────┬────────┘
                       │
          Player 2 joins with joinRoom()
                       │
                       ▼
              ┌─────────────────┐
              │     ACTIVE      │
              │  (2 players)    │
              │  gameStart sent │
              └────────┬────────┘
                       │
        Players make moves / watch board update
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    [CHECKMATE]   [RESIGNED]    [DRAW]
         │             │             │
         └─────────────┼─────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │    FINISHED     │
              │  (winner set)   │
              │  matchEnded sent│
              └────────┬────────┘
                       │
            Players click "Exit Match"
                       │
                       ▼
              ┌─────────────────┐
              │     ENDED       │
              │  (room deleted) │
              └─────────────────┘


┌─────────────────────────────────────────────────────────┐
│              Player Connection States                   │
└─────────────────────────────────────────────────────────┘

CONNECTED ──┐
            │ (normal flow)
            ▼
       PLAYING ────────────┐
            │              │
            │        Opponent disconnects
            │              │
            ▼              ▼
       WAITING        DISCONNECTED
            │              │
            │       (5 sec timeout)
            │              │
            │              ▼
            │         ROOM DELETED
            │
       Game ends
            │
            ▼
       EXITED
```

---

## 📈 Sequence Diagram: Full Match

```
Player1             Client1            Server           Client2            Player2
   │                   │                   │                │                │
   │ Click             │                   │                │                │
   │ Live Match────────►                   │                │                │
   │                   │ joinRoom          │                │                │
   │                   │ (roomId, name)    │                │                │
   │                   ├──────────────────►│                │                │
   │                   │                   │ Create room    │                │
   │                   │                   │                │                │
   │                   │ ◄──────playerColor│                │                │
   │                   │    (white)        │                │                │
   │                   │                   │                │                │
   │ ◄─ Show waiting ──┤                   │                │                │
   │                   │                   │                │                │
   │                   │                   │                │  joinRoom      │
   │                   │                   │ ◄──────────────┼─────────────── │
   │                   │                   │ (same roomId)  │                │
   │                   │                   │                │                │
   │                   │ ◄──────gameStart──┤─────gameStart──►│                │
   │                   │ [players array]   │ [players array] │                │
   │                   │                   │                │                │
   │                   │                   │ ◄──────────────┼─playerColor    │
   │                   │                   │    (black)     │                │
   │                   │                   │                │                │
   │ ◄─────Ready───────┤                   │                │ ───Ready──────►│
   │ (White to move)   │                   │                │  (Black ready) │
   │                   │                   │                │                │
   │ Move piece        │                   │                │                │
   │ (e2→e4)──────────►│                   │                │                │
   │                   │ move              │                │                │
   │                   │ {from, to, fen}──►│ Store move     │                │
   │                   │                   │                │                │
   │                   │                   │ ◄──opponentMove─────────────────┼
   │                   │ ◄──opponentMove───┤ {from, to, fen}                │
   │                   │ {from, to, fen}   │                │                │
   │ ◄────Update───────┤                   │                │ ───Update─────►│
   │ Board shows       │                   │                │ Board updated  │
   │ opponent move     │                   │                │ (ready to move)│
   │                   │                   │                │                │
   │ [... game continues with moves back and forth ...]    │                │
   │                   │                   │                │                │
   │ Checkmate!        │                   │                │                │
   │ (Alice wins)──────┤                   │                │                │
   │                   │ endGame           │                │                │
   │                   │ {winner, reason}─►│ Finish match   │                │
   │                   │                   │                │                │
   │                   │ ◄───matchEnded────┼────matchEnded──►│                │
   │                   │ {winner, reason}  │ {winner, reason}│                │
   │                   │                   │                │                │
   │ ◄─Show Result─────┤                   │                │ ───Show Result─┼─► │
   │ "White won!"      │                   │                │ "You lost!"    │    │
   │ [Exit Match]      │                   │                │ [Exit Match]   │    │
   │                   │                   │                │                │    │
   │ Click Exit────────┤                   │                │                │    │
   │                   │ exitRoom          │                │                │    │
   │                   │─────────────────► │ Delete room    │                │    │
   │                   │                   │                │                │    │
   │ ◄───Redirect──────┤                   │                │ ───Redirect────┤───►│
   │ to /              │                   │                │ to /           │    │
   │                   │                   │                │                │    │
```

---

## 🎯 Component Hierarchy

```
App (next-js/src/app/live-match/page.tsx)
├─ CssBaseline
├─ Header
│  ├─ AppBar
│  ├─ Drawer
│  └─ Toolbar
├─ Main Box
│  ├─ MatchInfo Box
│  │  ├─ MatchTimer
│  │  │  └─ Card
│  │  │     ├─ Status Badge
│  │  │     ├─ Elapsed Timer
│  │  │     └─ Match Details
│  │  └─ Exit Button
│  │
│  └─ GameArea Box
│     ├─ BoardSection (flex: 2)
│     │  └─ Board
│     │     ├─ Chessboard Component
│     │     ├─ Piece Drag Handler
│     │     └─ Square Click Handler
│     │
│     └─ InfoSection (flex: 1)
│        ├─ RoomID Display
│        ├─ PlayerInfo (Player 1)
│        │  ├─ Player Name
│        │  ├─ Color Badge
│        │  ├─ Status Badge
│        │  └─ Turn Indicator
│        ├─ PlayerInfo (Player 2)
│        │  ├─ Player Name
│        │  ├─ Color Badge
│        │  ├─ Status Badge
│        │  └─ Turn Indicator
│        └─ MatchResult (conditionally shown)
│           ├─ Winner Display
│           └─ Result Details
```

---

## 🔗 Connection Points

```
FRONTEND ────────────────► BACKEND

1. Socket.io connection established
   └─ http://localhost:3001 (WebSocket upgrade from HTTP)

2. REST API calls (optional, for statistics/history)
   └─ http://localhost:3001/api/* (HTTP GET/POST)

3. Static assets from public folder
   └─ Images, icons, manifest

4. Stockfish analysis (external API)
   └─ https://stockfish.online/api/s/v2.php
```

---

## ⚡ Real-Time Sync Timeline

```
Event: Player 1 moves e2→e4

Local Client1                   Network                     Remote Client2
(Alice)                        (WebSocket)                  (Bob)

T=0ms  User drags e2→e4        
       └─ State updated locally
       └─ Board re-renders
       └─ emit "move"
       
T=1ms                           ──► move event in flight ──►
       
T=10ms                                                       Receives "move"
                                                              └─ Update local state
                                                              └─ Board re-renders
                                                              └─ Turn indicator updates

Lag: ~10ms (usually < 50ms on good connection)
Display: Instant for local user, ~10-50ms delay for opponent
```

---

This visual guide should help you understand the complete system! 🎉
