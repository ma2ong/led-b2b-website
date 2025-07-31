/**
 * 认证相关的React Hook
 */
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { User, UserRole, Permission } from '@/lib/auth';

// 认证上下文类型
interface AuthContextType {
  user: (Omit<User, 'id'> & { permissions: Permission[] }) | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<boolean>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  refreshUser: () => Promise<void>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 获取用户信息
  const fetchUser = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (data.success) {
        // 重新获取用户信息以获取权限
        await fetchUser();
        return true;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // 登出
  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/admin/login');
    }
  };

  // 修改密码
  const changePassword = async (
    currentPassword: string, 
    newPassword: string, 
    confirmPassword: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  };

  // 检查权限
  const hasPermission = (permission: Permission): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  // 检查角色
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  // 检查是否有任一权限
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  // 刷新用户信息
  const refreshUser = async (): Promise<void> => {
    await fetchUser();
  };

  // 初始化时获取用户信息
  useEffect(() => {
    fetchUser();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    changePassword,
    hasPermission,
    hasRole,
    hasAnyPermission,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 使用认证Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 需要认证的页面HOC
export function withAuthRequired<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermissions?: Permission[]
) {
  return function AuthRequiredComponent(props: P) {
    const { user, loading, hasAnyPermission } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push('/admin/login');
          return;
        }

        if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
          router.push('/admin/unauthorized');
          return;
        }
      }
    }, [user, loading, router, hasAnyPermission]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// 权限检查组件
interface PermissionGuardProps {
  permission?: Permission;
  permissions?: Permission[];
  role?: UserRole;
  roles?: UserRole[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  permission,
  permissions,
  role,
  roles,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { user, hasPermission, hasRole, hasAnyPermission } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  // 检查单个权限
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // 检查多个权限（需要任一权限）
  if (permissions && !hasAnyPermission(permissions)) {
    return <>{fallback}</>;
  }

  // 检查单个角色
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // 检查多个角色
  if (roles && !roles.some(r => hasRole(r))) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// 登录状态检查Hook
export function useRequireAuth(redirectTo = '/admin/login') {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading };
}

// 权限检查Hook
export function usePermission(permission: Permission) {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

// 角色检查Hook
export function useRole(role: UserRole) {
  const { hasRole } = useAuth();
  return hasRole(role);
}