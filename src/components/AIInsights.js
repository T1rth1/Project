import React from 'react';

export default function AISecurityInsights() {
  const insights = [
    {
      id: 1,
      title: "Potential Data Exfiltration Risk",
      description: "Unusual data transfer pattern detected from EC2 instance i-0abc123def456. 2.3GB of data transferred to external IP 203.0.113.42 within the last hour.",
      source: "Source: SageMaker Anomaly Detection + GuardDuty",
      icon: "info",
      color: "red",
      action: {
        label: "Investigate",
        type: "danger"
      }
    },
    {
      id: 2,
      title: "IAM Role Permission Anomaly",
      description: "IAM role 'lambda-execution-role' was modified with unusually broad S3 permissions (s3:*). This deviates from least privilege best practices.",
      source: "Source: CloudTrail + Comprehend NLP Analysis",
      icon: "user",
      color: "yellow",
      action: {
        label: "Review Changes",
        type: "secondary"
      }
    },
    {
      id: 3,
      title: "Login Attempt Pattern",
      description: "Detected a 43% increase in failed login attempts over the past 24 hours. Pattern suggests credential stuffing attack targeting console login.",
      source: "Source: CloudWatch + SageMaker Prediction",
      icon: "chart",
      color: "blue",
      action: {
        label: "View Analysis",
        type: "primary"
      }
    }
  ];

  // Function to render the icon based on type
  const renderIcon = (iconType, color) => {
    const iconColor = `text-${color}-600`;
    
    switch (iconType) {
      case "info":
        return (
          <span className={`inline-flex items-center justify-center rounded-full ${iconColor}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        );
      case "user":
        return (
          <span className={`inline-flex items-center justify-center rounded-full ${iconColor}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
        );
      case "chart":
        return (
          <span className={`inline-flex items-center justify-center rounded-full ${iconColor}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </span>
        );
      default:
        return null;
    }
  };

  // Function to render button based on type
  const renderButton = (label, type) => {
    switch (type) {
      case "danger":
        return (
          <button className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {label}
          </button>
        );
      case "primary":
        return (
          <button className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {label}
          </button>
        );
      case "secondary":
        return (
          <button className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {label}
          </button>
        );
      default:
        return <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">{label}</button>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">AI Security Insights</h3>
        <button className="flex items-center text-gray-700 px-3 py-1 hover:bg-gray-100 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {insights.map((insight) => (
          <div 
            key={insight.id} 
            className={`relative rounded-lg border-l-4 border-${insight.color}-500 bg-white shadow p-4 overflow-hidden`}
            style={{ borderLeftWidth: '4px', borderLeftColor: insight.color === 'red' ? '#ef4444' : insight.color === 'yellow' ? '#f59e0b' : '#3b82f6' }}
          >
            <div className="flex items-start">
              <div className="mr-3">
                {renderIcon(insight.icon, insight.color)}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{insight.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                <p className="text-xs text-gray-500 mt-2">{insight.source}</p>
                {renderButton(insight.action.label, insight.action.type)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}