import React, { useState } from 'react';
import { useAuth } from '../contexts/authContext';
import './login.css';

const Login = () => {
  const [islogin, setIslogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, login } = useAuth();

  const handleSubmit = () => {
    setError('');

    if (!email || !password || (!islogin && !name)) {
      setError('全ての項目を入力してください');
      return;
    }

    let result: { success: boolean; message?: string };
    if (islogin) {
      result = login(email, password);
    } else {
      result = signup(name, email, password);
    }

    if (!result.success && result.message) {
      setError(result.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">
          {islogin ? 'ログイン' : '新規登録'}
        </h1>
        
        <div className="login-form">
          {!islogin && (
            <div className="login-field">
              <label className="login-label">
                名前
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="login-input"
                placeholder="山田太郎"
              />
            </div>
          )}
          
          <div className="login-field">
            <label className="login-label">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              placeholder="example@email.com"
            />
          </div>
          
          <div className="login-field">
            <label className="login-label">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="login-submit-button"
          >
            {islogin ? 'ログイン' : 'アカウント作成'}
          </button>
        </div>

        <div className="login-toggle-section">
          <button
            onClick={() => {
              setIslogin(!islogin);
              setError('');
            }}
            className="login-toggle-button"
          >
            {islogin ? 'アカウントをお持ちでない方はこちら' : '既にアカウントをお持ちの方はこちら'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;