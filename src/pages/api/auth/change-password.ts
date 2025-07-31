/**
 * 修改密码API接口
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { 
  withAuth, 
  verifyPassword, 
  hashPassword, 
  validatePasswordStrength,
  SessionManager 
} from '@/lib/auth';

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
  errors?: string[];
}

// 模拟用户数据库（实际应用中应该使用真实数据库）
const MOCK_USERS = new Map([
  ['user_001', {
    id: 'user_001',
    email: 'admin@ledtech.com',
    passwordHash: '$2a$12$LQv3c1yqBwEHFl5aBLEKVOEyIgCYkFxmtmQmJvvGOvRVKMMAKVK3O',
  }],
  ['user_002', {
    id: 'user_002',
    email: 'manager@ledtech.com',
    passwordHash: '$2a$12$LQv3c1yqBwEHFl5aBLEKVOEyIgCYkFxmtmQmJvvGOvRVKMMAKVK3O',
  }],
  ['user_003', {
    id: 'user_003',
    email: 'editor@ledtech.com',
    passwordHash: '$2a$12$LQv3c1yqBwEHFl5aBLEKVOEyIgCYkFxmtmQmJvvGOvRVKMMAKVK3O',
  }],
]);

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChangePasswordResponse>,
  user
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const { currentPassword, newPassword, confirmPassword }: ChangePasswordRequest = req.body;

    // 验证输入
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required',
      });
    }

    // 验证新密码确认
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match',
      });
    }

    // 验证新密码强度
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
      });
    }

    // 获取用户当前密码哈希
    const userData = MOCK_USERS.get(user.id);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // 验证当前密码
    const isCurrentPasswordValid = await verifyPassword(currentPassword, userData.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // 检查新密码是否与当前密码相同
    const isSamePassword = await verifyPassword(newPassword, userData.passwordHash);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      });
    }

    // 哈希新密码
    const newPasswordHash = await hashPassword(newPassword);

    // 更新密码（在实际应用中应该更新数据库）
    userData.passwordHash = newPasswordHash;

    // 销毁用户的所有其他会话（强制重新登录）
    SessionManager.destroyUserSessions(user.id);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});