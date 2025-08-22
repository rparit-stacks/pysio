"use client";
import { Menu, X, LogOut, Calendar, Phone, Mail, Search, Briefcase, Info, Contact, User } from 'lucide-react';
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

  // WhatsApp SVG Icon Component
  const WhatsAppIcon = ({ size = 18, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
    </svg>
  );

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50 transition-all duration-500 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <a href="/" className="cursor-pointer block group">
              <img
                src="/logo.png"
                alt="Abaile Logo"
                className="h-14 sm:h-16 md:h-20 lg:h-24 w-auto max-w-[200px] sm:max-w-[240px] transition-all duration-500 group-hover:opacity-90 group-hover:scale-110 drop-shadow-sm"
              />
            </a>
          </div>

          {/* <CHANGE> Enhanced mobile social icons with better rounded design and hover animations */}
          <div className="flex items-center space-x-2 md:hidden">
            <a
              href="tel:18008647479"
              className="relative p-3 text-gray-600 hover:text-white rounded-2xl transition-all duration-500 transform hover:scale-125 active:scale-95 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100"></div>
              <Phone size={20} className="relative z-10 transition-all duration-300 group-hover:rotate-12" />
            </a>
            <a
              href="mailto:info@abhailephysiotherapy.com"
              className="relative p-3 text-gray-600 hover:text-white rounded-2xl transition-all duration-500 transform hover:scale-125 active:scale-95 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100"></div>
              <Mail size={20} className="relative z-10 transition-all duration-300 group-hover:rotate-12" />
            </a>
            <a
              href="https://wa.me/911234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="relative p-3 text-gray-600 hover:text-white rounded-2xl transition-all duration-500 transform hover:scale-125 active:scale-95 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100"></div>
              <WhatsAppIcon size={20} className="relative z-10 transition-all duration-300 group-hover:rotate-12" />
            </a>
          </div>

          {/* <CHANGE> Enhanced desktop navigation with more rounded design */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-3">
            <a
              href="/find-therapist"
              className="text-gray-700 hover:text-white font-medium flex items-center space-x-2 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-[#7ce3b1] hover:to-[#6dd4a2] transition-all duration-500 group transform hover:scale-105 hover:shadow-lg"
            >
              <Search size={18} className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
              <span>Find Therapists</span>
            </a>
            <a
              href="/services"
              className="text-gray-700 hover:text-white font-medium flex items-center space-x-2 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-[#7ce3b1] hover:to-[#6dd4a2] transition-all duration-500 group transform hover:scale-105 hover:shadow-lg"
            >
              <Briefcase size={18} className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
              <span>Services</span>
            </a>
            <a
              href="/about"
              className="text-gray-700 hover:text-white font-medium flex items-center space-x-2 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-[#7ce3b1] hover:to-[#6dd4a2] transition-all duration-500 group transform hover:scale-105 hover:shadow-lg"
            >
              <Info size={18} className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
              <span>About</span>
            </a>
            <a
              href="/contact"
              className="text-gray-700 hover:text-white font-medium flex items-center space-x-2 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-[#7ce3b1] hover:to-[#6dd4a2] transition-all duration-500 group transform hover:scale-105 hover:shadow-lg"
            >
              <Contact size={18} className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
              <span>Contact</span>
            </a>

            {/* <CHANGE> Enhanced social icons with better rounded design and individual hover colors */}
            <div className="flex items-center space-x-2 ml-6 pl-6 border-l border-gray-200">
              <a
                href="tel:18008647479"
                className="relative p-3 text-gray-600 hover:text-white rounded-2xl transition-all duration-500 transform hover:scale-125 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100"></div>
                <Phone size={18} className="relative z-10 transition-all duration-300 group-hover:rotate-12" />
              </a>
              <a
                href="mailto:info@abhailephysiotherapy.com"
                className="relative p-3 text-gray-600 hover:text-white rounded-2xl transition-all duration-500 transform hover:scale-125 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100"></div>
                <Mail size={18} className="relative z-10 transition-all duration-300 group-hover:rotate-12" />
              </a>
              <a
                href="https://wa.me/911234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="relative p-3 text-gray-600 hover:text-white rounded-2xl transition-all duration-500 transform hover:scale-125 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100"></div>
                <WhatsAppIcon size={18} className="relative z-10 transition-all duration-300 group-hover:rotate-12" />
              </a>
            </div>
          </nav>

          {/* <CHANGE> Enhanced desktop auth section with more rounded design */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex cursor-pointer items-center space-x-3 text-gray-700 hover:text-[#7ce3b1] px-5 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-500 group transform hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7ce3b1] to-[#6dd4a2] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                    <span className="text-white font-bold text-sm">
                      {user.firstName?.charAt(0)?.toUpperCase()}
                      {user.lastName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">{`${user.firstName} ${user.lastName}`}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 z-50 animate-in slide-in-from-top-2 duration-300 backdrop-blur-sm">
                    <div className="px-6 py-4 border-b border-gray-100">
                      {user.role && (
                        <p className="text-xs text-gray-400 capitalize font-medium bg-gray-50 px-3 py-1 rounded-full inline-block">
                          {user.role.name}
                        </p>
                      )}
                    </div>

                    <div className="py-2">
                      <a href="/my-bookings" className="w-full text-left px-6 py-4 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 flex items-center space-x-4 transition-all duration-300 group rounded-2xl mx-3">
                        <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-all duration-300">
                          <Calendar className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <span className="font-medium">My Bookings</span>
                      </a>
                    </div>
                    <div className="py-2">
                      <a href="/dashboard/profile" className="w-full text-left px-6 py-4 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 flex items-center space-x-4 transition-all duration-300 group rounded-2xl mx-3">
                        <div className="p-2 bg-green-100 rounded-xl group-hover:bg-green-200 transition-all duration-300">
                          <User className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <span className="font-medium">Profile</span>
                      </a>
                    </div>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-6 py-4 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 flex items-center space-x-4 cursor-pointer transition-all duration-300 group rounded-2xl mx-3"
                      >
                        <div className="p-2 bg-red-100 rounded-xl group-hover:bg-red-200 transition-all duration-300">
                          <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a
                  href="/login"
                  className="text-gray-700 hover:text-[#7ce3b1] px-6 py-3 font-medium transition-all duration-500 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-2xl transform hover:scale-105"
                >
                  Sign In
                </a>
                <a
                  href="/find-therapist"
                  className="bg-gradient-to-r from-emerald-600 to-[#6dd4a2] hover:from-[#6dd4a2] hover:to-emerald-600 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-500 transform hover:scale-110 hover:shadow-xl active:scale-95 hover:rotate-1"
                >
                  Book Now
                </a>
              </>
            )}
          </div>

          {/* <CHANGE> Enhanced mobile menu button with better rounded design */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-3 rounded-2xl hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 transition-all duration-500 transform hover:scale-110 active:scale-95 hover:shadow-lg"
          >
            <div className="relative w-6 h-6">
              <Menu className={`h-6 w-6 absolute transition-all duration-500 ${isMenuOpen ? 'opacity-0 rotate-180 scale-75' : 'opacity-100 rotate-0 scale-100'}`} />
              <X className={`h-6 w-6 absolute transition-all duration-500 ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-75'}`} />
            </div>
          </button>
        </div>

        {/* <CHANGE> Enhanced mobile navigation with better rounded design */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-2">
              <a 
                href="/find-therapist" 
                className="flex items-center space-x-4 text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#7ce3b1] hover:to-[#6dd4a2] px-5 py-4 rounded-2xl transition-all duration-500 group transform hover:scale-105 hover:shadow-lg mx-2"
              >
                <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-white/20 transition-all duration-300">
                  <Search size={18} className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                </div>
                <span className="font-medium">Find Therapists</span>
              </a>
              <a 
                href="/services" 
                className="flex items-center space-x-4 text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#7ce3b1] hover:to-[#6dd4a2] px-5 py-4 rounded-2xl transition-all duration-500 group transform hover:scale-105 hover:shadow-lg mx-2"
              >
                <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-white/20 transition-all duration-300">
                  <Briefcase size={18} className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                </div>
                <span className="font-medium">Services</span>
              </a>
              <a 
                href="/about" 
                className="flex items-center space-x-4 text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#7ce3b1] hover:to-[#6dd4a2] px-5 py-4 rounded-2xl transition-all duration-500 group transform hover:scale-105 hover:shadow-lg mx-2"
              >
                <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-white/20 transition-all duration-300">
                  <Info size={18} className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                </div>
                <span className="font-medium">About</span>
              </a>
              <a 
                href="/contact" 
                className="flex items-center space-x-4 text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#7ce3b1] hover:to-[#6dd4a2] px-5 py-4 rounded-2xl transition-all duration-500 group transform hover:scale-105 hover:shadow-lg mx-2"
              >
                <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-white/20 transition-all duration-300">
                  <Contact size={18} className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                </div>
                <span className="font-medium">Contact</span>
              </a>
              
              {/* <CHANGE> Enhanced mobile auth section */}
              {!user && (
                <div className="pt-4 border-t border-gray-100 mt-4 space-y-3 mx-2">
                  <a
                    href="/login"
                    className="block text-center text-gray-700 hover:text-[#7ce3b1] px-6 py-3 font-medium transition-all duration-500 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-2xl transform hover:scale-105"
                  >
                    Sign In
                  </a>
                  <a
                    href="/find-therapist"
                    className="block text-center bg-gradient-to-r from-emerald-600 to-[#6dd4a2] hover:from-[#6dd4a2] hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-500 transform hover:scale-105 active:scale-95 hover:shadow-xl"
                  >
                    Book Now
                  </a>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;