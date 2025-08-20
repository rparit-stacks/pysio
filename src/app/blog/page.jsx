"use client";

import Link from "next/link";
import { blogs } from "@/data/blogs";
import Footer from "../components/footer";

export default function BlogPage() {
  return (
  <>
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Our Blog</h1>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-transform duration-300 block hover:-translate-y-1"
            >
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <p className="text-sm text-gray-500">{blog.date}</p>
                <h2 className="text-lg font-semibold mt-2 text-gray-900">{blog.title}</h2>
                <p className="text-gray-700 mt-2">{blog.excerpt}</p>
                <span className="mt-4 inline-block text-blue-600 font-medium">
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
}
