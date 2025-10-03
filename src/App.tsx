import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/authContext';
import Login from './components/login';  // 小文字のlogin
import Home from './pages/home';        // 小文字のhome
import './App.css';

const AuthWrapper = () => {
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.minHeight = '100vh';
    document.body.style.textAlign = 'center';
    
    const root = document.getElementById('root');
    if (root) {
      root.style.width = '100%';
      root.style.display = 'flex';
      root.style.justifyContent = 'center';
    }
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '20px', color: '#666' }}>読み込み中...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return <Home />;
};

function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}

export default App;