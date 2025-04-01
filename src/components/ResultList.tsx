import React from 'react';
import ResultItem from './ResultItem';
import { Tab, Bookmark, HistoryItem, SearchResult } from '../types';

interface ResultListProps {
  tabs: Tab[];
  bookmarks: Bookmark[];
  history: HistoryItem[];
  selectedCategory: string;
  selectedItemIndex: number;
  onCategoryChange: (category: string) => void;
  onItemSelect: (item: SearchResult) => void;
}

const ResultList: React.FC<ResultListProps> = ({
  tabs,
  bookmarks,
  history,
  selectedCategory,
  selectedItemIndex,
  onCategoryChange,
  onItemSelect
}) => {
  const hasResults = tabs.length > 0 || bookmarks.length > 0 || history.length > 0;

  if (!hasResults) {
    return (
      <div className="spotlight-no-results">
        <p>No results found. Try a different search term.</p>
      </div>
    );
  }

  // 根据当前选中的类别渲染对应的列表项
  const renderItems = (items: SearchResult[]) => (
    <div className="spotlight-category-items">
      {items.map((item, index) => (
        <ResultItem
          key={item.id || item.url}
          item={item}
          isSelected={index === selectedItemIndex}
          onClick={() => onItemSelect(item)}
        />
      ))}
    </div>
  );

  let content;
  switch (selectedCategory) {
    case 'tabs':
      content = renderItems(tabs);
      break;
    case 'bookmarks':
      content = renderItems(bookmarks);
      break;
    case 'history':
      content = renderItems(history);
      break;
    default:
      content = null;
  }

  return (
    <div className="spotlight-results">
      <div className="spotlight-categories">
        <div
          className={`spotlight-category ${selectedCategory === 'tabs' ? 'active' : ''}`}
          onClick={() => onCategoryChange('tabs')}
        >
          Tabs ({tabs.length})
        </div>
        <div
          className={`spotlight-category ${selectedCategory === 'bookmarks' ? 'active' : ''}`}
          onClick={() => onCategoryChange('bookmarks')}
        >
          Bookmarks ({bookmarks.length})
        </div>
        <div
          className={`spotlight-category ${selectedCategory === 'history' ? 'active' : ''}`}
          onClick={() => onCategoryChange('history')}
        >
          History ({history.length})
        </div>
      </div>
      {content}
    </div>
  );
};

export default ResultList;
