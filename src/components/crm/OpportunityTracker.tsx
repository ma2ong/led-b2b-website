/**
 * 销售机会跟踪组件
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/FormComponents';

// 销售机会类型
export interface SalesOpportunity {
  id: string;
  title: string;
  description: string;
  customerId: string;
  customerName: string;
  value: number;
  probability: number; // 0-100
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  source: 'website' | 'referral' | 'trade_show' | 'cold_call' | 'social_media' | 'existing_customer';
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  competitors: string[];
  keyDecisionMakers: Array<{
    name: string;
    role: string;
    influence: 'high' | 'medium' | 'low';
  }>;
  nextSteps: string;
  notes: string;
  assignedTo: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  lostReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 销售漏斗统计
interface SalesFunnelStats {
  stage: SalesOpportunity['stage'];
  count: number;
  totalValue: number;
  averageValue: number;
  conversionRate: number;
}

interface OpportunityTrackerProps {
  customerId?: string;
  className?: string;
}

const OpportunityTracker: React.FC<OpportunityTrackerProps> = ({ customerId, className }) => {
  const { t } = useTranslation('crm');
  const [opportunities, setOpportunities] = useState<SalesOpportunity[]>([]);
  const [funnelStats, setFunnelStats] = useState<SalesFunnelStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'funnel'>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<SalesOpportunity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    stage: '',
    assignedTo: '',
    priority: '',
    source: '',
    dateRange: '',
  });
  const [sortBy, setSortBy] = useState<'value_desc' | 'probability_desc' | 'closeDate_asc' | 'updated_desc'>('value_desc');

  // 模拟数据加载
  useEffect(() => {
    const mockOpportunities: SalesOpportunity[] = [
      {
        id: 'opp_001',
        title: 'Conference Room LED Display Project',
        description: 'LED displays for 10 conference rooms in the new headquarters building',
        customerId: 'cust_001',
        customerName: 'Tech Solutions Inc',
        value: 500000,
        probability: 80,
        stage: 'negotiation',
        source: 'existing_customer',
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        products: [
          { id: 'prod_001', name: 'P2.5 Indoor LED Display', quantity: 10, unitPrice: 45000 },
          { id: 'prod_002', name: 'Control System', quantity: 10, unitPrice: 5000 },
        ],
        competitors: ['Samsung', 'LG Display'],
        keyDecisionMakers: [
          { name: 'John Smith', role: 'CTO', influence: 'high' },
          { name: 'Sarah Johnson', role: 'Procurement Manager', influence: 'high' },
        ],
        nextSteps: 'Send final proposal with revised pricing',
        notes: 'Customer is price-sensitive but values quality. Competitor pricing is aggressive.',
        assignedTo: 'sales@company.com',
        tags: ['enterprise', 'high-value', 'conference-room'],
        priority: 'high',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'opp_002',
        title: 'Lobby Digital Signage',
        description: 'Large format LED display for main lobby entrance',
        customerId: 'cust_001',
        customerName: 'Tech Solutions Inc',
        value: 200000,
        probability: 60,
        stage: 'proposal',
        source: 'existing_customer',
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        products: [
          { id: 'prod_003', name: 'P3 Indoor LED Display', quantity: 1, unitPrice: 180000 },
          { id: 'prod_004', name: 'Media Player', quantity: 1, unitPrice: 20000 },
        ],
        competitors: ['Daktronics'],
        keyDecisionMakers: [
          { name: 'Mike Davis', role: 'Facilities Manager', influence: 'medium' },
        ],
        nextSteps: 'Schedule site visit for measurements',
        notes: 'Secondary project, lower priority for customer',
        assignedTo: 'sales@company.com',
        tags: ['lobby', 'digital-signage'],
        priority: 'medium',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'opp_003',
        title: 'Outdoor LED Billboard',
        description: 'Outdoor LED display for advertising purposes',
        customerId: 'cust_002',
        customerName: '北京科技有限公司',
        value: 800000,
        probability: 40,
        stage: 'qualification',
        source: 'trade_show',
        expectedCloseDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        products: [
          { id: 'prod_005', name: 'P6 Outdoor LED Display', quantity: 1, unitPrice: 750000 },
          { id: 'prod_006', name: 'Weather Protection System', quantity: 1, unitPrice: 50000 },
        ],
        competitors: ['Absen', 'Unilumin'],
        keyDecisionMakers: [
          { name: '张伟', role: '采购经理', influence: 'high' },
          { name: '李明', role: '技术总监', influence: 'medium' },
        ],
        nextSteps: 'Provide technical specifications and certifications',
        notes: 'Need to verify budget and decision timeline',
        assignedTo: 'sales.china@company.com',
        tags: ['outdoor', 'billboard', 'china'],
        priority: 'high',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];

    // 计算漏斗统计
    const stages: SalesOpportunity['stage'][] = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    const stats: SalesFunnelStats[] = stages.map(stage => {
      const stageOpps = mockOpportunities.filter(opp => opp.stage === stage);
      const totalValue = stageOpps.reduce((sum, opp) => sum + opp.value, 0);
      return {
        stage,
        count: stageOpps.length,
        totalValue,
        averageValue: stageOpps.length > 0 ? totalValue / stageOpps.length : 0,
        conversionRate: 0, // 需要历史数据计算
      };
    });

    setOpportunities(mockOpportunities);
    setFunnelStats(stats);
    setLoading(false);
  }, [customerId]);

  // 获取阶段样式
  const getStageStyle = (stage: SalesOpportunity['stage']) => {
    switch (stage) {
      case 'prospecting':
        return 'bg-gray-100 text-gray-800';
      case 'qualification':
        return 'bg-blue-100 text-blue-800';
      case 'proposal':
        return 'bg-yellow-100 text-yellow-800';
      case 'negotiation':
        return 'bg-orange-100 text-orange-800';
      case 'closed_won':
        return 'bg-green-100 text-green-800';
      case 'closed_lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取优先级样式
  const getPriorityStyle = (priority: SalesOpportunity['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // 格式化货币
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  // 计算加权管道价值
  const calculateWeightedValue = (opportunity: SalesOpportunity) => {
    return opportunity.value * (opportunity.probability / 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">{t('loadingOpportunities')}</span>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-lg', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {customerId ? t('customerOpportunities') : t('salesOpportunities')}
          </h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-md',
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                )}
              >
                {t('list')}
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-md',
                  viewMode === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                )}
              >
                {t('kanban')}
              </button>
              <button
                onClick={() => setViewMode('funnel')}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-md',
                  viewMode === 'funnel' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                )}
              >
                {t('funnel')}
              </button>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddForm(true)}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              {t('addOpportunity')}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">{t('totalOpportunities')}</p>
                <p className="text-2xl font-bold text-blue-900">{opportunities.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">{t('totalValue')}</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(opportunities.reduce((sum, opp) => sum + opp.value, 0))}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrophyIcon className="w-8 h-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-900">{t('weightedValue')}</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(opportunities.reduce((sum, opp) => sum + calculateWeightedValue(opp), 0))}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <CalendarIcon className="w-8 h-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-900">{t('avgCloseTime')}</p>
                <p className="text-2xl font-bold text-orange-900">45d</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder={t('searchOpportunities')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={[
                { value: 'value_desc', label: t('highestValue') },
                { value: 'probability_desc', label: t('highestProbability') },
                { value: 'closeDate_asc', label: t('closingSoon') },
                { value: 'updated_desc', label: t('recentlyUpdated') },
              ]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-48"
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
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'list' && (
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <div key={opportunity.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {opportunity.title}
                      </h4>
                      <p className="text-sm text-gray-600">{opportunity.customerName}</p>
                    </div>
                    <span className={cn(
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      getStageStyle(opportunity.stage)
                    )}>
                      {t(opportunity.stage)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(opportunity.value)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {opportunity.probability}% {t('probability')}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {opportunity.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {t('expectedClose')}
                    </p>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatDate(opportunity.expectedCloseDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {t('assignedTo')}
                    </p>
                    <p className="text-sm text-gray-900 mt-1">
                      {opportunity.assignedTo}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {t('priority')}
                    </p>
                    <p className={cn(
                      'text-sm font-medium mt-1',
                      getPriorityStyle(opportunity.priority)
                    )}>
                      {t(opportunity.priority)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {t('weightedValue')}
                    </p>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatCurrency(calculateWeightedValue(opportunity))}
                    </p>
                  </div>
                </div>

                {opportunity.nextSteps && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {t('nextSteps')}
                    </p>
                    <p className="text-sm text-gray-900">
                      {opportunity.nextSteps}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {opportunity.products.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">{t('products')}:</span>
                        {opportunity.products.slice(0, 2).map((product, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                          >
                            {product.name}
                          </span>
                        ))}
                        {opportunity.products.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{opportunity.products.length - 2} {t('more')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      {t('viewDetails')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'funnel' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {funnelStats.map((stat) => (
                <div key={stat.stage} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      {t(stat.stage)}
                    </h4>
                    <span className={cn(
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      getStageStyle(stat.stage)
                    )}>
                      {stat.count}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{t('totalValue')}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(stat.totalValue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{t('averageValue')}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(stat.averageValue)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {opportunities.length === 0 && (
          <div className="text-center py-12">
            <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('noOpportunities')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('startTrackingOpportunities')}
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              {t('addFirstOpportunity')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityTracker;