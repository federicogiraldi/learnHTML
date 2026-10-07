import { useCallback, useEffect } from 'react';
import { useProgress } from '../store/progress';
import { translateMessage } from './messages';
import { strings, type Strings } from './strings';

export type Lang = 'en' | 'it';
export const langs: Lang[] = ['en', 'it'];

export function useLang(): Lang {
  return useProgress().lang ?? 'en';
}

export function useStrings(): Strings {
  return strings[useLang()];
}

/** Translates a check or validator message (they are written in English) into the current language. */
export function useTranslateMessage() {
  const lang = useLang();
  return useCallback((msg: string) => translateMessage(msg, lang), [lang]);
}

/** Keeps <html lang> in step with the chosen language. */
export function useDocumentLang() {
  const lang = useLang();
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
}
