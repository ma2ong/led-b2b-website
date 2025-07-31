/**
 * Currency Converter Component
 * 货币转换组件
 */
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { LocalizedNumber } from './LocalizedNumber';

// 汇率数据接口
interface ExchangeRates {
  [currency: string]: number;
}

// 支持的货币列表
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
];

// 根据地区获取默认货币
function getDefaultCurrency(locale: string): string {
  const currencyMap: { [key: string]: string } = {
    'en': 'USD',
    'zh': 'CNY',
    'ja': 'JPY',
    'ko': 'KRW',
    'de': 'EUR',
    'fr': 'EUR',
    'es': 'EUR',
    'it': 'EUR',
    'pt': 'EUR',
    'ru': 'USD', // 使用USD作为默认
    'ar': 'USD',
  };
  
  return currencyMap[locale] || 'USD';
}

export interface CurrencyConverterProps {
  baseAmount: number;
  baseCurrency?: string;
  targetCurrency?: string;
  showConverter?: boolean;
  className?: string;
}

export function CurrencyConverter({
  baseAmount,
  baseCurrency = 'USD',
  targetCurrency,
  showConverter = false,
  className,
}: CurrencyConverterProps) {
  const router = useRouter();
  const locale = router.locale || 'en';
  
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    targetCurrency || getDefaultCurrency(locale)
  );
  
  // 获取汇率数据
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 在实际应用中，这里会调用真实的汇率API
        // 例如：https://api.exchangerate-api.com/v4/latest/USD
        const mockRates: ExchangeRates = {
          USD: 1,
          EUR: 0.85,
          GBP: 0.73,
          JPY: 110,
          CNY: 6.45,
          KRW: 1180,
          AUD: 1.35,
          CAD: 1.25,
          CHF: 0.92,
          SEK: 8.5,
        };
        
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setExchangeRates(mockRates);
      } catch (err) {
        setError('Failed to fetch exchange rates');
        console.error('Exchange rate fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExchangeRates();
    
    // 每小时更新一次汇率
    const interval = setInterval(fetchExchangeRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  // 计算转换后的金额
  const convertedAmount = useMemo(() => {
    if (!exchangeRates[baseCurrency] || !exchangeRates[selectedCurrency]) {
      return baseAmount;
    }
    
    // 先转换为USD基准，再转换为目标货币
    const usdAmount = baseAmount / exchangeRates[baseCurrency];
    return usdAmount * exchangeRates[selectedCurrency];
  }, [baseAmount, baseCurrency, selectedCurrency, exchangeRates]);
  
  // 获取货币符号
  const getCurrencySymbol = (currencyCode: string) => {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  };
  
  if (loading) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <LocalizedNumber
        value={baseAmount}
        style="currency"
        currency={baseCurrency}
        className={className}
      />
    );
  }
  
  if (!showConverter) {
    return (
      <LocalizedNumber
        value={convertedAmount}
        style="currency"
        currency={selectedCurrency}
        className={className}
      />
    );
  }
  
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <LocalizedNumber
        value={convertedAmount}
        style="currency"
        currency={selectedCurrency}
      />
      
      <select
        value={selectedCurrency}
        onChange={(e) => setSelectedCurrency(e.target.value)}
        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
      >
        {SUPPORTED_CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code}
          </option>
        ))}
      </select>
      
      {baseCurrency !== selectedCurrency && (
        <span className="text-sm text-gray-500">
          (≈ {getCurrencySymbol(baseCurrency)}{baseAmount.toLocaleString()})
        </span>
      )}
    </div>
  );
}

/**
 * 简单的价格显示组件，自动根据用户地区显示合适的货币
 */
export function SmartPrice({
  amount,
  baseCurrency = 'USD',
  className,
}: {
  amount: number;
  baseCurrency?: string;
  className?: string;
}) {
  const router = useRouter();
  const locale = router.locale || 'en';
  const targetCurrency = getDefaultCurrency(locale);
  
  return (
    <CurrencyConverter
      baseAmount={amount}
      baseCurrency={baseCurrency}
      targetCurrency={targetCurrency}
      className={className}
    />
  );
}

/**
 * 价格范围显示组件
 */
export function PriceRange({
  minAmount,
  maxAmount,
  baseCurrency = 'USD',
  className,
}: {
  minAmount: number;
  maxAmount: number;
  baseCurrency?: string;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <SmartPrice amount={minAmount} baseCurrency={baseCurrency} />
      <span className="text-gray-500">-</span>
      <SmartPrice amount={maxAmount} baseCurrency={baseCurrency} />
    </div>
  );
}

/**
 * 货币选择器组件
 */
export function CurrencySelector({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (currency: string) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border border-gray-300 rounded px-3 py-2 bg-white ${className}`}
    >
      {SUPPORTED_CURRENCIES.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.symbol} {currency.code} - {currency.name}
        </option>
      ))}
    </select>
  );
}

export default CurrencyConverter;