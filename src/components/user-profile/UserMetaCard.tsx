"use client";
import React, { useState, useRef, useCallback } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";
import Badge from "../ui/badge/Badge";
import { uploadAvatar, dataURLtoBlob } from "../../lib/supabase/storage";
import { useUserData, useUserAvatar } from "../../hooks/useUserData";
import { updateUserProfile, UpdateUserProfileData, updateUserAvatar } from "../../lib/supabase/user-service";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../ui/notification";

interface PhotoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (croppedImage: string) => void;
}

const PhotoEditModal: React.FC<PhotoEditModalProps> = ({ isOpen, onClose, imageUrl, onSave }) => {
  const [zoom, setZoom] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerSize = 256; // 64 * 4 = 256px circle

  // Update current image when imageUrl prop changes
  React.useEffect(() => {
    setCurrentImageUrl(imageUrl);
  }, [imageUrl]);

  // Handle image load to get natural dimensions
  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageNaturalSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
      // Reset position when new image loads
      setPosition({ x: 0, y: 0 });
      setZoom(0);
      setRotation(0);
    }
  };

  // Calculate image display dimensions maintaining aspect ratio
  const getImageDimensions = () => {
    if (!imageNaturalSize.width || !imageNaturalSize.height) {
      return { width: containerSize, height: containerSize };
    }

    const scale = 1 + (zoom / 100);
    const aspectRatio = imageNaturalSize.width / imageNaturalSize.height;
    
    let width, height;
    
    if (aspectRatio > 1) {
      // Landscape: fit height to container, scale width proportionally
      height = containerSize * scale;
      width = height * aspectRatio;
    } else {
      // Portrait or square: fit width to container, scale height proportionally
      width = containerSize * scale;
      height = width / aspectRatio;
    }

    // Ensure minimum size covers the circle
    const minSize = containerSize * scale;
    if (width < minSize) {
      width = minSize;
      height = minSize / aspectRatio;
    }
    if (height < minSize) {
      height = minSize;
      width = minSize * aspectRatio;
    }

    return { width, height };
  };

  // Calculate movement limits to prevent blank spaces
  const getMovementLimits = useCallback(() => {
    const { width, height } = getImageDimensions();
    
    const maxX = Math.max(0, (width - containerSize) / 2);
    const maxY = Math.max(0, (height - containerSize) / 2);
    
    return {
      minX: -maxX,
      maxX: maxX,
      minY: -maxY,
      maxY: maxY
    };
  }, [zoom, imageNaturalSize, containerSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Apply movement limits
      const limits = getMovementLimits();
      const constrainedX = Math.max(limits.minX, Math.min(limits.maxX, newX));
      const constrainedY = Math.max(limits.minY, Math.min(limits.maxY, newY));
      
      setPosition({
        x: constrainedX,
        y: constrainedY
      });
    }
  }, [isDragging, dragStart, getMovementLimits]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Adjust position when zoom changes to prevent blank spaces
  React.useEffect(() => {
    const limits = getMovementLimits();
    setPosition(prev => ({
      x: Math.max(limits.minX, Math.min(limits.maxX, prev.x)),
      y: Math.max(limits.minY, Math.min(limits.maxY, prev.y))
    }));
  }, [getMovementLimits]);

  const handleReset = () => {
    setPosition({ x: 0, y: 0 });
    setZoom(0);
    setRotation(0);
  };

  const handleSavePhoto = async () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match the circular crop area
    canvas.width = 200;
    canvas.height = 200;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(100, 100, 100, 0, 2 * Math.PI);
    ctx.clip();

    // Calculate image dimensions for canvas
    const { width, height } = getImageDimensions();
    const scaleToCanvas = 200 / containerSize;
    
    const canvasWidth = width * scaleToCanvas;
    const canvasHeight = height * scaleToCanvas;
    const canvasX = (position.x + (containerSize - width) / 2) * scaleToCanvas;
    const canvasY = (position.y + (containerSize - height) / 2) * scaleToCanvas;

    // Apply transformations
    ctx.save();
    ctx.translate(100, 100);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-100, -100);

    // Draw the image
    ctx.drawImage(
      imageRef.current,
      canvasX,
      canvasY,
      canvasWidth,
      canvasHeight
    );

    ctx.restore();

    // Convert to blob and call onSave
    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onload = () => {
          onSave(reader.result as string);
          onClose();
        };
        reader.readAsDataURL(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleChangeImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImageUrl = event.target?.result as string;
          setCurrentImageUrl(newImageUrl);
          // Reset position and zoom when changing image
          setPosition({ x: 0, y: 0 });
          setZoom(0);
          setRotation(0);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (!isOpen) return null;

  const { width: imgWidth, height: imgHeight } = getImageDimensions();

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4">
      <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-6">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit photo
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Adjust your photo position, zoom, and rotation.
          </p>
        </div>

        <div className="px-2 pb-3">
          {/* Circular crop area */}
          <div 
            className="relative mx-auto bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border-4 border-gray-300 dark:border-gray-600 mb-6"
            style={{ width: containerSize, height: containerSize }}
          >
            <div
              className="absolute cursor-move"
              onMouseDown={handleMouseDown}
              style={{
                width: imgWidth,
                height: imgHeight,
                left: position.x + (containerSize - imgWidth) / 2,
                top: position.y + (containerSize - imgHeight) / 2,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={currentImageUrl}
                alt="Edit preview"
                className="w-full h-full object-cover"
                draggable={false}
                onLoad={handleImageLoad}
              />
            </div>
          </div>

          {/* Move indicator */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Move
            </span>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Zoom</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{zoom}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="100"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            {/* Rotate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rotate</span>
                <button
                  onClick={handleReset}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Reset
                </button>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-2 mt-6">
          <button
            onClick={handleChangeImage}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Change image
          </button>
          <div className="flex gap-3">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <button
              onClick={handleSavePhoto}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              Save photo
            </button>
          </div>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </Modal>
  );
};

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { userData, loading, error, refetch } = useUserData();
  const { user, refreshUser } = useAuth();
  const { avatarUrl: userAvatarUrl, refreshAvatar } = useUserAvatar();
  const notification = useNotification();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tempImageForEdit, setTempImageForEdit] = useState<string | null>(null);
  const [isPhotoEditOpen, setIsPhotoEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    linkedinUrl: '',
    twitterUrl: '',
    facebookUrl: '',
    instagramUrl: ''
  });

  // Initialize form data when modal opens
  React.useEffect(() => {
    if (isOpen && userData) {
      const nameParts = userData.username?.split(' ') || ['', ''];
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        linkedinUrl: userData.linkedin_link || '',
        twitterUrl: userData.x_link || '',
        facebookUrl: userData.facebook_link || '',
        instagramUrl: userData.instagram_link || ''
      });
      setSaveError(null);
    }
  }, [isOpen, userData]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setSaveError('First name and last name are required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const profileData: UpdateUserProfileData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        linkedinUrl: formData.linkedinUrl.trim() || undefined,
        twitterUrl: formData.twitterUrl.trim() || undefined,
        facebookUrl: formData.facebookUrl.trim() || undefined,
        instagramUrl: formData.instagramUrl.trim() || undefined,
      };

      const result = await updateUserProfile(user.id, profileData);

      if (result.success) {
        // Refresh user data to show updated information
        await refetch();
        await refreshUser();
        
        // Show success toast notification
        notification.success("Profile Updated!", "Your profile information has been updated successfully.");
        console.log("Profile updated successfully");
        
        // Close modal immediately
        closeModal();
      } else {
        setSaveError(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setTempImageForEdit(imageUrl);
        setIsPhotoEditOpen(true);
      };
      reader.readAsDataURL(file);
      console.log("File selected:", file);
    }
  };

  const handleSaveEditedPhoto = async (croppedImage: string) => {
    setIsPhotoEditOpen(false);
    
    if (!user?.id) {
      console.error('No user ID available for avatar upload');
      notification.error("Upload Error", "Unable to upload avatar - no user ID available");
      return;
    }
    
    try {
      // Convert base64 to blob
      const blob = dataURLtoBlob(croppedImage);
      
      // Upload to Supabase storage (this already updates the database)
      const result = await uploadAvatar({
        userId: user.id,
        file: blob,
        fileName: `avatar-${user.id}-${Date.now()}.jpg`
      });
      
      if (result.success && result.url) {
        console.log("Avatar uploaded and database updated successfully:", result.url);
        
        // Show success notification
        notification.success("Avatar Updated!", "Your profile photo has been updated successfully.");
        
        // Refresh avatar display and user data
        await refreshAvatar();
        await refetch();
        await refreshUser();
        
        // Clear selected image so it uses the fresh data from database
        setSelectedImage(null);
      } else {
        console.error("Upload failed:", result.error);
        notification.error("Upload Error", result.error || "Failed to upload avatar");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      notification.error("Upload Error", "An unexpected error occurred while uploading your avatar");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="animate-pulse">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
              <div className="w-20 h-20 bg-gray-300 rounded-full dark:bg-gray-600"></div>
              <div className="order-3 xl:order-2">
                <div className="h-6 bg-gray-300 rounded w-32 mb-2 dark:bg-gray-600"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-300 rounded w-20 dark:bg-gray-600"></div>
                  <div className="h-6 bg-gray-300 rounded w-16 dark:bg-gray-600"></div>
                </div>
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

  // Default values if userData is not available
  const displayName = userData?.username || "User";
  const userStatus = userData?.user_status || "Active";
  // Use userAvatarUrl from database, fallback to selectedImage only during upload process
  const avatarUrl = userAvatarUrl || selectedImage || '/images/default-avatar.svg';

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 relative group cursor-pointer">
              <img
                width={80}
                height={80}
                src={avatarUrl}
                alt="user"
                className="object-cover"
                onError={(e) => {
                  console.error('Avatar image failed to load:', avatarUrl);
                  // Fallback to default avatar on error
                  e.currentTarget.src = '/images/default-avatar.svg';
                }}
                onLoad={() => {
                  console.log('Avatar image loaded successfully:', avatarUrl);
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImageChange}
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {displayName}
              </h4>
              <div className="flex flex-col items-center gap-2 text-center xl:flex-row xl:gap-3 xl:text-left">
                <Badge 
                  variant="light" 
                  color={userStatus === 'Active' ? 'success' : userStatus === 'Inactive' ? 'warning' : 'error'} 
                  size="sm"
                >
                  {userStatus}
                </Badge>
              </div>
            </div>
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              {/* Social links display */}
              <div className="flex items-center gap-3">
                {userData?.linkedin_link && (
                  <a
                    href={userData.linkedin_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-11 h-11 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-blue-900 dark:hover:text-blue-400"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                
                {userData?.x_link && (
                  <a
                    href={userData.x_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-11 h-11 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-gray-900 hover:text-white dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
                
                {userData?.facebook_link && (
                  <a
                    href={userData.facebook_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-11 h-11 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-blue-600 hover:text-white dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-blue-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                
                {userData?.instagram_link && (
                  <a
                    href={userData.instagram_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-11 h-11 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-pink-600 hover:text-white dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-pink-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
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
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              {saveError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {saveError}
                </div>
              )}
              
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <input
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                      required
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-evolution-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <input
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                      required
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-evolution-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Social Links
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>LinkedIn</Label>
                    <input
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-evolution-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Twitter</Label>
                    <input
                      type="url"
                      value={formData.twitterUrl}
                      onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                      placeholder="https://twitter.com/username"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-evolution-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Facebook</Label>
                    <input
                      type="url"
                      value={formData.facebookUrl}
                      onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                      placeholder="https://facebook.com/username"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-evolution-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Instagram</Label>
                    <input
                      type="url"
                      value={formData.instagramUrl}
                      onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                      placeholder="https://instagram.com/username"
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
      {isPhotoEditOpen && (
        <PhotoEditModal
          isOpen={isPhotoEditOpen}
          onClose={() => setIsPhotoEditOpen(false)}
          imageUrl={tempImageForEdit || ""}
          onSave={handleSaveEditedPhoto}
        />
      )}
    </>
  );
}
