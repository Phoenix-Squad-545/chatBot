import { removeCookies } from "../hooks/useCookies";

export const logoutUser = () => {
  removeCookies("accessToken");
  removeCookies("refreshToken");
  removeCookies("tokenType");
  window.location.href = "/";
};

// Helper function to convert date string to ISO format
export const formatDateToISO = (dateString: string): string => {
  try {
    // If it's already in ISO format, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
      return dateString;
    }
    
    // Handle format like "15/05/2026, 17:30:00" (DD/MM/YYYY, HH:MM:SS)
    if (dateString.includes('/') && dateString.includes(',')) {
      const [datePart, timePart] = dateString.split(', ');
      const [day, month, year] = datePart.split('/');
      // Create ISO format: YYYY-MM-DDTHH:MM:SS.000Z
      const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}.000Z`;
      return isoString;
    }
    
    // Handle format like "2026-05-08T18:01:21.229Z" (already ISO)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}T/)) {
      return dateString;
    }
    
    // Handle format like "2026-05-08 18:01:21"
    if (dateString.includes('-') && dateString.includes(' ')) {
      const [datePart, timePart] = dateString.split(' ');
      return `${datePart}T${timePart}.000Z`;
    }
    
    // Try parsing with Date constructor as fallback
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
    
    console.error('Unable to parse date:', dateString);
    return dateString;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};