# ✅ Local Network Setup - Quick Start

## 🎯 Your Setup Information

| Item | Value |
|------|-------|
| **Your PC IP** | `192.168.1.103` |
| **Frontend URL** | `http://192.168.1.103:3000` |
| **Backend URL** | `http://192.168.1.103:3001` |
| **Frontend Local** | `http://localhost:3000` |
| **Backend Local** | `http://localhost:3001` |

---

## ✨ What Was Just Done

✅ **Server CORS updated** - Now allows local network connections  
✅ **Frontend Socket.io** - Auto-detects network vs localhost  
✅ **Smart URL detection** - Works on both PC and phone  
✅ **All files configured** - Ready to run!

---

## 🚀 Quick Start (3 Steps)

### Step 1: Allow Firewall (Run as Administrator)
```powershell
# Option A: Run the PowerShell script (easiest)
.\setup-firewall.ps1

# Option B: Or manually run these commands:
netsh advfirewall firewall add rule name="Chess App Frontend" dir=in action=allow protocol=tcp localport=3000 remoteip=localsubnet profile=private
netsh advfirewall firewall add rule name="Chess App Backend" dir=in action=allow protocol=tcp localport=3001 remoteip=localsubnet profile=private
```

### Step 2: Start Backend Server
```powershell
cd d:\Darshan\projects\chess\server
npm run dev
```

### Step 3: Start Frontend (New PowerShell Window)
```powershell
cd d:\Darshan\projects\chess\next-js
npm run dev
```

---

## 📱 Access from Phone

### On Your Phone (Same WiFi):

1. Open any browser
2. Go to: `http://192.168.1.103:3000`
3. Login with your account
4. Play!

---

## 🎮 Play Local Network Game

### Two-Device Match:

**Device 1 (PC):**
- Go to `http://localhost:3000`
- Click "Play Live Match"
- Select "Blitz"
- Click "Create New Match"
- Copy the Room ID

**Device 2 (Phone):**
- Go to `http://192.168.1.103:3000`
- Click "Play Live Match"
- Select "Blitz" (same mode!)
- Paste Room ID
- Click "Join Match"

**Result:** 🎉 Live chess game between PC and phone!

---

## ⚡ What Auto-Detection Does

The app now intelligently detects your network:

```
If you visit from PC (localhost):
├─ Frontend: http://localhost:3000
└─ Backend: ws://localhost:3001

If you visit from Phone (192.168.1.103):
├─ Frontend: http://192.168.1.103:3000
└─ Backend: ws://192.168.1.103:3001
```

**You don't need to change anything - it just works!**

---

## 🐛 Troubleshooting

### Issue: "Connection Refused from Phone"
```
Solution:
1. Confirm both devices on same WiFi
2. Run firewall script (setup-firewall.ps1)
3. Check PC doesn't have firewall blocking Node.js
```

### Issue: "WebSocket Connection Failed"
```
Solution:
1. Check backend server is running (terminal shows port 3001)
2. Verify frontend can reach backend:
   - Open F12 → Console on phone
   - Should see no errors
```

### Issue: "DNS Error"
```
Solution:
- Use IP address, not hostname
- Clear browser cache
- Try incognito mode
```

---

## 📊 Test Connectivity

### From Phone, Open Browser Console (F12):

```javascript
// Copy-paste this to test connection:
fetch('http://192.168.1.103:3001/api/matches')
  .then(r => r.json())
  .then(d => console.log('✓ Connected!', d))
  .catch(e => console.error('✗ Failed:', e))
```

If you see `✓ Connected!` → Backend is reachable ✅

---

## 🔍 Check Server Logs

Backend terminal should show:

```
============================================================
✓ Chess Server running on port 3001
WebSocket: ws://localhost:3001
REST API: http://localhost:3001/api
Storage: ✓ Redis (or ⚠ In-Memory Fallback)
============================================================
```

---

## 📁 Files That Were Updated

1. **`server/index.js`**
   - ✅ CORS updated with your IP (192.168.1.103)
   - ✅ Ready for local network

2. **`next-js/src/app/play/[roomId]/page.tsx`**
   - ✅ Smart URL detection added
   - ✅ Auto-connects to backend

3. **`next-js/src/app/page.tsx`**
   - ✅ Smart URL detection added
   - ✅ Works on both PC and phone

---

## 🌍 Advanced: External Network Access

Want to play with friends outside your home network?

### Option 1: ngrok (Recommended for Testing)
```powershell
# Install
npm install -g ngrok

# Expose frontend (get public URL)
ngrok http 3000

# Expose backend (in another terminal)
ngrok http 3001
```

You'll get URLs like: `https://abc123.ngrok.io`

### Option 2: Port Forwarding (Production)
1. Login to router at `192.168.1.1`
2. Forward ports:
   - External 3000 → PC (192.168.1.103) port 3000
   - External 3001 → PC (192.168.1.103) port 3001
3. Get Public IP from `whatismyipaddress.com`
4. Share: `http://YOUR_PUBLIC_IP:3000`

---

## ✨ Key Features Now Available

| Feature | Local | Network | Notes |
|---------|-------|---------|-------|
| Login/Signup | ✅ | ✅ | Works from phone |
| Create Match | ✅ | ✅ | Room ID shared |
| Join Match | ✅ | ✅ | Cross-device |
| Real-time Sync | ✅ | ✅ | Live WebSocket |
| Multiple Modes | ✅ | ✅ | Bullet/Blitz/Rapid |

---

## 📝 Network Info Reference

**Your PC:**
- IP: `192.168.1.103`
- Frontend: `http://192.168.1.103:3000`
- Backend: `http://192.168.1.103:3001`

**Your Phone (on same WiFi):**
- Same as above URLs!
- No installation needed
- Just open browser

---

## 🎯 Next Steps

1. ✅ Run firewall setup
2. ✅ Start backend server
3. ✅ Start frontend server
4. ✅ Test on phone at `http://192.168.1.103:3000`
5. ✅ Create a match and invite friend
6. ✅ Play live chess!

---

## 💡 Pro Tips

- **Bookmark the URL** on phone for quick access
- **Use different WiFi networks** to test external access
- **Keep servers running** in separate terminal windows
- **Test on two browsers** first before using phone
- **Check logs** if something isn't working

---

**Everything is configured! Start playing! ♟️**

Questions? Check the detailed guide: `LOCAL_NETWORK_SETUP.md`
