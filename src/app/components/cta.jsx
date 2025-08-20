"use client";
import { ArrowRight, Phone, Mail } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-6 px-4 sm:py-20 bg-gradient-to-br from-green-50 to-emerald-50 relative overflow-hidden">

      {/* Background Network Image */}
      <div className="absolute inset-0 opacity-10">
        <img
          src="/new.jpeg"
          alt="Network Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        <div className="space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Ready to Start Your Recovery Journey?
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Don't let pain hold you back. Book your appointment today and take
            the first step towards a healthier, pain-free life.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            size="lg"
            className="text-white hover:opacity-90 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 group flex items-center justify-center bg-emerald-600"
           
          >
          <a href="/find-therapist">  Book Your Appointment</a>
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          <button
            variant="outline"
            size="lg"
            className="border-2 text-white hover:text-gray-900 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 bg-emerald-600"
            
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "bg-emerald-600";
              e.target.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "bg-emerald-600";
            }}
          >
            Learn More
          </button>
        </div>
        <div className="pt-8 border-t" style={{ borderColor: "#d1fae5" }}>
          <p className="text-gray-600 mb-4">Need help? Get in touch</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="h-5 w-5" style={{ color: "#7ce3b1" }} />
              <span>1-800-ABAILE-1</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="h-5 w-5" style={{ color: "#7ce3b1" }} />
              <span>support@abaile.com</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
