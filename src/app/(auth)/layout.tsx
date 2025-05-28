'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Allow access to password reset update page even if authenticated
    // This is necessary because Supabase automatically signs users in when they click the reset link
    if (pathname === '/reset-password/update') {
      return; // Don't redirect, allow access to password update page
    }

    // If user is already authenticated and not on password reset page, redirect to home page
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router, pathname]);

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center  flex z-1">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <Link href="/" className="block mb-4">
                  <Image
                    width={250}
                    height={48}
                    src="/images/logo/light-logo.png"
                    alt="Evolution Logo Light"
                    className="block dark:hidden"
                  />
                  <Image
                    width={250}
                    height={48}
                    src="/images/logo/light-logo.png"
                    alt="Evolution Logo Dark"
                    className="hidden dark:block"
                  />
                </Link>
                <p className="text-center text-gray-400 dark:text-white/60">
                  AI-Powered DeepFake Detection & Intelligence Platform
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
