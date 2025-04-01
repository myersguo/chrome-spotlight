import React from 'react';
import { SearchResult } from '../types';

interface ResultItemProps {
  item: SearchResult;
  isSelected: boolean;
  onClick: () => void;
}

const ResultItem: React.FC<ResultItemProps> = ({ item, isSelected, onClick }) => {
  const title = 'title' in item ? item.title : '';
  const url = 'url' in item ? item.url : '';
  
  return (
    <div 
      className={`spotlight-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="spotlight-icon">★</div>
      <div>
        <div className="spotlight-item-title">{title}</div>
        {url && <div className="spotlight-item-url">{url}</div>}
      </div>
    </div>
  );
};

export default ResultItem;
