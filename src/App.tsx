import React, { createContext, useContext, useState, useEffect } from 'react';
import Calendar from './Calendar';
import Stock from './Stock';
import Login from './login';
import NewItemForm from './new';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  currentUser: User | null;
  signup: (name: string, email: string, password: string) => { success: boolean; message?: string };
  login: (email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// 認証プロバイダー
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const signup = (name: string, email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.some((u: any) => u.email === email)) {
      return { success: false, message: 'このメールアドレスは既に登録されています' };
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    setCurrentUser({ name, email });
    localStorage.setItem('currentUser', JSON.stringify({ name, email }));
    
    return { success: true };
  };

  const login = (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      setCurrentUser({ name: user.name, email: user.email });
      localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email }));
      return { success: true };
    }
    
    return { success: false, message: 'メールアドレスまたはパスワードが正しくありません' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, signup, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export interface Item {
  id: string;
  genre: string;
  name: string;
  quantity: number;
  barcode?: string;
  addedDate: string;
  source: 'new' | 'history';
}


function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}


const GlobalStyles = () => (
  <style>{`
    .calendar-button {
      padding: 15px 40px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 13px;
      cursor: pointer;
      font-size: 22px;
      font-weight: bold;
      box-shadow: 0 4px 8px rgba(40, 167, 69, 0.2);
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s ease;
    }
    .calendar-button:hover {
      background-color: #218838;
      transform: translateY(-2px);
    }
    
    .new-button {
      padding: 20px 52px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 13px;
      cursor: pointer;
      font-size: 26px;
      font-weight: bold;
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
    }
    
    .stock-button {
      padding: 20px 52px;
      background-color: #ff8c00;
      color: white;
      border: none;
      border-radius: 13px;
      cursor: pointer;
      font-size: 26px;
      font-weight: bold;
      box-shadow: 0 4px 8px rgba(255, 140, 0, 0.2);
      transition: all 0.2s ease;
    }
    .stock-button:hover {
      background-color: #e67e00;
      transform: translateY(-2px);
    }
    
    .settings-button {
      padding: 10px 26px;
      background: #6c757d;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 21px;
      color: white;
      font-weight: bold;
    }
    
    .logout-button {
      width: 100%;
      padding: 15px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 20px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .logout-button:hover {
      background-color: #c82333;
    }
    
    .close-button {
      width: 100%;
      padding: 15px;
      background-color: #6c757d;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 20px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .close-button:hover {
      background-color: #5a6268;
    }
  `}</style>
);


