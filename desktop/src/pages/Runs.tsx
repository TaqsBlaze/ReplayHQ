import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Run } from '../types';

const Runs: React.FC = () => {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        setLoading(true);
        const data = await api.getRuns();
        setRuns(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setRuns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();

    // Optionally, set up an interval to refresh every 10 seconds
    const interval = setInterval(fetchRuns, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-500">Loading runs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
        <h3 className="text-sm font-medium text-red-800 dark:text-red-100">Error:</h3>
        <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Runs
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              // Refresh manually
              window.location.reload();
            }}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Refresh
          </button>
          <button
            onClick={() => navigate('/diff')}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
          >
            Diff Viewer
          </button>
        </div>
      </div>

      {runs.length === 0 ? (
        <p className="text-center py-8 text-gray-500 dark:text-gray-400">
          No runs found.
        </p>
      ) : (
        <div className="space-y-4">
          {runs.map((run) => (
            <div 
              key={run.id} 
              onClick={() => navigate(`/replay/${run.id}`)}
              className="cursor-pointer border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {run.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Agent: {run.agent} | Status: {run.status}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    ID: {run.id.substring(0, 8)}...
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(run.startTime).toLocaleTimeString()} -
                    {new Date(run.endTime).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {run.duration.toFixed(2)}s
                  </p>
                </div>
              </div>
              <div className="mt-3 flex space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the row click
                    // Navigate to the run detail page (we don't have it yet, but we can use the replay)
                    navigate(`/replay/${run.id}`);
                  }}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Replay
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the row click
                    if (window.confirm(`Delete run ${run.id}?`)) {
                      // TODO: implement delete
                      alert('Delete not implemented yet');
                    }
                  }}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Runs;
