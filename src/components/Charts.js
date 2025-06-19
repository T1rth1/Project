"use client"

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"

const Charts = ({ ticketsData, activeDepartment }) => {
  console.log("tickets data from charts", ticketsData)

  // Process tickets data for charts
  const processTicketsData = () => {
    if (!ticketsData || !ticketsData.tickets || !Array.isArray(ticketsData.tickets)) {
      return {
        statusData: [],
        priorityData: [],
        stats: {
          total: 0,
          open: 0,
          resolved: 0,
          pending: 0,
          closed: 0,
          highPriority: 0,
          urgentPriority: 0,
        },
      }
    }

    const tickets = ticketsData.tickets

    const stats = {
      total: ticketsData.total,
      open: tickets.filter((ticket) => ticket.status === 2).length,
      pending: tickets.filter((ticket) => ticket.status === 3).length,
      resolved: tickets.filter((ticket) => ticket.status === 4).length,
      closed: tickets.filter((ticket) => ticket.status === 5).length,
      highPriority: tickets.filter((ticket) => ticket.priority === 3).length,
      urgentPriority: tickets.filter((ticket) => ticket.priority === 4).length,
    }

    // Status distribution data for pie chart
    const statusData = [
      { name: "Open", value: stats.open, color: "#ef4444" },
      { name: "Pending", value: stats.pending, color: "#eab308" },
      { name: "Resolved", value: stats.resolved, color: "#22c55e" },
      { name: "Closed", value: stats.closed, color: "#6b7280" },
    ].filter((item) => item.value > 0)

    // Priority distribution data for bar chart
    const priorityData = [
      { name: "Low", value: tickets.filter((ticket) => ticket.priority === 1).length, color: "#22c55e" },
      { name: "Medium", value: tickets.filter((ticket) => ticket.priority === 2).length, color: "#eab308" },
      { name: "High", value: stats.highPriority, color: "#f97316" },
      { name: "Urgent", value: stats.urgentPriority, color: "#ef4444" },
    ]

    return { statusData, priorityData, stats }
  }

  const { statusData, priorityData, stats } = processTicketsData()

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`${label || payload[0].name}`}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{payload[0].value}</span> tickets
            {stats.total > 0 && (
              <span className="text-gray-500 ml-1">({Math.round((payload[0].value / stats.total) * 100)}%)</span>
            )}
          </p>
        </div>
      )
    }
    return null
  }

  // Custom label for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null // Don't show labels for slices less than 5%

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Ticket Status Distribution - Pie Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ticket Status Distribution</h3>
          <p className="text-sm text-gray-600">Current status breakdown of all tickets</p>
        </div>

        {statusData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }} className="text-sm font-medium">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>No ticket data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Priority Distribution - Bar Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Priority Distribution</h3>
          <p className="text-sm text-gray-600">Tickets grouped by priority level</p>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#3b82f6">
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Info Card (if activeDepartment is provided) */}
      {activeDepartment && (
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Department</h3>
              <p className="text-sm text-gray-600 mt-1">
                {typeof activeDepartment === "string"
                  ? activeDepartment
                  : activeDepartment.department_name || "Unknown Department"}
              </p>
              {typeof activeDepartment === "object" && activeDepartment.department_id && (
                <p className="text-xs text-gray-500 mt-1">ID: {activeDepartment.department_id}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Tickets</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Charts
