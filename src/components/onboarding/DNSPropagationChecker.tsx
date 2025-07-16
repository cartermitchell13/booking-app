import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface DNSPropagationData {
  cloudflare: 'resolved' | 'pending' | 'failed';
  google: 'resolved' | 'pending' | 'failed';
}

interface DNSPropagationCheckerProps {
  dnsPropagation: DNSPropagationData | null;
  cnameSource: string;
  cnameTarget: string;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function DNSPropagationChecker({ 
  dnsPropagation, 
  cnameSource, 
  cnameTarget, 
  onRefresh, 
  isLoading = false 
}: DNSPropagationCheckerProps) {
  const getStatusIcon = (status: 'resolved' | 'pending' | 'failed') => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: 'resolved' | 'pending' | 'failed') => {
    switch (status) {
      case 'resolved':
        return 'Resolved';
      case 'failed':
        return 'Failed';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status: 'resolved' | 'pending' | 'failed') => {
    switch (status) {
      case 'resolved':
        return 'text-green-700 bg-green-50';
      case 'failed':
        return 'text-red-700 bg-red-50';
      case 'pending':
      default:
        return 'text-yellow-700 bg-yellow-50';
    }
  };

  if (!dnsPropagation) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">
            DNS Propagation Status
          </h4>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Check</span>
          </button>
        </div>
        <p className="text-sm text-gray-600">Click "Check" to verify DNS propagation status</p>
      </div>
    );
  }

  const allResolved = dnsPropagation.cloudflare === 'resolved' && dnsPropagation.google === 'resolved';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">
          DNS Propagation Status
        </h4>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div className="text-sm text-gray-600">
          Checking: <span className="font-mono">{cnameSource} → {cnameTarget}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(dnsPropagation.cloudflare)}
              <span className="text-sm font-medium">Cloudflare DNS (1.1.1.1)</span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dnsPropagation.cloudflare)}`}>
              {getStatusText(dnsPropagation.cloudflare)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(dnsPropagation.google)}
              <span className="text-sm font-medium">Google DNS (8.8.8.8)</span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dnsPropagation.google)}`}>
              {getStatusText(dnsPropagation.google)}
            </span>
          </div>
        </div>
      </div>

      {allResolved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-800">
              DNS propagation complete! Your domain is ready.
            </span>
          </div>
        </div>
      )}

      {!allResolved && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">DNS propagation in progress</p>
            <p>This can take 5-15 minutes after adding the CNAME record. We'll continue checking automatically.</p>
          </div>
        </div>
      )}
    </div>
  );
} 