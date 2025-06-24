import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Auth from './components/Auth';
import Character from './components/Character';
import Calendar from './components/Calendar';
import Chat from './components/Chat';
import { Profile, CharacterStage } from './types';
import { profileAPI } from './services/api';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  color: white;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 48px;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const Subtitle = styled.p`
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: white;
`;

const LogoutButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background: rgba(255,255,255,0.2);
  color: white;
  border: 1px solid white;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  
  &:hover {
    background: rgba(255,255,255,0.3);
  }
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStageUpAnimation, setShowStageUpAnimation] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const profileData = await profileAPI.getProfile();
      setProfile(profileData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      localStorage.removeItem('access_token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async (token: string) => {
    setIsAuthenticated(true);
    await fetchProfile();
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setProfile(null);
  };

  const handleStampUpdate = async () => {
    if (profile) {
      const oldStage = profile.current_stage;
      await fetchProfile();
      // Check if stage upgraded
      if (profile.current_stage !== oldStage) {
        setShowStageUpAnimation(true);
      }
    }
  };

  if (isLoading) {
    return (
      <AppContainer>
        <LoadingSpinner>読み込み中...</LoadingSpinner>
      </AppContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppContainer>
        <MainContent>
          <Header>
            <Title>🦷 デイリースタンプ 🦷</Title>
            <Subtitle>歯磨きを楽しく習慣化しよう！</Subtitle>
          </Header>
          <Auth onAuthSuccess={handleAuthSuccess} />
        </MainContent>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <LogoutButton onClick={handleLogout}>
        ログアウト
      </LogoutButton>
      
      <MainContent>
        <Header>
          <Title>🦷 デイリースタンプ 🦷</Title>
          <Subtitle>歯磨きを楽しく習慣化しよう！</Subtitle>
        </Header>
        
        {profile && (
          <>
            <Character
              characterName={profile.character_name}
              stage={profile.current_stage}
              totalDays={profile.total_days_brushed}
              consecutiveDays={profile.consecutive_days_brushed}
              showStageUpAnimation={showStageUpAnimation}
              onAnimationEnd={() => setShowStageUpAnimation(false)}
            />
            
            <ContentGrid>
              <Section>
                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>📅 カレンダー</h3>
                <Calendar onStampUpdate={handleStampUpdate} />
              </Section>
              
              <Section>
                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>💬 おしゃべり</h3>
                <Chat
                  characterName={profile.character_name}
                  characterStage={profile.current_stage}
                />
              </Section>
            </ContentGrid>
          </>
        )}
      </MainContent>
    </AppContainer>
  );
}

export default App;
