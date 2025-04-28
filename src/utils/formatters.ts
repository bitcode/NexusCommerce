/**
 * Format a date string or Date object into a human-readable format
 * @param dateString Date string or Date object
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(dateString);
  }
};

/**
 * Format a price number or string into a currency format
 * @param price Price number or string
 * @param currencyCode Currency code (default: USD)
 * @returns Formatted price string
 */
export const formatPrice = (
  price: number | string,
  currencyCode: string = 'USD'
): string => {
  try {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(numericPrice);
  } catch (error) {
    console.error('Error formatting price:', error);
    return String(price);
  }
};

/**
 * Format a number with commas for thousands
 * @param num Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number | string): string => {
  try {
    const numericValue = typeof num === 'string' ? parseFloat(num) : num;
    return new Intl.NumberFormat('en-US').format(numericValue);
  } catch (error) {
    console.error('Error formatting number:', error);
    return String(num);
  }
};

/**
 * Truncate a string to a maximum length and add ellipsis if needed
 * @param str String to truncate
 * @param maxLength Maximum length
 * @returns Truncated string
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

/**
 * Format a phone number to a standard format
 * @param phone Phone number string
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  try {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }
    
    // If not a standard format, return the original
    return phone;
  } catch (error) {
    console.error('Error formatting phone number:', error);
    return phone;
  }
};
