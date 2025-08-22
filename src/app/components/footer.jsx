"use client";
import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin, Shield, Award, Users, Clock, Globe, Heart, Star, BookOpen, Stethoscope, FileText, Briefcase, Search, Calendar, Activity, Wallet, User, Library, MessageSquare, Smartphone, UserPlus, Settings, GraduationCap, FolderOpen, CreditCard, HelpCircle, Share2, Info, Target, Users2, BriefcaseBusiness, Newspaper, DollarSign, PenTool, Headset, Dumbbell, ClipboardList, Smile, Brain, Baby, Lock, FileLock, Cookie, Eye } from 'lucide-react';
import {Link} from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 py-16 px-4 relative overflow-hidden">
      {/* <CHANGE> Added background decorative elements for visual appeal */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-green-200/10 to-emerald-300/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-emerald-200/10 to-green-300/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* <CHANGE> Enhanced main footer content with animations and 2-column mobile layout */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 mb-12">
          
          {/* <CHANGE> Company Info with enhanced animations */}
          <div className="col-span-2 lg:col-span-2 space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3 group">
              <div className="h-[80px] sm:h-[100px] md:h-[120px] lg:h-[140px] rounded-2xl flex overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-105">
                <img
                  src="/logo.png"
                  alt="Abhaile Physiotherapy Logo"
                  className="w-full h-full object-contain transition-all duration-500 group-hover:brightness-110"
                />
              </div>
            </div>
            
            <p className="text-gray-600 leading-relaxed max-w-md animate-fade-in delay-200 group-hover:text-gray-700 transition-colors duration-300">
              Connecting patients with qualified physiotherapists for better
              health outcomes and faster recovery. Trusted by over 50,000
              patients nationwide.
            </p>

            {/* <CHANGE> Enhanced contact info with hover animations */}
            <div className="space-y-3 animate-fade-in delay-400">
              <div className="flex items-center gap-3 text-gray-600 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                <div className="p-2 bg-green-100 rounded-xl group-hover:bg-green-200 transition-all duration-300">
                  <Phone className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="group-hover:translate-x-1 transition-transform duration-300">1-800-ABHAILE (864-7479)</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                <div className="p-2 bg-green-100 rounded-xl group-hover:bg-green-200 transition-all duration-300">
                  <Mail className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="group-hover:translate-x-1 transition-transform duration-300">info@abhailephysiotherapy.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                <div className="p-2 bg-green-100 rounded-xl group-hover:bg-green-200 transition-all duration-300">
                  <MapPin className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="group-hover:translate-x-1 transition-transform duration-300">Dublin, Ireland | Available Nationwide</span>
              </div>
            </div>

            {/* <CHANGE> Enhanced social media with better animations */}
            <div className="flex space-x-3 pt-4 animate-fade-in delay-600">
              <div className="p-3 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer hover:scale-110 hover:-translate-y-1">
                <Facebook className="h-5 w-5 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" />
              </div>
              <div className="p-3 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer hover:scale-110 hover:-translate-y-1">
                <Twitter className="h-5 w-5 text-gray-500 group-hover:text-blue-400 transition-colors duration-300" />
              </div>
              <div className="p-3 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer hover:scale-110 hover:-translate-y-1">
                <Instagram className="h-5 w-5 text-gray-500 group-hover:text-pink-500 transition-colors duration-300" />
              </div>
              <div className="p-3 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer hover:scale-110 hover:-translate-y-1">
                <Linkedin className="h-5 w-5 text-gray-500 group-hover:text-blue-700 transition-colors duration-300" />
              </div>
            </div>
          </div>

          {/* <CHANGE> For Patients section with animations */}
          <div className="animate-fade-in-up delay-300">
            <h3 className="text-lg font-semibold mb-6 text-gray-900 flex items-center gap-2 group">
              <div className="p-2 bg-green-100 rounded-xl group-hover:bg-green-200 transition-all duration-300">
                <Heart className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="group-hover:text-green-600 transition-colors duration-300">For Patients</span>
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-3 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                <Search className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <a href="/find-therapist" className="group-hover:translate-x-1 transition-transform duration-300">Find Therapists</a>
              </li>
              <li className="flex items-center gap-3 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                <Calendar className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <a href="/find-therapist" className="group-hover:translate-x-1 transition-transform duration-300">Book Appointment</a>
              </li>
              <li className="flex items-center gap-3 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                <Library className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <a href="/health-resources" className="group-hover:translate-x-1 transition-transform duration-300">Health Resources</a>
              </li>
            </ul>
          </div>

          {/* <CHANGE> For Therapists section with animations */}
          <div className="animate-fade-in-up delay-400">
            <h3 className="text-lg font-semibold mb-6 text-gray-900 flex items-center gap-2 group">
              <div className="p-2 bg-green-100 rounded-xl group-hover:bg-green-200 transition-all duration-300">
                <Stethoscope className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="group-hover:text-green-600 transition-colors duration-300">For Therapists</span>
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-3 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                <UserPlus className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <a href="/register-therapist" className="group-hover:translate-x-1 transition-transform duration-300">Join Our Network</a>
              </li>
              <li className="flex items-center gap-3 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                <FolderOpen className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <a href="/login" className="group-hover:translate-x-1 transition-transform duration-300">Practice Management</a>
              </li>
              <li className="flex items-center gap-3 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                <CreditCard className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <a href="/my-bookings" className="group-hover:translate-x-1 transition-transform duration-300">Payment & Billing</a>
              </li>
              <li className="flex items-center gap-3 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                <HelpCircle className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <a href="/contact" className="group-hover:translate-x-1 transition-transform duration-300">Support Center</a>
              </li>
            </ul>
          </div>

          {/* <CHANGE> Company section with animations */}
          <div className="animate-fade-in-up delay-500">
            <h3 className="text-lg font-semibold mb-6 text-gray-900 flex items-center gap-2 group">
              <div className="p-2 bg-green-100 rounded-xl group-hover:bg-green-200 transition-all duration-300">
                <Briefcase className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="group-hover:text-green-600 transition-colors duration-300">Company</span>
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-3 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                <Info className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <a href="/about" className="group-hover:translate-x-1 transition-transform duration-300">About Us</a>
              </li>
              <li className="flex items-center gap-3 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                <Target className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <a href="/about" className="group-hover:translate-x-1 transition-transform duration-300">Our Mission</a>
              </li>
              <li className="flex items-center gap-3 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                <Newspaper className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <a href="/blogs" className="group-hover:translate-x-1 transition-transform duration-300">Press & Media</a>
              </li>
              <li className="flex items-center gap-3 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                <PenTool className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <a href="/blog" className="group-hover:translate-x-1 transition-transform duration-300">Blog</a>
              </li>
              <li className="flex items-center gap-3 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                <Headset className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <a href="/contact" className="group-hover:translate-x-1 transition-transform duration-300">Contact Us</a>
              </li>
            </ul>
          </div>
        </div>

        {/* <CHANGE> Enhanced extra links section with 2-column mobile layout and animations */}
        <div className="border-t border-gray-200 pt-8 mb-8 animate-fade-in delay-700">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Resources */}
            <div className="animate-slide-in-left delay-800">
              <h4 className="font-semibold mb-4 text-gray-900 flex items-center gap-2 group">
                <BookOpen className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:text-green-600 transition-colors duration-300">Resources</span>
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                  <Dumbbell className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Exercise Library</span>
                </li>
                <li className="flex items-center gap-2 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                  <ClipboardList className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Recovery Guides</span>
                </li>
                <li className="flex items-center gap-2 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                  <Smile className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Wellness Tips</span>
                </li>
                <li className="flex items-center gap-2 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                  <Brain className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Research & Studies</span>
                </li>
              </ul>
            </div>

            {/* Specialties */}
            <div className="animate-slide-in-up delay-900">
              <h4 className="font-semibold mb-4 text-gray-900 flex items-center gap-2 group">
                <Award className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:text-green-600 transition-colors duration-300">Specialties</span>
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                  <Activity className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Sports Medicine</span>
                </li>
                <li className="flex items-center gap-2 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                  <ClipboardList className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Orthopedic Care</span>
                </li>
                <li className="flex items-center gap-2 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                  <Brain className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Neurological Rehab</span>
                </li>
                <li className="flex items-center gap-2 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                  <Baby className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Pediatric Therapy</span>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="col-span-2 md:col-span-1 animate-slide-in-right delay-1000">
              <h4 className="font-semibold mb-4 text-gray-900 flex items-center gap-2 group">
                <Shield className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:text-green-600 transition-colors duration-300">Legal</span>
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                  <Lock className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Privacy Policy</span>
                </li>
                <li className="flex items-center gap-2 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                  <FileLock className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Terms of Service</span>
                </li>
                <li className="flex items-center gap-2 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                  <Cookie className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Cookie Policy</span>
                </li>
                <li className="flex items-center gap-2 hover:text-green-600 transition-all duration-300 group cursor-pointer">
                  <Eye className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Accessibility</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* <CHANGE> Enhanced bottom bar with animations */}
        <div className="border-t border-gray-200 pt-6 animate-fade-in delay-1200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-500">
              <span className="hover:text-green-600 transition-colors duration-300">
                &copy; 2025 Abhaile Physiotherapy. All rights reserved.
              </span>
              <div className="flex items-center space-x-2 hover:text-green-600 transition-colors duration-300 group cursor-pointer">
                <Globe className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span>English (US)</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer hover:scale-105">
              <Star className="h-4 w-4 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm text-gray-600 group-hover:text-green-600 transition-colors duration-300 font-medium">4.9/5 Patient Rating</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;