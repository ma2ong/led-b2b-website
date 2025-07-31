/**
 * 地理位置数据处理工具
 */
import { GeoLocation, CaseMapData } from '@/types/case-study';

// 地球半径（公里）
const EARTH_RADIUS_KM = 6371;

// 度数转弧度
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// 弧度转度数
const toDegrees = (radians: number): number => {
  return radians * (180 / Math.PI);
};

/**
 * 计算两点之间的距离（使用Haversine公式）
 */
export function calculateDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  const lat1Rad = toRadians(point1.latitude);
  const lat2Rad = toRadians(point2.latitude);
  const deltaLatRad = toRadians(point2.latitude - point1.latitude);
  const deltaLonRad = toRadians(point2.longitude - point1.longitude);

  const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return distance;
}

/**
 * 验证地理坐标是否有效
 */
export function isValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * 格式化坐标显示
 */
export function formatCoordinates(
  latitude: number,
  longitude: number,
  precision = 4
): string {
  if (!isValidCoordinates(latitude, longitude)) {
    return 'Invalid coordinates';
  }

  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';
  
  const latAbs = Math.abs(latitude).toFixed(precision);
  const lonAbs = Math.abs(longitude).toFixed(precision);

  return `${latAbs}°${latDir}, ${lonAbs}°${lonDir}`;
}

/**
 * 计算地理边界框
 */
export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
  center: { latitude: number; longitude: number };
}

export function calculateBoundingBox(
  points: { latitude: number; longitude: number }[]
): BoundingBox | null {
  if (!points || points.length === 0) {
    return null;
  }

  const validPoints = points.filter(p => isValidCoordinates(p.latitude, p.longitude));
  
  if (validPoints.length === 0) {
    return null;
  }

  let north = validPoints[0].latitude;
  let south = validPoints[0].latitude;
  let east = validPoints[0].longitude;
  let west = validPoints[0].longitude;

  validPoints.forEach(point => {
    north = Math.max(north, point.latitude);
    south = Math.min(south, point.latitude);
    east = Math.max(east, point.longitude);
    west = Math.min(west, point.longitude);
  });

  const center = {
    latitude: (north + south) / 2,
    longitude: (east + west) / 2
  };

  return { north, south, east, west, center };
}

/**
 * 检查点是否在边界框内
 */
export function isPointInBoundingBox(
  point: { latitude: number; longitude: number },
  boundingBox: BoundingBox
): boolean {
  if (!isValidCoordinates(point.latitude, point.longitude)) {
    return false;
  }

  return (
    point.latitude >= boundingBox.south &&
    point.latitude <= boundingBox.north &&
    point.longitude >= boundingBox.west &&
    point.longitude <= boundingBox.east
  );
}

/**
 * 根据距离筛选点
 */
export function filterPointsByDistance<T extends { latitude: number; longitude: number }>(
  points: T[],
  center: { latitude: number; longitude: number },
  maxDistanceKm: number
): T[] {
  if (!isValidCoordinates(center.latitude, center.longitude)) {
    return [];
  }

  return points.filter(point => {
    if (!isValidCoordinates(point.latitude, point.longitude)) {
      return false;
    }
    
    const distance = calculateDistance(center, point);
    return distance <= maxDistanceKm;
  });
}

/**
 * 按距离排序点
 */
export function sortPointsByDistance<T extends { latitude: number; longitude: number }>(
  points: T[],
  center: { latitude: number; longitude: number },
  ascending = true
): T[] {
  if (!isValidCoordinates(center.latitude, center.longitude)) {
    return points;
  }

  return [...points].sort((a, b) => {
    const distanceA = calculateDistance(center, a);
    const distanceB = calculateDistance(center, b);
    
    return ascending ? distanceA - distanceB : distanceB - distanceA;
  });
}

/**
 * 地理编码接口（将地址转换为坐标）
 */
export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  addressComponents: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  accuracy: 'exact' | 'approximate' | 'unknown';
}

/**
 * 模拟地理编码服务（在实际应用中会调用真实的地理编码API）
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!address || address.trim().length === 0) {
    return null;
  }

  try {
    // 在实际应用中，这里会调用真实的地理编码服务
    // 例如：Google Maps Geocoding API, MapBox Geocoding API等
    
    // 模拟一些常见地址的坐标
    const mockGeocodeData: { [key: string]: GeocodeResult } = {
      'times square, new york': {
        latitude: 40.7580,
        longitude: -73.9855,
        formattedAddress: '1560 Broadway, New York, NY 10036, USA',
        addressComponents: {
          street: '1560 Broadway',
          city: 'New York',
          state: 'NY',
          country: 'United States',
          postalCode: '10036'
        },
        accuracy: 'exact'
      },
      'beijing, china': {
        latitude: 39.9042,
        longitude: 116.4074,
        formattedAddress: 'Beijing, China',
        addressComponents: {
          city: 'Beijing',
          country: 'China'
        },
        accuracy: 'approximate'
      },
      'london, uk': {
        latitude: 51.5074,
        longitude: -0.1278,
        formattedAddress: 'London, UK',
        addressComponents: {
          city: 'London',
          country: 'United Kingdom'
        },
        accuracy: 'approximate'
      }
    };

    const normalizedAddress = address.toLowerCase().trim();
    const result = mockGeocodeData[normalizedAddress];
    
    if (result) {
      return result;
    }

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 如果没有找到匹配的地址，返回null
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * 反向地理编码（将坐标转换为地址）
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodeResult | null> {
  if (!isValidCoordinates(latitude, longitude)) {
    return null;
  }

  try {
    // 在实际应用中，这里会调用真实的反向地理编码服务
    
    // 模拟一些坐标的地址
    const mockReverseGeocodeData: { [key: string]: GeocodeResult } = {
      '40.7580,-73.9855': {
        latitude: 40.7580,
        longitude: -73.9855,
        formattedAddress: 'Times Square, New York, NY, USA',
        addressComponents: {
          street: 'Broadway',
          city: 'New York',
          state: 'NY',
          country: 'United States'
        },
        accuracy: 'exact'
      }
    };

    const coordKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const result = mockReverseGeocodeData[coordKey];
    
    if (result) {
      return result;
    }

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 生成一个通用的地址格式
    return {
      latitude,
      longitude,
      formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      addressComponents: {},
      accuracy: 'unknown'
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * 地图聚类算法（用于在地图上聚合相近的点）
 */
