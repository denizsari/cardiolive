import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import '@testing-library/jest-dom';

// Import advanced form components
import { 
  AutoSaveWrapper,
  AutoSaveStatus,
  AutoSaveForm,
  useAutoSave,
  draftUtils
} from '../app/components/forms/FormAutoSave';
import {
  FormTemplateManager,
  systemTemplates,
  templateUtils,
  generateFormFromTemplate
} from '../app/components/forms/FormTemplates';
import {
  FormStateProvider,
  useFormState,
  useFormStateIntegration
} from '../app/components/forms/FormStateManagement';
import { FormWizard, WizardStep, useWizard } from '../app/components/forms/FormWizard';
import { 
  FileUpload, 
  ImageUpload, 
  DocumentUpload, 
  AvatarUpload 
} from '../app/components/forms/FileUploadComponents';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock file for uploads
const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

describe('Auto-Save Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('useAutoSave Hook', () => {
    const TestComponent = ({ config }: any) => {
      const methods = useForm({ defaultValues: { name: '', email: '' } });
      const { autoSave, status, lastSaved } = useAutoSave(methods, config);

      return (
        <FormProvider {...methods}>
          <div>
            <input {...methods.register('name')} data-testid="name-input" />
            <input {...methods.register('email')} data-testid="email-input" />
            <div data-testid="status">{status}</div>
            <div data-testid="last-saved">{lastSaved?.toString()}</div>
            <button onClick={autoSave} data-testid="manual-save">
              Manual Save
            </button>
          </div>
        </FormProvider>
      );
    };

    it('auto-saves form data after delay', async () => {
      const mockSave = jest.fn().mockResolvedValue(undefined);
      const config = {
        key: 'test-form',
        delay: 100,
        enabled: true,
        onSave: mockSave
      };

      render(<TestComponent config={config} />);

      const nameInput = screen.getByTestId('name-input');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith({ name: 'John Doe', email: '' });
      }, { timeout: 500 });
    });

    it('updates status during save process', async () => {
      const mockSave = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      const config = {
        key: 'test-form',
        delay: 50,
        enabled: true,
        onSave: mockSave
      };

      render(<TestComponent config={config} />);

      const nameInput = screen.getByTestId('name-input');
      fireEvent.change(nameInput, { target: { value: 'John' } });

      // Should show saving status
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('saving');
      });

      // Should show saved status after completion
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('saved');
      });
    });

    it('handles save errors gracefully', async () => {
      const mockSave = jest.fn().mockRejectedValue(new Error('Save failed'));
      const config = {
        key: 'test-form',
        delay: 50,
        enabled: true,
        onSave: mockSave
      };

      render(<TestComponent config={config} />);

      const nameInput = screen.getByTestId('name-input');
      fireEvent.change(nameInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('error');
      });
    });

    it('performs manual save when requested', async () => {
      const mockSave = jest.fn().mockResolvedValue(undefined);
      const config = {
        key: 'test-form',
        delay: 1000, // Long delay to prevent auto-save
        enabled: true,
        onSave: mockSave
      };

      render(<TestComponent config={config} />);

      const nameInput = screen.getByTestId('name-input');
      const saveButton = screen.getByTestId('manual-save');

      fireEvent.change(nameInput, { target: { value: 'Manual Save Test' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith({ name: 'Manual Save Test', email: '' });
      });
    });
  });

  describe('AutoSaveWrapper', () => {
    it('restores data from localStorage on mount', () => {
      const savedData = { name: 'Restored Name', email: 'restored@test.com' };
      localStorageMock.setItem('draft_test-restore', JSON.stringify({
        data: savedData,
        timestamp: Date.now()
      }));

      const TestComponent = () => {
        const methods = useForm({ defaultValues: { name: '', email: '' } });
        return (
          <FormProvider {...methods}>
            <AutoSaveWrapper
              formKey="test-restore"
              onRestore={(data) => methods.reset(data)}
            >
              <input {...methods.register('name')} data-testid="name-input" />
              <input {...methods.register('email')} data-testid="email-input" />
            </AutoSaveWrapper>
          </FormProvider>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('name-input')).toHaveValue('Restored Name');
      expect(screen.getByTestId('email-input')).toHaveValue('restored@test.com');
    });
  });

  describe('draftUtils', () => {
    beforeEach(() => {
      draftUtils.clearAllDrafts();
    });

    it('saves and retrieves drafts', () => {
      const testData = { name: 'Test', email: 'test@example.com' };
      
      draftUtils.saveDraft('test-key', testData);
      const retrieved = draftUtils.getDraft('test-key');
      
      expect(retrieved?.data).toEqual(testData);
      expect(retrieved?.timestamp).toBeDefined();
    });

    it('lists all drafts', () => {
      draftUtils.saveDraft('draft1', { name: 'Draft 1' });
      draftUtils.saveDraft('draft2', { name: 'Draft 2' });
      
      const drafts = draftUtils.getAllDrafts();
      expect(drafts).toHaveLength(2);
      expect(drafts.map(d => d.key)).toContain('draft1');
      expect(drafts.map(d => d.key)).toContain('draft2');
    });

    it('deletes specific drafts', () => {
      draftUtils.saveDraft('to-delete', { test: true });
      draftUtils.saveDraft('to-keep', { test: true });
      
      draftUtils.deleteDraft('to-delete');
      
      expect(draftUtils.getDraft('to-delete')).toBeNull();
      expect(draftUtils.getDraft('to-keep')).not.toBeNull();
    });

    it('clears all drafts', () => {
      draftUtils.saveDraft('draft1', { test: true });
      draftUtils.saveDraft('draft2', { test: true });
      
      draftUtils.clearAllDrafts();
      
      expect(draftUtils.getAllDrafts()).toHaveLength(0);
    });
  });
});

