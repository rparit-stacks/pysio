"use client";
import React, { useState, useEffect } from 'react';
import { Search, Calendar, ArrowRight, Clock, Heart, Share2, BookOpen, TrendingUp, Filter, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '../components/footer';
import { getBlogPosts, getFeaturedPost, getBlogCategories } from '@/lib/actions/blog';

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoaded, setIsLoaded] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    setIsLoaded(true);
    loadBlogData();
  }, []);

  const loadBlogData = async (page = 1, append = false) => {
    try {
      setLoading(!append); // Only show loading for initial load
      
      const [postsResult, featuredResult, categoriesResult] = await Promise.all([
        getBlogPosts(page, 9, selectedCategory === 'all' ? null : selectedCategory, searchTerm),
        page === 1 ? getFeaturedPost() : Promise.resolve({ success: true, data: featuredPost }),
        page === 1 ? getBlogCategories() : Promise.resolve({ success: true, data: categories })
      ]);

      if (postsResult.success) {
        if (append) {
          setBlogPosts(prev => [...prev, ...postsResult.data.posts]);
        } else {
          setBlogPosts(postsResult.data.posts);
        }
        setPagination(postsResult.data.pagination);
      }

      if (featuredResult.success && page === 1) {
        setFeaturedPost(featuredResult.data);
      }

      if (categoriesResult.success && page === 1) {
        setCategories([
          { id: 'all', name: 'All Posts', _count: { posts: postsResult.data?.pagination?.totalCount || 0 } },
          ...categoriesResult.data
        ]);
      }
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadBlogData(1, false);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchTerm]);

  const loadMorePosts = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadBlogData(nextPage, true);
  };

  // Remove client-side filtering since we're filtering on server
  const filteredPosts = blogPosts;

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -10px, 0);
          }
          70% {
            transform: translate3d(0, -5px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }
        
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @media (max-width: 640px) {
          .hero-title {
            font-size: 2.5rem !important;
            line-height: 1.2 !important;
          }
          
          .hero-subtitle {
            font-size: 1rem !important;
            padding: 0 1rem;
          }
        }
      `}</style>

      <div
        className="min-h-screen"
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #ecfdf5 100%)'
        }}
      >
        {/* Hero Section with Background */}
        <div className="relative overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1920&h=1080&fit=crop')"
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.8) 50%, rgba(4, 120, 87, 0.9) 100%)'
              }}
            ></div>
          </div>

          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div
              className="absolute top-20 left-10 w-32 h-32 rounded-full blur-3xl"
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                animation: 'pulse 3s ease-in-out infinite'
              }}
            ></div>
            <div
              className="absolute top-40 right-20 w-48 h-48 rounded-full blur-3xl"
              style={{
                background: 'rgba(34, 197, 94, 0.2)',
                animation: 'pulse 3s ease-in-out infinite',
                animationDelay: '1s'
              }}
            ></div>
            <div
              className="absolute bottom-20 left-1/3 w-40 h-40 rounded-full blur-3xl"
              style={{
                background: 'rgba(16, 185, 129, 0.3)',
                animation: 'pulse 3s ease-in-out infinite',
                animationDelay: '2s'
              }}
            ></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
            <div
              className="text-center"
              style={{
                transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
                opacity: isLoaded ? 1 : 0,
                transition: 'all 1s ease-out'
              }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-full px-6 py-2 mb-6"
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                <BookOpen className="h-5 w-5" style={{ color: '#a7f3d0' }} />
                <span style={{ color: '#a7f3d0', fontWeight: '500' }}>Health & Wellness Blog</span>
              </div>

              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight"
                style={{
                  animation: isLoaded ? 'slideInDown 1s ease-out 0.3s both' : 'none'
                }}
              >
                Expert Insights for
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Better Health
                </span>
              </h1>

              <p
                className="text-lg sm:text-xl mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0"
                style={{
                  color: '#a7f3d0',
                  animation: isLoaded ? 'fadeInUp 1s ease-out 0.6s both' : 'none'
                }}
              >
                Discover evidence-based articles, expert tips, and the latest breakthroughs in physiotherapy and wellness from our team of healthcare professionals.
              </p>

              {/* Search Bar */}
              <div
                className="max-w-2xl mx-auto relative"
                style={{
                  animation: isLoaded ? 'fadeInUp 1s ease-out 0.9s both' : 'none'
                }}
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles, topics, or authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none shadow-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                      e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              <p className="mt-4 text-gray-600">Loading blog content...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && blogPosts.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Blog Posts Found</h3>
              <p className="text-gray-500">Check back later for new articles and insights.</p>
            </div>
          )}

          {/* Categories Filter */}
          {!loading && categories.length > 0 && (
            <div
              style={{
                transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                opacity: isLoaded ? 1 : 0,
                transition: 'all 1s ease-out 0.3s',
                marginBottom: '3rem'
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <Filter className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Filter by Category</h3>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {categories.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transform hover:scale-105 text-sm sm:text-base"
                    style={{
                      background: selectedCategory === category.id
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : '#ffffff',
                      color: selectedCategory === category.id ? '#ffffff' : '#4b5563',
                      border: selectedCategory === category.id ? 'none' : '1px solid #e5e7eb',
                      boxShadow: selectedCategory === category.id
                        ? '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
                        : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      animation: isLoaded ? `slideInLeft 0.6s ease-out ${index * 0.1}s both` : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory !== category.id) {
                        e.target.style.background = '#ecfdf5';
                        e.target.style.color = '#059669';
                        e.target.style.borderColor = '#10b981';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== category.id) {
                        e.target.style.background = '#ffffff';
                        e.target.style.color = '#4b5563';
                        e.target.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    {category.name}
                    <span className="ml-2 text-xs opacity-75">
                      ({category._count?.posts || 0})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Featured Post */}
          {!loading && featuredPost && (
            <div
              style={{
                transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                opacity: isLoaded ? 1 : 0,
                transition: 'all 1s ease-out 0.5s',
                marginBottom: '4rem'
              }}
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-800">Featured Article</h2>
              </div>

              <div
                className="bg-white rounded-3xl overflow-hidden group hover-lift"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  transition: 'all 0.5s ease'
                }}
              >
                <div className="lg:flex">
                  <div className="lg:w-1/2 relative h-48 sm:h-64 lg:h-auto overflow-hidden">
                    <Image
                      src={featuredPost.featuredImage || "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop"}
                      alt={featuredPost.title}
                      fill
                      className="object-cover"
                      style={{
                        transition: 'transform 0.7s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%, transparent 100%)'
                      }}
                    ></div>
                    <div className="absolute top-6 left-6">
                      <span
                        className="text-white px-4 py-2 rounded-full text-sm font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
                        }}
                      >
                        Featured
                      </span>
                    </div>
                  </div>

                  <div className="lg:w-1/2 p-6 sm:p-8 lg:p-12">
                    <div className="flex items-center gap-4 mb-4">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          background: '#ecfdf5',
                          color: '#059669'
                        }}
                      >
                        {featuredPost.category?.name || 'Health'}
                      </span>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(featuredPost.publishedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {featuredPost.readTime || 8} min read
                        </div>
                      </div>
                    </div>

                    <h3
                      className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4"
                      style={{
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#059669';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#111827';
                      }}
                    >
                      {featuredPost.title}
                    </h3>

                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          }}
                        >
                          {featuredPost.author?.firstName?.[0] || 'A'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {featuredPost.author?.firstName} {featuredPost.author?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">Healthcare Professional</div>
                        </div>
                      </div>

                      <Link href={`/blog/${featuredPost.slug}`}>
                        <button
                          className="text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transform hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.boxShadow = '0 20px 40px -5px rgba(16, 185, 129, 0.6)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.4)';
                          }}
                        >
                          Read Article
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>

                    <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Heart className="h-4 w-4" />
                        {featuredPost.likeCount || 0} likes
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Eye className="h-4 w-4" />
                        {featuredPost.viewCount || 0} views
                      </div>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors duration-300">
                        <Share2 className="h-4 w-4" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Blog Grid */}
          <div
            style={{
              transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
              opacity: isLoaded ? 1 : 0,
              transition: 'all 1s ease-out 0.7s'
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Latest Articles</h2>
              <div className="text-sm text-gray-500">
                Showing {filteredPosts.length} of {blogPosts.length} articles
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPosts.map((post, index) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article
                    className="bg-white rounded-2xl overflow-hidden cursor-pointer group"
                    style={{
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.5s ease',
                      animation: isLoaded ? `scaleIn 0.6s ease-out ${index * 0.15}s both` : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.featuredImage || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop"}
                      alt={post.title}
                      fill
                      className="object-cover"
                      style={{
                        transition: 'transform 0.7s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%, transparent 100%)',
                        transition: 'all 0.5s ease'
                      }}
                    ></div>

                    <div className="absolute top-4 left-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          color: '#059669'
                        }}
                      >
                        {post.category?.name || 'Health'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt || post.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime || 6} min read
                      </div>
                    </div>

                    <h3
                      className="text-xl font-bold text-gray-900 mb-3 line-clamp-2"
                      style={{
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#059669';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#111827';
                      }}
                    >
                      {post.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          }}
                        >
                          {post.author?.firstName?.[0] || 'A'}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {post.author?.firstName} {post.author?.lastName}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.likeCount || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.viewCount || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card glow effect */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 -z-10 blur-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                      transition: 'opacity 0.5s ease'
                    }}
                  ></div>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          {/* Load More Button */}
          {!loading && pagination && pagination.hasNext && (
            <div className="text-center mt-12">
              <button
                onClick={loadMorePosts}
                className="text-white px-8 py-4 rounded-2xl font-semibold transform active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 20px 40px -5px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.5s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 25px 50px -5px rgba(16, 185, 129, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 20px 40px -5px rgba(16, 185, 129, 0.4)';
                }}
              >
                Load More Articles ({pagination.totalCount - blogPosts.length} remaining)
              </button>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BlogPage;