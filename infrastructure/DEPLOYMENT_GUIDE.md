# Phase 4 Infrastructure Deployment Guide

This guide covers the complete deployment of Phase 4: Infrastructure and SSL Setup for your multi-tenant platform with custom domains.

## 🚀 Quick Start

Choose your deployment approach:

- **🔧 Option A: Caddy (Recommended for MVP)** - Free, open-source, perfect for getting started
- **☁️ Option B: Cloudflare SSL for SaaS** - Enterprise-grade, global CDN, advanced features

## Option A: Caddy Deployment (MVP Approach)

### Prerequisites

- VPS or dedicated server with Docker support
- Domain name for your platform (e.g., yourplatform.com)
- Supabase database set up with domain verification system

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reboot to apply group changes
sudo reboot
```

### 2. Deploy Application

```bash
# Clone your repository
git clone https://github.com/yourusername/parkbus.git
cd parkbus

# Create environment file
cp .env.example .env.production
# Edit with your production values
nano .env.production

# Update Caddy configuration
cd infrastructure/caddy
# Edit Caddyfile - replace yourplatform.com with your actual domain
nano Caddyfile

# Deploy with Docker Compose
cd ../docker
docker-compose -f docker-compose.yml --env-file ../../.env.production up -d
```

### 3. DNS Configuration

Point your domain to your server:

```dns
# A records for your platform
yourplatform.com        A    YOUR_SERVER_IP
*.yourplatform.com      A    YOUR_SERVER_IP
admin.yourplatform.com  A    YOUR_SERVER_IP
```

### 4. Test Platform Domain

```bash
# Test health endpoint
curl https://yourplatform.com/api/health

# Test SSL certificate
curl -I https://yourplatform.com

# Check certificate details
openssl s_client -connect yourplatform.com:443 -servername yourplatform.com
```

## Option B: Cloudflare SSL for SaaS

### Prerequisites

- Cloudflare Enterprise account or SSL for SaaS add-on
- Domain already on Cloudflare
- Cloudflare API tokens

### 1. Cloudflare Setup

```bash
# Set up environment variables
export CLOUDFLARE_ZONE_ID="your_zone_id"
export CLOUDFLARE_API_TOKEN="your_api_token"

# Enable SSL for SaaS
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/ssl/ssl_for_saas/enable" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Deploy Application

```bash
# Deploy to your hosting platform (Vercel, AWS, etc.)
# Ensure these environment variables are set:
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

## 🧪 End-to-End Testing (Task 4.3)

### Test 1: Platform Domain Access

```bash
# Test main platform
curl -I https://yourplatform.com
# Expected: 200 OK with proper SSL

# Test admin subdomain
curl -I https://admin.yourplatform.com
# Expected: 200 OK, redirects to admin login

# Test API endpoints
curl https://yourplatform.com/api/health
# Expected: {"status":"healthy","service":"parkbus-multi-tenant",...}
```

### Test 2: Tenant Onboarding Flow

1. **Complete Onboarding**:
   ```bash
   # Go to your platform
   open https://yourplatform.com/onboard/register
   
   # Fill out onboarding form with:
   # - Business info
   # - Custom domain: testcompany.com
   # - Plan: Professional (required for custom domains)
   ```

2. **Verify Domain Setup**:
   ```bash
   # Check tenant was created
   curl https://yourplatform.com/api/domains/verify?tenant_id=YOUR_TENANT_ID
   
   # Expected response:
   # {
   #   "verification_target": "verify-abc123.yourplatform.com",
   #   "cname_source": "booking.testcompany.com",
   #   "status": "pending"
   # }
   ```

### Test 3: DNS Configuration

1. **Customer DNS Setup**:
   ```dns
   # Customer adds this CNAME record at their DNS provider:
   booking.testcompany.com  CNAME  verify-abc123.yourplatform.com
   ```

2. **Verify DNS Propagation**:
   ```bash
   # Check DNS resolution
   dig booking.testcompany.com CNAME
   nslookup booking.testcompany.com 8.8.8.8
   
   # Test API verification
   curl https://yourplatform.com/api/domains/verify/YOUR_TENANT_ID/retry
   ```

### Test 4: SSL Certificate Provisioning

#### For Caddy:

```bash
# Check Caddy logs
docker logs parkbus-caddy

# Verify SSL certificate request
curl -I https://booking.testcompany.com
# Expected: 200 OK or certificate provisioning in progress

# Check certificate details
openssl s_client -connect booking.testcompany.com:443 -servername booking.testcompany.com
```

#### For Cloudflare:

```bash
# Check custom hostname status
curl "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/custom_hostnames" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"

