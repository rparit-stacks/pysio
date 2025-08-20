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

  const [featuredPost, ...sidePosts] = blogPosts;

  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-white to-green-50 py-6 px-4 sm:py-16 overflow-hidden">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{
          backgroundImage: "url('/green.png')",
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-green-500 mb-4">
            Latest Blogs
          </h2>
          <div className="w-24 h-1 bg-[#7ce3b1] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured Post - Large blog on the left */}
          <div className="lg:col-span-2 lg:order-1">
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <div className="relative h-80 lg:h-96">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block bg-[#7ce3b1] text-gray-900 px-3 py-1 rounded-full text-xs font-medium mb-3 shadow-md">
                    Featured Article
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-gray-900 text-2xl font-bold mb-4 leading-tight">
                  {featuredPost.title}
                </h3>
                <p className="text-gray-600 text-base mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-emerald-600 font-medium">
                      {featuredPost.author}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {featuredPost.date}
                    </span>
                  </div>
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors duration-300 flex items-center gap-1">
                    Read More →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Side Posts - Small blogs on the right */}
          <div className="space-y-4 lg:order-2">
            {sidePosts.map((post, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div className="flex sm:block lg:flex">
                  <div className="relative flex-shrink-0 w-32 sm:w-full lg:w-32">
                    <div className="aspect-video bg-gradient-to-br from-emerald-100 to-emerald-200 relative overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  <div className="p-3 flex-1 min-w-0">
                    <h4 className="text-gray-900 text-sm font-semibold mb-1 line-clamp-2 leading-tight">
                      {post.title}
                    </h4>
                    <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-600 font-medium truncate mr-2">
                        {post.author}
                      </span>
                      <span className="text-gray-500 flex-shrink-0">
                        {post.date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <button className="bg-emerald-600 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
           <a href="/blog"> View All Articles</a>
          </button>
        </div>
      </div>
    </section>
  );
}
