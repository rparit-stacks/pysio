"use client";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Shield, 
  Clock, 
  Award,
  ArrowRight 
} from "lucide-react";

const TherapistCTA = () => {
  return (
    <section className="py-6 px-4 sm:py-20 bg-gradient-to-br from-emerald-50 via-white to-green-50 relative overflow-hidden">

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(124,227,177,0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-gray-900 space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl text-green-500 font-bold leading-tight">
                Join Ireland's Leading
                <span className="block text-green-500">
                  Physiotherapy Network
                </span>
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Connect with patients, grow your practice, and make a difference in people's lives. 
                Join hundreds of certified physiotherapists already on our platform.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/register-therapist"
                className="bg-emerald-600 hover:bg-emerald-600 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-center flex items-center justify-center gap-2"
              >
                Register Now
                <ArrowRight className="h-5 w-5" />
              </a>
              <button className="border-2 border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-50 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300">
                Learn More
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-[#7ce3b1]" />
                <span className="text-gray-700 font-medium">1000+ Patients</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-[#7ce3b1]" />
                <span className="text-gray-700 font-medium">Grow Revenue</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-[#7ce3b1]" />
                <span className="text-gray-700 font-medium">Easy Scheduling</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-[#7ce3b1]" />
                <span className="text-gray-700 font-medium">Secure Platform</span>
              </div>
            </div>
          </div>

          {/* Right Features */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-emerald-100 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#7ce3b1]/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-[#7ce3b1]" />
                </div>
                <div className="text-gray-900">
                  <h3 className="text-xl font-semibold mb-2">Flexible Scheduling</h3>
                  <p className="text-gray-600">
                    Set your own hours and availability. Our platform handles bookings automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-emerald-100 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#7ce3b1]/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-[#7ce3b1]" />
                </div>
                <div className="text-gray-900">
                  <h3 className="text-xl font-semibold mb-2">Increase Your Income</h3>
                  <p className="text-gray-600">
                    Reach more patients and maximize your earning potential with our growing patient base.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-emerald-100 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#7ce3b1]/20 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-[#7ce3b1]" />
                </div>
                <div className="text-gray-900">
                  <h3 className="text-xl font-semibold mb-2">Professional Growth</h3>
                  <p className="text-gray-600">
                    Build your reputation with patient reviews and expand your professional network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 pt-12 border-t border-emerald-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="text-gray-900">
              <div className="text-3xl font-bold text-[#7ce3b1] mb-2">500+</div>
              <div className="text-gray-600">Therapists</div>
            </div>
            <div className="text-gray-900">
              <div className="text-3xl font-bold text-[#7ce3b1] mb-2">10,000+</div>
              <div className="text-gray-600">Appointments</div>
            </div>
            <div className="text-gray-900">
              <div className="text-3xl font-bold text-[#7ce3b1] mb-2">4.8★</div>
              <div className="text-gray-600">Avg Rating</div>
            </div>
            <div className="text-gray-900">
              <div className="text-3xl font-bold text-[#7ce3b1] mb-2">32</div>
              <div className="text-gray-600">Counties</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-emerald-100 shadow-lg">
            <h3 className="text-2xl font-bold text-green-500 mb-4">
              Ready to Transform Your Practice?
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Join Abaile today and start connecting with patients who need your expertise.
            </p>
            <a
              href="/register-therapist"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-600 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Award className="h-5 w-5" />
              Start Your Application
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TherapistCTA;