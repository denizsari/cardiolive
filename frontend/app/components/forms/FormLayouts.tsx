// Form Layout Components for organizing and structuring forms
'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Info, AlertTriangle, CheckCircle } from 'lucide-react';

// Utility function for combining class names
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Form Section Component
interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  icon?: ReactNode;
  variant?: 'default' | 'highlighted' | 'outlined';
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className,
  collapsible = false,
  defaultCollapsed = false,
  icon,
  variant = 'default'
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const sectionVariants = {
    default: "bg-white",
    highlighted: "bg-gradient-to-r from-green-50 to-blue-50 border border-green-200",
    outlined: "border border-gray-200 rounded-lg"
  };

  return (
    <div className={cn(
      "space-y-4",
      variant === 'outlined' && "p-6",
      sectionVariants[variant],
      className
    )}>
      {(title || description) && (
        <div 
          className={cn(
            "flex items-center justify-between",
            collapsible && "cursor-pointer"
          )}
          onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
        >
          <div className="flex items-start space-x-3">
            {icon && (
              <div className="flex-shrink-0 mt-1">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-medium text-gray-900">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-gray-600 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          {collapsible && (
            <button
              type="button"
              className="flex-shrink-0 p-1 rounded hover:bg-gray-100 transition-colors"
            >
              {isCollapsed ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              )}
            </button>
          )}
        </div>      )}      <motion.div
        {...(collapsible ? {
          initial: { height: defaultCollapsed ? 0 : 'auto', opacity: defaultCollapsed ? 0 : 1 },
          animate: {
            height: isCollapsed ? 0 : 'auto',
            opacity: isCollapsed ? 0 : 1
          },
          transition: { duration: 0.3 },
          style: { overflow: 'hidden' }
        } : {})}
      >
        <div style={{ height: '100%' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

// Form Grid Component
interface FormGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  responsive?: boolean;
  'data-testid'?: string;
}

export const FormGrid: React.FC<FormGridProps> = ({
  children,
  columns = 2,
  gap = 'md',
  className,
  responsive = true,
  'data-testid': testId
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: responsive ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2',
    3: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
    4: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-4'
  };
  return (
    <div 
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

// Form Row Component
interface FormRowProps {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FormRow: React.FC<FormRowProps> = ({
  children,
  className,
  align = 'start',
  gap = 'md'
}) => {
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end'
  };

  const gapClasses = {
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8'
  };

  return (
    <div className={cn(
      'flex',
      alignClasses[align],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

// Form Card Component
interface FormCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  actions?: ReactNode;
}

export const FormCard: React.FC<FormCardProps> = ({
  title,
  description,
  children,
  className,
  shadow = 'md',
  padding = 'lg',
  actions
}) => {
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200',
      shadowClasses[shadow],
      paddingClasses[padding],
      className
    )}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-medium text-gray-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 mt-1">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="space-y-6">
        {children}
      </div>

      {actions && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          {actions}
        </div>
      )}
    </div>
  );
};

// Form Group Component (for grouping related fields)
interface FormGroupProps {
  label?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
  error?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  description,
  children,
  className,
  required,
  error
}) => {
  return (
    <fieldset className={cn('space-y-2', className)}>
      {label && (
        <legend className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </legend>
      )}
      
      {description && (
        <p className="text-sm text-gray-600">
          {description}
        </p>
      )}

      <div className="space-y-4">
        {children}
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </fieldset>
  );
};

// Form Tabs Component
interface FormTab {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  hasError?: boolean;
  completed?: boolean;
}

interface FormTabsProps {
  tabs: FormTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  variant?: 'pills' | 'underline' | 'enclosed';
}

export const FormTabs: React.FC<FormTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = 'underline'
}) => {
  const [internalActiveTab, setInternalActiveTab] = React.useState(activeTab || tabs[0]?.id);
  
  const currentTab = activeTab || internalActiveTab;
  const activeTabContent = tabs.find(tab => tab.id === currentTab)?.content;

  const handleTabChange = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && !tab.disabled) {
      setInternalActiveTab(tabId);
      onTabChange?.(tabId);
    }
  };

  const tabVariants = {
    pills: {
      container: "flex space-x-1 p-1 bg-gray-100 rounded-lg",
      tab: "px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
      active: "bg-white text-gray-900 shadow",
      inactive: "text-gray-500 hover:text-gray-700"
    },
    underline: {
      container: "flex space-x-8 border-b border-gray-200",
      tab: "py-2 px-1 text-sm font-medium border-b-2 transition-all duration-200",
      active: "border-green-500 text-green-600",
      inactive: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    },
    enclosed: {
      container: "flex space-x-0 border-b border-gray-200",
      tab: "px-4 py-2 text-sm font-medium border border-gray-200 transition-all duration-200",
      active: "bg-white border-b-white text-gray-900 -mb-px",
      inactive: "bg-gray-50 text-gray-500 hover:text-gray-700"
    }
  };

  const styles = tabVariants[variant];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Tab Navigation */}
      <nav className={styles.container}>
        {tabs.map((tab) => {
          const isActive = tab.id === currentTab;
          
          return (            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              disabled={tab.disabled}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={cn(
                styles.tab,
                isActive ? styles.active : styles.inactive,
                tab.disabled && "opacity-50 cursor-not-allowed",
                tab.hasError && "text-red-600",
                "flex items-center space-x-2"
              )}
            >
              <span>{tab.label}</span>
              
              {/* Status indicators */}
              {tab.completed && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {tab.hasError && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </button>
          );
        })}
      </nav>      {/* Tab Content */}
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div>
          {activeTabContent}
        </div>
      </motion.div>
    </div>
  );
};

