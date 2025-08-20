import React from "react";
import { useForm, ValidationError } from "@formspree/react";

export default function ContactForm() {
  const [state, handleSubmit] = useForm(process.env.NEXT_PUBLIC_FORMSPREE_KEY);

  if (state.succeeded) {
    return (
      <div className="bg-green-100 text-green-800 p-6 rounded-lg shadow-md">
        <p className="text-lg font-medium">
          Thanks for your message! We'll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          name="name"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
          placeholder="Your Name"
        />
        <ValidationError
          prefix="Name"
          field="name"
          errors={state.errors}
          className="text-red-500 text-sm mt-1"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
          placeholder="you@example.com"
        />
        <ValidationError
          prefix="Email"
          field="email"
          errors={state.errors}
          className="text-red-500 text-sm mt-1"
        />
      </div>

      {/* Subject */}
      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Subject
        </label>
        <input
          id="subject"
          type="text"
          name="subject"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
          placeholder="Subject of your message"
        />
        <ValidationError
          prefix="Subject"
          field="subject"
          errors={state.errors}
          className="text-red-500 text-sm mt-1"
        />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows="5"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
          placeholder="Write your message here..."
        ></textarea>
        <ValidationError
          prefix="Message"
          field="message"
          errors={state.errors}
          className="text-red-500 text-sm mt-1"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={state.submitting}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50"
      >
        {state.submitting ? "Sending..." : "Send Message"}
      </button>


      {/* Contact Info */}
  <div className="pt-6 border-t border-gray-200 space-y-3 text-gray-700">
    <div className="flex items-center gap-2">
      {/* Phone Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-emerald-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 5a2 2 0 012-2h1.28a1 1 0 01.948.684l1.498 4.494a1 1 0 01-.27 1.054l-1.2 1.2a16.001 16.001 0 006.586 6.586l1.2-1.2a1 1 0 011.054-.27l4.494 1.498A1 1 0 0121 17.72V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V5z"
        />
      </svg>
      <a href="tel:18002242453" className="hover:text-emerald-600 transition">
        1-800-ABHAILE (864-7479)
      </a>
    </div>

    <div className="flex items-center gap-2">
      {/* Email Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-emerald-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 12H8m0 0l4-4m-4 4l4 4"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z"
        />
      </svg>
      <a
        href="mailto:info@abhailephysiotherapy.com"
        className="hover:text-emerald-600 transition"
      >
        info@abhailephysiotherapy.com
      </a>
    </div>
  </div>
    </form>
  );
}
