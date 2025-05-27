// Form Component Types
import * as React from 'react';

export interface InputProps {
  id?: string;
  name?: string;
  type?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export interface CheckboxProps {
  id?: string;
  name?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export interface LabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

 