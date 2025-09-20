import React, { useState } from 'react';

interface NewItemFormProps {
  onBack: () => void;
}

interface NewItem {
  genre: string;
  name: string;
  quantity: string;
  barcode: string;
}

interface HistoryItem {
  genre: string;
  name: string;
  quantity: string;
}

function NewItemForm({ onBack }: NewItemFormProps) {
  // フォームの状態管理
  const [newItem, setNewItem] = useState<NewItem>({
    genre: '',
    name: '',
    quantity: '',
    barcode: ''
  });
  
  const [historyItem, setHistoryItem] = useState<HistoryItem>({
    genre: '',
    name: '',
    quantity: ''
  });

  // フォーム入力処理
  const handleNewItemChange = (field: keyof NewItem, value: string) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  };

  const handleHistoryItemChange = (field: keyof HistoryItem, value: string) => {
    setHistoryItem(prev => ({ ...prev, [field]: value }));
  };

  // フォーム送信処理
  const handleNewItemSubmit = () => {
    console.log('新規追加:', newItem);
    alert('商品を追加しました！');
    setNewItem({ genre: '', name: '', quantity: '', barcode: '' });
  };

  const handleHistoryItemSubmit = () => {
    console.log('履歴から追加:', historyItem);
    alert('履歴から商品を追加しました！');
    setHistoryItem({ genre: '', name: '', quantity: '' });
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px' }}>
      {/* ページヘッダー */}
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

      {/* 新規追加セクション */}
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
            <div style={{
              fontSize: '18px',
              marginBottom: '8px',
              color: '#333'
            }}>ジャンル：</div>
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
            <div style={{
              fontSize: '18px',
              marginBottom: '8px',
              color: '#333'
            }}>名前：</div>
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
            <div style={{
              fontSize: '18px',
              marginBottom: '8px',
              color: '#333'
            }}>個数：</div>
            <input
              type="number"
              value={newItem.quantity}
              onChange={(e) => handleNewItemChange('quantity', e.target.value)}
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
            <div style={{
              fontSize: '18px',
              marginBottom: '8px',
              color: '#333'
            }}>バーコード</div>
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
      </div>

      {/* 履歴追加セクション */}
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
            <div style={{
              fontSize: '18px',
              marginBottom: '8px',
              color: '#333'
            }}>ジャンル：</div>
            <input
              type="text"
              value={historyItem.genre}
              onChange={(e) => handleHistoryItemChange('genre', e.target.value)}
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
            <div style={{
              fontSize: '18px',
              marginBottom: '8px',
              color: '#333'
            }}>名前：</div>
            <input
              type="text"
              value={historyItem.name}
              onChange={(e) => handleHistoryItemChange('name', e.target.value)}
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
            <div style={{
              fontSize: '18px',
              marginBottom: '8px',
              color: '#333'
            }}>個数：</div>
            <input
              type="number"
              value={historyItem.quantity}
              onChange={(e) => handleHistoryItemChange('quantity', e.target.value)}
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
            onClick={handleHistoryItemSubmit}
            style={{
              padding: '15px 40px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: 'bold'
            }}
          >
            履歴から追加
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewItemForm;