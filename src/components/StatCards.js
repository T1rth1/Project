import React from 'react';

export default function StatCards() {
  const stats = [
    { 
      title: 'Total Threats Detected', 
      value: 247, 
      trend: 'up', 
      trendValue: '15% from last week',
      borderColor: 'border-blue-500'
    },
    { 
      title: 'Critical Threats', 
      value: 12, 
      trend: 'up', 
      trendValue: '3 new today',
      borderColor: 'border-red-500'
    },
    { 
      title: 'Resolved Incidents', 
      value: 189, 
      trend: 'up', 
      trendValue: '8 today',
      borderColor: 'border-green-500'
    },
    { 
      title: 'Pending Investigations', 
      value: 46, 
      trend: 'down', 
      trendValue: '5 resolved',
      borderColor: 'border-yellow-500'
    },
  ];
  
  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Security Dashboard</h1>
        <div className="flex gap-4">
          <div className="relative">
            <select className="border rounded-md px-3 py-2 pr-8 appearance-none">
              <option>Last 24 Hours</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          <div className="relative">
            <select className="border rounded-md px-3 py-2 pr-8 appearance-none">
              <option>All Regions</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-lg shadow p-5 relative overflow-hidden border-l-4 ${stat.borderColor}`}
          >
            <div className="mb-2 text-gray-600">{stat.title}</div>
            <div className="text-4xl font-bold mb-2">{stat.value}</div>
            <div className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
              {stat.trend === 'up' ? (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              )}
              {stat.trendValue}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}