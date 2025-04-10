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

export interface TimeZone {
  id: string;
  name: string;
  region: string;
  offset: number;
}

export interface Settings {
  translateSourceLang: string;
  translateTargetLang: string;
  translateApiKey: string;
  translateService: string;
  translateKeyword: string;
  customSearches: CustomSearch[];
  aiChatEnabled: boolean;
  aiChatProvider: string;
  aiChatApiUrl: string;
  aiChatApiKey: string;
  aiChatKeyword: string;
  aiChatModel: string;
  timeKeyword: string;
  timeZones: TimeZone[];
}

export type SearchResult = Tab | Bookmark | HistoryItem;
