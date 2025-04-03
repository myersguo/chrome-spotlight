import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './optionsStyle.css';

interface CustomSearch {
  keyword: string;
  url: string;
  name: string;
}

interface Settings {
  translateSourceLang: string;
  translateTargetLang: string;
  translateApiKey: string;
  translateService: string;
  translateKeyword: string;
  customSearches: CustomSearch[];
  aiChatEnabled: boolean;
  aiChatProvider: string;
  aiChatApiUrl: string;
  aiChatApiKey: string;
  aiChatKeyword: string;
  aiChatModel: string;
}

const TABS = {
  TRANSLATION: 'translation',
  SEARCH: 'search',
  AI_CHAT: 'aichat',
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
  aiChatModel: 'doubao-1.5-pro-256k-250115'
};

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

// Helper Components
interface TabButtonProps {
  name: string;
  activeTab: string;
  label: string;
  onClick: (tab: string) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ name, activeTab, label, onClick }) => (
  <button 
    className={activeTab === name ? 'active' : ''} 
    onClick={() => onClick(name)}
  >
    {label}
  </button>
);

interface StatusMessageProps {
  message: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ message }) => (
  message ? <div className="status-message">{message}</div> : null
);

// Main Component
const OptionsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [status, setStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>(TABS.TRANSLATION);
  
  // Custom search state
  const [newSearch, setNewSearch] = useState<CustomSearch>({
    keyword: '',
    url: '',
    name: ''
  });

  // Load settings on initial render
  useEffect(() => {
    chrome.storage.sync.get(defaultSettings, (items) => {
      setSettings(items as Settings);
    });
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    chrome.storage.sync.set(settings);
  }, [settings]);

  // Show temporary status message
  const showStatus = (message: string, duration: number = 2000) => {
    setStatus(message);
    setTimeout(() => setStatus(''), duration);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings({
      ...settings,
      [name]: checked
    });
  };

  const handleNewSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const field = id.replace('newSearch', '').toLowerCase();
    setNewSearch({
      ...newSearch,
      [field]: value
    });
  };

  // AI provider change handler
  const handleAiProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value as keyof typeof providerDefaults;
    
    if (provider !== AI_PROVIDERS.CUSTOM && providerDefaults[provider]) {
      setSettings({
        ...settings,
        aiChatProvider: provider,
        aiChatApiUrl: providerDefaults[provider].apiUrl,
        aiChatModel: providerDefaults[provider].model,
      });
    } else {
      setSettings({
        ...settings,
        aiChatProvider: provider
      });
    }
  };

  // Custom search handlers
  const addCustomSearch = () => {
    const { keyword, url, name } = newSearch;
    
    if (!keyword || !url || !name) {
      showStatus('Please fill all fields for custom search');
      return;
    }

    if (settings.customSearches.some(search => search.keyword === keyword)) {
      showStatus('Keyword already exists');
      return;
    }

    setSettings({
      ...settings,
      customSearches: [...settings.customSearches, { keyword, url, name }]
    });

    setNewSearch({ keyword: '', url: '', name: '' });
  };

  const removeCustomSearch = (keyword: string) => {
    setSettings({
      ...settings,
      customSearches: settings.customSearches.filter(search => search.keyword !== keyword)
    });
  };

  // Settings management
  const saveSettings = () => {
    chrome.storage.sync.set(settings, () => {
      showStatus('Settings saved!');
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    chrome.storage.sync.set(defaultSettings, () => {
      showStatus('Settings reset to defaults!');
    });
  };

  const getModelPlaceholder = (provider: string): string => {
    switch (provider) {
      case AI_PROVIDERS.VOLCENGINE:
        return 'doubao-1-5-lite-32k-250115';
      case AI_PROVIDERS.GEMINI:
        return 'gemini-pro';
      case AI_PROVIDERS.OPENAI:
        return 'gpt-4';
      case AI_PROVIDERS.CLAUDE:
        return 'claude-3-opus-20240229';
      case AI_PROVIDERS.HUGGINGFACE:
        return 'mistralai/Mistral-7B-Instruct-v0.2';
      default:
        return '';
    }
  };

  // Render methods for each tab
  const renderTranslationTab = () => (
    <div className="options-section">
      <h2>Translation Settings</h2>
      
      <div className="options-field">
        <label htmlFor="translateService">Translation Service:</label>
        <select 
          id="translateService" 
          name="translateService"
          value={settings.translateService}
          onChange={handleInputChange}
        >
          <option value={TRANSLATION_SERVICES.GOOGLE}>Google Translate (Free API)</option>
          <option value={TRANSLATION_SERVICES.GOOGLE_CLOUD}>Google Cloud Translation API</option>
        </select>
      </div>
      
      <div className="options-field">
        <label htmlFor="translateSourceLang">Default Source Language:</label>
        <select 
          id="translateSourceLang" 
          name="translateSourceLang"
          value={settings.translateSourceLang}
          onChange={handleInputChange}
        >
          <option value="auto">Auto-detect</option>
          <option value="en">English</option>
          <option value="zh-CN">Chinese (Simplified)</option>
          <option value="zh-TW">Chinese (Traditional)</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="es">Spanish</option>
          <option value="ru">Russian</option>
        </select>
      </div>
      
      <div className="options-field">
        <label htmlFor="translateTargetLang">Default Target Language:</label>
        <select 
          id="translateTargetLang" 
          name="translateTargetLang"
          value={settings.translateTargetLang}
          onChange={handleInputChange}
        >
          <option value="en">English</option>
          <option value="zh-CN">Chinese (Simplified)</option>
          <option value="zh-TW">Chinese (Traditional)</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="es">Spanish</option>
          <option value="ru">Russian</option>
        </select>
      </div>

      <div className="options-field">
        <label htmlFor="translateKeyword">Translate Trigger Keyword:</label>
        <input 
          type="text" 
          id="translateKeyword" 
          name="translateKeyword"
          value={settings.translateKeyword}
          onChange={handleInputChange}
          placeholder="Enter the trigger keyword (e.g. translate)"
        />
      </div>
      
      {settings.translateService === TRANSLATION_SERVICES.GOOGLE_CLOUD && (
        <div className="options-field">
          <label htmlFor="translateApiKey">Google Cloud Translation API Key:</label>
          <input 
            type="text" 
            id="translateApiKey" 
            name="translateApiKey"
            value={settings.translateApiKey}
            onChange={handleInputChange}
            placeholder="Enter your Google Cloud API key here"
          />
          <p className="options-help-text">
            To use Google Cloud Translation API, you need an API key from Google Cloud Platform. 
            <br />
            1. Create a project in the <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a>
            <br />
            2. Enable the Cloud Translation API
            <br />
            3. Create an API key and paste it here
          </p>
        </div>
      )}
    </div>
  );

  const renderSearchTab = () => (
    <div className="options-section">
      <h2>Custom Search Engines</h2>
      <p className="options-help-text">
        Configure custom search engines to quickly search the web from the Spotlight. 
        Use '%s' in the URL to represent your search query.
      </p>
      
      <div className="custom-searches-list">
        {settings.customSearches.map((search, index) => (
          <div key={index} className="custom-search-item">
            <div className="custom-search-info">
              <span className="custom-search-name">{search.name}</span>
              <span className="custom-search-keyword">@{search.keyword}</span>
              <span className="custom-search-url">{search.url}</span>
            </div>
            <button 
              className="remove-button" 
              onClick={() => removeCustomSearch(search.keyword)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      
      <div className="add-custom-search">
        <h3>Add New Search Engine</h3>
        <div className="custom-search-inputs">
          <div className="options-field">
            <label htmlFor="newSearchName">Name:</label>
            <input 
              type="text" 
              id="newSearchName" 
              value={newSearch.name}
              onChange={handleNewSearchChange}
              placeholder="Google, Bing, etc."
            />
          </div>
          
          <div className="options-field">
            <label htmlFor="newSearchKeyword">Keyword:</label>
            <input 
              type="text" 
              id="newSearchKeyword" 
              value={newSearch.keyword}
              onChange={handleNewSearchChange}
              placeholder="search, bing, etc."
            />
          </div>
          
          <div className="options-field">
            <label htmlFor="newSearchUrl">URL Pattern:</label>
            <input 
              type="text" 
              id="newSearchUrl" 
              value={newSearch.url}
              onChange={handleNewSearchChange}
              placeholder="https://www.google.com/search?q=%s"
            />
          </div>
        </div>
        
        <button onClick={addCustomSearch} className="add-button">Add Search Engine</button>
      </div>
    </div>
  );

  const renderAiChatTab = () => (
    <div className="options-section">
      <h2>AI Chat Settings</h2>
      <p className="options-help-text">
        Configure your AI chat assistant to quickly get answers from the Spotlight.
      </p>
      
      <div className="options-field">
        <label htmlFor="aiChatEnabled">
          <input 
            type="checkbox" 
            id="aiChatEnabled" 
            name="aiChatEnabled"
            checked={settings.aiChatEnabled}
            onChange={handleCheckboxChange}
          />
          Enable AI Chat
        </label>
      </div>
      
      {settings.aiChatEnabled && (
        <>
          <div className="options-field">
            <label htmlFor="aiChatKeyword">AI Chat Trigger Keyword:</label>
            <input 
              type="text" 
              id="aiChatKeyword" 
              name="aiChatKeyword"
              value={settings.aiChatKeyword}
              onChange={handleInputChange}
              placeholder="Enter the trigger keyword (e.g. aichat)"
            />
          </div>
          
          <div className="options-field">
            <label htmlFor="aiChatProvider">AI Provider:</label>
            <select 
              id="aiChatProvider" 
              name="aiChatProvider"
              value={settings.aiChatProvider}
              onChange={handleAiProviderChange}
            >
              <option value={AI_PROVIDERS.VOLCENGINE}>volcengine</option>
              <option value={AI_PROVIDERS.GEMINI}>Google Gemini</option>
              <option value={AI_PROVIDERS.OPENAI}>OpenAI</option>
              <option value={AI_PROVIDERS.CLAUDE}>Anthropic Claude</option>
              <option value={AI_PROVIDERS.HUGGINGFACE}>Hugging Face</option>
              <option value={AI_PROVIDERS.CUSTOM}>Custom</option>
            </select>
          </div>
          
          <div className="options-field">
            <label htmlFor="aiChatApiUrl">API Base URL:</label>
            <input 
              type="text" 
              id="aiChatApiUrl" 
              name="aiChatApiUrl"
              value={settings.aiChatApiUrl}
              onChange={handleInputChange}
              placeholder="Enter the API base URL"
            />
          </div>
          
          <div className="options-field">
            <label htmlFor="aiChatApiKey">API Key:</label>
            <input 
              type="password" 
              id="aiChatApiKey" 
              name="aiChatApiKey"
              value={settings.aiChatApiKey}
              onChange={handleInputChange}
              placeholder="Enter your API key"
            />
          </div>
          
          <div className="options-field">
            <label htmlFor="aiChatModel">Model:</label>
            <input 
              type="text" 
              id="aiChatModel" 
              name="aiChatModel"
              value={settings.aiChatModel}
              onChange={handleInputChange}
              placeholder={getModelPlaceholder(settings.aiChatProvider)}
            />
          </div>
          
          {settings.aiChatProvider !== AI_PROVIDERS.CUSTOM && settings.aiChatProvider in providerDefaults && (
            <div className="options-help-text">
              <p>
                API Key from: <a 
                  href={providerDefaults[settings.aiChatProvider as keyof typeof providerDefaults].docUrl} 
                  target="_blank"
                  rel="noreferrer"
                >
                  {providerDefaults[settings.aiChatProvider as keyof typeof providerDefaults].docUrl}
                </a>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="options-container">
      <h1>Chrome Spotlight Settings</h1>
      
      <div className="options-tabs">
        <TabButton 
          name={TABS.TRANSLATION} 
          activeTab={activeTab} 
          label="Translation" 
          onClick={setActiveTab} 
        />
        <TabButton 
          name={TABS.SEARCH} 
          activeTab={activeTab} 
          label="Search Engines" 
          onClick={setActiveTab} 
        />
        <TabButton 
          name={TABS.AI_CHAT} 
          activeTab={activeTab} 
          label="AI Chat" 
          onClick={setActiveTab} 
        />
      </div>
      
      {activeTab === TABS.TRANSLATION && renderTranslationTab()}
      {activeTab === TABS.SEARCH && renderSearchTab()}
      {activeTab === TABS.AI_CHAT && renderAiChatTab()}
      
      <div className="options-buttons">
        <button onClick={saveSettings} className="save-button">Save Settings</button>
        <button onClick={resetSettings} className="reset-button">Reset to Defaults</button>
      </div>
      
      <StatusMessage message={status} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<OptionsPage />);
