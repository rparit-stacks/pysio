'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBlogPosts } from "../../lib/actions/blog";

export default function BlogsSection() {
  const router = useRouter();
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      const result = await getBlogPosts(1, 6); // Get 6 latest published posts
      if (result.success) {
        setBlogPosts(result.data.posts);
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = (slug) => {
    router.push(`/blog/${slug}`);
  };

  const handleViewAllClick = () => {
    router.push('/blog');
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Loading skeleton
  if (loading) {
    return (
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-green-50 py-8 sm:py-16 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-500 bg-clip-text text-transparent mb-4">
              Latest Blogs
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-none w-80 sm:w-96 bg-white rounded-3xl overflow-hidden border border-gray-200 animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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

        {/* Blog posts grid */}
        <div className="relative animate-fade-in delay-500">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            {blogPosts.map((post, index) => (
              <div
                key={post.id}
                onClick={() => handleBlogClick(post.slug)}
                className="flex-none w-80 sm:w-96 bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-emerald-300 hover:shadow-2xl transition-all duration-500 group cursor-pointer snap-start transform hover:scale-105 hover:-translate-y-2"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.featuredImage || "/backpain.webp"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = "/backpain.webp";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/50 transition-all duration-500"></div>
                  
                  {/* Floating badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-block bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm transform group-hover:scale-110 transition-all duration-300">
                      {post.isFeatured ? 'Featured' : 'Latest'}
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
                    {post.excerpt || post.content.substring(0, 120) + '...'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="space-y-1">
                      <div className="text-emerald-600 font-semibold text-sm group-hover:text-emerald-700 transition-colors duration-300">
                        {post.author?.firstName} {post.author?.lastName}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
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

        {/* Enhanced CTA button with better animations */}
        <div className="text-center mt-12 animate-fade-in delay-1000">
          <button 
            onClick={handleViewAllClick}
            className="relative bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-10 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 hover:rotate-1 overflow-hidden group"
          >
            <span className="relative z-10">
              View All Articles
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 transform -skew-x-12"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
          </button>
        </div>
      </div>
    </section>
  );
}