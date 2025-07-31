/**
 * 用户登出API接口
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, SessionManager } from '@/lib/auth';

interface LogoutResponse {
  success: boolean;
  message: string;
}

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponse>,
  user
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    // 获取会话ID
    const sessionId = req.cookies.session_id;
    
    if (sessionId) {
      // 销毁会话
      SessionManager.destroySession(sessionId);
    }

    // 清除Cookie
    res.setHeader('Set-Cookie', [
      'auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
      'session_id=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
    ]);

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});