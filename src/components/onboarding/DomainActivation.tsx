'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, Globe, Copy, ExternalLink, RefreshCw } from 'lucide-react'

interface DomainActivationProps {
  tenantId: string
  customDomain?: string
}

interface ActivationStatus {
  status: 'pending_verification' | 'pending_ssl' | 'ready_for_activation' | 'active'
  message: string
  custom_domain?: string
  final_cname_target?: string
  ssl_status?: string
  instructions?: {
    step: string
    current_record: string
    new_record: string
    ttl_recommendation: string
  }
  test_url?: string
  next_step: string
  estimated_propagation?: string
}

export default function DomainActivation({ tenantId, customDomain }: DomainActivationProps) {
  const [status, setStatus] = useState<ActivationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const fetchActivationStatus = async () => {
    try {
      const response = await fetch(`/api/domains/activate/${tenantId}`)
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch activation status:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkActivation = async () => {
    setChecking(true)
    try {
      const response = await fetch(`/api/domains/activate/${tenantId}`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.status === 'activated') {
        setStatus(prev => prev ? { ...prev, status: 'active', message: data.message, test_url: data.test_url } : null)
      } else {
        await fetchActivationStatus() // Refresh full status
      }
    } catch (error) {
      console.error('Failed to check activation:', error)
    } finally {
      setChecking(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  useEffect(() => {
    fetchActivationStatus()
  }, [tenantId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-3 text-gray-600">Checking domain status...</span>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Check Domain Status</h3>
        <p className="text-red-600">Please try again or contact support if the issue persists.</p>
      </div>
    )
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case 'active':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'ready_for_activation':
        return <Globe className="h-6 w-6 text-blue-600" />
      default:
        return <Clock className="h-6 w-6 text-yellow-600" />
    }
  }

  const getStatusColor = () => {
    switch (status.status) {
      case 'active':
        return 'green'
      case 'ready_for_activation':
        return 'blue'
      case 'pending_ssl':
        return 'yellow'
      default:
        return 'gray'
    }
  }

  const color = getStatusColor()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status Header */}
      <div className={`p-6 bg-${color}-50 border border-${color}-200 rounded-lg`}>
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h2 className={`text-xl font-semibold text-${color}-800`}>
              Custom Domain Status
            </h2>
            <p className={`text-${color}-600 mt-1`}>{status.message}</p>
          </div>
        </div>
      </div>

      {/* Domain Information */}
      {status.custom_domain && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Domain Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Custom Domain
              </label>
              <div className="flex items-center space-x-2">
                <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono flex-1">
                  {status.custom_domain}
                </code>
                <button
                  onClick={() => copyToClipboard(status.custom_domain!, 'domain')}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Copy domain"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            {status.ssl_status && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SSL Certificate Status
                </label>
                <div className={`px-3 py-2 rounded text-sm ${
                  status.ssl_status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {status.ssl_status === 'active' ? '✅ Active' : `⏳ ${status.ssl_status}`}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activation Instructions */}
      {status.status === 'ready_for_activation' && status.instructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Final Step: Activate Your Domain
          </h3>
          
          <div className="space-y-4">
            <p className="text-blue-800">
              {status.instructions.step}
            </p>

            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-gray-900 mb-3">DNS Record Update</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Record (remove this)
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm font-mono flex-1">
                      {status.instructions.current_record}
                    </code>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Record (add this)
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded text-sm font-mono flex-1">
                      {status.instructions.new_record}
                    </code>
                    <button
                      onClick={() => copyToClipboard(status.instructions!.new_record, 'new_record')}
                      className={`p-2 ${
                        copied === 'new_record' 
                          ? 'text-green-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title="Copy new record"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {copied === 'new_record' && (
                    <p className="text-green-600 text-sm mt-1">✅ Copied to clipboard!</p>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  <strong>Recommended TTL:</strong> {status.instructions.ttl_recommendation}
                </div>
              </div>
            </div>

            {status.estimated_propagation && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-yellow-800 text-sm">
                  <strong>Estimated propagation time:</strong> {status.estimated_propagation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success State */}
      {status.status === 'active' && status.test_url && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            🎉 Your Domain is Live!
          </h3>
          
          <div className="space-y-4">
            <p className="text-green-800">
              Your custom domain is now active and ready for customers!
            </p>

            <div className="flex items-center space-x-4">
              <a
                href={status.test_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Your Live Site
              </a>
              
              <button
                onClick={() => copyToClipboard(status.test_url!, 'url')}
                className={`inline-flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors ${
                  copied === 'url' ? 'bg-green-50' : ''
                }`}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied === 'url' ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check Status Button */}
      {status.status !== 'active' && (
        <div className="flex justify-center">
          <button
            onClick={checkActivation}
            disabled={checking}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking...' : 'Check Domain Status'}
          </button>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Step</h3>
        <p className="text-gray-700">{status.next_step}</p>
      </div>
    </div>
  )
} 