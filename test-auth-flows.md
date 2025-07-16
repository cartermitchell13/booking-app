# Authentication Flow Testing Guide

## 🧪 **Test Plan Overview**

Test each authentication flow across different subdomains to ensure proper role-based routing and tenant context.

## 📝 **Test Users to Create**

### Super Admin
- **Email**: `admin@platform.com`
- **Password**: `admin123`
- **Role**: `super_admin`
- **Tenant**: None (platform-wide access)

### ParkBus Tenant Admin
- **Email**: `admin@parkbus.com`
- **Password**: `parkbus123`
- **Role**: `tenant_admin`
- **Tenant**: ParkBus

### ParkBus Customer
- **Email**: `customer@test.com`
- **Password**: `customer123`
- **Role**: `customer`
- **Tenant**: ParkBus

### Rocky Mountain Tenant Admin
- **Email**: `admin@rockymountain.com`
- **Password**: `rocky123`
- **Role**: `tenant_admin`
- **Tenant**: Rocky Mountain Tours

## 🔍 **Test Scenarios**

### **Test 1: Super Admin Login**
**URL**: `http://admin.localhost:3000/login`
**Expected**: 
- Shows "Platform Admin" branding (blue theme)
- Login with `admin@platform.com` / `admin123`
- Redirects to `/admin` dashboard
- Can see all tenants and users

### **Test 2: ParkBus Tenant Admin Login**
**URL**: `http://parkbus.localhost:3000/login`
**Expected**:
- Shows ParkBus branding (green theme)
- Login with `admin@parkbus.com` / `parkbus123`
- Redirects to `/dashboard`
- Can only see ParkBus data

### **Test 3: ParkBus Customer Login**
**URL**: `http://parkbus.localhost:3000/login`
**Expected**:
- Shows ParkBus branding (green theme)
- Login with `customer@test.com` / `customer123`
- Redirects to `/account`
- Can only see their own bookings

### **Test 4: Cross-Domain Login (Should Fail)**
**URL**: `http://rockymountain.localhost:3000/login`
**Expected**:
- Shows Rocky Mountain branding
- Try login with `customer@test.com` (ParkBus customer)
- Should fail with "Account not found for this domain"

### **Test 5: Registration Flows**

#### Customer Registration
**URL**: `http://parkbus.localhost:3000/register`
**Expected**:
- Shows ParkBus branding
- Form should create customer role
- Redirects to `/account`

#### Business Owner Registration
**URL**: `http://localhost:3000/register/operator`
**Expected**:
- 6-step onboarding wizard
- Creates new tenant + tenant_admin user
- Redirects to success page

## 🚀 **Test Execution Steps**

### Step 1: Create Test Users
1. Go to `http://parkbus.localhost:3000/register` 
2. Create customer account: `customer@test.com`
3. Use admin panel to manually create super admin and tenant admin accounts

### Step 2: Test Login Flows
1. Test super admin login on `admin.localhost:3000`
2. Test tenant admin login on `parkbus.localhost:3000` 
3. Test customer login on `parkbus.localhost:3000`
4. Test cross-domain restrictions

### Step 3: Test Registration Flows
1. Test customer registration on tenant subdomain
2. Test business owner registration on platform domain

## ✅ **Success Criteria**

- [ ] Super admins can login from any domain → go to `/admin`
- [ ] Tenant admins can login from any domain → auto-switch context → go to `/dashboard`
- [ ] Customers can only login on their tenant domain → go to `/account`
- [ ] Cross-domain customer login fails with clear error message
- [ ] Registration creates correct user roles
- [ ] Branding appears correctly based on domain context
- [ ] Role-based routing works correctly after login

## 🐛 **Issues to Watch For**

- Infinite redirect loops
- Incorrect tenant context switching
- Authentication state not persisting
- Route guards not working properly
- Registration creating wrong user roles
- Cross-domain authentication bypassing restrictions

## 📊 **Test Results**

Record results for each test scenario:

| Test | URL | Status | Notes |
|------|-----|--------|-------|
| Super Admin Login | admin.localhost:3000 | ⏳ | |
| ParkBus Admin Login | parkbus.localhost:3000 | ⏳ | |
| ParkBus Customer Login | parkbus.localhost:3000 | ⏳ | |
| Cross-Domain Restriction | rockymountain.localhost:3000 | ⏳ | |
| Customer Registration | parkbus.localhost:3000/register | ⏳ | |
| Business Registration | localhost:3000/register/operator | ⏳ | | 