/**
 * Timezone Collector
 * Collects timezone and locale information
 */

/**
 * Timezone information
 */
export interface TimezoneInfo {
  timezone: string;
  offset: number;
  offsetString: string;
  isDST: boolean;
  locale: string;
  languages: string[];
}

/**
 * Collect timezone information
 */
export function collectTimezone(): TimezoneInfo {
  const now = new Date();

  // Get timezone name
  const timezone = getTimezoneName();

  // Get offset in minutes
  const offset = now.getTimezoneOffset();

  // Format offset as string (e.g., "-08:00")
  const offsetString = formatTimezoneOffset(offset);

  // Check if currently in DST
  const isDST = checkDST(now);

  // Get locale
  const locale = getLocale();

  // Get language preferences
  const languages = getLanguages();

  return {
    timezone,
    offset,
    offsetString,
    isDST,
    locale,
    languages,
  };
}

/**
 * Get IANA timezone name
 */
function getTimezoneName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

/**
 * Format timezone offset as string
 */
function formatTimezoneOffset(offsetMinutes: number): string {
  // Offset is inverted (UTC+8 returns -480)
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  const sign = offsetMinutes <= 0 ? '+' : '-';

  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Check if date is in Daylight Saving Time
 */
function checkDST(date: Date): boolean {
  // Compare January and July offsets to detect DST
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();

  // Standard time has the larger offset
  const stdOffset = Math.max(jan, jul);

  // If current offset is less than standard, we're in DST
  return date.getTimezoneOffset() < stdOffset;
}

/**
 * Get browser locale
 */
function getLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || navigator.language || 'en-US';
  } catch {
    return navigator.language || 'en-US';
  }
}

/**
 * Get language preferences
 */
function getLanguages(): string[] {
  if (typeof navigator === 'undefined') {
    return ['en-US'];
  }

  if (navigator.languages && navigator.languages.length > 0) {
    return [...navigator.languages];
  }

  return [navigator.language || 'en-US'];
}

/**
 * Get extended locale information
 */
export function collectExtendedLocale(): {
  timezone: TimezoneInfo;
  dateFormats: {
    shortDate: string;
    longDate: string;
    time: string;
    dateTime: string;
  };
  numberFormat: {
    decimal: string;
    thousand: string;
    currency: string;
    currencySymbol: string;
  };
  calendar: string;
  hourCycle: string;
  firstDayOfWeek: number;
} {
  const timezone = collectTimezone();
  const locale = timezone.locale;

  return {
    timezone,
    dateFormats: getDateFormats(locale),
    numberFormat: getNumberFormat(locale),
    calendar: getCalendar(locale),
    hourCycle: getHourCycle(locale),
    firstDayOfWeek: getFirstDayOfWeek(locale),
  };
}

/**
 * Get date format patterns for locale
 */
function getDateFormats(locale: string): {
  shortDate: string;
  longDate: string;
  time: string;
  dateTime: string;
} {
  const testDate = new Date(2024, 0, 15, 14, 30, 0);

  try {
    return {
      shortDate: new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(testDate),
      longDate: new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(testDate),
      time: new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(testDate),
      dateTime: new Intl.DateTimeFormat(locale, {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(testDate),
    };
  } catch {
    return {
      shortDate: testDate.toLocaleDateString(),
      longDate: testDate.toLocaleDateString(),
      time: testDate.toLocaleTimeString(),
      dateTime: testDate.toLocaleString(),
    };
  }
}

/**
 * Get number format characteristics
 */
function getNumberFormat(locale: string): {
  decimal: string;
  thousand: string;
  currency: string;
  currencySymbol: string;
} {
  try {
    const numberFormat = new Intl.NumberFormat(locale);
    const parts = numberFormat.formatToParts(1234567.89);

    let decimal = '.';
    let thousand = ',';

    for (const part of parts) {
      if (part.type === 'decimal') {
        decimal = part.value;
      } else if (part.type === 'group') {
        thousand = part.value;
      }
    }

    // Get currency info
    const currencyFormat = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
    });
    const currencyParts = currencyFormat.formatToParts(100);

    let currencySymbol = '$';
    for (const part of currencyParts) {
      if (part.type === 'currency') {
        currencySymbol = part.value;
      }
    }

    return {
      decimal,
      thousand,
      currency: 'USD',
      currencySymbol,
    };
  } catch {
    return {
      decimal: '.',
      thousand: ',',
      currency: 'USD',
      currencySymbol: '$',
    };
  }
}

/**
 * Get calendar type
 */
function getCalendar(locale: string): string {
  try {
    const options = new Intl.DateTimeFormat(locale).resolvedOptions();
    return options.calendar || 'gregory';
  } catch {
    return 'gregory';
  }
}

