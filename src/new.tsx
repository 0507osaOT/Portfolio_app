import React, { useState, useRef, useEffect, useCallback } from 'react';

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
    // codeReaderを完全に破棄
    if (codeReaderRef.current) {
      try {
        if (typeof codeReaderRef.current.reset === 'function') {
          codeReaderRef.current.reset();
        }
        // デコード処理を完全に停止
        if (typeof codeReaderRef.current.stopContinuousDecode === 'function') {
          codeReaderRef.current.stopContinuousDecode();
        }
        // codeReaderを完全にクリア
        codeReaderRef.current = null;
      } catch (e) {
        console.error('Reset error:', e);
      }
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // videoのsrcObjectもクリア
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
    
    // 前回の状態を完全にクリア
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
      
      // 新しいインスタンスを作成
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
        // エラーがある場合は無視（スキャン中の正常なエラー）
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
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <style>{`
        .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .btn-primary { background: #6c757d; color: white; font-weight: bold; padding: 16px 32px; border-radius: 12px; transition: all 300ms; display: flex; align-items: center; justify-content: center; gap: 12px; cursor: pointer; border: none; font-size: 20px; }
        .btn-primary:hover:not(:disabled) { background: #5a6268; transform: scale(1.02); }
        .btn-primary:disabled { background: #9ca3af; cursor: not-allowed; }
        .btn-icon-round { width: 56px; height: 56px; border-radius: 50%; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 200ms; }
        .btn-icon-round:disabled { background: #d1d5db !important; cursor: not-allowed; opacity: 0.5; }
        .btn-icon-round:hover:not(:disabled) { transform: scale(1.1); }
        .btn-back { padding: 14px 28px; background: #6c757d; color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 20px; font-weight: bold; display: flex; align-items: center; gap: 10px; transition: all 200ms; }
        .btn-back:hover { background: #5a6268; transform: translateY(-1px); }
        .btn-stop-scan { background: #dc3545; padding: 18px 40px; font-size: 22px; transition: all 200ms; }
        .btn-stop-scan:hover { background: #c82333; }
        .btn-submit { padding: 20px 50px; font-size: 24px; }
        .btn-batch-submit { background: #28a745; padding: 20px 60px; font-size: 24px; }
        .btn-batch-submit:hover { background: #218838; }
        .btn-delete { padding: 12px 24px; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: bold; transition: all 200ms; }
        .btn-delete:hover { background: #c82333; transform: translateY(-1px); }
        .notification { position: fixed; top: 20px; left: 50%; transform: translate(-50%,0); z-index: 50; background: #3b82f6; color: white; padding: 16px 32px; border-radius: 9999px; font-size: 18px; font-weight: bold; }
        .input-field { width: 100%; padding: 18px; border: 1px solid #d1d5db; border-radius: 12px; font-size: 20px; }
        .input-field:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.3); }
        .quantity-input { width: 90px; text-align: center; padding: 18px; font-size: 24px; font-weight: bold; border: 2px solid #d1d5db; }
        .video-container { width: 100%; max-width: 500px; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; border: 4px solid #007bff; margin: 0 auto; }
        .video-container video { width: 100%; height: 100%; object-fit: cover; }
      `}</style>

      {showNotification && <div className="notification">{message}</div>}

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', gap: '20px' }}>
        <button onClick={onBack} className="btn-back">
          <BackIcon /> ホームに戻る
        </button>
        <h2 style={{ fontSize: '42px', fontWeight: 'bold', margin: 0 }}>新規追加(買い出し)画面</h2>
      </div>

      <div className="card" style={{ marginBottom: '50px' }}>
        <h3 style={{ fontSize: '38px', fontWeight: 'bold', marginBottom: '35px', borderBottom: '4px solid #007bff', paddingBottom: '12px' }}>新規：追加</h3>
        
        {isScanning && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px', background: '#f0f8ff', padding: '30px', borderRadius: '15px' }}>
            <div className="video-container">
              <video ref={videoRef} autoPlay playsInline muted />
            </div>
            <p style={{ marginTop: '20px', color: '#007bff', fontWeight: 'bold', fontSize: '22px' }}>{message || "バーコードをカメラに合わせてください"}</p>
            <button onClick={stopScan} className="btn-primary btn-stop-scan">スキャンを停止</button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '35px', marginBottom: '35px' }}>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '12px', fontWeight: 'bold', color: '#333' }}>ジャンル：</div>
            <input type="text" value={newItem.genre} onChange={(e) => handleNewItemChange('genre', e.target.value)} className="input-field" disabled={isScanning} placeholder="例: 野菜" />
          </div>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '12px', fontWeight: 'bold', color: '#333' }}>名前：</div>
            <input type="text" value={newItem.name} onChange={(e) => handleNewItemChange('name', e.target.value)} className="input-field" disabled={isScanning} placeholder="例: じゃがいも" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '35px', marginBottom: '40px' }}>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '12px', fontWeight: 'bold', color: '#333' }}>個数：</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button onClick={() => { const q = parseInt(newItem.quantity) || 0; handleNewItemChange('quantity', String(q + 1)); }} className="btn-icon-round" style={{ background: '#000' }} disabled={isScanning}><PlusIcon /></button>
              <input type="number" value={newItem.quantity} onChange={(e) => handleNewItemChange('quantity', e.target.value)} className="input-field quantity-input" disabled={isScanning} />
              <button onClick={() => { const q = parseInt(newItem.quantity) || 0; if (q > 1) handleNewItemChange('quantity', String(q - 1)); }} className="btn-icon-round" style={{ background: '#dc3545' }} disabled={isScanning || (parseInt(newItem.quantity) || 0) <= 1}><MinusIcon /></button>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '12px', fontWeight: 'bold', color: '#333' }}>バーコード & スキャン：</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <input type="text" value={newItem.barcode} onChange={(e) => handleNewItemChange('barcode', e.target.value)} className="input-field" disabled={isScanning} placeholder="バーコード" />
              <button onClick={isScanning ? stopScan : startScan} className="btn-icon-round" style={{ background: isScanning ? '#dc3545' : '#007bff', flexShrink: 0 }} disabled={!isZxingLoaded && !isScanning}><ScanIcon /></button>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '45px' }}>
          <button onClick={handleNewItemSubmit} className="btn-primary btn-submit" disabled={isScanning || !newItem.name || !newItem.genre || (parseInt(newItem.quantity) || 0) <= 0}>
            ＋ 項目を追加リストへ
          </button>
        </div>

        {newAddedItems.length > 0 && (
          <div style={{ marginTop: '50px' }}>
            <h4 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '25px', color: '#333' }}>新規追加予定の商品 ({newAddedItems.length}件)</h4>
            <div style={{ background: '#f8f9fa', padding: '30px', borderRadius: '12px' }}>
              {Object.entries(groupedNewItems).map(([genre, items]) => (
                <div key={genre} style={{ marginBottom: '30px' }}>
                  <div style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '20px', color: '#007bff', borderLeft: '5px solid #007bff', paddingLeft: '15px' }}>{genre}</div>
                  {(items as Array<Item & { originalIndex: number }>).map((item) => (
                    <div key={item.originalIndex} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '22px 28px', marginBottom: '12px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', gap: '35px', flex: 1, alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '22px', color: '#333' }}>{item.name}</span>
                        <span style={{ color: '#666', fontSize: '20px' }}>({item.quantity}個)</span>
                      </div>
                      <button onClick={() => updateNewFormState({ newAddedItems: newAddedItems.filter((_, i) => i !== item.originalIndex) })} className="btn-delete">
                        <TrashIcon /> 削除
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ textAlign: 'center', marginTop: '35px' }}>
                <button onClick={handleNewBatchSubmit} className="btn-primary btn-batch-submit">全てまとめて登録</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ fontSize: '38px', fontWeight: 'bold', marginBottom: '35px', borderBottom: '4px solid #6c757d', paddingBottom: '12px' }}>履歴：追加 (履歴: {localItemHistory.length}件)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 350px', gap: '35px', marginBottom: '40px' }}>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '12px', fontWeight: 'bold', color: '#333' }}>ジャンル：</div>
            <select value={historyItem.genre} onChange={(e) => { handleHistoryItemChange('genre', e.target.value); setHistoryItem(prev => ({ ...prev, name: '' })); }} disabled={uniqueGenres.length === 0} className="input-field" style={{ fontSize: '20px' }}>
              <option value="">選択してください</option>
              {uniqueGenres.map((genre, i) => <option key={i} value={genre}>{genre}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '12px', fontWeight: 'bold', color: '#333' }}>名前：</div>
            <select value={historyItem.name} onChange={(e) => handleHistoryItemChange('name', e.target.value)} disabled={!historyItem.genre || namesForSelectedGenre.length === 0} className="input-field" style={{ fontSize: '20px' }}>
              <option value="">選択してください</option>
              {namesForSelectedGenre.map((name, i) => <option key={i} value={name}>{name}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '12px', fontWeight: 'bold', color: '#333' }}>個数：</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button onClick={() => { const q = parseInt(historyItem.quantity) || 0; handleHistoryItemChange('quantity', String(q + 1)); }} className="btn-icon-round" style={{ background: '#000' }}><PlusIcon /></button>
              <input type="number" value={historyItem.quantity} onChange={(e) => handleHistoryItemChange('quantity', e.target.value)} className="input-field quantity-input" />
              <button onClick={() => { const q = parseInt(historyItem.quantity) || 0; if (q > 1) handleHistoryItemChange('quantity', String(q - 1)); }} className="btn-icon-round" style={{ background: '#dc3545' }} disabled={(parseInt(historyItem.quantity) || 0) <= 1}><MinusIcon /></button>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '45px' }}>
            <button onClick={handleHistoryItemSubmit} className="btn-primary btn-submit" disabled={!historyItem.name || !historyItem.genre || (parseInt(historyItem.quantity) || 0) <= 0}>
              ＋ 項目を追加リストへ
            </button>
          </div>
          {historyAddedItems.length > 0 && (
            <div style={{ marginTop: '50px' }}>
              <h4 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '25px', color: '#333' }}>履歴追加予定の商品 ({historyAddedItems.length}件)</h4>
              <div style={{ background: '#f8f9fa', padding: '30px', borderRadius: '12px' }}>
                {Object.entries(groupedHistoryItems).map(([genre, items]) => (
                  <div key={genre} style={{ marginBottom: '30px' }}>
                    <div style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '20px', color: '#6c757d', borderLeft: '5px solid #6c757d', paddingLeft: '15px' }}>{genre}</div>
                    {(items as Array<Item & { originalIndex: number }>).map((item) => (
                      <div key={item.originalIndex} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '22px 28px', marginBottom: '12px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', gap: '35px', flex: 1, alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '22px', color: '#333' }}>{item.name}</span>
                          <span style={{ color: '#666', fontSize: '20px' }}>({item.quantity}個)</span>
                        </div>
                        <button onClick={() => updateNewFormState({ historyAddedItems: historyAddedItems.filter((_, i) => i !== item.originalIndex) })} className="btn-delete">
                          <TrashIcon /> 削除
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
                <div style={{ textAlign: 'center', marginTop: '35px' }}>
                  <button onClick={handleHistoryBatchSubmit} className="btn-primary btn-batch-submit">全てまとめて登録</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  export default NewItemForm;