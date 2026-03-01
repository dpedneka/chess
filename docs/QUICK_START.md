# Quick Start Guide - Live Chess Match

Get your live multiplayer chess game running in 5 minutes!

## 🚀 Quick Setup

### Step 1: Start the Server
```bash
cd server
npm install
npm run dev
```
✅ Server running on `http://localhost:3001`

### Step 2: Start the Frontend
```bash
cd next-js
npm install
npm run dev
```
✅ Frontend running on `http://localhost:3000`

### Step 3: Open in Browser
```
http://localhost:3000
```

---

## 🎮 How to Play

### Setup (2 Players Required)

**Player 1:**
1. Click "🎮 Play Live Match"
2. Enter your name (e.g., "Alice")
3. Click "Create New Room"
4. Copy the Room ID shown

**Player 2:**
1. On different browser/tab, go to `http://localhost:3000`
2. Click "🎮 Play Live Match"
3. Enter your name (e.g., "Bob")
4. Paste Player 1's Room ID
5. Click "Join Room"

**Match Starts!** ✅
- Player 1 plays White (moves first)
- Player 2 plays Black
- Click and drag pieces to move
- Watch the timer count up

---

## 📝 API Examples

### Check Server Status
```bash
curl http://localhost:3001/health
```

### List All Active Rooms
```bash
curl http://localhost:3001/api/rooms
```

### Get Specific Room Info
```bash
curl http://localhost:3001/api/rooms/ROOM_ID
```

### Create a Room via API
```bash
curl -X POST http://localhost:3001/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"playerName": "Alice"}'
```

### List All Active Matches
```bash
curl http://localhost:3001/api/matches
```

---

## 🌐 WebSocket Testing

### Using Browser Console

```javascript
// Connect to server
const socket = io("http://localhost:3001");

// Join a room
socket.emit("joinRoom", {
  roomId: "YOUR_ROOM_ID",
  playerName: "TestPlayer",
  userId: "test-user-1"
});

// Listen for events
socket.on("playerColor", (color) => {
  console.log("You are:", color);
});

socket.on("gameStart", (players) => {
  console.log("Game started with:", players);
});

socket.on("opponentMove", (data) => {
  console.log("Opponent moved:", data);
});

// Send a move
socket.emit("move", {
  roomId: "YOUR_ROOM_ID",
  move: { from: "e2", to: "e4" },
  fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
});

// End the game
socket.emit("endGame", {
  roomId: "YOUR_ROOM_ID",
  winner: "white",
  reason: "checkmate"
});

// Exit room
socket.emit("exitRoom", { roomId: "YOUR_ROOM_ID" });
```

---

## 📊 Project Structure

```
chess/
├── server/                 # Backend (Express + Socket.io)
│   ├── index.js
│   └── package.json
├── next-js/               # Frontend (Next.js + React)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Home
│   │   │   └── live-match/       # Live match page
│   │   └── components/
│   ├── package.json
│   └── next.config.ts
├── API_DOCUMENTATION.md    # Detailed API docs
├── LIVE_MATCH_README.md    # Full documentation
└── QUICK_START.md          # This file
```

---

## 🔧 Key Files

| File | Purpose |
|------|---------|
| `server/index.js` | WebSocket server & REST API |
| `next-js/src/app/live-match/page.tsx` | Main live match page |
| `next-js/src/components/board/index.tsx` | Chess board |
| `next-js/src/components/player-info/index.tsx` | Player display |
| `next-js/src/components/match-timer/index.tsx` | Match timer |
| `next-js/src/lib/session.ts` | Game logic manager |

---

## 🎯 Features Implemented

✅ Live multiplayer chess matches
✅ Real-time move synchronization  
✅ Room-based game sessions
✅ Player presence tracking
✅ REST API for room/match info
✅ WebSocket communication
✅ Auto-reconnection
✅ Match history tracking
✅ Responsive UI with Material-UI
✅ Stockfish analysis integration

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Is the server running on port 3001? 
- Check: `npm run dev` in the server directory
- Test: `curl http://localhost:3001`

### "Room not found"
- Copy the Room ID exactly
- Room IDs auto-delete if empty for 5 seconds
- Create a new room

### "Move not appearing"
- Refresh the browser
- Check browser console for errors (F12)
- Verify opponent is still connected

### "Port already in use"
```bash
# Kill process on port 3001
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3001 | xargs kill -9
```

---

## 📈 Next Steps

1. ✅ Set up and run the game
2. ✅ Play a test match
3. 📖 Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API info
4. 📖 Read [LIVE_MATCH_README.md](./LIVE_MATCH_README.md) for full documentation
5. 🚀 Deploy to production (see docs)

---

## 🎓 Learning Resources

- **Chess Rules**: https://www.chess.com/terms/chess-rules
- **Chess.js**: https://github.com/jhlywa/chess.js
- **Socket.io**: https://socket.io/docs/
- **Next.js**: https://nextjs.org/docs
- **Material-UI**: https://mui.com/

---

## 💡 Tips

- **Room ID**: Write it down or take a screenshot
- **Different Players**: Use incognito windows to test with separate accounts
- **Testing Moves**: Use browser DevTools Network tab to see socket events
- **Debugging**: Add `console.log` in board component to track moves

---

**Ready to play? Start your servers and enjoy! ♟️**

Need help? Check the documentation or open an issue!
