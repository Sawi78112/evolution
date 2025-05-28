"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/assets/icons";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthCodeErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const description = searchParams.get('description');

  const getErrorMessage = () => {
    if (error === 'access_denied' && description?.includes('otp_expired')) {
      return {
        title: "Email Link Expired",
        message: "The confirmation link you clicked has expired. Email links are only valid for 24 hours for security reasons.",
        suggestions: [
          "Request a new confirmation email",
          "Check if you have multiple emails and use the most recent one",
          "Make sure you're clicking the link within 24 hours of receiving it"
        ]
      };
    } else if (error === 'access_denied') {
      return {
        title: "Access Denied",
        message: "The authentication link is invalid or has been used already.",
        suggestions: [
          "The link may have already been used",
          "The link may have been corrupted during transmission",
          "Request a new authentication email"
        ]
      };
    } else {
      return {
        title: "Authentication Error",
        message: "There was an error processing your authentication request.",
        suggestions: [
          "The link is older than 24 hours",
          "The link has already been used",
          "The link was corrupted during transmission"
        ]
      };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {errorInfo.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {errorInfo.message}
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                What happened?
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <ul className="list-disc list-inside space-y-1">
                  {errorInfo.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 dark:bg-gray-800 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
              Technical Details:
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
              Error: {error}
              {description && <><br />Description: {decodeURIComponent(description)}</>}
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <Link
            href="/signup"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            Create New Account
          </Link>
          
          <Link
            href="/signin"
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <ChevronLeftIcon className="mr-2" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthCodeError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-64"></div>
          <div className="h-4 bg-gray-200 rounded mb-8 w-48"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-11 bg-gray-200 rounded mb-2"></div>
          <div className="h-11 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <AuthCodeErrorContent />
    </Suspense>
  );
} 