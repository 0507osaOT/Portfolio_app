import React, { createContext, useContext, useState, useEffect } from 'react';
import Calendar from './Calendar';
import Stock from './Stock';
import Login from './login';
import NewItemForm from './new';

// ========================================
// 認証関連の型定義とコンテキスト
// ========================================

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

// useAuth フックをエクスポート
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

// ========================================
// 商品の型定義
// ========================================

export interface Item {
  id: string;
  genre: string;
  name: string;
  quantity: number;
  barcode?: string;
  addedDate: string;
  source: 'new' | 'history';
}

// ========================================
// メインApp（認証統合版）
// ========================================

function AppContent() {
  const { currentUser, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'new' | 'calendar' | 'stock'>('home'); 
  const [items, setItems] = useState<Item[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [newFormState, setNewFormState] = useState({
    newAddedItems: [] as Array<{genre: string, name: string, quantity: string, barcode: string}>,
    historyAddedItems: [] as Array<{genre: string, name: string, quantity: string, barcode: string}>,
    itemHistory: [] as Array<{genre: string, name: string}>
  });

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      logout();
      setShowSettingsModal(false);
    }
  };

  const updateNewFormState = (newState: Partial<typeof newFormState>) => {
    setNewFormState(prev => ({ ...prev, ...newState }));
  };

  const addItems = (newItems: Array<{genre: string, name: string, quantity: number, barcode?: string}>, source: 'new' | 'history') => {
    const itemsWithMetadata = newItems.map(item => ({
      ...item,
      id: `${source}_${Date.now()}_${Math.random()}`,
      addedDate: new Date().toISOString(),
      source
    }));
    
    setItems(prev => [...prev, ...itemsWithMetadata]);
  };

  const updateItems = (updatedItems: Item[]) => {
    setItems(updatedItems);
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
                style={{
                  padding: '15px 40px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '13px',
                  cursor: 'pointer',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(40, 167, 69, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#218838';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#28a745';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                📅 カレンダー
              </button>
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '52px' }}>
              <button 
                onClick={() => goToPage('new')}
                style={{
                  padding: '20px 52px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '13px',
                  cursor: 'pointer',
                  fontSize: '26px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(0, 123, 255, 0.2)'
                }}
              >新規追加・買い出し</button>
              
              <button 
                onClick={() => goToPage('stock')}
                style={{
                  padding: '20px 52px',
                  backgroundColor: '#ff8c00',
                  color: 'white',
                  border: 'none',
                  borderRadius: '13px',
                  cursor: 'pointer',
                  fontSize: '26px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(255, 140, 0, 0.2)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e67e00';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff8c00';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
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
                  style={{
                    padding: '10px 26px',
                    background: '#6c757d',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '21px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
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

      {/* 設定モーダル */}
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
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c82333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc3545';
                }}
              >
                ログアウト
              </button>

              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5a6268';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#6c757d';
                }}
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

// ========================================
// 認証ラッパーとエクスポート
// ========================================

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