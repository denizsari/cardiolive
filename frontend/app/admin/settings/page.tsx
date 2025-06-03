'use client';

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import {
  FiSave,
  FiMail,
  FiShield,
  FiDatabase,
  FiSettings,
} from 'react-icons/fi';
import { Globe, Mail, Database, Truck, Package } from 'lucide-react';
import Button from '../../components/ui/Button';
import { FormInput, FormSelect } from '../../components/forms/FormComponents';

interface Settings {
  siteName: string;
  siteEmail: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailNotifications: boolean;
  orderConfirmationEmail: boolean;
  lowStockThreshold: number;
  currency: string;
  taxRate: number;
  shippingFee: number;
  freeShippingThreshold: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    siteName: 'Cardiolive',
    siteEmail: 'admin@cardiolive.com',
    supportEmail: 'support@cardiolive.com',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    orderConfirmationEmail: true,
    lowStockThreshold: 10,
    currency: 'TRY',
    taxRate: 18,
    shippingFee: 15,
    freeShippingThreshold: 500,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/settings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch {
        console.log('Settings not found, using defaults');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(settings),
        }
      );
      if (response.ok) {
        setSuccess('Settings saved successfully!');
      } else {
        setError('Failed to save settings');
      }
    } catch {
      setError('Error saving settings');
    } finally {
      setSaving(false);
    }
  };
  const handleInputChange = (
    field: keyof Settings,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Site Configuration */}
        <div className="bg-white p-6 rounded-lg border">
          {' '}
          <div className="flex items-center mb-4">
            <FiSettings className="text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              Site Configuration
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Site Name"
              leftIcon={<Globe className="h-4 w-4 text-gray-400" />}
              value={settings.siteName}
              onChange={(e) => handleInputChange('siteName', e.target.value)}
            />
            <FormSelect
              label="Currency"
              value={settings.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              options={[
                { value: 'TRY', label: 'Turkish Lira (₺)' },
                { value: 'USD', label: 'US Dollar ($)' },
                { value: 'EUR', label: 'Euro (€)' },
              ]}
            />
          </div>
        </div>
        {/* Email Configuration */}
        <div className="bg-white p-6 rounded-lg border">
          {' '}
          <div className="flex items-center mb-4">
            <FiMail className="text-green-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              Email Configuration
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Site Email"
              type="email"
              leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
              value={settings.siteEmail}
              onChange={(e) => handleInputChange('siteEmail', e.target.value)}
            />
            <FormInput
              label="Support Email"
              type="email"
              leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
              value={settings.supportEmail}
              onChange={(e) =>
                handleInputChange('supportEmail', e.target.value)
              }
            />
          </div>
          <div className="mt-4 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  handleInputChange('emailNotifications', e.target.checked)
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Enable email notifications
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.orderConfirmationEmail}
                onChange={(e) =>
                  handleInputChange('orderConfirmationEmail', e.target.checked)
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Send order confirmation emails
              </span>
            </label>
          </div>
        </div>
        {/* System Settings */}
        <div className="bg-white p-6 rounded-lg border">
          {' '}
          <div className="flex items-center mb-4">
            <FiShield className="text-orange-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              System Settings
            </h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  handleInputChange('maintenanceMode', e.target.checked)
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Maintenance Mode</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) =>
                  handleInputChange('allowRegistration', e.target.checked)
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Allow new user registration
              </span>
            </label>
          </div>
        </div>
        {/* Store Settings */}
        <div className="bg-white p-6 rounded-lg border">
          {' '}
          <div className="flex items-center mb-4">
            <FiDatabase className="text-purple-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              Store Settings
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Low Stock Threshold"
              type="number"
              leftIcon={<Package className="h-4 w-4 text-gray-400" />}
              value={settings.lowStockThreshold}
              onChange={(e) =>
                handleInputChange('lowStockThreshold', parseInt(e.target.value))
              }
              min="0"
            />
            <FormInput
              label="Tax Rate (%)"
              type="number"
              leftIcon={<Database className="h-4 w-4 text-gray-400" />}
              value={settings.taxRate}
              onChange={(e) =>
                handleInputChange('taxRate', parseFloat(e.target.value))
              }
              min="0"
              step="0.01"
            />
            <FormInput
              label="Shipping Fee (₺)"
              type="number"
              leftIcon={<Truck className="h-4 w-4 text-gray-400" />}
              value={settings.shippingFee}
              onChange={(e) =>
                handleInputChange('shippingFee', parseFloat(e.target.value))
              }
              min="0"
              step="0.01"
            />
            <FormInput
              label="Free Shipping Threshold (₺)"
              type="number"
              leftIcon={<Truck className="h-4 w-4 text-gray-400" />}
              value={settings.freeShippingThreshold}
              onChange={(e) =>
                handleInputChange(
                  'freeShippingThreshold',
                  parseFloat(e.target.value)
                )
              }
              min="0"
              step="0.01"
            />
          </div>
        </div>{' '}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            variant="primary"
            loading={saving}
            className="flex items-center gap-2"
          >
            <FiSave />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
