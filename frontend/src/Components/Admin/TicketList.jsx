import React from 'react';
import { ticketAPI } from '../../services/api';
import { toast } from 'react-toastify';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

const TicketList = ({ tickets, onUpdateStatus }) => {
  const handleStatusChange = async (ticketId, newStatus) => {
    if (window.confirm(`Are you sure you want to mark this ticket as ${newStatus}?`)) {
      try {
        await onUpdateStatus(ticketId, newStatus);
      } catch (error) {
        toast.error('Failed to update ticket status');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Ticket Management</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Passenger
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trip
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No tickets found
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket._id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ticket.userFirstName} {ticket.userLastName}
                    </div>
                    <div className="text-sm text-gray-500">{ticket.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {ticket.departureLocation} → {ticket.arrivalLocation}
                    </div>
                    <div className="text-sm text-gray-500">
                      {ticket.tripType} • {ticket.cabinType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Dep: {formatDate(ticket.departureDate)}</div>
                    {ticket.returnDate && <div>Ret: {formatDate(ticket.returnDate)}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        statusColors[ticket.status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {ticket.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="space-y-2">
                      {ticket.status !== 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(ticket._id, 'confirmed')}
                          className="text-green-600 hover:text-green-900 block w-full text-left"
                        >
                          Confirm
                        </button>
                      )}
                      {ticket.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(ticket._id, 'cancelled')}
                          className="text-red-600 hover:text-red-900 block w-full text-left"
                        >
                          Cancel
                        </button>
                      )}
                      {ticket.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(ticket._id, 'completed')}
                          className="text-blue-600 hover:text-blue-900 block w-full text-left"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketList;
