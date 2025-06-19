import React, { useEffect, useState } from 'react';

const Modal = ({ ticket, onClose }) => {
  const [agent, setAgent] = useState(null);
  console.log("ticket from modal", ticket)
  // useEffect(() => {
  //   const fetchAgent = async () => {
  //     if (ticket && ticket.responder_id) {
  //       try {
  //         const response = await fetch(
  //           `https://cloudthattecJKKJKJKKJKJKJhnologiespvtlt.freshservice.com/api/v2/agents/${ticket.responder_id}`,
  //           {
  //             method: 'GET',
  //             headers: {
  //               'Content-Type': 'application/json',
  //               'Authorization': 'Basic ' + btoa('yVPm1NwCASASASASASAVI35Sz0uUEUS:X')
  //             },
  //           }
  //         );

  //         if (!response.ok) {
  //           throw new Error(`HTTP error! status: ${response.status}`);
  //         }

  //         const data = await response.json();
  //         setAgent(data.agent);
  //       } catch (error) {
  //         console.error('Error fetching agent details:', error);
  //       }
  //     }
  //   };

  //   fetchAgent();
  // }, [ticket]);

  // if (!ticket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Ticket #{ticket.id}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{ticket.title}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">{ticket.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">{ticket.severity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Created On</p>
              <p className="font-medium text-gray-900 dark:text-white">{ticket.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {ticket.assignedTo}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Requested By</p>
              <p className="font-medium text-gray-900 dark:text-white">{ticket.requester}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Due By</p>
              <p className="font-medium text-gray-900 dark:text-white">{ticket.dueBy}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
              <p className="font-medium text-gray-900 dark:text-white">{ticket.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
              <p className="font-medium text-gray-900 dark:text-white">{ticket.type}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
            <div
              className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: ticket.description }}
            />
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
