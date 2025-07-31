import { NextApiRequest, NextApiResponse } from 'next';
import { translationManager } from '@/lib/translation-manager';
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/i18n';
import { TranslationNamespace, TRANSLATION_NAMESPACES } from '@/lib/i18n-config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGet(req, res);
        break;
      case 'POST':
        await handlePost(req, res);
        break;
      case 'PUT':
        await handlePut(req, res);
        break;
      case 'DELETE':
        await handleDelete(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Translation API error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { action, locale, namespace, query } = req.query;

  switch (action) {
    case 'search':
      if (typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required for search' });
      }
      const searchResults = await translationManager.searchTranslations(
        query,
        locale as SupportedLocale,
        namespace as TranslationNamespace
      );
      return res.status(200).json({ results: searchResults });

    case 'stats':
      if (!locale || !namespace) {
        return res.status(400).json({ error: 'Locale and namespace are required for stats' });
      }
      if (!SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
        return res.status(400).json({ error: 'Invalid locale' });
      }
      if (!TRANSLATION_NAMESPACES.includes(namespace as TranslationNamespace)) {
        return res.status(400).json({ error: 'Invalid namespace' });
      }
      
      const stats = await translationManager.getTranslationStats(
        locale as SupportedLocale,
        namespace as TranslationNamespace
      );
      return res.status(200).json(stats);

    case 'missing':
      const missingTranslations = await translationManager.getAllMissingTranslations();
      return res.status(200).json({ missing: missingTranslations });

    case 'validate':
      const validation = await translationManager.validateTranslations();
      return res.status(200).json(validation);

    case 'export':
      const { format = 'json' } = req.query;
      if (!['json', 'csv'].includes(format as string)) {
        return res.status(400).json({ error: 'Invalid export format' });
      }
      
      const exportData = await translationManager.exportTranslations(
        format as 'json' | 'csv',
        locale as SupportedLocale,
        namespace as TranslationNamespace
      );
      
      const filename = `translations_${locale || 'all'}_${namespace || 'all'}.${format}`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
      return res.status(200).send(exportData);

    case 'load':
      if (!locale || !namespace) {
        return res.status(400).json({ error: 'Locale and namespace are required' });
      }
      
      const translations = await translationManager.loadTranslationFile(
        locale as SupportedLocale,
        namespace as TranslationNamespace
      );
      return res.status(200).json({ translations });

    default:
      // Return all supported locales and namespaces
      return res.status(200).json({
        locales: SUPPORTED_LOCALES,
        namespaces: TRANSLATION_NAMESPACES,
      });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;
  const { locale, namespace, key, value } = req.body;

  if (action === 'import') {
    const { data, format, overwrite = false } = req.body;
    
    if (!data || !format) {
      return res.status(400).json({ error: 'Data and format are required for import' });
    }
    
    if (!['json', 'csv'].includes(format)) {
      return res.status(400).json({ error: 'Invalid import format' });
    }
    
    await translationManager.importTranslations(data, format, overwrite);
    return res.status(200).json({ message: 'Translations imported successfully' });
  }

  // Add new translation
  if (!locale || !namespace || !key || value === undefined) {
    return res.status(400).json({ error: 'Locale, namespace, key, and value are required' });
  }

  if (!SUPPORTED_LOCALES.includes(locale)) {
    return res.status(400).json({ error: 'Invalid locale' });
  }

  if (!TRANSLATION_NAMESPACES.includes(namespace)) {
    return res.status(400).json({ error: 'Invalid namespace' });
  }

  await translationManager.setTranslation(locale, namespace, key, value);
  res.status(201).json({ message: 'Translation added successfully' });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { locale, namespace, key, value } = req.body;

  if (!locale || !namespace || !key || value === undefined) {
    return res.status(400).json({ error: 'Locale, namespace, key, and value are required' });
  }

  if (!SUPPORTED_LOCALES.includes(locale)) {
    return res.status(400).json({ error: 'Invalid locale' });
  }

  if (!TRANSLATION_NAMESPACES.includes(namespace)) {
    return res.status(400).json({ error: 'Invalid namespace' });
  }

  await translationManager.setTranslation(locale, namespace, key, value);
  res.status(200).json({ message: 'Translation updated successfully' });
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { locale, namespace, key } = req.body;

  if (!locale || !namespace || !key) {
    return res.status(400).json({ error: 'Locale, namespace, and key are required' });
  }

  if (!SUPPORTED_LOCALES.includes(locale)) {
    return res.status(400).json({ error: 'Invalid locale' });
  }

  if (!TRANSLATION_NAMESPACES.includes(namespace)) {
    return res.status(400).json({ error: 'Invalid namespace' });
  }

  await translationManager.removeTranslation(locale, namespace, key);
  res.status(200).json({ message: 'Translation deleted successfully' });
}