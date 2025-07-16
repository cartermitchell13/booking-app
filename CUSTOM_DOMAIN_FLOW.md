# Complete Custom Domain Flow Explanation

This document explains exactly how custom domains work from start to finish, answering the question: **"How do customers get a live custom domain like booking.parkbus.com?"**

## 🔄 The Complete Flow

### Phase 1: Customer Onboarding
```
Customer: "I want booking.parkbus.com for my business"
↓
Platform: Creates tenant record with domain="parkbus.com"
↓ 
System: Generates verification token (e.g., abc123)
```

### Phase 2: Domain Verification  
```
System: "Prove you own parkbus.com by creating this DNS record:"
    booking.parkbus.com CNAME verify-abc123.yourplatform.com
↓
Customer: Creates CNAME record at their DNS provider
↓
System: Detects CNAME → Marks domain as "verified" ✅
```

### Phase 3: SSL Certificate Provisioning
```
Caddy/Cloudflare: Sees verified domain in database
↓
SSL Provider: "Let me get an SSL certificate for booking.parkbus.com"
↓
System: SSL status changes to "provisioned" → "active" ✅
```

### Phase 4: Domain Activation (The Missing Piece!)
```
System: "Domain verified ✅ SSL ready ✅ Now update your CNAME!"
↓
Customer: Changes DNS record:
    OLD: booking.parkbus.com CNAME verify-abc123.yourplatform.com
    NEW: booking.parkbus.com CNAME yourplatform.com
↓
Traffic Flow: booking.parkbus.com → yourplatform.com → Your App ✅
```

## 🎯 Key Insight: Two Different CNAME Records

The critical understanding is that customers need to create **TWO different CNAME records**:

### 1. Verification CNAME (Temporary)
```dns
# Purpose: Prove domain ownership
booking.parkbus.com  CNAME  verify-abc123.yourplatform.com
```
- **Used for**: Domain ownership verification
- **Duration**: Until verification complete
- **DNS Target**: Unique verification token