describe('Form Templates', () => {
  describe('systemTemplates', () => {
    it('contains expected template categories', () => {
      const categories = [...new Set(systemTemplates.map(t => t.category))];
      expect(categories).toContain('auth');
      expect(categories).toContain('ecommerce');
      expect(categories).toContain('events');
    });

    it('has valid template structure', () => {
      systemTemplates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('category');
        expect(template).toHaveProperty('schema');
        expect(template.schema).toHaveProperty('sections');
        expect(Array.isArray(template.schema.sections)).toBe(true);
      });
    });
  });

  describe('templateUtils', () => {
    it('validates template structure', () => {
      const validTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'Test description',
        category: 'test',
        schema: {
          sections: [
            {
              title: 'Test Section',
              fields: [
                { name: 'testField', type: 'text', label: 'Test Field' }
              ]
            }
          ]
        }
      };

      expect(templateUtils.validateTemplate(validTemplate)).toBe(true);
    });

    it('exports and imports templates', () => {
      const template = systemTemplates[0];
      const exported = templateUtils.exportTemplate(template);
      
      expect(exported).toContain(template.name);
      expect(exported).toContain(template.id);
      
      const imported = templateUtils.importTemplate(exported);
      expect(imported.id).toBe(template.id);
      expect(imported.name).toBe(template.name);
    });

    it('creates template from form data', () => {
      const formData = {
        name: 'Generated Template',
        description: 'Generated from form',
        category: 'custom'
      };
      
      const schema = {
        sections: [
          {
            title: 'Basic Info',
            fields: [
              { name: 'name', type: 'text', label: 'Name' },
              { name: 'email', type: 'email', label: 'Email' }
            ]
          }
        ]
      };

      const template = templateUtils.createTemplateFromForm(formData, schema);
      
      expect(template.name).toBe('Generated Template');
      expect(template.schema).toEqual(schema);
      expect(template.id).toBeDefined();
    });
  });

  describe('generateFormFromTemplate', () => {
    it('generates form configuration from template', () => {
      const template = systemTemplates.find(t => t.id === 'contact-form');
      if (!template) throw new Error('Contact form template not found');
      
      const formConfig = generateFormFromTemplate(template);
      
      expect(formConfig).toHaveProperty('defaultValues');
      expect(formConfig).toHaveProperty('validationSchema');
      expect(formConfig).toHaveProperty('fields');
    });
  });

  describe('FormTemplateManager', () => {
    it('renders template categories and templates', () => {
      const mockHandlers = {
        onSelectTemplate: jest.fn(),
        onCreateTemplate: jest.fn(),
        onDeleteTemplate: jest.fn()
      };

      render(
        <FormTemplateManager
          {...mockHandlers}
          userTemplates={[]}
        />
      );

      expect(screen.getByText('System Templates')).toBeInTheDocument();
      expect(screen.getByText('Contact Form')).toBeInTheDocument();
      expect(screen.getByText('User Registration')).toBeInTheDocument();
    });

    it('handles template selection', () => {
      const mockOnSelect = jest.fn();

      render(
        <FormTemplateManager
          onSelectTemplate={mockOnSelect}
          onCreateTemplate={jest.fn()}
          onDeleteTemplate={jest.fn()}
          userTemplates={[]}
        />
      );

      const contactFormButton = screen.getByText('Contact Form');
      fireEvent.click(contactFormButton);

      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'contact-form' })
      );
    });
  });
});