# Verify SSL status
curl https://yourplatform.com/api/domains/cloudflare?hostname_id=YOUR_HOSTNAME_ID
```

### Test 5: Custom Domain Functionality

1. **Test Custom Domain Access**:
   ```bash
   # Test homepage
   curl -I https://booking.testcompany.com
   # Expected: 200 OK with proper tenant branding
   
   # Test with custom headers
   curl -H "User-Agent: Test" https://booking.testcompany.com/api/health
   # Expected: Health check responds properly
   ```

2. **Test Tenant Detection**:
   ```bash
   # Check tenant context is working
   curl https://booking.testcompany.com -v
   # Expected: Response includes tenant-specific branding
   
   # Check middleware headers
   curl -I https://booking.testcompany.com
   # Expected: x-custom-domain and x-domain-type headers
   ```

### Test 6: Security Validation

```bash
# Test unregistered domain (should fail)
curl -I https://booking.unregistered-domain.com
# Expected: 404 or 503 error

# Test SSL verification endpoint
curl "https://yourplatform.com/api/domains/verify-ssl?domain=booking.testcompany.com"
# Expected: {"authorized":true,"tenant_id":"..."}
```

## 📊 Monitoring and Troubleshooting

### Health Checks

```bash
# Application health
curl https://yourplatform.com/api/health

# Database connectivity
curl https://yourplatform.com/api/health | jq '.database'

# SSL certificate status
curl https://yourplatform.com/api/domains/verify/YOUR_TENANT_ID | jq '.ssl_status'
```

### Common Issues

#### Issue 1: SSL Certificate Not Provisioning

```bash
# Check Caddy logs
docker logs parkbus-caddy | grep "certificate"

# Verify domain verification endpoint
curl "https://yourplatform.com/api/domains/verify-ssl?domain=booking.testcompany.com"

# Check DNS resolution
dig booking.testcompany.com CNAME
```

**Solution**: Ensure CNAME points to correct verification target and domain is verified in database.

#### Issue 2: Tenant Not Found

```bash
# Check tenant in database
curl https://yourplatform.com/api/domains/verify?tenant_id=YOUR_TENANT_ID

# Check middleware logs
docker logs parkbus-app | grep "tenant"
```

**Solution**: Verify tenant exists in database and domain field is populated correctly.

#### Issue 3: DNS Propagation Issues

```bash
# Check multiple DNS resolvers
dig @8.8.8.8 booking.testcompany.com CNAME
dig @1.1.1.1 booking.testcompany.com CNAME

# Check TTL settings
dig booking.testcompany.com | grep TTL
```

**Solution**: Lower TTL to 300 seconds during setup, wait for global propagation.

## 🔧 Maintenance

### Certificate Renewal

#### Caddy (Automatic)
- Certificates automatically renew 30 days before expiry
- Monitor logs: `docker logs parkbus-caddy | grep renewal`

#### Cloudflare (Automatic)
- Certificates automatically managed by Cloudflare
- Monitor via API or dashboard

### Database Cleanup

```sql
-- Clean up expired verification tokens
SELECT cleanup_expired_domain_verifications();

-- Check domain verification stats
SELECT * FROM get_domain_verification_stats();
```

### Log Monitoring

```bash
# Application logs
docker logs parkbus-app --tail 100

# Caddy access logs
docker exec parkbus-caddy tail -f /var/log/caddy/custom-domains.log

# Error monitoring
docker logs parkbus-app | grep ERROR
```

## 🎉 Success Criteria

Phase 4 is complete when:

- ✅ **Task 4.1**: Custom domains like `booking.testcompany.com` resolve to your platform
- ✅ **Task 4.2**: SSL certificates are automatically provisioned and active
- ✅ **Task 4.3**: End-to-end flow works: Onboarding → DNS Setup → SSL → Live Site

### Final Validation

```bash
# Complete end-to-end test
echo "Testing complete custom domain flow..."

# 1. Platform access
curl -I https://yourplatform.com && echo "✅ Platform accessible"

# 2. Custom domain access  
curl -I https://booking.testcompany.com && echo "✅ Custom domain accessible"

# 3. SSL certificate valid
openssl s_client -connect booking.testcompany.com:443 -servername booking.testcompany.com </dev/null 2>/dev/null | grep "Verify return code: 0" && echo "✅ SSL certificate valid"

# 4. Tenant detection working
curl -s https://booking.testcompany.com | grep "testcompany" && echo "✅ Tenant detection working"

echo "🎉 Phase 4 deployment successful!"
```

## Next Steps

With Phase 4 complete, you're ready for:
- **Phase 5**: Testing and Documentation
- **Production deployment** with real customer domains
- **Scaling considerations** (Caddy → Cloudflare migration)
- **Monitoring and alerting** setup 