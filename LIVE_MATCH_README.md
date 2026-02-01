# Chess - Live Multiplayer Chess Game

A full-stack real-time chess application where two players can play live matches in dedicated rooms. Built with Next.js, React, Socket.io, and Express.

## Features

✨ **Live Multiplayer Matches**
- Create or join live chess matches in dedicated rooms
- Real-time move synchronization
- Player presence and connection status tracking

🎮 **Game Features**
- Full chess rules implementation using chess.js
- Stockfish engine integration for position analysis
- Move history and FEN notation tracking
- Timer display for match duration

📊 **REST API**
- Comprehensive API for room management
- Match history and statistics tracking
- Real-time server health monitoring
- Full WebSocket support for live games

🏗️ **Architecture**
- Responsive design with Material-UI
- WebSocket real-time communication
- Server-side room and match management
- Persistent session tracking

---

## Project Structure

```
chess/
├── next-js/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Home page with game selection
│   │   │   └── live-match/    # Live match page
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   ├── board/         # Chess board component
│   │   │   ├── header/        # App header
│   │   │   ├── controls/      # Game controls
│   │   │   ├── online-game/   # Online game dialog
│   │   │   ├── player-info/   # Player details component
│   │   │   └── match-timer/   # Match timer component
│   │   └── lib/
│   │       ├── session.ts     # Game session manager
│   │       ├── types.ts       # TypeScript definitions
│   │       └── utils.ts       # Utility functions
│   └── package.json
│
├── server/                     # Express + Socket.io Backend
│   ├── index.js               # Main server file
│   └── package.json
│
├── react/                      # Legacy React app (optional)
├── public/                     # Static files
└── API_DOCUMENTATION.md        # API docs
```

---

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd chess
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install frontend dependencies**
```bash
cd ../next-js
npm install
```

### Running the Application

1. **Start the backend server** (Terminal 1)
```bash
cd server
npm run dev
```
Server runs on `http://localhost:3001`

2. **Start the frontend** (Terminal 2)
```bash
cd next-js
npm run dev
```
Frontend runs on `http://localhost:3000`

3. **Open in browser**
```
http://localhost:3000
```

---

## Usage

### Playing a Live Match

#### Player 1 (Creating a Room)
1. Click "🎮 Play Live Match" on the home page
2. Enter your name
3. Click "Create New Room"
4. Share the room ID with your opponent

#### Player 2 (Joining a Room)
1. Click "🎮 Play Live Match" on the home page
2. Enter your name
3. Paste the room ID from Player 1
4. Click "Join Room"
5. Match starts automatically once both players join

#### During the Match
- White moves first
- Click and drag pieces to move
- Current player is highlighted
- Timer shows match duration
- Player status shows connection status

#### End Game
- Click "Exit Match" to leave
- Match ends when both players exit or opponent disconnects

---

## API Endpoints

### REST API

#### Server Status
```bash
GET http://localhost:3001/
GET http://localhost:3001/health
```

#### Rooms
```bash
GET    http://localhost:3001/api/rooms           # List all rooms
GET    http://localhost:3001/api/rooms/:roomId   # Get room details
POST   http://localhost:3001/api/rooms           # Create room
```

#### Matches
```bash
GET    http://localhost:3001/api/matches         # List all matches
GET    http://localhost:3001/api/matches/:matchId # Get match details
```

### WebSocket Events

#### Client → Server
- `joinRoom` - Join or create a room
- `move` - Send a move to opponent
- `endGame` - End the current match
- `exitRoom` - Leave the room

#### Server → Client
- `playerColor` - Assigned color (white/black)
- `gameStart` - Match started with player list
- `opponentMove` - Opponent made a move
- `playerDisconnected` - Opponent disconnected
- `matchEnded` - Match finished
- `roomFull` - Room is full
- `invalidRoom` - Room doesn't exist

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API documentation.

---

## Key Components

### Board Component (`components/board/index.tsx`)
The main chess board interface powered by react-chessboard.

