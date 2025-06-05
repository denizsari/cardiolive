'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { generateId } from '@/utils/ssr';

// Form state types
export interface FormField {
  name: string;
  value: any;
  isDirty: boolean;
  isTouched: boolean;
  error?: string;
  isValidating?: boolean;
}

export interface FormStep {
  id: string;
  name: string;
  isValid: boolean;
  isComplete: boolean;
  fields: Record<string, FormField>;
  data: Record<string, any>;
  errors: Record<string, any>;
}

export interface FormSession {
  id: string;
  formId: string;
  steps: Record<string, FormStep>;
  currentStep: string;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  metadata: {
    created: Date;
    updated: Date;
    version: number;
    userId?: string;
    sessionTimeout?: number;
  };
}

export interface FormStateConfig {
  formId: string;
  sessionId?: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
  maxSessions?: number;
  sessionTimeout?: number;
  persistence?: 'localStorage' | 'sessionStorage' | 'memory' | 'none';
  onStateChange?: (state: FormStateContextValue) => void;
  onError?: (error: Error) => void;
}

// Action types for form state reducer
type FormStateAction = 
  | { type: 'CREATE_SESSION'; payload: { sessionId: string; formId: string } }
  | { type: 'UPDATE_FIELD'; payload: { stepId: string; fieldName: string; value: any } }
  | { type: 'SET_FIELD_ERROR'; payload: { stepId: string; fieldName: string; error: string } }
  | { type: 'CLEAR_FIELD_ERROR'; payload: { stepId: string; fieldName: string } }
  | { type: 'SET_STEP_DATA'; payload: { stepId: string; data: Record<string, any> } }
  | { type: 'SET_CURRENT_STEP'; payload: { stepId: string } }
  | { type: 'MARK_STEP_COMPLETE'; payload: { stepId: string } }
  | { type: 'SET_SUBMITTING'; payload: { isSubmitting: boolean } }
  | { type: 'RESET_FORM'; payload?: { keepData?: boolean } }
  | { type: 'LOAD_SESSION'; payload: { session: FormSession } }
  | { type: 'CLEAR_SESSION'; payload: { sessionId: string } }
  | { type: 'UPDATE_METADATA'; payload: Partial<FormSession['metadata']> };

// Form state context
interface FormStateContextValue {
  sessions: Record<string, FormSession>;
  currentSession: FormSession | null;
  config: FormStateConfig;
  
  // Session management
  createSession: (formId: string, sessionId?: string) => string;
  loadSession: (sessionId: string) => FormSession | null;
  clearSession: (sessionId: string) => void;
  switchSession: (sessionId: string) => void;
  
  // Field management
  updateField: (stepId: string, fieldName: string, value: any) => void;
  setFieldError: (stepId: string, fieldName: string, error: string) => void;
  clearFieldError: (stepId: string, fieldName: string) => void;
  getFieldValue: (stepId: string, fieldName: string) => any;
  getFieldError: (stepId: string, fieldName: string) => string | undefined;
  
  // Step management
  setStepData: (stepId: string, data: Record<string, any>) => void;
  getStepData: (stepId: string) => Record<string, any>;
  setCurrentStep: (stepId: string) => void;
  markStepComplete: (stepId: string) => void;
  isStepValid: (stepId: string) => boolean;
  
  // Form management
  setSubmitting: (isSubmitting: boolean) => void;
  resetForm: (keepData?: boolean) => void;
  getAllData: () => Record<string, any>;
  isFormValid: () => boolean;
  isFormDirty: () => boolean;
  
  // Persistence
  saveToStorage: () => void;
  loadFromStorage: () => void;
  clearStorage: () => void;
  
  // Utilities
  export: () => string;
  import: (data: string) => boolean;
}

const FormStateContext = createContext<FormStateContextValue | null>(null);

