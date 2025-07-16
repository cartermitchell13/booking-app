# Multi-Tenant Domain Architecture

## 🏗️ How The System Works

### **Production Environment**

In production, each tenant gets their own domain/subdomain:

#### Option 1: Platform Subdomains
```
Main Platform:    yourplatform.com
Tenant 1:         parkbus.yourplatform.com
Tenant 2:         rockymountain.yourplatform.com
Super Admin:      admin.yourplatform.com
```

#### Option 2: Custom Domains (Premium Feature)
```
Tenant 1:         booking.parkbus.com         → Custom domain
Tenant 2:         book.rockymountaintours.com → Custom domain
Super Admin:      admin.yourplatform.com     → Always on platform
```

### **Development Environment** 

For local development, we use URL parameters to simulate different tenants:

```
Default:          localhost:3000                   → ParkBus (default)
Tenant Switch:    localhost:3000?tenant=parkbus   → ParkBus
Different Tenant: localhost:3000?tenant=rockymountain → Rocky Mountain Tours
Another Tenant:   localhost:3000?tenant=adventurebus  → Adventure Bus Co
```

## 🔧 Development Testing

### **Available Test Tenants**

1. **ParkBus** (Enterprise Plan)
   - Slug: `parkbus`
   - Colors: Green (#10B981)
   - URL: `localhost:3000?tenant=parkbus`

2. **Rocky Mountain Tours** (Professional Plan)
   - Slug: `rockymountain`
   - Colors: Red (#DC2626)
   - URL: `localhost:3000?tenant=rockymountain`

3. **Adventure Bus Co** (Starter Plan)
   - Slug: `adventurebus`
   - Colors: Purple (#7C3AED)
   - URL: `localhost:3000?tenant=adventurebus`

### **Testing Different Scenarios**

```bash
# Test default tenant (ParkBus)
open http://localhost:3000

# Test Rocky Mountain Tours branding
open http://localhost:3000?tenant=rockymountain

# Test Adventure Bus Co (Starter plan limitations)
open http://localhost:3000?tenant=adventurebus

# Test login/admin features
open http://localhost:3000/login?tenant=parkbus
open http://localhost:3000/admin?tenant=rockymountain
```

### **Dev Tenant Switcher**

The floating panel in the top-right (development only) allows you to:
- See current tenant info
- Switch between test tenants
- Copy test URLs
- Clear tenant parameters

## 🌐 Production Domain Flow

### **1. Platform Subdomains**
```
User visits:      parkbus.yourplatform.com
System detects:   "parkbus" subdomain
Database lookup:  tenants.slug = "parkbus"
Result:          Load ParkBus tenant data
```

### **2. Custom Domains**
```
User visits:      booking.parkbus.com
DNS CNAME:        booking.parkbus.com → yourplatform.com
System detects:   "booking.parkbus.com" hostname
Database lookup:  tenants.domain = "booking.parkbus.com"
Result:          Load ParkBus tenant data
```

## 🎨 Tenant Branding System

Each tenant has their own:
- **Colors**: Primary/secondary color scheme
- **Fonts**: Custom font selections
- **Logo**: Custom logo upload
- **Domain**: Custom domain or platform subdomain
- **Plan**: Starter/Professional/Enterprise features

The system automatically applies the correct branding based on the detected tenant.

## 🔐 Authentication & Admin Access

### **Super Admin**
- Can access from any domain
- Always redirected to `/admin`
- Can switch between tenant contexts
- Full system access

### **Tenant Admin**
- Can access from any domain (with tenant switching)
- Redirected to `/dashboard` for their tenant
- Tenant-specific admin features
- Limited to their tenant's data

### **Customers**
- Domain-specific access only
- See tenant's branded experience
- Limited to booking/account features

## 🚀 Deployment Considerations

### **DNS Setup**
- Platform subdomains: CNAME to main platform
- Custom domains: Customer sets up CNAME records
- SSL certificates: Automatic via Let's Encrypt/Cloudflare

### **Load Balancer**
- Route all domains to same Next.js app
- Tenant detection happens in middleware
- Proper SSL termination for all domains

### **Database**
- Single database with tenant isolation
- Row-level security (RLS) policies
- Tenant ID in all queries

## 📖 Code Examples

### **Getting Current Tenant**
```typescript
import { useTenant } from '@/lib/tenant-context';

function MyComponent() {
  const { tenant, isLoading } = useTenant();
  
  if (isLoading) return <div>Loading...</div>;
  if (!tenant) return <div>Tenant not found</div>;
  
  return (
    <div style={{ color: tenant.branding.primary_color }}>
      Welcome to {tenant.name}!
    </div>
  );
}
```

### **Tenant-Specific Database Queries**
```typescript
// Automatic tenant filtering via RLS
const { data: trips } = await supabase
  .from('trips')
  .select('*')
  .gte('departure_date', new Date().toISOString());
// RLS automatically filters by current tenant
```

### **Conditional Features by Plan**
```typescript
const { tenant } = useTenant();

const canUseCustomDomain = tenant?.subscription_plan !== 'starter';
const hasAdvancedAnalytics = tenant?.subscription_plan === 'enterprise';
```

## 🐛 Common Issues & Solutions

### **Issue: "Tenant not found" on localhost**
**Solution**: Add `?tenant=parkbus` to URL or use the Dev Tenant Switcher

### **Issue: Wrong tenant loaded**
**Solution**: Check URL parameters or clear browser cache

### **Issue: Styles not applying**
**Solution**: Verify tenant branding data is loaded correctly

### **Issue: Database queries return empty**
**Solution**: Check RLS policies and tenant context

## 📝 Next Steps

1. **Set up production domains** when ready to deploy
2. **Configure SSL certificates** for custom domains
3. **Set up DNS records** for platform subdomains
4. **Test tenant isolation** thoroughly before launch
5. **Monitor tenant switching** in production logs 