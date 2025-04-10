import { Settings } from './types';


const TABS = {
  TRANSLATION: 'translation',
  SEARCH: 'search',
  AI_CHAT: 'aichat',
  TIME: 'time',
} as const;

const AI_PROVIDERS = {
  VOLCENGINE: 'volcengine',
  GEMINI: 'gemini',
  OPENAI: 'openai',
  CLAUDE: 'claude',
  HUGGINGFACE: 'huggingface',
  CUSTOM: 'custom',
} as const;

const TRANSLATION_SERVICES = {
  GOOGLE: 'google',
  GOOGLE_CLOUD: 'googlecloud',
} as const;

// Default settings configuration
const defaultSettings: Settings = {
  translateSourceLang: 'auto',
  translateTargetLang: 'en',
  translateApiKey: '',
  translateService: TRANSLATION_SERVICES.GOOGLE,
  translateKeyword: 'translate',
  customSearches: [
    { keyword: 'google', url: 'https://www.google.com/search?q=%s', name: 'Google' },
    { keyword: 'bing', url: 'https://www.bing.com/search?q=%s', name: 'Bing' }
  ],
  aiChatEnabled: false,
  aiChatProvider: AI_PROVIDERS.VOLCENGINE,
  aiChatApiUrl: 'https://ark.cn-beijing.volces.com',
  aiChatApiKey: '',
  aiChatKeyword: 'aichat',
  aiChatModel: 'doubao-1.5-pro-256k-250115',
  timeKeyword: 'time',
  timeZones: [
    { id: 'shanghai', name: 'Shanghai', region: 'Asia', offset: 8 },
    { id: 'singapore', name: 'Singapore', region: 'Asia', offset: 8 },
    { id: 'tokyo', name: 'Tokyo', region: 'Asia', offset: 9 },
    { id: 'new_york', name: 'New York', region: 'Americas', offset: -4 },
    { id: 'los_angeles', name: 'Los Angeles', region: 'Americas', offset: -7 },
    { id: 'london', name: 'London', region: 'Europe', offset: 1 },
    { id: 'paris', name: 'Paris', region: 'Europe', offset: 2 },
    // others
    { id: 'sydney', name: 'Sydney', region: 'Others', offset: 10 },
    { id: 'brazil', name: 'Brazil', region: 'Others', offset: -3 },
  ]
};

const DEFAULT_TIMEZONE_REGIONS = defaultSettings.timeZones.map(tz => tz.region).filter((region, index, self) =>
  index === self.indexOf(region)
);

const providerDefaults: Record<string, {
  apiUrl: string;
  model: string;
  docUrl: string;
}> = {
  [AI_PROVIDERS.VOLCENGINE]: {
    apiUrl: 'https://ark.cn-beijing.volces.com',
    model: 'doubao-1.5-pro-256k-250115',
    docUrl: 'https://console.volcengine.com/ark'
  },
  [AI_PROVIDERS.GEMINI]: {
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.0-flash-lite',
    docUrl: 'https://aistudio.google.com/app/apikey'
  },
  [AI_PROVIDERS.OPENAI]: {
    apiUrl: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    docUrl: 'https://platform.openai.com/account/api-keys'
  },
  [AI_PROVIDERS.CLAUDE]: {
    apiUrl: 'https://api.anthropic.com/v1',
    model: 'claude-instant',
    docUrl: 'https://console.anthropic.com/'
  },
  [AI_PROVIDERS.HUGGINGFACE]: {
    apiUrl: 'https://api-inference.huggingface.co/models',
    model: 'Qwen/QwQ-32B',
    docUrl: 'https://huggingface.co/settings/tokens'
  }
};

const TRANSLATION_LANGUAGES = {
    AUTO: {
      value: "auto",
      label: "Auto-detect"
    },
    ENGLISH: {
      value: "en",
      label: "English"  
    },
    CHINESE_SIMPLIFIED: {
      value: "zh-CN",
      label: "Chinese (Simplified)"
    },
    CHINESE_TRADITIONAL: {
      value: "zh-TW",
      label: "Chinese (Traditional)"
    },
    FRENCH: {
      value: "fr",
      label: "French"
    },
    GERMAN: {
      value: "de",
      label: "German"
    },
    JAPANESE: {
      value: "ja",
      label: "Japanese"
    },
    KOREAN: {
      value: "ko",
      label: "Korean"
    },
    SPANISH: {
      value: "es",
      label: "Spanish"
    },
    RUSSIAN: {
      value: "ru",
      label: "Russian"
    }
  };

const SOURCE_LANGUAGE_OPTIONS = Object.values(TRANSLATION_LANGUAGES);
const TARGET_LANGUAGE_OPTIONS = Object.values(TRANSLATION_LANGUAGES).filter(
    lang => lang.value !== TRANSLATION_LANGUAGES.AUTO.value
  );

export {
  TABS,
  AI_PROVIDERS,
  TRANSLATION_SERVICES,
  defaultSettings,
  providerDefaults,
  TRANSLATION_LANGUAGES,
  SOURCE_LANGUAGE_OPTIONS,
  TARGET_LANGUAGE_OPTIONS,
  DEFAULT_TIMEZONE_REGIONS,
}

