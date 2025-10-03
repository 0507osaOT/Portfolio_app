import React, { useState } from 'react';
import './stock.css';

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
    <div className="stock-main-container">
      <div className="stock-header">
        <button onClick={onBack} className="stock-back-button">
          ← ホームに戻る
        </button>
        <h2 className="stock-title">ストック管理</h2>
        <div className="stock-spacer"></div>
      </div>

      {items.length === 0 && (
        <div className="stock-empty-state">
          <h2 className="stock-empty-title">まだ商品が追加されていません</h2>
          <p className="stock-empty-description">「新規追加・買い出し」ボタンから商品を追加してください</p>
        </div>
      )}

      {Object.entries(groupedItems).map(([genre, genreItems]) => (
        <div key={genre} className="stock-genre-section">
          <div className="stock-genre-header">
            <h2 className="stock-genre-title">{genre}</h2>
          </div>

          <div className="stock-genre-container">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>商品名</th>
                  <th>個数</th>
                  <th>追加日</th>
                  <th>種類</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {genreItems.map((item) => (
                  <tr key={item.id}>
                    <td className="stock-name-cell">
                      {editingItem === item.id ? (
                        <input
                          type="text"
                          value={editValues.name}
                          onChange={(e) => handleEditChange('name', e.target.value)}
                          className="stock-name-input"
                          autoFocus
                        />
                      ) : (
                        item.name
                      )}
                    </td>

                    <td className="stock-quantity-cell">
                      {editingItem === item.id ? (
                        <div className="stock-quantity-edit-container">
                          <input
                            type="text"
                            value={editValues.quantity}
                            readOnly
                            className="stock-quantity-input"
                          />
                          <button
                            onClick={() => handleQuantityChange(true)}
                            className="stock-btn-quantity stock-btn-quantity-plus"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleQuantityChange(false)}
                            className="stock-btn-quantity stock-btn-quantity-minus"
                          >
                            −
                          </button>
                        </div>
                      ) : (
                        item.quantity
                      )}
                    </td>

                    <td className="stock-date-cell">
                      {new Date(item.addedDate).toLocaleDateString('ja-JP')}
                    </td>

                    <td className="stock-type-cell">
                      <span className={`stock-type-badge ${item.source === 'new' ? 'new' : 'history'}`}>
                        {item.source === 'new' ? '新規' : '履歴'}
                      </span>
                    </td>

                    <td>
                      {editingItem === item.id ? (
                        <div className="stock-actions-container">
                          <button onClick={handleEditSave} className="stock-btn stock-btn-save">
                            保存
                          </button>
                          <button onClick={handleEditCancel} className="stock-btn stock-btn-cancel">
                            キャンセル
                          </button>
                        </div>
                      ) : (
                        <div className="stock-actions-container">
                          <button
                            onClick={() => handleEditStart(item.id, item.name, item.quantity)}
                            className="stock-btn stock-btn-edit"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="stock-btn stock-btn-delete"
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