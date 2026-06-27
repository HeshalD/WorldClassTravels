import React from 'react';
import { toast } from 'react-toastify';
import { CheckCircle2, XCircle, BadgeCheck } from 'lucide-react';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-primaryBlue/10 text-primaryBlue',
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
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-gilroyMedium text-slate-800">All Bookings</h2>
        <p className="text-sm text-slate-500 font-gilroyRegular">Review and update the status of flight booking requests</p>
      </div>

      <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-gilroyMedium text-slate-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-gilroyMedium text-slate-500 uppercase tracking-wider">
                  Passenger
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-gilroyMedium text-slate-500 uppercase tracking-wider">
                  Trip
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-gilroyMedium text-slate-500 uppercase tracking-wider">
                  Dates
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-gilroyMedium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-gilroyMedium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500 font-gilroyRegular">
                    No bookings found
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-gilroyRegular">
                      {ticket._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-gilroyMedium text-slate-800">
                        {ticket.userFirstName} {ticket.userLastName}
                      </div>
                      <div className="text-sm text-slate-500 font-gilroyRegular">{ticket.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-800 font-gilroyMedium">
                        {ticket.departureLocation} → {ticket.arrivalLocation}
                      </div>
                      <div className="text-sm text-slate-500 font-gilroyRegular">
                        {ticket.tripType} • {ticket.cabinType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-gilroyRegular">
                      <div>Dep: {formatDate(ticket.departureDate)}</div>
                      {ticket.returnDate && <div>Ret: {formatDate(ticket.returnDate)}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-gilroyMedium rounded-full ${
                          statusColors[ticket.status?.toLowerCase()] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {ticket.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1.5">
                        {ticket.status !== 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(ticket._id, 'confirmed')}
                            title="Confirm"
                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {ticket.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(ticket._id, 'completed')}
                            title="Mark as completed"
                            className="p-2 rounded-lg text-primaryBlue hover:bg-primaryBlue/10 transition-colors"
                          >
                            <BadgeCheck className="w-4 h-4" />
                          </button>
                        )}
                        {ticket.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusChange(ticket._id, 'cancelled')}
                            title="Cancel"
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
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
    </div>
  );
};

export default TicketList;
