import { useEffect, useState } from 'react';

function App() {
  const [healthStatus, setHealthStatus] = useState<string>('Checking backend status...');

  useEffect(() => {
    fetch('http://localhost:3000/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealthStatus(
          `Backend is connected! DB Status: ${data.services.database}`
        );
      })
      .catch(() => {
        setHealthStatus('Cannot connect to backend. Is it running on port 3000?');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">RouteWise</h1>
      <p className="text-xl text-gray-700 mb-8">
        India-only AI-assisted self-drive road-trip planning platform.
      </p>
      
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">System Status</h2>
        <div className={`p-3 rounded text-sm ${healthStatus.includes('Cannot') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {healthStatus}
        </div>
      </div>
    </div>
  );
}

export default App;