function AppContent() {
  const { currentUser, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'new' | 'calendar' | 'stock'>('home'); 
  
  // 全ユーザーのアイテムを管理
  const [allUserItems, setAllUserItems] = useLocalStorage<Record<string, Item[]>>('allUserItems', {});
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // ユーザーごとの履歴を管理
  const [userItemHistories, setUserItemHistories] = useLocalStorage<Record<string, Array<{genre: string, name: string}>>>('userItemHistories', {});
  
  // 現在のユーザーのメールアドレスをキーとして使用
  const currentUserEmail = currentUser?.email || '';
  
  // 現在のユーザーのアイテムのみを取得
  const items = allUserItems[currentUserEmail] || [];
  
  // 現在のユーザーの履歴を取得（存在しない場合は空配列）
  const currentUserHistory = userItemHistories[currentUserEmail] || [];
  
  const [newFormState, setNewFormState] = useState({
    newAddedItems: [] as Array<{genre: string, name: string, quantity: string, barcode: string}>,
    historyAddedItems: [] as Array<{genre: string, name: string, quantity: string, barcode: string}>,
    itemHistory: currentUserHistory
  });

  // ユーザーが変わったら履歴を更新
  useEffect(() => {
    setNewFormState(prev => ({
      ...prev,
      itemHistory: userItemHistories[currentUserEmail] || []
    }));
  }, [currentUserEmail, userItemHistories]);

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      logout();
      setShowSettingsModal(false);
    }
  };

  const updateNewFormState = (newState: Partial<typeof newFormState>) => {
    setNewFormState(prev => {
      const updated = { ...prev, ...newState };
      
      // itemHistoryが更新された場合、現在のユーザーの履歴も更新
      if (newState.itemHistory) {
        setUserItemHistories(prevHistories => ({
          ...prevHistories,
          [currentUserEmail]: newState.itemHistory!
        }));
      }
      
      return updated;
    });
  };

  const addItems = (newItems: Array<{genre: string, name: string, quantity: number, barcode?: string}>, source: 'new' | 'history') => {
    const itemsWithMetadata = newItems.map(item => ({
      ...item,
      id: `${source}_${Date.now()}_${Math.random()}`,
      addedDate: new Date().toISOString(),
      source
    }));
    
    // 現在のユーザーのアイテムに追加
    setAllUserItems(prev => ({
      ...prev,
      [currentUserEmail]: [...(prev[currentUserEmail] || []), ...itemsWithMetadata]
    }));
  };

  const updateItems = (updatedItems: Item[]) => {
    // 現在のユーザーのアイテムを更新
    setAllUserItems(prev => ({
      ...prev,
      [currentUserEmail]: updatedItems
    }));
  };

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.minHeight = '100vh';
    document.body.style.textAlign = 'center';
    
    const root = document.getElementById('root');
    if (root) {
      root.style.width = '100%';
      root.style.display = 'flex';
      root.style.justifyContent = 'center';
    }
  }, []);

  const goToPage = (page: 'home' | 'new' | 'calendar' | 'stock') => {
    setCurrentPage(page);
  };

  const goHome = () => {
    setCurrentPage('home');
  };

  const getItemsByGenre = (genre: string) => {
    return items.filter(item => item.genre === genre);
  };

  const getAllGenres = () => {
    const genres = items.map(item => item.genre);
    return Array.from(new Set(genres));
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'new':
        return (
          <NewItemForm 
            onBack={goHome} 
            onAddItems={addItems} 
            newFormState={newFormState} 
            updateNewFormState={updateNewFormState} 
          />
        );
      case 'calendar':
        return <Calendar onBack={goHome} items={items} />;
      case 'stock':
        return <Stock onBack={goHome} items={items} onUpdateItems={updateItems} />;
      default:
        const genres = getAllGenres();
        
        return (
          <>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
              <button 
                onClick={() => goToPage('calendar')}
                className="calendar-button"
              >
                📅 カレンダー
              </button>
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '52px' }}>
              <button 
                onClick={() => goToPage('new')}
                className="new-button"
              >新規追加・買い出し</button>
              
              <button 
                onClick={() => goToPage('stock')}
                className="stock-button"
              >
                ストック
              </button>
            </div>

            {items.length === 0 && (
              <div style={{
                width: '100%',
                textAlign: 'center',
                marginBottom: '52px',
                padding: '60px',
                backgroundColor: '#f8f9fa',
                borderRadius: '20px',
                boxShadow: '0 5px 16px rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{ fontSize: '32px', color: '#666', margin: 0, marginBottom: '20px' }}>
                  まだ商品が追加されていません
                </h2>
                <p style={{ fontSize: '18px', color: '#999', margin: 0 }}>
                  「新規追加・買い出し」ボタンから商品を追加してください
                </p>
              </div>
            )}

            {genres.map((genre) => {
              const genreItems = getItemsByGenre(genre);
              return (
                <div key={genre} style={{ width: '100%', marginBottom: '52px' }}>
                  <div style={{ width: '100%', textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '42px', fontWeight: 'bold', margin: 0, color: '#333' }}>
                      ジャンル:{genre}
                    </h2>
                  </div>

                  <div style={{
                    width: '100%',
                    backgroundColor: '#fff',
                    padding: '39px',
                    borderRadius: '20px',
                    boxShadow: '0 5px 16px rgba(0, 0, 0, 0.1)',
                    boxSizing: 'border-box'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '23px' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '26px', textAlign: 'center', fontWeight: 'bold', fontSize: '31px', color: '#333', backgroundColor: '#f8f9fa' }}>商品名</th>
                          <th style={{ padding: '26px', textAlign: 'center', fontWeight: 'bold', fontSize: '31px', color: '#333', backgroundColor: '#f8f9fa' }}>個数</th>
                          <th style={{ padding: '26px', textAlign: 'center', fontWeight: 'bold', fontSize: '31px', color: '#333', backgroundColor: '#f8f9fa' }}>追加日</th>
                          <th style={{ padding: '26px', textAlign: 'center', fontWeight: 'bold', fontSize: '31px', color: '#333', backgroundColor: '#f8f9fa' }}>種類</th>
                        </tr>
                      </thead>
                      <tbody>
                        {genreItems.map((item) => (
                          <tr key={item.id}>
                            <td style={{ padding: '33px 26px', textAlign: 'center', fontSize: '24px', color: '#333', backgroundColor: '#ffffff' }}>{item.name}</td>
                            <td style={{ padding: '33px 26px', textAlign: 'center', fontSize: '36px', fontWeight: 'bold', color: '#333', backgroundColor: '#ffffff' }}>{item.quantity}</td>
                            <td style={{ padding: '33px 26px', textAlign: 'center', fontSize: '18px', color: '#666', backgroundColor: '#ffffff' }}>
                              {new Date(item.addedDate).toLocaleDateString('ja-JP')}
                            </td>
                            <td style={{ padding: '33px 26px', textAlign: 'center', fontSize: '16px', backgroundColor: '#ffffff' }}>
                              <span style={{
                                padding: '6px 12px',
                                borderRadius: '15px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                backgroundColor: item.source === 'new' ? '#e3f2fd' : '#e8f5e8',
                                color: item.source === 'new' ? '#1976d2' : '#388e3c'
                              }}>
                                {item.source === 'new' ? '新規' : '履歴'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </>
        );
    }
  };

  if (!currentUser) return null;

  return (
    <>
      <GlobalStyles />
      
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        margin: '0 auto',
        backgroundColor: '#ffffff'
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderBottom: '2px solid #ddd',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          width: '100%',
          padding: '20px 40px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
          }}>
            <h1 
              style={{
                fontSize: '47px',
                fontWeight: 'bold',
                margin: 0,
                textDecoration: 'underline',
                color: '#333',
                cursor: currentPage !== 'home' ? 'pointer' : 'default'
              }}
              onClick={currentPage !== 'home' ? goHome : undefined}
            >
              Seasonings and ・・・
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
              <span style={{ fontSize: '23px', color: '#666' }}>
                {currentUser.name}さん
              </span>
              {currentPage === 'home' && (
                <button 
                  onClick={() => setShowSettingsModal(true)}
                  className="settings-button"
                >
                  設定
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '52px 40px',
          backgroundColor: '#ffffff',
          boxSizing: 'border-box'
        }}>
          {renderCurrentPage()}
        </div>
      </div>

      {showSettingsModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowSettingsModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '40px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '30px',
              color: '#333',
              textAlign: 'center'
            }}>
              設定
            </h2>

            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '30px'
            }}>
              <div style={{ marginBottom: '15px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#666' }}>名前: </span>
                <span style={{ fontSize: '18px', color: '#333' }}>{currentUser.name}</span>
              </div>
              <div>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#666' }}>メール: </span>
                <span style={{ fontSize: '18px', color: '#333' }}>{currentUser.email}</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                ログアウト
              </button>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="close-button"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}

const AuthWrapper = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '20px', color: '#666' }}>読み込み中...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return <AppContent />;
};

export default App;