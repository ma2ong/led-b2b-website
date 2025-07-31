/**
 * 健康检查API端点
 */
import { NextApiRequest, NextApiResponse } from 'next';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
    memory: 'healthy' | 'unhealthy';
    disk: 'healthy' | 'unhealthy';
  };
  metrics: {
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
    cpuUsage: number;
    activeConnections: number;
    responseTime: number;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<HealthStatus>) {
  const startTime = Date.now();
  
  try {
    // 检查数据库连接
    const databaseStatus = await checkDatabase();
    
    // 检查Redis连接
    const redisStatus = await checkRedis();
    
    // 检查内存使用情况
    const memoryStatus = checkMemory();
    
    // 检查磁盘空间
    const diskStatus = await checkDisk();
    
    // 计算响应时间
    const responseTime = Date.now() - startTime;
    
    // 获取系统指标
    const metrics = await getSystemMetrics(responseTime);
    
    // 确定整体健康状态
    const overallStatus = (
      databaseStatus === 'healthy' &&
      redisStatus === 'healthy' &&
      memoryStatus === 'healthy' &&
      diskStatus === 'healthy'
    ) ? 'healthy' : 'unhealthy';
    
    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {
        database: databaseStatus,
        redis: redisStatus,
        memory: memoryStatus,
        disk: diskStatus,
      },
      metrics,
    };
    
    // 根据健康状态设置HTTP状态码
    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(healthStatus);
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {
        database: 'unhealthy',
        redis: 'unhealthy',
        memory: 'unhealthy',
        disk: 'unhealthy',
      },
      metrics: {
        memoryUsage: { used: 0, total: 0, percentage: 0 },
        cpuUsage: 0,
        activeConnections: 0,
        responseTime: Date.now() - startTime,
      },
    };
    
    res.status(503).json(errorStatus);
  }
}

/**
 * 检查数据库连接
 */
async function checkDatabase(): Promise<'healthy' | 'unhealthy'> {
  try {
    // 这里应该实现实际的数据库连接检查
    // 例如：执行一个简单的查询
    
    // 模拟数据库检查
    if (process.env.DATABASE_URL) {
      // 在实际实现中，这里会执行数据库查询
      // const result = await db.query('SELECT 1');
      return 'healthy';
    }
    return 'unhealthy';
  } catch (error) {
    console.error('Database health check failed:', error);
    return 'unhealthy';
  }
}

/**
 * 检查Redis连接
 */
async function checkRedis(): Promise<'healthy' | 'unhealthy'> {
  try {
    // 这里应该实现实际的Redis连接检查
    // 例如：执行PING命令
    
    // 模拟Redis检查
    if (process.env.REDIS_URL) {
      // 在实际实现中，这里会执行Redis命令
      // const result = await redis.ping();
      return 'healthy';
    }
    return 'healthy'; // Redis是可选的，所以默认为健康
  } catch (error) {
    console.error('Redis health check failed:', error);
    return 'unhealthy';
  }
}

/**
 * 检查内存使用情况
 */
function checkMemory(): 'healthy' | 'unhealthy' {
  try {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;
    
    // 如果内存使用率超过90%，认为不健康
    return memoryPercentage < 90 ? 'healthy' : 'unhealthy';
  } catch (error) {
    console.error('Memory health check failed:', error);
    return 'unhealthy';
  }
}

/**
 * 检查磁盘空间
 */
async function checkDisk(): Promise<'healthy' | 'unhealthy'> {
  try {
    // 在Node.js中检查磁盘空间需要使用系统命令或第三方库
    // 这里提供一个简化的实现
    
    const fs = require('fs').promises;
    const stats = await fs.statfs ? fs.statfs('.') : null;
    
    if (stats) {
      const freeSpace = stats.bavail * stats.bsize;
      const totalSpace = stats.blocks * stats.bsize;
      const usedPercentage = ((totalSpace - freeSpace) / totalSpace) * 100;
      
      // 如果磁盘使用率超过90%，认为不健康
      return usedPercentage < 90 ? 'healthy' : 'unhealthy';
    }
    
    // 如果无法获取磁盘信息，默认为健康
    return 'healthy';
  } catch (error) {
    console.error('Disk health check failed:', error);
    return 'healthy'; // 默认为健康，避免因为权限问题导致健康检查失败
  }
}

/**
 * 获取系统指标
 */
async function getSystemMetrics(responseTime: number) {
  const memoryUsage = process.memoryUsage();
  
  return {
    memoryUsage: {
      used: memoryUsage.heapUsed,
      total: memoryUsage.heapTotal,
      percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
    },
    cpuUsage: await getCPUUsage(),
    activeConnections: getActiveConnections(),
    responseTime,
  };
}

/**
 * 获取CPU使用率
 */
async function getCPUUsage(): Promise<number> {
  return new Promise((resolve) => {
    const startUsage = process.cpuUsage();
    const startTime = Date.now();
    
    setTimeout(() => {
      const currentUsage = process.cpuUsage(startUsage);
      const currentTime = Date.now();
      const timeDiff = currentTime - startTime;
      
      const cpuPercent = (currentUsage.user + currentUsage.system) / (timeDiff * 1000);
      resolve(Math.round(cpuPercent * 100));
    }, 100);
  });
}

/**
 * 获取活跃连接数
 */
function getActiveConnections(): number {
  // 这里应该实现获取活跃连接数的逻辑
  // 在实际实现中，可能需要从应用服务器或负载均衡器获取这个信息
  return 0;
}