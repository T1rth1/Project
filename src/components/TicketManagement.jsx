import { useState, useEffect } from "react"
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faRefresh,
  faSearch,
  faFilter,
  faExclamationTriangle,
  faInfoCircle,
  faSpinner,
  faTimes,
  faChevronDown,
  faChevronUp,
  faSort,
  faBug,
  faCog,
  faTicketAlt,
  faComments,
  faCalendarAlt,
  faUser,
  faClock,
  faFlag,
  faTag,
  faFileAlt,
  faRobot,
} from "@fortawesome/free-solid-svg-icons"

// Get Freshservice API configuration
const FRESHSERVICE_BASE_URL = process.env.REACT_APP_FRESH_SERVICE_BASE_URL

// Freshservice API call helper
const freshserviceCall = async (endpoint, options = {}) => {
  const freshserviceToken = localStorage.getItem("freshserviceToken") || process.env.REACT_APP_FRESH_SERVICE_API_KEY

  try {
    const response = await fetch(`${FRESHSERVICE_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(freshserviceToken + ":X")}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Freshservice API call failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Freshservice API error:", error)
    throw error
  }
}

// Extract reason from description
const extractReason = (description) => {
  if (!description) return "No reason available"

  // Remove HTML tags and clean up the description
  const cleanDescription = description
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()

  // Extract reason using regex
  const reasonMatch = cleanDescription.match(/Reason\s*:\s*([^\n\r<]+)/i)
  return reasonMatch ? reasonMatch[1].trim() : "No specific reason provided"
}

// Enhanced Ticket Details Modal Component
const TicketDetailsModal = ({ isOpen, onClose, ticket, loading, onAskChatbot }) => {
  if (!isOpen) return null

  // Get status display
  const getStatusDisplay = (status) => {
    const statusMap = {
      2: { label: "Open", color: "bg-red-100 text-red-800", icon: faExclamationTriangle },
      3: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: faClock },
      4: { label: "Resolved", color: "bg-green-100 text-green-800", icon: faInfoCircle },
      5: { label: "Closed", color: "bg-gray-100 text-gray-800", icon: faInfoCircle },
    }
    return statusMap[status] || { label: "Unknown", color: "bg-gray-100 text-gray-800", icon: faInfoCircle }
  }

  // Get priority display
  const getPriorityDisplay = (priority) => {
    const priorityMap = {
      1: { label: "Low", color: "text-blue-600", bgColor: "bg-blue-50", icon: faFlag },
      2: { label: "Medium", color: "text-yellow-600", bgColor: "bg-yellow-50", icon: faFlag },
      3: { label: "High", color: "text-orange-600", bgColor: "bg-orange-50", icon: faFlag },
      4: { label: "Urgent", color: "text-red-600", bgColor: "bg-red-50", icon: faFlag },
    }
    return priorityMap[priority] || { label: "Unknown", color: "text-gray-600", bgColor: "bg-gray-50", icon: faFlag }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  // Get ticket type
  const getTicketType = (ticket) => {
    if (ticket?.type) return ticket.type
    if (ticket?.subject) {
      const subject = ticket.subject.toLowerCase()
      if (subject.includes("service request")) return "Service Request"
      if (subject.includes("incident")) return "Incident"
      if (subject.includes("problem")) return "Problem"
      if (subject.includes("change")) return "Change"
    }
    return "General"
  }

  // Get ticket type icon and color
  const getTicketTypeInfo = (ticket) => {
    const ticketType = getTicketType(ticket)
    const typeMap = {
      "Service Request": { icon: faTicketAlt, color: "text-blue-600", bgColor: "bg-blue-50" },
      Incident: { icon: faExclamationTriangle, color: "text-red-600", bgColor: "bg-red-50" },
      Problem: { icon: faBug, color: "text-orange-600", bgColor: "bg-orange-50" },
      Change: { icon: faCog, color: "text-purple-600", bgColor: "bg-purple-50" },
      General: { icon: faInfoCircle, color: "text-gray-600", bgColor: "bg-gray-50" },
    }
    return typeMap[ticketType] || typeMap["General"]
  }

  // Handle modal backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle resolved by AI - make API call to DynamoDB
  const handleResolvedByAI = async () => {
    if (ticket) {
      try {
        const userId = sessionStorage.getItem("id") || "user123"
        const incident_id = ticket.id.toString()
        const API_BASE_URL = process.env.REACT_APP_LAMBDA_DYNAMODB

        // Make API call to add remediation history
        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "addRemediationHistory",
            userId: userId,
            incident_id: incident_id,
            status: "resolved_by_ai",
          }),
        })

        if (!response.ok) {
          throw new Error(`API call failed: ${response.statusText}`)
        }

        const result = await response.json()
        console.log("Remediation history added successfully:", result)

        // Show success message
        toast.success("Ticket marked as resolved by AI!")
        // Close the modal
        onClose()
      } catch (error) {
        console.error("Error adding remediation history:", error)
        toast.error("This ticket is already resolved by AI!")
      }
    }
  }

  // Check if description has meaningful content
  const hasDescription =
    ticket &&
    (ticket.description_text || ticket.description) &&
    (ticket.description_text || ticket.description).trim().length > 0

  const statusInfo = ticket ? getStatusDisplay(ticket.status) : null
  const priorityInfo = ticket ? getPriorityDisplay(ticket.priority) : null
  const typeInfo = ticket ? getTicketTypeInfo(ticket) : null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {typeInfo && (
                <div className={`p-3 rounded-xl ${typeInfo.bgColor} ${typeInfo.color} bg-opacity-20`}>
                  <FontAwesomeIcon icon={typeInfo.icon} className="text-2xl text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{ticket ? `Ticket #${ticket.id}` : "Loading..."}</h2>
                <p className="text-blue-100 text-sm mt-1">{ticket ? getTicketType(ticket) : ""}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-all duration-200"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Status and Priority Pills */}
          {ticket && (
            <div className="flex items-center space-x-3 mt-4">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
              >
                <FontAwesomeIcon icon={statusInfo.icon} className="mr-2" />
                {statusInfo.label}
              </div>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityInfo.color} ${priorityInfo.bgColor}`}
              >
                <FontAwesomeIcon icon={priorityInfo.icon} className="mr-2" />
                {priorityInfo.label} Priority
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-250px)]">
          {loading || !ticket ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600 text-lg">Loading ticket details...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Title Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-relaxed">
                  {typeof ticket.subject === "string" ? ticket.subject : ticket.subject?.toString() || "No Subject"}
                </h3>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-blue-600" />
                      Ticket Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Category</span>
                        <span className="text-gray-900 font-semibold">{ticket.category || "Uncategorized"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Type</span>
                        <span className="text-gray-900 font-semibold">{getTicketType(ticket)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FontAwesomeIcon icon={faUser} className="mr-2 text-green-600" />
                      Requester Details
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Name</span>
                        <span className="text-gray-900 font-semibold">
                          {ticket.requester_name || ticket.requester_id || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-purple-600" />
                      Timeline
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Created</span>
                        <span className="text-gray-900 font-semibold">{formatDate(ticket.created_at)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Updated</span>
                        <span className="text-gray-900 font-semibold">{formatDate(ticket.updated_at)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Due By</span>
                        <span className="text-gray-900 font-semibold">{formatDate(ticket.due_by)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-indigo-600" />
                  Description
                </h4>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 max-h-64 overflow-y-auto">
                  <div
                    className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: ticket.description_text || ticket.description || "No description provided",
                    }}
                  />
                </div>
              </div>

              {/* AI Analysis Section */}
              {hasDescription && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faRobot} className="mr-2 text-blue-600" />
                    Extracted Information
                  </h4>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FontAwesomeIcon icon={faRobot} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-blue-900 mb-2">Extracted Issue Summary</h5>
                        <p className="text-blue-800">
                          <strong>Reason:</strong> {extractReason(ticket.description_text || ticket.description)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags Section */}
              {ticket.tags && ticket.tags.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faTag} className="mr-2 text-yellow-600" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              {/* Ask AI Assistant Button - Original functionality */}
              <button
                onClick={() =>
                  onAskChatbot(ticket.subject, extractReason(ticket.description_text || ticket.description))
                }
                disabled={loading || !ticket}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <FontAwesomeIcon icon={faComments} className="mr-2" />
                Ask AI Assistant
              </button>

              {/* Resolved by AI Button - New functionality */}
              <button
                onClick={handleResolvedByAI}
                disabled={loading || !ticket}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <FontAwesomeIcon icon={faRobot} className="mr-2" />
                Resolved by AI
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Ticket Management Component
const TicketManagement = ({ activeDepartment, onAskChatbot }) => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTickets, setTotalTickets] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [showFilters, setShowFilters] = useState(true)
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    type: "",
  })
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [ticketDetailsLoading, setTicketDetailsLoading] = useState(false)
  const [searchMode, setSearchMode] = useState("all") // 'all', 'filtered', 'search'

  const perPage = 20

  // Handle ask chatbot - receives onAskChatbot as prop from Dashboard
  const handleAskChatbot = (subject, reason) => {
    console.log("TicketManagement handleAskChatbot called with:", { subject, reason })

    if (onAskChatbot) {
      onAskChatbot(subject, reason)
    } else {
      console.error("onAskChatbot function not provided as prop")
    }
  }

  // Get ticket type helper
  const getTicketType = (ticket) => {
    if (ticket?.type) return ticket.type
    if (ticket?.subject) {
      const subject = ticket.subject.toLowerCase()
      if (subject.includes("service request")) return "Service Request"
      if (subject.includes("incident")) return "Incident"
      if (subject.includes("problem")) return "Problem"
      if (subject.includes("change")) return "Change"
    }
    return "General"
  }

  // Improved fetch function with per-page client-side search
  const fetchTickets = async (
    page = 1,
    search = "",
    appliedFilters = {},
    sortField = "created_at",
    sortDirection = "desc",
  ) => {
    if (!activeDepartment?.department_id) {
      console.log("No active department available")
      return
    }

    setLoading(true)
    try {
      // Build simple query for department and basic filters only (no search in API)
      let query = `department_id:${activeDepartment.department_id}`

      // Add only basic filters that work well with Freshservice API
      if (appliedFilters.status) {
        query += ` AND status:${appliedFilters.status}`
      }
      if (appliedFilters.priority) {
        query += ` AND priority:${appliedFilters.priority}`
      }

      // Always fetch from API without search - we'll search client-side
      const endpoint = `/tickets/filter?query="${encodeURIComponent(query)}"&per_page=${perPage}&page=${page}`

      console.log(`Fetching page ${page} with endpoint:`, endpoint)

      const response = await freshserviceCall(endpoint)
      console.log("API Response:", response)

      if (response.tickets) {
        let processedTickets = response.tickets

        // Apply client-side search on the current page results
        if (search.trim()) {
          const searchLower = search.toLowerCase().trim()
          processedTickets = processedTickets.filter((ticket) => {
            const searchableFields = [
              ticket.id?.toString(),
              ticket.subject,
              ticket.description_text || ticket.description,
              ticket.requester_name,
              ticket.category,
            ].filter(Boolean)

            return searchableFields.some((field) => field.toLowerCase().includes(searchLower))
          })
        }

        // Apply client-side type filter
        if (appliedFilters.type) {
          processedTickets = processedTickets.filter((ticket) => {
            const ticketType = getTicketType(ticket)
            return ticketType === filters.type
          })
        }

        // Apply client-side sorting
        processedTickets.sort((a, b) => {
          let aValue = a[sortField] || ""
          let bValue = b[sortField] || ""

          // Handle different data types
          if (sortField === "created_at" || sortField === "updated_at" || sortField === "due_by") {
            aValue = new Date(aValue || 0)
            bValue = new Date(bValue || 0)
          } else if (sortField === "id" || sortField === "priority" || sortField === "status") {
            aValue = Number.parseInt(aValue) || 0
            bValue = Number.parseInt(bValue) || 0
          } else if (typeof aValue === "string") {
            aValue = aValue.toLowerCase()
            bValue = (bValue || "").toLowerCase()
          }

          if (sortDirection === "asc") {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
          } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
          }
        })

        setTickets(processedTickets)

        // Handle total count and pagination based on API response
        if (response.total !== undefined) {
          setTotalTickets(response.total)
          setTotalPages(Math.ceil(response.total / perPage))
        } else {
          // Fallback: estimate based on current page
          const hasMorePages = response.tickets.length === perPage
          if (hasMorePages) {
            setTotalPages(page + 1)
            setTotalTickets((page - 1) * perPage + response.tickets.length + 1)
          } else {
            setTotalPages(page)
            setTotalTickets((page - 1) * perPage + response.tickets.length)
          }
        }

        // Set search mode
        if (search.trim() || appliedFilters.type) {
          setSearchMode("search")
        } else if (appliedFilters.status || appliedFilters.priority) {
          setSearchMode("filtered")
        } else {
          setSearchMode("all")
        }
      } else {
        setTickets([])
        setTotalTickets(0)
        setTotalPages(1)
        setSearchMode("all")
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
      setTickets([])
      setTotalTickets(0)
      setTotalPages(1)
      setSearchMode("all")
    } finally {
      setLoading(false)
    }
  }

  // Function to get total ticket count for department
  const fetchTotalTicketCount = async () => {
    if (!activeDepartment?.department_id) return 0

    try {
      // Fetch first page to get total count
      const query = `department_id:${activeDepartment.department_id}`
      const endpoint = `/tickets/filter?query="${encodeURIComponent(query)}"&per_page=1&page=1`
      const response = await freshserviceCall(endpoint)

      return response.total || 0
    } catch (error) {
      console.error("Error fetching total count:", error)
      return 0
    }
  }

  // Fetch individual ticket details
  const fetchTicketDetails = async (ticketId) => {
    setTicketDetailsLoading(true)
    try {
      const response = await freshserviceCall(`/tickets/${ticketId}`)
      return response.ticket
    } catch (error) {
      console.error("Error fetching ticket details:", error)
      return null
    } finally {
      setTicketDetailsLoading(false)
    }
  }

  // Load tickets on component mount and when dependencies change
  useEffect(() => {
    if (activeDepartment?.department_id) {
      // If it's the first load without search/filters, get accurate total count
      if (currentPage === 1 && !searchTerm && !Object.values(filters).some((f) => f)) {
        fetchTotalTicketCount().then((total) => {
          if (total > 0) {
            setTotalTickets(total)
            setTotalPages(Math.ceil(total / perPage))
          }
        })
      }
      fetchTickets(currentPage, searchTerm, filters, sortBy, sortOrder)
    }
  }, [activeDepartment, currentPage, searchTerm, filters, sortBy, sortOrder])

  // Handle search
  const handleSearch = () => {
    fetchTickets(currentPage, searchTerm, filters, sortBy, sortOrder)
  }

  // Handle search input change - instant client-side search
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value
    setSearchTerm(newSearchTerm)

    // Apply search immediately on current page data
    // Re-fetch current page with new search term
    fetchTickets(currentPage, newSearchTerm, filters, sortBy, sortOrder)
  }

  // Handle search on Enter key
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Handle column sort
  const handleSort = (column) => {
    let newSortOrder = "asc"
    if (sortBy === column && sortOrder === "asc") {
      newSortOrder = "desc"
    }

    setSortBy(column)
    setSortOrder(newSortOrder)
    setCurrentPage(1)
    fetchTickets(1, searchTerm, filters, column, newSortOrder)
  }

  // Get sort icon for column headers
  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return <FontAwesomeIcon icon={faSort} className="text-gray-400 ml-1" />
    }
    return sortOrder === "asc" ? (
      <FontAwesomeIcon icon={faChevronUp} className="text-blue-500 ml-1" />
    ) : (
      <FontAwesomeIcon icon={faChevronDown} className="text-blue-500 ml-1" />
    )
  }

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value }
    setFilters(newFilters)
    setCurrentPage(1)
    fetchTickets(1, searchTerm, newFilters, sortBy, sortOrder)
  }

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = { status: "", priority: "", type: "" }
    setFilters(clearedFilters)
    setSearchTerm("")
    setCurrentPage(1)
    fetchTickets(1, "", clearedFilters, sortBy, sortOrder)
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchTickets(currentPage, searchTerm, filters, sortBy, sortOrder)
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      fetchTickets(newPage, searchTerm, filters, sortBy, sortOrder)
    }
  }

  // Handle ticket click
  const handleTicketClick = async (ticket) => {
    setSelectedTicket(ticket)
    setShowTicketModal(true)

    // Fetch detailed ticket information
    const detailedTicket = await fetchTicketDetails(ticket.id)
    if (detailedTicket) {
      setSelectedTicket(detailedTicket)
    }
  }

  // Get status display
  const getStatusDisplay = (status) => {
    const statusMap = {
      2: { label: "Open", color: "text-red-600 bg-red-50" },
      3: { label: "Pending", color: "text-yellow-600 bg-yellow-50" },
      4: { label: "Resolved", color: "text-green-600 bg-green-50" },
      5: { label: "Closed", color: "text-gray-600 bg-gray-50" },
    }
    return statusMap[status] || { label: "Unknown", color: "text-gray-600 bg-gray-50" }
  }

  // Get priority display
  const getPriorityDisplay = (priority) => {
    const priorityMap = {
      1: { label: "Low", color: "text-blue-600" },
      2: { label: "Medium", color: "text-yellow-600" },
      3: { label: "High", color: "text-orange-600" },
      4: { label: "Urgent", color: "text-red-600" },
    }
    return priorityMap[priority] || { label: "Unknown", color: "text-gray-600" }
  }

  // Get ticket type icon
  const getTicketTypeIcon = (ticket) => {
    const ticketType = getTicketType(ticket)

    switch (ticketType) {
      case "Service Request":
        return <FontAwesomeIcon icon={faTicketAlt} className="text-blue-500" />
      case "Incident":
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
      case "Problem":
        return <FontAwesomeIcon icon={faBug} className="text-orange-500" />
      case "Change":
        return <FontAwesomeIcon icon={faCog} className="text-purple-500" />
      default:
        return <FontAwesomeIcon icon={faInfoCircle} className="text-gray-500" />
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-GB")
    } catch (error) {
      return "Invalid Date"
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-600">Ticket Management</h2>
          <div className="flex items-center space-x-4 mt-1">
            {searchMode === "search" && searchTerm && (
              <p className="text-sm text-blue-600">
                Searching "{searchTerm}" on page {currentPage} - {tickets.length} results found
              </p>
            )}
            {searchMode === "all" && totalTickets > 0 && (
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} - Total: {totalTickets.toLocaleString()} tickets
              </p>
            )}
            {searchMode === "filtered" && (
              <p className="text-sm text-gray-600">
                Filtered results - Page {currentPage} of {totalPages} - {totalTickets} tickets total
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            title="Refresh"
          >
            <FontAwesomeIcon icon={faRefresh} className={loading ? "animate-spin" : ""} />
          </button>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              placeholder="Search tickets (ID, subject, description, requester)..."
              className="pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Search"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-md transition-colors flex items-center ${
              showFilters ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FontAwesomeIcon icon={faFilter} className="mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Inline Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="relative">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="appearance-none w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="2">Open</option>
                  <option value="3">Pending</option>
                  <option value="4">Resolved</option>
                  <option value="5">Closed</option>
                </select>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <div className="relative">
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange("priority", e.target.value)}
                  className="appearance-none w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">All Priorities</option>
                  <option value="1">Low</option>
                  <option value="2">Medium</option>
                  <option value="3">High</option>
                  <option value="4">Urgent</option>
                </select>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="text-xs text-gray-500">(Client-side)</span>
              </label>
              <div className="relative">
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="appearance-none w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">All Types</option>
                  <option value="Service Request">Service Request</option>
                  <option value="Incident">Incident</option>
                  <option value="Problem">Problem</option>
                  <option value="Change">Change</option>
                  <option value="General">General</option>
                </select>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div>
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Search Tips */}
          <div className="mt-3 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Per-Page Search:</strong> Search works within the current page of 20 tickets. Navigate to
              different pages to search through more tickets. Search by ID, subject, description, requester name, or
              category.
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <FontAwesomeIcon icon={faSpinner} className="text-2xl text-blue-500 animate-spin mr-3" />
          <span className="text-gray-600">
            {searchMode === "search" ? "Searching tickets..." : "Loading tickets..."}
          </span>
        </div>
      )}

      {/* Tickets Table */}
      {!loading && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50 border-b border-gray-200">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      ID
                      {getSortIcon("id")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => handleSort("subject")}
                  >
                    <div className="flex items-center">
                      Subject
                      {getSortIcon("subject")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon("status")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => handleSort("priority")}
                  >
                    <div className="flex items-center">
                      Priority
                      {getSortIcon("priority")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center">
                      Created
                      {getSortIcon("created_at")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => handleSort("updated_at")}
                  >
                    <div className="flex items-center">
                      Updated
                      {getSortIcon("updated_at")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => handleSort("requester_id")}
                  >
                    <div className="flex items-center">
                      Requester
                      {getSortIcon("requester_id")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.length > 0 ? (
                  tickets.map((ticket) => {
                    const statusInfo = getStatusDisplay(ticket.status)
                    const priorityInfo = getPriorityDisplay(ticket.priority)

                    return (
                      <tr
                        key={ticket.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            {getTicketTypeIcon(ticket)}
                            <span className="ml-2">#{ticket.id}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={ticket.subject}>
                            {typeof ticket.subject === "string"
                              ? ticket.subject
                              : ticket.subject?.toString() || "No Subject"}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium ${priorityInfo.color}`}>{priorityInfo.label}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(ticket.created_at)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(ticket.updated_at)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={ticket.requester_name || ticket.requester_id}>
                            {ticket.requester_name || ticket.requester_id || "N/A"}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      {searchTerm || Object.values(filters).some((f) => f) ? (
                        <div>
                          <FontAwesomeIcon icon={faSearch} className="text-3xl mb-2" />
                          <p>No tickets found matching your search criteria.</p>
                          <button
                            onClick={handleClearFilters}
                            className="mt-2 text-blue-600 hover:text-blue-800 underline"
                          >
                            Clear filters and search
                          </button>
                        </div>
                      ) : (
                        <div>
                          <FontAwesomeIcon icon={faTicketAlt} className="text-3xl mb-2" />
                          <p>No tickets found for this department.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between bg-gray-50 px-6 py-4 rounded-lg border border-gray-200">
              {/* Left side - Showing results */}
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing <span className="font-semibold text-blue-600">{(currentPage - 1) * perPage + 1}</span> to{" "}
                  <span className="font-semibold text-blue-600">{Math.min(currentPage * perPage, totalTickets)}</span>{" "}
                  of <span className="font-semibold text-blue-600">{totalTickets.toLocaleString()}</span> tickets
                </span>
              </div>

              {/* Center - Page controls */}
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-500 border border-gray-300 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <FontAwesomeIcon icon={faChevronUp} className="rotate-[-90deg] mr-2" />
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        className="w-10 h-10 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                      >
                        1
                      </button>
                      {currentPage > 4 && <span className="px-2 text-gray-400">...</span>}
                    </>
                  )}

                  {/* Current page and neighbors */}
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 7) {
                      pageNum = i + 1
                    } else if (currentPage <= 4) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i
                    } else {
                      pageNum = currentPage - 3 + i
                    }

                    if (pageNum < 1 || pageNum > totalPages) return null

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors flex items-center justify-center ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border border-blue-600 shadow-md"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  {/* Last page */}
                  {currentPage < totalPages - 3 && totalPages > 7 && (
                    <>
                      {currentPage < totalPages - 4 && <span className="px-2 text-gray-400">...</span>}
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="w-10 h-10 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  Next
                  <FontAwesomeIcon icon={faChevronUp} className="rotate-90 ml-2" />
                </button>
              </div>

              {/* Right side - Page Progress */}
              <div className="flex items-center text-sm text-gray-700">
                <span className="mr-3">Page Progress</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${(currentPage / totalPages) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-blue-600 min-w-[3rem]">
                    {Math.round((currentPage / totalPages) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {/* <div className="mt-4 text-sm text-gray-600 text-center">
            {searchMode === "search" && searchTerm && (
              <p>
                Search results for "<strong>{searchTerm}</strong>" on page {currentPage}. Navigate to other pages to
                search more tickets.
              </p>
            )}
            {searchMode === "all" && totalTickets > 0 && (
              <p>
                Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalTickets)} of{" "}
                {totalTickets.toLocaleString()} tickets
              </p>
            )}
            {searchMode === "filtered" && (
              <p>
                Filtered view - Page {currentPage} of {totalPages} ({totalTickets} tickets match your filters)
              </p>
            )}
          </div> */}
        </>
      )}

      {/* Ticket Details Modal */}
      <TicketDetailsModal
        isOpen={showTicketModal}
        onClose={() => {
          setShowTicketModal(false)
          setSelectedTicket(null)
        }}
        ticket={selectedTicket}
        loading={ticketDetailsLoading}
        onAskChatbot={handleAskChatbot}
      />
    </div>
  )
}

export default TicketManagement
