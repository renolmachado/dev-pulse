import { useState } from 'react';

export const useHealthChecker = () => {
  const [health, setHealth] = useState<string>('');
  const [error, setError] = useState<string>('');

  const healthCheck = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error('NEXT_PUBLIC_API_URL is not set');
      }

      const health = await fetch(process.env.NEXT_PUBLIC_API_URL);
      setHealth(await health.json());
      setError('');
    } catch (error) {
      setError(JSON.stringify(error));
    }
  };

  return {
    health,
    error,
    healthCheck,
  };
};
