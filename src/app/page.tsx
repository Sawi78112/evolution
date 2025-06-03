"use client";

import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import Backdrop from "@/components/layout/Backdrop";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useNotification } from "@/components/ui/notification";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useRef } from "react";

export default function RootPage() {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { user } = useAuth();
  const notification = useNotification();
  const hasShownWelcome = useRef(false);

  // Show welcome notification when dashboard loads after sign-in
  useEffect(() => {
    if (user && !hasShownWelcome.current) {
      // Check if this is a fresh sign-in by looking for a flag in sessionStorage
      const justSignedIn = sessionStorage.getItem('justSignedIn');
      if (justSignedIn) {
        // Small delay to ensure dashboard is fully rendered
        setTimeout(() => {
          notification.success("Welcome back!", "You've successfully signed in to your account.");
        }, 500);
        
        // Clear the flag and mark as shown
        sessionStorage.removeItem('justSignedIn');
        hasShownWelcome.current = true;
      }
    }
  }, [user, notification]);

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <ProtectedRoute>
      <div className="min-h-screen xxl:flex">
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />
        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          {/* Header */}
          <AppHeader />
          {/* Page Content */}
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
            <PageBreadcrumb pageTitle="Dashboard" />
          
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 