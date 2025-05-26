import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evolution 1.0 | AI-Powered DeepFake Detection & Intelligence Platform",
  description:
    "Evolution 1.0 by Evo Tech is an advanced AI platform for DeepFake detection and intelligence analysis, integrating autonomous Agents, forensic media evaluation, and role-based workflows for secure, real-time threat management.",
};


export default function SignIn() {
  return <SignInForm />;
}
