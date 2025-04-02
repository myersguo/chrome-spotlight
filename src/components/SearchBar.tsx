import React from 'react';

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  translateKeyword: string;
  aiChatKeyword: string; // Add AI chat keyword
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  query, 
  setQuery, 
  inputRef, 
  translateKeyword,
  aiChatKeyword // Add AI chat keyword
}) => {
  return (
    <div className="spotlight-search">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search tabs, bookmarks, history or type '${translateKeyword}' to translate or '${aiChatKeyword}' to chat with AI...`}
        autoFocus
      />
    </div>
  );
};

export default SearchBar;