// Form Sidebar Layout Component
interface FormSidebarLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  sidebarWidth?: 'sm' | 'md' | 'lg';
  sidebarPosition?: 'left' | 'right';
  className?: string;
}

export const FormSidebarLayout: React.FC<FormSidebarLayoutProps> = ({
  sidebar,
  children,
  sidebarWidth = 'md',
  sidebarPosition = 'left',
  className
}) => {
  const widthClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96'
  };

  return (
    <div className={cn('flex space-x-8', className)}>
      {sidebarPosition === 'left' && (
        <aside className={cn('flex-shrink-0', widthClasses[sidebarWidth])}>
          {sidebar}
        </aside>
      )}
      
      <main className="flex-1 min-w-0">
        {children}
      </main>
      
      {sidebarPosition === 'right' && (
        <aside className={cn('flex-shrink-0', widthClasses[sidebarWidth])}>
          {sidebar}
        </aside>
      )}
    </div>
  );
};

// Form Help/Info Component
interface FormHelpProps {
  title?: string;
  children: ReactNode;
  type?: 'info' | 'warning' | 'success' | 'error';
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const FormHelp: React.FC<FormHelpProps> = ({
  title,
  children,
  type = 'info',
  className,
  dismissible = false,
  onDismiss
}) => {
  const [isDismissed, setIsDismissed] = React.useState(false);

  const typeStyles = {
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-800",
      icon: <Info className="h-4 w-4 text-blue-400" />
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-800",
      icon: <AlertTriangle className="h-4 w-4 text-yellow-400" />
    },
    success: {
      container: "bg-green-50 border-green-200 text-green-800",
      icon: <CheckCircle className="h-4 w-4 text-green-400" />
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-800",
      icon: <AlertTriangle className="h-4 w-4 text-red-400" />
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  const styles = typeStyles[type];

  return (
    <div className={cn(
      "rounded-md border p-4",
      styles.container,
      className
    )}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        
        <div className="flex-1">
          {title && (
            <h4 className="font-medium mb-1">
              {title}
            </h4>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-shrink-0 rounded hover:bg-black hover:bg-opacity-10 p-1 transition-colors"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

const formLayoutComponents = {
  FormSection,
  FormGrid,
  FormRow,
  FormCard,
  FormGroup,
  FormTabs,
  FormSidebarLayout,
  FormHelp
};

export default formLayoutComponents;
