import React, { useState } from 'react';
import styled from 'styled-components';
import { StampType } from '../types';

const Container = styled.div`
  padding: 20px 0;
`;

const StampGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
`;

const StampCard = styled.div<{ isSelected: boolean; color: string }>`
  display: flex;
  align-items: center;
  padding: 15px;
  border: 2px solid ${props => props.isSelected ? props.color : '#e9ecef'};
  border-radius: 10px;
  background: ${props => props.isSelected ? `${props.color}20` : '#f8f9fa'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.color};
    background: ${props => `${props.color}10`};
  }
`;

const StampEmoji = styled.span`
  font-size: 24px;
  margin-right: 10px;
`;

const StampInfo = styled.div`
  flex: 1;
`;

const StampName = styled.div`
  font-weight: bold;
  font-size: 14px;
  color: #333;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.variant === 'primary' ? `
    background: #007bff;
    color: white;
    &:hover {
      background: #0056b3;
    }
  ` : `
    background: #6c757d;
    color: white;
    &:hover {
      background: #545b62;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SelectedCount = styled.div`
  text-align: center;
  margin-bottom: 15px;
  color: #666;
  font-size: 14px;
`;

interface StampSelectorProps {
  stampTypes: StampType[];
  selectedStamps: string[];
  onSave: (stamps: string[]) => void;
  onCancel: () => void;
}

const StampSelector: React.FC<StampSelectorProps> = ({
  stampTypes,
  selectedStamps,
  onSave,
  onCancel
}) => {
  const [selectedStampIds, setSelectedStampIds] = useState<string[]>(selectedStamps);

  const toggleStamp = (stampId: string) => {
    setSelectedStampIds(prev => 
      prev.includes(stampId)
        ? prev.filter(id => id !== stampId)
        : [...prev, stampId]
    );
  };

  const handleSave = () => {
    onSave(selectedStampIds);
  };

  return (
    <Container>
      <SelectedCount>
        {selectedStampIds.length > 0 
          ? `${selectedStampIds.length}個のスタンプを選択中` 
          : 'スタンプを選択してください'
        }
      </SelectedCount>
      
      <StampGrid>
        {stampTypes.map(stamp => (
          <StampCard
            key={stamp.id}
            isSelected={selectedStampIds.includes(stamp.id)}
            color={stamp.color}
            onClick={() => toggleStamp(stamp.id)}
          >
            <StampEmoji>{stamp.emoji}</StampEmoji>
            <StampInfo>
              <StampName>{stamp.name}</StampName>
            </StampInfo>
          </StampCard>
        ))}
      </StampGrid>
      
      <ButtonContainer>
        <Button variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button variant="primary" onClick={handleSave}>
          保存
        </Button>
      </ButtonContainer>
    </Container>
  );
};

export default StampSelector;