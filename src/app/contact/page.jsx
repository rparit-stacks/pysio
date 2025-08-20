'use client';

import Footer from "../components/footer";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import ContactForm from "../components/contactForm";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Toaster />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-emerald-600 mb-4">
              Get in Touch
            </h1>
            <p className="text-gray-600 mb-6">
              We'd love to hear from you. Send us a message and we’ll respond soon.
            </p>

            <ContactForm /> {/* Formspree form */}
          </div>

          {/* Google Map */}
          <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2382.605908505998!2d-6.267493084162615!3d53.34980597997998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48670e9f3b8e7b6b%3A0x3b8e1f3bcb5a8d5a!2sDublin%2C%20Ireland!5e0!3m2!1sen!2sie!4v1691653745623!5m2!1sen!2sie"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
