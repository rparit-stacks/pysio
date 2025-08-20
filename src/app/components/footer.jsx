"use client";
import {
  Facebook, Twitter, Instagram, Linkedin,
  Phone, Mail, MapPin, Shield, Award, Users, Clock, Globe, Heart, Star,
  BookOpen, Stethoscope, FileText, Briefcase,
  Search, Calendar, Activity, Wallet, User, Library, MessageSquare, Smartphone,
  UserPlus, Settings, GraduationCap, FolderOpen, CreditCard, HelpCircle, Share2,
  Info, Target, Users2, BriefcaseBusiness, Newspaper, DollarSign, PenTool, Headset,
  Dumbbell, ClipboardList, Smile, Brain, Baby,
  Lock, FileLock, Cookie, Eye
} from "lucide-react";
import {Link} from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-gray-800 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
           <div className="h-[100px] sm:h-[120px] md:h-[140px] lg:h-[160px] rounded-lg flex overflow-hidden">
  <img
    src="/logo.png"
    alt="Abhaile Physiotherapy Logo"
    className="w-full h-full object-contain"
  />
</div>


            </div>
            <p className="text-gray-600 leading-relaxed max-w-md">
              Connecting patients with qualified physiotherapists for better
              health outcomes and faster recovery. Trusted by over 50,000
              patients nationwide.
            </p>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>1-800-ABHAILE (864-7479)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>info@abhailephysiotherapy.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Dublin, Ireland | Available Nationwide</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4 pt-2">
              <Facebook className="h-5 w-5 text-gray-500 cursor-pointer hover:text-green-500 transition-colors duration-200" />
              <Twitter className="h-5 w-5 text-gray-500 cursor-pointer hover:text-green-500 transition-colors duration-200" />
              <Instagram className="h-5 w-5 text-gray-500 cursor-pointer hover:text-green-500 transition-colors duration-200" />
              <Linkedin className="h-5 w-5 text-gray-500 cursor-pointer hover:text-green-500 transition-colors duration-200" />
            </div>
          </div>

          {/* For Patients */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <Heart className="h-5 w-5 text-green-500" /> For Patients
            </h3>
            <ul className="space-y-2 text-gray-600">
        <li className="flex items-center gap-2">
  <Search className="h-4 w-4 text-green-500" />
  <a href="/find-therapist">Find Therapists</a>
</li>
              <li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-green-500" /> <a href="/find-therapist">Book Appointment</a></li>
          
            
              <li className="flex items-center gap-2"><Library className="h-4 w-4 text-green-500" /> <a href="/health-resources">Health Resources</a></li>
        
            </ul>
          </div>

          {/* For Therapists */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-green-500" /> For Therapists
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2"><UserPlus className="h-4 w-4 text-green-500" /> <a href="/register-therapist">Join Our Network</a></li>
            
          
              <li className="flex items-center gap-2"><FolderOpen className="h-4 w-4 text-green-500" /><a href="/login"> Practice Management</a></li>
              <li className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-green-500" /><a href="/my-bookings"> Payment & Billing</a></li>
              <li className="flex items-center gap-2"><HelpCircle className="h-4 w-4 text-green-500" /><a href="/contact"> Support Center</a></li>
            
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-500" /> Company
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2"><Info className="h-4 w-4 text-green-500" /> <a href="/about">About Us</a></li>
              <li className="flex items-center gap-2"><Target className="h-4 w-4 text-green-500" /> <a href="/about">Our Mission</a></li>
             
           
              <li className="flex items-center gap-2"><Newspaper className="h-4 w-4 text-green-500" /><a href="/blogs"> Press & Media</a></li>
              
              <li className="flex items-center gap-2"><PenTool className="h-4 w-4 text-green-500" /> <a href="/blog">Blog</a></li>
              <li className="flex items-center gap-2"><Headset className="h-4 w-4 text-green-500" /> <a href="contact">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* Extra Links */}
        <div className="border-t border-gray-200 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-500" /> Resources
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><Dumbbell className="h-4 w-4 text-green-500" /> Exercise Library</li>
                <li className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-green-500" /> Recovery Guides</li>
                <li className="flex items-center gap-2"><Smile className="h-4 w-4 text-green-500" /> Wellness Tips</li>
                <li className="flex items-center gap-2"><Brain className="h-4 w-4 text-green-500" /> Research & Studies</li>
              </ul>
            </div>

            {/* Specialties */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <Award className="h-4 w-4 text-green-500" /> Specialties
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><Activity className="h-4 w-4 text-green-500" /> Sports Medicine</li>
                <li className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-green-500" /> Orthopedic Care</li>
                <li className="flex items-center gap-2"><Brain className="h-4 w-4 text-green-500" /> Neurological Rehab</li>
                <li className="flex items-center gap-2"><Baby className="h-4 w-4 text-green-500" /> Pediatric Therapy</li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" /> Legal
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-green-500" /> Privacy Policy</li>
                <li className="flex items-center gap-2"><FileLock className="h-4 w-4 text-green-500" /> Terms of Service</li>
                <li className="flex items-center gap-2"><Cookie className="h-4 w-4 text-green-500" /> Cookie Policy</li>
                <li className="flex items-center gap-2"><Eye className="h-4 w-4 text-green-500" /> Accessibility</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>
                &copy; 2025 Abhaile Physiotherapy. All rights reserved.
              </span>
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>English (US)</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>4.9/5 Patient Rating</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
