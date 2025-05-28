'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiMail, FiShield, FiDatabase, FiSettings } from 'react-icons/fi';

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
    freeShippingThreshold: 500
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSettings(prev => ({ ...prev, ...data }));
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });      if (response.ok) {
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
  const handleInputChange = (field: keyof Settings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
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
          <div className="flex items-center mb-4">
            <FiSettings className="text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold">Site Configuration</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="TRY">Turkish Lira (₺)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email Configuration */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <FiMail className="text-green-500 mr-2" />
            <h2 className="text-lg font-semibold">Email Configuration</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Email
              </label>
              <input
                type="email"
                value={settings.siteEmail}
                onChange={(e) => handleInputChange('siteEmail', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Enable email notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.orderConfirmationEmail}
                onChange={(e) => handleInputChange('orderConfirmationEmail', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Send order confirmation emails</span>
            </label>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <FiShield className="text-orange-500 mr-2" />
            <h2 className="text-lg font-semibold">System Settings</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Maintenance Mode</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Allow new user registration</span>
            </label>
          </div>
        </div>

        {/* Store Settings */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <FiDatabase className="text-purple-500 mr-2" />
            <h2 className="text-lg font-semibold">Store Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={settings.taxRate}
                onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Fee (₺)
              </label>
              <input
                type="number"
                value={settings.shippingFee}
                onChange={(e) => handleInputChange('shippingFee', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Free Shipping Threshold (₺)
              </label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => handleInputChange('freeShippingThreshold', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FiSave />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
