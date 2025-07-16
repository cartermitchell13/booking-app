import { CheckCircle, XCircle, Clock, Shield, Globe, AlertTriangle } from 'lucide-react';

interface DomainStatusDisplayProps {
  domain: string;
  subdomain: string;
  verificationStatus: 'pending' | 'verified' | 'failed' | 'expired' | null;
  sslStatus: 'pending' | 'provisioned' | 'active' | 'failed' | null;
  readyForTraffic?: boolean;
  verifiedAt?: string;
}

export function DomainStatusDisplay({
  domain,
  subdomain,
  verificationStatus,
  sslStatus,
  readyForTraffic = false,
  verifiedAt
}: DomainStatusDisplayProps) {
  const fullDomain = `${subdomain}.${domain}`;

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'verified':
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
      case 'provisioned':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'verified':
        return 'Domain Verified';
      case 'active':
        return 'SSL Active';
      case 'provisioned':
        return 'SSL Provisioned';
      case 'failed':
        return 'Failed';
      case 'expired':
        return 'Expired';
      case 'pending':
        return 'Pending';
      default:
        return 'Not Started';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'verified':
      case 'active':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'failed':
      case 'expired':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'pending':
      case 'provisioned':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getOverallStatus = () => {
    if (readyForTraffic && verificationStatus === 'verified' && sslStatus === 'active') {
      return { status: 'ready', text: 'Ready for traffic', color: 'text-green-700 bg-green-50 border-green-200' };
    }
    if (verificationStatus === 'failed' || sslStatus === 'failed') {
      return { status: 'failed', text: 'Setup failed', color: 'text-red-700 bg-red-50 border-red-200' };
    }
    if (verificationStatus === 'expired') {
      return { status: 'expired', text: 'Verification expired', color: 'text-red-700 bg-red-50 border-red-200' };
    }
    if (verificationStatus === 'verified' && sslStatus === 'pending') {
      return { status: 'ssl-pending', text: 'SSL provisioning', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
    }
    if (verificationStatus === 'pending') {
      return { status: 'verification-pending', text: 'Awaiting verification', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
    }
    return { status: 'not-started', text: 'Setup required', color: 'text-gray-700 bg-gray-50 border-gray-200' };
  };

  const overall = getOverallStatus();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-medium text-gray-900">
            {fullDomain}
          </h4>
          <p className="text-sm text-gray-600">Custom domain status</p>
        </div>
        <div className={`px-3 py-1 text-sm font-medium rounded-full border ${overall.color}`}>
          {overall.text}
        </div>
      </div>

      <div className="space-y-3">
        {/* Domain Verification Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">Domain Verification</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(verificationStatus)}
            <span className="text-sm text-gray-600">{getStatusText(verificationStatus)}</span>
          </div>
        </div>

        {/* SSL Certificate Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">SSL Certificate</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(sslStatus)}
            <span className="text-sm text-gray-600">{getStatusText(sslStatus)}</span>
          </div>
        </div>

        {/* Verification timestamp */}
        {verifiedAt && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Verified: {new Date(verifiedAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* Status-specific messages */}
        {overall.status === 'ready' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-800">
                Your custom domain is live! Customers can access your booking platform at {fullDomain}
              </span>
            </div>
          </div>
        )}

        {overall.status === 'ssl-pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-800">
                Domain verified! SSL certificate is being provisioned. This usually takes 1-2 minutes.
              </span>
            </div>
          </div>
        )}

        {(overall.status === 'failed' || overall.status === 'expired') && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-800">
                {overall.status === 'expired' 
                  ? 'Domain verification has expired. Please retry the verification process.'
                  : 'Domain setup failed. Please check your DNS configuration and try again.'
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 