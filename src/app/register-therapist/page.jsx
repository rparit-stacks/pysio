"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  FileText,
  Award,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Stethoscope,
  Building,
  Check
} from "lucide-react";
import FileUpload from "../components/ui/FileUpload";
import Footer from "../components/footer";
import { registerPhysiotherapist } from "@/lib/auth";
import { getAllSpecializations, getAllClinics } from "@/lib/actions/physiotherapist";

const PhysiotherapistRegistrationPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    coruRegistration: "",
    qualification: "",
    yearsExperience: "",
    bio: "",
    hourlyRate: "",
    selectedSpecializations: [],
    selectedClinic: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    profileImagePath: '',
    kycDocumentPath: '',
    additionalDocumentPath: ''
  });

  const [specializations, setSpecializations] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  const steps = [
    {
      id: 1,
      title: "Personal Info",
      description: "Basic information",
      icon: User,
      fields: ["firstName", "lastName", "email", "phone", "dateOfBirth", "gender"]
    },
    {
      id: 2,
      title: "Account Security",
      description: "Password setup",
      icon: Lock,
      fields: ["password", "confirmPassword"]
    },
    {
      id: 3,
      title: "Professional Details",
      description: "Qualifications & experience",
      icon: Award,
      fields: ["coruRegistration", "qualification", "yearsExperience", "hourlyRate", "bio"]
    },
    {
      id: 4,
      title: "Documents & Photo",
      description: "Upload profile & documents",
      icon: FileText,
      fields: ["profileImage", "kycDocument"]
    },
    {
      id: 5,
      title: "Clinic & Specializations",
      description: "Practice details",
      icon: Building,
      fields: ["selectedClinic", "selectedSpecializations"]
    }
  ];

  // Fetch specializations and clinics on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specializationResult, clinicResult] = await Promise.all([
          getAllSpecializations(),
          getAllClinics()
        ]);

        if (specializationResult.success) {
          setSpecializations(specializationResult.data);
        }

        if (clinicResult.success) {
          setClinics(clinicResult.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSpecializationChange = (specializationId) => {
    setFormData(prev => ({
      ...prev,
      selectedSpecializations: prev.selectedSpecializations.includes(specializationId)
        ? prev.selectedSpecializations.filter(id => id !== specializationId)
        : [...prev.selectedSpecializations, specializationId]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    const currentStepFields = steps.find(s => s.id === step)?.fields || [];

    currentStepFields.forEach(field => {
      if (field === "firstName" && !formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      }
      if (field === "lastName" && !formData.lastName.trim()) {
        newErrors.lastName = "Last name is required";
      }
      if (field === "email") {
        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
          }
        }
      }
      if (field === "password") {
        if (!formData.password) {
          newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        }
      }
      if (field === "confirmPassword") {
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }
      if (field === "coruRegistration" && !formData.coruRegistration.trim()) {
        newErrors.coruRegistration = "CORU registration is required";
      }
      if (field === "selectedClinic" && !formData.selectedClinic) {
        newErrors.selectedClinic = "Please select a clinic";
      }
      if (field === "phone" && formData.phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
          newErrors.phone = "Please enter a valid phone number";
        }
      }
      if (field === "yearsExperience" && formData.yearsExperience && (isNaN(formData.yearsExperience) || formData.yearsExperience < 0)) {
        newErrors.yearsExperience = "Please enter a valid number of years";
      }
      if (field === "hourlyRate" && formData.hourlyRate && (isNaN(formData.hourlyRate) || formData.hourlyRate <= 0)) {
        newErrors.hourlyRate = "Please enter a valid hourly rate";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const formDataObj = new FormData();

      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'selectedSpecializations') {
          formDataObj.append('specializations', JSON.stringify(formData[key]));
        } else if (key !== 'confirmPassword') {
          formDataObj.append(key, formData[key]);
        }
      });

      // Add uploaded file paths if available
      if (uploadedFiles.profileImagePath) {
        formDataObj.append('profileImageUrl', uploadedFiles.profileImagePath);
      }
      if (uploadedFiles.kycDocumentPath) {
        formDataObj.append('kycDocumentUrl', uploadedFiles.kycDocumentPath);
      }

      const result = await registerPhysiotherapist(formDataObj);

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        // Redirect to dashboard after a delay
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred during registration" });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="+353 XX XXX XXXX"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="PreferNotToSay">Prefer not to say</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Create a secure password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
              <div className="mt-2 text-sm text-gray-600">
                Password must be at least 6 characters long
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-emerald-900">Secure Account</h4>
                  <p className="text-sm text-emerald-700 mt-1">
                    Your password will be encrypted and stored securely. We recommend using a strong, unique password.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* CORU Registration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CORU Registration Number *
                </label>
                <input
                  type="text"
                  name="coruRegistration"
                  value={formData.coruRegistration}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.coruRegistration ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="e.g., CORU000123"
                />
                {errors.coruRegistration && (
                  <p className="text-red-600 text-sm mt-1">{errors.coruRegistration}</p>
                )}
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="e.g., BSc Physiotherapy"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="yearsExperience"
                  value={formData.yearsExperience}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.yearsExperience ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="0"
                />
                {errors.yearsExperience && (
                  <p className="text-red-600 text-sm mt-1">{errors.yearsExperience}</p>
                )}
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (€)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.hourlyRate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="75.00"
                  />
                </div>
                {errors.hourlyRate && (
                  <p className="text-red-600 text-sm mt-1">{errors.hourlyRate}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Bio
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Tell patients about your background, experience, and approach to treatment..."
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Documents & Photo</h3>
              <p className="text-gray-600">Please upload your professional photo and verification documents</p>
            </div>

            {/* Profile Image Upload */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Profile Photo</h4>
                  <p className="text-sm text-gray-500">Upload a professional headshot</p>
                </div>
              </div>
              <FileUpload
                fileType="profileImage"
                userId={0}
                accept="image/*"
                maxSize={5}
                description="Upload a professional photo that will be visible to patients. Accepted formats: JPG, PNG, WebP (Max 5MB)"
                onUploadSuccess={(result) => {
                  setUploadedFiles(prev => ({
                    ...prev,
                    profileImagePath: result.filePath
                  }));
                  setMessage({
                    type: 'success',
                    text: 'Profile photo uploaded successfully!'
                  });
                }}
                onUploadError={(error) => {
                  setMessage({
                    type: 'error',
                    text: error
                  });
                }}
              />
            </div>

            {/* KYC Document Upload */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Professional Documents</h4>
                  <p className="text-sm text-gray-500">Upload your CORU registration or qualification certificate</p>
                </div>
              </div>
              <FileUpload
                fileType="kycDocument"
                userId={0}
                accept=".pdf,image/*"
                maxSize={10}
                description="Upload your CORU registration certificate or other professional qualification documents. Accepted formats: PDF, JPG, PNG (Max 10MB)"
                onUploadSuccess={(result) => {
                  setUploadedFiles(prev => ({
                    ...prev,
                    kycDocumentPath: result.filePath
                  }));
                  setMessage({
                    type: 'success',
                    text: 'Document uploaded successfully!'
                  });
                }}
                onUploadError={(error) => {
                  setMessage({
                    type: 'error',
                    text: error
                  });
                }}
              />
            </div>

            {/* Additional Upload Option */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Additional Certificates (Optional)</h4>
                  <p className="text-sm text-gray-500">Upload any additional qualifications or certifications</p>
                </div>
              </div>
              <FileUpload
                fileType="additionalDocument"
                userId={0}
                accept=".pdf,image/*"
                maxSize={10}
                description="Upload any additional certificates, specialization qualifications, or training documents. Accepted formats: PDF, JPG, PNG (Max 10MB)"
                onUploadSuccess={(result) => {
                  setUploadedFiles(prev => ({
                    ...prev,
                    additionalDocumentPath: result.filePath
                  }));
                  setMessage({
                    type: 'success',
                    text: 'Additional document uploaded successfully!'
                  });
                }}
                onUploadError={(error) => {
                  setMessage({
                    type: 'error',
                    text: error
                  });
                }}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Document Verification</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your uploaded documents will be reviewed by our admin team for verification.
                    This helps maintain the quality and trust of our platform. You'll be notified
                    once your profile is approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Status */}
            {(uploadedFiles.profileImagePath || uploadedFiles.kycDocumentPath || uploadedFiles.additionalDocumentPath) && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-medium text-emerald-900 mb-2">Uploaded Files:</h4>
                <div className="space-y-2">
                  {uploadedFiles.profileImagePath && (
                    <div className="flex items-center gap-2 text-sm text-emerald-700">
                      <CheckCircle className="h-4 w-4" />
                      Profile Photo: Uploaded
                    </div>
                  )}
                  {uploadedFiles.kycDocumentPath && (
                    <div className="flex items-center gap-2 text-sm text-emerald-700">
                      <CheckCircle className="h-4 w-4" />
                      KYC Document: Uploaded
                    </div>
                  )}
                  {uploadedFiles.additionalDocumentPath && (
                    <div className="flex items-center gap-2 text-sm text-emerald-700">
                      <CheckCircle className="h-4 w-4" />
                      Additional Document: Uploaded
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {/* Clinic Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Clinic *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <select
                  name="selectedClinic"
                  value={formData.selectedClinic}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.selectedClinic ? 'border-red-300' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select a clinic</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name} - {clinic.addressLine1}, {clinic.city.name}, {clinic.city.county}
                    </option>
                  ))}
                </select>
              </div>
              {errors.selectedClinic && (
                <p className="text-red-600 text-sm mt-1">{errors.selectedClinic}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Select the primary clinic where you will practice. Contact an administrator if your clinic is not listed.
              </p>
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Specializations
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {specializations.map((spec) => (
                  <label
                    key={spec.id}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${formData.selectedSpecializations.includes(spec.id)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedSpecializations.includes(spec.id)}
                      onChange={() => handleSpecializationChange(spec.id)}
                      className="text-emerald-600 focus:ring-emerald-500 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{spec.name}</div>
                      {spec.description && (
                        <div className="text-sm text-gray-500 mt-1">{spec.description}</div>
                      )}
                    </div>
                    {formData.selectedSpecializations.includes(spec.id) && (
                      <Check className="h-5 w-5 text-emerald-600" />
                    )}
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Select your areas of expertise to help patients find the right therapist for their needs.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join Abhaile as a Physiotherapist
          </h1>
          <p className="text-gray-600">
            Create your professional profile and start connecting with patients
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isActive
                      ? 'border-emerald-500 text-emerald-500 bg-white'
                      : 'border-gray-300 text-gray-400 bg-white'
                    }`}>
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-6 w-6" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-16 md:w-24 h-0.5 ml-4 transition-colors duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-300'
                      }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Info */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {steps[currentStep - 1]?.title}
            </h2>
            <p className="text-gray-600 text-sm">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border animate-fade-in ${message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
            }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="min-h-[400px]">
            <div className="animate-slide-in">
              {renderStepContent()}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={currentStep === 1 ? () => window.history.back() : prevStep}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {currentStep === 1 ? 'Back' : 'Previous'}
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Create Profile
                  </>
                )}
              </button>
            )}
          </div>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              By registering, you agree to our{' '}
              <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Privacy Policy
              </a>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Your profile will be reviewed and verified before becoming visible to patients.
            </p>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default PhysiotherapistRegistrationPage;