// src/types.ts

// ユーザー認証関連
export interface User {
  name: string;
  email: string;
}

export interface AuthContextType {
  currentUser: User | null;
  signup: (name: string, email: string, password: string) => { success: boolean; message?: string };
  login: (email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  loading: boolean;
}


// 商品　
export interface Item {
  id: string;
  genre: string;
  name: string;
  quantity: number;
  barcode?: string;
  addedDate: string;
  source: 'new' | 'history';
}


// カレンダー
export interface Event {
  id: string;
  title: string;
  date: string;
  description?: string;
}

export interface CalendarProps {
  onBack: () => void;
  items?: Item[];
}

// 新規追加　　（new.tsx）
export interface NewFormItem {
  genre: string;
  name: string;
  quantity: string;
  barcode: string;
}

export interface ItemHistoryEntry {
  genre: string;
  name: string;
}

export interface NewFormState {
  newAddedItems: NewFormItem[];
  historyAddedItems: NewFormItem[];
  itemHistory: ItemHistoryEntry[];
}

export interface NewItemFormProps {
  onBack?: () => void;
  onAddItems?: (items: Array<{ genre: string; name: string; quantity: number; barcode?: string }>, source: 'new' | 'history') => void;
  newFormState?: NewFormState;
  updateNewFormState?: (state: Partial<NewFormState>) => void;
}

// ストック管理　　（stock.tsx）
export interface stockProps {
  onBack: () => void;
  items: Item[];
  onUpdateItems: (updatedItems: Item[]) => void;
}