import './App.css';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import LandingPage from './Pages/LandingPage';
import AdminLogin from './Pages/Admin/AdminLogin';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import ProtectedRoute from './Components/Auth/ProtectedRoute';
import Login from './Pages/Login';
import Register from './Pages/Register';
import RegistrationOTPVerification from './Pages/RegistrationOTPVerification';
import TicketingPage from './Pages/TicketingPage';
{/*import AddNewVisa from './Components/Admin/AddNewVisa';*/}

// Protected Route component for regular users
const ProtectedUserRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <div className='w-full min-h-screen bg-gray-50'>
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<LandingPage />} />
          <Route path='/ticketing' element={<TicketingPage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register/>}/>
          <Route path='/verify-registration' element={<RegistrationOTPVerification/>}/>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<div>Dashboard Content</div>} />
            <Route path="visas">
              {/*<Route path="new" element={
                <ProtectedRoute adminOnly={true}>
                  <AddNewVisa />
                </ProtectedRoute>
              } />*/}
            </Route>
          </Route>
          
          {/* Redirect any other /admin/* to login */}
          <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
          
          {/* Protected User Routes */}
          <Route element={<ProtectedUserRoute />}>
            <Route path="/dashboard" element={<div>User Dashboard</div>} />
            {/* Add more protected user routes here */}
          </Route>

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
    </AuthProvider>
  );
}

export default App;
