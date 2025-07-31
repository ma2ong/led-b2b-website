/**
 * Translation Management Utilities
 * 翻译文件管理工具
 */
import fs from 'fs';
import path from 'path';
import { SupportedLocale, SUPPORTED_LOCALES } from './i18n';
import { TRANSLATION_NAMESPACES, TranslationNamespace } from './i18n-config';

export interface TranslationKey {
  key: string;
  namespace: TranslationNamespace;
  locale: SupportedLocale;
  value: string;
  context?: string;
  description?: string;
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

export class TranslationManager {
  private localesPath: string;

  constructor(localesPath: string = './public/locales') {
    this.localesPath = localesPath;
  }

  /**
   * Get translation file path
   */
  private getTranslationFilePath(locale: SupportedLocale, namespace: TranslationNamespace): string {
    return path.join(this.localesPath, locale, `${namespace}.json`);
  }

  /**
   * Load translation file
   */
  async loadTranslationFile(locale: SupportedLocale, namespace: TranslationNamespace): Promise<Record<string, any>> {
    try {
      const filePath = this.getTranslationFilePath(locale, namespace);
      const content = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(`Failed to load translation file: ${locale}/${namespace}.json`);
      return {};
    }
  }

  /**
   * Save translation file
   */
  async saveTranslationFile(
    locale: SupportedLocale, 
    namespace: TranslationNamespace, 
    translations: Record<string, any>
  ): Promise<void> {
    try {
      const filePath = this.getTranslationFilePath(locale, namespace);
      const dir = path.dirname(filePath);
      
      // Ensure directory exists
      await fs.promises.mkdir(dir, { recursive: true });
      
      // Sort keys for consistent output
      const sortedTranslations = this.sortObjectKeys(translations);
      
      await fs.promises.writeFile(
        filePath, 
        JSON.stringify(sortedTranslations, null, 2) + '\n',
        'utf-8'
      );
    } catch (error) {
      throw new Error(`Failed to save translation file: ${locale}/${namespace}.json - ${error}`);
    }
  }

