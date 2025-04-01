import React from 'react';

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery, inputRef }) => {
  return (
    <div className="spotlight-search">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tabs, bookmarks, history or type 'translate' to translate text..."
        autoFocus
      />
    </div>
  );
};

export default SearchBar;
