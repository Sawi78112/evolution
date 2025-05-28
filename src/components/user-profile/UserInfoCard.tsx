"use client";
import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import { useUserData } from "../../hooks/useUserData";
import { updateOfficialInfo, UpdateOfficialInfoData } from "../../lib/supabase/user-service";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../ui/notification";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { userData, loading, error, refetch } = useUserData();
  const { user, refreshUser } = useAuth();
  const notification = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    abbreviation: '',
    officeEmail: '',
    officePhone: ''
  });

  // Initialize form data when modal opens
  React.useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        abbreviation: userData.user_abbreviation || '',
        officeEmail: userData.office_email || '',
        officePhone: userData.office_phone || ''
      });
      setSaveError(null);
    }
  }, [isOpen, userData]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'abbreviation' ? value.toUpperCase() : value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation
    const abbreviation = formData.abbreviation.trim();
    const officeEmail = formData.officeEmail.trim();
    const officePhone = formData.officePhone.trim();

    if (!abbreviation || !officeEmail || !officePhone) {
      setSaveError('All fields are required');
      return;
    }

    if (abbreviation.length !== 4 || !/^[A-Z]{4}$/.test(abbreviation)) {
      setSaveError('Abbreviation must be exactly 4 uppercase letters');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(officeEmail)) {
      setSaveError('Please enter a valid email address');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const officialData: UpdateOfficialInfoData = {
        abbreviation: abbreviation,
        officeEmail: officeEmail,
        officePhone: officePhone,
      };

      const result = await updateOfficialInfo(user.id, officialData);

      if (result.success) {
        // Refresh user data to show updated information
        await refetch();
        await refreshUser();
        
        // Show success toast notification
        notification.success("Official Information Updated!", "Your official information has been updated successfully.");
        console.log("Official information updated successfully");
        
        // Close modal immediately
        closeModal();
      } else {
        setSaveError(result.error || 'Failed to update official information');
      }
    } catch (error) {
      console.error('Error updating official information:', error);
      setSaveError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="animate-pulse">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="h-6 bg-gray-300 rounded w-40 mb-6 dark:bg-gray-600"></div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-300 rounded w-20 mb-2 dark:bg-gray-600"></div>
                    <div className="h-5 bg-gray-300 rounded w-32 dark:bg-gray-600"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-5 border border-red-200 rounded-2xl dark:border-red-800 lg:p-6">
        <div className="text-red-600 dark:text-red-400">
          <p className="font-medium">Error loading user data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Get division name or "None" if not set
  const divisionName = userData?.division_name || "None";
  
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Official Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Abbreviation
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData?.user_abbreviation || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Division
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {divisionName}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Office email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData?.office_email || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Office phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData?.office_phone || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-evolution-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-6">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Official Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your official details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 pb-3">
              {saveError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {saveError}
                </div>
              )}
              
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Official Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Abbreviation</Label>
                    <input
                      type="text"
                      value={formData.abbreviation}
                      onChange={(e) => handleInputChange('abbreviation', e.target.value)}
                      placeholder="ABCD"
                      maxLength={4}
                      required
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-evolution-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Division</Label>
                    <input
                      type="text"
                      value={divisionName}
                      disabled
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-evolution-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Office email</Label>
                    <input
                      type="email"
                      value={formData.officeEmail}
                      onChange={(e) => handleInputChange('officeEmail', e.target.value)}
                      placeholder="user@company.com"
                      required
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-evolution-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Office phone</Label>
                    <input
                      type="tel"
                      value={formData.officePhone}
                      onChange={(e) => handleInputChange('officePhone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      required
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-evolution-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} disabled={isSaving}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
