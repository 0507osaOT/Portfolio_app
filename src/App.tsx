import React, { useState } from 'react';
import Calendar from './Calendar';
import Stock from './Stock';

// 商品の型定義
export interface Item {
  id: string;
  genre: string;
  name: string;
  quantity: number;
  barcode?: string;
  addedDate: string;
  source: 'new' | 'history';
}

// グループ化対応のNewItemFormコンポーネント
const NewItemForm = ({ onBack, onAddItems, newFormState, updateNewFormState }: {
  onBack: () => void;
  onAddItems: (items: Array<{genre: string, name: string, quantity: number, barcode?: string}>, source: 'new' | 'history') => void;
  newFormState?: {
    newAddedItems: Array<{genre: string, name: string, quantity: string, barcode: string}>;
    historyAddedItems: Array<{genre: string, name: string, quantity: string, barcode: string}>;
    itemHistory: Array<{genre: string, name: string}>;
  };
  updateNewFormState?: (newState: any) => void;
}) => {
  const [newItem, setNewItem] = useState({
    genre: '',
    name: '',
    quantity: '',
    barcode: ''
  });
  
  const [historyItem, setHistoryItem] = useState({
    genre: '',
    name: '',
    quantity: ''
  });

  const [localNewAddedItems, setLocalNewAddedItems] = useState<Array<{genre: string, name: string, quantity: string, barcode: string}>>([]);
  const [localHistoryAddedItems, setLocalHistoryAddedItems] = useState<Array<{genre: string, name: string, quantity: string, barcode: string}>>([]);
  const [localItemHistory, setLocalItemHistory] = useState<Array<{genre: string, name: string}>>([]);

  const newAddedItems = newFormState?.newAddedItems || localNewAddedItems;
  const historyAddedItems = newFormState?.historyAddedItems || localHistoryAddedItems;
  const itemHistory = newFormState?.itemHistory || localItemHistory;

  // ジャンル別グループ化関数
  const groupItemsByGenre = (items: Array<{genre: string, name: string, quantity: string, barcode: string}>) => {
    return items.reduce((acc, item, index) => {
      if (!acc[item.genre]) {
        acc[item.genre] = [];
      }
      acc[item.genre].push({ ...item, originalIndex: index });
      return acc;
    }, {} as Record<string, Array<{genre: string, name: string, quantity: string, barcode: string, originalIndex: number}>>);
  };

  const handleNewItemChange = (field: string, value: string) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  };

  const handleHistoryItemChange = (field: string, value: string) => {
    setHistoryItem(prev => ({ ...prev, [field]: value }));
  };

  const handleNewItemSubmit = () => {
    if (!newItem.genre || !newItem.name || !newItem.quantity) {
      alert('ジャンル、名前、個数は必須項目です');
      return;
    }
    
    const exists = itemHistory.some(
      h => h.genre === newItem.genre && h.name === newItem.name
    );
    if (!exists) {
      if (updateNewFormState) {
        updateNewFormState({
          itemHistory: [...itemHistory, { genre: newItem.genre, name: newItem.name }]
        });
      } else {
        setLocalItemHistory(prev => [...prev, { genre: newItem.genre, name: newItem.name }]);
      }
    }
    
    if (updateNewFormState) {
      updateNewFormState({
        newAddedItems: [...newAddedItems, { ...newItem }]
      });
    } else {
      setLocalNewAddedItems(prev => [...prev, { ...newItem }]);
    }
    setNewItem({ genre: '', name: '', quantity: '', barcode: '' });
  };

  const handleHistoryItemSubmit = () => {
    if (!historyItem.genre || !historyItem.name || !historyItem.quantity) {
      alert('ジャンル、名前、個数を選択してください');
      return;
    }
    
    const newHistoryItem = {
      genre: historyItem.genre,
      name: historyItem.name,
      quantity: historyItem.quantity,
      barcode: ''
    };
    
    if (updateNewFormState) {
      updateNewFormState({
        historyAddedItems: [...historyAddedItems, newHistoryItem]
      });
    } else {
      setLocalHistoryAddedItems(prev => [...prev, newHistoryItem]);
    }
    setHistoryItem({ genre: '', name: '', quantity: '' });
  };

  const handleNewBatchSubmit = () => {
    if (newAddedItems.length === 0) {
      alert('追加する商品がありません');
      return;
    }
    
    const itemsForApp = newAddedItems.map(item => ({
      genre: item.genre,
      name: item.name,
      quantity: parseInt(item.quantity) || 0,
      barcode: item.barcode
    }));
    
    onAddItems(itemsForApp, 'new');
    alert(`${newAddedItems.length}件の商品をまとめて追加しました！`);
    
    if (updateNewFormState) {
      updateNewFormState({
        newAddedItems: []
      });
    } else {
      setLocalNewAddedItems([]);
    }
  };

  const handleHistoryBatchSubmit = () => {
    if (historyAddedItems.length === 0) {
      alert('追加する商品がありません');
      return;
    }
    
    const itemsForApp = historyAddedItems.map(item => ({
      genre: item.genre,
      name: item.name,
      quantity: parseInt(item.quantity) || 0,
      barcode: item.barcode
    }));
    
    onAddItems(itemsForApp, 'history');
    alert(`${historyAddedItems.length}件の商品をまとめて追加しました！`);
    
    if (updateNewFormState) {
      updateNewFormState({
        historyAddedItems: []
      });
    } else {
      setLocalHistoryAddedItems([]);
    }
  };

  const handleDeleteNewItem = (index: number) => {
    if (updateNewFormState) {
      updateNewFormState({
        newAddedItems: newAddedItems.filter((_, i) => i !== index)
      });
    } else {
      setLocalNewAddedItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDeleteHistoryItem = (index: number) => {
    if (updateNewFormState) {
      updateNewFormState({
        historyAddedItems: historyAddedItems.filter((_, i) => i !== index)
      });
    } else {
      setLocalHistoryAddedItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const uniqueGenres = Array.from(new Set(itemHistory.map(item => item.genre)));
  const namesForSelectedGenre = itemHistory
    .filter(item => item.genre === historyItem.genre)
    .map(item => item.name);

  // ジャンル別グループ化
  const groupedNewItems = groupItemsByGenre(newAddedItems);
  const groupedHistoryItems = groupItemsByGenre(historyAddedItems);

  return (
    <div style={{ width: '100%', maxWidth: '800px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          ← ホームに戻る
        </button>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          margin: 0,
          color: '#333'
        }}>新規追加（買い出し）画面</h2>
        <div style={{ width: '140px' }}></div>
      </div>

      <div style={{
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 5px 16px rgba(0, 0, 0, 0.1)',
        marginBottom: '40px'
      }}>
        <h3 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '30px',
          color: '#333'
        }}>新規：追加</h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div>
            <div style={{ fontSize: '18px', marginBottom: '8px', color: '#333' }}>ジャンル：</div>
            <input
              type="text"
              value={newItem.genre}
              onChange={(e) => handleNewItemChange('genre', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div>
            <div style={{ fontSize: '18px', marginBottom: '8px', color: '#333' }}>名前：</div>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => handleNewItemChange('name', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div>
            <div style={{ fontSize: '18px', marginBottom: '8px', color: '#333' }}>個数：</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                value={newItem.quantity}
                readOnly
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  backgroundColor: '#f8f9fa',
                  cursor: 'default'
                }}
              />
              <button
                onClick={() => {
                  const currentQty = parseInt(newItem.quantity) || 0;
                  handleNewItemChange('quantity', String(currentQty + 1));
                }}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#000',
                  color: 'white',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}
              >
                +
              </button>
              <button
                onClick={() => {
                  const currentQty = parseInt(newItem.quantity) || 0;
                  if (currentQty > 0) {
                    handleNewItemChange('quantity', String(currentQty - 1));
                  }
                }}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}
              >
                −
              </button>
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '18px', marginBottom: '8px', color: '#333' }}>バーコード</div>
            <input
              type="text"
              value={newItem.barcode}
              onChange={(e) => handleNewItemChange('barcode', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleNewItemSubmit}
            style={{
              padding: '15px 40px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: 'bold'
            }}
          >
            追加する
          </button>
        </div>

        {/* 新規追加商品リスト（ジャンル別グループ化） */}
        {newAddedItems.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h4 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#333'
            }}>新規追加予定の商品</h4>
            
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '12px'
            }}>
              {Object.entries(groupedNewItems).map(([genre, items]) => (
                <div key={genre} style={{ marginBottom: '25px' }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    color: '#333',
                    borderBottom: '2px solid #007bff',
                    paddingBottom: '5px'
                  }}>
                    ジャンル: {genre}
                  </div>
                  
                  {items.map((item) => (
                    <div
                      key={item.originalIndex}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        padding: '15px 20px',
                        marginBottom: '10px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        gap: '40px',
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div>
                          <span style={{ fontWeight: 'bold', color: '#666' }}>名前: </span>
                          <span>{item.name}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: 'bold', color: '#666' }}>個数: </span>
                          <span>{item.quantity}</span>
                        </div>
                        {item.barcode && (
                          <div>
                            <span style={{ fontWeight: 'bold', color: '#666' }}>バーコード: </span>
                            <span>{item.barcode}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteNewItem(item.originalIndex)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  onClick={handleNewBatchSubmit}
                  style={{
                    padding: '15px 50px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}
                >
                  まとめて追加
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 5px 16px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '30px',
          color: '#333'
        }}>過去：追加</h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div>
            <div style={{ fontSize: '18px', marginBottom: '8px', color: '#333' }}>ジャンル：</div>
            <select
              value={historyItem.genre}
              onChange={(e) => {
                handleHistoryItemChange('genre', e.target.value);
                handleHistoryItemChange('name', '');
              }}
              disabled={uniqueGenres.length === 0}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                boxSizing: 'border-box',
                backgroundColor: uniqueGenres.length === 0 ? '#f0f0f0' : 'white',
                cursor: uniqueGenres.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="">選択してください</option>
              {uniqueGenres.map((genre, index) => (
                <option key={index} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          
          <div>
            <div style={{ fontSize: '18px', marginBottom: '8px', color: '#333' }}>名前：</div>
            <select
              value={historyItem.name}
              onChange={(e) => handleHistoryItemChange('name', e.target.value)}
              disabled={!historyItem.genre || namesForSelectedGenre.length === 0}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                boxSizing: 'border-box',
                backgroundColor: !historyItem.genre ? '#f0f0f0' : 'white',
                cursor: !historyItem.genre ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="">選択してください</option>
              {namesForSelectedGenre.map((name, index) => (
                <option key={index} value={name}>{name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <div style={{ fontSize: '18px', marginBottom: '8px', color: '#333' }}>個数：</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                value={historyItem.quantity}
                readOnly
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  backgroundColor: '#f8f9fa',
                  cursor: 'default'
                }}
              />
              <button
                onClick={() => {
                  const currentQty = parseInt(historyItem.quantity) || 0;
                  handleHistoryItemChange('quantity', String(currentQty + 1));
                }}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#000',
                  color: 'white',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}
              >
                +
              </button>
              <button
                onClick={() => {
                  const currentQty = parseInt(historyItem.quantity) || 0;
                  if (currentQty > 0) {
                    handleHistoryItemChange('quantity', String(currentQty - 1));
                  }
                }}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}
              >
                −
              </button>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleHistoryItemSubmit}
            style={{
              padding: '15px 40px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: 'bold'
            }}
          >
            追加する
          </button>
        </div>

        {/* 履歴追加商品リスト（ジャンル別グループ化） */}
        {historyAddedItems.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h4 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#333'
            }}>履歴追加予定の商品</h4>
            
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '12px'
            }}>
              {Object.entries(groupedHistoryItems).map(([genre, items]) => (
                <div key={genre} style={{ marginBottom: '25px' }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    color: '#333',
                    borderBottom: '2px solid #007bff',
                    paddingBottom: '5px'
                  }}>
                    ジャンル: {genre}
                  </div>
                  
                  {items.map((item) => (
                    <div
                      key={item.originalIndex}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        padding: '15px 20px',
                        marginBottom: '10px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        gap: '40px',
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div>
                          <span style={{ fontWeight: 'bold', color: '#666' }}>名前: </span>
                          <span>{item.name}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: 'bold', color: '#666' }}>個数: </span>
                          <span>{item.quantity}</span>
                        </div>
                        {item.barcode && (
                          <div>
                            <span style={{ fontWeight: 'bold', color: '#666' }}>バーコード: </span>
                            <span>{item.barcode}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteHistoryItem(item.originalIndex)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  onClick={handleHistoryBatchSubmit}
                  style={{
                    padding: '15px 50px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}
                >
                  まとめて追加
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'new' | 'calendar' | 'stock'>('home'); 
  const [items, setItems] = useState<Item[]>([]);
  
  // NewFormの状態を保持
  const [newFormState, setNewFormState] = useState({
    newAddedItems: [] as Array<{genre: string, name: string, quantity: string, barcode: string}>,
    historyAddedItems: [] as Array<{genre: string, name: string, quantity: string, barcode: string}>,
    itemHistory: [] as Array<{genre: string, name: string}>
  });

  // NewFormの状態を更新する関数
  const updateNewFormState = (newState: Partial<typeof newFormState>) => {
    setNewFormState(prev => ({ ...prev, ...newState }));
  };

  // 商品追加関数
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

  // ジャンル別に商品を取得
  const getItemsByGenre = (genre: string) => {
    return items.filter(item => item.genre === genre);
  };

  // 全ジャンルを取得
  const getAllGenres = () => {
    const genres = items.map(item => item.genre);
    return Array.from(new Set(genres));
  };

  // ページ別コンポーネントを表示
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
        // ホーム画面
        const genres = getAllGenres();
        
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

            {/* 商品がない場合のメッセージ */}
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
                <h2 style={{
                  fontSize: '32px',
                  color: '#666',
                  margin: 0,
                  marginBottom: '20px'
                }}>まだ商品が追加されていません</h2>
                <p style={{
                  fontSize: '18px',
                  color: '#999',
                  margin: 0
                }}>「新規追加・買い出し」ボタンから商品を追加してください</p>
              </div>
            )}

            {/* ジャンル別商品表示 */}
            {genres.map((genre, index) => {
              const genreItems = getItemsByGenre(genre);
              return (
                <div key={genre} style={{ width: '100%', marginBottom: '52px' }}>
                  {/* ジャンル表示 */}
                  <div style={{
                    width: '100%',
                    textAlign: 'center',
                    marginBottom: '30px'
                  }}>
                    <h2 style={{
                      fontSize: '42px',
                      fontWeight: 'bold',
                      margin: 0,
                      color: '#333'
                    }}>ジャンル：{genre}</h2>
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
                          }}>商品名</th>
                          <th style={{
                            padding: '26px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '31px',
                            color: '#333',
                            backgroundColor: '#f8f9fa'
                          }}>個数</th>
                          <th style={{
                            padding: '26px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '31px',
                            color: '#333',
                            backgroundColor: '#f8f9fa'
                          }}>追加日</th>
                          <th style={{
                            padding: '26px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '31px',
                            color: '#333',
                            backgroundColor: '#f8f9fa'
                          }}>種類</th>
                        </tr>
                      </thead>
                      <tbody>
                        {genreItems.map((item) => (
                          <tr key={item.id}>
                            <td style={{
                              padding: '33px 26px',
                              textAlign: 'center',
                              fontSize: '24px',
                              color: '#333',
                              backgroundColor: '#ffffff'
                            }}>{item.name}</td>
                            <td style={{
                              padding: '33px 26px',
                              textAlign: 'center',
                              fontSize: '36px',
                              fontWeight: 'bold',
                              color: '#333',
                              backgroundColor: '#ffffff'
                            }}>{item.quantity}</td>
                            <td style={{
                              padding: '33px 26px',
                              textAlign: 'center',
                              fontSize: '18px',
                              color: '#666',
                              backgroundColor: '#ffffff'
                            }}>
                              {new Date(item.addedDate).toLocaleDateString('ja-JP')}
                            </td>
                            <td style={{
                              padding: '33px 26px',
                              textAlign: 'center',
                              fontSize: '16px',
                              backgroundColor: '#ffffff'
                            }}>
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