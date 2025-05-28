import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Evolution 1.0 | AI-Powered DeepFake Detection & Intelligence Platform",
  description:
    "Evolution 1.0 by Evo Tech is an advanced AI platform for DeepFake detection and intelligence analysis, integrating autonomous Agents, forensic media evaluation, and role-based workflows for secure, real-time threat management.",
};

function SignInFormWrapper() {
  return <SignInForm />;
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center flex-1 lg:w-1/2 w-full">
        <div className="w-full max-w-md mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-6">
              <div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-11 bg-gray-200 rounded"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-11 bg-gray-200 rounded"></div>
              </div>
              <div className="h-11 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <SignInFormWrapper />
    </Suspense>
  );
}
