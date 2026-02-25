import { useState, useEffect } from 'react';

export function useGatewayStatus() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:18789/api/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Gateway returned ${response.status}`);
      }

      const json = await response.json();
      setData(json);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Gateway status fetch failed:', err);
      setError(err.message);
      // Keep last known good data if fetch fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus(); // Fetch immediately
    const interval = setInterval(fetchStatus, 30000); // Then every 30s
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, lastUpdated };
}
