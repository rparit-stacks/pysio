"use client";
import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorMessage = ({ 
  message = "Something went wrong", 
  onRetry = null,
  className = "" 
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-red-800 text-sm">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 inline-flex items-center text-sm text-red-600 hover:text-red-800 font-medium"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;