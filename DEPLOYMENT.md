# Mera Innovation CRM - Production Deployment Guide

This guide details the step-by-step procedure for deploying **Mera Innovation CRM** as a standalone application hosted at **`crm.merainnovation.com`**.

---

## 1. Project Boundary & Architecture

```text
GitHub Repositories
├── mera-innovation-website (Public Website)
└── mera-innovation-crm     (This CRM Application - Independent Repository)

Production VPS Hosting
├── merainnovation.com      → Public Website Process (Port 80/443)
└── crm.merainnovation.com  → Mera Innovation CRM Process (Port 3000 -> 443)
```

The CRM runs as a completely independent process and repository.

---

## 2. Server Prerequisites

* Node.js v18.0.0 or higher
* PostgreSQL v14+
* Nginx Web Server
* PM2 Process Manager (`npm install -g pm2`)
* Certbot Let's Encrypt SSL (`apt install certbot python3-certbot-nginx`)

---

## 3. Deployment Steps

### Step 1: Clone Repository
```bash
cd /var/www
git clone https://github.com/mera-innovation/mera-innovation-crm.git
cd mera-innovation-crm
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and populate production secrets:
```bash
cp .env.example .env
nano .env
```

Ensure the following variables are configured:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/merainnovation_crm?schema=public"
AUTH_SECRET="GENERATE_RANDOM_LONG_STRING_FOR_JWT_SECURITY"
NEXT_PUBLIC_APP_URL="https://crm.merainnovation.com"

# Email Integration (Resend / SMTP)
EMAIL_API_KEY="re_123456789..."
EMAIL_FROM="outreach@merainnovation.com"

# Meta WhatsApp Business Platform / Cloud API
WHATSAPP_API_KEY="EAAG..."
WHATSAPP_PHONE_NUMBER_ID="1092837465..."
WHATSAPP_BUSINESS_ACCOUNT_ID="987654321..."
WHATSAPP_VERIFY_TOKEN="mera_whatsapp_verify_token_2026"
```

### Step 3: Install Dependencies & Run Database Migrations
```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

### Step 4: Build Production Next.js Bundle
```bash
npm run build
```

### Step 5: Start Application with PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

Verify PM2 status:
```bash
pm2 status mera-innovation-crm
```

---

## 4. Nginx Reverse Proxy & SSL Setup

### Step 1: Copy Nginx Configuration
```bash
cp nginx.conf.example /etc/nginx/sites-available/crm.merainnovation.com
ln -s /etc/nginx/sites-available/crm.merainnovation.com /etc/nginx/sites-enabled/
```

### Step 2: Issue SSL Certificate via Let's Encrypt
```bash
certbot --nginx -d crm.merainnovation.com
```

### Step 3: Test and Reload Nginx
```bash
nginx -t
systemctl reload nginx
```

---

## 5. Automated Database Backups

Make backup script executable:
```bash
chmod +x scripts/db-backup.sh
```

Add daily backup cron job (`crontab -e`):
```cron
0 2 * * * /var/www/mera-innovation-crm/scripts/db-backup.sh >> /var/log/crm-db-backup.log 2>&1
```

---

## 6. Accessing the Application

Navigate to **`https://crm.merainnovation.com`**

### Default Initial Credentials:
* **Admin**: `admin@merainnovation.com` | `Admin@123456`
* **Outreach User**: `amrit@merainnovation.com` | `Outreach@123456`

*(Change default passwords immediately after initial login).*
