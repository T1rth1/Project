import { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlus,
  faTimes,
  faBuilding,
  faSpinner,
  faCheck,
  faGlobe,
  faUserShield,
  faRobot,
} from "@fortawesome/free-solid-svg-icons"
import StatCards from "./StatCards.js"
import Charts from "./Charts.js"
import Chatbot from "./Chatbot.jsx"
import TicketManagement from "./TicketManagement.jsx"
import toast from 'react-hot-toast'

// API Configuration
const API_BASE_URL = process.env.REACT_APP_LAMBDA_DYNAMODB
const FRESHSERVICE_BASE_URL = process.env.REACT_APP_FRESH_SERVICE_BASE_URL

console.log("Environment Variables Check:")
console.log("API_BASE_URL:", API_BASE_URL)
console.log("FRESHSERVICE_BASE_URL:", FRESHSERVICE_BASE_URL)

// Get user ID from your auth system
const getCurrentUserId = () => {
  return sessionStorage.getItem("id") || "user123"
}

// API call helper for your Lambda backend
const apiCall = async (action, data = {}) => {
  console.log("Making API call:", action, data)
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: action,
        userId: getCurrentUserId(),
        ...data,
      }),
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("API Response for", action, ":", result)

    if (result.body) {
      return JSON.parse(result.body)
    }

    return result
  } catch (error) {
    console.error("API call error:", error)
    throw error
  }
}

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
    console.log("Freshservice response:", result)
    return result
  } catch (error) {
    console.error("Freshservice API error:", error)
    throw error
  }
}

