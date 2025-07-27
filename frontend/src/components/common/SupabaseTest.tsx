import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const SupabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [error, setError] = useState<string | null>(null);
  const [tableCount, setTableCount] = useState<number | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test basic connection by querying the households table
      const { data, error } = await supabase
        .from('households')
        .select('*', { count: 'exact' });

      if (error) {
        throw error;
      }

      setConnectionStatus('connected');
      setTableCount(data?.length || 0);
    } catch (err) {
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="bg-background-secondary p-4 rounded-lg border border-border mb-4">
      <h3 className="text-lg font-semibold mb-2">🔗 Supabase Connection Test</h3>
      
      {connectionStatus === 'testing' && (
        <div className="flex items-center text-text-secondary">
          <div className="loading-spinner mr-2"></div>
          Testing connection...
        </div>
      )}

      {connectionStatus === 'connected' && (
        <div className="text-accent-green">
          ✅ Connected successfully! Found {tableCount} households in database.
        </div>
      )}

      {connectionStatus === 'error' && (
        <div className="text-accent-red">
          ❌ Connection failed: {error}
        </div>
      )}

      <button 
        onClick={testConnection}
        className="btn btn-sm btn-secondary mt-2"
        disabled={connectionStatus === 'testing'}
      >
        Test Again
      </button>
    </div>
  );
};

export default SupabaseTest;
