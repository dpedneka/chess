# 🗺️ Chess App Routing Structure

## Current Route Map

```
Your Chess Application Routes:
├── /                          (Home Page)
│   └── Shows: Game Mode Selection (Bullet, Blitz, Rapid)
│   └── Shows: Welcome message with username
│
├── /auth                      (Authentication)
│   └── Shows: Login/Signup tabs
│   └── Handles: User registration and login
│
├── /live-match                (Game Mode Selector)
│   └── Shows: Select Bullet/Blitz/Rapid
│   └── Shows: Create New Match button
│   └── Shows: Join existing match with Room ID
│   └── Redirects to: /play/{roomId}
│
└── /play/[roomId]             (LIVE GAME PAGE - Dynamic Route)
    └── Shows: Chess board
    └── Shows: Match timer
    └── Shows: Player info
    └── Shows: Room ID
    └── Handles: Real-time gameplay with WebSocket
```

---

## 🎯 User Flow Diagram

### Flow 1: Create New Match
```
User at Home Page
        ↓
Click "Play Live Match"
        ↓
Redirected to /live-match
        ↓
Select Game Mode (Bullet/Blitz/Rapid)
        ↓
Click "Create New Match"
        ↓
New Room ID generated (UUID)
        ↓
Redirected to /play/{newRoomId}
        ↓
Waiting for opponent to join...
```

### Flow 2: Join Existing Match
```
User at /live-match
        ↓
Select Game Mode (same as friend)
        ↓
Paste Room ID
        ↓
Click "Join Match"
        ↓
Redirected to /play/{roomId}
        ↓
Game starts when both players connected
```

### Flow 3: Direct Room Access
```
User has Room ID
        ↓
Direct URL: http://localhost:3000/play/{roomId}
        ↓
Authentication check
        ↓
Connect to WebSocket
        ↓
Join match in progress or wait for opponent
```

---

## 📁 File Structure

```
next-js/src/app/
├── page.tsx                          (Home page with game mode selection)
├── layout.tsx                        (Root layout with AuthProvider)
├── globals.css
├── main.scss
│
├── auth/
│   └── page.tsx                      (Login/Signup page)
│
├── live-match/
│   └── page.tsx                      (Game mode selector & room join/create)
│
└── play/
    └── [roomId]/
        └── page.tsx                  (LIVE CHESS GAME - Dynamic route)
```

---

## 🔗 Route Implementation Details

### `/play/[roomId]` (Dynamic Route)
**Location:** `next-js/src/app/play/[roomId]/page.tsx`

**What it does:**
1. Reads `roomId` from URL parameters using `useParams()`
2. Connects to WebSocket server on port 3001
3. Emits `joinRoom` event with:
   - `roomId` - From URL
   - `playerName` - From authenticated user
   - `userId` - Socket ID
4. Listens for game events:
   - `playerColor` - White or Black assignment
   - `gameStart` - Both players connected
   - `opponentMove` - Receives opponent moves
   - `matchEnded` - Game finished
5. Displays:
   - Chess board
   - Match timer
   - Player info
   - Room ID display
   - Exit button

**URL Examples:**
```
http://localhost:3000/play/550e8400-e29b-41d4-a716-446655440000
http://localhost:3000/play/abc123def456
```

---

## 🌐 Server Integration

### Backend Routes Used:

**REST API:**
- `GET /api/rooms` - List all active rooms
- `GET /api/rooms/:roomId` - Get specific room details
- `POST /api/rooms` - Create new room
- `GET /api/matches` - List all matches
- `GET /api/matches/:matchId` - Get match details

**WebSocket Events:**
- `joinRoom` - Join or create room
- `move` - Send chess move
- `endGame` - End the match
- `exitRoom` - Leave the room

---

## ✅ Testing Routes Locally

### Test 1: Home Page
```
URL: http://localhost:3000
Expected: See game modes (Bullet, Blitz, Rapid)
```

### Test 2: Login
```
URL: http://localhost:3000/auth
Expected: See login/signup tabs
Demo: test@chess.com / password
```

### Test 3: Game Mode Selection
```
URL: http://localhost:3000/live-match
Expected: See game mode cards
Click: "Create New Match"
Result: Redirected to /play/{newUUID}
```

### Test 4: Direct Room Access
```
URL: http://localhost:3000/play/test-room-123
Expected: Show chess board, wait for opponent
```

