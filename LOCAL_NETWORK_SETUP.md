# 🌐 Local Network Setup Guide

Access your Chess App from your phone on the same WiFi network!

## 📋 Prerequisites

- Both devices on **same WiFi network**
- Windows PC running the Chess app
- Phone/tablet with browser
- Port forwarding enabled (optional for external access)

---

## 🚀 Step 1: Find Your PC's IP Address

### On Windows (PowerShell):

```powershell
ipconfig
```

Look for **IPv4 Address** under your WiFi adapter. It will look like:
```
IPv4 Address . . . . . . . . . . . : 192.168.x.x
```

**Common patterns:**
- `192.168.1.x` - Most home routers
- `192.168.0.x` - Some routers
- `10.0.0.x` - Corporate networks

**Save this IP address!** We'll call it `YOUR_PC_IP`

Example: `192.168.1.100`

---

## 🔧 Step 2: Update Backend Server Configuration

### File: `server/index.js`

Find the CORS configuration around line 560-566:

**Current:**
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
  },
});
```

**Change to:**
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001",
      `http://YOUR_PC_IP:3000`,  // Add this line
      `http://YOUR_PC_IP:3001`   // Add this line
    ],
    methods: ["GET", "POST"],
  },
});
```

**Example with IP `192.168.1.100`:**
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://192.168.1.100:3000",
      "http://192.168.1.100:3001"
    ],
    methods: ["GET", "POST"],
  },
});
```

---

## 📝 Step 3: Update Frontend Configuration

### File: `next-js/src/app/play/[roomId]/page.tsx`

Find all WebSocket connections (around line 85) and update:

**Current:**
```javascript
const newSocket = io("http://localhost:3001", {
```

**Change to:**
```javascript
const newSocket = io("http://YOUR_PC_IP:3001", {
```

### Also check: `next-js/src/app/page.tsx`

Find similar Socket.io connections and update them.

---

## 🚀 Step 4: Start the Servers

### Terminal 1 - Backend Server:
```powershell
cd d:\Darshan\projects\chess\server
npm run dev
```

Expected output:
```
✓ Chess Server running on port 3001
WebSocket: ws://localhost:3001
REST API: http://localhost:3001/api
```

### Terminal 2 - Frontend (Next.js):
```powershell
cd d:\Darshan\projects\chess\next-js
npm run dev
```

Expected output:
```
▲ Next.js 15.4.4
- Local: http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

---

## 📱 Step 5: Access from Phone

### On your phone (same WiFi):

Open browser and go to:
```
http://YOUR_PC_IP:3000
```

**Example:**
```
http://192.168.1.100:3000
```

### You should see:
1. ✅ Redirect to `/auth` if not logged in
2. ✅ Login/Signup page
3. ✅ Home page with game modes
4. ✅ All features working!

---

## 🎮 Test Local Network Play

### Test 1: Two Devices Same Match

1. **PC Browser:** 
   - Go to `http://localhost:3000`
   - Login as Player 1
   - Click "Play Live Match"
   - Select "Blitz"
   - Click "Create New Match"
   - **Copy the Room ID**

2. **Phone Browser:**
   - Go to `http://YOUR_PC_IP:3000`
   - Login as Player 2 (or different account)
   - Click "Play Live Match"
   - Select "Blitz" (same mode!)
   - Paste the Room ID
   - Click "Join Match"

3. **Result:** Both devices show same board, moves sync in real-time! 🎉

---

## ⚠️ Common Issues & Fixes

### Issue 1: "Connection Refused"
**Symptom:** Phone can't reach PC
**Fix:**
- Confirm both on same WiFi
- Check Windows Firewall allows Node.js
- Run cmd as admin: `netstat -ano | findstr :3001`

### Issue 2: "WebSocket Connection Failed"
**Symptom:** Game doesn't sync between devices
**Fix:**
- Verify CORS configuration updated
- Verify Socket.io URL points to YOUR_PC_IP:3001
- Check server console for errors

### Issue 3: "DNS Not Working"
**Symptom:** Can't resolve hostname
**Fix:**
- Use IP address instead of hostname
- Clear browser cache
- Try incognito mode

---

## 🔐 Firewall Configuration (Windows)

If you get connection refused errors:

### Option 1: Quick (Less Secure)
```powershell
# Run as Administrator
netsh advfirewall firewall add rule name="Chess App" dir=in action=allow protocol=tcp localport=3000 remoteip=localsubnet
netsh advfirewall firewall add rule name="Chess Server" dir=in action=allow protocol=tcp localport=3001 remoteip=localsubnet
```

### Option 2: Windows Defender Firewall GUI
1. Open **Windows Defender Firewall**
2. Click **Allow an app through firewall**
3. Click **Allow another app**
4. Select `node.exe` from `node_modules/.bin/`
5. Click **Add**
6. Ensure it's checked for **Private Networks**

---

## 🌍 External Network Access (Optional - For Remote Play)

To access from **outside your home network**:

### Option 1: Port Forwarding
1. Login to your router (usually `192.168.1.1` or `192.168.0.1`)
2. Go to **Port Forwarding**
3. Forward:
   - Port `3000` → `YOUR_PC_IP:3000` (Frontend)
   - Port `3001` → `YOUR_PC_IP:3001` (Backend)
4. Get your **Public IP**: Visit `whatismyipaddress.com`
5. Share: `http://YOUR_PUBLIC_IP:3000`

### Option 2: ngrok (Easiest)
```powershell
# Install ngrok
npm install -g ngrok

# Expose frontend
ngrok http 3000

# Expose backend
ngrok http 3001
```

You'll get URLs like: `https://abc123.ngrok.io`

---

## 📊 Testing Checklist

- [ ] Both devices on same WiFi
- [ ] Found PC IP address (`ipconfig`)
- [ ] Updated CORS in `server/index.js`
- [ ] Updated Socket.io URLs in frontend files
- [ ] Backend server running on port 3001
- [ ] Frontend running on port 3000
- [ ] Can access PC from phone browser
- [ ] Can login/signup
- [ ] Can create live match
- [ ] Can join from different device
- [ ] Moves sync in real-time

---

## 🚀 Quick Reference

### Start Everything:
```powershell
# Terminal 1 - Backend
cd d:\Darshan\projects\chess\server; npm run dev

# Terminal 2 - Frontend (in new PowerShell)
cd d:\Darshan\projects\chess\next-js; npm run dev
```

### Access Points:
- PC: `http://localhost:3000`
- Phone: `http://192.168.1.100:3000` (replace with your IP)

### Firewall Command:
```powershell
netsh advfirewall firewall add rule name="Chess App" dir=in action=allow protocol=tcp localport=3000 remoteip=localsubnet
netsh advfirewall firewall add rule name="Chess Server" dir=in action=allow protocol=tcp localport=3001 remoteip=localsubnet
```

---

## 💡 Pro Tips

1. **Use Incognito Mode** on phone to avoid caching issues
2. **Same WiFi** is crucial - Hotspot from phone won't work
3. **Keep both servers running** in background
4. **Test with two browsers first** (easier debugging)
5. **Check Event Viewer** if firewall issues persist

---

## 🎮 Now Play!

Your chess app is now accessible from any device on your local network! 

Start a game between your PC and phone, tablet, or friend's device.

Enjoy! ♟️

---

**Questions?** Check the error messages in:
- PC terminal (backend logs)
- Browser console (F12 → Console tab)
- Network tab (F12 → Network tab)
