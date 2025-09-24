import React, { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

// アイコンをインラインSVGとして定義します。
const ScanIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
  >
    <path d="M2 12a10 10 0 1 1 20 0a10 10 0 0 1-20 0z"></path>
    <path d="M12 2v20"></path>
    <path d="M2 12h20"></path>
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const MinusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const BackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

type NewItem = {
  genre: string;
  name: string;
  quantity: number;
  barcode: string;
};

type NewFormState = {
  items: NewItem[];
};

type NewItemFormProps = {
  onBack: () => void;
  onAddItems: (items: NewItem[]) => void;
  newFormState: NewFormState;
  updateNewFormState: (state: NewFormState) => void;
};

function NewItemForm({
  onBack,
  newFormState,
  updateNewFormState,
}: NewItemFormProps) {
  const [newItem, setNewItem] = useState<NewItem>({
    genre: "",
    name: "",
    quantity: 0,
    barcode: "",
  });
  const [message, setMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  // 通知メッセージの表示
  const showMessage = (msg: string) => {
    setMessage(msg);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      setMessage("");
    }, 3000);
  };

  // 入力変更
  const handleNewItemChange = (field: keyof NewItem, value: string | number) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  // 商品情報をAPIから取得（Open Food Facts APIを使用）
  const fetchProductInfo = async (barcode: string) => {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1) {
        const productName = data.product.product_name || "不明な商品";
        const categories = data.product.categories || "";
        const genre = categories.split(",")[0].trim() || "不明なジャンル";

        handleNewItemChange("name", productName);
        handleNewItemChange("genre", genre);
        showMessage("商品情報を取得しました。");
      } else {
        showMessage("商品が見つかりませんでした。手動で入力してください。");
        handleNewItemChange("name", "");
        handleNewItemChange("genre", "");
      }
    } catch (err) {
      console.error("商品情報取得エラー:", err);
      showMessage("商品情報取得エラー。手動で入力してください。");
      handleNewItemChange("name", "");
      handleNewItemChange("genre", "");
    }
  };

  // スキャン開始
  const startScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    showMessage("バーコードをスキャン中...");

    if (!codeReaderRef.current) {
      codeReaderRef.current = new BrowserMultiFormatReader();
    }

    try {
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        showMessage("カメラが見つかりませんでした。");
        setIsScanning(false);
        return;
      }
      
      const deviceId = videoInputDevices[0].deviceId;

      await codeReaderRef.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current!,
        (result, err) => {
          if (result) {
            const code = result.getText();
            handleNewItemChange("barcode", code);
            fetchProductInfo(code);
            stopScan();
          }
          if (err) {
            console.error(err);
          }
        }
      );
    } catch (err) {
      console.error("バーコード読み取りエラー:", err);
      setIsScanning(false);
      showMessage("カメラへのアクセスに失敗しました。");
    }
  };

  // スキャン停止
  const stopScan = () => {
    codeReaderRef.current?.reset();
    setIsScanning(false);
    showMessage("スキャンが停止しました。");
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      codeReaderRef.current?.reset();
    };
  }, []);

  // アイテム追加
  const handleAddItem = () => {
    if (newItem.name && newItem.quantity > 0) {
      const updatedItems = [...newFormState.items, newItem];
      updateNewFormState({ ...newFormState, items: updatedItems });
      setNewItem({ genre: "", name: "", quantity: 0, barcode: "" });
      showMessage("リストにアイテムを追加しました。");
    } else {
      showMessage("名前と数量を正しく入力してください。");
    }
  };

  // 数量の変更
  const handleQuantityChange = (delta: number) => {
    setNewItem((prev) => ({
      ...prev,
      quantity: Math.max(0, prev.quantity + delta),
    }));
  };

  // 削除ボタン
  const handleDeleteItem = (index: number) => {
    const updatedItems = newFormState.items.filter((_, i) => i !== index);
    updateNewFormState({ ...newFormState, items: updatedItems });
    showMessage("アイテムを削除しました。");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .card {
          @apply bg-white p-6 rounded-2xl shadow-lg transition-transform transform hover:scale-105;
        }
        .btn-primary {
          @apply bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2;
        }
        .btn-secondary {
          @apply bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full shadow transition duration-300 ease-in-out;
        }
        .btn-icon {
          @apply p-2 rounded-full hover:bg-gray-200 transition duration-300 ease-in-out;
        }
        .input-field {
          @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
        }
        .notification {
          @apply fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white py-3 px-6 rounded-full shadow-xl transition-all duration-500 ease-in-out;
        }
      `}</style>
      
      {/* 通知 */}
      {showNotification && (
        <div className="notification opacity-100 translate-y-0">
          {message}
        </div>
      )}

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">新しいアイテムの追加</h2>
        <button
          onClick={onBack}
          className="btn-secondary flex items-center space-x-2"
        >
          <BackIcon />
          <span>戻る</span>
        </button>
      </div>

      {/* フォームセクション */}
      <div className="bg-white p-8 rounded-3xl shadow-xl space-y-6">
        {/* カメラ映像 */}
        {isScanning && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full max-w-lg rounded-xl overflow-hidden shadow-2xl bg-black">
              <video
                ref={videoRef}
                className="w-full object-cover"
                style={{ maxHeight: "300px" }}
              />
            </div>
            <p className="text-gray-600">バーコードをカメラに合わせてください</p>
            <button onClick={stopScan} className="btn-secondary">
              スキャンを停止
            </button>
          </div>
        )}

        {/* フォーム入力 */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">ジャンル</label>
            <input
              type="text"
              value={newItem.genre}
              onChange={(e) => handleNewItemChange("genre", e.target.value)}
              className="input-field"
              disabled={isScanning}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">名前</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => handleNewItemChange("name", e.target.value)}
              className="input-field"
              disabled={isScanning}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">数量</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="btn-icon bg-gray-200 hover:bg-gray-300"
                disabled={isScanning}
              >
                <MinusIcon />
              </button>
              <input
                type="number"
                value={newItem.quantity}
                onChange={(e) => handleNewItemChange("quantity", parseInt(e.target.value))}
                className="input-field w-20 text-center"
                disabled={isScanning}
              />
              <button
                onClick={() => handleQuantityChange(1)}
                className="btn-icon bg-gray-200 hover:bg-gray-300"
                disabled={isScanning}
              >
                <PlusIcon />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">バーコード</label>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={newItem.barcode}
                onChange={(e) => handleNewItemChange("barcode", e.target.value)}
                className="input-field flex-grow"
                disabled={isScanning}
              />
              <button
                onClick={startScan}
                className="btn-primary"
                disabled={isScanning}
              >
                <ScanIcon />
                <span>スキャン</span>
              </button>
            </div>
          </div>
        </div>

        {/* アイテム追加ボタン */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleAddItem}
            className="btn-primary"
            disabled={isScanning}
          >
            アイテムをリストに追加
          </button>
        </div>
      </div>
      
      {/* 追加されたアイテム一覧 */}
      <div className="mt-8 bg-white p-8 rounded-3xl shadow-xl">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">追加されたアイテム</h3>
        {newFormState.items.length === 0 ? (
          <p className="text-gray-500 text-center">アイテムがありません。</p>
        ) : (
          <ul className="space-y-4">
            {newFormState.items.map((item, index) => (
              <li key={index} className="card flex items-center justify-between p-4">
                <div>
                  <div className="font-semibold text-lg">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    ジャンル: {item.genre} | 数量: {item.quantity} | バーコード: {item.barcode}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteItem(index)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default NewItemForm;