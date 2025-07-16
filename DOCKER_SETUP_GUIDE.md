# Docker Setup Guide for Custom Domains

## 🤔 Why Docker?

Your custom domain system needs **two services**:
- **Next.js App** (your application)  
- **Caddy Server** (handles SSL certificates + routing)

Docker makes it easy to run both together with automatic networking and SSL certificate management.

## 🎯 Do You Need Docker?

**No!** You have options:

### ✅ Option 1: Skip Docker (Easiest)
Use Vercel/Netlify with their built-in custom domain features:

```bash
# Deploy to Vercel
npm run build
npx vercel --prod

# Add custom domains in dashboard
# SSL handled automatically
```

**Best for**: Getting started quickly, MVP testing  
**Limitations**: Less control over custom domain flow

### ⚙️ Option 2: Use Docker (Full Featured)
Run your own infrastructure with complete custom domain system

**Best for**: Production deployment, full control, cost optimization

### 🔗 Option 3: Hybrid (Next.js + Cloudflare)
Deploy Next.js anywhere + use Cloudflare for SSL

**Best for**: Existing deployment setup + want custom domains

## 🐳 Docker Setup (If You Choose This Route)

### Prerequisites

1. **Server/VPS** (DigitalOcean, AWS, etc.)
2. **Domain name** (e.g., yourplatform.com)
3. **Docker installed** on your server

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### Step 2: Environment Configuration

Create environment file:

```bash
# Create .env file
cat > .env << EOF
# Database (your existing Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Platform domain (update this!)
PLATFORM_DOMAIN=yourplatform.com

# SSL email for Let's Encrypt
SSL_EMAIL=admin@yourplatform.com

# Auth secrets
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=https://yourplatform.com
EOF
```

### Step 3: Update Caddy Configuration

Update the domain in `infrastructure/caddy/Caddyfile`:

```bash
# Edit Caddyfile
nano infrastructure/caddy/Caddyfile

# Replace 'yourplatform.com' with your actual domain
# Replace 'your-email@yourdomain.com' with your email
```

### Step 4: DNS Setup (Important!)

Point your domain to your server:

```dns
# A records pointing to your server IP
yourplatform.com      A    YOUR_SERVER_IP
*.yourplatform.com    A    YOUR_SERVER_IP  # For custom domains
```

### Step 5: Deploy

```bash
# Clone your repo (or upload files)
git clone your-repo-url
cd your-project

# Build and start services
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Check status
docker compose -f infrastructure/docker/docker-compose.yml ps

# View logs
docker compose -f infrastructure/docker/docker-compose.yml logs -f
```

### Step 6: Test

```bash
# Test health endpoint
curl https://yourplatform.com/api/health

# Should return: {"status":"healthy"}
```

### Step 7: SSL Verification

```bash
# Test SSL certificate
curl -I https://yourplatform.com

# Should return: HTTP/2 200 with valid SSL
```

## 🔧 Common Issues & Solutions

### Issue 1: Port 80/443 Already in Use
```bash
# Stop existing web server
sudo systemctl stop apache2  # or nginx

# Or change Docker ports in docker-compose.yml
```

### Issue 2: SSL Certificate Fails
```bash
# Check DNS propagation
dig yourplatform.com

# Check Caddy logs
docker compose logs caddy

# Common fix: Wait 5-10 minutes for DNS propagation
```

### Issue 3: App Won't Start
```bash
# Check app logs
docker compose logs app

# Common fixes:
# - Update environment variables
# - Check database connection
# - Verify build process
```

## 📊 Resource Requirements

### Minimum Server Specs:
- **CPU**: 1 vCPU
- **RAM**: 1GB  
- **Storage**: 20GB
- **Bandwidth**: 1TB/month

### Estimated Costs:
- **DigitalOcean Droplet**: $6/month
- **AWS EC2 t3.micro**: $8-10/month  
- **Domain**: $10-15/year

## 🔄 Updates & Maintenance

### Deploy Updates:
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f infrastructure/docker/docker-compose.yml up -d --build
```

### Monitor Logs:
```bash
# App logs
docker compose logs app -f

# Caddy logs  
docker compose logs caddy -f

# All logs
docker compose logs -f
```

### Backup:
```bash
# Your app uses Supabase (already backed up)
# Just backup environment files
cp .env .env.backup
```

## 🎯 Alternative: Vercel + Custom Domains

If Docker seems too complex, here's the **much simpler** Vercel approach:

### 1. Deploy to Vercel
```bash
npm run build
npx vercel --prod
```

### 2. Add Custom Domain in Dashboard
1. Go to Vercel dashboard
2. Select your project  
3. Settings → Domains
4. Add custom domain
5. Follow DNS instructions

### 3. Update Your Code
Remove Docker-specific code and use Vercel's domain system:

```typescript
// Use Vercel's built-in domain detection
const hostname = headers().get('host') || ''
```

**Pros**: Much simpler, no server management  
**Cons**: Less control over the custom domain flow

## 🤝 My Recommendation

**For MVP/Testing**: Use Vercel + their custom domain features  
**For Production**: Use Docker setup for full control

**Want to start simple?** Skip the Docker setup for now and use Vercel. You can always migrate to Docker later when you need more control.

## 💬 Questions?

The Docker setup gives you:
- ✅ Complete control over custom domain flow
- ✅ Automatic SSL certificate management  
- ✅ Cost-effective hosting ($6-10/month vs $20+/month)
- ✅ All the custom domain features we built

But if it feels overwhelming, **start with Vercel** and upgrade later! 🚀 