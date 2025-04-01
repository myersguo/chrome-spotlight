import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './optionsStyle.css';

interface Settings {
  translateSourceLang: string;
  translateTargetLang: string;
  translateApiKey: string;
  translateService: string;
  translateKeyword: string;
}

const defaultSettings: Settings = {
  translateSourceLang: 'auto',
  translateTargetLang: 'en',
  translateApiKey: '',
  translateService: 'google', // google or googlecloud
  translateKeyword: 'translate'  // 默认关键词为 "translate"
};

const OptionsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    // Load saved settings when component mounts
    chrome.storage.sync.get(defaultSettings, (items) => {
      setSettings(items as Settings);
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
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
