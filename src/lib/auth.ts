/**
 * 用户认证和权限控制系统
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

// 用户角色定义
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

// 权限定义
export enum Permission {
  // 产品管理权限
  PRODUCT_CREATE = 'product:create',
  PRODUCT_READ = 'product:read',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',
  
  // 询盘管理权限
  INQUIRY_CREATE = 'inquiry:create',
  INQUIRY_READ = 'inquiry:read',
  INQUIRY_UPDATE = 'inquiry:update',
  INQUIRY_DELETE = 'inquiry:delete',
  
  // 用户管理权限
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // 系统管理权限
  SYSTEM_CONFIG = 'system:config',
  SYSTEM_LOGS = 'system:logs',
}

// 用户接口
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// JWT载荷接口
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// 角色权限映射
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // 管理员拥有所有权限
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_READ,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.INQUIRY_CREATE,
    Permission.INQUIRY_READ,
    Permission.INQUIRY_UPDATE,
    Permission.INQUIRY_DELETE,
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.SYSTEM_CONFIG,
    Permission.SYSTEM_LOGS,
  ],
  [UserRole.MANAGER]: [
    // 管理者权限
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_READ,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.INQUIRY_READ,
    Permission.INQUIRY_UPDATE,
    Permission.INQUIRY_DELETE,
    Permission.USER_READ,
    Permission.SYSTEM_LOGS,
  ],
  [UserRole.EDITOR]: [
    // 编辑者权限
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_READ,
    Permission.PRODUCT_UPDATE,
    Permission.INQUIRY_READ,
    Permission.INQUIRY_UPDATE,
  ],
  [UserRole.VIEWER]: [
    // 查看者权限
    Permission.PRODUCT_READ,
    Permission.INQUIRY_READ,
  ],
};

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * 生成JWT令牌
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * 验证JWT令牌
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * 哈希密码
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * 检查用户是否有特定权限
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.includes(permission);
}

/**
 * 检查用户是否有任一权限
 */
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * 检查用户是否有所有权限
 */
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * 从请求中提取JWT令牌
 */
export function extractTokenFromRequest(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 也可以从cookie中获取
  const tokenFromCookie = req.cookies.auth_token;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }
  
  return null;
}

/**
 * 认证中间件
 */
export function withAuth(handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = extractTokenFromRequest(req);
      
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const payload = verifyToken(token);
      
      if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      
      // 这里应该从数据库获取完整的用户信息
      // 为了演示，我们创建一个模拟用户
      const user: User = {
        id: payload.userId,
        email: payload.email,
        name: 'Admin User', // 实际应该从数据库获取
        role: payload.role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // 检查用户是否激活
      if (!user.isActive) {
        return res.status(403).json({ error: 'Account is deactivated' });
      }
      
      return handler(req, res, user);
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * 权限检查中间件
 */
export function withPermission(permission: Permission) {
  return function(handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>) {
    return withAuth(async (req: NextApiRequest, res: NextApiResponse, user: User) => {
      if (!hasPermission(user.role, permission)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      return handler(req, res, user);
    });
  };
}

/**
 * 多权限检查中间件（需要任一权限）
 */
export function withAnyPermission(permissions: Permission[]) {
  return function(handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>) {
    return withAuth(async (req: NextApiRequest, res: NextApiResponse, user: User) => {
      if (!hasAnyPermission(user.role, permissions)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      return handler(req, res, user);
    });
  };
}

/**
 * 角色检查中间件
 */
export function withRole(allowedRoles: UserRole[]) {
  return function(handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>) {
    return withAuth(async (req: NextApiRequest, res: NextApiResponse, user: User) => {
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient role permissions' });
      }
      
      return handler(req, res, user);
    });
  };
}

/**
 * 密码强度验证
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 生成安全的随机密码
 */
export function generateSecurePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*(),.?":{}|<>';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // 确保至少包含每种类型的字符
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // 填充剩余长度
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // 打乱密码字符顺序
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * 会话管理
 */
export class SessionManager {
  private static activeSessions = new Map<string, {
    userId: string;
    createdAt: Date;
    lastAccessAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }>();
  
  /**
   * 创建会话
   */
  static createSession(userId: string, ipAddress?: string, userAgent?: string): string {
    const sessionId = jwt.sign({ userId, type: 'session' }, JWT_SECRET);
    
    this.activeSessions.set(sessionId, {
      userId,
      createdAt: new Date(),
      lastAccessAt: new Date(),
      ipAddress,
      userAgent,
    });
    
    return sessionId;
  }
  
  /**
   * 验证会话
   */
  static validateSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      return false;
    }
    
    // 更新最后访问时间
    session.lastAccessAt = new Date();
    
    return true;
  }
  
  /**
   * 销毁会话
   */
  static destroySession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
  }
  
  /**
   * 销毁用户的所有会话
   */
  static destroyUserSessions(userId: string): void {
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.userId === userId) {
        this.activeSessions.delete(sessionId);
      }
    }
  }
  
  /**
   * 获取活跃会话数量
   */
  static getActiveSessionCount(): number {
    return this.activeSessions.size;
  }
  
  /**
   * 清理过期会话
   */
  static cleanupExpiredSessions(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24小时
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now.getTime() - session.lastAccessAt.getTime() > maxAge) {
        this.activeSessions.delete(sessionId);
      }
    }
  }
}

// 定期清理过期会话
if (typeof window === 'undefined') {
  setInterval(() => {
    SessionManager.cleanupExpiredSessions();
  }, 60 * 60 * 1000); // 每小时清理一次
}