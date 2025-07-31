/**
 * 产品编辑表单组件
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  XMarkIcon,
  PhotoIcon,
  DocumentIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/FormComponents';
import { FileUpload } from '@/components/ui/FileUpload';
import { Product } from '@/types/product';

interface ProductEditFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  className?: string;
}

const ProductEditForm: React.FC<ProductEditFormProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  className
}) => {
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState<'basic' | 'specifications' | 'pricing' | 'media' | 'seo' | 'inventory'>('basic');
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        shortDescription: '',
        category: '',
        subcategory: '',
        tags: [],
        status: 'draft',
        featured: false,
        availability: 'in_stock',
        price: {
          basePrice: 0,
          currency: 'USD',
          unit: 'sqm',
          priceRanges: [],
        },
        specifications: {},
        images: [],
        documents: [],
        seo: {
          metaTitle: '',
          metaDescription: '',
          keywords: [],
        },
        inventory: {
          stock: 0,
          reserved: 0,
          available: 0,
          reorderLevel: 0,
          supplier: '',
        },
      });
    }
    setErrors({});
  }, [product, isOpen]);

  // 生成slug
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // 处理表单字段变化
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = field.split('.');
      let current = newData as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;

      // 自动生成slug
      if (field === 'name' && value) {
        newData.slug = generateSlug(value);
      }

      return newData;
    });

    // 清除相关错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 处理标签变化
  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    handleFieldChange('tags', tags);
  };

  // 处理关键词变化
  const handleKeywordsChange = (keywordsString: string) => {
    const keywords = keywordsString.split(',').map(keyword => keyword.trim()).filter(keyword => keyword);
    handleFieldChange('seo.keywords', keywords);
  };

  // 添加价格区间
  const addPriceRange = () => {
    const currentRanges = formData.price?.priceRanges || [];
    const newRange = {
      minQuantity: 1,
      maxQuantity: null,
      price: formData.price?.basePrice || 0,
    };
    handleFieldChange('price.priceRanges', [...currentRanges, newRange]);
  };

  // 删除价格区间
  const removePriceRange = (index: number) => {
    const currentRanges = formData.price?.priceRanges || [];
    const newRanges = currentRanges.filter((_, i) => i !== index);
    handleFieldChange('price.priceRanges', newRanges);
  };

  // 更新价格区间
  const updatePriceRange = (index: number, field: string, value: any) => {
    const currentRanges = formData.price?.priceRanges || [];
    const newRanges = [...currentRanges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    handleFieldChange('price.priceRanges', newRanges);
  };

  // 添加规格
  const addSpecification = () => {
    const key = prompt(t('enterSpecificationKey'));
    if (key) {
      handleFieldChange(`specifications.${key}`, '');
    }
  };

  // 删除规格
  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    handleFieldChange('specifications', newSpecs);
  };

  // 处理图片上传
  const handleImageUpload = (files: File[]) => {
    const newImages = files.map((file, index) => ({
      id: `img_${Date.now()}_${index}`,
      url: URL.createObjectURL(file),
      alt: formData.name || 'Product Image',
      isPrimary: (formData.images?.length || 0) === 0 && index === 0,
      order: (formData.images?.length || 0) + index + 1,
    }));
    handleFieldChange('images', [...(formData.images || []), ...newImages]);
  };

  // 删除图片
  const removeImage = (imageId: string) => {
    const newImages = (formData.images || []).filter(img => img.id !== imageId);
    handleFieldChange('images', newImages);
  };

  // 设置主图片
  const setPrimaryImage = (imageId: string) => {
    const newImages = (formData.images || []).map(img => ({
      ...img,
      isPrimary: img.id === imageId,
    }));
    handleFieldChange('images', newImages);
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name) {
      newErrors.name = t('nameRequired');
    }
    if (!formData.description) {
      newErrors.description = t('descriptionRequired');
    }
    if (!formData.category) {
      newErrors.category = t('categoryRequired');
    }
    if (!formData.price?.basePrice || formData.price.basePrice <= 0) {
      newErrors['price.basePrice'] = t('validPriceRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理保存
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const productData: Product = {
        ...formData,
        id: formData.id || `prod_${Date.now()}`,
        createdAt: formData.createdAt || new Date(),
        updatedAt: new Date(),
      } as Product;

      await onSave(productData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { key: 'basic', label: t('basicInfo'), icon: InformationCircleIcon },
    { key: 'specifications', label: t('specifications'), icon: ClipboardDocumentListIcon },
    { key: 'pricing', label: t('pricing'), icon: CurrencyDollarIcon },
    { key: 'media', label: t('media'), icon: PhotoIcon },
    { key: 'seo', label: t('seo'), icon: GlobeAltIcon },
    { key: 'inventory', label: t('inventory'), icon: ChartBarIcon },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {product ? t('editProduct') : t('addProduct')}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="mt-4 border-b border-gray-200">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={cn(
                      'flex items-center py-2 px-1 border-b-2 font-medium text-sm',
                      activeTab === tab.key
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <tab.icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4 max-h-96 overflow-y-auto">
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('productName')}
                    value={formData.name || ''}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    error={errors.name}
                    required
                  />
                  <Input
                    label={t('slug')}
                    value={formData.slug || ''}
                    onChange={(e) => handleFieldChange('slug', e.target.value)}
                    error={errors.slug}
                  />
                </div>

                <Textarea
                  label={t('description')}
                  value={formData.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  error={errors.description}
                  rows={4}
                  required
                />

                <Input
                  label={t('shortDescription')}
                  value={formData.shortDescription || ''}
                  onChange={(e) => handleFieldChange('shortDescription', e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label={t('category')}
                    options={[
                      { value: '', label: t('selectCategory') },
                      { value: 'Indoor LED', label: 'Indoor LED' },
                      { value: 'Outdoor LED', label: 'Outdoor LED' },
                      { value: 'Rental LED', label: 'Rental LED' },
                      { value: 'Control Systems', label: 'Control Systems' },
                    ]}
                    value={formData.category || ''}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    error={errors.category}
                    required
                  />
                  <Input
                    label={t('subcategory')}
                    value={formData.subcategory || ''}
                    onChange={(e) => handleFieldChange('subcategory', e.target.value)}
                  />
                </div>

                <Input
                  label={t('tags')}
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder={t('enterTagsSeparatedByCommas')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label={t('status')}
                    options={[
                      { value: 'draft', label: t('draft') },
                      { value: 'active', label: t('active') },
                      { value: 'archived', label: t('archived') },
                    ]}
                    value={formData.status || 'draft'}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                  />
                  <Select
                    label={t('availability')}
                    options={[
                      { value: 'in_stock', label: t('inStock') },
                      { value: 'out_of_stock', label: t('outOfStock') },
                      { value: 'pre_order', label: t('preOrder') },
                    ]}
                    value={formData.availability || 'in_stock'}
                    onChange={(e) => handleFieldChange('availability', e.target.value)}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured || false}
                    onChange={(e) => handleFieldChange('featured', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    {t('featured')}
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">
                    {t('technicalSpecifications')}
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addSpecification}
                    leftIcon={<PlusIcon className="w-4 h-4" />}
                  >
                    {t('addSpecification')}
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(formData.specifications || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-3">
                      <div className="w-1/3">
                        <Input
                          value={key}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={value as string}
                          onChange={(e) => handleFieldChange(`specifications.${key}`, e.target.value)}
                          placeholder={t('enterValue')}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeSpecification(key)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t('basePrice')}
                    type="number"
                    value={formData.price?.basePrice || ''}
                    onChange={(e) => handleFieldChange('price.basePrice', parseFloat(e.target.value) || 0)}
                    error={errors['price.basePrice']}
                    required
                  />
                  <Select
                    label={t('currency')}
                    options={[
                      { value: 'USD', label: 'USD' },
                      { value: 'EUR', label: 'EUR' },
                      { value: 'CNY', label: 'CNY' },
                    ]}
                    value={formData.price?.currency || 'USD'}
                    onChange={(e) => handleFieldChange('price.currency', e.target.value)}
                  />
                  <Select
                    label={t('unit')}
                    options={[
                      { value: 'sqm', label: t('sqm') },
                      { value: 'piece', label: t('piece') },
                      { value: 'panel', label: t('panel') },
                    ]}
                    value={formData.price?.unit || 'sqm'}
                    onChange={(e) => handleFieldChange('price.unit', e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-gray-900">
                      {t('priceRanges')}
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addPriceRange}
                      leftIcon={<PlusIcon className="w-4 h-4" />}
                    >
                      {t('addPriceRange')}
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.price?.priceRanges?.map((range, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Input
                          type="number"
                          value={range.minQuantity}
                          onChange={(e) => updatePriceRange(index, 'minQuantity', parseInt(e.target.value) || 1)}
                          placeholder={t('minQuantity')}
                          className="w-24"
                        />
                        <span className="text-gray-500">-</span>
                        <Input
                          type="number"
                          value={range.maxQuantity || ''}
                          onChange={(e) => updatePriceRange(index, 'maxQuantity', e.target.value ? parseInt(e.target.value) : null)}
                          placeholder={t('maxQuantity')}
                          className="w-24"
                        />
                        <Input
                          type="number"
                          value={range.price}
                          onChange={(e) => updatePriceRange(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder={t('price')}
                          className="w-32"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removePriceRange(index)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    {t('productImages')}
                  </h4>
                  <FileUpload
                    accept="image/*"
                    multiple
                    onUpload={handleImageUpload}
                    className="mb-4"
                  />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images?.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setPrimaryImage(image.id)}
                            >
                              <StarIcon className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => removeImage(image.id)}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {image.isPrimary && (
                          <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 text-xs rounded">
                            {t('primary')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    {t('documents')}
                  </h4>
                  <FileUpload
                    accept=".pdf,.doc,.docx"
                    multiple
                    onUpload={(files) => {
                      const newDocs = files.map((file, index) => ({
                        id: `doc_${Date.now()}_${index}`,
                        name: file.name,
                        url: URL.createObjectURL(file),
                        type: file.type,
                        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                      }));
                      handleFieldChange('documents', [...(formData.documents || []), ...newDocs]);
                    }}
                    className="mb-4"
                  />
                  <div className="space-y-2">
                    {formData.documents?.map((doc, index) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <DocumentIcon className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-sm text-gray-500">{doc.size}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newDocs = (formData.documents || []).filter(d => d.id !== doc.id);
                            handleFieldChange('documents', newDocs);
                          }}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-4">
                <Input
                  label={t('metaTitle')}
                  value={formData.seo?.metaTitle || ''}
                  onChange={(e) => handleFieldChange('seo.metaTitle', e.target.value)}
                  placeholder={t('enterMetaTitle')}
                />
                <Textarea
                  label={t('metaDescription')}
                  value={formData.seo?.metaDescription || ''}
                  onChange={(e) => handleFieldChange('seo.metaDescription', e.target.value)}
                  placeholder={t('enterMetaDescription')}
                  rows={3}
                />
                <Input
                  label={t('keywords')}
                  value={formData.seo?.keywords?.join(', ') || ''}
                  onChange={(e) => handleKeywordsChange(e.target.value)}
                  placeholder={t('enterKeywordsSeparatedByCommas')}
                />
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('stock')}
                    type="number"
                    value={formData.inventory?.stock || ''}
                    onChange={(e) => handleFieldChange('inventory.stock', parseInt(e.target.value) || 0)}
                  />
                  <Input
                    label={t('reserved')}
                    type="number"
                    value={formData.inventory?.reserved || ''}
                    onChange={(e) => handleFieldChange('inventory.reserved', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('available')}
                    type="number"
                    value={formData.inventory?.available || ''}
                    onChange={(e) => handleFieldChange('inventory.available', parseInt(e.target.value) || 0)}
                  />
                  <Input
                    label={t('reorderLevel')}
                    type="number"
                    value={formData.inventory?.reorderLevel || ''}
                    onChange={(e) => handleFieldChange('inventory.reorderLevel', parseInt(e.target.value) || 0)}
                  />
                </div>
                <Input
                  label={t('supplier')}
                  value={formData.inventory?.supplier || ''}
                  onChange={(e) => handleFieldChange('inventory.supplier', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              leftIcon={saving ? undefined : <CheckCircleIcon className="w-4 h-4" />}
            >
              {saving ? t('saving') : t('save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEditForm;