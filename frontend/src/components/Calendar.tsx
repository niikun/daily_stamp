import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import styled from 'styled-components';
import { Brush, StampType } from '../types';
import { brushAPI } from '../services/api';
import StampSelector from './StampSelector';
import 'react-calendar/dist/Calendar.css';

const CalendarContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const StyledCalendar = styled(Calendar)`
  width: 100%;
  border: none;
  font-family: 'Arial', sans-serif;
  
  .react-calendar__tile {
    max-width: 100%;
    height: 60px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    
    &:hover {
      background: #e9ecef;
    }
    
    &.react-calendar__tile--active {
      background: #007bff;
      color: white;
    }
  }
  
  .react-calendar__tile--now {
    background: #fff3cd;
  }
`;

const StampContainer = styled.div`
  display: flex;
  gap: 2px;
  margin-top: 2px;
`;

const StampIcon = styled.span`
  font-size: 12px;
`;

const DateNumber = styled.div`
  font-weight: bold;
  margin-bottom: 2px;
`;

const Modal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
`;

const ModalContent = styled.div`
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 400px;
`;

const CloseButton = styled.span`
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    color: black;
  }
`;

interface CalendarComponentProps {
  onStampUpdate?: () => void;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({ onStampUpdate }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [brushes, setBrushes] = useState<Brush[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stampTypes: StampType[] = [
    { id: 'brushing_completed', name: '歯磨き完了', emoji: '🦷', color: '#4CAF50' },
    { id: 'gargle_completed', name: 'うがい完了', emoji: '💧', color: '#2196F3' },
    { id: 'time_check', name: '時間チェック', emoji: '⏰', color: '#FF9800' },
    { id: 'perfect', name: 'パーフェクト', emoji: '⭐', color: '#FFD700' },
  ];

  useEffect(() => {
    fetchBrushes();
  }, [currentMonth]);

  const fetchBrushes = async () => {
    try {
      const month = currentMonth.toISOString().slice(0, 7); // YYYY-MM format
      const data = await brushAPI.getBrushesByMonth(month);
      setBrushes(data);
    } catch (error) {
      console.error('Failed to fetch brushes:', error);
    }
  };

  const getBrushForDate = (date: Date): Brush | undefined => {
    const dateString = date.toISOString().split('T')[0];
    return brushes.find(brush => brush.date === dateString);
  };

  const handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date > today) {
      return; // Don't allow future dates
    }
    
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleStampSave = async (stamps: string[]) => {
    if (!selectedDate) return;

    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      await brushAPI.createBrush(dateString, stamps);
      await fetchBrushes();
      setIsModalOpen(false);
      onStampUpdate?.();
    } catch (error) {
      console.error('Failed to save stamps:', error);
    }
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const brush = getBrushForDate(date);
      if (brush && brush.stamps.length > 0) {
        return (
          <StampContainer>
            {brush.stamps.slice(0, 3).map((stampId, index) => {
              const stamp = stampTypes.find(s => s.id === stampId);
              return stamp ? (
                <StampIcon key={index}>{stamp.emoji}</StampIcon>
              ) : null;
            })}
            {brush.stamps.length > 3 && <StampIcon>+</StampIcon>}
          </StampContainer>
        );
      }
    }
    return null;
  };

  const getSelectedDateStamps = (): string[] => {
    if (!selectedDate) return [];
    const brush = getBrushForDate(selectedDate);
    return brush?.stamps || [];
  };

  return (
    <CalendarContainer>
      <StyledCalendar
        onClickDay={handleDateClick}
        onActiveStartDateChange={({ activeStartDate }) => {
          if (activeStartDate) setCurrentMonth(activeStartDate);
        }}
        tileContent={tileContent}
        locale="ja-JP"
      />
      
      <Modal isOpen={isModalOpen}>
        <ModalContent>
          <CloseButton onClick={() => setIsModalOpen(false)}>&times;</CloseButton>
          <h3>{selectedDate?.toLocaleDateString('ja-JP')} のスタンプ</h3>
          <StampSelector
            stampTypes={stampTypes}
            selectedStamps={getSelectedDateStamps()}
            onSave={handleStampSave}
            onCancel={() => setIsModalOpen(false)}
          />
        </ModalContent>
      </Modal>
    </CalendarContainer>
  );
};

export default CalendarComponent;