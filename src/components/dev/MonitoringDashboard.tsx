/**
 * 监控仪表板组件
 * 用于开发环境下查看监控数据
 */
import React, { useState, useEffect } from 'react';
import { getPerformanceMonitor } from '@/lib/performance-monitor';
import { getErrorTracker } from '@/lib/error-tracker';
import { getAnalytics } from '@/lib/analytics';

interface MonitoringDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'performance' | 'errors' | 'analytics'>('performance');
  const [performanceData, setPerformanceData] = useState<any>({});
  const [errorData, setErrorData] = useState<any>({});
  const [analyticsData, setAnalyticsData] = useState<any>({});
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // 刷新数据
  const refreshData = () => {
    const performanceMonitor = getPerformanceMonitor();
    const errorTracker = getErrorTracker();
    const analytics = getAnalytics();

    setPerformanceData(performanceMonitor.getPerformanceSummary());
    setErrorData(errorTracker.getErrorSummary());
    setAnalyticsData(analytics.getAnalyticsSummary());
  };

  useEffect(() => {
    if (isVisible) {
      refreshData();
      
      // 每5秒刷新一次数据
      const interval = setInterval(refreshData, 5000);
      setRefreshInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">监控仪表板</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshData}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              刷新
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { key: 'performance', label: '性能监控' },
            { key: 'errors', label: '错误追踪' },
            { key: 'analytics', label: '用户分析' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'performance' && (
            <PerformanceTab data={performanceData} />
          )}
          {activeTab === 'errors' && (
            <ErrorsTab data={errorData} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab data={analyticsData} />
          )}
        </div>
      </div>
    </div>
  );
};

// 性能监控标签页
const PerformanceTab: React.FC<{ data: any }> = ({ data }) => {
  const metricTypes = Object.keys(data);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">良好指标</h3>
          <p className="text-2xl font-bold text-green-600">
            {metricTypes.reduce((count, type) => 
              count + (data[type]?.filter((m: any) => m.rating === 'good').length || 0), 0
            )}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">需要改进</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {metricTypes.reduce((count, type) => 
              count + (data[type]?.filter((m: any) => m.rating === 'needs-improvement').length || 0), 0
            )}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800">性能差</h3>
          <p className="text-2xl font-bold text-red-600">
            {metricTypes.reduce((count, type) => 
              count + (data[type]?.filter((m: any) => m.rating === 'poor').length || 0), 0
            )}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {metricTypes.map((type) => (
          <div key={type} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{type}</h3>
            <div className="space-y-2">
              {data[type]?.slice(-5).map((metric: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{new Date(metric.timestamp).toLocaleTimeString()}</span>
                  <span className="font-mono">{metric.value.toFixed(2)}ms</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    metric.rating === 'good' ? 'bg-green-100 text-green-800' :
                    metric.rating === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {metric.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 错误追踪标签页
const ErrorsTab: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800">总错误数</h3>
          <p className="text-2xl font-bold text-gray-600">{data.totalErrors || 0}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800">关键错误</h3>
          <p className="text-2xl font-bold text-red-600">{data.errorsBySeverity?.critical || 0}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-800">高级错误</h3>
          <p className="text-2xl font-bold text-orange-600">{data.errorsBySeverity?.high || 0}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">中级错误</h3>
          <p className="text-2xl font-bold text-yellow-600">{data.errorsBySeverity?.medium || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">错误类型分布</h3>
          <div className="space-y-2">
            {Object.entries(data.errorsByType || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="capitalize">{type}</span>
                <span className="font-bold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">最近错误</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.recentErrors?.map((error: any, index: number) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-2 py-1 rounded text-xs ${
                    error.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    error.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    error.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {error.severity}
                  </span>
                  <span className="text-gray-500">
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="font-medium">{error.message}</p>
                <p className="text-gray-600 text-xs">{error.url}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 用户分析标签页
const AnalyticsTab: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">页面浏览</h3>
          <p className="text-2xl font-bold text-blue-600">
            {data.eventCounts?.page_view || 0}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">产品浏览</h3>
          <p className="text-2xl font-bold text-green-600">
            {data.eventCounts?.product_view || 0}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">询盘完成</h3>
          <p className="text-2xl font-bold text-purple-600">
            {data.eventCounts?.inquiry_complete || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">事件类型分布</h3>
          <div className="space-y-2">
            {Object.entries(data.eventCounts || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="capitalize">{type.replace('_', ' ')}</span>
                <span className="font-bold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">热门页面</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.topPages?.map((page: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="truncate flex-1 mr-2">{page.url}</span>
                <span className="font-bold">{page.views}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">转化漏斗</h3>
        <div className="space-y-4">
          {data.funnels?.map((funnel: any, index: number) => (
            <div key={index} className="border rounded p-3">
              <h4 className="font-medium mb-2">{funnel.name}</h4>
              <div className="flex items-center space-x-4">
                {funnel.steps?.map((step: string, stepIndex: number) => (
                  <React.Fragment key={step}>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">{step.replace('_', ' ')}</div>
                      <div className="font-bold">
                        {funnel.conversionRates?.[stepIndex]?.toFixed(1) || 0}%
                      </div>
                    </div>
                    {stepIndex < funnel.steps.length - 1 && (
                      <div className="text-gray-400">→</div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">会话信息</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">会话ID:</span>
            <p className="font-mono text-xs">{data.session?.id}</p>
          </div>
          <div>
            <span className="text-gray-600">页面浏览数:</span>
            <p className="font-bold">{data.session?.pageViews || 0}</p>
          </div>
          <div>
            <span className="text-gray-600">事件数:</span>
            <p className="font-bold">{data.session?.events?.length || 0}</p>
          </div>
          <div>
            <span className="text-gray-600">设备类型:</span>
            <p className="font-medium">{data.session?.device?.type || 'Unknown'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;