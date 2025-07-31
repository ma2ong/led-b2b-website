/**
 * 产品对比功能Hook
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Product } from '@/types/product';

const COMPARISON_STORAGE_KEY = 'product-comparison';
const MAX_COMPARISON_PRODUCTS = 3;

interface UseProductComparisonReturn {
  comparisonProducts: Product[];
  isInComparison: (productId: string) => boolean;
  addToComparison: (product: Product) => boolean;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  toggleComparison: (product: Product) => boolean;
  canAddMore: boolean;
  comparisonCount: number;
  goToComparison: () => void;
  isComparisonEmpty: boolean;
  getComparisonUrl: () => string;
}

export const useProductComparison = (): UseProductComparisonReturn => {
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const router = useRouter();

  // 从localStorage加载对比产品
  useEffect(() => {
    const loadComparisonProducts = () => {
      try {
        const stored = localStorage.getItem(COMPARISON_STORAGE_KEY);
        if (stored) {
          const products = JSON.parse(stored);
          if (Array.isArray(products)) {
            setComparisonProducts(products.slice(0, MAX_COMPARISON_PRODUCTS));
          }
        }
      } catch (error) {
        console.error('Error loading comparison products:', error);
        localStorage.removeItem(COMPARISON_STORAGE_KEY);
      }
    };

    loadComparisonProducts();
  }, []);

  // 保存到localStorage
  const saveToStorage = useCallback((products: Product[]) => {
    try {
      localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error('Error saving comparison products:', error);
    }
  }, []);

  // 检查产品是否在对比列表中
  const isInComparison = useCallback((productId: string): boolean => {
    return comparisonProducts.some(product => product.id === productId);
  }, [comparisonProducts]);

  // 添加产品到对比列表
  const addToComparison = useCallback((product: Product): boolean => {
    if (comparisonProducts.length >= MAX_COMPARISON_PRODUCTS) {
      return false; // 已达到最大数量
    }

    if (isInComparison(product.id)) {
      return false; // 产品已在对比列表中
    }

    const newProducts = [...comparisonProducts, product];
    setComparisonProducts(newProducts);
    saveToStorage(newProducts);
    return true;
  }, [comparisonProducts, isInComparison, saveToStorage]);

  // 从对比列表中移除产品
  const removeFromComparison = useCallback((productId: string): void => {
    const newProducts = comparisonProducts.filter(product => product.id !== productId);
    setComparisonProducts(newProducts);
    saveToStorage(newProducts);
  }, [comparisonProducts, saveToStorage]);

  // 清空对比列表
  const clearComparison = useCallback((): void => {
    setComparisonProducts([]);
    localStorage.removeItem(COMPARISON_STORAGE_KEY);
  }, []);

  // 切换产品在对比列表中的状态
  const toggleComparison = useCallback((product: Product): boolean => {
    if (isInComparison(product.id)) {
      removeFromComparison(product.id);
      return false;
    } else {
      return addToComparison(product);
    }
  }, [isInComparison, addToComparison, removeFromComparison]);

  // 跳转到对比页面
  const goToComparison = useCallback((): void => {
    if (comparisonProducts.length > 0) {
      const productIds = comparisonProducts.map(p => p.id).join(',');
      router.push(`/products/compare?products=${productIds}`);
    }
  }, [comparisonProducts, router]);

  // 获取对比页面URL
  const getComparisonUrl = useCallback((): string => {
    if (comparisonProducts.length === 0) return '/products/compare';
    const productIds = comparisonProducts.map(p => p.id).join(',');
    return `/products/compare?products=${productIds}`;
  }, [comparisonProducts]);

  return {
    comparisonProducts,
    isInComparison,
    addToComparison,
    removeFromComparison,
    clearComparison,
    toggleComparison,
    canAddMore: comparisonProducts.length < MAX_COMPARISON_PRODUCTS,
    comparisonCount: comparisonProducts.length,
    goToComparison,
    isComparisonEmpty: comparisonProducts.length === 0,
    getComparisonUrl,
  };
};

// 对比产品选择器Hook
export const useComparisonSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const openSelector = useCallback(() => setIsOpen(true), []);
  const closeSelector = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setSelectedCategory('');
  }, []);

  return {
    isOpen,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    openSelector,
    closeSelector,
  };
};

// 对比通知Hook
export const useComparisonNotifications = () => {
  const [notifications, setNotifications] = useState<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: number;
  }[]>([]);

  const addNotification = useCallback((
    type: 'success' | 'error' | 'info',
    message: string
  ) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now(),
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // 自动移除通知
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };
};

export default useProductComparison;