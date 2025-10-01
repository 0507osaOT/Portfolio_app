import React, { useState } from 'react';

interface Item {
  id: string;
  genre: string;
  name: string;
  quantity: number;
  barcode?: string;
  addedDate: string;
  source: 'new' | 'history';
}

interface StockProps {
  onBack: () => void;
  items: Item[];
  onUpdateItems: (updatedItems: Item[]) => void;
}

const Stock: React.FC<StockProps> = ({ onBack, items, onUpdateItems }) => {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; quantity: string }>({ name: '', quantity: '' });

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.genre]) {
      acc[item.genre] = [];
    }
    acc[item.genre].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  const handleEditStart = (itemId: string, currentName: string, currentQuantity: number) => {
    setEditingItem(itemId);
    setEditValues({
      name: currentName,
      quantity: currentQuantity.toString()
    });
  };

  const handleEditChange = (field: 'name' | 'quantity', value: string) => {
    setEditValues({
      ...editValues,
      [field]: value
    });
  };

  const handleQuantityChange = (increment: boolean) => {
    const currentQty = parseInt(editValues.quantity) || 0;
    if (increment) {
      setEditValues({ ...editValues, quantity: String(currentQty + 1) });
    } else if (currentQty > 0) {
      setEditValues({ ...editValues, quantity: String(currentQty - 1) });
    }
  };

  const handleEditSave = () => {
    if (!editValues.name.trim() || !editValues.quantity) {
      alert('名前と個数は必須です');
      return;
    }

    const quantity = parseInt(editValues.quantity);
    if (isNaN(quantity) || quantity < 0) {
      alert('個数は0以上の数値を入力してください');
      return;
    }

    const updatedItems = items.map(item =>
      item.id === editingItem
        ? {
            ...item,
            name: editValues.name.trim(),
            quantity: quantity
          }
        : item
    );

    onUpdateItems(updatedItems);
    setEditingItem(null);
    setEditValues({ name: '', quantity: '' });
  };

  const handleEditCancel = () => {
    setEditingItem(null);
    setEditValues({ name: '', quantity: '' });
  };

  const handleDelete = (itemId: string, itemName: string) => {
    if (window.confirm(`「${itemName}」を削除しますか？`)) {
      const updatedItems = items.filter(item => item.id !== itemId);
      onUpdateItems(updatedItems);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      <style>{`
        .btn-back {
          padding: 12px 24px;
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 18px;
          font-weight: bold;
          transition: all 0.2s ease;
        }
        .btn-back:hover {
          background-color: #5a6268;
          transform: translateY(-1px);
        }
        
        .btn-edit {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.2s ease;
        }
        .btn-edit:hover {
          background-color: #0056b3;
          transform: translateY(-1px);
        }
        
        .btn-delete {
          padding: 8px 16px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.2s ease;
        }
        .btn-delete:hover {
          background-color: #c82333;
          transform: translateY(-1px);
        }
        
        .btn-save {
          padding: 8px 16px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.2s ease;
        }
        .btn-save:hover {
          background-color: #218838;
          transform: translateY(-1px);
        }
        
        .btn-cancel {
          padding: 8px 16px;
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.2s ease;
        }
        .btn-cancel:hover {
          background-color: #5a6268;
          transform: translateY(-1px);
        }
        
        .btn-quantity {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: white;
          border: none;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          transition: all 0.2s ease;
        }
        .btn-quantity:hover {
          transform: scale(1.1);
        }
        .btn-quantity-plus {
          background-color: #000;
        }
        .btn-quantity-minus {
          background-color: #dc3545;
        }
      `}</style>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        <button onClick={onBack} className="btn-back">
          ← ホームに戻る
        </button>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          margin: 0,
          color: '#333'
        }}>ストック管理</h2>
        <div style={{ width: '140px' }}></div>
      </div>

      {items.length === 0 && (
        <div style={{
          width: '100%',
          textAlign: 'center',
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

      {Object.entries(groupedItems).map(([genre, genreItems]) => (
        <div key={genre} style={{ width: '100%', marginBottom: '52px' }}>
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
            }}>{genre}</h2>
          </div>

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
                    backgroundColor: '#f8f9fa',
                    whiteSpace: 'nowrap'
                  }}>商品名</th>
                  <th style={{
                    padding: '26px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '31px',
                    color: '#333',
                    backgroundColor: '#f8f9fa',
                    whiteSpace: 'nowrap'
                  }}>個数</th>
                  <th style={{
                    padding: '26px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '31px',
                    color: '#333',
                    backgroundColor: '#f8f9fa',
                    whiteSpace: 'nowrap' 
                  }}>追加日</th>
                  <th style={{
                    padding: '26px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '31px',
                    color: '#333',
                    backgroundColor: '#f8f9fa',
                    whiteSpace: 'nowrap'  
                  }}>種類</th>
                  <th style={{
                    padding: '26px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '31px',
                    color: '#333',
                    backgroundColor: '#f8f9fa',
                    whiteSpace: 'nowrap'  
                  }}>操作</th>
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
                    }}>
                      {editingItem === item.id ? (
                        <input
                          type="text"
                          value={editValues.name}
                          onChange={(e) => handleEditChange('name', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '20px',
                            border: '2px solid #007bff',
                            borderRadius: '6px',
                            textAlign: 'center',
                            boxSizing: 'border-box'
                          }}
                          autoFocus
                        />
                      ) : (
                        item.name
                      )}
                    </td>

                    <td style={{
                      padding: '33px 26px',
                      textAlign: 'center',
                      fontSize: '36px',
                      fontWeight: 'bold',
                      color: '#333',
                      backgroundColor: '#ffffff'
                    }}>
                      {editingItem === item.id ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          gap: '10px' 
                        }}>
                          <input
                            type="text"
                            value={editValues.quantity}
                            readOnly
                            style={{
                              width: '80px',
                              padding: '8px 12px',
                              fontSize: '28px',
                              border: '2px solid #007bff',
                              borderRadius: '6px',
                              textAlign: 'center',
                              boxSizing: 'border-box',
                              fontWeight: 'bold',
                              backgroundColor: '#f8f9fa',
                              cursor: 'default'
                            }}
                          />
                          <button
                            onClick={() => handleQuantityChange(true)}
                            className="btn-quantity btn-quantity-plus"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleQuantityChange(false)}
                            className="btn-quantity btn-quantity-minus"
                          >
                            −
                          </button>
                        </div>
                      ) : (
                        item.quantity
                      )}
                    </td>

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

                    <td style={{
                      padding: '33px 26px',
                      textAlign: 'center',
                      backgroundColor: '#ffffff'
                    }}>
                      {editingItem === item.id ? (
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <button onClick={handleEditSave} className="btn-save">
                            保存
                          </button>
                          <button onClick={handleEditCancel} className="btn-cancel">
                            キャンセル
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <button
                            onClick={() => handleEditStart(item.id, item.name, item.quantity)}
                            className="btn-edit"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="btn-delete"
                          >
                            削除
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stock;