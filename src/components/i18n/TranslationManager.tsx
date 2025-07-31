import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { 
  MagnifyingGlassIcon, 
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/i18n';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { cn } from '@/lib/utils';

interface TranslationManagerProps {
  className?: string;
}

const TranslationManager: React.FC<TranslationManagerProps> = ({ className }) => {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<'search' | 'stats' | 'missing'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale>('en');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const localeOptions = SUPPORTED_LOCALES.map(locale => ({
    value: locale,
    label: locale === 'en' ? 'English' : '中文',
  }));

  // 模拟搜索功能
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    
    // 模拟API调用
    setTimeout(() => {
      setSearchResults([
        {
          locale: selectedLocale,
          namespace: 'common',
          key: 'welcome',
          value: selectedLocale === 'en' ? 'Welcome' : '欢迎',
        },
        {
          locale: selectedLocale,
          namespace: 'navigation',
          key: 'home',
          value: selectedLocale === 'en' ? 'Home' : '首页',
        },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  const tabs = [
    { id: 'search', label: 'Search Translations', icon: MagnifyingGlassIcon },
    { id: 'stats', label: 'Statistics', icon: ChartBarIcon },
    { id: 'missing', label: 'Missing Translations', icon: ExclamationTriangleIcon },
  ];

  return (
    <div className={cn('bg-white rounded-lg shadow-lg', className)}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search translations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Select
                value={selectedLocale}
                onChange={(value) => setSelectedLocale(value as SupportedLocale)}
                options={localeOptions}
                className="w-32"
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading || !searchQuery.trim()}
                className="px-6"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">Search Results</h3>
                <div className="space-y-2">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                            <span className="font-medium">{result.locale}</span>
                            <span>•</span>
                            <span>{result.namespace}</span>
                            <span>•</span>
                            <span className="font-mono">{result.key}</span>
                          </div>
                          <p className="text-gray-900">{result.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Translation Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SUPPORTED_LOCALES.map((locale) => (
                <div key={locale} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    {locale === 'en' ? 'English' : '中文'}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Keys:</span>
                      <span className="text-sm font-medium">150</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Translated:</span>
                      <span className="text-sm font-medium text-green-600">145</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Missing:</span>
                      <span className="text-sm font-medium text-red-600">5</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Completion</span>
                        <span>96.7%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: '96.7%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Translations Tab */}
        {activeTab === 'missing' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Missing Translations</h3>
              <Button variant="outline" size="sm">
                Export Missing
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center space-x-2 mb-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-red-900">Chinese (zh)</span>
                  <span className="text-sm text-red-600">• common namespace</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-red-800 font-mono">welcome.subtitle</p>
                  <p className="text-sm text-red-800 font-mono">navigation.products.outdoor</p>
                  <p className="text-sm text-red-800 font-mono">forms.validation.required</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationManager;