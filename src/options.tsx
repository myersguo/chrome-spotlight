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

const defaultSettings: Settings = {
  translateSourceLang: 'auto',
  translateTargetLang: 'en',
  translateApiKey: '',
  translateService: 'google', // google or googlecloud
  translateKeyword: 'translate',  // default keyword for translation
  customSearches: [
    { keyword: 'google', url: 'https://www.google.com/search?q=%s', name: 'Google' },
    { keyword: 'bing', url: 'https://www.bing.com/search?q=%s', name: 'Bing' }
  ],
  aiChatEnabled: false,
  aiChatProvider: 'volcengine',  // 'gemini', 'openai', 'claude', 'volcengine', or 'custom'
  aiChatApiUrl: 'https://ark.cn-beijing.volces.com',
  aiChatApiKey: '',
  aiChatKeyword: 'aichat',
  aiChatModel: 'doubao-1.5-pro-256k-250115' 
  // eg: deepseek-r1-250120 deepseek-r1-distill-qwen-32b-250120 deepseek-r1-distill-qwen-7b-250120 doubao-1.5-pro-256k-250115
};

const OptionsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [status, setStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('translation'); // Added tab state
  // For handling new custom search inputs
  const [newSearchKeyword, setNewSearchKeyword] = useState<string>('');
  const [newSearchUrl, setNewSearchUrl] = useState<string>('');
  const [newSearchName, setNewSearchName] = useState<string>('');

  useEffect(() => {
    chrome.storage.sync.get(defaultSettings, (items) => {
      setSettings(items as Settings);
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.set(settings);
  }, [settings]);

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

  const handleAiProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value;
    let apiUrl = settings.aiChatApiUrl;
    let aiModel = settings.aiChatModel;
    
    // Set default API URL based on provider
    switch (provider) {
      case 'gemini':
        apiUrl = 'https://generativelanguage.googleapis.com/v1beta';
        aiModel = 'gemini-pro';
        break;
      case 'openai':
        apiUrl = 'https://api.openai.com/v1';
        aiModel = 'gpt-3.5-turbo';
        break;
      case 'claude':
        apiUrl = 'https://api.anthropic.com/v1';
        aiModel = 'claude-instant';
        break;
      case 'volcengine':
        apiUrl = 'https://ark.cn-beijing.volces.com';
        aiModel = 'doubao-1.5-pro-256k-250115';
    }

    setSettings({
      ...settings,
      aiChatProvider: provider,
      aiChatApiUrl: apiUrl,
      aiChatModel: aiModel,
    });
  };

  const addCustomSearch = () => {
    if (!newSearchKeyword || !newSearchUrl || !newSearchName) {
      setStatus('Please fill all fields for custom search');
      setTimeout(() => setStatus(''), 2000);
      return;
    }

    // Check if keyword already exists
    if (settings.customSearches.some(search => search.keyword === newSearchKeyword)) {
      setStatus('Keyword already exists');
      setTimeout(() => setStatus(''), 2000);
      return;
    }

    const newSearch = {
      keyword: newSearchKeyword,
      url: newSearchUrl,
      name: newSearchName
    };

    setSettings({
      ...settings,
      customSearches: [...settings.customSearches, newSearch]
    });

    setNewSearchKeyword('');
    setNewSearchUrl('');
    setNewSearchName('');
  };

  const removeCustomSearch = (keyword: string) => {
    setSettings({
      ...settings,
      customSearches: settings.customSearches.filter(search => search.keyword !== keyword)
    });
  };

  const saveSettings = () => {
    chrome.storage.sync.set(settings, () => {
      setStatus('Settings saved!');
      setTimeout(() => setStatus(''), 2000);
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    chrome.storage.sync.set(defaultSettings, () => {
      setStatus('Settings reset to defaults!');
      setTimeout(() => setStatus(''), 2000);
    });
  };

  return (
    <div className="options-container">
      <h1>Chrome Spotlight Settings</h1>
      
      {/* Added tabs navigation */}
      <div className="options-tabs">
        <button 
          className={activeTab === 'translation' ? 'active' : ''} 
          onClick={() => setActiveTab('translation')}
        >
          Translation
        </button>
        <button 
          className={activeTab === 'search' ? 'active' : ''} 
          onClick={() => setActiveTab('search')}
        >
          Search Engines
        </button>
        <button 
          className={activeTab === 'aichat' ? 'active' : ''} 
          onClick={() => setActiveTab('aichat')}
        >
          AI Chat
        </button>
      </div>
      
      {activeTab === 'translation' && (
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
              <option value="google">Google Translate (Free API)</option>
              <option value="googlecloud">Google Cloud Translation API</option>
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
          
          {settings.translateService === 'googlecloud' && (
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
      )}
      
      {/* Added search engines tab content */}
      {activeTab === 'search' && (
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
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                  placeholder="Google, Bing, etc."
                />
              </div>
              
              <div className="options-field">
                <label htmlFor="newSearchKeyword">Keyword:</label>
                <input 
                  type="text" 
                  id="newSearchKeyword" 
                  value={newSearchKeyword}
                  onChange={(e) => setNewSearchKeyword(e.target.value)}
                  placeholder="search, bing, etc."
                />
              </div>
              
              <div className="options-field">
                <label htmlFor="newSearchUrl">URL Pattern:</label>
                <input 
                  type="text" 
                  id="newSearchUrl" 
                  value={newSearchUrl}
                  onChange={(e) => setNewSearchUrl(e.target.value)}
                  placeholder="https://www.google.com/search?q=%s"
                />
              </div>
            </div>
            
            <button onClick={addCustomSearch} className="add-button">Add Search Engine</button>
          </div>
        </div>
      )}

      {/* New AI Chat tab content */}
      {activeTab === 'aichat' && (
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
                  <option value="volcengine">volcengine</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="claude">Anthropic Claude</option>
                  <option value="custom">Custom</option>
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
                    placeholder={
                      settings.aiChatProvider === 'volcengine'? 'doubao-1-5-lite-32k-250115' :
                      settings.aiChatProvider === 'gemini' ? 'gemini-pro' :
                      settings.aiChatProvider === 'openai' ? 'gpt-4' :
                      settings.aiChatProvider === 'claude' ? 'claude-3-opus-20240229' : ''
                    }
                  />
                </div>
              
              {settings.aiChatProvider != 'custom' && (<div className="options-help-text">
                <p>API Key from :
                {
                  settings.aiChatProvider === 'volcengine'?  (<a href="https://console.volcengine.com/ark" target='_blank'>https://console.volcengine.com/ark</a>) :
                  settings.aiChatProvider === 'gemini'?( <a  href="https://aistudio.google.com/app/apikey" target='_blank'>https://aistudio.google.com/app/apikey</a>):
                  settings.aiChatProvider === 'openai'? (<a href="https://platform.openai.com/account/api-keys" target='_blank'>https://platform.openai.com/account/api-keys</a>):
                  settings.aiChatProvider === 'claude'? (<a href="https://console.anthropic.com/" target='_blank'>https://console.anthropic.com/</a>): null
                }
                </p>
              
              </div>) }
            </>
          )}
        </div>
      )}
      
      <div className="options-buttons">
        <button onClick={saveSettings} className="save-button">Save Settings</button>
        <button onClick={resetSettings} className="reset-button">Reset to Defaults</button>
      </div>
      
      {status && <div className="status-message">{status}</div>}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<OptionsPage />);
