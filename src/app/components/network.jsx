import { requireAuth } from "@/lib/auth";
const Network = () => {
  return (
<section className="py-6 sm:py-20 px-4 bg-white">


      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-green-500 animate-slide-in-left">
              Connected Healthcare
              <span
                className="block animate-pulse-subtle text-green-500"
                
              >
                Network
              </span>
              <button onClick={requireAuth}>testing</button>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed animate-fade-in delay-300">
              Our platform connects you with a vast network of certified
              physiotherapists, healthcare providers, and specialists working
              together to ensure you receive the best possible care.
            </p>
            <div className="space-y-4 animate-fade-in delay-500">
              <div className="flex items-center gap-3 animate-slide-in-left delay-600">
                <div
                  className="w-2 h-2 rounded-full animate-pulse-subtle"
                  style={{ backgroundColor: "#7ce3b1" }}
                ></div>
                <span className="text-gray-700">
                  Seamless referrals between specialists
                </span>
              </div>
              <div className="flex items-center gap-3 animate-slide-in-left delay-700">
                <div
                  className="w-2 h-2 rounded-full animate-pulse-subtle"
                  style={{ backgroundColor: "#7ce3b1" }}
                ></div>
                <span className="text-gray-700">
                  Coordinated treatment plans
                </span>
              </div>
              <div className="flex items-center gap-3 animate-slide-in-left delay-800">
                <div
                  className="w-2 h-2 rounded-full animate-pulse-subtle"
                  style={{ backgroundColor: "#7ce3b1" }}
                ></div>
                <span className="text-gray-700">
                  Real-time progress tracking
                </span>
              </div>
            </div>
          </div>

          <div className="relative animate-slide-in-right">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-1 shadow-lg hover:shadow-emerald-200 transition-all duration-500 hover:scale-105">
              <img
                src="/new.jpeg"
                alt="Healthcare Network Diagram"
                className="w-full h-auto rounded-lg animate-float"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Network;
