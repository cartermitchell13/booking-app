'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const [testResult, setTestResult] = useState<string>('Not tested');
  const [isLoading, setIsLoading] = useState(false);

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing...');

    try {
      console.log('[Debug] Starting database connection test...');
      
      // Test 1: Simple count query
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout after 5 seconds')), 5000);
      });
      
      const queryPromise = supabase.from('tenants').select('count').limit(1);
      
      const result = await Promise.race([queryPromise, timeoutPromise]);
      const { data, error } = result as any;
      
      if (error) {
        setTestResult(`❌ Database connection failed: ${error.message}`);
        console.error('[Debug] Database connection failed:', error);
        return;
      }
      
      console.log('[Debug] Database connection successful:', data);
      
      // Test 2: Get specific tenant
      const tenantQuery = supabase
        .from('tenants')
        .select('*')
        .eq('slug', 'parkbus')
        .single();
      
      const tenantResult = await Promise.race([tenantQuery, timeoutPromise]);
      const { data: tenantData, error: tenantError } = tenantResult as any;
      
      if (tenantError) {
        setTestResult(`❌ Tenant query failed: ${tenantError.message}`);
        console.error('[Debug] Tenant query failed:', tenantError);
        return;
      }
      
      setTestResult(`✅ Database connection successful!\n🏢 Found tenant: ${tenantData.name}\n🎨 Primary color: ${tenantData.branding?.primary_color}`);
      console.log('[Debug] Tenant query successful:', tenantData);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setTestResult(`❌ Connection test failed: ${message}`);
      console.error('[Debug] Connection test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Connection Debug</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Database Connection</h2>
          
          <button
            onClick={testDatabaseConnection}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </button>
          
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Test Result:</h3>
            <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Environment Info:</h3>
            <div className="text-sm">
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
              <p><strong>Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'Server-side'}</p>
              <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side'}</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <ol className="text-sm list-decimal list-inside space-y-1">
              <li>Click "Test Connection" to test the database</li>
              <li>Open browser DevTools (F12) to see console logs</li>
              <li>Check both the result here and console logs</li>
              <li>This will help identify if it's a CORS, network, or configuration issue</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 