// Department Setup Modal
const DepartmentSetupModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [departmentId, setDepartmentId] = useState("")

  const handleSubmit = () => {
    if (departmentId.trim()) {
      onSubmit(departmentId.trim())
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Setup Department</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={loading}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Department ID</label>
            <input
              type="text"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter department ID (e.g., 27000502000)"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will fetch department details from Freshservice and save to your profile
            </p>
          </div>
          <p className="text-xs text-yellow-600 bg-yellow-100 border border-yellow-300 rounded p-2 mb-4">
            ⚠️ Note: Only Freshservice-enabled customers are supported on this platform. Please ensure your company has a
            valid Freshservice account to proceed.
          </p>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
              disabled={loading || !departmentId.trim()}
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              ) : (
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
              )}
              {loading ? "Fetching..." : "Fetch & Setup"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// AWS Role Modal
const AWSRoleModal = ({ isOpen, onClose, onSubmit, loading, departmentInfo }) => {
  const [roleName, setRoleName] = useState("")
  const [roleArn, setRoleArn] = useState("")
  const [region, setRegion] = useState("us-east-1")
  const awsRegions = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-east-2", label: "US East (Ohio)" },
  { value: "us-west-1", label: "US West (N. California)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai)" },
  { value: "ap-south-2", label: "Asia Pacific (Hyderabad)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
  { value: "ap-northeast-2", label: "Asia Pacific (Seoul)" },
  { value: "ap-northeast-3", label: "Asia Pacific (Osaka)" },
  { value: "ca-central-1", label: "Canada (Central)" },
  { value: "eu-central-1", label: "Europe (Frankfurt)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
  { value: "eu-west-2", label: "Europe (London)" },
  { value: "eu-west-3", label: "Europe (Paris)" },
  { value: "eu-north-1", label: "Europe (Stockholm)" },
  { value: "sa-east-1", label: "South America (São Paulo)" }
];

  const handleSubmit = (e) => {
    e.preventDefault()
    if (roleName.trim() && roleArn.trim()) {
      onSubmit({
        roleName: roleName.trim(),
        roleArn: roleArn.trim(),
        region: region,
      })
      // Reset form
      setRoleName("")
      setRoleArn("")
      setRegion("us-east-1")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add AWS IAM Role</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={loading}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Adding AWS IAM Role for: <strong>{departmentInfo?.department_name}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter Account name (e.g., Production-CrossAccount)"
              disabled={loading}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">AWS IAM Role ARN</label>
            <input
              type="text"
              value={roleArn}
              onChange={(e) => setRoleArn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="arn:aws:iam::123456789012:role/YourRoleName"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter the full ARN of the IAM role you want to assume</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">AWS Region</label>
            {/* <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            >
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">Europe (Ireland)</option>
              <option value="ap-south-1">Asia Pacific (Mumbai)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
            </select> */}
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full max-h-52 overflow-y-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              disabled={loading}
            >
              {awsRegions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              disabled={loading || !roleName.trim() || !roleArn.trim()}
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              ) : (
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
              )}
              {loading ? "Adding..." : "Add Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Main Dashboard Component
const Dashboard = () => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [ticketsData, setTicketsData] = useState(null)
  const [departments, setDepartments] = useState([])
  const [activeDepartment, setActiveDepartment] = useState(null)
  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("")
  const [user, setUser] = useState("")
  const [dashboardData, setDashboardData] = useState(null)
  const [resolvedCount, setResolvedCount] = useState(null)
  const [currentDepartmentId, setCurrentDepartmentId] = useState("")
  const [showTicketManagement, setShowTicketManagement] = useState(false)

  // CENTRALIZED CHATBOT STATE MANAGEMENT
  const [chatbotIsOpen, setChatbotIsOpen] = useState(false)
  const [showWelcomePopup, setShowWelcomePopup] = useState(true)
  const chatbotRef = useRef(null)

  // Chatbot control functions
  const openChatbot = (ticketInfo = null) => {
    setChatbotIsOpen(true)
    setShowWelcomePopup(false)

    if (ticketInfo && chatbotRef.current?.openWithTicketInfo) {
      chatbotRef.current.openWithTicketInfo(ticketInfo)
    }
  }

  const closeChatbot = () => {
    setChatbotIsOpen(false)
  }

  const toggleChatbot = () => {
    setShowWelcomePopup(false)
    setChatbotIsOpen(!chatbotIsOpen)
  }

  const hideWelcomePopup = () => {
    setShowWelcomePopup(false)
  }

  // Handle ask chatbot from ticket management
  const handleAskChatbot = (subject, reason) => {
    console.log("Dashboard handleAskChatbot called with:", { subject, reason })

    // Hide welcome popup
    setShowWelcomePopup(false)

    // Create ticket info object
    const ticketInfo = {
      description: `Subject: ${subject}\nReason: ${reason}\n\nPlease analyze this issue and provide remediation steps or guidance.`,
    }

    // Open chatbot with ticket info
    openChatbot(ticketInfo)
  }

  // AWS Regions list
const awsRegions = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-east-2", label: "US East (Ohio)" },
  { value: "us-west-1", label: "US West (N. California)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai)" },
  { value: "ap-south-2", label: "Asia Pacific (Hyderabad)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
  { value: "ap-northeast-2", label: "Asia Pacific (Seoul)" },
  { value: "ap-northeast-3", label: "Asia Pacific (Osaka)" },
  { value: "ca-central-1", label: "Canada (Central)" },
  { value: "eu-central-1", label: "Europe (Frankfurt)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
  { value: "eu-west-2", label: "Europe (London)" },
  { value: "eu-west-3", label: "Europe (Paris)" },
  { value: "eu-north-1", label: "Europe (Stockholm)" },
  { value: "sa-east-1", label: "South America (São Paulo)" }
];

  // Load user data and check initialization on component mount
  useEffect(() => {
    console.log("Dashboard component mounted, calling loadUserData")
    const name = sessionStorage.getItem("name")
    setUser(name)
    loadUserData()
  }, [])

  // Fetch dashboard data when active department changes
  useEffect(() => {
    if (currentDepartmentId && isInitialized) {
      console.log("Fetching dashboard data for department:", currentDepartmentId)
      fetchDashboardData()
    }
  }, [currentDepartmentId, selectedRole, isInitialized])

  const loadUserData = async () => {
    console.log("=== LOAD USER DATA START ===")
    try {
      setInitialLoading(true)

      // Get user departments from backend
      const departmentsResponse = await apiCall("getDepartments")
      console.log("Departments Response:", departmentsResponse)

      if (departmentsResponse.departments && departmentsResponse.departments.length > 0) {
        setDepartments(departmentsResponse.departments)

        // Find the active department or use the first one
        let currentActiveDepartment = null
        if (departmentsResponse.defaultDepartment) {
          currentActiveDepartment = departmentsResponse.defaultDepartment
        } else {
          currentActiveDepartment =
            departmentsResponse.departments.find((dept) => dept.is_active) || departmentsResponse.departments[0]
        }

        console.log("Selected active department:", currentActiveDepartment)

        if (currentActiveDepartment) {
          setActiveDepartment(currentActiveDepartment)
          setCurrentDepartmentId(currentActiveDepartment.department_id)

          // Extract roles from the active department
          const departmentRoles = currentActiveDepartment.roles || []
          console.log("Department Roles:", departmentRoles)
          setRoles(departmentRoles)

          // Set the active role and region
          const activeRole = departmentRoles.find((role) => role.is_active)
          if (activeRole) {
            setSelectedRegion(activeRole.region)
            setSelectedRole(activeRole.role_id)
          } else {
            // Reset if no active role
            setSelectedRole("")
            setSelectedRegion("")
          }

          setIsInitialized(true)
        }
      } else {
        console.log("No departments found, showing setup modal")
        setIsInitialized(false)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setIsInitialized(false)
    } finally {
      setInitialLoading(false)
      console.log("=== LOAD USER DATA END ===")
    }
  }

  const fetchDashboardData = async () => {
    console.log("=== FETCH DASHBOARD DATA START ===")
    console.log("Using Department ID:", currentDepartmentId)

    if (!currentDepartmentId) {
      console.log("Missing department ID for fetchDashboardData")
      return
    }

    setLoading(true)
    try {
      // Use the same department ID for Freshservice API calls
      const query = `department_id:${currentDepartmentId}`
      const ticketsUrl = `/tickets/filter?query="${query}"&page=1&per_page=100`
      console.log("Calling Freshservice with URL:", ticketsUrl)

      const ticketsResponse = await freshserviceCall(ticketsUrl)
      console.log("Tickets Data from Freshservice:", ticketsResponse)
      console.log("Number of tickets:", ticketsResponse?.tickets?.length || 0)
      setTicketsData(ticketsResponse)

      // Get active role details for AWS integration
      if (activeDepartment) {
        try {
          const roleResponse = await apiCall("getActiveRole", {
            department_id: activeDepartment.department_id,
          })
          // console.log("hellllllllllllllllooooooooooooooooooooooooooooooooooooo",roleResponse);
          setDashboardData(roleResponse.active_role)
          setResolvedCount(roleResponse.active_role?.Remediation_Count?.length)
        } catch (error) {
          console.log("No active role found")
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setTicketsData(null)
    } finally {
      setLoading(false)
      console.log("=== FETCH DASHBOARD DATA END ===")
    }
  }

  const fetchDepartmentFromFreshservice = async (departmentId) => {
    console.log("Fetching department from Freshservice:", departmentId)
    try {
      const response = await freshserviceCall(`/departments/${departmentId}`)
      console.log("Department details from Freshservice:", response)
      return response.department
    } catch (error) {
      console.error("Error fetching department from Freshservice:", error)
      throw error
    }
  }

  const handleDepartmentSetup = async (departmentId) => {
    console.log("Setting up department:", departmentId)
    setLoading(true)
    try {
      // Fetch department details from Freshservice first
      const departmentDetails = await fetchDepartmentFromFreshservice(departmentId)
      console.log("Department name:", departmentDetails.name)

      // Save department using backend API - pass the same department ID
      const response = await apiCall("saveDepartment", {
        departmentName: departmentDetails.name,
        departmentId: departmentId,
      })

      console.log("Save department response:", response)

      if (response?.department) {
        // Set this as active department
        await apiCall("setActiveDepartment", {
          department_id: response.department.department_id,
        })

        // Reload user data to get updated departments
        await loadUserData()
        setShowDepartmentModal(false)
      }
    } catch (error) {
      console.error("Error setting up department:", error)
      toast.error("Error setting up department. Please check the department ID and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddRole = async (roleData) => {
    setLoading(true)
    try {
      const response = await apiCall("saveRoleArn", {
        role: {
          userId: getCurrentUserId(),
          department_id: activeDepartment.department_id,
          roleName: roleData.roleName,
          roleArn: roleData.roleArn,
          region: roleData.region,
        },
      })

      if (response.role) {
        // Reload user data to get updated departments with roles
        await loadUserData()
        setShowRoleModal(false)
        toast.success("AWS IAM Role added successfully!")
      }
    } catch (error) {
      console.error("Error adding AWS role:", error)
      toast.error("Error adding AWS role. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDepartmentChange = async (departmentId) => {
    console.log("Changing department to:", departmentId)
    try {
      // Find the selected department from the departments array
      const selectedDepartment = departments.find((d) => d.department_id === departmentId)

      if (selectedDepartment) {
        setActiveDepartment(selectedDepartment)
        setCurrentDepartmentId(selectedDepartment.department_id)

        // Extract roles from the selected department
        const departmentRoles = selectedDepartment.roles || []
        console.log("Selected Department Roles:", departmentRoles)
        setRoles(departmentRoles)

        // Set active role if available
        const activeRole = departmentRoles.find((role) => role.is_active)
        if (activeRole) {
          setSelectedRole(activeRole.role_id)
          setSelectedRegion(activeRole.region)
        } else {
          setSelectedRole("")
          setSelectedRegion("")
        }

        // Set this department as active in backend
        await apiCall("setActiveDepartment", {
          department_id: departmentId,
        })
      }
    } catch (error) {
      console.error("Error changing department:", error)
    }
  }

  const handleRoleChange = async (roleId) => {
    localStorage.clear()
    if (!roleId) {
      setSelectedRole("")
      setSelectedRegion("")
      return
    }

    try {
      await apiCall("setActiveRole", {
        department_id: activeDepartment.department_id,
        role_id: roleId,
      })

      setSelectedRole(roleId)

      // Update region based on selected role
      const selectedRoleData = roles.find((role) => role.role_id === roleId)
      if (selectedRoleData) {
        setSelectedRegion(selectedRoleData.region)
      }

      // Refresh dashboard data
      await fetchDashboardData()
    } catch (error) {
      console.error("Error changing role:", error)
    }
  }

  const handleRegionChange = async (newRegion) => {
    if (!selectedRole || !newRegion) {
      setSelectedRegion(newRegion)
      return
    }

    // setLoading(true)
    try {
      // Update the role region in the database
      const response = await apiCall("updateRoleRegion", {
        department_id: activeDepartment.department_id,
        role_id: selectedRole,
        region: newRegion,
      })

      if (response.role) {
        setSelectedRegion(newRegion)

        // Reload user data to get updated roles
        // await loadUserData()

        // Refresh dashboard data with new region
        // await fetchDashboardData()

        toast.success(`Region updated to ${newRegion} successfully!`)
      }
    } catch (error) {
      console.error("Error updating region:", error)
      toast.error("Error updating region. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle ticket management toggle with chatbot popup control
  const handleTicketToggle = () => {
    const newShowTicketManagement = !showTicketManagement
    setShowTicketManagement(newShowTicketManagement)

    // Hide chatbot welcome popup when toggling ticket management
    hideWelcomePopup()
  }

  // Show loading screen during initial load
  if (initialLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-purple-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Initial setup screen
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <FontAwesomeIcon icon={faBuilding} className="text-6xl text-purple-500 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Security Dashboard</h1>
              <p className="text-gray-600 mb-4">
                Get started by setting up your first department. We'll fetch the department details from Freshservice
                and save it to your profile.
              </p>
            </div>

            <button
              onClick={() => setShowDepartmentModal(true)}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 flex items-center mx-auto text-lg font-medium"
            >
              <FontAwesomeIcon icon={faBuilding} className="mr-3" />
              Setup Your First Department
            </button>
          </div>
        </div>

        <DepartmentSetupModal
          isOpen={showDepartmentModal}
          onClose={() => setShowDepartmentModal(false)}
          onSubmit={handleDepartmentSetup}
          loading={loading}
        />
      </div>
    )
  }

  // Main dashboard
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-6">
        {/* Header with dropdowns */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Department Dropdown */}
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faBuilding} className="text-gray-500" />
              <select
                value={activeDepartment?.department_id || ""}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white min-w-[150px]"
              >
                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowDepartmentModal(true)}
                className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                title="Add Department"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>

            {/* <button
              onClick={handleTicketToggle}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {showTicketManagement ? "Hide Tickets" : "View Tickets"}
            </button> */}
          </div>
        </div>

        {/* Remediation Environment Section - Simple Version */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faRobot} className="mr-2 text-blue-600" />
                Chatbot Remediation Environment
              </h3>
              <p className="text-sm text-gray-600 mt-1">Select AWS account and region for remediation actions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AWS Account Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <FontAwesomeIcon icon={faUserShield} className="mr-2 text-blue-600" />
                  AWS Account
                </label>
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="px-5 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                  title="Add AWS Account"
                  disabled={!activeDepartment}
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-1" />
                  Add AWS Account
                </button>
              </div>

              {roles.length > 0 ? (
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {/* <option value="">Select AWS Account</option> */}
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 text-center text-sm">
                  No AWS accounts configured
                </div>
              )}
            </div>

            {/* Region Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 py-1.5">
                <FontAwesomeIcon icon={faGlobe} className="mr-2 text-purple-600" />
                AWS Region
              </label>

              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                disabled={!selectedRole || loading}
              >
                {/* <option value="">Select Region</option> */}
                {awsRegions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Simple Status */}
          {selectedRole && selectedRegion && (
            <div className="mt-3 p-2 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                Ready for remediation in {roles.find((r) => r.role_id === selectedRole)?.role_name} (
                {awsRegions.find((r) => r.value === selectedRegion)?.label})
              </p>
            </div>
          )}
        </div>

        {/* Dashboard Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FontAwesomeIcon icon={faSpinner} className="text-4xl text-purple-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <>
            <StatCards
              ticketsData={ticketsData}
              selectedRole={selectedRole}
              activeDepartment={activeDepartment}
              dashboardData={dashboardData}
              resolvedCount={resolvedCount}
              freshserviceDepartmentId={currentDepartmentId}
            />
            <Charts ticketsData={ticketsData} activeDepartment={activeDepartment} />
          </>
        )}

        {true && (
          <div className="mt-6">
            <TicketManagement activeDepartment={activeDepartment} onAskChatbot={handleAskChatbot} />
          </div>
        )}

        {/* Modals */}
        <DepartmentSetupModal
          isOpen={showDepartmentModal}
          onClose={() => setShowDepartmentModal(false)}
          onSubmit={handleDepartmentSetup}
          loading={loading}
        />

        <AWSRoleModal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          onSubmit={handleAddRole}
          loading={loading}
          departmentInfo={activeDepartment}
        />
      </div>

      {/* Pass chatbot state as props */}
      <Chatbot
        ref={chatbotRef}
        isOpen={chatbotIsOpen}
        showWelcomePopup={showWelcomePopup}
        onToggle={toggleChatbot}
        onOpen={openChatbot}
        onClose={closeChatbot}
        onHideWelcomePopup={hideWelcomePopup}
      />
    </div>
  )
}

export default Dashboard
