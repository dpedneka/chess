# 🔴 Redis Setup & Multi-Instance Deployment Guide

## Quick Start

### Step 1: Install Redis

**Windows (Docker):**
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

**macOS:**
```bash
brew install redis
redis-server
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### Step 2: Configure Environment

```bash
cd server
# Create .env file
echo "REDIS_URL=redis://localhost:6379" > .env
echo "PORT=3001" >> .env
```

### Step 3: Install Dependencies

```bash
npm install redis  # Already done, but confirm
```

### Step 4: Start Services

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Backend Server
cd server && npm run dev

# Terminal 3: Frontend
cd next-js && npm run dev
```

Visit: `http://localhost:3000`

---

## Route Structure

### New Architecture

```
┌─────────────────────────────────────────┐
│         Home Page (/)                   │
│  • Game Mode Selection                  │
│  • Local Play against board             │
│  • Launch OnlineGame dialog             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│    Live Match Route (/live-match)       │
│  • Select Game Mode                     │
│  • Create New Match → Redirects to      │
│    /play/[roomId]                       │
│  • Join Existing → Redirects to         │
│    /play/[roomId]                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│    Direct Play Route (/play/[roomId])   │
│  • Auto-join specified room             │
│  • Full chess board & gameplay          │
│  • Wait for opponent                    │
│  • Real-time sync via WebSocket         │
└─────────────────────────────────────────┘
```

---

## User Flows

### Flow 1: Create & Share Match

```
User A: Home Page (/)
  ↓
Click "Play Online" (from OnlineGame)
  ↓ OR
/live-match
  ↓
Select Game Mode (Bullet/Blitz/Rapid)
  ↓
Click "Create New Match"
  ↓
Gets Room ID: abc123def456
  ↓
Redirects to: /play/abc123def456
  ↓
Shares Link/Room ID with User B
  ↓
Waits in room for opponent
```

### Flow 2: Join Existing Match

```
User B: Receives link /play/abc123def456
  ↓ OR /live-match
  ↓
Enter Room ID: abc123def456
  ↓
Click "Join Match"
  ↓
Redirects to: /play/abc123def456
  ↓
Connects to same room
  ↓
Game starts with both players
```

### Flow 3: Direct Link Access

```
User B: http://yourapp.com/play/abc123def456
  ↓
Next.js Route: /play/[roomId]
  ↓
Extracts roomId from URL
  ↓
Auto-connects to room
  ↓
No extra steps needed!
```

---

## Redis Data Structure

### What Gets Stored

```javascript
// Room Data (24h expiration)
room:abc123def456 = {
  roomId: "abc123def456",
  matchId: "xyz789uvw123",
  status: "waiting|active|finished",
  players: [
    { id: "socket1", name: "Player1", color: "white", connected: true },
    { id: "socket2", name: "Player2", color: "black", connected: true }
  ],
  gameState: "rnbqkbnr/...",
  moves: [{ move: "e4", fen: "...", timestamp: ... }],
  createdAt: 1702060800000
}

// Match Data (24h expiration)
match:xyz789uvw123 = {
  matchId: "xyz789uvw123",
  roomId: "abc123def456",
  status: "waiting|active|finished",
  players: [...],
  startTime: 1702060800000,
  endTime: null,
  winner: null,
  moves: [...]
}

// User Data (no expiration)
user:user_abc123 = {
  id: "user_abc123",
  email: "player@example.com",
  username: "PlayerName",
  password: "plain_text", // TODO: hash this!
  createdAt: "2024-12-08T..."
}

// Token Data (7 day expiration)
token:abc123xyz789 = "user_abc123"

// Session Data (24h expiration)
session:socket_id_123 = {
  playerName: "PlayerName",
  roomId: "abc123def456",
  userId: "user_abc123",
  connectedAt: 1702060800000
}
```

---

## Monitoring Redis

### Common Commands

