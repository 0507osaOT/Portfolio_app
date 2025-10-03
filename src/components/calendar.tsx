import React, { useState, useEffect, useMemo } from 'react';
import './calendar.css';

interface Event {
  id: string;
  title: string;
  date: string;
  description?: string;
}

// 商品の型定義（App.tsxから）
interface Item {
  id: string;
  genre: string;
  name: string;
  quantity: number;
  barcode?: string;
  addedDate: string;
  source: 'new' | 'history';
}

// onBackプロパティとitemsプロパティを追加
interface CalendarProps {
  onBack: () => void;
  items?: Item[];
}

const Calendar: React.FC<CalendarProps> = ({ onBack, items = [] }) => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: '会議',
      date: '2024-12-05',
      description: 'チーム会議'
    },
    {
      id: '2',
      title: 'プロジェクト',
      date: '2024-12-06',
      description: 'プロジェクト進捗確認'
    },
    {
      id: '3',
      title: '買い物',
      date: '2024-12-07',
      description: '食材の買い出し'
    },
    {
      id: '4',
      title: 'Todo',
      date: '2024-12-08',
      description: 'タスク整理'
    }
  ]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [newTask, setNewTask] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  
  // モーダル表示用の状態
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<{
    date: string;
    events: Event[];
    items: Item[];
  } | null>(null);

  // 商品データをイベント形式に変換
  const itemsAsEvents = useMemo(() => {
    return items.map(item => ({
      id: `item_${item.id}`,
      title: `${item.genre}: ${item.name}`,
      date: item.addedDate.split('T')[0], // ISO文字列からYYYY-MM-DD形式に変換
      description: `商品: ${item.name}\nジャンル: ${item.genre}\n個数: ${item.quantity}\n種類: ${item.source === 'new' ? '新規' : '履歴'}${item.barcode ? `\nバーコード: ${item.barcode}` : ''}`
    }));
  }, [items]);

  // 全イベント（手動追加 + 商品データ）を統合
  const allEvents = useMemo(() => {
    return [...events, ...itemsAsEvents];
  }, [events, itemsAsEvents]);

  // 曖昧検索機能（シンプル版）
  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) {
      return allEvents;
    }

    const search = searchTerm.toLowerCase().trim();
    
    try {
      return allEvents.filter(event => {
        const titleMatch = event.title.toLowerCase().includes(search);
        const descriptionMatch = event.description?.toLowerCase().includes(search) || false;
        const dateMatch = event.date.includes(search);
        
        return titleMatch || descriptionMatch || dateMatch;
      });
    } catch (error) {
      console.error('検索エラー:', error);
      return allEvents;
    }
  }, [allEvents, searchTerm]);

  // 検索結果に基づいてカレンダーに表示するイベントを決定
  const displayEvents = useMemo(() => {
    try {
      if (!searchTerm.trim()) {
        return allEvents;
      }
      return filteredEvents;
    } catch (error) {
      console.error('表示エラー:', error);
      return allEvents;
    }
  }, [allEvents, filteredEvents, searchTerm]);

  // 検索入力の処理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = e.target.value;
      setSearchTerm(value);
      setShowSearchResults(value.trim().length > 0);
    } catch (error) {
      console.error('検索入力エラー:', error);
    }
  };

  // 検索結果をクリアする
  const clearSearch = () => {
    setSearchTerm('');
    setShowSearchResults(false);
  };

  // 検索結果のイベントをクリック
  const handleSearchResultClick = (event: Event) => {
    // 該当日付にカレンダーを移動（シンプル実装）
    const [year, month, day] = event.date.split('-').map(Number);
    setCurrentDate(new Date(year, month - 1, day));
    // 検索結果を一時的に非表示
    setShowSearchResults(false);
    // イベントの詳細を表示
    alert(`タスク: ${event.title}\n日付: ${event.date}\n詳細: ${event.description || 'なし'}`);
  };

  // カレンダー表示用ユーティリティ
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const getEventsForDate = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return displayEvents.filter(event => event.date === dateStr);
  };

  const getItemsForDate = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return items.filter(item => item.addedDate.split('T')[0] === dateStr);
  };

  // 日付セルをクリックした時の処理（モーダル表示対応）
  const handleDateClick = (day: number): void => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const dayEvents = getEventsForDate(year, month, day);
    const dayItems = getItemsForDate(year, month, day);
    
    if (dayEvents.length > 0 || dayItems.length > 0) {
      // その日にデータがある場合はモーダルを表示
      setModalContent({
        date: dateStr,
        events: dayEvents.filter(event => !event.id.startsWith('item_')), // 手動追加イベントのみ
        items: dayItems
      });
      setShowModal(true);
    } else {
      // その日にデータがない場合は新規タスク追加フォームを表示
      setSelectedDate(dateStr);
      setShowTaskForm(true);
    }
  };

  // 今日ボタンのクリック処理
  const handleTodayClick = (): void => {
    setCurrentDate(new Date());
  };

  // カレンダーナビゲーション
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // タスクを追加
  const handleAddTask = (): void => {
    if (newTask.trim() && selectedDate) {
      const newEvent: Event = {
        id: Date.now().toString(),
        title: newTask,
        date: selectedDate,
        description: newDescription.trim() || undefined
      };
      setEvents(prevEvents => [...prevEvents, newEvent]);
      setNewTask('');
      setNewDescription('');
      setShowTaskForm(false);
      setSelectedDate(null);
    }
  };

  // イベントをクリックした時の詳細画面表示
  const handleEventClick = (event: Event): void => {
    const description = event.description || 'なし';
    alert(`タスク: ${event.title}\n日付: ${event.date}\n詳細: ${description}`);
  };

  // フォームのキャンセル処理
  const handleCancel = (): void => {
    setShowTaskForm(false);
    setNewTask('');
    setNewDescription('');
    setSelectedDate(null);
  };

  // モーダルを閉じる処理
  const handleCloseModal = (): void => {
    setShowModal(false);
    setModalContent(null);
  };

  // Enterキーでタスク追加
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  // 検索フォーカス時の処理
  const handleSearchFocus = () => {
    if (searchTerm.trim().length > 0) {
      setShowSearchResults(true);
    }
  };

  // 検索フォームの外側をクリックした時の処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.querySelector('.search-container');
      const searchResults = document.querySelector('.search-results');
      
      if (searchContainer && searchResults && 
          !searchContainer.contains(event.target as Node) &&
          !searchResults.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const today = new Date();
  const days = getDaysInMonth(currentDate);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="calendar-main-container">
      {/* ホームに戻るボタンを追加 */}
      <div className="calendar-header">
        <button onClick={onBack} className="calendar-back-button">
          ← ホームに戻る
        </button>
        <h2 className="calendar-title">カレンダー</h2>
        <div className="calendar-spacer"></div>
      </div>

      {/* カレンダーコンテナ */}
      <div className="calendar-container">
        <div className="calendar-controls">
          <h2>カレンダー</h2>
          
          {/* 検索フォーム */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                placeholder="Todoを検索 (曖昧検索対応)"
                className="search-input"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  type="button"
                  className="search-clear-button"
                >
                  ×
                </button>
              )}
            </div>
            
            {/* 検索結果 */}
            {showSearchResults && (
              <div className="search-results">
                <div className="search-results-header">
                  検索結果: {filteredEvents.length}件
                </div>
                {filteredEvents.length > 0 ? (
                  <div className="search-results-list">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => handleSearchResultClick(event)}
                        className="search-result-item"
                      >
                        <div className="search-result-title">{event.title}</div>
                        <div className="search-result-date">{event.date}</div>
                        {event.description && (
                          <div className="search-result-description">{event.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="search-no-results">検索結果が見つかりません</div>
                )}
              </div>
            )}
          </div>
          
          <button onClick={handleTodayClick} type="button" className="today-button">
            今日
          </button>
        </div>

        {/* カレンダーヘッダー */}
        <div className="calendar-navigation">
          <button onClick={prevMonth} className="calendar-nav-button">
            ←
          </button>
          <h3 className="calendar-month-title">
            {formatDate(currentDate)}
          </h3>
          <button onClick={nextMonth} className="calendar-nav-button">
            →
          </button>
        </div>

        {/* カレンダーグリッド */}
        <div className="calendar-grid">
          {/* 曜日ヘッダー */}
          {weekdays.map((day, index) => (
            <div
              key={day}
              className={`calendar-weekday ${index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}`}
            >
              {day}
            </div>
          ))}
          
          {/* 日付セル */}
          {days.map((day, index) => {
            const isToday = day && 
              currentDate.getFullYear() === today.getFullYear() &&
              currentDate.getMonth() === today.getMonth() &&
              day === today.getDate();
            
            const dayEvents = day ? getEventsForDate(currentDate.getFullYear(), currentDate.getMonth(), day) : [];
            
            return (
              <div
                key={index}
                className={`calendar-day-cell ${!day ? 'empty' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => day && handleDateClick(day)}
              >
                {day && (
                  <>
                    <span className={`calendar-day-number ${isToday ? 'today' : ''}`}>
                      {day}
                    </span>
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`calendar-event ${event.id.startsWith('item_') ? 'item-event' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="calendar-more-events">
                        +{dayEvents.length - 3}件
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* タスク追加フォーム */}
      {showTaskForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="task-form-title">{selectedDate} にタスクを追加</h3>
            <input
              type="text"
              value={newTask}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="タスクを入力してください"
              autoFocus
              className="task-input"
            />
            <textarea
              value={newDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewDescription(e.target.value)}
              placeholder="詳細説明（オプション）"
              rows={3}
              className="task-textarea"
            />
            <div className="task-form-buttons">
              <button onClick={handleAddTask} type="button" className="task-add-button">
                追加
              </button>
              <button onClick={handleCancel} type="button" className="task-cancel-button">
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 詳細表示モーダル */}
      {showModal && modalContent && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3 className="modal-date-title">{modalContent.date} の内容</h3>
              <button onClick={handleCloseModal} className="modal-close-button">
                ×
              </button>
            </div>

            {/* 手動追加されたイベント */}
            {modalContent.events.length > 0 && (
              <div className="modal-section">
                <h4 className="modal-section-title events">📅 手動追加したタスク</h4>
                {modalContent.events.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-card-title">
                      {event.title}
                    </div>
                    {event.description && (
                      <div className="event-card-description">
                        {event.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 商品データ */}
            {modalContent.items.length > 0 && (
              <div>
                <h4 className="modal-section-title items">🛒 追加された商品</h4>
                {(() => {
                  // ジャンル別にグループ化
                  const groupedItems = modalContent.items.reduce((acc, item) => {
                    if (!acc[item.genre]) {
                      acc[item.genre] = [];
                    }
                    acc[item.genre].push(item);
                    return acc;
                  }, {} as Record<string, typeof modalContent.items>);

                  return Object.entries(groupedItems).map(([genre, items]) => (
                    <div key={genre} className="genre-group">
                      <div className="genre-title">
                        ジャンル: {genre}
                      </div>
                      
                      {/* 商品を縦並びで表示、詳細は横並び */}
                      {items.map((item) => (
                        <div key={item.id} className="item-card">
                          <div className="item-name">
                            {item.name}
                          </div>
                          
                          {/* 詳細情報を横並びで表示 */}
                          <div className="item-details">
                            <div className="item-detail">
                              <strong>ジャンル:</strong> {item.genre}
                            </div>
                            <div className="item-detail">
                              <strong>個数:</strong> {item.quantity}
                            </div>
                            <div className="item-detail" style={{ display: 'flex', alignItems: 'center' }}>
                              <strong>種類:</strong>
                              <span className={`item-source-badge ${item.source === 'new' ? 'new' : 'history'}`}>
                                {item.source === 'new' ? '新規' : '履歴'}
                              </span>
                            </div>
                            {item.barcode && (
                              <div className="item-detail">
                                <strong>バーコード:</strong> {item.barcode}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            )}

            {/* 新しいタスクを追加するボタン */}
            <div className="modal-add-task-section">
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;