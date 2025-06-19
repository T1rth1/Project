import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTicketAlt, faExclamationTriangle, faCheckCircle, faClock } from "@fortawesome/free-solid-svg-icons"

const StatCards = ({ ticketsData, selectedCredential, activeDepartment, dashboardData,resolvedCount, freshserviceDepartmentId }) => {
  console.log("tickets data from the stat card", ticketsData)

  // Process tickets data
  const processTicketsData = () => {
    if (!ticketsData || !ticketsData.tickets || !Array.isArray(ticketsData.tickets)) {
      return {
        total: 0,
        open: 0,
        resolved: 0,
        pending: 0,
        closed: 0,
        highPriority: 0,
        urgentPriority: 0,
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

    return stats
  }

  const stats = processTicketsData()

  const statCards = [
    {
      title: "Tickets",
      value: stats.total,
      subtitle: `${stats.total} Total Tickets`,
      icon: faTicketAlt,
      borderColor: "border-l-blue-500",
      textColor: "text-red-500",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-400",
    },
    {
      title: "Pending Tickets",
      value: stats.pending,
      subtitle: `${stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% of total`,
      icon: faClock,
      borderColor: "border-l-yellow-500",
      textColor: "text-green-500",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-400",
    },
    {
      title: "Urgent Tickets",
      value: stats.urgentPriority,
      subtitle: `${stats.total > 0 ? Math.round((stats.urgentPriority / stats.total) * 100) : 0}% of total`,
      icon: faExclamationTriangle,
      borderColor: "border-l-red-500",
      textColor: "text-red-500",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-400",
    },
    {
      title: "Resolved Tickets by Chatbot",
      value: resolvedCount || 0,
      subtitle: `Autonomously resolved issues`,
      icon: faCheckCircle,
      borderColor: "border-l-green-500",
      textColor: "text-red-500",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${card.borderColor} border-l-4 hover:shadow-md transition-shadow`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{card.value}</p>
              <div className="flex items-center">
                <span className={`text-sm ${card.textColor} font-medium`}>
                  {card.subtitle.includes("Total") && "↗ "}
                  {card.subtitle.includes("% of total") && card.subtitle.startsWith("0") && "↗ "}
                  {card.subtitle.includes("% of total") && !card.subtitle.startsWith("0") && "↘ "}
                  {card.subtitle.includes("resolved today") && "↘ "}
                  {card.subtitle}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-full ${card.iconBg}`}>
              <FontAwesomeIcon icon={card.icon} className={`${card.iconColor} text-xl`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatCards
