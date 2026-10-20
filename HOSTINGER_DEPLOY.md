# Hostinger Deployment Guide for AYURWED

This guide covers deploying the AYURWED Next.js application to Hostinger (VPS or Node.js Application Manager).

---

## 1. Prerequisites
- **Node.js**: v20.x or v22.x LTS
- **Database**: MySQL 8.0+ (create a MySQL database and user in Hostinger hPanel)

---

## 2. Environment Setup (`.env`)
Create or edit your `.env` file in the project root:

```env
# MySQL Database (from Hostinger hPanel > Databases > MySQL)
DATABASE_URL="mysql://<db_user>:<db_password>@127.0.0.1:3306/<db_name>?connection_limit=10"

# Production Domain
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="a-very-strong-random-secret-key-at-least-32-chars"

# Third-Party Integrations
GEMINI_API_KEY="your_gemini_api_key"
CLOUDINARY_CLOUD_NAME="your_cloudinary_name"
CLOUDINARY_API_KEY="your_cloudinary_key"
CLOUDINARY_API_SECRET="your_cloudinary_secret"
RAZORPAY_KEY_ID="rzp_live_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

---

## 3. Installation & Database Sync

Run the following commands in the project root:

```bash
# 1. Install production dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Synchronize database schema
npx prisma db push

# 4. (Optional) Run seed data if starting with a fresh database
npx prisma db seed
```

---

## 4. Build the Application

```bash
npm run build
```

---

## 5. Running the Application

### Option A: Using PM2 (Recommended for VPS / Cloud)
```bash
# Install PM2 globally if not installed
npm install -g pm2

# Start Next.js with PM2
pm2 start npm --name "ayurwed" -- start

# Save PM2 process list to restart on reboot
pm2 save
pm2 startup
```

### Option B: Hostinger hPanel Node.js Selector
1. Set **Application Root**: `/public_html` (or your app directory)
2. Set **Application Startup File**: `node_modules/next/dist/bin/next` (with argument `start`) or create a `server.js` if custom server is required.
3. Set **Node.js Version**: 20.x or 22.x.
4. Set Environment Variables in the hPanel Node.js dashboard.
5. Click **Run NPM Install** and then restart the application.

---

## 6. Nginx Reverse Proxy (VPS)
If using VPS with Nginx, proxy port `3000` to port `80/443`:

```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

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
