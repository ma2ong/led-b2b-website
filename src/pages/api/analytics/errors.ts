/**
 * 错误追踪数据接收API
 */
import { NextApiRequest, NextApiResponse } from 'next';

interface ErrorInfo {
  id: string;
  type: 'javascript' | 'network' | 'resource' | 'unhandled-rejection' | 'custom';
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  timestamp: number;
  userAgent: string;
  userId?: string;
  sessionId: string;
  pageUrl: string;
  referrer: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  breadcrumbs: Array<{
    timestamp: number;
    type: string;
    message: string;
    data?: Record<string, any>;
  }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const errors: ErrorInfo[] = JSON.parse(req.body);
    
    // 验证数据格式
    if (!Array.isArray(errors)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // 处理错误数据
    await processErrors(errors);

    // 检查是否需要立即告警
    await checkErrorAlerts(errors);

    res.status(200).json({ 
      success: true, 
      processed: errors.length,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error processing error reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * 处理错误数据
 */
async function processErrors(errors: ErrorInfo[]): Promise<void> {
  // 错误去重
  const uniqueErrors = deduplicateErrors(errors);
  
  // 错误分类和聚合
  const errorGroups = groupErrors(uniqueErrors);
  
  // 存储错误数据
  await storeErrors(uniqueErrors, errorGroups);
  
  // 更新错误统计
  await updateErrorStatistics(uniqueErrors);
}

/**
 * 错误去重
 */
function deduplicateErrors(errors: ErrorInfo[]): ErrorInfo[] {
  const seen = new Set<string>();
  const unique: ErrorInfo[] = [];

  errors.forEach(error => {
    // 创建错误指纹用于去重
    const fingerprint = createErrorFingerprint(error);
    
    if (!seen.has(fingerprint)) {
      seen.add(fingerprint);
      unique.push(error);
    }
  });

  return unique;
}

/**
 * 创建错误指纹
 */
function createErrorFingerprint(error: ErrorInfo): string {
  // 基于错误类型、消息和堆栈的关键部分创建指纹
  const stackLines = error.stack?.split('\n').slice(0, 3).join('') || '';
  const normalizedMessage = error.message.replace(/\d+/g, 'N'); // 替换数字
  
  return `${error.type}:${normalizedMessage}:${stackLines}`;
}

/**
 * 错误分组
 */
function groupErrors(errors: ErrorInfo[]): Record<string, ErrorInfo[]> {
  const groups: Record<string, ErrorInfo[]> = {};

  errors.forEach(error => {
    const groupKey = createErrorFingerprint(error);
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(error);
  });

  return groups;
}

/**
 * 存储错误数据
 */
async function storeErrors(errors: ErrorInfo[], groups: Record<string, ErrorInfo[]>): Promise<void> {
  // 在实际项目中，这里会将数据存储到数据库
  const errorData = {
    timestamp: Date.now(),
    errors: errors.map(error => ({
      ...error,
      processed: true,
      fingerprint: createErrorFingerprint(error),
    })),
    groups: Object.entries(groups).map(([fingerprint, groupErrors]) => ({
      fingerprint,
      count: groupErrors.length,
      firstSeen: Math.min(...groupErrors.map(e => e.timestamp)),
      lastSeen: Math.max(...groupErrors.map(e => e.timestamp)),
      severity: getHighestSeverity(groupErrors),
      affectedUsers: new Set(groupErrors.map(e => e.userId).filter(Boolean)).size,
      affectedSessions: new Set(groupErrors.map(e => e.sessionId)).size,
      sample: groupErrors[0], // 保存一个样本用于分析
    })),
    summary: generateErrorSummary(errors),
  };

  console.log('Storing error data:', errorData);

  // 实际实现示例：
  // await db.collection('errors').insertMany(errors);
  // await db.collection('error_groups').upsertMany(errorData.groups);
}

/**
 * 获取最高严重程度
 */
function getHighestSeverity(errors: ErrorInfo[]): 'low' | 'medium' | 'high' | 'critical' {
  const severityOrder = ['low', 'medium', 'high', 'critical'];
  let highest = 'low';

  errors.forEach(error => {
    if (severityOrder.indexOf(error.severity) > severityOrder.indexOf(highest)) {
      highest = error.severity;
    }
  });

  return highest as 'low' | 'medium' | 'high' | 'critical';
}

/**
 * 生成错误摘要
 */
function generateErrorSummary(errors: ErrorInfo[]) {
  const summary = {
    totalErrors: errors.length,
    byType: {} as Record<string, number>,
    bySeverity: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
    byPage: {} as Record<string, number>,
    affectedUsers: new Set<string>(),
    affectedSessions: new Set<string>(),
  };

  errors.forEach(error => {
    // 按类型统计
    summary.byType[error.type] = (summary.byType[error.type] || 0) + 1;
    
    // 按严重程度统计
    summary.bySeverity[error.severity]++;
    
    // 按页面统计
    summary.byPage[error.pageUrl] = (summary.byPage[error.pageUrl] || 0) + 1;
    
    // 受影响的用户和会话
    if (error.userId) summary.affectedUsers.add(error.userId);
    summary.affectedSessions.add(error.sessionId);
  });

  return {
    ...summary,
    affectedUsers: summary.affectedUsers.size,
    affectedSessions: summary.affectedSessions.size,
  };
}

/**
 * 更新错误统计
 */
async function updateErrorStatistics(errors: ErrorInfo[]): Promise<void> {
  // 更新实时错误率统计
  const now = Date.now();
  const hourlyStats = {
    timestamp: Math.floor(now / (1000 * 60 * 60)) * (1000 * 60 * 60), // 整点时间
    errorCount: errors.length,
    criticalCount: errors.filter(e => e.severity === 'critical').length,
    highCount: errors.filter(e => e.severity === 'high').length,
    jsErrorCount: errors.filter(e => e.type === 'javascript').length,
    networkErrorCount: errors.filter(e => e.type === 'network').length,
  };

  console.log('Updating error statistics:', hourlyStats);

  // 实际实现：
  // await db.collection('error_stats').upsert(
  //   { timestamp: hourlyStats.timestamp },
  //   { $inc: hourlyStats }
  // );
}

/**
 * 检查错误告警
 */
async function checkErrorAlerts(errors: ErrorInfo[]): Promise<void> {
  const alerts = [];

  // 检查关键错误
  const criticalErrors = errors.filter(e => e.severity === 'critical');
  if (criticalErrors.length > 0) {
    alerts.push({
      type: 'critical-errors',
      count: criticalErrors.length,
      errors: criticalErrors.map(e => ({
        message: e.message,
        url: e.pageUrl,
        timestamp: e.timestamp,
      })),
    });
  }

  // 检查错误率激增
  const recentErrorRate = await getRecentErrorRate();
  const currentErrorRate = errors.length;
  
  if (currentErrorRate > recentErrorRate * 2) { // 错误率翻倍
    alerts.push({
      type: 'error-rate-spike',
      currentRate: currentErrorRate,
      previousRate: recentErrorRate,
      increase: ((currentErrorRate - recentErrorRate) / recentErrorRate * 100).toFixed(1) + '%',
    });
  }

  // 检查新错误类型
  const newErrorTypes = await detectNewErrorTypes(errors);
  if (newErrorTypes.length > 0) {
    alerts.push({
      type: 'new-error-types',
      count: newErrorTypes.length,
      types: newErrorTypes,
    });
  }

  // 发送告警
  if (alerts.length > 0) {
    await sendErrorAlerts(alerts);
  }
}

/**
 * 获取最近的错误率
 */
async function getRecentErrorRate(): Promise<number> {
  // 在实际项目中，这里会查询数据库获取最近的错误率
  // const recentStats = await db.collection('error_stats')
  //   .find({ timestamp: { $gte: Date.now() - 24 * 60 * 60 * 1000 } })
  //   .sort({ timestamp: -1 })
  //   .limit(24)
  //   .toArray();
  
  // return recentStats.reduce((sum, stat) => sum + stat.errorCount, 0) / recentStats.length;
  
  // 模拟返回
  return 10;
}

/**
 * 检测新错误类型
 */
async function detectNewErrorTypes(errors: ErrorInfo[]): Promise<string[]> {
  // 在实际项目中，这里会检查数据库中是否存在这些错误指纹
  const currentFingerprints = errors.map(createErrorFingerprint);
  
  // const existingFingerprints = await db.collection('error_groups')
  //   .find({ fingerprint: { $in: currentFingerprints } })
  //   .distinct('fingerprint');
  
  // return currentFingerprints.filter(fp => !existingFingerprints.includes(fp));
  
  // 模拟返回
  return [];
}

/**
 * 发送错误告警
 */
async function sendErrorAlerts(alerts: any[]): Promise<void> {
  console.log('Error alerts:', alerts);

  // 实际实现中会发送到各种通知渠道
  // 例如：Slack、邮件、短信、PagerDuty等
  
  // 示例：发送到错误监控服务
  // await sendToErrorMonitoringService(alerts);
  
  // 示例：发送Slack通知
  // await sendSlackNotification({
  //   channel: '#errors',
  //   text: `🚨 Error Alert: ${alerts.length} issues detected`,
  //   attachments: alerts.map(alert => ({
  //     color: 'danger',
  //     title: alert.type,
  //     fields: Object.entries(alert).map(([key, value]) => ({
  //       title: key,
  //       value: typeof value === 'object' ? JSON.stringify(value) : String(value),
  //       short: true,
  //     })),
  //   })),
  // });
}