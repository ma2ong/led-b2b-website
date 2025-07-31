/**
 * 预算计算器组件
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { 
  CalculatorIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Input, Select } from '@/components/ui/FormComponents';
import { LocalizedPrice } from '@/components/i18n/LocalizedNumber';

interface BudgetCalculatorProps {
  requirements: {
    screenSize?: {
      width: number;
      height: number;
      unit: string;
    };
    quantity?: number;
    pixelPitch?: string;
    installationEnvironment?: string;
    application?: string;
  };
  onBudgetCalculated?: (budget: BudgetEstimate) => void;
  className?: string;
}

interface BudgetEstimate {
  displayCost: number;
  installationCost: number;
  additionalCosts: number;
  totalCost: number;
  currency: string;
  breakdown: {
    category: string;
    amount: number;
    description: string;
  }[];
  assumptions: string[];
}

const BudgetCalculator: React.FC<BudgetCalculatorProps> = ({
  requirements,
  onBudgetCalculated,
  className
}) => {
  const { t } = useTranslation('forms');
  const [estimate, setEstimate] = useState<BudgetEstimate | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [installationType, setInstallationType] = useState('standard');
  const [includeExtras, setIncludeExtras] = useState({
    mounting: true,
    cabling: true,
    controlSystem: true,
    maintenance: false,
    training: false,
  });

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CNY', label: 'CNY (¥)' },
    { value: 'JPY', label: 'JPY (¥)' },
  ];

  const installationTypeOptions = [
    { value: 'standard', label: t('standardInstallation') },
    { value: 'complex', label: t('complexInstallation') },
    { value: 'custom', label: t('customInstallation') },
  ];

  useEffect(() => {
    if (requirements.screenSize && requirements.quantity) {
      calculateBudget();
    }
  }, [requirements, currency, installationType, includeExtras]);

  const calculateBudget = () => {
    if (!requirements.screenSize || !requirements.quantity) return;

    const { width, height, unit } = requirements.screenSize;
    const quantity = requirements.quantity;

    // 转换为平方米
    let areaPerScreen = width * height;
    switch (unit) {
      case 'mm':
        areaPerScreen = areaPerScreen / 1000000;
        break;
      case 'cm':
        areaPerScreen = areaPerScreen / 10000;
        break;
      case 'inch':
        areaPerScreen = areaPerScreen * 0.00064516;
        break;
      case 'ft':
        areaPerScreen = areaPerScreen * 0.092903;
        break;
      case 'm':
      default:
        // 已经是平方米
        break;
    }

    const totalArea = areaPerScreen * quantity;

    // 基础显示屏成本计算
    const pixelPitchMultiplier = getPixelPitchMultiplier(requirements.pixelPitch);
    const environmentMultiplier = getEnvironmentMultiplier(requirements.installationEnvironment);
    const applicationMultiplier = getApplicationMultiplier(requirements.application);

    const baseCostPerSqm = 1000; // 基础成本 USD/m²
    const displayCost = totalArea * baseCostPerSqm * pixelPitchMultiplier * environmentMultiplier * applicationMultiplier;

    // 安装成本计算
    const installationMultiplier = getInstallationMultiplier(installationType);
    const installationCost = displayCost * 0.2 * installationMultiplier;

    // 附加成本计算
    let additionalCosts = 0;
    const breakdown: BudgetEstimate['breakdown'] = [];

    if (includeExtras.mounting) {
      const mountingCost = displayCost * 0.1;
      additionalCosts += mountingCost;
      breakdown.push({
        category: t('mountingSystem'),
        amount: mountingCost,
        description: t('mountingSystemDesc'),
      });
    }

    if (includeExtras.cabling) {
      const cablingCost = displayCost * 0.05;
      additionalCosts += cablingCost;
      breakdown.push({
        category: t('cablingSystem'),
        amount: cablingCost,
        description: t('cablingSystemDesc'),
      });
    }

    if (includeExtras.controlSystem) {
      const controlCost = Math.max(displayCost * 0.15, 5000);
      additionalCosts += controlCost;
      breakdown.push({
        category: t('controlSystem'),
        amount: controlCost,
        description: t('controlSystemDesc'),
      });
    }

    if (includeExtras.maintenance) {
      const maintenanceCost = displayCost * 0.1;
      additionalCosts += maintenanceCost;
      breakdown.push({
        category: t('maintenancePackage'),
        amount: maintenanceCost,
        description: t('maintenancePackageDesc'),
      });
    }

    if (includeExtras.training) {
      const trainingCost = 2000;
      additionalCosts += trainingCost;
      breakdown.push({
        category: t('trainingService'),
        amount: trainingCost,
        description: t('trainingServiceDesc'),
      });
    }

    // 添加主要成本项目
    breakdown.unshift(
      {
        category: t('displayPanels'),
        amount: displayCost,
        description: t('displayPanelsDesc'),
      },
      {
        category: t('installation'),
        amount: installationCost,
        description: t('installationDesc'),
      }
    );

    const totalCost = displayCost + installationCost + additionalCosts;

    // 转换货币
    const convertedEstimate = convertCurrency({
      displayCost,
      installationCost,
      additionalCosts,
      totalCost,
      currency,
      breakdown,
      assumptions: generateAssumptions(),
    }, currency);

    setEstimate(convertedEstimate);
    onBudgetCalculated?.(convertedEstimate);
  };

  const getPixelPitchMultiplier = (pixelPitch?: string): number => {
    if (!pixelPitch) return 1;
    
    const pitch = parseFloat(pixelPitch.replace('P', ''));
    if (pitch <= 1.5) return 2.5;
    if (pitch <= 2.5) return 1.8;
    if (pitch <= 4) return 1.2;
    if (pitch <= 6) return 1;
    return 0.8;
  };

  const getEnvironmentMultiplier = (environment?: string): number => {
    switch (environment) {
      case 'outdoor':
        return 1.5;
      case 'semi_outdoor':
        return 1.3;
      case 'indoor':
      default:
        return 1;
    }
  };

  const getApplicationMultiplier = (application?: string): number => {
    if (!application) return 1;
    
    const app = application.toLowerCase();
    if (app.includes('broadcast') || app.includes('studio')) return 1.8;
    if (app.includes('sports') || app.includes('stadium')) return 1.4;
    if (app.includes('retail') || app.includes('mall')) return 1.2;
    return 1;
  };

  const getInstallationMultiplier = (type: string): number => {
    switch (type) {
      case 'complex':
        return 1.5;
      case 'custom':
        return 2;
      case 'standard':
      default:
        return 1;
    }
  };

  const convertCurrency = (estimate: BudgetEstimate, targetCurrency: string): BudgetEstimate => {
    // 简化的货币转换（实际应用中应使用实时汇率）
    const exchangeRates: { [key: string]: number } = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      CNY: 7.2,
      JPY: 110,
    };

    const rate = exchangeRates[targetCurrency] || 1;
    
    return {
      ...estimate,
      displayCost: estimate.displayCost * rate,
      installationCost: estimate.installationCost * rate,
      additionalCosts: estimate.additionalCosts * rate,
      totalCost: estimate.totalCost * rate,
      currency: targetCurrency,
      breakdown: estimate.breakdown.map(item => ({
        ...item,
        amount: item.amount * rate,
      })),
    };
  };

  const generateAssumptions = (): string[] => {
    return [
      t('assumptionStandardQuality'),
      t('assumptionNormalInstallation'),
      t('assumptionBasicWarranty'),
      t('assumptionCurrentPrices'),
      t('assumptionNoCustomization'),
    ];
  };

  if (!estimate) {
    return (
      <div className={cn('bg-white rounded-lg shadow-lg p-6', className)}>
        <div className="flex items-center mb-4">
          <CalculatorIcon className="w-6 h-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t('budgetCalculator')}
          </h3>
        </div>
        <div className="text-center py-8">
          <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {t('provideSizeAndQuantity')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
        <div className="flex items-center">
          <CalculatorIcon className="w-6 h-6 text-white mr-2" />
          <h3 className="text-lg font-semibold text-white">
            {t('budgetEstimate')}
          </h3>
        </div>
        <p className="text-green-100 text-sm mt-1">
          {t('estimateBasedOnRequirements')}
        </p>
      </div>

      {/* Configuration */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select
            label={t('currency')}
            options={currencyOptions}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
          <Select
            label={t('installationType')}
            options={installationTypeOptions}
            value={installationType}
            onChange={(e) => setInstallationType(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('includeAdditionalItems')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(includeExtras).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setIncludeExtras(prev => ({
                    ...prev,
                    [key]: e.target.checked
                  }))}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {t(key)}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Total Cost */}
      <div className="p-6 bg-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                {t('estimatedTotalCost')}
              </h4>
              <p className="text-sm text-gray-600">
                {t('includesAllSelectedItems')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">
              <LocalizedPrice
                value={estimate.totalCost}
                currency={estimate.currency}
              />
            </div>
            <p className="text-sm text-gray-600">
              {t('approximateEstimate')}
            </p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="p-6">
        <div className="flex items-center mb-4">
          <ChartBarIcon className="w-5 h-5 text-gray-600 mr-2" />
          <h4 className="text-lg font-semibold text-gray-900">
            {t('costBreakdown')}
          </h4>
        </div>

        <div className="space-y-3">
          {estimate.breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{item.category}</h5>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <div className="text-right ml-4">
                <div className="font-semibold text-gray-900">
                  <LocalizedPrice
                    value={item.amount}
                    currency={estimate.currency}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  {((item.amount / estimate.totalCost) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assumptions */}
      <div className="p-6 bg-gray-50">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          {t('estimateAssumptions')}
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {estimate.assumptions.map((assumption, index) => (
            <li key={index} className="flex items-start">
              <span className="text-gray-400 mr-2">•</span>
              {assumption}
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          {t('contactForAccurateQuote')}
        </p>
      </div>
    </div>
  );
};

export default BudgetCalculator;