/**
 * Get hour cycle (12h vs 24h)
 */
function getHourCycle(locale: string): string {
  try {
    const options = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions();
    return options.hourCycle || 'h12';
  } catch {
    return 'h12';
  }
}

/**
 * Get first day of week
 * Returns 0 for Sunday, 1 for Monday, etc.
 */
function getFirstDayOfWeek(locale: string): number {
  // Common first day of week by region
  const mondayFirst = [
    'de',
    'fr',
    'es',
    'it',
    'pt',
    'ru',
    'pl',
    'nl',
    'sv',
    'da',
    'fi',
    'no',
    'hu',
    'cs',
    'sk',
    'ro',
    'bg',
    'hr',
    'sl',
    'uk',
    'el',
    'tr',
    'he',
    'ar',
    'hi',
    'ja',
    'zh',
    'ko',
  ];

  const baseLocale = locale.split('-')[0].toLowerCase();

  if (mondayFirst.includes(baseLocale)) {
    return 1;
  }

  // Default to Sunday (US convention)
  return 0;
}

/**
 * Calculate timezone entropy
 */
export function calculateTimezoneEntropy(info: TimezoneInfo): number {
  let entropy = 0;

  // Timezone rarity
  const commonTimezones = [
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
  ];

  if (!commonTimezones.includes(info.timezone)) {
    entropy += 4;
  } else {
    entropy += 2;
  }

  // Language list entropy
  if (info.languages.length > 3) {
    entropy += 2;
  } else if (info.languages.length > 1) {
    entropy += 1;
  }

  // Unusual language combinations
  const hasEnglish = info.languages.some((l) => l.startsWith('en'));
  const hasOther = info.languages.some((l) => !l.startsWith('en'));
  if (hasEnglish && hasOther) {
    entropy += 1;
  }

  return entropy;
}

/**
 * Detect timezone spoofing
 */
export function detectTimezoneSpoofing(info: TimezoneInfo): {
  spoofed: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Check for timezone/offset mismatch
  const expectedOffset = getExpectedOffset(info.timezone);
  if (expectedOffset !== null && Math.abs(info.offset - expectedOffset) > 60) {
    reasons.push('Timezone name and offset mismatch');
  }

  // Check for language/timezone mismatch
  const primaryLang = info.languages[0]?.split('-')[0];
  if (primaryLang && info.timezone) {
    const langTimezoneMismatch = checkLangTimezoneMismatch(primaryLang, info.timezone);
    if (langTimezoneMismatch) {
      reasons.push('Language and timezone region mismatch');
    }
  }

  // Unusual locale format
  if (info.locale && !/^[a-z]{2}(-[A-Z]{2})?$/i.test(info.locale)) {
    reasons.push('Unusual locale format');
  }

  return {
    spoofed: reasons.length > 0,
    reasons,
  };
}

/**
 * Get expected offset for a timezone (approximate)
 */
function getExpectedOffset(timezone: string): number | null {
  const offsets: Record<string, number> = {
    'America/New_York': 300, // -5 hours
    'America/Los_Angeles': 480, // -8 hours
    'America/Chicago': 360, // -6 hours
    'America/Denver': 420, // -7 hours
    'Europe/London': 0,
    'Europe/Paris': -60, // +1 hour
    'Europe/Berlin': -60, // +1 hour
    'Asia/Tokyo': -540, // +9 hours
    'Asia/Shanghai': -480, // +8 hours
    'Asia/Kolkata': -330, // +5:30 hours
    'Australia/Sydney': -600, // +10 hours
  };

  return offsets[timezone] ?? null;
}

/**
 * Check for language/timezone regional mismatch
 */
function checkLangTimezoneMismatch(lang: string, timezone: string): boolean {
  const langRegions: Record<string, string[]> = {
    en: ['America/', 'Europe/London', 'Australia/', 'Pacific/'],
    zh: ['Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Taipei'],
    ja: ['Asia/Tokyo'],
    ko: ['Asia/Seoul'],
    de: ['Europe/Berlin', 'Europe/Vienna', 'Europe/Zurich'],
    fr: ['Europe/Paris', 'Africa/', 'America/Montreal'],
    es: ['Europe/Madrid', 'America/'],
    pt: ['Europe/Lisbon', 'America/Sao_Paulo'],
    ru: ['Europe/Moscow', 'Asia/'],
    ar: ['Asia/', 'Africa/'],
    hi: ['Asia/Kolkata'],
  };

  const expectedRegions = langRegions[lang];
  if (!expectedRegions) {
    return false;
  }

  return !expectedRegions.some((region) => timezone.startsWith(region));
}
