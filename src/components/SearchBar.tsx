import React from 'react';

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  translateKeyword: string;
  aiChatKeyword: string;
  timeKeyword: string; 
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  query, 
  setQuery, 
  inputRef, 
  translateKeyword,
  aiChatKeyword,
  timeKeyword,
}) => {
  return (
    <div className="spotlight-search">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search tabs, bookmarks, history or type '${translateKeyword}' to translate, '${aiChatKeyword}' for AI chat, '${timeKeyword}' for world clock...`}
        autoFocus
      />
    </div>
  );
};

export default SearchBar;
