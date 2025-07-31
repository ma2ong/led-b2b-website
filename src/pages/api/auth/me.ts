/**
 * 获取当前用户信息API接口
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, User, Permission, hasPermission } from '@/lib/auth';

interface UserInfoResponse {
  success: boolean;
  user?: Omit<User, 'id'> & {
    permissions: Permission[];
  };
  message?: string;
}

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserInfoResponse>,
  user
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    // 获取用户权限列表
    const permissions = Object.values(Permission).filter(permission => 
      hasPermission(user.role, permission)
    );

    return res.status(200).json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        permissions,
      },
    });

  } catch (error) {
    console.error('Get user info error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});