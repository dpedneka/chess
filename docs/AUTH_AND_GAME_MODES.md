# Login/Signup + Game Modes Implementation Guide

## 🎯 What's New

### 1. Authentication System
- Full login/signup functionality
- User sessions with token-based auth
- Protected routes (redirects to login if not authenticated)
- Demo account for testing

### 2. Game Modes
Three chess game modes with different time controls:
- **Bullet** (⚡ 1+0): 1 minute per player, no increment
- **Blitz** (⚡ 3+2): 3 minutes per player, 2 second increment
- **Rapid** (⏱️ 10+0): 10 minutes per player, no increment

### 3. Streamlined Flow
- No need to enter name multiple times
- Select game mode → Create/Join match → Play
- User info auto-populated from login

---

## 📋 User Flow

### New User - Sign Up & Play

```
1. Visit http://localhost:3000
   ↓
2. Redirected to /auth (not logged in)
   ↓
3. Click "Sign Up" tab
   ├─ Enter email
   ├─ Enter username
   ├─ Enter password
   └─ Click "Sign Up"
   ↓
4. Redirected to home page
   ↓
5. Greeted: "Welcome, [Username]! 🎮"
   ↓
6. Select game mode (Bullet/Blitz/Rapid)
   ↓
7. Create new match or join with room ID
   ↓
8. Play!
```

### Existing User - Login & Play

```
1. Visit http://localhost:3000
   ↓
2. Redirected to /auth (not logged in)
   ↓
3. Click "Login" tab
   ├─ Enter email: test@chess.com
   ├─ Enter password: password
   └─ Click "Login"
   ↓
4. Redirected to home page
   ↓
5. Select game mode
   ↓
6. Play!
```

### Demo Account (For Quick Testing)
```
Email: test@chess.com
Password: password
```

---

## 🏗️ Architecture

### Frontend Components

```
pages/
├─ /auth              # Login/Signup page (new)
├─ /                  # Home with game modes (updated)
└─ /live-match        # Live match page (updated)

components/
├─ game-mode-selection/  # Game mode selector (new)
├─ player-info/
├─ match-timer/
└─ board/

lib/
└─ auth-context.tsx   # Auth provider & hooks (new)
```

### Backend API

```
AUTH ENDPOINTS:
POST   /api/auth/signup    - Create new account
POST   /api/auth/login     - Login with credentials
GET    /api/auth/me        - Get current user (protected)
POST   /api/auth/logout    - Logout & clear token
```

---

## 🔑 Key Features

### Auth Context (`lib/auth-context.tsx`)

```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// Usage in components:
const { user, isAuthenticated, login, signup, logout } = useAuth();
```

### Protected Routes

Routes automatically redirect unauthenticated users to `/auth`:

```typescript
// In any page component
useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    router.push("/auth");
  }
}, [isLoading, isAuthenticated, router]);
```

### Game Modes

```typescript
interface GameMode {
  id: "bullet" | "rapid" | "blitz";
  name: string;
  description: string;
  timeControl: string;      // e.g., "1+0"
  icon: React.ReactNode;
  timeLimit: number;        // in seconds
  color: string;
}

const GAME_MODES = [
  { id: "bullet", name: "Bullet", timeControl: "1+0", ... },
  { id: "blitz", name: "Blitz", timeControl: "3+2", ... },
  { id: "rapid", name: "Rapid", timeControl: "10+0", ... },
];
```

---

## 🔄 Updated Flow Diagrams

### Authentication Flow

```
Client                          Server
  │                               │
  ├─ POST /api/auth/signup ─────→ │
  │ {email, username, password}   │
  │                        Create user
  │                        Generate token
  │ ←────── {token, user} ─────── │
  │                               │
  ├─ Save token to localStorage   │
  │                               │
  ├─ Redirect to / (home)         │
  │                               │
  ├─ Load home page               │
  │                               │
  ├─ AuthProvider checks token    │
  │                               │
  ├─ GET /api/auth/me ──────────→ │ (with Bearer token)
  │                        Verify token
  │ ←────── {user data} ───────── │
  │                               │
  └─ Render authenticated content
```

### Game Mode Selection Flow

```
User Logged In
      │
      ├─ Sees "Welcome, [Username]! 🎮"
      │
      └─ Game Mode Selection
         ├─ Bullet Card  ──→ Click  ──→ Join/Create Match
         ├─ Blitz Card   ──→ Click  ──→ Join/Create Match
         └─ Rapid Card   ──→ Click  ──→ Join/Create Match
```

---

## 📝 Updated Server Endpoints

### Auth Endpoints

**POST /api/auth/signup**
```json
Request:
{
  "email": "user@example.com",
  "username": "PlayerName",
  "password": "secure_password"
}

Response (201):
{
  "token": "abc123def456...",
  "user": {
    "id": "user_xyz",
    "email": "user@example.com",
    "username": "PlayerName",
    "createdAt": "2025-12-08T..."
  }
}
```