// Form state reducer
function formStateReducer(
  state: { sessions: Record<string, FormSession>; currentSessionId: string | null },
  action: FormStateAction
): { sessions: Record<string, FormSession>; currentSessionId: string | null } {
  switch (action.type) {
    case 'CREATE_SESSION': {
      const { sessionId, formId } = action.payload;
      const newSession: FormSession = {
        id: sessionId,
        formId,
        steps: {},
        currentStep: '',
        isSubmitting: false,
        isValid: false,
        isDirty: false,
        metadata: {
          created: new Date(),
          updated: new Date(),
          version: 1
        }
      };
      
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [sessionId]: newSession
        },
        currentSessionId: sessionId
      };
    }
    
    case 'UPDATE_FIELD': {
      const { stepId, fieldName, value } = action.payload;
      const currentSessionId = state.currentSessionId;
      if (!currentSessionId) return state;
      
      const session = state.sessions[currentSessionId];
      if (!session) return state;
      
      const step = session.steps[stepId] || {
        id: stepId,
        name: stepId,
        isValid: false,
        isComplete: false,
        fields: {},
        data: {},
        errors: {}
      };
      
      const updatedStep = {
        ...step,
        fields: {
          ...step.fields,
          [fieldName]: {
            name: fieldName,
            value,
            isDirty: true,
            isTouched: true
          }
        },
        data: {
          ...step.data,
          [fieldName]: value
        }
      };
      
      const updatedSession = {
        ...session,
        steps: {
          ...session.steps,
          [stepId]: updatedStep
        },
        isDirty: true,
        metadata: {
          ...session.metadata,
          updated: new Date(),
          version: session.metadata.version + 1
        }
      };
      
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [currentSessionId]: updatedSession
        }
      };
    }
    
    case 'SET_FIELD_ERROR': {
      const { stepId, fieldName, error } = action.payload;
      const currentSessionId = state.currentSessionId;
      if (!currentSessionId) return state;
      
      const session = state.sessions[currentSessionId];
      if (!session) return state;
      
      const step = session.steps[stepId];
      if (!step) return state;
      
      const updatedStep = {
        ...step,
        fields: {
          ...step.fields,
          [fieldName]: {
            ...step.fields[fieldName],
            error
          }
        },
        errors: {
          ...step.errors,
          [fieldName]: error
        }
      };
      
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [currentSessionId]: {
            ...session,
            steps: {
              ...session.steps,
              [stepId]: updatedStep
            }
          }
        }
      };
    }
    
    case 'CLEAR_FIELD_ERROR': {
      const { stepId, fieldName } = action.payload;
      const currentSessionId = state.currentSessionId;
      if (!currentSessionId) return state;
      
      const session = state.sessions[currentSessionId];
      if (!session) return state;
      
      const step = session.steps[stepId];
      if (!step) return state;
      
      const updatedErrors = { ...step.errors };
      delete updatedErrors[fieldName];
      
      const updatedFields = { ...step.fields };
      if (updatedFields[fieldName]) {
        updatedFields[fieldName] = {
          ...updatedFields[fieldName],
          error: undefined
        };
      }
      
      const updatedStep = {
        ...step,
        fields: updatedFields,
        errors: updatedErrors
      };
      
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [currentSessionId]: {
            ...session,
            steps: {
              ...session.steps,
              [stepId]: updatedStep
            }
          }
        }
      };
    }
    
    case 'SET_STEP_DATA': {
      const { stepId, data } = action.payload;
      const currentSessionId = state.currentSessionId;
      if (!currentSessionId) return state;
      
      const session = state.sessions[currentSessionId];
      if (!session) return state;
      
      const step = session.steps[stepId] || {
        id: stepId,
        name: stepId,
        isValid: false,
        isComplete: false,
        fields: {},
        data: {},
        errors: {}
      };
      
      const updatedStep = {
        ...step,
        data: { ...step.data, ...data }
      };
      
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [currentSessionId]: {
            ...session,
            steps: {
              ...session.steps,
              [stepId]: updatedStep
            },
            isDirty: true
          }
        }
      };
    }
    
    case 'SET_CURRENT_STEP': {
      const { stepId } = action.payload;
      const currentSessionId = state.currentSessionId;
      if (!currentSessionId) return state;
      
      const session = state.sessions[currentSessionId];
      if (!session) return state;
      
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [currentSessionId]: {
            ...session,
            currentStep: stepId
          }
        }
      };
    }
    
    case 'MARK_STEP_COMPLETE': {
      const { stepId } = action.payload;
      const currentSessionId = state.currentSessionId;
      if (!currentSessionId) return state;
      
      const session = state.sessions[currentSessionId];
      if (!session) return state;
      
      const step = session.steps[stepId];
      if (!step) return state;
      
      const updatedStep = {
        ...step,
        isComplete: true,
        isValid: true
      };
      
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [currentSessionId]: {
            ...session,
            steps: {
              ...session.steps,
              [stepId]: updatedStep
            }
          }
        }
      };
    }
    
    case 'SET_SUBMITTING': {
      const { isSubmitting } = action.payload;
      const currentSessionId = state.currentSessionId;
      if (!currentSessionId) return state;
      
      const session = state.sessions[currentSessionId];
      if (!session) return state;
      
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [currentSessionId]: {
            ...session,
            isSubmitting
          }
        }
      };
    }
    
    case 'RESET_FORM': {
      const currentSessionId = state.currentSessionId;
      if (!currentSessionId) return state;
      
      const session = state.sessions[currentSessionId];
      if (!session) return state;
      
      const resetSession = {
        ...session,
        steps: action.payload?.keepData ? session.steps : {},
        currentStep: '',
        isSubmitting: false,
        isValid: false,
        isDirty: false,
        metadata: {
          ...session.metadata,
          updated: new Date()
        }
      };
      
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [currentSessionId]: resetSession
        }
      };
    }
    
    case 'LOAD_SESSION': {
      const { session } = action.payload;
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session.id]: session
        },
        currentSessionId: session.id
      };
    }
    
    case 'CLEAR_SESSION': {
      const { sessionId } = action.payload;
      const newSessions = { ...state.sessions };
      delete newSessions[sessionId];
      
      return {
        ...state,
        sessions: newSessions,
        currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId
      };
    }
    
    default:
      return state;
  }
}

