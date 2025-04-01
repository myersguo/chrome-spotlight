import React, { useState, useEffect } from 'react';

interface TranslationResultProps {
  query: string;
  result: string;
  sourceLang?: string;
  targetLang?: string;
  isLoading?: boolean;
}

const TranslationResult: React.FC<TranslationResultProps> = ({ 
  query, 
  result,
  sourceLang = 'auto',
  targetLang = 'en',
  isLoading = false
}) => {
  const [availableLanguages, setAvailableLanguages] = useState<{[key: string]: string}>({
    'auto': 'Auto-detect',
    'en': 'English',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'fr': 'French',
    'de': 'German',
    'ja': 'Japanese',
    'ko': 'Korean',
    'es': 'Spanish',
    'ru': 'Russian'
  });
  
  const [selectedSourceLang, setSelectedSourceLang] = useState(sourceLang);
  const [selectedTargetLang, setSelectedTargetLang] = useState(targetLang);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationText, setTranslationText] = useState(result);
  
  useEffect(() => {
    chrome.runtime.sendMessage({ action: "getTranslationSettings" }, (settings) => {
      if (settings) {
        setSelectedSourceLang( settings.translateSourceLang || sourceLang );
        setSelectedTargetLang( settings.translateTargetLang || targetLang );
      }
    });
  }, [sourceLang, targetLang]);

  useEffect(() => {
    setTranslationText(result);
  }, [result]);
  
  const handleLanguageChange = (type: 'source' | 'target', value: string) => {
    if (type === 'source') {
      setSelectedSourceLang(value);
    } else {
      setSelectedTargetLang(value);
    }
    
    setIsTranslating(true);
    chrome.runtime.sendMessage({
      action: "translate",
      text: query,
      sourceLang: type === 'source' ? value : selectedSourceLang,
      targetLang: type === 'target' ? value : selectedTargetLang
    }, (response) => {
      if (response && response.translation) {
        setTranslationText(response.translation);
      } else if (response && response.error) {
        setTranslationText(`Error: ${response.error}`);
      }
      setIsTranslating(false);
    });
  };
  
  return (
    <div className="spotlight-translation">
      <div className="translation-language-selectors">
        <div className="language-selector">
          <label>From:</label>
          <select 
            value={selectedSourceLang}
            onChange={(e) => handleLanguageChange('source', e.target.value)}
          >
            {Object.entries(availableLanguages).map(([code, name]) => (
              <option key={`source-${code}`} value={code}>{name}</option>
            ))}
          </select>
        </div>
        
        <div className="language-selector-arrow">→</div>
        
        <div className="language-selector">
          <label>To:</label>
          <select 
            value={selectedTargetLang}
            onChange={(e) => handleLanguageChange('target', e.target.value)}
          >
            {Object.entries(availableLanguages)
              .filter(([code]) => code !== 'auto')
              .map(([code, name]) => (
                <option key={`target-${code}`} value={code}>{name}</option>
              ))
            }
          </select>
        </div>
      </div>
      
      <div className="translation-content">
        <div className="translation-original">
          <div className="translation-label">Original:</div>
          <div className="translation-text">{query}</div>
        </div>
        
        <div className="translation-result">
          <div className="translation-label">Translation:</div>
          <div className="translation-text">
      {isLoading || isTranslating ? 'Translating...' : translationText || 'Waiting for translation...'}
    </div>
        </div>
      </div>
      
      <div className="translation-footer">
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            chrome.runtime.sendMessage({ action: "openOptionsPage" });
          }}
        >
          Translation Settings
        </a>
      </div>
    </div>
  );
};

export default TranslationResult;
