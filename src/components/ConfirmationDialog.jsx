import React, { useEffect, useState } from 'react';

export default function StatCards() {
  const [stats, setStats] = useState([
    {
      title: 'Total Open Tickets',
      value: 0,
      trend: 'up',
      trendValue: '-- tickets from last week',
      borderColor: 'border-blue-500',
      icon: (
        <svg className="w-14 h-14 absolute right-1 bottom-1 opacity-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Critical Incidents',
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
      title: 'SLA Violations',
      value: 0,
      trend: 'up',
      trendValue: '-- breached SLAs',
      borderColor: 'border-orange-500',
      icon: (
        <svg className="w-14 h-14 absolute right-1 bottom-1 opacity-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Change Requests',
      value: 0,
      trend: 'down',
      trendValue: '-- pending approval',
      borderColor: 'border-yellow-500',
      icon: (
        <svg className="w-14 h-14 absolute right-1 bottom-1 opacity-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" clipRule="evenodd" />
        </svg>
      )
    },
  ]);

  const [timeRange, setTimeRange] = useState('Last 24 Hours');
  const [department, setDepartment] = useState('All Departments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  // const BASE_URL = import.meta.env.VITE_FRESH_SERVICE_API_URL;
  // const API_KEY = import.meta.env.VITE_FRESH_SERVICE_API_KEY;
  
  // const API_KEY= 
  // Fresh Service API configuration
  const FRESH_SERVICE_API = {
    BASE_URL: 'https://cloudthattechnologiespvtlt.freshservice.com/api/v2',
    HEADERS: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa('yVPm1NwCVI35Sz0uUEUS:X') // Replace with your actual API key or use environment variables
    }
  };

  useEffect(() => {
    fetchFreshServiceData();

    // Set up refresh interval (every 5 minutes)
    const intervalId = setInterval(fetchFreshServiceData, 5 * 60 * 1000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [timeRange, department]); // Re-fetch when time range or department changes

  const fetchFreshServiceData = async () => {
    setLoading(true);
    try {
      // Updated query parameters based on FreshService API documentation
      // Get time range filters
      const { startDate, endDate } = getTimeRangeFilter(timeRange);

      // Department filter (if applicable)
      const departmentFilter = getDepartmentFilter(department);

      // Build query parameters for tickets
      let ticketsParams = new URLSearchParams({
        include: 'stats' // Include ticket statistics
      });

      // Add time range filters
      if (startDate) ticketsParams.append('updated_since', startDate.toISOString());
      if (departmentFilter) ticketsParams.append('department_id', departmentFilter);

      // Build SLA violation params - we'll need to filter these later in JS
      // as we cannot use custom filters per the API error
      let slaParams = new URLSearchParams({
        include: 'stats',
        filter: 'new_and_my_open' // Using one of the allowed values
      });
      if (startDate) slaParams.append('updated_since', startDate.toISOString());
      if (departmentFilter) slaParams.append('department_id', departmentFilter);

      // Build changes filter
      let changesParams = new URLSearchParams();
      if (startDate) changesParams.append('updated_since', startDate.toISOString());
      if (departmentFilter) changesParams.append('department_id', departmentFilter);

      // Parallel API calls to get different ticket data
      const [ticketsRes, slaRes, changesRes] = await Promise.all([
        // Get tickets
        fetch(`${FRESH_SERVICE_API.BASE_URL}/tickets?${ticketsParams.toString()}`, {
          headers: FRESH_SERVICE_API.HEADERS
        }),
        // Get SLA violations
        fetch(`${FRESH_SERVICE_API.BASE_URL}/tickets?${slaParams.toString()}`, {
          headers: FRESH_SERVICE_API.HEADERS
        }),
        // Get change requests
        fetch(`${FRESH_SERVICE_API.BASE_URL}/changes?${changesParams.toString()}`, {
          headers: FRESH_SERVICE_API.HEADERS
        })
      ]);

      // Check if responses are successful
      if (!ticketsRes.ok) {
        console.error('Tickets API error:', await ticketsRes.json());
        throw new Error(`Tickets API error: ${ticketsRes.status}`);
      }
      if (!slaRes.ok) {
        console.error('SLA API error:', await slaRes.json());
        throw new Error(`SLA API error: ${slaRes.status}`);
      }
      if (!changesRes.ok) {
        console.error('Changes API error:', await changesRes.json());
        throw new Error(`Changes API error: ${changesRes.status}`);
      }

      const ticketsData = await ticketsRes.json();
      const slaData = await slaRes.json();
      const changesData = await changesRes.json();

      console.log('Fresh Service Data:', { tickets: ticketsData, sla: slaData, changes: changesData });

      // Count critical incidents (tickets with priority 4 - urgent)
      // FreshService API: 1 = Low, 2 = Medium, 3 = High, 4 = Urgent
      const criticalIncidents = ticketsData.tickets.filter(ticket => ticket.priority === 4).length;
      
      // Filter SLA violations manually since we can't use custom filters in the API
      const slaViolations = slaData.tickets.filter(ticket => ticket.sla?.sla_violated === true).length;
      
      // Count new tickets today
      const today = new Date().toISOString().split('T')[0];
      const newTicketsToday = ticketsData.tickets.filter(ticket => 
        new Date(ticket.created_at).toISOString().split('T')[0] === today
      ).length;

      // Count pending changes
      const pendingChanges = changesData.changes.filter(change => 
        change.status === 1 // Assuming 1 is pending_approval
      ).length;

      // Calculate percentages for trend values
      const totalTickets = ticketsData.tickets.length;
      const criticalPercentage = totalTickets > 0 ? Math.round((criticalIncidents / totalTickets) * 100) : 0;
      const slaPercentage = totalTickets > 0 ? Math.round((slaViolations / totalTickets) * 100) : 0;

      // Update stats with real data
      setStats([
        {
          title: 'Total Open Tickets',
          value: totalTickets,
          trend: totalTickets > 50 ? 'up' : 'down',
          trendValue: `${newTicketsToday} new today`,
          borderColor: 'border-blue-500',
          icon: (
            <svg className="w-14 h-14 absolute right-1 bottom-1 opacity-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
            </svg>
          )
        },
        {
          title: 'Critical Incidents',
          value: criticalIncidents,
          trend: 'up',
          trendValue: `${criticalPercentage}% of total`,
          borderColor: 'border-red-500',
          icon: (
            <svg className="w-14 h-14 absolute right-1 bottom-1 opacity-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        },
        {
          title: 'SLA Violations',
          value: slaViolations,
          trend: 'up',
          trendValue: `${slaPercentage}% of total`,
          borderColor: 'border-orange-500',
          icon: (
            <svg className="w-14 h-14 absolute right-1 bottom-1 opacity-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        },
        {
          title: 'Change Requests',
          value: changesData.changes.length,
          trend: pendingChanges > (changesData.changes.length / 2) ? 'up' : 'down',
          trendValue: `${pendingChanges} pending approval`,
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
      setError(null);
    } catch (err) {
      console.error('Error fetching Fresh Service data:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get time range filter based on selected option
  const getTimeRangeFilter = (timeRange) => {
    const now = new Date();
    let startDate = null;

    switch (timeRange) {
      case 'Last 1 Hour':
        startDate = new Date(now.getTime() - 1 * 60 * 60 * 1000);
        break;
      case 'Last 6 Hours':
        startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case 'Last 12 Hours':
        startDate = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        break;
      case 'Last 24 Hours':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'Last 7 Days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate: now };
  };

  // Helper function to get department ID
  const getDepartmentFilter = (departmentName) => {
    if (departmentName === 'All Departments') return null;
    
    const departmentMap = {
      'IT': 1,
      'HR': 2,
      'Finance': 3,
      'Marketing': 4,
      'Sales': 5,
      'Operations': 6
      // Add more departments as needed
    };
    
    return departmentMap[departmentName] || null;
  };

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  const handleDepartmentChange = (e) => {
    setDepartment(e.target.value);
  };

  // Format the last updated time
  const formattedLastUpdated = lastUpdated ?
    `Last updated: ${lastUpdated.toLocaleTimeString()} ${lastUpdated.toLocaleDateString()}` :
    'Updating...';

  return (
    <div className="w-full p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Fresh Service Dashboard</h1>
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

          {/* Department Selector */}
          <div className="relative">
            <select
              className="border rounded-md px-3 py-2 pr-8 appearance-none"
              value={department}
              onChange={handleDepartmentChange}
            >
              <option>All Departments</option>
              <option>IT</option>
              <option>HR</option>
              <option>Finance</option>
              <option>Marketing</option>
              <option>Sales</option>
              <option>Operations</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchFreshServiceData}
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