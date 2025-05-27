import ResetPasswordUpdateForm from "@/components/auth/ResetPasswordUpdateForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Update Password | Evolution 1.0",
  description:
    "Update your password for Evolution 1.0, the AI-powered DeepFake detection and intelligence platform.",
};

export default function ResetPasswordUpdate() {
  return <ResetPasswordUpdateForm />;
} 