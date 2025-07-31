/**
 * 询盘管理界面组件
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  TagIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/FormComponents';
import { 
  Inquiry,
  InquiryStatus,
  InquiryPriority,
  InquiryType,
  InquirySource,
  CustomerType,
  InquiryQuery,
  InquiryQueryResult
} from '@/types/inquiry';

interface InquiryManagementProps {
  className?: string;
}

const InquiryManagement: React.FC<InquiryManagementProps> = ({ className }) => {
  const { t } = useTranslation('admin');
  const [inquiries, setInquiries] = useState<InquiryQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInquiries, setSelectedInquiries] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: '',
    source: '',
    customerType: '',
    country: '',
  });
  const [sortBy, setSortBy] = useState<string>('created_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  // 获取询盘列表
  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const query: InquiryQuery = {
        page: currentPage,
        limit: 20,
        sortBy: sortBy as any,
        filters: {
          search: searchTerm || undefined,
          status: filters.status || undefined,
          priority: filters.priority || undefined,
          type: filters.type || undefined,
          source: filters.source || undefined,
          customerType: filters.customerType || undefined,
          country: filters.country || undefined,
        },
      };

      const response = await fetch('/api/inquiries', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setInquiries(result.data);
      } else {
        console.error('Failed to fetch inquiries');
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [currentPage, sortBy, searchTerm, filters]);

  // 状态选项
  const statusOptions = [
    { value: '', label: t('allStatuses') },
    { value: InquiryStatus.NEW, label: t('statusNew') },
    { value: InquiryStatus.ASSIGNED, label: t('statusAssigned') },
    { value: InquiryStatus.IN_PROGRESS, label: t('statusInProgress') },
    { value: InquiryStatus.QUOTED, label: t('statusQuoted') },
    { value: InquiryStatus.NEGOTIATING, label: t('statusNegotiating') },
    { value: InquiryStatus.WON, label: t('statusWon') },
    { value: InquiryStatus.LOST, label: t('statusLost') },
    { value: InquiryStatus.CLOSED, label: t('statusClosed') },
  ];

  const priorityOptions = [
    { value: '', label: t('allPriorities') },
    { value: InquiryPriority.LOW, label: t('priorityLow') },
    { value: InquiryPriority.MEDIUM, label: t('priorityMedium') },
    { value: InquiryPriority.HIGH, label: t('priorityHigh') },
    { value: InquiryPriority.URGENT, label: t('priorityUrgent') },
  ];

  const typeOptions = [
    { value: '', label: t('allTypes') },
    { value: InquiryType.QUOTE_REQUEST, label: t('typeQuoteRequest') },
    { value: InquiryType.PRODUCT_INFO, label: t('typeProductInfo') },
    { value: InquiryType.TECHNICAL_SUPPORT, label: t('typeTechnicalSupport') },
    { value: InquiryType.PARTNERSHIP, label: t('typePartnership') },
    { value: InquiryType.OTHER, label: t('typeOther') },
  ];

  const sortOptions = [
    { value: 'created_desc', label: t('sortNewestFirst') },
    { value: 'created_asc', label: t('sortOldestFirst') },
    { value: 'updated_desc', label: t('sortRecentlyUpdated') },
    { value: 'company_name_asc', label: t('sortCompanyAZ') },
  ];

  // 获取状态样式
  const getStatusStyle = (status: InquiryStatus) => {
    switch (status) {
      case InquiryStatus.NEW:
        return 'bg-blue-100 text-blue-800';
      case InquiryStatus.ASSIGNED:
        return 'bg-yellow-100 text-yellow-800';
      case InquiryStatus.IN_PROGRESS:
        return 'bg-purple-100 text-purple-800';
      case InquiryStatus.QUOTED:
        return 'bg-indigo-100 text-indigo-800';
      case InquiryStatus.NEGOTIATING:
        return 'bg-orange-100 text-orange-800';
      case InquiryStatus.WON:
        return 'bg-green-100 text-green-800';
      case InquiryStatus.LOST:
        return 'bg-red-100 text-red-800';
      case InquiryStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取优先级样式
  const getPriorityStyle = (priority: InquiryPriority) => {
    switch (priority) {
      case InquiryPriority.URGENT:
        return 'text-red-600';
      case InquiryPriority.HIGH:
        return 'text-orange-600';
      case InquiryPriority.MEDIUM:
        return 'text-yellow-600';
      case InquiryPriority.LOW:
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // 获取优先级图标
  const getPriorityIcon = (priority: InquiryPriority) => {
    switch (priority) {
      case InquiryPriority.URGENT:
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case InquiryPriority.HIGH:
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case InquiryPriority.MEDIUM:
        return <InformationCircleIcon className="w-4 h-4" />;
      case InquiryPriority.LOW:
        return <CheckCircleIcon className="w-4 h-4" />;
      default:
        return <InformationCircleIcon className="w-4 h-4" />;
    }
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // 处理筛选
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // 处理选择
  const handleSelectInquiry = (inquiryId: string) => {
    const newSelected = new Set(selectedInquiries);
    if (newSelected.has(inquiryId)) {
      newSelected.delete(inquiryId);
    } else {
      newSelected.add(inquiryId);
    }
    setSelectedInquiries(newSelected);
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (!inquiries) return;
    
    if (selectedInquiries.size === inquiries.inquiries.length) {
      setSelectedInquiries(new Set());
    } else {
      setSelectedInquiries(new Set(inquiries.inquiries.map(inquiry => inquiry.id)));
    }
  };

  // 更新询盘状态
  const updateInquiryStatus = async (inquiryId: string, status: InquiryStatus) => {
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchInquiries();
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error);
    }
  };

  // 批量操作
  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedInquiries.size === 0) return;

    try {
      const response = await fetch('/api/inquiries?action=bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          inquiryIds: Array.from(selectedInquiries),
          data,
        }),
      });

      if (response.ok) {
        setSelectedInquiries(new Set());
        fetchInquiries();
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">{t('loadingInquiries')}</span>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-lg', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('inquiryManagement')}
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
              variant="outline"
              size="sm"
              leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
            >
              {t('export')}
            </Button>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder={t('searchInquiries')}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-48"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Select
              label={t('status')}
              options={statusOptions}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            />
            <Select
              label={t('priority')}
              options={priorityOptions}
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            />
            <Select
              label={t('type')}
              options={typeOptions}
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            />
            <Input
              label={t('country')}
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              placeholder={t('filterByCountry')}
            />
          </div>
        )}

        {/* Bulk Actions */}
        {selectedInquiries.size > 0 && (
          <div className="mt-4 flex items-center justify-between bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-blue-700">
              {t('selectedCount', { count: selectedInquiries.size })}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('update_status', { status: InquiryStatus.ASSIGNED })}
                leftIcon={<UserPlusIcon className="w-4 h-4" />}
              >
                {t('assign')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('add_tags', { tags: ['bulk-processed'] })}
                leftIcon={<TagIcon className="w-4 h-4" />}
              >
                {t('addTags')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('delete')}
                leftIcon={<TrashIcon className="w-4 h-4" />}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                {t('delete')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={inquiries?.inquiries.length > 0 && selectedInquiries.size === inquiries.inquiries.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inquiry')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('contact')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('company')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('priority')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('created')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inquiries?.inquiries.map((inquiry) => (
              <tr
                key={inquiry.id}
                className={cn(
                  'hover:bg-gray-50 cursor-pointer',
                  selectedInquiries.has(inquiry.id) && 'bg-blue-50'
                )}
                onClick={() => {
                  setSelectedInquiry(inquiry);
                  setShowInquiryModal(true);
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedInquiries.has(inquiry.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectInquiry(inquiry.id);
                    }}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {inquiry.inquiryNumber}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {inquiry.subject}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {inquiry.contact.firstName} {inquiry.contact.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {inquiry.contact.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {inquiry.company.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {inquiry.company.country}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    getStatusStyle(inquiry.status)
                  )}>
                    {t(`status${inquiry.status}`)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={cn(
                    'flex items-center text-sm font-medium',
                    getPriorityStyle(inquiry.priority)
                  )}>
                    {getPriorityIcon(inquiry.priority)}
                    <span className="ml-1">{t(`priority${inquiry.priority}`)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {inquiry.createdAt.toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateInquiryStatus(inquiry.id, InquiryStatus.IN_PROGRESS);
                      }}
                    >
                      {t('process')}
                    </Button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {inquiries && inquiries.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {t('showingResults', {
                start: (inquiries.page - 1) * inquiries.limit + 1,
                end: Math.min(inquiries.page * inquiries.limit, inquiries.total),
                total: inquiries.total,
              })}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!inquiries.hasPrevPage}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                {t('previous')}
              </Button>
              <span className="text-sm text-gray-700">
                {t('pageOfPages', { current: inquiries.page, total: inquiries.totalPages })}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={!inquiries.hasNextPage}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                {t('next')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {inquiries && inquiries.inquiries.length === 0 && (
        <div className="text-center py-12">
          <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('noInquiriesFound')}
          </h3>
          <p className="text-gray-600">
            {searchTerm || Object.values(filters).some(f => f)
              ? t('noInquiriesMatchFilters')
              : t('noInquiriesYet')
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default InquiryManagement;