// Form state provider component
interface FormStateProviderProps {
  config: FormStateConfig;
  children: React.ReactNode;
}

export const FormStateProvider: React.FC<FormStateProviderProps> = ({
  config,
  children
}) => {
  const [state, dispatch] = useReducer(formStateReducer, {
    sessions: {},
    currentSessionId: null
  });

  const currentSession = state.currentSessionId ? state.sessions[state.currentSessionId] : null;

  // Storage utilities
  const getStorageKey = useCallback((key: string) => {
    return `formState_${config.formId}_${key}`;
  }, [config.formId]);

  const saveToStorage = useCallback(() => {
    if (config.persistence === 'none' || !currentSession) return;
    
    const storage = config.persistence === 'localStorage' ? localStorage : sessionStorage;
    const key = getStorageKey('session');
    
    try {
      storage.setItem(key, JSON.stringify(currentSession));
    } catch (error) {
      config.onError?.(error instanceof Error ? error : new Error('Storage failed'));
    }
  }, [config.persistence, currentSession, getStorageKey, config.onError]);

  const loadFromStorage = useCallback(() => {
    if (config.persistence === 'none') return;
    
    const storage = config.persistence === 'localStorage' ? localStorage : sessionStorage;
    const key = getStorageKey('session');
    
    try {
      const saved = storage.getItem(key);
      if (saved) {
        const session: FormSession = JSON.parse(saved);
        dispatch({ type: 'LOAD_SESSION', payload: { session } });
        return session;
      }
    } catch (error) {
      config.onError?.(error instanceof Error ? error : new Error('Load failed'));
    }
    return null;
  }, [config.persistence, getStorageKey, config.onError]);

  const clearStorage = useCallback(() => {
    if (config.persistence === 'none') return;
    
    const storage = config.persistence === 'localStorage' ? localStorage : sessionStorage;
    const key = getStorageKey('session');
    storage.removeItem(key);
  }, [config.persistence, getStorageKey]);
  // Session management
  const createSession = useCallback((formId: string, sessionId?: string) => {
    const id = sessionId || generateId(`session_${formId}`);
    dispatch({ type: 'CREATE_SESSION', payload: { sessionId: id, formId } });
    return id;
  }, []);

  const loadSession = useCallback((sessionId: string) => {
    return state.sessions[sessionId] || null;
  }, [state.sessions]);

  const clearSession = useCallback((sessionId: string) => {
    dispatch({ type: 'CLEAR_SESSION', payload: { sessionId } });
  }, []);

  const switchSession = useCallback((sessionId: string) => {
    if (state.sessions[sessionId]) {
      dispatch({ type: 'LOAD_SESSION', payload: { session: state.sessions[sessionId] } });
    }
  }, [state.sessions]);

  // Field management
  const updateField = useCallback((stepId: string, fieldName: string, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { stepId, fieldName, value } });
  }, []);

  const setFieldError = useCallback((stepId: string, fieldName: string, error: string) => {
    dispatch({ type: 'SET_FIELD_ERROR', payload: { stepId, fieldName, error } });
  }, []);

  const clearFieldError = useCallback((stepId: string, fieldName: string) => {
    dispatch({ type: 'CLEAR_FIELD_ERROR', payload: { stepId, fieldName } });
  }, []);

  const getFieldValue = useCallback((stepId: string, fieldName: string) => {
    return currentSession?.steps[stepId]?.data[fieldName];
  }, [currentSession]);

  const getFieldError = useCallback((stepId: string, fieldName: string) => {
    return currentSession?.steps[stepId]?.errors[fieldName];
  }, [currentSession]);

  // Step management
  const setStepData = useCallback((stepId: string, data: Record<string, any>) => {
    dispatch({ type: 'SET_STEP_DATA', payload: { stepId, data } });
  }, []);

  const getStepData = useCallback((stepId: string) => {
    return currentSession?.steps[stepId]?.data || {};
  }, [currentSession]);

  const setCurrentStep = useCallback((stepId: string) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: { stepId } });
  }, []);

  const markStepComplete = useCallback((stepId: string) => {
    dispatch({ type: 'MARK_STEP_COMPLETE', payload: { stepId } });
  }, []);

  const isStepValid = useCallback((stepId: string) => {
    const step = currentSession?.steps[stepId];
    return step?.isValid || false;
  }, [currentSession]);

  // Form management
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', payload: { isSubmitting } });
  }, []);

  const resetForm = useCallback((keepData = false) => {
    dispatch({ type: 'RESET_FORM', payload: { keepData } });
  }, []);

  const getAllData = useCallback(() => {
    if (!currentSession) return {};
    
    const allData: Record<string, any> = {};
    Object.values(currentSession.steps).forEach(step => {
      Object.assign(allData, step.data);
    });
    return allData;
  }, [currentSession]);

  const isFormValid = useCallback(() => {
    if (!currentSession) return false;
    return Object.values(currentSession.steps).every(step => step.isValid);
  }, [currentSession]);

  const isFormDirty = useCallback(() => {
    return currentSession?.isDirty || false;
  }, [currentSession]);

  // Import/Export
  const exportData = useCallback(() => {
    return JSON.stringify({
      session: currentSession,
      config: config,
      timestamp: new Date().toISOString()
    }, null, 2);
  }, [currentSession, config]);

  const importData = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.session) {
        dispatch({ type: 'LOAD_SESSION', payload: { session: parsed.session } });
        return true;
      }
    } catch (error) {
      config.onError?.(error instanceof Error ? error : new Error('Import failed'));
    }
    return false;
  }, [config.onError]);

  // Auto-save effect
  React.useEffect(() => {
    if (config.autoSave && currentSession?.isDirty) {
      const interval = setInterval(() => {
        saveToStorage();
      }, config.autoSaveInterval || 30000); // Default 30 seconds

      return () => clearInterval(interval);
    }
  }, [config.autoSave, config.autoSaveInterval, currentSession?.isDirty, saveToStorage]);

  // State change notification
  React.useEffect(() => {
    config.onStateChange?.({
      sessions: state.sessions,
      currentSession,
      config,
      createSession,
      loadSession,
      clearSession,
      switchSession,
      updateField,
      setFieldError,
      clearFieldError,
      getFieldValue,
      getFieldError,
      setStepData,
      getStepData,
      setCurrentStep,
      markStepComplete,
      isStepValid,
      setSubmitting,
      resetForm,
      getAllData,
      isFormValid,
      isFormDirty,
      saveToStorage,
      loadFromStorage,
      clearStorage,
      export: exportData,
      import: importData
    });
  }, [state, currentSession, config]);

  const contextValue = useMemo<FormStateContextValue>(() => ({
    sessions: state.sessions,
    currentSession,
    config,
    createSession,
    loadSession,
    clearSession,
    switchSession,
    updateField,
    setFieldError,
    clearFieldError,
    getFieldValue,
    getFieldError,
    setStepData,
    getStepData,
    setCurrentStep,
    markStepComplete,
    isStepValid,
    setSubmitting,
    resetForm,
    getAllData,
    isFormValid,
    isFormDirty,
    saveToStorage,
    loadFromStorage,
    clearStorage,
    export: exportData,
    import: importData
  }), [
    state.sessions,
    currentSession,
    config,
    createSession,
    loadSession,
    clearSession,
    switchSession,
    updateField,
    setFieldError,
    clearFieldError,
    getFieldValue,
    getFieldError,
    setStepData,
    getStepData,
    setCurrentStep,
    markStepComplete,
    isStepValid,
    setSubmitting,
    resetForm,
    getAllData,
    isFormValid,
    isFormDirty,
    saveToStorage,
    loadFromStorage,
    clearStorage,
    exportData,
    importData
  ]);

  return (
    <FormStateContext.Provider value={contextValue}>
      {children}
    </FormStateContext.Provider>
  );
};

