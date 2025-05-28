"use client";

import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useUserDisplay, useUserData } from "@/hooks/useUserData";
import { useAuth } from "@/context/AuthContext";

export default function TestUserInfoPage() {
  const { user } = useAuth();
  const { displayInfo, loading: displayLoading } = useUserDisplay();
  const { userData, loading: dataLoading, error } = useUserData();

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">User Information Test</h1>
        
        {/* Auth Context Data */}
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Auth Context Data (Immediate)</h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user?.id || "Not available"}</p>
            <p><strong>Email:</strong> {user?.email || "Not available"}</p>
            <p><strong>Full Name (metadata):</strong> {user?.user_metadata?.full_name || "Not available"}</p>
            <p><strong>Created At:</strong> {user?.created_at || "Not available"}</p>
          </div>
        </div>

        {/* Display Hook Data */}
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Display Hook Data (Immediate)</h2>
          {displayLoading ? (
            <p>Loading display info...</p>
          ) : (
            <div className="space-y-2">
              <p><strong>Display Name:</strong> {displayInfo.displayName}</p>
              <p><strong>Display Email:</strong> {displayInfo.displayEmail}</p>
              <p><strong>Is From Database:</strong> {displayInfo.isFromDatabase ? "Yes" : "No (fallback to auth)"}</p>
            </div>
          )}
        </div>

        {/* Database User Data */}
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Database User Data (May take time)</h2>
          {dataLoading ? (
            <p>Loading database user data...</p>
          ) : error ? (
            <div className="text-red-600">
              <p><strong>Error:</strong> {error}</p>
            </div>
          ) : userData ? (
            <div className="space-y-2">
              <p><strong>Username:</strong> {userData.username}</p>
              <p><strong>User Abbreviation:</strong> {userData.user_abbreviation}</p>
              <p><strong>Office Email:</strong> {userData.office_email}</p>
              <p><strong>Office Phone:</strong> {userData.office_phone}</p>
              <p><strong>Division:</strong> {userData.division_name || "None"}</p>
              <p><strong>Status:</strong> {userData.user_status}</p>
              <p><strong>Location:</strong> {userData.location || "Not set"}</p>
              <p><strong>Home Email:</strong> {userData.home_email?.[0] || "Not set"}</p>
              <p><strong>Home Phone:</strong> {userData.home_phone?.[0] || "Not set"}</p>
            </div>
          ) : (
            <p>No database user data found</p>
          )}
        </div>

        {/* Test Results */}
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-3">Test Results</h2>
          <div className="space-y-2">
            <p><strong>✅ Auth data available:</strong> {user ? "Yes" : "No"}</p>
            <p><strong>✅ Display info available:</strong> {!displayLoading ? "Yes" : "Loading..."}</p>
            <p><strong>📊 Database data status:</strong> {
              dataLoading ? "Loading..." : 
              error ? "Error" : 
              userData ? "Available" : "Not found"
            }</p>
            <p><strong>🎯 Immediate display works:</strong> {
              !displayLoading && displayInfo.displayName !== "User" ? "Yes" : "No"
            }</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 