'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugSupabasePage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, result: any, error?: any) => {
    setResults(prev => [...prev, {
      test,
      result,
      error,
      timestamp: new Date().toISOString()
    }]);
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    // Test 1: Basic connection test
    console.log('🔍 Starting Supabase debug tests...');
    addResult('Starting tests', 'Beginning Supabase connectivity tests');

    // Test 2: Environment variables
    addResult('Environment check', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
    });

    // Test 3: Check if Supabase client is properly initialized
    try {
      console.log('🔍 Testing Supabase client initialization...');
      addResult('Supabase client check', {
        clientExists: !!supabase,
        clientType: typeof supabase,
        hasFrom: typeof supabase.from === 'function',
        hasAuth: typeof supabase.auth === 'object',
        hasStorage: typeof supabase.storage === 'object'
      });
    } catch (error) {
      addResult('Supabase client check', null, error);
    }

    // Test 4: Simple query with detailed logging
    try {
      console.log('🔍 Testing simple query with detailed logging...');
      console.log('🔍 Supabase client:', supabase);
      
      const query = supabase.from('tenants');
      console.log('🔍 Query builder:', query);
      
      const selectQuery = query.select('id, slug, name');
      console.log('🔍 Select query:', selectQuery);
      
      const limitQuery = selectQuery.limit(1);
      console.log('🔍 Limit query:', limitQuery);
      
      console.log('🔍 About to execute query...');
      const result = await limitQuery;
      console.log('🔍 Query result:', result);
      
      addResult('Detailed tenant query', result);
    } catch (error) {
      console.error('🔍 Query error:', error);
      addResult('Detailed tenant query', null, error);
    }

    // Test 4: Products query
    try {
      console.log('🔍 Testing products query...');
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .limit(1);
      
      addResult('Simple products query', { data, error });
    } catch (error) {
      addResult('Simple products query', null, error);
    }

    // Test 5: Direct fetch to Supabase REST API
    try {
      console.log('🔍 Testing direct REST API call...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tenants?select=id,slug,name&limit=1`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      addResult('Direct REST API call', { status: response.status, data });
    } catch (error) {
      addResult('Direct REST API call', null, error);
    }

    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Debug Tests</h1>
      
      <button 
        onClick={runTests}
        disabled={loading}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Running Tests...' : 'Run Tests Again'}
      </button>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="border p-4 rounded">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{result.test}</h3>
              <span className="text-sm text-gray-500">{result.timestamp}</span>
            </div>
            
            {result.error ? (
              <div className="text-red-600">
                <strong>Error:</strong> {result.error.message || JSON.stringify(result.error)}
              </div>
            ) : (
              <div className="text-green-600">
                <strong>Success:</strong>
                <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
