# Cloudflare SSL for SaaS Setup Guide

This guide covers setting up **Cloudflare SSL for SaaS** for enterprise-grade custom domain management. This is the recommended solution for high-traffic platforms with hundreds of custom domains.

## Prerequisites

- Cloudflare Enterprise account or SSL for SaaS add-on
- Your platform domain already on Cloudflare
- API tokens with appropriate permissions

## 1. Cloudflare Configuration

### Enable SSL for SaaS

```bash
# Enable SSL for SaaS on your zone
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/ssl/ssl_for_saas/enable" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json"
```

### Configure Custom Hostname

```typescript
// Example API call to create custom hostname
const createCustomHostname = async (hostname: string, targetDomain: string) => {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hostname: hostname, // e.g., "booking.parkbus.com"
        origin: targetDomain, // e.g., "yourplatform.com"
        ssl: {
          method: 'http',
          settings: {
            http2: 'on',
            min_tls_version: '1.2',
            tls_1_3: 'on'
          }
        }
      })
    }
  );
  return response.json();
};
```

## 2. API Integration

### Custom Hostname Management API

Update your domain verification API to integrate with Cloudflare:

```typescript
// src/app/api/domains/cloudflare/route.ts
import { NextRequest, NextResponse } from 'next/server'

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4'
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

export async function POST(request: NextRequest) {
  try {
    const { hostname, tenant_id } = await request.json()

    // Create custom hostname in Cloudflare
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostname,
          origin: 'yourplatform.com',
          ssl: {
            method: 'http',
            settings: {
              http2: 'on',
              min_tls_version: '1.2',
              tls_1_3: 'on'
            }
          }
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${data.errors?.[0]?.message}`)
    }

    // Update tenant record with Cloudflare custom hostname ID
    await supabase
      .from('tenants')
      .update({
        cloudflare_hostname_id: data.result.id,
        ssl_status: 'provisioning',
        domain_status: 'active'
      })
      .eq('id', tenant_id)

    return NextResponse.json({
      success: true,
      custom_hostname_id: data.result.id,
      status: data.result.status,
      verification_errors: data.result.verification_errors
    })

  } catch (error) {
    console.error('Cloudflare hostname creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create custom hostname' },
      { status: 500 }
    )
  }
}
```

### SSL Certificate Status Monitoring

```typescript
// Check SSL certificate status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customHostnameId = searchParams.get('hostname_id')

    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames/${customHostnameId}`,
      {
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        }
      }
    )

    const data = await response.json()

    return NextResponse.json({
      hostname: data.result.hostname,
      status: data.result.status,
      ssl_status: data.result.ssl?.status,
      verification_errors: data.result.verification_errors,
      created_at: data.result.created_at
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check SSL status' },
      { status: 500 }
    )
  }
}
```

## 3. Environment Variables

Add these to your `.env.local`:

```bash
# Cloudflare SSL for SaaS Configuration
CLOUDFLARE_ZONE_ID=your_zone_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# SSL for SaaS Settings
CLOUDFLARE_SSL_FOR_SAAS_ENABLED=true
CLOUDFLARE_FALLBACK_ORIGIN=yourplatform.com
```

## 4. Database Schema Updates

Add Cloudflare-specific fields to your tenants table:

```sql
-- Add Cloudflare integration fields
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS cloudflare_hostname_id TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS cloudflare_status TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ssl_certificate_authority TEXT DEFAULT 'cloudflare';

-- Create index for Cloudflare hostname lookups
CREATE INDEX IF NOT EXISTS idx_tenants_cloudflare_hostname 
ON tenants(cloudflare_hostname_id) WHERE cloudflare_hostname_id IS NOT NULL;
```

## 5. Customer DNS Instructions

When using Cloudflare SSL for SaaS, customers need to create:

```dns
# Customer DNS Setup
booking.parkbus.com CNAME yourplatform.com
```

## 6. Monitoring and Alerting

### Webhook for SSL Status Updates

```typescript
// src/app/api/webhooks/cloudflare/route.ts
export async function POST(request: NextRequest) {
  try {
    const webhook = await request.json()
    
    // Verify webhook signature (recommended)
    if (!verifyCloudflareSignature(request)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Handle SSL certificate status changes
    if (webhook.event_type === 'ssl_certificate_status_changed') {
      const { custom_hostname_id, status } = webhook.data

      await supabase
        .from('tenants')
        .update({
          ssl_status: status,
          domain_last_check: new Date().toISOString()
        })
        .eq('cloudflare_hostname_id', custom_hostname_id)

      // Send notification to tenant if certificate is ready
      if (status === 'active') {
        await sendCustomDomainReadyNotification(custom_hostname_id)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Cloudflare webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
```

## 7. Benefits of Cloudflare SSL for SaaS

### Performance
- **Global CDN**: 330+ data centers worldwide
- **HTTP/2 & HTTP/3**: Latest protocol support
- **Automatic minification**: CSS, JS, HTML optimization
- **Image optimization**: WebP conversion, resizing

### Security
- **DDoS protection**: Automatic attack mitigation
- **WAF (Web Application Firewall)**: Advanced threat protection
- **SSL certificate management**: Automatic provisioning and renewal
- **Zero-downtime certificate updates**

### Monitoring
- **Real-time analytics**: Traffic, performance, security metrics
- **Custom dashboards**: Tenant-specific insights
- **Alerting**: SSL expiry, traffic anomalies, security events

## 8. Cost Considerations

- **SSL for SaaS**: $2-10/hostname/month (enterprise pricing)
- **Bandwidth**: Included in Enterprise plan
- **Additional features**: WAF, DDoS protection, analytics included
- **Support**: 24/7 enterprise support

## 9. Migration Strategy

### From Caddy to Cloudflare

1. **Gradual migration**: Move high-traffic tenants first
2. **Feature flags**: Toggle SSL provider per tenant
3. **Monitoring**: Compare performance metrics
4. **Rollback plan**: Keep Caddy as fallback

```typescript
// Feature flag for SSL provider selection
const getSSLProvider = (tenant: Tenant) => {
  // Enterprise tenants use Cloudflare
  if (tenant.subscription_plan === 'enterprise') {
    return 'cloudflare'
  }
  
  // High-traffic tenants use Cloudflare
  if (tenant.monthly_pageviews > 100000) {
    return 'cloudflare'
  }
  
  // Default to Caddy for smaller tenants
  return 'caddy'
}
```

## 10. Testing

### Local Testing with Cloudflare

```bash
# Test custom hostname creation
curl -X POST http://localhost:3000/api/domains/cloudflare \
  -H "Content-Type: application/json" \
  -d '{
    "hostname": "test.example.com",
    "tenant_id": "your-tenant-id"
  }'

# Check SSL status
curl http://localhost:3000/api/domains/cloudflare?hostname_id=abc123
```

### Production Validation

```bash
# Verify SSL certificate
openssl s_client -connect booking.parkbus.com:443 -servername booking.parkbus.com

# Check HTTP/2 support
curl -I --http2 https://booking.parkbus.com

# Test from multiple locations
curl -H "CF-IPCountry: US" https://booking.parkbus.com
```

This setup provides enterprise-grade custom domain management with global performance, security, and monitoring capabilities. 