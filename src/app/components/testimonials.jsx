import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marathon Runner",
      content: "After my knee injury, I thought my running days were over. The physiotherapist I found through this platform helped me recover completely. I'm back to running marathons!",
      rating: 5,
      image: "👩‍💼"
    },
    {
      name: "Michael Chen",
      role: "Office Worker",
      content: "Chronic back pain from desk work was affecting my life. The personalized treatment plan and convenient scheduling made all the difference. Highly recommended!",
      rating: 5,
      image: "👨‍💻"
    },
    {
      name: "Emma Davis",
      role: "Senior Citizen",
      content: "The therapists are so caring and professional. The home visits option is perfect for someone like me. My mobility has improved tremendously.",
      rating: 5,
      image: "👵"
    }
  ];

  return (
   <section className="py-6 px-4 sm:py-20 bg-gray-50">

      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-green-500 animate-slide-in-down">
            What Our Patients Say
          </h2>
          <p className="text-xl text-gray-600 animate-fade-in delay-300">
            Real stories from real people who found their path to recovery
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-emerald-200 hover:shadow-2xl transition-all duration-300 border border-gray-100 animate-fade-in-up hover:-rotate-1 hover:scale-105"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 animate-pulse-subtle" style={{ animationDelay: `${i * 100}ms` }} />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="text-3xl animate-bounce-subtle">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-bold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
