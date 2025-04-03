import React, { useState, useEffect, useRef } from 'react';
import SearchBar from './SearchBar';
import ResultList from './ResultList';
import TranslationResult from './TranslationResult';
import CustomSearchResult from './CustomSearchResult';
import AiChatResult from './AiChatResult';
import ExpressionResult from './ExpressionResult';
import { Parser } from 'expr-eval';



import { Tab, Bookmark, HistoryItem, SearchResult } from '../types';

interface AppProps {
  onClose: () => void;
}

const App: React.FC<AppProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('tabs');
  const [translationQuery, setTranslationQuery] = useState('');
  const [translationResult, setTranslationResult] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [translateKeyword, setTranslateKeyword] = useState('translate');
  const [isSearching, setIsSearching] = useState(false);
  const [searchEngine, setSearchEngine] = useState<{ keyword: string, url: string, name: string } | null>(null);
  const [customSearches, setCustomSearches] = useState<{ keyword: string, url: string, name: string }[]>([]);
  const [isAiChatting, setIsAiChatting] = useState(false);
  const [aiChatKeyword, setAiChatKeyword] = useState('aichat');
  const [isCalculating, setIsCalculating] = useState(false);
  const [expressionResult, setExpressionResult] = useState('');




  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    chrome.storage.sync.get({
      translateKeyword: 'translate',
      aiChatKeyword: 'aichat',
      customSearches: [
        { keyword: 'search', url: 'https://www.google.com/search?q=%s', name: 'Google' }
      ]
    }, (items) => {
      if (items.translateKeyword) {
        setTranslateKeyword(items.translateKeyword);
      }
      if (items.aiChatKeyword) {
        setAiChatKeyword(items.aiChatKeyword);
      }
      if (items.customSearches) {
        setCustomSearches(items.customSearches);
      }
    });

    chrome.runtime.sendMessage({ action: "getTabs" }, (response) => {
      if (response && response.tabs) {
        setTabs(response.tabs);
      }
    });
  }, []);

  const evaluateExpression = (expr: string): string => {
    try {
      return Parser.evaluate(expr).toString();
    } catch (e) {
      throw new Error('Calculation error');
    }
  };

  const isValidMathExpression = (expr: string): boolean => {
    const hasValidChars = /^[\d\s+\-*/().^%]+$/.test(expr);
    const hasAtLeastOneOperator = /[+\-*/^%]/.test(expr);
    const startsWithValidChar = /^[\d(]/.test(expr);
    const endsWithValidChar = !/[+\-*/^%]$/.test(expr);
    const hasMatchingBrackets = expr.split('(').length === expr.split(')').length;
    const hasNoConsecutiveOperators = !/[+\-*/^%]{2,}/.test(expr);
    return hasValidChars && hasAtLeastOneOperator && startsWithValidChar && endsWithValidChar && hasMatchingBrackets && hasNoConsecutiveOperators;
  }

  useEffect(() => {
    setSelectedItemIndex(0);


    if (query.startsWith(`${translateKeyword} `)) {
      setIsTranslating(true);
      setIsSearching(false);
      setIsAiChatting(false);
      setTranslationQuery(query.substring(translateKeyword.length + 1));
      setIsCalculating(false);
      setExpressionResult('');
    } else if (query.startsWith(`${aiChatKeyword} `) || query === aiChatKeyword) {
      setIsTranslating(false);
      setIsSearching(false);
      setIsAiChatting(true);
      setIsCalculating(false);
      setExpressionResult('');
    } else if (isValidMathExpression(query)) {
      try {
        const result = evaluateExpression(query);
        setIsCalculating(true);
        setIsTranslating(false);
        setIsAiChatting(false);
        setIsSearching(false);
        setExpressionResult(result);
      } catch (e) {
        console.error(e);
        setIsCalculating(false);
      }
    }
    else {
      setIsTranslating(false);
      setIsAiChatting(false);
      setIsCalculating(false);
      setExpressionResult('');

      // Check if query starts with any of the custom search keywords
      const matchedSearch = customSearches.find(search =>
        query.startsWith(`${search.keyword} `) && query.length > search.keyword.length + 1
      );

      if (matchedSearch) {
        setIsSearching(true);
        setSearchEngine(matchedSearch);
      } else {
        setIsSearching(false);
        setSearchEngine(null);

        if (query.trim() !== '') {
          searchTabs();
          searchBookmarks();
          searchHistory();
        } else {
          chrome.runtime.sendMessage({ action: "getTabs" }, (response) => {
            if (response && response.tabs) {
              setTabs(response.tabs);
            }
          });
          setBookmarks([]);
          setHistory([]);
        }
      }
    }
  }, [query, translateKeyword, customSearches, aiChatKeyword]);

  useEffect(() => {
    if (isTranslating) {
      setTranslationResult('');

      if (translationQuery.trim() !== '') {
        setIsLoading(true);
        const debounceTimeout = setTimeout(() => {
          chrome.runtime.sendMessage(
            {
              action: "translate",
              text: translationQuery
            },
            (response) => {
              if (response && response.translation) {
                setTranslationResult(response.translation);
                setSourceLang(response.sourceLang);
                setTargetLang(response.targetLang);
              }
              setIsLoading(false);
            }
          );
        }, 500);

        return () => clearTimeout(debounceTimeout);
      }
    }
  }, [translationQuery, isTranslating]);

  const searchTabs = () => {
    chrome.runtime.sendMessage({ action: "getTabs" }, (response) => {
      if (response && response.tabs) {
        const filteredTabs = response.tabs.filter((tab: Tab) =>
          tab.title.toLowerCase().includes(query.toLowerCase()) ||
          tab.url.toLowerCase().includes(query.toLowerCase())
        );
        setTabs(filteredTabs);
      }
    });
  };

  const searchBookmarks = () => {
    chrome.runtime.sendMessage({ action: "getBookmarks", query }, (response) => {
      if (response && response.bookmarks) {
        setBookmarks(response.bookmarks);
      }
    });
  };

  const searchHistory = () => {
    chrome.runtime.sendMessage({ action: "getHistory", query }, (response) => {
      if (response && response.historyItems) {
        setHistory(response.historyItems);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let results: SearchResult[] = [];

    if (isAiChatting) {
      if (e.key === 'Escape') {
        onClose();
      }
      return;
    }

    if (selectedCategory === 'tabs') {
      results = tabs;
    } else if (selectedCategory === 'bookmarks') {
      results = bookmarks;
    } else if (selectedCategory === 'history') {
      results = history;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedItemIndex((prevIndex) =>
        Math.min(prevIndex + 1, results.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedItemIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && selectedItemIndex >= 0) {
        handleItemSelect(results[selectedItemIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (selectedCategory === 'tabs') {
        setSelectedCategory('bookmarks');
      } else if (selectedCategory === 'bookmarks') {
        setSelectedCategory('history');
      } else {
        setSelectedCategory('tabs');
      }
      setSelectedItemIndex(0);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleItemSelect = (item: SearchResult) => {
    if ('windowId' in item) {
      chrome.runtime.sendMessage({
        action: "openTab",
        tabId: item.id,
        windowId: (item as Tab).windowId
      }, () => {
        onClose();
      });
    } else {
      chrome.runtime.sendMessage({
        action: "openUrl",
        url: item.url
      }, () => {
        onClose();
      });
    }
  };


  return (
    <div className="spotlight-container" onKeyDown={handleKeyDown}>
      <SearchBar
        query={query}
        setQuery={setQuery}
        inputRef={inputRef}
        translateKeyword={translateKeyword}
        aiChatKeyword={aiChatKeyword} // Pass AI chat keyword to SearchBar
      />


      {isCalculating ? (
        <ExpressionResult
          expression={query}
          result={expressionResult}
        />
      ) : isTranslating ? (
        <TranslationResult
          query={translationQuery}
          result={translationResult}
          sourceLang={sourceLang}
          targetLang={targetLang}
          isLoading={isLoading}
        />
      ) : isAiChatting ? (
        // Render AI Chat component
        <AiChatResult
          query={query}
          keyword={aiChatKeyword}
        />
      ) : isSearching && searchEngine ? (
        <CustomSearchResult
          query={query}
          searchTerm={searchEngine.keyword}
          engineUrl={searchEngine.url}
          engineName={searchEngine.name}
        />
      ) : (
        <ResultList
          tabs={tabs}
          bookmarks={bookmarks}
          history={history}
          selectedCategory={selectedCategory}
          selectedItemIndex={selectedItemIndex}
          onCategoryChange={setSelectedCategory}
          onItemSelect={handleItemSelect}
        />
      )}

      <div className="spotlight-navigation-help">
        Use arrow keys ↑ ↓ to navigate · Tab to switch categories
      </div>
    </div>
  );
};

export default App;
