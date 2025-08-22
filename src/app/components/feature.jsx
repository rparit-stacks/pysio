import { Clock, Shield, Star, Stethoscope, MapPin, Heart } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Clock className="h-8 w-8 text-white" />,
      title: "24/7 Booking",
      description:
        "Schedule appointments anytime, anywhere. Our platform is available round the clock for your convenience.",
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700"
    },
    {
      icon: <Shield className="h-8 w-8 text-white" />,
      title: "Verified Therapists",
      description:
        "All our physiotherapists are licensed, certified, and thoroughly vetted to ensure quality care.",
      gradient: "from-emerald-500 to-emerald-600",
      hoverGradient: "from-emerald-600 to-emerald-700"
    },
    {
      icon: <Star className="h-8 w-8 text-white" />,
      title: "Top-Rated Care",
      description:
        "Choose from highly-rated therapists with excellent patient reviews and proven track records.",
      gradient: "from-amber-500 to-amber-600",
      hoverGradient: "from-amber-600 to-amber-700"
    },
    {
      icon: <Stethoscope className="h-8 w-8 text-white" />,
      title: "Specialized Treatment",
      description:
        "Find specialists for sports injuries, chronic pain, post-surgery recovery, and more.",
      gradient: "from-purple-500 to-purple-600",
      hoverGradient: "from-purple-600 to-purple-700"
    },
    {
      icon: <MapPin className="h-8 w-8 text-white" />,
      title: "Local & Remote",
      description:
        "Choose between in-person visits at local clinics or convenient telehealth consultations.",
      gradient: "from-red-500 to-red-600",
      hoverGradient: "from-red-600 to-red-700"
    },
    {
      icon: <Heart className="h-8 w-8 text-white" />,
      title: "Personalized Care",
      description:
        "Get treatment plans tailored to your specific needs and recovery goals.",
      gradient: "from-pink-500 to-pink-600",
      hoverGradient: "from-pink-600 to-pink-700"
    },
  ];

  return (
    <section className="py-12 px-4 sm:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#7ce3b1]/10 to-emerald-200/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-6 mb-20 animate-fade-in-up">
          <div className="inline-block">
            <h2 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-[#7ce3b1] to-emerald-500 bg-clip-text text-transparent animate-slide-in-down">
              Why Choose Our Platform?
            </h2>
            <div className="h-1 w-32 bg-gradient-to-r from-emerald-500 to-[#7ce3b1] rounded-full mx-auto mt-4 animate-pulse"></div>
          </div>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed animate-fade-in delay-300">
            We make physiotherapy accessible, convenient, and effective.
            Discover the features that set us apart.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 lg:p-10 bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-fade-in-up overflow-hidden transform hover:scale-105"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Animated background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-all duration-500 rounded-3xl`}></div>
              
              {/* Icon container with animated background */}
              <div className="relative mb-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} group-hover:bg-gradient-to-br group-hover:${feature.hoverGradient} rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                  <div className="transform group-hover:scale-110 transition-all duration-300">
                    {feature.icon}
                  </div>
                </div>
                {/* Floating animation ring */}
                <div className={`absolute inset-0 w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-20 scale-110 group-hover:scale-125 group-hover:opacity-30 transition-all duration-700 blur-sm`}></div>
              </div>

              <div className="relative z-10">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-base lg:text-lg group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>

              {/* Hover effect border */}
              <div className={`absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:${feature.gradient} opacity-0 group-hover:opacity-20 transition-all duration-500`}></div>
              
              {/* Corner accent */}
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-bl-3xl rounded-tr-3xl transition-all duration-500`}></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA section */}
        <div className="text-center mt-20 animate-fade-in-up" style={{ animationDelay: '900ms' }}>
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-100 to-[#7ce3b1]/20 rounded-full">
            <Heart className="h-5 w-5 text-emerald-600 animate-pulse" />
            <span className="text-emerald-700 font-medium">Trusted by thousands of patients</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;