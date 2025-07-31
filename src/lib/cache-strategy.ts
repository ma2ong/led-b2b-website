/**
 * 缓存策略工具
 */

// 缓存配置类型
interface CacheConfig {
  ttl?: number; // 生存时间（毫秒）
  maxSize?: number; // 最大缓存大小
  strategy?: 'lru' | 'fifo' | 'lfu'; // 缓存策略
  storage?: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  compress?: boolean; // 是否压缩数据
}

// 缓存项类型
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl?: number;
  accessCount?: number;
  lastAccessed?: number;
}

// 内存缓存类
class MemoryCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      ttl: config.ttl || 5 * 60 * 1000, // 默认5分钟
      maxSize: config.maxSize || 100,
      strategy: config.strategy || 'lru',
      storage: 'memory',
      compress: config.compress || false,
    };
  }

  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const item: CacheItem<T> = {
      data: value,
      timestamp: now,
      ttl: ttl || this.config.ttl,
      accessCount: 0,
      lastAccessed: now,
    };

    // 检查缓存大小限制
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, item);
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    
    // 检查是否过期
    if (item.ttl && now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // 更新访问统计
    item.accessCount = (item.accessCount || 0) + 1;
    item.lastAccessed = now;

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // 缓存淘汰策略
  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string;

    switch (this.config.strategy) {
      case 'lru': // 最近最少使用
        keyToEvict = this.findLRUKey();
        break;
      case 'lfu': // 最少使用频率
        keyToEvict = this.findLFUKey();
        break;
      case 'fifo': // 先进先出
      default:
        keyToEvict = this.cache.keys().next().value;
        break;
    }

    this.cache.delete(keyToEvict);
  }

  private findLRUKey(): string {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if ((item.lastAccessed || 0) < oldestTime) {
        oldestTime = item.lastAccessed || 0;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private findLFUKey(): string {
    let leastUsedKey = '';
    let leastCount = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if ((item.accessCount || 0) < leastCount) {
        leastCount = item.accessCount || 0;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }
}

// 持久化缓存类
class PersistentCache<T> {
  private storage: Storage;
  private prefix: string;
  private config: CacheConfig;

  constructor(storage: Storage, prefix = 'cache_', config: CacheConfig = {}) {
    this.storage = storage;
    this.prefix = prefix;
    this.config = config;
  }

  set(key: string, value: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
    };

    try {
      const serialized = this.config.compress 
        ? this.compress(JSON.stringify(item))
        : JSON.stringify(item);
      
      this.storage.setItem(this.prefix + key, serialized);
    } catch (error) {
      console.warn('Failed to cache item:', error);
    }
  }

  get(key: string): T | null {
    try {
      const serialized = this.storage.getItem(this.prefix + key);
      if (!serialized) return null;

      const item: CacheItem<T> = JSON.parse(
        this.config.compress ? this.decompress(serialized) : serialized
      );

      // 检查是否过期
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.delete(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('Failed to retrieve cached item:', error);
      return null;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    try {
      this.storage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.warn('Failed to delete cached item:', error);
      return false;
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(this.storage).filter(key => 
        key.startsWith(this.prefix)
      );
      keys.forEach(key => this.storage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  // 简单的压缩/解压缩（实际项目中可以使用更好的压缩算法）
  private compress(data: string): string {
    return btoa(data);
  }

  private decompress(data: string): string {
    return atob(data);
  }
}

// IndexedDB缓存类
class IndexedDBCache<T> {
  private dbName: string;
  private storeName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName = 'AppCache', storeName = 'cache', version = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.db) await this.init();

    const item = {
      key,
      data: value,
      timestamp: Date.now(),
      ttl,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get(key: string): Promise<T | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const item = request.result;
        if (!item) {
          resolve(null);
          return;
        }

        // 检查是否过期
        if (item.ttl && Date.now() - item.timestamp > item.ttl) {
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(item.data);
      };
    });
  }

  async delete(key: string): Promise<boolean> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// 缓存管理器
export class CacheManager {
  private caches = new Map<string, any>();

  createCache<T>(name: string, config: CacheConfig = {}): MemoryCache<T> | PersistentCache<T> | IndexedDBCache<T> {
    let cache: any;

    switch (config.storage) {
      case 'localStorage':
        if (typeof window !== 'undefined' && window.localStorage) {
          cache = new PersistentCache<T>(localStorage, `${name}_`, config);
        } else {
          cache = new MemoryCache<T>(config);
        }
        break;
      case 'sessionStorage':
        if (typeof window !== 'undefined' && window.sessionStorage) {
          cache = new PersistentCache<T>(sessionStorage, `${name}_`, config);
        } else {
          cache = new MemoryCache<T>(config);
        }
        break;
      case 'indexedDB':
        if (typeof window !== 'undefined' && window.indexedDB) {
          cache = new IndexedDBCache<T>(`${name}_db`, name);
        } else {
          cache = new MemoryCache<T>(config);
        }
        break;
      case 'memory':
      default:
        cache = new MemoryCache<T>(config);
        break;
    }

    this.caches.set(name, cache);
    return cache;
  }

  getCache<T>(name: string): MemoryCache<T> | PersistentCache<T> | IndexedDBCache<T> | null {
    return this.caches.get(name) || null;
  }

  clearAll(): void {
    this.caches.forEach(cache => {
      if (cache.clear) {
        cache.clear();
      }
    });
  }
}

// 单例缓存管理器
const cacheManager = new CacheManager();

// 预定义的缓存实例
export const apiCache = cacheManager.createCache('api', {
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 50,
  strategy: 'lru',
  storage: 'memory',
});

export const imageCache = cacheManager.createCache('images', {
  ttl: 30 * 60 * 1000, // 30分钟
  maxSize: 100,
  strategy: 'lru',
  storage: 'localStorage',
});

export const userDataCache = cacheManager.createCache('userData', {
  ttl: 24 * 60 * 60 * 1000, // 24小时
  maxSize: 20,
  strategy: 'lfu',
  storage: 'localStorage',
});

// 缓存装饰器
export function cached<T extends (...args: any[]) => any>(
  cacheInstance: MemoryCache<ReturnType<T>>,
  keyGenerator?: (...args: Parameters<T>) => string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: Parameters<T>): ReturnType<T> {
      const key = keyGenerator ? keyGenerator(...args) : `${propertyName}_${JSON.stringify(args)}`;
      
      // 尝试从缓存获取
      const cached = cacheInstance.get(key);
      if (cached !== null) {
        return cached;
      }

      // 执行原方法并缓存结果
      const result = method.apply(this, args);
      cacheInstance.set(key, result);
      
      return result;
    };
  };
}

// HTTP缓存头工具
export const setCacheHeaders = (res: any, maxAge: number, sMaxAge?: number) => {
  res.setHeader('Cache-Control', `public, max-age=${maxAge}${sMaxAge ? `, s-maxage=${sMaxAge}` : ''}`);
  res.setHeader('Expires', new Date(Date.now() + maxAge * 1000).toUTCString());
};

// 缓存失效工具
export const invalidateCache = (pattern: string) => {
  // 失效内存缓存
  if (apiCache instanceof MemoryCache) {
    // 这里需要扩展MemoryCache类来支持模式匹配删除
  }

  // 失效localStorage缓存
  if (typeof window !== 'undefined') {
    const keys = Object.keys(localStorage).filter(key => key.includes(pattern));
    keys.forEach(key => localStorage.removeItem(key));
  }
};

export { cacheManager };