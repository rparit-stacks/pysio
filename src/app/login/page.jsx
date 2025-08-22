"use client";
import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles } from "lucide-react";
import { login, getCurrentUser } from "../../lib/auth";
import Link from "next/link";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [shouldShowLogin, setShouldShowLogin] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await getCurrentUser();

        if (user) {
          // User is authenticated, redirect immediately without showing login form
          window.location.href = "/";
          return;
        }

        // User is not authenticated, safe to show login form
        setShouldShowLogin(true);
      } catch (error) {
        console.error("Auth check error:", error);
        // Show login form if auth check fails
        setShouldShowLogin(true);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Animation trigger
  useEffect(() => {
    if (shouldShowLogin) {
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [shouldShowLogin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage("");

    try {
      const formDataObj = new FormData();
      formDataObj.append("email", formData.email);
      formDataObj.append("password", formData.password);

      const result = await login(formDataObj);

      if (result.success) {
        // Redirect based on user role
        if (result.userRole === "Admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } else {
        setMessage(result.message);
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking auth status
  if (isCheckingAuth || !shouldShowLogin) {
    return (
      <section className="min-h-screen relative bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-600 font-medium">
            Checking authentication...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen relative bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 flex items-center justify-center py-8 px-4 overflow-hidden">
      {/* Animated Background Image */}
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-5 transition-all duration-1000 ease-out"
        style={{
          backgroundImage: "url('/bone.png')",
          backgroundSize: "80%",
          transform: isVisible ? "scale(1) rotate(0deg)" : "scale(0.8) rotate(-5deg)",
        }}
      ></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-emerald-300 rounded-full opacity-60 animate-bounce"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-teal-300 rounded-full opacity-40 animate-pulse"></div>
      <div className="absolute bottom-32 left-20 w-3 h-3 bg-green-300 rounded-full opacity-50 animate-bounce delay-300"></div>
      <div className="absolute bottom-20 right-10 w-5 h-5 bg-emerald-400 rounded-full opacity-30 animate-pulse delay-500"></div>

      {/* Content */}
      <div className={`relative z-10 w-full max-w-md transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}>
        <div className="relative">
          {/* Login Form */}
          <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 hover:shadow-3xl transition-all duration-500">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <LogIn className="w-9 h-9 text-white" />
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Welcome Back
                </h1>
                <p className="text-gray-500 text-lg">
                  Sign in to your account to continue your wellness journey
                </p>
              </div>

              {/* Message Display */}
              {message && (
                <div
                  className={`p-3 rounded-lg text-center ${
                    message.includes("successful")
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-gray-50/50 hover:bg-white ${
                        errors.email ? "border-red-500 bg-red-50/30" : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Enter your email address"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 animate-fade-in">
                      {errors.email[0]}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-14 py-4 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-gray-50/50 hover:bg-white ${
                        errors.password ? "border-red-500 bg-red-50/30" : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-all duration-200 hover:scale-110"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 animate-fade-in">
                      {errors.password[0]}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>
                 <Link
  href="/forgot-password"
  className="text-sm text-emerald-600 hover:text-emerald-500 font-medium transition-colors duration-200"
>
  Forgot password?
</Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98] text-lg"
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-6 h-6" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <a
                    href="/signup"
                    className="text-emerald-600 hover:text-emerald-500 font-semibold transition-colors duration-200"
                  >
                    Sign up here
                  </a>
                </p>
              </div>

              {/* Features */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                      <Lock className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-xs text-gray-600">Secure Login</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                      <Mail className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-xs text-gray-600">Email Verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-200 rounded-full opacity-60"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald-100 rounded-full opacity-40"></div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
