import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Evolution 1.0 | AI-Powered DeepFake Detection & Intelligence Platform",
  description:
    "Evolution 1.0 by Evo Tech is an advanced AI platform for DeepFake detection and intelligence analysis, integrating autonomous Agents, forensic media evaluation, and role-based workflows for secure, real-time threat management.",
};

export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Scheduling" />
    </div>
  );
}