  /**
   * Get all translation keys from an object (nested)
   */
  private getKeysFromObject(obj: Record<string, any>, prefix: string = ''): string[] {
    const keys: string[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...this.getKeysFromObject(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    
    return keys;
  }

  /**
   * Get value from nested object using dot notation
   */
  private getNestedValue(obj: Record<string, any>, key: string): any {
    return key.split('.').reduce((current, part) => current?.[part], obj);
  }

  /**
   * Set value in nested object using dot notation
   */
  private setNestedValue(obj: Record<string, any>, key: string, value: any): void {
    const parts = key.split('.');
    const lastPart = parts.pop()!;
    const target = parts.reduce((current, part) => {
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      return current[part];
    }, obj);
    
    target[lastPart] = value;
  }

  /**
   * Sort object keys recursively
   */
  private sortObjectKeys(obj: Record<string, any>): Record<string, any> {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return obj;
    }

    const sorted: Record<string, any> = {};
    const keys = Object.keys(obj).sort();
    
    for (const key of keys) {
      sorted[key] = this.sortObjectKeys(obj[key]);
    }
    
    return sorted;
  }

  /**
   * Get translation statistics for a locale and namespace
   */
  async getTranslationStats(locale: SupportedLocale, namespace: TranslationNamespace): Promise<TranslationStats> {
    const translations = await this.loadTranslationFile(locale, namespace);
    const referenceTranslations = await this.loadTranslationFile('en', namespace); // Use English as reference
    
    const allKeys = this.getKeysFromObject(referenceTranslations);
    const translatedKeys = allKeys.filter(key => {
      const value = this.getNestedValue(translations, key);
      return value !== undefined && value !== null && value !== '';
    });
    
    const missingKeys = allKeys.filter(key => {
      const value = this.getNestedValue(translations, key);
      return value === undefined || value === null || value === '';
    });

    return {
      locale,
      namespace,
      totalKeys: allKeys.length,
      translatedKeys: translatedKeys.length,
      missingKeys,
      completionPercentage: allKeys.length > 0 ? (translatedKeys.length / allKeys.length) * 100 : 0,
    };
  }

  /**
   * Get all missing translations across locales
   */
  async getAllMissingTranslations(): Promise<MissingTranslation[]> {
    const missingTranslations: MissingTranslation[] = [];
    const referenceLocale: SupportedLocale = 'en';

    for (const namespace of TRANSLATION_NAMESPACES) {
      const referenceTranslations = await this.loadTranslationFile(referenceLocale, namespace);
      const allKeys = this.getKeysFromObject(referenceTranslations);

      for (const key of allKeys) {
        const missingLocales: SupportedLocale[] = [];
        const referenceValue = this.getNestedValue(referenceTranslations, key);

        for (const locale of SUPPORTED_LOCALES) {
          if (locale === referenceLocale) continue;

          const translations = await this.loadTranslationFile(locale, namespace);
          const value = this.getNestedValue(translations, key);

          if (value === undefined || value === null || value === '') {
            missingLocales.push(locale);
          }
        }

        if (missingLocales.length > 0) {
          missingTranslations.push({
            key,
            namespace,
            missingLocales,
            referenceValue: typeof referenceValue === 'string' ? referenceValue : JSON.stringify(referenceValue),
          });
        }
      }
    }

    return missingTranslations;
  }

  /**
   * Add or update a translation key
   */
  async setTranslation(
    locale: SupportedLocale,
    namespace: TranslationNamespace,
    key: string,
    value: string
  ): Promise<void> {
    const translations = await this.loadTranslationFile(locale, namespace);
    this.setNestedValue(translations, key, value);
    await this.saveTranslationFile(locale, namespace, translations);
  }

  /**
   * Remove a translation key
   */
  async removeTranslation(
    locale: SupportedLocale,
    namespace: TranslationNamespace,
    key: string
  ): Promise<void> {
    const translations = await this.loadTranslationFile(locale, namespace);
    
    const parts = key.split('.');
    const lastPart = parts.pop()!;
    const target = parts.reduce((current, part) => current?.[part], translations);
    
    if (target && typeof target === 'object') {
      delete target[lastPart];
      await this.saveTranslationFile(locale, namespace, translations);
    }
  }

  /**
   * Search translations by key or value
   */
  async searchTranslations(
    query: string,
    locale?: SupportedLocale,
    namespace?: TranslationNamespace
  ): Promise<TranslationKey[]> {
    const results: TranslationKey[] = [];
    const searchLocales = locale ? [locale] : SUPPORTED_LOCALES;
    const searchNamespaces = namespace ? [namespace] : TRANSLATION_NAMESPACES;

    for (const searchLocale of searchLocales) {
      for (const searchNamespace of searchNamespaces) {
        const translations = await this.loadTranslationFile(searchLocale, searchNamespace);
        const keys = this.getKeysFromObject(translations);

        for (const key of keys) {
          const value = this.getNestedValue(translations, key);
          const valueStr = typeof value === 'string' ? value : JSON.stringify(value);

          if (
            key.toLowerCase().includes(query.toLowerCase()) ||
            valueStr.toLowerCase().includes(query.toLowerCase())
          ) {
            results.push({
              key,
              namespace: searchNamespace,
              locale: searchLocale,
              value: valueStr,
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * Validate translation files
   */
  async validateTranslations(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const locale of SUPPORTED_LOCALES) {
      for (const namespace of TRANSLATION_NAMESPACES) {
        try {
          const translations = await this.loadTranslationFile(locale, namespace);
          
          // Check for empty values
          const keys = this.getKeysFromObject(translations);
          for (const key of keys) {
            const value = this.getNestedValue(translations, key);
            if (value === '' || value === null || value === undefined) {
              warnings.push(`Empty value for key "${key}" in ${locale}/${namespace}.json`);
            }
          }

          // Check for invalid JSON structure
          if (typeof translations !== 'object' || translations === null) {
            errors.push(`Invalid JSON structure in ${locale}/${namespace}.json`);
          }

        } catch (error) {
          errors.push(`Failed to validate ${locale}/${namespace}.json: ${error}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Export translations to different formats
   */
  async exportTranslations(
    format: 'json' | 'csv' | 'xlsx',
    locale?: SupportedLocale,
    namespace?: TranslationNamespace
  ): Promise<string | Buffer> {
    const exportData: TranslationKey[] = [];
    const exportLocales = locale ? [locale] : SUPPORTED_LOCALES;
    const exportNamespaces = namespace ? [namespace] : TRANSLATION_NAMESPACES;

    for (const exportLocale of exportLocales) {
      for (const exportNamespace of exportNamespaces) {
        const translations = await this.loadTranslationFile(exportLocale, exportNamespace);
        const keys = this.getKeysFromObject(translations);

        for (const key of keys) {
          const value = this.getNestedValue(translations, key);
          exportData.push({
            key,
            namespace: exportNamespace,
            locale: exportLocale,
            value: typeof value === 'string' ? value : JSON.stringify(value),
          });
        }
      }
    }

    switch (format) {
      case 'json':
        return JSON.stringify(exportData, null, 2);
      
      case 'csv':
        const csvHeader = 'Key,Namespace,Locale,Value\n';
        const csvRows = exportData.map(item => 
          `"${item.key}","${item.namespace}","${item.locale}","${item.value.replace(/"/g, '""')}"`
        ).join('\n');
        return csvHeader + csvRows;
      
      case 'xlsx':
        // This would require a library like 'xlsx' to implement
        throw new Error('XLSX export not implemented yet');
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Import translations from different formats
   */
  async importTranslations(
    data: string | Buffer,
    format: 'json' | 'csv',
    overwrite: boolean = false
  ): Promise<void> {
    let importData: TranslationKey[] = [];

    switch (format) {
      case 'json':
        importData = JSON.parse(data.toString());
        break;
      
      case 'csv':
        const lines = data.toString().split('\n');
        const header = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= 4) {
            importData.push({
              key: values[0].replace(/"/g, ''),
              namespace: values[1].replace(/"/g, '') as TranslationNamespace,
              locale: values[2].replace(/"/g, '') as SupportedLocale,
              value: values[3].replace(/"/g, ''),
            });
          }
        }
        break;
      
      default:
        throw new Error(`Unsupported import format: ${format}`);
    }

    // Group by locale and namespace
    const grouped: Record<string, Record<string, Record<string, string>>> = {};
    
    for (const item of importData) {
      if (!grouped[item.locale]) {
        grouped[item.locale] = {};
      }
      if (!grouped[item.locale][item.namespace]) {
        grouped[item.locale][item.namespace] = {};
      }
      grouped[item.locale][item.namespace][item.key] = item.value;
    }

    // Save translations
    for (const [locale, namespaces] of Object.entries(grouped)) {
      for (const [namespace, translations] of Object.entries(namespaces)) {
        if (!overwrite) {
          const existing = await this.loadTranslationFile(locale as SupportedLocale, namespace as TranslationNamespace);
          Object.assign(existing, translations);
          await this.saveTranslationFile(locale as SupportedLocale, namespace as TranslationNamespace, existing);
        } else {
          await this.saveTranslationFile(locale as SupportedLocale, namespace as TranslationNamespace, translations);
        }
      }
    }
  }
}

// Default instance
export const translationManager = new TranslationManager();

// Utility functions
export const getTranslationStats = (locale: SupportedLocale, namespace: TranslationNamespace) =>
  translationManager.getTranslationStats(locale, namespace);

export const getAllMissingTranslations = () =>
  translationManager.getAllMissingTranslations();

export const searchTranslations = (query: string, locale?: SupportedLocale, namespace?: TranslationNamespace) =>
  translationManager.searchTranslations(query, locale, namespace);

export const validateTranslations = () =>
  translationManager.validateTranslations();

export const exportTranslations = (format: 'json' | 'csv' | 'xlsx', locale?: SupportedLocale, namespace?: TranslationNamespace) =>
  translationManager.exportTranslations(format, locale, namespace);

export default TranslationManager;