### Test 5: Join Match
```
1. Open /live-match in Browser 1
2. Create new match → Copy Room ID
3. Open /live-match in Browser 2
4. Select same game mode
5. Paste Room ID
6. Click "Join Match"
7. Both browsers should show game starting
```

---

## 🔐 Authentication Flow

All routes except `/auth` require authentication:

```
Request to /play/[roomId]
        ↓
Check useAuth() hook
        ↓
Is authenticated? 
├─ NO  → Redirect to /auth
└─ YES → Load game page
```

---

## 🚀 How Routes Work in Next.js App Router

### Dynamic Route Syntax
```typescript
// File: app/play/[roomId]/page.tsx
// Matches URLs like:
// - /play/room-123
// - /play/abc-def-ghi
// - /play/550e8400-e29b-41d4-a716-446655440000

const roomId = params.roomId as string;
```

### Access Parameters
```typescript
import { useParams } from 'next/navigation';

export default function PlayGame() {
  const params = useParams();
  const roomId = params.roomId as string;
  // roomId now contains the value from URL
}
```

---

## 🎮 Complete User Journey

```
1. User visits http://localhost:3000
   ↓
2. System checks authentication
   - If not logged in → Redirect to /auth
   - If logged in → Show home page
   ↓
3. Home page displays:
   - Welcome message with username
   - Game mode cards (Bullet/Blitz/Rapid)
   ↓
4. User clicks "Play" on any mode
   → Redirected to /live-match
   ↓
5. /live-match page shows:
   - Selected game mode info
   - "Create New Match" button
   - "Join Existing Match" option with Room ID input
   ↓
6. User either:
   A. Clicks "Create New Match"
      → Generates new UUID
      → Redirected to /play/{newUUID}
      → Displays empty board, waiting for opponent
      
   B. Pastes friend's Room ID and clicks "Join Match"
      → Redirected to /play/{friendRoomId}
      → Connects to friend's match
      → Game starts when both connected
   ↓
7. At /play/[roomId]:
   - WebSocket connects
   - Emits joinRoom event
   - Waits for opponent or starts game
   - Displays live board
   - Handles moves in real-time
   ↓
8. Game ends
   - Shows winner
   - Exit button returns to home
```

---

## 📊 Room ID Examples

**Format:** UUID v4 (Standard format)

```
550e8400-e29b-41d4-a716-446655440000
6ba7b810-9dad-11d1-80b4-00c04fd430c8
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
```

These are auto-generated when creating a new match via `/live-match`.

---

## 🔄 Socket.io Connection Flow

```
/play/[roomId] page loads
        ↓
Create Socket.io connection to localhost:3001
        ↓
Wait for "connect" event
        ↓
Emit "joinRoom" with roomId, playerName, userId
        ↓
Server checks if room exists:
├─ YES: Add player to existing room
│       If 2 players: Start game (emit "gameStart")
│       If 1 player: Wait for opponent
│
└─ NO:  Create new room
        Add player as white
        Wait for opponent

        ↓
Listen for events:
├─ playerColor → Assign white or black
├─ gameStart → Both players ready, start game
├─ opponentMove → Receive opponent's move
├─ playerDisconnected → Opponent left
├─ matchEnded → Game finished
└─ roomFull → Room already has 2 players

        ↓
Display chess board with current state
Handle player moves
Sync with opponent in real-time
```

---

## ✨ Features Summary

| Feature | Route | Status |
|---------|-------|--------|
| Home Page | `/` | ✅ Working |
| Auth Page | `/auth` | ✅ Working |
| Game Mode Selection | `/live-match` | ✅ Working |
| Live Game (Dynamic) | `/play/[roomId]` | ✅ Working |
| Create New Match | `/live-match` → `/play/{uuid}` | ✅ Working |
| Join Existing Match | `/live-match` + Room ID → `/play/{roomId}` | ✅ Working |
| Direct Room Access | `/play/[roomId]` | ✅ Working |
| Real-time Gameplay | WebSocket on `/play/[roomId]` | ✅ Working |
| Protected Routes | All except `/auth` | ✅ Working |

---

## 🚀 Deployment Notes

When deploying to production:

1. Update API URLs from `localhost:3001` to your server domain
2. Update WebSocket URLs from `ws://localhost:3001` to `wss://your-domain.com`
3. Ensure Redis is configured and accessible
4. Set environment variables properly
5. Test room creation and joining with multiple users

---

**Everything is set up and ready to use! 🎉**
