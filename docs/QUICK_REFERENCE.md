# 🎯 Quick Reference - Routes & Redis Setup

## Routes at a Glance

```
GET  /                    Home page + Game modes + Local play
GET  /auth                Login/Signup form
GET  /live-match          Select game mode → Create/Join match
GET  /play/[roomId]       Play with auto-join (direct link)

API  POST /api/auth/*     Auth endpoints
API  GET/POST /api/rooms* Room management
API  GET /api/matches*    Match history

WS   http://localhost:3001 WebSocket for real-time play
```

---

## Setup (5 Minutes)

```bash
# 1. Start Redis
redis-server
# or: docker run -p 6379:6379 redis:latest

# 2. Start Server
cd server && npm run dev

# 3. Start Frontend
cd next-js && npm run dev

# 4. Visit
http://localhost:3000
```

---

## Room ID Format

```
UUID v4: 550e8400-e29b-41d4-a716-446655440000
Length:  36 characters
Unique:  Every new match gets a new ID
Share:   Send /play/[roomId] to friend
```

---

## User Flows (30 Seconds)

### Create Match
```
/live-match → Select Mode → Create → Get ID → Share → /play/[id]
```

### Join Match
```
/live-match → Select Mode → Paste ID → Join → /play/[id]
```

### Direct Link
```
Click /play/[id] → Auto-join → Play!
```

---

## Redis Commands

```bash
redis-cli ping                           # Check status (reply: PONG)
redis-cli keys "*"                       # List all keys
redis-cli get "room:abc123"              # Get room data
redis-cli keys "room:*"                  # Find all rooms
redis-cli ttl "room:abc123"              # Check expiration
redis-cli monitor                        # Watch all operations
redis-cli dbsize                         # Count keys
redis-cli flushall                       # Clear database
```

---

## Key Expiration Times

```
Rooms:    24 hours  (auto-delete if unused)
Matches:  24 hours
Tokens:   7 days
Users:    Forever (unless deleted)
Sessions: 24 hours
```

---

## Environment Variables

```env
# server/.env
PORT=3001
REDIS_URL=redis://localhost:6379

# Production examples:
# REDIS_URL=redis://h:pass@redis.herokuapp.com:26379
# REDIS_URL=redis://redis:password@railway.app:6379
```

---

## File Locations

```
Frontend:  next-js/src/app/
├─ page.tsx              (Home - Game modes)
├─ auth/page.tsx         (Login/Signup)
├─ live-match/page.tsx   (Mode selector)
└─ play/[roomId]/page.tsx (Game board)

Backend:   server/
├─ index.js              (Redis + API + WebSocket)
├─ package.json
├─ .env                  (Redis URL)
└─ .env.example

Docs:      Root directory
├─ REDIS_AND_ROUTES_SUMMARY.md
├─ REDIS_DEPLOYMENT_GUIDE.md
└─ AUTH_AND_GAME_MODES.md
```

---

## Status Check

```bash
# Is Redis running?
redis-cli ping
# Should say: PONG

# Is Server connected?
curl http://localhost:3001/health
# Should show: status: healthy, storage: Redis

# Is Frontend running?
curl http://localhost:3000
# Should load page
```

---

## Common Issues

| Issue | Check | Fix |
|-------|-------|-----|
| Redis connection failed | `redis-cli ping` | Start Redis |
| Room not found | `redis-cli keys "room:*"` | Room might be expired |
| Players can't sync | `redis-cli get "room:id"` | Check shared Redis |
| Data lost on restart | Redis running? | Save Redis snapshot |

---

## Game Modes

```
Bullet  1 min + 0 sec
Blitz   3 min + 2 sec
Rapid  10 min + 0 sec
```

---

## Demo Account

```
Email:    test@chess.com
Password: password
```

---

## Production Checklist

- [ ] Redis running and accessible
- [ ] REDIS_URL set in environment
- [ ] Server starts without errors
- [ ] Frontend loads at domain
- [ ] Can login/signup
- [ ] Can create and join matches
- [ ] Moves sync in real-time
- [ ] Rooms persist after reload
- [ ] Multiple instances use same Redis
- [ ] Monitoring configured

---

## Performance Tips

1. Monitor Redis with `redis-cli monitor`
2. Check memory: `redis-cli info memory`
3. Count keys: `redis-cli dbsize`
4. Limit TTL to avoid buildup
5. Use Redis Cluster for HA

---

## Scaling Levels

```
Level 1 (Local)
  ├─ Single Redis
  ├─ Single Server
  └─ Single Frontend

Level 2 (Small)
  ├─ Single Redis
  ├─ 2-3 Servers (load balanced)
  └─ Single/Multiple Frontends

Level 3 (Medium)
  ├─ Redis Sentinel
  ├─ Multiple Servers
  └─ CDN + Multiple Frontends

Level 4 (Large)
  ├─ Redis Cluster
  ├─ Server Cluster
  └─ Global CDN
```

---

## Testing Without Redis (In-Memory Mode)

```bash
# Stop Redis
# Server will fallback to Map-based storage

cd server
npm run dev

# Works! But:
# - Data lost on restart
# - Cannot scale to multiple servers
# - Good for local development
```

---

## Deployment Commands

### Heroku
```bash
heroku create app-name
heroku addons:create heroku-redis:premium-0
git push heroku main
```

### Railway
```bash
railway init
railway add redis
railway up
```

### Docker
```bash
docker build -t chess .
docker run -p 3001:3001 -e REDIS_URL=redis://redis chess
```

---

## API Quick Reference

### Auth
```bash
POST /api/auth/signup    {email, username, password}
POST /api/auth/login     {email, password}
GET  /api/auth/me        (requires token)
POST /api/auth/logout    (requires token)
```

### Rooms
```bash
GET  /api/rooms          List all active rooms
GET  /api/rooms/:id      Get room details
POST /api/rooms          Create new room
```

### Matches
```bash
GET  /api/matches        List all matches
GET  /api/matches/:id    Get match details
```

### WebSocket
```javascript
// Join room
socket.emit("joinRoom", { roomId, playerName, userId })

// Make move
socket.emit("move", { roomId, move, fen })

// End game
socket.emit("endGame", { roomId, winner, reason })

// Exit room
socket.emit("exitRoom", { roomId })
```

---

## Useful Links

📖 [Redis Docs](https://redis.io)  
📖 [Redis CLI](https://redis.io/commands)  
📖 [Heroku Redis](https://www.heroku.com/redis)  
🔗 [GitHub Repo](https://github.com/dpedneka/chess)  

---

## Remember

✅ Always start Redis first  
✅ Check Redis connection in logs  
✅ Test locally before deploying  
✅ Monitor Redis in production  
✅ Keep tokens secure  
✅ Hash passwords (add bcrypt)  
✅ Use HTTPS in production  

---

**Need more details? Check the full guides! 📚**
