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
  const direction = (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) 
    ? 'top' 
    : 'bottom';
    
  // Calculate precise Y position based on direction
  let yPosition;
  if (direction === 'top') {
    // For top positioning, position at the trigger element
    // CSS transform will handle moving it above
    yPosition = rect.top;
    // Ensure it doesn't go above viewport after transform
    if (rect.top - dropdownHeight < 10) {
      yPosition = 10 + dropdownHeight;
    }
  } else {
    // Position below the trigger element with small gap
    yPosition = rect.bottom + 8;
    // Ensure it doesn't go below viewport
    const maxY = window.innerHeight - dropdownHeight - 10;
    yPosition = Math.min(yPosition, maxY);
  }
    
  return {
    x: rect.left,
    y: yPosition,
    direction
  };
}; 