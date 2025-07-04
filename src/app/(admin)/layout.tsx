"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import Backdrop from "@/components/layout/Backdrop";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import GlobalLoadingOverlay from "@/components/ui/GlobalLoadingOverlay";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import React from "react";

// Note: Metadata cannot be exported from client components
// Consider moving this to a parent server component if SEO is important

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isLoading, message } = useGlobalLoading();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <ProtectedRoute>
      {/* Global Loading Overlay */}
      <GlobalLoadingOverlay isVisible={isLoading} message={message} />
      
      {/* Main App Content - Hidden during loading */}
      {!isLoading && (
        <div className="min-h-screen xxl:flex">
          {/* Sidebar and Backdrop */}
          <AppSidebar />
          <Backdrop />
          {/* Main Content Area */}
          <div
            className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
          >
            {/* Header */}
            <AppHeader />
            {/* Page Content */}
            <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
