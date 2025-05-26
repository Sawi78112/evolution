import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evolution 1.0 | AI-Powered DeepFake Detection & Intelligence Platform",
  description:
    "Evolution 1.0 by Evo Tech is an advanced AI platform for DeepFake detection and intelligence analysis, integrating autonomous Agents, forensic media evaluation, and role-based workflows for secure, real-time threat management.",
};


export default function SignUp() {
  return <SignUpForm />;
}
