import React from 'react';
import styled from 'styled-components';
import { CharacterStage } from '../types';

const CharacterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
  margin-bottom: 20px;
`;

const CharacterImage = styled.div`
  font-size: 120px;
  margin-bottom: 10px;
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
`;

const CharacterName = styled.h2`
  margin: 0 0 10px 0;
  font-size: 24px;
  text-align: center;
`;

const StageInfo = styled.div`
  text-align: center;
  margin-bottom: 15px;
`;

const StageName = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const StageDescription = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const ProgressContainer = styled.div`
  width: 100%;
  max-width: 300px;
  margin-bottom: 15px;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 5px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  width: ${props => props.percentage}%;
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 20px;
  text-align: center;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #FFD700;
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;

const StageUpNotification = styled.div<{ show: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #FFD700, #FFA000);
  color: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  z-index: 1000;
  font-size: 20px;
  font-weight: bold;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  animation: ${props => props.show ? 'popup 0.5s ease-out' : 'none'};
  display: ${props => props.show ? 'block' : 'none'};
  
  @keyframes popup {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }
`;

interface CharacterProps {
  characterName: string;
  stage: CharacterStage;
  totalDays: number;
  consecutiveDays: number;
  showStageUpAnimation?: boolean;
  onAnimationEnd?: () => void;
}

const Character: React.FC<CharacterProps> = ({
  characterName,
  stage,
  totalDays,
  consecutiveDays,
  showStageUpAnimation = false,
  onAnimationEnd
}) => {
  const getCharacterEmoji = (stage: CharacterStage): string => {
    switch (stage) {
      case CharacterStage.EGG:
        return '🥚';
      case CharacterStage.CHICK:
        return '🐣';
      case CharacterStage.CHICKEN:
        return '🐤';
      case CharacterStage.HAWK:
        return '🦅';
      case CharacterStage.PHOENIX:
        return '🔥';
      default:
        return '🥚';
    }
  };

  const getStageInfo = (stage: CharacterStage) => {
    switch (stage) {
      case CharacterStage.EGG:
        return {
          name: 'たまご',
          description: '歯磨きをはじめよう！',
          nextTarget: 'あと3日で次のステージ'
        };
      case CharacterStage.CHICK:
        return {
          name: 'ひよこ',
          description: '歯磨き上手になってきたね！',
          nextTarget: 'あと7日で次のステージ'
        };
      case CharacterStage.CHICKEN:
        return {
          name: 'にわとり',
          description: '歯磨き習慣がついてきた！',
          nextTarget: 'あと14日で次のステージ'
        };
      case CharacterStage.HAWK:
        return {
          name: 'たか',
          description: '歯磨きマスターだね！',
          nextTarget: 'あと30日で最終ステージ'
        };
      case CharacterStage.PHOENIX:
        return {
          name: 'ほうおう',
          description: '歯磨きの達人！素晴らしい！',
          nextTarget: 'おめでとう！'
        };
      default:
        return {
          name: 'たまご',
          description: '歯磨きをはじめよう！',
          nextTarget: 'あと3日で次のステージ'
        };
    }
  };

  const getProgressPercentage = (stage: CharacterStage, consecutiveDays: number): number => {
    switch (stage) {
      case CharacterStage.EGG:
        return Math.min((consecutiveDays / 3) * 100, 100);
      case CharacterStage.CHICK:
        return Math.min((consecutiveDays / 7) * 100, 100);
      case CharacterStage.CHICKEN:
        return Math.min((consecutiveDays / 14) * 100, 100);
      case CharacterStage.HAWK:
        return Math.min((consecutiveDays / 30) * 100, 100);
      case CharacterStage.PHOENIX:
        return 100;
      default:
        return 0;
    }
  };

  const stageInfo = getStageInfo(stage);
  const progressPercentage = getProgressPercentage(stage, consecutiveDays);

  React.useEffect(() => {
    if (showStageUpAnimation) {
      const timer = setTimeout(() => {
        onAnimationEnd?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showStageUpAnimation, onAnimationEnd]);

  return (
    <>
      <CharacterContainer>
        <CharacterImage>{getCharacterEmoji(stage)}</CharacterImage>
        <CharacterName>{characterName}</CharacterName>
        
        <StageInfo>
          <StageName>{stageInfo.name}</StageName>
          <StageDescription>{stageInfo.description}</StageDescription>
        </StageInfo>
        
        <ProgressContainer>
          <ProgressLabel>
            <span>成長レベル</span>
            <span>{Math.round(progressPercentage)}%</span>
          </ProgressLabel>
          <ProgressBar>
            <ProgressFill percentage={progressPercentage} />
          </ProgressBar>
        </ProgressContainer>
        
        <StatsContainer>
          <StatItem>
            <StatNumber>{consecutiveDays}</StatNumber>
            <StatLabel>連続日数</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>{totalDays}</StatNumber>
            <StatLabel>合計日数</StatLabel>
          </StatItem>
        </StatsContainer>
      </CharacterContainer>
      
      <StageUpNotification show={showStageUpAnimation}>
        🎉 レベルアップ！ 🎉
        <br />
        {stageInfo.name}に進化しました！
      </StageUpNotification>
    </>
  );
};

export default Character;