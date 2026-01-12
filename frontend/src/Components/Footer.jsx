import React, { useState } from 'react';
import { Twitter, Facebook, Instagram, Youtube, Linkedin, MapPin, Phone, Mail } from 'lucide-react';
import logo from '../Images/logo.png';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (email) {
      alert(`Subscribed with email: ${email}`);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#0a2351] text-white">
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div>
            <img src={logo} alt="World Class Travels" className="h-32" />
            <p className="text-gray-300 text-sm leading-relaxed">
              Your gateway to unforgettable travel experiences. We create personalized journeys that leave lasting memories.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-3 mt-6">
              <button className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-cyan-400 transition-colors">
                <Twitter size={18} />
              </button>
              <button className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-cyan-400 transition-colors">
                <Facebook size={18} />
              </button>
              <button className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-cyan-400 transition-colors">
                <Instagram size={18} />
              </button>
              <button className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-cyan-400 transition-colors">
                <Youtube size={18} />
              </button>
              <button className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-cyan-400 transition-colors">
                <Linkedin size={18} />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><button className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">Home</button></li>
              <li><button className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">Destination</button></li>
              <li><button className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">Ticketing</button></li>
              <li><button className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">Travel Visa</button></li>
              <li><button className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">About Us</button></li>
              <li><button className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">Contact Us</button></li>
            </ul>
          </div>

          {/* Customer Services & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Services</h3>
            <ul className="space-y-2 mb-8">
              <li><button className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">FAQ</button></li>
              <li><button className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">Privacy Policy</button></li>
              <li><button className="text-gray-300 hover:text-cyan-400 transition-colors text-sm">Terms of Service</button></li>
            </ul>

            <h3 className="text-lg font-semibold mb-4">Join our newsletter</h3>
            <div className="mb-6">
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-l-md focus:outline-none focus:border-cyan-400 text-sm"
                />
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-cyan-400 hover:bg-cyan-500 rounded-r-md font-semibold text-sm transition-colors"
                >
                  SUBMIT
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-cyan-400" />
                <span className="text-gray-300">123 Travel Street, Wanderlust City, 10001</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="flex-shrink-0 text-cyan-400" />
                <span className="text-gray-300">+1 (234) 567-890</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="flex-shrink-0 text-cyan-400" />
                <a href="mailto:info@worldclasstravels.com" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  info@worldclasstravels.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 XXXXX (Pvt) Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}