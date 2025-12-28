import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from "../Images/logo.png"

export default function Header() {
  const { user } = useAuth();
  return (
    <header className="bg-gradient-to-t from-transparent to-black/20">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex  items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img src={logo} alt='WCT Logo' className="w-[100px] object-contain" />
            </div>
          </div>

          {/* Navigation Options */}
          <nav className="flex space-x-36 flex-1 justify-center uppercase">
            <Link
              to="/"
              className="text-white hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <a
              href="/ticketing"
              className="text-white hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Ticketing
            </a>
            <Link
              to="/visa-select"
              className="text-white hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Travel Visa
            </Link>
            <a
              href="#tours"
              className="text-white hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Tours
            </a>
          </nav>

          {/* User Info / Login Button */}
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium uppercase"> {user.firstName}</span>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primaryBlue font-bold">
                {user.firstName.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <Link to="/login" className="relative inline-block text-lg group">
              <span className="relative z-10 block px-[20px] py-[5px] overflow-hidden font-medium leading-tight text-white transition-all duration-300 ease-out border border-white rounded-lg group-hover:text-white group-hover:scale-105">
                <span className="absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-transparent"></span>
                <span className="absolute left-0 w-48 h-48 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-gradient-to-r from-primaryBlue to-secondaryBlue group-hover:-rotate-180 ease"></span>
                <span className="relative">Login</span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}