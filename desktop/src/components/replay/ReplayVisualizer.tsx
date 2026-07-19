import React, { useState, useEffect, useRef } from 'react';

const ReplayVisualizer: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 0.5x, etc.
  const [events, setEvents] = useState<Array<any>>([]);
  const animationRef = useRef<number | null>(null);
  
  // Mock data for demonstration - in real app, this would come from API/WebSocket
  useEffect(() => {
    // Generate mock events for demo
    const mockEvents = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      timestamp: i * 1000, // 1 second apart
      type: i % 3 === 0 ? 'ToolCalled' : i % 3 === 1 ? 'PromptReceived' : 'FileChanged',
      data: {
        description: `Event ${i + 1}`,
        details: `Details for event ${i + 1}`
      }
    }));
    setEvents(mockEvents);
  }, []);

  const handlePlayPause = () => {
    setIsPrevious(!isPlaying);
    if (!isPlaying) {
      startAnimation();
    } else {
      stopAnimation();
    }
  };

  const startAnimation = () => {
    const step = (timestamp: number) => {
      if (!animationRef.current) return;
      
      // Simple animation logic - in reality this would be based on actual event timestamps
      setCurrentTime(prev => {
        const newTime = prev + 16 * speed; // ~60fps
        if (newTime >= 20000) { // 20 seconds total
          stopAnimation();
          return 0;
        }
        return newTime;
      });
      
      animationRef.current = requestAnimationFrame(step);
    };
    
    animationRef.current = requestAnimationFrame(step);
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setCurrentTime(value);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpeed(parseFloat(e.target.value));
  };

  // Get current events based on time
  const currentEvents = events.filter(
    event => event.timestamp <= currentTime * 50 // Scale time to match our mock data
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Replay Visualizer
        </h2>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50"
              disabled={events.length === 0}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={() => {
                setCurrentTime(0);
                stopAnimation();
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md"
            >
              Restart
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Speed:</span>
            <select
              value={speed}
              onChange={handleSpeedChange}
              className="px-3 py-1 border border-gray-300 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentTime}s / 20s
            </span>
          </div>
        </div>
        
        {/* Timeline */}
        <div className="relative h-4 bg-gray-200 dark:bg-gray-600 rounded-full mb-4">
          <div
            className={`absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-200`}
            style={{ width: `${(currentTime / 20) * 100}%` }}
          ></div>
          <div className="absolute -top-2 -left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow" 
               style={{ left: `${(currentTime / 20) * 100}%` }}></div>
        </div>
        
        {/* Timeline markers */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>0s</span>
          <span>20s</span>
        </div>
      </div>
      
      {/* Events log */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Events Timeline
        </h2>
        <div className="max-h-96 overflow-y-auto space-y-2 p-4">
          {currentEvents.length === 0 ? (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              No events to display
            </p>
          ) : (
            currentEvents.map((event, index) => (
              <div key={event.id} className="p-3 border-l-4 border-blue-500 bg-gray-50 dark:bg-gray-700">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {event.type}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {event.data.description}
                </p>
                {event.data.details && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 break-all">
                    {event.data.details}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReplayVisualizer;
