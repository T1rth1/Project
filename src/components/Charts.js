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
 
// Fresh Service API configuration
// const FRESH_SERVICE_API = {
//   BASE_URL: 'https://cloudthattechnologigfgdfgfespvtlt.freshservice.com/api/v2',
//   HEADERS: {
//     'Content-Type': 'application/json',
//     'Authorization': 'Basic ' + btoa('yVPm1NfgfgfgfwCVI35Sz0uUEUS:X') // Your API key
//   }
// };
const FRESH_SERVICE_API = {
  BASE_URL: 'https://cloudthattechnologiespvtlt.freshservice.com/api/v2',
  HEADERS: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('yVPm1NwCVI35Sz0uUEUS:X') // Replace with your actual API key
  }
};
 
export default function FreshdeskDashboard() {
  const [ticketData, setTicketData] = useState({
    statusSummary: [],
    prioritySummary: [],
    groupSummary: [],
    ticketsByDay: [],
    urgentCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    totalCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'year'
 
  // Define vibrant color palette for better visuals
  const statusColors = [
    'rgba(255, 99, 132, 0.8)',    // Pink for Open
    'rgba(54, 162, 235, 0.8)',    // Blue for Pending
    'rgba(255, 206, 86, 0.8)',    // Yellow for Resolved
    'rgba(75, 192, 192, 0.8)',    // Teal for Closed
    'rgba(153, 102, 255, 0.8)',   // Purple for Waiting on Customer
    'rgba(255, 159, 64, 0.8)',    // Orange for Waiting on Third Party
    'rgba(0, 204, 150, 0.8)',     // Mint green for others
  ];
 
  const statusBorderColors = statusColors.map(color => color.replace('0.8', '1'));
 
  useEffect(() => {
    const fetchFreshdeskData = async () => {
      try {
        setLoading(true);
       
        // Get date range filter based on timeframe
        const dateFrom = getDateRangeForTimeframe(timeframe);
       
        // Build the correct URL with the Fresh Service API configuration
        const ticketsUrl = `${FRESH_SERVICE_API.BASE_URL}/tickets?per_page=100&updated_since=${dateFrom}`;
       
        const res = await fetch(ticketsUrl, {
          headers: FRESH_SERVICE_API.HEADERS
        });
    
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
       
        const response = await res.json();
        // Fresh Service API typically returns data in a nested format
        const tickets = response.tickets || [];
       
        console.log("API Response:", response);
        console.log("Tickets:", tickets);
       
        // Process the tickets data
        const processedData = processTicketsData(tickets);
        setTicketData(processedData);
       
      } catch (err) {
        console.error('Error fetching Fresh Service data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
 
    fetchFreshdeskData();
  }, [timeframe]);
 
  // Helper function to get date range based on timeframe
  const getDateRangeForTimeframe = (timeframe) => {
    const now = new Date();
    let date;
   
    switch (timeframe) {
      case 'week':
        date = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'year':
        date = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'month':
      default:
        date = new Date(now.setMonth(now.getMonth() - 1));
        break;
    }
   
    return date.toISOString();
  };
 
  // Process tickets data into chart-friendly format
  const processTicketsData = (tickets) => {
    // Count tickets by status
    const statusMap = {};
    const priorityMap = {};
    const groupMap = {};
    const ticketsByDayMap = {};
   
    let urgentCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
   
    // Define status labels
    const statusLabels = {
      2: 'Open',
      3: 'Pending',
      4: 'Resolved',
      5: 'Closed',
      6: 'Waiting on Customer',
      7: 'Waiting on Third Party'
    };
   
    // Define priority labels
    const priorityLabels = {
      1: 'Low',
      2: 'Medium',
      3: 'High',
      4: 'Urgent'
    };
   
    // Process each ticket
    tickets.forEach(ticket => {
      // Process status
      const statusLabel = statusLabels[ticket.status] || `Status ${ticket.status}`;
      statusMap[statusLabel] = (statusMap[statusLabel] || 0) + 1;
     
      // Process priority
      const priorityLabel = priorityLabels[ticket.priority] || `Priority ${ticket.priority}`;
      priorityMap[priorityLabel] = (priorityMap[priorityLabel] || 0) + 1;
     
      // Count by priority
      if (ticket.priority === 4) urgentCount++;
      else if (ticket.priority === 3) highCount++;
      else if (ticket.priority === 2) mediumCount++;
      else if (ticket.priority === 1) lowCount++;
     
      // Process group (if available)
      if (ticket.group_id) {
        const groupLabel = `Group ${ticket.group_id}`;
        groupMap[groupLabel] = (groupMap[groupLabel] || 0) + 1;
      }
     
      // Process created date for time series
      const createdDate = new Date(ticket.created_at).toISOString().split('T')[0];
      ticketsByDayMap[createdDate] = (ticketsByDayMap[createdDate] || 0) + 1;
    });
   
    // Convert maps to arrays for charting
    const statusSummary = Object.keys(statusMap).map(status => ({
      status,
      count: statusMap[status]
    }));
   
    const prioritySummary = Object.keys(priorityMap).map(priority => ({
      priority,
      count: priorityMap[priority]
    }));
   
    const groupSummary = Object.keys(groupMap).map(group => ({
      group,
      count: groupMap[group]
    }));
   
    // Sort dates for time series
    const sortedDates = Object.keys(ticketsByDayMap).sort();
    const ticketsByDay = sortedDates.map(date => ({
      date,
      count: ticketsByDayMap[date]
    }));
   
    return {
      statusSummary,
      prioritySummary,
      groupSummary,
      ticketsByDay,
      urgentCount,
      highCount,
      mediumCount,
      lowCount,
      totalCount: tickets.length
    };
  };
 
  // Status Distribution Chart
  const statusChartData = {
    labels: ticketData.statusSummary?.map(item => item.status) || [],
    datasets: [
      {
        label: 'Tickets per Status',
        data: ticketData.statusSummary?.map(item => item.count) || [],
        backgroundColor: statusColors.slice(0, ticketData.statusSummary?.length || 0),
        borderColor: statusBorderColors.slice(0, ticketData.statusSummary?.length || 0),
        borderWidth: 1,
        borderRadius: 5,
        hoverBackgroundColor: statusColors.map(color => color.replace('0.8', '0.9')),
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
            const status = ticketData.statusSummary[tooltipItems[0].dataIndex];
            return `${status?.status || ''}`;
          },
          label: (context) => {
            const status = ticketData.statusSummary[context.dataIndex];
            return `${status?.status || ''}: ${status?.count || 0} tickets`;
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
          text: 'Number of Tickets',
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
 
  // Priority Breakdown - Horizontal Bar Chart
  const priorityBarData = {
    labels: ['Urgent', 'High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Ticket Count',
        data: [
          ticketData.urgentCount || 0,
          ticketData.highCount || 0,
          ticketData.mediumCount || 0,
          ticketData.lowCount || 0,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.85)',  // Red for Urgent
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
            const percentage = ticketData.totalCount > 0 ?
              Math.round((value / ticketData.totalCount) * 100) : 0;
            return `${value} tickets (${percentage}% of total)`;
          }
        }
      },
      title: {
        display: true,
        text: `Total Tickets: ${ticketData.totalCount || 0}`,
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
 
  // Tickets by Day - Line Chart
  const ticketsTrendData = {
    labels: ticketData.ticketsByDay?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Tickets Created',
        data: ticketData.ticketsByDay?.map(item => item.count) || [],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true
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
        displayColors: true
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
          text: 'Number of Tickets',
          font: { weight: 'bold' }
        }
      },
      x: {
        grid: { display: false },
        title: {
          display: true,
          text: 'Date',
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
 
  // Priority by Status - Stacked Bar Chart
  // const stackedBarData = {
  //   labels: ticketData.statusSummary?.map(item => item.status) || [],
  //   datasets: [
  //     {
  //       label: 'Urgent',
  //       data: ticketData.statusSummary?.map(() => Math.floor(Math.random() * 5)) || [], // Placeholder data
  //       backgroundColor: 'rgba(239, 68, 68, 0.8)',
  //       borderColor: 'rgba(239, 68, 68, 1)',
  //       borderWidth: 1,
  //       borderRadius: {
  //         topLeft: 5,
  //         topRight: 5
  //       }
  //     },
  //     {
  //       label: 'High',
  //       data: ticketData.statusSummary?.map(() => Math.floor(Math.random() * 8)) || [], // Placeholder data
  //       backgroundColor: 'rgba(249, 115, 22, 0.8)',
  //       borderColor: 'rgba(249, 115, 22, 1)',
  //       borderWidth: 1
  //     },
  //     {
  //       label: 'Medium',
  //       data: ticketData.statusSummary?.map(() => Math.floor(Math.random() * 12)) || [], // Placeholder data
  //       backgroundColor: 'rgba(234, 179, 8, 0.8)',
  //       borderColor: 'rgba(234, 179, 8, 1)',
  //       borderWidth: 1
  //     },
  //     {
  //       label: 'Low',
  //       data: ticketData.statusSummary?.map(() => Math.floor(Math.random() * 7)) || [], // Placeholder data
  //       backgroundColor: 'rgba(14, 165, 233, 0.8)',
  //       borderColor: 'rgba(14, 165, 233, 1)',
  //       borderWidth: 1,
  //       borderRadius: {
  //         bottomLeft: 5,
  //         bottomRight: 5
  //       }
  //     }
  //   ]
  // };
 
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
            return `${context.dataset.label}: ${context.raw} tickets`;
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
          text: 'Number of Tickets',
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
    csvContent += "Status,Total Tickets\n";
   
    // Add data
    ticketData.statusSummary.forEach(status => {
      csvContent += `${status.status},${status.count}\n`;
    });
   
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "freshdesk_tickets.csv");
    document.body.appendChild(link);
   
    // Download the data file
    link.click();
  };
 
  // Time frame selector
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
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
      {/* Header with time frame selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Fresh Service Support Dashboard</h2>
        {/* <div className="flex gap-2">
          <button
            onClick={() => handleTimeframeChange('week')}
            className={`px-4 py-2 rounded-md ${timeframe === 'week'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Last Week
          </button>
          <button
            onClick={() => handleTimeframeChange('month')}
            className={`px-4 py-2 rounded-md ${timeframe === 'month'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Last Month
          </button>
          <button
            onClick={() => handleTimeframeChange('year')}
            className={`px-4 py-2 rounded-md ${timeframe === 'year'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Last Year
          </button>
        </div> */}
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Chart */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
          <div className="flex justify-between items-center">          
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Tickets by Status</h3>
            <button
              onClick={handleExport}
              className="flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            ) : ticketData.statusSummary?.length === 0 ? (
              <p className="text-center text-gray-500">No ticket data available</p>
            ) : (
              <Bar data={statusChartData} options={barOptions} />
            )}
          </div>
        </div>
 
        {/* Priority Distribution Chart */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Tickets by Priority</h3>
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
            ) : ticketData.totalCount === 0 ? (
              <p className="text-gray-500 text-center">No ticket data available</p>
            ) : (
              <Bar data={priorityBarData} options={horizontalBarOptions} />
            )}
          </div>
        </div>
      </div>
 
      {/* Tickets Trend Chart */}
      <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Ticket Volume Trend</h3>
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
          ) : ticketData.ticketsByDay?.length === 0 ? (
            <p className="text-center text-gray-500">No ticket data available</p>
          ) : (
            <Line data={ticketsTrendData} options={lineChartOptions} />
          )}
        </div>
      </div>
 
      {/* Priority Distribution by Status */}
      {/* <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Priority Distribution by Status</h3>
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
          ) : ticketData.statusSummary?.length === 0 ? (
            <p className="text-center text-gray-500">No ticket data available</p>
          ) : (
            <Bar data={stackedBarData} options={stackedBarOptions} />
          )}
        </div>
      </div> */}
    </div>
  );
}
 