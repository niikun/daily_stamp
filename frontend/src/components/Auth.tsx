import React, { useState } from 'react';
import styled from 'styled-components';
import { authAPI } from '../services/api';

const AuthContainer = styled.div`
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: bold;
  color: #555;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
  
  &:invalid {
    border-color: #dc3545;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover:not(:disabled) {
    background: #0056b3;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SwitchButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
`;

const LoadingSpinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface AuthProps {
  onAuthSuccess: (token: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) {
          setError('名前を入力してください');
          setIsLoading(false);
          return;
        }
        response = await authAPI.signup(formData.name, formData.email, formData.password);
      }
      
      localStorage.setItem('access_token', response.access_token);
      onAuthSuccess(response.access_token);
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.response?.status === 400) {
        setError(isLogin ? 'メールアドレスまたはパスワードが間違っています' : 'このメールアドレスは既に使用されています');
      } else if (error.response?.status === 401) {
        setError('メールアドレスまたはパスワードが間違っています');
      } else {
        setError(isLogin ? 'ログインに失敗しました' : '登録に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '' });
    setError('');
  };

  return (
    <AuthContainer>
      <Title>{isLogin ? 'ログイン' : '新規登録'}</Title>
      
      <Form onSubmit={handleSubmit}>
        {!isLogin && (
          <FormGroup>
            <Label htmlFor="name">お名前</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required={!isLogin}
              placeholder="山田太郎"
            />
          </FormGroup>
        )}
        
        <FormGroup>
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="example@example.com"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">パスワード</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={6}
            placeholder="6文字以上"
          />
        </FormGroup>
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <LoadingSpinner /> : (isLogin ? 'ログイン' : '新規登録')}
        </Button>
      </Form>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <div style={{ textAlign: 'center' }}>
        <SwitchButton type="button" onClick={toggleMode}>
          {isLogin ? '新規登録はこちら' : 'ログインはこちら'}
        </SwitchButton>
      </div>
    </AuthContainer>
  );
};

export default Auth;