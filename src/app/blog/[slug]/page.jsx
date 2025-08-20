// app/blog/[slug]/page.jsx
"use client";

import { blogs } from "@/data/blogs";
import Link from "next/link";
import Footer from "@/app/components/footer";
export default function BlogDetailPage({ params }) {
  const blog = blogs.find((b) => b.slug === params.slug);

  if (!blog) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-lg">
          <h1 className="text-2xl font-bold text-gray-900">Blog not found</h1>
          <Link href="/blog" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
 <>
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <Link href="/blog" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Blog
          </Link>
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-64 object-cover rounded-lg"
          />
          <p className="text-sm text-gray-500 mt-4">{blog.date}</p>
          <h1 className="text-3xl font-bold mt-2 text-gray-900">{blog.title}</h1>
          <p className="mt-6 text-gray-700 whitespace-pre-line">{blog.content}</p>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
}
