/**
 * 用户登录API接口
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { 
  generateToken, 
  verifyPassword, 
  UserRole, 
  User,
  SessionManager 
} from '@/lib/auth';

// 模拟用户数据库
const MOCK_USERS = [
  {
    id: 'user_001',
    email: 'admin@ledtech.com',
    name: 'System Administrator',
    passwordHash: '$2a$12$LQv3c1yqBwEHFl5aBLEKVOEyIgCYkFxmtmQmJvvGOvRVKMMAKVK3O', // password: admin123!
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user_002',
    email: 'manager@ledtech.com',
    name: 'Product Manager',
    passwordHash: '$2a$12$LQv3c1yqBwEHFl5aBLEKVOEyIgCYkFxmtmQmJvvGOvRVKMMAKVK3O', // password: manager123!
    role: UserRole.MANAGER,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user_003',
    email: 'editor@ledtech.com',
    name: 'Content Editor',
    passwordHash: '$2a$12$LQv3c1yqBwEHFl5aBLEKVOEyIgCYkFxmtmQmJvvGOvRVKMMAKVK3O', // password: editor123!
    role: UserRole.EDITOR,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: Omit<User, 'id'>;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const { email, password, rememberMe }: LoginRequest = req.body;

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // 查找用户
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 检查用户是否激活
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 生成JWT令牌
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 创建会话
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const sessionId = SessionManager.createSession(
      user.id, 
      Array.isArray(clientIP) ? clientIP[0] : clientIP,
      userAgent
    );

    // 设置Cookie（如果选择记住我）
    if (rememberMe) {
      res.setHeader('Set-Cookie', [
        `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`, // 7天
        `session_id=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`,
      ]);
    } else {
      res.setHeader('Set-Cookie', [
        `auth_token=${token}; HttpOnly; Secure; SameSite=Strict`,
        `session_id=${sessionId}; HttpOnly; Secure; SameSite=Strict`,
      ]);
    }

    // 更新最后登录时间（在实际应用中应该更新数据库）
    user.updatedAt = new Date();

    // 返回成功响应
    return res.status(200).json({
      success: true,
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: new Date(),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      message: 'Login successful',
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}