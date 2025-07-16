import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FormData } from '@/types/onboarding';
import { useTenant } from '@/lib/tenant-context';

export function useOnboardingSubmission() {
  const router = useRouter();
  const { switchTenant } = useTenant();

  const handleSubmit = async (
    formData: FormData,
    validateStep: (step: number) => boolean,
    setIsLoading: (loading: boolean) => void,
    setError: (error: string | null) => void,
    setCurrentStep: (step: number) => void
  ) => {
    if (!validateStep(5)) return;
    
    setIsLoading(true);
    setError(null);

    if (!supabase) {
      setError('Service not configured. Please contact support.');
      setIsLoading(false);
      return;
    }

    try {
      // Create tenant record first
      // Generate slug based on domain type selection
      let slug: string;
      let domain: string | null = null;
      
      if (formData.useCustomDomain && formData.customDomain) {
        // For custom domains, generate slug from domain name
        slug = formData.customDomain.split('.')[0].toLowerCase();
        domain = formData.customDomain.toLowerCase();
      } else {
        // For platform subdomains, use the subdomain field
        slug = formData.subdomain?.toLowerCase() || formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
      }
      
      const tenantData = {
        name: formData.businessName,
        slug: slug,
        domain: domain,
        branding: {
          logo_url: formData.logo || null,
          primary_color: formData.primaryColor,
          secondary_color: formData.secondaryColor,
          font_family: 'Inter'
        },
        settings: {
          business_type: formData.businessType,
          description: formData.description,
          website: formData.website || null,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zip_code: formData.zipCode,
          phone: formData.phone || null
        },
        subscription_plan: formData.selectedPlan,
        subscription_status: 'trial',
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      };

      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert(tenantData)
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Update tenant context to newly created tenant
      // This ensures auth context will use correct tenant when fetching user data
      if (switchTenant) {
        await switchTenant(tenant.id);
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            tenant_id: tenant.id
          }
        }
      });

      if (authError) {
        // Clean up orphaned tenant record since user creation failed
        if (tenant) {
          await supabase.from('tenants').delete().eq('id', tenant.id);
        }
        
        // Handle case where user already exists
        if (authError.message.includes('User already registered')) {
          setError(
            `An account with email ${formData.email} already exists. ` +
            'Please sign in to your existing account or use a different email address.'
          );
          setIsLoading(false);
          
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }
        throw authError;
      }

      // Create user record in users table
      if (authData.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            tenant_id: tenant.id,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone || null,
            role: 'tenant_admin',
            email_verified: false
          });

        if (userError) {
          console.error('User creation error:', userError);
          // Don't throw here as the auth user and tenant were created successfully
        }
      }

      // Success! Move to final step
      setCurrentStep(6);
      
      // Redirect to dashboard after showing completion
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSubmit };
} 