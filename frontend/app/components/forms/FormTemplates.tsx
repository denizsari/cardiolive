'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { FormInput, FormTextarea, FormSelect, FormRadioGroup } from './FormComponents';

// Field type definitions
export type FormFieldType = 'text' | 'email' | 'password' | 'tel' | 'date' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file';
export interface FormFieldTemplate {
  id: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
  options?: Array<{ label: string; value: string }>;
  defaultValue?: any;
  conditional?: {
    field: string;
    value: any;
    operator?: 'equals' | 'not-equals' | 'contains';
  };
}

export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  fields: FormFieldTemplate[];
  submitConfig?: {
    endpoint?: string;
    method?: 'POST' | 'PUT' | 'PATCH';
    successMessage?: string;
    redirect?: string;
  };
  styling?: {
    layout?: 'vertical' | 'horizontal' | 'grid';
    columns?: number;
    spacing?: 'compact' | 'normal' | 'spacious';
  };
}

// System templates
export const systemTemplates: FormTemplate[] = [
  {
    id: 'contact-form',
    name: 'İletişim Formu',
    description: 'Temel iletişim formu şablonu',
    category: 'contact',
    fields: [
      {
        id: 'name',
        label: 'Adınız Soyadınız',
        type: 'text',
        required: true,
        placeholder: 'Adınızı ve soyadınızı giriniz'
      },
      {
        id: 'email',
        label: 'E-posta Adresiniz',
        type: 'email',
        required: true,
        placeholder: 'ornek@email.com'
      },
      {
        id: 'phone',
        label: 'Telefon Numaranız',
        type: 'tel',
        placeholder: '+90 5XX XXX XX XX'
      },
      {
        id: 'subject',
        label: 'Konu',
        type: 'select',
        required: true,
        options: [
          { label: 'Genel Bilgi', value: 'general' },
          { label: 'Ürün Hakkında', value: 'product' },
          { label: 'Teknik Destek', value: 'support' },
          { label: 'Şikayet', value: 'complaint' }
        ]
      },
      {
        id: 'message',
        label: 'Mesajınız',
        type: 'textarea',
        required: true,
        placeholder: 'Mesajınızı buraya yazınız...'
      }
    ],
    submitConfig: {
      endpoint: '/api/contact',
      method: 'POST',
      successMessage: 'Mesajınız başarıyla gönderildi!',
      redirect: '/thank-you'
    },
    styling: {
      layout: 'vertical',
      spacing: 'normal'
    }
  },
  {
    id: 'registration-form',
    name: 'Üyelik Formu',
    description: 'Kullanıcı kayıt formu şablonu',
    category: 'auth',
    fields: [
      {
        id: 'firstName',
        label: 'Ad',
        type: 'text',
        required: true
      },
      {
        id: 'lastName',
        label: 'Soyad',
        type: 'text',
        required: true
      },
      {
        id: 'email',
        label: 'E-posta',
        type: 'email',
        required: true
      },
      {
        id: 'password',
        label: 'Şifre',
        type: 'password',
        required: true,
        validation: {
          min: 8,
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
        }
      },
      {
        id: 'confirmPassword',
        label: 'Şifre Tekrar',
        type: 'password',
        required: true
      },
      {
        id: 'birthDate',
        label: 'Doğum Tarihi',
        type: 'date',
        required: true
      },
      {
        id: 'gender',
        label: 'Cinsiyet',
        type: 'radio',
        options: [
          { label: 'Erkek', value: 'male' },
          { label: 'Kadın', value: 'female' },
          { label: 'Belirtmek İstemiyorum', value: 'other' }
        ]
      }
    ]
  }
];

