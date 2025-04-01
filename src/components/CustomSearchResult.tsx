import React, { useState, useEffect } from 'react';

interface SearchResultProps {
  query: string;
  searchTerm: string;
  engineUrl: string;
  engineName: string;
}

const CustomSearchResult: React.FC<SearchResultProps> = ({ 
  query, 
  searchTerm,
  engineUrl,
  engineName
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchUrl, setSearchUrl] = useState<string>('');
  
  useEffect(() => {
    const finalQuery = query.startsWith(`${searchTerm} `) 
      ? query.substring(searchTerm.length + 1).trim() 
      : query;
    
    setSearchQuery(finalQuery);
    
    if (finalQuery) {
      const url = engineUrl.replace('%s', encodeURIComponent(finalQuery));
      setSearchUrl(url);
    }
  }, [query, searchTerm, engineUrl]);
  
  const handleOpenSearch = () => {
    if (searchUrl) {
      chrome.runtime.sendMessage({
        action: "openUrl",
        url: searchUrl
      });
    }
  };

  const handleOpenInNewTab = () => {
    if (searchUrl) {
      chrome.runtime.sendMessage({
        action: "openUrl",
        url: searchUrl
      });
    }
  };
  
  return (

    <div className="spotlight-search-result">
      
      <div className="search-result-content">
        <iframe 
          src={searchUrl} 
          className="search-result-iframe"
          title={`${engineName} search results`}
          sandbox="allow-same-origin allow-scripts"
        ></iframe>
      </div>
      
      <div className="search-result-footer">
        <a href={searchUrl} target="_blank" rel="noopener noreferrer">
          View full results on {engineName}
        </a>

          <a 
            className="search-action-button secondary"
            onClick={() => {
              navigator.clipboard.writeText(searchUrl);
            }}
          >
            Copy URL
          </a>
      </div>
    </div>
  );
};

export default CustomSearchResult;
