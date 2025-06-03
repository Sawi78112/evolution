// Date formatting function
export const formatCreatedAt = (dateString: string) => {
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }
    
    const month = date.toLocaleDateString('en-US', { month: 'short' }); // e.g., "Jun"
    const day = String(date.getDate()).padStart(2, '0'); // e.g., "02"
    const hours = String(date.getHours()).padStart(2, '0'); // e.g., "14"
    const minutes = String(date.getMinutes()).padStart(2, '0'); // e.g., "30"
    const seconds = String(date.getSeconds()).padStart(2, '0'); // e.g., "45"
    
    return `${month} ${day}, ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return dateString; // Return original if formatting fails
  }
};

// Division status configuration
export const divisionStatusConfig = {
  "Active": { color: "success" as const },
  "Inactive": { color: "warning" as const },
};

// Get status configuration helper
export const getStatusConfig = (status: string) => {
  return divisionStatusConfig[status as keyof typeof divisionStatusConfig] || { color: "info" as const };
}; 