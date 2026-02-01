# Deployment Guide - Live Chess Match

Complete guide to deploy the live chess game to production.

---

## Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] No sensitive data in code
- [ ] Environment variables configured
- [ ] SSL/TLS certificates ready (if using HTTPS)
- [ ] Database setup (if using persistence)
- [ ] CI/CD pipeline ready
- [ ] Monitoring configured
- [ ] Backup strategy defined

---

## Environment Setup

### 1. Production Environment Variables

Create `.env.production` in both `server/` and `next-js/`:

**server/.env**
```bash
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

**next-js/.env.local**
```bash
NEXT_PUBLIC_API_URL=https://yourdomain.com:3001
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com:3001
NODE_ENV=production
```

---

## Option 1: Deploy on Heroku

### Backend Deployment

1. **Create Heroku App**
```bash
cd server
heroku create your-chess-server
```

2. **Set Production Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=3001
```

3. **Deploy**
```bash
git push heroku main
```

### Frontend Deployment

1. **Create Heroku App**
```bash
cd ../next-js
heroku create your-chess-app
```

2. **Build**
```bash
npm run build
```

3. **Deploy**
```bash
git push heroku main
```

---

## Option 2: Deploy on AWS EC2

### Backend Setup

1. **SSH into EC2 instance**
```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

2. **Install Node.js**
```bash
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

3. **Clone and Setup**
```bash
git clone your-repo-url
cd chess/server
npm install
```

4. **Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2
```

5. **Start Server with PM2**
```bash
pm2 start index.js --name "chess-server"
pm2 startup
pm2 save
```

6. **Setup Nginx Reverse Proxy**
```bash
sudo yum install -y nginx

# Edit /etc/nginx/nginx.conf
sudo nano /etc/nginx/nginx.conf
```

Add to `http` section:
```nginx
upstream chess_server {
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://chess_server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Start Nginx:
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Frontend Setup

1. **Install Node.js & Build**
```bash
cd ../next-js
npm install
npm run build
```

2. **Use PM2 for Next.js**
```bash
pm2 start "npm start" --name "chess-app"
pm2 save
```

3. **Setup Nginx for Frontend**
Add to nginx config:
```nginx
server {
    listen 80;
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Option 3: Deploy with Docker

### Create Dockerfile for Backend

**server/Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "index.js"]
```

### Create Dockerfile for Frontend

**next-js/Dockerfile**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY public ./public

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

**docker-compose.yml**
```yaml
version: '3.8'

services:
  server:
    build:
      context: ./server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped
    networks:
      - chess-network

  frontend:
    build:
      context: ./next-js
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://server:3001
      - NEXT_PUBLIC_SOCKET_URL=http://server:3001
    depends_on:
      - server
    restart: unless-stopped
    networks:
      - chess-network

networks:
  chess-network:
    driver: bridge
```

### Run with Docker Compose

```bash
docker-compose up -d
```

---

## Option 4: Deploy on Vercel (Frontend only)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
- Go to https://vercel.com
- Import your repository
- Select `next-js` directory
- Set environment variables

3. **Environment Variables in Vercel**
```
NEXT_PUBLIC_API_URL=https://your-server-url
NEXT_PUBLIC_SOCKET_URL=https://your-server-url
```

4. **Deploy**
- Vercel automatically deploys on push

---

## SSL/TLS Setup with Let's Encrypt

### Using Certbot on Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d api.yourdomain.com

# Update Nginx config
sudo nano /etc/nginx/nginx.conf
```

Add to server block:
```nginx
listen 443 ssl http2;
listen [::]:443 ssl http2;

ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

# SSL settings
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
```

Auto-renew:
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Performance Optimization

### Frontend Optimization

1. **Enable gzip compression in next.config.ts**
```typescript
module.exports = {
  compress: true,
  productionBrowserSourceMaps: false,
}
```

2. **Image optimization**
```typescript
images: {
  optimization: true,
  formats: ['image/avif', 'image/webp'],
}
```

3. **Code splitting & lazy loading** - Already built-in with Next.js

### Backend Optimization

1. **Enable clustering in server/index.js**
```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Start server
}
```

2. **Redis for session management** (optional)
```javascript
const redis = require('redis');
const client = redis.createClient();
```

3. **Rate limiting**
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Monitoring & Logging

### Setup PM2 Monitoring

```bash
pm2 plus  # Sign up and get API key
pm2 link <secret_key> <public_key>
```

### Application Logging

Install Winston for logging:
```bash
npm install winston
```

Update server/index.js:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ],
});

logger.info('Server started');
```

---

## Database Setup (Optional)

For persistent game history:

### PostgreSQL Setup

```bash
# Install
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb chess_db
sudo -u postgres psql

postgres=# CREATE USER chess_user WITH PASSWORD 'your_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE chess_db TO chess_user;
```

### Connect in Backend

```bash
npm install pg sequelize
```

```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'chess_db',
  'chess_user',
  'your_password',
  {
    host: 'localhost',
    dialect: 'postgres',
  }
);
```

---

## Backup Strategy

### Automated Backups

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/chess"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
pg_dump chess_db > $BACKUP_DIR/chess_db_$DATE.sql

# Backup code
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /app

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Schedule with cron:
```bash
0 2 * * * /opt/backup.sh  # Run daily at 2 AM
```

---

## Troubleshooting Deployment

### Issue: Connection Refused
```bash
# Check if server is running
sudo netstat -tlnp | grep 3001

# Check firewall
sudo ufw status
sudo ufw allow 3001
```

### Issue: WebSocket Connection Failed
- Ensure firewall allows WebSocket connections
- Check CORS configuration in server/index.js
- Verify environment variables are set

### Issue: High Memory Usage
```bash
# Monitor
pm2 monit

# Restart
pm2 restart all

# Check logs
pm2 logs
```

---

## Scaling Strategy

### Horizontal Scaling

1. **Load Balancing with Nginx**
```nginx
upstream backend {
    least_conn;
    server server1.example.com:3001;
    server server2.example.com:3001;
    server server3.example.com:3001;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

2. **Redis for Session Sharing**
- Store room data in Redis instead of memory
- Multiple servers can access same room data

3. **Message Queue** (for future)
- Use RabbitMQ or Redis for move broadcasts
- Handle high volume of moves

---

## Security Hardening

1. **Input Validation**
```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/rooms', [
  body('playerName').trim().isLength({ min: 1, max: 50 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
});
```

2. **Helmet Security Headers**
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

3. **HTTPS Only**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Post-Deployment Checklist

- [ ] Test all endpoints
- [ ] Verify WebSocket connection
- [ ] Check SSL certificate validity
- [ ] Monitor server resources
- [ ] Review logs for errors
- [ ] Test from multiple locations
- [ ] Verify CORS settings
- [ ] Test auto-reconnection
- [ ] Backup data
- [ ] Document deployment

---

## Rollback Procedure

```bash
# If using git
git revert <commit-hash>
git push production main

# If using PM2
pm2 start index.js --name "chess-server"
pm2 restart all

# If using Docker
docker-compose down
docker-compose up -d
```

---

## Maintenance

### Regular Tasks

- **Weekly**: Check logs for errors
- **Weekly**: Monitor disk space
- **Monthly**: Review performance metrics
- **Monthly**: Update dependencies
- **Quarterly**: Security audit

### Update Procedure

```bash
# Update dependencies
npm update

# Run tests
npm test

# Deploy to staging
git push staging main

# Monitor
pm2 logs

# Deploy to production
git push production main
```

---

**Your chess application is ready for production! 🚀**

For questions or issues, refer to documentation or check logs with `pm2 logs`.