describe('Form State Management', () => {
  describe('FormStateProvider', () => {
    it('provides form state context', () => {
      const config = { formId: 'test-form', autoSave: false };
      
      const TestComponent = () => {
        const formState = useFormState();
        return (
          <div>
            <div data-testid="form-id">{formState.formId}</div>
            <div data-testid="is-dirty">{formState.isFormDirty().toString()}</div>
            <button 
              onClick={() => formState.updateField('test', 'value')}
              data-testid="update-field"
            >
              Update Field
            </button>
          </div>
        );
      };

      render(
        <FormStateProvider config={config}>
          <TestComponent />
        </FormStateProvider>
      );

      expect(screen.getByTestId('form-id')).toHaveTextContent('test-form');
      expect(screen.getByTestId('is-dirty')).toHaveTextContent('false');

      fireEvent.click(screen.getByTestId('update-field'));
      expect(screen.getByTestId('is-dirty')).toHaveTextContent('true');
    });
  });

  describe('useFormStateIntegration', () => {
    it('integrates with React Hook Form', () => {
      const config = { formId: 'test-integration', autoSave: false };
      
      const TestComponent = () => {
        const methods = useForm({ defaultValues: { name: '', email: '' } });
        const integration = useFormStateIntegration(methods, 'step1');
        
        return (
          <FormProvider {...methods}>
            <div>
              <input {...methods.register('name')} data-testid="name-input" />
              <div data-testid="integration-data">
                {JSON.stringify(integration.getCurrentStepData())}
              </div>
            </div>
          </FormProvider>
        );
      };

      render(
        <FormStateProvider config={config}>
          <TestComponent />
        </FormStateProvider>
      );

      const nameInput = screen.getByTestId('name-input');
      fireEvent.change(nameInput, { target: { value: 'John' } });

      // Integration should track the form data
      expect(screen.getByTestId('integration-data')).toHaveTextContent('John');
    });
  });
});

