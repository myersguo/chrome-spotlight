export interface Tab {
  id: number;
  windowId: number;
  title: string;
  url: string;
  favIconUrl?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url?: string;
  dateAdded?: number;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  lastVisitTime: number;
  visitCount: number;
}

export interface CustomSearch {
  keyword: string;
  url: string;
  name: string;
}

export type SearchResult = Tab | Bookmark | HistoryItem;
