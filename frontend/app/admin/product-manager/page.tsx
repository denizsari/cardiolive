'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiEye, FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import { productAPI } from '@/utils/api';
import Button from '@/components/ui/Button';
import { FormInput, FormSelect } from '@/components/forms/FormComponents';
import { Product } from '@/types';

export default function AdminProductManagerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const categories = ['all', 'Soğuk Sıkım', 'Organik', 'Premium', 'Natürel'];
  const statusOptions = [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Pasif' },
    { value: 'featured', label: 'Öne Çıkan' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);
  const fetchProducts = async () => {
    try {
      const data = await productAPI.getAllAdmin();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (productId: string, field: 'isActive' | 'featured') => {
    try {
      const product = products.find(p => p._id === productId);
      if (!product) return;

      const updatedValue = !product[field];
      await productAPI.updateAdmin(productId, { [field]: updatedValue });
      
      setProducts(prev => prev.map(p => 
        p._id === productId ? { ...p, [field]: updatedValue } : p
      ));
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

    try {
      await productAPI.deleteAdmin(productId);
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && product.isActive) ||
      (statusFilter === 'inactive' && !product.isActive) ||
      (statusFilter === 'featured' && product.featured);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ürün Yöneticisi</h1>
          <p className="text-gray-600 mt-1">Tüm ürünleri görüntüle ve yönet</p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => window.location.href = '/admin/products/form'}
        >
          <FiPlus /> Yeni Ürün
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormInput
            id="search"
            label="Ürün Ara"
            placeholder="Ürün adı..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<FiSearch className="text-gray-400" />}
          />
          
          <FormSelect
            id="category"
            label="Kategori"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categories.map(cat => ({ value: cat, label: cat === 'all' ? 'Tüm Kategoriler' : cat }))}
          />
          
          <FormSelect
            id="status"
            label="Durum"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
          
          <div className="flex items-end">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <FiFilter /> Filtrele
            </Button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürün
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiyat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={product.images[0] || '/placeholder-product.jpg'}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.price.toLocaleString('tr-TR')} TL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.stock > 10 ? 'bg-green-100 text-green-800' :
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} adet
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={product.isActive}
                          onChange={() => handleStatusToggle(product._id, 'isActive')}
                          className="mr-2"
                        />
                        <span className="text-xs">Aktif</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={product.featured}
                          onChange={() => handleStatusToggle(product._id, 'featured')}
                          className="mr-2"
                        />
                        <span className="text-xs">Öne Çıkan</span>
                      </label>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/products/${product._id}`, '_blank')}
                      >
                        <FiEye />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = `/admin/products/form?id=${product._id}`}
                      >
                        <FiEdit />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Filtrelere uygun ürün bulunamadı.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{products.length}</div>
            <div className="text-sm text-gray-600">Toplam Ürün</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Aktif Ürün</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {products.filter(p => p.featured).length}
            </div>
            <div className="text-sm text-gray-600">Öne Çıkan</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {products.filter(p => p.stock === 0).length}
            </div>
            <div className="text-sm text-gray-600">Stokta Yok</div>
          </div>
        </div>
      </div>
    </div>
  );
}