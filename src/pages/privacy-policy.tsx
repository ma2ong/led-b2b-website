/**
 * 隐私政策页面
 */
import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  ShieldCheckIcon,
  EyeIcon,
  LockClosedIcon,
  DocumentTextIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { SEOHead } from '@/components/seo/SEOHead';

export default function PrivacyPolicy() {
  const { t } = useTranslation('privacy');

  const sections = [
    {
      id: 'information-collection',
      title: t('informationCollection'),
      icon: DocumentTextIcon,
      content: t('informationCollectionContent'),
    },
    {
      id: 'information-use',
      title: t('informationUse'),
      icon: EyeIcon,
      content: t('informationUseContent'),
    },
    {
      id: 'information-sharing',
      title: t('informationSharing'),
      icon: UserGroupIcon,
      content: t('informationSharingContent'),
    },
    {
      id: 'data-security',
      title: t('dataSecurity'),
      icon: LockClosedIcon,
      content: t('dataSecurityContent'),
    },
    {
      id: 'cookies',
      title: t('cookiesAndTracking'),
      icon: GlobeAltIcon,
      content: t('cookiesAndTrackingContent'),
    },
    {
      id: 'your-rights',
      title: t('yourRights'),
      icon: ShieldCheckIcon,
      content: t('yourRightsContent'),
    },
  ];

  return (
    <>
      <SEOHead
        title={t('privacyPolicyTitle')}
        description={t('privacyPolicyDescription')}
        canonical="/privacy-policy"
      />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('privacyPolicy')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('privacyPolicyIntro')}
            </p>
            <p className="text-sm text-gray-500 mt-4">
              {t('lastUpdated')}: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('tableOfContents')}
            </h2>
            <nav className="space-y-2">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span className="text-sm font-medium mr-2">
                    {index + 1}.
                  </span>
                  <section.icon className="w-4 h-4 mr-2" />
                  {section.title}
                </a>
              ))}
            </nav>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
              >
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg mr-4">
                    <section.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {index + 1}. {section.title}
                  </h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                </div>
              </section>
            ))}
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-lg p-8 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('contactUs')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('privacyContactInfo')}
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>{t('email')}:</strong> privacy@ledtech.com
              </p>
              <p>
                <strong>{t('address')}:</strong> 123 LED Technology Street, Tech City, TC 12345
              </p>
              <p>
                <strong>{t('phone')}:</strong> +1 (555) 123-4567
              </p>
            </div>
          </div>

          {/* GDPR Rights */}
          <div className="bg-green-50 rounded-lg p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('gdprRights')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('gdprRightsIntro')}
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                <span>{t('rightToAccess')}</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                <span>{t('rightToRectification')}</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                <span>{t('rightToErasure')}</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                <span>{t('rightToRestriction')}</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                <span>{t('rightToPortability')}</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                <span>{t('rightToObject')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['privacy', 'common'])),
    },
  };
};