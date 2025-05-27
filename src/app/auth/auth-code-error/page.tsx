import Link from "next/link";
import { ChevronLeftIcon } from "@/assets/icons";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            There was an error processing your authentication request.
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Invalid or Expired Link
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  The authentication link you clicked is either invalid or has expired. 
                  This can happen if:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>The link is older than 24 hours</li>
                  <li>The link has already been used</li>
                  <li>The link was corrupted during transmission</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/reset-password"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            Request New Password Reset
          </Link>
          
          <Link
            href="/signin"
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            <ChevronLeftIcon className="mr-2" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 