import { t as ru } from './ru';
import { en } from './en';

export type Lang = 'ru' | 'en';
export type Dict = typeof ru;

const dicts: Record<Lang, Dict> = { ru, en: en as unknown as Dict };

export const languages: Record<Lang, string> = { ru: 'RU', en: 'EN' };

export function getLang(locale?: string): Lang {
  return locale === 'en' ? 'en' : 'ru';
}

/** Translations for the given locale (falls back to RU). */
export function useTranslations(locale?: string): Dict {
  return dicts[getLang(locale)];
}

/** Prefix an internal path with /en for English. RU stays at root. */
export function localizeUrl(path: string, locale?: string): string {
  if (getLang(locale) === 'ru') return path || '/';
  let p = path || '/';
  if (!p.startsWith('/')) p = '/' + p;
  return p === '/' ? '/en/' : '/en' + p;
}

/** RU/EN pluralization. ruForms = [one, few, many]; enForms = [one, other]. */
export function plural(
  locale: string | undefined,
  n: number,
  ruForms: [string, string, string],
  enForms: [string, string],
): string {
  if (getLang(locale) === 'en') return n === 1 ? enForms[0] : enForms[1];
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return ruForms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return ruForms[1];
  return ruForms[2];
}
