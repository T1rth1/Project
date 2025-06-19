import { useState, useEffect } from 'react';
import { 
  faExclamationTriangle, 
  faSearch, 
  faFilter, 
  faSpinner, 
  faSortAmountDown,
  faExclamationCircle, 
  faRedoAlt 
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from "./Modal.js"
import Chatbot from './Chatbot.jsx';
// Modal component for displaying ticket details
// const Modal = ({ ticket, onClose }) => {
//   if (!ticket) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
//           <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//             Ticket #{ticket.id}
//           </h2>
//           <button 
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
//           >
//             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>
//         <div className="p-4">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{ticket.title}</h3>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//             <div>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
//               <p className="font-medium text-gray-900 dark:text-white capitalize">{ticket.status}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
//               <p className="font-medium text-gray-900 dark:text-white capitalize">{ticket.severity}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Created On</p>
//               <p className="font-medium text-gray-900 dark:text-white">{ticket.date}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
//               <p className="font-medium text-gray-900 dark:text-white">{ticket.assignedTo}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Requested By</p>
//               <p className="font-medium text-gray-900 dark:text-white">{ticket.requester}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Due By</p>
//               <p className="font-medium text-gray-900 dark:text-white">{ticket.dueBy}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
//               <p className="font-medium text-gray-900 dark:text-white">{ticket.category}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
//               <p className="font-medium text-gray-900 dark:text-white">{ticket.type}</p>
//             </div>
//           </div>
          
//           <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
//             <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
//             <div
//               className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-gray-700 dark:text-gray-300"
//               dangerouslySetInnerHTML={{ __html: ticket.description }}
//             />
//           </div>
//         </div>
//         <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// FreshService API configuration
const FRESH_SERVICE_API = {
  BASE_URL: process.env.REACT_APP_FRESH_SERVICE_BASE_URL,
  HEADERS: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa(`${process.env.REACT_APP_FRESH_SERVICE_API_KEY}:X`)
  }
};

