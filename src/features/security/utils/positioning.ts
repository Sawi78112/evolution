import { DropdownPosition } from '../types';

// Calculate optimal dropdown position to prevent overflow
export const calculateDropdownPosition = (
  targetElement: HTMLElement,
  dropdownHeight: number = 300
): DropdownPosition => {
  const rect = targetElement.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  
  // Determine if dropdown should appear above or below
  const direction = (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) 
    ? 'top' 
    : 'bottom';
    
  return {
    x: rect.left,
    y: rect.top,
    direction
  };
}; 