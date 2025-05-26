// Common Component Types
import * as React from 'react';

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

export interface ComponentCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
  isActive?: boolean;
  badge?: string | number;
} 