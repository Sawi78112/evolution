// Form Component Types
import * as React from 'react';

export interface RadioProps {
  id: string;
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  label?: string;
  className?: string;
}

export interface TextareaProps {
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  rows?: number;
  cols?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

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

export interface SwitchProps {
  id?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export interface FileInputProps {
  id?: string;
  name?: string;
  accept?: string;
  multiple?: boolean;
  onChange?: (files: FileList | null) => void;
  className?: string;
  disabled?: boolean;
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

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export interface FormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export interface CountryCode {
  code: string;
  name: string;
  flag: string;
}

export interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export type DatePickerPropsType = {
  value?: Date;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}; 