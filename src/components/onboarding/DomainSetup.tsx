import { useState, useEffect } from 'react';
import { Globe, AlertCircle, Info } from 'lucide-react';
import { FormData } from '@/types/onboarding';
import { useDomainVerification } from '@/hooks/useDomainVerification';
import { CopyToClipboard } from './CopyToClipboard';
import { DNSPropagationChecker } from './DNSPropagationChecker';
import { DomainStatusDisplay } from './DomainStatusDisplay';

interface DomainSetupProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string | boolean | object | null) => void;
  tenantId?: string; // Will be available after account creation
}

export function DomainSetup({ formData, onInputChange, tenantId }: DomainSetupProps) {
  const [isVerificationStarted, setIsVerificationStarted] = useState(false);
  
  const {
    isLoading,
    error,
    initiateDomainVerification,
    checkDomainStatus,
    retryDomainVerification,
    clearError
  } = useDomainVerification();

  const handleStartDomainVerification = async () => {
    if (!formData.customDomain.trim() || !tenantId) {
      return;
    }

    clearError();
    const result = await initiateDomainVerification(formData.customDomain.trim(), tenantId);
    
    if (result) {
      setIsVerificationStarted(true);
      // Update form data with verification details
      onInputChange('verificationTarget', result.verification_target);
      onInputChange('cnameSource', result.cname_source);
      onInputChange('cnameTarget', result.cname_target);
      onInputChange('verificationInstructions', result.instructions);
      onInputChange('domainVerificationStatus', 'pending');
    }
  };

  const handleCheckStatus = async () => {
    if (!tenantId) return;

    clearError();
    const result = await checkDomainStatus(tenantId);
    
    if (result) {
      onInputChange('domainVerificationStatus', result.status);
      onInputChange('sslStatus', result.ssl_status);
      onInputChange('dnsPropagation', result.dns_propagation);
      if (result.verified_at) {
        onInputChange('domainVerified', true);
      }
    }
  };

  const handleRetryVerification = async () => {
    if (!tenantId) return;

    clearError();
    const result = await retryDomainVerification(tenantId);
    
    if (result) {
      onInputChange('domainVerificationStatus', result.status);
      onInputChange('sslStatus', result.ssl_status);
      onInputChange('dnsPropagation', result.dns_propagation);
    }
  };

  const validateDomain = (domain: string) => {
    if (!domain) return null;
    
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return 'Please enter a valid domain (e.g., yourcompany.com)';
    }
    
    // Prevent common mistakes
    if (domain.startsWith('www.')) {
      return 'Please enter your domain without "www." (e.g., yourcompany.com)';
    }
    
    if (domain.includes('booking.')) {
      return 'Please enter your main domain only (e.g., yourcompany.com). We\'ll create booking.yourcompany.com for you.';
    }
    
    return null;
  };

  const domainError = validateDomain(formData.customDomain);

  return (
    <div className="space-y-6">
      {/* Domain Setup Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Booking Platform URL *
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Choose how customers will access your booking platform. You can change this later.
        </p>
      </div>

      {/* Domain Options */}
      <div className="space-y-4">
        {/* Option 1: Platform Subdomain */}
        <div className={`border-2 rounded-xl p-4 transition-all ${
          !formData.useCustomDomain 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="domainType"
              checked={!formData.useCustomDomain}
              onChange={() => onInputChange('useCustomDomain', false)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-medium text-gray-800">Platform Subdomain</h4>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Quick setup with our platform domain. Perfect for getting started.
              </p>
              
              {!formData.useCustomDomain && (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={formData.subdomain}
                      onChange={(e) => onInputChange('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="flex-1 h-10 px-3 border border-gray-300 rounded-l-lg text-sm focus:ring-2 focus:border-transparent focus:ring-blue-500"
                      placeholder="yourcompany"
                    />
                    <div className="h-10 px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg flex items-center text-gray-600 text-sm">
                      .platform.com
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Your booking platform will be available at <strong>{formData.subdomain || 'yourcompany'}.platform.com</strong>
                  </p>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Option 2: Custom Domain */}
        <div className={`border-2 rounded-xl p-4 transition-all ${
          formData.useCustomDomain 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="domainType"
              checked={formData.useCustomDomain}
              onChange={() => onInputChange('useCustomDomain', true)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-medium text-gray-800">Custom Domain</h4>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Professional
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Use your own domain for a professional branded experience. Requires domain ownership verification.
              </p>
              
              {formData.useCustomDomain && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.customDomain}
                    onChange={(e) => onInputChange('customDomain', e.target.value.toLowerCase().trim())}
                    className={`w-full h-10 px-3 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${
                      domainError 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="yourcompany.com"
                    disabled={isVerificationStarted}
                  />
                  
                  {domainError && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs">{domainError}</span>
                    </div>
                  )}
                  
                  {!domainError && formData.customDomain && (
                    <p className="text-xs text-gray-500">
                      Your booking platform will be available at <strong>booking.{formData.customDomain}</strong>
                    </p>
                  )}

                  {!isVerificationStarted && !domainError && formData.customDomain && tenantId && (
                    <button
                      onClick={handleStartDomainVerification}
                      disabled={isLoading}
                      className="mt-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Starting verification...' : 'Start Domain Setup'}
                    </button>
                  )}

                  {!tenantId && (
                    <div className="flex items-center space-x-2 text-gray-500 mt-2">
                      <Info className="w-4 h-4" />
                      <span className="text-xs">Domain verification will begin after your account is created</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Domain Verification Process */}
      {formData.useCustomDomain && isVerificationStarted && formData.cnameSource && formData.cnameTarget && (
        <div className="space-y-6 border-t border-gray-200 pt-6">
          <h4 className="font-medium text-gray-800 mb-3">Domain Verification</h4>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">
              DNS Configuration Required
            </h4>
            <p className="text-sm text-yellow-800 mb-4">
              Add this CNAME record to your DNS provider to verify domain ownership:
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-yellow-900 mb-1">Record Type</label>
                <div className="bg-white border border-yellow-200 rounded p-2 text-sm">CNAME</div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-yellow-900 mb-1">Name / Host</label>
                <CopyToClipboard text={formData.cnameSource.split('.')[0]} />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-yellow-900 mb-1">Value / Target</label>
                <CopyToClipboard text={formData.cnameTarget} />
              </div>
              
              <div className="text-xs text-yellow-800">
                <p><strong>TTL:</strong> 300 seconds (5 minutes) - recommended during setup</p>
                <p className="mt-1">
                  <strong>Note:</strong> DNS changes can take 5-15 minutes to propagate. 
                  We'll check automatically once you've added the record.
                </p>
              </div>
            </div>
          </div>

          {/* DNS Propagation Checker */}
          <DNSPropagationChecker
            dnsPropagation={formData.dnsPropagation}
            cnameSource={formData.cnameSource}
            cnameTarget={formData.cnameTarget}
            onRefresh={handleCheckStatus}
            isLoading={isLoading}
          />

          {/* Domain Status Display */}
          {formData.domainVerificationStatus && (
            <DomainStatusDisplay
              domain={formData.customDomain}
              subdomain="booking"
              verificationStatus={formData.domainVerificationStatus}
              sslStatus={formData.sslStatus}
              readyForTraffic={formData.domainVerified && formData.sslStatus === 'active'}
            />
          )}

          {/* Retry button */}
          {formData.domainVerificationStatus === 'failed' && (
            <button
              onClick={handleRetryVerification}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Retrying...' : 'Retry Verification'}
            </button>
          )}

          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-800">{error}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 