```bash
# Check if Redis is running
redis-cli ping
# Response: PONG

# View all keys
redis-cli keys "*"

# View specific key
redis-cli get "room:abc123"

# Get all keys matching pattern
redis-cli keys "room:*"
redis-cli keys "match:*"
redis-cli keys "user:*"
redis-cli keys "token:*"

# Get detailed info
redis-cli info server
redis-cli info stats
redis-cli info memory

# Monitor in real-time
redis-cli monitor

# Check database size
redis-cli dbsize

# Clear all data
redis-cli flushall
```

---

## Production Deployment

### Heroku Deployment

#### 1. Add Redis Add-on

```bash
heroku addons:create heroku-redis:premium-0 -a your-app-name
```

#### 2. Get Redis URL

```bash
heroku config:get REDIS_URL -a your-app-name
# Output: redis://h:password@host.redis.herokuapp.com:port
```

#### 3. Deploy Server

```bash
cd server
git push heroku main
```

Heroku automatically sets `REDIS_URL` environment variable.

#### 4. Deploy Frontend (Vercel)

```bash
cd next-js
vercel --prod
```

Update API URL to your Heroku server.

---

### Railway Deployment

#### 1. Create Redis Database

```bash
# In Railway dashboard
Add New Service → PostgreSQL → Redis
```

#### 2. Get Connection String

```
Railway automatically provides REDIS_URL
```

#### 3. Deploy

```bash
cd server
railway up
```

---

### AWS Deployment

#### 1. Create ElastiCache Cluster

```bash
# In AWS Console
ElastiCache → Create Cluster
  Engine: Redis
  Node Type: cache.t3.micro
  Nodes: 1
```

#### 2. Update Environment

```env
REDIS_URL=redis://elasticache-endpoint:6379
```

#### 3. Deploy Server

```bash
# Using ECS, EC2, or Lambda
```

---

## Multiple Instance Setup

### Architecture

```
Load Balancer
  ├─ Server Instance 1 (Port 3001)
  ├─ Server Instance 2 (Port 3001)
  └─ Server Instance 3 (Port 3001)
         ↓
    Redis Server (Shared)
    (Single source of truth)
```

### Configuration

```javascript
// server/index.js - All instances use same REDIS_URL
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = redis.createClient({
  url: REDIS_URL,
});
```

### Deployment

```bash
# Instance 1
PORT=3001 REDIS_URL=redis://shared-redis:6379 npm start

# Instance 2
PORT=3002 REDIS_URL=redis://shared-redis:6379 npm start

# Instance 3
PORT=3003 REDIS_URL=redis://shared-redis:6379 npm start
```

### Load Balancer Config (Nginx Example)

```nginx
upstream chess_servers {
  server localhost:3001;
  server localhost:3002;
  server localhost:3003;
}

server {
  listen 80;
  
  location / {
    proxy_pass http://chess_servers;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

---

## Fallback Behavior

### If Redis is Down

```javascript
// In server/index.js
if (isRedisConnected) {
  // Use Redis
  await redisClient.set(`room:${roomId}`, JSON.stringify(room));
} else {
  // Fallback to in-memory
  memoryStore.rooms.set(roomId, room);
  console.warn("⚠ Using in-memory storage (data not persistent)");
}
```

**Implications:**
- ✓ Server still works
- ✓ Games continue
- ✗ Data lost on restart
- ✗ Cannot scale across instances

---

## Testing Locally

### Test 1: Basic Connectivity

```bash
# Terminal 1
redis-server

# Terminal 2
redis-cli ping
# Response: PONG

# Terminal 3
cd server && npm run dev
# Check logs: "✓ Redis connected"
```

### Test 2: Single User Game

```
1. Visit http://localhost:3000
2. Login
3. Go to /live-match
4. Select game mode
5. Create match → Get room ID
6. In Redis: redis-cli keys "*room*"
7. Should see: room:abc123def456
```

### Test 3: Two Player Game

```
Browser 1: http://localhost:3000
  Login → /live-match → Create Match → Room ID: abc123

