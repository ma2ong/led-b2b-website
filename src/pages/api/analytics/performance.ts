/**
 * 性能监控数据接收API
 */
import { NextApiRequest, NextApiResponse } from 'next';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userAgent: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const metrics: PerformanceMetric[] = JSON.parse(req.body);
    
    // 验证数据格式
    if (!Array.isArray(metrics)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // 处理性能指标
    await processPerformanceMetrics(metrics);

    // 检查是否有性能问题需要告警
    await checkPerformanceAlerts(metrics);

    res.status(200).json({ 
      success: true, 
      processed: metrics.length,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error processing performance metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * 处理性能指标数据
 */
async function processPerformanceMetrics(metrics: PerformanceMetric[]): Promise<void> {
  // 在实际项目中，这里会将数据存储到数据库
  // 例如：MongoDB, PostgreSQL, InfluxDB等时序数据库
  
  const performanceData = {
    timestamp: Date.now(),
    metrics: metrics.map(metric => ({
      ...metric,
      processed: true,
    })),
    summary: generatePerformanceSummary(metrics),
  };

  // 模拟数据存储
  console.log('Storing performance metrics:', performanceData);

  // 实际实现示例：
  // await db.collection('performance_metrics').insertMany(metrics);
  
  // 或者发送到外部监控服务
  // await sendToMonitoringService(metrics);
}

/**
 * 生成性能摘要
 */
function generatePerformanceSummary(metrics: PerformanceMetric[]) {
  const summary = {
    totalMetrics: metrics.length,
    byRating: {
      good: 0,
      'needs-improvement': 0,
      poor: 0,
    },
    byType: {} as Record<string, number>,
    averageValues: {} as Record<string, number>,
  };

  const valuesByType: Record<string, number[]> = {};

  metrics.forEach(metric => {
    // 按评级统计
    summary.byRating[metric.rating]++;
    
    // 按类型统计
    summary.byType[metric.name] = (summary.byType[metric.name] || 0) + 1;
    
    // 收集数值用于计算平均值
    if (!valuesByType[metric.name]) {
      valuesByType[metric.name] = [];
    }
    valuesByType[metric.name].push(metric.value);
  });

  // 计算平均值
  Object.entries(valuesByType).forEach(([type, values]) => {
    summary.averageValues[type] = values.reduce((sum, val) => sum + val, 0) / values.length;
  });

  return summary;
}

/**
 * 检查性能告警
 */
async function checkPerformanceAlerts(metrics: PerformanceMetric[]): Promise<void> {
  const alerts = [];

  // 检查Core Web Vitals
  const coreWebVitals = ['LCP', 'FID', 'CLS'];
  
  metrics.forEach(metric => {
    if (coreWebVitals.includes(metric.name) && metric.rating === 'poor') {
      alerts.push({
        type: 'core-web-vitals',
        metric: metric.name,
        value: metric.value,
        threshold: getThreshold(metric.name),
        url: metric.url,
        timestamp: metric.timestamp,
      });
    }
  });

  // 检查长任务
  const longTasks = metrics.filter(m => m.name === 'long-task' && m.value > 100);
  if (longTasks.length > 5) {
    alerts.push({
      type: 'long-tasks',
      count: longTasks.length,
      averageDuration: longTasks.reduce((sum, task) => sum + task.value, 0) / longTasks.length,
      timestamp: Date.now(),
    });
  }

  // 检查内存使用
  const memoryMetrics = metrics.filter(m => m.name === 'memory-usage' && m.rating === 'poor');
  if (memoryMetrics.length > 0) {
    alerts.push({
      type: 'memory-usage',
      count: memoryMetrics.length,
      maxUsage: Math.max(...memoryMetrics.map(m => m.value)),
      timestamp: Date.now(),
    });
  }

  // 发送告警
  if (alerts.length > 0) {
    await sendPerformanceAlerts(alerts);
  }
}

/**
 * 获取性能指标阈值
 */
function getThreshold(metricName: string): number {
  const thresholds: Record<string, number> = {
    'LCP': 2500, // Largest Contentful Paint
    'FID': 100,  // First Input Delay
    'CLS': 0.1,  // Cumulative Layout Shift
    'FCP': 1800, // First Contentful Paint
    'TTFB': 600, // Time to First Byte
  };
  
  return thresholds[metricName] || 0;
}

/**
 * 发送性能告警
 */
async function sendPerformanceAlerts(alerts: any[]): Promise<void> {
  // 在实际项目中，这里会发送告警到：
  // - Slack/Teams通知
  // - 邮件通知
  // - 短信通知
  // - 监控平台（如PagerDuty）
  
  console.log('Performance alerts:', alerts);

  // 示例：发送到Slack
  // await sendSlackNotification({
  //   channel: '#alerts',
  //   text: `🚨 Performance Alert: ${alerts.length} issues detected`,
  //   attachments: alerts.map(alert => ({
  //     color: 'danger',
  //     fields: Object.entries(alert).map(([key, value]) => ({
  //       title: key,
  //       value: String(value),
  //       short: true,
  //     })),
  //   })),
  // });

  // 示例：发送邮件
  // await sendEmailAlert({
  //   to: ['admin@company.com'],
  //   subject: 'Performance Alert',
  //   body: `Performance issues detected: ${JSON.stringify(alerts, null, 2)}`,
  // });
}