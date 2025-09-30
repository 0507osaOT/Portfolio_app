import React, { useState } from 'react';
import { useAuth } from './App';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, login } = useAuth();

  const handleSubmit = () => {
    setError('');

    if (!email || !password || (!isLogin && !name)) {
      setError('全ての項目を入力してください');
      return;
    }

    let result: { success: boolean; message?: string };
    if (isLogin) {
      result = login(email, password);
    } else {
      result = signup(name, email, password);
    }

    if (!result.success && result.message) {
      setError(result.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      overflow: 'auto'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        boxShadow: '0 5px 16px rgba(0, 0, 0, 0.1)',
        padding: '60px 80px',
        width: '100%',
        maxWidth: '600px',
        margin: '40px'
      }}>
        <h1 style={{
          fontSize: '47px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#333',
          marginBottom: '50px',
          textDecoration: 'underline'
        }}>
          {isLogin ? 'ログイン' : '新規登録'}
        </h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {!isLogin && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '23px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '12px'
              }}>
                名前
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '18px 24px',
                  border: '2px solid #ddd',
                  borderRadius: '13px',
                  fontSize: '21px',
                  boxSizing: 'border-box'
                }}
                placeholder="山田太郎"
              />
            </div>
          )}
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '23px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '12px'
            }}>
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '18px 24px',
                border: '2px solid #ddd',
                borderRadius: '13px',
                fontSize: '21px',
                boxSizing: 'border-box'
              }}
              placeholder="example@email.com"
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '23px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '12px'
            }}>
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '18px 24px',
                border: '2px solid #ddd',
                borderRadius: '13px',
                fontSize: '21px',
                boxSizing: 'border-box'
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '20px',
              borderRadius: '13px',
              fontSize: '18px',
              border: '2px solid #fee2e2'
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              backgroundColor: '#007bff',
              color: 'white',
              padding: '20px',
              borderRadius: '13px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              fontSize: '26px',
              boxShadow: '0 4px 8px rgba(0, 123, 255, 0.2)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isLogin ? 'ログイン' : 'アカウント作成'}
          </button>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{
              color: '#007bff',
              fontSize: '18px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'アカウントをお持ちでない方はこちら' : '既にアカウントをお持ちの方はこちら'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;