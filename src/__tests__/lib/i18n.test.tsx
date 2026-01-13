import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, useI18n, useTranslation, LANGUAGES } from '@/lib/i18n';

// Test component to access i18n context
function TestComponent() {
  const { t, locale, setLocale, languages } = useI18n();

  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="translation">{t('common.loading')}</span>
      <span data-testid="language-count">{Object.keys(languages).length}</span>
      <button onClick={() => setLocale('es')}>Switch to Spanish</button>
      <button onClick={() => setLocale('zh')}>Switch to Chinese</button>
    </div>
  );
}

function TranslationTestComponent() {
  const { t, locale } = useTranslation();

  return (
    <div>
      <span data-testid="t-locale">{locale}</span>
      <span data-testid="t-result">{t('games.slots.title')}</span>
    </div>
  );
}

describe('I18nProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should provide default English locale', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    // Wait for initialization
    await screen.findByTestId('locale');
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });

  it('should translate common.loading in English', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await screen.findByTestId('translation');
    expect(screen.getByTestId('translation')).toHaveTextContent('Loading...');
  });

  it('should have all supported languages available', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await screen.findByTestId('language-count');
    expect(screen.getByTestId('language-count')).toHaveTextContent('3');
  });

  it('should change locale when setLocale is called', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await screen.findByTestId('locale');
    expect(screen.getByTestId('locale')).toHaveTextContent('en');

    await user.click(screen.getByText('Switch to Spanish'));

    expect(screen.getByTestId('locale')).toHaveTextContent('es');
    expect(screen.getByTestId('translation')).toHaveTextContent('Cargando...');
  });

  it('should persist locale to localStorage', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await screen.findByTestId('locale');
    await user.click(screen.getByText('Switch to Spanish'));

    expect(localStorage.setItem).toHaveBeenCalledWith('worldvegas_locale', 'es');
  });

  it('should restore locale from localStorage', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('zh');

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await screen.findByTestId('locale');
    expect(screen.getByTestId('locale')).toHaveTextContent('zh');
    expect(screen.getByTestId('translation')).toHaveTextContent('加载中...');
  });
});

describe('useTranslation hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // Reset mock to return null for getItem
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
  });

  it('should return t function and locale', async () => {
    render(
      <I18nProvider>
        <TranslationTestComponent />
      </I18nProvider>
    );

    await screen.findByTestId('t-locale');
    expect(screen.getByTestId('t-locale')).toHaveTextContent('en');
    expect(screen.getByTestId('t-result')).toHaveTextContent('Lucky Slots');
  });
});

describe('LANGUAGES constant', () => {
  it('should have English, Spanish, and Chinese', () => {
    expect(LANGUAGES.en).toBeDefined();
    expect(LANGUAGES.es).toBeDefined();
    expect(LANGUAGES.zh).toBeDefined();
  });

  it('should have correct structure for each language', () => {
    Object.values(LANGUAGES).forEach((lang) => {
      expect(lang).toHaveProperty('code');
      expect(lang).toHaveProperty('name');
      expect(lang).toHaveProperty('nativeName');
      expect(lang).toHaveProperty('flag');
    });
  });

  it('should have correct English language info', () => {
    expect(LANGUAGES.en.code).toBe('en');
    expect(LANGUAGES.en.name).toBe('English');
    expect(LANGUAGES.en.nativeName).toBe('English');
  });
});
