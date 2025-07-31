/**
 * 客户沟通历史记录组件
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserIcon,
  ClockIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/FormComponents';

// 沟通记录类型
export interface CommunicationRecord {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'reminder';
  direction: 'inbound' | 'outbound';
  subject: string;
  content: string;
  date: Date;
  duration?: number; // 通话时长（分钟）
  participants: string[];
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  status: 'completed' | 'pending' | 'cancelled';
  followUpRequired: boolean;
  followUpDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CommunicationHistoryProps {
  customerId: string;
  className?: string;
}

const CommunicationHistory: React.FC<CommunicationHistoryProps> = ({ customerId, className }) => {
  const { t } = useTranslation('crm');
  const [records, setRecords] = useState<CommunicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    direction: '',
    priority: '',
    status: '',
    dateRange: '',
  });
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'priority_desc'>('date_desc');
  const [newRecord, setNewRecord] = useState<Partial<CommunicationRecord>>({
    type: 'note',
    direction: 'outbound',
    subject: '',
    content: '',
    priority: 'medium',
    followUpRequired: false,
    tags: [],
  });

  // 模拟数据加载
  useEffect(() => {
    const mockRecords: CommunicationRecord[] = [
      {
        id: 'comm_001',
        type: 'call',
        direction: 'outbound',
        subject: 'Follow-up on LED Display Inquiry',
        content: 'Discussed project requirements, timeline, and budget. Customer is interested in P2.5 indoor displays for conference rooms.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        duration: 25,
        participants: ['john.smith@techsolutions.com', 'sales@company.com'],
        tags: ['sales', 'follow-up', 'led-display'],
        priority: 'high',
        status: 'completed',
        followUpRequired: true,
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: 'sales@company.com',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'comm_002',
        type: 'email',
        direction: 'inbound',
        subject: 'Request for Technical Specifications',
        content: 'Customer requested detailed technical specifications for P2.5 and P3 indoor LED displays. Also asked about installation requirements.',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        participants: ['john.smith@techsolutions.com'],
        attachments: [
          {
            id: 'att_001',
            name: 'LED_Display_Specs.pdf',
            url: '/attachments/LED_Display_Specs.pdf',
            type: 'application/pdf',
          },
        ],
        tags: ['technical', 'specifications'],
        priority: 'medium',
        status: 'completed',
        followUpRequired: false,
        createdBy: 'system',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'comm_003',
        type: 'meeting',
        direction: 'outbound',
        subject: 'Product Demo and Site Visit',
        content: 'Conducted on-site product demonstration. Showed different LED display models and discussed installation process.',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        duration: 120,
        participants: ['john.smith@techsolutions.com', 'sarah.johnson@techsolutions.com', 'sales@company.com', 'tech@company.com'],
        tags: ['demo', 'site-visit', 'presentation'],
        priority: 'high',
        status: 'completed',
        followUpRequired: true,
        followUpDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdBy: 'sales@company.com',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ];

    setRecords(mockRecords);
    setLoading(false);
  }, [customerId]);

  // 获取记录类型图标
  const getRecordIcon = (type: CommunicationRecord['type']) => {
    switch (type) {
      case 'call':
        return <PhoneIcon className="w-5 h-5 text-green-500" />;
      case 'email':
        return <EnvelopeIcon className="w-5 h-5 text-blue-500" />;
      case 'meeting':
        return <CalendarIcon className="w-5 h-5 text-purple-500" />;
      case 'note':
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
      case 'task':
        return <CheckCircleIcon className="w-5 h-5 text-orange-500" />;
      case 'reminder':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  // 获取优先级样式
  const getPriorityStyle = (priority: CommunicationRecord['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // 获取状态样式
  const getStatusStyle = (status: CommunicationRecord['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // 格式化日期时间
  const formatDateTime = (date: Date) => {
    return date.toLocaleString();
  };

  // 格式化持续时间
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // 处理添加新记录
  const handleAddRecord = () => {
    const record: CommunicationRecord = {
      id: `comm_${Date.now()}`,
      type: newRecord.type as CommunicationRecord['type'],
      direction: newRecord.direction as CommunicationRecord['direction'],
      subject: newRecord.subject || '',
      content: newRecord.content || '',
      date: new Date(),
      participants: [],
      tags: newRecord.tags || [],
      priority: newRecord.priority as CommunicationRecord['priority'],
      status: 'completed',
      followUpRequired: newRecord.followUpRequired || false,
      followUpDate: newRecord.followUpDate,
      createdBy: 'current_user@company.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setRecords(prev => [record, ...prev]);
    setNewRecord({
      type: 'note',
      direction: 'outbound',
      subject: '',
      content: '',
      priority: 'medium',
      followUpRequired: false,
      tags: [],
    });
    setShowAddForm(false);
  };

  // 筛选选项
  const typeOptions = [
    { value: '', label: t('allTypes') },
    { value: 'call', label: t('call') },
    { value: 'email', label: t('email') },
    { value: 'meeting', label: t('meeting') },
    { value: 'note', label: t('note') },
    { value: 'task', label: t('task') },
    { value: 'reminder', label: t('reminder') },
  ];

  const directionOptions = [
    { value: '', label: t('allDirections') },
    { value: 'inbound', label: t('inbound') },
    { value: 'outbound', label: t('outbound') },
  ];

  const priorityOptions = [
    { value: '', label: t('allPriorities') },
    { value: 'high', label: t('high') },
    { value: 'medium', label: t('medium') },
    { value: 'low', label: t('low') },
  ];

  const statusOptions = [
    { value: '', label: t('allStatuses') },
    { value: 'completed', label: t('completed') },
    { value: 'pending', label: t('pending') },
    { value: 'cancelled', label: t('cancelled') },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">{t('loadingHistory')}</span>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-lg', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {t('communicationHistory')}
          </h3>
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            leftIcon={<PlusIcon className="w-4 h-4" />}
          >
            {t('addRecord')}
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder={t('searchRecords')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FunnelIcon className="w-4 h-4" />}
            >
              {t('filters')}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Select
              options={typeOptions}
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              placeholder={t('filterByType')}
            />
            <Select
              options={directionOptions}
              value={filters.direction}
              onChange={(e) => setFilters(prev => ({ ...prev, direction: e.target.value }))}
              placeholder={t('filterByDirection')}
            />
            <Select
              options={priorityOptions}
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              placeholder={t('filterByPriority')}
            />
            <Select
              options={statusOptions}
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              placeholder={t('filterByStatus')}
            />
            <Select
              options={[
                { value: 'date_desc', label: t('newestFirst') },
                { value: 'date_asc', label: t('oldestFirst') },
                { value: 'priority_desc', label: t('highPriorityFirst') },
              ]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            />
          </div>
        </div>
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label={t('type')}
                options={typeOptions.slice(1)}
                value={newRecord.type}
                onChange={(e) => setNewRecord(prev => ({ ...prev, type: e.target.value as any }))}
              />
              <Select
                label={t('direction')}
                options={directionOptions.slice(1)}
                value={newRecord.direction}
                onChange={(e) => setNewRecord(prev => ({ ...prev, direction: e.target.value as any }))}
              />
              <Select
                label={t('priority')}
                options={priorityOptions.slice(1)}
                value={newRecord.priority}
                onChange={(e) => setNewRecord(prev => ({ ...prev, priority: e.target.value as any }))}
              />
            </div>
            <Input
              label={t('subject')}
              value={newRecord.subject}
              onChange={(e) => setNewRecord(prev => ({ ...prev, subject: e.target.value }))}
              placeholder={t('enterSubject')}
            />
            <Textarea
              label={t('content')}
              value={newRecord.content}
              onChange={(e) => setNewRecord(prev => ({ ...prev, content: e.target.value }))}
              placeholder={t('enterContent')}
              rows={3}
            />
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newRecord.followUpRequired}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{t('followUpRequired')}</span>
              </label>
              {newRecord.followUpRequired && (
                <Input
                  type="date"
                  value={newRecord.followUpDate ? newRecord.followUpDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setNewRecord(prev => ({ 
                    ...prev, 
                    followUpDate: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                  className="w-40"
                />
              )}
            </div>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                size="sm"
                onClick={handleAddRecord}
                disabled={!newRecord.subject || !newRecord.content}
              >
                {t('addRecord')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Records List */}
      <div className="divide-y divide-gray-200">
        {records.map((record) => (
          <div key={record.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getRecordIcon(record.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      {record.subject}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                        getPriorityStyle(record.priority)
                      )}>
                        {t(record.priority)}
                      </span>
                      <span className={cn(
                        'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                        getStatusStyle(record.status)
                      )}>
                        {t(record.status)}
                      </span>
                      {record.direction === 'inbound' ? (
                        <ArrowDownIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowUpIcon className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {record.duration && (
                      <span>{formatDuration(record.duration)}</span>
                    )}
                    <span>{formatDateTime(record.date)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {record.content}
                </p>
                {record.participants.length > 0 && (
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <UserIcon className="w-4 h-4 mr-1" />
                    <span>{t('participants')}: {record.participants.join(', ')}</span>
                  </div>
                )}
                {record.attachments && record.attachments.length > 0 && (
                  <div className="flex items-center mt-2 space-x-2">
                    {record.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        <DocumentTextIcon className="w-3 h-3 mr-1" />
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                )}
                {record.tags.length > 0 && (
                  <div className="flex items-center mt-2 space-x-1">
                    {record.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                {record.followUpRequired && record.followUpDate && (
                  <div className="flex items-center mt-2 text-xs text-orange-600">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    <span>{t('followUpDue')}: {formatDateTime(record.followUpDate)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {t('by')} {record.createdBy}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      {t('edit')}
                    </Button>
                    <Button size="sm" variant="outline">
                      {t('reply')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {records.length === 0 && (
        <div className="text-center py-12">
          <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('noCommunicationHistory')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('startTrackingCommunications')}
          </p>
          <Button
            onClick={() => setShowAddForm(true)}
            leftIcon={<PlusIcon className="w-4 h-4" />}
          >
            {t('addFirstRecord')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommunicationHistory;