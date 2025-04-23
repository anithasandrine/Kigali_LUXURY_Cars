// Input validation functions

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
exports.isValidEmail = (email) => {
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
  };
  
  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - True if valid
   */
  exports.isValidPhone = (phone) => {
    // Basic phone validation - can be customized for specific formats
    const re = /^\+?[0-9]{8,15}$/;
    return re.test(phone);
  };
  
  /**
   * Validate date format and ensure it's in the future
   * @param {string} dateStr - Date string to validate
   * @returns {boolean} - True if valid and in the future
   */
  exports.isValidFutureDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      return date instanceof Date && !isNaN(date) && date > now;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Check if a rental period is valid (end date after start date)
   * @param {string} startDateStr - Start date string
   * @param {string} endDateStr - End date string
   * @returns {boolean} - True if valid period
   */
  exports.isValidRentalPeriod = (startDateStr, endDateStr) => {
    try {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      return startDate < endDate;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Calculate rental duration in days
   * @param {string} startDateStr - Start date string
   * @param {string} endDateStr - End date string
   * @returns {number} - Number of days
   */
  exports.calculateRentalDays = (startDateStr, endDateStr) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Minimum 1 day
  };
  
  /**
   * Sanitize user input to prevent XSS
   * @param {string} text - Text to sanitize
   * @returns {string} - Sanitized text
   */
  exports.sanitizeInput = (text) => {
    if (!text) return '';
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };