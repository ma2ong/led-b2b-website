/**
 * 安全防护和数据保护工具
 */
import { NextApiRequest, NextApiResponse } from 'next';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import { createHash, randomBytes } from 'crypto';

// CSRF Token管理
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number }>();

  /**
   * 生成CSRF令牌
   */
  static generateToken(sessionId: string): string {
    const token = randomBytes(32).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1小时过期
    
    this.tokens.set(sessionId, { token, expires });
    return token;
  }

  /**
   * 验证CSRF令牌
   */
  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    
    if (!stored) {
      return false;
    }

    if (Date.now() > stored.expires) {
      this.tokens.delete(sessionId);
      return false;
    }

    return stored.token === token;
  }

  /**
   * 清理过期令牌
   */
  static cleanup(): void {
    const now = Date.now();
    for (const [sessionId, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

// 输入验证和清理
export class InputSanitizer {
  /**
   * HTML转义
   */
  static escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
      '/': '&#x2F;',
    };

    return text.replace(/[&<>"'/]/g, (s) => map[s]);
  }

  /**
   * SQL注入防护 - 清理SQL输入
   */
  static sanitizeSqlInput(input: string): string {
    // 移除或转义危险字符
    return input
      .replace(/['";\\]/g, '') // 移除引号和反斜杠
      .replace(/--/g, '') // 移除SQL注释
      .replace(/\/\*/g, '') // 移除多行注释开始
      .replace(/\*\//g, '') // 移除多行注释结束
      .replace(/\bUNION\b/gi, '') // 移除UNION关键字
      .replace(/\bSELECT\b/gi, '') // 移除SELECT关键字
      .replace(/\bINSERT\b/gi, '') // 移除INSERT关键字
      .replace(/\bUPDATE\b/gi, '') // 移除UPDATE关键字
      .replace(/\bDELETE\b/gi, '') // 移除DELETE关键字
      .replace(/\bDROP\b/gi, ''); // 移除DROP关键字
  }

  /**
   * XSS防护 - 清理用户输入
   */
  static sanitizeUserInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // 移除script标签
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // 移除iframe标签
      .replace(/javascript:/gi, '') // 移除javascript协议
      .replace(/on\w+\s*=/gi, '') // 移除事件处理器
      .replace(/style\s*=/gi, '') // 移除style属性
      .trim();
  }

  /**
   * 验证邮箱格式
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * 验证URL格式
   */
  static validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * 验证文件名安全性
   */
  static validateFileName(fileName: string): boolean {
    // 检查危险字符和路径遍历
    const dangerousChars = /[<>:"|?*\x00-\x1f]/;
    const pathTraversal = /\.\./;
    
    return !dangerousChars.test(fileName) && 
           !pathTraversal.test(fileName) && 
           fileName.length > 0 && 
           fileName.length <= 255;
  }
}

// 速率限制配置
export const createRateLimit = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// 慢速攻击防护
export const createSlowDown = (options: {
  windowMs: number;
  delayAfter: number;
  delayMs: number;
}) => {
  return slowDown({
    windowMs: options.windowMs,
    delayAfter: options.delayAfter,
    delayMs: options.delayMs,
  });
};

// 安全头配置
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

// IP地址获取和验证
export class IPUtils {
  /**
   * 获取客户端真实IP
   */
  static getClientIP(req: NextApiRequest): string {
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const remoteAddress = req.connection.remoteAddress || req.socket.remoteAddress;

    if (forwarded) {
      return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    }

    if (realIP) {
      return Array.isArray(realIP) ? realIP[0] : realIP;
    }

    return remoteAddress || 'unknown';
  }

  /**
   * 验证IP是否在白名单中
   */
  static isIPWhitelisted(ip: string, whitelist: string[]): boolean {
    return whitelist.includes(ip);
  }

  /**
   * 验证IP是否在黑名单中
   */
  static isIPBlacklisted(ip: string, blacklist: string[]): boolean {
    return blacklist.includes(ip);
  }
}

// 数据加密工具
export class DataEncryption {
  private static readonly algorithm = 'aes-256-gcm';
  private static readonly keyLength = 32;

  /**
   * 生成加密密钥
   */
  static generateKey(): string {
    return randomBytes(this.keyLength).toString('hex');
  }

  /**
   * 加密数据
   */
  static encrypt(text: string, key: string): string {
    const keyBuffer = Buffer.from(key, 'hex');
    const iv = randomBytes(16);
    const cipher = require('crypto').createCipher(this.algorithm, keyBuffer);
    
    cipher.setAAD(Buffer.from('additional-data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted,
      authTag: authTag.toString('hex'),
    });
  }

  /**
   * 解密数据
   */
  static decrypt(encryptedData: string, key: string): string {
    const keyBuffer = Buffer.from(key, 'hex');
    const data = JSON.parse(encryptedData);
    
    const decipher = require('crypto').createDecipher(this.algorithm, keyBuffer);
    decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
    decipher.setAAD(Buffer.from('additional-data'));
    
    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * 哈希敏感数据
   */
  static hashSensitiveData(data: string, salt?: string): string {
    const saltToUse = salt || randomBytes(16).toString('hex');
    const hash = createHash('sha256');
    hash.update(data + saltToUse);
    return hash.digest('hex') + ':' + saltToUse;
  }

  /**
   * 验证哈希数据
   */
  static verifyHashedData(data: string, hashedData: string): boolean {
    const [hash, salt] = hashedData.split(':');
    const newHash = this.hashSensitiveData(data, salt).split(':')[0];
    return hash === newHash;
  }
}

// 审计日志
export class AuditLogger {
  private static logs: Array<{
    timestamp: Date;
    userId?: string;
    action: string;
    resource: string;
    ip: string;
    userAgent?: string;
    success: boolean;
    details?: any;
  }> = [];

  /**
   * 记录审计日志
   */
  static log(entry: {
    userId?: string;
    action: string;
    resource: string;
    ip: string;
    userAgent?: string;
    success: boolean;
    details?: any;
  }): void {
    this.logs.push({
      timestamp: new Date(),
      ...entry,
    });

    // 在生产环境中，这里应该写入到持久化存储
    console.log('Audit Log:', {
      timestamp: new Date().toISOString(),
      ...entry,
    });
  }

  /**
   * 获取审计日志
   */
  static getLogs(filter?: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): typeof this.logs {
    if (!filter) {
      return this.logs;
    }

    return this.logs.filter(log => {
      if (filter.userId && log.userId !== filter.userId) return false;
      if (filter.action && log.action !== filter.action) return false;
      if (filter.startDate && log.timestamp < filter.startDate) return false;
      if (filter.endDate && log.timestamp > filter.endDate) return false;
      return true;
    });
  }

  /**
   * 清理旧日志
   */
  static cleanup(olderThan: Date): void {
    this.logs = this.logs.filter(log => log.timestamp > olderThan);
  }
}

// 安全中间件
export function withSecurity(options?: {
  rateLimit?: { windowMs: number; max: number };
  csrfProtection?: boolean;
  ipWhitelist?: string[];
  ipBlacklist?: string[];
}) {
  return function(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const clientIP = IPUtils.getClientIP(req);

        // IP黑名单检查
        if (options?.ipBlacklist && IPUtils.isIPBlacklisted(clientIP, options.ipBlacklist)) {
          AuditLogger.log({
            action: 'BLOCKED_IP',
            resource: req.url || '',
            ip: clientIP,
            userAgent: req.headers['user-agent'],
            success: false,
            details: { reason: 'IP in blacklist' },
          });
          return res.status(403).json({ error: 'Access denied' });
        }

        // IP白名单检查
        if (options?.ipWhitelist && !IPUtils.isIPWhitelisted(clientIP, options.ipWhitelist)) {
          AuditLogger.log({
            action: 'BLOCKED_IP',
            resource: req.url || '',
            ip: clientIP,
            userAgent: req.headers['user-agent'],
            success: false,
            details: { reason: 'IP not in whitelist' },
          });
          return res.status(403).json({ error: 'Access denied' });
        }

        // CSRF保护
        if (options?.csrfProtection && ['POST', 'PUT', 'DELETE'].includes(req.method || '')) {
          const csrfToken = req.headers['x-csrf-token'] as string;
          const sessionId = req.cookies.session_id;

          if (!sessionId || !csrfToken || !CSRFProtection.validateToken(sessionId, csrfToken)) {
            AuditLogger.log({
              action: 'CSRF_VIOLATION',
              resource: req.url || '',
              ip: clientIP,
              userAgent: req.headers['user-agent'],
              success: false,
            });
            return res.status(403).json({ error: 'CSRF token validation failed' });
          }
        }

        return handler(req, res);
      } catch (error) {
        console.error('Security middleware error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    };
  };
}

// 数据脱敏工具
export class DataMasking {
  /**
   * 脱敏邮箱地址
   */
  static maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (username.length <= 2) {
      return `${username[0]}***@${domain}`;
    }
    return `${username.substring(0, 2)}***@${domain}`;
  }

  /**
   * 脱敏手机号码
   */
  static maskPhone(phone: string): string {
    if (phone.length <= 4) {
      return '***';
    }
    return phone.substring(0, 3) + '***' + phone.substring(phone.length - 2);
  }

  /**
   * 脱敏身份证号
   */
  static maskIdCard(idCard: string): string {
    if (idCard.length <= 8) {
      return '***';
    }
    return idCard.substring(0, 4) + '***' + idCard.substring(idCard.length - 4);
  }

  /**
   * 脱敏银行卡号
   */
  static maskBankCard(cardNumber: string): string {
    if (cardNumber.length <= 8) {
      return '***';
    }
    return cardNumber.substring(0, 4) + '***' + cardNumber.substring(cardNumber.length - 4);
  }

  /**
   * 脱敏IP地址
   */
  static maskIP(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.***.`;
    }
    return '***';
  }
}

// 定期清理任务
if (typeof window === 'undefined') {
  // 每小时清理过期的CSRF令牌
  setInterval(() => {
    CSRFProtection.cleanup();
  }, 60 * 60 * 1000);

  // 每天清理30天前的审计日志
  setInterval(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    AuditLogger.cleanup(thirtyDaysAgo);
  }, 24 * 60 * 60 * 1000);
}