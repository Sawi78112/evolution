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
import { useUserData } from "../../hooks/useUserData";

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
  const getMovementLimits = () => {
    const { width, height } = getImageDimensions();
    const radius = containerSize / 2;
    
    const maxX = Math.max(0, (width - containerSize) / 2);
    const maxY = Math.max(0, (height - containerSize) / 2);
    
    return {
      minX: -maxX,
      maxX: maxX,
      minY: -maxY,
      maxY: maxY
    };
  };

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
  }, [isDragging, dragStart, zoom, imageNaturalSize]);

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
  }, [zoom, imageNaturalSize]);

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
  const { userData, loading, error } = useUserData();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tempImageForEdit, setTempImageForEdit] = useState<string | null>(null);
  const [isPhotoEditOpen, setIsPhotoEditOpen] = useState(false);
  
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
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
    setSelectedImage(croppedImage);
    setIsPhotoEditOpen(false);
    
    try {
      // Convert base64 to blob
      const blob = dataURLtoBlob(croppedImage);
      
      // TODO: Get actual user ID from auth context
      const userId = userData?.user_id || "current-user-id";
      
      // Upload to Supabase storage
      const result = await uploadAvatar({
        userId,
        file: blob,
        fileName: `avatar-${userId}-${Date.now()}.jpg`
      });
      
      if (result.success && result.url) {
        console.log("Avatar uploaded successfully:", result.url);
        // TODO: Update user profile in database with new avatar URL
        // await updateUserProfile({ avatar_url: result.url });
      } else {
        console.error("Upload failed:", result.error);
        // TODO: Show error toast to user
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      // TODO: Show error toast to user
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
  const avatarUrl = selectedImage || "/images/user/user-09.jpg";

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 relative group cursor-pointer">
              <Image
                width={80}
                height={80}
                src={avatarUrl}
                alt="user"
                className="object-cover"
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
              {/* Social links will be added back when database columns are available */}
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
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input type="text" defaultValue={userData?.username?.split(' ')[0] || ""} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input type="text" defaultValue={userData?.username?.split(' ')[1] || ""} />
                  </div>
                </div>
                  </div>

              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Contact Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Office Email</Label>
                    <Input
                      type="email"
                      defaultValue={userData?.office_email || ""}
                      disabled
                    />
                  </div>

                  <div>
                    <Label>Office Phone</Label>
                    <Input 
                      type="text" 
                      defaultValue={userData?.office_phone || ""} 
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
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
