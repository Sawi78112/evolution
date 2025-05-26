import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Evolution 1.0",
  description:
    "Reset your password for Evolution 1.0, the AI-powered DeepFake detection and intelligence platform.",
};

export default function ResetPassword() {
  return <ResetPasswordForm />;
} 