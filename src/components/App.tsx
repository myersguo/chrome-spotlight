import React, { useState, useEffect, useRef } from 'react';
import SearchBar from './SearchBar';
import ResultList from './ResultList';
import TranslationResult from './TranslationResult';
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



  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    chrome.runtime.sendMessage({ action: "getTabs" }, (response) => {
      if (response && response.tabs) {
        setTabs(response.tabs);
      }
    });
  }, []);

  useEffect(() => {
    setSelectedItemIndex(0);
    
    if (query.startsWith('translate ')) {
      setIsTranslating(true);
      setTranslationQuery(query.substring(10));
    } else {
      setIsTranslating(false);
      
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
  }, [query]);

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
  if ('tabId' in item) {
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
      />
      
      {isTranslating ? (
        <TranslationResult 
          query={translationQuery} 
          result={translationResult} 
          sourceLang={sourceLang}
          targetLang={targetLang}
          isLoading={isLoading}
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
