import React, { useState, useEffect, useMemo } from 'react';

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
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      {/* ホームに戻るボタンを追加 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
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
        }}>カレンダー</h2>
        <div style={{ width: '140px' }}></div>
      </div>

      {/* カレンダーコンテナ */}
      <div style={{
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '20px',
        boxShadow: '0 5px 16px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <h2 style={{ fontSize: '28px', margin: 0, color: '#333' }}>カレンダー</h2>
          
          {/* 検索フォーム */}
          <div className="search-container" style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                placeholder="Todoを検索 (曖昧検索対応)"
                style={{
                  flex: 1,
                  padding: '10px 15px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  type="button"
                  style={{
                    padding: '10px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              )}
            </div>
            
            {/* 検索結果 */}
            {showSearchResults && (
              <div className="search-results" style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000,
                marginTop: '4px'
              }}>
                <div style={{
                  padding: '12px',
                  borderBottom: '1px solid #eee',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#666'
                }}>
                  検索結果: {filteredEvents.length}件
                </div>
                {filteredEvents.length > 0 ? (
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => handleSearchResultClick(event)}
                        style={{
                          padding: '12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{event.title}</div>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '2px' }}>{event.date}</div>
                        {event.description && (
                          <div style={{ fontSize: '12px', color: '#999' }}>{event.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '12px', color: '#999', textAlign: 'center' }}>検索結果が見つかりません</div>
                )}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleTodayClick}
            type="button"
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            今日
          </button>
        </div>

        {/* カレンダーヘッダー */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <button
            onClick={prevMonth}
            style={{
              padding: '10px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ←
          </button>
          <h3 style={{ fontSize: '24px', margin: 0, color: '#333' }}>
            {formatDate(currentDate)}
          </h3>
          <button
            onClick={nextMonth}
            style={{
              padding: '10px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            →
          </button>
        </div>

        {/* カレンダーグリッド */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          backgroundColor: '#ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* 曜日ヘッダー */}
          {weekdays.map((day, index) => (
            <div
              key={day}
              style={{
                padding: '12px',
                backgroundColor: '#f8f9fa',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
                color: index === 0 ? '#dc3545' : index === 6 ? '#007bff' : '#333'
              }}
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
                style={{
                  padding: '8px',
                  backgroundColor: day ? '#fff' : '#f8f9fa',
                  textAlign: 'center',
                  minHeight: '100px',
                  position: 'relative',
                  cursor: day ? 'pointer' : 'default',
                  border: isToday ? '3px solid #007bff' : 'none',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={() => day && handleDateClick(day)}
              >
                {day && (
                  <>
                    <span style={{
                      fontWeight: isToday ? 'bold' : 'normal',
                      color: isToday ? '#007bff' : '#333',
                      fontSize: '16px',
                      marginBottom: '4px'
                    }}>
                      {day}
                    </span>
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        style={{
                          fontSize: '11px',
                          padding: '2px 4px',
                          backgroundColor: event.id.startsWith('item_') ? '#28a745' : '#007bff',
                          color: 'white',
                          borderRadius: '3px',
                          marginBottom: '2px',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div style={{
                        fontSize: '10px',
                        color: '#666',
                        fontWeight: 'bold'
                      }}>
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>{selectedDate} にタスクを追加</h3>
            <input
              type="text"
              value={newTask}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="タスクを入力してください"
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                marginBottom: '15px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
            <textarea
              value={newDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewDescription(e.target.value)}
              placeholder="詳細説明（オプション）"
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                marginBottom: '20px',
                boxSizing: 'border-box',
                resize: 'vertical',
                outline: 'none'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleAddTask} 
                type="button"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                追加
              </button>
              <button 
                onClick={handleCancel} 
                type="button"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 詳細表示モーダル */}
      {showModal && modalContent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '24px', margin: 0, color: '#333' }}>{modalContent.date} の内容</h3>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                ×
              </button>
            </div>

            {/* 手動追加されたイベント */}
            {modalContent.events.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ fontSize: '20px', color: '#007bff', marginBottom: '15px' }}>📅 手動追加したタスク</h4>
                {modalContent.events.map((event) => (
                  <div key={event.id} style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                      {event.title}
                    </div>
                    {event.description && (
                      <div style={{ fontSize: '14px', color: '#666', whiteSpace: 'pre-line' }}>
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
                <h4 style={{ fontSize: '20px', color: '#28a745', marginBottom: '15px' }}>🛒 追加された商品</h4>
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
                    <div key={genre} style={{
                      backgroundColor: '#f8f9fa',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '15px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
                        ジャンル: {genre}
                      </div>
                      
                      {/* 商品を縦並びで表示、詳細は横並び */}
                      {items.map((item) => (
                        <div key={item.id} style={{
                          backgroundColor: 'white',
                          padding: '15px',
                          borderRadius: '8px',
                          marginBottom: '10px',
                          border: '1px solid #dee2e6'
                        }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                            {item.name}
                          </div>
                          
                          {/* 詳細情報を横並びで表示 */}
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '40px',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              <strong>ジャンル:</strong> {item.genre}
                            </div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              <strong>個数:</strong> {item.quantity}
                            </div>
                            <div style={{ fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center' }}>
                              <strong>種類:</strong>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginLeft: '8px',
                                backgroundColor: item.source === 'new' ? '#e3f2fd' : '#e8f5e8',
                                color: item.source === 'new' ? '#1976d2' : '#388e3c'
                              }}>
                                {item.source === 'new' ? '新規' : '履歴'}
                              </span>
                            </div>
                            {item.barcode && (
                              <div style={{ fontSize: '14px', color: '#666' }}>
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
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;