export default function TicketManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    agent_id: ''
  });
  const [agents, setAgents] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });

  // Map FreshService priorities to severity levels
  const priorityToSeverity = {
    4: 'critical',
    3: 'high',
    2: 'medium',
    1: 'low'
  };

  // Map FreshService status to our status
  const statusMapping = {
    2: 'open',
    3: 'pending',
    4: 'resolved',
    5: 'closed',
    6: 'waiting on customer',
    7: 'waiting on third party'
  };
  
  // Get status name from status ID for debugging
  const getStatusName = (statusId) => {
    return statusMapping[statusId] || `unknown (${statusId})`;
  };

  // Fetch tickets from FreshService API
  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        // FreshService API for tickets with pagination to get more records
        // Default FreshService pagination is 30 records, we'll fetch 100
        const response = await fetch(`${FRESH_SERVICE_API.BASE_URL}/tickets?per_page=100&include=requester,stats`, {
          headers: FRESH_SERVICE_API.HEADERS
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Tickets fetched:', data);
        
        if (!data.tickets || !Array.isArray(data.tickets)) {
          console.error('Unexpected API response format:', data);
          throw new Error('Invalid API response format');
        }
        
        // Transform FreshService data to our format
        const transformedTickets = data.tickets.map(ticket => ({
          id: ticket.id,
          title: ticket.subject || 'No Subject',
          status: statusMapping[ticket.status] || 'open',
          severity: priorityToSeverity[ticket.priority] || 'medium',
          date: ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'Unknown',
          assignedTo: ticket.responder_id || 'Unassigned',
          description: ticket.description || 'No description provided',
          requester: ticket.requester.name || 'Unknown',
          dueBy: ticket.due_by ? new Date(ticket.due_by).toLocaleDateString() : 'Not set',
          category: ticket.category || 'Other',
          type: ticket.type || 'Not specified',
          createdAt: ticket.created_at,
          updatedAt: ticket.updated_at
        }));
        
        console.log('Transformed tickets:', transformedTickets.length);
        setTickets(transformedTickets);
        setError(null);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load tickets. Please try again later.');
        
        // Fallback data for development/testing if API fails
        setTickets([
          { id: 1, title: 'Email service down', status: 'open', severity: 'high', date: '2023-05-15', assignedTo: 'John Doe', description: 'Users unable to send or receive emails.' },
          { id: 2, title: 'Network connectivity issues', status: 'pending', severity: 'critical', date: '2023-05-14', assignedTo: 'Jane Smith', description: 'Multiple departments reporting intermittent connection problems.' },
          { id: 3, title: 'Software license expired', status: 'resolved', severity: 'medium', date: '2023-05-10', assignedTo: 'Mike Johnson', description: 'Adobe Creative Suite licenses need renewal.' },
          { id: 4, title: 'New equipment setup', status: 'open', severity: 'low', date: '2023-05-08', assignedTo: 'Sarah Williams', description: 'Need assistance setting up new laptops for marketing team.' },
          { id: 5, title: 'Password reset', status: 'closed', severity: 'low', date: '2023-05-05', assignedTo: 'John Doe', description: 'User cannot access their account.' },
          { id: 6, title: 'VPN access issue', status: 'open', severity: 'medium', date: '2023-04-28', assignedTo: 'Jane Smith', description: 'Unable to connect to VPN from remote location.' },
          { id: 7, title: 'Printer configuration', status: 'resolved', severity: 'low', date: '2023-04-15', assignedTo: 'Mike Johnson', description: 'Need to add new printer to network.' },
          { id: 8, title: 'Database error', status: 'pending', severity: 'high', date: '2023-03-22', assignedTo: 'Sarah Williams', description: 'Application throws database connection error.' },
          { id: 9, title: 'File server access', status: 'closed', severity: 'medium', date: '2023-03-10', assignedTo: 'John Doe', description: 'New team needs access to project files.' },
          { id: 10, title: 'Mobile device setup', status: 'resolved', severity: 'low', date: '2023-02-18', assignedTo: 'Jane Smith', description: 'Configure email on new company phones.' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch agents for filter dropdown
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${FRESH_SERVICE_API.BASE_URL}/agents`, {
          headers: FRESH_SERVICE_API.HEADERS
        });
        
        if (response.ok) {
          const data = await response.json();
          setAgents(data.agents);
        }
      } catch (err) {
        console.error('Error fetching agents:', err);
      }
    };

    fetchTickets();
    fetchAgents();
  }, []);

  // For handling sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort tickets
  const filteredTickets = tickets
    .filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (ticket?.assignedTo && typeof ticket.assignedTo === 'string' && ticket.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = !filters.status || ticket.status === filters.status;
        const matchesPriority = !filters.priority || ticket.severity === filters.priority;
        const matchesAgent = !filters.agent_id || ticket.assignedTo === filters.agent_id;

        return matchesSearch && matchesStatus && matchesPriority && matchesAgent;
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
      case 'waiting on customer': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
      case 'waiting on third party': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-500 dark:text-orange-400';
      case 'medium': return 'text-yellow-500 dark:text-yellow-400';
      case 'low': return 'text-blue-500 dark:text-blue-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'critical': return <FontAwesomeIcon icon={faExclamationCircle} className="mr-2 text-red-600 dark:text-red-400" />;
      case 'high': return <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-orange-500 dark:text-orange-400" />;
      case 'medium': return <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-yellow-500 dark:text-yellow-400" />;
      case 'low': return <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-blue-500 dark:text-blue-400" />;
      default: return <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-gray-500 dark:text-gray-400" />;
    }
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const refreshTickets = () => {
    setIsLoading(true);
    fetch(`${FRESH_SERVICE_API.BASE_URL}/tickets?per_page=100&include=requester,stats`, {
      headers: FRESH_SERVICE_API.HEADERS
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!data.tickets || !Array.isArray(data.tickets)) {
          throw new Error('Invalid API response format');
        }
        
        const transformedTickets = data.tickets.map(ticket => ({
          id: ticket.id,
          title: ticket.subject || 'No Subject',
          status: statusMapping[ticket.status] || 'open',
          severity: priorityToSeverity[ticket.priority] || 'medium',
          date: ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'Unknown',
          assignedTo: ticket.responder_id || 'Unassigned',
          description: ticket.description || 'No description provided',
          requester: ticket.requester.name || 'Unknown',
          dueBy: ticket.due_by ? new Date(ticket.due_by).toLocaleDateString() : 'Not set',
          category: ticket.category || 'Other',
          type: ticket.type || 'Not specified',
          createdAt: ticket.created_at,
          updatedAt: ticket.updated_at
        }));
        
        console.log(`Refreshed ${transformedTickets.length} tickets`);
        setTickets(transformedTickets);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error refreshing tickets:', err);
        setIsLoading(false);
        setError('Failed to refresh tickets. Please try again later.');
      });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-white">Ticket Management</h1>
          {isLoading && (
            <FontAwesomeIcon 
              icon={faSpinner} 
              className="ml-3 text-blue-500 animate-spin" 
              size="lg"
            />
          )}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={refreshTickets} 
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
            title="Refresh"
          >
            <FontAwesomeIcon icon={faRedoAlt} />
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search tickets..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-3 text-gray-400 dark:text-gray-300" 
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`px-4 py-2 rounded-lg border ${showFilters ? 'bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'} hover:bg-gray-100 dark:hover:bg-gray-600`}
          >
            <FontAwesomeIcon icon={faFilter} className="mr-2" />
            Filter
          </button>
          <button 
            onClick={() => {
              setSortConfig({
                key: 'date',
                direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
              });
            }} 
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <FontAwesomeIcon icon={faSortAmountDown} className="mr-2" />
            Sort {sortConfig.direction === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="waiting on customer">Waiting on Customer</option>
                <option value="waiting on third party">Waiting on Third Party</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
              >
                <option value="">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned To</label>
              <select 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={filters.agent_id}
                onChange={(e) => setFilters({...filters, agent_id: e.target.value})}
              >
                <option value="">All Agents</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.name}>{agent.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button 
              onClick={() => setFilters({ priority: '', status: '', agent_id: '' })}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-purple-100 dark:bg-gray-700">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('id')}
                >
                  ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('title')}
                >
                  Subject {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('status')}
                >
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('severity')}
                >
                  Priority {sortConfig.key === 'severity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('date')}
                >
                  Created {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('assignedTo')}
                >
                  Assigned To {sortConfig.key === 'assignedTo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('requester')}
                >
                  Requester {sortConfig.key === 'requester' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    Loading tickets...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No tickets found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => handleTicketClick(ticket)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{ticket.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        {getSeverityIcon(ticket.severity)}
                        <span className="line-clamp-1">{ticket.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span className={`capitalize ${getSeverityColor(ticket.severity)}`}>
                        {ticket.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {ticket.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {ticket.assignedTo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {ticket.requester}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <Modal ticket={selectedTicket} onClose={() => setIsModalOpen(false)} />
      )}
      <div>
        <Chatbot/>
      </div>
    </div>
  );
}