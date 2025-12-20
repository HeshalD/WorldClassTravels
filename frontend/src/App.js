import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import LandingPage from './Pages/LandingPage';
import AdminLogin from './Pages/Admin/AdminLogin';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import ProtectedRoute from './Components/Auth/ProtectedRoute';

function App() {
  return (
      <div className='w-full min-h-screen bg-gray-50'>
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<LandingPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect any other /admin/* to login */}
          <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
          
          {/* 404 Route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
  );
}

export default App;
