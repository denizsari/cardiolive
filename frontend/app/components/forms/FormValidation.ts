// Form validation utilities with comprehensive validation rules
import { FieldError } from 'react-hook-form';

// Type definitions for validation
export interface ValidationRule {
  message: string;
  test: (value: any) => boolean;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[];
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, FieldError>;
}

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    message,
    test: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return !isNaN(value);
      if (Array.isArray(value)) return value.length > 0;
      return value != null && value !== undefined;
    }
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    message,
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    message: message || `Must be at least ${min} characters long`,
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      return String(value).length >= min;
    }
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    message: message || `Must be no more than ${max} characters long`,
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      return String(value).length <= max;
    }
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    message,
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      return regex.test(value);
    }
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    message,
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      return phoneRegex.test(value);
    }
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule => ({
    message,
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
  }),

  number: (message = 'Must be a valid number'): ValidationRule => ({
    message,
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      return !isNaN(Number(value)) && isFinite(Number(value));
    }
  }),

  integer: (message = 'Must be a whole number'): ValidationRule => ({
    message,
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      const num = Number(value);
      return !isNaN(num) && Number.isInteger(num);
    }
  }),

  min: (minimum: number, message?: string): ValidationRule => ({
    message: message || `Must be at least ${minimum}`,
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      return Number(value) >= minimum;
    }
  }),

  max: (maximum: number, message?: string): ValidationRule => ({
    message: message || `Must be no more than ${maximum}`,
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      return Number(value) <= maximum;
    }
  }),

  strongPassword: (message = 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'): ValidationRule => ({
    message,
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return strongPasswordRegex.test(value);
    }
  }),

  matchField: (fieldName: string, getFieldValue: (name: string) => any, message?: string): ValidationRule => ({
    message: message || `Must match ${fieldName}`,
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      return value === getFieldValue(fieldName);
    }
  }),

  fileSize: (maxSizeMB: number, message?: string): ValidationRule => ({
    message: message || `File size must be less than ${maxSizeMB}MB`,
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      if (value instanceof File) {
        return value.size <= maxSizeMB * 1024 * 1024;
      }
      if (value instanceof FileList) {
        return Array.from(value).every(file => file.size <= maxSizeMB * 1024 * 1024);
      }
      return true;
    }
  }),

  fileType: (allowedTypes: string[], message?: string): ValidationRule => ({
    message: message || `File type must be one of: ${allowedTypes.join(', ')}`,
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      if (value instanceof File) {
        return allowedTypes.includes(value.type);
      }
      if (value instanceof FileList) {
        return Array.from(value).every(file => allowedTypes.includes(file.type));
      }
      return true;
    }
  }),

  arrayMinLength: (min: number, message?: string): ValidationRule => ({
    message: message || `Must select at least ${min} item${min !== 1 ? 's' : ''}`,
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      if (Array.isArray(value)) {
        return value.length >= min;
      }
      return true;
    }
  }),

  arrayMaxLength: (max: number, message?: string): ValidationRule => ({
    message: message || `Cannot select more than ${max} item${max !== 1 ? 's' : ''}`,
    test: (value) => {
      if (!value) return true; // Allow empty for optional fields
      if (Array.isArray(value)) {
        return value.length <= max;
      }
      return true;
    }
  }),

  custom: (validator: (value: any) => boolean, message = 'Invalid value'): ValidationRule => ({
    message,
    test: validator
  })
};

// Form validation function
export const validateForm = (data: Record<string, any>, schema: ValidationSchema): FormValidationResult => {
  const errors: Record<string, FieldError> = {};
  let isValid = true;

  Object.entries(schema).forEach(([fieldName, rules]) => {
    const value = data[fieldName];
      for (const rule of rules) {
      if (!rule.test(value)) {
        errors[fieldName] = { message: rule.message, type: 'validation' };
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  });

  return { isValid, errors };
};

// Hook for form validation
export const useFormValidation = (schema: ValidationSchema) => {
  const validate = (data: Record<string, any>) => validateForm(data, schema);
  
  const validateField = (fieldName: string, value: any) => {
    const fieldRules = schema[fieldName];
    if (!fieldRules) return null;
    
    for (const rule of fieldRules) {
      if (!rule.test(value)) {
        return { message: rule.message };
      }
    }
    return null;
  };

  return { validate, validateField };
};

// Common validation schemas for different forms
export const commonSchemas = {
  userRegistration: {
    name: [validationRules.required(), validationRules.minLength(2), validationRules.maxLength(50)],
    email: [validationRules.required(), validationRules.email()],
    password: [validationRules.required(), validationRules.strongPassword()],
    confirmPassword: [] // Will be set dynamically with matchField
  },

  userLogin: {
    email: [validationRules.required(), validationRules.email()],
    password: [validationRules.required()]
  },

  contactForm: {
    name: [validationRules.required(), validationRules.minLength(2), validationRules.maxLength(100)],
    email: [validationRules.required(), validationRules.email()],
    subject: [validationRules.required(), validationRules.minLength(5), validationRules.maxLength(200)],
    message: [validationRules.required(), validationRules.minLength(10), validationRules.maxLength(1000)]
  },

  productForm: {
    name: [validationRules.required(), validationRules.minLength(2), validationRules.maxLength(200)],
    sku: [validationRules.required(), validationRules.pattern(/^[A-Z0-9\-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens')],
    price: [validationRules.required(), validationRules.number(), validationRules.min(0)],
    category: [validationRules.required()],
    stock: [validationRules.required(), validationRules.integer(), validationRules.min(0)],
    weight: [validationRules.number(), validationRules.min(0)]
  },

  profileForm: {
    firstName: [validationRules.required(), validationRules.minLength(2), validationRules.maxLength(50)],
    lastName: [validationRules.required(), validationRules.minLength(2), validationRules.maxLength(50)],
    email: [validationRules.required(), validationRules.email()],
    phone: [validationRules.phone()],
    website: [validationRules.url()],
    bio: [validationRules.maxLength(500)]
  }
};

// Utility functions for form handling
export const formUtils = {
  // Clean form data by trimming strings and removing empty values
  cleanFormData: (data: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed !== '') cleaned[key] = trimmed;
      } else if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    });
    
    return cleaned;
  },

  // Convert form data to FormData for file uploads
  toFormData: (data: Record<string, any>): FormData => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value instanceof FileList) {
        Array.from(value).forEach((file, index) => {
          formData.append(`${key}[${index}]`, file);
        });
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, String(item));
        });
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    return formData;
  },

  // Deep merge form data objects
  mergeFormData: (...objects: Record<string, any>[]): Record<string, any> => {
    return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
  },

  // Extract changed fields by comparing with original data
  getChangedFields: (original: Record<string, any>, current: Record<string, any>): Record<string, any> => {
    const changed: Record<string, any> = {};
    
    Object.keys(current).forEach(key => {
      if (JSON.stringify(original[key]) !== JSON.stringify(current[key])) {
        changed[key] = current[key];
      }
    });
    
    return changed;
  },

  // Format error messages for display
  formatErrors: (errors: Record<string, FieldError>): string[] => {
    return Object.entries(errors).map(([field, error]) => `${field}: ${error.message}`);
  },

  // Check if form has any errors
  hasErrors: (errors: Record<string, FieldError>): boolean => {
    return Object.keys(errors).length > 0;
  }
};
