import { useState, useCallback } from 'react';

export interface DomainVerificationResponse {
  verification_target: string;
  cname_source: string;
  cname_target: string;
  instructions: string;
  expires_at: string;
  ttl_recommendation: number;
}

export interface DomainStatusResponse {
  domain: string;
  subdomain: string;
  status: 'pending' | 'verified' | 'failed' | 'expired';
  dns_propagation: {
    cloudflare: 'resolved' | 'pending' | 'failed';
    google: 'resolved' | 'pending' | 'failed';
  };
  ssl_status: 'pending' | 'provisioned' | 'active' | 'failed';
  verified_at?: string;
}

export interface DomainActivationResponse {
  domain: string;
  final_cname: string;
  final_target: string;
  ssl_certificate: string;
  ready_for_traffic: boolean;
}

export function useDomainVerification() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateDomainVerification = useCallback(async (
    domain: string, 
    tenantId: string,
    subdomain: string = 'booking'
  ): Promise<DomainVerificationResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/domains/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain,
          subdomain,
          tenant_id: tenantId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate domain verification');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Domain verification failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkDomainStatus = useCallback(async (tenantId: string): Promise<DomainStatusResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/domains/verify?tenant_id=${tenantId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check domain status');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Domain status check failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retryDomainVerification = useCallback(async (tenantId: string): Promise<DomainStatusResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/domains/verify/${tenantId}/retry`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retry domain verification');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Domain verification retry failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDomainActivationStatus = useCallback(async (tenantId: string): Promise<DomainActivationResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/domains/activate/${tenantId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get domain activation status');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Domain activation status check failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    initiateDomainVerification,
    checkDomainStatus,
    retryDomainVerification,
    getDomainActivationStatus,
    clearError: () => setError(null),
  };
} 