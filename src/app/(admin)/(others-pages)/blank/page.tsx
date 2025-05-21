import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Evolution 1.0 | AI-Powered DeepFake Detection & Intelligence Platform",
  description:
    "Evolution 1.0 by Evo Tech is an advanced AI platform for DeepFake detection and intelligence analysis, integrating autonomous Agents, forensic media evaluation, and role-based workflows for secure, real-time threat management.",
};


export default function BlankPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Blank Page" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Card Title Here
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Start putting content on grids or panels, you can also use different
            combinations of grids.Please check out the dashboard and other pages
          </p>
        </div>
      </div>
    </div>
  );
}
