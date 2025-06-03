'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { Save, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for auto-save functionality
export interface AutoSaveConfig {
  key: string; // Unique key for localStorage
  delay?: number; // Debounce delay in milliseconds
  onSave?: (data: any) => Promise<void>; // Optional remote save function
  onRestore?: (data: any) => void; // Callback when data is restored
  enabled?: boolean; // Enable/disable auto-save
  saveOnUnload?: boolean; // Save when user leaves page
}

export interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}

// Auto-save hook for form data
export const useAutoSave = (config: AutoSaveConfig) => {
  const [status, setStatus] = useState<AutoSaveStatus>({ status: 'idle' });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<string>('');

  const saveToLocal = useCallback((data: any) => {
    if (!config.enabled) return;
    
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(`autosave_${config.key}`, serialized);
      localStorage.setItem(`autosave_${config.key}_timestamp`, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [config.key, config.enabled]);

  const loadFromLocal = useCallback(() => {
    if (!config.enabled) return null;
    
    try {
      const saved = localStorage.getItem(`autosave_${config.key}`);
      if (saved) {
        const data = JSON.parse(saved);
        const timestamp = localStorage.getItem(`autosave_${config.key}_timestamp`);
        return {
          data,
          timestamp: timestamp ? new Date(timestamp) : null
        };
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return null;
  }, [config.key, config.enabled]);

  const clearSaved = useCallback(() => {
    localStorage.removeItem(`autosave_${config.key}`);
    localStorage.removeItem(`autosave_${config.key}_timestamp`);
  }, [config.key]);

  const triggerSave = useCallback(async (data: any, isManual = false) => {
    if (!config.enabled) return;

    const serialized = JSON.stringify(data);
    
    // Skip if data hasn't changed
    if (!isManual && serialized === lastDataRef.current) return;
    
    lastDataRef.current = serialized;
    setStatus({ status: 'saving' });

    try {
      // Save to localStorage first
      saveToLocal(data);

      // Save to remote if configured
      if (config.onSave) {
        await config.onSave(data);
      }

      setStatus({ 
        status: 'saved', 
        lastSaved: new Date() 
      });

      // Reset status after a delay
      setTimeout(() => {
        setStatus(prev => prev.status === 'saved' ? { ...prev, status: 'idle' } : prev);
      }, 3000);

    } catch (error) {
      setStatus({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Save failed' 
      });
    }
  }, [config.enabled, config.onSave, saveToLocal]);

  const debouncedSave = useCallback((data: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      triggerSave(data);
    }, config.delay || 1000);
  }, [triggerSave, config.delay]);

  const manualSave = useCallback((data: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    triggerSave(data, true);
  }, [triggerSave]);

  // Setup beforeunload handler
  useEffect(() => {
    if (!config.saveOnUnload) return;

    const handleBeforeUnload = () => {
      const data = lastDataRef.current ? JSON.parse(lastDataRef.current) : null;
      if (data) {
        saveToLocal(data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [config.saveOnUnload, saveToLocal]);

  return {
    status,
    debouncedSave,
    manualSave,
    loadFromLocal,
    clearSaved,
    setStatus
  };
};

// Auto-save wrapper component for React Hook Form
interface AutoSaveWrapperProps {
  config: AutoSaveConfig;
  children: React.ReactNode;
  className?: string;
}

export const AutoSaveWrapper: React.FC<AutoSaveWrapperProps> = ({
  config,
  children,
  className
}) => {
  const { watch, getValues, reset } = useFormContext();
  const { status, debouncedSave, manualSave, loadFromLocal, clearSaved } = useAutoSave(config);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  // Check for saved data on mount
  useEffect(() => {
    const saved = loadFromLocal();
    if (saved && saved.data) {
      setShowRestorePrompt(true);
    }
  }, [loadFromLocal]);

  // Watch form changes and trigger auto-save
  useEffect(() => {
    const subscription = watch((data) => {
      debouncedSave(data);
    });

    return () => subscription.unsubscribe();
  }, [watch, debouncedSave]);

  const handleRestore = () => {
    const saved = loadFromLocal();
    if (saved && saved.data) {
      reset(saved.data);
      config.onRestore?.(saved.data);
    }
    setShowRestorePrompt(false);
  };

  const handleDismissRestore = () => {
    clearSaved();
    setShowRestorePrompt(false);
  };

  const handleManualSave = () => {
    const data = getValues();
    manualSave(data);
  };

  return (
    <div className={className}>
      {/* Restore Prompt */}
      <AnimatePresence>
        {showRestorePrompt && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">
                    Restore Previous Session
                  </h4>
                  <p className="text-sm text-blue-600">
                    We found unsaved changes from your previous session.
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleRestore}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Restore
                </button>
                <button
                  type="button"
                  onClick={handleDismissRestore}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-save Status */}
      <AutoSaveStatus 
        status={status} 
        onManualSave={handleManualSave}
        enabled={config.enabled}
      />

      {children}
    </div>
  );
};

// Auto-save status indicator component
interface AutoSaveStatusProps {
  status: AutoSaveStatus;
  onManualSave?: () => void;
  enabled?: boolean;
  position?: 'top' | 'bottom' | 'fixed';
  className?: string;
}

export const AutoSaveStatus: React.FC<AutoSaveStatusProps> = ({
  status,
  onManualSave,
  enabled = true,
  position = 'top',
  className
}) => {
  if (!enabled) return null;

  const getStatusConfig = () => {
    switch (status.status) {
      case 'saving':
        return {
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          text: 'Saving...',
          color: 'text-blue-600 bg-blue-50 border-blue-200'
        };
      case 'saved':
        return {
          icon: <Check className="h-4 w-4" />,
          text: status.lastSaved 
            ? `Saved at ${status.lastSaved.toLocaleTimeString()}`
            : 'Saved',
          color: 'text-green-600 bg-green-50 border-green-200'
        };
      case 'error':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          text: status.error || 'Save failed',
          color: 'text-red-600 bg-red-50 border-red-200'
        };
      default:
        return {
          icon: <Save className="h-4 w-4" />,
          text: 'Auto-save enabled',
          color: 'text-gray-600 bg-gray-50 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        flex items-center justify-between p-3 border rounded-lg mb-4
        ${config.color}
        ${position === 'fixed' ? 'fixed top-4 right-4 z-50 shadow-lg' : ''}
        ${className || ''}
      `}
    >
      <div className="flex items-center space-x-2">
        {config.icon}
        <span className="text-sm font-medium">{config.text}</span>
      </div>

      {onManualSave && status.status !== 'saving' && (
        <button
          type="button"
          onClick={onManualSave}
          className="px-2 py-1 text-xs bg-white rounded shadow-sm hover:shadow transition-shadow"
        >
          Save Now
        </button>
      )}
    </motion.div>
  );
};

// Form with auto-save capabilities
interface AutoSaveFormProps {
  config: AutoSaveConfig;
  children: React.ReactNode;
  methods: any; // React Hook Form methods
  onSubmit: (data: any) => void;
  className?: string;
}

export const AutoSaveForm: React.FC<AutoSaveFormProps> = ({
  config,
  children,
  methods,
  onSubmit,
  className
}) => {
  return (
    <FormProvider {...methods}>
      <AutoSaveWrapper config={config} className={className}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          {children}
        </form>
      </AutoSaveWrapper>
    </FormProvider>
  );
};

// Draft management utilities
export const draftUtils = {
  // Get all saved drafts
  getAllDrafts: (): Array<{ key: string; timestamp: Date; preview?: string }> => {
    const drafts: Array<{ key: string; timestamp: Date; preview?: string }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('autosave_') && !key.endsWith('_timestamp')) {
        const dataKey = key.replace('autosave_', '');
        const timestampKey = `${key}_timestamp`;
        const timestamp = localStorage.getItem(timestampKey);
        
        if (timestamp) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            const preview = data.title || data.name || data.subject || 'Untitled Draft';
            
            drafts.push({
              key: dataKey,
              timestamp: new Date(timestamp),
              preview
            });
          } catch (error) {
            console.error('Failed to parse draft:', error);
          }
        }
      }
    }
    
    return drafts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  // Delete a specific draft
  deleteDraft: (key: string) => {
    localStorage.removeItem(`autosave_${key}`);
    localStorage.removeItem(`autosave_${key}_timestamp`);
  },

  // Clear all drafts
  clearAllDrafts: () => {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('autosave_')
    );
    keys.forEach(key => localStorage.removeItem(key));
  },

  // Get draft data
  getDraft: (key: string) => {
    try {
      const data = localStorage.getItem(`autosave_${key}`);
      const timestamp = localStorage.getItem(`autosave_${key}_timestamp`);
      
      if (data && timestamp) {
        return {
          data: JSON.parse(data),
          timestamp: new Date(timestamp)
        };
      }
    } catch (error) {
      console.error('Failed to get draft:', error);
    }
    return null;
  }
};
