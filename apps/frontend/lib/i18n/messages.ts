import type { Locale } from '@/i18n/config';

import en from '@/messages/en.json';

export type Messages = typeof en;

export function getMessages(_locale: Locale): Messages {
  return en;
}
