import React, { useState } from 'react';
import Calendar from './Calendar';
import NewForm from './new';
import Stock from './Stock';

// 型定義
interface Product {
  id: number;
  name: string;
  stock: number;
  shortage: number;
}

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'new' | 'calendar' | 'stock'>('home'); 
  
  const products: Product[] = [
    { id: 1, name: '商品A', stock: 2, shortage: 0 },
    { id: 2, name: '商品B', stock: 0, shortage: 1 },
    { id: 3, name: '商品C', stock: 2, shortage: 0 },
    { id: 4, name: '商品D', stock: 2, shortage: 0 },
  ];

  // body要素に直接スタイルを適用
  React.useEffect(() => {
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

  // ページ切り替え関数
  const goToPage = (page: 'home' | 'new' | 'calendar' | 'stock') => {
    setCurrentPage(page);
  };

  const goHome = () => {
    setCurrentPage('home');
  };

  // ページ別コンポーネントを表示
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'new':
        return <NewForm onBack={goHome} />;
      case 'calendar':
        return <Calendar onBack={goHome} />;
      case 'stock':
        return <Stock onBack={goHome} products={products} />;
      default:
        // ホーム画面
        return (
          <>
            {/* カレンダーボタン */}
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '30px'
            }}>
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

            {/* ボタン群 */}
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '52px'
            }}>
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

            {/* ジャンル表示 */}
            <div style={{
              width: '100%',
              textAlign: 'center',
              marginBottom: '52px'
            }}>
              <h2 style={{
                fontSize: '42px',
                fontWeight: 'bold',
                margin: 0,
                color: '#333'
              }}>ジャンル：食品</h2>
            </div>

            {/* テーブル */}
            <div style={{
              width: '100%',
              backgroundColor: '#fff',
              padding: '39px',
              borderRadius: '20px',
              boxShadow: '0 5px 16px rgba(0, 0, 0, 0.1)',
              boxSizing: 'border-box'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '23px'
              }}>
                <thead>
                  <tr>
                    <th style={{
                      padding: '26px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '31px',
                      color: '#333',
                      backgroundColor: '#f8f9fa'
                    }}>購入品</th>
                    <th style={{
                      padding: '26px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '31px',
                      color: '#333',
                      backgroundColor: '#f8f9fa'
                    }}>在庫</th>
                    <th style={{
                      padding: '26px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '31px',
                      color: '#dc3545',
                      backgroundColor: '#f8f9fa'
                    }}>欠品</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td style={{
                        padding: '33px 26px',
                        textAlign: 'center',
                        backgroundColor: '#ffffff'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {[...Array(6)].map((_, index) => (
                            <div key={index} style={{
                              width: '42px',
                              height: '42px',
                              border: '4px solid #333',
                              borderRadius: '50%',
                              backgroundColor: '#ffffff'
                            }}></div>
                          ))}
                        </div>
                      </td>
                      <td style={{
                        padding: '33px 26px',
                        textAlign: 'center',
                        fontSize: '36px',
                        fontWeight: 'bold',
                        color: '#333',
                        backgroundColor: '#ffffff'
                      }}>{product.stock}</td>
                      <td style={{
                        padding: '33px 26px',
                        textAlign: 'center',
                        fontSize: '36px',
                        fontWeight: 'bold',
                        color: '#dc3545',
                        backgroundColor: '#ffffff'
                      }}>{product.shortage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      margin: '0 auto',
      backgroundColor: '#ffffff'
    }}>
      {/* ヘッダー */}
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
            <span style={{ fontSize: '23px', color: '#666' }}>ゲストさん</span>
            <button style={{
              padding: '10px 26px',
              background: 'white',
              border: '2px solid #ccc',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '21px',
              color: '#333'
            }}>アカウント</button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
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
  );
}

export default App;