### 2. Production CNAME (Permanent) 
```dns
# Purpose: Route live traffic to your platform
booking.parkbus.com  CNAME  yourplatform.com
```
- **Used for**: Live traffic routing  
- **Duration**: Permanent (as long as they're a customer)
- **DNS Target**: Your main platform domain

## 🔧 Technical Implementation

### Backend API Flow

1. **Domain Verification** (`/api/domains/verify`)
   ```typescript
   // Customer proves ownership
   POST /api/domains/verify
   {
     "domain": "parkbus.com",
     "tenant_id": "uuid"
   }
   
   // Response: Instructions for verification CNAME
   {
     "verification_target": "verify-abc123.yourplatform.com",
     "cname_source": "booking.parkbus.com", 
     "instructions": "Create CNAME: booking.parkbus.com → verify-abc123.yourplatform.com"
   }
   ```

2. **SSL Provisioning** (`/api/domains/verify-ssl`)
   ```typescript
   // Caddy calls this before issuing SSL certificates
   GET /api/domains/verify-ssl?domain=booking.parkbus.com
   
   // Response: Authorization for SSL certificate
   {
     "authorized": true,
     "tenant_id": "uuid"
   }
   ```

3. **Domain Activation** (`/api/domains/activate`)
   ```typescript
   // Check if domain is ready for production traffic
   GET /api/domains/activate/tenant-id
   
   // Response: Instructions for production CNAME
   {
     "status": "ready_for_activation",
     "instructions": {
       "current_record": "booking.parkbus.com CNAME verify-abc123.yourplatform.com",
       "new_record": "booking.parkbus.com CNAME yourplatform.com"
     }
   }
   ```

### Frontend User Experience

1. **Onboarding**: Customer enters "parkbus.com" during signup
2. **Verification Step**: Shows DNS instructions for verification CNAME
3. **Waiting Period**: SSL certificate provisioning (1-5 minutes)
4. **Activation Step**: Shows DNS instructions for production CNAME  
5. **Live Domain**: `https://booking.parkbus.com` works with SSL!

## 🌐 How Traffic Flows (Production)

### Request Journey
```
1. User visits: https://booking.parkbus.com
   ↓
2. DNS Resolution: booking.parkbus.com → yourplatform.com (via CNAME)
   ↓ 
3. Load Balancer: Caddy/Cloudflare receives request
   ↓
4. SSL Termination: HTTPS certificate validates
   ↓
5. Reverse Proxy: Request forwarded to your Next.js app
   ↓
6. Middleware: Detects custom domain in headers
   ↓
7. Tenant Context: Looks up tenant by domain "parkbus.com"
   ↓
8. Response: Branded page for ParkBus tenant ✅
```

### Infrastructure Components

```
[Customer DNS]
booking.parkbus.com CNAME yourplatform.com
                    ↓
[Load Balancer: Caddy/Cloudflare]  
- SSL termination
- Header injection  
- Health checks
                    ↓
[Next.js App: localhost:3000]
- Middleware: Custom domain detection
- Tenant Context: Database lookup
- Response: Tenant-specific content
```

## 📱 Customer Experience Example

### Step 1: Onboarding Complete
```
✅ Account created
✅ Domain entered: parkbus.com
✅ Plan selected: Professional (required for custom domains)
```

### Step 2: Domain Verification  
```
📧 Email: "Complete your domain setup"
🔗 Link: yourplatform.com/domains/setup

📋 Instructions:
"Add this DNS record at your domain provider:
 booking.parkbus.com CNAME verify-abc123.yourplatform.com"

⏱️ Status: "Waiting for DNS propagation..."
```

### Step 3: SSL Provisioning
```
✅ Domain verified!
⏳ SSL certificate being generated...

📧 Email: "SSL certificate ready"
```

### Step 4: Domain Activation
```
✅ Domain verified
✅ SSL certificate active  
📋 Final step: "Update your DNS record:

OLD: booking.parkbus.com CNAME verify-abc123.yourplatform.com
NEW: booking.parkbus.com CNAME yourplatform.com

TTL: 300 seconds (5 minutes)"
```

### Step 5: Live Domain!
```
🎉 Success! Your domain is live:
🔗 https://booking.parkbus.com

✅ SSL certificate: Valid
✅ Tenant branding: Applied  
✅ Ready for customers!
```

## 🛠️ Implementation Status

### ✅ Completed (Phase 1-4)
- [x] Domain verification system
- [x] SSL certificate provisioning  
- [x] Database schema for domain tracking
- [x] Frontend domain setup components
- [x] **Domain activation API** (NEW!)
- [x] **Domain activation UI** (NEW!)
- [x] Middleware for custom domain routing
- [x] Tenant context detection
- [x] Infrastructure setup (Caddy + Docker)

### 🚀 What Happens Next

1. **Customer Completes Onboarding**
   - Gets verification instructions
   - Creates temporary CNAME

2. **System Verifies Domain**  
   - Marks domain as verified
   - Triggers SSL provisioning

3. **SSL Certificate Issued**
   - Certificate becomes active
   - Domain ready for activation

4. **Customer Updates CNAME**
   - Changes from verification to production target
   - Domain becomes live with traffic routing

5. **Custom Domain Works!**
   - `https://booking.parkbus.com` loads
   - Shows ParkBus-branded platform
   - SSL certificate valid

## 🔍 Testing the Complete Flow

### Local Testing
```bash
# 1. Complete onboarding 
curl -X POST localhost:3000/api/domains/verify \
  -d '{"domain":"testcompany.com","tenant_id":"uuid"}'

# 2. Check SSL verification
curl "localhost:3000/api/domains/verify-ssl?domain=booking.testcompany.com"

# 3. Check activation status
curl localhost:3000/api/domains/activate/tenant-uuid

# 4. Simulate DNS change and test activation
curl -X POST localhost:3000/api/domains/activate/tenant-uuid
```

### Production Testing
```bash
# 1. Customer creates verification CNAME
dig booking.testcompany.com CNAME
# Should return: verify-token.yourplatform.com

# 2. Domain verification completes
curl https://yourplatform.com/api/domains/verify/tenant-uuid

# 3. Customer updates to production CNAME  
dig booking.testcompany.com CNAME
# Should return: yourplatform.com

# 4. Test live domain
curl -I https://booking.testcompany.com
# Should return: 200 OK with valid SSL
```

## 🎯 Summary

The key insight is that **custom domains require a two-step DNS process**:

1. **Verification CNAME**: Proves domain ownership
2. **Production CNAME**: Routes live traffic

The system guides customers through both steps with clear instructions and status tracking. Once the production CNAME is in place, `booking.parkbus.com` works exactly like any other domain - SSL certificate is valid, traffic routes correctly, and the tenant-specific platform loads with proper branding.

This creates a seamless white-label experience where customers' brands are front and center! 🎉 