import React, { useState, useEffect } from 'react';
import { TARGET_LANGUAGE_OPTIONS, SOURCE_LANGUAGE_OPTIONS } from '../constants';

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
  const [availableLanguages, setAvailableLanguages] = useState<{ [key: string]: string }>({});

  const [selectedSourceLang, setSelectedSourceLang] = useState(sourceLang);
  const [selectedTargetLang, setSelectedTargetLang] = useState(targetLang);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationText, setTranslationText] = useState(result);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: "getTranslationSettings" }, (settings) => {
      if (settings) {
        setSelectedSourceLang(settings.translateSourceLang || sourceLang);
        setSelectedTargetLang(settings.translateTargetLang || targetLang);
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

            {SOURCE_LANGUAGE_OPTIONS.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
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
            {TARGET_LANGUAGE_OPTIONS.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
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
