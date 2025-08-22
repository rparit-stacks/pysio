'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const FileUpload = ({ 
  fileType, 
  userId, 
  onUploadSuccess, 
  onUploadError,
  accept,
  maxSize = 5,
  label,
  description,
  className = ""
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setError('');
    setUploading(true);

    try {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSize}MB`);
      }

      // Validate file type based on accept prop
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const isValidType = acceptedTypes.some(acceptedType => {
          if (acceptedType.startsWith('.')) {
            // File extension check
            return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
          } else if (acceptedType.includes('/*')) {
            // MIME type wildcard check
            const baseType = acceptedType.split('/')[0];
            return file.type.startsWith(baseType);
          } else {
            // Exact MIME type check
            return file.type === acceptedType;
          }
        });

        if (!isValidType) {
          throw new Error(`File type not supported. Accepted types: ${accept}`);
        }
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      formData.append('userId', userId.toString());

      // Upload file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          path: result.filePath
        });
        onUploadSuccess && onUploadSuccess({
          filePath: result.filePath,
          fileName: result.fileName,
          name: file.name
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      onUploadError && onUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async () => {
    if (uploadedFile) {
      try {
        const response = await fetch(`/api/files/${uploadedFile.id}?userId=${userId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setUploadedFile(null);
          setError('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      } catch (err) {
        console.error('Error removing file:', err);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {!uploadedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive 
              ? 'border-emerald-500 bg-emerald-50' 
              : error 
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
            accept={accept}
            disabled={uploading}
          />
          
          <div className="text-center">
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className={`h-12 w-12 mb-4 ${
                  dragActive ? 'text-emerald-500' : 'text-gray-400'
                }`} />
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium text-emerald-600 hover:text-emerald-500 cursor-pointer">
                    Click to upload
                  </span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  Max file size: {maxSize}MB
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(uploadedFile.type)}
              <div>
                <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
};

export default FileUpload;