Browser 2: http://localhost:3000/play/abc123
  Auto-joins room
  Both can play
```

### Test 4: Redis Persistence

```bash
# Game in progress
redis-cli keys "*"  # See room and match data

# Stop server
Ctrl+C

# Restart server
npm run dev

# Check if room still exists
redis-cli get "room:abc123"
# Should still have data (persisted!)
```

### Test 5: Multiple Servers

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Server Instance 1
PORT=3001 npm run dev

# Terminal 3: Server Instance 2
PORT=3002 REDIS_URL=redis://localhost:6379 npm run dev

# Test: Create room on port 3001
# Join room on port 3002
# Both should see same room data (shared via Redis)
```

---

## Performance Tuning

### Redis Configuration

```bash
# In redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru

# Key expiration strategies
# Rooms: 24 hours
# Matches: 24 hours
# Tokens: 7 days
# Users: No expiration
```

### Monitoring

```bash
# Check memory usage
redis-cli info memory

# Monitor slow queries
redis-cli slowlog get 10

# Check connected clients
redis-cli info clients
```

### Optimization Tips

1. **Use pipelining** for multiple commands
2. **Set appropriate TTLs** to avoid memory buildup
3. **Monitor key count** with `redis-cli dbsize`
4. **Enable persistence** (RDB or AOF) in production
5. **Use Redis Cluster** for high availability

---

## Troubleshooting

### Redis Connection Failed

```
Error: "Error: connect ECONNREFUSED 127.0.0.1:6379"

Solutions:
1. Is Redis running? → redis-server
2. Check Redis port: redis-cli ping
3. Check REDIS_URL env var
4. Check firewall settings
```

### Game Data Not Persisting

```
Issue: Restarting server loses game data

Solutions:
1. Check REDIS_URL is set correctly
2. Verify Redis is connected: redis-cli ping
3. Check logs: "✓ Redis connected"
4. If fallback: "⚠ Using in-memory storage"
5. Enable Redis persistence: RDB snapshots
```

### Rooms Disappearing

```
Issue: Room can't be found after time

Solutions:
1. Rooms expire after 24 hours
2. For development: redis-cli set room:id ... instead
3. Extend TTL in code: { EX: 604800 } for 7 days
4. Check room exists: redis-cli get "room:roomid"
```

### Multiple Servers Out of Sync

```
Issue: Different game state on different servers

Solutions:
1. Verify all use same REDIS_URL
2. Check Redis is reachable from all servers
3. Check firewall allows Redis port
4. Verify Redis server is running
5. Monitor: redis-cli monitor
```

---

## Comparison: In-Memory vs Redis

| Feature | In-Memory | Redis |
|---------|-----------|-------|
| Data Persistence | ✗ Lost on restart | ✓ Persistent |
| Multiple Instances | ✗ Each has own copy | ✓ Shared |
| Scalability | ✓ Single server | ✓ Multiple servers |
| Setup Complexity | ✓ Simple | ⚠ Medium |
| Production Ready | ✗ No | ✓ Yes |
| Memory Management | ⚠ Manual | ✓ Automatic |

---

## Next Steps

1. ✅ Run locally with Redis
2. ✅ Test two-player game
3. ✅ Verify data in Redis
4. ✅ Deploy to Heroku/Railway
5. ✅ Monitor Redis in production
6. ✅ Add password hashing
7. ✅ Add JWT expiration
8. ✅ Add database for users

---

## Links & Resources

- [Redis Documentation](https://redis.io/documentation)
- [Node Redis Client](https://github.com/luin/ioredis)
- [Redis CLI Commands](https://redis.io/commands)
- [Heroku Redis Addon](https://www.heroku.com/redis)
- [Railway Redis](https://docs.railway.app/databases/redis)

---

**Ready to deploy? Start with local testing first! 🚀**
