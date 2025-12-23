'use client';
import { useHealthChecker } from './useHealthChecker';

export const HealthChecker = () => {
  const { healthCheck, health, error } = useHealthChecker();

  return (
    <>
      <button onClick={healthCheck}>Health Check</button>
      <p>Health: {JSON.stringify(health)}</p>
      <p>Error: {JSON.stringify(error)}</p>
    </>
  );
};
