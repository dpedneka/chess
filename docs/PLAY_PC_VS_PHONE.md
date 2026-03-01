# 🎮 Playing PC vs Phone - Complete Guide

## ✅ Prerequisites Checklist

Before you play, make sure:

- [ ] Both devices on **same WiFi network**
- [ ] Backend server running: `npm run dev` (in `server` folder)
- [ ] Frontend running: `npm run dev` (in `next-js` folder)
- [ ] Firewall rules added (run `setup-firewall.ps1` as admin)

---

## 🎯 Step-by-Step: PC vs Phone Match

### **PLAYER 1 - PC**

1. Open browser → `http://localhost:3000`
2. **Login/Signup** (if needed)
   - Email: `player1@test.com`
   - Password: `password` (or use existing account)
3. Click **"Play Live Match"** button
4. Select game mode:
   - ⚡ **Blitz** (3+2) recommended for testing
5. Click **"Create New Match"** button
6. **Copy the Room ID** shown (it's a UUID like `550e8400-e29b-41d4-a716-446655440000`)
7. **Wait** for opponent (message says "Waiting for opponent...")

---

### **PLAYER 2 - Phone**

1. Open browser on phone
2. Go to: `http://192.168.1.103:3000` (your PC's IP)
3. **Login/Signup** with different account
   - Email: `player2@test.com`
   - Password: `password`
4. Click **"Play Live Match"** button
5. Select **same game mode** as PC (Blitz)
6. Click **"Join Existing Match"** section
7. **Paste the Room ID** from PC
8. Click **"Join Match"** button

---

### **GAME STARTS** 🎉

✅ Both devices show the chess board  
✅ Moves sync in real-time  
✅ Player 1 (PC) = White  
✅ Player 2 (Phone) = Black  
✅ Timer counts down for both  

**Start playing!**

---

## 🔄 How It Works Behind the Scenes

```
PC (192.168.1.103:3000)              Phone (192.168.1.103:3000)
        ↓                                    ↓
   [Create Room]                      [Join Room]
        ↓                                    ↓
   Emit: joinRoom                    Emit: joinRoom
   {roomId: UUID, ...}               {roomId: UUID, ...}
        ↓                                    ↓
   ======= Backend Server (3001) =======
        ↓                                    ↓
   [Room Created]                    [Player Added]
   Players: [PC]                      Players: [PC, Phone]
        ↓                                    ↓
        +——— Both get: gameStart ———+
        ↓                            ↓
   [Board Ready]                 [Board Ready]
   You: White                     You: Black
```

---

## 📊 Real-Time Synchronization

### Move Flow:

```
PC Makes Move
    ↓
Emit: "move" event with:
  - roomId
  - move (chess notation)
  - fen (board state)
    ↓
Backend receives & broadcasts to room
    ↓
Phone receives: "opponentMove"
    ↓
Phone updates board with opponent's move
    ↓
Timer updates on both devices
    ↓
Phone makes move
    ↓
[Same process in reverse]
```

---

## ✨ Features That Work

| Feature | PC | Phone | Both See |
|---------|----|----|-----------|
| Login | ✅ | ✅ | Separate accounts |
| Create Room | ✅ | ❌ | Room ID shown |
| Join Room | ❌ | ✅ | Both in same game |
| See Board | ✅ | ✅ | Synchronized |
| Make Moves | ✅ | ✅ | Real-time sync |
| See Timer | ✅ | ✅ | Counts down |
| See Opponent | ✅ | ✅ | Name + color |
| Exit Match | ✅ | ✅ | Game ends |

---

## 🚨 Troubleshooting

### Problem 1: "Phone shows blank page"
```
Check:
1. Is phone on same WiFi? (Not hotspot from PC)
2. Can you reach backend? 
   - Open F12 console on phone
   - Paste: fetch('http://192.168.1.103:3001/api/matches')
   - Should get JSON response
3. Is backend running? (Check server terminal)
```

### Problem 2: "Opponent not appearing"
```
Check:
1. Room ID is exactly correct (copy-paste, not type)
2. Both devices selected SAME game mode
3. Backend shows "Match started"
4. Check browser console for errors (F12)
```

### Problem 3: "Moves not syncing"
```
Check:
1. WebSocket connected (look for "Connected to server" in console)
2. Both on same WiFi
3. Firewall rules added
4. Server logs show move events
```

### Problem 4: "Phone can't access http://192.168.1.103:3000"
```
Solutions:
1. Check IP is correct: ipconfig on PC
2. Verify firewall rules added
3. Try: http://192.168.1.103:3000 (with port)
4. Check if phone is on same WiFi
5. Try: Turn on WiFi, turn it off, turn back on
```

---

## 🔍 Debug Mode

### Check if Everything is Connected

**On Phone Console (F12):**

```javascript
// Test 1: Can reach backend?
fetch('http://192.168.1.103:3001/api/matches')
  .then(r => r.json())
  .then(d => console.log('✓ Backend OK:', d))
  .catch(e => console.error('✗ Backend failed:', e))

// Test 2: Is WebSocket connecting?
// Check console for: "Connected to server: [socket.id]"
```

**On Server Terminal:**

Should show logs like:
```
[2025-12-08T...] User connected: abc123def456
[2025-12-08T...] Player Player1 attempting to join room 550e8400...
[2025-12-08T...] New room created: 550e8400... by Player1
[2025-12-08T...] Player Player2 joined room 550e8400.... Match started.
```

---

## 🎮 Test Scenarios

### Scenario 1: Basic Test (Recommended First)
```
1. Two browsers on PC (incognito windows)
2. One at localhost:3000, one at 192.168.1.103:3000
3. Both login, create/join match
4. Verify moves sync
✓ If this works, phone will too
```

### Scenario 2: PC + Phone
```
1. PC: Create match (Blitz mode)
2. Phone: Join with room ID
3. Make moves from both
4. Verify timer counts down
5. Play full game
```

### Scenario 3: Phone + Phone
```
1. Two phones on same WiFi
2. Both go to http://192.168.1.103:3000
3. Create and join match
4. Play
✓ Should work same as PC + Phone
```

---

## 📋 Test Checklist

After starting servers:

- [ ] PC browser loads at `http://localhost:3000`
- [ ] Phone browser loads at `http://192.168.1.103:3000`
- [ ] Can login on both
- [ ] PC: Create Blitz match → Shows Room ID
- [ ] Phone: Paste Room ID → Join match
- [ ] Board appears on both
- [ ] PC is White, Phone is Black
- [ ] PC makes a move → Appears on Phone
- [ ] Phone makes a move → Appears on PC
- [ ] Timer counts down on both
- [ ] Can exit match without errors

---

## 🎯 Common Room IDs Formats

Your Room ID will look like one of these:

```
550e8400-e29b-41d4-a716-446655440000    (UUID format - standard)
6ba7b810-9dad-11d1-80b4-00c04fd430c8    (Another UUID)
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11    (Another format)
```

**How to copy correctly:**
1. On PC: You see long string in Room ID field
2. **Ctrl+A** to select all
3. **Ctrl+C** to copy
4. Go to phone
5. Click Room ID input
6. **Ctrl+V** (or long-press paste)

---

## ⏱️ Timing

After you click "Create Match":
- ⏳ You have **5-10 minutes** to get opponent to join
- 🔗 Room stays active until both players disconnect
- ❌ Room auto-deletes when both players leave

---

## 🌐 Network Architecture

```
Your Network:
├─ PC (192.168.1.103)
│  ├─ Frontend: http://localhost:3000
│  └─ talks to → Backend: ws://localhost:3001
│
├─ Phone (same WiFi)
│  ├─ Frontend: http://192.168.1.103:3000
│  └─ talks to → Backend: ws://192.168.1.103:3001
│
└─ Backend Server (192.168.1.103:3001)
   ├─ Receives requests from both
   ├─ Manages rooms in Redis/Memory
   └─ Broadcasts moves via WebSocket
```

---

## 💾 Data Persistence

- **Match data** stored on server while game is active
- **After game ends** data can be saved to database (future feature)
- **Server restart** loses all active games (runs in memory)
- **Redis** keeps data if available

---

## 🎉 Expected Result

When everything works:

1. **PC View:**
   - Sees opponent's name (from phone login)
   - Board shows as "White" (goes first)
   - Can click and drag pieces
   - Sees opponent's moves appear instantly
   - Timer counts down

2. **Phone View:**
   - Sees opponent's name (from PC login)
   - Board shows as "Black"
   - Can tap pieces (same as drag on PC)
   - Sees PC's moves appear instantly
   - Timer counts down
   - Responsive layout for mobile

---

## 🚀 Ready to Play!

You have everything set up. Just:

1. Start servers
2. Open PC browser
3. Open phone browser
4. Create and join match
5. Play chess!

**Enjoy! ♟️**

---

**Questions?** Check:
- Server terminal for error messages
- Browser console (F12) for client errors
- `NETWORK_READY.md` for firewall setup
