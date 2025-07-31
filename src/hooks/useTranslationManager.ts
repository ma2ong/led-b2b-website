import { useState, useEffect, useCallback } from 'react';
import { SupportedLocale } from '@/lib/i18n';
import { TranslationNamespace } from '@/lib/i18n-config';

export interface TranslationKey {
  key: string;
  namespace: TranslationNamespace;
  locale: SupportedLocale;
  value: string;
}

export interface TranslationStats {
  locale: SupportedLocale;
  namespace: TranslationNamespace;
  totalKeys: number;
  translatedKeys: number;
  missingKeys: string[];
  completionPercentage: number;
}

export interface MissingTranslation {
  key: string;
  namespace: TranslationNamespace;
  missingLocales: SupportedLocale[];
  referenceValue?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function useTranslationManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/translations${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchTranslations = useCallback(async (
    query: string,
    locale?: SupportedLocale,
    namespace?: TranslationNamespace
  ): Promise<TranslationKey[]> => {
    const params = new URLSearchParams({ action: 'search', query });
    if (locale) params.append('locale', locale);
    if (namespace) params.append('namespace', namespace);

    const result = await apiCall(`?${params.toString()}`);
    return result.results;
  }, [apiCall]);

  const getTranslationStats = useCallback(async (
    locale: SupportedLocale,
    namespace: TranslationNamespace
  ): Promise<TranslationStats> => {
    const params = new URLSearchParams({
      action: 'stats',
      locale,
      namespace,
    });

    return await apiCall(`?${params.toString()}`);
  }, [apiCall]);

  const getAllMissingTranslations = useCallback(async (): Promise<MissingTranslation[]> => {
    const result = await apiCall('?action=missing');
    return result.missing;
  }, [apiCall]);

  const validateTranslations = useCallback(async (): Promise<ValidationResult> => {
    return await apiCall('?action=validate');
  }, [apiCall]);

  const loadTranslations = useCallback(async (
    locale: SupportedLocale,
    namespace: TranslationNamespace
  ): Promise<Record<string, any>> => {
    const params = new URLSearchParams({
      action: 'load',
      locale,
      namespace,
    });

    const result = await apiCall(`?${params.toString()}`);
    return result.translations;
  }, [apiCall]);

  const addTranslation = useCallback(async (
    locale: SupportedLocale,
    namespace: TranslationNamespace,
    key: string,
    value: string
  ): Promise<void> => {
    await apiCall('', {
      method: 'POST',
      body: JSON.stringify({ locale, namespace, key, value }),
    });
  }, [apiCall]);

  const updateTranslation = useCallback(async (
    locale: SupportedLocale,
    namespace: TranslationNamespace,
    key: string,
    value: string
  ): Promise<void> => {
    await apiCall('', {
      method: 'PUT',
      body: JSON.stringify({ locale, namespace, key, value }),
    });
  }, [apiCall]);

  const deleteTranslation = useCallback(async (
    locale: SupportedLocale,
    namespace: TranslationNamespace,
    key: string
  ): Promise<void> => {
    await apiCall('', {
      method: 'DELETE',
      body: JSON.stringify({ locale, namespace, key }),
    });
  }, [apiCall]);

  const exportTranslations = useCallback(async (
    format: 'json' | 'csv',
    locale?: SupportedLocale,
    namespace?: TranslationNamespace
  ): Promise<Blob> => {
    const params = new URLSearchParams({ action: 'export', format });
    if (locale) params.append('locale', locale);
    if (namespace) params.append('namespace', namespace);

    const response = await fetch(`/api/translations?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return await response.blob();
  }, []);

  const importTranslations = useCallback(async (
    data: string,
    format: 'json' | 'csv',
    overwrite: boolean = false
  ): Promise<void> => {
    await apiCall('?action=import', {
      method: 'POST',
      body: JSON.stringify({ data, format, overwrite }),
    });
  }, [apiCall]);

  return {
    isLoading,
    error,
    searchTranslations,
    getTranslationStats,
    getAllMissingTranslations,
    validateTranslations,
    loadTranslations,
    addTranslation,
    updateTranslation,
    deleteTranslation,
    exportTranslations,
    importTranslations,
  };
}

export function useTranslationStats(locale: SupportedLocale, namespace: TranslationNamespace) {
  const [stats, setStats] = useState<TranslationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getTranslationStats } = useTranslationManager();

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getTranslationStats(locale, namespace);
        setStats(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [locale, namespace, getTranslationStats]);

  return { stats, isLoading, error };
}

export function useMissingTranslations() {
  const [missingTranslations, setMissingTranslations] = useState<MissingTranslation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAllMissingTranslations } = useTranslationManager();

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getAllMissingTranslations();
      setMissingTranslations(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load missing translations');
    } finally {
      setIsLoading(false);
    }
  }, [getAllMissingTranslations]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { missingTranslations, isLoading, error, refresh };
}

export function useTranslationSearch() {
  const [results, setResults] = useState<TranslationKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { searchTranslations } = useTranslationManager();

  const search = useCallback(async (
    query: string,
    locale?: SupportedLocale,
    namespace?: TranslationNamespace
  ) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const searchResults = await searchTranslations(query, locale, namespace);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTranslations]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, isLoading, error, search, clearResults };
}

export function useTranslationValidation() {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { validateTranslations } = useTranslationManager();

  const validate = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await validateTranslations();
      setValidation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsLoading(false);
    }
  }, [validateTranslations]);

  return { validation, isLoading, error, validate };
}