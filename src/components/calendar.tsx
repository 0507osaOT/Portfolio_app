import React, { useState, useEffect, useMemo } from 'react';
import './calendar.css';

interface Event {
  id: string;
  title: string;
  date: string;
  description?: string;
}

interface Item {
  id: string;
  genre: string;
  name: string;
  quantity: number;
  barcode?: string;
  addedDate: string;
  source: 'new' | 'history';
}

interface CalendarProps {
  onBack: () => void;
  items?: Item[];
}

const Calendar: React.FC<CalendarProps> = ({ onBack, items = [] }) => {
  const [events, setEvents] = useState<Event[]>(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      try {
        return JSON.parse(savedEvents);
      } catch (error) {
        console.error('イベントの読み込みエラー:', error);
      }
    }
    return [
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
    ];
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [newTask, setNewTask] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<{
    date: string;
    events: Event[];
    items: Item[];
  } | null>(null);

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  const itemsAsEvents = useMemo(() => {
    return items.map(item => ({
      id: `item_${item.id}`,
      title: `${item.genre}: ${item.name}`,
      date: item.addedDate.split('T')[0],
      description: `商品: ${item.name}\nジャンル: ${item.genre}\n個数: ${item.quantity}\n種類: ${item.source === 'new' ? '新規' : '履歴'}${item.barcode ? `\nバーコード: ${item.barcode}` : ''}`
    }));
  }, [items]);

  const allEvents = useMemo(() => {
    return [...events, ...itemsAsEvents];
  }, [events, itemsAsEvents]);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = e.target.value;
      setSearchTerm(value);
      setShowSearchResults(value.trim().length > 0);
    } catch (error) {
      console.error('検索入力エラー:', error);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleSearchResultClick = (event: Event) => {
    const [year, month, day] = event.date.split('-').map(Number);
    setCurrentDate(new Date(year, month - 1, day));
    setShowSearchResults(false);
    alert(`タスク: ${event.title}\n日付: ${event.date}\n詳細: ${event.description || 'なし'}`);
  };

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

  const handleDateClick = (day: number): void => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const dayEvents = getEventsForDate(year, month, day);
    const dayItems = getItemsForDate(year, month, day);
    
    if (dayEvents.length > 0 || dayItems.length > 0) {
      setModalContent({
        date: dateStr,
        events: dayEvents.filter(event => !event.id.startsWith('item_')),
        items: dayItems
      });
      setShowModal(true);
    } else {
      setSelectedDate(dateStr);
      setShowTaskForm(true);
    }
  };

  const handleTodayClick = (): void => {
    setCurrentDate(new Date());
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

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

  // ✅ タスクを削除（モーダル内で使用）
  const handleDeleteEvent = (eventId: string): void => {
    if (window.confirm('このタスクを削除しますか？')) {
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      
      // モーダル内容を更新
      if (modalContent) {
        const updatedEvents = modalContent.events.filter(event => event.id !== eventId);
        if (updatedEvents.length === 0 && modalContent.items.length === 0) {
          // タスクも商品もなくなったらモーダルを閉じる
          setShowModal(false);
          setModalContent(null);
        } else {
          // モーダル内容を更新
          setModalContent({
            ...modalContent,
            events: updatedEvents
          });
        }
      }
    }
  };

  const handleEventClick = (event: Event): void => {
    const description = event.description || 'なし';
    alert(`タスク: ${event.title}\n日付: ${event.date}\n詳細: ${description}`);
  };

  const handleCancel = (): void => {
    setShowTaskForm(false);
    setNewTask('');
    setNewDescription('');
    setSelectedDate(null);
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setModalContent(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const handleSearchFocus = () => {
    if (searchTerm.trim().length > 0) {
      setShowSearchResults(true);
    }
  };

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
      <div className="calendar-header">
        <button onClick={onBack} className="calendar-back-button">
          ← ホームに戻る
        </button>
        <h2 className="calendar-title">カレンダー</h2>
        <div className="calendar-spacer"></div>
      </div>

      <div className="calendar-container">
        <div className="calendar-controls">
          <h2>カレンダー</h2>
          
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

        <div className="calendar-grid">
          {weekdays.map((day, index) => (
            <div
              key={day}
              className={`calendar-weekday ${index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}`}
            >
              {day}
            </div>
          ))}
          
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

      {showModal && modalContent && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3 className="modal-date-title">{modalContent.date} の内容</h3>
              <button onClick={handleCloseModal} className="modal-close-button">
                ×
              </button>
            </div>

            {modalContent.events.length > 0 && (
              <div className="modal-section">
                <h4 className="modal-section-title events">📅 手動追加したタスク</h4>
                {modalContent.events.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-card-header">
                      <div className="event-card-title">
                        {event.title}
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="event-delete-button"
                      >
                        削除
                      </button>
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

            {modalContent.items.length > 0 && (
              <div>
                <h4 className="modal-section-title items">🛒 追加された商品</h4>
                {(() => {
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
                      
                      {items.map((item) => (
                        <div key={item.id} className="item-card">
                          <div className="item-name">
                            {item.name}
                          </div>
                          
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;