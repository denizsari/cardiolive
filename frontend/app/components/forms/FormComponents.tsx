import { FieldError } from 'react-hook-form';
import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

// Utility function for combining class names
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Base form input component with error handling
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  helperText?: string;
  required?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, required, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
            "disabled:bg-gray-50 disabled:text-gray-500",
            error && "border-red-300 focus:ring-red-500 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error.message}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

// Form textarea component
interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: FieldError;
  helperText?: string;
  required?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, helperText, required, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
            "disabled:bg-gray-50 disabled:text-gray-500",
            "resize-vertical min-h-[100px]",
            error && "border-red-300 focus:ring-red-500 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error.message}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

// Form select component
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: FieldError;
  helperText?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helperText, required, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
            "disabled:bg-gray-50 disabled:text-gray-500",
            error && "border-red-300 focus:ring-red-500 focus:border-red-500",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-red-600">{error.message}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

// Loading button component
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText = 'Yükleniyor...',
  variant = 'primary',
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  
  const variantClasses = {
    primary: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {loading ? loadingText : children}
    </button>
  );
};

// Form error display component
interface FormErrorProps {
  errors: FieldError[];
}

export const FormErrors: React.FC<FormErrorProps> = ({ errors }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Lütfen aşağıdaki hataları düzeltin:
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc space-y-1 pl-5">
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>    </div>
  );
};
