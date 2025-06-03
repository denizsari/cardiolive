'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Upload, X, Package, DollarSign, FileText, Tag, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { FormInput, FormTextarea, FormSelect } from '../../../components/forms/FormComponents';
import Button from '../../../components/ui/Button';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  isActive: boolean;
  features: string[];
  specifications: { [key: string]: string };
  sku: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

const categories = [
  { value: 'supplements', label: 'Supplements' },
  { value: 'medical-devices', label: 'Medical Devices' },
  { value: 'fitness', label: 'Fitness Equipment' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'wellness', label: 'Wellness' }
];

export default function AdminProductFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const isEditing = !!productId;

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    images: [],
    stock: 0,
    isActive: true,
    features: [''],
    specifications: {},
    sku: '',
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  useEffect(() => {
    if (isEditing) {
      loadProduct();
    }
  }, [isEditing, productId]);

  const loadProduct = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/admin/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFormData(data);
        setImageUrls(data.images.length > 0 ? data.images : ['']);
      } else {
        setError('Failed to load product');
      }
    } catch {
      setError('Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/products/admin/${productId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/products/admin`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const productData = {
        ...formData,
        images: imageUrls.filter(url => url.trim() !== ''),
        features: formData.features.filter(feature => feature.trim() !== '')
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        setSuccess(isEditing ? 'Product updated successfully!' : 'Product created successfully!');
        setTimeout(() => {
          router.push('/admin/products');
        }, 1500);
      } else {
        setError('Failed to save product');
      }
    } catch {
      setError('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDimensionChange = (dimension: keyof ProductFormData['dimensions'], value: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: { ...prev.dimensions, [dimension]: value }
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addImageUrl = () => {
    setImageUrls(prev => [...prev, '']);
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => router.push('/admin/products')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Products</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Create New Product'}
          </h1>
        </div>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <Package className="text-blue-500 mr-2 h-5 w-5" />
            <h2 className="text-lg font-semibold">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Product Name"
              leftIcon={<Package className="h-4 w-4 text-gray-400" />}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
            <FormInput
              label="SKU"
              leftIcon={<Tag className="h-4 w-4 text-gray-400" />}
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              required
            />
            <FormInput
              label="Price"
              type="number"
              leftIcon={<DollarSign className="h-4 w-4 text-gray-400" />}
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              required
            />
            <FormSelect
              label="Category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              options={categories}
              placeholder="Select a category"
              required
            />
            <FormInput
              label="Stock Quantity"
              type="number"
              leftIcon={<Package className="h-4 w-4 text-gray-400" />}
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
              min="0"
              required
            />
            <FormInput
              label="Weight (kg)"
              type="number"
              value={formData.weight}
              onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="mt-4">
            <FormTextarea
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Product Status Toggle */}
          <div className="mt-4">
            <label className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Product Status:</span>
              <button
                type="button"
                onClick={() => handleInputChange('isActive', !formData.isActive)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  formData.isActive 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {formData.isActive ? (
                  <>
                    <ToggleRight className="h-4 w-4" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-4 w-4" />
                    <span>Inactive</span>
                  </>
                )}
              </button>
            </label>
          </div>
        </div>

        {/* Dimensions */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Dimensions (cm)</h2>
          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Length"
              type="number"
              value={formData.dimensions.length}
              onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.1"
            />
            <FormInput
              label="Width"
              type="number"
              value={formData.dimensions.width}
              onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.1"
            />
            <FormInput
              label="Height"
              type="number"
              value={formData.dimensions.height}
              onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.1"
            />
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ImageIcon className="text-purple-500 mr-2 h-5 w-5" />
              <h2 className="text-lg font-semibold">Product Images</h2>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={addImageUrl}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Add Image URL</span>
            </Button>
          </div>
          
          {imageUrls.map((url, index) => (
            <div key={index} className="flex items-center space-x-2 mb-3">
              <div className="flex-1">
                <FormInput
                  placeholder="Enter image URL"
                  value={url}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                />
              </div>
              {imageUrls.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => removeImageUrl(index)}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Product Features */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="text-orange-500 mr-2 h-5 w-5" />
              <h2 className="text-lg font-semibold">Product Features</h2>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={addFeature}
              className="text-sm"
            >
              Add Feature
            </Button>
          </div>
          
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 mb-3">
              <div className="flex-1">
                <FormInput
                  placeholder="Enter product feature"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                />
              </div>
              {formData.features.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => removeFeature(index)}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/admin/products')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isEditing ? 'Update Product' : 'Create Product'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}