**POST /api/auth/login**
```json
Request:
{
  "email": "user@example.com",
  "password": "secure_password"
}

Response:
{
  "token": "abc123def456...",
  "user": { ... }
}
```

**GET /api/auth/me** (Protected)
```
Headers: Authorization: Bearer [token]

Response:
{
  "id": "user_xyz",
  "email": "user@example.com",
  "username": "PlayerName",
  "createdAt": "2025-12-08T..."
}
```

---

## 🔒 Token Management

### Storage
- Token stored in `localStorage`
- Auto-retrieved on page load
- Automatically deleted on logout

### Validation
- Token sent with `Authorization: Bearer [token]` header
- Server validates token exists and matches user
- Invalid/expired token redirects to login

### Lifetime
- Persists across browser sessions
- Cleared only on explicit logout
- No expiration in current implementation (add in production!)

---

## 🎮 Game Mode Integration

### When Creating a Match

```javascript
// User selects Blitz mode
const selectedMode = GAME_MODES[1]; // Blitz

// Create match with mode
socket.emit("joinRoom", {
  roomId: "new-uuid",
  playerName: user.username,      // Auto-filled from auth
  userId: socket.id,
  gameMode: selectedMode.id,      // "blitz"
});

// Server stores gameMode with match
matchState = {
  roomId: "...",
  gameMode: "blitz",
  timeLimit: 180,  // 3 minutes
  ...
};
```

### When Joining a Match

```javascript
// User pastes friend's room ID and joins
socket.emit("joinRoom", {
  roomId: "friend-room-id",
  playerName: user.username,      // Auto-filled
  userId: socket.id,
  gameMode: selectedMode?.id,
});
```

---

## 💾 Data Models

### User Object

```typescript
interface User {
  id: string;                    // user_xyz
  email: string;
  username: string;
  password: string;              // (hashed in production)
  createdAt: string;             // ISO timestamp
}
```

### Updated MatchState

```typescript
interface MatchState {
  roomId: string;
  status: "waiting" | "active" | "finished";
  players: Player[];
  currentTurn: "white" | "black";
  gameMode?: "bullet" | "rapid" | "blitz";  // NEW!
  timeLimit?: number;            // seconds
  winner?: "white" | "black" | "draw";
  startTime?: number;
  endTime?: number;
}
```

---

## 🚀 Setup & Testing

### 1. Start Server
```bash
cd server
npm run dev
```

### 2. Start Frontend
```bash
cd next-js
npm run dev
```

### 3. Test Sign Up
- Go to `http://localhost:3000`
- Redirected to `/auth`
- Fill in sign up form
- Click "Sign Up"

### 4. Test Login
- Logout (via header button when implemented)
- Try demo account: `test@chess.com` / `password`
- Login button redirects to home

### 5. Select Game Mode
- Choose Bullet, Blitz, or Rapid
- Create or join match
- Play!

---

## 🔐 Security Notes

### Current Implementation (Development Only)
- ✓ Passwords stored in plain text (use bcrypt in production!)
- ✓ Tokens don't expire (add expiration in production!)
- ✓ In-memory storage (use database in production!)
- ✓ No HTTPS/WSS (add for production!)

### Production Improvements Needed
```javascript
// Add password hashing
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);

// Add token expiration
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Use environment variables
const JWT_SECRET = process.env.JWT_SECRET;
```

---

## 📱 Reduced Click Experience

### Before (Old Flow)
1. Click "Play Online"
2. Enter name
3. Create/join room
4. Play

### After (New Flow)
1. Already logged in ✓
2. Select game mode
3. Create/join match
4. Play

**Result: Fewer clicks, faster gameplay! ⚡**

---

## 🔧 File Changes Summary

### New Files
- `next-js/src/app/auth/page.tsx` - Login/signup page
- `next-js/src/components/game-mode-selection/index.tsx` - Game mode selector
- `next-js/src/lib/auth-context.tsx` - Auth provider & hooks

### Updated Files
- `next-js/src/app/layout.tsx` - Added AuthProvider wrapper
- `next-js/src/app/page.tsx` - Added game mode selection, auth redirect
- `next-js/src/app/live-match/page.tsx` - Removed name input, added game modes
- `server/index.js` - Added auth endpoints

---

## ✅ Checklist for Complete Setup

- [ ] Run `npm install` in both directories if needed
- [ ] Start server on port 3001
- [ ] Start frontend on port 3000
- [ ] Test sign up with new email
- [ ] Test login with `test@chess.com` / `password`
- [ ] Select game mode and create match
- [ ] Join match from another browser tab
- [ ] Play the game
- [ ] Verify token persists on page refresh

---

**Authentication and game modes are now fully integrated!** 🎉

Your users can now sign up, log in, select a game mode, and jump straight into playing without unnecessary form fills!
