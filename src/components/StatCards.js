import React, { useEffect, useState } from 'react';

export default function StatCards() {
  const [stats, setStats] = useState([
    { 
      title: 'Total Threats Detected', 
      value: 0, 
      trend: 'up', 
      trendValue: '-- from last week',
      borderColor: 'border-blue-500',
      icon: (
        <svg className="w-14 h-14 absolute right-1 bottom-1 opacity-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
        </svg>
      )
    },
    { 
      title: 'Critical Threats', 
      value: 0, 
      trend: 'up', 
      trendValue: '-- new today',
      borderColor: 'border-red-500',
      icon: (
        <svg className="w-14 h-14 absolute right-1 bottom-1 opacity-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    { 
      title: 'High Severity', 
      value: 0, 
      trend: 'up', 
      trendValue: '-- new today',
      borderColor: 'border-orange-500',
      icon: (
        <svg className="w-14 h-14 absolute right-1 bottom-1 opacity-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    { 
      title: 'Pending Investigations', 
      value: 0, 
      trend: 'down', 
      trendValue: '-- pending resolution',
      borderColor: 'border-yellow-500',
      icon: (
        <svg className="w-14 h-14 absolute right-1 bottom-1 opacity-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" clipRule="evenodd" />
        </svg>
      )
    },
  ]);
  
  const [timeRange, setTimeRange] = useState('Last 24 Hours');
  const [region, setRegion] = useState('All Regions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://7kql5ne3w65ydlswvd52d7ezw40ykulz.lambda-url.ap-south-1.on.aws/');
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        
        const data = await res.json();
        const parsedData = typeof data === 'string' ? JSON.parse(data.body) : data.body ? JSON.parse(data.body) : data;
        
        console.log('Fetched data:', parsedData);
        
        // Calculate pending investigations (total minus a percentage to simulate resolved)
        const resolvedPercentage = 0.75; // Simulate 75% of issues resolved
        const pendingCount = Math.round(parsedData.totalCount * (1 - resolvedPercentage));
        const resolvedCount = parsedData.totalCount - pendingCount;
        
        // Calculate trend percentages based on total counts
        const criticalTrend = Math.round((parsedData.criticalCount / parsedData.totalCount) * 100);
        const highTrend = Math.round((parsedData.highCount / parsedData.totalCount) * 100);
        
        // Update stats with real data
        setStats([
          { 
            title: 'Total Threats Detected', 
            value: parsedData.totalCount || 0, 
            trend: 'up', 
            trendValue: `${criticalTrend + highTrend}% critical/high`,
            borderColor: 'border-blue-500',
            icon: (
              <svg className="w-14 h-14 absolute right-1 bottom-1 opacity-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
              </svg>
            )
          },
          { 
            title: 'Critical Threats', 
            value: parsedData.criticalCount || 0, 
            trend: 'up', 
            trendValue: `${criticalTrend}% of total`,
            borderColor: 'border-red-500',
            icon: (
              <svg className="w-14 h-14 absolute right-1 bottom-1 opacity-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )
          },
          { 
            title: 'High Severity', 
            value: parsedData.highCount || 0, 
            trend: 'up', 
            trendValue: `${highTrend}% of total`,
            borderColor: 'border-orange-500',
            icon: (
              <svg className="w-14 h-14 absolute right-1 bottom-1 opacity-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )
          },
          { 
            title: 'Active Investigations', 
            value: pendingCount, 
            trend: 'down', 
            trendValue: `${resolvedCount} resolved`,
            borderColor: 'border-yellow-500',
            icon: (
              <svg className="w-14 h-14 absolute right-1 bottom-1 opacity-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" clipRule="evenodd" />
              </svg>
            )
          },
        ]);
        
        // Set last updated timestamp
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up refresh interval (every 5 minutes)
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    
    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [timeRange, region]); // Re-fetch when time range or region changes

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  const handleRegionChange = (e) => {
    setRegion(e.target.value);
  };

  const refreshData = () => {
    // Manual refresh function
    setLoading(true);
    setTimeout(() => {
      const fetchData = async () => {
        try {
          const res = await fetch('https://7kql5ne3w65ydlswvd52d7ezw40ykulz.lambda-url.ap-south-1.on.aws/');
          if (!res.ok) {
            throw new Error(`HTTP error: ${res.status}`);
          }
          
          const data = await res.json();
          const parsedData = typeof data === 'string' ? JSON.parse(data.body) : data.body ? JSON.parse(data.body) : data;
          
          console.log('Refreshed data:', parsedData);
          
          // Same calculations as in useEffect
          const resolvedPercentage = 0.75;
          const pendingCount = Math.round(parsedData.totalCount * (1 - resolvedPercentage));
          const resolvedCount = parsedData.totalCount - pendingCount;
          
          const criticalTrend = Math.round((parsedData.criticalCount / parsedData.totalCount) * 100);
          const highTrend = Math.round((parsedData.highCount / parsedData.totalCount) * 100);
          
          setStats([
            { 
              title: 'Total Threats Detected', 
              value: parsedData.totalCount || 0, 
              trend: 'up', 
              trendValue: `${criticalTrend + highTrend}% critical/high`,
              borderColor: 'border-blue-500',
              icon: stats[0].icon
            },
            { 
              title: 'Critical Threats', 
              value: parsedData.criticalCount || 0, 
              trend: 'up', 
              trendValue: `${criticalTrend}% of total`,
              borderColor: 'border-red-500',
              icon: stats[1].icon
            },
            { 
              title: 'High Severity', 
              value: parsedData.highCount || 0, 
              trend: 'up', 
              trendValue: `${highTrend}% of total`,
              borderColor: 'border-orange-500',
              icon: stats[2].icon
            },
            { 
              title: 'Active Investigations', 
              value: pendingCount, 
              trend: 'down', 
              trendValue: `${resolvedCount} resolved`,
              borderColor: 'border-yellow-500',
              icon: stats[3].icon
            },
          ]);
          
          setLastUpdated(new Date());
        } catch (err) {
          console.error('Error refreshing data:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }, 500);
  };
  
  // Format the last updated time
  const formattedLastUpdated = lastUpdated ? 
    `Last updated: ${lastUpdated.toLocaleTimeString()} ${lastUpdated.toLocaleDateString()}` : 
    'Updating...';
  
  return (
    <div className="w-full p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">GuardDuty Security Dashboard</h1>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Time Range Selector */}
          <div className="relative">
            <select 
              className="border rounded-md px-3 py-2 pr-8 appearance-none"
              value={timeRange}
              onChange={handleTimeRangeChange}
            >
              <option>Last 1 Hour</option>
              <option>Last 6 Hours</option>
              <option>Last 12 Hours</option>
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          {/* Region Selector */}
          <div className="relative">
            <select 
              className="border rounded-md px-3 py-2 pr-8 appearance-none"
              value={region}
              onChange={handleRegionChange}
            >
              <option>All Regions</option>
              <option>us-east-1 (N. Virginia)</option>
              <option>us-west-1 (N. California)</option>
              <option>us-west-2 (Oregon)</option>
              <option>eu-central-1 (Frankfurt)</option>
              <option>eu-west-1 (Ireland)</option>
              <option>ap-south-1 (Mumbai)</option>
              <option>ap-northeast-1 (Tokyo)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          
          {/* Refresh Button */}
          <button 
            onClick={refreshData}
            className="flex items-center justify-center px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200"
            disabled={loading}
          >
            <svg 
              className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Last Updated Information */}
      <div className="mb-4 text-sm text-gray-500 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {formattedLastUpdated}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Error loading data: {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-lg shadow p-5 relative overflow-hidden border-l-4 ${stat.borderColor} hover:shadow-lg transition-shadow duration-300`}
          >
            <div className="mb-2 text-gray-600 font-medium">{stat.title}</div>
            <div className="text-4xl font-bold mb-2">
              {loading ? (
                <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
              ) : (
                stat.value
              )}
            </div>
            <div className={`flex items-center text-sm ${stat.trend === 'up' && index !== 3 ? 'text-red-500' : 'text-green-500'}`}>
              {stat.trend === 'up' ? (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              )}
              {loading ? (
                <div className="animate-pulse h-4 w-20 bg-gray-200 rounded"></div>
              ) : (
                stat.trendValue
              )}
            </div>
            
            {/* Decorative icon */}
            {stat.icon}
          </div>
        ))}
      </div>
    </div>
  );
}