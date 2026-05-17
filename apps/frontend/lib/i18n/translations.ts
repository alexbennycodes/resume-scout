'use client';

import { useState, useCallback } from 'react';
import en from '@/messages/en.json';
import { applyParams, getNestedValue } from './utils';

type Messages = typeof en;

const messages: Messages = en;

/**
 * Hook to get translations (English only)
 *
 * Usage:
 * const { t } = useTranslations();
 * <button>{t('common.save')}</button>
 */
export function useTranslations() {
  const [, forceUpdate] = useState(0);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const translation = getNestedValue(messages as unknown as Record<string, unknown>, key);
      return applyParams(translation, params);
    },
    []
  );

  return { t, messages, locale: 'en' as const };
}

/**
 * Get messages for a specific locale (for server components)
 */
export function getMessages(): Messages {
  return messages;
}

/**
 * Translate a key (always English)
 */
export function translate(
  _locale: string,
  key: string,
  params?: Record<string, string | number>
): string {
  const translation = getNestedValue(messages as unknown as Record<string, unknown>, key);
  return applyParams(translation, params);
}

export type { Messages };
