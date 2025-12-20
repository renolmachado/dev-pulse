'use client';
import { useHealthChecker } from './useHealthChecker';

const HealthChecker = () => {
  const { healthCheck, health, error } = useHealthChecker();

  return (
    <>
      <button onClick={healthCheck}>Health Check</button>
      <p>Health: {health}</p>
      <p>Error: {error}</p>
    </>
  );
};

export default HealthChecker;
