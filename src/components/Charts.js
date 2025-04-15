import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Charts() {
  // Threat Trends data (last 7 days)
  const threatTrendsData = {
    labels: ['7 days ago', '6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Today'],
    datasets: [
      {
        label: 'Critical',
        data: [5, 4, 8, 12, 15, 12, 14],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 3
      },
      {
        label: 'High',
        data: [15, 14, 18, 22, 25, 20, 24],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 3
      },
      {
        label: 'Medium',
        data: [45, 52, 46, 55, 62, 58, 70],
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 3
      },
      {
        label: 'Low',
        data: [88, 85, 102, 94, 108, 122, 132],
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 3
      }
    ]
  };

  // AWS Service Threats data
  const awsServiceData = {
    labels: ['EC2', 'S3', 'IAM', 'RDS', 'Lambda', 'CloudFront', 'Others'],
    datasets: [
      {
        label: 'Number of Threats',
        data: [65, 42, 28, 15, 21, 12, 8],
        backgroundColor: [
          'rgba(236, 72, 153, 0.7)',  // EC2 - Pink
          'rgba(59, 130, 246, 0.7)',  // S3 - Blue
          'rgba(250, 204, 21, 0.7)',  // IAM - Yellow
          'rgba(20, 184, 166, 0.7)',  // RDS - Teal
          'rgba(139, 92, 246, 0.7)',  // Lambda - Purple
          'rgba(249, 115, 22, 0.7)',  // CloudFront - Orange
          'rgba(107, 114, 128, 0.7)', // Others - Gray
        ],
        borderWidth: 1
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 10
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          precision: 0
        },
        title: {
          display: true,
          text: 'Number of Threats'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: (items) => items[0].label,
          label: (item) => `${item.label}: ${item.formattedValue} threats`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          precision: 0
        },
        title: {
          display: true,
          text: 'Number of Threats'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Threat Trends (Last 7 Days)</h3>
          <button className="flex items-center text-gray-600 hover:text-gray-800 border border-gray-200 px-2 py-1 rounded-lg">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Export
          </button>
        </div>
        <div className="h-72">
          <Line data={threatTrendsData} options={lineChartOptions} />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Threats by AWS Service</h3>
          <button className="flex items-center text-gray-600 hover:text-gray-800 border border-gray-200 px-2 py-1 rounded-lg">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Export
          </button>
        </div>
        <div className="h-72">
          <Bar data={awsServiceData} options={barChartOptions} />
        </div>
      </div>
    </div>
  );
}