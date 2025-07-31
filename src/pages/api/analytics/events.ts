/**
 * 用户行为分析数据接收API
 */
import { NextApiRequest, NextApiResponse } from 'next';

interface UserEvent {
  id: string;
  type: 'page_view' | 'click' | 'form_submit' | 'scroll' | 'search' | 'product_view' | 'inquiry_start' | 'inquiry_complete' | 'custom';
  name: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  url: string;
  referrer: string;
  userAgent: string;
  properties: Record<string, any>;
  context: {
    page: {
      title: string;
      url: string;
      path: string;
      search: string;
      hash: string;
    };
    screen: {
      width: number;
      height: number;
      density: number;
    };
    viewport: {
      width: number;
      height: number;
    };
    locale: string;
    timezone: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const events: UserEvent[] = JSON.parse(req.body);
    
    // 验证数据格式
    if (!Array.isArray(events)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // 处理用户事件
    await processUserEvents(events);

    // 更新实时分析
    await updateRealTimeAnalytics(events);

    // 计算转化率
    await updateConversionMetrics(events);

    res.status(200).json({ 
      success: true, 
      processed: events.length,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error processing user events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * 处理用户事件
 */
async function processUserEvents(events: UserEvent[]): Promise<void> {
  // 事件预处理
  const processedEvents = events.map(event => ({
    ...event,
    processed: true,
    receivedAt: Date.now(),
    // 添加地理位置信息（如果可用）
    geo: extractGeoFromIP(event.userAgent),
    // 设备信息解析
    device: parseUserAgent(event.userAgent),
    // URL解析
    urlParts: parseURL(event.url),
  }));

  // 存储事件数据
  await storeEvents(processedEvents);

  // 更新用户画像
  await updateUserProfiles(processedEvents);
}

/**
 * 从IP提取地理位置信息（模拟）
 */
function extractGeoFromIP(userAgent: string): { country?: string; city?: string; timezone?: string } {
  // 在实际项目中，这里会使用IP地理位置服务
  // 例如：MaxMind GeoIP, IP2Location等
  return {
    country: 'Unknown',
    city: 'Unknown',
    timezone: 'UTC',
  };
}

/**
 * 解析User Agent
 */
function parseUserAgent(userAgent: string): {
  browser: string;
  version: string;
  os: string;
  device: string;
} {
  // 简化的User Agent解析
  let browser = 'Unknown';
  let version = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  }

  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  if (userAgent.includes('Mobile')) device = 'Mobile';
  else if (userAgent.includes('Tablet')) device = 'Tablet';

  return { browser, version, os, device };
}

/**
 * 解析URL
 */
function parseURL(url: string): {
  domain: string;
  path: string;
  query: Record<string, string>;
  hash: string;
} {
  try {
    const urlObj = new URL(url);
    const query: Record<string, string> = {};
    
    urlObj.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    return {
      domain: urlObj.hostname,
      path: urlObj.pathname,
      query,
      hash: urlObj.hash,
    };
  } catch {
    return {
      domain: 'unknown',
      path: '/',
      query: {},
      hash: '',
    };
  }
}

/**
 * 存储事件数据
 */
async function storeEvents(events: any[]): Promise<void> {
  // 按事件类型分组存储
  const eventsByType = events.reduce((groups, event) => {
    if (!groups[event.type]) {
      groups[event.type] = [];
    }
    groups[event.type].push(event);
    return groups;
  }, {} as Record<string, any[]>);

  console.log('Storing events by type:', Object.keys(eventsByType));

  // 实际实现中会存储到数据库
  // await Promise.all(
  //   Object.entries(eventsByType).map(([type, typeEvents]) =>
  //     db.collection(`events_${type}`).insertMany(typeEvents)
  //   )
  // );
}

/**
 * 更新用户画像
 */
async function updateUserProfiles(events: any[]): Promise<void> {
  const userProfiles = new Map<string, any>();

  events.forEach(event => {
    const userId = event.userId || event.sessionId;
    
    if (!userProfiles.has(userId)) {
      userProfiles.set(userId, {
        userId: event.userId,
        sessionId: event.sessionId,
        firstSeen: event.timestamp,
        lastSeen: event.timestamp,
        pageViews: 0,
        events: 0,
        devices: new Set(),
        browsers: new Set(),
        countries: new Set(),
        interests: new Set(),
        conversionEvents: [],
      });
    }

    const profile = userProfiles.get(userId);
    profile.lastSeen = Math.max(profile.lastSeen, event.timestamp);
    profile.events++;
    
    if (event.type === 'page_view') {
      profile.pageViews++;
    }

    profile.devices.add(event.device?.device || 'Unknown');
    profile.browsers.add(event.device?.browser || 'Unknown');
    profile.countries.add(event.geo?.country || 'Unknown');

    // 根据事件推断用户兴趣
    if (event.type === 'product_view' && event.properties.category) {
      profile.interests.add(event.properties.category);
    }

    // 记录转化事件
    if (['inquiry_start', 'inquiry_complete', 'form_submit'].includes(event.type)) {
      profile.conversionEvents.push({
        type: event.type,
        timestamp: event.timestamp,
        properties: event.properties,
      });
    }
  });

  // 转换Set为Array以便存储
  const profilesToStore = Array.from(userProfiles.values()).map(profile => ({
    ...profile,
    devices: Array.from(profile.devices),
    browsers: Array.from(profile.browsers),
    countries: Array.from(profile.countries),
    interests: Array.from(profile.interests),
    sessionDuration: profile.lastSeen - profile.firstSeen,
  }));

  console.log('Updating user profiles:', profilesToStore.length);

  // 实际实现：
  // await Promise.all(
  //   profilesToStore.map(profile =>
  //     db.collection('user_profiles').upsert(
  //       { sessionId: profile.sessionId },
  //       { $set: profile }
  //     )
  //   )
  // );
}

/**
 * 更新实时分析
 */
async function updateRealTimeAnalytics(events: UserEvent[]): Promise<void> {
  const now = Date.now();
  const currentMinute = Math.floor(now / (1000 * 60)) * (1000 * 60);

  // 计算实时指标
  const realTimeMetrics = {
    timestamp: currentMinute,
    activeUsers: new Set(events.map(e => e.userId || e.sessionId)).size,
    pageViews: events.filter(e => e.type === 'page_view').length,
    events: events.length,
    topPages: getTopPages(events),
    topReferrers: getTopReferrers(events),
    deviceBreakdown: getDeviceBreakdown(events),
    conversionEvents: events.filter(e => 
      ['inquiry_start', 'inquiry_complete', 'form_submit'].includes(e.type)
    ).length,
  };

  console.log('Real-time metrics:', realTimeMetrics);

  // 实际实现：
  // await db.collection('realtime_metrics').upsert(
  //   { timestamp: currentMinute },
  //   { $set: realTimeMetrics }
  // );
}

/**
 * 获取热门页面
 */
function getTopPages(events: UserEvent[]): Array<{ page: string; views: number }> {
  const pageViews = events
    .filter(e => e.type === 'page_view')
    .reduce((counts, event) => {
      const page = event.context.page.path;
      counts[page] = (counts[page] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

  return Object.entries(pageViews)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([page, views]) => ({ page, views }));
}

/**
 * 获取热门来源
 */
function getTopReferrers(events: UserEvent[]): Array<{ referrer: string; visits: number }> {
  const referrers = events
    .filter(e => e.type === 'page_view' && e.referrer)
    .reduce((counts, event) => {
      const referrer = new URL(event.referrer).hostname;
      counts[referrer] = (counts[referrer] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

  return Object.entries(referrers)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([referrer, visits]) => ({ referrer, visits }));
}

/**
 * 获取设备分布
 */
function getDeviceBreakdown(events: UserEvent[]): Record<string, number> {
  const devices = events.reduce((counts, event) => {
    const deviceType = event.context.screen.width < 768 ? 'Mobile' : 
                      event.context.screen.width < 1024 ? 'Tablet' : 'Desktop';
    counts[deviceType] = (counts[deviceType] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  return devices;
}

/**
 * 更新转化指标
 */
async function updateConversionMetrics(events: UserEvent[]): Promise<void> {
  // 计算各种转化率
  const conversionMetrics = {
    timestamp: Date.now(),
    funnels: await calculateFunnelConversions(events),
    goals: await calculateGoalConversions(events),
    cohorts: await calculateCohortAnalysis(events),
  };

  console.log('Conversion metrics:', conversionMetrics);

  // 实际实现：
  // await db.collection('conversion_metrics').insert(conversionMetrics);
}

/**
 * 计算漏斗转化率
 */
async function calculateFunnelConversions(events: UserEvent[]): Promise<any[]> {
  const funnels = [
    {
      name: 'Product to Inquiry',
      steps: ['product_view', 'inquiry_start', 'inquiry_complete'],
    },
    {
      name: 'Homepage to Product',
      steps: ['page_view', 'product_view'],
    },
  ];

  return funnels.map(funnel => {
    const stepCounts = funnel.steps.map(step => 
      new Set(events.filter(e => e.type === step).map(e => e.sessionId)).size
    );

    const conversionRates = stepCounts.map((count, index) => {
      if (index === 0) return 100;
      return stepCounts[0] > 0 ? (count / stepCounts[0]) * 100 : 0;
    });

    return {
      name: funnel.name,
      steps: funnel.steps,
      counts: stepCounts,
      conversionRates,
      totalConversion: conversionRates[conversionRates.length - 1],
    };
  });
}

/**
 * 计算目标转化率
 */
async function calculateGoalConversions(events: UserEvent[]): Promise<any[]> {
  const goals = [
    { name: 'Inquiry Completion', event: 'inquiry_complete' },
    { name: 'Form Submission', event: 'form_submit' },
    { name: 'Product View', event: 'product_view' },
  ];

  const totalSessions = new Set(events.map(e => e.sessionId)).size;

  return goals.map(goal => {
    const conversions = new Set(
      events.filter(e => e.type === goal.event).map(e => e.sessionId)
    ).size;

    return {
      name: goal.name,
      conversions,
      totalSessions,
      conversionRate: totalSessions > 0 ? (conversions / totalSessions) * 100 : 0,
    };
  });
}

/**
 * 计算队列分析
 */
async function calculateCohortAnalysis(events: UserEvent[]): Promise<any> {
  // 简化的队列分析
  const cohorts = events.reduce((groups, event) => {
    const cohortWeek = getWeekStart(event.timestamp);
    if (!groups[cohortWeek]) {
      groups[cohortWeek] = new Set();
    }
    groups[cohortWeek].add(event.sessionId);
    return groups;
  }, {} as Record<string, Set<string>>);

  return Object.entries(cohorts).map(([week, sessions]) => ({
    cohortWeek: week,
    userCount: sessions.size,
    // 在实际实现中，这里会计算留存率
    retention: {
      week1: 100, // 第一周留存率为100%
      week2: 85,  // 模拟数据
      week3: 70,
      week4: 60,
    },
  }));
}

/**
 * 获取周开始时间
 */
function getWeekStart(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.getDay();
  const diff = date.getDate() - day;
  const weekStart = new Date(date.setDate(diff));
  return weekStart.toISOString().split('T')[0];
}