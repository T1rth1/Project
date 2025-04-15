import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle, faUser, faCalendarAlt, faClipboardList } from '@fortawesome/free-solid-svg-icons';

export default function Modal({ incident, onClose }) {
  if (!incident) return null;

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-red-500" />
            Incident Details
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{incident.title}</h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(incident.severity)} mb-4`}>
              {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)} severity
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Detailed description of the incident would appear here. This would include information about when it was detected, affected systems, and potential impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faUser} className="text-gray-500 dark:text-gray-400 mr-2" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Assigned To</span>
              </div>
              <p className="text-gray-900 dark:text-white">{incident.assignedTo}</p>
            </div> */}

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500 dark:text-gray-400 mr-2" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Date Reported</span>
              </div>
              <p className="text-gray-900 dark:text-white">{incident.date}</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
            <div className="flex items-center mb-2">
              <FontAwesomeIcon icon={faClipboardList} className="text-gray-500 dark:text-gray-400 mr-2" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Status</span>
            </div>
            <div className="flex items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(incident.severity)}`}>
                {incident.status.replace('-', ' ').charAt(0).toUpperCase() + incident.status.replace('-', ' ').slice(1)}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {/* <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              Assign to me
            </button> */}
            <button onClick={onClose} className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
