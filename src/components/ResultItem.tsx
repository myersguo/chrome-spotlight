import React from 'react';
import { SearchResult } from '../types';

interface ResultItemProps {
  item: SearchResult;
  isSelected: boolean;
  onClick: () => void;
  category: string;
}

const ResultItem: React.FC<ResultItemProps> = ({ item, isSelected, onClick, category }) => {
  const title = 'title' in item ? item.title : '';
  const url = 'url' in item ? item.url : '';

  const getIconText = () => {
    switch (category) {
      case 'tabs':
        return '🗂';
      case 'bookmarks':
        return '★'; 
      case 'history':
        return '🕘';
      default:
        return '★';
    }
  };
  
  return (
    <div 
      className={`spotlight-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className={`spotlight-icon ${category}`}>
        {getIconText()}
      </div>
      <div>
        <div className="spotlight-item-title">{title}</div>
        {url && <div className="spotlight-item-url">{url}</div>}
      </div>
    </div>
  );
};

export default ResultItem;
