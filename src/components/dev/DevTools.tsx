/**
 * 开发工具组件
 * 提供监控仪表板和其他开发工具的访问入口
 */
import React, { useState, useEffect } from 'react';
import MonitoringDashboard from './MonitoringDashboard';
import { useMonitoring } from '@/hooks/useMonitoring';

const DevTools: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const { setMonitoringEnabled, recordError, trackEvent } = useMonitoring();

  // 只在开发环境显示
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // 监听快捷键 Ctrl+Shift+M 打开监控面板
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'M') {
          event.preventDefault();
          setIsVisible(prev => !prev);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  // 测试功能
  const testPerformanceMetric = () => {
    const { recordPerformanceMetric } = useMonitoring();
    recordPerformanceMetric('test-metric', Math.random() * 3000, 'good');
  };

  const testError = () => {
    recordError('Test error from DevTools', 'medium', { source: 'devtools' });
  };

  const testAnalyticsEvent = () => {
    trackEvent('custom', 'DevTools Test Event', { timestamp: Date.now() });
  };

  const toggleMonitoring = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    setMonitoringEnabled(newState);
  };

  // 只在开发环境渲染
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* 浮动按钮 */}
      {isVisible && (
        <div className="fixed bottom-4 right-4 z-40 bg-white rounded-lg shadow-lg border p-4 min-w-64">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">开发工具</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {/* 监控控制 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">监控系统</span>
              <button
                onClick={toggleMonitoring}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  isEnabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {isEnabled ? '已启用' : '已禁用'}
              </button>
            </div>

            {/* 监控仪表板 */}
            <button
              onClick={() => setIsDashboardOpen(true)}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              打开监控仪表板
            </button>

            {/* 测试功能 */}
            <div className="border-t pt-3">
              <p className="text-xs text-gray-600 mb-2">测试功能:</p>
              <div className="space-y-2">
                <button
                  onClick={testPerformanceMetric}
                  className="w-full px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                >
                  测试性能指标
                </button>
                <button
                  onClick={testError}
                  className="w-full px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                >
                  测试错误报告
                </button>
                <button
                  onClick={testAnalyticsEvent}
                  className="w-full px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs hover:bg-purple-200"
                >
                  测试分析事件
                </button>
              </div>
            </div>

            {/* 快捷键提示 */}
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500">
                快捷键: Ctrl+Shift+M
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 快捷键提示 */}
      {!isVisible && (
        <div className="fixed bottom-4 right-4 z-30">
          <div className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs opacity-75 hover:opacity-100 transition-opacity">
            按 Ctrl+Shift+M 打开开发工具
          </div>
        </div>
      )}

      {/* 监控仪表板 */}
      <MonitoringDashboard
        isVisible={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />
    </>
  );
};

export default DevTools;