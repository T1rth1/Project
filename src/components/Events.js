import React, { useEffect, useState } from 'react';

export default function Events() {
  const [securityEvents, setSecurityEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://52zcqkb3ofajjnrfkma2serjzq0siukg.lambda-url.ap-south-1.on.aws/');
        if (!response.ok) {
          throw new Error('Failed to fetch security events');
        }
        const data = await response.json();
        // console.log("data",data);
        setSecurityEvents(data?.liveEvents || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getEventIcon = (type) => {
    let color = '';
    switch (type) {
      case 'warning':
        color = 'bg-yellow-100 text-yellow-600';
        break;
      case 'error':
        color = 'bg-red-100 text-red-600'
        break;
      case 'info':
      default:
        color = 'bg-blue-100 text-blue-600';
    }

    return (
      <div className={`p-2 rounded-full ${color}`}>
        {type === 'error' ? (
          // Error icon (e.g., X Circle)
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l-6 6m0-6l6 6" />
          </svg>
        ) : type === 'warning' ? (
          // Warning icon (Triangle Exclamation)
          <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ) : (
          // Info icon (Circle Info)
          <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
          </svg>
        )}
      </div>

    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Live Security Events</h3>
        <button className="flex items-center bg-white hover:bg-gray-50 text-gray-700 px-3 py-1 border rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-500 flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-0">
          {securityEvents.map((event, index) => (
            <div key={index} className={`py-4 ${index !== securityEvents.length - 1 ? 'border-b border-gray-200' : ''}`}>
              <div className="flex items-start">
                {getEventIcon(event.type)}
                <div className="ml-4 flex-grow">
                  <div className="flex justify-between">
                    <h4 className="text-base font-medium text-gray-900">{event.title}</h4>
                    <span className="text-sm text-gray-500 whitespace-nowrap">{event.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Source: {event.source}</p>
                  <p className="text-sm text-gray-600">Region: {event.region}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
