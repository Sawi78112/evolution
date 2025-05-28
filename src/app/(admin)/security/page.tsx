import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { SecurityTable } from "@/features/security";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Security | Evolution 1.0",
  description:
    "Manage security, monitor access attempts, and track user activity across the Evolution 1.0 platform.",
};


export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Security" />
      <div className="space-y-6">
        <ComponentCard title="User Management">
          <SecurityTable />
        </ComponentCard>
      </div>
    </div>
  );
}
