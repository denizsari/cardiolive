// Enhanced Form Components with loading states, animations, and accessibility
import React, { forwardRef, useState, useEffect, useRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { FieldError } from 'react-hook-form';
import { AlertCircle, CheckCircle2, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Utility function for combining class names
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Enhanced FormInput with loading and error animations
interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onDrag'> {
  label?: string;
  error?: FieldError | { message: string };
  helperText?: string;
  required?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  success?: boolean;
  showPasswordToggle?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required, 
    leftIcon, 
    rightIcon, 
    loading, 
    success,
    showPasswordToggle,
    type,
    className,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password')
      : type;

    const hasRightIcon = rightIcon || loading || success || showPasswordToggle;

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
              "disabled:bg-gray-50 disabled:text-gray-500",
              leftIcon ? "pl-10" : "",
              hasRightIcon ? "pr-10" : "",
              error && "border-red-300 focus:ring-red-500 focus:border-red-500",
              success && "border-green-300 focus:ring-green-500 focus:border-green-500",
              loading && "cursor-wait",
              className
            )}
            style={{
              borderColor: error ? '#FCA5A5' : success ? '#86EFAC' : undefined
            }}
            aria-invalid={error ? 'true' : 'false'}
            aria-required={required ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            disabled={loading || props.disabled}
            {...props}
          />
          
          {hasRightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {loading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 border-2 border-gray-300 border-t-green-500 rounded-full"
                />
              )}
              {success && !loading && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </motion.div>
              )}
              {showPasswordToggle && !loading && !success && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
              {rightIcon && !loading && !success && !showPasswordToggle && rightIcon}
            </div>
          )}
        </div>        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-1" id={`${inputId}-error`} role="alert">
                <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{typeof error === 'string' ? error : error.message}</p>
              </div>
            </motion.div>
          )}
          {helperText && !error && (
            <motion.p
              key="helper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-gray-500"
            >
              {helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

// Enhanced FormTextarea with auto-resize and character count
interface FormTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onDrag'> {
  label?: string;
  error?: FieldError | { message: string };
  helperText?: string;
  required?: boolean;
  loading?: boolean;
  success?: boolean;
  autoResize?: boolean;
  maxLength?: number;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(  ({ 
    label, 
    error, 
    helperText, 
    required, 
    loading, 
    success,
    autoResize,
    maxLength,
    className,
    value,
    onChange,
    id,
    ...props 
  }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const [characterCount, setCharacterCount] = useState(0);
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    // Handle ref forwarding properly
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(internalRef.current);
      } else if (ref) {
        ref.current = internalRef.current;
      }
    }, [ref]);

    useEffect(() => {
      if (autoResize && internalRef.current) {
        const textarea = internalRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value, autoResize]);

    useEffect(() => {
      if (typeof value === 'string') {
        setCharacterCount(value.length);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharacterCount(e.target.value.length);
      if (onChange) onChange(e);
    };

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
          </label>
        )}
        
        <div className="relative">
          <textarea
            ref={internalRef}
            id={textareaId}
            value={value}
            onChange={handleChange}
            className={cn(
              "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
              "disabled:bg-gray-50 disabled:text-gray-500",
              autoResize ? "resize-none overflow-hidden" : "resize-vertical min-h-[100px]",
              error && "border-red-300 focus:ring-red-500 focus:border-red-500",
              success && "border-green-300 focus:ring-green-500 focus:border-green-500",
              loading && "cursor-wait",
              className
            )}
            style={{
              borderColor: error ? '#FCA5A5' : success ? '#86EFAC' : undefined
            }}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${textareaId}-error` : undefined}
            maxLength={maxLength}
            {...props}
          />
          
          {(loading || success) && (
            <div className="absolute top-2 right-2">
              {loading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 border-2 border-gray-300 border-t-green-500 rounded-full"
                />
              )}
              {success && !loading && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </motion.div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-start">
          <div className="flex-1">            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                >                  <div className="flex items-center space-x-1" id={`${textareaId}-error`} role="alert">
                    <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">{typeof error === 'string' ? error : error.message}</p>
                  </div>
                </motion.div>
              )}
              {helperText && !error && (
                <motion.p
                  key="helper"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-gray-500"
                >
                  {helperText}
                </motion.p>
              )}
            </AnimatePresence>          </div>
          {maxLength && (
            <div className="text-xs text-gray-400 ml-2 flex-shrink-0">
              {characterCount}/{maxLength}
            </div>
          )}
        </div>
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

// Enhanced FormSelect
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: FieldError | { message: string };
  helperText?: string;
  required?: boolean;
  loading?: boolean;
  success?: boolean;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required, 
    loading, 
    success,
    options,
    placeholder = "Select an option...",
    className,
    id,
    ...props 
  }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
              "disabled:bg-gray-50 disabled:text-gray-500",
              "appearance-none bg-white",
              error && "border-red-300 focus:ring-red-500 focus:border-red-500",
              success && "border-green-300 focus:ring-green-500 focus:border-green-500",
              loading && "cursor-wait",
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${selectId}-error` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option: SelectOption) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 pointer-events-none">
            {loading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 border-2 border-gray-300 border-t-green-500 rounded-full"
              />
            )}
            {success && !loading && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </motion.div>
            )}
            {!loading && !success && (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
            >              <div className="flex items-center space-x-1" id={`${selectId}-error`} role="alert">
                <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{typeof error === 'string' ? error : error.message}</p>
              </div>
            </motion.div>
          )}
          {helperText && !error && (
            <motion.p
              key="helper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-gray-500"
            >
              {helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

// FormCheckbox component
interface FormCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: FieldError | { message: string };
  helperText?: string;
  required?: boolean;
  id?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, helperText, required, className, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1">
        <div className="flex items-center">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={cn(
              "h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded",
              "transition-colors duration-200",
              error && "border-red-300 focus:ring-red-500",
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${checkboxId}-error` : undefined}
            {...props}
          />
          {label && (
            <label htmlFor={checkboxId} className="ml-2 block text-sm text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
            </label>
          )}
        </div>
          <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
            >              <div className="flex items-center space-x-1" id={`${checkboxId}-error`} role="alert">
                <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{typeof error === 'string' ? error : error.message}</p>
              </div>
            </motion.div>
          )}
          {helperText && !error && (
            <motion.p
              key="helper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-gray-500"
            >
              {helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';

// FormRadioGroup component
interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FormRadioGroupProps {
  name: string;
  label?: string;
  error?: FieldError | { message: string };
  helperText?: string;
  required?: boolean;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const FormRadioGroup: React.FC<FormRadioGroupProps> = ({
  name,
  label,
  error,
  helperText,
  required,
  options,
  value,
  onChange,
  className
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">            <input
              type="radio"
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={option.disabled}
              className={cn(
                "h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300",
                "transition-colors duration-200",
                error && "border-red-300 focus:ring-red-500"
              )}
              aria-describedby={error ? `${name}-error` : undefined}
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className={cn(
                "ml-2 block text-sm text-gray-700",
                option.disabled && "text-gray-400"
              )}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-1"
            id={`${name}-error`}
            role="alert"
          >
            <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error.message}</p>
          </motion.div>
        )}
        {helperText && !error && (
          <motion.p
            key="helper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-gray-500"
          >
            {helperText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// FormSwitch component
interface FormSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: FieldError | { message: string };
  helperText?: string;
  required?: boolean;
  id?: string;
}

export const FormSwitch = forwardRef<HTMLInputElement, FormSwitchProps>(
  ({ label, error, helperText, required, checked, onChange, className, id, ...props }, ref) => {
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          {label && (
            <label htmlFor={switchId} className="block text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
            </label>
          )}
          
          <motion.button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => {
              const event = {
                target: { checked: !checked }
              } as React.ChangeEvent<HTMLInputElement>;
              onChange?.(event);
            }}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
              checked ? "bg-green-600" : "bg-gray-200",
              error && "focus:ring-red-500",
              className
            )}
            whileTap={{ scale: 0.95 }}
          >
            <input
              ref={ref}
              id={switchId}
              type="checkbox"
              checked={checked}
              onChange={onChange}
              className="sr-only"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${switchId}-error` : undefined}
              {...props}
            />
            <motion.span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200",
                checked ? "translate-x-6" : "translate-x-1"
              )}
              layout
              transition={{
                type: "spring",
                stiffness: 700,
                damping: 30
              }}
            />
          </motion.button>
        </div>
          <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-1" id={`${switchId}-error`} role="alert">
                <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error.message}</p>
              </div>
            </motion.div>
          )}
          {helperText && !error && (
            <motion.p
              key="helper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-gray-500"
            >
              {helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FormSwitch.displayName = 'FormSwitch';

// FormButton component
interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const FormButton = forwardRef<HTMLButtonElement, FormButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    className,
    ...props 
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 active:scale-95";
    
    const variantClasses = {
      primary: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
      secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
      outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-green-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
    };
    
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
    };
    
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          isDisabled && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100",
          className
        )}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {leftIcon && !loading && (
          <span className="mr-2">
            {leftIcon}
          </span>
        )}
        {loading && loadingText ? loadingText : children}
        {rightIcon && !loading && (
          <span className="ml-2">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

FormButton.displayName = 'FormButton';