// Template utilities
export const templateUtils = {
  // Get template by ID
  getTemplate: (id: string): FormTemplate | undefined => {
    return systemTemplates.find(template => template.id === id);
  },

  // Get templates by category
  getTemplatesByCategory: (category: string): FormTemplate[] => {
    return systemTemplates.filter(template => template.category === category);
  },

  // Validate template structure
  validateTemplate: (template: FormTemplate): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!template.id) errors.push('Template ID is required');
    if (!template.name) errors.push('Template name is required');
    if (!template.fields || template.fields.length === 0) {
      errors.push('Template must have at least one field');
    }
    
    // Validate fields
    template.fields?.forEach((field, index) => {
      if (!field.id) errors.push(`Field ${index + 1}: ID is required`);
      if (!field.label) errors.push(`Field ${index + 1}: Label is required`);
      if (!field.type) errors.push(`Field ${index + 1}: Type is required`);
      
      // Check for duplicate field IDs
      const duplicates = template.fields.filter(f => f.id === field.id);
      if (duplicates.length > 1) {
        errors.push(`Duplicate field ID: ${field.id}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Clone template
  cloneTemplate: (template: FormTemplate, newId?: string): FormTemplate => {
    return {
      ...template,
      id: newId || `${template.id}-copy`,
      name: `${template.name} (Kopya)`,
      fields: template.fields.map(field => ({ ...field }))
    };
  }
};

// Form generator from template
export const generateFormFromTemplate = (
  template: FormTemplate,
  onSubmit?: (data: any) => void,
  initialValues?: Record<string, any>
) => {
  const FormFromTemplate: React.FC = () => {
    const [formData, setFormData] = useState<Record<string, any>>(initialValues || {});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = useCallback((fieldId: string, value: any) => {
      setFormData(prev => ({ ...prev, [fieldId]: value }));
      
      // Clear error when user starts typing
      if (errors[fieldId]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldId];
          return newErrors;
        });
      }
    }, [errors]);

    const validateField = useCallback((field: FormFieldTemplate, value: any): string | null => {
      if (field.required && (!value || value === '')) {
        return `${field.label} zorunludur`;
      }

      if (field.validation) {
        const { min, max, pattern, custom } = field.validation;
        
        if (min && value && value.length < min) {
          return `${field.label} en az ${min} karakter olmalıdır`;
        }
        
        if (max && value && value.length > max) {
          return `${field.label} en fazla ${max} karakter olmalıdır`;
        }
        
        if (pattern && value && !new RegExp(pattern).test(value)) {
          return `${field.label} geçerli formatta değil`;
        }
        
        if (custom && value) {
          return custom(value);
        }
      }

      return null;
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
      e.preventDefault();
      
      const newErrors: Record<string, string> = {};
      
      // Validate all fields
      template.fields.forEach(field => {
        // Check conditional visibility
        if (field.conditional) {
          const { field: condField, value: condValue, operator = 'equals' } = field.conditional;
          const currentValue = formData[condField];
          
          let isVisible = false;
          switch (operator) {
            case 'equals':
              isVisible = currentValue === condValue;
              break;
            case 'not-equals':
              isVisible = currentValue !== condValue;
              break;
            case 'contains':
              isVisible = currentValue && currentValue.includes(condValue);
              break;
          }
          
          if (!isVisible) return; // Skip validation for hidden fields
        }
        
        const error = validateField(field, formData[field.id]);
        if (error) {
          newErrors[field.id] = error;
        }
      });

      setErrors(newErrors);
      
      if (Object.keys(newErrors).length === 0) {
        onSubmit?.(formData);
      }
    }, [formData, template.fields, validateField, onSubmit]);

    const visibleFields = useMemo(() => {
      return template.fields.filter(field => {
        if (!field.conditional) return true;
        
        const { field: condField, value: condValue, operator = 'equals' } = field.conditional;
        const currentValue = formData[condField];
        
        switch (operator) {
          case 'equals':
            return currentValue === condValue;
          case 'not-equals':
            return currentValue !== condValue;
          case 'contains':
            return currentValue && currentValue.includes(condValue);
          default:
            return true;
        }
      });
    }, [template.fields, formData]);

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">{template.name}</h2>
        {template.description && (
          <p className="text-gray-600 mb-6">{template.description}</p>
        )}
        
        {visibleFields.map(field => {
          const commonProps = {
            key: field.id,
            label: field.label,
            required: field.required,
            error: errors[field.id] ? { message: errors[field.id] } : undefined,
            placeholder: field.placeholder,
            value: formData[field.id] || field.defaultValue || '',
            onChange: (e: any) => handleChange(field.id, e.target?.value || e)
          };

          switch (field.type) {
            case 'textarea':
              return <FormTextarea {...commonProps} />;
            case 'select':
              return <FormSelect {...commonProps} options={field.options || []} />;
            case 'radio':
              return <FormRadioGroup {...commonProps} name={field.id} options={field.options || []} />;
            case 'email':
            case 'password':
            case 'tel':
            case 'date':
            case 'number':
              return <FormInput {...commonProps} type={field.type} />;
            default:
              return <FormInput {...commonProps} type="text" />;
          }
        })}
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Gönder
        </button>
      </form>
    );
  };

  return FormFromTemplate;
};

// Form Template Manager Component
export const FormTemplateManager: React.FC<{
  onSelectTemplate?: (template: FormTemplate) => void;
  selectedCategory?: string;
}> = ({ onSelectTemplate, selectedCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState(selectedCategory || '');

  const categories = useMemo(() => {
    const cats = new Set(systemTemplates.map(t => t.category));
    return Array.from(cats);
  }, []);

  const filteredTemplates = useMemo(() => {
    return systemTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCat || template.category === selectedCat;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCat]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Şablon ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
            onClick={() => onSelectTemplate?.(template)}
          >
            <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
            {template.description && (
              <p className="text-gray-600 text-sm mb-3">{template.description}</p>
            )}
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{template.fields.length} alan</span>
              <span className="bg-gray-100 px-2 py-1 rounded">
                {template.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Arama kriterlerinize uygun şablon bulunamadı.
        </div>
      )}
    </div>
  );
};
