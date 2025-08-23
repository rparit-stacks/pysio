"use client";
import { Menu, X, LogOut, Calendar, Phone, Mail, Search, Briefcase, Info, Contact, User } from 'lucide-react';
import { useState, useEffect, useRef } from "react";
import { logout } from "../../lib/auth";
import NotificationBell from './NotificationBell'; 

const Header = ({ user = null }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target) &&
          userButtonRef.current && !userButtonRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

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
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="cursor-pointer block group">
              <img
                src="/logo.png"
                alt="Abaile Logo"
                className="h-12 sm:h-14 md:h-16 w-auto transition-all duration-300 group-hover:opacity-80 group-hover:scale-105"
              />
            </a>
          </div>

          {/* Mobile Contact Icons */}
          <div className="flex items-center space-x-1 md:hidden">
            <a
              href="tel:18008647479"
              className="p-2 text-gray-600 hover:text-blue-600 rounded-lg transition-all duration-200"
            >
              <Phone size={18} />
            </a>
            <a
              href="mailto:info@abhailephysiotherapy.com"
              className="p-2 text-gray-600 hover:text-red-600 rounded-lg transition-all duration-200"
            >
              <Mail size={18} />
            </a>
            <a
              href="https://wa.me/911234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-green-600 rounded-lg transition-all duration-200"
            >
              <WhatsAppIcon size={18} />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <a
              href="/find-therapist"
              className="text-gray-700 hover:text-emerald-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Find Therapists
            </a>
            <a
              href="/services"
              className="text-gray-700 hover:text-emerald-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Services
            </a>
            <a
              href="/about"
              className="text-gray-700 hover:text-emerald-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              About
            </a>
            <a
              href="/blog"
              className="text-gray-700 hover:text-emerald-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Blog
            </a>
            <a
              href="/contact"
              className="text-gray-700 hover:text-emerald-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Contact
            </a>

            {/* Desktop Contact Icons */}
            <div className="flex items-center space-x-1 ml-4 pl-4 border-l border-gray-200">
              <a
                href="tel:18008647479"
                className="p-2 text-gray-600 hover:text-blue-600 rounded-lg transition-all duration-200"
              >
                <Phone size={16} />
              </a>
              <a
                href="mailto:info@abhailephysiotherapy.com"
                className="p-2 text-gray-600 hover:text-red-600 rounded-lg transition-all duration-200"
              >
                <Mail size={16} />
              </a>
              <a
                href="https://wa.me/911234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-green-600 rounded-lg transition-all duration-200"
              >
                <WhatsAppIcon size={16} />
              </a>
            </div>
          </nav>

                     {/* Desktop Auth Section */}
           <div className="hidden md:flex items-center space-x-3">
             {user ? (
               <>
                 {/* Notification Bell */}
                 <NotificationBell userId={user.id} />
                 
                 <div className="relative">
                   <button
                     ref={userButtonRef}
                     onClick={toggleUserMenu}
                     className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                   >
                     <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-700 transition-all duration-200">
                       <span className="text-white font-medium text-sm">
                         {user.firstName?.charAt(0)?.toUpperCase()}
                         {user.lastName?.charAt(0)?.toUpperCase()}
                       </span>
                     </div>
                     <span className="font-medium text-sm group-hover:text-emerald-600 transition-all duration-200">{`${user.firstName} ${user.lastName}`}</span>
                   </button>

                                 {isUserMenuOpen && (
                   <div 
                     ref={userMenuRef}
                     className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200"
                   >
                     <div className="px-4 py-2 border-b border-gray-100">
                       {user.role && (
                         <p className="text-xs text-gray-500 capitalize font-medium">
                           {user.role.name}
                         </p>
                       )}
                     </div>

                     <div className="py-1">
                       <a 
                         href={user.role?.name === 'admin' ? '/admin' : '/dashboard'} 
                         className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 flex items-center space-x-3 transition-all duration-200 group"
                       >
                         <Calendar className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                         <span>{user.role?.name === 'admin' ? 'Admin Dashboard' : 'Dashboard'}</span>
                       </a>
                     </div>
                     <div className="border-t border-gray-100 mt-1 pt-1">
                       <button
                         onClick={handleLogout}
                         className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 cursor-pointer transition-all duration-200 group"
                       >
                         <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                         <span>Logout</span>
                       </button>
                     </div>
                   </div>
                 )}
                </div>
               </>
            ) : (
              <>
                <a
                  href="/login"
                  className="text-gray-700 hover:text-emerald-600 px-4 py-2 font-medium transition-all duration-200 hover:bg-gray-50 rounded-lg"
                >
                  Sign In
                </a>
                <a
                  href="/find-therapist"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  Book Now
                </a>
              </>
            )}
          </div>

                     {/* Mobile Menu Button */}
           <button
             onClick={toggleMenu}
             className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
           >
             <div className="relative w-6 h-6">
               <Menu className={`h-6 w-6 absolute transition-all duration-200 text-black ${isMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`} />
               <X className={`h-6 w-6 absolute transition-all duration-200 text-black ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`} />
             </div>
           </button>
        </div>

                 {/* Mobile Navigation */}
         <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
           <div className="py-4 border-t border-gray-100">
             <nav className="flex flex-col space-y-1">
               <a 
                 href="/find-therapist" 
                 className="flex items-center space-x-3 text-gray-700 hover:text-emerald-600 hover:bg-gray-50 px-4 py-3 rounded-lg transition-all duration-200 group"
               >
                 <Search size={18} className="group-hover:scale-110 transition-transform duration-200" />
                 <span className="font-medium">Find Therapists</span>
               </a>
               <a 
                 href="/services" 
                 className="flex items-center space-x-3 text-gray-700 hover:text-emerald-600 hover:bg-gray-50 px-4 py-3 rounded-lg transition-all duration-200 group"
               >
                 <Briefcase size={18} className="group-hover:scale-110 transition-transform duration-200" />
                 <span className="font-medium">Services</span>
               </a>
               <a 
                 href="/about" 
                 className="flex items-center space-x-3 text-gray-700 hover:text-emerald-600 hover:bg-gray-50 px-4 py-3 rounded-lg transition-all duration-200 group"
               >
                 <Info size={18} className="group-hover:scale-110 transition-transform duration-200" />
                 <span className="font-medium">About</span>
               </a>
               <a 
                 href="/blog" 
                 className="flex items-center space-x-3 text-gray-700 hover:text-emerald-600 hover:bg-gray-50 px-4 py-3 rounded-lg transition-all duration-200 group"
               >
                 <div className="w-5 h-5 group-hover:scale-110 transition-transform duration-200">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                     <polyline points="14,2 14,8 20,8"/>
                     <line x1="16" y1="13" x2="8" y2="13"/>
                     <line x1="16" y1="17" x2="8" y2="17"/>
                     <polyline points="10,9 9,9 8,9"/>
                   </svg>
                 </div>
                 <span className="font-medium">Blog</span>
               </a>
               <a 
                 href="/contact" 
                 className="flex items-center space-x-3 text-gray-700 hover:text-emerald-600 hover:bg-gray-50 px-4 py-3 rounded-lg transition-all duration-200 group"
               >
                 <Contact size={18} className="group-hover:scale-110 transition-transform duration-200" />
                 <span className="font-medium">Contact</span>
               </a>
               
               {/* Mobile Auth Section */}
               {!user && (
                 <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
                   <a
                     href="/login"
                     className="block text-center text-gray-700 hover:text-emerald-600 px-4 py-3 font-medium transition-all duration-200 hover:bg-gray-50 rounded-lg"
                   >
                     Sign In
                   </a>
                   <a
                     href="/find-therapist"
                     className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
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