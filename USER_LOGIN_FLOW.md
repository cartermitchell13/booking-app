# User Login Flow & Access Guide

## 🎭 **3 Types of Users**

### 1. **Super Admin** (Platform Owner)
- **Who**: You, the platform operator
- **Access**: Full system control, all tenants
- **Login URL**: `admin.yourplatform.com/login` OR `yourplatform.com/login?platform=true`
- **After Login**: `/admin` - Super Admin Dashboard
- **What They See**: 
  - All tenants list
  - All users across all tenants
  - Platform settings
  - System-wide analytics
  - Can switch between tenant contexts

### 2. **Tenant Admin/Staff** (Business Owner)
- **Who**: ParkBus owner, Rocky Mountain Tours manager, etc.
- **Access**: Their tenant's data only
- **Login URL**: `parkbus.yourplatform.com/login` OR `booking.parkbus.com/login`
- **After Login**: `/dashboard` - Tenant Dashboard
- **What They See**:
  - Their trips and bookings
  - Their customers
  - Their settings and branding
  - Their analytics
  - Billing/subscription info

### 3. **Customer** (Travelers)
- **Who**: People booking trips
- **Access**: Their bookings only on specific tenant
- **Login URL**: `parkbus.yourplatform.com/login` OR `booking.parkbus.com/login`
- **After Login**: `/account` - Customer Account
- **What They See**:
  - Their bookings
  - Their profile
  - Trip history
  - Branded experience for that company

## 🌐 **Login Scenarios Explained**

### **Scenario 1: Super Admin Login**
```
URL: admin.yourplatform.com/login
User: admin@yourplatform.com
Role: super_admin
Result: Redirected to /admin
See: All tenants, all users, platform management
```

### **Scenario 2: Tenant Admin Login**
```
URL: parkbus.yourplatform.com/login
User: owner@parkbus.com  
Role: tenant_admin
Result: Redirected to /dashboard
See: ParkBus dashboard, ParkBus branding, ParkBus data only
```

### **Scenario 3: Customer Login**
```
URL: parkbus.yourplatform.com/login
User: john@gmail.com
Role: customer
Result: Redirected to /account
See: ParkBus-branded account page, their ParkBus bookings
```

### **Scenario 4: Wrong Customer Domain**
```
URL: rockymountain.yourplatform.com/login
User: john@gmail.com (has ParkBus account)
Role: customer
Result: ERROR - "Account not found for this domain"
Fix: Go to parkbus.yourplatform.com/login instead
```

## 🔐 **Authentication Logic**

### **Super Admin**
- ✅ Can login from ANY domain
- ✅ Always redirected to `/admin`
- ✅ Can switch tenant contexts to impersonate
- ✅ Full platform access

### **Tenant Admin**
- ✅ Can login from ANY domain
- ✅ Auto-switches to their tenant context
- ✅ Always redirected to `/dashboard`
- ✅ Only sees their tenant's data

### **Customer**
- ❌ Domain-restricted login
- ❌ Must login on correct tenant domain
- ✅ Sees branded experience for that tenant
- ✅ Only sees their bookings for that tenant

## 🎨 **What Each User Sees**

### **Super Admin Dashboard** (`/admin`)
```
┌─────────────────────────────────────┐
│ 🏢 PLATFORM ADMIN                   │
├─────────────────────────────────────┤
│ Tenants: 127 active                 │
│ Users: 2,456 total                  │
│ Revenue: $45,678 this month         │
│                                     │
│ Recent Signups:                     │
│ • ParkBus (Enterprise)              │
│ • Rocky Mountain Tours (Pro)        │
│ • Adventure Bus Co (Starter)        │
│                                     │
│ [Manage Tenants] [Manage Users]     │
│ [Platform Settings] [Support]       │
└─────────────────────────────────────┘
```

### **Tenant Dashboard** (`/dashboard`)
```
┌─────────────────────────────────────┐
│ 🚌 PARKBUS DASHBOARD                │
├─────────────────────────────────────┤
│ Bookings: 45 this month             │
│ Revenue: $12,340                    │
│ Customers: 234 active               │
│                                     │
│ Recent Bookings:                    │
│ • Vancouver → Whistler (Dec 15)     │
│ • Calgary → Banff (Dec 18)          │
│                                     │
│ [Manage Trips] [Customers]          │
│ [Settings] [Branding]               │
└─────────────────────────────────────┘
```

### **Customer Account** (`/account`)
```
┌─────────────────────────────────────┐
│ 🎿 Welcome to ParkBus               │
├─────────────────────────────────────┤
│ Hi John! Your upcoming trips:       │
│                                     │
│ Vancouver → Whistler                │
│ Dec 15, 2024 • 7:00 AM             │
│ [View Ticket] [Modify]              │
│                                     │
│ Calgary → Banff                     │
│ Dec 18, 2024 • 9:00 AM             │
│ [View Ticket] [Cancel]              │
│                                     │
│ [Book New Trip] [Profile]           │
└─────────────────────────────────────┘
```

## 📱 **Development Testing**

### **Current URLs (localhost)**
```bash
# Super Admin
localhost:3000/admin/login

# Tenant Admin (ParkBus)
localhost:3000/login?tenant=parkbus

# Customer (ParkBus)
localhost:3000/login?tenant=parkbus

# Different Tenant
localhost:3000/login?tenant=rockymountain
```

### **Production URLs (when deployed)**
```bash
# Super Admin
admin.yourplatform.com/login

# Tenant Admin (ParkBus)
parkbus.yourplatform.com/login
# OR
booking.parkbus.com/login

# Customer (ParkBus)  
parkbus.yourplatform.com/login
# OR
booking.parkbus.com/login

# Different Tenant
rockymountain.yourplatform.com/login
```

## 🔄 **Login Redirect Logic**

```typescript
// After successful login:
if (user.role === 'super_admin') {
  redirect('/admin');           // Platform admin dashboard
}

if (user.role === 'tenant_admin' || user.role === 'tenant_staff') {
  switchTenant(user.tenant_id); // Switch to their tenant
  redirect('/dashboard');       // Tenant dashboard
}

if (user.role === 'customer') {
  if (user.tenant_id !== current_tenant.id) {
    error('Wrong domain');      // Must be on correct tenant domain
  }
  redirect('/account');         // Customer account
}
```

## 🎯 **Key Points**

1. **Same Login Page** - All users go to `/login` but see different results
2. **Domain Matters** - Customers must be on the right tenant domain
3. **Automatic Routing** - System detects user role and redirects appropriately
4. **Tenant Branding** - Login page shows tenant colors/logo for tenant domains
5. **Context Switching** - Admins can switch between tenant contexts

## 🚨 **Common Confusions**

❌ **"Where do tenant admins register?"**
✅ During tenant onboarding, they create their admin account

❌ **"Can customers login on any domain?"**  
✅ No, customers are domain-restricted to their tenant

❌ **"How do I test different user types?"**
✅ Use the Dev Tenant Switcher + create test accounts

❌ **"What if someone has accounts on multiple tenants?"**
✅ They need separate accounts - each tenant is isolated 