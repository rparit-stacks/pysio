import { requireAuth } from "@/lib/auth";

const Network = () => {
  return (
    <section className="py-8 sm:py-20 px-4 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-emerald-200/20 to-green-300/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content Section */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-green-500 animate-slide-in-left leading-tight">
                Connected Healthcare
                <span className="block animate-pulse-subtle text-green-500 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  Network
                </span>
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
            </div>
            
            <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed animate-fade-in delay-300 font-light">
              Our platform connects you with a vast network of certified
              physiotherapists, healthcare providers, and specialists working
              together to ensure you receive the best possible care.
            </p>
            
            <div className="space-y-6 animate-fade-in delay-500">
              <div className="flex items-center gap-4 animate-slide-in-left delay-600 group hover:translate-x-2 transition-all duration-300">
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse-subtle shadow-lg"></div>
                  <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-400 opacity-30 scale-150 group-hover:scale-200 transition-all duration-500"></div>
                </div>
                <span className="text-gray-700 font-medium text-lg group-hover:text-green-600 transition-colors duration-300">
                  Seamless referrals between specialists
                </span>
              </div>
              
              <div className="flex items-center gap-4 animate-slide-in-left delay-700 group hover:translate-x-2 transition-all duration-300">
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse-subtle shadow-lg"></div>
                  <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-400 opacity-30 scale-150 group-hover:scale-200 transition-all duration-500"></div>
                </div>
                <span className="text-gray-700 font-medium text-lg group-hover:text-green-600 transition-colors duration-300">
                  Coordinated treatment plans
                </span>
              </div>
              
              <div className="flex items-center gap-4 animate-slide-in-left delay-800 group hover:translate-x-2 transition-all duration-300">
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse-subtle shadow-lg"></div>
                  <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-400 opacity-30 scale-150 group-hover:scale-200 transition-all duration-500"></div>
                </div>
                <span className="text-gray-700 font-medium text-lg group-hover:text-green-600 transition-colors duration-300">
                  Real-time progress tracking
                </span>
              </div>
            </div>

            {/* Call to Action Button */}
            <div className="pt-4 animate-fade-in delay-1000">
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 hover:rotate-1">
                Explore Network
              </button>
            </div>
          </div>

          {/* Right Image Section */}
          <div className="relative animate-slide-in-right">
            <div className="relative group">
              {/* Main image container with enhanced hover effects */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-2 shadow-xl hover:shadow-2xl transition-all duration-700 hover:scale-105 group-hover:rotate-1 overflow-hidden">
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src="/new.jpeg"
                    alt="Healthcare Network Diagram"
                    className="w-full h-auto rounded-2xl animate-float group-hover:scale-110 transition-all duration-700 filter group-hover:brightness-110"
                  />
                  
                  {/* Overlay gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></div>
                </div>
              </div>

              {/* Floating decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg animate-bounce opacity-80"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full shadow-lg animate-bounce opacity-80" style={{animationDelay: '0.5s'}}></div>
              
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 -z-10 scale-110"></div>
            </div>

            {/* Stats overlay */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-green-100 animate-fade-in delay-1200 hover:scale-105 transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">500+</div>
                <div className="text-sm text-gray-600 font-medium">Connected Providers</div>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-emerald-100 animate-fade-in delay-1400 hover:scale-105 transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">24/7</div>
                <div className="text-sm text-gray-600 font-medium">Network Access</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Network;