import { Clock, Shield, Star, Stethoscope, MapPin, Heart } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Clock className="h-8 w-8 text-[#7ce3b1]" />,
      title: "24/7 Booking",
      description:
        "Schedule appointments anytime, anywhere. Our platform is available round the clock for your convenience.",
    },
    {
      icon: <Shield className="h-8 w-8 text-[#7ce3b1]" />,
      title: "Verified Therapists",
      description:
        "All our physiotherapists are licensed, certified, and thoroughly vetted to ensure quality care.",
    },
    {
      icon: <Star className="h-8 w-8 text-[#7ce3b1]" />,
      title: "Top-Rated Care",
      description:
        "Choose from highly-rated therapists with excellent patient reviews and proven track records.",
    },
    {
      icon: <Stethoscope className="h-8 w-8 text-[#7ce3b1]" />,
      title: "Specialized Treatment",
      description:
        "Find specialists for sports injuries, chronic pain, post-surgery recovery, and more.",
    },
    {
      icon: <MapPin className="h-8 w-8 text-[#7ce3b1]" />,
      title: "Local & Remote",
      description:
        "Choose between in-person visits at local clinics or convenient telehealth consultations.",
    },
    {
      icon: <Heart className="h-8 w-8 text-[#7ce3b1]" />,
      title: "Personalized Care",
      description:
        "Get treatment plans tailored to your specific needs and recovery goals.",
    },
  ];

  return (
   <section className="py-8 px-4 sm:py-20 bg-white">


      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-green-500 animate-slide-in-down">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in delay-300">
            We make physiotherapy accessible, convenient, and effective.
            Discover the features that set us apart.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-emerald-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up hover:rotate-1"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300 animate-bounce-in">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
