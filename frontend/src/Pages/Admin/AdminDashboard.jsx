import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { visaAPI, ticketAPI } from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Globe2, Ticket, LogOut, Clock, Plane } from 'lucide-react';
import logo from '../../Images/logo.png';

// Components
import VisaList from '../../Components/Admin/VisaList';
import TicketList from '../../Components/Admin/TicketList';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('visas');
  const [loading, setLoading] = useState(true);
  const [visas, setVisas] = useState([]);
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const admin = JSON.parse(localStorage.getItem('admin') || 'null');

  // Load data when component mounts
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [visaRes, ticketRes] = await Promise.all([
        visaAPI.getAll(),
        ticketAPI.getAll()
      ]);

      if (visaRes.data?.success) {
        setVisas(visaRes.data.data);
      }
      if (ticketRes.data) {
        setTickets(Array.isArray(ticketRes.data) ? ticketRes.data : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
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

  const pendingTickets = tickets.filter(
    (t) => (t.status || 'pending').toLowerCase() === 'pending'
  ).length;

  const navItems = [
    { key: 'visas', label: 'Visas', icon: Globe2 },
    { key: 'tickets', label: 'Tickets', icon: Ticket },
  ];

  const stats = [
    { label: 'Total Visas', value: visas.length, icon: Globe2, color: 'bg-primaryBlue/10 text-primaryBlue' },
    { label: 'Total Bookings', value: tickets.length, icon: Plane, color: 'bg-secondaryBlue/10 text-secondaryBlue' },
    { label: 'Pending Bookings', value: pendingTickets, icon: Clock, color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-primaryBlue to-secondaryBlue text-white flex flex-col shrink-0">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <img src={logo} alt="WCT Logo" className="w-10 h-10 object-contain bg-white rounded-lg p-1" />
          <div>
            <p className="font-gilroyMedium text-sm leading-tight">WorldClass Travels</p>
            <p className="text-white/60 text-xs font-gilroyRegular">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-gilroyMedium text-sm transition-colors ${
                activeTab === key
                  ? 'bg-white text-primaryBlue shadow-md'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-gilroyMedium text-sm">
              {admin?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-gilroyMedium truncate">{admin?.name || 'Admin'}</p>
              <p className="text-xs text-white/60 truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 justify-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-gilroyMedium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="bg-white shadow-sm px-8 h-16 flex items-center">
          <h1 className="text-lg font-gilroyMedium text-slate-800 capitalize">
            {activeTab === 'visas' ? 'Visa Management' : 'Ticket Management'}
          </h1>
        </header>

        <main className="p-8">
          <Outlet />

          {!location.pathname.includes('/admin/visas/new') && (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {stats.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-gilroyMedium text-slate-800">{value}</p>
                      <p className="text-sm text-slate-500 font-gilroyRegular">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryBlue"></div>
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
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
