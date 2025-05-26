// UI Component Types
import * as React from 'react';

export type BadgeVariant = "light" | "solid";
export type BadgeSize = "sm" | "md";
export type UIBadgeColor =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "primary"
  | "light"
  | "dark"
  | "secondary";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: UIBadgeColor;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  children: React.ReactNode;
  className?: string;
}

export type AspectRatio = "16:9" | "4:3" | "21:9" | "1:1";

export interface YouTubeEmbedProps {
  videoId: string;
  aspectRatio?: AspectRatio;
  autoplay?: boolean;
  controls?: boolean;
  mute?: boolean;
  loop?: boolean;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export interface AvatarTextProps {
  text: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  fallback?: string;
  className?: string;
} 