// Hook to use form state
export const useFormState = () => {
  const context = useContext(FormStateContext);
  if (!context) {
    throw new Error('useFormState must be used within a FormStateProvider');
  }
  return context;
};

// Hook to integrate with React Hook Form
export const useFormStateIntegration = (methods: UseFormReturn, stepId: string = 'default') => {
  const formState = useFormState();
  const { watch, setValue, setError, clearErrors } = methods;

  // Sync form data with state
  React.useEffect(() => {
    const subscription = watch((data) => {
      formState.setStepData(stepId, data);
    });
    return () => subscription.unsubscribe();
  }, [watch, formState, stepId]);

  // Load existing data
  React.useEffect(() => {
    const existingData = formState.getStepData(stepId);
    if (existingData && Object.keys(existingData).length > 0) {
      Object.entries(existingData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [formState, stepId, setValue]);

  return {
    updateField: (fieldName: string, value: any) => {
      formState.updateField(stepId, fieldName, value);
      setValue(fieldName, value);
    },
    setFieldError: (fieldName: string, error: string) => {
      formState.setFieldError(stepId, fieldName, error);
      setError(fieldName, { message: error });
    },
    clearFieldError: (fieldName: string) => {
      formState.clearFieldError(stepId, fieldName);
      clearErrors(fieldName);
    },
    getStepData: () => formState.getStepData(stepId),
    markComplete: () => formState.markStepComplete(stepId)
  };
};