export interface ClusterPoint<T = any> {
  latitude: number;
  longitude: number;
  data: T;
}

export interface Cluster<T = any> {
  center: { latitude: number; longitude: number };
  points: ClusterPoint<T>[];
  count: number;
  bounds: BoundingBox;
}

export function clusterPoints<T>(
  points: ClusterPoint<T>[],
  maxDistanceKm = 50,
  minClusterSize = 2
): Cluster<T>[] {
  if (!points || points.length === 0) {
    return [];
  }

  const validPoints = points.filter(p => isValidCoordinates(p.latitude, p.longitude));
  const clusters: Cluster<T>[] = [];
  const processed = new Set<number>();

  validPoints.forEach((point, index) => {
    if (processed.has(index)) {
      return;
    }

    const clusterPoints: ClusterPoint<T>[] = [point];
    processed.add(index);

    // 查找相近的点
    validPoints.forEach((otherPoint, otherIndex) => {
      if (processed.has(otherIndex) || index === otherIndex) {
        return;
      }

      const distance = calculateDistance(point, otherPoint);
      if (distance <= maxDistanceKm) {
        clusterPoints.push(otherPoint);
        processed.add(otherIndex);
      }
    });

    // 只有达到最小聚类大小才创建聚类
    if (clusterPoints.length >= minClusterSize) {
      const boundingBox = calculateBoundingBox(clusterPoints);
      if (boundingBox) {
        clusters.push({
          center: boundingBox.center,
          points: clusterPoints,
          count: clusterPoints.length,
          bounds: boundingBox
        });
      }
    } else {
      // 单个点也作为聚类
      clusters.push({
        center: { latitude: point.latitude, longitude: point.longitude },
        points: clusterPoints,
        count: clusterPoints.length,
        bounds: {
          north: point.latitude,
          south: point.latitude,
          east: point.longitude,
          west: point.longitude,
          center: { latitude: point.latitude, longitude: point.longitude }
        }
      });
    }
  });

  return clusters;
}

/**
 * 生成地图URL（用于静态地图或地图链接）
 */
export interface MapUrlOptions {
  center?: { latitude: number; longitude: number };
  zoom?: number;
  width?: number;
  height?: number;
  markers?: {
    latitude: number;
    longitude: number;
    label?: string;
    color?: string;
  }[];
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
}

export function generateMapUrl(options: MapUrlOptions): string {
  const {
    center,
    zoom = 10,
    width = 600,
    height = 400,
    markers = [],
    mapType = 'roadmap'
  } = options;

  // 这里可以生成不同地图服务的URL
  // 例如：Google Maps Static API, MapBox Static API等
  
  const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
  const params = new URLSearchParams();
  
  params.set('size', `${width}x${height}`);
  params.set('maptype', mapType);
  params.set('zoom', zoom.toString());
  
  if (center && isValidCoordinates(center.latitude, center.longitude)) {
    params.set('center', `${center.latitude},${center.longitude}`);
  }
  
  markers.forEach((marker, index) => {
    if (isValidCoordinates(marker.latitude, marker.longitude)) {
      const markerStr = `color:${marker.color || 'red'}|label:${marker.label || (index + 1)}|${marker.latitude},${marker.longitude}`;
      params.append('markers', markerStr);
    }
  });
  
  // 注意：实际使用时需要添加API密钥
  // params.set('key', 'YOUR_API_KEY');
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * 计算地图的最佳缩放级别
 */
export function calculateOptimalZoom(
  points: { latitude: number; longitude: number }[],
  mapWidth: number,
  mapHeight: number
): number {
  if (!points || points.length === 0) {
    return 10; // 默认缩放级别
  }

  const boundingBox = calculateBoundingBox(points);
  if (!boundingBox) {
    return 10;
  }

  const latDiff = boundingBox.north - boundingBox.south;
  const lonDiff = boundingBox.east - boundingBox.west;
  
  // 简化的缩放级别计算
  const maxDiff = Math.max(latDiff, lonDiff);
  
  if (maxDiff > 10) return 3;
  if (maxDiff > 5) return 4;
  if (maxDiff > 2) return 5;
  if (maxDiff > 1) return 6;
  if (maxDiff > 0.5) return 7;
  if (maxDiff > 0.25) return 8;
  if (maxDiff > 0.125) return 9;
  if (maxDiff > 0.0625) return 10;
  if (maxDiff > 0.03125) return 11;
  if (maxDiff > 0.015625) return 12;
  
  return 13;
}

/**
 * 地理位置工具类
 */
export class GeoUtils {
  static distance = calculateDistance;
  static isValid = isValidCoordinates;
  static format = formatCoordinates;
  static boundingBox = calculateBoundingBox;
  static filterByDistance = filterPointsByDistance;
  static sortByDistance = sortPointsByDistance;
  static cluster = clusterPoints;
  static geocode = geocodeAddress;
  static reverseGeocode = reverseGeocode;
  static generateMapUrl = generateMapUrl;
  static calculateZoom = calculateOptimalZoom;
}

export default GeoUtils;