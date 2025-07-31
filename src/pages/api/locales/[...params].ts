import { NextApiRequest, NextApiResponse } from 'next';
import { translationManager } from '@/lib/translation-manager';
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/i18n';
import { TranslationNamespace, TRANSLATION_NAMESPACES } from '@/lib/i18n-config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { params } = req.query;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  if (!Array.isArray(params) || params.length !== 2) {
    return res.status(400).json({ error: 'Invalid URL format. Expected: /api/locales/{locale}/{namespace}' });
  }

  const [locale, namespace] = params;

  // Validate locale
  if (!SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
    return res.status(400).json({ error: `Unsupported locale: ${locale}` });
  }

  // Validate namespace
  if (!TRANSLATION_NAMESPACES.includes(namespace as TranslationNamespace)) {
    return res.status(400).json({ error: `Unsupported namespace: ${namespace}` });
  }

  try {
    const translations = await translationManager.loadTranslationFile(
      locale as SupportedLocale,
      namespace as TranslationNamespace
    );

    // Set cache headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).json(translations);
  } catch (error) {
    console.error(`Failed to load translation file: ${locale}/${namespace}`, error);
    return res.status(404).json({ error: 'Translation file not found' });
  }
}