**Props:**
- `game` - GameSession instance
- `isOnline` - Boolean for online mode
- `playerColor` - Player's piece color
- `onMove` - Callback for moves
- `disabled` - Disable moves

### Player Info Component (`components/player-info/index.tsx`)
Displays player details and current turn indicator.

**Props:**
- `player` - Player object
- `isCurrentPlayer` - Boolean
- `isCurrentTurn` - Boolean

### Match Timer Component (`components/match-timer/index.tsx`)
Shows match status, elapsed time, and game state.

**Props:**
- `matchState` - Match state object

### Live Match Page (`app/live-match/page.tsx`)
Main page for live multiplayer chess games.

---

## Game Session Management

The `GameSession` class handles all game logic:

```typescript
import GameSession from "@/lib/session";

const game = new GameSession(false);
game.move({ from: "e2", to: "e4" });
console.log(game.chess.fen());        // Current position
console.log(game.isGameOver());       // Game state
console.log(game.getOrientation());   // Current turn
```

---

## Configuration

### Server Configuration

Edit `server/index.js`:

```javascript
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = "http://localhost:3000";
```

### Frontend Configuration

Edit `next-js/src/app/live-match/page.tsx`:

```typescript
const socket = io("http://localhost:3001", {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});
```

---

## Development

### Building for Production

**Frontend:**
```bash
cd next-js
npm run build
npm run start
```

**Server:**
```bash
cd server
NODE_ENV=production npm start
```

### Running Tests

```bash
cd next-js
npm test
```

---

## Technologies Used

### Frontend
- **Next.js** 15.4.4 - React framework
- **React** 19.1.0 - UI library
- **Material-UI** 7.2.0 - Component library
- **Socket.io Client** 4.8.1 - WebSocket communication
- **chess.js** 1.4.0 - Chess logic
- **react-chessboard** 5.1.0 - Board visualization
- **SCSS** - Styling

### Backend
- **Express** 4.18.2 - Web framework
- **Socket.io** 4.7.1 - Real-time communication
- **CORS** 2.8.5 - Cross-origin requests
- **UUID** 11.1.0 - ID generation
- **Nodemon** 3.0.1 - Development server

---

## WebSocket Flow Diagram

```
Client 1                          Server                         Client 2
    |                               |                               |
    |---- joinRoom -------->        |                               |
    |                        create room                            |
    |<------ playerColor ----       |                               |
    |     (white)                   |                               |
    |                               |     <------ joinRoom ------  |
    |                        add to room                            |
    |                               |                               |
    |<------ gameStart ------       |     gameStart ------>         |
    |        (players)              |     (players)                 |
    |                               |     playerColor ------>      |
    |                               |     (black)                   |
    |                               |                               |
    |---- move -------->            |                               |
    |                        store move                             |
    |                               |---- opponentMove ---->       |
    |                               |                               |
    |<------ opponentMove ------    |                               |
    |                               |                               |
    |---- endGame -------->         |                               |
    |                        finish match                           |
    |<------ matchEnded -----       |     matchEnded ------>       |
    |        (winner)               |     (winner)                  |
    |                               |                               |
```

---

## Troubleshooting

### Connection Issues
- Ensure server is running on port 3001
- Check CORS configuration
- Verify WebSocket connection with browser DevTools

### Move Not Syncing
- Check network tab for move event
- Verify FEN notation is correct
- Ensure opponent is connected

### Room Not Found
- Verify room ID is copied correctly
- Check if room has expired (empty rooms auto-delete after 5s)
- Create a new room if necessary

---

## Future Enhancements

- 📱 Mobile responsive design improvements
- 💬 In-game chat functionality
- 🎯 Player ratings and leaderboards
- ⏱️ Time control modes (Bullet, Blitz, Rapid)
- 🔍 Game replay and analysis
- 💾 Game database and history
- 🌍 Account system with authentication
- 📹 Live spectator mode
- 🤖 AI opponent mode

---

## License

This project is open source and available under the MIT License.

---

## Support

For issues, questions, or suggestions, please open an issue on the repository.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Happy Chess Playing! ♟️**
