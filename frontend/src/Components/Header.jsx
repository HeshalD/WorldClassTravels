import logo from "../Images/logo.png"

export default function Header() {
  return (
    <header className="bg-white/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img src={logo} alt='WCT Logo' className="w-[240px] object-contain ml-[-150px]"/>
            </div>
          </div>

          {/* Navigation Options */}
          <nav className="flex space-x-8">
            <a
              href="#home"
              className="text-white hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Home
            </a>
            <a
              href="#about"
              className="text-white hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              About
            </a>
            <a
              href="#services"
              className="text-white hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Services
            </a>
            <a
              href="#contact"
              className="text-white hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}