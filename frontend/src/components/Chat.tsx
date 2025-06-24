import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { chatAPI } from '../services/api';
import { CharacterStage } from '../types';

const ChatContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  height: 400px;
  border: 2px solid #e9ecef;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  background: white;
`;

const ChatHeader = styled.div`
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  font-weight: bold;
  border-radius: 13px 13px 0 0;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Message = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  
  ${props => props.isUser ? `
    align-self: flex-end;
    background: #007bff;
    color: white;
    margin-left: auto;
  ` : `
    align-self: flex-start;
    background: #f8f9fa;
    color: #333;
    border: 1px solid #e9ecef;
  `}
`;

const InputContainer = styled.div`
  padding: 15px;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 10px;
  align-items: center;
`;

const TextInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e9ecef;
  border-radius: 25px;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #007bff;
  }
`;

const SendButton = styled.button`
  padding: 12px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
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

const VoiceButton = styled.button<{ isListening: boolean }>`
  padding: 12px;
  background: ${props => props.isListening ? '#dc3545' : '#28a745'};
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 18px;
  color: #666;
  font-size: 14px;
  align-self: flex-start;
  
  &::after {
    content: '';
    width: 20px;
    height: 20px;
    border: 2px solid #e9ecef;
    border-top: 2px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatProps {
  characterName: string;
  characterStage: CharacterStage;
}

const Chat: React.FC<ChatProps> = ({ characterName, characterStage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: `こんにちは！${characterName}だよ！歯磨きのことなら何でも聞いてね！`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'ja-JP';
      
      recognitionInstance.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setInputText(text);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(inputText);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Text-to-Speech
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.response);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'ごめんね、今お話できないよ。もう一度試してみてね！',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleVoiceRecognition = () => {
    if (!recognition) {
      alert('音声認識に対応していないブラウザです');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        {characterName}とおしゃべり
      </ChatHeader>
      
      <MessagesContainer>
        {messages.map(message => (
          <Message key={message.id} isUser={message.isUser}>
            {message.text}
          </Message>
        ))}
        
        {isLoading && (
          <LoadingIndicator>
            考えているよ...
          </LoadingIndicator>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer>
        <TextInput
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="メッセージを入力..."
          disabled={isLoading}
        />
        
        {recognition && (
          <VoiceButton
            isListening={isListening}
            onClick={toggleVoiceRecognition}
            disabled={isLoading}
            title={isListening ? '音声認識を停止' : '音声認識を開始'}
          >
            {isListening ? '🔴' : '🎤'}
          </VoiceButton>
        )}
        
        <SendButton
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          送信
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat;