import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟用户数据
    setTimeout(() => {
      setUser({
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN'
      });
      setLoading(false);
    }, 1000);
  }, []);

  const login = async (email: string, password: string) => {
    return true;
  };

  const logout = async () => {
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout
  };
}