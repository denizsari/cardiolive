'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: `
    bg-[#70BB1B] text-white
    hover:bg-[#5ea516] 
    focus:ring-2 focus:ring-[#70BB1B] focus:ring-offset-2
    active:bg-[#4a8912] active:transform active:scale-95
    disabled:bg-gray-400 disabled:cursor-not-allowed
    shadow-md hover:shadow-lg
    transition-all duration-200 ease-in-out
  `,
  secondary: `
    bg-gray-600 text-white
    hover:bg-gray-700 
    focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
    active:bg-gray-800 active:transform active:scale-95
    disabled:bg-gray-400 disabled:cursor-not-allowed
    shadow-md hover:shadow-lg
    transition-all duration-200 ease-in-out
  `,
  outline: `
    border-2 border-[#70BB1B] text-[#70BB1B] bg-transparent
    hover:bg-[#70BB1B] hover:text-white
    focus:ring-2 focus:ring-[#70BB1B] focus:ring-offset-2
    active:bg-[#5ea516] active:border-[#5ea516] active:transform active:scale-95
    disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed
    transition-all duration-200 ease-in-out
  `,
  ghost: `
    text-gray-700 bg-transparent
    hover:bg-gray-100 hover:text-[#70BB1B]
    focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
    active:bg-gray-200 active:transform active:scale-95
    disabled:text-gray-400 disabled:cursor-not-allowed
    transition-all duration-200 ease-in-out
  `,
  danger: `
    bg-red-600 text-white
    hover:bg-red-700 
    focus:ring-2 focus:ring-red-500 focus:ring-offset-2
    active:bg-red-800 active:transform active:scale-95
    disabled:bg-gray-400 disabled:cursor-not-allowed
    shadow-md hover:shadow-lg
    transition-all duration-200 ease-in-out
  `,
  success: `
    bg-green-600 text-white
    hover:bg-green-700 
    focus:ring-2 focus:ring-green-500 focus:ring-offset-2
    active:bg-green-800 active:transform active:scale-95
    disabled:bg-gray-400 disabled:cursor-not-allowed
    shadow-md hover:shadow-lg
    transition-all duration-200 ease-in-out
  `
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md min-h-[32px]',
  md: 'px-4 py-2 text-sm rounded-lg min-h-[40px]',
  lg: 'px-6 py-3 text-base rounded-lg min-h-[44px]',
  xl: 'px-8 py-4 text-lg rounded-xl min-h-[52px]'
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText = 'Yükleniyor...',
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        'font-medium focus:outline-none relative overflow-hidden',
        'flex items-center justify-center gap-2',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
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
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span className={loading ? 'opacity-70' : ''}>
        {loading ? loadingText : children}
      </span>
    </button>
  );
}

// Enhanced Link Button component for next/link integration
interface LinkButtonProps extends Pick<ButtonProps, 'variant' | 'size' | 'className'> {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}

export function LinkButton({
  href,
  external = false,
  variant = 'primary',
  size = 'md',
  className,
  children,
}: LinkButtonProps) {
  const buttonClasses = cn(
    'inline-flex font-medium focus:outline-none relative overflow-hidden',
    'items-center justify-center gap-2 text-decoration-none',
    buttonVariants[variant],
    buttonSizes[size],
    className
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses}
      >
        {children}
      </a>
    );
  }  // For internal links, we'll use Next.js Link
  return (
    <Link href={href} className={buttonClasses}>
      {children}
    </Link>
  );
}

// Icon Button component
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  ariaLabel: string;
}

export function IconButton({
  icon,
  ariaLabel,
  variant = 'ghost',
  size = 'md',
  className,
  ...props
}: IconButtonProps) {
  const iconSizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4'
  };

  return (
    <Button
      variant={variant}
      className={cn('!px-0 !py-0 aspect-square', iconSizes[size], className)}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </Button>
  );
}
