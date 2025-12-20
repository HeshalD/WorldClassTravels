import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { visaAPI, ticketAPI } from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import VisaList from '../../Components/Admin/VisaList';
import TicketList from '../../Components/Admin/TicketList';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('visas');
  const [loading, setLoading] = useState(true);
  const [visas, setVisas] = useState([]);
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  // Load data when component mounts and when activeTab changes
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }
      
      try {
        await loadData();
      } catch (error) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        navigate('/admin/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // Reload data when activeTab changes
  useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      loadData();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'visas') {
        const { data } = await visaAPI.getAll();
        if (data.success) {
          setVisas(data.data);
        }
      } else {
        const { data } = await ticketAPI.getAll();
        if (data) {
          setTickets(Array.isArray(data) ? data : []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  const handleVisaDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this visa?')) {
      try {
        await visaAPI.delete(id);
        toast.success('Visa deleted successfully');
        await loadData();
      } catch (error) {
        toast.error('Failed to delete visa');
      }
    }
  };

  const handleTicketUpdate = async (id, status) => {
    try {
      await ticketAPI.update(id, { status });
      toast.success('Ticket updated successfully');
      await loadData();
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => handleTabChange('visas')}
                  className={`${
                    activeTab === 'visas'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Visas
                </button>
                <button
                  onClick={() => handleTabChange('tickets')}
                  className={`${
                    activeTab === 'tickets'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Tickets
                </button>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : activeTab === 'visas' ? (
              <VisaList 
                visas={visas} 
                onDelete={handleVisaDelete} 
                onUpdate={loadData} 
              />
            ) : (
              <TicketList 
                tickets={tickets} 
                onUpdateStatus={handleTicketUpdate} 
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
