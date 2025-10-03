import React, { useState, useRef, useEffect, useCallback } from 'react';
import './new.css';

interface Item {
  genre: string;
  name: string;
  quantity: string;
  barcode: string;
}

interface FormState {
  newAddedItems: Item[];
  historyAddedItems: Item[];
  itemHistory: Array<{ genre: string; name: string }>;
}

interface Props {
  onBack?: () => void;
  onAddItems?: (items: Array<{ genre: string; name: string; quantity: number; barcode?: string }>, source: 'new' | 'history') => void;
  newFormState?: FormState;
  updateNewFormState?: (state: Partial<FormState>) => void;
}

const ScanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12a10 10 0 1 1 20 0a10 10 0 0 1-20 0z"></path>
    <path d="M12 2v20"></path>
    <path d="M2 12h20"></path>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

function NewItemForm({ onBack = () => {}, onAddItems = () => {}, newFormState = { newAddedItems: [], historyAddedItems: [], itemHistory: [] }, updateNewFormState = () => {} }: Props) {
  const { newAddedItems, historyAddedItems, itemHistory } = newFormState || { newAddedItems: [], historyAddedItems: [], itemHistory: [] };
  const [newItem, setNewItem] = useState<Item>({ genre: '', name: '', quantity: '1', barcode: '' });
  const [historyItem, setHistoryItem] = useState<{ genre: string; name: string; quantity: string }>({ genre: '', name: '', quantity: '1' });
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [isZxingLoaded, setIsZxingLoaded] = useState(false);
  const [localItemHistory, setLocalItemHistory] = useState<Array<{ genre: string; name: string }>>(itemHistory);
  const isProcessingRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScannedRef = useRef<string>("");

  const showMessage = useCallback((msg: string) => {
    setMessage(msg);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      setMessage("");
    }, 3000);
  }, []);

  useEffect(() => {
    setLocalItemHistory(itemHistory);
  }, [itemHistory]);

  useEffect(() => {
    const checkZxing = () => {
      try {
        return typeof (window as any).ZXing !== 'undefined' || typeof (window as any).BrowserMultiFormatReader !== 'undefined';
      } catch {
        return false;
      }
    };

    if (checkZxing()) {
      setIsZxingLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@zxing/library@0.19.1/umd/index.min.js';
    script.async = true;
    script.onload = () => {
      if (checkZxing()) {
        setIsZxingLoaded(true);
      } else {
        showMessage('バーコードスキャナーの初期化に失敗しました');
      }
    };
    script.onerror = () => {
      showMessage('バーコードスキャナーライブラリの読み込みに失敗しました');
      setIsZxingLoaded(false);
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [showMessage]);

  const stopScan = useCallback(() => {
    if (codeReaderRef.current) {
      try {
        if (typeof codeReaderRef.current.reset === 'function') {
          codeReaderRef.current.reset();
        }
        if (typeof codeReaderRef.current.stopContinuousDecode === 'function') {
          codeReaderRef.current.stopContinuousDecode();
        }
        codeReaderRef.current = null;
      } catch (e) {
        console.error('Reset error:', e);
      }
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
    isProcessingRef.current = false; 
    lastScannedRef.current = "";
  }, []);

  useEffect(() => {
    return () => stopScan();
  }, [stopScan]);

  const fetchProductInfo = async (barcode: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    try {
      showMessage(`バーコード: ${barcode} の商品情報を検索中...`);
      
      const RAKUTEN_APP_ID = '1079745700222105770';
      
      if (!RAKUTEN_APP_ID) {
        showMessage('楽天アプリケーションIDが設定されていません');
        setNewItem(prev => ({ ...prev, name: `商品コード: ${barcode}`, genre: "未分類" }));
        return;
      }
      
      const rakutenUrl = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?format=json&keyword=${barcode}&applicationId=${RAKUTEN_APP_ID}`;
      const response = await fetch(rakutenUrl);
      const data = await response.json();
      
      if (data.Items && data.Items.length > 0) {
        const item = data.Items[0].Item;
        const productName = item.itemName || "不明な商品";
        const genre = item.genreId ? `楽天カテゴリ${item.genreId}` : "一般商品";
        
        setNewItem(prev => ({ ...prev, name: productName, genre: genre }));
        showMessage(`楽天から商品情報を取得しました！`);
        return;
      }
      
      const offResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const offData = await offResponse.json();
      
      if (offData.status === 1) {
        const productName = offData.product.product_name || "不明な商品";
        const genre = (offData.product.categories?.split(",")[0].trim() || "食品");
        setNewItem(prev => ({ ...prev, name: productName, genre: genre }));
        showMessage(`Open Food Factsから商品情報を取得しました`);
        return;
      }
      
      showMessage(`商品が見つかりませんでした。手動で入力してください`);
      
    } catch (error) {
      console.error('API Error:', error);
      showMessage("商品情報取得エラー。手動で入力してください");
    } finally {
      stopScan();
    }
  };

  const startScan = useCallback(async () => {
    if (isScanning || !isZxingLoaded || isProcessingRef.current) return;
    
    if (codeReaderRef.current) {
      try {
        if (typeof codeReaderRef.current.reset === 'function') {
          codeReaderRef.current.reset();
        }
        if (typeof codeReaderRef.current.stopContinuousDecode === 'function') {
          codeReaderRef.current.stopContinuousDecode();
        }
      } catch (e) {
        console.error('Cleanup error:', e);
      }
      codeReaderRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setNewItem(prev => ({ ...prev, barcode: '' }));
    lastScannedRef.current = "";
    isProcessingRef.current = false;
    
    try {
      const ZXingClass = (window as any).ZXing?.BrowserMultiFormatReader || (window as any).BrowserMultiFormatReader;
      if (!ZXingClass) {
        showMessage("バーコードリーダーがロードされていません");
        return;
      }
      
      setIsScanning(true);
      showMessage("バーコードをスキャン中...");
      
      codeReaderRef.current = new ZXingClass();

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        showMessage("カメラが見つかりませんでした");
        stopScan();
        return;
      }
      
      const rearCamera = videoInputDevices.find((device: any) => 
        device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('environment')
      ) || videoInputDevices[0];

      codeReaderRef.current.decodeFromVideoDevice(rearCamera.deviceId, videoRef.current, (result: any, error: any) => {
        if (error && error.name !== 'NotFoundException') {
          return;
        }
        
        if (!result) return;
        if (isProcessingRef.current) return;
        
        const code = result.getText();
        
        if (!code) return;
        if (code === lastScannedRef.current) return;
        
        lastScannedRef.current = code;
        setNewItem(prev => ({ ...prev, barcode: code }));
        fetchProductInfo(code);
      });

    } catch (error) {
      console.error('Start scan error:', error);
      setIsScanning(false);
      isProcessingRef.current = false;
      showMessage("カメラへのアクセスに失敗しました");
    }
  }, [isScanning, isZxingLoaded, showMessage, stopScan]);

  const handleNewItemChange = (field: keyof Item, value: string) => {
    const cleanValue = field === 'quantity' ? value.replace(/[^0-9]/g, '') : value;
    setNewItem(prev => ({ ...prev, [field]: cleanValue }));
  };

  const handleHistoryItemChange = (field: string, value: string) => {
    const cleanValue = field === 'quantity' ? value.replace(/[^0-9]/g, '') : value;
    setHistoryItem(prev => ({ ...prev, [field]: cleanValue }));
  };

  const handleNewItemSubmit = () => {
    const quantity = parseInt(newItem.quantity) || 0;
    if (!newItem.genre || !newItem.name || quantity <= 0) {
      showMessage('ジャンル、名前、個数は必須です');
      return;
    }
    
    const exists = localItemHistory.some(h => h.genre === newItem.genre && h.name === newItem.name);
    const updatedHistory = exists ? localItemHistory : [...localItemHistory, { genre: newItem.genre, name: newItem.name }];
    
    if (!exists) {
      setLocalItemHistory(updatedHistory);
    }
    
    updateNewFormState({ 
      itemHistory: updatedHistory,
      newAddedItems: [...newAddedItems, { ...newItem, quantity: String(quantity) }] 
    });
    
    stopScan();
    setNewItem({ genre: '', name: '', quantity: '1', barcode: '' });
    
    showMessage('項目を追加しました');
  };

  const handleHistoryItemSubmit = () => {
    const quantity = parseInt(historyItem.quantity) || 0;
    if (!historyItem.genre || !historyItem.name || quantity <= 0) {
      showMessage('ジャンル、名前、個数を選択してください');
      return;
    }
    updateNewFormState({ historyAddedItems: [...historyAddedItems, { ...historyItem, quantity: String(quantity), barcode: '' }] });
    setHistoryItem(prev => ({ ...prev, quantity: '1' }));
    showMessage('項目を追加しました');
  };

  const handleNewBatchSubmit = () => {
    if (newAddedItems.length === 0) {
      showMessage('追加する商品がありません');
      return;
    }
    onAddItems(newAddedItems.map(item => ({ genre: item.genre, name: item.name, quantity: parseInt(item.quantity) || 0, barcode: item.barcode })), 'new');
    showMessage(`${newAddedItems.length}件の商品をまとめて追加しました！`);
    updateNewFormState({ newAddedItems: [] });
  };

  const handleHistoryBatchSubmit = () => {
    if (historyAddedItems.length === 0) {
      showMessage('追加する商品がありません');
      return;
    }
    onAddItems(historyAddedItems.map(item => ({ genre: item.genre, name: item.name, quantity: parseInt(item.quantity) || 0 })), 'history');
    showMessage(`${historyAddedItems.length}件の商品をまとめて追加しました！`);
    updateNewFormState({ historyAddedItems: [] });
  };

  const groupItemsByGenre = (items: Item[]) => {
    return items.reduce((acc: Record<string, Array<Item & { originalIndex: number }>>, item: Item, index: number) => {
      if (!acc[item.genre]) acc[item.genre] = [];
      acc[item.genre].push({ ...item, originalIndex: index });
      return acc;
    }, {});
  };

  const uniqueGenres = Array.from(new Set(localItemHistory.map(item => item.genre))).filter((g: string) => g);
  const namesForSelectedGenre = localItemHistory.filter(item => item.genre === historyItem.genre).map(item => item.name);
  const groupedNewItems = groupItemsByGenre(newAddedItems);
  const groupedHistoryItems = groupItemsByGenre(historyAddedItems);

  useEffect(() => {
  }, [itemHistory, localItemHistory, uniqueGenres]);

  return (
    <div className="new-main-container">
      {showNotification && <div className="new-notification">{message}</div>}

      <div className="new-header">
        <button onClick={onBack} className="new-btn-back">
          <BackIcon /> ホームに戻る
        </button>
        <h2 className="new-page-title">新規追加(買い出し)画面</h2>
      </div>

      <div className="new-card">
        <h3 className="new-section-title primary">新規：追加</h3>
        
        {isScanning && (
          <div className="new-scan-area">
            <div className="new-video-container">
              <video ref={videoRef} autoPlay playsInline muted />
            </div>
            <p className="new-scan-message">{message || "バーコードをカメラに合わせてください"}</p>
            <button onClick={stopScan} className="new-btn-primary new-btn-stop-scan">スキャンを停止</button>
          </div>
        )}

        <div className="new-form-grid-2">
          <div className="new-form-field">
            <div className="new-field-label">ジャンル：</div>
            <input 
              type="text" 
              value={newItem.genre} 
              onChange={(e) => handleNewItemChange('genre', e.target.value)} 
              className="new-input-field" 
              disabled={isScanning} 
              placeholder="例: 野菜" 
            />
          </div>
          <div className="new-form-field">
            <div className="new-field-label">名前：</div>
            <input 
              type="text"value={newItem.name} 
              onChange={(e) => handleNewItemChange('name', e.target.value)} 
              className="new-input-field" 
              disabled={isScanning} 
              placeholder="例: じゃがいも" 
            />
          </div>
        </div>

        <div className="new-form-grid-mixed">
          <div className="new-form-field">
            <div className="new-field-label">個数：</div>
            <div className="new-quantity-control">
              <button 
                onClick={() => { 
                  const q = parseInt(newItem.quantity) || 0; 
                  handleNewItemChange('quantity', String(q + 1)); 
                }} 
                className="new-btn-icon-round plus" 
                disabled={isScanning}
              >
                <PlusIcon />
              </button>
              <input 
                type="number" 
                value={newItem.quantity} 
                onChange={(e) => handleNewItemChange('quantity', e.target.value)} 
                className="new-input-field new-quantity-input" 
                disabled={isScanning} 
              />
              <button 
                onClick={() => { 
                  const q = parseInt(newItem.quantity) || 0; 
                  if (q > 1) handleNewItemChange('quantity', String(q - 1)); 
                }} 
                className="new-btn-icon-round minus" 
                disabled={isScanning || (parseInt(newItem.quantity) || 0) <= 1}
              >
                <MinusIcon />
              </button>
            </div>
          </div>
          <div className="new-form-field">
            <div className="new-field-label">バーコード & スキャン：</div>
            <div className="new-barcode-control">
              <input 
                type="text" 
                value={newItem.barcode} 
                onChange={(e) => handleNewItemChange('barcode', e.target.value)} 
                className="new-input-field" 
                disabled={isScanning} 
                placeholder="バーコード" 
              />
              <button 
                onClick={isScanning ? stopScan : startScan} 
                className={`new-btn-icon-round scan ${isScanning ? 'scanning' : ''}`}
                disabled={!isZxingLoaded && !isScanning}
              >
                <ScanIcon />
              </button>
            </div>
          </div>
        </div>
        
        <div className="new-submit-area">
          <button 
            onClick={handleNewItemSubmit} 
            className="new-btn-primary new-btn-submit" 
            disabled={isScanning || !newItem.name || !newItem.genre || (parseInt(newItem.quantity) || 0) <= 0}
          >
            ＋ 項目を追加リストへ
          </button>
        </div>

        {newAddedItems.length > 0 && (
          <div className="new-added-list">
            <h4 className="new-added-list-title">新規追加予定の商品 ({newAddedItems.length}件)</h4>
            <div className="new-added-list-container">
              {Object.entries(groupedNewItems).map(([genre, items]) => (
                <div key={genre} className="new-genre-group">
                  <div className="new-genre-group-title primary">{genre}</div>
                  {(items as Array<Item & { originalIndex: number }>).map((item) => (
                    <div key={item.originalIndex} className="new-item-card">
                      <div className="new-item-info">
                        <span className="new-item-name">{item.name}</span>
                        <span className="new-item-quantity">({item.quantity}個)</span>
                      </div>
                      <button 
                        onClick={() => updateNewFormState({ newAddedItems: newAddedItems.filter((_, i) => i !== item.originalIndex) })} 
                        className="new-btn-delete"
                      >
                        <TrashIcon /> 削除
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              <div className="new-batch-submit-area">
                <button onClick={handleNewBatchSubmit} className="new-btn-primary new-btn-batch-submit">
                  全てまとめて登録
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="new-card">
        <h3 className="new-section-title secondary">履歴：追加 (履歴: {localItemHistory.length}件)</h3>
        <div className="new-form-grid-3">
          <div className="new-form-field">
            <div className="new-field-label">ジャンル：</div>
            <select 
              value={historyItem.genre} 
              onChange={(e) => { 
                handleHistoryItemChange('genre', e.target.value); 
                setHistoryItem(prev => ({ ...prev, name: '' })); 
              }} 
              disabled={uniqueGenres.length === 0} 
              className="new-input-field"
            >
              <option value="">選択してください</option>
              {uniqueGenres.map((genre, i) => <option key={i} value={genre}>{genre}</option>)}
            </select>
          </div>
          <div className="new-form-field">
            <div className="new-field-label">名前：</div>
            <select 
              value={historyItem.name} 
              onChange={(e) => handleHistoryItemChange('name', e.target.value)} 
              disabled={!historyItem.genre || namesForSelectedGenre.length === 0} 
              className="new-input-field"
            >
              <option value="">選択してください</option>
              {namesForSelectedGenre.map((name, i) => <option key={i} value={name}>{name}</option>)}
            </select>
          </div>
          <div className="new-form-field">
            <div className="new-field-label">個数：</div>
            <div className="new-quantity-control">
              <button 
                onClick={() => { 
                  const q = parseInt(historyItem.quantity) || 0; 
                  handleHistoryItemChange('quantity', String(q + 1)); 
                }} 
                className="new-btn-icon-round plus"
              >
                <PlusIcon />
              </button>
              <input 
                type="number" 
                value={historyItem.quantity} 
                onChange={(e) => handleHistoryItemChange('quantity', e.target.value)} 
                className="new-input-field new-quantity-input" 
              />
              <button 
                onClick={() => { 
                  const q = parseInt(historyItem.quantity) || 0; 
                  if (q > 1) handleHistoryItemChange('quantity', String(q - 1)); 
                }} 
                className="new-btn-icon-round minus" 
                disabled={(parseInt(historyItem.quantity) || 0) <= 1}
              >
                <MinusIcon />
              </button>
            </div>
          </div>
        </div>
        <div className="new-submit-area">
          <button 
            onClick={handleHistoryItemSubmit} 
            className="new-btn-primary new-btn-submit" 
            disabled={!historyItem.name || !historyItem.genre || (parseInt(historyItem.quantity) || 0) <= 0}
          >
            ＋ 項目を追加リストへ
          </button>
        </div>
        {historyAddedItems.length > 0 && (
          <div className="new-added-list">
            <h4 className="new-added-list-title">履歴追加予定の商品 ({historyAddedItems.length}件)</h4>
            <div className="new-added-list-container">
              {Object.entries(groupedHistoryItems).map(([genre, items]) => (
                <div key={genre} className="new-genre-group">
                  <div className="new-genre-group-title secondary">{genre}</div>
                  {(items as Array<Item & { originalIndex: number }>).map((item) => (
                    <div key={item.originalIndex} className="new-item-card">
                      <div className="new-item-info">
                        <span className="new-item-name">{item.name}</span>
                        <span className="new-item-quantity">({item.quantity}個)</span>
                      </div>
                      <button 
                        onClick={() => updateNewFormState({ historyAddedItems: historyAddedItems.filter((_, i) => i !== item.originalIndex) })} 
                        className="new-btn-delete"
                      >
                        <TrashIcon /> 削除
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              <div className="new-batch-submit-area">
                <button onClick={handleHistoryBatchSubmit} className="new-btn-primary new-btn-batch-submit">
                  全てまとめて登録
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewItemForm;