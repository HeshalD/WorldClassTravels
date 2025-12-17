import logo from "../Images/logo.png"

export default function Header() {
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
            <a
              href="#home"
              className="text-white hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Home
            </a>
            <a
              href="#ticketing"
              className="text-white hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Ticketing
            </a>
            <a
              href="#travevisa"
              className="text-white hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Travel Visa
            </a>
            <a
              href="#tours"
              className="text-white hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Tours
            </a>
          </nav>

          {/* Login Button */}
          <a href="#_" class="relative inline-block text-lg group">
            <span class="relative z-10 block px-[20px] py-[5px] overflow-hidden font-medium leading-tight text-white transition-all duration-300 ease-out border border-white rounded-lg group-hover:text-white group-hover:scale-105">
              <span class="absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-transparent"></span>
              <span class="absolute left-0 w-48 h-48 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-gradient-to-r from-primaryBlue to-secondaryBlue group-hover:-rotate-180 ease"></span>
              <span class="relative">Login</span>
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}