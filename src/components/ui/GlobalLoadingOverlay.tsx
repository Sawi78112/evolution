"use client";

import React from 'react';
import Image from 'next/image';

interface GlobalLoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const GlobalLoadingOverlay: React.FC<GlobalLoadingOverlayProps> = ({ 
  isVisible, 
  message = "Loading your workspace..." 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-white dark:bg-gray-900 flex items-center justify-center transition-opacity duration-300">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-700"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`
        }}></div>
      </div>

      {/* Loading Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="mb-4 animate-scale-in">
          <Image
            width={200}
            height={38}
            src="/images/logo/logo-dark.png"
            alt="Evolution Logo"
            className="block dark:hidden"
            priority
          />
          <Image
            width={200}
            height={38}
            src="/images/logo/light-logo.png"
            alt="Evolution Logo"
            className="hidden dark:block"
            priority
          />
        </div>

        {/* Animated Spinner */}
        <div className="relative animate-bounce-in">
          {/* Outer spinning ring */}
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-brand-500 border-r-brand-400 rounded-full animate-spin"></div>
          </div>
          
          {/* Inner pulsing dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-brand-500 rounded-full animate-pulse shadow-lg shadow-brand-500/50"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2 animate-slide-up">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {message}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            Initializing your security permissions and workspace settings...
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden animate-slide-up">
          <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full animate-progress"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.6s ease-out 0.1s both;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out 0.3s both;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.5s both;
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default GlobalLoadingOverlay; 