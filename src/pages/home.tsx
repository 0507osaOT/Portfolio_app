import { useState, useEffect } from 'react';
import Calendar from '../components/calendar';
import Stock from '../components/stock';
import NewItemForm from '../components/new';
import { useAuth } from '../contexts/authContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Item } from '../types';
import './home.css';

function Home() {
  const { currentUser, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'new' | 'calendar' | 'stock'>('home');
  
  const [allUserItems, setAllUserItems] = useLocalStorage<Record<string, Item[]>>('allUserItems', {});
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userItemHistories, setUserItemHistories] = useLocalStorage<Record<string, Array<{genre: string, name: string}>>>('userItemHistories', {});
  
  const currentUserEmail = currentUser?.email || '';
  const items = allUserItems[currentUserEmail] || [];
  const currentUserHistory = userItemHistories[currentUserEmail] || [];
  
  const [newFormState, setNewFormState] = useState({
    newAddedItems: [] as Array<{genre: string, name: string, quantity: string, barcode: string}>,
    historyAddedItems: [] as Array<{genre: string, name: string, quantity: string, barcode: string}>,
    itemHistory: currentUserHistory
  });

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
    
    setAllUserItems(prev => ({
      ...prev,
      [currentUserEmail]: [...(prev[currentUserEmail] || []), ...itemsWithMetadata]
    }));
  };

  const updateItems = (updatedItems: Item[]) => {
    setAllUserItems(prev => ({
      ...prev,
      [currentUserEmail]: updatedItems
    }));
  };

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
            <div className="home-calendar-button-area">
              <button 
                onClick={() => goToPage('calendar')}
                className="home-calendar-button"
              >
                📅 カレンダー
              </button>
            </div>

            <div className="home-nav-buttons">
              <button 
                onClick={() => goToPage('new')}
                className="home-new-button"
              >
                新規追加・買い出し
              </button>
              
              <button 
                onClick={() => goToPage('stock')}
                className="home-stock-button"
              >
                ストック
              </button>
            </div>

            {items.length === 0 && (
              <div className="home-empty-state">
                <h2 className="home-empty-title">
                  まだ商品が追加されていません
                </h2>
                <p className="home-empty-description">
                  「新規追加・買い出し」ボタンから商品を追加してください
                </p>
              </div>
            )}

            {genres.map((genre) => {
              const genreItems = getItemsByGenre(genre);
              return (
                <div key={genre} className="home-genre-section">
                  <div className="home-genre-header">
                    <h2 className="home-genre-title">
                      ジャンル:{genre}
                    </h2>
                  </div>

                  <div className="home-genre-container">
                    <table className="home-table">
                      <thead>
                        <tr>
                          <th>商品名</th>
                          <th>個数</th>
                          <th>追加日</th>
                          <th>種類</th>
                        </tr>
                      </thead>
                      <tbody>
                        {genreItems.map((item) => (
                          <tr key={item.id}>
                            <td className="home-table-name">{item.name}</td>
                            <td className="home-table-quantity">{item.quantity}</td>
                            <td className="home-table-date">
                              {new Date(item.addedDate).toLocaleDateString('ja-JP')}
                            </td>
                            <td className="home-table-type">
                              <span className={`home-type-badge ${item.source === 'new' ? 'new' : 'history'}`}>
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
    <>
      <div className="home-main-container">
        <div className="home-header">
          <div className="home-header-content">
            <h1 
              className={`home-title ${currentPage !== 'home' ? 'clickable' : ''}`}
              onClick={currentPage !== 'home' ? goHome : undefined}
            >
              Seasonings and ・・・
            </h1>
            
            <div className="home-user-section">
              <span className="home-user-name">
                {currentUser?.name}さん
              </span>
              {currentPage === 'home' && (
                <button 
                  onClick={() => setShowSettingsModal(true)}
                  className="home-settings-button"
                >
                  設定
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="home-content-area">
          {renderCurrentPage()}
        </div>
      </div>

      {showSettingsModal && (
        <div 
          className="home-modal-overlay"
          onClick={() => setShowSettingsModal(false)}
        >
          <div 
            className="home-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="home-modal-title">
              設定
            </h2>

            <div className="home-modal-user-info">
              <div className="home-modal-info-row">
                <span className="home-modal-info-label">名前: </span>
                <span className="home-modal-info-value">{currentUser?.name}</span>
              </div>
              <div className="home-modal-info-row">
                <span className="home-modal-info-label">メール: </span>
                <span className="home-modal-info-value">{currentUser?.email}</span>
              </div>
            </div>

            <div className="home-modal-buttons">
              <button
                onClick={handleLogout}
                className="home-logout-button"
              >
                ログアウト
              </button>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="home-close-button"
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

export default Home;