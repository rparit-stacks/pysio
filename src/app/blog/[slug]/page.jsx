"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Heart, Share2, ArrowLeft, Eye, MessageCircle, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/app/components/footer';
import { getBlogPostBySlug, getRelatedPosts, toggleBlogLike } from '@/lib/actions/blog';

export default function BlogDetailPage({ params }) {
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
    loadBlogPost();
  }, [params.slug]);

  const loadBlogPost = async () => {
    try {
      const result = await getBlogPostBySlug(params.slug);
      
      if (result.success && result.data) {
        setPost(result.data);
        setLikeCount(result.data.likeCount || 0);
        
        // Load related posts
        if (result.data.categoryId) {
          const relatedResult = await getRelatedPosts(result.data.id, result.data.categoryId);
          if (relatedResult.success) {
            setRelatedPosts(relatedResult.data);
          }
        }
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    
    try {
      const result = await toggleBlogLike(post.id);
      if (result.success) {
        setLikeCount(result.data.likeCount);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #ecfdf5 100%)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #ecfdf5 100%)' }}>
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-lg mx-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link href="/blog">
            <button className="text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
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
        
        .prose {
          max-width: none;
        }
        
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          color: #1f2937;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .prose p {
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }
        
        .prose img {
          border-radius: 0.75rem;
          margin: 2rem 0;
        }
        
        .prose blockquote {
          border-left: 4px solid #10b981;
          padding-left: 1.5rem;
          font-style: italic;
          color: #4b5563;
          margin: 2rem 0;
        }
        
        .prose ul, .prose ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }
        
        .prose li {
          margin-bottom: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .prose {
            font-size: 1rem;
          }
          
          .prose h1 { font-size: 1.875rem; }
          .prose h2 { font-size: 1.5rem; }
          .prose h3 { font-size: 1.25rem; }
        }
      `}</style>

      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #ecfdf5 100%)' }}>
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${post.featuredImage || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1920&h=1080&fit=crop"}')` }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.8) 50%, rgba(4, 120, 87, 0.9) 100%)' }}></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div style={{ transform: isLoaded ? 'translateY(0)' : 'translateY(40px)', opacity: isLoaded ? 1 : 0, transition: 'all 1s ease-out' }}>
              <Link href="/blog">
                <button className="text-white/80 hover:text-white mb-6 flex items-center gap-2 transition-colors duration-300">
                  <ArrowLeft className="h-5 w-5" />
                  Back to Blog
                </button>
              </Link>

              <div className="flex items-center gap-4 mb-6">
                <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#a7f3d0', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  {post.category?.name || 'Health'}
                </span>
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readTime || 8} min read
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.viewCount || 0} views
                  </div>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight" style={{ animation: isLoaded ? 'slideInDown 1s ease-out 0.3s both' : 'none' }}>
                {post.title}
              </h1>

              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl leading-relaxed" style={{ animation: isLoaded ? 'fadeInUp 1s ease-out 0.6s both' : 'none' }}>
                {post.excerpt}
              </p>

              <div className="flex items-center gap-4" style={{ animation: isLoaded ? 'fadeInUp 1s ease-out 0.9s both' : 'none' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  {post.author?.firstName?.[0] || 'A'}
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {post.author?.firstName} {post.author?.lastName}
                  </div>
                  <div className="text-sm text-white/80">Healthcare Professional</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden" style={{ animation: isLoaded ? 'fadeInUp 1s ease-out 0.5s both' : 'none' }}>
            {/* Article Image */}
            {post.featuredImage && (
              <div className="relative h-64 md:h-96 overflow-hidden">
                <Image src={post.featuredImage} alt={post.title} fill className="object-cover" />
              </div>
            )}

            {/* Article Body */}
            <div className="p-6 sm:p-8 md:p-12">
              <div className="prose prose-lg max-w-none" style={{ color: '#374151', lineHeight: '1.8' }}>
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>

              {/* Article Actions */}
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-6">
                  <button onClick={handleLike} className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors duration-300">
                    <Heart className="h-5 w-5" />
                    {likeCount} likes
                  </button>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MessageCircle className="h-5 w-5" />
                    {post.comments?.length || 0} comments
                  </div>
                </div>
                <button className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors duration-300">
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tagRelation) => (
                      <span key={tagRelation.tag.id} className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: '#ecfdf5', color: '#059669' }}>
                        {tagRelation.tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16" style={{ animation: isLoaded ? 'fadeInUp 1s ease-out 0.7s both' : 'none' }}>
              <h2 className="text-2xl font-bold text-gray-800 mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                    <article className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className="relative h-48 overflow-hidden">
                        <Image src={relatedPost.featuredImage || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop"} alt={relatedPost.title} fill className="object-cover" />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(relatedPost.publishedAt).toLocaleDateString()}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-emerald-600 transition-colors duration-300">
                          {relatedPost.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3">{relatedPost.excerpt}</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
