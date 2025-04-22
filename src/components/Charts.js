import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Charts() {
  const [guardDutyData, setGuardDutyData] = useState({
    serviceSummary: [],
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    totalCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define vibrant color palette for better visuals
  const serviceColors = [
    'rgba(255, 99, 132, 0.8)',    // Pink for EC2
    'rgba(128, 128, 128, 0.8)',   // Gray for Others
    'rgba(255, 206, 86, 0.8)',    // Yellow for IAM
    'rgba(75, 192, 192, 0.8)',    // Teal for RDS
    'rgba(153, 102, 255, 0.8)',   // Purple for Lambda
    'rgba(0, 204, 150, 0.8)',     // Mint green
    'rgba(54, 162, 235, 0.8)',    // Blue for S3
    'rgba(255, 99, 71, 0.8)',     // Tomato
    'rgba(255, 159, 64, 0.8)',    // Orange for CloudFront
    'rgba(106, 90, 205, 0.8)'     // Slate blue
  ];
  
  const serviceBorderColors = serviceColors.map(color => color.replace('0.8', '1'));

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const res = await fetch('https://7kql5ne3w65ydlswvd52d7ezw40ykulz.lambda-url.ap-south-1.on.aws/');
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        
        const data = await res.json();
        const parsedData = typeof data === 'string' ? JSON.parse(data.body) : data.body ? JSON.parse(data.body) : data;
        
        console.log('Fetched data:', parsedData);
        setGuardDutyData(parsedData);
      } catch (err) {
        console.error('Error fetching backend data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBackendData();
  }, []);

  // Severity Breakdown - Horizontal Bar Chart (Replacing the pie chart)
  const severityBarData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Threat Count',
        data: [
          guardDutyData.criticalCount || 0,
          guardDutyData.highCount || 0,
          guardDutyData.mediumCount || 0,
          guardDutyData.lowCount || 0,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.85)',  // Red for Critical
          'rgba(249, 115, 22, 0.85)', // Orange for High
          'rgba(234, 179, 8, 0.85)',  // Yellow for Medium
          'rgba(14, 165, 233, 0.85)', // Blue for Low
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(14, 165, 233, 1)',
        ],
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 30,
      },
    ],
  };

  const horizontalBarOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 16 },
        bodyFont: { size: 14 },
        padding: 12,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const percentage = Math.round((value / guardDutyData.totalCount) * 100);
            return `${value} threats (${percentage}% of total)`;
          }
        }
      },
      title: {
        display: true,
        text: `Total Threats: ${guardDutyData.totalCount || 0}`,
        position: 'bottom',
        font: { size: 16, weight: 'bold' },
        padding: { top: 20 }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
          borderDash: [5, 5]
        },
        ticks: { font: { size: 12 } }
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 14, weight: 'bold' } }
      }
    },
    animation: { duration: 1500, easing: 'easeOutQuart' }
  };

  // Enhanced bar chart with hover effects and better styling
  const serviceData = {
    labels: guardDutyData.serviceSummary?.map(item => item.service) || [],
    datasets: [
      {
        label: 'Threats per Service',
        data: guardDutyData.serviceSummary?.map(item => item.count) || [],
        backgroundColor: serviceColors.slice(0, guardDutyData.serviceSummary?.length || 0),
        borderColor: serviceBorderColors.slice(0, guardDutyData.serviceSummary?.length || 0),
        borderWidth: 1,
        borderRadius: 5,
        hoverBackgroundColor: serviceColors.map(color => color.replace('0.8', '0.9')),
        hoverBorderWidth: 2,
        barPercentage: 0.8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 16 },
        bodyFont: { size: 14 },
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            const service = guardDutyData.serviceSummary[tooltipItems[0].dataIndex];
            return `${service?.service || ''}`;
          },
          label: (context) => {
            const service = guardDutyData.serviceSummary[context.dataIndex];
            return `${service?.service || ''}: ${service?.count || 0} threats`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
          borderDash: [5, 5]
        },
        title: {
          display: true,
          text: 'Number of Threats',
          font: { size: 14, weight: 'bold' },
          padding: { bottom: 10 }
        },
        ticks: { font: { size: 12 } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12, weight: 'bold' } }
      }
    },
    animation: { duration: 1500, easing: 'easeOutQuart' },
    hover: { mode: 'index', intersect: false }
  };

  // Line graph for showing severity trends across services
  const lineChartData = {
    labels: guardDutyData.serviceSummary?.map(item => item.service) || [],
    datasets: [
      {
        label: 'Critical',
        data: guardDutyData.serviceSummary?.map(item => item.criticalCount) || [],
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: false
      },
      {
        label: 'High',
        data: guardDutyData.serviceSummary?.map(item => item.highCount) || [],
        borderColor: 'rgba(249, 115, 22, 1)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(249, 115, 22, 1)',
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: false
      },
      {
        label: 'Medium',
        data: guardDutyData.serviceSummary?.map(item => item.mediumCount) || [],
        borderColor: 'rgba(234, 179, 8, 1)',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(234, 179, 8, 1)',
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: false
      },
      {
        label: 'Low',
        data: guardDutyData.serviceSummary?.map(item => item.lowCount) || [],
        borderColor: 'rgba(14, 165, 233, 1)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(14, 165, 233, 1)',
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: false
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 10,
        displayColors: true,
        callbacks: {
          title: (tooltipItems) => {
            return `Service: ${tooltipItems[0].label}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
          borderDash: [5, 5]
        },
        title: {
          display: true,
          text: 'Number of Threats',
          font: { weight: 'bold' }
        }
      },
      x: {
        grid: { display: false },
        title: {
          display: true,
          text: 'AWS Services',
          font: { weight: 'bold' }
        },
        ticks: {
          font: { weight: 'bold' },
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    elements: {
      line: { tension: 0.4 }
    },
    animation: { duration: 2000 }
  };

  // Stacked bar chart for severity by service
  const stackedServiceData = {
    labels: guardDutyData.serviceSummary?.map(item => item.service) || [],
    datasets: [
      {
        label: 'Critical',
        data: guardDutyData.serviceSummary?.map(item => item.criticalCount) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        borderRadius: {
          topLeft: 5,
          topRight: 5
        }
      },
      {
        label: 'High',
        data: guardDutyData.serviceSummary?.map(item => item.highCount) || [],
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 1
      },
      {
        label: 'Medium',
        data: guardDutyData.serviceSummary?.map(item => item.mediumCount) || [],
        backgroundColor: 'rgba(234, 179, 8, 0.8)',
        borderColor: 'rgba(234, 179, 8, 1)',
        borderWidth: 1
      },
      {
        label: 'Low',
        data: guardDutyData.serviceSummary?.map(item => item.lowCount) || [],
        backgroundColor: 'rgba(14, 165, 233, 0.8)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1,
        borderRadius: {
          bottomLeft: 5,
          bottomRight: 5
        }
      }
    ]
  };

  const stackedBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        callbacks: {
          title: (tooltipItems) => {
            return `${tooltipItems[0].label}`;
          },
          label: (context) => {
            return `${context.dataset.label}: ${context.raw} threats`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { weight: 'bold' } }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
          borderDash: [5, 5]
        },
        title: {
          display: true,
          text: 'Number of Threats',
          font: { weight: 'bold' }
        }
      }
    },
    animation: { duration: 1200 }
  };

  // Add export functionality
  const handleExport = () => {
    // Create CSV data
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Service,Total Threats,Critical,High,Medium,Low\n";
    
    // Add data
    guardDutyData.serviceSummary.forEach(service => {
      csvContent += `${service.service},${service.count},${service.criticalCount},${service.highCount},${service.mediumCount},${service.lowCount}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "guardduty_threats.csv");
    document.body.appendChild(link);
    
    // Download the data file
    link.click();
  };

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border border-red-200 shadow-sm">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Data</h3>
        <p className="text-red-500">{error}</p>
        <p className="mt-2 text-gray-600">Please check your connection and try again.</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Threats Chart */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
          <div className="flex justify-between items-center">          
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Threats by AWS Service</h3>
            <button 
              onClick={handleExport}
              className="flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
          <div className="h-80">
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
            ) : guardDutyData.serviceSummary?.length === 0 ? (
              <p className="text-center text-gray-500">No service data available</p>
            ) : (
              <Bar data={serviceData} options={barOptions} />
            )}
          </div>
        </div>

        {/* Severity Distribution Chart - Replaced Pie with Horizontal Bar */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Threats by Severity</h3>
          <div className="h-80">
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
            ) : guardDutyData.totalCount === 0 ? (
              <p className="text-gray-500 text-center">No threat data available</p>
            ) : (
              <Bar data={severityBarData} options={horizontalBarOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Line Chart for Severity Trends */}
      <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Severity Trends Across Services</h3>
        <div className="h-80">
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
          ) : guardDutyData.serviceSummary?.length === 0 ? (
            <p className="text-center text-gray-500">No service data available</p>
          ) : (
            <Line data={lineChartData} options={lineChartOptions} />
          )}
        </div>
      </div>

      {/* Severity Distribution by Service */}
      <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Severity Distribution by Service</h3>
        <div className="h-80">
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
          ) : guardDutyData.serviceSummary?.length === 0 ? (
            <p className="text-center text-gray-500">No service data available</p>
          ) : (
            <Bar data={stackedServiceData} options={stackedBarOptions} />
          )}
        </div>
      </div>
    </div>
  );
}