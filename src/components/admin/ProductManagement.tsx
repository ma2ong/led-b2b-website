/**
 * 产品管理后台组件
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PhotoIcon,
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/FormComponents';
import { Product } from '@/types/product';
import ProductEditForm from './ProductEditForm';

interface ProductManagementProps {
  className?: string;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ className }) => {
  const { t } = useTranslation('admin');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    availability: '',
    featured: '',
  });
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'created_desc'>('created_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 模拟产品数据
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: 'prod_001',
        name: 'P2.5 Indoor LED Display',
        slug: 'p2-5-indoor-led-display',
        description: 'High-resolution indoor LED display perfect for conference rooms and retail spaces.',
        shortDescription: 'High-resolution indoor LED display',
        category: 'Indoor LED',
        subcategory: 'Fine Pitch',
        tags: ['indoor', 'fine-pitch', 'high-resolution'],
        sku: 'LED-P25-001',
        price: 450,
        comparePrice: 500,
        currency: 'USD',
        availability: 'in_stock',
        stock: 150,
        minOrderQuantity: 1,
        specifications: {
          pixelPitch: '2.5mm',
          resolution: '160x160',
          brightness: '800 nits',
          refreshRate: '3840Hz',
          viewingAngle: '160°/160°',
          powerConsumption: '280W/sqm',
          operatingTemperature: '-20°C to +60°C',
          protection: 'IP40',
          lifespan: '100,000 hours',
          weight: '8.5 kg/sqm',
        },
        features: [
          'Ultra-high resolution display',
          'Seamless splicing technology',
          'Energy-efficient design',
          'Easy maintenance'
        ],
        applications: [
          'Conference rooms',
          'Retail displays',
          'Control rooms',
          'Broadcasting studios'
        ],
        images: [
          {
            id: 'img_001',
            url: '/images/products/p2-5-indoor/main.jpg',
            alt: 'P2.5 Indoor LED Display',
            isPrimary: true,
            order: 1,
          },
          {
            id: 'img_002',
            url: '/images/products/p2-5-indoor/detail.jpg',
            alt: 'P2.5 Indoor LED Display Detail',
            isPrimary: false,
            order: 2,
          },
        ],
        documents: [
          {
            id: 'doc_001',
            name: 'Technical Specifications',
            url: '/documents/p2-5-indoor-specs.pdf',
            type: 'pdf',
            size: '2.5 MB',
          },
        ],
        seo: {
          title: 'P2.5 Indoor LED Display - High Resolution LED Screen',
          description: 'Professional P2.5 indoor LED display with ultra-high resolution and superior image quality.',
          keywords: ['P2.5 LED', 'indoor LED display', 'fine pitch LED'],
        },
        status: 'published',
        featured: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        id: 'prod_002',
        name: 'P6 Outdoor LED Screen',
        slug: 'p6-outdoor-led-screen',
        description: 'Weather-resistant outdoor LED screen ideal for advertising and public displays.',
        shortDescription: 'Weather-resistant outdoor LED screen',
        category: 'Outdoor LED',
        subcategory: 'Standard Pitch',
        tags: ['outdoor', 'weather-resistant', 'advertising'],
        sku: 'LED-P6-002',
        price: 280,
        comparePrice: 320,
        currency: 'USD',
        availability: 'in_stock',
        stock: 80,
        minOrderQuantity: 1,
        specifications: {
          pixelPitch: '6mm',
          resolution: '166x166',
          brightness: '6500 nits',
          refreshRate: '1920Hz',
          viewingAngle: '140°/140°',
          powerConsumption: '450W/sqm',
          operatingTemperature: '-40°C to +80°C',
          protection: 'IP65',
          lifespan: '100,000 hours',
          weight: '45 kg/sqm',
        },
        features: [
          'High brightness for outdoor use',
          'IP65 waterproof rating',
          'Wide viewing angle',
          'Robust construction'
        ],
        applications: [
          'Outdoor advertising',
          'Stadium displays',
          'Transportation hubs',
          'Public information displays'
        ],
        images: [
          {
            id: 'img_003',
            url: '/images/products/p6-outdoor/main.jpg',
            alt: 'P6 Outdoor LED Screen',
            isPrimary: true,
            order: 1,
          },
        ],
        documents: [],
        seo: {
          title: 'P6 Outdoor LED Screen - Weather Resistant Display',
          description: 'Durable P6 outdoor LED screen with IP65 protection and high brightness for outdoor advertising.',
          keywords: ['P6 LED', 'outdoor LED screen', 'weather resistant'],
        },
        status: 'published',
        featured: false,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18'),
      },
    ];
    setProducts(mockProducts);
    setLoading(false);
  }, []);

  // 筛选和排序产品
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !filters.category || product.category === filters.category;
      const matchesStatus = !filters.status || product.status === filters.status;
      const matchesAvailability = !filters.availability || product.availability === filters.availability;
      const matchesFeatured = !filters.featured || 
        (filters.featured === 'featured' && product.featured) ||
        (filters.featured === 'not_featured' && !product.featured);

      return matchesSearch && matchesCategory && matchesStatus && matchesAvailability && matchesFeatured;
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'created_desc':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return filtered;
  }, [products, searchTerm, filters, sortBy]);

  // 处理产品选择
  const handleProductSelect = (productId: string, selected: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (selected) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  // 处理全选
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedProducts(new Set(filteredAndSortedProducts.map(p => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  // 处理批量操作
  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on products:`, Array.from(selectedProducts));
    // 这里实现批量操作逻辑
    setSelectedProducts(new Set());
  };

  // 处理产品删除
  const handleDeleteProduct = (productId: string) => {
    if (confirm(t('confirmDeleteProduct'))) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  // 处理产品复制
  const handleDuplicateProduct = (product: Product) => {
    const duplicated: Product = {
      ...product,
      id: `${product.id}_copy`,
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy`,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProducts(prev => [duplicated, ...prev]);
  };

  // 处理产品保存
  const handleSaveProduct = (productData: Partial<Product>) => {
    if (editingProduct) {
      // 更新现有产品
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...productData, updatedAt: new Date() }
          : p
      ));
    } else {
      // 添加新产品
      const newProduct: Product = {
        ...productData,
        id: `prod_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Product;
      setProducts(prev => [newProduct, ...prev]);
    }
    setEditingProduct(null);
    setShowAddModal(false);
  };

  // 获取状态样式
  const getStatusStyle = (status: Product['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取库存状态样式
  const getStockStyle = (product: Product) => {
    const stock = product.stock || 0;
    if (stock === 0) {
      return 'text-red-600';
    } else if (stock <= 10) {
      return 'text-yellow-600';
    } else {
      return 'text-green-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">{t('loadingProducts')}</span>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-lg', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('productManagement')}
          </h2>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<FunnelIcon className="w-4 h-4" />}
            >
              {t('filters')}
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              {t('addProduct')}
            </Button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder={t('searchProducts')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={[
                { value: 'created_desc', label: t('newestFirst') },
                { value: 'name_asc', label: t('nameAZ') },
                { value: 'name_desc', label: t('nameZA') },
                { value: 'price_asc', label: t('priceLowHigh') },
                { value: 'price_desc', label: t('priceHighLow') },
              ]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-48"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg',
                viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg',
                viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
            <Select
              label={t('category')}
              options={[
                { value: '', label: t('allCategories') },
                { value: 'Indoor LED', label: 'Indoor LED' },
                { value: 'Outdoor LED', label: 'Outdoor LED' },
                { value: 'Rental LED', label: 'Rental LED' },
              ]}
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            />
            <Select
              label={t('status')}
              options={[
                { value: '', label: t('allStatuses') },
                { value: 'published', label: t('published') },
                { value: 'draft', label: t('draft') },
                { value: 'archived', label: t('archived') },
              ]}
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            />
            <Select
              label={t('availability')}
              options={[
                { value: '', label: t('allAvailability') },
                { value: 'in_stock', label: t('inStock') },
                { value: 'out_of_stock', label: t('outOfStock') },
                { value: 'pre_order', label: t('preOrder') },
              ]}
              value={filters.availability}
              onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
            />
            <Select
              label={t('featured')}
              options={[
                { value: '', label: t('allProducts') },
                { value: 'featured', label: t('featuredOnly') },
                { value: 'not_featured', label: t('notFeatured') },
              ]}
              value={filters.featured}
              onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.value }))}
            />
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({
                  category: '',
                  status: '',
                  availability: '',
                  featured: '',
                })}
              >
                {t('clearFilters')}
              </Button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedProducts.size > 0 && (
          <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-800">
              {t('selectedProducts', { count: selectedProducts.size })}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('publish')}
              >
                {t('publish')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('archive')}
              >
                {t('archive')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 hover:text-red-700"
              >
                {t('delete')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Product List/Grid */}
      {viewMode === 'list' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.size === filteredAndSortedProducts.length && filteredAndSortedProducts.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('product')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('price')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('stock')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={(e) => handleProductSelect(product.id, e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {product.images[0] ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.images[0].url}
                            alt={product.images[0].alt}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <PhotoIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.shortDescription}
                        </div>
                        {product.featured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                            <StarIcon className="w-3 h-3 mr-1" />
                            {t('featured')}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category}</div>
                    <div className="text-sm text-gray-500">{product.subcategory}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${product.price}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={cn('text-sm font-medium', getStockStyle(product))}>
                      {product.stock || 0} {t('inStock')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.availability === 'in_stock' ? t('available') : t('unavailable')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      getStatusStyle(product.status)
                    )}>
                      {t(product.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button size="sm" variant="outline">
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingProduct(product)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDuplicateProduct(product)}
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={(e) => handleProductSelect(product.id, e.target.checked)}
                    className="absolute top-3 left-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500 z-10"
                  />
                  {product.images[0] ? (
                    <img
                      className="w-full h-48 object-cover"
                      src={product.images[0].url}
                      alt={product.images[0].alt}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  {product.featured && (
                    <span className="absolute top-3 right-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <StarIcon className="w-3 h-3 mr-1" />
                      {t('featured')}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      getStatusStyle(product.status)
                    )}>
                      {t(product.status)}
                    </span>
                    <span className="text-xs text-gray-500">{product.category}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.shortDescription}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        ${product.price}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.currency}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn('text-sm font-medium', getStockStyle(product))}>
                        {product.stock || 0}
                      </div>
                      <div className="text-xs text-gray-500">{t('inStock')}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {t('updated')}: {product.updatedAt.toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button size="sm" variant="outline">
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingProduct(product)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedProducts.length === 0 && (
        <div className="text-center py-12">
          <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('noProductsFound')}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || Object.values(filters).some(f => f)
              ? t('noProductsMatchFilters')
              : t('noProductsYet')
            }
          </p>
          <Button
            onClick={() => setShowAddModal(true)}
            leftIcon={<PlusIcon className="w-4 h-4" />}
          >
            {t('addFirstProduct')}
          </Button>
        </div>
      )}

      {/* Product Edit Modal */}
      <ProductEditForm
        product={editingProduct}
        isOpen={showAddModal || editingProduct !== null}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default ProductManagement;