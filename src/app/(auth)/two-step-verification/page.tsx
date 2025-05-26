import TwoStepVerificationForm from "@/components/auth/TwoStepVerificationForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evolution 1.0 | Two-Step Verification",
  description:
    "Secure your Evolution 1.0 account with two-step verification. Enter the code sent to your mobile device to complete the verification process.",
};

export default function TwoStepVerification() {
  return <TwoStepVerificationForm />;
} 