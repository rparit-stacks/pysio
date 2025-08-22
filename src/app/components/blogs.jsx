import Image from "next/image";

export default function BlogsSection() {
  const blogPosts = [
    {
      title: "5 Essential Exercises for Lower Back Pain Relief",
      excerpt:
        "Discover effective physiotherapy exercises that can help alleviate chronic lower back pain and improve your mobility.",
      image: "/backpain.webp",
      author: "Dr. Michael Chen",
      date: "June 12, 2025",
    },
    {
      title: "Post-Surgery Recovery: A Complete Physiotherapy Guide",
      excerpt:
        "Learn about the rehabilitation process after surgery and how physiotherapy can accelerate your recovery journey.",
      image: "/recovery.webp",
      author: "Sarah Thompson, PT",
      date: "June 10, 2025",
    },
    {
      title:
        "Sports Injury Prevention: Tips from Professional Physiotherapists",
      excerpt:
        "Expert advice on preventing common sports injuries and maintaining peak physical performance through proper care.",
      image: "/sportsinjury.webp",
      author: "Dr. James Rodriguez",
      date: "June 8, 2025",
    },
  ];

  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-white to-green-50 py-8 sm:py-16 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-green-300/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{
          backgroundImage: "url('/green.png')",
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-block">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-500 bg-clip-text text-transparent mb-4 animate-slide-in-down">
              Latest Blogs
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 mx-auto rounded-full animate-pulse"></div>
          </div>
          <p className="text-lg text-gray-600 mt-4 animate-fade-in delay-300">
            Stay updated with expert insights and tips from our physiotherapy professionals
          </p>
        </div>

        {/* <CHANGE> Horizontal scrolling layout with uniform card sizes */}
        <div className="relative animate-fade-in delay-500">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            {blogPosts.map((post, index) => (
              <div
                key={index}
                className="flex-none w-80 sm:w-96 bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-emerald-300 hover:shadow-2xl transition-all duration-500 group cursor-pointer snap-start transform hover:scale-105 hover:-translate-y-2"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/50 transition-all duration-500"></div>
                  
                  {/* Floating badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-block bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm transform group-hover:scale-110 transition-all duration-300">
                      {index === 0 ? 'Featured' : 'Latest'}
                    </span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-gray-900 text-xl font-bold leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 group-hover:text-gray-700 transition-colors duration-300">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="space-y-1">
                      <div className="text-emerald-600 font-semibold text-sm group-hover:text-emerald-700 transition-colors duration-300">
                        {post.author}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {post.date}
                      </div>
                    </div>
                    
                    <button className="relative bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl overflow-hidden group/btn">
                      <span className="relative z-10">Read More</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-all duration-300"></div>
                    </button>
                  </div>
                </div>

                {/* Card glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 blur-xl"></div>
              </div>
            ))}
          </div>

          {/* Scroll indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {blogPosts.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-emerald-300 hover:bg-emerald-500 transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${index * 100 + 800}ms` }}
              ></div>
            ))}
          </div>
        </div>

        {/* <CHANGE> Enhanced CTA button with better animations */}
        <div className="text-center mt-12 animate-fade-in delay-1000">
          <button className="relative bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-10 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 hover:rotate-1 overflow-hidden group">
            <span className="relative z-10">
              <a href="/blog">View All Articles</a>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 transform -skew-x-12"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
          </button>
        </div>
      </div>
    </section>
  );
}