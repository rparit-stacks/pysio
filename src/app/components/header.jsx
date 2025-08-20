"use client";
import {
  Menu,
  X,
  LogOut,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  Search,
  Briefcase,
  Info,
  Contact,
  User
} from "lucide-react";
import { useState } from "react";
import { logout } from "../../lib/auth"; 

const Header = ({ user = null }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
         <div className="flex items-center gap-3 mt-2">
  <a href="/" className="cursor-pointer block">
    <img
      src="/logo.png"
      alt="Abaile Logo"
      className="h-16 sm:h-20 mb-4 md:h-24 lg:h-28 w-auto max-w-[240px] transition-opacity duration-200 hover:opacity-80"
    />
  </a>
</div>


          {/* Mobile Social Icons */}
          <div className="flex items-center space-x-4 md:hidden">
            <a
              href="tel:18008647479"
              className="text-gray-700 hover:text-[#7ce3b1] transition-colors duration-200"
            >
              <Phone size={18} />
            </a>
            <a
              href="mailto:info@abhailephysiotherapy.com"
              className="text-gray-700 hover:text-[#7ce3b1] transition-colors duration-200"
            >
              <Mail size={18} />
            </a>
            <a
              href="https://wa.me/911234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-[#7ce3b1] transition-colors duration-200"
            >
              <MessageCircle size={18} />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/find-therapist"
              className="text-gray-700 hover:text-[#7ce3b1] font-medium flex items-center space-x-1 transition-colors duration-200"
            >
              <Search size={18} />
              <span>Find Therapists</span>
            </a>
            <a
              href="/services"
              className="text-gray-700 hover:text-[#7ce3b1] font-medium flex items-center space-x-1 transition-colors duration-200"
            >
              <Briefcase size={18} /> <span>Services</span>
            </a>
            <a
              href="/about"
              className="text-gray-700 hover:text-[#7ce3b1] font-medium flex items-center space-x-1 transition-colors duration-200"
            >
              <Info size={18} /> <span>About</span>
            </a>
            <a
              href="/contact"
              className="text-gray-700 hover:text-[#7ce3b1] font-medium flex items-center space-x-1 transition-colors duration-200"
            >
              <Contact size={18} /> <span>Contact</span>
            </a>

            {/* Social Icons Desktop */}
            <div className="flex items-center space-x-4">
              <a
                href="tel:18008647479"
                className="text-gray-700 hover:text-[#7ce3b1] transition-colors duration-200"
              >
                <Phone size={18} />
              </a>
              <a
                href="mailto:info@abhailephysiotherapy.com"
                className="text-gray-700 hover:text-[#7ce3b1] transition-colors duration-200"
              >
                <Mail size={18} />
              </a>
              <a
                href="https://wa.me/911234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-[#7ce3b1] transition-colors duration-200"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex cursor-pointer items-center space-x-3 text-gray-700 hover:text-[#7ce3b1] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-[#7ce3b1] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.firstName?.charAt(0)?.toUpperCase()}
                      {user.lastName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">{`${user.firstName} ${user.lastName}`}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      {/* <p className="text-sm font-medium text-gray-900">{`${user.firstName} ${user.lastName}`}</p>
                      <p className="text-sm text-gray-500">{user.email}</p> */}
                      {user.role && (
                        <p className="text-xs text-gray-400 capitalize">
                          {user.role.name}
                        </p>
                      )}
                    </div>

                    <div className="cursor-pointer py-2 border-b border-gray-100">
                      <a href="/my-bookings" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>My Bookings</span>
                      </a>
                    </div>
                    <div className="cursor-pointer py-2 border-b border-gray-100">
                      <a href="/dashboard/profile" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </a>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full  text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a
                  href="/login"
                  className="text-gray-700 hover:text-[#7ce3b1] px-4 py-2 font-medium transition-colors duration-200"
                >
                  Sign In
                </a>
                <a
                  href="/find-therapist"
                  className="bg-emerald-600 hover:bg-[#6dd4a2] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Book Now
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <a href="/find-therapist" className="flex items-center space-x-2 text-gray-700 hover:text-[#7ce3b1]">
                <Search size={18} /> <span>Find Therapists</span>
              </a>
              <a href="/services" className="flex items-center space-x-2 text-gray-700 hover:text-[#7ce3b1]">
                <Briefcase size={18} /> <span>Services</span>
              </a>
              <a href="/about" className="flex items-center space-x-2 text-gray-700 hover:text-[#7ce3b1]">
                <Info size={18} /> <span>About</span>
              </a>
              <a href="/contact" className="flex items-center space-x-2 text-gray-700 hover:text-[#7ce3b1]">
                <Contact size={18} /> <span>Contact</span>
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
