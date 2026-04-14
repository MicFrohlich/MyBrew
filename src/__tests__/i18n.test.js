import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '../lib/i18n.js';

describe('i18n', () => {
  beforeEach(() => { localStorage.clear(); });

  it('defaults to English LTR', async () => {
    await i18n.changeLanguage('en');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('switches to Hebrew RTL when language changes', async () => {
    await i18n.changeLanguage('he');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.documentElement.getAttribute('lang')).toBe('he');
  });

  it('translates a known key in Hebrew', async () => {
    await i18n.changeLanguage('he');
    expect(i18n.t('auth.signIn')).toBe('התחברות');
  });
});
