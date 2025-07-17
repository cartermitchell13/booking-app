# Supabase Configuration

## Required Environment Variables

Make sure your `.env.local` file contains:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://zsdkqmlhnffoidwyygce.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZGtxbWxobmZmb2lkd3l5Z2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MjY1MDAsImV4cCI6MjA2NTEwMjUwMH0.wBz8qK_lmSgX-c2iVlGE36bdaGMWzxbEdd81tQZjBxo
```

## Available Test Users for Park Bus Tenant

- **Admin**: `admin@parkbus.ca` (tenant_admin role)
- **Super Admin**: `testuser@gmail.com` (super_admin role)
- **Customer**: `customer@example.com` (customer role)

## Debug Steps

1. Verify environment variables are correctly set
2. Run the authentication test script: `node debug-auth.js`
3. Check browser console for detailed error messages
4. Test the debug page at `/debug` to verify database connection 