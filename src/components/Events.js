import React from 'react';

export default function Events() {
  const securityEvents = [
    {
      id: 1,
      title: "Unauthorized API Call Detected",
      service: "AWS CloudTrail",
      region: "us-east-1",
      timestamp: "2 min ago",
      severity: "critical",
      icon: "api"
    },
    {
      id: 2,
      title: "Multiple Failed Login Attempts",
      service: "IAM",
      region: "us-west-2",
      timestamp: "15 min ago",
      severity: "high",
      icon: "login"
    },
    {
      id: 3,
      title: "Unusual Network Traffic Pattern",
      service: "GuardDuty",
      region: "eu-west-1",
      timestamp: "47 min ago",
      severity: "medium",
      icon: "network"
    },
    {
      id: 4,
      title: "S3 Bucket Policy Changed",
      service: "CloudTrail",
      region: "us-east-2",
      timestamp: "1 hour ago",
      severity: "low",
      icon: "storage"
    },
    {
      id: 5,
      title: "Database Access from New IP",
      service: "RDS",
      region: "ap-southeast-1",
      timestamp: "2 hours ago",
      severity: "medium",
      icon: "database"
    }
  ];

  // Function to get the appropriate icon component for each event type
  const getEventIcon = (iconType, severity) => {
    let bgColor = "";
    switch (severity) {
      case "critical":
        bgColor = "bg-red-100";
        break;
      case "high":
        bgColor = "bg-yellow-100";
        break;
      case "medium":
        bgColor = "bg-blue-100";
        break; 
      case "low":
        bgColor = "bg-green-100";
        break;
      default:
        bgColor = "bg-gray-100";
    }

    return (
      <div className={`p-3 rounded-full ${bgColor}`}>
        {iconType === "api" && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
        {iconType === "login" && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )}
        {iconType === "network" && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        )}
        {iconType === "storage" && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        )}
        {iconType === "database" && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
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

      <div className="space-y-0">
        {securityEvents.map((event, index) => (
          <div key={event.id} className={`py-4 ${index !== securityEvents.length - 1 ? 'border-b border-gray-200' : ''}`}>
            <div className="flex items-center">
              {getEventIcon(event.icon, event.severity)}
              <div className="ml-4 flex-grow">
                <div className="flex justify-between">
                  <h4 className="text-base font-medium text-gray-900">{event.title}</h4>
                  <span className="text-sm text-gray-500">{event.timestamp}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {event.service} - {event.region}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}