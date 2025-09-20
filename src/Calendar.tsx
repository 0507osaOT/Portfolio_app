import React, { useState, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';
import './Calendar.css';

interface Event {
  id: string;
  title: string;
  date: string;
  description?: string;
}

// onBackプロパティを追加
interface CalendarProps {
  onBack: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ onBack }) => {
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

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [newTask, setNewTask] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  // 曖昧検索機能（シンプル版）
  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) {
      return events;
    }

    const search = searchTerm.toLowerCase().trim();
    
    try {
      return events.filter(event => {
        const titleMatch = event.title.toLowerCase().includes(search);
        const descriptionMatch = event.description?.toLowerCase().includes(search) || false;
        const dateMatch = event.date.includes(search);
        
        return titleMatch || descriptionMatch || dateMatch;
      });
    } catch (error) {
      console.error('検索エラー:', error);
      return events;
    }
  }, [events, searchTerm]);

  // 検索結果に基づいてカレンダーに表示するイベントを決定
  const displayEvents = useMemo(() => {
    try {
      if (!searchTerm.trim()) {
        return events;
      }
      return filteredEvents;
    } catch (error) {
      console.error('表示エラー:', error);
      return events;
    }
  }, [events, filteredEvents, searchTerm]);

  // ひらがな変換関数（簡易版）
  const convertToHiragana = (str: string): string => {
    return str.replace(/[\u30A1-\u30F6]/g, (match) => {
      const charCode = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(charCode);
    });
  };

  // カタカナ変換関数（簡易版）
  const convertToKatakana = (str: string): string => {
    return str.replace(/[\u3041-\u3096]/g, (match) => {
      const charCode = match.charCodeAt(0) + 0x60;
      return String.fromCharCode(charCode);
    });
  };

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
    // そのイベントの日付にカレンダーを移動
    const calendarElement = document.querySelector('.fc') as any;
    if (calendarElement?.fcApi) {
      calendarElement.fcApi.gotoDate(event.date);
    }
    // 検索結果を一時的に非表示
    setShowSearchResults(false);
    // イベントの詳細を表示
    alert(`タスク: ${event.title}\n日付: ${event.date}\n詳細: ${event.description || 'なし'}`);
  };

  // 日付セルをクリックした時の処理
  const handleDateClick = (arg: DateClickArg): void => {
    setSelectedDate(arg.dateStr);
    setShowTaskForm(true);
  };

  // 今日ボタンのクリック処理
  const handleTodayClick = (): void => {
    const calendarElement = document.querySelector('.fc') as any;
    if (calendarElement?.fcApi) {
      const today = new Date().toISOString().split('T')[0];
      calendarElement.fcApi.gotoDate(today);
    }
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
  const handleEventClick = (clickInfo: any): void => {
    const eventTitle = clickInfo.event.title;
    const eventDate = clickInfo.event.startStr || (clickInfo.event.start ? clickInfo.event.start.toISOString().split('T')[0] : '');
    const eventObj = events.find(e => e.id === clickInfo.event.id);
    const description = eventObj?.description || 'なし';
    alert(`タスク: ${eventTitle}\n日付: ${eventDate}\n詳細: ${description}`);
  };

  // フォームのキャンセル処理
  const handleCancel = (): void => {
    setShowTaskForm(false);
    setNewTask('');
    setNewDescription('');
    setSelectedDate(null);
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

  return (
    <div style={{ width: '100%' }}>
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

      {/* 元のカレンダーコンテナ（検索フォームを含む） */}
      <div className="calendar-container">
        <div className="calendar-header">
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
                  className="clear-search-button"
                  type="button"
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
                        className="search-result-item"
                        onClick={() => handleSearchResultClick(event)}
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
          
          <button 
            className="today-button"
            onClick={handleTodayClick}
            type="button"
          >
            今日
          </button>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="ja"
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: 'dayGridMonth'
          }}
          events={displayEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          dayMaxEvents={3}
          moreLinkClick="popover"
          buttonText={{
            today: '今日',
            month: '月'
          }}
          dayHeaderFormat={{
            weekday: 'short'
          }}
          titleFormat={{
            year: 'numeric',
            month: 'long'
          }}
        />

        {/* タスク追加フォーム */}
        {showTaskForm && (
          <div className="task-form-overlay">
            <div className="task-form">
              <h3>{selectedDate} にタスクを追加</h3>
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
                className="task-description"
                rows={3}
              />
              <div className="form-buttons">
                <button onClick={handleAddTask} type="button">
                  追加
                </button>
                <button onClick={handleCancel} type="button">
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;