describe('Form Wizard', () => {
  const mockSteps = [
    {
      id: 'step1',
      title: 'Step 1',
      description: 'First step',
      component: <div>Step 1 Content</div>
    },
    {
      id: 'step2',
      title: 'Step 2',
      description: 'Second step',
      component: <div>Step 2 Content</div>
    }
  ];

  describe('FormWizard', () => {
    it('renders wizard with steps', () => {
      render(
        <FormWizard
          steps={mockSteps}
          onComplete={jest.fn()}
        />
      );

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('First step')).toBeInTheDocument();
      expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
    });

    it('navigates between steps', () => {
      render(
        <FormWizard
          steps={mockSteps}
          onComplete={jest.fn()}
          allowStepNavigation
        />
      );

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      expect(screen.getByText('Step 2 Content')).toBeInTheDocument();

      const prevButton = screen.getByText('Previous');
      fireEvent.click(prevButton);

      expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
    });

    it('calls onComplete when wizard is finished', () => {
      const mockOnComplete = jest.fn();
      
      render(
        <FormWizard
          steps={mockSteps}
          onComplete={mockOnComplete}
        />
      );

      // Navigate to last step
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      // Complete wizard
      const completeButton = screen.getByText('Complete');
      fireEvent.click(completeButton);

      expect(mockOnComplete).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('useWizard Hook', () => {
    it('provides wizard state and controls', () => {
      const TestWizardComponent = () => {
        const { currentStep, totalSteps, isFirstStep, isLastStep, nextStep, prevStep } = useWizard();
        
        return (
          <div>
            <div data-testid="current-step">{currentStep}</div>
            <div data-testid="total-steps">{totalSteps}</div>
            <div data-testid="is-first">{isFirstStep.toString()}</div>
            <div data-testid="is-last">{isLastStep.toString()}</div>
            <button onClick={nextStep} data-testid="next">Next</button>
            <button onClick={prevStep} data-testid="prev">Previous</button>
          </div>
        );
      };

      render(
        <FormWizard steps={mockSteps} onComplete={jest.fn()}>
          <TestWizardComponent />
        </FormWizard>
      );

      expect(screen.getByTestId('current-step')).toHaveTextContent('0');
      expect(screen.getByTestId('total-steps')).toHaveTextContent('2');
      expect(screen.getByTestId('is-first')).toHaveTextContent('true');
      expect(screen.getByTestId('is-last')).toHaveTextContent('false');
    });
  });
});

describe('File Upload Components', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  describe('FileUpload', () => {
    it('handles file selection', () => {
      const mockOnFilesChange = jest.fn();
      
      render(
        <FileUpload
          label="Upload Files"
          onFilesChange={mockOnFilesChange}
          multiple
        />
      );

      const input = screen.getByLabelText('Upload Files');
      fireEvent.change(input, { target: { files: [mockFile] } });

      expect(mockOnFilesChange).toHaveBeenCalledWith([
        expect.objectContaining({ file: mockFile })
      ]);
    });

    it('validates file types', () => {
      const mockOnFilesChange = jest.fn();
      
      render(
        <FileUpload
          label="Upload Images"
          onFilesChange={mockOnFilesChange}
          accept="image/*"
        />
      );

      const input = screen.getByLabelText('Upload Images');
      expect(input).toHaveAttribute('accept', 'image/*');
    });

    it('respects file size limits', () => {
      const mockOnFilesChange = jest.fn();
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.txt');
      
      render(
        <FileUpload
          label="Upload Files"
          onFilesChange={mockOnFilesChange}
          maxSize={5 * 1024 * 1024} // 5MB limit
        />
      );

      const input = screen.getByLabelText('Upload Files');
      fireEvent.change(input, { target: { files: [largeFile] } });

      // Should show error for file too large
      expect(screen.getByText(/file size exceeds/i)).toBeInTheDocument();
      expect(mockOnFilesChange).not.toHaveBeenCalled();
    });
  });

  describe('ImageUpload', () => {
    it('renders image preview', async () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const mockOnFilesChange = jest.fn();
      
      render(
        <ImageUpload
          label="Upload Image"
          onFilesChange={mockOnFilesChange}
          value={[{ file: imageFile, url: 'mock-url' }]}
        />
      );

      expect(screen.getByAltText('Uploaded image')).toBeInTheDocument();
    });
  });

  describe('DocumentUpload', () => {
    it('shows document type icons', () => {
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      
      render(
        <DocumentUpload
          label="Upload Document"
          onFilesChange={jest.fn()}
          value={[{ file: pdfFile, url: 'mock-url' }]}
          allowPdf
        />
      );

      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  describe('AvatarUpload', () => {
    it('renders circular avatar preview', () => {
      const avatarFile = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
      
      render(
        <AvatarUpload
          label="Upload Avatar"
          onFilesChange={jest.fn()}
          value={[{ file: avatarFile, url: 'mock-url' }]}
        />
      );

      const avatar = screen.getByAltText('Avatar');
      expect(avatar).toHaveClass('rounded-full');
    });
  });
});
