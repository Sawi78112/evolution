"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useRef } from "react";

export default function TwoStepVerificationForm() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus next input after typing
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace and move to previous input
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle verification logic here
    console.log('Verification code:', code.join(''));
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Two Step Verification
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              A verification code has been sent to your mobile. Please enter it in the field below.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Verification Code Inputs */}
                <div>
                  <Label>Type your 6-digits security code</Label>
                  <div className="grid grid-cols-6 gap-2 mt-2 w-full">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-0 py-2 text-center text-base font-medium text-gray-800 shadow-evolution-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      />
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button 
                    type="submit"
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-evolution-xs hover:bg-brand-600"
                  >
                    Verify My Account
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Didn't get the code? 
                <Link
                  href="#"
                  className="ml-1 text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Resend
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 